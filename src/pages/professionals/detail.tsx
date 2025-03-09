import { FC, useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { format, differenceInMonths, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  CalendarIcon,
  Clock,
  FileDown,
  ArrowLeft,
  Calendar as CalendarIcon2,
  FileText,
  AlertCircle,
  Coffee,
} from 'lucide-react'
import { useAppStore } from '@/store'
import { toast } from 'sonner'
import { DateRange } from 'react-day-picker'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { formatDateRange } from '@/lib/calendar-utils'
import { supabase } from '@/lib/supabase'
import { Textarea } from '@/components/ui/textarea'

const ProfessionalDetailPage: FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { professionals, timeRecords, removeProfessional } = useAppStore()

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // Primeiro dia do mês atual
    to: new Date(), // Hoje
  })

  // Adicionar estado para controlar o salvamento
  const [isSaving, setIsSaving] = useState(false)
  const [professionalDetails, setProfessionalDetails] = useState<{
    notes: string;
    balanceHours: number;
    vacationDays: number;
    lastVacationDate: string | null;
  }>({
    notes: '',
    balanceHours: 0,
    vacationDays: 0,
    lastVacationDate: null,
  })

  // Encontrar o profissional pelo ID
  const professional = professionals.find((p) => p.id === id)

  // Redirecionar se o profissional não for encontrado
  useEffect(() => {
    if (!professional) {
      toast.error('Profissional não encontrado')
      void navigate('/professionals')
    }
  }, [professional, navigate])

  if (!professional) {
    return null
  }

  // Filtrar registros de ponto do profissional no período selecionado
  
  // Estado para armazenar os registros de escala do Supabase
  const [scheduleRecords, setScheduleRecords] = useState<Array<{
    id: string;
    professional_id: string;
    date: string;
    day_type: string;
    start_time: string;
    end_time: string;
    balance: number;
    created_at: string;
    updated_at: string;
  }>>([]);
  
  // Função para buscar os registros de escala do Supabase
  const loadScheduleRecordsFromSupabase = async () => {
    if (!dateRange?.from || !dateRange?.to || !id) return;
    
    try {
      const fromDate = format(dateRange.from, 'yyyy-MM-dd');
      const toDate = format(dateRange.to, 'yyyy-MM-dd');
      
      // Buscar registros de escala do período selecionado
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .eq('professional_id', id)
        .gte('date', fromDate)
        .lte('date', toDate);
        
      if (error) {
        console.error('Erro ao buscar registros de escala:', error);
        toast.error('Erro ao carregar dados de escala');
        return;
      }
      
      if (data) {
        console.log(`Carregados ${data.length} registros de escala do Supabase`);
        setScheduleRecords(data);
      }
    } catch (error) {
      console.error('Erro ao buscar registros de escala:', error);
      toast.error('Erro ao carregar dados de escala');
    }
  };
  
  // Efeito para carregar registros de escala quando o período mudar
  useEffect(() => {
    if (dateRange?.from && dateRange?.to && id) {
      loadScheduleRecordsFromSupabase();
    }
  }, [dateRange, id]);

  // Calcular banco de horas com base nos registros da tabela schedules
  const calculateOvertimeBalance = () => {
    if (!dateRange?.from || !dateRange?.to || !id || scheduleRecords.length === 0) return 0;
    
    // Calcular a diferença entre horas trabalhadas e esperadas
    let totalBalance = 0;
    
    // Usar diretamente o campo balance de cada registro
    scheduleRecords.forEach(record => {
      // Somar o saldo de horas de cada registro
      totalBalance += record.balance || 0;
    });
    
    return totalBalance;
  };

  // Formatar minutos para exibição
  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(Math.abs(minutes) / 60)
    const mins = Math.abs(minutes) % 60
    const sign = minutes < 0 ? '-' : '+'
    return `${sign}${hours}h ${mins}min`
  }

  // Calcular dias de férias acumulados (CLT: 30 dias a cada 12 meses trabalhados)
  const calculateVacationDays = () => {
    const startDate = parseISO(professional.startDate)
    const today = new Date()
    const monthsWorked = differenceInMonths(today, startDate)

    // Proporção de dias de férias por mês trabalhado (30/12 = 2.5 dias por mês)
    const vacationDays = Math.floor(monthsWorked * 2.5)

    // Máximo de 30 dias acumulados
    return Math.min(vacationDays, 30)
  }

  // Calcular dias de atestado médico (simulação)
  const calculateSickDays = () => {
    // Simulação - em um sistema real, seria calculado com base nos registros
    return 3
  }

  // Calcular dias de falta (simulação)
  const calculateAbsenceDays = () => {
    // Simulação - em um sistema real, seria calculado com base nos registros
    return 1
  }

  // Calcular dias de folga (simulação)
  const calculateDaysOff = () => {
    // Simulação - em um sistema real, seria calculado com base nos registros
    return 8
  }

  // Função para exportar extrato em PDF
  const handleExportPDF = async () => {
    try {
      if (!dateRange?.from || !dateRange?.to) {
        toast.error('Selecione um período para exportar o extrato')
        return
      }

      // Importar dinamicamente a função de exportação
      const { exportProfessionalStatementPdf } = await import('@/lib/pdf-export')

      // Exportar o PDF
      exportProfessionalStatementPdf(professional, dateRange.from, dateRange.to, timeRecords)
      toast.success('Extrato exportado com sucesso!')
    } catch (error) {
      console.error('Erro ao exportar PDF:', error)
      toast.error('Erro ao exportar o extrato')
    }
  }

  // Wrapper não-assíncrono para o handler do botão
  const handleExportPDFClick = () => {
    void handleExportPDF()
  }

  // Formatar período selecionado para exibição
  const formattedDateRange = () => {
    if (!dateRange?.from || !dateRange?.to) return 'Selecione um período'

    // Usar a função formatDateRange para uma exibição mais clara
    return formatDateRange(dateRange.from, dateRange.to)
  }

  // Obter o status do profissional
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Ativo</Badge>
      case 'inactive':
        return <Badge variant="destructive">Inativo</Badge>
      case 'vacation':
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-500">
            Férias
          </Badge>
        )
      default:
        return null
    }
  }

  // Wrapper para navegação
  const handleNavigate = (path: string) => {
    void navigate(path)
  }

  // Função para carregar os detalhes do profissional do Supabase
  const loadProfessionalDetails = async () => {
    if (!id) return
    
    try {
      const { data, error } = await supabase
        .from('professional_details')
        .select('*')
        .eq('professional_id', id)
        .single()
        
      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao carregar detalhes do profissional:', error)
        return
      }
      
      if (data) {
        setProfessionalDetails({
          notes: data.notes || '',
          balanceHours: data.balance_hours || 0,
          vacationDays: data.vacation_days || 0,
          lastVacationDate: data.last_vacation_date || null,
        })
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes do profissional:', error)
    }
  }
  
  // Função para salvar os detalhes do profissional no Supabase
  const saveProfessionalDetails = async () => {
    if (!id) return
    
    try {
      setIsSaving(true)
      
      // Calcular o saldo de horas atual a partir dos registros da tabela schedules
      const currentBalance = calculateOvertimeBalance();
      
      // Verificar se já existe um registro para este profissional
      const { data, error: fetchError } = await supabase
        .from('professional_details')
        .select('*')
        .eq('professional_id', id)
        .single()
        
      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError
      }
      
      // Preparar dados para salvar - usando o saldo calculado dos registros
      const detailsData = {
        professional_id: id,
        notes: professionalDetails.notes,
        balance_hours: currentBalance, // Usar saldo calculado em vez do valor armazenado
        vacation_days: professionalDetails.vacationDays,
        last_vacation_date: professionalDetails.lastVacationDate,
        updated_at: new Date().toISOString(),
      }
      
      if (data) {
        // Atualizar registro existente
        const { error: updateError } = await supabase
          .from('professional_details')
          .update(detailsData)
          .eq('professional_id', id)
          
        if (updateError) throw updateError
      } else {
        // Criar novo registro
        const { error: insertError } = await supabase
          .from('professional_details')
          .insert({
            ...detailsData,
            created_at: new Date().toISOString(),
          })
          
        if (insertError) throw insertError
      }
      
      // Atualizar o estado local para refletir os dados salvos
      setProfessionalDetails(prev => ({
        ...prev,
        balanceHours: currentBalance
      }));
      
      toast.success('Detalhes do profissional salvos com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar detalhes do profissional:', error)
      toast.error('Erro ao salvar detalhes do profissional. Tente novamente.')
    } finally {
      setIsSaving(false)
    }
  }
  
  // Carregar detalhes do profissional ao montar o componente
  useEffect(() => {
    if (id) {
      loadProfessionalDetails();
      
      // Também carregar os registros de escala se o período estiver definido
      if (dateRange?.from && dateRange?.to) {
        loadScheduleRecordsFromSupabase();
      }
    }
  }, [id]);

  // Adicionar função para recalcular o saldo de horas
  const recalculateHoursBalance = async () => {
    try {
      setIsSaving(true);
      
      // Forçar recarregamento dos registros de escala
      await loadScheduleRecordsFromSupabase();
      
      // Calcular saldo com base nos registros carregados
      const currentBalance = calculateOvertimeBalance();
      
      // Atualizar o estado local
      setProfessionalDetails(prev => ({
        ...prev,
        balanceHours: currentBalance
      }));
      
      toast.success('Saldo de horas recalculado com sucesso!');
    } catch (error) {
      console.error('Erro ao recalcular saldo de horas:', error);
      toast.error('Erro ao recalcular saldo de horas. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  // Adicionar botão para salvar detalhes do profissional
  const renderSaveButton = () => {
    return (
      <div className="flex gap-2 mt-4">
        <Button 
          onClick={saveProfessionalDetails}
          disabled={isSaving}
        >
          {isSaving ? 'Salvando...' : 'Salvar Detalhes do Profissional'}
        </Button>
        
        <Button 
          onClick={recalculateHoursBalance}
          disabled={isSaving}
          variant="outline"
        >
          Recalcular Saldo de Horas
        </Button>
      </div>
    )
  }

  // Adicionar manipulador para atualizar as notas
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setProfessionalDetails(prev => ({
      ...prev,
      notes: e.target.value
    }))
  }

  // Adicionar o campo de notas antes do botão de salvar
  const renderNotesField = () => {
    return (
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-base">Anotações</CardTitle>
          <CardDescription>
            Adicione notas ou observações sobre este profissional
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Adicione suas anotações aqui..."
            className="min-h-[150px]"
            value={professionalDetails.notes}
            onChange={handleNotesChange}
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => handleNavigate('/professionals')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Detalhes do Profissional</h1>
          </div>
          <Button onClick={handleExportPDFClick}>
            <FileDown className="mr-2 h-4 w-4" />
            Exportar Extrato
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={professional.avatarUrl} />
                  <AvatarFallback>{professional.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl">{professional.name}</CardTitle>
                  <CardDescription className="mt-1 flex items-center gap-2">
                    <span>{professional.role}</span>
                    <span>•</span>
                    <span>Desde {format(parseISO(professional.startDate), 'dd/MM/yyyy')}</span>
                    <span>•</span>
                    {getStatusBadge(professional.status)}
                  </CardDescription>
                </div>
              </div>

              <div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal md:w-[300px]"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formattedDateRange()}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <div className="border-b p-3">
                      <h4 className="text-sm font-medium">Selecione o período</h4>
                      <p className="text-muted-foreground text-xs">
                        Período para visualização dos dados
                      </p>
                    </div>
                    <Calendar
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={2}
                      locale={ptBR}
                      disabled={{ after: new Date() }}
                      hideWeekdays
                    />
                    <div className="flex gap-2 border-t p-3">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() =>
                          setDateRange({
                            from: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
                            to: new Date(
                              new Date().getFullYear(),
                              new Date().getMonth() - 1,
                              new Date(
                                new Date().getFullYear(),
                                new Date().getMonth(),
                                0,
                              ).getDate(),
                            ),
                          })
                        }
                      >
                        Mês anterior
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() =>
                          setDateRange({
                            from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                            to: new Date(),
                          })
                        }
                      >
                        Mês atual
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Banco de Horas</CardTitle>
                  <Clock className="text-muted-foreground h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div
                    className={`text-2xl font-bold ${calculateOvertimeBalance() >= 0 ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {formatMinutes(calculateOvertimeBalance())}
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Saldo {calculateOvertimeBalance() >= 0 ? 'positivo' : 'negativo'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Férias Acumuladas</CardTitle>
                  <CalendarIcon2 className="text-muted-foreground h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{calculateVacationDays()} dias</div>
                  <p className="text-muted-foreground text-xs">Baseado na CLT</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Atestados Médicos</CardTitle>
                  <FileText className="text-muted-foreground h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{calculateSickDays()} dias</div>
                  <p className="text-muted-foreground text-xs">No período selecionado</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Faltas</CardTitle>
                  <AlertCircle className="text-muted-foreground h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{calculateAbsenceDays()} dias</div>
                  <p className="text-muted-foreground text-xs">No período selecionado</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Folgas</CardTitle>
                  <Coffee className="text-muted-foreground h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{calculateDaysOff()} dias</div>
                  <p className="text-muted-foreground text-xs">No período selecionado</p>
                </CardContent>
              </Card>
            </div>

            <Separator />

            {/* Nova seção de informações de cadastro */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Informações de Cadastro</h3>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Informações Pessoais</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="grid grid-cols-2">
                      <span className="text-muted-foreground text-sm font-medium">Nome:</span>
                      <span className="text-sm">{professional.name}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-muted-foreground text-sm font-medium">Função:</span>
                      <span className="text-sm">{professional.role}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-muted-foreground text-sm font-medium">CPF:</span>
                      <span className="text-sm">{professional.cpf}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-muted-foreground text-sm font-medium">
                        Data de Nascimento:
                      </span>
                      <span className="text-sm">{professional.birthDate}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Informações Profissionais</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="grid grid-cols-2">
                      <span className="text-muted-foreground text-sm font-medium">
                        Data de Início:
                      </span>
                      <span className="text-sm">{professional.startDate}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-muted-foreground text-sm font-medium">
                        Carga Horária:
                      </span>
                      <span className="text-sm">{professional.workHours}h</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-muted-foreground text-sm font-medium">Cidade:</span>
                      <span className="text-sm">{professional.workCity}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-muted-foreground text-sm font-medium">Status:</span>
                      <span className="text-sm">{getStatusBadge(professional.status)}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Informações de Contato</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="grid grid-cols-2">
                      <span className="text-muted-foreground text-sm font-medium">Telefone:</span>
                      <span className="text-sm">{professional.phone}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-muted-foreground text-sm font-medium">Email:</span>
                      <span className="text-sm">{professional.email ?? '-'}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Ações</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button
                      className="w-full"
                      onClick={() => handleNavigate(`/register?edit=${professional.id}`)}
                    >
                      Editar Informações
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full">
                          Excluir Profissional
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Isso excluirá permanentemente o
                            profissional e todos os seus registros de ponto.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => {
                              void removeProfessional(professional.id)
                              toast.success('Profissional removido com sucesso!')
                              handleNavigate('/professionals')
                            }}
                          >
                            Confirmar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Separator />

            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => handleNavigate('/professionals')}>
                Voltar
              </Button>
              <Button onClick={() => handleNavigate(`/register?edit=${professional.id}`)}>
                Editar Profissional
              </Button>
            </CardFooter>
          </CardContent>
        </Card>

        {renderNotesField()}
        {renderSaveButton()}
      </div>
    </DashboardLayout>
  )
}

export default ProfessionalDetailPage
