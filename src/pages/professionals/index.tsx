import { FC, useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Search, MoreHorizontal, UserPlus } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAppStore, Professional } from '@/store'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Link } from 'react-router-dom'

const ProfessionalsPage: FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  const { professionals, selectProfessional, updateProfessional } = useAppStore()

  const filteredProfessionals = professionals.filter(
    (professional) =>
      professional.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      professional.role.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getStatusBadge = (status: Professional['status']) => {
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

  const handleSelectProfessional = (id: string) => {
    selectProfessional(id)
    void navigate('/dashboard')
  }

  const handleToggleStatus = (professional: Professional) => {
    const newStatus = professional.status === 'active' ? 'inactive' : 'active'
    void updateProfessional(professional.id, { status: newStatus })

    toast.success(`Profissional ${newStatus === 'active' ? 'ativado' : 'desativado'} com sucesso!`)
  }

  const handleAddProfessional = () => {
    void navigate('/register')
  }

  const handleNavigate = (path: string) => {
    void navigate(path)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Profissionais</h1>
            <p className="text-muted-foreground">
              Gerencie os profissionais domésticos cadastrados.
            </p>
          </div>
          <Button className="w-full md:w-auto" onClick={handleAddProfessional}>
            <UserPlus className="mr-2 h-4 w-4" />
            Adicionar Profissional
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Profissionais</CardTitle>
            <CardDescription>
              Total de {professionals.length} profissionais cadastrados.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                  <Input
                    type="search"
                    placeholder="Buscar profissionais..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="dark:bg-gray-800 dark:text-gray-200">
                      <TableHead>Nome</TableHead>
                      <TableHead>Função</TableHead>
                      <TableHead>Data de Início</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Detalhes</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProfessionals.length > 0 ? (
                      filteredProfessionals.map((professional) => (
                        <TableRow key={professional.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={professional.avatarUrl} />
                                <AvatarFallback>{professional.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{professional.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{professional.role}</TableCell>
                          <TableCell>{professional.startDate}</TableCell>
                          <TableCell>{getStatusBadge(professional.status)}</TableCell>
                          <TableCell>
                            <Link to={`/professionals/${professional.id}`}>
                              <Button size="sm" variant="outline">
                                Detalhes
                              </Button>
                            </Link>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Abrir menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleSelectProfessional(professional.id)}
                                >
                                  Selecionar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleNavigate(`/professionals/${professional.id}`)
                                  }
                                >
                                  Ver detalhes
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleNavigate(`/register?edit=${professional.id}`)
                                  }
                                >
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleToggleStatus(professional)}>
                                  {professional.status === 'active' ? 'Desativar' : 'Ativar'}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          Nenhum profissional encontrado.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default ProfessionalsPage
