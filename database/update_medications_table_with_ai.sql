-- ========================================
-- ATUALIZAÇÃO DA TABELA MEDICATIONS PARA CAPTURA AUTOMÁTICA COM DADOS DA IA
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- ========================================

-- Verificar se a tabela medications existe
CREATE TABLE IF NOT EXISTS medications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar TODOS os campos necessários para captura automática e dados da IA
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

    -- ========================================
    -- NOVOS CAMPOS PARA DADOS ESTRUTURADOS DA IA
    -- ========================================
    
    -- Princípio ativo
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'medications' AND column_name = 'active_ingredient') THEN
        ALTER TABLE medications ADD COLUMN active_ingredient TEXT;
    END IF;
    
    -- Classe terapêutica
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'medications' AND column_name = 'therapeutic_class') THEN
        ALTER TABLE medications ADD COLUMN therapeutic_class TEXT;
    END IF;
    
    -- Mecanismo de ação
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'medications' AND column_name = 'mechanism_of_action') THEN
        ALTER TABLE medications ADD COLUMN mechanism_of_action TEXT;
    END IF;
    
    -- Indicações principais (array)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'medications' AND column_name = 'main_indications') THEN
        ALTER TABLE medications ADD COLUMN main_indications TEXT[];
    END IF;
    
    -- Contraindicações (array)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'medications' AND column_name = 'contraindications') THEN
        ALTER TABLE medications ADD COLUMN contraindications TEXT[];
    END IF;
    
    -- Efeitos adversos comuns (array)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'medications' AND column_name = 'common_side_effects') THEN
        ALTER TABLE medications ADD COLUMN common_side_effects TEXT[];
    END IF;
    
    -- Interações importantes (array)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'medications' AND column_name = 'important_interactions') THEN
        ALTER TABLE medications ADD COLUMN important_interactions TEXT[];
    END IF;
    
    -- Populações especiais (JSON)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'medications' AND column_name = 'special_populations') THEN
        ALTER TABLE medications ADD COLUMN special_populations JSONB;
    END IF;
    
    -- Monitoramento (array)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'medications' AND column_name = 'monitoring') THEN
        ALTER TABLE medications ADD COLUMN monitoring TEXT[];
    END IF;
    
    -- Instruções de administração
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'medications' AND column_name = 'administration_instructions') THEN
        ALTER TABLE medications ADD COLUMN administration_instructions TEXT;
    END IF;
    
    -- Formas farmacêuticas (array)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'medications' AND column_name = 'dosage_forms') THEN
        ALTER TABLE medications ADD COLUMN dosage_forms TEXT[];
    END IF;
    
    -- Condições de armazenamento
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'medications' AND column_name = 'storage_conditions') THEN
        ALTER TABLE medications ADD COLUMN storage_conditions TEXT;
    END IF;
    
    -- Categoria farmacêutica
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'medications' AND column_name = 'pharmacy_category') THEN
        ALTER TABLE medications ADD COLUMN pharmacy_category TEXT;
    END IF;

    RAISE NOTICE 'Todos os campos adicionados com sucesso à tabela medications (incluindo dados da IA)';
END $$;

-- Criar índices para otimização
CREATE INDEX IF NOT EXISTS idx_medications_name ON medications(name);
CREATE INDEX IF NOT EXISTS idx_medications_active_ingredient ON medications(active_ingredient);
CREATE INDEX IF NOT EXISTS idx_medications_therapeutic_class ON medications(therapeutic_class);
CREATE INDEX IF NOT EXISTS idx_medications_source ON medications(source);
CREATE INDEX IF NOT EXISTS idx_medications_consultation_count ON medications(consultation_count DESC);
CREATE INDEX IF NOT EXISTS idx_medications_last_consulted ON medications(last_consulted_at DESC);
CREATE INDEX IF NOT EXISTS idx_medications_pharmacy_category ON medications(pharmacy_category);

-- Função para obter estatísticas de medicamentos capturados
CREATE OR REPLACE FUNCTION get_medication_capture_stats()
RETURNS TABLE (
    total_medications INTEGER,
    consultation_medications INTEGER,
    total_consultations INTEGER,
    most_consulted_name TEXT,
    most_consulted_count INTEGER,
    ai_enriched_medications INTEGER
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
        COALESCE(most_consulted.consultation_count, 0) as most_consulted_count,
        (SELECT COUNT(*)::INTEGER FROM medications WHERE active_ingredient IS NOT NULL AND source = 'consultation_capture') as ai_enriched_medications;
END;
$$ LANGUAGE plpgsql;

-- Função para buscar medicamentos com dados completos
CREATE OR REPLACE FUNCTION get_detailed_medications()
RETURNS TABLE (
    id UUID,
    name TEXT,
    active_ingredient TEXT,
    therapeutic_class TEXT,
    mechanism_of_action TEXT,
    main_indications TEXT[],
    contraindications TEXT[],
    common_side_effects TEXT[],
    important_interactions TEXT[],
    special_populations JSONB,
    monitoring TEXT[],
    administration_instructions TEXT,
    dosage_forms TEXT[],
    storage_conditions TEXT,
    pharmacy_category TEXT,
    consultation_count INTEGER,
    last_consulted_at TIMESTAMP WITH TIME ZONE,
    source TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id,
        m.name,
        m.active_ingredient,
        m.therapeutic_class,
        m.mechanism_of_action,
        m.main_indications,
        m.contraindications,
        m.common_side_effects,
        m.important_interactions,
        m.special_populations,
        m.monitoring,
        m.administration_instructions,
        m.dosage_forms,
        m.storage_conditions,
        m.pharmacy_category,
        m.consultation_count,
        m.last_consulted_at,
        m.source
    FROM medications m
    WHERE m.source = 'consultation_capture'
    ORDER BY m.consultation_count DESC, m.last_consulted_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Verificação final
SELECT 
    'TABELA MEDICATIONS ATUALIZADA COM SUCESSO!' as status,
    COUNT(*) as total_existing_medications
FROM medications;
