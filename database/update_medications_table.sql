-- ========================================
-- ATUALIZAÇÃO DA TABELA MEDICATIONS PARA CAPTURA AUTOMÁTICA
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- ========================================

-- Verificar se a tabela medications existe
CREATE TABLE IF NOT EXISTS medications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    active_ingredient TEXT,
    therapeutic_class TEXT,
    dosage_form TEXT,
    contraindications TEXT[],
    side_effects TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar novos campos para captura automática
DO $$
BEGIN
    -- Campo para nome normalizado
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'medications' AND column_name = 'normalized_name') THEN
        ALTER TABLE medications ADD COLUMN normalized_name TEXT;
        CREATE INDEX IF NOT EXISTS idx_medications_normalized_name ON medications(normalized_name);
    END IF;
    
    -- Campo para dosagem
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'medications' AND column_name = 'dosage') THEN
        ALTER TABLE medications ADD COLUMN dosage TEXT;
    END IF;
    
    -- Campo para origem dos dados
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'medications' AND column_name = 'source') THEN
        ALTER TABLE medications ADD COLUMN source TEXT DEFAULT 'manual';
    END IF;
    
    -- Campo para contador de consultas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'medications' AND column_name = 'consultation_count') THEN
        ALTER TABLE medications ADD COLUMN consultation_count INTEGER DEFAULT 0;
    END IF;
    
    -- Campo para primeira consulta
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'medications' AND column_name = 'first_consulted_at') THEN
        ALTER TABLE medications ADD COLUMN first_consulted_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Campo para última consulta
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'medications' AND column_name = 'last_consulted_at') THEN
        ALTER TABLE medications ADD COLUMN last_consulted_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Campo para IDs de análises relacionadas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'medications' AND column_name = 'analysis_ids') THEN
        ALTER TABLE medications ADD COLUMN analysis_ids TEXT[];
    END IF;
    
    -- Campo para metadados JSON
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'medications' AND column_name = 'metadata') THEN
        ALTER TABLE medications ADD COLUMN metadata JSONB;
    END IF;

    RAISE NOTICE 'Campos adicionados com sucesso à tabela medications';
END $$;

-- Criar índices para otimização
CREATE INDEX IF NOT EXISTS idx_medications_name ON medications(name);
CREATE INDEX IF NOT EXISTS idx_medications_source ON medications(source);
CREATE INDEX IF NOT EXISTS idx_medications_consultation_count ON medications(consultation_count DESC);
CREATE INDEX IF NOT EXISTS idx_medications_last_consulted ON medications(last_consulted_at DESC);

-- Função para buscar medicamentos por análise
CREATE OR REPLACE FUNCTION get_medications_by_analysis(analysis_id TEXT)
RETURNS TABLE (
    id UUID,
    name TEXT,
    dosage TEXT,
    consultation_count INTEGER,
    first_consulted_at TIMESTAMP WITH TIME ZONE,
    last_consulted_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id,
        m.name,
        m.dosage,
        m.consultation_count,
        m.first_consulted_at,
        m.last_consulted_at
    FROM medications m
    WHERE analysis_id = ANY(m.analysis_ids)
    ORDER BY m.last_consulted_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Função para obter estatísticas de medicamentos capturados
CREATE OR REPLACE FUNCTION get_medication_capture_stats()
RETURNS TABLE (
    total_medications INTEGER,
    consultation_medications INTEGER,
    total_consultations INTEGER,
    most_consulted_name TEXT,
    most_consulted_count INTEGER
) AS $$
DECLARE
    most_consulted RECORD;
BEGIN
    -- Buscar medicamento mais consultado
    SELECT name, consultation_count INTO most_consulted
    FROM medications
    WHERE source = 'consultation_capture'
    ORDER BY consultation_count DESC
    LIMIT 1;
    
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*)::INTEGER FROM medications) as total_medications,
        (SELECT COUNT(*)::INTEGER FROM medications WHERE source = 'consultation_capture') as consultation_medications,
        (SELECT COALESCE(SUM(consultation_count), 0)::INTEGER FROM medications WHERE source = 'consultation_capture') as total_consultations,
        COALESCE(most_consulted.name, 'Nenhum'::TEXT) as most_consulted_name,
        COALESCE(most_consulted.consultation_count, 0) as most_consulted_count;
END;
$$ LANGUAGE plpgsql;

-- Desabilitar RLS para permitir inserções (para desenvolvimento)
ALTER TABLE medications DISABLE ROW LEVEL SECURITY;

-- Verificação final
SELECT 
    'TABELA MEDICATIONS ATUALIZADA COM SUCESSO!' as status,
    COUNT(*) as total_existing_medications
FROM medications;

-- Testar as novas funções
SELECT * FROM get_medication_capture_stats();
