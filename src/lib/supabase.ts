import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

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

// Inicialize o cliente Supabase com configurações otimizadas
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    // Aumento do timeout para ambientes de produção (30s por padrão)
    fetch: (url, options) => {
      const timeout = import.meta.env.PROD ? 40000 : 30000 // 40 segundos em produção, 30 em desenvolvimento
      return fetch(url, {
        ...options,
        signal: AbortSignal.timeout(timeout), // Configura um timeout para requisições
      })
    },
  },
  // Configurações de persistência de cache para otimizar desempenho
  db: {
    schema: 'public',
  },
  realtime: {
    // Configurações para realtime em produção
    timeout: 60000, // 60 segundos para websockets 
  },
})

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
