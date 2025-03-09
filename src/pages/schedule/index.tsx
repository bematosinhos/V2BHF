import { FC, useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Mail,
  MessageSquare,
} from 'lucide-react'
import {
  format,
  getYear,
  getMonth,
  startOfMonth,
  endOfMonth,
  eachWeekOfInterval,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isWeekend,
  differenceInMinutes,
  isToday,
  isPast,
  startOfISOWeek,
  endOfISOWeek,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useAppStore, TimeRecord } from '@/store'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'

// Lista de feriados nacionais para 2023/2024 (exemplo)
const HOLIDAYS = [
  { date: '2023-11-02', name: 'Finados' },
  { date: '2023-11-15', name: 'Proclamação da República' },
  { date: '2023-12-25', name: 'Natal' },
  { date: '2024-01-01', name: 'Confraternização Universal' },
  { date: '2024-02-12', name: 'Carnaval' },
  { date: '2024-02-13', name: 'Carnaval' },
  { date: '2024-03-29', name: 'Sexta-feira Santa' },
  { date: '2024-04-21', name: 'Tiradentes' },
  { date: '2024-05-01', name: 'Dia do Trabalho' },
  { date: '2024-05-30', name: 'Corpus Christi' },
  { date: '2024-09-07', name: 'Independência do Brasil' },
  { date: '2024-10-12', name: 'Nossa Senhora Aparecida' },
  { date: '2024-11-02', name: 'Finados' },
  { date: '2024-11-15', name: 'Proclamação da República' },
  { date: '2024-12-25', name: 'Natal' },
]

// Tipos de dia
type DayType = 'normal' | 'falta' | 'folga' | 'ferias' | 'atestado' | 'dsr'

// Interface para os dados de um dia na escala
// Removendo a interface não utilizada ou comentando-a
// interface ScheduleDay {
//   date: Date;
//   startTime: string;
//   endTime: string;
//   type: DayType;
//   hoursBalance: number; // em minutos
//   isHoliday?: boolean;
//   holidayName?: string;
// }

// Modificar a definição do tipo Schedule para estar sendo utilizada
// Alterando de interface para export type para permitir seu uso em outros arquivos
export type Schedule = {
  professionalId: string;
  date: string;
  dayType: DayType;
  startTime: string;
  endTime: string;
  balance: number;
  status?: string;
}

const SchedulePage: FC = () => {
  const { professionals, selectedProfessionalId, timeRecords } = useAppStore()

  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [selectedYear, setSelectedYear] = useState<number>(getYear(new Date()))
  const [selectedMonth, setSelectedMonth] = useState<number>(getMonth(new Date()))
  
  // Novo estado para controle de alterações
  const [selectedTypes, setSelectedTypes] = useState<Record<string, DayType>>({})
  const [pendingChanges, setPendingChanges] = useState<Record<string, any>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null)

  // Referência para alterações não salvas ao sair da página
  const hasUnsavedChanges = Object.keys(pendingChanges).length > 0
  
  const selectedProfessional = professionals.find((p) => p.id === selectedProfessionalId)

  // Gerar anos para o seletor (5 anos para trás e 5 para frente)
  const years = Array.from({ length: 11 }, (_, i) => getYear(new Date()) - 5 + i)

  // Gerar meses para o seletor
  const months = Array.from({ length: 12 }, (_, i) => i)

  // Atualizar a data atual quando o mês ou ano mudar
  useEffect(() => {
    const newDate = new Date()
    newDate.setFullYear(selectedYear)
    newDate.setMonth(selectedMonth)
    setCurrentDate(newDate)
  }, [selectedYear, selectedMonth])

  // Gerar as semanas do mês
  const getWeeksOfMonth = () => {
    const start = startOfMonth(currentDate)
    const end = endOfMonth(currentDate)

    return eachWeekOfInterval(
      { start, end },
      { weekStartsOn: 0 }, // Domingo como início da semana
    )
  }

  // Gerar os dias de uma semana
  const getDaysOfWeek = (weekStart: Date) => {
    const start = startOfWeek(weekStart, { weekStartsOn: 0 })
    const end = endOfWeek(weekStart, { weekStartsOn: 0 })

    return eachDayOfInterval({ start, end })
  }

  // Verificar se uma data é feriado
  const isHoliday = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd')
    return HOLIDAYS.find((h) => h.date === dateString)
  }

  // Add default schedule values for professional
  const defaultCheckIn = '08:00'
  const defaultCheckOut = '17:00'

  // Modify the calculateDayHoursBalance function to always subtract 60 minutes of lunch
  const calculateDayHoursBalance = (day: Date, startTime: string, endTime: string): number => {
    if (!startTime || !endTime || startTime === '00:00' || endTime === '00:00') {
      return 0
    }
    const [startHours, startMinutes] = startTime.split(':').map(Number)
    const [endHours, endMinutes] = endTime.split(':').map(Number)
    const startDate = new Date(day)
    startDate.setHours(startHours, startMinutes, 0, 0)
    const endDate = new Date(day)
    endDate.setHours(endHours, endMinutes, 0, 0)
    return differenceInMinutes(endDate, startDate) - 60
  }

  // Obter o tipo de dia com base nos registros
  const getDayType = (date: Date, records: TimeRecord[]): DayType => {
    const dateString = format(date, 'yyyy-MM-dd')
    
    // Se tiver um tipo selecionado no estado local, use-o primeiro
    if (selectedTypes[dateString]) {
      return selectedTypes[dateString]
    }
    
    const record = records.find(
      (r) => r.date === dateString && r.professionalId === selectedProfessionalId,
    )

    // Se tiver registro, verifica o tipo e as notas
    if (record) {
      if (record.type === 'vacation') return 'ferias'
      if (record.type === 'dayoff') return 'folga'
      if (record.notes?.toLowerCase().includes('atestado')) return 'atestado'
      if (record.notes?.toLowerCase().includes('falta')) return 'falta'
      if (
        record.notes?.toLowerCase().includes('descanso semanal remunerado') ||
        record.notes?.toLowerCase().includes('dsr')
      )
        return 'dsr'
    }

    // Se não tiver registro e for fim de semana, retorna DSR como padrão
    if (!record && isWeekend(date)) {
      return 'dsr'
    }

    // Caso padrão para dias úteis
    return 'normal'
  }

  // Add missing formatMinutes function
  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(Math.abs(minutes) / 60)
    const mins = Math.abs(minutes) % 60
    const sign = minutes < 0 ? '-' : '+'
    return `${sign}${hours}h ${mins}min`
  }

  // Mapping from new DayType to store-compatible type
  const dayTypeMapping: Record<DayType, TimeRecord['type']> = {
    normal: 'regular',
    falta: 'regular',
    folga: 'dayoff',
    ferias: 'vacation',
    atestado: 'regular',
    dsr: 'regular',
  }

  // Calcular banco de horas
  const calculateOvertimeBalance = () => {
    // Gerar todos os dias do mês atual
    const monthDays = eachDayOfInterval({
      start: startOfMonth(currentDate),
      end: endOfMonth(currentDate),
    })
    let totalImpact = 0

    monthDays.forEach((day) => {
      const dateStr = format(day, 'yyyy-MM-dd')
      const record = timeRecords.find(
        (r) => r.date === dateStr && r.professionalId === selectedProfessionalId,
      )
      const dayTypeCalculated = getDayType(day, timeRecords)
      const holiday = isHoliday(day)

      // Aplicar regras de negócio para cada tipo de dia, consistente com getDailyBalance
      let expected = 480 // default expectation in minutes for a normal work day
      let worked = 0

      // 1. Dias que não impactam o banco de horas e reduzem carga horária esperada
      if (
        holiday ||
        dayTypeCalculated === 'ferias' ||
        dayTypeCalculated === 'atestado' ||
        dayTypeCalculated === 'dsr' ||
        dayTypeCalculated === 'folga'
      ) {
        expected = 0
        worked = 0
      }
      // 2. Dias que geram impacto negativo no banco de horas e não reduzem carga esperada
      else if (dayTypeCalculated === 'falta') {
        expected = 480
        worked = 0
      }
      // 3. Dias normais de trabalho (incluindo fins de semana configurados como normais)
      else {
        expected = 480
        if (record?.checkIn && record?.checkOut) {
          worked = calculateDayHoursBalance(day, record.checkIn, record.checkOut)
        } else {
          // Usar valores padrão para dias normais sem registro explícito
          worked = calculateDayHoursBalance(day, defaultCheckIn, defaultCheckOut)
        }
      }

      // Calcular impacto no banco de horas
      totalImpact += worked - expected
    })

    return totalImpact
  }

  // Calcular horas trabalhadas em uma semana - ajustado para cálculo total de horas
  const calculateWeeklyHours = (weekStart: Date) => {
    const days = getDaysOfWeek(weekStart)
    let totalMinutes = 0

    days.forEach((day) => {
      // Calcular apenas para os dias do mês atual
      if (!isSameMonth(day, currentDate)) return

      const dateString = format(day, 'yyyy-MM-dd')
      const record = timeRecords.find(
        (r) => r.date === dateString && r.professionalId === selectedProfessionalId,
      )
      const dayType = getDayType(day, timeRecords)
      const holiday = isHoliday(day)
      const pendingChange = pendingChanges[dateString];

      // Determinar o tipo efetivo considerando alterações pendentes
      const effectiveType = pendingChange?.type 
        ? Object.entries(dayTypeMapping).find(([_, v]) => v === pendingChange.type)?.[0] as DayType || dayType
        : dayType;

      // Aplicar regras consistentes com getDailyBalance
      // Dias que não contabilizam horas
      if (
        holiday ||
        effectiveType === 'ferias' ||
        effectiveType === 'atestado' ||
        effectiveType === 'dsr' ||
        effectiveType === 'folga' ||
        effectiveType === 'falta'
      ) {
        return // Não adiciona horas
      }

      // Para dias normais (incluindo fins de semana configurados como normais)
      if (effectiveType === 'normal') {
        // Determinar horários efetivos, considerando alterações pendentes
        const effectiveCheckIn = pendingChange?.checkIn || record?.checkIn || defaultCheckIn;
        const effectiveCheckOut = pendingChange?.checkOut || record?.checkOut || defaultCheckOut;
        
        // Calcular horas trabalhadas com os horários efetivos
        totalMinutes += calculateDayHoursBalance(day, effectiveCheckIn, effectiveCheckOut);
      }
    })

    return totalMinutes
  }

  // Calcular e exibir o saldo diário para um dia específico
  const getDailyBalance = (
    day: Date,
    record: TimeRecord | undefined,
    dayType: DayType,
    holiday: ReturnType<typeof isHoliday>,
  ) => {
    let worked = 0
    const dateString = format(day, 'yyyy-MM-dd');
    const pendingChange = pendingChanges[dateString];
    
    // Determinar o tipo efetivo considerando alterações pendentes
    const effectiveType = pendingChange?.type 
      ? Object.entries(dayTypeMapping).find(([_, v]) => v === pendingChange.type)?.[0] as DayType || dayType
      : dayType;

    // 1. Dias que não impactam o banco de horas e reduzem carga horária esperada
    if (
      holiday ||
      effectiveType === 'ferias' ||
      effectiveType === 'atestado' ||
      effectiveType === 'dsr' ||
      effectiveType === 'folga'
    ) {
      return { balance: 0, display: '-', color: 'text-muted-foreground' }
    }
    // 2. Dias que geram impacto negativo no banco de horas e não reduzem carga esperada
    else if (effectiveType === 'falta') {
      return {
        balance: -480,
        display: formatMinutes(-480),
        color: 'text-red-600 dark:text-red-400',
      }
    }
    // 3. Dias normais de trabalho
    else {
      // Determinar horários efetivos, considerando alterações pendentes
      const effectiveCheckIn = pendingChange?.checkIn || record?.checkIn || defaultCheckIn;
      const effectiveCheckOut = pendingChange?.checkOut || record?.checkOut || defaultCheckOut;
      
      // Calcular horas trabalhadas com os horários efetivos
      worked = calculateDayHoursBalance(day, effectiveCheckIn, effectiveCheckOut);

      // Para o tipo normal, vamos mostrar diretamente as horas trabalhadas em vez de (trabalhado - esperado)
      return {
        balance: worked,
        display: formatWorkedTime(worked),
        color: 'text-muted-foreground', // Usar cor neutra para mostrar que é informativo e não saldo
      }
    }
  }

  // Nova função para formatar o tempo trabalhado (sem o sinal + ou -)
  const formatWorkedTime = (minutes: number) => {
    const hours = Math.floor(Math.abs(minutes) / 60)
    const mins = Math.abs(minutes) % 60
    return `${hours}h ${mins}min`
  }

  // Função simplificada para atualizar o tipo do dia
  const updateDayType = (date: Date, type: DayType) => {
    const dateString = format(date, 'yyyy-MM-dd')
    const storeType = dayTypeMapping[type]
    
    // Atualizar estado local para feedback imediato
    setSelectedTypes(prev => ({
      ...prev,
      [dateString]: type
    }))
    
    // Preparar dados para atualização
    let recordUpdate: Partial<TimeRecord> = { 
      type: storeType,
      notes: ''
    }
    
    // Configurar registros conforme o tipo
    if (type !== 'normal') {
      recordUpdate.checkIn = ''
      recordUpdate.checkOut = ''
      
      // Adicionar notas específicas
      switch (type) {
        case 'falta':
          recordUpdate.notes = 'falta'
          break
        case 'atestado':
          recordUpdate.notes = 'atestado'
          break
        case 'ferias':
          recordUpdate.notes = 'férias'
          break
        case 'folga':
          recordUpdate.notes = 'folga'
          break
        case 'dsr':
          recordUpdate.notes = 'descanso semanal remunerado'
          break
      }
    } else {
      // Para tipo normal, usar os horários padrão
      recordUpdate.checkIn = defaultCheckIn
      recordUpdate.checkOut = defaultCheckOut
    }
    
    // Adicionar à lista de alterações pendentes
    setPendingChanges(prev => ({
      ...prev,
      [dateString]: recordUpdate
    }));
    
    console.log(`Alteração pendente para ${dateString}: tipo = ${type}`);
  }

  // Calcular total de horas trabalhadas no mês
  const calculateMonthlyHours = () => {
    let totalMinutes = 0

    // Gerar todos os dias do mês atual
    const monthDays = eachDayOfInterval({
      start: startOfMonth(currentDate),
      end: endOfMonth(currentDate),
    })

    monthDays.forEach((day) => {
      const dateString = format(day, 'yyyy-MM-dd')
      const record = timeRecords.find(
        (r) => r.date === dateString && r.professionalId === selectedProfessionalId,
      )
      const dayType = getDayType(day, timeRecords)
      const holiday = isHoliday(day)
      const pendingChange = pendingChanges[dateString];

      // Determinar o tipo efetivo considerando alterações pendentes
      const effectiveType = pendingChange?.type 
        ? Object.entries(dayTypeMapping).find(([_, v]) => v === pendingChange.type)?.[0] as DayType || dayType
        : dayType;

      // Aplicar regras consistentes com getDailyBalance
      // Dias que não contabilizam horas
      if (
        holiday ||
        effectiveType === 'ferias' ||
        effectiveType === 'atestado' ||
        effectiveType === 'dsr' ||
        effectiveType === 'folga' ||
        effectiveType === 'falta'
      ) {
        return // Não adiciona horas
      }

      // Para dias normais (incluindo fins de semana configurados como normais)
      if (effectiveType === 'normal') {
        // Determinar horários efetivos, considerando alterações pendentes
        const effectiveCheckIn = pendingChange?.checkIn || record?.checkIn || defaultCheckIn;
        const effectiveCheckOut = pendingChange?.checkOut || record?.checkOut || defaultCheckOut;
        
        // Calcular horas trabalhadas com os horários efetivos
        totalMinutes += calculateDayHoursBalance(day, effectiveCheckIn, effectiveCheckOut);
      }
    })

    return totalMinutes
  }

  // Atualizar horário de início ou fim
  const updateTime = (date: Date, isStart: boolean, value: string) => {
    const dateString = format(date, 'yyyy-MM-dd')
    const cellKey = `${selectedProfessionalId}_${dateString}`;
    
    // Armazenar a alteração no formato que o Supabase espera
    const key = isStart ? `start_${cellKey}` : `end_${cellKey}`;
    
    setPendingChanges(prev => ({
      ...prev,
      [key]: value,
      // Adicionando também no formato que os inputs esperam
      [dateString]: {
        ...(prev[dateString] || {}),
        [isStart ? 'checkIn' : 'checkOut']: value
      }
    }));
    
    console.log(`Alteração pendente: ${key} = ${value}`);
  }

  // Enviar escala por WhatsApp
  const sendScheduleByWhatsApp = (weekStart: Date) => {
    if (!selectedProfessional) return

    const days = getDaysOfWeek(weekStart)
    const phone = selectedProfessional.phone.replace(/\D/g, '')

    // Obter primeiro nome do profissional
    const firstName = selectedProfessional.name.split(' ')[0]

    let message = `Olá ${firstName}, tudo bem?\n\nAbaixo segue a sua escala de trabalho para a semana:\n\n`

    days.forEach((day) => {
      const dateString = format(day, 'yyyy-MM-dd')
      const record = timeRecords.find(
        (r) => r.date === dateString && r.professionalId === selectedProfessionalId,
      )

      const dayNumber = format(day, 'dd/MM')
      const dayName = format(day, 'EEEE', { locale: ptBR })
      let tipo = 'Normal'
      let horario = ''

      if (record && record.type === 'regular') {
        horario = `${record.checkIn ?? '--:--'} às ${record.checkOut ?? '--:--'}`
        tipo = 'Normal'
      } else if (record && record.type === 'vacation') {
        horario = '--:-- às --:--'
        tipo = 'Férias'
      } else if (record && record.type === 'dayoff') {
        horario = '--:-- às --:--'
        tipo = 'Folga'
      } else if (isWeekend(day)) {
        horario = '--:-- às --:--'
        tipo = 'DSR'
      } else {
        horario = `${defaultCheckIn} às ${defaultCheckOut}`
        tipo = 'Normal'
      }

      message += `${dayNumber}, ${dayName}, ${horario} - ${tipo}\n`
    })

    message += `\nAtenciosamente,`

    const encodedMessage = encodeURIComponent(message)
    window.open(`https://wa.me/55${phone}?text=${encodedMessage}`, '_blank')
  }

  // Enviar escala por Email
  const sendScheduleByEmail = (weekStart: Date) => {
    if (!selectedProfessional?.email) return

    const days = getDaysOfWeek(weekStart)
    const email = selectedProfessional.email

    // Obter primeiro nome do profissional
    const firstName = selectedProfessional.name.split(' ')[0]

    const subject = `Escala de Trabalho - Semana ${format(weekStart, 'dd/MM')} a ${format(days[6], 'dd/MM')}`
    let body = `Olá ${firstName}, tudo bem?\n\nAbaixo segue a sua escala de trabalho para a semana:\n\n`

    days.forEach((day) => {
      const dateString = format(day, 'yyyy-MM-dd')
      const record = timeRecords.find(
        (r) => r.date === dateString && r.professionalId === selectedProfessionalId,
      )

      const dayNumber = format(day, 'dd/MM')
      const dayName = format(day, 'EEEE', { locale: ptBR })
      let tipo = 'Normal'
      let horario = ''

      if (record && record.type === 'regular') {
        horario = `${record.checkIn ?? '--:--'} às ${record.checkOut ?? '--:--'}`
        tipo = 'Normal'
      } else if (record && record.type === 'vacation') {
        horario = '--:-- às --:--'
        tipo = 'Férias'
      } else if (record && record.type === 'dayoff') {
        horario = '--:-- às --:--'
        tipo = 'Folga'
      } else if (isWeekend(day)) {
        horario = '--:-- às --:--'
        tipo = 'DSR'
      } else {
        horario = `${defaultCheckIn} às ${defaultCheckOut}`
        tipo = 'Normal'
      }

      body += `${dayNumber}, ${dayName}, ${horario} - ${tipo}\n`
    })

    body += `\nAtenciosamente,`

    const encodedSubject = encodeURIComponent(subject)
    const encodedBody = encodeURIComponent(body)
    window.open(`mailto:${email}?subject=${encodedSubject}&body=${encodedBody}`, '_blank')
  }

  // Helper para transformar o tipo em texto formatado
  const formatDayType = (type: DayType): string => {
    const typeMap: Record<DayType, string> = {
      normal: 'Normal',
      falta: 'Falta',
      folga: 'Folga',
      ferias: 'Férias',
      atestado: 'Atestado',
      dsr: 'DSR'
    };
    return typeMap[type] || 'Normal';
  };

  // Detectar alterações não salvas quando o usuário tenta sair da página
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        const message = 'Você tem alterações não salvas. Deseja realmente sair?';
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', onBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  // Melhorar a função loadScheduleFromSupabase para preservar alterações pendentes
  const loadScheduleFromSupabase = async () => {
    try {
      // Não ativar isSaving durante o carregamento normal
      // setIsSaving(true);
      
      const startOfWeek = startOfISOWeek(currentDate);
      const endOfWeek = endOfISOWeek(currentDate);
      
      console.log('Carregando dados da semana:', { 
        startOfWeek: startOfWeek.toISOString(), 
        endOfWeek: endOfWeek.toISOString() 
      });
      
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .gte('date', startOfWeek.toISOString())
        .lte('date', endOfWeek.toISOString());
        
      if (error) {
        console.error('Erro ao carregar dados:', error);
        throw error;
      }
      
      console.log(`Carregados ${data?.length || 0} registros do Supabase`);
      
      if (data && data.length > 0) {
        // Converter dados do banco para o estado da aplicação
        const newSelectedTypes: Record<string, DayType> = {};
        const newPendingChanges: Record<string, any> = {};
        
        data.forEach(item => {
          const dateKey = format(new Date(item.date), 'yyyy-MM-dd');
          const cellKey = `${item.professional_id}_${dateKey}`;
          
          // Armazenar tipo de dia
          newSelectedTypes[cellKey] = item.day_type as DayType;
          
          // Armazenar horários com as chaves corretas - SEMPRE atualize com os valores do banco
          newPendingChanges[`start_${cellKey}`] = item.start_time;
          newPendingChanges[`end_${cellKey}`] = item.end_time;
        });
        
        // Atualizar estados - SEMPRE substituir com os dados do banco
        setSelectedTypes(prev => ({ ...prev, ...newSelectedTypes }));
        setPendingChanges(prev => ({ ...prev, ...newPendingChanges }));
      }
    } catch (error) {
      console.error('Erro ao carregar escala:', error);
      toast.error('Erro ao carregar dados da escala.');
    } finally {
      // Não desativar isSaving aqui, já que não o ativamos
      // setIsSaving(false);
    }
  };

  // Chamar esta função quando a semana mudar
  useEffect(() => {
    loadScheduleFromSupabase();
  }, [currentDate]);
  
  // Adicionar novo efeito para carregar dados quando o profissional for alterado
  useEffect(() => {
    if (selectedProfessionalId) {
      loadScheduleFromSupabase();
    }
  }, [selectedProfessionalId]);

  // Modificar a função saveScheduleToSupabase para atualizar a interface após salvar
  const saveScheduleToSupabase = async () => {
    try {
      setIsSaving(true);
      // Obter a semana atual para busca
      const startOfWeek = startOfISOWeek(currentDate);
      const endOfWeek = endOfISOWeek(currentDate);
      
      console.log('Iniciando salvamento da escala:', { 
        startOfWeek: startOfWeek.toISOString(), 
        endOfWeek: endOfWeek.toISOString()
      });
      
      console.log('Alterações pendentes:', pendingChanges);

      // Verificar se há profissionais selecionados
      const activeProfessionals = professionals.filter(p => p.status === 'active');
      if (activeProfessionals.length === 0) {
        throw new Error('Não há profissionais ativos para salvar na escala');
      }

      // Verificar se a tabela professionals existe e contém registros
      const { data: professionalsCheck, error: professionalCheckError } = await supabase
        .from('professionals')
        .select('id')
        .limit(1);
        
      if (professionalCheckError) {
        console.error('Erro ao verificar tabela de profissionais:', professionalCheckError);
        throw new Error(`Erro na verificação da tabela de profissionais: ${professionalCheckError.message}`);
      }
      
      if (!professionalsCheck || professionalsCheck.length === 0) {
        throw new Error('A tabela de profissionais parece estar vazia. Cadastre profissionais antes de salvar uma escala.');
      }

      // Primeiro, buscar os registros existentes (para não perder dados)
      const { data: existingData, error: fetchError } = await supabase
        .from('schedules')
        .select('*')
        .gte('date', startOfWeek.toISOString())
        .lte('date', endOfWeek.toISOString());
        
      if (fetchError) {
        console.error('Erro ao buscar registros existentes:', fetchError);
        throw fetchError;
      }
      
      // Converter registros existentes para um mapa para fácil acesso
      const existingRecords = new Map();
      if (existingData) {
        existingData.forEach(record => {
          const key = `${record.professional_id}_${format(new Date(record.date), 'yyyy-MM-dd')}`;
          existingRecords.set(key, record);
        });
      }
      
      // Preparar dados para inserção
      const weekStart = startOfISOWeek(currentDate);
      const weekDays = getDaysOfWeek(weekStart);
      
      const scheduleData: Array<{
        id?: string;
        professional_id: string;
        date: string;
        day_type: DayType;
        start_time: string;
        end_time: string;
        balance: number;
        created_at?: string;
        updated_at: string;
      }> = [];
      
      // Para cada profissional ativo
      activeProfessionals.forEach(professional => {
        // Verificar se o ID do profissional é válido
        if (!professional.id || typeof professional.id !== 'string') {
          console.error('ID de profissional inválido:', professional);
          return; // Pular este profissional
        }
        
        // Para cada dia da semana
        weekDays.forEach(day => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const cellKey = `${professional.id}_${dateKey}`;
          
          // Obter dados do estado pendingChanges ou usar valores padrão
          const dayType = selectedTypes[cellKey] || getDayType(day, []);
          
          // Não salvar dias de folga - isso pode ser um problema se a folga for um update
          // if (dayType === 'folga') return;
          
          const startTimeKey = `start_${cellKey}`;
          const endTimeKey = `end_${cellKey}`;
          
          // Buscar valores de horários das alterações pendentes ou do registro existente
          const existingRecord = existingRecords.get(cellKey);
          
          // Validar os valores de horário antes de usá-los
          let startTime = pendingChanges[startTimeKey] || 
                           (existingRecord ? existingRecord.start_time : '08:00');
          let endTime = pendingChanges[endTimeKey] || 
                         (existingRecord ? existingRecord.end_time : '17:00');
          
          // Certificar-se de que os horários estão no formato correto (HH:MM)
          if (!startTime || typeof startTime !== 'string' || !startTime.match(/^\d{1,2}:\d{2}$/)) {
            console.warn(`Horário de início inválido (${startTime}) para ${cellKey}, usando padrão 08:00`);
            startTime = '08:00';
          }
          
          if (!endTime || typeof endTime !== 'string' || !endTime.match(/^\d{1,2}:\d{2}$/)) {
            console.warn(`Horário de término inválido (${endTime}) para ${cellKey}, usando padrão 17:00`);
            endTime = '17:00';
          }
          
          // Calcular saldo
          let balance = 0;
          try {
            balance = calculateDayHoursBalance(day, startTime, endTime);
          } catch (error) {
            console.error(`Erro ao calcular saldo para ${cellKey}:`, error);
            balance = 0; // Valor padrão em caso de erro
          }
          
          // Garantir que todos os campos obrigatórios tenham valores válidos
          const newRecord = {
            professional_id: professional.id,
            date: dateKey,
            day_type: dayType,
            start_time: startTime,
            end_time: endTime,
            balance: balance,
            updated_at: new Date().toISOString(),
          };
          
          // Se o registro existir, incluir o ID para fazer um upsert
          if (existingRecord) {
            scheduleData.push({
              id: existingRecord.id,
              ...newRecord,
              created_at: existingRecord.created_at
            });
          } else {
            scheduleData.push({
              ...newRecord,
              created_at: new Date().toISOString()
            });
          }
        });
      });
      
      console.log(`Preparados ${scheduleData.length} registros para inserção/atualização`);
      
      if (scheduleData.length === 0) {
        throw new Error('Nenhum registro válido para salvar. Verifique se há profissionais ativos.');
      }
      
      // Log para depuração - mostrar os primeiros 2 registros que serão salvos
      console.log('Amostra dos dados a serem salvos:', scheduleData.slice(0, 2));
      
      // Tentar inserir em lotes menores para identificar registros problemáticos
      const BATCH_SIZE = 10;
      let successCount = 0;
      
      for (let i = 0; i < scheduleData.length; i += BATCH_SIZE) {
        const batch = scheduleData.slice(i, i + BATCH_SIZE);
        console.log(`Processando lote ${i/BATCH_SIZE + 1} com ${batch.length} registros`);
        
        try {
          const { data, error: upsertError } = await supabase
            .from('schedules')
            .upsert(batch)
            .select();
            
          if (upsertError) {
            console.error(`Erro ao processar lote ${i/BATCH_SIZE + 1}:`, upsertError);
            throw new Error(`Erro ao salvar no Supabase (lote ${i/BATCH_SIZE + 1}): ${upsertError.message || 'Sem detalhes'}`);
          }
          
          successCount += data?.length || 0;
          console.log(`Lote ${i/BATCH_SIZE + 1} processado com sucesso: ${data?.length || 0} registros`);
        } catch (error) {
          console.error(`Erro ao processar lote ${i/BATCH_SIZE + 1}:`, error);
          
          // Tentar identificar registro problemático processando um por um
          console.log('Tentando identificar registro problemático...');
          for (let j = 0; j < batch.length; j++) {
            try {
              const { error: singleError } = await supabase
                .from('schedules')
                .upsert([batch[j]])
                .select();
                
              if (singleError) {
                console.error(`Registro problemático encontrado (índice ${i + j}):`, batch[j], singleError);
              } else {
                successCount++;
              }
            } catch (singleItemError) {
              console.error(`Erro no registro ${i + j}:`, batch[j], singleItemError);
            }
          }
          
          // Não interromper o processamento, continuar com próximo lote
        }
      }
      
      console.log(`Total de registros salvos com sucesso: ${successCount} de ${scheduleData.length}`);
      
      if (successCount === 0) {
        throw new Error('Nenhum registro foi salvo com sucesso. Verifique os logs para mais detalhes.');
      } else if (successCount < scheduleData.length) {
        toast.warning(`Atenção: Apenas ${successCount} de ${scheduleData.length} registros foram salvos.`);
      } else {
        toast.success('Escala salva com sucesso no Supabase!');
      }
      
      // NOVO: Recarregar os dados após salvar para atualizar a interface
      await loadScheduleFromSupabase();
      setLastSavedTime(new Date());
      
    } catch (error) {
      console.error('Erro ao salvar escala:', error);
      // Melhorar a mensagem de erro para ser mais específica
      let errorMessage = 'Erro desconhecido';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        // Tentar extrair mais informações de objetos de erro
        errorMessage = JSON.stringify(error);
      }
      
      toast.error(`Erro ao salvar escala: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Modificar o botão de salvamento para chamar esta função
  const handleSaveWeekSchedule = () => {
    saveScheduleToSupabase();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Escala</h1>
            <p className="text-muted-foreground">
              Gerencie a escala de trabalho dos profissionais.
            </p>
          </div>

          {/* Seletor de Ano e Mês - Versão Desktop */}
          <div className="hidden md:flex items-center gap-2">
            <Select
              value={selectedMonth.toString()}
              onValueChange={(value) => setSelectedMonth(parseInt(value))}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Mês" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month} value={month.toString()}>
                    {format(new Date(2000, month, 1), 'MMMM', { locale: ptBR })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedYear.toString()}
              onValueChange={(value) => setSelectedYear(parseInt(value))}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setSelectedYear(getYear(new Date()))
                setSelectedMonth(getMonth(new Date()))
              }}
              title="Ir para o mês atual"
            >
              <CalendarIcon className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Seletor de Ano e Mês - Versão Mobile */}
          <div className="md:hidden grid grid-cols-2 gap-2">
            <div className="col-span-2 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (selectedMonth === 0) {
                    setSelectedMonth(11)
                    setSelectedYear(selectedYear - 1)
                  } else {
                    setSelectedMonth(selectedMonth - 1)
                  }
                }}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Anterior
              </Button>
              
              <span className="font-medium capitalize">
                {format(new Date(selectedYear, selectedMonth, 1), 'MMMM yyyy', { locale: ptBR })}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (selectedMonth === 11) {
                    setSelectedMonth(0)
                    setSelectedYear(selectedYear + 1)
                  } else {
                    setSelectedMonth(selectedMonth + 1)
                  }
                }}
              >
                Próximo
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              className="col-span-2"
              onClick={() => {
                setSelectedYear(getYear(new Date()))
                setSelectedMonth(getMonth(new Date()))
              }}
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
              Ir para o mês atual
            </Button>
          </div>
        </div>

        {/* Legenda */}
        <div className="text-muted-foreground text-sm">
          <div className="flex justify-between items-center mb-2">
            <div className="font-medium">Legenda:</div>
            {hasUnsavedChanges && (
              <div className="flex items-center bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-3 py-1 rounded-full text-xs font-medium">
                <span className="relative flex h-2 w-2 mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                {Object.keys(pendingChanges).length} {Object.keys(pendingChanges).length === 1 ? 'alteração' : 'alterações'} pendente{Object.keys(pendingChanges).length === 1 ? '' : 's'}
                {isSaving && <span className="ml-2 italic">(salvando...)</span>}
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge
              variant="outline"
              className="border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-900 dark:text-blue-300"
            >
              Normal
            </Badge>
            <Badge
              variant="outline"
              className="border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900 dark:text-red-300"
            >
              Falta
            </Badge>
            <Badge
              variant="outline"
              className="border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            >
              Folga
            </Badge>
            <Badge
              variant="outline"
              className="border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900 dark:text-green-300"
            >
              Férias
            </Badge>
            <Badge
              variant="outline"
              className="border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-900 dark:text-purple-300"
            >
              Atestado
            </Badge>
            <Badge
              variant="outline"
              className="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-900 dark:text-amber-300"
            >
              DSR
            </Badge>
          </div>
          
          <div className="flex flex-wrap gap-3 mt-2">
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-amber-50 dark:bg-amber-700"></div>
              <span>Feriado</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-blue-50 dark:bg-blue-700"></div>
              <span>Hoje</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-gray-50 dark:bg-gray-600"></div>
              <span>Fim de Semana</span>
            </div>
          </div>
        </div>

        {/* Resumo do Mês */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Resumo do Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-sm">Horas Trabalhadas</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">
                    {formatWorkedTime(calculateMonthlyHours())}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    Meta: {selectedProfessional ? `${selectedProfessional.workHours}h` : '0h'} mensais
                  </span>
                </div>
              </div>

              <div className="flex flex-col">
                <span className="text-muted-foreground text-sm">Banco de Horas</span>
                <div className="flex items-baseline gap-2">
                  <span
                    className={`text-2xl font-bold ${calculateOvertimeBalance() >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                  >
                    {formatMinutes(calculateOvertimeBalance())}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {calculateOvertimeBalance() >= 0 ? 'Saldo positivo' : 'Saldo negativo'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Escala Semanal */}
        {getWeeksOfMonth().map((weekStart, weekIndex) => (
          <Card key={weekStart.toString()} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between py-4">
              <CardTitle className="text-lg">
                Semana {weekIndex + 1}: {format(weekStart, 'dd/MM', { locale: ptBR })} -{' '}
                {format(endOfWeek(weekStart, { weekStartsOn: 0 }), 'dd/MM', { locale: ptBR })}
              </CardTitle>
            </CardHeader>

            <CardContent>
              {/* Versão desktop - tabela horizontal */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-muted/50 dark:bg-gray-800">
                      <th className="p-2 text-left text-sm font-medium">Dia</th>
                      <th className="p-2 text-left text-sm font-medium">Dia Semana</th>
                      <th className="p-2 text-left text-sm font-medium">Início</th>
                      <th className="p-2 text-left text-sm font-medium">Fim</th>
                      <th className="p-2 text-left text-sm font-medium">Saldo</th>
                      <th className="p-2 text-left text-sm font-medium">Tipo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getDaysOfWeek(weekStart).map((day) => {
                      const dateString = format(day, 'yyyy-MM-dd')
                      const record = timeRecords.find(
                        (r) => r.date === dateString && r.professionalId === selectedProfessionalId,
                      )
                      const dayType = getDayType(day, timeRecords)
                      const holiday = isHoliday(day)
                      const isCurrentMonth = isSameMonth(day, currentDate)

                      return (
                        <tr
                          key={day.toString()}
                          className={`border-b 
                            ${!isCurrentMonth ? 'opacity-50 dark:opacity-70' : ''} 
                            ${isToday(day) ? 'bg-blue-50 dark:bg-blue-900/30' : ''} 
                            ${holiday ? 'bg-amber-50 dark:bg-amber-900/30' : ''} 
                            ${isWeekend(day) ? 'bg-gray-50 dark:bg-gray-700 dark:text-gray-200' : ''} 
                            ${isPast(day) && !isWeekend(day) && !isToday(day) && !holiday ? 'dark:text-gray-400' : ''}
                            ${pendingChanges[format(day, 'yyyy-MM-dd')] ? 'relative shadow-sm after:absolute after:inset-y-0 after:left-0 after:w-1 after:bg-green-400 dark:after:bg-green-600' : ''}
                          `}
                        >
                          <td className="p-2 font-medium">{format(day, 'dd')}</td>
                          <td className="p-2">
                            {format(day, 'EEEE', { locale: ptBR })}
                            {holiday && (
                              <span className="ml-2 text-xs font-medium text-amber-600 dark:text-amber-400">
                                {holiday.name}
                              </span>
                            )}
                          </td>
                          <td className="p-2">
                            <Input
                              type="time"
                              className="h-8 w-24 dark:border-gray-600 dark:bg-gray-800"
                              value={
                                // Tentar buscar do formato Supabase primeiro
                                pendingChanges[`start_${selectedProfessionalId}_${format(day, 'yyyy-MM-dd')}`] || 
                                // Depois no formato antigo
                                pendingChanges[dateString]?.checkIn || 
                                // Por último, do registro ou valor padrão
                                record?.checkIn || 
                                defaultCheckIn
                              }
                              onChange={(e) => updateTime(day, true, e.target.value)}
                              disabled={dayType !== 'normal' || !isCurrentMonth}
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              type="time"
                              className="h-8 w-24 dark:border-gray-600 dark:bg-gray-800"
                              value={
                                // Tentar buscar do formato Supabase primeiro
                                pendingChanges[`end_${selectedProfessionalId}_${format(day, 'yyyy-MM-dd')}`] || 
                                // Depois no formato antigo
                                pendingChanges[dateString]?.checkOut || 
                                // Por último, do registro ou valor padrão
                                record?.checkOut || 
                                defaultCheckOut
                              }
                              onChange={(e) => updateTime(day, false, e.target.value)}
                              disabled={dayType !== 'normal' || !isCurrentMonth}
                            />
                          </td>
                          <td className="p-2">
                            {(() => {
                              const dailyBalance = getDailyBalance(day, record, dayType, holiday)
                              return (
                                <span className={`text-sm font-medium ${dailyBalance.color}`}>
                                  {dailyBalance.display}
                                </span>
                              )
                            })()}
                          </td>
                          <td className="p-2">
                            <Select
                              value={dayType}
                              onValueChange={(value) => {
                                // Garantir que é um valor válido antes de prosseguir
                                if (['normal', 'falta', 'folga', 'ferias', 'atestado', 'dsr'].includes(value)) {
                                  console.log('Selecionando tipo:', value)
                                  updateDayType(day, value as DayType)
                                }
                              }}
                              disabled={!isCurrentMonth}
                            >
                              <SelectTrigger className="w-[110px] dark:border-gray-600 dark:bg-gray-800">
                                <SelectValue placeholder="Tipo">
                                  {formatDayType(dayType)}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="normal">Normal</SelectItem>
                                <SelectItem value="falta">Falta</SelectItem>
                                <SelectItem value="folga">Folga</SelectItem>
                                <SelectItem value="ferias">Férias</SelectItem>
                                <SelectItem value="atestado">Atestado</SelectItem>
                                <SelectItem value="dsr">DSR</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                        </tr>
                      )
                    })}
                    <tr className="bg-muted/30 font-medium dark:bg-gray-700">
                      <td colSpan={4} className="p-2 text-right">
                        Total da Semana:
                      </td>
                      <td colSpan={2} className="p-2">
                        {formatWorkedTime(calculateWeeklyHours(weekStart))}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              {/* Versão mobile - cards verticais */}
              <div className="md:hidden space-y-4">
                {getDaysOfWeek(weekStart).map((day) => {
                  const dateString = format(day, 'yyyy-MM-dd')
                  const record = timeRecords.find(
                    (r) => r.date === dateString && r.professionalId === selectedProfessionalId,
                  )
                  const dayType = getDayType(day, timeRecords)
                  const holiday = isHoliday(day)
                  const isCurrentMonth = isSameMonth(day, currentDate)
                  const dailyBalance = getDailyBalance(day, record, dayType, holiday)

                  return (
                    <div 
                      key={day.toString()} 
                      className={`p-3 rounded-lg border 
                        ${!isCurrentMonth ? 'opacity-70' : ''} 
                        ${isToday(day) ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800' : ''} 
                        ${holiday ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/30 dark:border-amber-800' : ''} 
                        ${isWeekend(day) ? 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700' : 'dark:bg-gray-900 dark:border-gray-800'}
                        ${pendingChanges[format(day, 'yyyy-MM-dd')] ? 'border-l-green-400 border-l-4 dark:border-l-green-600' : ''}
                      `}
                    >
                      {/* Cabeçalho do card com dia e tipo */}
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                          <div className="text-xl font-bold">{format(day, 'dd')}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                            {format(day, 'EEEE', { locale: ptBR })}
                          </div>
                          {holiday && (
                            <span className="text-xs font-medium text-amber-600 dark:text-amber-400 ml-1">
                              {holiday.name}
                            </span>
                          )}
                        </div>
                        
                        <Select
                          value={dayType}
                          onValueChange={(value) => {
                            if (['normal', 'falta', 'folga', 'ferias', 'atestado', 'dsr'].includes(value)) {
                              updateDayType(day, value as DayType)
                            }
                          }}
                          disabled={!isCurrentMonth}
                        >
                          <SelectTrigger className="w-[100px] h-8 text-sm dark:border-gray-600 dark:bg-gray-800">
                            <SelectValue placeholder="Tipo">
                              {formatDayType(dayType)}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="falta">Falta</SelectItem>
                            <SelectItem value="folga">Folga</SelectItem>
                            <SelectItem value="ferias">Férias</SelectItem>
                            <SelectItem value="atestado">Atestado</SelectItem>
                            <SelectItem value="dsr">DSR</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Corpo do card com os horários */}
                      {dayType === 'normal' && (
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Entrada</div>
                            <Input
                              type="time"
                              className="h-8 text-sm dark:border-gray-600 dark:bg-gray-800"
                              value={
                                // Tentar buscar do formato Supabase primeiro
                                pendingChanges[`start_${selectedProfessionalId}_${format(day, 'yyyy-MM-dd')}`] || 
                                // Depois no formato antigo
                                pendingChanges[dateString]?.checkIn || 
                                // Por último, do registro ou valor padrão
                                record?.checkIn || 
                                defaultCheckIn
                              }
                              onChange={(e) => updateTime(day, true, e.target.value)}
                              disabled={!isCurrentMonth}
                            />
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Saída</div>
                            <Input
                              type="time"
                              className="h-8 text-sm dark:border-gray-600 dark:bg-gray-800"
                              value={
                                // Tentar buscar do formato Supabase primeiro
                                pendingChanges[`end_${selectedProfessionalId}_${format(day, 'yyyy-MM-dd')}`] || 
                                // Depois no formato antigo
                                pendingChanges[dateString]?.checkOut || 
                                // Por último, do registro ou valor padrão
                                record?.checkOut || 
                                defaultCheckOut
                              }
                              onChange={(e) => updateTime(day, false, e.target.value)}
                              disabled={!isCurrentMonth}
                            />
                          </div>
                        </div>
                      )}
                      
                      {/* Rodapé do card com saldo do dia */}
                      <div className="mt-3 flex justify-between items-center">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Saldo do dia</div>
                        <div className={`text-sm font-medium ${dailyBalance.color}`}>
                          {dailyBalance.display}
                        </div>
                      </div>
                    </div>
                  )
                })}
                
                {/* Total da semana na versão mobile */}
                <div className="mt-4 p-3 rounded-lg bg-muted/30 dark:bg-gray-800 flex justify-between items-center">
                  <div className="font-medium">Total da Semana:</div>
                  <div className="font-bold">{formatWorkedTime(calculateWeeklyHours(weekStart))}</div>
                </div>
              </div>
              
              {/* Rodapé com botões de ações */}
              <div className="mt-4 border-t pt-4 flex flex-wrap justify-between items-center gap-2">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={() => sendScheduleByWhatsApp(weekStart)}
                    disabled={!selectedProfessional}
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span className="sm:inline">WhatsApp</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={() => sendScheduleByEmail(weekStart)}
                    disabled={!selectedProfessional?.email}
                  >
                    <Mail className="h-4 w-4" />
                    <span className="sm:inline">Email</span>
                  </Button>
                </div>
                
                {/* Botão de salvar escala da semana */}
                {hasUnsavedChanges && (
                  <Button 
                    onClick={handleSaveWeekSchedule}
                    disabled={isSaving || !hasUnsavedChanges}
                    className="flex items-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        Salvando...
                      </>
                    ) : (
                      <>
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        Salvar escala da semana
                      </>
                    )}
                  </Button>
                )}
              </div>
              
              {/* Indicador de última vez salvo */}
              {lastSavedTime && !hasUnsavedChanges && (
                <div className="mt-2 text-xs text-muted-foreground text-right">
                  Última atualização: {format(lastSavedTime, 'dd/MM/yyyy HH:mm:ss')}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  )
}

export default SchedulePage
