import { useState, useEffect } from 'react'
import { AlertTriangle, Search, Filter, TrendingUp, Database, Clock, Users } from 'lucide-react'
import InteractionCard from '../components/InteractionCard'
import interactionService from '../services/interactionService'

const DrugInteractions = () => {
  const [interactions, setInteractions] = useState([])
  const [filteredInteractions, setFilteredInteractions] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState({
    total: 0,
    severe: 0,
    moderate: 0,
    mild: 0,
    mostCommonMedications: []
  })

  useEffect(() => {
    loadRealInteractions()
  }, [])

  const loadRealInteractions = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Carregar interações reais do banco de dados
      const realInteractions = await interactionService.getAllInteractions()
      
      // Carregar estatísticas
      const interactionStats = await interactionService.getInteractionStats()
      
      // Converter para o formato esperado pelo componente
      const formattedInteractions = realInteractions.map(interaction => ({
        id: interaction.id,
        medications: `${interaction.medication_a} + ${interaction.medication_b}`,
        mechanism: interaction.mechanism || 'Mecanismo identificado através de análise de dados',
        clinicalEffect: interaction.description,
        management: interaction.management || 'Consulte um profissional de saúde',
        monitoring: interaction.clinical_significance || 'Monitoramento recomendado',
        evidenceLevel: getSeverityDisplay(interaction.severity_level),
        severity: mapSeverityLevel(interaction.severity_level),
        // Dados adicionais
        medication_a: interaction.medication_a,
        medication_b: interaction.medication_b,
        created_at: interaction.created_at
      }))
      
      setInteractions(formattedInteractions)
      setFilteredInteractions(formattedInteractions)
      setStats(interactionStats)
      
    } catch (err) {
      console.error('Erro ao carregar interações:', err)
      setError('Erro ao carregar dados de interações. Usando dados de exemplo.')
      // Fallback para dados de exemplo se houver erro
      loadFallbackData()
    } finally {
      setIsLoading(false)
    }
  }

  const getSeverityDisplay = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'alta':
      case 'grave':
        return 'Alto'
      case 'moderada':
      case 'média':
        return 'Moderado'
      case 'leve':
      case 'baixa':
        return 'Baixo'
      default:
        return 'Moderado'
    }
  }

  const mapSeverityLevel = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'alta':
      case 'grave':
        return 'major'
      case 'moderada':
      case 'média':
        return 'moderate'
      case 'leve':
      case 'baixa':
        return 'minor'
      default:
        return 'moderate'
    }
  }

  const loadFallbackData = () => {
    // Dados de fallback caso não haja dados reais
    const fallbackInteractions = [
      {
        id: 'fallback_1',
        medications: 'Aguardando dados reais do banco',
        mechanism: 'Sistema carregando interações dos medicamentos capturados',
        clinicalEffect: 'As interações serão exibidas baseadas nos medicamentos consultados no sistema',
        management: 'Continue usando o sistema para capturar mais dados de medicamentos',
        monitoring: 'Os dados aparecerão automaticamente após consultas de medicamentos',
        evidenceLevel: 'Sistema',
        severity: 'minor'
      }
    ]
    
    setInteractions(fallbackInteractions)
    setFilteredInteractions(fallbackInteractions)
  }

  useEffect(() => {
    let filtered = interactions

    // Filtrar por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(interaction =>
        interaction.medications.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interaction.mechanism.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interaction.clinicalEffect.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtrar por severidade
    if (severityFilter !== 'all') {
      filtered = filtered.filter(interaction => interaction.severity === severityFilter)
    }

    setFilteredInteractions(filtered)
  }, [searchTerm, severityFilter, interactions])

  const getSeverityStats = () => {
    return {
      major: interactions.filter(i => i.severity === 'major').length,
      moderate: interactions.filter(i => i.severity === 'moderate').length,
      minor: interactions.filter(i => i.severity === 'minor').length
    }
  }

  const severityStats = getSeverityStats()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-2">Carregando interações reais do banco de dados...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-8 w-8 text-warning-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Base de Interações Medicamentosas</h1>
          <p className="text-gray-600">
            Interações identificadas automaticamente dos medicamentos consultados no sistema
          </p>
          {error && (
            <div className="text-sm text-warning-600 mt-1">
              ⚠️ {error}
            </div>
          )}
        </div>
      </div>

      {/* Estatísticas Reais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total de Interações</div>
            </div>
            <Database className="h-8 w-8 text-primary-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-danger-600">{stats.severe}</div>
              <div className="text-sm text-gray-600">Interações Graves</div>
            </div>
            <AlertTriangle className="h-8 w-8 text-danger-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-warning-600">{stats.moderate}</div>
              <div className="text-sm text-gray-600">Interações Moderadas</div>
            </div>
            <TrendingUp className="h-8 w-8 text-warning-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-success-600">{stats.mild}</div>
              <div className="text-sm text-gray-600">Interações Leves</div>
            </div>
            <Users className="h-8 w-8 text-success-600" />
          </div>
        </div>
      </div>

      {/* Medicamentos mais frequentes */}
      {stats.mostCommonMedications && stats.mostCommonMedications.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Medicamentos com Mais Interações
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {stats.mostCommonMedications.map((med, index) => (
              <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-900">{med.name}</div>
                <div className="text-sm text-gray-600">{med.count} interações</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filtros e Busca */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por medicamento, mecanismo ou efeito..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Filter className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
              >
                <option value="all">Todas as Severidades</option>
                <option value="major">Maior</option>
                <option value="moderate">Moderada</option>
                <option value="minor">Menor</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Interações */}
      <div className="space-y-4">
        {filteredInteractions.length === 0 ? (
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || severityFilter !== 'all' 
                ? 'Nenhuma interação encontrada' 
                : 'Nenhuma interação disponível'
              }
            </h3>
            <p className="text-gray-600">
              {searchTerm || severityFilter !== 'all'
                ? 'Tente ajustar os filtros de busca.'
                : 'As interações aparecerão automaticamente conforme medicamentos forem consultados no sistema.'
              }
            </p>
          </div>
        ) : (
          filteredInteractions.map((interaction) => (
            <InteractionCard
              key={interaction.id}
              interaction={interaction}
            />
          ))
        )}
      </div>

      {/* Informações Adicionais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold mb-3">Classificação de Severidade</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-4 h-4 bg-danger-500 rounded-full mt-0.5"></div>
              <div>
                <div className="font-medium">Maior (Major)</div>
                <div className="text-gray-600">
                  Interações potencialmente perigosas que devem ser evitadas ou requerem
                  monitoramento intensivo.
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-4 h-4 bg-warning-500 rounded-full mt-0.5"></div>
              <div>
                <div className="font-medium">Moderada (Moderate)</div>
                <div className="text-gray-600">
                  Interações clinicamente significativas que requerem monitoramento
                  ou ajuste de dose.
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-4 h-4 bg-success-500 rounded-full mt-0.5"></div>
              <div>
                <div className="font-medium">Menor (Minor)</div>
                <div className="text-gray-600">
                  Interações de importância clínica limitada, geralmente não requerem
                  mudanças na terapia.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold mb-3">Como Interpretar</h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>• <strong>Mecanismo:</strong> Como a interação ocorre farmacologicamente</li>
            <li>• <strong>Efeito Clínico:</strong> O que esperar na prática clínica</li>
            <li>• <strong>Manejo:</strong> Como prevenir ou minimizar riscos</li>
            <li>• <strong>Monitoramento:</strong> Parâmetros a serem acompanhados</li>
            <li>• <strong>Evidência:</strong> Nível de suporte científico</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default DrugInteractions
