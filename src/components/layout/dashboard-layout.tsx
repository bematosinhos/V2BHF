import { FC, PropsWithChildren, useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  Home,
  Users,
  Calendar,
  FileText,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Moon,
  Sun,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAppStore } from '@/store'
import { useTheme } from 'next-themes'

export const DashboardLayout: FC<PropsWithChildren> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const location = useLocation()
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  const { professionals, selectedProfessionalId, selectProfessional, isAuthenticated, logout } =
    useAppStore()

  // Montar o componente apenas após a renderização inicial para evitar problemas de SSR
  useEffect(() => {
    setMounted(true)
  }, [])

  // Redirecionar para login se não estiver autenticado
  useEffect(() => {
    if (!isAuthenticated) {
      void navigate('/auth/login')
    }
  }, [isAuthenticated, navigate])

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const handleLogout = () => {
    logout()
    void navigate('/auth/login')
  }

  const selectedProfessional = professionals.find((p) => p.id === selectedProfessionalId) ?? null

  const navItems = [
    { path: '/dashboard', label: 'Principal', icon: <Home className="h-5 w-5" /> },
    { path: '/professionals', label: 'Profissionais', icon: <Users className="h-5 w-5" /> },
    { path: '/schedule', label: 'Escala', icon: <Calendar className="h-5 w-5" /> },
    { path: '/register', label: 'Cadastro', icon: <FileText className="h-5 w-5" /> },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      {/* Mobile Header */}
      <header className="flex h-16 items-center border-b bg-white px-4 lg:hidden dark:border-gray-700 dark:bg-gray-900">
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          <Menu className="h-6 w-6" />
        </Button>
        <div className="ml-4 text-lg font-semibold">BH Fácil</div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-50 w-64 border-r bg-white shadow-sm transition-transform lg:relative lg:translate-x-0 dark:border-gray-700 dark:bg-gray-900',
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <div className="flex h-16 items-center justify-between border-b px-4 dark:border-gray-700">
            <h2 className="text-lg font-semibold">BH Fácil</h2>
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="lg:hidden">
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="border-b p-4 dark:border-gray-700">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={selectedProfessional?.avatarUrl} />
                      <AvatarFallback>{selectedProfessional?.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="truncate">{selectedProfessional?.name}</span>
                  </div>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <ScrollArea className="h-[300px]">
                  {professionals.map((professional) => (
                    <DropdownMenuItem
                      key={professional.id}
                      onClick={() => selectProfessional(professional.id)}
                      className={cn(
                        'flex cursor-pointer items-center gap-2',
                        selectedProfessionalId === professional.id && 'bg-muted',
                      )}
                    >
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={professional.avatarUrl} />
                        <AvatarFallback>{professional.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{professional.name}</span>
                        <span className="text-muted-foreground text-xs">{professional.role}</span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </ScrollArea>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <nav className="flex-1 p-2 dark:text-gray-200">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium',
                      location.pathname === item.path
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted',
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-auto border-t p-4 dark:border-gray-700">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-medium">Modo Escuro</span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                {mounted && theme === 'dark' ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
                <span className="sr-only">Alternar tema</span>
              </Button>
            </div>
            <Button variant="outline" className="w-full justify-start gap-2" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-4 md:p-6">{children}</div>
        </main>
      </div>
    </div>
  )
}
