import { useState, useEffect } from 'react'
import { FileText, Download, Calendar, TrendingUp, Users, AlertTriangle, RefreshCw } from 'lucide-react'
import { consultationLogService } from '../services/consultationLogs'
import { consultationService } from '../services/database'

const Reports = () => {
  const [consultations, setConsultations] = useState([])
  const [consultationLogs, setConsultationLogs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [dataSource, setDataSource] = useState('logs') // 'logs' ou 'consultations'
  const [dateFilter, setDateFilter] = useState('all')
  const [error, setError] = useState(null)
  const [stats, setStats] = useState({
    totalConsultations: 0,
    totalInteractions: 0,
    majorInteractions: 0,
    mostAnalyzedMeds: [],
    completedConsultations: 0,
    errorConsultations: 0,
    averageDuration: 0,
    totalTokensUsed: 0
  })

  // Dados simulados de consultas
  const mockConsultations = [
    {
      id: 1,
      patient_id: 'PAC001',
      medications: [
        { name: 'Nitrazepam', dosage: '5mg' },
        { name: 'Álcool', dosage: 'Uso social' }
      ],
      interactions_found: {
        major: 1,
        moderate: 0,
        minor: 0
      },
      created_at: '2024-08-10T10:30:00',
      pharmacist_notes: 'Orientação sobre evitar álcool durante tratamento'
    },
    {
      id: 2,
      patient_id: 'PAC002',
      medications: [
        { name: 'Sinvastatina', dosage: '40mg' },
        { name: 'Ciprofibrato', dosage: '100mg' },
        { name: 'Colchicina', dosage: '0.5mg' }
      ],
      interactions_found: {
        major: 2,
        moderate: 1,
        minor: 0
      },
      created_at: '2024-08-12T14:15:00',
      pharmacist_notes: 'Risco alto de miopatia. Sugerido monitoramento de CK e redução de doses.'
    },
    {
      id: 3,
      patient_id: 'PAC003',
      medications: [
        { name: 'Clonazepam', dosage: '2mg' },
        { name: 'Ácido Valproico', dosage: '500mg' },
        { name: 'Olanzapina', dosage: '10mg' }
      ],
      interactions_found: {
        major: 0,
        moderate: 2,
        minor: 1
      },
      created_at: '2024-08-13T09:45:00',
      pharmacist_notes: 'Monitoramento de sedação e ajuste de clonazepam conforme resposta.'
    },
    {
      id: 4,
      patient_id: 'PAC004',
      medications: [
        { name: 'Metformina', dosage: '850mg' },
        { name: 'Omeprazol', dosage: '20mg' }
      ],
      interactions_found: {
        major: 0,
        moderate: 0,
        minor: 1
      },
      created_at: '2024-08-14T16:20:00',
      pharmacist_notes: 'Interação menor. Monitorar eficácia da metformina.'
    }
  ]

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Tentar carregar dados reais primeiro
      await loadRealData()
    } catch (err) {
      console.warn('Erro ao carregar dados reais, usando dados simulados:', err.message)
      setError('Não foi possível carregar os dados reais. Usando dados simulados.')
      loadMockData()
    }
    
    setIsLoading(false)
  }

  const loadRealData = async () => {
    try {
      // Tentar carregar logs de consulta primeiro
      const logs = await consultationLogService.getLogs({ limit: 100 })
      
      if (logs && logs.length > 0) {
        console.log('📊 Carregando dados reais dos logs:', logs.length, 'registros')
        setConsultationLogs(logs)
        setDataSource('logs')
        await calculateStatsFromLogs(logs)
        return
      }

      // Se não há logs, tentar carregar consultas normais
      const consultationsData = await consultationService.getAll()
      
      if (consultationsData && consultationsData.length > 0) {
        console.log('📊 Carregando dados das consultas:', consultationsData.length, 'registros')
        setConsultations(consultationsData)
        setDataSource('consultations')
        await calculateStatsFromConsultations(consultationsData)
        return
      }

      // Se não há dados reais, carregar mock
      throw new Error('Nenhum dado real encontrado')
      
    } catch (error) {
      console.error('Erro ao carregar dados reais:', error)
      throw error
    }
  }

  const loadMockData = () => {
    setConsultations(mockConsultations)
    setDataSource('mock')
    calculateStats(mockConsultations)
  }

  const calculateStatsFromLogs = async (logsData) => {
    try {
      // Usar o método getStats do serviço
      const serviceStats = await consultationLogService.getStats('90 days')
      
      // Processar medicamentos mais usados
      const medicationCount = {}
      logsData.forEach(log => {
        if (log.medications_list && Array.isArray(log.medications_list)) {
          log.medications_list.forEach(med => {
            const name = med.name || med
            medicationCount[name] = (medicationCount[name] || 0) + 1
          })
        }
      })

      const mostAnalyzedMeds = Object.entries(medicationCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([name, count]) => ({ name, count }))

      setStats({
        totalConsultations: serviceStats.totalConsultations,
        completedConsultations: serviceStats.completedConsultations,
        errorConsultations: serviceStats.errorConsultations,
        averageDuration: Math.round(serviceStats.averageDuration / 1000), // em segundos
        totalTokensUsed: serviceStats.totalTokensUsed,
        mostAnalyzedMeds,
        // Estatísticas de interação (estimadas - seria necessário analisar o conteúdo das análises)
        totalInteractions: Math.floor(serviceStats.totalConsultations * 1.5), // Estimativa
        majorInteractions: Math.floor(serviceStats.totalConsultations * 0.2) // Estimativa
      })
      
    } catch (error) {
      console.error('Erro ao calcular estatísticas dos logs:', error)
      // Fallback para cálculo simples
      setStats({
        totalConsultations: logsData.length,
        completedConsultations: logsData.filter(log => log.status === 'completed').length,
        errorConsultations: logsData.filter(log => log.status === 'error').length,
        mostAnalyzedMeds: [],
        totalInteractions: 0,
        majorInteractions: 0,
        averageDuration: 0,
        totalTokensUsed: 0
      })
    }
  }

  const calculateStatsFromConsultations = async (consultationsData) => {
    const totalConsultations = consultationsData.length
    let totalInteractions = 0
    let majorInteractions = 0
    const medicationCount = {}

    consultationsData.forEach(consultation => {
      if (consultation.interactions_found) {
        const interactions = consultation.interactions_found
        if (typeof interactions === 'object') {
          totalInteractions += (interactions.major || 0) + (interactions.moderate || 0) + (interactions.minor || 0)
          majorInteractions += (interactions.major || 0)
        }
      }

      if (consultation.medications && Array.isArray(consultation.medications)) {
        consultation.medications.forEach(med => {
          const name = med.name || med
          medicationCount[name] = (medicationCount[name] || 0) + 1
        })
      }
    })

    const mostAnalyzedMeds = Object.entries(medicationCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }))

    setStats({
      totalConsultations,
      totalInteractions,
      majorInteractions,
      mostAnalyzedMeds,
      completedConsultations: totalConsultations, // Assumir todas como completas
      errorConsultations: 0,
      averageDuration: 0,
      totalTokensUsed: 0
    })
  }

  // Função para manter compatibilidade com dados simulados
  const calculateStats = (consultationsData) => {
    const totalConsultations = consultationsData.length
    let totalInteractions = 0
    let majorInteractions = 0
    const medicationCount = {}

    consultationsData.forEach(consultation => {
      if (consultation.interactions_found) {
        const interactions = consultation.interactions_found
        totalInteractions += (interactions.major + interactions.moderate + interactions.minor)
        majorInteractions += interactions.major
      }

      if (consultation.medications) {
        consultation.medications.forEach(med => {
          medicationCount[med.name] = (medicationCount[med.name] || 0) + 1
        })
      }
    })

    const mostAnalyzedMeds = Object.entries(medicationCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }))

    setStats({
      totalConsultations,
      totalInteractions,
      majorInteractions,
      mostAnalyzedMeds,
      completedConsultations: totalConsultations,
      errorConsultations: 0,
      averageDuration: 0,
      totalTokensUsed: 0
    })
  }

  const getCurrentData = () => {
    switch (dataSource) {
      case 'logs':
        return consultationLogs.map(log => ({
          id: log.id,
          patient_id: log.session_id,
          medications: log.medications_list || [],
          medications_count: log.medications_count || (log.medications_list ? log.medications_list.length : 0),
          created_at: log.created_at,
          status: log.status,
          analysis_response: log.analysis_response,
          tokens_used: log.tokens_used,
          duration: log.analysis_duration_ms ? Math.round(log.analysis_duration_ms / 1000) : null,
          interactions_found: {
            major: 0, // Seria necessário analisar o response para extrair
            moderate: 0,
            minor: 0
          },
          pharmacist_notes: log.error_message || ''
        }))
      case 'consultations':
        return consultations
      default:
        return mockConsultations
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredConsultations = getCurrentData().filter(consultation => {
    if (dateFilter === 'all') return true
    
    const consultationDate = new Date(consultation.created_at)
    const now = new Date()
    
    switch (dateFilter) {
      case 'today':
        return consultationDate.toDateString() === now.toDateString()
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        return consultationDate >= weekAgo
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        return consultationDate >= monthAgo
      default:
        return true
    }
  })

  const exportToCSV = () => {
    const csvData = filteredConsultations.map(consultation => ({
      'ID Consulta': consultation.id,
      'ID Paciente': consultation.patient_id,
      'Data': formatDate(consultation.created_at),
      'Medicamentos': consultation.medications.map(med => `${med.name} ${med.dosage}`).join('; '),
      'Interações Maiores': consultation.interactions_found.major,
      'Interações Moderadas': consultation.interactions_found.moderate,
      'Interações Menores': consultation.interactions_found.minor,
      'Observações': consultation.pharmacist_notes || ''
    }))

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `relatorio-consultas-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-2">Carregando relatórios...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Relatórios e Estatísticas</h1>
            <p className="text-gray-600">
              Análise de consultas e padrões de interações medicamentosas
              {dataSource === 'logs' && (
                <span className="block text-sm text-green-600 mt-1">
                  ✅ Dados reais dos logs de consulta
                </span>
              )}
              {dataSource === 'consultations' && (
                <span className="block text-sm text-blue-600 mt-1">
                  ℹ️ Dados das consultas do sistema
                </span>
              )}
              {dataSource === 'mock' && (
                <span className="block text-sm text-orange-600 mt-1">
                  ⚠️ Dados simulados (configure o banco para dados reais)
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="btn btn-secondary flex items-center gap-2"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
          <button
            onClick={exportToCSV}
            className="btn btn-primary flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Mensagem de erro se houver */}
      {error && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <span className="text-orange-800">{error}</span>
          </div>
        </div>
      )}

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Consultas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalConsultations}</p>
              {dataSource === 'logs' && stats.completedConsultations > 0 && (
                <p className="text-xs text-green-600">{stats.completedConsultations} concluídas</p>
              )}
            </div>
            <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>

        {dataSource === 'logs' ? (
          <>
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tempo Médio</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.averageDuration}s</p>
                  <p className="text-xs text-gray-500">por análise</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tokens Usados</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalTokensUsed.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">total consumido</p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Taxa de Erro</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalConsultations > 0 
                      ? Math.round((stats.errorConsultations / stats.totalConsultations) * 100)
                      : 0}%
                  </p>
                  <p className="text-xs text-gray-500">{stats.errorConsultations} erros</p>
                </div>
                <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Interações</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalInteractions}</p>
                </div>
                <div className="h-12 w-12 bg-warning-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-warning-600" />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Interações Maiores</p>
                  <p className="text-2xl font-bold text-danger-600">{stats.majorInteractions}</p>
                </div>
                <div className="h-12 w-12 bg-danger-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-danger-600" />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Taxa de Risco</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalConsultations > 0 
                      ? Math.round((stats.majorInteractions / stats.totalConsultations) * 100)
                      : 0}%
                  </p>
                </div>
                <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-gray-600" />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Filtros e Medicamentos Mais Analisados */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Filtrar por Período</h3>
              <select
                className="input w-auto"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option value="all">Todos os períodos</option>
                <option value="today">Hoje</option>
                <option value="week">Última semana</option>
                <option value="month">Último mês</option>
              </select>
            </div>
            <p className="text-sm text-gray-600">
              Mostrando {filteredConsultations.length} de {consultations.length} consultas
            </p>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Medicamentos Mais Analisados</h3>
          <div className="space-y-3">
            {stats.mostAnalyzedMeds.map((med, index) => (
              <div key={med.name} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{med.name}</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ 
                        width: `${(med.count / stats.mostAnalyzedMeds[0]?.count || 1) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{med.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Últimas Consultas */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Últimas Consultas</h3>
            <p className="text-sm text-gray-600">
              {dataSource === 'logs' ? 'Dados reais do sistema' : 
               dataSource === 'consultations' ? 'Consultas do banco de dados' :
               'Dados de demonstração'}
            </p>
          </div>
          {dataSource === 'logs' && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Dados reais
            </span>
          )}
        </div>
        
        <div className="space-y-4">
          {getCurrentData().slice(0, 5).map((consultation) => {
            const index = getCurrentData().indexOf(consultation)
            return (
            <div key={consultation.id || index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">
                    {dataSource === 'logs' 
                      ? `Consulta #${consultation.id?.slice(0, 8) || index + 1}`
                      : consultation.patient_id || consultation.patientName
                    }
                  </h4>
                  <span className="text-sm text-gray-500">
                    {dataSource === 'logs' 
                      ? new Date(consultation.created_at).toLocaleDateString('pt-BR')
                      : consultation.created_at ? new Date(consultation.created_at).toLocaleDateString('pt-BR') : consultation.date
                    }
                  </span>
                </div>
                
                <div className="text-sm text-gray-600 mb-2">
                  {dataSource === 'logs' ? (
                    <>
                      <p><span className="font-medium">Medicamentos:</span> {consultation.medications_count || 'N/A'}</p>
                      {consultation.status && (
                        <p><span className="font-medium">Status:</span> 
                          <span className={`ml-1 px-2 py-0.5 rounded text-xs ${
                            consultation.status === 'completed' ? 'bg-green-100 text-green-800' :
                            consultation.status === 'error' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {consultation.status === 'completed' ? 'Concluída' :
                             consultation.status === 'error' ? 'Erro' : 'Em andamento'}
                          </span>
                        </p>
                      )}
                      {consultation.duration && (
                        <p><span className="font-medium">Duração:</span> {consultation.duration}s</p>
                      )}
                      {consultation.tokens_used && (
                        <p><span className="font-medium">Tokens:</span> {consultation.tokens_used}</p>
                      )}
                    </>
                  ) : (
                    <>
                      <p><span className="font-medium">Medicamentos:</span> 
                        {consultation.medications ? 
                          (Array.isArray(consultation.medications) ? 
                            consultation.medications.map(med => med.name || med).join(', ') :
                            `${consultation.medications.length || 0} medicamentos`
                          ) : 
                          'N/A'
                        }
                      </p>
                      {consultation.interactions_found && (
                        <div className="flex items-center gap-2 mt-1">
                          <AlertTriangle className="h-4 w-4 text-warning-600" />
                          <span className="text-warning-700">
                            {(consultation.interactions_found.major || 0) + 
                             (consultation.interactions_found.moderate || 0) + 
                             (consultation.interactions_found.minor || 0)} interação(ões) encontrada(s)
                          </span>
                        </div>
                      )}
                      {consultation.interactions > 0 && (
                        <div className="flex items-center gap-2 mt-1">
                          <AlertTriangle className="h-4 w-4 text-warning-600" />
                          <span className="text-warning-700">{consultation.interactions} interação(ões) encontrada(s)</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
            )
          })}
          
          {consultations.length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {dataSource === 'logs' 
                  ? 'Nenhuma consulta registrada ainda' 
                  : 'Carregando dados...'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Lista de Consultas */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Histórico de Consultas</h3>
        
        {filteredConsultations.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma consulta encontrada
            </h3>
            <p className="text-gray-600">
              Não há consultas para o período selecionado.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paciente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data/Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Medicamentos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Interações
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Observações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredConsultations.map((consultation) => (
                  <tr key={consultation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {consultation.patient_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(consultation.created_at)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="space-y-1">
                        {consultation.medications.map((med, idx) => (
                          <div key={idx} className="text-xs">
                            <strong>{med.name}</strong> - {med.dosage}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-1">
                        {consultation.interactions_found.major > 0 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-danger-100 text-danger-800">
                            {consultation.interactions_found.major} Maior
                          </span>
                        )}
                        {consultation.interactions_found.moderate > 0 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-warning-100 text-warning-800">
                            {consultation.interactions_found.moderate} Mod
                          </span>
                        )}
                        {consultation.interactions_found.minor > 0 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success-100 text-success-800">
                            {consultation.interactions_found.minor} Men
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {consultation.pharmacist_notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Reports
