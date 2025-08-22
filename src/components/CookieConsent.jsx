import { useState, useEffect } from 'react'

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false)
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false
  })

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      setShowBanner(true)
    } else {
      const savedPreferences = JSON.parse(consent)
      setPreferences(savedPreferences)
      // Ativar analytics se consentido
      if (savedPreferences.analytics && window.gtag) {
        window.gtag('consent', 'update', {
          'analytics_storage': 'granted'
        })
      }
    }
  }, [])

  const acceptAll = () => {
    const allConsent = {
      necessary: true,
      analytics: true,
      marketing: false // Marketing disabled for medical content
    }
    setPreferences(allConsent)
    localStorage.setItem('cookie-consent', JSON.stringify(allConsent))
    setShowBanner(false)
    
    // Ativar analytics
    if (window.gtag) {
      window.gtag('consent', 'update', {
        'analytics_storage': 'granted'
      })
    }
  }

  const acceptNecessary = () => {
    const necessaryOnly = {
      necessary: true,
      analytics: false,
      marketing: false
    }
    setPreferences(necessaryOnly)
    localStorage.setItem('cookie-consent', JSON.stringify(necessaryOnly))
    setShowBanner(false)
  }

  const savePreferences = () => {
    localStorage.setItem('cookie-consent', JSON.stringify(preferences))
    setShowBanner(false)
    
    if (preferences.analytics && window.gtag) {
      window.gtag('consent', 'update', {
        'analytics_storage': 'granted'
      })
    }
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-blue-600 shadow-lg z-50">
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              🍪 Consentimento de Cookies - LGPD
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Este site usa cookies para melhorar sua experiência e fornecer análises anônimas. 
              Respeitamos sua privacidade conforme a Lei Geral de Proteção de Dados (LGPD).
            </p>
            
            <div className="space-y-2 mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferences.necessary}
                  disabled
                  className="mr-2"
                />
                <span className="text-sm">
                  <strong>Cookies Necessários</strong> - Essenciais para funcionamento básico
                </span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={(e) => setPreferences(prev => ({
                    ...prev,
                    analytics: e.target.checked
                  }))}
                  className="mr-2"
                />
                <span className="text-sm">
                  <strong>Cookies Analíticos</strong> - Dados anônimos para melhorias (Google Analytics)
                </span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferences.marketing}
                  disabled
                  className="mr-2"
                />
                <span className="text-sm text-gray-500">
                  <strong>Cookies de Marketing</strong> - Desabilitado para conteúdo médico
                </span>
              </label>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 lg:ml-4">
            <button
              onClick={acceptNecessary}
              className="px-4 py-2 text-sm bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
            >
              Apenas Necessários
            </button>
            <button
              onClick={savePreferences}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Salvar Preferências
            </button>
            <button
              onClick={acceptAll}
              className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              Aceitar Analytics
            </button>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Saiba mais em nossa{' '}
            <a href="/privacidade" className="text-blue-600 hover:underline">
              Política de Privacidade
            </a>
            {' '}e{' '}
            <a href="/termos" className="text-blue-600 hover:underline">
              Termos de Uso
            </a>
            . Seus dados são tratados com segurança conforme LGPD.
          </p>
        </div>
      </div>
    </div>
  )
}

export default CookieConsent
