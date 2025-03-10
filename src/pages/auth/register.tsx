import { FC, useState } from 'react'
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
import { Eye, EyeOff } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { FcGoogle } from 'react-icons/fc'

const registerFormSchema = z
  .object({
    email: z.string().email({ message: 'Email inválido' }),
    password: z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres' }),
    confirmPassword: z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres' }),
    name: z.string().min(3, { message: 'O nome deve ter pelo menos 3 caracteres' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

type RegisterFormValues = z.infer<typeof registerFormSchema>

const RegisterPage: FC = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
    },
  })

  const onSubmit = async (data: RegisterFormValues): Promise<void> => {
    try {
      setIsLoading(true)

      // Registrar usuário via Supabase
      const { error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
          },
        },
      })

      if (signUpError) {
        toast.error(signUpError.message || 'Erro ao criar conta')
        setIsLoading(false)
        return
      }

      toast.success(
        'Conta criada com sucesso! Por favor, verifique seu email para confirmar sua conta.',
      )

      // Redirecionar para a página de login após registro bem-sucedido
      void navigate('/auth/login')
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Ocorreu um erro ao criar sua conta'
      toast.error(errorMessage)
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  // Função para fazer login com Google seguindo as melhores práticas do Supabase
  const signInWithGoogle = async (): Promise<void> => {
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
            // Opções adicionais para o Google OAuth
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
      const errorMessage =
        error instanceof Error ? error.message : 'Ocorreu um erro ao fazer login com Google'
      toast.error(errorMessage)
      console.error('Exceção durante login com Google:', error)
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

        <Card>
          <CardHeader>
            <CardTitle>Criar Conta</CardTitle>
            <CardDescription>Preencha os dados abaixo para criar sua conta.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  void form.handleSubmit(onSubmit)(e)
                }}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Seu nome completo" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirme a Senha</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="Confirme sua senha"
                            type={showConfirmPassword ? 'text' : 'password'}
                            {...field}
                            disabled={isLoading}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute top-0 right-0 h-full px-3"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            disabled={isLoading}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="text-muted-foreground h-4 w-4" />
                            ) : (
                              <Eye className="text-muted-foreground h-4 w-4" />
                            )}
                            <span className="sr-only">
                              {showConfirmPassword ? 'Esconder senha' : 'Mostrar senha'}
                            </span>
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Criando conta...' : 'Criar Conta'}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="w-full text-center">
              <span className="text-sm text-gray-600">Já tem uma conta? </span>
              <Link to="/auth/login" className="text-sm text-blue-600 hover:underline">
                Faça login
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

            <div className="text-muted-foreground mt-4 text-center text-sm">
              Ao criar sua conta, você concorda com nossos{' '}
              <Link to="/terms" className="hover:text-primary underline underline-offset-4">
                Termos de Serviço
              </Link>{' '}
              e{' '}
              <Link to="/privacy" className="hover:text-primary underline underline-offset-4">
                Política de Privacidade
              </Link>
              .
            </div>
          </CardFooter>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} BH Fácil. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
