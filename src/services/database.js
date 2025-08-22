import { supabase } from '../lib/supabase'

// Importar serviços de logs
export { consultationLogService } from './consultationLogs'

// Serviços para medicamentos
export const medicationService = {
  // Buscar todos os medicamentos
  async getAll() {
    const { data, error } = await supabase
      .from('medications')
      .select('*')
      .order('name')
    
    if (error) throw error
    return data
  },

  // Buscar medicamento por ID
  async getById(id) {
    const { data, error } = await supabase
      .from('medications')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  // Buscar medicamentos por nome
  async searchByName(name) {
    const { data, error } = await supabase
      .from('medications')
      .select('*')
      .ilike('name', `%${name}%`)
    
    if (error) throw error
    return data
  },

  // Criar novo medicamento
  async create(medication) {
    const { data, error } = await supabase
      .from('medications')
      .insert([medication])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Atualizar medicamento
  async update(id, updates) {
    const { data, error } = await supabase
      .from('medications')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// Serviços para interações medicamentosas
export const interactionService = {
  // Buscar interações entre medicamentos específicos
  async getInteractionsBetween(medicationIds) {
    const { data, error } = await supabase
      .from('drug_interactions')
      .select(`
        *,
        medication_a:medications!drug_interactions_medication_a_id_fkey(*),
        medication_b:medications!drug_interactions_medication_b_id_fkey(*)
      `)
      .or(`medication_a_id.in.(${medicationIds.join(',')}),medication_b_id.in.(${medicationIds.join(',')})`)
    
    if (error) throw error
    return data
  },

  // Criar nova interação
  async create(interaction) {
    const { data, error } = await supabase
      .from('drug_interactions')
      .insert([interaction])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Buscar todas as interações
  async getAll() {
    const { data, error } = await supabase
      .from('drug_interactions')
      .select(`
        *,
        medication_a:medications!drug_interactions_medication_a_id_fkey(*),
        medication_b:medications!drug_interactions_medication_b_id_fkey(*)
      `)
      .order('severity_level', { ascending: false })
    
    if (error) throw error
    return data
  }
}

// Serviços para consultas
export const consultationService = {
  // Criar nova consulta
  async create(consultation) {
    const { data, error } = await supabase
      .from('consultations')
      .insert([consultation])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Buscar consultas por paciente
  async getByPatient(patientId) {
    const { data, error } = await supabase
      .from('consultations')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Buscar todas as consultas
  async getAll() {
    const { data, error } = await supabase
      .from('consultations')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Atualizar consulta
  async update(id, updates) {
    const { data, error } = await supabase
      .from('consultations')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// Serviços para fontes científicas
export const scientificSourceService = {
  // Buscar fontes por medicamento
  async getByMedication(medicationId) {
    const { data, error } = await supabase
      .from('scientific_sources')
      .select('*')
      .contains('medication_ids', [medicationId])
    
    if (error) throw error
    return data
  },

  // Criar nova fonte
  async create(source) {
    const { data, error } = await supabase
      .from('scientific_sources')
      .insert([source])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Buscar todas as fontes
  async getAll() {
    const { data, error } = await supabase
      .from('scientific_sources')
      .select('*')
      .order('publication_date', { ascending: false })
    
    if (error) throw error
    return data
  }
}
