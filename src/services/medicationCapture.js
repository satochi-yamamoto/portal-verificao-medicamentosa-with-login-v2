import { supabase } from '../lib/supabase.js'

/**
 * Serviço para capturar e armazenar medicamentos consultados automaticamente
 */
export const medicationCaptureService = {
  /**
   * Processa e armazena medicamentos quando uma consulta é realizada
   * @param {Array} medications - Array de medicamentos consultados
   * @param {string} analysisId - ID da análise realizada
   * @returns {Object} Resultado da operação
   */
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
      // Verificar se já existe
      const { data: existingMeds, error: searchError } = await supabase
        .from('medications')
        .select('*')
        .eq('normalized_name', normalizedName)
        .limit(1)

      if (searchError) {
        throw new Error(`Erro ao buscar medicamento: ${searchError.message}`)
      }

      if (existingMeds && existingMeds.length > 0) {
        // Medicamento existe - atualizar contador e dados
        return await this.updateExistingMedication(existingMeds[0], medication, analysisId, aiData)
      } else {
        // Medicamento novo - criar com dados da IA
        return await this.createNewMedication(medication, analysisId, aiData)
      }

    } catch (error) {
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

    const { data, error } = await supabase
      .from('medications')
      .insert(newMedication)
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
  }
  },

  /**
   * Processa um único medicamento
   * @param {Object} medication - Dados do medicamento
   * @param {string} analysisId - ID da análise
   * @returns {Object} Resultado do processamento
   */
  async processSingleMedication(medication, analysisId) {
    // Normalizar nome do medicamento
    const normalizedName = this.normalizeMedicationName(medication.name)
    
    // Verificar se já existe
    const existing = await this.findExistingMedication(normalizedName)
    
    if (existing) {
      // Atualizar contador de consultas
      await this.updateMedicationStats(existing.id)
      return {
        isNew: false,
        medication: existing
      }
    }
    
    // Criar novo registro
    const newMedication = await this.createNewMedication(medication, analysisId)
    return {
      isNew: true,
      medication: newMedication
    }
  },

  /**
   * Normaliza o nome do medicamento para busca
   * @param {string} name - Nome original
   * @returns {string} Nome normalizado
   */
  normalizeMedicationName(name) {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, ' ') // Normaliza espaços
  },

  /**
   * Busca medicamento existente por nome
   * @param {string} normalizedName - Nome normalizado
   * @returns {Object|null} Medicamento encontrado ou null
   */
  async findExistingMedication(normalizedName) {
    const { data, error } = await supabase
      .from('medications')
      .select('*')
      .or(`name.ilike.%${normalizedName}%,normalized_name.eq.${normalizedName}`)
      .limit(1)
    
    if (error) {
      console.warn('⚠️ Erro ao buscar medicamento existente:', error.message)
      return null
    }
    
    return data && data.length > 0 ? data[0] : null
  },

  /**
   * Cria novo medicamento na base de dados
   * @param {Object} medication - Dados do medicamento
   * @param {string} analysisId - ID da análise
   * @returns {Object} Medicamento criado
   */
  async createNewMedication(medication, analysisId) {
    const medicationData = {
      name: medication.name,
      normalized_name: this.normalizeMedicationName(medication.name),
      dosage: medication.dosage || null,
      dosage_form: this.extractDosageForm(medication.dosage),
      source: 'consultation_capture',
      consultation_count: 1,
      first_consulted_at: new Date().toISOString(),
      last_consulted_at: new Date().toISOString(),
      analysis_ids: analysisId ? [analysisId] : [],
      metadata: {
        captured_from_analysis: true,
        original_input: medication,
        capture_timestamp: new Date().toISOString()
      }
    }
    
    const { data, error } = await supabase
      .from('medications')
      .insert([medicationData])
      .select()
      .single()
    
    if (error) {
      throw new Error(`Erro ao criar medicamento: ${error.message}`)
    }
    
    return data
  },

  /**
   * Atualiza estatísticas de um medicamento existente
   * @param {string} medicationId - ID do medicamento
   */
  async updateMedicationStats(medicationId) {
    const { error } = await supabase
      .from('medications')
      .update({
        consultation_count: supabase.raw('consultation_count + 1'),
        last_consulted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', medicationId)
    
    if (error) {
      console.warn('⚠️ Erro ao atualizar estatísticas:', error.message)
    }
  },

  /**
   * Extrai forma farmacêutica da dosagem
   * @param {string} dosage - String de dosagem
   * @returns {string|null} Forma farmacêutica
   */
  extractDosageForm(dosage) {
    if (!dosage) return null
    
    const dosageLower = dosage.toLowerCase()
    
    // Mapear formas farmacêuticas comuns
    const forms = {
      'comprimido': ['comp', 'comprimido', 'tablet', 'cp'],
      'capsula': ['caps', 'capsula', 'cápsula', 'capsule'],
      'gotas': ['gotas', 'gts', 'drops', 'solução oral'],
      'xarope': ['xarope', 'syrup', 'susp'],
      'ampola': ['ampola', 'amp', 'injetável', 'injection'],
      'pomada': ['pomada', 'creme', 'gel', 'ointment'],
      'spray': ['spray', 'aerosol'],
      'supositorio': ['supositório', 'suppository']
    }
    
    for (const [form, patterns] of Object.entries(forms)) {
      if (patterns.some(pattern => dosageLower.includes(pattern))) {
        return form
      }
    }
    
    return 'não especificado'
  },

  /**
   * Obter estatísticas de captura
   * @returns {Object} Estatísticas
   */
  async getCaptureStats() {
    const { data, error } = await supabase
      .from('medications')
      .select('*')
      .eq('source', 'consultation_capture')
    
    if (error) {
      console.error('❌ Erro ao obter estatísticas:', error.message)
      return { total: 0, medications: [] }
    }
    
    return {
      total: data.length,
      totalConsultations: data.reduce((sum, med) => sum + (med.consultation_count || 0), 0),
      medications: data.sort((a, b) => b.consultation_count - a.consultation_count)
    }
  }
}

export default medicationCaptureService
