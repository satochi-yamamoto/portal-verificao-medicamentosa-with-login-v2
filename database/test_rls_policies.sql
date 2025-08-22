-- TESTE DAS POLÍTICAS RLS
-- Execute este script após aplicar as políticas para verificar se tudo está funcionando
-- ========================================

-- Testar inserção na tabela analysis_reports
INSERT INTO analysis_reports (
    medication_list,
    analysis_result,
    recommendations,
    created_at
) VALUES (
    'Teste RLS - Dipirona, Paracetamol',
    'Esta é uma análise de teste para verificar se o RLS está funcionando corretamente.',
    'Recomendações de teste',
    NOW()
);

-- Testar leitura da tabela analysis_reports
SELECT 
    id,
    medication_list,
    created_at
FROM analysis_reports
WHERE medication_list LIKE '%Teste RLS%'
ORDER BY created_at DESC
LIMIT 1;

-- Testar inserção na tabela consultation_logs
INSERT INTO consultation_logs (
    session_id,
    medications_list,
    medications_count,
    analysis_request,
    analysis_response,
    analysis_duration_ms,
    tokens_used,
    status
) VALUES (
    'test-rls-session-' || extract(epoch from now()),
    '[{"name": "Teste RLS", "dosage": "500mg"}]',
    1,
    'Análise de interações medicamentosas - Teste RLS',
    'Teste de RLS realizado com sucesso - sem interações encontradas',
    1500,
    100,
    'completed'
);

-- Testar inserção na tabela interaction_logs (se existir)
INSERT INTO interaction_logs (
    medication_a,
    medication_b,
    interaction_severity,
    description,
    created_at
) VALUES (
    'Teste RLS Med A',
    'Teste RLS Med B',
    'low',
    'Teste de inserção RLS na tabela interaction_logs',
    NOW()
);

-- Testar inserção na tabela consultation_history (se existir)
INSERT INTO consultation_history (
    patient_info,
    medications_analyzed,
    result_summary,
    created_at
) VALUES (
    'Paciente teste RLS',
    'Medicamentos teste RLS',
    'Resultado teste RLS',
    NOW()
);

-- Testar leitura das tabelas principais
SELECT 'medications' as tabela, COUNT(*) as registros FROM medications
UNION ALL
SELECT 'drug_interactions' as tabela, COUNT(*) as registros FROM drug_interactions
UNION ALL
SELECT 'analysis_reports' as tabela, COUNT(*) as registros FROM analysis_reports
UNION ALL
SELECT 'consultation_logs' as tabela, COUNT(*) as registros FROM consultation_logs;

-- Testar leitura das tabelas de cache (podem estar vazias)
SELECT 
    'medications_cache' as tabela,
    COUNT(*) as registros
FROM medications_cache
UNION ALL
SELECT 
    'medication_combinations_cache' as tabela,
    COUNT(*) as registros
FROM medication_combinations_cache;

-- Verificar se conseguimos ler de todas as tabelas
SELECT 'Teste completo: todas as tabelas são acessíveis!' as resultado;

-- ========================================
-- LIMPEZA DOS DADOS DE TESTE (OPCIONAL)
-- ========================================
-- Descomente as linhas abaixo para limpar os dados de teste

-- DELETE FROM analysis_reports WHERE medication_list LIKE '%Teste RLS%';
-- DELETE FROM consultation_logs WHERE session_id LIKE '%test-rls-session%';
-- DELETE FROM interaction_logs WHERE medication_a LIKE '%Teste RLS%';
-- DELETE FROM consultation_history WHERE patient_info LIKE '%Paciente teste RLS%';

-- Verificar se a limpeza foi bem-sucedida
-- SELECT 'Dados de teste removidos com sucesso!' as resultado;
