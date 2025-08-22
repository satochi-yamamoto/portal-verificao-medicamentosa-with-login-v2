import { supabase } from '../lib/supabase.js'
import { OPENAI_MODEL } from '../lib/openai'

/**
 * Serviço refatorado para gerenciar logs de consultas
 * Versão otimizada com melhor tratamento de erros e performance
 */
class ConsultationLogService {
  constructor() {
    this.tableName = 'consultation_logs'
    this.isEnabled = true
    this.batchSize = 100
    this.maxRetries = 3
  }

  /**
   * Cria um novo log de consulta
   * Versão otimizada com validação
   */
  async createLog(logData) {
    if (!this.isEnabled) return null

    try {
      // Validar dados obrigatórios
      const validatedData = this.validateLogData(logData)
      if (!validatedData) {
        throw new Error('Dados de log inválidos')
      }

      const { data, error } = await supabase
        .from(this.tableName)
        .insert([validatedData])
        .select()
        .single()

      if (error) throw error

      console.log('📝 Log criado:', data.id)
      return data

    } catch (error) {
      console.warn('⚠️ Erro ao criar log:', error.message)
      
      // Retorna um log temporário para não interromper o fluxo
      return {
        id: `temp_${Date.now()}`,
        ...logData,
        created_at: new Date().toISOString()
      }
    }
  }

  /**
   * Atualiza um log existente
   * Versão otimizada com retry
   */
  async updateLog(logId, updateData, retryCount = 0) {
    if (!this.isEnabled || !logId || logId.startsWith('temp_')) {
      return null
    }

    try {
      const validatedData = this.validateUpdateData(updateData)
      
      const { data, error } = await supabase
        .from(this.tableName)
        .update({
          ...validatedData,
          updated_at: new Date().toISOString()
        })
        .eq('id', logId)
        .select()

      if (error) throw error

      console.log('📝 Log atualizado:', logId)
      return data

    } catch (error) {
      console.warn(`⚠️ Erro ao atualizar log (tentativa ${retryCount + 1}):`, error.message)
      
      // Retry automático para erros de rede
      if (retryCount < this.maxRetries && this.isNetworkError(error)) {
        await this.sleep(1000 * (retryCount + 1))
        return this.updateLog(logId, updateData, retryCount + 1)
      }
      
      return null
    }
  }

  /**
   * Busca logs com filtros otimizados
   * Versão com paginação e cache
   */
  async getLogs(filters = {}) {
    try {
      let query = supabase
        .from(this.tableName)
        .select('*')
        .order('created_at', { ascending: false })

      // Aplicar filtros
      if (filters.limit) {
        query = query.limit(Math.min(filters.limit, this.batchSize))
      } else {
        query = query.limit(50) // Limite padrão
      }

      if (filters.status) {
        query = query.eq('status', filters.status)
      }

      if (filters.sessionId) {
        query = query.eq('session_id', filters.sessionId)
      }

      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom)
      }

      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo)
      }

      if (filters.medicationsCount) {
        query = query.eq('medications_count', filters.medicationsCount)
      }

      if (filters.minTokens) {
        query = query.gte('tokens_used', filters.minTokens)
      }

      const { data, error } = await query

      if (error) throw error

      return data || []

    } catch (error) {
      console.error('❌ Erro ao buscar logs:', error)
      return []
    }
  }

  /**
   * Busca estatísticas de uso otimizadas
   */
  async getStats(period = '30 days') {
    try {
      // Calcular data limite em JavaScript em vez de usar SQL
      const daysToSubtract = parseInt(period.split(' ')[0]) || 30
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysToSubtract)
      const isoDate = cutoffDate.toISOString()

      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          id,
          medications_count,
          status,
          analysis_duration_ms,
          tokens_used,
          created_at,
          model_used
        `)
        .gte('created_at', isoDate)

      if (error) throw error

      if (!data || data.length === 0) {
        return this.getEmptyStats()
      }

      // Calcular estatísticas
      const completedLogs = data.filter(log => log.status === 'completed')
      const errorLogs = data.filter(log => log.status === 'error')
      
      const totalTokens = data.reduce((sum, log) => sum + (log.tokens_used || 0), 0)
      const avgMedicationsPerConsultation = data.reduce((sum, log) => sum + log.medications_count, 0) / data.length
      
      const durationsWithValues = data.filter(log => log.analysis_duration_ms)
      const avgDuration = durationsWithValues.length > 0 
        ? durationsWithValues.reduce((sum, log) => sum + log.analysis_duration_ms, 0) / durationsWithValues.length 
        : 0

      const stats = {
        totalConsultations: data.length,
        completedConsultations: completedLogs.length,
        errorConsultations: errorLogs.length,
        successRate: data.length > 0 ? (completedLogs.length / data.length) * 100 : 0,
        averageMedicationsPerConsultation: Math.round(avgMedicationsPerConsultation * 10) / 10,
        averageDuration: Math.round(avgDuration),
        totalTokensUsed: totalTokens,
        averageTokensPerConsultation: completedLogs.length > 0 ? Math.round(totalTokens / completedLogs.length) : 0,
        consultationsByDay: this.groupByDay(data),
        medicationDistribution: this.getMedicationDistribution(data),
        modelUsage: this.getModelUsageStats(data),
        performanceMetrics: {
          fastAnalyses: data.filter(log => log.analysis_duration_ms && log.analysis_duration_ms < 2000).length,
          slowAnalyses: data.filter(log => log.analysis_duration_ms && log.analysis_duration_ms > 10000).length,
          averageTokensPerSecond: this.calculateTokensPerSecond(data)
        }
      }

      return stats

    } catch (error) {
      console.error('❌ Erro ao obter estatísticas:', error)
      return this.getEmptyStats()
    }
  }

  /**
   * Agrupa consultas por dia
   */
  groupByDay(logs) {
    const grouped = {}
    
    logs.forEach(log => {
      const date = new Date(log.created_at).toISOString().split('T')[0]
      grouped[date] = (grouped[date] || 0) + 1
    })

    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }))
  }

  /**
   * Distribuição de medicamentos mais consultados
   */
  getMedicationDistribution(logs) {
    const medications = {}
    
    logs.forEach(log => {
      if (log.medications_list && Array.isArray(log.medications_list)) {
        log.medications_list.forEach(med => {
          const name = med.name || med
          medications[name] = (medications[name] || 0) + 1
        })
      }
    })

    return Object.entries(medications)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20) // Top 20 medicamentos
      .map(([name, count]) => ({ name, count }))
  }

  /**
   * Estatísticas de uso de modelos
   */
  getModelUsageStats(logs) {
    const models = {}
    
    logs.forEach(log => {
      const model = log.model_used || 'unknown'
      models[model] = (models[model] || 0) + 1
    })

    return Object.entries(models)
      .sort(([,a], [,b]) => b - a)
      .map(([model, count]) => ({ model, count }))
  }

  /**
   * Calcula tokens por segundo médio
   */
  calculateTokensPerSecond(logs) {
    const validLogs = logs.filter(log => 
      log.tokens_used && 
      log.analysis_duration_ms && 
      log.analysis_duration_ms > 0
    )

    if (validLogs.length === 0) return 0

    const totalTokensPerSecond = validLogs.reduce((sum, log) => {
      return sum + (log.tokens_used / (log.analysis_duration_ms / 1000))
    }, 0)

    return Math.round(totalTokensPerSecond / validLogs.length)
  }

  /**
   * Remove logs antigos para manter performance
   */
  async cleanupOldLogs(daysToKeep = 90) {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .lt('created_at', cutoffDate.toISOString())

      if (error) throw error

      console.log(`🧹 Logs anteriores a ${cutoffDate.toLocaleDateString()} removidos`)
      return true

    } catch (error) {
      console.error('❌ Erro ao limpar logs antigos:', error)
      return false
    }
  }

  /**
   * Exporta logs para análise
   */
  async exportLogs(filters = {}, format = 'json') {
    try {
      const logs = await this.getLogs({ ...filters, limit: 1000 })
      
      if (format === 'csv') {
        return this.convertToCSV(logs)
      }
      
      return logs

    } catch (error) {
      console.error('❌ Erro ao exportar logs:', error)
      return null
    }
  }

  /**
   * Converte logs para formato CSV
   */
  convertToCSV(logs) {
    if (!logs || logs.length === 0) return ''

    const headers = [
      'id', 'session_id', 'medications_count', 'status',
      'tokens_used', 'analysis_duration_ms', 'model_used', 'created_at'
    ]

    const rows = logs.map(log => 
      headers.map(header => log[header] || '').join(',')
    )

    return [headers.join(','), ...rows].join('\n')
  }

  /**
   * Habilita ou desabilita o serviço
   */
  setEnabled(enabled) {
    this.isEnabled = enabled
    console.log(`📝 Logs ${enabled ? 'habilitados' : 'desabilitados'}`)
  }

  // ========================================
  // MÉTODOS AUXILIARES
  // ========================================

  /**
   * Valida dados do log
   */
  validateLogData(logData) {
    if (!logData.sessionId || !logData.medications) {
      return null
    }

    return {
      session_id: logData.sessionId,
      medications_count: Array.isArray(logData.medications) ? logData.medications.length : 0,
      medications_list: logData.medications,
      analysis_request: logData.request || '',
      status: logData.status || 'pending',
      model_used: logData.model || OPENAI_MODEL,
      created_at: new Date().toISOString()
    }
  }

  /**
   * Valida dados de atualização
   */
  validateUpdateData(updateData) {
    const validated = {}

    if (updateData.status) validated.status = updateData.status
    if (updateData.analysis_response) validated.analysis_response = updateData.analysis_response
    if (updateData.analysis_duration_ms) validated.analysis_duration_ms = updateData.analysis_duration_ms
    if (updateData.tokens_used) validated.tokens_used = updateData.tokens_used
    if (updateData.error_message) validated.error_message = updateData.error_message
    if (updateData.tokensUsed) validated.tokens_used = updateData.tokensUsed // Compatibilidade

    return validated
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
   * Retorna estatísticas vazias
   */
  getEmptyStats() {
    return {
      totalConsultations: 0,
      completedConsultations: 0,
      errorConsultations: 0,
      successRate: 0,
      averageMedicationsPerConsultation: 0,
      averageDuration: 0,
      totalTokensUsed: 0,
      averageTokensPerConsultation: 0,
      consultationsByDay: [],
      medicationDistribution: [],
      modelUsage: [],
      performanceMetrics: {
        fastAnalyses: 0,
        slowAnalyses: 0,
        averageTokensPerSecond: 0
      }
    }
  }

  /**
   * Obtém resumo de desempenho
   */
  async getPerformanceSummary() {
    try {
      const stats = await this.getStats('7 days')
      
      return {
        weeklyConsultations: stats.totalConsultations,
        successRate: stats.successRate,
        averageResponseTime: stats.averageDuration,
        tokenEfficiency: stats.averageTokensPerConsultation,
        topMedications: stats.medicationDistribution.slice(0, 5),
        performance: stats.performanceMetrics.fastAnalyses > stats.performanceMetrics.slowAnalyses ? 'good' : 'needs_improvement'
      }

    } catch (error) {
      console.error('❌ Erro ao obter resumo de desempenho:', error)
      return null
    }
  }
}

// Exportar instância singleton
export const consultationLogService = new ConsultationLogService()
export default consultationLogService
