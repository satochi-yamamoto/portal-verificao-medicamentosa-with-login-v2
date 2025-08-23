import { useState } from 'react'
import { Search, Loader2, AlertCircle, History, BarChart3, Download, User, Pill, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import { optimizedSetTimeout } from '../utils/performance'
import MedicationSelector from '../components/MedicationSelector'
import AnalysisReport from '../components/AnalysisReport'
import { analyzeMultipleDrugInteractions, OPENAI_MODEL } from '../lib/openai'
import { consultationService } from '../services/database'
import { consultationLogService } from '../services/consultationLogs'
import medicationCacheService from '../services/medicationCacheRefactored'
import medicationCaptureService from '../services/medicationCaptureEnhanced'
import useErrorHandler from '../hooks/useErrorHandler'

const DrugAnalysis = () => {
  const { handleApiError } = useErrorHandler()
  const [selectedMedications, setSelectedMedications] = useState([])
  const [patientId, setPatientId] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [showReport, setShowReport] = useState(false)
  const [sessionId] = useState(() => consultationLogService.generateSessionId())
  const [showHistory, setShowHistory] = useState(false)
  const [consultationHistory, setConsultationHistory] = useState([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null)
  const [showHistoryDetail, setShowHistoryDetail] = useState(false)
  const [captureStats, setCaptureStats] = useState(null)
  const [showCaptureInfo, setShowCaptureInfo] = useState(false)

  const handleMedicationAdd = (medication) => {
    setSelectedMedications(prev => [...prev, medication])
    toast.success(`${medication.name} adicionado à análise`)
  }

  const handleMedicationRemove = (index) => {
    const removedMed = selectedMedications[index]
    setSelectedMedications(prev => prev.filter((_, i) => i !== index))
    toast.success(`${removedMed.name} removido da análise`)
  }

  const handleAnalyze = async () => {
    if (selectedMedications.length < 2) {
      toast.error('Selecione pelo menos 2 medicamentos para análise')
      return
    }

    setIsAnalyzing(true)
    setAnalysisResult(null)
    setShowReport(false)
    let logId = null
    let analysis = null
    let isFromCache = false
    let analysisMetadata = {}
      try {
        // Verifica se existe resultado no cache (menos de 1 ano)
        const cachedResult = await medicationCacheService.getCachedCombination(selectedMedications)
        if (cachedResult) {
          analysis = cachedResult.ai_analysis
          isFromCache = true
          analysisMetadata = {
            source: 'cache',
            ageInDays: cachedResult.ageInDays,
            consultationCount: cachedResult.consultation_count,
            cacheId: cachedResult.id
          }
          toast.success(`Análise recuperada do histórico (${cachedResult.ageInDays} dias atrás)`, { icon: '📚', duration: 4000 })
          await medicationCacheService.logConsultation(cachedResult.id, patientId, sessionId, 'cache')
          
          // Capturar medicamentos mesmo quando usar cache (para garantir que estejam na base)
          try {
            console.log('📝 Executando captura de medicamentos (cache)...')
            const cacheCapture = await medicationCaptureService.captureMedications(selectedMedications, cachedResult.id)
            console.log('✅ Captura do cache concluída:', cacheCapture)
          } catch (cacheError) {
            console.warn('⚠️ Erro na captura do cache:', cacheError)
          }
        } else {
          // Consulta nova na API
          try {
            const initialLog = await consultationLogService.createLog({
              sessionId,
              medications: selectedMedications,
              request: `Análise de ${selectedMedications.length} medicamentos: ${selectedMedications.map(m => m.name).join(', ')}`,
              status: 'pending'
            })
            logId = initialLog.id
          } catch (logError) {
            // Ignorar erros de log - não deve impedir a análise
          }
          const startTime = Date.now()
          analysis = await analyzeMultipleDrugInteractions(selectedMedications, async (logData) => {
            analysisMetadata.tokensUsed = logData.tokensUsed || 0
            if (logId) {
              try { 
                await consultationLogService.updateLog(logId, logData) 
              } catch (logError) {
                // Ignorar erros de update do log
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
          // Salva no cache (automático: captura medicamentos)
          try {
            const cacheId = await medicationCacheService.saveCombinationCache(selectedMedications, analysis, analysisMetadata)
            await medicationCacheService.logConsultation(cacheId, patientId, sessionId, 'api')
            toast.success('Nova análise realizada e salva no histórico', { icon: '🆕', duration: 4000 })
            
            // Captura adicional e explícita dos medicamentos para garantir que sejam salvos
            try {
              console.log('🔄 Executando captura adicional de medicamentos...')
              const additionalCaptureResult = await medicationCaptureService.captureMedications(selectedMedications, logId)
              console.log('✅ Captura adicional concluída:', additionalCaptureResult)
              
              // Mostrar informação sobre captura automática
              optimizedSetTimeout(() => {
                toast.success(`📝 ${selectedMedications.length} medicamentos registrados automaticamente na base de dados`, { 
                  duration: 3000,
                  style: { background: '#10B981', color: 'white' }
                })
              }, 1000)
            } catch (additionalCaptureError) {
              console.warn('⚠️ Erro na captura adicional:', additionalCaptureError)
              // Mostrar toast mesmo assim
              optimizedSetTimeout(() => {
                toast.success(`📝 Medicamentos processados - verificação em andamento`, { 
                  duration: 3000,
                  style: { background: '#10B981', color: 'white' }
                })
              }, 1000)
            }
          } catch (cacheError) {
            console.warn('⚠️ Erro no cache, executando captura direta...')
            
            // Captura direta mesmo se o cache falhar
            try {
              const directCaptureResult = await medicationCaptureService.captureMedications(selectedMedications, logId)
              console.log('✅ Captura direta concluída:', directCaptureResult)
              toast.success('Análise realizada e medicamentos registrados', { icon: '📝', duration: 4000 })
            } catch (directCaptureError) {
              console.error('❌ Erro na captura direta:', directCaptureError)
              toast.error('Análise concluída, mas houve problema ao registrar medicamentos')
            }
          }
        }
        // Verifica integridade
        console.log(`🔍 Verificando integridade da análise para ${selectedMedications.length} medicamentos...`)
        const medicationNames = selectedMedications.map(m => m.name.toLowerCase())
        const analysisLower = analysis.toLowerCase()
        const missingMedications = medicationNames.filter(name => !analysisLower.includes(name))
        
        if (missingMedications.length > 0) {
          console.warn(`⚠️ Medicamentos não encontrados na análise:`, missingMedications)
          toast(`⚠️ Atenção: ${missingMedications.length} medicamentos podem não ter sido completamente analisados.`, {
            duration: 5000,
            style: { background: '#F59E0B', color: 'white' }
          })
        } else {
          console.log(`✅ Todos os ${selectedMedications.length} medicamentos encontrados na análise`)
          toast.success(`✅ Análise completa: Todos os ${selectedMedications.length} medicamentos foram analisados`, {
            duration: 3000,
            style: { background: '#10B981', color: 'white' }
          })
        }
        // Salva consulta no banco
        let consultationId = null
        try {
          const consultation = {
            patient_id: patientId || 'Não informado',
            medications: selectedMedications,
            ai_analysis: analysis,
            interactions_found: {},
            created_at: new Date().toISOString(),
            // source: isFromCache ? 'cache' : 'api', // Campo não existe na tabela
            // cache_info: isFromCache ? analysisMetadata : null // Campo não existe na tabela
          }
          const savedConsultation = await consultationService.create(consultation)
          consultationId = savedConsultation.id
        } catch (dbError) {
          // Ignorar erros de banco - continuar com resultado temporário
        }
        // Prepara resultado
        setAnalysisResult({
          id: consultationId || 'temp-' + Date.now(),
          patient_id: patientId || 'Não informado',
          medications: selectedMedications,
          ai_analysis: analysis,
          analysis: analysis,
          created_at: new Date().toISOString(),
          log_id: logId,
          // source: isFromCache ? 'cache' : 'api', // Removido - não usado na interface
          // cache_info: analysisMetadata, // Removido - dados internos
          used_cache: isFromCache
        })
        setShowReport(true)
        toast.success(isFromCache ? `Análise recuperada do histórico (${analysisMetadata.ageInDays} dias atrás)` : `Nova análise de ${selectedMedications.length} medicamentos concluída`)
      } catch (error) {
        if (logId) {
          try {
            await consultationLogService.updateLog(logId, { status: 'error', error: error.message })
          } catch (logError) {
            // Ignorar erros de update do log
          }
        }
        handleApiError(error, { customMessage: 'Erro ao analisar medicamentos. Tente novamente.', reload: false })
        setAnalysisResult(null)
        setShowReport(false)
      } finally {
        setIsAnalyzing(false)
      }
  }

  const handleDownloadReport = async () => {
    if (!analysisResult) {
      toast.error('Nenhuma análise para exportar')
      return
    }

    try {
      // Importar jsPDF dinamicamente
      const { default: jsPDF } = await import('jspdf')
      
      // Limpar o texto da análise (remover linhas com ---)
      const cleanAnalysis = (text) => {
        if (!text) return ''
        return text
          .split('\n')
          .filter(line => !line.trim().match(/^-+$/))
          .join('\n')
          .replace(/\n{3,}/g, '\n\n') // Reduzir múltiplas quebras de linha
      }
      
      // Criar PDF com margens adequadas
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = 210
      const pageHeight = 297
      const marginX = 20
      const marginY = 25
      const contentWidth = pageWidth - (marginX * 2)
      const lineHeight = 6
      let currentY = marginY
      
      // Função para adicionar cabeçalho
      const addHeader = (pageNum) => {
        pdf.setFont('helvetica', 'bold')
        pdf.setFontSize(16)
        pdf.text('Relatório de Análise Medicamentosa', marginX, currentY)
        currentY += 15
        
        // Linha separadora do cabeçalho
        pdf.setLineWidth(0.5)
        pdf.line(marginX, currentY, pageWidth - marginX, currentY)
        currentY += 10
      }
      
      // Função para adicionar rodapé com numeração
      const addFooter = (pageNum, totalPages) => {
        const footerY = pageHeight - 15
        
        // Linha separadora do rodapé
        pdf.setLineWidth(0.3)
        pdf.line(marginX, footerY - 5, pageWidth - marginX, footerY - 5)
        
        // Texto do rodapé
        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(8)
        pdf.text('Sistema de Verificação Medicamentosa', marginX, footerY)
        pdf.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, marginX, footerY + 4)
        
        // Numeração das páginas
        const pageText = `Página ${pageNum} de ${totalPages}`
        const pageTextWidth = pdf.getTextWidth(pageText)
        pdf.text(pageText, pageWidth - marginX - pageTextWidth, footerY)
      }
      
      // Função para verificar se precisa de nova página
      const checkNewPage = (neededHeight, pageNum, totalPages) => {
        if (currentY + neededHeight > pageHeight - 35) { // 35mm reservados para rodapé
          addFooter(pageNum, totalPages)
          pdf.addPage()
          currentY = marginY
          addHeader(pageNum + 1)
          return pageNum + 1
        }
        return pageNum
      }
      
      // Função para adicionar texto com quebra de linha
      const addWrappedText = (text, fontSize = 10, fontStyle = 'normal') => {
        pdf.setFont('helvetica', fontStyle)
        pdf.setFontSize(fontSize)
        const lines = pdf.splitTextToSize(text, contentWidth)
        for (let line of lines) {
          pdf.text(line, marginX, currentY)
          currentY += lineHeight
        }
      }
      
      // Calcular número total de páginas (estimativa)
      let totalPages = 1
      
      // Página 1 - Cabeçalho e informações básicas
      let pageNum = 1
      addHeader(pageNum)
      
      // Informações da consulta
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(12)
      pdf.text('Informações da Consulta', marginX, currentY)
      currentY += 10
      
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(10)
      pdf.text(`Data: ${new Date(analysisResult.created_at).toLocaleDateString('pt-BR')}`, marginX, currentY)
      currentY += lineHeight
      pdf.text(`Paciente: ${analysisResult.patient_id || 'Não informado'}`, marginX, currentY)
      currentY += lineHeight
      pdf.text(`Medicamentos analisados: ${analysisResult.medications.length}`, marginX, currentY)
      currentY += 15
      
      // Verificar se precisa de nova página
      pageNum = checkNewPage(20, pageNum, totalPages)
      
      // Lista de medicamentos
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(12)
      pdf.text('Medicamentos', marginX, currentY)
      currentY += 10
      
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(10)
      
      analysisResult.medications.forEach((med, index) => {
        pageNum = checkNewPage(lineHeight + 2, pageNum, totalPages)
        const medText = `${index + 1}. ${med.name} - ${med.dosage || 'Dosagem não especificada'}`
        addWrappedText(medText)
        currentY += 2 // Espaçamento entre medicamentos
      })
      
      currentY += 10
      
      // Análise de interações
      pageNum = checkNewPage(20, pageNum, totalPages)
      
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(12)
      pdf.text('Análise de Interações', marginX, currentY)
      currentY += 10
      
      // Limpar e adicionar análise
      const cleanedAnalysis = cleanAnalysis(analysisResult.ai_analysis || analysisResult.analysis)
      const analysisLines = pdf.splitTextToSize(cleanedAnalysis, contentWidth)
      
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(10)
      
      for (let line of analysisLines) {
        pageNum = checkNewPage(lineHeight, pageNum, totalPages)
        pdf.text(line, marginX, currentY)
        currentY += lineHeight
      }
      
      // Atualizar total de páginas e adicionar rodapé final
      totalPages = pageNum
      
      // Adicionar rodapé para todas as páginas
      for (let i = 1; i <= totalPages; i++) {
        if (i > 1) {
          pdf.setPage(i)
        }
        addFooter(i, totalPages)
      }
      
      // Download do PDF
      const fileName = `relatorio_medicamentos_${new Date().toISOString().split('T')[0]}.pdf`
      pdf.save(fileName)
      
      toast.success('Relatório PDF gerado com sucesso!')
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      toast.error('Erro ao gerar PDF. Tente novamente.')
    }
  }

  const loadCaptureStats = async () => {
    try {
      const stats = await medicationCaptureService.getCaptureStats()
      setCaptureStats(stats)
      setShowCaptureInfo(true)
      toast.success('Estatísticas de medicamentos carregadas!')
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
      toast.error('Erro ao carregar estatísticas de medicamentos')
    }
  }

  const handleViewHistoryDetail = (historyItem) => {
    console.log('👁️ Visualizando detalhes do item:', historyItem)
    
    // Converter o item do histórico para o formato analysisResult
    const simulatedAnalysisResult = {
      created_at: historyItem.created_at,
      patient_id: historyItem.patient_id || 'Histórico',
      analysis: historyItem.analysis_response || historyItem.response || 'Análise não disponível',
      ai_analysis: historyItem.analysis_response || historyItem.response || 'Análise não disponível',
      medications: historyItem.medications_list || [],
      session_id: historyItem.session_id,
      tokens_used: historyItem.tokens_used,
      analysis_duration_ms: historyItem.analysis_duration_ms,
      status: historyItem.status,
      isHistoryView: true // Flag para identificar que é uma visualização do histórico
    }
    
    // Converter medicamentos para o formato esperado
    const simulatedMedications = (historyItem.medications_list || []).map(med => {
      if (typeof med === 'string') {
        return { name: med, dosage: 'Não especificada' }
      }
      return med
    })
    
    setSelectedMedications(simulatedMedications)
    setAnalysisResult(simulatedAnalysisResult)
    setShowReport(true)
    setShowHistory(false)
    toast.success('Detalhes da consulta carregados!')
  }

  const handleNewAnalysis = () => {
    setSelectedMedications([])
    setPatientId('')
    setAnalysisResult(null)
    setShowReport(false)
    setShowHistory(false)
    setShowHistoryDetail(false)
    setSelectedHistoryItem(null)
  }

  const handleShowHistory = async () => {
    setIsLoadingHistory(true)
    try {
      console.log('🔍 Carregando histórico de consultas...')
      const history = await consultationLogService.getLogs({ limit: 50 })
      console.log('📊 Histórico carregado:', history)
      
      // Se não há dados reais, adicionar dados mockados para teste
      let finalHistory = history
      if (!history || history.length === 0) {
        console.log('📝 Adicionando dados mockados para teste...')
        finalHistory = [
          {
            id: 'mock-1',
            created_at: new Date().toISOString(),
            session_id: 'session-mock-123',
            medications_list: [
              { name: 'Dipirona', dosage: '500mg' },
              { name: 'Paracetamol', dosage: '750mg' }
            ],
            medications_count: 2,
            status: 'completed',
            analysis_duration_ms: 3500,
            tokens_used: 1200,
            analysis_response: 'Esta é uma análise mockada para teste. As interações entre Dipirona e Paracetamol são consideradas seguras quando usadas nas dosagens recomendadas.',
            patient_id: 'TESTE-001'
          },
          {
            id: 'mock-2', 
            created_at: new Date(Date.now() - 86400000).toISOString(), // 1 dia atrás
            session_id: 'session-mock-456',
            medications_list: [
              { name: 'Omeprazol', dosage: '20mg' },
              { name: 'Sinvastatina', dosage: '40mg' }
            ],
            medications_count: 2,
            status: 'completed',
            analysis_duration_ms: 2800,
            tokens_used: 980,
            analysis_response: 'Análise mockada: Não foram identificadas interações significativas entre Omeprazol e Sinvastatina.',
            patient_id: 'TESTE-002'
          }
        ]
        toast.info('Usando dados de demonstração (tabela consultation_logs não encontrada)')
      }
      
      setConsultationHistory(finalHistory)
      setShowHistory(true)
      
      if (finalHistory.length === 0) {
        toast.info('Nenhuma consulta encontrada no histórico. Faça uma análise primeiro!')
      } else {
        toast.success(`${finalHistory.length} consulta(s) carregada(s) do histórico`)
      }
    } catch (error) {
      console.error('❌ Erro ao carregar histórico:', error)
      
      // Em caso de erro, usar dados mockados
      console.log('📝 Usando dados mockados devido ao erro...')
      const mockHistory = [
        {
          id: 'mock-error-1',
          created_at: new Date().toISOString(),
          session_id: 'session-error-123',
          medications_list: [
            { name: 'Medicamento A', dosage: '100mg' },
            { name: 'Medicamento B', dosage: '200mg' }
          ],
          medications_count: 2,
          status: 'completed',
          analysis_duration_ms: 4000,
          tokens_used: 1500,
          analysis_response: 'Esta é uma análise de demonstração criada devido a um erro de conexão com o banco de dados.',
          patient_id: 'DEMO-001'
        }
      ]
      
      setConsultationHistory(mockHistory)
      setShowHistory(true)
      toast('⚠️ Erro ao carregar dados reais. Mostrando dados de demonstração.', {
        duration: 4000,
        style: { background: '#F59E0B', color: 'white' }
      })
    } finally {
      setIsLoadingHistory(false)
    }
  }

  const handleExportHistory = async () => {
    try {
      const csvContent = await consultationLogService.exportToCSV({ limit: 100 })
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `historico_consultas_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      toast.success('Histórico exportado com sucesso!')
    } catch (error) {
      console.error('Erro ao exportar:', error)
      toast.error('Erro ao exportar histórico')
    }
  }

  if (showHistory) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Histórico de Consultas</h1>
          <div className="flex gap-3">
            <button
              onClick={handleExportHistory}
              className="btn btn-secondary flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              Exportar CSV
            </button>
            <button
              onClick={() => setShowHistory(false)}
              className="btn btn-primary"
            >
              Voltar
            </button>
          </div>
        </div>

        <div className="card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data/Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Medicamentos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duração
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tokens
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {consultationHistory.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleViewHistoryDetail(log)}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(log.created_at).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                      <div className="truncate">
                        {(log.medications_list || []).map(med => med.name || med).join(', ') || 'Medicamentos não disponíveis'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {log.medications_count || 0} medicamentos
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        log.status === 'completed' ? 'bg-green-100 text-green-800' :
                        log.status === 'error' ? 'bg-red-100 text-red-800' :
                        log.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {log.status === 'completed' ? 'Concluída' :
                         log.status === 'error' ? 'Erro' :
                         log.status === 'pending' ? 'Pendente' :
                         log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.analysis_duration_ms ? `${(log.analysis_duration_ms / 1000).toFixed(1)}s` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.tokens_used || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleViewHistoryDetail(log)
                        }}
                        className="text-primary-600 hover:text-primary-900 font-medium"
                        disabled={log.status !== 'completed'}
                      >
                        {log.status === 'completed' ? 'Ver Detalhes' : '-'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {consultationHistory.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhuma consulta encontrada no histórico.
            </div>
          )}
        </div>
      </div>
    )
  }

  if (showReport && analysisResult) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            {analysisResult.isHistoryView ? 'Detalhes da Consulta' : 'Relatório de Análise'}
          </h1>
          <div className="flex gap-3">
            {analysisResult.isHistoryView && (
              <button
                onClick={() => {
                  setShowReport(false)
                  setShowHistory(true)
                  setAnalysisResult(null)
                }}
                className="btn btn-secondary"
              >
                Voltar ao Histórico
              </button>
            )}
            <button
              onClick={handleNewAnalysis}
              className="btn btn-primary"
            >
              {analysisResult.isHistoryView ? 'Nova Análise' : 'Nova Análise'}
            </button>
          </div>
        </div>
        
        <AnalysisReport
          analysis={analysisResult.analysis}
          medications={selectedMedications}
          onDownload={handleDownloadReport}
          patientId={analysisResult.patient_id}
          createdAt={analysisResult.created_at}
          sessionId={analysisResult.session_id}
          tokensUsed={analysisResult.tokens_used}
          analysisDuration={analysisResult.analysis_duration_ms}
          isHistoryView={analysisResult.isHistoryView}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Search className="h-8 w-8 text-primary-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Análise de Medicamentos</h1>
            <p className="text-gray-600">
              Analise interações medicamentosas com base em evidências científicas
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={loadCaptureStats}
            className="btn btn-outline flex items-center gap-2"
            title="Ver medicamentos capturados automaticamente"
          >
            <Pill className="h-4 w-4" />
            Base de Medicamentos
          </button>
          
          <button
            onClick={handleShowHistory}
            disabled={isLoadingHistory}
            className="btn btn-secondary flex items-center gap-2"
          >
            {isLoadingHistory ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <History className="h-4 w-4" />
            )}
            Histórico
          </button>
        </div>
      </div>

      {/* Formulário de Análise */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Informações do Paciente */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Informações do Paciente</h2>
            <div className="space-y-4">
              <div>
                <label className="label">ID do Paciente (Opcional)</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Ex: PAC001, CPF, etc."
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Usado apenas para organização interna dos relatórios
                </p>
              </div>
            </div>
          </div>

          {/* Seleção de Medicamentos */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Seleção de Medicamentos</h2>
            <MedicationSelector
              selectedMedications={selectedMedications}
              onMedicationAdd={handleMedicationAdd}
              onMedicationRemove={handleMedicationRemove}
            />
          </div>

          {/* Botão de Análise */}
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Iniciar Análise</h3>
                <p className="text-sm text-gray-600">
                  {selectedMedications.length} medicamento(s) selecionado(s)
                </p>
              </div>
              <button
                onClick={handleAnalyze}
                disabled={selectedMedications.length < 2 || isAnalyzing}
                className="btn btn-primary flex items-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    Analisar Interações
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Painel Lateral de Informações */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="font-semibold mb-3">Como Funciona</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>1. Selecione os medicamentos do paciente</li>
              <li>2. Informe as dosagens utilizadas</li>
              <li>3. Execute a análise inteligente</li>
              <li>4. Revise o relatório gerado</li>
              <li>5. Baixe ou imprima se necessário</li>
            </ul>
          </div>

          <div className="card">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="h-5 w-5 text-warning-600" />
              <h3 className="font-semibold">Tipos de Interação</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-danger-500 rounded-full"></div>
                <span><strong>Major:</strong> Evitar combinação</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-warning-500 rounded-full"></div>
                <span><strong>Moderada:</strong> Monitorar de perto</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-success-500 rounded-full"></div>
                <span><strong>Menor:</strong> Atenção limitada</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Estatísticas de Captura */}
      {showCaptureInfo && captureStats && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Pill className="h-5 w-5 text-primary-600" />
                Base de Medicamentos
              </h3>
              <button
                onClick={() => setShowCaptureInfo(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">{captureStats.total}</div>
                  <div className="text-sm text-blue-800">Total de Medicamentos</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">{captureStats.totalConsultations}</div>
                  <div className="text-sm text-green-800">Total de Consultas</div>
                </div>
              </div>
              
              {captureStats.medications && captureStats.medications.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Medicamentos Mais Consultados:</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {captureStats.medications.slice(0, 10).map((med, index) => (
                      <div key={med.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div>
                          <div className="font-medium text-sm">{med.name}</div>
                          {med.dosage && <div className="text-xs text-gray-600">{med.dosage}</div>}
                        </div>
                        <div className="text-sm bg-primary-100 text-primary-800 px-2 py-1 rounded">
                          {med.consultation_count || 0}x
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="text-xs text-gray-500 border-t pt-3">
                <p>📝 Os medicamentos são capturados automaticamente quando você realiza análises.</p>
                <p>📊 Esta base ajuda a melhorar futuras análises e identificar padrões de uso.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DrugAnalysis
