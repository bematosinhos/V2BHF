import { format as formatDate } from 'date-fns'
import { ptBR } from 'date-fns/locale'

/**
 * Formata a data para o padrão brasileiro
 */
export function format(date: Date, formatStr: string) {
  return formatDate(date, formatStr, { locale: ptBR })
}

/**
 * Formata o intervalo de datas de forma legível
 */
export function formatDateRange(from: Date, to: Date) {
  // Se mesmo ano, só mostra uma vez
  if (from.getFullYear() === to.getFullYear()) {
    // Se mesmo mês, formato: "01 a 15/03/2023"
    if (from.getMonth() === to.getMonth()) {
      return `${from.getDate()} a ${format(to, 'dd/MM/yyyy')}`
    }
    // Meses diferentes, mesmo ano: "01/03 a 15/04/2023"
    return `${format(from, 'dd/MM')} a ${format(to, 'dd/MM/yyyy')}`
  }

  // Anos diferentes: "01/03/2022 a 15/04/2023"
  return `${format(from, 'dd/MM/yyyy')} a ${format(to, 'dd/MM/yyyy')}`
}

/**
 * Formatadores para o componente Calendar
 */
export const formatters = {
  // Primeira letra do mês em maiúsculo
  formatMonthCaption: (date: Date) => {
    const formatted = format(date, 'MMMM yyyy')
    return formatted.charAt(0).toUpperCase() + formatted.slice(1)
  },

  // Formatação curta para dias da semana
  formatWeekdayName: (date: Date) => {
    return format(date, 'EEEEEE')
  },
}
