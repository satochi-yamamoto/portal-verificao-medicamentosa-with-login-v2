import { supabase } from '../lib/supabase'
import { OPENAI_MODEL } from '../lib/openai'

// Serviços para logs de consultas
export const consultationLogService = {
  // Criar novo log de consulta
  async createLog(logData) {
    const { data, error } = await supabase
      .from('consultation_logs')
      .insert([{
        session_id: logData.sessionId || this.generateSessionId(),
        user_id: logData.userId || null,
        medications_count: logData.medications.length,
        medications_list: logData.medications,
        analysis_request: logData.request,
        analysis_response: logData.response || null,
        analysis_duration_ms: logData.duration || null,
        tokens_used: logData.tokensUsed || null,
        model_used: logData.model || OPENAI_MODEL,
        status: logData.status || 'pending',
        error_message: logData.error || null,
        ip_address: logData.ipAddress || null,
        user_agent: logData.userAgent || navigator.userAgent
      }])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Atualizar log existente
  async updateLog(logId, updateData) {
    const { data, error } = await supabase
      .from('consultation_logs')
      .update({
        analysis_response: updateData.response,
        analysis_duration_ms: updateData.duration,
        tokens_used: updateData.tokensUsed,
        status: updateData.status,
        error_message: updateData.error,
        updated_at: new Date().toISOString()
      })
      .eq('id', logId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Buscar logs com filtros
  async getLogs(filters = {}) {
    let query = supabase
      .from('consultation_logs')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters.limit) {
      query = query.limit(filters.limit)
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

    const { data, error } = await query
    if (error) throw error
    return data
  },

  // Buscar estatísticas de uso
  async getStats(period = '30 days') {
    // Calcular data limite em JavaScript em vez de usar SQL
    const daysToSubtract = parseInt(period.split(' ')[0]) || 30
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToSubtract)
    const isoDate = cutoffDate.toISOString()

    const { data, error } = await supabase
      .from('consultation_logs')
      .select(`
        id,
        medications_count,
        status,
        analysis_duration_ms,
        tokens_used,
        created_at
      `)
      .gte('created_at', isoDate)
    
    if (error) throw error

    const stats = {
      totalConsultations: data.length,
      completedConsultations: data.filter(log => log.status === 'completed').length,
      errorConsultations: data.filter(log => log.status === 'error').length,
      averageMedicationsPerConsultation: data.reduce((sum, log) => sum + log.medications_count, 0) / data.length || 0,
      averageDuration: data.filter(log => log.analysis_duration_ms).reduce((sum, log) => sum + log.analysis_duration_ms, 0) / data.filter(log => log.analysis_duration_ms).length || 0,
      totalTokensUsed: data.reduce((sum, log) => sum + (log.tokens_used || 0), 0),
      consultationsByDay: this.groupByDay(data),
      medicationDistribution: this.getMedicationDistribution(data)
    }

    return stats
  },

  // Buscar logs de uma sessão específica
  async getSessionLogs(sessionId) {
    const { data, error } = await supabase
      .from('consultation_logs')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
    
    if (error) throw error
    return data
  },

  // Gerar ID de sessão único
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },

  // Agrupar logs por dia
  groupByDay(logs) {
    const grouped = {}
    logs.forEach(log => {
      const day = new Date(log.created_at).toISOString().split('T')[0]
      grouped[day] = (grouped[day] || 0) + 1
    })
    return grouped
  },

  // Distribuição de medicamentos mais consultados
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
  },

  // Exportar logs para CSV
  async exportToCSV(filters = {}) {
    const logs = await this.getLogs(filters)
    
    const headers = [
      'ID',
      'Data/Hora',
      'Sessão',
      'Qtd Medicamentos',
      'Medicamentos',
      'Status',
      'Duração (ms)',
      'Tokens Usados',
      'Modelo',
      'Erro'
    ]

    const csvContent = [
      headers.join(','),
      ...logs.map(log => [
        log.id,
        new Date(log.created_at).toLocaleString('pt-BR'),
        log.session_id,
        log.medications_count,
        `"${log.medications_list.map(med => med.name || med).join('; ')}"`,
        log.status,
        log.analysis_duration_ms || '',
        log.tokens_used || '',
        log.model_used || '',
        `"${log.error_message || ''}"`
      ].join(','))
    ].join('\n')

    return csvContent
  },

  // Obter estatísticas de consultas
  async getStatistics() {
    try {
      // Buscar total de consultas
      const { count: totalConsultations, error: countError } = await supabase
        .from('consultation_logs')
        .select('*', { count: 'exact', head: true })

      if (countError) {
        console.error('❌ Erro ao contar consultas:', countError)
        throw countError
      }

      // Buscar consultas bem-sucedidas
      const { count: successfulConsultations, error: successError } = await supabase
        .from('consultation_logs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')

      if (successError) {
        console.error('❌ Erro ao contar consultas bem-sucedidas:', successError)
        throw successError
      }

      // Buscar últimas consultas para calcular média de medicamentos
      const { data: recentConsultations, error: recentError } = await supabase
        .from('consultation_logs')
        .select('medications_count, analysis_duration_ms, tokens_used')
        .order('created_at', { ascending: false })
        .limit(100)

      if (recentError) {
        console.error('❌ Erro ao buscar consultas recentes:', recentError)
        throw recentError
      }

      // Calcular estatísticas
      const avgMedicationsPerConsultation = recentConsultations?.length > 0 
        ? Math.round(recentConsultations.reduce((sum, c) => sum + (c.medications_count || 0), 0) / recentConsultations.length)
        : 0

      const avgDuration = recentConsultations?.length > 0
        ? Math.round(recentConsultations.reduce((sum, c) => sum + (c.analysis_duration_ms || 0), 0) / recentConsultations.length)
        : 0

      return {
        success: true,
        total_consultations: totalConsultations || 0,
        successful_consultations: successfulConsultations || 0,
        avg_medications_per_consultation: avgMedicationsPerConsultation,
        avg_duration_ms: avgDuration,
        last_updated: new Date().toISOString()
      }

    } catch (error) {
      console.error('❌ Erro ao obter estatísticas de consultas:', error)
      return {
        success: false,
        message: error.message,
        total_consultations: 0,
        successful_consultations: 0,
        avg_medications_per_consultation: 0,
        avg_duration_ms: 0
      }
    }
  }
}
