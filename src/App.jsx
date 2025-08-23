import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom'
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
import TailwindTest from './components/TailwindTest'

// Layout wrapper component for all routes
function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Layout>
        <Outlet />
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
  )
}

// Router configuration with v7 future flags
const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <Home />
      },
      {
        path: "drug-analysis",
        element: <DrugAnalysis />
      },
      {
        path: "drug-interactions", 
        element: <DrugInteractions />
      },
      {
        path: "reports",
        element: <Reports />
      },
      {
        path: "drug-database",
        element: <DrugDatabase />
      },
      {
        path: "privacidade",
        element: <PrivacyPolicy />
      },
      {
        path: "privacy-policy",
        element: <PrivacyPolicy />
      },
      {
        path: "termos",
        element: <TermsOfService />
      },
      {
        path: "terms-of-service", 
        element: <TermsOfService />
      },
      {
        path: "tailwind-test",
        element: <TailwindTest />
      },
      {
        path: "404",
        element: <NotFound />
      },
      {
        path: "*",
        element: <NotFound />
      }
    ]
  }
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
})

function App() {
  return (
    <HelmetProvider>
      <ErrorBoundary>
        <RouterProvider router={router} />
      </ErrorBoundary>
    </HelmetProvider>
  )
}

export default App
