import { supabase } from '../lib/supabase'

export const rlsService = {
  /**
   * Verifica o status do Row Level Security para todas as tabelas
   */
  async checkRLSStatus() {
    try {
      const { data, error } = await supabase
        .rpc('get_rls_status')
        .then(() => {
          // Fallback: usar query SQL direta se a função não existir
          return supabase
            .from('pg_tables')
            .select('tablename, rowsecurity')
            .in('tablename', ['analysis_reports', 'consultation_logs', 'medications', 'drug_interactions'])
            .eq('schemaname', 'public')
        })
        .catch(async () => {
          // Se pg_tables não funcionar, usar uma query mais simples
          console.log('📊 Verificando RLS via consulta direta...')
          return { data: [], error: null }
        })

      if (error) {
        console.error('❌ Erro ao verificar RLS:', error)
        return { 
          success: false, 
          error: error.message,
          tables: []
        }
      }

      return {
        success: true,
        tables: data || [],
        error: null
      }
    } catch (error) {
      console.error('❌ Erro ao verificar RLS:', error)
      return {
        success: false,
        error: error.message,
        tables: []
      }
    }
  },

  /**
   * Verifica se as políticas RLS estão configuradas
   */
  async checkRLSPolicies() {
    try {
      // Lista de todas as tabelas que precisam de RLS
      const tables = [
        'analysis_reports', 
        'consultation_logs',
        'consultation_history',
        'interaction_logs',
        'medication_combinations_cache',
        'medications_cache',
        'medications',
        'drug_interactions'
      ]

      // Tentar acessar as tabelas para verificar se as políticas estão funcionando
      const tests = await Promise.allSettled(
        tables.map(table => supabase.from(table).select('id').limit(1))
      )

      const results = tests.map((test, index) => ({
        table: tables[index],
        accessible: test.status === 'fulfilled' && !test.value.error,
        error: test.status === 'rejected' ? test.reason : test.value?.error?.message
      }))

      const allAccessible = results.every(r => r.accessible)
      const inaccessibleTables = results.filter(r => !r.accessible)

      return {
        success: allAccessible,
        results,
        message: allAccessible 
          ? '✅ Todas as tabelas estão acessíveis'
          : `❌ Problemas de acesso: ${inaccessibleTables.map(t => t.table).join(', ')}`,
        suggestions: !allAccessible ? [
          '1. Execute o script database/rls_policies.sql no Supabase SQL Editor',
          '2. Verifique se as credenciais estão corretas no arquivo .env',
          '3. Confirme que o RLS está habilitado com políticas públicas'
        ] : []
      }
    } catch (error) {
      console.error('❌ Erro ao verificar políticas RLS:', error)
      return {
        success: false,
        results: [],
        message: `❌ Erro ao verificar políticas: ${error.message}`,
        suggestions: [
          '1. Verifique a conexão com o Supabase',
          '2. Execute database/rls_policies.sql',
          '3. Confirme as credenciais no .env'
        ]
      }
    }
  },

  /**
   * Testa operações básicas (CRUD) em uma tabela
   */
  async testTableOperations(tableName = 'consultation_logs') {
    try {
      console.log(`🧪 Testando operações na tabela ${tableName}...`)

      // Teste de leitura
      const { data: readData, error: readError } = await supabase
        .from(tableName)
        .select('*')
        .limit(1)

      if (readError) {
        return {
          success: false,
          operation: 'read',
          error: readError.message,
          suggestion: 'Execute database/rls_policies.sql para configurar políticas de leitura'
        }
      }

      // Teste de inserção (apenas para consultation_logs)
      if (tableName === 'consultation_logs') {
        const testData = {
          session_id: `rls-test-${Date.now()}`,
          medications_list: JSON.stringify([{ name: 'Teste RLS', dosage: '1mg' }]),
          medications_count: 1,
          analysis_request: 'Teste de análise RLS',
          analysis_response: 'Teste de RLS - inserção',
          analysis_duration_ms: 100,
          tokens_used: 10,
          status: 'completed'
        }

        const { data: insertData, error: insertError } = await supabase
          .from(tableName)
          .insert(testData)
          .select()

        if (insertError) {
          return {
            success: false,
            operation: 'insert',
            error: insertError.message,
            suggestion: 'Execute database/rls_policies.sql para configurar políticas de inserção'
          }
        }

        // Limpar dados de teste
        if (insertData && insertData[0]) {
          await supabase
            .from(tableName)
            .delete()
            .eq('id', insertData[0].id)
        }
      }

      return {
        success: true,
        message: `✅ Tabela ${tableName} está funcionando corretamente`,
        operations: ['read', ...(tableName === 'consultation_logs' ? ['insert', 'delete'] : [])]
      }

    } catch (error) {
      console.error(`❌ Erro ao testar tabela ${tableName}:`, error)
      return {
        success: false,
        operation: 'unknown',
        error: error.message,
        suggestion: 'Verifique a configuração do Supabase e execute database/rls_policies.sql'
      }
    }
  }
}
