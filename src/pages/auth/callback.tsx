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
  const setAuthenticated = useAppStore((state) => state.setAuthenticated)
  const fetchProfessionals = useAppStore((state) => state.fetchProfessionals)

  useEffect(() => {
    const handleAuthCallback = async (): Promise<void> => {
      try {
        console.log('Processando callback de autenticação OAuth...')

        // Obter a sessão atual
        const { data, error: sessionError } = await supabase.auth.getSession()
        const session = data.session

        if (sessionError) {
          console.error('Erro ao obter sessão:', sessionError)
          setError(sessionError.message)
          toast.error(`Erro de autenticação: ${sessionError.message}`)
          return
        }

        if (!session) {
          console.error('Nenhuma sessão encontrada no callback')
          setError('Nenhuma sessão encontrada')
          toast.error('Falha na autenticação')
          return
        }

        // Usuário está autenticado, atualize o estado global e redirecione
        try {
          console.log(
            'Sessão encontrada, atualizando estado de autenticação...',
            session.user.email,
          )

          // Primeiro, definimos diretamente o estado de autenticação
          setAuthenticated(true)

          // Em seguida, chamamos login para atualizar outros estados
          await login(session.user.email ?? '', '')
          await fetchProfessionals()

          toast.success('Login realizado com sucesso!')

          // Adicionamos um pequeno atraso para garantir que a redireção ocorra após o estado ser atualizado
          setTimeout(() => {
            console.log('Redirecionando para o dashboard...')
            void navigate('/dashboard', { replace: true })
          }, 1000)
        } catch (loginError) {
          const errorMessage =
            loginError instanceof Error ? loginError.message : 'Erro ao processar login'
          console.error('Erro ao fazer login:', errorMessage)
          setError(errorMessage)
          toast.error(errorMessage)
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Ocorreu um erro durante a autenticação'
        console.error('Erro no callback de autenticação:', error)
        setError(errorMessage)
        toast.error(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    void handleAuthCallback()
  }, [login, fetchProfessionals, navigate, setAuthenticated])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      {loading ? (
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="text-primary h-12 w-12 animate-spin" />
          <p className="text-lg font-medium">Finalizando autenticação...</p>
          <p className="text-sm text-gray-500">Você será redirecionado em instantes</p>
        </div>
      ) : error ? (
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Erro de Autenticação</h1>
          <p className="mt-2 text-gray-600">{error}</p>
          <button
            onClick={() => {
              void navigate('/auth/login')
            }}
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
