import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Verificação melhorada para as credenciais do Supabase
// const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const isTempKey = supabaseAnonKey?.includes('temporary') || supabaseAnonKey?.includes('test')
const isLocalDb = supabaseUrl?.includes('localhost') || supabaseUrl?.includes('127.0.0.1')

// Alerta para ambiente de desenvolvimento
if (import.meta.env.DEV && (isTempKey || isLocalDb)) {
  console.warn(
    '%c⚠️ Atenção: Configuração do Supabase %c\n' +
      'Você está usando credenciais temporárias ou locais para o Supabase.\n' +
      'Funcionalidades como autenticação, recuperação de senha, etc. não funcionarão corretamente.\n\n' +
      'Para corrigir:\n' +
      '1. Crie um projeto no Supabase: https://app.supabase.io\n' +
      '2. Obtenha suas credenciais em Project Settings > API\n' +
      '3. Atualize seu arquivo .env com valores reais\n',
    'background: #ff9800; color: white; font-weight: bold; padding: 2px 4px; border-radius: 2px;',
    'font-weight: normal;',
  )
}

// Validação para evitar erros ao inicializar com valores inválidos
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Variáveis de ambiente do Supabase não foram definidas.\n' +
      'Verifique seu arquivo .env e adicione VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.',
  )
}

// Inicialize o cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Função de diagnóstico para verificar a conexão com o Supabase
export async function checkSupabaseConnection() {
  try {
    const { error } = await supabase.auth.getSession()

    if (error) {
      console.error('Erro ao conectar com o Supabase:', error)
      return { success: false, error }
    }

    return { success: true }
  } catch (error) {
    console.error('Exceção ao verificar conexão do Supabase:', error)
    return { success: false, error }
  }
}
