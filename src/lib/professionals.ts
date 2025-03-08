import { supabase } from './supabase';
import { PostgrestError } from '@supabase/supabase-js';

// Interface para definir a estrutura de um Profissional
export interface Professional {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'inactive' | 'vacation';
  startDate: string;
  avatarUrl?: string;
  cpf: string;
  birthDate: string;
  workHours: string;
  workCity: string;
  salary: string;
  address: string;
  phone: string;
  email: string;
  created_at?: string;
  updated_at?: string;
}

// Interfaces para definir respostas do Supabase
export interface ProfessionalResponse {
  data: Professional[] | null;
  error: Error | null;
}

export interface SingleProfessionalResponse {
  data: Professional | null;
  error: Error | null;
}

// Obter todos os profissionais
export async function getAllProfessionals(): Promise<ProfessionalResponse> {
  console.log('Buscando todos os profissionais do Supabase...');
  
  try {
    const startTime = performance.now();
    
    const result = await supabase
      .from('professionals')
      .select('*')
      .order('name');
    
    const endTime = performance.now();
    const operationTime = Math.round(endTime - startTime);
    
    console.log(`Busca de profissionais concluída em ${operationTime}ms`);
    
    if (result.error) {
      console.error('Erro ao buscar profissionais:', result.error);
    } else {
      console.log(`Recebidos ${result.data?.length || 0} profissionais`);
    }
    
    return { 
      data: result.data as Professional[] | null, 
      error: result.error 
    };
  } catch (error) {
    console.error('Exceção ao buscar profissionais:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Erro desconhecido')
    };
  }
}

// Obter um profissional específico
export async function getProfessional(id: string): Promise<SingleProfessionalResponse> {
  console.log(`Buscando profissional com ID: ${id}`);
  
  try {
    const startTime = performance.now();
    
    const result = await supabase
      .from('professionals')
      .select('*')
      .eq('id', id)
      .single();
    
    const endTime = performance.now();
    const operationTime = Math.round(endTime - startTime);
    
    console.log(`Busca de profissional concluída em ${operationTime}ms`);
    
    if (result.error) {
      console.error(`Erro ao buscar profissional ${id}:`, result.error);
    } else {
      console.log(`Profissional encontrado: ${result.data?.name}`);
    }
    
    return { 
      data: result.data as Professional | null, 
      error: result.error 
    };
  } catch (error) {
    console.error(`Exceção ao buscar profissional ${id}:`, error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Erro desconhecido')
    };
  }
}

// Adicionar um profissional
export async function addProfessional(professionalData: Omit<Professional, 'id' | 'created_at' | 'updated_at'>): Promise<ProfessionalResponse> {
  console.log('Adicionando novo profissional ao Supabase:', professionalData.name);
  
  try {
    // Validar dados antes de enviar
    if (!professionalData.name || !professionalData.cpf) {
      const error = new Error('Dados do profissional incompletos. Nome e CPF são obrigatórios.');
      console.error(error);
      return { data: null, error };
    }
    
    const startTime = performance.now();
    
    const result = await supabase
      .from('professionals')
      .insert(professionalData)
      .select();
    
    const endTime = performance.now();
    const operationTime = Math.round(endTime - startTime);
    
    console.log(`Operação concluída em ${operationTime}ms`);
    
    if (result.error) {
      console.error('Erro ao adicionar profissional:', result.error);
      console.error('Detalhes da operação:', { 
        status: result.status,
        statusText: result.statusText 
      });
    } else {
      console.log(`Profissional adicionado com sucesso: ${result.data?.[0]?.name}`);
    }
    
    return { data: result.data, error: result.error };
  } catch (error) {
    console.error('Exceção ao adicionar profissional:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Erro desconhecido')
    };
  }
}

// Atualizar um profissional
export async function updateProfessional(id: string, professionalData: Partial<Professional>): Promise<ProfessionalResponse> {
  console.log(`Atualizando profissional com ID ${id}:`, professionalData);
  
  try {
    // Validar ID antes de prosseguir
    if (!id) {
      const error = new Error('ID do profissional não fornecido para atualização');
      console.error(error);
      return { data: null, error };
    }
    
    const startTime = performance.now();
    
    const result = await supabase
      .from('professionals')
      .update(professionalData)
      .eq('id', id)
      .select();
    
    const endTime = performance.now();
    const operationTime = Math.round(endTime - startTime);
    
    console.log(`Operação concluída em ${operationTime}ms`);
    
    if (result.error) {
      console.error(`Erro ao atualizar profissional ${id}:`, result.error);
      console.error('Detalhes da operação:', { 
        status: result.status,
        statusText: result.statusText 
      });
    } else {
      console.log(`Profissional atualizado com sucesso: ${result.data?.[0]?.name}`);
    }
    
    return { data: result.data, error: result.error };
  } catch (error) {
    console.error(`Exceção ao atualizar profissional ${id}:`, error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Erro desconhecido')
    };
  }
}

// Remover um profissional
export async function removeProfessional(id: string): Promise<{ error: Error | null }> {
  console.log(`Removendo profissional com ID: ${id}`);
  
  try {
    // Validar ID antes de prosseguir
    if (!id) {
      const error = new Error('ID do profissional não fornecido para remoção');
      console.error(error);
      return { error };
    }
    
    const startTime = performance.now();
    
    const { error } = await supabase
      .from('professionals')
      .delete()
      .eq('id', id);
    
    const endTime = performance.now();
    const operationTime = Math.round(endTime - startTime);
    
    console.log(`Operação concluída em ${operationTime}ms`);
    
    if (error) {
      console.error(`Erro ao remover profissional ${id}:`, error);
    } else {
      console.log(`Profissional removido com sucesso`);
    }
    
    return { error };
  } catch (error) {
    console.error(`Exceção ao remover profissional ${id}:`, error);
    return {
      error: error instanceof Error ? error : new Error('Erro desconhecido')
    };
  }
} 