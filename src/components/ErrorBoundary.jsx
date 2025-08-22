import React from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import toast from 'react-hot-toast'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      isReloading: false
    }
  }

  static getDerivedStateFromError(error) {
    // Atualiza o state para mostrar a UI de fallback na próxima renderização
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // Salva os detalhes do erro
    this.setState({
      error: error,
      errorInfo: errorInfo
    })

    // Log do erro para debugging
    console.error('🚨 Error Boundary capturou um erro:', error, errorInfo)

    // Verificar se é erro de rota/navegação
    if (error.message.includes('404') || 
        error.message.includes('not found') || 
        error.message.includes('Cannot resolve') ||
        errorInfo.componentStack.includes('Router')) {
      
      console.log('🔄 Erro de navegação detectado, tentando recarregar...')
      this.handleReload()
    }
  }

  handleReload = () => {
    this.setState({ isReloading: true })
    
    setTimeout(() => {
      try {
        window.location.reload()
      } catch (reloadError) {
        console.error('Erro ao recarregar:', reloadError)
        this.handleGoHome()
      }
    }, 1000)
  }

  handleGoHome = () => {
    try {
      window.location.href = '/'
      toast.success('Redirecionado para a página inicial')
    } catch (error) {
      console.error('Erro ao ir para home:', error)
      // Como último recurso, forçar reload da página raiz
      window.location.replace('/')
    }
  }

  handleTryAgain = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      isReloading: false 
    })
  }

  render() {
    if (this.state.hasError) {
      // Se está recarregando
      if (this.state.isReloading) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="text-center">
              <RefreshCw className="h-12 w-12 text-primary-600 animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Recarregando aplicação...
              </h2>
              <p className="text-gray-600">
                Corrigindo erro de navegação
              </p>
            </div>
          </div>
        )
      }

      // UI de fallback customizada
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 px-4">
          <div className="max-w-lg w-full bg-white rounded-lg shadow-lg p-8 text-center">
            {/* Ícone de erro */}
            <div className="mb-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-10 h-10 text-red-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Oops! Algo deu errado
              </h1>
              <p className="text-gray-600">
                Ocorreu um erro inesperado na aplicação
              </p>
            </div>

            {/* Detalhes do erro (apenas em desenvolvimento) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-gray-800 mb-2">Detalhes do erro:</h3>
                <p className="text-xs text-red-600 font-mono mb-2">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo.componentStack && (
                  <details className="text-xs text-gray-600">
                    <summary className="cursor-pointer hover:text-gray-800">
                      Stack trace (clique para expandir)
                    </summary>
                    <pre className="mt-2 whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {/* Mensagem amigável */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800 text-sm">
                Não se preocupe! Você pode tentar recarregar a página ou voltar para a página inicial.
                Se o problema persistir, entre em contato com o suporte.
              </p>
            </div>

            {/* Botões de ação */}
            <div className="space-y-3">
              <button
                onClick={this.handleReload}
                className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Recarregar Página
              </button>

              <button
                onClick={this.handleGoHome}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                Ir para Página Inicial
              </button>

              <button
                onClick={this.handleTryAgain}
                className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                Tentar Novamente
              </button>
            </div>

            {/* Informações de contato */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Se o problema persistir, reporte o erro:
              </p>
              <div className="mt-2 space-y-1">
                <p className="text-xs text-gray-400">
                  Horário: {new Date().toLocaleString()}
                </p>
                <p className="text-xs text-gray-400">
                  URL: {window.location.href}
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    }

    // Se não há erro, renderiza os children normalmente
    return this.props.children
  }
}

export default ErrorBoundary
