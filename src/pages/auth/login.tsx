import { FC, useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { toast } from 'sonner'
import { Eye, EyeOff, AlertTriangle } from 'lucide-react'
import { FcGoogle } from 'react-icons/fc'
import { useAppStore } from '@/store'
import { supabase, checkSupabaseConnection } from '@/lib/supabase'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

const loginFormSchema = z.object({
  email: z.string().email({ message: 'Email inválido' }),
  password: z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres' }),
  rememberMe: z.boolean().default(false),
})

const resetPasswordSchema = z.object({
  email: z.string().email({ message: 'Email inválido' }),
})

type LoginFormValues = z.infer<typeof loginFormSchema>
type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

const LoginPage: FC = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isResettingPassword, setIsResettingPassword] = useState(false)
  const [resetDialogOpen, setResetDialogOpen] = useState(false)
  const [supabaseError, setSupabaseError] = useState<string | null>(null)
  const navigate = useNavigate()
  const { login } = useAppStore()

  // Verificar a conexão com o Supabase ao carregar o componente
  useEffect(() => {
    const verifySupabaseConfig = async () => {
      const { success } = await checkSupabaseConnection()
      if (!success) {
        // Se estiver em desenvolvimento, mostrar uma mensagem mais detalhada
        if (import.meta.env.DEV) {
          setSupabaseError(
            'O Supabase não está configurado corretamente. Verifique seu arquivo .env e as credenciais do Supabase.',
          )
        } else {
          setSupabaseError(
            'Serviço de autenticação temporariamente indisponível. Tente novamente mais tarde.',
          )
        }
      }
    }

    void verifySupabaseConfig()
  }, [])

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  })

  const resetForm = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true)

    try {
      // Autenticação usando Supabase
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (authError) {
        toast.error(authError.message || 'Erro ao fazer login')
        return
      }

      // A autenticação foi bem-sucedida, agora vamos atualizar nosso estado
      const success = await login(data.email, data.password)

      if (success) {
        toast.success('Login realizado com sucesso!')
        void navigate('/dashboard')
      } else {
        toast.error('Erro ao processar seu login')
      }
    } catch (error) {
      toast.error('Ocorreu um erro ao fazer login')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  async function onResetPassword(data: ResetPasswordFormValues) {
    setIsResettingPassword(true)

    try {
      // Se estivermos em ambiente de desenvolvimento e as credenciais do Supabase forem temporárias,
      // simular o comportamento de recuperação de senha para fins de teste
      const isDevEnv = import.meta.env.DEV
      const isTempCredentials = supabaseError !== null

      if (isDevEnv && isTempCredentials) {
        console.log('Modo de desenvolvimento detectado: Simulando recuperação de senha')
        // Simular um atraso para parecer uma operação real
        await new Promise((resolve) => setTimeout(resolve, 1500))

        toast.success('Email de recuperação simulado enviado com sucesso (modo de desenvolvimento)')
        setResetDialogOpen(false)
        return
      }

      // Verificar a conexão com o Supabase antes de prosseguir
      const { error: connectionError } = await supabase.auth.getSession()
      if (connectionError) {
        toast.error(
          'Não foi possível conectar ao serviço de autenticação. Verifique sua conexão com a internet.',
        )
        console.error('Erro de conexão Supabase:', connectionError)
        return
      }

      // Tentar enviar o email de recuperação de senha
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        console.error('Detalhes do erro Supabase:', error)

        // Mensagens de erro mais específicas com base no código de erro
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Email não encontrado. Verifique se o email está correto.')
        } else if (error.message.includes('rate limit')) {
          toast.error('Muitas tentativas. Tente novamente mais tarde.')
        } else {
          toast.error(`Erro ao solicitar recuperação de senha: ${error.message}`)
        }
        return
      }

      toast.success('Se o email existir em nossa base, enviaremos um link de recuperação de senha.')
      setResetDialogOpen(false)
    } catch (error) {
      console.error('Erro não tratado na recuperação de senha:', error)
      toast.error('Ocorreu um erro inesperado. Tente novamente mais tarde.')
    } finally {
      setIsResettingPassword(false)
    }
  }

  // Função para fazer login com Google seguindo as melhores práticas do Supabase
  async function signInWithGoogle() {
    try {
      setIsLoading(true)

      // URL de callback absoluta para garantir redirecionamento correto
      const redirectTo = `${window.location.origin}/auth/callback`

      console.log('Iniciando autenticação Google com redirecionamento para:', redirectTo)

      // Configurações para o login com o Google
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            // Opções adicionais para o Google OAuth - acesso ao perfil e email
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) {
        console.error('Erro ao iniciar login com Google:', error)

        // Mensagens mais específicas baseadas no tipo de erro
        if (error.message.includes('popup')) {
          toast.error(
            'O pop-up de autenticação foi bloqueado. Por favor, permita pop-ups para este site.',
          )
        } else if (error.message.includes('network')) {
          toast.error('Problema de conexão. Verifique sua internet e tente novamente.')
        } else {
          toast.error(error.message || 'Erro ao fazer login com Google')
        }
        return
      }

      // Para depuração - o usuário já será redirecionado pelo Supabase neste ponto
      console.log('Iniciando redirecionamento para autenticação Google...')
    } catch (error) {
      console.error('Exceção durante login com Google:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      toast.error(`Falha ao conectar com Google: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">BH Fácil</h1>
        </div>

        {supabaseError && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Erro de Configuração</AlertTitle>
            <AlertDescription>{supabaseError}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>Entre com suas credenciais para acessar o sistema.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={(e) => {
                  void form.handleSubmit(onSubmit)(e)
                }}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="seu@email.com"
                          type="email"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="Sua senha"
                            type={showPassword ? 'text' : 'password'}
                            {...field}
                            disabled={isLoading}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute top-0 right-0 h-full px-3"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={isLoading}
                          >
                            {showPassword ? (
                              <EyeOff className="text-muted-foreground h-4 w-4" />
                            ) : (
                              <Eye className="text-muted-foreground h-4 w-4" />
                            )}
                            <span className="sr-only">
                              {showPassword ? 'Esconder senha' : 'Mostrar senha'}
                            </span>
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rememberMe"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-y-0 space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">Lembrar de mim</FormLabel>
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Entrando...' : 'Entrar'}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="w-full text-center">
              <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="link"
                    className="h-auto p-0 text-sm text-blue-600 hover:underline"
                  >
                    Esqueceu sua senha?
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Recuperação de senha</DialogTitle>
                    <DialogDescription>
                      Informe seu email para receber um link de recuperação de senha.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...resetForm}>
                    <form
                      onSubmit={(e) => {
                        void resetForm.handleSubmit(onResetPassword)(e)
                      }}
                      className="space-y-4"
                    >
                      <FormField
                        control={resetForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="seu@email.com"
                                type="email"
                                {...field}
                                disabled={isResettingPassword}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <DialogFooter>
                        <Button type="submit" disabled={isResettingPassword}>
                          {isResettingPassword ? 'Enviando...' : 'Enviar link de recuperação'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="w-full text-center">
              <span className="text-sm text-gray-600">Não tem uma conta? </span>
              <Link to="/auth/register" className="text-sm text-blue-600 hover:underline">
                Criar conta
              </Link>
            </div>

            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="text-muted-foreground bg-white px-2">Ou continue com</span>
              </div>
            </div>

            <div className="w-full">
              <Button
                variant="outline"
                className="flex w-full items-center justify-center gap-2"
                disabled={isLoading}
                onClick={() => void signInWithGoogle()}
              >
                <FcGoogle className="h-5 w-5" />
                <span>Continuar com Google</span>
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default LoginPage
