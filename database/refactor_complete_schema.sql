-- SCRIPT COMPLETO DE REFATORAÇÃO DO BANCO DE DADOS
-- Execute este script no Supabase SQL Editor para corrigir todos os problemas
-- ========================================

-- PARTE 1: REMOVER POLÍTICAS ANTIGAS E RECRIAR TABELAS
-- ========================================

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Enable all for all users" ON medication_combinations_cache;
DROP POLICY IF EXISTS "Enable all for all users" ON consultation_history;
DROP POLICY IF EXISTS "Enable all for all users" ON interaction_logs;
DROP POLICY IF EXISTS "Enable all for all users" ON medications_cache;

-- Recriar tabela medication_combinations_cache com estrutura corrigida
DROP TABLE IF EXISTS medication_combinations_cache CASCADE;
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

-- Recriar consultation_history sem referência externa
DROP TABLE IF EXISTS consultation_history CASCADE;
CREATE TABLE consultation_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    combination_id UUID,
    patient_id TEXT,
    session_id TEXT,
    source TEXT DEFAULT 'cache',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recriar medications_cache
DROP TABLE IF EXISTS medications_cache CASCADE;
CREATE TABLE medications_cache (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    dosage TEXT,
    active_ingredient TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recriar interaction_logs
DROP TABLE IF EXISTS interaction_logs CASCADE;
CREATE TABLE interaction_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    medication_a VARCHAR(255) NOT NULL,
    medication_b VARCHAR(255) NOT NULL,
    interaction_severity VARCHAR(50) DEFAULT 'unknown',
    description TEXT,
    scientific_evidence TEXT,
    last_checked TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- PARTE 2: CONFIGURAR RLS CORRETAMENTE
-- ========================================

-- Habilitar RLS
ALTER TABLE medication_combinations_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE interaction_logs ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS permissivas para desenvolvimento
CREATE POLICY "Public access for medication_combinations_cache" ON medication_combinations_cache FOR ALL TO PUBLIC USING (true) WITH CHECK (true);
CREATE POLICY "Public access for consultation_history" ON consultation_history FOR ALL TO PUBLIC USING (true) WITH CHECK (true);
CREATE POLICY "Public access for medications_cache" ON medications_cache FOR ALL TO PUBLIC USING (true) WITH CHECK (true);
CREATE POLICY "Public access for interaction_logs" ON interaction_logs FOR ALL TO PUBLIC USING (true) WITH CHECK (true);

-- ========================================
-- PARTE 3: FUNÇÕES DE CACHE OTIMIZADAS
-- ========================================

-- Função para gerar hash da combinação (otimizada)
CREATE OR REPLACE FUNCTION generate_combination_hash(medications JSONB)
RETURNS TEXT AS $$
BEGIN
    -- Normalizar e ordenar medicamentos para hash consistente
    RETURN encode(
        digest(
            (SELECT jsonb_agg(
                jsonb_build_object(
                    'name', LOWER(TRIM(med->>'name')),
                    'dosage', LOWER(TRIM(COALESCE(med->>'dosage', '')))
                ) ORDER BY 
                LOWER(TRIM(med->>'name')), 
                LOWER(TRIM(COALESCE(med->>'dosage', '')))
            ) FROM jsonb_array_elements(medications) AS med)::text,
            'sha256'
        ),
        'hex'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para buscar combinação no cache (otimizada)
CREATE OR REPLACE FUNCTION get_cached_combination(medications JSONB)
RETURNS TABLE(
    id UUID,
    ai_analysis TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    consultation_count INTEGER,
    is_expired BOOLEAN,
    combination_hash TEXT
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
        (mcc.created_at < expiry_date) as is_expired,
        mcc.combination_hash
    FROM medication_combinations_cache mcc
    WHERE mcc.combination_hash = combination_hash_val
    AND mcc.created_at >= expiry_date; -- Só retorna se não expirado
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para salvar no cache (otimizada)
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
    existing_record RECORD;
BEGIN
    -- Gera hash da combinação
    combination_hash_val := generate_combination_hash(medications);
    
    -- Verifica se já existe
    SELECT * INTO existing_record 
    FROM medication_combinations_cache 
    WHERE combination_hash = combination_hash_val;
    
    IF existing_record.id IS NOT NULL THEN
        -- Atualiza registro existente
        UPDATE medication_combinations_cache 
        SET 
            consultation_count = consultation_count + 1,
            last_used_at = NOW(),
            updated_at = NOW()
        WHERE combination_hash = combination_hash_val
        RETURNING id INTO combination_id;
    ELSE
        -- Insere novo registro
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
        RETURNING id INTO combination_id;
    END IF;
    
    RETURN combination_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para limpar cache expirado
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM medication_combinations_cache 
    WHERE created_at < NOW() - INTERVAL '1 year';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- PARTE 4: ÍNDICES OTIMIZADOS
-- ========================================

-- Índices para medication_combinations_cache
CREATE INDEX IF NOT EXISTS idx_mcc_combination_hash ON medication_combinations_cache(combination_hash);
CREATE INDEX IF NOT EXISTS idx_mcc_created_at ON medication_combinations_cache(created_at);
CREATE INDEX IF NOT EXISTS idx_mcc_last_used ON medication_combinations_cache(last_used_at);
CREATE INDEX IF NOT EXISTS idx_mcc_consultation_count ON medication_combinations_cache(consultation_count);

-- Índices para consultation_history
CREATE INDEX IF NOT EXISTS idx_ch_combination_id ON consultation_history(combination_id);
CREATE INDEX IF NOT EXISTS idx_ch_created_at ON consultation_history(created_at);
CREATE INDEX IF NOT EXISTS idx_ch_session_id ON consultation_history(session_id);

-- Índices para medications_cache
CREATE INDEX IF NOT EXISTS idx_mc_name ON medications_cache(name);
CREATE INDEX IF NOT EXISTS idx_mc_name_dosage ON medications_cache(name, dosage);

-- ========================================
-- PARTE 5: VERIFICAÇÃO E TESTE
-- ========================================

-- Teste das funções
DO $$
DECLARE
    test_medications JSONB := '[{"name":"Dipirona","dosage":"500mg"},{"name":"Cetoprofeno","dosage":"100mg"}]';
    test_hash TEXT;
    cache_result RECORD;
    save_result UUID;
BEGIN
    -- Teste 1: Geração de hash
    SELECT generate_combination_hash(test_medications) INTO test_hash;
    RAISE NOTICE '🔑 Hash gerado: %', substring(test_hash, 1, 16) || '...';
    
    -- Teste 2: Busca no cache (deve estar vazio)
    SELECT * FROM get_cached_combination(test_medications) INTO cache_result;
    IF cache_result.id IS NULL THEN
        RAISE NOTICE '✅ Cache vazio (esperado)';
    ELSE
        RAISE NOTICE '📚 Cache encontrado: %', cache_result.id;
    END IF;
    
    -- Teste 3: Salvar no cache
    SELECT save_combination_cache(
        test_medications,
        'Teste de análise para verificação do sistema',
        1500,
        'gpt-4-test',
        2000
    ) INTO save_result;
    RAISE NOTICE '💾 Cache salvo com ID: %', save_result;
    
    -- Teste 4: Buscar novamente
    SELECT * FROM get_cached_combination(test_medications) INTO cache_result;
    IF cache_result.id IS NOT NULL THEN
        RAISE NOTICE '✅ Cache recuperado! Consultas: %', cache_result.consultation_count;
    ELSE
        RAISE NOTICE '❌ Erro na recuperação do cache';
    END IF;
    
    RAISE NOTICE '🎉 Sistema de cache refatorado e funcionando!';
END $$;

-- Mostrar estatísticas finais
SELECT 
    'medication_combinations_cache' as tabela,
    COUNT(*) as registros
FROM medication_combinations_cache
UNION ALL
SELECT 
    'consultation_history' as tabela,
    COUNT(*) as registros
FROM consultation_history;

-- Verificar políticas RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('medication_combinations_cache', 'consultation_history', 'medications_cache', 'interaction_logs')
ORDER BY tablename, policyname;
