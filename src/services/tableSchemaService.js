import { supabase } from '../lib/supabase'

export const tableSchemaService = {
  /**
   * Verifica a estrutura de uma tabela específica
   */
  async getTableSchema(tableName) {
    try {
      console.log(`🔍 Verificando estrutura da tabela: ${tableName}`)
      
      // Fazer uma query para obter informações sobre as colunas
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1)

      if (error) {
        return {
          success: false,
          error: error.message,
          tableName,
          exists: false
        }
      }

      // Se a query funcionou, a tabela existe
      // Vamos tentar inserir um registro de teste para ver quais campos são obrigatórios
      const testResult = await this.testTableFields(tableName)

      return {
        success: true,
        tableName,
        exists: true,
        sampleData: data,
        fieldTest: testResult
      }

    } catch (error) {
      return {
        success: false,
        error: error.message,
        tableName,
        exists: false
      }
    }
  },

  /**
   * Testa quais campos uma tabela aceita tentando inserir dados de teste
   */
  async testTableFields(tableName) {
    try {
      // Dados de teste genéricos para diferentes tipos de tabela
      const testData = this.getTestDataForTable(tableName)
      
      if (!testData) {
        return { success: false, message: 'Tipo de tabela não reconhecido' }
      }

      // Tentar inserir dados de teste
      const { data, error } = await supabase
        .from(tableName)
        .insert(testData)
        .select()

      if (error) {
        return {
          success: false,
          error: error.message,
          missingFields: this.extractMissingFields(error.message),
          attemptedData: testData
        }
      }

      // Se inseriu com sucesso, deletar o registro de teste
      if (data && data[0]) {
        await supabase
          .from(tableName)
          .delete()
          .eq('id', data[0].id)
      }

      return {
        success: true,
        message: 'Tabela aceita os campos testados',
        insertedData: data,
        acceptedFields: Object.keys(testData)
      }

    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  },

  /**
   * Gera dados de teste apropriados para cada tipo de tabela
   */
  getTestDataForTable(tableName) {
    const testData = {
      analysis_reports: {
        medication_list: 'TESTE - Medicamento A, Medicamento B',
        analysis_result: 'TESTE - Resultado da análise',
        recommendations: 'TESTE - Recomendações'
      },
      
      consultation_logs: {
        session_id: `test-schema-${Date.now()}`,
        medications_list: JSON.stringify([{ name: 'TESTE', dosage: '100mg' }]),
        medications_count: 1,
        analysis_request: 'TESTE - Requisição de análise',
        analysis_response: 'TESTE - Resposta da análise',
        status: 'completed'
      },

      consultation_history: {
        patient_info: 'TESTE - Paciente',
        medications_analyzed: 'TESTE - Medicamentos',
        result_summary: 'TESTE - Resumo'
      },

      interaction_logs: {
        medication_a: 'TESTE - Med A',
        medication_b: 'TESTE - Med B',
        interaction_severity: 'low',
        description: 'TESTE - Descrição'
      },

      medications_cache: {
        medication_name: `TESTE-${Date.now()}`,
        normalized_name: `teste-${Date.now()}`,
        active_ingredient: 'TESTE - Ingrediente'
      },

      medication_combinations_cache: {
        combination_hash: `test-hash-${Date.now()}`,
        medications_list: JSON.stringify([{ name: 'TESTE' }]),
        analysis_result: 'TESTE - Resultado'
      },

      medications: {
        name: `TESTE-${Date.now()}`,
        active_ingredient: 'TESTE - Ingrediente',
        therapeutic_class: 'TESTE - Classe'
      },

      drug_interactions: {
        medication_a: 'TESTE - Med A',
        medication_b: 'TESTE - Med B',
        severity: 'low',
        description: 'TESTE - Interação'
      }
    }

    return testData[tableName] || null
  },

  /**
   * Extrai campos faltantes da mensagem de erro
   */
  extractMissingFields(errorMessage) {
    const missingFields = []
    
    // Padrões comuns de erro do PostgreSQL
    if (errorMessage.includes('null value in column')) {
      const match = errorMessage.match(/null value in column "([^"]+)"/g)
      if (match) {
        match.forEach(m => {
          const field = m.match(/"([^"]+)"/)[1]
          missingFields.push(field)
        })
      }
    }

    if (errorMessage.includes('column') && errorMessage.includes('does not exist')) {
      const match = errorMessage.match(/column "([^"]+)" of relation/g)
      if (match) {
        match.forEach(m => {
          const field = m.match(/"([^"]+)"/)[1]
          missingFields.push(field)
        })
      }
    }

    return missingFields
  },

  /**
   * Verifica todas as tabelas do sistema
   */
  async checkAllTablesSchema() {
    const tables = [
      'analysis_reports',
      'consultation_logs', 
      'consultation_history',
      'interaction_logs',
      'medications_cache',
      'medication_combinations_cache',
      'medications',
      'drug_interactions'
    ]

    console.log('🔍 Verificando estrutura de todas as tabelas...')

    const results = {}
    const summary = {
      existing: [],
      missing: [],
      errors: []
    }

    for (const table of tables) {
      const result = await this.getTableSchema(table)
      results[table] = result

      if (result.exists) {
        summary.existing.push(table)
      } else {
        summary.missing.push(table)
      }

      if (!result.success) {
        summary.errors.push({
          table,
          error: result.error
        })
      }

      // Aguardar um pouco entre as verificações para não sobrecarregar a API
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    return {
      results,
      summary,
      totalTables: tables.length,
      existingCount: summary.existing.length,
      missingCount: summary.missing.length,
      errorCount: summary.errors.length
    }
  },

  /**
   * Gera script SQL para corrigir problemas encontrados
   */
  generateFixScript(schemaResults) {
    let script = `-- SCRIPT DE CORREÇÃO BASEADO NA VERIFICAÇÃO DA API
-- Gerado automaticamente em ${new Date().toISOString()}
-- ========================================\n\n`

    Object.entries(schemaResults.results).forEach(([tableName, result]) => {
      if (!result.exists) {
        script += `-- Tabela ${tableName} não encontrada\n`
        script += `-- Verifique se precisa ser criada\n\n`
      } else if (result.fieldTest && !result.fieldTest.success) {
        script += `-- Problemas na tabela ${tableName}:\n`
        script += `-- Erro: ${result.fieldTest.error}\n`
        
        if (result.fieldTest.missingFields && result.fieldTest.missingFields.length > 0) {
          script += `-- Campos faltantes: ${result.fieldTest.missingFields.join(', ')}\n`
        }
        
        script += `\n`
      }
    })

    script += `-- Resumo da verificação:\n`
    script += `-- Tabelas existentes: ${schemaResults.existingCount}/${schemaResults.totalTables}\n`
    script += `-- Tabelas com problemas: ${schemaResults.errorCount}\n`

    return script
  }
}
