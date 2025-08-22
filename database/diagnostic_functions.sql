-- Funções SQL para diagnóstico do banco de dados
-- Execute estas funções no SQL Editor do Supabase para adicionar capacidades de diagnóstico

-- Função para verificar colunas de uma tabela
CREATE OR REPLACE FUNCTION get_table_columns(table_name text)
RETURNS TABLE(
  column_name text,
  data_type text,
  is_nullable text,
  column_default text
) 
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    c.column_name::text,
    c.data_type::text,
    c.is_nullable::text,
    c.column_default::text
  FROM information_schema.columns c
  WHERE c.table_name = $1
    AND c.table_schema = 'public'
  ORDER BY c.ordinal_position;
$$;

-- Função para verificar extensões instaladas
CREATE OR REPLACE FUNCTION check_extensions()
RETURNS TABLE(
  extension_name text,
  installed_version text,
  available boolean
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    e.extname::text as extension_name,
    e.extversion::text as installed_version,
    true as available
  FROM pg_extension e
  WHERE e.extname IN ('pg_trgm', 'uuid-ossp', 'pgcrypto')
  
  UNION ALL
  
  SELECT 
    ext.name::text as extension_name,
    NULL as installed_version,
    false as available
  FROM (
    VALUES 
      ('pg_trgm'::text),
      ('uuid-ossp'::text), 
      ('pgcrypto'::text)
  ) AS ext(name)
  WHERE NOT EXISTS (
    SELECT 1 FROM pg_extension e2 
    WHERE e2.extname = ext.name
  );
$$;

-- Função para verificar se tabelas existem
CREATE OR REPLACE FUNCTION check_table_exists(table_name text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = $1
  );
$$;

-- Função para contar registros em todas as tabelas do sistema
CREATE OR REPLACE FUNCTION get_table_counts()
RETURNS TABLE(
  table_name text,
  record_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  tbl_name text;
  query text;
  count_val bigint;
BEGIN
  -- Lista das tabelas do sistema
  FOR tbl_name IN 
    SELECT t.table_name::text
    FROM information_schema.tables t
    WHERE t.table_schema = 'public'
      AND t.table_name IN ('medications', 'drug_interactions', 'analysis_reports', 'interaction_logs')
  LOOP
    query := 'SELECT COUNT(*) FROM public.' || quote_ident(tbl_name);
    EXECUTE query INTO count_val;
    
    table_name := tbl_name;
    record_count := count_val;
    RETURN NEXT;
  END LOOP;
  
  RETURN;
END;
$$;

-- Função para verificar status das políticas RLS
CREATE OR REPLACE FUNCTION check_rls_status()
RETURNS TABLE(
  table_name text,
  rls_enabled boolean,
  policies_count bigint
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    t.tablename::text,
    t.rowsecurity as rls_enabled,
    COUNT(p.policyname) as policies_count
  FROM pg_tables t
  LEFT JOIN pg_policies p ON p.tablename = t.tablename
  WHERE t.schemaname = 'public'
    AND t.tablename IN ('medications', 'drug_interactions', 'analysis_reports', 'interaction_logs')
  GROUP BY t.tablename, t.rowsecurity
  ORDER BY t.tablename;
$$;

-- Função para setup automático básico (cria tabelas se não existirem)
CREATE OR REPLACE FUNCTION setup_database_schema()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result_msg text := '';
BEGIN
  -- Verificar e criar tabela medications
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'medications') THEN
    CREATE TABLE medications (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      generic_name VARCHAR(255),
      dosage VARCHAR(100),
      form VARCHAR(100),
      therapeutic_class VARCHAR(255),
      indication TEXT,
      contraindications TEXT,
      side_effects TEXT,
      active_principle VARCHAR(255),
      manufacturer VARCHAR(255),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    result_msg := result_msg || 'Tabela medications criada. ';
  END IF;

  -- Verificar e criar tabela drug_interactions
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'drug_interactions') THEN
    CREATE TABLE drug_interactions (
      id SERIAL PRIMARY KEY,
      drug1_id INTEGER REFERENCES medications(id),
      drug2_id INTEGER REFERENCES medications(id),
      interaction_type VARCHAR(50) NOT NULL,
      severity VARCHAR(20) NOT NULL,
      description TEXT NOT NULL,
      mechanism TEXT,
      clinical_significance TEXT,
      recommendations TEXT,
      evidence_level VARCHAR(20),
      references TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    result_msg := result_msg || 'Tabela drug_interactions criada. ';
  END IF;

  -- Verificar e criar tabela analysis_reports  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'analysis_reports') THEN
    CREATE TABLE analysis_reports (
      id SERIAL PRIMARY KEY,
      medication_list TEXT NOT NULL,
      analysis_result TEXT NOT NULL,
      recommendations TEXT,
      risk_level VARCHAR(20),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      session_id VARCHAR(255)
    );
    result_msg := result_msg || 'Tabela analysis_reports criada. ';
  END IF;

  -- Verificar e criar tabela interaction_logs
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'interaction_logs') THEN
    CREATE TABLE interaction_logs (
      id SERIAL PRIMARY KEY,
      medication_ids INTEGER[],
      interaction_found BOOLEAN,
      severity VARCHAR(20),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      user_session VARCHAR(255)
    );
    result_msg := result_msg || 'Tabela interaction_logs criada. ';
  END IF;

  -- Desabilitar RLS para desenvolvimento
  ALTER TABLE medications DISABLE ROW LEVEL SECURITY;
  ALTER TABLE drug_interactions DISABLE ROW LEVEL SECURITY;
  ALTER TABLE analysis_reports DISABLE ROW LEVEL SECURITY;
  ALTER TABLE interaction_logs DISABLE ROW LEVEL SECURITY;
  
  result_msg := result_msg || 'RLS desabilitado para desenvolvimento.';

  IF result_msg = 'RLS desabilitado para desenvolvimento.' THEN
    result_msg := 'Todas as tabelas já existem. ' || result_msg;
  END IF;

  RETURN result_msg;
END;
$$;
