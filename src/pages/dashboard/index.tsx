import { FC, useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card } from '@/components/ui/card'
import { Calendar, Users, FileText } from 'lucide-react'
import { useAppStore } from '@/store'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Link } from 'react-router-dom'

const DashboardPage: FC = () => {
  const { user } = useAppStore()

  const [currentTime, setCurrentTime] = useState(new Date())

  // Atualizar o horário atual a cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  // Buscar registros de ponto do profissional selecionado para hoje

  // Calcular horas trabalhadas

  // Função auxiliar para converter string de hora para Date

  // Formatar minutos para exibição

  // Calcular banco de horas (mock)

  const currentDate = format(currentTime, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1)
  }

  // Obter o período do dia para saudação
  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return 'Bom dia'
    if (hour < 18) return 'Boa tarde'
    return 'Boa noite'
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {getGreeting()}, {user?.name ?? 'Usuário'}!
          </h1>
          <p className="text-muted-foreground">{capitalizeFirstLetter(currentDate)}</p>
        </div>

        {/* Quick Access section update */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Link to="/professionals">
            <Card className="flex cursor-pointer flex-col items-center p-4 transition-shadow hover:shadow-lg">
              <Users className="mb-2 h-8 w-8" />
              <span className="text-sm font-medium">Profissionais</span>
            </Card>
          </Link>
          <Link to="/schedule">
            <Card className="flex cursor-pointer flex-col items-center p-4 transition-shadow hover:shadow-lg">
              <Calendar className="mb-2 h-8 w-8" />
              <span className="text-sm font-medium">Escala</span>
            </Card>
          </Link>
          <Link to="/register">
            <Card className="flex cursor-pointer flex-col items-center p-4 transition-shadow hover:shadow-lg">
              <FileText className="mb-2 h-8 w-8" />
              <span className="text-sm font-medium">Cadastro</span>
            </Card>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default DashboardPage
