// Endpoint de teste para diagnosticar problemas da API
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    // Verificar variáveis de ambiente (sem expor valores)
    const hasOpenAIKey = !!process.env.OPENAI_API_KEY
    const hasSupabaseUrl = !!process.env.VITE_SUPABASE_URL
    const hasSupabaseKey = !!process.env.VITE_SUPABASE_ANON_KEY
    
    // Verificar se consegue importar OpenAI
    let openaiImportOk = false
    try {
      const OpenAI = (await import('openai')).default
      openaiImportOk = !!OpenAI
    } catch (e) {
      console.error('Erro ao importar OpenAI:', e.message)
    }

    const diagnostics = {
      timestamp: new Date().toISOString(),
      environment: {
        nodeVersion: process.version,
        nodeEnv: process.env.NODE_ENV || 'not set'
      },
      secrets: {
        openaiKey: hasOpenAIKey ? 'configured' : 'missing',
        supabaseUrl: hasSupabaseUrl ? 'configured' : 'missing',
        supabaseKey: hasSupabaseKey ? 'configured' : 'missing'
      },
      imports: {
        openai: openaiImportOk ? 'ok' : 'failed'
      },
      status: 'api_healthy'
    }

    return res.status(200).json(diagnostics)

  } catch (error) {
    return res.status(500).json({
      error: 'Diagnostic failed',
      message: error.message,
      timestamp: new Date().toISOString()
    })
  }
}
