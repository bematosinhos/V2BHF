import { FC, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/store'

const AuthCallback: FC = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const login = useAppStore((state) => state.login)
  const fetchProfessionals = useAppStore((state) => state.fetchProfessionals)

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Obter a sessão atual
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          setError(sessionError.message)
          toast.error(`Erro de autenticação: ${sessionError.message}`)
          return
        }
        
        if (!session) {
          setError('Nenhuma sessão encontrada')
          toast.error('Falha na autenticação')
          return
        }
        
        // Usuário está autenticado, atualize o estado global e redirecione
        await login(session.user.email || '', '')
        await fetchProfessionals()
        
        toast.success('Login realizado com sucesso!')
        navigate('/dashboard')
      } catch (error) {
        console.error('Erro no callback de autenticação:', error)
        setError('Ocorreu um erro durante a autenticação')
        toast.error('Ocorreu um erro durante a autenticação')
      } finally {
        setLoading(false)
      }
    }
    
    handleAuthCallback()
  }, [login, fetchProfessionals, navigate])
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      {loading ? (
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="text-primary h-12 w-12 animate-spin" />
          <p className="text-lg font-medium">Finalizando autenticação...</p>
        </div>
      ) : error ? (
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Erro de Autenticação</h1>
          <p className="mt-2 text-gray-600">{error}</p>
          <button
            onClick={() => navigate('/auth/login')}
            className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Voltar para Login
          </button>
        </div>
      ) : null}
    </div>
  )
}

export default AuthCallback 