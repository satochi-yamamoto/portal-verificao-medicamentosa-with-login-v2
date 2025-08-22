-- Inserção de Interações Medicamentosas Conhecidas
-- Execute este arquivo APÓS o schema_fixed.sql

-- Função auxiliar para encontrar IDs de medicamentos por nome
CREATE OR REPLACE FUNCTION get_medication_id(med_name TEXT)
RETURNS UUID AS $$
DECLARE
    med_id UUID;
BEGIN
    SELECT id INTO med_id FROM medications WHERE name = med_name;
    RETURN med_id;
END;
$$ LANGUAGE plpgsql;

-- Inserir interações medicamentosas baseadas no conhecimento farmacológico
INSERT INTO drug_interactions (
    medication_a_id, 
    medication_b_id, 
    interaction_type, 
    severity_level, 
    severity_text, 
    mechanism, 
    clinical_effect, 
    management, 
    monitoring, 
    evidence_level,
    scientific_sources
) VALUES 

-- Nitrazepam + Álcool (representado por outros depressores)
(get_medication_id('Nitrazepam'), get_medication_id('Olanzapina'), 
 'pharmacodynamic', 5, 'major',
 'Depressão sinérgica do sistema nervoso central',
 'Aumento da sedação e risco de depressão respiratória',
 'Evitar combinação. Se necessário, reduzir doses e monitorar sinais vitais',
 'Sonolência excessiva, depressão respiratória, alterações cognitivas',
 'high',
 ARRAY['Clinical Pharmacology & Therapeutics', 'Benzodiazepine Guidelines']),

-- Clonazepam + Ácido Valproico
(get_medication_id('Clonazepam'), get_medication_id('Ácido Valproico'), 
 'pharmacokinetic', 3, 'moderate',
 'Competição metabólica, inibição do CYP3A4',
 'Aumento dos níveis plasmáticos de clonazepam',
 'Considerar redução da dose de clonazepam. Monitorar efeitos adversos',
 'Sonolência, ataxia, confusão mental',
 'moderate',
 ARRAY['Epilepsia Guidelines', 'Drug Metabolism Reviews']),

-- Sinvastatina + Ciprofibrato
(get_medication_id('Sinvastatina'), get_medication_id('Ciprofibrato'), 
 'pharmacodynamic', 5, 'major',
 'Risco aumentado de miopatia por mecanismos farmacodinâmicos',
 'Risco significativo de rabdomiólise',
 'Evitar combinação. Se necessário, usar doses mínimas e monitorar CK',
 'CK, mialgia, fraqueza muscular, urina escura',
 'high',
 ARRAY['Statin Safety Guidelines', 'NEJM Statin Studies']),

-- Omeprazol + Clonazepam
(get_medication_id('Omeprazol'), get_medication_id('Clonazepam'), 
 'pharmacokinetic', 2, 'minor',
 'Alteração do metabolismo via CYP3A4',
 'Possível alteração dos níveis de clonazepam',
 'Monitorar resposta clínica. Ajustar dose se necessário',
 'Eficácia terapêutica do clonazepam',
 'low',
 ARRAY['CYP450 Interaction Database']),

-- Anlodipino + Sinvastatina
(get_medication_id('Anlodipino'), get_medication_id('Sinvastatina'), 
 'pharmacokinetic', 3, 'moderate',
 'Inibição do CYP3A4 pelo anlodipino',
 'Aumento do risco de miopatia',
 'Limitar sinvastatina a 20mg/dia quando usado com anlodipino',
 'Sinais de miopatia, CK se sintomas',
 'high',
 ARRAY['FDA Safety Communications', 'Cardiology Guidelines']),

-- Colchicina + Ácido Valproico
(get_medication_id('Colchicina'), get_medication_id('Ácido Valproico'), 
 'pharmacodynamic', 3, 'moderate',
 'Risco aumentado de mielossupressão',
 'Potencial toxicidade hematológica',
 'Monitorar hemograma regularmente. Considerar alternativas',
 'Hemograma completo, sinais de infecção',
 'moderate',
 ARRAY['Hematology Reviews', 'Drug Safety Bulletins']),

-- Metformina + Omeprazol
(get_medication_id('Metformina'), get_medication_id('Omeprazol'), 
 'pharmacokinetic', 2, 'minor',
 'Possível alteração da absorção da metformina',
 'Possível aumento dos níveis de metformina',
 'Monitorar controle glicêmico e função renal',
 'Glicemia, função renal, sintomas GI',
 'low',
 ARRAY['Diabetes Care Journal']),

-- Losartana + Alopurinol
(get_medication_id('Losartana'), get_medication_id('Alopurinol'), 
 'pharmacodynamic', 2, 'minor',
 'Possível potencialização de efeitos anti-hipertensivos',
 'Risco de hipotensão em alguns pacientes',
 'Monitorar pressão arterial, especialmente no início',
 'Pressão arterial, sinais de hipotensão',
 'low',
 ARRAY['Hypertension Guidelines']),

-- Flunarizina + Clonazepam
(get_medication_id('Flunarizina'), get_medication_id('Clonazepam'), 
 'pharmacodynamic', 3, 'moderate',
 'Potencialização dos efeitos depressores do SNC',
 'Aumento da sedação e sintomas extrapiramidais',
 'Iniciar com doses baixas. Monitorar sinais extrapiramidais',
 'Sedação, movimentos involuntários, parkinsonismo',
 'moderate',
 ARRAY['Neurological Therapeutics']),

-- Sinvastatina + Colchicina
(get_medication_id('Sinvastatina'), get_medication_id('Colchicina'), 
 'pharmacodynamic', 4, 'major',
 'Risco sinérgico de miotoxicidade',
 'Risco aumentado de miopatia e rabdomiólise',
 'Evitar se possível. Se necessário, usar doses mínimas',
 'CK, mialgia, função renal',
 'high',
 ARRAY['Muscle Toxicity Studies', 'Clinical Safety Reviews'])

ON CONFLICT DO NOTHING;

-- Remover função auxiliar
DROP FUNCTION get_medication_id(TEXT);

-- Verificar inserções
SELECT 
    COUNT(*) as total_interactions,
    COUNT(CASE WHEN severity_text = 'major' THEN 1 END) as major_interactions,
    COUNT(CASE WHEN severity_text = 'moderate' THEN 1 END) as moderate_interactions,
    COUNT(CASE WHEN severity_text = 'minor' THEN 1 END) as minor_interactions
FROM drug_interactions;
