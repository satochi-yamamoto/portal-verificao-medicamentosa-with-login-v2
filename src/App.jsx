import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { HelmetProvider } from 'react-helmet-async'
import Layout from './components/Layout'
import ErrorBoundary from './components/ErrorBoundary'
import CookieConsent from './components/CookieConsent'
import Home from './pages/Home'
import DrugAnalysis from './pages/DrugAnalysis'
import DrugInteractions from './pages/DrugInteractions'
import Reports from './pages/Reports'
import DrugDatabase from './pages/DrugDatabase'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfService from './pages/TermsOfService'
import NotFound from './pages/NotFound'

function App() {
  return (
    <HelmetProvider>
      <ErrorBoundary>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/drug-analysis" element={<DrugAnalysis />} />
                <Route path="/drug-interactions" element={<DrugInteractions />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/drug-database" element={<DrugDatabase />} />
                <Route path="/privacidade" element={<PrivacyPolicy />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/termos" element={<TermsOfService />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                {/* Rota catch-all para páginas não encontradas */}
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
              }}
            />
            <CookieConsent />
          </div>
        </Router>
      </ErrorBoundary>
    </HelmetProvider>
  )
}

export default App
