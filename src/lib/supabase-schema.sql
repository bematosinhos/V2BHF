-- Tabela para armazenar as escalas
CREATE TABLE IF NOT EXISTS public.schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  professional_id UUID NOT NULL REFERENCES public.professionals(id),
  date DATE NOT NULL,
  day_type TEXT NOT NULL,
  start_time TEXT,
  end_time TEXT,
  balance NUMERIC,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para consulta eficiente
CREATE INDEX IF NOT EXISTS idx_schedules_professional_date ON public.schedules(professional_id, date);

-- Trigger para atualizar o updated_at automaticamente
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_timestamp ON public.schedules;
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON public.schedules
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Tabela para detalhes dos profissionais
CREATE TABLE IF NOT EXISTS public.professional_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  professional_id UUID NOT NULL REFERENCES public.professionals(id) UNIQUE,
  notes TEXT,
  balance_hours NUMERIC DEFAULT 0,
  vacation_days INTEGER DEFAULT 0,
  last_vacation_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger para atualizar o updated_at automaticamente
DROP TRIGGER IF EXISTS set_timestamp_prof_details ON public.professional_details;
CREATE TRIGGER set_timestamp_prof_details
BEFORE UPDATE ON public.professional_details
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Permissões RLS (Row Level Security)
-- Habilitar RLS nas tabelas
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_details ENABLE ROW LEVEL SECURITY;

-- Política para permitir acesso apenas a usuários autenticados
CREATE POLICY "Usuários autenticados podem ler escalas"
  ON public.schedules FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem inserir escalas"
  ON public.schedules FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem atualizar escalas"
  ON public.schedules FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem excluir escalas"
  ON public.schedules FOR DELETE
  USING (auth.role() = 'authenticated');

-- Políticas semelhantes para professional_details
CREATE POLICY "Usuários autenticados podem ler detalhes de profissionais"
  ON public.professional_details FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem inserir detalhes de profissionais"
  ON public.professional_details FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem atualizar detalhes de profissionais"
  ON public.professional_details FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem excluir detalhes de profissionais"
  ON public.professional_details FOR DELETE
  USING (auth.role() = 'authenticated'); 