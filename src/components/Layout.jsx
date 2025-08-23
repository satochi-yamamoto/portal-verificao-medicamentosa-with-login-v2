import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { 
  Home, 
  Search, 
  AlertTriangle, 
  FileText, 
  Database,
  Pill,
  Menu,
  X,
  Loader2
} from 'lucide-react'
import Footer from './Footer'
import { useRouterMonitoring } from '../hooks/useRouterMonitoring'

const Layout = ({ children }) => {
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { isNavigating } = useRouterMonitoring()

  const navigation = [
    { name: 'Início', href: '/', icon: Home },
    { name: 'Análise de Medicamentos', href: '/drug-analysis', icon: Search },
    { name: 'Interações Medicamentosas', href: '/drug-interactions', icon: AlertTriangle },
    { name: 'Base de Medicamentos', href: '/drug-database', icon: Database },
    { name: 'Relatórios', href: '/reports', icon: FileText },
  ]

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <div className="flex items-center">
              <Pill className="h-6 w-6 sm:h-8 sm:w-8 text-primary-600" />
              <h1 className="ml-2 sm:ml-3 text-base sm:text-xl font-bold text-gray-900 truncate">
                <span className="hidden sm:inline">Portal de Verificação Medicamentosa</span>
                <span className="sm:hidden">Portal Medicamentoso</span>
              </h1>
            </div>
            
            {/* Mobile menu button */}
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
            
            {/* Desktop subtitle */}
            <div className="hidden lg:block text-sm text-gray-500">
              Farmácia Clínica - Sistema de Análise de Interações
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 relative">
        {/* Desktop Sidebar */}
        <nav className="hidden lg:block w-64 bg-white shadow-sm">
          <div className="p-4">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.href
                
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={`flex items-center p-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-600'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      <span className="text-sm">{item.name}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </nav>

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 flex">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={closeMobileMenu} />
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  onClick={closeMobileMenu}
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                >
                  <X className="h-6 w-6 text-white" />
                </button>
              </div>
              <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                <div className="flex-shrink-0 flex items-center px-4">
                  <Pill className="h-8 w-8 text-primary-600" />
                  <span className="ml-2 text-lg font-bold text-gray-900">Portal Medicamentoso</span>
                </div>
                <nav className="mt-5 px-2 space-y-1">
                  {navigation.map((item) => {
                    const Icon = item.icon
                    const isActive = location.pathname === item.href
                    
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={closeMobileMenu}
                        className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                          isActive
                            ? 'bg-primary-100 text-primary-900'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <Icon className="mr-4 h-6 w-6" />
                        {item.name}
                      </Link>
                    )
                  })}
                </nav>
              </div>
            </div>
          </div>
        )}

        {/* Main content */}
        <main className={`flex-1 p-4 sm:p-6 lg:p-6 overflow-x-hidden transition-opacity duration-200 ${
          isNavigating ? 'opacity-70' : 'opacity-100'
        }`}>
          {isNavigating && (
            <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-white shadow-lg rounded-lg px-3 py-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary-600" />
              <span className="text-sm text-gray-600">Carregando...</span>
            </div>
          )}
          {children}
        </main>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  )
}

export default Layout
