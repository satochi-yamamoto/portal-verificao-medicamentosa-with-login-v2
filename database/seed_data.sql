-- Dados iniciais para a base de medicamentos
-- Baseado nos medicamentos fornecidos no exemplo

INSERT INTO medications (name, active_ingredient, therapeutic_class, dosage_form, contraindications, side_effects, interactions) VALUES
('Nitrazepam', 'Nitrazepam', 'Benzodiazepínico', 'Comprimido', 
 ARRAY['Miastenia gravis', 'Insuficiência respiratória grave', 'Hipersensibilidade', 'Glaucoma de ângulo estreito'], 
 ARRAY['Sonolência', 'Ataxia', 'Confusão mental', 'Dependência', 'Amnésia anterógrada'], 
 ARRAY['Álcool', 'Opioides', 'Ácido valproico', 'Olanzapina', 'Outros depressores do SNC']),

('Clonazepam', 'Clonazepam', 'Benzodiazepínico antiepiléptico', 'Comprimido', 
 ARRAY['Glaucoma de ângulo estreito', 'Miastenia gravis', 'Insuficiência hepática grave', 'Hipersensibilidade'], 
 ARRAY['Sedação', 'Ataxia', 'Tontura', 'Fadiga', 'Alterações comportamentais'], 
 ARRAY['Ácido valproico', 'Omeprazol', 'Álcool', 'Outros sedativos', 'Fenitoína']),

('Ácido Valproico', 'Ácido Valproico', 'Antiepiléptico', 'Comprimido/Xarope', 
 ARRAY['Hepatopatia', 'Porfiria', 'Distúrbios do ciclo da ureia', 'Hipersensibilidade'], 
 ARRAY['Hepatotoxicidade', 'Trombocitopenia', 'Alopecia', 'Ganho de peso', 'Tremor'], 
 ARRAY['Fenobarbital', 'Fenitoína', 'Lamotrigina', 'Colchicina', 'Benzodiazepínicos']),

('Olanzapina', 'Olanzapina', 'Antipsicótico atípico', 'Comprimido', 
 ARRAY['Hipersensibilidade', 'Glaucoma de ângulo fechado', 'Íleo paralítico'], 
 ARRAY['Ganho de peso', 'Sedação', 'Dislipidemias', 'Diabetes', 'Hiperprolactinemia'], 
 ARRAY['Benzodiazepínicos', 'Ácido valproico', 'Ciprofibrato', 'Álcool', 'Carbamazepina']),

('Anlodipino', 'Besilato de Anlodipino', 'Bloqueador de canal de cálcio', 'Comprimido', 
 ARRAY['Hipersensibilidade', 'Choque cardiogênico', 'Estenose aórtica grave'], 
 ARRAY['Edema periférico', 'Cefaleia', 'Fadiga', 'Rubor', 'Palpitações'], 
 ARRAY['Sinvastatina', 'Omeprazol', 'Sucos cítricos', 'Rifampicina', 'Diltiazem']),

('Losartana', 'Losartana Potássica', 'Antagonista dos receptores da angiotensina II', 'Comprimido', 
 ARRAY['Hipersensibilidade', 'Estenose bilateral da artéria renal', 'Gravidez'], 
 ARRAY['Hipotensão', 'Hipercalemia', 'Tosse seca', 'Tontura', 'Fadiga'], 
 ARRAY['Diuréticos', 'AINEs', 'Lítio', 'Suplementos de potássio', 'Heparina']),

('Omeprazol', 'Omeprazol', 'Inibidor da bomba de prótons', 'Cápsula', 
 ARRAY['Hipersensibilidade', 'Atrofia gástrica'], 
 ARRAY['Cefaleia', 'Diarreia', 'Náusea', 'Dor abdominal', 'Deficiência de B12'], 
 ARRAY['Sinvastatina', 'Clonazepam', 'Metformina', 'Clopidogrel', 'Warfarina']),

('Sinvastatina', 'Sinvastatina', 'Inibidor da HMG-CoA redutase', 'Comprimido', 
 ARRAY['Hepatopatia ativa', 'Miopatia', 'Gravidez', 'Hipersensibilidade'], 
 ARRAY['Mialgia', 'Cefaleia', 'Alterações hepáticas', 'Rabdomiólise', 'Constipação'], 
 ARRAY['Ciprofibrato', 'Colchicina', 'Omeprazol', 'Anlodipino', 'Amiodarona']),

('Ciprofibrato', 'Ciprofibrato', 'Fibrato', 'Comprimido', 
 ARRAY['Hepatopatia', 'Vesícula biliar', 'Insuficiência renal grave', 'Hipersensibilidade'], 
 ARRAY['Miopatia', 'Dispepsia', 'Cefaleia', 'Alterações hepáticas', 'Cálculos biliares'], 
 ARRAY['Sinvastatina', 'Colchicina', 'Varfarina', 'Ciclosporina', 'Pravastatina']),

('Colchicina', 'Colchicina', 'Antigotoso', 'Comprimido', 
 ARRAY['Insuficiência renal grave', 'Insuficiência hepática', 'Discrasias sanguíneas'], 
 ARRAY['Diarreia', 'Náusea', 'Vômito', 'Mialgia', 'Neuropatia'], 
 ARRAY['Ciprofibrato', 'Sinvastatina', 'Ácido valproico', 'Ciclosporina', 'Digoxina']),

('Alopurinol', 'Alopurinol', 'Inibidor da xantina oxidase', 'Comprimido', 
 ARRAY['Hipersensibilidade', 'Hemocromatose', 'Crise aguda de gota'], 
 ARRAY['Rash cutâneo', 'Hepatotoxicidade', 'Síndrome de Stevens-Johnson', 'Nefrite'], 
 ARRAY['Ácido valproico', 'Diuréticos', 'Warfarina', 'Azatioprina', 'Mercaptopurina']),

('Metformina', 'Cloridrato de Metformina', 'Antidiabético (biguanida)', 'Comprimido', 
 ARRAY['Insuficiência renal', 'Acidose metabólica', 'Insuficiência cardíaca descompensada'], 
 ARRAY['Distúrbios gastrointestinais', 'Acidose láctica', 'Deficiência de B12', 'Sabor metálico'], 
 ARRAY['Omeprazol', 'Álcool', 'Contrastes iodados', 'Corticoides', 'Diuréticos']),

('Flunarizina', 'Dicloridrato de Flunarizina', 'Bloqueador de canal de cálcio', 'Comprimido', 
 ARRAY['Doença de Parkinson', 'Depressão', 'Hipersensibilidade'], 
 ARRAY['Sonolência', 'Ganho de peso', 'Depressão', 'Parkinsonismo', 'Galactorreia'], 
 ARRAY['Benzodiazepínicos', 'Álcool', 'Antipsicóticos', 'Levodopa', 'Antidepressivos']);

-- Interações medicamentosas principais
INSERT INTO drug_interactions (medication_a_id, medication_b_id, interaction_type, severity_level, severity_text, mechanism, clinical_effect, management, monitoring, evidence_level, scientific_sources) VALUES

-- Nitrazepam + Álcool (representado por interação com depressores)
((SELECT id FROM medications WHERE name = 'Nitrazepam'), 
 (SELECT id FROM medications WHERE name = 'Olanzapina'), 
 'pharmacodynamic', 4, 'major', 
 'Depressão sinérgica do sistema nervoso central',
 'Aumento da sedação e risco de depressão respiratória',
 'Evitar uso concomitante. Se necessário, reduzir doses e monitorar intensivamente.',
 'Sonolência excessiva, depressão respiratória, alterações cognitivas',
 'high',
 ARRAY['Stockley''s Drug Interactions', 'Micromedex Drug Interactions']),

-- Clonazepam + Ácido Valproico
((SELECT id FROM medications WHERE name = 'Clonazepam'), 
 (SELECT id FROM medications WHERE name = 'Ácido Valproico'), 
 'pharmacokinetic', 3, 'moderate', 
 'Competição metabólica, inibição do CYP3A4',
 'Aumento dos níveis plasmáticos de clonazepam',
 'Considerar redução da dose de clonazepam. Monitorar efeitos adversos.',
 'Sonolência, ataxia, confusão mental',
 'moderate',
 ARRAY['Clinical Pharmacokinetics', 'Drug Metabolism Reviews']),

-- Sinvastatina + Ciprofibrato
((SELECT id FROM medications WHERE name = 'Sinvastatina'), 
 (SELECT id FROM medications WHERE name = 'Ciprofibrato'), 
 'pharmacodynamic', 5, 'major', 
 'Risco aumentado de miopatia por mecanismos farmacodinâmicos',
 'Risco significativo de rabdomiólise',
 'Evitar combinação. Se necessário, usar doses mínimas e monitorar CK rigorosamente.',
 'CK, mialgia, fraqueza muscular, urina escura',
 'high',
 ARRAY['New England Journal of Medicine', 'Circulation', 'Cochrane Reviews']),

-- Omeprazol + Clonazepam
((SELECT id FROM medications WHERE name = 'Omeprazol'), 
 (SELECT id FROM medications WHERE name = 'Clonazepam'), 
 'pharmacokinetic', 2, 'minor', 
 'Alteração do metabolismo via CYP3A4',
 'Possível alteração dos níveis de clonazepam',
 'Monitorar resposta clínica. Ajustar dose se necessário.',
 'Eficácia terapêutica do clonazepam',
 'low',
 ARRAY['Clinical Pharmacology & Therapeutics']),

-- Colchicina + Ácido Valproico
((SELECT id FROM medications WHERE name = 'Colchicina'), 
 (SELECT id FROM medications WHERE name = 'Ácido Valproico'), 
 'pharmacodynamic', 3, 'moderate', 
 'Risco aumentado de mielossupressão',
 'Potencial toxicidade hematológica',
 'Monitorar hemograma regularmente. Considerar alternativas.',
 'Hemograma completo, sinais de infecção',
 'moderate',
 ARRAY['Hematology Reviews', 'Clinical Hematology']),

-- Anlodipino + Sinvastatina
((SELECT id FROM medications WHERE name = 'Anlodipino'), 
 (SELECT id FROM medications WHERE name = 'Sinvastatina'), 
 'pharmacokinetic', 3, 'moderate', 
 'Inibição do CYP3A4 pelo anlodipino',
 'Aumento do risco de miopatia',
 'Limitar sinvastatina a 20mg/dia quando usado com anlodipino.',
 'Sinais de miopatia, CK se sintomas',
 'high',
 ARRAY['FDA Drug Safety Communication', 'European Medicines Agency']);

-- Inserir algumas fontes científicas de exemplo
INSERT INTO scientific_sources (title, authors, journal, publication_date, doi, summary, evidence_quality) VALUES
('Drug-drug interactions in clinical practice: a comprehensive review', 
 ARRAY['Smith J', 'Johnson A', 'Brown K'], 
 'Clinical Pharmacology Reviews', 
 '2023-06-15', 
 '10.1016/j.cpr.2023.06.001',
 'Revisão abrangente sobre interações medicamentosas clinicamente relevantes, incluindo mecanismos e estratégias de manejo.',
 'systematic_review'),

('Benzodiazepine interactions with CNS depressants: A meta-analysis', 
 ARRAY['Garcia M', 'Wilson R'], 
 'Journal of Clinical Psychopharmacology', 
 '2023-03-20', 
 '10.1097/JCP.2023.03.002',
 'Meta-análise dos riscos associados ao uso concomitante de benzodiazepínicos com outros depressores do SNC.',
 'systematic_review'),

('Statin-fibrate combination therapy: Risk assessment and clinical guidelines', 
 ARRAY['Davis L', 'Thompson P', 'Anderson C'], 
 'Cardiology Today', 
 '2023-01-10', 
 '10.1016/j.cardio.2023.01.003',
 'Diretrizes clínicas para o uso seguro da combinação estatina-fibrato, incluindo protocolos de monitoramento.',
 'rct');
