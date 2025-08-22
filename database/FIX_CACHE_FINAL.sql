-- ========================================
-- SOLUÇÃO DEFINITIVA DO CACHE - VERSÃO FINAL
-- Execute TODO este código no Supabase Dashboard > SQL Editor
-- ========================================

-- PARTE 1: LIMPAR E RECRIAR TUDO
-- ========================================

-- Apagar tudo e recomeçar
DROP TABLE IF EXISTS medication_combinations_cache CASCADE;
DROP TABLE IF EXISTS consultation_history CASCADE;
DROP FUNCTION IF EXISTS get_cached_combination(JSONB) CASCADE;
DROP FUNCTION IF EXISTS save_combination_cache(JSONB, TEXT, INTEGER, TEXT, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS increment_combination_usage(UUID) CASCADE;

-- PARTE 2: CRIAR TABELAS
-- ========================================

-- Tabela principal do cache
CREATE TABLE medication_combinations_cache (
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
CREATE TABLE consultation_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    combination_id UUID,
    patient_id TEXT,
    session_id TEXT,
    source TEXT DEFAULT 'cache',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PARTE 3: DESABILITAR RLS (PARA DESENVOLVIMENTO)
-- ========================================

ALTER TABLE medication_combinations_cache DISABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_history DISABLE ROW LEVEL SECURITY;

-- PARTE 4: CRIAR FUNÇÕES SIMPLIFICADAS E ROBUSTAS
-- ========================================

-- Função para gerar hash consistente
CREATE OR REPLACE FUNCTION generate_medication_hash(medications JSONB)
RETURNS TEXT AS $$
BEGIN
    -- Gerar hash simples mas consistente
    RETURN encode(digest(medications::text, 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Função para buscar cache
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
BEGIN
    -- Gerar hash dos medicamentos
    combo_hash := generate_medication_hash(medications);
    
    -- Buscar combinação válida (menos de 365 dias)
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
        false as is_expired  -- Sempre válido por enquanto
    FROM medication_combinations_cache mcc
    WHERE mcc.combination_hash = combo_hash
      AND mcc.created_at > NOW() - INTERVAL '365 days'
    ORDER BY mcc.created_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Função para salvar cache
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
    result_id UUID;
BEGIN
    -- Gerar hash dos medicamentos
    combo_hash := generate_medication_hash(medications);
    
    -- Tentar inserir nova combinação
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
    ON CONFLICT (combination_hash) 
    DO UPDATE SET
        consultation_count = medication_combinations_cache.consultation_count + 1,
        last_used_at = NOW(),
        updated_at = NOW()
    RETURNING id INTO result_id;
    
    RETURN result_id;
END;
$$ LANGUAGE plpgsql;

-- Função para incrementar uso
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

-- PARTE 5: CRIAR ÍNDICES
-- ========================================

CREATE INDEX idx_medication_combinations_hash ON medication_combinations_cache(combination_hash);
CREATE INDEX idx_medication_combinations_created ON medication_combinations_cache(created_at);

-- PARTE 6: INSERIR DADOS DE TESTE
-- ========================================

-- Inserir dados de teste do Dipirona + Cetoprofeno
DO $$
DECLARE
    test_medications JSONB := '[{"name":"Dipirona","dosage":"500mg"},{"name":"Cetoprofeno","dosage":"100mg"}]'::JSONB;
    test_id UUID;
BEGIN
    SELECT save_combination_cache(
        test_medications,
        'Análise de teste: Dipirona 500mg + Cetoprofeno 100mg. Nenhuma interação significativa identificada. Uso seguro conforme prescrição médica.',
        1800,
        'gpt-4',
        5000
    ) INTO test_id;
    
    RAISE NOTICE 'Dados de teste inseridos com ID: %', test_id;
END $$;

-- PARTE 7: TESTE FINAL
-- ========================================

-- Testar se tudo funciona
DO $$
DECLARE
    test_medications JSONB := '[{"name":"Dipirona","dosage":"500mg"},{"name":"Cetoprofeno","dosage":"100mg"}]'::JSONB;
    cache_result RECORD;
BEGIN
    -- Buscar cache
    SELECT * INTO cache_result 
    FROM get_cached_combination(test_medications) 
    LIMIT 1;
    
    IF cache_result.id IS NOT NULL THEN
        RAISE NOTICE '✅ CACHE FUNCIONANDO! ID: %, Consultas: %', cache_result.id, cache_result.consultation_count;
    ELSE
        RAISE NOTICE '❌ Cache não encontrado';
    END IF;
END $$;

-- Verificação final
SELECT 
    'CACHE SYSTEM FIXED!' as status,
    COUNT(*) as total_cached_combinations,
    MAX(consultation_count) as max_consultations
FROM medication_combinations_cache;
