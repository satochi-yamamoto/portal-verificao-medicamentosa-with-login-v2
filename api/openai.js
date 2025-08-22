import OpenAI from 'openai'

export default async function handler(req, res) {
  // Handle OPTIONS for CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    return res.status(200).end()
  }

  // Permitir apenas POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  try {
    // Verificar se a API key está disponível
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      console.error('❌ OpenAI API key não encontrada')
      return res.status(500).json({ 
        error: 'Configuration error',
        message: 'OpenAI API key não configurada' 
      })
    }

    // Inicializar OpenAI cliente
    const openai = new OpenAI({
      apiKey: apiKey
    })

    const { messages, model, max_tokens, temperature } = req.body

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' })
    }

    console.log('🔍 Processando requisição OpenAI:', {
      model: model || 'gpt-4o-mini',
      messageCount: messages.length,
      maxTokens: max_tokens
    })

    const response = await openai.chat.completions.create({
      model: model || 'gpt-4o-mini',
      messages,
      max_tokens: max_tokens || 4000,
      temperature: temperature || 0.7
    })

    const result = {
      choices: response.choices,
      usage: response.usage,
      model: response.model,
      created: response.created
    }

    console.log('✅ Resposta OpenAI processada:', {
      tokensUsed: response.usage?.total_tokens,
      responseLength: response.choices[0]?.message?.content?.length
    })

    return res.status(200).json(result)

  } catch (error) {
    console.error('❌ Erro na API OpenAI:', {
      message: error.message,
      name: error.name,
      status: error.status || 'unknown',
      code: error.code || 'unknown'
    })
    
    // Retornar erro mais específico baseado no tipo
    if (error.status === 401) {
      return res.status(500).json({ 
        error: 'Authentication error',
        message: 'Erro de autenticação OpenAI'
      })
    }
    
    if (error.status === 429) {
      return res.status(500).json({ 
        error: 'Rate limit error',
        message: 'Limite de requisições excedido'
      })
    }
    
    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'Erro ao processar requisição de IA',
      debug: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}
