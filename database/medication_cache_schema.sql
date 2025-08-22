-- Tabela para armazenar medicamentos únicos
CREATE TABLE IF NOT EXISTS medications_cache (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    dosage TEXT,
    active_ingredient TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para busca rápida por nome
CREATE INDEX IF NOT EXISTS idx_medications_cache_name ON medications_cache(name);
CREATE INDEX IF NOT EXISTS idx_medications_cache_name_dosage ON medications_cache(name, dosage);

-- Tabela para armazenar combinações de medicamentos e seus resultados
CREATE TABLE IF NOT EXISTS medication_combinations_cache (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    combination_hash TEXT NOT NULL UNIQUE, -- Hash da combinação para identificação única
    medications JSONB NOT NULL, -- Array de medicamentos com nome e dosagem
    ai_analysis TEXT NOT NULL, -- Resultado da análise da IA
    tokens_used INTEGER DEFAULT 0,
    model_used TEXT DEFAULT 'gpt-4',
    analysis_duration INTEGER, -- Duração em milissegundos
    consultation_count INTEGER DEFAULT 1, -- Quantas vezes foi consultada
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_combination_hash ON medication_combinations_cache(combination_hash);
CREATE INDEX IF NOT EXISTS idx_combinations_created_at ON medication_combinations_cache(created_at);
CREATE INDEX IF NOT EXISTS idx_combinations_last_used ON medication_combinations_cache(last_used_at);

-- Tabela para histórico de consultas (referência às combinações)
CREATE TABLE IF NOT EXISTS consultation_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    combination_id UUID REFERENCES medication_combinations_cache(id),
    patient_id TEXT,
    session_id TEXT,
    source TEXT DEFAULT 'cache', -- 'api' ou 'cache'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para consulta de histórico
CREATE INDEX IF NOT EXISTS idx_consultation_history_combination ON consultation_history(combination_id);
CREATE INDEX IF NOT EXISTS idx_consultation_history_created_at ON consultation_history(created_at);

-- Função para gerar hash da combinação
CREATE OR REPLACE FUNCTION generate_combination_hash(medications JSONB)
RETURNS TEXT AS $$
BEGIN
    -- Ordena os medicamentos por nome para garantir hash consistente
    RETURN encode(
        digest(
            (SELECT jsonb_agg(med ORDER BY med->>'name', med->>'dosage')
             FROM jsonb_array_elements(medications) AS med)::text,
            'sha256'
        ),
        'hex'
    );
END;
$$ LANGUAGE plpgsql;

-- Função para verificar se combinação existe e não está expirada
CREATE OR REPLACE FUNCTION get_cached_combination(medications JSONB)
RETURNS TABLE(
    id UUID,
    ai_analysis TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    consultation_count INTEGER,
    is_expired BOOLEAN
) AS $$
DECLARE
    combination_hash_val TEXT;
    expiry_date TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Gera hash da combinação
    combination_hash_val := generate_combination_hash(medications);
    
    -- Define data de expiração (1 ano atrás)
    expiry_date := NOW() - INTERVAL '1 year';
    
    -- Busca combinação no cache
    RETURN QUERY
    SELECT 
        mcc.id,
        mcc.ai_analysis,
        mcc.created_at,
        mcc.consultation_count,
        (mcc.created_at < expiry_date) as is_expired
    FROM medication_combinations_cache mcc
    WHERE mcc.combination_hash = combination_hash_val;
END;
$$ LANGUAGE plpgsql;

-- Função para salvar nova combinação no cache
CREATE OR REPLACE FUNCTION save_combination_cache(
    medications JSONB,
    ai_analysis TEXT,
    tokens_used INTEGER DEFAULT 0,
    model_used TEXT DEFAULT 'gpt-4',
    analysis_duration INTEGER DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    combination_hash_val TEXT;
    combination_id UUID;
BEGIN
    -- Gera hash da combinação
    combination_hash_val := generate_combination_hash(medications);
    
    -- Insere ou atualiza a combinação
    INSERT INTO medication_combinations_cache (
        combination_hash,
        medications,
        ai_analysis,
        tokens_used,
        model_used,
        analysis_duration,
        consultation_count,
        last_used_at
    ) VALUES (
        combination_hash_val,
        medications,
        ai_analysis,
        tokens_used,
        model_used,
        analysis_duration,
        1,
        NOW()
    )
    ON CONFLICT (combination_hash) DO UPDATE SET
        consultation_count = medication_combinations_cache.consultation_count + 1,
        last_used_at = NOW(),
        updated_at = NOW()
    RETURNING id INTO combination_id;
    
    RETURN combination_id;
END;
$$ LANGUAGE plpgsql;

-- Função para incrementar contador de uso
CREATE OR REPLACE FUNCTION increment_combination_usage(combination_hash_val TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE medication_combinations_cache 
    SET 
        consultation_count = consultation_count + 1,
        last_used_at = NOW(),
        updated_at = NOW()
    WHERE combination_hash = combination_hash_val;
END;
$$ LANGUAGE plpgsql;

-- Comentários para documentação
COMMENT ON TABLE medications_cache IS 'Cache de medicamentos únicos para referência';
COMMENT ON TABLE medication_combinations_cache IS 'Cache de combinações de medicamentos e suas análises';
COMMENT ON TABLE consultation_history IS 'Histórico de consultas realizadas';
COMMENT ON FUNCTION generate_combination_hash IS 'Gera hash único para combinação de medicamentos';
COMMENT ON FUNCTION get_cached_combination IS 'Verifica se combinação existe no cache e se está válida';
COMMENT ON FUNCTION save_combination_cache IS 'Salva nova combinação no cache';
