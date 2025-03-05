import { supabase } from './supabase'
import { AuthError, Session, User } from '@supabase/supabase-js'

// Fazer login
export async function signIn(
  email: string,
  password: string,
): Promise<{
  data: { user: User | null; session: Session | null }
  error: AuthError | null
}> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  return { data, error }
}

// Cadastro
export async function signUp(
  email: string,
  password: string,
  userData: Record<string, unknown> = {},
): Promise<{
  data: { user: User | null; session: Session | null }
  error: AuthError | null
}> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData,
    },
  })

  return { data, error }
}

// Logout
export async function signOut(): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.signOut()
  return { error }
}

// Obter usuário atual
export async function getCurrentUser(): Promise<{
  data: { user: User | null }
  error: AuthError | null
}> {
  return await supabase.auth.getUser()
}

// Escutar mudanças na autenticação
export function onAuthStateChange(callback: (event: string, session: Session | null) => void): {
  data: { subscription: { unsubscribe: () => void } }
} {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session)
  })
}
