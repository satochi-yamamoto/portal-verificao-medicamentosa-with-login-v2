import { Component } from 'react'
import { AlertTriangle } from 'lucide-react'

class MarkdownErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Markdown Error:', error, errorInfo)
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI with original content as backup
      const fallbackContent = this.props.fallback || 
        (typeof this.props.children === 'string' ? this.props.children : 'Conteúdo indisponível')

      return (
        <div className="markdown-error-fallback p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h3 className="text-lg font-semibold text-red-800">
              Erro ao renderizar conteúdo Markdown
            </h3>
          </div>
          
          <div className="text-red-700 mb-4">
            Ocorreu um erro ao processar o conteúdo formatado. O texto bruto é exibido abaixo:
          </div>

          <div className="bg-white p-3 border rounded text-sm font-mono text-gray-800 whitespace-pre-wrap max-h-64 overflow-y-auto">
            {fallbackContent}
          </div>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mt-4">
              <summary className="cursor-pointer text-red-600 font-medium">
                Detalhes técnicos (desenvolvimento)
              </summary>
              <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono text-gray-700">
                <div className="text-red-600 font-bold">Error:</div>
                <div className="mb-2">{this.state.error && this.state.error.toString()}</div>
                <div className="text-red-600 font-bold">Stack Trace:</div>
                <div className="whitespace-pre-wrap">{this.state.errorInfo.componentStack}</div>
              </div>
            </details>
          )}
        </div>
      )
    }

    return this.props.children
  }
}

export default MarkdownErrorBoundary