import { FC, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

const ResetPasswordPage: FC = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  useEffect(() => {
    // Verificar se o usuário tem uma sessão válida de redefinição de senha
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession()

      if (error || !data.session) {
        toast.error('Sua sessão de redefinição de senha expirou ou é inválida')
        void navigate('/auth/login')
      }
    }

    void checkSession()
  }, [navigate])

  async function onSubmit(data: ResetPasswordFormValues) {
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      })

      if (error) {
        toast.error(error.message || 'Erro ao redefinir a senha')
        return
      }

      toast.success('Senha redefinida com sucesso!')
      void navigate('/auth/login')
    } catch (error) {
      toast.error('Ocorreu um erro ao redefinir a senha')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleNavigateToLogin = () => {
    void navigate('/auth/login')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">BH Fácil</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Redefinir Senha</CardTitle>
            <CardDescription>Digite sua nova senha para continuar.</CardDescription>
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
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nova Senha</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="Sua nova senha"
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
                      <FormLabel>Confirmar Nova Senha</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="Confirme sua nova senha"
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
                  {isLoading ? 'Processando...' : 'Redefinir Senha'}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button variant="link" onClick={handleNavigateToLogin} disabled={isLoading}>
              Voltar para o Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default ResetPasswordPage
