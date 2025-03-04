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
import { Separator } from '@/components/ui/separator'
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Mail,
  MessageSquare,
} from 'lucide-react'
import {
  format,
  addMonths,
  subMonths,
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
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useAppStore, TimeRecord } from '@/store'

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

const SchedulePage: FC = () => {
  const { professionals, selectedProfessionalId, timeRecords, updateTimeRecord, addTimeRecord } =
    useAppStore()

  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [selectedYear, setSelectedYear] = useState<number>(getYear(new Date()))
  const [selectedMonth, setSelectedMonth] = useState<number>(getMonth(new Date()))

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

      // Aplicar regras consistentes com getDailyBalance
      // Dias que não contabilizam horas
      if (
        holiday ||
        dayType === 'ferias' ||
        dayType === 'atestado' ||
        dayType === 'dsr' ||
        dayType === 'folga' ||
        dayType === 'falta'
      ) {
        return // Não adiciona horas
      }

      // Para dias normais (incluindo fins de semana configurados como normais)
      if (dayType === 'normal') {
        if (record?.checkIn && record?.checkOut) {
          totalMinutes += calculateDayHoursBalance(day, record.checkIn, record.checkOut)
        } else {
          totalMinutes += calculateDayHoursBalance(day, defaultCheckIn, defaultCheckOut)
        }
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

    // 1. Dias que não impactam o banco de horas e reduzem carga horária esperada
    if (
      holiday ||
      dayType === 'ferias' ||
      dayType === 'atestado' ||
      dayType === 'dsr' ||
      dayType === 'folga'
    ) {
      return { balance: 0, display: '-', color: 'text-muted-foreground' }
    }
    // 2. Dias que geram impacto negativo no banco de horas e não reduzem carga esperada
    else if (dayType === 'falta') {
      return {
        balance: -480,
        display: formatMinutes(-480),
        color: 'text-red-600 dark:text-red-400',
      }
    }
    // 3. Dias normais de trabalho
    else {
      // Se tem registro com check-in e check-out, calcula com esses valores
      if (record?.checkIn && record?.checkOut) {
        worked = calculateDayHoursBalance(day, record.checkIn, record.checkOut)
      } else {
        // Senão usa os valores padrão
        worked = calculateDayHoursBalance(day, defaultCheckIn, defaultCheckOut)
      }

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

  // Update updateDayType para incluir tratamento adequado conforme regras de negócio
  const updateDayType = (date: Date, type: DayType) => {
    const dateString = format(date, 'yyyy-MM-dd')
    const storeType = dayTypeMapping[type]
    const existingRecord = timeRecords.find(
      (r) => r.date === dateString && r.professionalId === selectedProfessionalId,
    )

    // Definir os valores padrão de checkIn e checkOut
    const defaultValues = {
      checkIn: defaultCheckIn,
      checkOut: defaultCheckOut,
    }

    // Tratar campos específicos conforme o tipo
    let recordUpdate: Partial<TimeRecord> = { type: storeType }

    // Para tipos que não sejam 'normal', limpar campos de horário
    if (type !== 'normal') {
      recordUpdate.checkIn = ''
      recordUpdate.checkOut = ''

      // Configurar notas específicas para cada tipo
      if (type === 'falta') {
        recordUpdate.notes = 'falta'
      } else if (type === 'atestado') {
        recordUpdate.notes = 'atestado'
      } else if (type === 'ferias') {
        recordUpdate.notes = 'férias'
      } else if (type === 'folga') {
        recordUpdate.notes = 'folga'
      } else if (type === 'dsr') {
        recordUpdate.notes = 'descanso semanal remunerado'
      }
    } else {
      // Para tipo normal, definir horários padrão se não existirem
      if (!existingRecord?.checkIn || !existingRecord?.checkOut) {
        recordUpdate = { ...recordUpdate, ...defaultValues }
      }
      recordUpdate.notes = ''
    }

    if (existingRecord) {
      void updateTimeRecord(existingRecord.id, recordUpdate)
    } else if (selectedProfessionalId) {
      void addTimeRecord({
        professionalId: selectedProfessionalId,
        date: dateString,
        checkIn: recordUpdate.checkIn ?? '',
        checkOut: recordUpdate.checkOut ?? '',
        type: storeType,
        notes: recordUpdate.notes ?? '',
      })
    }
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
      // Verificar se é feriado primeiro
      const holiday = isHoliday(day)
      if (holiday) return

      const dayType = getDayType(day, timeRecords)
      // Pular dias especiais que não contam horas
      if (
        dayType === 'folga' ||
        dayType === 'ferias' ||
        dayType === 'atestado' ||
        dayType === 'falta' ||
        dayType === 'dsr'
      ) {
        return
      }

      const dateString = format(day, 'yyyy-MM-dd')
      const record = timeRecords.find(
        (r) => r.date === dateString && r.professionalId === selectedProfessionalId,
      )

      if (record?.checkIn && record?.checkOut) {
        // Usar valores registrados
        totalMinutes += calculateDayHoursBalance(day, record.checkIn, record.checkOut)
      } else {
        // Usar valores padrão para dias normais
        totalMinutes += calculateDayHoursBalance(day, defaultCheckIn, defaultCheckOut)
      }
    })

    return totalMinutes
  }

  // Atualizar horário de início ou fim
  const updateTime = (date: Date, isStart: boolean, value: string) => {
    const dateString = format(date, 'yyyy-MM-dd')
    const existingRecord = timeRecords.find(
      (r) => r.date === dateString && r.professionalId === selectedProfessionalId,
    )

    if (existingRecord) {
      // Se for campo de fim e o início não estiver definido, definir valor padrão para início
      if (!isStart && !existingRecord.checkIn) {
        void updateTimeRecord(existingRecord.id, {
          checkIn: defaultCheckIn,
          checkOut: value,
        })
      }
      // Se for campo de início e o fim não estiver definido, definir valor padrão para fim
      else if (isStart && !existingRecord.checkOut) {
        void updateTimeRecord(existingRecord.id, {
          checkIn: value,
          checkOut: defaultCheckOut,
        })
      }
      // Caso normal: apenas atualizar o campo específico
      else {
        void updateTimeRecord(existingRecord.id, {
          [isStart ? 'checkIn' : 'checkOut']: value,
        })
      }
    } else if (selectedProfessionalId) {
      // Ao criar novo registro, definir ambos valores, usando padrão para o campo não fornecido
      void addTimeRecord({
        professionalId: selectedProfessionalId,
        date: dateString,
        checkIn: isStart ? value : defaultCheckIn,
        checkOut: isStart ? defaultCheckOut : value,
        type: 'regular',
      })
    }
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

          {/* Seletor de Ano e Mês */}
          <div className="flex items-center gap-2">
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
                const now = new Date()
                setSelectedMonth(getMonth(now))
                setSelectedYear(getYear(now))
              }}
            >
              <CalendarIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Legenda */}
        <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-sm">
          <span className="font-medium">Legenda:</span>
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
          <Separator orientation="vertical" className="h-4" />
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

        {/* Resumo do Mês */}
        <Card>
          <CardHeader>
            <CardTitle>Resumo do Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-sm">Horas Trabalhadas</span>
                <span className="text-2xl font-bold">
                  {formatWorkedTime(calculateMonthlyHours())}
                </span>
                <span className="text-muted-foreground text-xs">
                  Meta: {selectedProfessional ? `${selectedProfessional.workHours}h` : '0h'} mensais
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-muted-foreground text-sm">Banco de Horas</span>
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
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => sendScheduleByWhatsApp(weekStart)}
                  disabled={!selectedProfessional}
                >
                  <MessageSquare className="h-4 w-4" />
                  <span className="hidden md:inline">WhatsApp</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => sendScheduleByEmail(weekStart)}
                  disabled={!selectedProfessional?.email}
                >
                  <Mail className="h-4 w-4" />
                  <span className="hidden md:inline">Email</span>
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              <div className="overflow-x-auto">
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
                          className={`border-b ${!isCurrentMonth ? 'opacity-50 dark:opacity-70' : ''} ${isToday(day) ? 'bg-blue-50 dark:bg-blue-900/30' : ''} ${holiday ? 'bg-amber-50 dark:bg-amber-900/30' : ''} ${isWeekend(day) ? 'bg-gray-50 dark:bg-gray-700 dark:text-gray-200' : ''} ${isPast(day) && !isWeekend(day) && !isToday(day) && !holiday ? 'dark:text-gray-400' : ''} `}
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
                              value={record?.checkIn ?? defaultCheckIn}
                              onChange={(e) => updateTime(day, true, e.target.value)}
                              disabled={dayType !== 'normal' || !isCurrentMonth}
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              type="time"
                              className="h-8 w-24 dark:border-gray-600 dark:bg-gray-800"
                              value={record?.checkOut ?? defaultCheckOut}
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
                              onValueChange={(value) => updateDayType(day, value as DayType)}
                              disabled={!isCurrentMonth}
                            >
                              <SelectTrigger className="w-[100px] dark:border-gray-600 dark:bg-gray-800">
                                <SelectValue placeholder="Tipo" />
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
                      <td colSpan={3} className="p-2">
                        <span className="font-bold">
                          {formatWorkedTime(calculateWeeklyHours(weekStart))}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  )
}

export default SchedulePage
