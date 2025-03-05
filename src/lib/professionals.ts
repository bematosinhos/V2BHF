import { supabase } from './supabase';
import { PostgrestError } from '@supabase/supabase-js';

// Definindo a interface para o tipo Professional
export interface Professional {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  specialty?: string;
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

// Obter todos os profissionais
export async function getAllProfessionals(): Promise<ProfessionalResponse> {
  const result = await supabase
    .from('professionals')
    .select('*')
    .order('name');
  
  return { 
    data: result.data as Professional[] | null, 
    error: result.error 
  };
}

// Obter um profissional específico
export async function getProfessional(id: string): Promise<SingleProfessionalResponse> {
  const result = await supabase
    .from('professionals')
    .select('*')
    .eq('id', id)
    .single();
  
  return { 
    data: result.data as Professional | null, 
    error: result.error 
  };
}

// Adicionar um profissional
export async function addProfessional(professionalData: Omit<Professional, 'id' | 'created_at' | 'updated_at'>): Promise<ProfessionalResponse> {
  const { data, error } = await supabase
    .from('professionals')
    .insert(professionalData)
    .select();
  
  return { data, error };
}

// Atualizar um profissional
export async function updateProfessional(id: string, updates: Partial<Omit<Professional, 'id' | 'created_at' | 'updated_at'>>): Promise<ProfessionalResponse> {
  const { data, error } = await supabase
    .from('professionals')
    .update(updates)
    .eq('id', id)
    .select();
  
  return { data, error };
}

// Remover um profissional
export async function removeProfessional(id: string): Promise<{ error: PostgrestError | null }> {
  const { error } = await supabase
    .from('professionals')
    .delete()
    .eq('id', id);
  
  return { error };
} 