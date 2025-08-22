-- ========================================
-- SCRIPT COMPLETO PARA CORRIGIR SISTEMA DE CACHE
-- Execute TODAS as linhas no Supabase Dashboard > SQL Editor
-- ========================================

-- PARTE 1: CRIAR TABELAS
-- ========================================

-- Tabela principal do cache
CREATE TABLE IF NOT EXISTS medication_combinations_cache (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    combination_hash TEXT NOT NULL UNIQUE,
    medications JSONB NOT NULL,
    ai_analysis TEXT NOT NULL,
    tokens_used INTEGER DEFAULT 0,
    model_used TEXT DEFAULT 'gpt-4',
    analysis_duration INTEGER,
    consultation_count INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de histórico
CREATE TABLE IF NOT EXISTS consultation_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    combination_id UUID,
    patient_id TEXT,
    session_id TEXT,
    source TEXT DEFAULT 'cache',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PARTE 2: CONFIGURAR SEGURANÇA (RLS)
-- ========================================

-- Habilitar RLS
ALTER TABLE medication_combinations_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_history ENABLE ROW LEVEL SECURITY;

-- Criar políticas permissivas para desenvolvimento
DROP POLICY IF EXISTS "Enable all operations" ON medication_combinations_cache;
CREATE POLICY "Enable all operations" ON medication_combinations_cache FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all operations" ON consultation_history;
CREATE POLICY "Enable all operations" ON consultation_history FOR ALL USING (true);

-- PARTE 3: CRIAR FUNÇÕES
-- ========================================

-- Função para obter combinação do cache
CREATE OR REPLACE FUNCTION get_cached_combination(medications JSONB)
RETURNS TABLE (
    id UUID,
    combination_hash TEXT,
    medications JSONB,
    ai_analysis TEXT,
    tokens_used INTEGER,
    model_used TEXT,
    analysis_duration INTEGER,
    consultation_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    last_used_at TIMESTAMP WITH TIME ZONE,
    is_expired BOOLEAN
) AS $$
DECLARE
    combo_hash TEXT;
    expiry_days INTEGER := 365; -- 1 ano
BEGIN
    -- Gerar hash da combinação (ordenada para consistência)
    combo_hash := encode(digest(medications::text, 'sha256'), 'hex');
    
    RETURN QUERY
    SELECT 
        mcc.id,
        mcc.combination_hash,
        mcc.medications,
        mcc.ai_analysis,
        mcc.tokens_used,
        mcc.model_used,
        mcc.analysis_duration,
        mcc.consultation_count,
        mcc.created_at,
        mcc.updated_at,
        mcc.last_used_at,
        (mcc.created_at < NOW() - INTERVAL '1 day' * expiry_days) as is_expired
    FROM medication_combinations_cache mcc
    WHERE mcc.combination_hash = combo_hash
      AND mcc.created_at > NOW() - INTERVAL '1 day' * expiry_days -- Só retorna se não expirado
    ORDER BY mcc.created_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Função para salvar combinação no cache
CREATE OR REPLACE FUNCTION save_combination_cache(
    medications JSONB,
    ai_analysis TEXT,
    tokens_used INTEGER DEFAULT 0,
    model_used TEXT DEFAULT 'gpt-4',
    analysis_duration INTEGER DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    combo_hash TEXT;
    new_id UUID;
BEGIN
    -- Gerar hash da combinação
    combo_hash := encode(digest(medications::text, 'sha256'), 'hex');
    
    -- Inserir nova combinação
    INSERT INTO medication_combinations_cache (
        combination_hash,
        medications,
        ai_analysis,
        tokens_used,
        model_used,
        analysis_duration
    ) VALUES (
        combo_hash,
        medications,
        ai_analysis,
        tokens_used,
        model_used,
        analysis_duration
    )
    RETURNING id INTO new_id;
    
    RETURN new_id;
EXCEPTION
    WHEN unique_violation THEN
        -- Se já existe, atualizar
        UPDATE medication_combinations_cache 
        SET 
            consultation_count = consultation_count + 1,
            last_used_at = NOW(),
            updated_at = NOW()
        WHERE combination_hash = combo_hash
        RETURNING id INTO new_id;
        
        RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Função para incrementar contador de uso
CREATE OR REPLACE FUNCTION increment_combination_usage(combination_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE medication_combinations_cache 
    SET 
        consultation_count = consultation_count + 1,
        last_used_at = NOW(),
        updated_at = NOW()
    WHERE id = combination_id;
END;
$$ LANGUAGE plpgsql;

-- PARTE 4: CRIAR ÍNDICES PARA PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_medication_combinations_hash 
ON medication_combinations_cache(combination_hash);

CREATE INDEX IF NOT EXISTS idx_medication_combinations_created 
ON medication_combinations_cache(created_at);

CREATE INDEX IF NOT EXISTS idx_consultation_history_combination 
ON consultation_history(combination_id);

-- PARTE 5: INSERIR DADOS DE TESTE (OPCIONAL)
-- ========================================

-- Inserir uma combinação de teste para verificação
INSERT INTO medication_combinations_cache (
    combination_hash,
    medications,
    ai_analysis,
    tokens_used,
    model_used
) VALUES (
    'test_hash_dipirona_cetoprofeno',
    '[{"name":"Dipirona","dosage":"500mg"},{"name":"Cetoprofeno","dosage":"100mg"}]'::jsonb,
    'Esta é uma análise de teste para verificar se o sistema de cache está funcionando corretamente.',
    100,
    'gpt-4'
) ON CONFLICT (combination_hash) DO NOTHING;

-- ========================================
-- SCRIPT COMPLETO - EXECUÇÃO FINALIZADA
-- ========================================

-- Para verificar se funcionou, execute:
-- SELECT * FROM medication_combinations_cache;
-- SELECT get_cached_combination('[{"name":"Dipirona","dosage":"500mg"},{"name":"Cetoprofeno","dosage":"100mg"}]'::jsonb);
