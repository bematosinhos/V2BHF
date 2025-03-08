import { FC, useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from 'sonner'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAppStore, Professional } from '@/store'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { AlertCircle, Info, Loader2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { checkSupabaseConnection } from '@/lib/supabase'

// Validações personalizadas
const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/
const phoneRegex = /^\(\d{2}\)\s\d{5}-\d{4}$|^\(\d{2}\)\s\d{4}-\d{4}$|^\d{10,11}$/

// Lista de cidades pré-definidas
const CITIES = [
  'São Paulo',
  'Rio de Janeiro',
  'Belo Horizonte',
  'Brasília',
  'Salvador',
  'Fortaleza',
  'Recife',
  'Porto Alegre',
  'Curitiba',
  'Manaus',
  'Belém',
  'Goiânia',
  'Guarulhos',
  'Campinas',
  'São Luís',
  'São Gonçalo',
  'Maceió',
  'Duque de Caxias',
  'Natal',
  'Campo Grande',
]

const professionalFormSchema = z.object({
  name: z.string().min(3, { message: 'O nome deve ter pelo menos 3 caracteres' }),
  role: z.string().min(1, { message: 'Selecione uma função' }),
  cpf: z.string().regex(cpfRegex, { message: 'CPF inválido. Use o formato 000.000.000-00' }),
  birthDate: z.string().min(1, { message: 'Data de nascimento é obrigatória' }),
  startDate: z.string().min(1, { message: 'Data de início é obrigatória' }),
  workHours: z.string().min(1, { message: 'Carga horária é obrigatória' }),
  workCity: z.string().min(1, { message: 'Cidade de trabalho é obrigatória' }),
  workStartTime: z.string().min(1, { message: 'Horário de início é obrigatório' }),
  workEndTime: z.string().min(1, { message: 'Horário de término é obrigatório' }),
  phone: z
    .string()
    .regex(phoneRegex, { message: 'Telefone inválido. Use o formato (00) 00000-0000' }),
  email: z.string().email({ message: 'Email inválido' }).min(1, { message: 'Email é obrigatório' }),
  status: z.enum(['active', 'inactive', 'vacation']).default('active'),
})

type ProfessionalFormValues = z.infer<typeof professionalFormSchema>

const defaultValues: Partial<ProfessionalFormValues> = {
  name: '',
  role: '',
  cpf: '',
  birthDate: '',
  startDate: '',
  workHours: '',
  workCity: '',
  workStartTime: '08:00',
  workEndTime: '17:00',
  phone: '',
  email: '',
  status: 'active',
}

const RegisterPage: FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const editId = searchParams.get('edit')
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formErrors, setFormErrors] = useState<string[]>([])
  const [showValidationErrors, setShowValidationErrors] = useState(false)

  const { professionals, addProfessional, updateProfessional, removeProfessional, isLoading } =
    useAppStore()

  // Encontrar o profissional a ser editado
  const professionalToEdit = editId ? professionals.find((p) => p.id === editId) : null

  const form = useForm<ProfessionalFormValues>({
    resolver: zodResolver(professionalFormSchema),
    defaultValues,
    mode: 'onChange'
  })

  // Atualizar a lista de erros quando o estado do formulário mudar
  useEffect(() => {
    if (showValidationErrors) {
      const errors = Object.entries(form.formState.errors)
        .filter(([_, error]) => error.message)
        .map(([field, error]) => `${getFieldLabel(field)}: ${error.message}`);
      
      setFormErrors(errors);
    }
  }, [form.formState.errors, showValidationErrors]);

  // Função auxiliar para obter o rótulo do campo com base no nome
  const getFieldLabel = (fieldName: string): string => {
    const labels: Record<string, string> = {
      name: 'Nome',
      role: 'Função',
      cpf: 'CPF',
      birthDate: 'Data de Nascimento',
      startDate: 'Data de Início',
      workHours: 'Carga Horária',
      workCity: 'Cidade de Trabalho',
      workStartTime: 'Horário de Início',
      workEndTime: 'Horário de Término',
      phone: 'Telefone',
      email: 'Email',
      status: 'Status'
    };
    return labels[fieldName] || fieldName;
  };

  // Preencher o formulário com os dados do profissional quando estiver editando
  useEffect(() => {
    if (professionalToEdit) {
      let workStartTime = '08:00'
      let workEndTime = '17:00'

      const regex = /(\d{2}:\d{2})-(\d{2}:\d{2})/
      const workHoursMatch = regex.exec(professionalToEdit.workHours ?? '')
      if (workHoursMatch) {
        workStartTime = workHoursMatch[1]
        workEndTime = workHoursMatch[2]
      }

      form.reset({
        name: professionalToEdit.name,
        role: professionalToEdit.role,
        cpf: professionalToEdit.cpf,
        birthDate: professionalToEdit.birthDate,
        startDate: professionalToEdit.startDate,
        workHours: professionalToEdit.workHours.replace(/\D/g, ''),
        workCity: professionalToEdit.workCity ?? '',
        workStartTime,
        workEndTime,
        phone: professionalToEdit.phone,
        email: professionalToEdit.email ?? '',
        status: professionalToEdit.status,
      })
    }
  }, [professionalToEdit, form])

  async function onSubmit(data: ProfessionalFormValues) {
    try {
      setIsSubmitting(true);
      setShowValidationErrors(false);
      
      // Mostrar toast de processamento para feedback imediato
      const loadingToast = toast.loading('Processando...');

      // Formatar o horário de trabalho
      const formattedWorkHours = `${data.workStartTime}-${data.workEndTime}`;

      // Preparar os dados do profissional
      const professionalData: Omit<Professional, 'id'> = {
        name: data.name,
        role: data.role,
        cpf: data.cpf,
        birthDate: data.birthDate,
        startDate: data.startDate,
        workHours: formattedWorkHours,
        workCity: data.workCity,
        salary: '',
        address: '',
        phone: data.phone,
        email: data.email,
        status: data.status,
        avatarUrl: professionalToEdit?.avatarUrl ?? '',
      };

      // Verificação adicional com o Supabase antes de prosseguir
      const connectionCheck = await checkSupabaseConnection();
      if (!connectionCheck.success) {
        toast.dismiss(loadingToast);
        toast.error('Erro de conexão com o servidor. Verifique sua internet e tente novamente.');
        console.error('Falha na conexão com Supabase:', connectionCheck.error);
        return;
      }

      if (editId) {
        // Atualizar profissional existente
        const result = await updateProfessional(editId, professionalData);
        if (result) {
          toast.dismiss(loadingToast);
          toast.success('Profissional atualizado com sucesso!');
        } else {
          throw new Error('Falha ao atualizar profissional');
        }
      } else {
        // Adicionar novo profissional
        const result = await addProfessional(professionalData);
        if (result) {
          toast.dismiss(loadingToast);
          toast.success('Profissional cadastrado com sucesso!');
          form.reset(defaultValues);
        } else {
          throw new Error('Falha ao adicionar profissional');
        }
      }

      // Redirecionar para a lista de profissionais
      navigate('/professionals');
    } catch (error) {
      console.error('Erro ao salvar profissional:', error);
      toast.error(`Erro ao salvar profissional: ${error instanceof Error ? error.message : 'Tente novamente'}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Função para tentar submeter o formulário e mostrar erros se houver
  async function handleFormSubmit() {
    try {
      const isValid = await form.trigger();
      
      if (!isValid) {
        setShowValidationErrors(true);
        return;
      }
      
      const values = form.getValues();
      await onSubmit(values);
    } catch (error) {
      console.error('Erro ao validar formulário:', error);
      toast.error('Erro ao validar formulário');
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (editId) {
      try {
        setIsSubmitting(true)
        await removeProfessional(editId)
        toast.success('Profissional excluído com sucesso!')
        void navigate('/professionals')
      } catch (error) {
        console.error('Erro ao excluir profissional:', error)
        toast.error('Erro ao excluir profissional. Tente novamente.')
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  function handleCancel() {
    void navigate('/professionals')
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {editId ? 'Editar Profissional' : 'Cadastro de Profissional'}
            </h1>
            <p className="text-muted-foreground">
              {editId
                ? 'Edite as informações do profissional.'
                : 'Cadastre novos profissionais e configure suas informações.'}
            </p>
          </div>

          {editId && (
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Excluir Profissional</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Isso excluirá permanentemente o profissional e
                    todos os seus registros de ponto.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => void handleDelete()}>
                    Confirmar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{editId ? 'Editar Profissional' : 'Novo Profissional'}</CardTitle>
            <CardDescription>Preencha os dados do profissional doméstico.</CardDescription>
          </CardHeader>
          <CardContent>
            {showValidationErrors && formErrors.length > 0 && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Não foi possível salvar o formulário</AlertTitle>
                <AlertDescription>
                  <p>Por favor, corrija os seguintes campos:</p>
                  <ul className="mt-2 list-disc pl-5">
                    {formErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleFormSubmit();
                }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Informações Pessoais</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Completo</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome do profissional" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Função</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione uma função" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="babá">Babá</SelectItem>
                              <SelectItem value="empregada">Empregada Doméstica</SelectItem>
                              <SelectItem value="jardineiro">Jardineiro</SelectItem>
                              <SelectItem value="motorista">Motorista</SelectItem>
                              <SelectItem value="cozinheira">Cozinheira</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cpf"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CPF</FormLabel>
                          <FormControl>
                            <Input placeholder="000.000.000-00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="birthDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de Nascimento</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Informações Profissionais</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de Início</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="workHours"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Carga Horária Mensal (horas)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="220" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="workCity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cidade de Trabalho</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione uma cidade" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {CITIES.map((city) => (
                                <SelectItem key={city} value={city}>
                                  {city}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <FormLabel>Horário Base de Trabalho</FormLabel>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="text-muted-foreground h-4 w-4" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">
                                Horário padrão de início e fim da jornada de trabalho, descontando
                                automaticamente 1h de almoço
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <FormField
                          control={form.control}
                          name="workStartTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Início</FormLabel>
                              <FormControl>
                                <Input type="time" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="workEndTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Fim</FormLabel>
                              <FormControl>
                                <Input type="time" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione um status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="active">Ativo</SelectItem>
                              <SelectItem value="inactive">Inativo</SelectItem>
                              <SelectItem value="vacation">Férias</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Informações de Contato</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone</FormLabel>
                          <FormControl>
                            <Input placeholder="(00) 00000-0000" {...field} />
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
                            <Input type="email" placeholder="email@exemplo.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {editId ? 'Salvando...' : 'Cadastrando...'}
                      </>
                    ) : editId ? (
                      'Salvar Alterações'
                    ) : (
                      'Cadastrar Profissional'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default RegisterPage
