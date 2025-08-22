-- CONFIGURAÇÃO DE ROW LEVEL SECURITY (RLS) PARA TODAS AS TABELAS
-- Execute este script no Supabase Dashboard > SQL Editor
-- ========================================

-- ========================================
-- HABILITAR RLS PARA TODAS AS TABELAS
-- ========================================

-- Habilitar RLS na tabela analysis_reports
ALTER TABLE analysis_reports ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS na tabela consultation_logs (se ainda não estiver habilitado)
ALTER TABLE consultation_logs ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS nas tabelas adicionais
ALTER TABLE consultation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE interaction_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_combinations_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications_cache ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS nas tabelas principais do sistema
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE drug_interactions ENABLE ROW LEVEL SECURITY;

-- ========================================
-- POLÍTICAS PARA TABELA analysis_reports
-- ========================================

-- Política para permitir leitura pública (todos podem ler)
CREATE POLICY "Allow public read access on analysis_reports"
ON analysis_reports
FOR SELECT
TO PUBLIC
USING (true);

-- Política para permitir inserção pública (todos podem inserir)
CREATE POLICY "Allow public insert access on analysis_reports"
ON analysis_reports
FOR INSERT
TO PUBLIC
WITH CHECK (true);

-- Política para permitir atualização pública (todos podem atualizar)
CREATE POLICY "Allow public update access on analysis_reports"
ON analysis_reports
FOR UPDATE
TO PUBLIC
USING (true)
WITH CHECK (true);

-- ========================================
-- POLÍTICAS PARA TABELA consultation_logs
-- ========================================

-- Remover políticas existentes se houver conflito
DROP POLICY IF EXISTS "Allow public read access on consultation_logs" ON consultation_logs;
DROP POLICY IF EXISTS "Allow public insert access on consultation_logs" ON consultation_logs;
DROP POLICY IF EXISTS "Allow public update access on consultation_logs" ON consultation_logs;

-- Política para permitir leitura pública
CREATE POLICY "Allow public read access on consultation_logs"
ON consultation_logs
FOR SELECT
TO PUBLIC
USING (true);

-- Política para permitir inserção pública
CREATE POLICY "Allow public insert access on consultation_logs"
ON consultation_logs
FOR INSERT
TO PUBLIC
WITH CHECK (true);

-- Política para permitir atualização pública
CREATE POLICY "Allow public update access on consultation_logs"
ON consultation_logs
FOR UPDATE
TO PUBLIC
USING (true)
WITH CHECK (true);

-- ========================================
-- POLÍTICAS PARA TABELA consultation_history
-- ========================================

-- Remover políticas existentes se houver conflito
DROP POLICY IF EXISTS "Allow public read access on consultation_history" ON consultation_history;
DROP POLICY IF EXISTS "Allow public insert access on consultation_history" ON consultation_history;
DROP POLICY IF EXISTS "Allow public update access on consultation_history" ON consultation_history;

-- Política para permitir leitura pública
CREATE POLICY "Allow public read access on consultation_history"
ON consultation_history
FOR SELECT
TO PUBLIC
USING (true);

-- Política para permitir inserção pública
CREATE POLICY "Allow public insert access on consultation_history"
ON consultation_history
FOR INSERT
TO PUBLIC
WITH CHECK (true);

-- Política para permitir atualização pública
CREATE POLICY "Allow public update access on consultation_history"
ON consultation_history
FOR UPDATE
TO PUBLIC
USING (true)
WITH CHECK (true);

-- ========================================
-- POLÍTICAS PARA TABELA interaction_logs
-- ========================================

-- Remover políticas existentes se houver conflito
DROP POLICY IF EXISTS "Allow public read access on interaction_logs" ON interaction_logs;
DROP POLICY IF EXISTS "Allow public insert access on interaction_logs" ON interaction_logs;
DROP POLICY IF EXISTS "Allow public update access on interaction_logs" ON interaction_logs;

-- Política para permitir leitura pública
CREATE POLICY "Allow public read access on interaction_logs"
ON interaction_logs
FOR SELECT
TO PUBLIC
USING (true);

-- Política para permitir inserção pública
CREATE POLICY "Allow public insert access on interaction_logs"
ON interaction_logs
FOR INSERT
TO PUBLIC
WITH CHECK (true);

-- Política para permitir atualização pública
CREATE POLICY "Allow public update access on interaction_logs"
ON interaction_logs
FOR UPDATE
TO PUBLIC
USING (true)
WITH CHECK (true);

-- ========================================
-- POLÍTICAS PARA TABELA medication_combinations_cache
-- ========================================

-- Remover políticas existentes se houver conflito
DROP POLICY IF EXISTS "Allow public read access on medication_combinations_cache" ON medication_combinations_cache;
DROP POLICY IF EXISTS "Allow public insert access on medication_combinations_cache" ON medication_combinations_cache;
DROP POLICY IF EXISTS "Allow public update access on medication_combinations_cache" ON medication_combinations_cache;

-- Política para permitir leitura pública
CREATE POLICY "Allow public read access on medication_combinations_cache"
ON medication_combinations_cache
FOR SELECT
TO PUBLIC
USING (true);

-- Política para permitir inserção pública
CREATE POLICY "Allow public insert access on medication_combinations_cache"
ON medication_combinations_cache
FOR INSERT
TO PUBLIC
WITH CHECK (true);

-- Política para permitir atualização pública
CREATE POLICY "Allow public update access on medication_combinations_cache"
ON medication_combinations_cache
FOR UPDATE
TO PUBLIC
USING (true)
WITH CHECK (true);

-- ========================================
-- POLÍTICAS PARA TABELA medications_cache
-- ========================================

-- Remover políticas existentes se houver conflito
DROP POLICY IF EXISTS "Allow public read access on medications_cache" ON medications_cache;
DROP POLICY IF EXISTS "Allow public insert access on medications_cache" ON medications_cache;
DROP POLICY IF EXISTS "Allow public update access on medications_cache" ON medications_cache;

-- Política para permitir leitura pública
CREATE POLICY "Allow public read access on medications_cache"
ON medications_cache
FOR SELECT
TO PUBLIC
USING (true);

-- Política para permitir inserção pública
CREATE POLICY "Allow public insert access on medications_cache"
ON medications_cache
FOR INSERT
TO PUBLIC
WITH CHECK (true);

-- Política para permitir atualização pública
CREATE POLICY "Allow public update access on medications_cache"
ON medications_cache
FOR UPDATE
TO PUBLIC
USING (true)
WITH CHECK (true);

-- ========================================
-- POLÍTICAS PARA TABELA medications
-- ========================================

-- Remover políticas existentes se houver conflito
DROP POLICY IF EXISTS "Allow public read access on medications" ON medications;
DROP POLICY IF EXISTS "Allow public insert access on medications" ON medications;
DROP POLICY IF EXISTS "Allow public update access on medications" ON medications;

-- Política para permitir leitura pública
CREATE POLICY "Allow public read access on medications"
ON medications
FOR SELECT
TO PUBLIC
USING (true);

-- Política para permitir inserção pública
CREATE POLICY "Allow public insert access on medications"
ON medications
FOR INSERT
TO PUBLIC
WITH CHECK (true);

-- Política para permitir atualização pública
CREATE POLICY "Allow public update access on medications"
ON medications
FOR UPDATE
TO PUBLIC
USING (true)
WITH CHECK (true);

-- ========================================
-- POLÍTICAS PARA TABELA drug_interactions
-- ========================================

-- Remover políticas existentes se houver conflito
DROP POLICY IF EXISTS "Allow public read access on drug_interactions" ON drug_interactions;
DROP POLICY IF EXISTS "Allow public insert access on drug_interactions" ON drug_interactions;
DROP POLICY IF EXISTS "Allow public update access on drug_interactions" ON drug_interactions;

-- Política para permitir leitura pública
CREATE POLICY "Allow public read access on drug_interactions"
ON drug_interactions
FOR SELECT
TO PUBLIC
USING (true);

-- Política para permitir inserção pública
CREATE POLICY "Allow public insert access on drug_interactions"
ON drug_interactions
FOR INSERT
TO PUBLIC
WITH CHECK (true);

-- Política para permitir atualização pública
CREATE POLICY "Allow public update access on drug_interactions"
ON drug_interactions
FOR UPDATE
TO PUBLIC
USING (true)
WITH CHECK (true);

-- ========================================
-- VERIFICAR CONFIGURAÇÕES
-- ========================================

-- Verificar se RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN (
    'analysis_reports', 
    'consultation_logs',
    'consultation_history',
    'interaction_logs',
    'medication_combinations_cache',
    'medications_cache',
    'medications',
    'drug_interactions'
) AND schemaname = 'public'
ORDER BY tablename;

-- Listar todas as políticas criadas
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
WHERE tablename IN (
    'analysis_reports', 
    'consultation_logs',
    'consultation_history',
    'interaction_logs',
    'medication_combinations_cache',
    'medications_cache',
    'medications',
    'drug_interactions'
) AND schemaname = 'public'
ORDER BY tablename, policyname;

-- ========================================
-- OBSERVAÇÕES IMPORTANTES
-- ========================================

/*
NOTA: As políticas criadas permitem acesso público completo (leitura, inserção e atualização).
Isso é apropriado para este sistema onde:

1. Os dados não contêm informações pessoais sensíveis
2. O sistema é público e não requer autenticação
3. As consultas são anônimas por design

Se no futuro você quiser implementar autenticação e controle de acesso mais granular:

1. Remova as políticas públicas:
   DROP POLICY "Allow public read access on analysis_reports" ON analysis_reports;
   DROP POLICY "Allow public insert access on analysis_reports" ON analysis_reports;
   DROP POLICY "Allow public update access on analysis_reports" ON analysis_reports;

2. Crie políticas baseadas em usuários autenticados:
   CREATE POLICY "Users can read own reports" ON analysis_reports
   FOR SELECT TO authenticated
   USING (auth.uid() = user_id);

   CREATE POLICY "Users can insert own reports" ON analysis_reports
   FOR INSERT TO authenticated
   WITH CHECK (auth.uid() = user_id);

3. Adicione coluna user_id nas tabelas:
   ALTER TABLE analysis_reports ADD COLUMN user_id UUID REFERENCES auth.users(id);
*/
