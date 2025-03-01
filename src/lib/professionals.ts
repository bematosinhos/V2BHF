import { supabase } from './supabase';

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

// Obter todos os profissionais
export async function getAllProfessionals() {
  const { data, error } = await supabase
    .from('professionals')
    .select('*')
    .order('name');
  
  return { data, error };
}

// Obter um profissional específico
export async function getProfessional(id: string) {
  const { data, error } = await supabase
    .from('professionals')
    .select('*')
    .eq('id', id)
    .single();
  
  return { data, error };
}

// Adicionar um profissional
export async function addProfessional(professionalData: Omit<Professional, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('professionals')
    .insert(professionalData)
    .select();
  
  return { data, error };
}

// Atualizar um profissional
export async function updateProfessional(id: string, updates: Partial<Omit<Professional, 'id' | 'created_at' | 'updated_at'>>) {
  const { data, error } = await supabase
    .from('professionals')
    .update(updates)
    .eq('id', id)
    .select();
  
  return { data, error };
}

// Remover um profissional
export async function removeProfessional(id: string) {
  const { error } = await supabase
    .from('professionals')
    .delete()
    .eq('id', id);
  
  return { error };
} 