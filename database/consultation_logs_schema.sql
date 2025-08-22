-- Criação da tabela de logs de consultas
CREATE TABLE IF NOT EXISTS consultation_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT NOT NULL,
    user_id TEXT,
    medications_count INTEGER NOT NULL,
    medications_list JSONB NOT NULL,
    analysis_request TEXT NOT NULL,
    analysis_response TEXT,
    analysis_duration_ms INTEGER,
    tokens_used INTEGER,
    model_used TEXT DEFAULT 'gpt-4',
    status TEXT CHECK (status IN ('pending', 'completed', 'error', 'timeout')) DEFAULT 'pending',
    error_message TEXT,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para otimização de consultas
CREATE INDEX IF NOT EXISTS idx_consultation_logs_created_at ON consultation_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_consultation_logs_session_id ON consultation_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_consultation_logs_status ON consultation_logs(status);
CREATE INDEX IF NOT EXISTS idx_consultation_logs_medications_count ON consultation_logs(medications_count);

-- RLS (Row Level Security)
ALTER TABLE consultation_logs ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserção
CREATE POLICY "Enable insert for all users" ON consultation_logs
    FOR INSERT WITH CHECK (true);

-- Política para leitura (todos podem ler)
CREATE POLICY "Enable read access for all users" ON consultation_logs
    FOR SELECT USING (true);

-- Política para atualização
CREATE POLICY "Enable update for all users" ON consultation_logs
    FOR UPDATE USING (true);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_consultation_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_consultation_logs_updated_at ON consultation_logs;
CREATE TRIGGER update_consultation_logs_updated_at
    BEFORE UPDATE ON consultation_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_consultation_logs_updated_at();
