import React, { useState, useEffect } from 'react'
import { consultationLogService } from '../services/consultationLogsRefactored.js'

/**
 * Componente de Relatórios Refatorado
 * Versão otimizada com melhor UX e performance
 */
export default function ReportsRefactored() {
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [period, setPeriod] = useState('30 days')
  const [selectedMetric, setSelectedMetric] = useState('overview')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadStats()
  }, [period])

  const loadStats = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const data = await consultationLogService.getStats(period)
      setStats(data)
    } catch (err) {
      setError('Erro ao carregar estatísticas')
      console.error('Erro ao carregar stats:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshStats = async () => {
    setRefreshing(true)
    await loadStats()
    setRefreshing(false)
  }

  const exportData = async () => {
    try {
      const data = await consultationLogService.exportLogs({}, 'csv')
      if (data) {
        const blob = new Blob([data], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `portal_medicamentos_${period.replace(' ', '_')}.csv`
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch (err) {
      console.error('Erro ao exportar:', err)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center justify-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="text-gray-600">Carregando relatórios...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center">
              <div className="text-red-600 text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Erro ao Carregar Dados</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={loadStats}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Tentar Novamente
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                📊 Relatórios de Análise
              </h1>
              <p className="text-gray-600">
                Estatísticas detalhadas do Portal de Verificação Medicamentosa
              </p>
            </div>
            
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              {/* Seletor de Período */}
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="7 days">Última Semana</option>
                <option value="30 days">Último Mês</option>
                <option value="90 days">Últimos 3 Meses</option>
                <option value="1 year">Último Ano</option>
              </select>

              {/* Botão Refresh */}
              <button
                onClick={refreshStats}
                disabled={refreshing}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                <span className={refreshing ? 'animate-spin' : ''}>🔄</span>
                <span>Atualizar</span>
              </button>

              {/* Botão Exportar */}
              <button
                onClick={exportData}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <span>📥</span>
                <span>Exportar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <MetricCard
            title="Total de Consultas"
            value={stats.totalConsultations}
            icon="📋"
            color="blue"
            subtitle={`${period}`}
          />
          
          <MetricCard
            title="Taxa de Sucesso"
            value={`${stats.successRate.toFixed(1)}%`}
            icon="✅"
            color="green"
            subtitle={`${stats.completedConsultations} sucesso`}
          />
          
          <MetricCard
            title="Tokens Utilizados"
            value={stats.totalTokensUsed.toLocaleString()}
            icon="🔤"
            color="purple"
            subtitle={`Média: ${stats.averageTokensPerConsultation}`}
          />
          
          <MetricCard
            title="Tempo Médio"
            value={`${(stats.averageDuration / 1000).toFixed(1)}s`}
            icon="⏱️"
            color="orange"
            subtitle="Por análise"
          />
        </div>

        {/* Navegação de Seções */}
        <div className="bg-white rounded-lg shadow-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Visão Geral', icon: '📊' },
                { id: 'performance', label: 'Performance', icon: '⚡' },
                { id: 'medications', label: 'Medicamentos', icon: '💊' },
                { id: 'trends', label: 'Tendências', icon: '📈' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedMetric(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    selectedMetric === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Conteúdo das Seções */}
        <div className="space-y-6">
          {selectedMetric === 'overview' && (
            <OverviewSection stats={stats} />
          )}
          
          {selectedMetric === 'performance' && (
            <PerformanceSection stats={stats} />
          )}
          
          {selectedMetric === 'medications' && (
            <MedicationsSection stats={stats} />
          )}
          
          {selectedMetric === 'trends' && (
            <TrendsSection stats={stats} />
          )}
        </div>
      </div>
    </div>
  )
}

// Componente de Card de Métrica
function MetricCard({ title, value, icon, color, subtitle }) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600'
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className={`bg-gradient-to-r ${colorClasses[color]} p-4`}>
        <div className="flex items-center justify-between text-white">
          <div>
            <p className="text-white/80 text-sm">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && (
              <p className="text-white/60 text-xs mt-1">{subtitle}</p>
            )}
          </div>
          <div className="text-3xl opacity-80">
            {icon}
          </div>
        </div>
      </div>
    </div>
  )
}

// Seção de Visão Geral
function OverviewSection({ stats }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Status das Consultas */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">📊</span>
          Status das Consultas
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Completadas</span>
            <div className="flex items-center space-x-2">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full"
                  style={{ 
                    width: `${(stats.completedConsultations / stats.totalConsultations) * 100}%` 
                  }}
                ></div>
              </div>
              <span className="font-medium text-green-600">
                {stats.completedConsultations}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Com Erro</span>
            <div className="flex items-center space-x-2">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full"
                  style={{ 
                    width: `${(stats.errorConsultations / stats.totalConsultations) * 100}%` 
                  }}
                ></div>
              </div>
              <span className="font-medium text-red-600">
                {stats.errorConsultations}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modelos Utilizados */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">🤖</span>
          Modelos de IA
        </h3>
        
        <div className="space-y-3">
          {stats.modelUsage.map((model, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-gray-600">{model.model}</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ 
                      width: `${(model.count / stats.totalConsultations) * 100}%` 
                    }}
                  ></div>
                </div>
                <span className="font-medium text-blue-600">
                  {model.count}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Seção de Performance
function PerformanceSection({ stats }) {
  const metrics = stats.performanceMetrics

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">⚡</span>
          Análises Rápidas
        </h3>
        <div className="text-center">
          <div className="text-4xl font-bold text-green-600 mb-2">
            {metrics.fastAnalyses}
          </div>
          <p className="text-gray-600">Análises em &lt; 2s</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">🐌</span>
          Análises Lentas
        </h3>
        <div className="text-center">
          <div className="text-4xl font-bold text-orange-600 mb-2">
            {metrics.slowAnalyses}
          </div>
          <p className="text-gray-600">Análises em &gt; 10s</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">📊</span>
          Tokens/Segundo
        </h3>
        <div className="text-center">
          <div className="text-4xl font-bold text-blue-600 mb-2">
            {metrics.averageTokensPerSecond}
          </div>
          <p className="text-gray-600">Velocidade média</p>
        </div>
      </div>
    </div>
  )
}

// Seção de Medicamentos
function MedicationsSection({ stats }) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
        <span className="mr-2">💊</span>
        Medicamentos Mais Consultados
      </h3>
      
      <div className="space-y-4">
        {stats.medicationDistribution.slice(0, 10).map((medication, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                {index + 1}
              </div>
              <span className="font-medium text-gray-800">{medication.name}</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ 
                    width: `${(medication.count / stats.medicationDistribution[0].count) * 100}%` 
                  }}
                ></div>
              </div>
              <span className="font-bold text-blue-600 min-w-[3rem]">
                {medication.count}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Seção de Tendências
function TrendsSection({ stats }) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
        <span className="mr-2">📈</span>
        Tendências de Uso
      </h3>
      
      <div className="space-y-4">
        {stats.consultationsByDay.slice(-14).map((day, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-600 font-medium">
              {new Date(day.date).toLocaleDateString('pt-BR', { 
                weekday: 'short', 
                day: '2-digit', 
                month: '2-digit' 
              })}
            </span>
            <div className="flex items-center space-x-3">
              <div className="w-40 bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full"
                  style={{ 
                    width: `${Math.max(5, (day.count / Math.max(...stats.consultationsByDay.map(d => d.count))) * 100)}%` 
                  }}
                ></div>
              </div>
              <span className="font-bold text-blue-600 min-w-[3rem]">
                {day.count}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
