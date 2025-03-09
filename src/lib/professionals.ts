import { supabase } from './supabase';
import { PostgrestError } from '@supabase/supabase-js';

// Definindo a interface para o tipo Professional completo
export interface Professional {
  id?: string;
  name: string;
  role: string;
  status: 'active' | 'inactive' | 'vacation';
  start_date: string;
  avatar_url?: string;
  cpf: string;
  birth_date: string;
  work_hours: string;
  work_city: string;
  salary: string;
  address: string;
  phone: string;
  email: string;
  created_at?: string;
  updated_at?: string;
}

// Tipo para o retorno das funções
interface ProfessionalResponse {
  data: Professional[] | null;
  error: PostgrestError | null;
}

interface SingleProfessionalResponse {
  data: Professional | null;
  error: PostgrestError | null;
}

// Estabelecer timeout para todas as operações do Supabase (em milissegundos)
const SUPABASE_TIMEOUT = 15000; // 15 segundos

// Função auxiliar para adicionar timeout em promessas
function withTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    )
  ]);
}

// Obter todos os profissionais
export async function getAllProfessionals(): Promise<ProfessionalResponse> {
  try {
    const result = await withTimeout(
      supabase
        .from('professionals')
        .select('*')
        .order('name'),
      SUPABASE_TIMEOUT,
      'Tempo limite excedido ao buscar profissionais. Verifique sua conexão e tente novamente.'
    );
    
    return { 
      data: result.data as Professional[] | null, 
      error: result.error 
    };
  } catch (error) {
    console.error('Erro ao buscar profissionais:', error);
    return {
      data: null,
      error: {
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        details: '',
        hint: '',
        code: ''
      } as PostgrestError
    };
  }
}

// Obter um profissional específico
export async function getProfessional(id: string): Promise<SingleProfessionalResponse> {
  try {
    const result = await withTimeout(
      supabase
        .from('professionals')
        .select('*')
        .eq('id', id)
        .single(),
      SUPABASE_TIMEOUT,
      'Tempo limite excedido ao buscar profissional. Verifique sua conexão e tente novamente.'
    );
    
    return { 
      data: result.data as Professional | null, 
      error: result.error 
    };
  } catch (error) {
    console.error('Erro ao buscar profissional:', error);
    return {
      data: null,
      error: {
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        details: '',
        hint: '',
        code: ''
      } as PostgrestError
    };
  }
}

// Adicionar um profissional
export async function addProfessional(professionalData: Omit<Professional, 'id' | 'created_at' | 'updated_at'>): Promise<ProfessionalResponse> {
  const MAX_RETRIES = 2;
  let currentAttempt = 0;
  
  // Função para tentar a operação com retentativas
  async function attemptAddProfessional(): Promise<ProfessionalResponse> {
    try {
      console.log(`Tentativa ${currentAttempt + 1}/${MAX_RETRIES + 1} de adicionar profissional:`, professionalData);
      
      // Validar campos obrigatórios antes de enviar
      const requiredFields = ['name', 'cpf', 'role', 'status', 'work_city'];
      const missingFields = requiredFields.filter(field => !professionalData[field as keyof typeof professionalData]);
      
      if (missingFields.length > 0) {
        console.error('Campos obrigatórios ausentes:', missingFields);
        return {
          data: null,
          error: {
            message: `Campos obrigatórios ausentes: ${missingFields.join(', ')}`,
            details: 'Verifique os dados do formulário',
            hint: '',
            code: 'MISSING_FIELDS'
          } as PostgrestError
        };
      }
      
      const result = await withTimeout(
        supabase
          .from('professionals')
          .insert(professionalData)
          .select(),
        SUPABASE_TIMEOUT,
        'Tempo limite excedido ao adicionar profissional. Verifique sua conexão e tente novamente.'
      );
      
      if (result.error) {
        console.error('Erro do Supabase ao adicionar profissional:', {
          code: result.error.code,
          message: result.error.message,
          details: result.error.details
        });
        
        // Verificar erros específicos
        if (result.error.code === '23505') {
          result.error.message = 'Já existe um profissional com este CPF ou email.';
        } else if (result.error.code?.startsWith('2')) {
          result.error.message = 'Erro de validação nos dados do profissional. Verifique todos os campos.';
        } else if (result.error.code === '23503') {
          result.error.message = 'Referência inválida. Verifique se todos os campos de referência são válidos.';
        }
      } else {
        console.log('Profissional adicionado com sucesso:', result.data);
      }
      
      return { data: result.data, error: result.error };
    } catch (error) {
      console.error(`Exceção ao adicionar profissional (tentativa ${currentAttempt + 1}/${MAX_RETRIES + 1}):`, error);
      
      // Se for erro de rede e ainda temos tentativas, vamos reintentar
      if (error instanceof Error && 
         (error.message.includes('network') || 
          error.message.includes('tempo limite') || 
          error.message.includes('timeout')) && 
          currentAttempt < MAX_RETRIES) {
        return {
          data: null,
          error: {
            message: `Erro de conexão (tentativa ${currentAttempt + 1}/${MAX_RETRIES + 1}). Tentando novamente...`,
            details: error.message,
            hint: '',
            code: 'RETRY'
          } as PostgrestError
        };
      }
      
      // Erro final que não será retentado
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : 'Erro desconhecido ao adicionar profissional',
          details: error instanceof Error ? error.stack || '' : '',
          hint: '',
          code: error instanceof Error && error.message.includes('tempo limite') ? 'TIMEOUT' : 'UNKNOWN'
        } as PostgrestError
      };
    }
  }
  
  // Tentar com retries
  while (currentAttempt <= MAX_RETRIES) {
    const response = await attemptAddProfessional();
    
    // Se for sucesso ou erro que não é de rede, retornar imediatamente
    if (response.data || (response.error && response.error.code !== 'RETRY')) {
      return response;
    }
    
    // Aguardar antes de tentar novamente (1s, depois 2s)
    const waitTime = (currentAttempt + 1) * 1000;
    console.log(`Aguardando ${waitTime}ms antes da próxima tentativa...`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
    
    currentAttempt++;
  }
  
  // Se chegou aqui, todas as tentativas falharam
  return {
    data: null,
    error: {
      message: 'Falha após múltiplas tentativas de adicionar o profissional. Tente novamente mais tarde.',
      details: '',
      hint: 'Verifique sua conexão com a internet ou contate o suporte.',
      code: 'MAX_RETRIES_EXCEEDED'
    } as PostgrestError
  };
}

// Atualizar um profissional
export async function updateProfessional(id: string, updates: Partial<Omit<Professional, 'id' | 'created_at' | 'updated_at'>>): Promise<ProfessionalResponse> {
  try {
    const result = await withTimeout(
      supabase
        .from('professionals')
        .update(updates)
        .eq('id', id)
        .select(),
      SUPABASE_TIMEOUT,
      'Tempo limite excedido ao atualizar profissional. Verifique sua conexão e tente novamente.'
    );
    
    if (result.error) {
      console.error('Erro ao atualizar profissional:', result.error);
      
      // Verificar erros específicos
      if (result.error.code === '23505') {
        result.error.message = 'Já existe um profissional com este CPF ou email.';
      }
    }
    
    return { data: result.data, error: result.error };
  } catch (error) {
    console.error('Exceção ao atualizar profissional:', error);
    return {
      data: null,
      error: {
        message: error instanceof Error ? error.message : 'Erro desconhecido ao atualizar profissional',
        details: '',
        hint: '',
        code: ''
      } as PostgrestError
    };
  }
}

// Remover um profissional
export async function removeProfessional(id: string): Promise<{ error: PostgrestError | null }> {
  try {
    const result = await withTimeout(
      supabase
        .from('professionals')
        .delete()
        .eq('id', id),
      SUPABASE_TIMEOUT,
      'Tempo limite excedido ao remover profissional. Verifique sua conexão e tente novamente.'
    );
    
    return { error: result.error };
  } catch (error) {
    console.error('Exceção ao remover profissional:', error);
    return {
      error: {
        message: error instanceof Error ? error.message : 'Erro desconhecido ao remover profissional',
        details: '',
        hint: '',
        code: ''
      } as PostgrestError
    };
  }
} 