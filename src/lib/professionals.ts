import { supabase } from './supabase';

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
  email: string | undefined;
  created_at?: string;
  updated_at?: string;
}

// Tipo para representar um profissional no formato do Supabase (snake_case)
export interface SupabaseProfessional {
  id: string;
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

// Interfaces para definir respostas do Supabase
export interface ProfessionalResponse {
  data: Professional[] | null;
  error: Error | null;
}

export interface SingleProfessionalResponse {
  data: Professional | null;
  error: Error | null;
}

// Função para converter do formato do Supabase para o formato da app
export function convertFromSupabaseProfessional(professional: SupabaseProfessional): Professional {
  return {
    id: professional.id,
    name: professional.name,
    role: professional.role,
    status: professional.status,
    startDate: professional.start_date,
    avatarUrl: professional.avatar_url,
    cpf: professional.cpf,
    birthDate: professional.birth_date,
    workHours: professional.work_hours,
    workCity: professional.work_city,
    salary: professional.salary,
    address: professional.address,
    phone: professional.phone,
    email: professional.email,
    created_at: professional.created_at,
    updated_at: professional.updated_at,
  };
}

// Função para converter do formato da app para o formato do Supabase
export function convertToSupabaseProfessional(
  professional: Omit<Professional, 'id' | 'created_at' | 'updated_at'>
): Omit<SupabaseProfessional, 'id' | 'created_at' | 'updated_at'> {
  return {
    name: professional.name,
    role: professional.role,
    status: professional.status,
    start_date: professional.startDate,
    avatar_url: professional.avatarUrl,
    cpf: professional.cpf,
    birth_date: professional.birthDate,
    work_hours: professional.workHours,
    work_city: professional.workCity,
    salary: professional.salary,
    address: professional.address,
    phone: professional.phone,
    email: professional.email || '',
  };
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
      return { 
        data: null, 
        error: result.error 
      };
    }
    
    console.log(`Recebidos ${result.data?.length || 0} profissionais`);
    
    // Converter dados de snake_case para camelCase
    const convertedData = result.data?.map(professional => 
      convertFromSupabaseProfessional(professional as unknown as SupabaseProfessional)
    ) || null;
    
    return { 
      data: convertedData, 
      error: null 
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
      return { 
        data: null, 
        error: result.error 
      };
    }
    
    console.log(`Profissional encontrado: ${result.data?.name}`);
    
    // Converter de snake_case para camelCase
    const convertedData = result.data 
      ? convertFromSupabaseProfessional(result.data as unknown as SupabaseProfessional)
      : null;
    
    return { 
      data: convertedData, 
      error: null 
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
    
    // Converter para o formato do Supabase
    const supabaseData = convertToSupabaseProfessional(professionalData);
    
    const startTime = performance.now();
    
    const result = await supabase
      .from('professionals')
      .insert(supabaseData)
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
      return { data: null, error: result.error };
    }
    
    console.log(`Profissional adicionado com sucesso: ${result.data?.[0]?.name}`);
    
    // Converter dados retornados para o formato camelCase
    const convertedData = result.data?.map(professional => 
      convertFromSupabaseProfessional(professional as unknown as SupabaseProfessional)
    ) || null;
    
    return { data: convertedData, error: null };
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
    
    // Converter para o formato do Supabase
    const supabaseData: Partial<SupabaseProfessional> = {};
    
    if (professionalData.name !== undefined) supabaseData.name = professionalData.name;
    if (professionalData.role !== undefined) supabaseData.role = professionalData.role;
    if (professionalData.status !== undefined) supabaseData.status = professionalData.status;
    if (professionalData.startDate !== undefined) supabaseData.start_date = professionalData.startDate;
    if (professionalData.avatarUrl !== undefined) supabaseData.avatar_url = professionalData.avatarUrl;
    if (professionalData.cpf !== undefined) supabaseData.cpf = professionalData.cpf;
    if (professionalData.birthDate !== undefined) supabaseData.birth_date = professionalData.birthDate;
    if (professionalData.workHours !== undefined) supabaseData.work_hours = professionalData.workHours;
    if (professionalData.workCity !== undefined) supabaseData.work_city = professionalData.workCity;
    if (professionalData.salary !== undefined) supabaseData.salary = professionalData.salary;
    if (professionalData.address !== undefined) supabaseData.address = professionalData.address;
    if (professionalData.phone !== undefined) supabaseData.phone = professionalData.phone;
    if (professionalData.email !== undefined) supabaseData.email = professionalData.email || '';
    
    const startTime = performance.now();
    
    const result = await supabase
      .from('professionals')
      .update(supabaseData)
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
      return { data: null, error: result.error };
    }
    
    console.log(`Profissional atualizado com sucesso: ${result.data?.[0]?.name}`);
    
    // Converter dados retornados para o formato camelCase
    const convertedData = result.data?.map(professional => 
      convertFromSupabaseProfessional(professional as unknown as SupabaseProfessional)
    ) || null;
    
    return { data: convertedData, error: null };
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
      return { error };
    }
    
    console.log(`Profissional removido com sucesso`);
    
    return { error: null };
  } catch (error) {
    console.error(`Exceção ao remover profissional ${id}:`, error);
    return {
      error: error instanceof Error ? error : new Error('Erro desconhecido')
    };
  }
} 