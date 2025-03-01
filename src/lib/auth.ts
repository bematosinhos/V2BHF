import { supabase } from './supabase';

// Fazer login
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  return { data, error };
}

// Cadastro
export async function signUp(email: string, password: string, userData = {}) {
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
  return await supabase.auth.signOut();
}

// Obter usuário atual
export function getCurrentUser() {
  return supabase.auth.getUser();
}

// Escutar mudanças na autenticação
export function onAuthStateChange(callback: (event: string, session: any) => void) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
} 