import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Home, RefreshCw, AlertTriangle, ArrowLeft, Search } from 'lucide-react'
import toast from 'react-hot-toast'

const NotFound = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [countdown, setCountdown] = useState(10)
  const [isReloading, setIsReloading] = useState(false)

  useEffect(() => {
    // Verificar se a página existe mas houve erro temporário
    const checkPageExists = async () => {
      try {
        // Lista de rotas válidas conhecidas
        const validRoutes = [
          '/',
          '/drug-analysis',
          '/drug-interactions', 
          '/reports',
          '/drug-database',
          '/api-test',
          '/privacy-policy',
          '/privacidade',
          '/terms-of-service',
          '/termos'
        ]

        const currentPath = location.pathname
        
        // Se é uma rota válida que chegou aqui por erro de refresh, redirecionar imediatamente
        if (validRoutes.includes(currentPath)) {
          console.log('🔄 Rota válida detectada após refresh, redirecionando...')
          // Redirecionar imediatamente sem mostrar 404
          navigate(currentPath, { replace: true })
          return
        }

        // Verificar se é uma rota similar (typo comum)
        const similarRoute = validRoutes.find(route => {
          const similarity = calculateSimilarity(currentPath.toLowerCase(), route.toLowerCase())
          return similarity > 0.7
        })

        if (similarRoute) {
          console.log(`🔍 Rota similar encontrada: ${similarRoute}`)
          toast.success(`Redirecionando para: ${similarRoute}`)
          setTimeout(() => {
            navigate(similarRoute, { replace: true })
          }, 1500)
          return
        }

        // Se não é rota válida, iniciar countdown para home
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer)
              navigate('/', { replace: true })
              toast.success('Redirecionado para a página inicial')
              return 0
            }
            return prev - 1
          })
        }, 1000)

        return () => clearInterval(timer)
      } catch (error) {
        console.error('Erro ao verificar página:', error)
        // Em caso de erro, redirecionar para home
        setTimeout(() => {
          navigate('/', { replace: true })
        }, 3000)
      }
    }

    checkPageExists()
  }, [location.pathname, navigate])

  // Função para calcular similaridade entre strings
  const calculateSimilarity = (str1, str2) => {
    const longer = str1.length > str2.length ? str1 : str2
    const shorter = str1.length > str2.length ? str2 : str1
    
    if (longer.length === 0) return 1.0
    
    const distance = levenshteinDistance(longer, shorter)
    return (longer.length - distance) / longer.length
  }

  // Função para calcular distância de Levenshtein
  const levenshteinDistance = (str1, str2) => {
    const matrix = []
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i]
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          )
        }
      }
    }
    
    return matrix[str2.length][str1.length]
  }

  const handleReload = () => {
    setIsReloading(true)
    window.location.reload()
  }

  const handleGoHome = () => {
    navigate('/', { replace: true })
    toast.success('Redirecionado para a página inicial')
  }

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      handleGoHome()
    }
  }

  // Se está recarregando, mostrar tela de loading
  if (isReloading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 text-primary-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Recarregando página...
          </h2>
          <p className="text-gray-600">
            Tentando carregar a página novamente
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Ícone de erro */}
        <div className="mb-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Página não encontrada
          </h2>
        </div>

        {/* Informações sobre a página */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600 mb-2">
            <strong>URL solicitada:</strong>
          </p>
          <code className="text-xs bg-gray-200 px-2 py-1 rounded break-all">
            {location.pathname}
          </code>
        </div>

        {/* Mensagem de redirecionamento automático */}
        {countdown > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800 text-sm">
              <Search className="w-4 h-4 inline mr-2" />
              Redirecionando para a página inicial em{' '}
              <span className="font-bold text-blue-900">{countdown}</span> segundos...
            </p>
          </div>
        )}

        {/* Descrição do problema */}
        <p className="text-gray-600 mb-8">
          A página que você está procurando pode ter sido movida, removida ou não existe.
          Você pode tentar recarregar a página ou voltar para a página inicial.
        </p>

        {/* Botões de ação */}
        <div className="space-y-3">
          <button
            onClick={handleReload}
            className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Recarregar Página
          </button>

          <button
            onClick={handleGoHome}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Ir para Página Inicial
          </button>

          <button
            onClick={handleGoBack}
            className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
        </div>

        {/* Links úteis */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-3">Páginas úteis:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => navigate('/drug-analysis')}
              className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 transition-colors"
            >
              Análise de Medicamentos
            </button>
            <button
              onClick={() => navigate('/reports')}
              className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 transition-colors"
            >
              Relatórios
            </button>
            <button
              onClick={() => navigate('/drug-database')}
              className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 transition-colors"
            >
              Base de Medicamentos
            </button>
          </div>
        </div>

        {/* Informações de desenvolvimento */}
        <div className="mt-6 text-xs text-gray-400">
          Portal de Verificação Medicamentosa v1.0
        </div>
      </div>
    </div>
  )
}

export default NotFound
