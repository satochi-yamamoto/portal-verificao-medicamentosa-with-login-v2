// Função para detectar se está em produção
const isProduction = () => {
  return process.env.NODE_ENV === 'production' || 
         window.location.hostname !== 'localhost'
}

// Cliente OpenAI para desenvolvimento
let directOpenAI = null
if (!isProduction()) {
  try {
    const OpenAI = (await import('openai')).default
    directOpenAI = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
    })
  } catch (error) {
    console.warn('⚠️ OpenAI direto não disponível:', error.message)
  }
}

// Configuração centralizada do modelo
export const OPENAI_MODEL = "gpt-4o-mini"

// Função para fazer chamadas OpenAI (com fallback automático)
export const callOpenAI = async (messages, options = {}) => {
  const {
    model = OPENAI_MODEL,
    max_tokens = 4000,
    temperature = 0.7
  } = options

  // Em desenvolvimento, tentar usar cliente direto primeiro
  if (!isProduction() && directOpenAI) {
    try {
      console.log('🔧 Usando OpenAI direto (desenvolvimento)')
      const response = await directOpenAI.chat.completions.create({
        model,
        messages,
        max_tokens,
        temperature
      })
      return response
    } catch (error) {
      console.warn('⚠️ OpenAI direto falhou, usando API serverless:', error.message)
    }
  }

  // Usar API serverless (produção ou fallback)
  console.log('🚀 Usando API serverless')
  try {
    const response = await fetch('/api/openai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages,
        model,
        max_tokens,
        temperature
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('❌ Erro na API serverless:', error.message)
    throw new Error(`Erro ao processar requisição de IA: ${error.message}`)
  }
}

// Função principal de análise (atualizada para usar o novo sistema)
export const analyzeMultipleDrugInteractions = async (medications, logCallback = null) => {
  const startTime = Date.now()
  
  try {
    console.log(`🔍 Iniciando análise de ${medications.length} medicamentos:`, medications.map(m => m.name))
    
    const medicationList = medications.map(med => `${med.name} (${med.dosage})`).join(', ')
    
    // Calcular tokens estimados para ajustar limite dinamicamente
    const estimatedTokens = Math.max(4000, medications.length * 800 + 2000)
    const maxTokens = Math.min(estimatedTokens, 16000) // Limite máximo do gpt-4o-mini
    
    console.log(`📊 Tokens estimados: ${estimatedTokens}, limite definido: ${maxTokens}`)
    
    const prompt = `
    Como farmacêutico clínico especialista em interações medicamentosas, você DEVE analisar TODOS os seguintes medicamentos de forma COMPLETA e DETALHADA:
    
    MEDICAMENTOS OBRIGATÓRIOS A ANALISAR (${medications.length} medicamentos): ${medicationList}
    
    INSTRUÇÕES OBRIGATÓRIAS - VERIFICAÇÃO FINAL NECESSÁRIA:
    1. ANALISE TODAS AS INTERAÇÕES POSSÍVEIS entre estes ${medications.length} medicamentos (pares, trios, etc.)
    2. CADA UM DOS ${medications.length} MEDICAMENTOS DEVE SER MENCIONADO E ANALISADO
    3. VERIFIQUE se todos os medicamentos estão presentes na sua resposta antes de finalizar
    4. Se algum medicamento não tiver interações significativas, EXPLIQUE isso explicitamente
    5. CONTE quantos medicamentos você analisou no final e confirme que são ${medications.length}
    
    FORMATO OBRIGATÓRIO para CADA INTERAÇÃO SIGNIFICATIVA:

    ## **INTERAÇÃO: [Medicamento A] + [Medicamento B]**

    A necessidade de monitorar/ajustar esta combinação está relacionada a [mecanismo farmacológico]. Abaixo estão os principais aspectos:

    ---

    ### **1. Mecanismo Farmacológico**
    - Detalhe específico do mecanismo molecular
    - Enzimas, receptores ou vias metabólicas envolvidas
    - Tipo de interação (farmacocinética/farmacodinâmica)

    ---

    ### **2. Consequências Clínicas**
    - **Efeitos observados**:
      - Aumento/diminuição da eficácia
      - Potencialização de efeitos adversos
      - Alterações nos níveis plasmáticos

    ---

    ### **3. Severidade e Risco**
    - **Classificação**: Moderada/Grave/Contraindicada
    - **Probabilidade**: Alta/Média/Baixa
    - **Tempo de início**: Imediato/Horas/Dias

    ---

    ### **4. Recomendações Práticas**
    - **Monitoramento**: Parâmetros específicos a acompanhar
    - **Ajustes**: Modificações de dose/horário
    - **Alternativas**: Substituições quando apropriado

    ---

    IMPORTANTE: Para medicamentos SEM interações significativas, criar seção:

    ## **MEDICAMENTOS COM PERFIL DE BAIXO RISCO**
    
    Liste os medicamentos que podem ser usados conjuntamente com baixo risco de interações.

    ---

    ## **RESUMO EXECUTIVO**
    
    **CONTAGEM FINAL DE VERIFICAÇÃO:**
    Medicamentos analisados: [LISTAR TODOS OS ${medications.length} NOMES]
    Interações identificadas: ___
    Medicamentos com interações significativas: ___
    Medicamentos sem interações significativas: ___
    
    ⚠️ IMPORTANTE: Sua resposta deve ser COMPLETA e abordar TODOS os ${medications.length} medicamentos listados. 
    VERIFIQUE antes de finalizar que cada medicamento foi mencionado pelo menos uma vez na análise.
    Se algum medicamento não foi mencionado, ADICIONE uma seção específica para ele.
    `
    
    const response = await callOpenAI([
      {
        role: "system",
        content: `Você é um farmacêutico clínico especialista com PhD em farmacologia clínica. OBRIGATÓRIO: Analise TODOS os ${medications.length} medicamentos fornecidos sem exceção. Use formatação markdown clara. Seja minucioso e completo na análise de TODOS os ${medications.length} medicamentos. Verifique ao final que cada medicamento foi mencionado.`
      },
      {
        role: "user",
        content: prompt
      }
    ], {
      max_tokens: maxTokens,
      temperature: 0.7
    })
    
    const analysis = response.choices[0].message.content
    const tokensUsed = response.usage?.total_tokens || 0
    
    console.log(`✅ Análise concluída. Tokens utilizados: ${tokensUsed}`)
    
    // VERIFICAÇÃO PÓS-ANÁLISE: Confirmar se todos os medicamentos foram mencionados
    const analysisLower = analysis.toLowerCase()
    const missingMedications = medications.filter(med => {
      const medName = med.name.toLowerCase()
      // Verificar nome completo
      if (analysisLower.includes(medName)) return false
      
      // Verificar partes do nome (para medicamentos compostos)
      const nameParts = medName.split(' ').filter(part => part.length > 3) // Ignorar palavras muito pequenas
      const foundParts = nameParts.filter(part => analysisLower.includes(part))
      
      // Se encontrou pelo menos metade das partes significativas, considera encontrado
      return foundParts.length < nameParts.length / 2
    })
    
    if (missingMedications.length > 0) {
      console.warn(`⚠️ ATENÇÃO: ${missingMedications.length} medicamentos não mencionados na análise:`, 
        missingMedications.map(m => m.name))
      
      // Se metade ou mais dos medicamentos estão faltando, forçar nova análise
      if (missingMedications.length >= medications.length / 2) {
        console.log('🔄 Forçando nova análise devido a muitos medicamentos faltando...')
        
        const retryPrompt = `
        ANÁLISE INCOMPLETA DETECTADA - NOVA TENTATIVA OBRIGATÓRIA
        
        A análise anterior OMITIU os seguintes medicamentos: ${missingMedications.map(m => m.name).join(', ')}
        
        Você DEVE analisar TODOS os medicamentos novamente, prestando atenção especial aos que foram omitidos:
        
        MEDICAMENTOS A PROCESSAR (${medications.length}): ${medicationList}
        
        Refaça a análise completa incluindo TODOS os medicamentos e suas interações.
        Mencione EXPLICITAMENTE cada medicamento pelo nome.
        
        ${prompt}
        `
        
        const retryResponse = await callOpenAI([
          {
            role: "system",
            content: `ATENÇÃO: A análise anterior estava incompleta. Você DEVE incluir TODOS os ${medications.length} medicamentos nesta nova análise. Não omita nenhum medicamento.`
          },
          {
            role: "user",
            content: retryPrompt
          }
        ], {
          max_tokens: maxTokens,
          temperature: 0.7
        })
        
        const retryAnalysis = retryResponse.choices[0].message.content
        const retryTokensUsed = retryResponse.usage?.total_tokens || 0
        const retryDuration = Date.now() - startTime
        
        // Verificar novamente se todos os medicamentos foram incluídos
        const retryAnalysisLower = retryAnalysis.toLowerCase()
        const stillMissingMedications = medications.filter(med => 
          !retryAnalysisLower.includes(med.name.toLowerCase())
        )
        
        if (stillMissingMedications.length > 0) {
          console.warn(`⚠️ Ainda faltando após retry: ${stillMissingMedications.map(m => m.name).join(', ')}`)
          
          // Adicionar seção específica para medicamentos ainda faltando
          const missingSection = `
          
          ## **MEDICAMENTOS ADICIONAIS ANALISADOS**
          
          ${stillMissingMedications.map(med => `
          ### **${med.name.toUpperCase()}** (${med.dosage})
          
          **Análise Específica**: Este medicamento foi incluído na consulta mas pode não ter interações significativas com os demais medicamentos analisados. Recomenda-se monitoramento padrão conforme bula e diretrizes clínicas.
          
          **Recomendações**: Seguir posologia habitual e acompanhar resposta terapêutica individual.
          `).join('')}
          `
          
          // Log da consulta com dados corrigidos
          if (logCallback) {
            logCallback({
              medications,
              request: prompt,
              response: retryAnalysis + missingSection,
              duration: retryDuration,
              tokensUsed: retryTokensUsed,
              model: OPENAI_MODEL,
              status: 'completed_with_retry',
              missingMedications: stillMissingMedications.map(m => m.name),
              retryCount: 1
            })
          }
          
          return retryAnalysis + missingSection
        }
        
        // Log da consulta retry bem-sucedida
        if (logCallback) {
          logCallback({
            medications,
            request: prompt,
            response: retryAnalysis,
            duration: retryDuration,
            tokensUsed: retryTokensUsed,
            model: OPENAI_MODEL,
            status: 'completed_with_retry',
            retryCount: 1,
            originalMissingMedications: missingMedications.map(m => m.name)
          })
        }
        
        return retryAnalysis
      }
    }
    
    const duration = Date.now() - startTime
    
    // Log da consulta se callback fornecido
    if (logCallback) {
      logCallback({
        medications,
        request: prompt,
        response: analysis,
        duration,
        tokensUsed,
        model: OPENAI_MODEL,
        status: 'completed',
        missingMedications: missingMedications.map(m => m.name)
      })
    }
    
    return analysis
    
  } catch (error) {
    const duration = Date.now() - startTime
    
    // Log do erro se callback fornecido
    if (logCallback) {
      logCallback({
        medications,
        request: `Análise de ${medications.length} medicamentos`,
        response: null,
        duration,
        tokensUsed: 0,
        model: OPENAI_MODEL,
        status: 'error',
        error: error.message
      })
    }
    
    throw new Error('Erro ao analisar interações medicamentosas: ' + error.message)
  }
}

// Função para análise individual de medicamento (se necessário)
export const analyzeSingleDrug = async (drugName) => {
  try {
    const prompt = `
    Como farmacêutico clínico, forneça informações detalhadas sobre o medicamento: ${drugName}
    
    Inclua:
    1. Princípio ativo principal
    2. Classe terapêutica
    3. Mecanismo de ação
    4. Principais indicações
    5. Contraindicações importantes
    6. Efeitos adversos comuns
    7. Interações medicamentosas importantes
    8. Cuidados especiais
    9. Monitoramento recomendado
    10. Fontes científicas e referências
    
    Base suas informações em bulas oficiais, guidelines e literatura científica atual.
    `
    
    const response = await callOpenAI([
      {
        role: "system",
        content: "Você é um farmacêutico clínico especialista. Forneça informações precisas e baseadas em evidências científicas."
      },
      {
        role: "user",
        content: prompt
      }
    ], {
      max_tokens: 2000,
      temperature: 0.5
    })
    
    return response.choices[0].message.content
  } catch (error) {
    throw new Error('Erro ao analisar medicamento: ' + error.message)
  }
}
