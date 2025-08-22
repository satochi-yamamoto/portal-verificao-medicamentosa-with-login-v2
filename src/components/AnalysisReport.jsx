import { FileText, Download, Calendar, User } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

const AnalysisReport = ({ 
  analysis, 
  medications, 
  onDownload, 
  patientId,
  createdAt,
  sessionId,
  tokensUsed,
  analysisDuration,
  isHistoryView = false
}) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const extractSources = (analysisText) => {
    // Regex simples para extrair referências do texto
    const sourceRegex = /(DOI:\s*[^\s]+|https?:\/\/[^\s]+|\d{4}[^\n]*\.[^\n]*)/gi
    return analysisText.match(sourceRegex) || []
  }

  const sources = extractSources(analysis)

  return (
    <div className="max-w-4xl mx-auto">
      {/* Cabeçalho do Relatório */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-primary-600" />
            <h2 className="text-xl font-bold text-gray-900">
              Relatório de Análise Medicamentosa
            </h2>
          </div>
          <button
            onClick={onDownload}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Baixar PDF
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">Data da Análise:</span>
            <span className="font-medium">
              {formatDate(createdAt || new Date())}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">Farmacêutico:</span>
            <span className="font-medium">Sistema IA + Revisão Clínica</span>
          </div>
        </div>
      </div>

      {/* Medicamentos Analisados */}
      <div className="card mb-6">
        <h3 className="text-lg font-semibold mb-3">Medicamentos Analisados</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {medications.map((med, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">{med.name}</span>
              <span className="text-sm text-gray-600">{med.dosage || 'Dosagem não especificada'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Informações Técnicas (apenas para visualização de histórico) */}
      {isHistoryView && (
        <div className="card mb-6">
          <h3 className="text-lg font-semibold mb-3">Informações Técnicas da Consulta</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            {patientId && (
              <div>
                <span className="font-medium text-gray-600">ID do Paciente:</span>
                <div className="text-gray-900">{patientId}</div>
              </div>
            )}
            {analysisDuration && (
              <div>
                <span className="font-medium text-gray-600">Duração da Análise:</span>
                <div className="text-gray-900">{(analysisDuration / 1000).toFixed(1)}s</div>
              </div>
            )}
            {tokensUsed && (
              <div>
                <span className="font-medium text-gray-600">Tokens Utilizados:</span>
                <div className="text-gray-900">{tokensUsed}</div>
              </div>
            )}
            {sessionId && (
              <div className="md:col-span-3">
                <span className="font-medium text-gray-600">Session ID:</span>
                <div className="text-gray-900 font-mono text-xs break-all">{sessionId}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Análise Detalhada */}
      <div className="card mb-6">
        <h3 className="text-lg font-semibold mb-3">Análise Farmacêutica</h3>
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown 
            className="text-gray-700 leading-relaxed"
            components={{
              h1: ({children}) => <h1 className="text-2xl font-bold text-gray-900 mt-6 mb-4">{children}</h1>,
              h2: ({children}) => <h2 className="text-xl font-bold text-primary-700 mt-6 mb-3">{children}</h2>,
              h3: ({children}) => <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">{children}</h3>,
              p: ({children}) => <p className="mb-3 text-gray-700">{children}</p>,
              ul: ({children}) => <ul className="mb-3 pl-5 space-y-1">{children}</ul>,
              li: ({children}) => <li className="text-gray-700">{children}</li>,
              strong: ({children}) => <strong className="font-semibold text-gray-900">{children}</strong>,
              em: ({children}) => <em className="italic text-primary-600">{children}</em>,
              hr: () => <hr className="my-4 border-gray-300" />,
              blockquote: ({children}) => <blockquote className="border-l-4 border-primary-200 pl-4 italic text-gray-600 my-3">{children}</blockquote>
            }}
          >
            {analysis}
          </ReactMarkdown>
        </div>
      </div>

      {/* Fontes Científicas */}
      {sources.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-3">Fontes Científicas Consultadas</h3>
          <ul className="space-y-2">
            {sources.map((source, index) => (
              <li key={index} className="text-sm">
                <span className="inline-block w-6 h-6 bg-primary-100 text-primary-600 rounded-full text-xs font-medium text-center leading-6 mr-2">
                  {index + 1}
                </span>
                <span className="text-gray-700">{source}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>Importante:</strong> Este relatório é gerado por inteligência artificial e deve ser sempre
          revisado por um farmacêutico clínico qualificado. As recomendações apresentadas não substituem
          o julgamento clínico profissional e devem ser consideradas no contexto completo do paciente.
        </p>
      </div>
    </div>
  )
}

export default AnalysisReport
