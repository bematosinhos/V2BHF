-- Habilitar extensão para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Criar tabela de profissionais
CREATE TABLE IF NOT EXISTS professionals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  status TEXT CHECK (status IN ('active', 'inactive', 'vacation')),
  start_date DATE NOT NULL,
  avatar_url TEXT,
  cpf TEXT,
  birth_date DATE,
  work_hours TEXT,
  work_city TEXT,
  salary TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de registros de tempo
CREATE TABLE IF NOT EXISTS time_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  check_in TEXT,
  check_out TEXT,
  break_start TEXT,
  break_end TEXT,
  type TEXT CHECK (type IN ('regular', 'overtime', 'dayoff', 'vacation')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_records ENABLE ROW LEVEL SECURITY;

-- Criar políticas para usuários autenticados
CREATE POLICY "Usuários autenticados podem ver todos os profissionais"
ON professionals FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Usuários autenticados podem gerenciar profissionais"
ON professionals FOR ALL
TO authenticated
USING (true);

CREATE POLICY "Usuários autenticados podem ver todos os registros"
ON time_records FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Usuários autenticados podem gerenciar registros"
ON time_records FOR ALL
TO authenticated
USING (true);

-- Funções para criar as tabelas via RPC (usado no script de migração)
CREATE OR REPLACE FUNCTION create_professionals_table()
RETURNS VOID AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS professionals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    status TEXT CHECK (status IN ('active', 'inactive', 'vacation')),
    start_date DATE NOT NULL,
    avatar_url TEXT,
    cpf TEXT,
    birth_date DATE,
    work_hours TEXT,
    work_city TEXT,
    salary TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION create_time_records_table()
RETURNS VOID AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS time_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    check_in TEXT,
    check_out TEXT,
    break_start TEXT,
    break_end TEXT,
    type TEXT CHECK (type IN ('regular', 'overtime', 'dayoff', 'vacation')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 