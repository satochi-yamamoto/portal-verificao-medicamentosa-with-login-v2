-- ========================================
-- SCRIPT DE CORREÇÃO RLS - EXECUTE NO SUPABASE
-- ========================================

-- Remover políticas restritivas existentes
DROP POLICY IF EXISTS "Enable all operations" ON medication_combinations_cache;
DROP POLICY IF EXISTS "Enable all operations" ON consultation_history;

-- Desabilitar RLS temporariamente para desenvolvimento
ALTER TABLE medication_combinations_cache DISABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_history DISABLE ROW LEVEL SECURITY;

-- OU, se preferir manter RLS, criar políticas permissivas:
-- ALTER TABLE medication_combinations_cache ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE consultation_history ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Allow all access" ON medication_combinations_cache 
-- FOR ALL USING (true) WITH CHECK (true);

-- CREATE POLICY "Allow all access" ON consultation_history 
-- FOR ALL USING (true) WITH CHECK (true);

-- Verificar se funcionou
SELECT 'RLS Policies Fixed' as status;
