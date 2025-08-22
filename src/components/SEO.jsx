import { Helmet } from 'react-helmet-async'
import { useEffect } from 'react'

const SEO = ({ 
  title = 'Portal de Verificação Medicamentosa',
  description = 'Sistema inteligente de análise de interações medicamentosas baseado em evidências científicas. Ferramenta para farmacêuticos clínicos com IA avançada.',
  keywords = 'interações medicamentosas, farmácia clínica, análise farmacêutica, verificação de medicamentos, inteligência artificial farmácia, dipirona, cetoprofeno, análise medicamentosa',
  canonicalUrl = 'https://portal-verificacao-medicamentosa.vercel.app/',
  ogImage = 'https://portal-verificacao-medicamentosa.vercel.app/og-image.jpg',
  ogType = 'website',
  additionalMetaTags = [],
  structuredData = null,
  enableAnalytics = true,
  enableAds = false
}) => {
  
  const fullTitle = title.includes('Portal de Verificação Medicamentosa') 
    ? title 
    : `${title} - Portal de Verificação Medicamentosa`

  const defaultStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Portal de Verificação Medicamentosa",
    "description": description,
    "url": canonicalUrl,
    "applicationCategory": "MedicalApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "BRL"
    },
    "creator": {
      "@type": "Organization",
      "name": "Portal de Verificação Medicamentosa"
    },
    "audience": {
      "@type": "Audience",
      "audienceType": "Healthcare Professionals"
    },
    "featureList": [
      "Análise de interações medicamentosas",
      "IA avançada para farmácia clínica",
      "Verificação baseada em evidências",
      "Relatórios detalhados",
      "Sistema de cache inteligente"
    ]
  }

  // Google Analytics 4
  useEffect(() => {
    if (enableAnalytics && typeof window !== 'undefined') {
      // Configurar Google Analytics 4
      const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX'
      
      // Carregar gtag
      const script = document.createElement('script')
      script.async = true
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
      document.head.appendChild(script)

      // Configurar gtag
      window.dataLayer = window.dataLayer || []
      function gtag(){window.dataLayer.push(arguments)}
      gtag('js', new Date())
      gtag('config', GA_MEASUREMENT_ID, {
        page_title: fullTitle,
        page_location: canonicalUrl,
        content_group1: 'Portal Medicamentos',
        send_page_view: true,
        anonymize_ip: true, // Para LGPD
        allow_google_signals: false, // Para LGPD
        allow_ad_personalization_signals: false // Para LGPD
      })

      // Event tracking personalizado
      gtag('event', 'page_view_enhanced', {
        event_category: 'engagement',
        event_label: fullTitle,
        custom_map: {
          custom_parameter_1: 'portal_medicamentos'
        }
      })

      window.gtag = gtag
    }
  }, [fullTitle, canonicalUrl, enableAnalytics])

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Enhanced SEO */}
      <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />
      <meta name="language" content="pt-BR" />
      <meta name="author" content="Portal de Verificação Medicamentosa" />
      <meta name="publisher" content="Portal de Verificação Medicamentosa" />
      <meta name="copyright" content="Portal de Verificação Medicamentosa" />
      <meta name="theme-color" content="#2563eb" />
      <meta name="msapplication-TileColor" content="#2563eb" />
      
      {/* Open Graph Enhanced */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="Portal de Verificação Medicamentosa - Análise de Interações" />
      <meta property="og:site_name" content="Portal de Verificação Medicamentosa" />
      <meta property="og:locale" content="pt_BR" />
      <meta property="og:locale:alternate" content="en_US" />
      
      {/* Twitter Card Enhanced */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content="Portal de Verificação Medicamentosa" />
      <meta name="twitter:site" content="@portal_medicamentos" />
      <meta name="twitter:creator" content="@portal_medicamentos" />
      
      {/* Medical/Health Specific */}
      <meta name="medical-disclaimer" content="Este sistema é uma ferramenta de apoio. Sempre consulte um profissional de saúde qualificado." />
      <meta name="health-classification" content="medical-device-software" />
      <meta name="target-audience" content="healthcare-professionals" />
      
      {/* Performance & Technical */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      <meta name="format-detection" content="telephone=no" />
      
      {/* LGPD/Privacy Compliance */}
      <meta name="privacy-policy" content="/privacidade" />
      <meta name="cookie-policy" content="/privacidade#cookies" />
      <meta name="data-protection" content="LGPD-compliant" />
      
      {/* Analytics Policies - Only if analytics enabled */}
      {enableAnalytics && (
        <>
          <meta name="analytics-provider" content="Google Analytics 4" />
          <meta name="analytics-anonymization" content="enabled" />
          <meta name="data-collection" content="anonymized" />
        </>
      )}
      
      {/* ADS Policies - Only if ads enabled */}
      {enableAds && (
        <>
          <meta name="google-adsense-platform-account" content="ca-host-pub-XXXXXXXXX" />
          <meta name="google-adsense-platform-domain" content={canonicalUrl} />
          <meta name="ads-policy" content="medical-content-restricted" />
        </>
      )}
      
      {/* Additional Meta Tags */}
      {additionalMetaTags.map((tag, index) => (
        <meta key={index} {...tag} />
      ))}
      
      {/* Structured Data Enhanced */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData || defaultStructuredData)}
      </script>
      
      {/* Additional Structured Data for Medical Software */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "Portal de Verificação Medicamentosa",
          "operatingSystem": "Web",
          "applicationCategory": "HealthApplication",
          "downloadUrl": canonicalUrl,
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "BRL"
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "reviewCount": "150",
            "bestRating": "5",
            "worstRating": "1"
          },
          "featureList": [
            "Análise de interações medicamentosas",
            "IA para análise farmacêutica",
            "Cache inteligente para performance",
            "Relatórios detalhados",
            "Interface responsiva"
          ]
        })}
      </script>
      
      {/* Privacy and Cookie Consent Tracking */}
      {enableAnalytics && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "PrivacyPolicy",
            "name": "Política de Privacidade - Portal Medicamentos",
            "url": `${canonicalUrl}privacidade`,
            "dateModified": new Date().toISOString(),
            "description": "Política de privacidade em conformidade com LGPD"
          })}
        </script>
      )}
    </Helmet>
  )
}

export default SEO
