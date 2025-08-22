import { useState, useCallback, useEffect } from 'react'
import { Search, Loader2, AlertCircle, History, BarChart3, Download, User, Pill, FileText, Clock, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import MedicationSelector from '../components/MedicationSelector'
import AnalysisReport from '../components/AnalysisReport'
import { analyzeMultipleDrugInteractions, OPENAI_MODEL } from '../lib/openai'
import { consultationService } from '../services/database'
import { consultationLogService } from '../services/consultationLogs'
import { medicationCacheService } from '../services/medicationCacheRefactored'
import useErrorHandler from '../hooks/useErrorHandler'

/**
 * Componente refatorado para análise de medicamentos
 * Versão otimizada com melhor UX e performance
 */
const DrugAnalysisRefactored = () => {
  const { handleApiError } = useErrorHandler()
  
  // Estados principais
  const [selectedMedications, setSelectedMedications] = useState([])
  const [patientId, setPatientId] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [showReport, setShowReport] = useState(false)
  
  // Estados do cache
  const [usedCache, setUsedCache] = useState(false)
  const [cacheInfo, setCacheInfo] = useState(null)
  const [cacheStats, setCacheStats] = useState(null)
  
  // Estados do histórico
  const [consultationHistory, setConsultationHistory] = useState([])
  const [showHistory, setShowHistory] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  
  // Estados de performance
  const [analysisMetrics, setAnalysisMetrics] = useState({
    startTime: null,
    duration: 0,
    tokensUsed: 0,
    tokensEconomized: 0
  })

  // Sessão única para rastreamento
  const sessionId = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)[0]

  /**
   * Carrega estatísticas do cache ao montar o componente
   */
  useEffect(() => {
    loadCacheStats()
  }, [])

  /**
   * Carrega estatísticas do cache
   */
  const loadCacheStats = useCallback(async () => {
    try {
      const stats = await medicationCacheService.getCacheStats()
      setCacheStats(stats)
    } catch (error) {
      console.warn('⚠️ Erro ao carregar estatísticas do cache:', error)
    }
  }, [])

  /**
   * Função principal de análise - refatorada e otimizada
   */
  const handleAnalyze = useCallback(async () => {
    if (selectedMedications.length < 2) {
      toast.error('Selecione pelo menos 2 medicamentos para análise')
      return
    }

    console.log('🚀 INICIANDO ANÁLISE OTIMIZADA')
    console.log('📋 Medicamentos:', selectedMedications.map(m => `${m.name} ${m.dosage}`))
    
    // Reset estados
    setIsAnalyzing(true)
    setAnalysisResult(null)
    setShowReport(false)
    setUsedCache(false)
    setCacheInfo(null)
    setAnalysisMetrics(prev => ({ ...prev, startTime: Date.now() }))
    
    let logId = null
    let analysis = null
    let isFromCache = false
    let analysisMetadata = {}
    
    try {
      // ETAPA 1: VERIFICAR CACHE
      console.log('🔍 ETAPA 1: Verificando cache...')
      const cachedResult = await medicationCacheService.getCachedCombination(selectedMedications)
      
      if (cachedResult && !cachedResult.is_expired) {
        // USAR CACHE
        console.log('✅ CACHE HIT! Reutilizando análise anterior')
        analysis = cachedResult.ai_analysis
        isFromCache = true
        analysisMetadata = {
          source: 'cache',
          ageInDays: cachedResult.ageInDays,
          consultationCount: cachedResult.consultation_count,
          cacheId: cachedResult.id,
          tokensEconomized: 1800 // Tokens economizados por não usar API
        }
        
        setUsedCache(true)
        setCacheInfo({
          ageInDays: cachedResult.ageInDays,
          consultationCount: cachedResult.consultation_count,
          createdAt: cachedResult.created_at
        })
        
        toast.success(`Análise recuperada do cache (${cachedResult.ageInDays} dias atrás)`, {
          icon: '📚',
          duration: 4000
        })
        
        // Registrar uso do cache
        await medicationCacheService.logConsultation(
          cachedResult.id,
          patientId,
          sessionId,
          'cache'
        )
        
      } else {
        // NOVA CONSULTA VIA API
        console.log('🔥 CACHE MISS! Fazendo nova consulta à API')
        
        // Criar log inicial
        try {
          const initialLog = await consultationLogService.createLog({
            sessionId,
            medications: selectedMedications,
            request: `Análise de ${selectedMedications.length} medicamentos: ${selectedMedications.map(m => m.name).join(', ')}`,
            status: 'pending'
          })
          logId = initialLog.id
        } catch (logError) {
          console.warn('⚠️ Erro ao criar log:', logError)
        }
        
        // Chamar API OpenAI
        const startTime = Date.now()
        analysis = await analyzeMultipleDrugInteractions(selectedMedications, async (logData) => {
          analysisMetadata.tokensUsed = logData.tokensUsed || 0
          if (logId) {
            try {
              await consultationLogService.updateLog(logId, logData)
            } catch (logUpdateError) {
              console.warn('⚠️ Erro ao atualizar log:', logUpdateError)
            }
          }
        })
        
        const duration = Date.now() - startTime
        analysisMetadata = {
          ...analysisMetadata,
          source: 'api',
          duration,
          model: OPENAI_MODEL
        }
        
        console.log('✅ Nova análise concluída via API')
        console.log(`⏱️ Duração: ${duration}ms`)
        console.log(`🔢 Tokens: ${analysisMetadata.tokensUsed}`)
        
        // SALVAR NO CACHE
        try {
          console.log('💾 ETAPA 2: Salvando no cache...')
          const cacheId = await medicationCacheService.saveCombinationCache(
            selectedMedications,
            analysis,
            analysisMetadata
          )
          
          // Registrar consulta no histórico
          await medicationCacheService.logConsultation(
            cacheId,
            patientId,
            sessionId,
            'api'
          )
          
          console.log('✅ Resultado salvo no cache')
          toast.success('Nova análise realizada e salva no cache', {
            icon: '🆕',
            duration: 4000
          })
          
        } catch (cacheError) {
          console.warn('⚠️ Erro ao salvar no cache:', cacheError.message)
          // Continua sem cache
        }
      }
      
      // VERIFICAR INTEGRIDADE DA ANÁLISE
      const medicationNames = selectedMedications.map(m => m.name.toLowerCase())
      const missingMedications = medicationNames.filter(name => 
        !analysis.toLowerCase().includes(name)
      )
      
      if (missingMedications.length > 0) {
        console.warn(`⚠️ Medicamentos não mencionados:`, missingMedications)
        toast(`⚠️ Atenção: Alguns medicamentos podem não ter sido completamente analisados.`, {
          duration: 5000,
          style: { background: '#F59E0B', color: 'white' }
        })
      } else {
        console.log('✅ Todos os medicamentos foram analisados')
      }
      
      // SALVAR CONSULTA NO BANCO (OPCIONAL)
      let consultationId = null
      try {
        const consultation = {
          patient_id: patientId || 'Não informado',
          medications: selectedMedications,
          ai_analysis: analysis,
          interactions_found: {},
          created_at: new Date().toISOString()
          // source: isFromCache ? 'cache' : 'api', // Campo não existe na tabela
          // cache_info: isFromCache ? analysisMetadata : null // Campo não existe na tabela
        }
        const savedConsultation = await consultationService.create(consultation)
        consultationId = savedConsultation.id
      } catch (dbError) {
        console.warn('⚠️ Erro ao salvar consulta:', dbError)
        // Continua sem salvar no banco
      }
      
      // CALCULAR MÉTRICAS FINAIS
      const finalDuration = Date.now() - analysisMetrics.startTime
      setAnalysisMetrics(prev => ({
        ...prev,
        duration: finalDuration,
        tokensUsed: isFromCache ? 0 : (analysisMetadata.tokensUsed || 0),
        tokensEconomized: isFromCache ? (analysisMetadata.tokensEconomized || 0) : 0
      }))
      
      // PREPARAR RESULTADO FINAL
      const result = {
        id: consultationId || 'temp-' + Date.now(),
        patient_id: patientId || 'Não informado',
        medications: selectedMedications,
        ai_analysis: analysis,
        analysis: analysis,
        created_at: new Date().toISOString(),
        log_id: logId,
        // source: isFromCache ? 'cache' : 'api', // Removido - não usado na interface
        // cache_info: analysisMetadata, // Removido - dados internos
        used_cache: isFromCache,
        metrics: {
          duration: finalDuration,
          tokensUsed: analysisMetrics.tokensUsed,
          tokensEconomized: analysisMetrics.tokensEconomized
        }
      }
      
      console.log('✅ Resultado preparado:', {
        id: result.id,
        medications: result.medications.length,
        hasAnalysis: !!result.ai_analysis,
        source: result.source,
        usedCache: isFromCache,
        duration: finalDuration + 'ms',
        tokens: result.metrics.tokensUsed
      })
      
      setAnalysisResult(result)
      setShowReport(true)
      
      // Atualizar estatísticas do cache
      loadCacheStats()
      
      console.log('🎉 ANÁLISE CONCLUÍDA COM SUCESSO!')
      
      const successMessage = isFromCache 
        ? `Análise recuperada do cache (economia de ${analysisMetrics.tokensEconomized} tokens)`
        : `Nova análise realizada (${analysisMetadata.tokensUsed} tokens utilizados)`
      
      toast.success(successMessage, {
        icon: isFromCache ? '⚡' : '🔬',
        duration: 5000
      })
      
    } catch (error) {
      console.error('❌ Erro na análise:', error)
      handleApiError(error)
      
      // Atualizar log com erro se existir
      if (logId) {
        try {
          await consultationLogService.updateLog(logId, {
            status: 'error',
            error_message: error.message
          })
        } catch (logError) {
          console.warn('⚠️ Erro ao atualizar log com erro:', logError)
        }
      }
      
    } finally {
      setIsAnalyzing(false)
    }
  }, [selectedMedications, patientId, sessionId, handleApiError, analysisMetrics.startTime, loadCacheStats])

  /**
   * Carrega histórico de consultas
   */
  const loadConsultationHistory = useCallback(async () => {
    setIsLoadingHistory(true)
    try {
      console.log('📚 Carregando histórico de consultas...')
      
      const history = await consultationService.getAll()
      
      // Dados mock se não houver histórico real
      const finalHistory = history.length > 0 ? history : [
        {
          id: 'mock-1',
          session_id: 'demo-session-1',
          medications_list: [
            { name: 'Paracetamol', dosage: '500mg' },
            { name: 'Ibuprofeno', dosage: '400mg' }
          ],
          medications_count: 2,
          status: 'completed',
          analysis_duration_ms: 3200,
          tokens_used: 1650,
          analysis_response: 'Análise demo: Interação moderada identificada entre Paracetamol e Ibuprofeno.',
          patient_id: 'DEMO-001',
          created_at: new Date(Date.now() - 86400000).toISOString() // 1 dia atrás
        },
        {
          id: 'mock-2',
          session_id: 'demo-session-2',
          medications_list: [
            { name: 'Omeprazol', dosage: '20mg' },
            { name: 'Sinvastatina', dosage: '40mg' }
          ],
          medications_count: 2,
          status: 'completed',
          analysis_duration_ms: 2800,
          tokens_used: 980,
          analysis_response: 'Análise demo: Não foram identificadas interações significativas.',
          patient_id: 'DEMO-002',
          created_at: new Date(Date.now() - 172800000).toISOString() // 2 dias atrás
        }
      ]
      
      setConsultationHistory(finalHistory)
      setShowHistory(true)
      
      if (finalHistory.length === 0) {
        toast.info('Nenhuma consulta encontrada no histórico. Faça uma análise primeiro!')
      } else {
        toast.success(`${finalHistory.length} consulta(s) carregada(s) do histórico`)
      }
      
    } catch (error) {
      console.error('❌ Erro ao carregar histórico:', error)
      toast.error('Erro ao carregar histórico de consultas')
    } finally {
      setIsLoadingHistory(false)
    }
  }, [])

  /**
   * Limpa cache expirado
   */
  const cleanupCache = useCallback(async () => {
    try {
      const deletedCount = await medicationCacheService.cleanupExpiredCache()
      toast.success(`Cache limpo: ${deletedCount} registros expirados removidos`)
      loadCacheStats()
    } catch (error) {
      console.error('❌ Erro ao limpar cache:', error)
      toast.error('Erro ao limpar cache')
    }
  }, [loadCacheStats])

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Cabeçalho com estatísticas */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Pill className="w-8 h-8 text-primary-600" />
          <h1 className="text-3xl font-bold text-gray-900">
            Análise de Interações Medicamentosas
          </h1>
        </div>
        
        {/* Estatísticas do Cache */}
        {cacheStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Cache Hit Rate</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">{cacheStats.cacheHitRate.toFixed(1)}%</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">Tokens Economizados</span>
              </div>
              <p className="text-2xl font-bold text-green-900">{cacheStats.totalTokensSaved.toLocaleString()}</p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Combinações Cached</span>
              </div>
              <p className="text-2xl font-bold text-purple-900">{cacheStats.totalCombinations}</p>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium text-orange-800">Total Consultas</span>
              </div>
              <p className="text-2xl font-bold text-orange-900">{cacheStats.totalConsultations}</p>
            </div>
          </div>
        )}
        
        <p className="text-gray-600 mb-4">
          Sistema inteligente com cache para análise rápida de interações entre medicamentos.
          {usedCache && (
            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
              ⚡ Última consulta usou cache
            </span>
          )}
        </p>
      </div>

      {/* Campo ID do Paciente */}
      <div className="mb-6">
        <label htmlFor="patientId" className="block text-sm font-medium text-gray-700 mb-2">
          <User className="w-4 h-4 inline mr-2" />
          ID do Paciente (Opcional)
        </label>
        <input
          type="text"
          id="patientId"
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
          placeholder="Ex: PAC001, João Silva, etc."
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          disabled={isAnalyzing}
        />
      </div>

      {/* Seletor de Medicamentos */}
      <div className="mb-8">
        <MedicationSelector
          selectedMedications={selectedMedications}
          onMedicationsChange={setSelectedMedications}
          disabled={isAnalyzing}
        />
      </div>

      {/* Botões de Ação */}
      <div className="flex flex-wrap gap-4 mb-8">
        <button
          onClick={handleAnalyze}
          disabled={selectedMedications.length < 2 || isAnalyzing}
          className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analisando...
            </>
          ) : (
            <>
              <Search className="w-5 h-5" />
              Analisar Interações
            </>
          )}
        </button>

        <button
          onClick={loadConsultationHistory}
          disabled={isLoadingHistory}
          className="flex items-center gap-2 px-6 py-3 bg-secondary-600 text-white rounded-lg font-medium hover:bg-secondary-700 disabled:bg-gray-300 transition-colors"
        >
          {isLoadingHistory ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Carregando...
            </>
          ) : (
            <>
              <History className="w-5 h-5" />
              Ver Histórico
            </>
          )}
        </button>

        <button
          onClick={cleanupCache}
          className="flex items-center gap-2 px-4 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors"
        >
          <FileText className="w-5 h-5" />
          Limpar Cache
        </button>
      </div>

      {/* Informações da Análise Atual */}
      {isAnalyzing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <div>
              <h3 className="font-medium text-blue-900">Processando análise...</h3>
              <p className="text-sm text-blue-700">
                Verificando cache e analisando {selectedMedications.length} medicamentos
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Métricas da Última Análise */}
      {analysisMetrics.duration > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-gray-900 mb-2">Métricas da Análise</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Duração:</span>
              <span className="ml-2 font-medium">{analysisMetrics.duration}ms</span>
            </div>
            <div>
              <span className="text-gray-600">Tokens Usados:</span>
              <span className="ml-2 font-medium">{analysisMetrics.tokensUsed}</span>
            </div>
            <div>
              <span className="text-gray-600">Tokens Economizados:</span>
              <span className="ml-2 font-medium text-green-600">{analysisMetrics.tokensEconomized}</span>
            </div>
          </div>
        </div>
      )}

      {/* Relatório de Análise */}
      {showReport && analysisResult && (
        <AnalysisReport
          result={analysisResult}
          onClose={() => setShowReport(false)}
        />
      )}

      {/* Histórico de Consultas */}
      {showHistory && (
        <div className="mt-8 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Histórico de Consultas
              </h2>
              <button
                onClick={() => setShowHistory(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {consultationHistory.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Nenhuma consulta encontrada no histórico.
              </p>
            ) : (
              <div className="space-y-4">
                {consultationHistory.map((consultation) => (
                  <div
                    key={consultation.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        {consultation.patient_id}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(consultation.created_at).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    
                    <div className="mb-2">
                      <p className="text-sm text-gray-600">
                        <strong>Medicamentos:</strong>{' '}
                        {consultation.medications_list?.map(med => `${med.name} ${med.dosage}`).join(', ')}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Status: {consultation.status}</span>
                      <span>Tokens: {consultation.tokens_used}</span>
                      <span>Duração: {consultation.analysis_duration_ms}ms</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Aviso se medicamentos insuficientes */}
      {selectedMedications.length === 1 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <p className="text-yellow-800">
              Adicione pelo menos mais um medicamento para realizar a análise de interações.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default DrugAnalysisRefactored
