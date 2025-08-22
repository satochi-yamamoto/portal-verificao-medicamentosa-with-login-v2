-- SCRIPT COMPLETO PARA CONFIGURAÇÃO DO BANCO DE DADOS
-- Execute este script no Supabase Dashboard > SQL Editor

-- ========================================
-- PARTE 1: CRIAR TABELAS AUSENTES
-- ========================================

-- Criar tabela analysis_reports
CREATE TABLE IF NOT EXISTS analysis_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    medication_list TEXT NOT NULL,
    analysis_result TEXT NOT NULL,
    recommendations TEXT,
    risk_level VARCHAR(20) CHECK (risk_level IN ('low', 'moderate', 'high', 'critical')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_id VARCHAR(255)
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_analysis_reports_created_at ON analysis_reports(created_at);
CREATE INDEX IF NOT EXISTS idx_analysis_reports_session_id ON analysis_reports(session_id);
CREATE INDEX IF NOT EXISTS idx_analysis_reports_risk_level ON analysis_reports(risk_level);

-- Criar tabela interaction_logs
CREATE TABLE IF NOT EXISTS interaction_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    medication_ids TEXT[], -- Array de IDs ou nomes de medicamentos
    interaction_found BOOLEAN DEFAULT false,
    severity VARCHAR(20) CHECK (severity IN ('minor', 'moderate', 'major', 'critical')),
    interaction_details JSONB, -- Detalhes das interações encontradas
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_session VARCHAR(255)
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_interaction_logs_created_at ON interaction_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_interaction_logs_user_session ON interaction_logs(user_session);
CREATE INDEX IF NOT EXISTS idx_interaction_logs_interaction_found ON interaction_logs(interaction_found);
CREATE INDEX IF NOT EXISTS idx_interaction_logs_severity ON interaction_logs(severity);

-- ========================================
-- PARTE 2: VERIFICAR E CRIAR FUNÇÕES DE CACHE
-- ========================================

-- Função para gerar hash da combinação (se não existir)
CREATE OR REPLACE FUNCTION generate_combination_hash(medications JSONB)
RETURNS TEXT AS $$
BEGIN
    -- Ordena os medicamentos por nome para garantir hash consistente
    RETURN encode(
        digest(
            (SELECT jsonb_agg(med ORDER BY med->>'name', med->>'dosagem')
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

-- ========================================
-- PARTE 3: CONFIGURAÇÕES DE SEGURANÇA
-- ========================================

-- Desabilitar RLS para desenvolvimento (permitir acesso livre)
ALTER TABLE analysis_reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE interaction_logs DISABLE ROW LEVEL SECURITY;

-- Verificar se as tabelas de cache existem antes de desabilitar RLS
DO $$
BEGIN
    -- Tentar desabilitar RLS nas tabelas de cache
    BEGIN
        ALTER TABLE medications_cache DISABLE ROW LEVEL SECURITY;
    EXCEPTION
        WHEN undefined_table THEN
            -- Tabela não existe, ignorar
            NULL;
    END;
    
    BEGIN
        ALTER TABLE medication_combinations_cache DISABLE ROW LEVEL SECURITY;
    EXCEPTION
        WHEN undefined_table THEN
            -- Tabela não existe, ignorar
            NULL;
    END;
    
    BEGIN
        ALTER TABLE consultation_history DISABLE ROW LEVEL SECURITY;
    EXCEPTION
        WHEN undefined_table THEN
            -- Tabela não existe, ignorar
            NULL;
    END;
END $$;

-- ========================================
-- PARTE 4: COMENTÁRIOS E DOCUMENTAÇÃO
-- ========================================

-- Comentários para documentação
COMMENT ON TABLE analysis_reports IS 'Relatórios de análise de medicamentos gerados pelo sistema';
COMMENT ON TABLE interaction_logs IS 'Logs de verificação de interações medicamentosas';

COMMENT ON COLUMN analysis_reports.medication_list IS 'Lista de medicamentos analisados (formato texto)';
COMMENT ON COLUMN analysis_reports.analysis_result IS 'Resultado completo da análise da IA';
COMMENT ON COLUMN analysis_reports.recommendations IS 'Recomendações específicas baseadas na análise';
COMMENT ON COLUMN analysis_reports.risk_level IS 'Nível de risco identificado: low, moderate, high, critical';

COMMENT ON COLUMN interaction_logs.medication_ids IS 'Array com IDs ou nomes dos medicamentos verificados';
COMMENT ON COLUMN interaction_logs.interaction_found IS 'Se alguma interação foi encontrada na verificação';
COMMENT ON COLUMN interaction_logs.severity IS 'Severidade da interação mais crítica encontrada';
COMMENT ON COLUMN interaction_logs.interaction_details IS 'Detalhes em JSON das interações encontradas';

COMMENT ON FUNCTION generate_combination_hash IS 'Gera hash único para combinação de medicamentos';
COMMENT ON FUNCTION get_cached_combination IS 'Verifica se combinação existe no cache e se está válida';
COMMENT ON FUNCTION save_combination_cache IS 'Salva nova combinação no cache';
COMMENT ON FUNCTION increment_combination_usage IS 'Incrementa contador de uso de uma combinação cached';

-- ========================================
-- PARTE 5: VERIFICAÇÃO FINAL
-- ========================================

-- Mostrar tabelas criadas
SELECT 
    schemaname,
    tablename,
    hasindexes,
    hasrules,
    hastriggers
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN (
        'analysis_reports',
        'interaction_logs',
        'medications_cache',
        'medication_combinations_cache',
        'consultation_history'
    )
ORDER BY tablename;

-- Mostrar funções criadas
SELECT 
    proname as function_name,
    pg_get_function_arguments(oid) as arguments,
    prokind as kind
FROM pg_proc 
WHERE proname IN (
    'generate_combination_hash',
    'get_cached_combination',
    'save_combination_cache',
    'increment_combination_usage'
)
ORDER BY proname;
