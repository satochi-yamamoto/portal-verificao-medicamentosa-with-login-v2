import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Schemas do banco de dados
export const DATABASE_SCHEMAS = {
  // Tabela de medicamentos
  medications: {
    id: 'uuid',
    name: 'text',
    active_ingredient: 'text',
    therapeutic_class: 'text',
    dosage_form: 'text',
    contraindications: 'text[]',
    side_effects: 'text[]',
    created_at: 'timestamp',
    updated_at: 'timestamp'
  },
  
  // Tabela de interações medicamentosas
  drug_interactions: {
    id: 'uuid',
    medication_a_id: 'uuid',
    medication_b_id: 'uuid',
    interaction_type: 'text', // major, moderate, minor
    severity_level: 'integer', // 1-5
    mechanism: 'text',
    clinical_effect: 'text',
    management: 'text',
    evidence_level: 'text', // high, moderate, low
    created_at: 'timestamp',
    updated_at: 'timestamp'
  },
  
  // Tabela de consultas realizadas
  consultations: {
    id: 'uuid',
    patient_id: 'text',
    medications: 'jsonb',
    interactions_found: 'jsonb',
    ai_analysis: 'text',
    pharmacist_notes: 'text',
    recommendations: 'text',
    scientific_sources: 'text[]',
    created_at: 'timestamp',
    updated_at: 'timestamp'
  },
  
  // Tabela de fontes científicas
  scientific_sources: {
    id: 'uuid',
    title: 'text',
    authors: 'text[]',
    journal: 'text',
    publication_date: 'date',
    doi: 'text',
    url: 'text',
    summary: 'text',
    medication_ids: 'uuid[]',
    created_at: 'timestamp'
  }
}
