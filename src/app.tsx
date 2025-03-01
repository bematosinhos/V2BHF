import { Suspense, lazy, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from 'next-themes'
import { Loader2 } from 'lucide-react'
import { Toaster } from './components/ui/sonner'
import { useAppStore } from './store'
import { supabase } from './lib/supabase'

// Componente de loading para Suspense
const Loading = () => (
  <div className="flex min-h-screen items-center justify-center">
    <Loader2 className="text-primary h-8 w-8 animate-spin" />
  </div>
)

// Componente para proteger rotas autenticadas
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAppStore((state) => state.isAuthenticated)
  
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />
  }
  
  return <>{children}</>
}

// Componentes lazy
const LoginPage = lazy(() => import('./pages/auth/login'))
const RegisterPage = lazy(() => import('./pages/auth/register'))
const AuthCallback = lazy(() => import('./pages/auth/callback'))
const DashboardPage = lazy(() => import('./pages/dashboard'))
const ProfessionalsPage = lazy(() => import('./pages/professionals'))
const ProfessionalDetailPage = lazy(() => import('./pages/professionals/detail'))
const SchedulePage = lazy(() => import('./pages/schedule'))
const RegisterProfessionalPage = lazy(() => import('./pages/register'))

function App() {
  const login = useAppStore((state) => state.login)
  const fetchProfessionals = useAppStore((state) => state.fetchProfessionals)
  
  // Verificar usuário atual ao iniciar a aplicação
  useEffect(() => {
    // Verificar se há uma sessão ativa
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Erro ao verificar sessão:', error.message)
          return
        }
        
        if (data.session) {
          const { user } = data.session
          try {
            // Simular login para definir o estado
            await login(user.email || '', '') // password vazio, pois já temos a sessão
            // Carregar dados iniciais após login
            await fetchProfessionals()
          } catch (loginError) {
            console.error('Erro ao processar login com sessão existente:', loginError)
          }
        }
      } catch (error) {
        console.error('Erro ao verificar sessão:', error)
      }
    }
    
    // Configurar listener para mudanças de autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          try {
            await login(session.user.email || '', '')
            await fetchProfessionals()
          } catch (error) {
            console.error('Erro ao processar login após mudança de autenticação:', error)
          }
        }
      }
    )
    
    void checkSession()
    
    // Limpar listener ao desmontar
    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [login, fetchProfessionals])
  
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Router>
        <Routes>
          {/* Rota inicial */}
          <Route path="/" element={<Navigate to="/auth/login" replace />} />
          
          {/* Rota de login */}
          <Route 
            path="/auth/login" 
            element={
              <Suspense fallback={<Loading />}>
                <LoginPage />
              </Suspense>
            } 
          />
          
          {/* Rota de registro */}
          <Route 
            path="/auth/register" 
            element={
              <Suspense fallback={<Loading />}>
                <RegisterPage />
              </Suspense>
            } 
          />
          
          {/* Rota de callback para autenticação OAuth */}
          <Route 
            path="/auth/callback" 
            element={
              <Suspense fallback={<Loading />}>
                <AuthCallback />
              </Suspense>
            } 
          />
          
          {/* Rotas protegidas */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Suspense fallback={<Loading />}>
                  <DashboardPage />
                </Suspense>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/professionals" 
            element={
              <ProtectedRoute>
                <Suspense fallback={<Loading />}>
                  <ProfessionalsPage />
                </Suspense>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/professionals/:id" 
            element={
              <ProtectedRoute>
                <Suspense fallback={<Loading />}>
                  <ProfessionalDetailPage />
                </Suspense>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/schedule" 
            element={
              <ProtectedRoute>
                <Suspense fallback={<Loading />}>
                  <SchedulePage />
                </Suspense>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/register" 
            element={
              <ProtectedRoute>
                <Suspense fallback={<Loading />}>
                  <RegisterProfessionalPage />
                </Suspense>
              </ProtectedRoute>
            } 
          />
          
          {/* Rota não encontrada */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        
        <Toaster />
      </Router>
    </ThemeProvider>
  )
}

export { App }
