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

// Cria uma instância personalizada de AbortController que é mais tolerante com tempos mais longos
const createCustomAbortController = (timeoutMs = 60000) => {
  // Para navegadores modernos, usamos AbortSignal.timeout
  if (typeof AbortSignal.timeout === 'function') {
    return { signal: AbortSignal.timeout(timeoutMs) };
  }
  
  // Para navegadores mais antigos, implementamos nossa própria lógica
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  const originalAbort = controller.abort.bind(controller);
  controller.abort = () => {
    clearTimeout(timeoutId);
    originalAbort();
  };
  
  return controller;
};

// Inicialize o cliente Supabase com configurações otimizadas
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    // Configurar um fetch customizado com tolerância maior a timeouts para Vercel
    fetch: (url: RequestInfo | URL, options: RequestInit = {}): Promise<Response> => {
      // Timeout de 60 segundos para todas as requisições
      const timeoutMs = 60000;
      
      const controller = createCustomAbortController(timeoutMs);
      
      // Preparar opções do fetch com o signal do controller
      const fetchOptions = {
        ...options,
        signal: controller.signal,
        headers: {
          ...options.headers,
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
        },
      };
      
      // Criar uma promise de timeout para mostrar erro mais informativo
      const timeoutPromise = new Promise<Response>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Request timeout after ${timeoutMs}ms for URL: ${url}`));
        }, timeoutMs);
      });
      
      // Race entre o fetch e o timeout
      return Promise.race([
        fetch(url, fetchOptions),
        timeoutPromise
      ]).catch(err => {
        // Log de erro mais detalhado
        console.error('Supabase fetch error:', err);
        throw err;
      });
    },
  },
  // Configurações de BD
  db: {
    schema: 'public',
  },
  // Configurações para realtime
  realtime: {
    timeout: 60000, // 60 segundos
  },
})

// Função para verificar a saúde da conexão com Supabase
export async function checkSupabaseConnection() {
  try {
    console.log('Verificando conexão com Supabase...');
    const startTime = performance.now();
    
    const { error } = await supabase.auth.getSession();
    
    const endTime = performance.now();
    const responseTime = Math.round(endTime - startTime);
    
    if (error) {
      console.error(`Erro ao conectar com o Supabase (${responseTime}ms):`, error);
      return { success: false, error, responseTime };
    }
    
    console.log(`Conexão com Supabase bem-sucedida (${responseTime}ms)`);
    return { success: true, responseTime };
  } catch (error) {
    console.error('Exceção ao verificar conexão do Supabase:', error);
    return { success: false, error };
  }
}
