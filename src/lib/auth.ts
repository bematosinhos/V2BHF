import { supabase } from './supabase';
import { Session } from '@supabase/supabase-js';

// Fazer login
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  return { data, error };
}

// Cadastro
export async function signUp(email: string, password: string, userData: Record<string, unknown> = {}) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData,
    },
  });
  
  return { data, error };
}

// Logout
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

// Obter usuário atual
export async function getCurrentUser() {
  return await supabase.auth.getUser();
}

// Escutar mudanças na autenticação
export function onAuthStateChange(callback: (event: string, session: Session | null) => void) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
} 