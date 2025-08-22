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
const callOpenAI = async (messages, options = {}) => {
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
      - Magnitude da interação (quantificar quando possível)
      - Sinais e sintomas específicos
      - Tempo de início dos efeitos

    ---

    ### **3. Fatores Moduladores**
    - **Timing**: Intervalos necessários entre doses
    - **Dose-dependência**: Como a dose influencia
    - **Fatores individuais**: Idade, função orgânica, genética

    ---

    ### **4. Manejo Clínico**
    - **Estratégias práticas**:
      - Ajustes posológicos específicos
      - Modificações de horário
      - Monitoramento laboratorial
    - **Alternativas terapêuticas** quando indicado

    ---

    ### **5. Recomendações Práticas**
    1. **Ação imediata**: Primeira medida a tomar
    2. **Monitoramento**: Parâmetros específicos a acompanhar
    3. **Orientação ao paciente**: Instruções claras e objetivas

    ---

    ### **Populações Especiais**
    - Idosos, crianças, gestantes, insuficiência renal/hepática

    ---

    ### **Conclusão da Interação**
    Resumo da relevância clínica e ações necessárias.

    ---

    **ANÁLISE COMPLEMENTAR OBRIGATÓRIA:**

    ### **Medicamentos Sem Interações Significativas**
    [Liste EXPLICITAMENTE os medicamentos que não têm interações clinicamente relevantes com outros da lista - MENCIONE CADA UM POR NOME]

    ### **Resumo Geral da Prescrição**
    - Classificação de risco geral: BAIXO/MODERADO/ALTO
    - Principais pontos de atenção
    - Cronograma de administração sugerido
    - Monitoramento laboratorial recomendado

    ### **VERIFICAÇÃO OBRIGATÓRIA - Medicamentos Analisados**
    ✅ CONFIRME que TODOS os seguintes medicamentos foram abordados na análise:
    ${medications.map(med => `- [ ] ${med.name} (${med.dosage}) - MENCIONADO NA ANÁLISE`).join('\n')}
    
    ### **CONTAGEM FINAL**
    Total de medicamentos analisados: ___/${medications.length}
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
      temperature: 0.2
    })
    
    const analysis = response.choices[0].message.content
    const duration = Date.now() - startTime
    const tokensUsed = response.usage?.total_tokens || 0
    
    console.log(`✅ Análise concluída em ${duration}ms, ${tokensUsed} tokens utilizados`)
    
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
        
        MEDICAMENTOS COMPLETOS (${medications.length}): ${medicationList}
        
        MEDICAMENTOS QUE FORAM OMITIDOS E DEVEM SER INCLUÍDOS:
        ${missingMedications.map(med => `- ${med.name} (${med.dosage}) - OBRIGATÓRIO INCLUIR`).join('\n')}
        
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
          temperature: 0.1
        })
        
        const retryAnalysis = retryResponse.choices[0].message.content
        const retryDuration = Date.now() - startTime
        const retryTokensUsed = (response.usage?.total_tokens || 0) + (retryResponse.usage?.total_tokens || 0)
        
        console.log(`🔄 Nova análise concluída em ${retryDuration}ms, ${retryTokensUsed} tokens total`)
        
        // Verificar novamente a análise corrigida
        const retryAnalysisLower = retryAnalysis.toLowerCase()
        const stillMissingMedications = medications.filter(med => 
          !retryAnalysisLower.includes(med.name.toLowerCase())
        )
        
        if (stillMissingMedications.length > 0) {
          console.error(`❌ ERRO CRÍTICO: Ainda faltam medicamentos após retry:`, 
            stillMissingMedications.map(m => m.name))
          
          // Adicionar seção manual para medicamentos faltantes
          const missingSection = `

---

## ⚠️ MEDICAMENTOS ADICIONAIS (Análise Complementar)

${stillMissingMedications.map(med => `
### **${med.name} (${med.dosage})**
- **Análise**: Este medicamento foi incluído na consulta mas requer análise específica adicional
- **Interações potenciais**: Verificar interações com outros medicamentos da prescrição
- **Monitoramento**: Acompanhar efeitos em conjunto com os demais medicamentos
- **Observação**: Medicamento presente na prescrição e deve ser considerado no contexto geral
`).join('\n')}

**Medicamentos incluídos nesta análise complementar**: ${stillMissingMedications.map(m => m.name).join(', ')}
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
        } else {
          console.log(`✅ Retry bem-sucedida: Todos os ${medications.length} medicamentos incluídos`)
          
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
      } else {
        // Poucos medicamentos faltando - apenas alertar
        console.log(`ℹ️ Poucos medicamentos faltando (${missingMedications.length}), continuando com análise atual`)
      }
    } else {
      console.log(`✅ Verificação OK: Todos os ${medications.length} medicamentos mencionados na análise`)
    }
    
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
    console.error('❌ Erro na API OpenAI:', error)
    
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

export const getSingleDrugInfo = async (medicationName) => {
  try {
    const prompt = `
    Como farmacêutico clínico, forneça informações detalhadas sobre o medicamento: ${medicationName}
    
    Inclua:
    1. Princípio ativo
    2. Classe terapêutica
    3. Mecanismo de ação
    4. Indicações principais
    5. Contraindicações
    6. Efeitos adversos mais comuns
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
      temperature: 0.2,
      max_tokens: 1500
    })
    
    return response.choices[0].message.content
  } catch (error) {
    console.error('Erro na consulta de IA:', error)
    throw new Error('Erro ao obter informações do medicamento')
  }
}

// Nova função para extrair dados estruturados dos medicamentos para popular a base de dados
export const extractMedicationData = async (medications) => {
  try {
    console.log('🔍 Extraindo dados estruturados dos medicamentos para base de dados...')
    
    const medicationList = medications.map(med => `${med.name} (${med.dosage})`).join(', ')
    
    const prompt = `
    Como farmacêutico clínico especialista, extraia dados estruturados para cada um dos seguintes medicamentos para popular uma base de dados farmacêutica:

    MEDICAMENTOS: ${medicationList}

    Para CADA medicamento, retorne EXATAMENTE no formato JSON abaixo:

    {
      "medications": [
        {
          "name": "Nome comercial exato",
          "active_ingredient": "Princípio ativo",
          "therapeutic_class": "Classe terapêutica",
          "mechanism_of_action": "Mecanismo de ação resumido",
          "main_indications": ["Indicação 1", "Indicação 2", "Indicação 3"],
          "contraindications": ["Contraindicação 1", "Contraindicação 2"],
          "common_side_effects": ["Efeito 1", "Efeito 2", "Efeito 3"],
          "important_interactions": ["Medicamento/classe 1", "Medicamento/classe 2"],
          "special_populations": {
            "pregnancy": "Categoria/Orientação",
            "elderly": "Orientação específica",
            "renal_impairment": "Ajuste necessário",
            "hepatic_impairment": "Ajuste necessário"
          },
          "monitoring": ["Parâmetro 1", "Parâmetro 2"],
          "administration_instructions": "Orientações de administração",
          "dosage_forms": ["Comprimido", "Solução", "etc"],
          "storage_conditions": "Condições de armazenamento",
          "pharmacy_category": "Venda livre/Prescrição/Controlado"
        }
      ]
    }

    INSTRUÇÕES CRÍTICAS:
    1. Retorne APENAS o JSON válido, sem texto adicional
    2. Inclua TODOS os medicamentos fornecidos
    3. Use informações precisas e atualizadas
    4. Mantenha arrays e strings exatamente como especificado
    5. Se alguma informação não estiver disponível, use "Não especificado"

    MEDICAMENTOS A PROCESSAR (${medications.length}): ${medicationList}
    `
    
    const response = await callOpenAI([
      {
        role: "system",
        content: "Você é um farmacêutico clínico especialista. Retorne APENAS JSON válido com dados estruturados dos medicamentos, sem texto adicional."
      },
      {
        role: "user",
        content: prompt
      }
    ], {
      temperature: 0.1,
      max_tokens: 4000
    })
    
    const content = response.choices[0].message.content.trim()
    console.log('📄 Resposta da IA:', content)
    
    // Tentar extrair JSON da resposta
    let jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('JSON não encontrado na resposta da IA')
    }
    
    const jsonData = JSON.parse(jsonMatch[0])
    console.log('✅ Dados estruturados extraídos:', jsonData)
    
    return jsonData
    
  } catch (error) {
    console.error('❌ Erro ao extrair dados dos medicamentos:', error)
    throw new Error('Erro ao extrair dados estruturados: ' + error.message)
  }
}
