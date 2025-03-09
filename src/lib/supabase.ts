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

// Inicialize o cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Status da conexão
let isOffline = false;
let lastConnectionCheck = 0;
const CONNECTION_CHECK_INTERVAL = 30000; // 30 segundos

// Monitorar status de conexão
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('🟢 Aplicação está online');
    isOffline = false;
  });
  
  window.addEventListener('offline', () => {
    console.log('🔴 Aplicação está offline');
    isOffline = true;
  });
}

// Verificar status da conexão com o Supabase
export async function isSupabaseAvailable(): Promise<boolean> {
  // Se o navegador reporta que estamos offline, nem tenta
  if (isOffline) {
    return false;
  }
  
  // Limitar frequência de verificações
  const now = Date.now();
  if (now - lastConnectionCheck < CONNECTION_CHECK_INTERVAL) {
    return !isOffline; // Retorna o último status conhecido
  }
  
  lastConnectionCheck = now;
  
  try {
    const { error } = await supabase.auth.getSession();
    const isAvailable = !error;
    
    // Atualizar status
    isOffline = !isAvailable;
    
    return isAvailable;
  } catch (error) {
    console.error('Erro ao verificar conexão com Supabase:', error);
    isOffline = true;
    return false;
  }
}

// Função para tratar respostas do Supabase de forma consistente
export function handleSupabaseError(error: any, customMessage?: string): Error {
  if (!error) return new Error(customMessage || 'Erro desconhecido');
  
  const message = error.message || error.error_description || customMessage || 'Erro na operação';
  console.error('Erro do Supabase:', { message, details: error });
  
  // Customizar mensagens baseado no tipo de erro
  if (message.includes('network') || message.includes('fetch')) {
    return new Error('Erro de conexão com o servidor. Verifique sua internet.');
  }
  
  return new Error(message);
}

// Função auxiliar para adicionar timeout em operações do Supabase
export function withSupabaseTimeout<T>(
  operation: Promise<T>,
  timeoutMs: number = 15000,
  operationName: string = 'operação'
): Promise<T> {
  return Promise.race([
    operation,
    new Promise<T>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Tempo limite excedido ao ${operationName}. Verifique sua conexão.`));
      }, timeoutMs);
    })
  ]);
}

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
