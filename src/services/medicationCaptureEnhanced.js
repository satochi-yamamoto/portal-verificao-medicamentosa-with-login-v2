import { supabase } from '../lib/supabase.js'
import { extractMedicationData } from '../lib/openai.js'

class MedicationCaptureService {
  constructor() {
    this.isProcessing = false
  }

  // Função principal para capturar medicamentos de uma análise
  async captureMedications(medications, analysisId = null) {
    if (this.isProcessing) {
      console.log('⚠️ Captura já em andamento, pulando...')
      return { success: false, message: 'Captura já em andamento' }
    }

    try {
      this.isProcessing = true
      console.log('📝 Iniciando captura automática de medicamentos:', medications)

      if (!medications || medications.length === 0) {
        return { success: false, message: 'Nenhum medicamento para capturar' }
      }

      // 1. EXTRAIR DADOS ESTRUTURADOS DA IA
      console.log('🤖 Extraindo dados estruturados dos medicamentos via IA...')
      let aiData = null
      try {
        aiData = await extractMedicationData(medications)
        console.log('✅ Dados da IA extraídos:', aiData)
      } catch (error) {
        console.warn('⚠️ Erro ao extrair dados da IA, continuando sem dados estruturados:', error.message)
      }

      // 2. PROCESSAR CADA MEDICAMENTO
      const results = []
      const processedMedications = []

      for (let i = 0; i < medications.length; i++) {
        const medication = medications[i]
        const aiMedicationData = aiData?.medications?.[i] || null

        try {
          const result = await this.processSingleMedication(medication, analysisId, aiMedicationData)
          results.push(result)
          
          if (result.success) {
            processedMedications.push(result.medication)
          }
        } catch (error) {
          console.error(`❌ Erro ao processar medicamento ${medication.name}:`, error)
          results.push({ 
            success: false, 
            medication: medication.name, 
            error: error.message 
          })
        }
      }

      const successCount = results.filter(r => r.success).length
      console.log(`✅ Captura concluída: ${successCount}/${medications.length} medicamentos processados`)

      return {
        success: true,
        processedCount: successCount,
        totalCount: medications.length,
        medications: processedMedications,
        results,
        aiDataExtracted: !!aiData
      }

    } catch (error) {
      console.error('❌ Erro na captura de medicamentos:', error)
      return { 
        success: false, 
        message: 'Erro na captura: ' + error.message 
      }
    } finally {
      this.isProcessing = false
    }
  }

  // Processar um único medicamento
  async processSingleMedication(medication, analysisId = null, aiData = null) {
    const normalizedName = this.normalizeMedicationName(medication.name)
    
    try {
      // Verificar se já existe - buscar por ambos os campos para ser mais seguro
      const { data: existingMeds, error: searchError } = await supabase
        .from('medications')
        .select('*')
        .or(`normalized_name.eq.${normalizedName},name.ilike.${medication.name}`)
        .limit(1)

      if (searchError) {
        throw new Error(`Erro ao buscar medicamento: ${searchError.message}`)
      }

      if (existingMeds && existingMeds.length > 0) {
        // Medicamento existe - atualizar contador e dados
        return await this.updateExistingMedication(existingMeds[0], medication, analysisId, aiData)
      } else {
        // Medicamento novo - criar com dados da IA usando upsert para evitar duplicatas
        return await this.createNewMedication(medication, analysisId, aiData)
      }

    } catch (error) {
      // Se der erro de constraint violation, tentar buscar novamente (pode ter sido criado por outra requisição)
      if (error.message.includes('duplicate key value violates unique constraint')) {
        console.log(`🔄 Detectada duplicata para ${medication.name}, tentando buscar medicamento existente...`)
        
        try {
          const { data: existingMeds, error: retrySearchError } = await supabase
            .from('medications')
            .select('*')
            .or(`normalized_name.eq.${normalizedName},name.ilike.${medication.name}`)
            .limit(1)

          if (!retrySearchError && existingMeds && existingMeds.length > 0) {
            return await this.updateExistingMedication(existingMeds[0], medication, analysisId, aiData)
          }
        } catch (retryError) {
          console.error(`❌ Erro na retry para ${medication.name}:`, retryError)
        }
      }
      
      console.error(`❌ Erro ao processar ${medication.name}:`, error)
      throw error
    }
  }

  // Atualizar medicamento existente
  async updateExistingMedication(existingMed, medication, analysisId, aiData) {
    const updates = {
      consultation_count: (existingMed.consultation_count || 0) + 1,
      last_consulted_at: new Date().toISOString(),
      analysis_ids: this.updateAnalysisIds(existingMed.analysis_ids, analysisId)
    }

    // Se temos dados da IA e o medicamento não tem alguns campos, atualizar
    if (aiData) {
      if (!existingMed.active_ingredient && aiData.active_ingredient) {
        updates.active_ingredient = aiData.active_ingredient
      }
      if (!existingMed.therapeutic_class && aiData.therapeutic_class) {
        updates.therapeutic_class = aiData.therapeutic_class
      }
      if (!existingMed.mechanism_of_action && aiData.mechanism_of_action) {
        updates.mechanism_of_action = aiData.mechanism_of_action
      }
      if (!existingMed.main_indications && aiData.main_indications) {
        updates.main_indications = aiData.main_indications
      }
      if (!existingMed.contraindications && aiData.contraindications) {
        updates.contraindications = aiData.contraindications
      }
      if (!existingMed.common_side_effects && aiData.common_side_effects) {
        updates.common_side_effects = aiData.common_side_effects
      }
      if (!existingMed.important_interactions && aiData.important_interactions) {
        updates.important_interactions = aiData.important_interactions
      }
      if (!existingMed.special_populations && aiData.special_populations) {
        updates.special_populations = aiData.special_populations
      }
      if (!existingMed.monitoring && aiData.monitoring) {
        updates.monitoring = aiData.monitoring
      }
      if (!existingMed.administration_instructions && aiData.administration_instructions) {
        updates.administration_instructions = aiData.administration_instructions
      }
      if (!existingMed.dosage_forms && aiData.dosage_forms) {
        updates.dosage_forms = aiData.dosage_forms
      }
      if (!existingMed.storage_conditions && aiData.storage_conditions) {
        updates.storage_conditions = aiData.storage_conditions
      }
      if (!existingMed.pharmacy_category && aiData.pharmacy_category) {
        updates.pharmacy_category = aiData.pharmacy_category
      }
    }

    const { data, error } = await supabase
      .from('medications')
      .update(updates)
      .eq('id', existingMed.id)
      .select()
      .single()

    if (error) {
      throw new Error(`Erro ao atualizar medicamento: ${error.message}`)
    }

    console.log(`✅ Medicamento atualizado: ${medication.name} (${updates.consultation_count}x consultado)`)

    return {
      success: true,
      action: 'updated',
      medication: data,
      aiDataUsed: !!aiData
    }
  }

  // Criar novo medicamento
  async createNewMedication(medication, analysisId, aiData) {
    const now = new Date().toISOString()
    
    const newMedication = {
      name: medication.name,
      normalized_name: this.normalizeMedicationName(medication.name),
      dosage: medication.dosage || null,
      source: 'consultation_capture',
      consultation_count: 1,
      first_consulted_at: now,
      last_consulted_at: now,
      analysis_ids: analysisId ? [analysisId] : [],
      active_ingredient: medication.name, // Valor padrão obrigatório
      therapeutic_class: 'Não classificado', // Valor padrão obrigatório
      metadata: {
        original_query: medication,
        captured_at: now
      }
    }

    // Adicionar dados da IA se disponíveis
    if (aiData) {
      newMedication.active_ingredient = aiData.active_ingredient || medication.name
      newMedication.therapeutic_class = aiData.therapeutic_class || 'Não classificado'
      newMedication.mechanism_of_action = aiData.mechanism_of_action || null
      newMedication.main_indications = aiData.main_indications || null
      newMedication.contraindications = aiData.contraindications || null
      newMedication.common_side_effects = aiData.common_side_effects || null
      newMedication.important_interactions = aiData.important_interactions || null
      newMedication.special_populations = aiData.special_populations || null
      newMedication.monitoring = aiData.monitoring || null
      newMedication.administration_instructions = aiData.administration_instructions || null
      newMedication.dosage_forms = aiData.dosage_forms || null
      newMedication.storage_conditions = aiData.storage_conditions || null
      newMedication.pharmacy_category = aiData.pharmacy_category || null

      // Adicionar flag nos metadados
      newMedication.metadata.ai_enhanced = true
      newMedication.metadata.ai_extraction_date = now
    }

    try {
      // Usar upsert para evitar conflitos de duplicatas
      const { data, error } = await supabase
        .from('medications')
        .upsert(newMedication, { 
          onConflict: 'name',
          ignoreDuplicates: false
        })
        .select()
        .single()

      if (error) {
        throw new Error(`Erro ao criar medicamento: ${error.message}`)
      }

      console.log(`✅ Novo medicamento criado: ${medication.name}${aiData ? ' (com dados da IA)' : ''}`)

      return {
        success: true,
        action: 'created',
        medication: data,
        aiDataUsed: !!aiData
      }
      
    } catch (upsertError) {
      // Se o upsert falhar, pode ser que o medicamento foi criado por outra requisição
      // Tentar buscar o medicamento existente
      console.log(`🔄 Erro no upsert para ${medication.name}, tentando buscar existente...`)
      
      const { data: existingMeds, error: searchError } = await supabase
        .from('medications')
        .select('*')
        .eq('name', medication.name)
        .limit(1)

      if (!searchError && existingMeds && existingMeds.length > 0) {
        console.log(`📝 Medicamento ${medication.name} já existe, atualizando contador...`)
        return await this.updateExistingMedication(existingMeds[0], medication, analysisId, aiData)
      }
      
      // Se ainda assim falhar, relançar o erro original
      throw new Error(`Erro ao criar medicamento: ${upsertError.message}`)
    }
  }

  // Normalizar nome do medicamento para comparação
  normalizeMedicationName(name) {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, ' ') // Normaliza espaços
  }

  // Atualizar lista de IDs de análise
  updateAnalysisIds(currentIds, newId) {
    if (!newId) return currentIds || []
    
    const ids = Array.isArray(currentIds) ? currentIds : []
    if (!ids.includes(newId)) {
      ids.push(newId)
    }
    return ids
  }

  // Obter estatísticas de captura
  async getCaptureStats() {
    try {
      // Buscar medicamentos capturados automaticamente
      const { data: medications, error } = await supabase
        .from('medications')
        .select('*')
        .eq('source', 'consultation_capture')
        .order('consultation_count', { ascending: false })
      
      if (error) {
        throw new Error(`Erro ao obter estatísticas: ${error.message}`)
      }

      // Calcular estatísticas
      const totalMedications = medications?.length || 0
      const totalConsultations = medications?.reduce((sum, med) => sum + (med.consultation_count || 0), 0) || 0

      return {
        total: totalMedications,
        totalConsultations: totalConsultations,
        medications: medications || []
      }
    } catch (error) {
      console.error('❌ Erro ao obter estatísticas:', error)
      return { 
        total: 0,
        totalConsultations: 0,
        medications: []
      }
    }
  }

  // Obter medicamentos detalhados
  async getDetailedMedications() {
    try {
      const { data, error } = await supabase.rpc('get_detailed_medications')
      
      if (error) {
        throw new Error(`Erro ao obter medicamentos: ${error.message}`)
      }

      return {
        success: true,
        medications: data || []
      }
    } catch (error) {
      console.error('❌ Erro ao obter medicamentos detalhados:', error)
      return { 
        success: false, 
        message: error.message,
        medications: []
      }
    }
  }
}

// Criar instância única do serviço
export const medicationCaptureService = new MedicationCaptureService()
export default medicationCaptureService
