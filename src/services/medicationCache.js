import { supabase } from '../lib/supabase.js'
import { OPENAI_MODEL } from '../lib/openai'
import CryptoJS from 'crypto-js'

/**
 * Serviço para gerenciar cache de combinações de medicamentos
 */
export const medicationCacheService = {
  
  /**
   * Gera hash consistente para uma combinação de medicamentos
   */
  generateCombinationHash(medications) {
    // Ordena medicamentos por nome e dosagem para garantir hash consistente
    const sortedMeds = [...medications].sort((a, b) => {
      const nameCompare = a.name.localeCompare(b.name)
      if (nameCompare !== 0) return nameCompare
      return (a.dosage || '').localeCompare(b.dosage || '')
    })
    
    // Cria string consistente
    const combinationString = sortedMeds
      .map(med => `${med.name.toLowerCase().trim()}|${(med.dosage || '').toLowerCase().trim()}`)
      .join('::')
    
    // Gera hash SHA256
    return CryptoJS.SHA256(combinationString).toString()
  },

  /**
   * Verifica se existe uma combinação no cache e se está válida
   */
  async getCachedCombination(medications) {
    try {
      console.log('🔍 Verificando cache para combinação:', medications.map(m => `${m.name} ${m.dosage}`))
      
      const combinationHash = this.generateCombinationHash(medications)
      console.log('🔑 Hash da combinação:', combinationHash.substring(0, 16) + '...')
      
      const { data, error } = await supabase
        .rpc('get_cached_combination', {
          medications: JSON.stringify(medications)
        })
      
      if (error) {
        console.warn('⚠️ Erro ao consultar cache:', error.message)
        return null
      }
      
      if (data && data.length > 0) {
        const cached = data[0]
        const isExpired = cached.is_expired
        const ageInDays = Math.floor(
          (new Date() - new Date(cached.created_at)) / (1000 * 60 * 60 * 24)
        )
        
        console.log('📊 Cache encontrado:')
        console.log(`   • Criado há ${ageInDays} dias`)
        console.log(`   • Consultado ${cached.consultation_count} vezes`)
        console.log(`   • Status: ${isExpired ? 'EXPIRADO' : 'VÁLIDO'}`)
        
        if (!isExpired) {
          // Incrementa contador de uso
          await this.incrementUsage(combinationHash)
          return {
            id: cached.id,
            ai_analysis: cached.ai_analysis,
            created_at: cached.created_at,
            consultation_count: cached.consultation_count + 1,
            source: 'cache',
            ageInDays
          }
        } else {
          console.log('⏰ Cache expirado (> 1 ano), será necessária nova consulta à API')
          return null
        }
      }
      
      console.log('❌ Nenhum cache encontrado para esta combinação')
      return null
      
    } catch (error) {
      console.error('❌ Erro ao verificar cache:', error)
      return null
    }
  },

  /**
   * Salva uma nova combinação no cache
   */
  async saveCombinationCache(medications, aiAnalysis, metadata = {}) {
    try {
      console.log('💾 Salvando combinação no cache...')
      
      const { data, error } = await supabase
        .rpc('save_combination_cache', {
          medications: JSON.stringify(medications),
          ai_analysis: aiAnalysis,
          tokens_used: metadata.tokensUsed || 0,
          model_used: metadata.model || OPENAI_MODEL,
          analysis_duration: metadata.duration || null
        })
      
      if (error) {
        console.error('❌ Erro ao salvar no cache:', error.message)
        throw error
      }
      
      console.log('✅ Combinação salva no cache com ID:', data)
      return data
      
    } catch (error) {
      console.error('❌ Erro ao salvar cache:', error)
      throw error
    }
  },

  /**
   * Incrementa contador de uso de uma combinação
   */
  async incrementUsage(combinationHash) {
    try {
      const { error } = await supabase
        .rpc('increment_combination_usage', {
          combination_hash_val: combinationHash
        })
      
      if (error) {
        console.warn('⚠️ Erro ao incrementar uso do cache:', error.message)
      }
      
    } catch (error) {
      console.warn('⚠️ Erro ao incrementar uso:', error)
    }
  },

  /**
   * Registra uma consulta no histórico
   */
  async logConsultation(combinationId, patientId, sessionId, source = 'cache') {
    try {
      const { data, error } = await supabase
        .from('consultation_history')
        .insert([{
          combination_id: combinationId,
          patient_id: patientId || 'Não informado',
          session_id: sessionId,
          source: source
        }])
        .select()
        .single()
      
      if (error) {
        console.warn('⚠️ Erro ao registrar consulta no histórico:', error.message)
        return null
      }
      
      return data
      
    } catch (error) {
      console.warn('⚠️ Erro ao registrar histórico:', error)
      return null
    }
  },

  /**
   * Obtém estatísticas do cache
   */
  async getCacheStats() {
    try {
      const { data: totalCombinations } = await supabase
        .from('medication_combinations_cache')
        .select('*', { count: 'exact', head: true })
      
      const { data: recentConsultations } = await supabase
        .from('consultation_history')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      
      const { data: topCombinations } = await supabase
        .from('medication_combinations_cache')
        .select('medications, consultation_count')
        .order('consultation_count', { ascending: false })
        .limit(5)
      
      return {
        totalCombinations: totalCombinations?.count || 0,
        recentConsultations: recentConsultations?.count || 0,
        topCombinations: topCombinations || []
      }
      
    } catch (error) {
      console.error('❌ Erro ao obter estatísticas do cache:', error)
      return {
        totalCombinations: 0,
        recentConsultations: 0,
        topCombinations: []
      }
    }
  },

  /**
   * Limpa cache expirado (combinações > 1 ano)
   */
  async cleanExpiredCache() {
    try {
      const expiryDate = new Date()
      expiryDate.setFullYear(expiryDate.getFullYear() - 1)
      
      const { data, error } = await supabase
        .from('medication_combinations_cache')
        .delete()
        .lt('created_at', expiryDate.toISOString())
        .select('id')
      
      if (error) {
        console.error('❌ Erro ao limpar cache expirado:', error.message)
        return 0
      }
      
      const deletedCount = data?.length || 0
      console.log(`🧹 Cache limpo: ${deletedCount} combinações expiradas removidas`)
      return deletedCount
      
    } catch (error) {
      console.error('❌ Erro na limpeza do cache:', error)
      return 0
    }
  }
}

export default medicationCacheService
