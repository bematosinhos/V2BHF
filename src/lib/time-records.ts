import { supabase } from './supabase';

// Obter registros de tempo de um profissional
export async function getTimeRecordsForProfessional(professionalId: string) {
  const { data, error } = await supabase
    .from('time_records')
    .select('*')
    .eq('professional_id', professionalId)
    .order('date');
  
  return { data, error };
}

// Obter registros para uma data específica
export async function getTimeRecordsForDate(date: string) {
  const { data, error } = await supabase
    .from('time_records')
    .select('*')
    .eq('date', date);
  
  return { data, error };
}

// Adicionar um registro de tempo
export async function addTimeRecord(recordData: any) {
  const { data, error } = await supabase
    .from('time_records')
    .insert(recordData)
    .select();
  
  return { data, error };
}

// Atualizar um registro de tempo
export async function updateTimeRecord(id: string, updates: any) {
  const { data, error } = await supabase
    .from('time_records')
    .update(updates)
    .eq('id', id)
    .select();
  
  return { data, error };
}

// Remover um registro de tempo
export async function removeTimeRecord(id: string) {
  const { error } = await supabase
    .from('time_records')
    .delete()
    .eq('id', id);
  
  return { error };
} 