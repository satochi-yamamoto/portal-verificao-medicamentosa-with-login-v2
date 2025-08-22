-- Portal de Verificação Medicamentosa - Schema Supabase (Versão Corrigida)
-- Execute este arquivo no SQL Editor do Supabase

-- PASSO 1: Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- PASSO 2: Criar tabelas principais

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

-- PASSO 3: Criar função para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- PASSO 4: Criar triggers para updated_at
CREATE TRIGGER update_medications_updated_at 
    BEFORE UPDATE ON medications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drug_interactions_updated_at 
    BEFORE UPDATE ON drug_interactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consultations_updated_at 
    BEFORE UPDATE ON consultations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- PASSO 5: Criar índices (após as extensões estarem habilitadas)
CREATE INDEX IF NOT EXISTS idx_medications_name 
    ON medications USING gin(name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_medications_active_ingredient 
    ON medications USING gin(active_ingredient gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_medications_therapeutic_class 
    ON medications(therapeutic_class);

CREATE INDEX IF NOT EXISTS idx_drug_interactions_severity 
    ON drug_interactions(severity_level, severity_text);

CREATE INDEX IF NOT EXISTS idx_drug_interactions_medications 
    ON drug_interactions(medication_a_id, medication_b_id);

CREATE INDEX IF NOT EXISTS idx_consultations_patient 
    ON consultations(patient_id);

CREATE INDEX IF NOT EXISTS idx_consultations_created_at 
    ON consultations(created_at);

CREATE INDEX IF NOT EXISTS idx_consultations_risk_level 
    ON consultations(risk_level);

CREATE INDEX IF NOT EXISTS idx_scientific_sources_doi 
    ON scientific_sources(doi);

CREATE INDEX IF NOT EXISTS idx_scientific_sources_publication_date 
    ON scientific_sources(publication_date);

-- PASSO 6: Habilitar Row Level Security (RLS)
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE drug_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE scientific_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- PASSO 7: Criar políticas RLS básicas (acesso público para leitura)
CREATE POLICY "Enable read access for all users" ON medications 
    FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON drug_interactions 
    FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON consultations 
    FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON scientific_sources 
    FOR SELECT USING (true);

-- Políticas de escrita (podem ser ajustadas conforme necessidades)
CREATE POLICY "Enable insert for all users" ON medications 
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable insert for all users" ON drug_interactions 
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable insert for all users" ON consultations 
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable insert for all users" ON scientific_sources 
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON medications 
    FOR UPDATE USING (true);

CREATE POLICY "Enable update for all users" ON drug_interactions 
    FOR UPDATE USING (true);

CREATE POLICY "Enable update for all users" ON consultations 
    FOR UPDATE USING (true);

CREATE POLICY "Enable update for all users" ON scientific_sources 
    FOR UPDATE USING (true);

-- PASSO 8: Inserir dados iniciais dos medicamentos
INSERT INTO medications (name, active_ingredient, therapeutic_class, dosage_form, contraindications, side_effects, interactions) VALUES
('Nitrazepam', 'Nitrazepam', 'Benzodiazepínico', 'Comprimido', 
 ARRAY['Miastenia gravis', 'Insuficiência respiratória grave', 'Hipersensibilidade'], 
 ARRAY['Sonolência', 'Ataxia', 'Confusão mental', 'Dependência'],
 ARRAY['Álcool', 'Opioides', 'Ácido valproico', 'Olanzapina']),

('Clonazepam', 'Clonazepam', 'Benzodiazepínico antiepiléptico', 'Comprimido', 
 ARRAY['Glaucoma de ângulo estreito', 'Miastenia gravis', 'Insuficiência hepática grave'], 
 ARRAY['Sedação', 'Ataxia', 'Tontura', 'Fadiga'],
 ARRAY['Ácido valproico', 'Omeprazol', 'Álcool', 'Outros sedativos']),

('Ácido Valproico', 'Ácido Valproico', 'Antiepiléptico', 'Comprimido/Xarope', 
 ARRAY['Hepatopatia', 'Porfiria', 'Distúrbios do ciclo da ureia'], 
 ARRAY['Hepatotoxicidade', 'Trombocitopenia', 'Alopecia', 'Ganho de peso'],
 ARRAY['Fenobarbital', 'Fenitoína', 'Lamotrigina', 'Colchicina']),

('Olanzapina', 'Olanzapina', 'Antipsicótico atípico', 'Comprimido', 
 ARRAY['Hipersensibilidade', 'Glaucoma de ângulo fechado'], 
 ARRAY['Ganho de peso', 'Sedação', 'Dislipidemias', 'Diabetes'],
 ARRAY['Benzodiazepínicos', 'Ácido valproico', 'Ciprofibrato', 'Álcool']),

('Anlodipino', 'Besilato de Anlodipino', 'Bloqueador de canal de cálcio', 'Comprimido', 
 ARRAY['Hipersensibilidade', 'Choque cardiogênico', 'Estenose aórtica grave'], 
 ARRAY['Edema periférico', 'Cefaleia', 'Fadiga', 'Rubor'],
 ARRAY['Sinvastatina', 'Omeprazol', 'Sucos cítricos']),

('Losartana', 'Losartana Potássica', 'Antagonista do receptor de angiotensina II', 'Comprimido', 
 ARRAY['Hipersensibilidade', 'Gravidez', 'Estenose bilateral da artéria renal'], 
 ARRAY['Tontura', 'Fadiga', 'Hipercalemia', 'Tosse'],
 ARRAY['Diuréticos', 'AINEs', 'Lítio', 'Suplementos de potássio']),

('Omeprazol', 'Omeprazol', 'Inibidor da bomba de prótons', 'Cápsula', 
 ARRAY['Hipersensibilidade aos IBPs'], 
 ARRAY['Cefaleia', 'Diarreia', 'Náusea', 'Deficiência de B12'],
 ARRAY['Sinvastatina', 'Clonazepam', 'Metformina', 'Varfarina']),

('Sinvastatina', 'Sinvastatina', 'Inibidor da HMG-CoA redutase', 'Comprimido', 
 ARRAY['Doença hepática ativa', 'Miopatia', 'Gravidez'], 
 ARRAY['Mialgia', 'Elevação das transaminases', 'Cefaleia'],
 ARRAY['Ciprofibrato', 'Colchicina', 'Omeprazol', 'Anlodipino']),

('Ciprofibrato', 'Ciprofibrato', 'Derivado do ácido fíbrico', 'Comprimido', 
 ARRAY['Insuficiência hepática', 'Insuficiência renal grave', 'Fotossensibilidade'], 
 ARRAY['Miopatia', 'Distúrbios GI', 'Elevação das transaminases'],
 ARRAY['Sinvastatina', 'Colchicina', 'Varfarina']),

('Colchicina', 'Colchicina', 'Alcaloide antigotoso', 'Comprimido', 
 ARRAY['Insuficiência renal grave', 'Insuficiência hepática', 'Distúrbios GI graves'], 
 ARRAY['Diarreia', 'Náusea', 'Vômito', 'Mialgia'],
 ARRAY['Ciprofibrato', 'Sinvastatina', 'Ácido valproico']),

('Alopurinol', 'Alopurinol', 'Inibidor da xantina oxidase', 'Comprimido', 
 ARRAY['Hipersensibilidade', 'Crise aguda de gota'], 
 ARRAY['Rash cutâneo', 'Síndrome de Stevens-Johnson', 'Hepatotoxicidade'],
 ARRAY['Ácido valproico', 'Diuréticos', 'Varfarina']),

('Metformina', 'Cloridrato de Metformina', 'Biguanida antidiabética', 'Comprimido', 
 ARRAY['Insuficiência renal', 'Acidose metabólica', 'Insuficiência cardíaca descompensada'], 
 ARRAY['Desconforto GI', 'Acidose láctica', 'Deficiência de B12'],
 ARRAY['Omeprazol', 'Álcool', 'Contraste iodado']),

('Flunarizina', 'Dicloridrato de Flunarizina', 'Bloqueador de canal de cálcio', 'Comprimido', 
 ARRAY['Doença de Parkinson', 'Depressão', 'Hipersensibilidade'], 
 ARRAY['Sonolência', 'Ganho de peso', 'Sintomas extrapiramidais'],
 ARRAY['Benzodiazepínicos', 'Álcool', 'Antidepressivos'])

ON CONFLICT (name) DO NOTHING;

-- Mensagem de sucesso
SELECT 'Schema criado com sucesso! Todas as tabelas, índices e dados iniciais foram inseridos.' as status;
