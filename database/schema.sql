-- Portal de Verificação Medicamentosa - Schema Supabase
-- Este arquivo contém as definições das tabelas para o banco de dados

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Tabela de medicamentos
CREATE TABLE IF NOT EXISTS medications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    active_ingredient TEXT NOT NULL,
    therapeutic_class TEXT NOT NULL,
    dosage_form TEXT,
    contraindications TEXT[],
    side_effects TEXT[],
    interactions TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de interações medicamentosas
CREATE TABLE IF NOT EXISTS drug_interactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    medication_a_id UUID REFERENCES medications(id) ON DELETE CASCADE,
    medication_b_id UUID REFERENCES medications(id) ON DELETE CASCADE,
    interaction_type TEXT NOT NULL CHECK (interaction_type IN ('pharmacokinetic', 'pharmacodynamic', 'mixed')),
    severity_level INTEGER CHECK (severity_level BETWEEN 1 AND 5),
    severity_text TEXT CHECK (severity_text IN ('minor', 'moderate', 'major')),
    mechanism TEXT,
    clinical_effect TEXT,
    management TEXT,
    monitoring TEXT,
    evidence_level TEXT CHECK (evidence_level IN ('high', 'moderate', 'low')),
    scientific_sources TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(medication_a_id, medication_b_id)
);

-- Tabela de consultas farmacêuticas
CREATE TABLE IF NOT EXISTS consultations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id TEXT,
    medications JSONB NOT NULL,
    interactions_found JSONB,
    ai_analysis TEXT,
    pharmacist_notes TEXT,
    recommendations TEXT,
    scientific_sources TEXT[],
    risk_level TEXT CHECK (risk_level IN ('low', 'moderate', 'high', 'critical')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de fontes científicas
CREATE TABLE IF NOT EXISTS scientific_sources (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    authors TEXT[],
    journal TEXT,
    publication_date DATE,
    doi TEXT UNIQUE,
    url TEXT,
    summary TEXT,
    medication_ids UUID[],
    interaction_ids UUID[],
    evidence_quality TEXT CHECK (evidence_quality IN ('systematic_review', 'rct', 'cohort', 'case_control', 'case_series', 'expert_opinion')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de logs de atividades
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id TEXT,
    action TEXT NOT NULL,
    table_name TEXT,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_medications_name ON medications USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_medications_therapeutic_class ON medications(therapeutic_class);
CREATE INDEX IF NOT EXISTS idx_drug_interactions_severity ON drug_interactions(severity_level, severity_text);
CREATE INDEX IF NOT EXISTS idx_consultations_patient ON consultations(patient_id);
CREATE INDEX IF NOT EXISTS idx_consultations_created_at ON consultations(created_at);
CREATE INDEX IF NOT EXISTS idx_scientific_sources_doi ON scientific_sources(doi);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_medications_updated_at BEFORE UPDATE ON medications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drug_interactions_updated_at BEFORE UPDATE ON drug_interactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consultations_updated_at BEFORE UPDATE ON consultations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) policies
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE drug_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE scientific_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (ajustar conforme necessidades de autenticação)
CREATE POLICY "Enable read access for all users" ON medications FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON drug_interactions FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON consultations FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON scientific_sources FOR SELECT USING (true);

-- Políticas de escrita (podem ser restringidas conforme roles)
CREATE POLICY "Enable insert for authenticated users" ON medications FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for authenticated users" ON drug_interactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for authenticated users" ON consultations FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for authenticated users" ON scientific_sources FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON medications FOR UPDATE USING (true);
CREATE POLICY "Enable update for authenticated users" ON drug_interactions FOR UPDATE USING (true);
CREATE POLICY "Enable update for authenticated users" ON consultations FOR UPDATE USING (true);
CREATE POLICY "Enable update for authenticated users" ON scientific_sources FOR UPDATE USING (true);
