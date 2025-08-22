import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ErrorBoundary from './components/ErrorBoundary'
import SEO from './components/SEO'

// Lazy loading dos componentes para melhor performance
const Home = lazy(() => import('./pages/Home'))
const DrugInteractions = lazy(() => import('./pages/DrugInteractions'))
const DrugDatabase = lazy(() => import('./pages/DrugDatabase'))
const DrugAnalysisRefactored = lazy(() => import('./pages/DrugAnalysisRefactored'))
const ReportsRefactored = lazy(() => import('./pages/ReportsRefactored'))
const APITestPage = lazy(() => import('./pages/APITestPage'))
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'))
const TermsOfService = lazy(() => import('./pages/TermsOfService'))
const NotFound = lazy(() => import('./pages/NotFound'))

// Componente de Loading
function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Carregando Portal
            </h3>
            <p className="text-gray-600 text-sm">
              Preparando a interface de verificação medicamentosa...
            </p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '75%' }}></div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Componente principal refatorado
function AppRefactored() {
  return (
    <ErrorBoundary>
      <Router>
        <SEO />
        <div className="App">
          <Layout>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                {/* Página Inicial */}
                <Route 
                  path="/" 
                  element={<Home />} 
                />
                
                {/* Análise de Medicamentos - Versão Refatorada */}
                <Route 
                  path="/analise" 
                  element={<DrugAnalysisRefactored />} 
                />
                
                {/* Relatórios - Versão Refatorada */}
                <Route 
                  path="/relatorios" 
                  element={<ReportsRefactored />} 
                />
                
                {/* Interações Medicamentosas */}
                <Route 
                  path="/interacoes" 
                  element={<DrugInteractions />} 
                />
                
                {/* Base de Dados de Medicamentos */}
                <Route 
                  path="/base-dados" 
                  element={<DrugDatabase />} 
                />
                
                {/* Teste de API */}
                <Route 
                  path="/teste-api" 
                  element={<APITestPage />} 
                />
                
                {/* Política de Privacidade */}
                <Route 
                  path="/privacidade" 
                  element={<PrivacyPolicy />} 
                />
                
                {/* Termos de Serviço */}
                <Route 
                  path="/termos" 
                  element={<TermsOfService />} 
                />
                
                {/* Rota 404 - Página Não Encontrada */}
                <Route 
                  path="*" 
                  element={<NotFound />} 
                />
              </Routes>
            </Suspense>
          </Layout>
        </div>
      </Router>
    </ErrorBoundary>
  )
}

export default AppRefactored
