-- SQL para criar as tabelas ausentes no Supabase
-- Execute este código no Supabase Dashboard > SQL Editor

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

-- Desabilitar RLS para desenvolvimento (se necessário)
ALTER TABLE analysis_reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE interaction_logs DISABLE ROW LEVEL SECURITY;

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
