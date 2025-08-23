import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { optimizedSetTimeout, debounce } from '../utils/performance'
import { isOnline, waitForOnline, handleFetchError } from '../utils/fetchUtils'

export const useErrorHandler = () => {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Lista de rotas válidas
    const validRoutes = [
      '/',
      '/drug-analysis',
      '/drug-interactions', 
      '/reports',
      '/drug-database',
      '/api-test',
      '/privacy-policy',
      '/terms-of-service'
    ]

    // Função para detectar se é uma rota válida
    const isValidRoute = (pathname) => {
      return validRoutes.includes(pathname) || pathname.startsWith('/api-test')
    }

    // Função para lidar com erros de navegação
    const handleNavigationError = (error) => {
      console.warn('🚨 Erro de navegação detectado:', error)
      
      // Se a rota atual não é válida, redirecionar para 404
      if (!isValidRoute(location.pathname)) {
        navigate('/404', { replace: true })
        return
      }

      // Se é uma rota válida mas deu erro, tentar recarregar
      toast.error('Erro de navegação. Recarregando...', { duration: 2000 })
      optimizedSetTimeout(() => {
        window.location.reload()
      }, 2000)
    }

    // Listener para erros de navegação
    const handlePopState = (event) => {
      try {
        const currentPath = window.location.pathname
        if (!isValidRoute(currentPath)) {
          navigate('/404', { replace: true })
        }
      } catch (error) {
        handleNavigationError(error)
      }
    }

    // Listener para erros gerais do window
    const handleWindowError = (event) => {
      // Verificar se é erro relacionado a navegação/roteamento
      if (event.error && (
        event.error.message.includes('Loading chunk') ||
        event.error.message.includes('Loading CSS chunk') ||
        event.error.message.includes('Failed to fetch') ||
        event.error.message.includes('NetworkError')
      )) {
        const errorInfo = handleFetchError(event.error, { showToast: false });
        
        if (!isOnline()) {
          toast.error('Sem conexão com a internet. Aguardando reconexão...', { duration: 5000 })
          waitForOnline().then(() => {
            toast.success('Conexão restaurada. Recarregando...', { duration: 2000 })
            optimizedSetTimeout(() => window.location.reload(), 1000)
          })
        } else {
          console.warn('🔄 Erro de carregamento detectado, recarregando...', errorInfo)
          toast.loading('Recarregando recursos...', { duration: 2000 })
          optimizedSetTimeout(() => {
            window.location.reload()
          }, 2000)
        }
      }
    }

    // Listener para erros de resources não encontrados
    const handleResourceError = (event) => {
      if (event.target && (event.target.tagName === 'SCRIPT' || event.target.tagName === 'LINK')) {
        console.warn('🚨 Recurso não encontrado:', event.target.src || event.target.href)
        toast.error('Erro ao carregar recursos. Recarregando...', { duration: 2000 })
        optimizedSetTimeout(() => {
          window.location.reload()
        }, 2000)
      }
    }

    // Adicionar listeners
    window.addEventListener('popstate', handlePopState)
    window.addEventListener('error', handleWindowError)
    window.addEventListener('error', handleResourceError, true) // Capture phase

    // Cleanup
    return () => {
      window.removeEventListener('popstate', handlePopState)
      window.removeEventListener('error', handleWindowError)
      window.removeEventListener('error', handleResourceError, true)
    }
  }, [navigate, location.pathname])

  // Função para verificar conectividade
  const checkConnectivity = async () => {
    try {
      // Check connectivity using a public endpoint instead of non-existent /api/health
      const response = await fetch('https://httpstat.us/200', { 
        method: 'HEAD', 
        mode: 'no-cors',
        cache: 'no-cache'
      })
      return true
    } catch {
      // Fallback: check if we can reach our own domain
      try {
        await fetch(window.location.origin, { method: 'HEAD', cache: 'no-cache' })
        return true
      } catch {
        return false
      }
    }
  }

  // Função para lidar com erros de API
  const handleApiError = (error, options = {}) => {
    const { 
      retry = false, 
      redirectToHome = false, 
      reload = false,
      customMessage = null 
    } = options

    console.error('🚨 Erro de API:', error)

    // Verificar tipo de erro
    if (error.status === 404) {
      if (reload) {
        toast.error('Recurso não encontrado. Recarregando...', { duration: 2000 })
        optimizedSetTimeout(() => window.location.reload(), 2000)
      } else if (redirectToHome) {
        toast.error('Recurso não encontrado. Redirecionando...', { duration: 2000 })
        optimizedSetTimeout(() => navigate('/', { replace: true }), 2000)
      } else {
        navigate('/404', { replace: true })
      }
      return
    }

    if (error.status === 500 || error.status >= 500) {
      toast.error(customMessage || 'Erro interno do servidor. Tente novamente.', { duration: 4000 })
      if (retry) {
        optimizedSetTimeout(() => window.location.reload(), 3000)
      }
      return
    }

    if (error.name === 'NetworkError' || error.message.includes('fetch')) {
      toast.error('Erro de conexão. Verificando conectividade...', { duration: 3000 })
      checkConnectivity().then(isOnline => {
        if (!isOnline) {
          toast.error('Sem conexão com a internet. Verifique sua rede.', { duration: 5000 })
        } else if (reload) {
          optimizedSetTimeout(() => window.location.reload(), 2000)
        }
      })
      return
    }

    // Erro genérico
    toast.error(customMessage || 'Ocorreu um erro inesperado.', { duration: 3000 })
  }

  return {
    handleApiError,
    checkConnectivity
  }
}

export default useErrorHandler
