import { supabase } from '../lib/supabase.js'
import { OPENAI_MODEL } from '../lib/openai'
import CryptoJS from 'crypto-js'
import medicationCaptureService from './medicationCaptureEnhanced.js'

/**
 * Serviço refatorado para gerenciar cache de combinações de medicamentos
 * Versão otimizada com melhor tratamento de erros e performance
 */
class MedicationCacheService {
  constructor() {
    this.isEnabled = true
    this.maxRetries = 3
    this.retryDelay = 1000
  }

  /**
   * Gera hash consistente para uma combinação de medicamentos
   * Versão otimizada que normaliza os dados
   */
  generateCombinationHash(medications) {
    try {
      // Normalizar e ordenar medicamentos
      const normalized = medications
        .map(med => ({
          name: (med.name || '').toLowerCase().trim(),
          dosage: (med.dosage || '').toLowerCase().trim()
        }))
        .sort((a, b) => {
          const nameCompare = a.name.localeCompare(b.name)
          return nameCompare !== 0 ? nameCompare : a.dosage.localeCompare(b.dosage)
        })

      // Criar string consistente
      const combinationString = normalized
        .map(med => `${med.name}|${med.dosage}`)
        .join('::')

      // Gerar hash SHA256
      return CryptoJS.SHA256(combinationString).toString()
    } catch (error) {
      console.error('❌ Erro ao gerar hash:', error)
      return null
    }
  }

  /**
   * Verifica se uma combinação existe no cache e está válida
   * Versão otimizada com retry automático
   */
  async getCachedCombination(medications, retryCount = 0) {
    if (!this.isEnabled || !medications || medications.length === 0) {
      return null
    }

    try {
      console.log('🔍 Verificando cache para:', medications.map(m => `${m.name} ${m.dosage}`).join(', '))

      // Usar função RPC otimizada
      const { data, error } = await supabase
        .rpc('get_cached_combination', {
          input_medications: medications
        })

      if (error) {
        console.warn(`⚠️ Erro ao consultar cache (tentativa ${retryCount + 1}):`, error.message)
        
        // Retry automático
        if (retryCount < this.maxRetries) {
          await this.sleep(this.retryDelay * (retryCount + 1))
          return this.getCachedCombination(medications, retryCount + 1)
        }
        
        return null
      }

      if (data && data.length > 0) {
        const cached = data[0]
        const ageInDays = Math.floor(
          (new Date() - new Date(cached.created_at)) / (1000 * 60 * 60 * 24)
        )

        console.log('📊 Cache encontrado:')
        console.log(`   • ID: ${cached.id}`)
        console.log(`   • Criado há: ${ageInDays} dias`)
        console.log(`   • Consultas: ${cached.consultation_count}`)
        console.log(`   • Expirado: ${cached.is_expired ? 'SIM' : 'NÃO'}`)

        if (!cached.is_expired) {
          return {
            ...cached,
            ageInDays,
            source: 'cache'
          }
        }
      }

      console.log('📭 Nenhum cache válido encontrado')
      return null

    } catch (error) {
      console.error('❌ Erro inesperado no cache:', error)
      
      // Retry para erros de rede
      if (retryCount < this.maxRetries && this.isNetworkError(error)) {
        await this.sleep(this.retryDelay * (retryCount + 1))
        return this.getCachedCombination(medications, retryCount + 1)
      }
      
      return null
    }
  }

  /**
   * Salva uma combinação no cache
   * Versão otimizada com validação e retry
   */
  async saveCombinationCache(medications, aiAnalysis, metadata = {}, retryCount = 0) {
    if (!this.isEnabled || !medications || !aiAnalysis) {
      console.warn('⚠️ Cache desabilitado ou dados inválidos')
      return null
    }

    try {
      console.log('💾 Salvando no cache:', medications.map(m => `${m.name} ${m.dosage}`).join(', '))

      // Validar dados
      const validatedMedications = this.validateMedications(medications)
      if (!validatedMedications) {
        throw new Error('Medicamentos inválidos para cache')
      }

      const { data, error } = await supabase
        .rpc('save_combination_cache', {
          input_medications: validatedMedications,
          ai_analysis: aiAnalysis,
          tokens_used: metadata.tokensUsed || 0,
          model_used: metadata.model || OPENAI_MODEL,
          analysis_duration: metadata.duration || null
        })

      if (error) {
        console.error(`❌ Erro ao salvar cache (tentativa ${retryCount + 1}):`, error.message)
        
        // Retry automático
        if (retryCount < this.maxRetries) {
          await this.sleep(this.retryDelay * (retryCount + 1))
          return this.saveCombinationCache(medications, aiAnalysis, metadata, retryCount + 1)
        }
        
        throw error
      }

      console.log('✅ Cache salvo com sucesso! ID:', data)
      
      // Capturar medicamentos automaticamente na base de dados
      try {
        console.log('📝 Iniciando captura automática de medicamentos...')
        const captureResult = await medicationCaptureService.captureMedications(medications, data)
        if (captureResult && captureResult.success) {
          console.log(`📊 Captura concluída: ${captureResult.processedCount}/${captureResult.totalCount} medicamentos processados`)
        } else {
          console.log('📊 Captura completada sem processamento ou com erros')
        }
      } catch (captureError) {
        console.warn('⚠️ Erro na captura de medicamentos (não crítico):', captureError.message)
        // Não falha a operação principal se houver erro na captura
      }
      
      return data

    } catch (error) {
      console.error('❌ Erro ao salvar cache:', error)
      
      // Retry para erros de rede
      if (retryCount < this.maxRetries && this.isNetworkError(error)) {
        await this.sleep(this.retryDelay * (retryCount + 1))
        return this.saveCombinationCache(medications, aiAnalysis, metadata, retryCount + 1)
      }
      
      throw error
    }
  }

  /**
   * Registra uma consulta no histórico
   * Versão simplificada e robusta
   */
  async logConsultation(combinationId, patientId, sessionId, source = 'cache') {
    if (!combinationId) return null

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
        console.warn('⚠️ Erro ao registrar histórico:', error.message)
        return null
      }

      return data

    } catch (error) {
      console.warn('⚠️ Erro inesperado no histórico:', error)
      return null
    }
  }

  /**
   * Obtém estatísticas do cache
   * Versão otimizada com agregações
   */
  async getCacheStats() {
    try {
      // Buscar estatísticas básicas
      const { data: stats, error: statsError } = await supabase
        .from('medication_combinations_cache')
        .select('consultation_count, tokens_used, created_at')

      if (statsError) throw statsError

      // Calcular métricas
      const totalCombinations = stats.length
      const totalConsultations = stats.reduce((sum, item) => sum + item.consultation_count, 0)
      const totalTokensSaved = stats.reduce((sum, item) => {
        return sum + ((item.consultation_count - 1) * (item.tokens_used || 0))
      }, 0)

      // Combinações mais usadas
      const { data: topCombinations, error: topError } = await supabase
        .from('medication_combinations_cache')
        .select('medications, consultation_count')
        .order('consultation_count', { ascending: false })
        .limit(5)

      if (topError) throw topError

      return {
        totalCombinations,
        totalConsultations,
        totalTokensSaved,
        averageConsultationsPerCombination: totalCombinations > 0 ? totalConsultations / totalCombinations : 0,
        topCombinations: topCombinations || [],
        cacheHitRate: totalConsultations > 0 ? ((totalConsultations - totalCombinations) / totalConsultations) * 100 : 0
      }

    } catch (error) {
      console.error('❌ Erro ao obter estatísticas:', error)
      return {
        totalCombinations: 0,
        totalConsultations: 0,
        totalTokensSaved: 0,
        averageConsultationsPerCombination: 0,
        topCombinations: [],
        cacheHitRate: 0
      }
    }
  }

  /**
   * Limpa cache expirado
   */
  async cleanupExpiredCache() {
    try {
      const { data, error } = await supabase
        .rpc('cleanup_expired_cache')

      if (error) throw error

      console.log(`🧹 Cache limpo: ${data} registros removidos`)
      return data

    } catch (error) {
      console.error('❌ Erro ao limpar cache:', error)
      return 0
    }
  }

  /**
   * Habilita ou desabilita o cache
   */
  setEnabled(enabled) {
    this.isEnabled = enabled
    console.log(`🔧 Cache ${enabled ? 'habilitado' : 'desabilitado'}`)
  }

  // ========================================
  // MÉTODOS AUXILIARES
  // ========================================

  /**
   * Valida estrutura dos medicamentos
   */
  validateMedications(medications) {
    if (!Array.isArray(medications) || medications.length === 0) {
      return null
    }

    const validated = medications
      .filter(med => med && med.name && med.name.trim())
      .map(med => ({
        name: med.name.trim(),
        dosage: (med.dosage || '').trim()
      }))

    return validated.length > 0 ? validated : null
  }

  /**
   * Verifica se é erro de rede
   */
  isNetworkError(error) {
    return error.message && (
      error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.message.includes('timeout') ||
      error.message.includes('connection')
    )
  }

  /**
   * Delay para retry
   */
  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Reset completo do cache (uso administrativo)
   */
  async resetCache() {
    try {
      const { error } = await supabase
        .from('medication_combinations_cache')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

      if (error) throw error

      console.log('🔄 Cache resetado completamente')
      return true

    } catch (error) {
      console.error('❌ Erro ao resetar cache:', error)
      return false
    }
  }
}

// Exportar instância singleton
export const medicationCacheService = new MedicationCacheService()
export default medicationCacheService
