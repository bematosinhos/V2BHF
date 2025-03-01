import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { eachDayOfInterval, isWeekend, Locale, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { TimeRecord, Professional } from '@/store'

interface PdfExportOptions {
  title?: string
  orientation?: 'portrait' | 'landscape'
  format?: string
  fileName?: string
}

// Helper para formatação de data
const formatDateTime = (date: Date, pattern: string, options?: { locale?: Locale }): string => {
  return format(date, pattern, options)
}

// Função principal que exporta o PDF a partir de elementos HTML
export const exportComponentToPdf = async (
  element: HTMLElement,
  options: PdfExportOptions = {},
) => {
  const {
    title = 'Documento',
    orientation = 'portrait',
    format = 'a4',
    fileName = 'documento.pdf',
  } = options

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
  })

  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF({
    orientation,
    unit: 'mm',
    format,
  })

  const imgWidth = orientation === 'portrait' ? 210 : 297
  const imgHeight = (canvas.height * imgWidth) / canvas.width

  // Adicionar cabeçalho com título
  pdf.setFontSize(16)
  pdf.text(title, 10, 10)

  // Adicionar data e hora da geração
  pdf.setFontSize(8)
  pdf.text(`Gerado em: ${formatDateTime(new Date(), 'dd/MM/yyyy HH:mm')}`, 10, 15)

  // Adicionar imagem do componente
  pdf.addImage(imgData, 'PNG', 0, 20, imgWidth, imgHeight)

  // Salvar o PDF
  pdf.save(fileName)
}

// Função para formatar minutos em horas e minutos
const formatMinutes = (minutes: number) => {
  const hours = Math.floor(Math.abs(minutes) / 60)
  const mins = Math.abs(minutes) % 60
  const sign = minutes < 0 ? '-' : '+'
  return `${sign}${hours}h ${mins}min`
}

// Função para formatar horas trabalhadas (sem o sinal)
const formatWorkedTime = (minutes: number) => {
  const hours = Math.floor(Math.abs(minutes) / 60)
  const mins = Math.abs(minutes) % 60
  return `${hours}h ${mins}min`
}

// Função para calcular o saldo de horas de um dia
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

  // Considerando 1h de almoço
  return (endDate.getTime() - startDate.getTime()) / 60000 - 60
}

// Helper para verificar se uma data é feriado (usando lista simplificada)
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

const isHoliday = (date: Date) => {
  const dateString = formatDateTime(date, 'yyyy-MM-dd')
  return HOLIDAYS.find((h) => h.date === dateString)
}

// Helper para determinar o tipo de dia
const getDayType = (date: Date, professionalId: string, timeRecords: TimeRecord[]) => {
  const dateString = formatDateTime(date, 'yyyy-MM-dd')
  const record = timeRecords.find(
    (r) => r.date === dateString && r.professionalId === professionalId,
  )

  if (record) {
    if (record.type === 'vacation' || record.notes?.toLowerCase().includes('férias'))
      return 'ferias'
    if (record.type === 'dayoff' || record.notes?.toLowerCase().includes('folga')) return 'folga'
    if (record.notes?.toLowerCase().includes('atestado')) return 'atestado'
    if (record.notes?.toLowerCase().includes('falta')) return 'falta'
    if (
      record.notes?.toLowerCase().includes('descanso semanal remunerado') ||
      record.notes?.toLowerCase().includes('dsr')
    )
      return 'dsr'
  }

  if (!record && isWeekend(date)) {
    return 'dsr'
  }

  return 'normal'
}

// Função para exportar o extrato do profissional em PDF
export const exportProfessionalStatementPdf = (
  professional: Professional,
  startDate: Date,
  endDate: Date,
  timeRecords: TimeRecord[],
): void => {
  // Criar documento PDF
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  // Definir cores
  const primaryColor = '#1e293b' // Slate 800
  const secondaryColor = '#64748b' // Slate 500
  const tertiaryColor = '#94a3b8' // Slate 400
  const bgColor = '#f8fafc' // Slate 50
  const successColor = '#10b981' // Emerald 500
  const dangerColor = '#ef4444' // Red 500
  const borderColor = '#e2e8f0' // Slate 200
  const weekendColor = '#f1f5f9' // Slate 100

  // Configurar fonte
  doc.setFont('helvetica', 'normal')

  // Margens
  const margin = 15
  const pageWidth = 210
  const contentWidth = pageWidth - margin * 2

  // Cabeçalho limpo e minimalista
  doc.setFillColor(bgColor)
  doc.rect(0, 0, 210, 45, 'F')

  // Linha fina sob o cabeçalho
  doc.setDrawColor(borderColor)
  doc.setLineWidth(0.3)
  doc.line(margin, 45, pageWidth - margin, 45)

  // Nome do profissional
  doc.setFontSize(22)
  doc.setTextColor(primaryColor)
  doc.text(professional.name, margin, 25)

  // Cargo do profissional
  doc.setFontSize(12)
  doc.setTextColor(secondaryColor)
  doc.text(`${professional.role}`, margin, 35)

  // Período de referência
  doc.setFontSize(10)
  doc.setTextColor(tertiaryColor)
  doc.text(
    `Período: ${formatDateTime(startDate, 'dd/MM/yyyy')} a ${formatDateTime(endDate, 'dd/MM/yyyy')}`,
    margin,
    42,
  )

  // Calcular métricas
  const days = eachDayOfInterval({ start: startDate, end: endDate })

  // Variáveis para métricas
  let totalWorkedMinutes = 0
  let totalExpectedMinutes = 0
  let absenceDays = 0
  let daysOff = 0

  // Default para cálculos
  const defaultCheckIn = '08:00'
  const defaultCheckOut = '17:00'

  // Calcular dias por tipo e acumular métricas
  days.forEach((day) => {
    const dateString = formatDateTime(day, 'yyyy-MM-dd')
    const record = timeRecords.find(
      (r) => r.date === dateString && r.professionalId === professional.id,
    )
    const dayType = getDayType(day, professional.id, timeRecords)
    const holiday = isHoliday(day)

    // Aplicar regras de negócio para cada tipo de dia
    if (
      holiday ||
      dayType === 'ferias' ||
      dayType === 'atestado' ||
      dayType === 'dsr' ||
      dayType === 'folga'
    ) {
      // Não adiciona horas esperadas nem trabalhadas
      if (dayType === 'folga') {
        daysOff++
      }
    } else if (dayType === 'falta') {
      // Adiciona horas esperadas, mas zero trabalhadas
      absenceDays++
      if (!isWeekend(day)) {
        totalExpectedMinutes += 480 // 8h esperadas
      }
    } else {
      // Dias normais
      if (!isWeekend(day)) {
        totalExpectedMinutes += 480 // 8h esperadas
      }

      if (record?.checkIn && record?.checkOut) {
        const worked = calculateDayHoursBalance(day, record.checkIn, record.checkOut)
        totalWorkedMinutes += worked
      } else if (!isWeekend(day)) {
        // Para dias úteis sem registro, assume os valores padrão
        const worked = calculateDayHoursBalance(day, defaultCheckIn, defaultCheckOut)
        totalWorkedMinutes += worked
      }
    }
  })

  // Banco de horas
  const overtimeBalance = totalWorkedMinutes - totalExpectedMinutes

  // Título da seção de resumo
  doc.setFontSize(14)
  doc.setTextColor(primaryColor)
  doc.text('Resumo do Período', margin, 60)

  // Cards com design minimalista em grid 2x2
  const cardWidth = contentWidth / 2 - 5
  const cardHeight = 40
  const cardMargin = 5

  // Função para desenhar card
  const drawCard = (
    x: number,
    y: number,
    width: number,
    height: number,
    title: string,
    value: string,
    subtitle: string,
    valueColor: string = primaryColor,
  ) => {
    // Card background com borda suave
    doc.setFillColor(255, 255, 255)
    doc.setDrawColor(borderColor)
    doc.setLineWidth(0.3)
    doc.roundedRect(x, y, width, height, 2, 2, 'FD')

    // Título do card
    doc.setFontSize(9)
    doc.setTextColor(secondaryColor)
    doc.text(title, x + 8, y + 10)

    // Valor principal
    doc.setFontSize(16)
    doc.setTextColor(valueColor)
    doc.text(value, x + 8, y + 25)

    // Subtítulo/descrição
    doc.setFontSize(8)
    doc.setTextColor(tertiaryColor)
    doc.text(subtitle, x + 8, y + 32)
  }

  // 1. Banco de Horas
  drawCard(
    margin,
    65,
    cardWidth,
    cardHeight,
    'Banco de Horas',
    formatMinutes(overtimeBalance),
    'Saldo acumulado no período',
    overtimeBalance >= 0 ? successColor : dangerColor,
  )

  // 2. Horas Trabalhadas
  drawCard(
    margin + cardWidth + cardMargin,
    65,
    cardWidth,
    cardHeight,
    'Horas Trabalhadas',
    formatWorkedTime(totalWorkedMinutes),
    'Total no período',
  )

  // 3. Faltas
  drawCard(
    margin,
    65 + cardHeight + cardMargin,
    cardWidth,
    cardHeight,
    'Faltas',
    `${absenceDays} dias`,
    'No período selecionado',
  )

  // 4. Folgas
  drawCard(
    margin + cardWidth + cardMargin,
    65 + cardHeight + cardMargin,
    cardWidth,
    cardHeight,
    'Folgas',
    `${daysOff} dias`,
    'No período selecionado',
  )

  // Título da seção de detalhamento
  doc.setFontSize(14)
  doc.setTextColor(primaryColor)
  doc.text('Registro Diário Detalhado', margin, 170)

  // Linhas finas para separar seções
  doc.setDrawColor(borderColor)
  doc.setLineWidth(0.3)
  doc.line(margin, 175, pageWidth - margin, 175)

  // Tabela com detalhamento diário - Design aprimorado
  const tableTop = 180
  const rowHeight = 8
  let currentY = tableTop

  // Cabeçalho da tabela com design mais limpo
  doc.setFillColor(bgColor)
  doc.rect(margin, currentY, contentWidth, rowHeight, 'F')

  // Desenhar linhas de grade mais finas
  doc.setDrawColor(borderColor)
  doc.setLineWidth(0.2)

  // Textos do cabeçalho
  doc.setFontSize(8)
  doc.setTextColor(secondaryColor)
  doc.text('Data', margin + 2, currentY + 5.5)
  doc.text('Dia da Semana', margin + 30, currentY + 5.5)
  doc.text('Entrada', margin + 75, currentY + 5.5)
  doc.text('Saída', margin + 95, currentY + 5.5)
  doc.text('Saldo', margin + 115, currentY + 5.5)
  doc.text('Tipo', margin + 145, currentY + 5.5)

  // Linha horizontal abaixo do cabeçalho
  doc.line(margin, currentY + rowHeight, margin + contentWidth, currentY + rowHeight)

  currentY += rowHeight

  // Colunas da tabela
  const colWidths = [30, 45, 20, 20, 30, 35]
  const colStarts = [margin]
  for (let i = 1; i < colWidths.length; i++) {
    colStarts[i] = colStarts[i - 1] + colWidths[i - 1]
  }

  // Linhas da tabela com design mais limpo
  let rowCount = 0
  days.forEach((day) => {
    if (rowCount >= 25) {
      // Adicionar nova página se exceder limite
      doc.addPage()

      // Cabeçalho limpo na nova página
      doc.setFillColor(bgColor)
      doc.rect(0, 0, 210, 25, 'F')
      doc.setDrawColor(borderColor)
      doc.setLineWidth(0.3)
      doc.line(margin, 25, pageWidth - margin, 25)

      doc.setFontSize(14)
      doc.setTextColor(primaryColor)
      doc.text('Registro Diário Detalhado (continuação)', margin, 15)

      // Reiniciar coordenadas da tabela
      currentY = 35
      rowCount = 0

      // Cabeçalho da tabela na nova página
      doc.setFillColor(bgColor)
      doc.rect(margin, currentY, contentWidth, rowHeight, 'F')

      doc.setFontSize(8)
      doc.setTextColor(secondaryColor)
      doc.text('Data', margin + 2, currentY + 5.5)
      doc.text('Dia da Semana', margin + 30, currentY + 5.5)
      doc.text('Entrada', margin + 75, currentY + 5.5)
      doc.text('Saída', margin + 95, currentY + 5.5)
      doc.text('Saldo', margin + 115, currentY + 5.5)
      doc.text('Tipo', margin + 145, currentY + 5.5)

      doc.line(margin, currentY + rowHeight, margin + contentWidth, currentY + rowHeight)

      currentY += rowHeight
    }

    const dateString = formatDateTime(day, 'yyyy-MM-dd')
    const record = timeRecords.find(
      (r) => r.date === dateString && r.professionalId === professional.id,
    )
    const dayType = getDayType(day, professional.id, timeRecords)
    const holiday = isHoliday(day)

    // Fundo alternado para melhor legibilidade
    if (rowCount % 2 === 0) {
      doc.setFillColor(255, 255, 255)
    } else {
      doc.setFillColor(252, 252, 253)
    }

    // Destacar finais de semana sutilmente
    if (isWeekend(day)) {
      doc.setFillColor(weekendColor)
    }

    doc.rect(margin, currentY, contentWidth, rowHeight, 'F')

    // Linhas horizontais finas
    doc.setDrawColor(borderColor)
    doc.setLineWidth(0.1)
    doc.line(margin, currentY + rowHeight, margin + contentWidth, currentY + rowHeight)

    doc.setFontSize(8)

    // Definir tipo e horários
    let startTime = '-'
    let endTime = '-'
    let balance = '-'
    let type = 'Normal'

    // Calcular valores do dia
    if (holiday) {
      type = 'Feriado'
    } else if (dayType === 'ferias') {
      type = 'Férias'
    } else if (dayType === 'folga') {
      type = 'Folga'
    } else if (dayType === 'falta') {
      type = 'Falta'
      balance = formatMinutes(-480) // 8h negativas
    } else if (dayType === 'atestado') {
      type = 'Atestado'
    } else if (dayType === 'dsr') {
      type = 'DSR'
    } else if (dayType === 'normal') {
      type = 'Normal'

      if (record?.checkIn && record?.checkOut) {
        startTime = record.checkIn
        endTime = record.checkOut

        const minutes = calculateDayHoursBalance(day, record.checkIn, record.checkOut)
        balance = formatWorkedTime(minutes)
      } else if (!isWeekend(day)) {
        // Para dias úteis sem registro específico, mostrar valores padrão
        startTime = defaultCheckIn
        endTime = defaultCheckOut

        const minutes = calculateDayHoursBalance(day, defaultCheckIn, defaultCheckOut)
        balance = formatWorkedTime(minutes)
      }
    }

    // Data
    doc.setTextColor(primaryColor)
    doc.text(formatDateTime(day, 'dd/MM/yyyy'), margin + 2, currentY + 5.5)

    // Dia da semana
    doc.setTextColor(secondaryColor)
    const weekday = formatDateTime(day, 'EEEE', { locale: ptBR })
    doc.text(weekday.charAt(0).toUpperCase() + weekday.slice(1), margin + 30, currentY + 5.5)

    // Horários de entrada e saída
    doc.text(startTime, margin + 75, currentY + 5.5)
    doc.text(endTime, margin + 95, currentY + 5.5)

    // Saldo do dia
    if (balance.startsWith('-')) {
      doc.setTextColor(dangerColor)
    } else if (balance !== '-' && !balance.startsWith('+')) {
      doc.setTextColor(primaryColor)
    } else if (balance.startsWith('+')) {
      doc.setTextColor(successColor)
    }
    doc.text(balance, margin + 115, currentY + 5.5)

    // Tipo do dia - com cores diferentes para cada tipo
    doc.setTextColor(primaryColor)
    if (type === 'Férias') {
      doc.setTextColor('#3b82f6') // Azul para férias
    } else if (type === 'Folga') {
      doc.setTextColor('#8b5cf6') // Roxo para folga
    } else if (type === 'Falta') {
      doc.setTextColor(dangerColor) // Vermelho para falta
    } else if (type === 'Atestado') {
      doc.setTextColor('#f59e0b') // Âmbar para atestado
    } else if (type === 'DSR' || type === 'Feriado') {
      doc.setTextColor('#6b7280') // Cinza para DSR e feriados
    }
    doc.text(type, margin + 145, currentY + 5.5)

    currentY += rowHeight
    rowCount++
  })

  // Rodapé elegante
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)

    // Linha fina acima do rodapé
    doc.setDrawColor(borderColor)
    doc.setLineWidth(0.3)
    doc.line(margin, 280, pageWidth - margin, 280)

    // Informações do rodapé
    doc.setFontSize(7)
    doc.setTextColor(tertiaryColor)
    doc.text(`Página ${i} de ${pageCount}`, margin, 286)
    doc.text(
      `Gerado em: ${formatDateTime(new Date(), 'dd/MM/yyyy HH:mm')}`,
      pageWidth - margin - 50,
      286,
    )
  }

  // Salvar o PDF com nome baseado no profissional e período
  const fileName = `extrato_${professional.name.replace(/\s+/g, '_').toLowerCase()}_${formatDateTime(startDate, 'dd-MM-yyyy')}_a_${formatDateTime(endDate, 'dd-MM-yyyy')}.pdf`

  doc.save(fileName)
}
