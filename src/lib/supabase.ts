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

// Verificar a conectividade com a internet
function checkConnection() {
  return navigator.onLine
}

// Validação para evitar erros ao inicializar com valores inválidos
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Variáveis de ambiente do Supabase não foram definidas.\n' +
      'Verifique seu arquivo .env e adicione VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.',
  )
}

// Função para criar um fetch personalizado com retry para maior confiabilidade
const createRetryFetch = (maxRetries = 3, timeout = 60000) => {
  return async (url: RequestInfo | URL, options: RequestInit = {}): Promise<Response> => {
    let attempt = 0;
    let lastError: Error | null = null;

    // Configurar o AbortController para timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    // Mesclar signal do timeout com options existentes
    const fetchOptions = {
      ...options,
      signal: controller.signal,
    };

    while (attempt < maxRetries) {
      try {
        if (!checkConnection()) {
          throw new Error('Sem conexão com a internet');
        }

        attempt++;
        console.log(`Tentativa de fetch ${attempt}/${maxRetries} para ${url.toString()}`);
        
        const response = await fetch(url, fetchOptions);
        
        // Limpar o timeout
        clearTimeout(timeoutId);
        
        // Se a resposta não for bem-sucedida, tratar como erro
        if (!response.ok) {
          throw new Error(`Resposta HTTP não OK: ${response.status}`);
        }
        
        return response;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.error(`Erro na tentativa ${attempt}:`, lastError);
        
        // Se for o último retry, rejeitar
        if (attempt >= maxRetries) {
          break;
        }
        
        // Backoff exponencial
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
        console.log(`Aguardando ${delay}ms antes da próxima tentativa...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    // Limpar o timeout por precaução
    clearTimeout(timeoutId);
    
    // Se chegou aqui, todas as tentativas falharam
    throw lastError || new Error('Máximo de tentativas excedido');
  };
};

// Inicialize o cliente Supabase com configurações otimizadas
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    // Usa o fetch personalizado com retry
    fetch: createRetryFetch(3, 60000),
  },
  db: {
    schema: 'public',
  },
  // Aumentando timeout para operações realtime
  realtime: {
    timeout: 60000,
  },
})

// Função de diagnóstico para verificar a conexão com o Supabase
export async function checkSupabaseConnection() {
  try {
    if (!checkConnection()) {
      return { success: false, error: new Error('Sem conexão com a internet') };
    }
    
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
