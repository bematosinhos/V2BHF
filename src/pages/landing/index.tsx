import { FC } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  Users, 
  BarChart, 
  Calendar, 
  CheckCircle, 
  ArrowRight, 
  LayoutDashboard,
  Smartphone
} from 'lucide-react';

const LandingPage: FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="container flex items-center justify-between h-16 px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span className="text-xl font-bold">BH Fácil</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400">
              Funcionalidades
            </a>
            <a href="#benefits" className="text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400">
              Benefícios
            </a>
            <a href="#how-it-works" className="text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400">
              Como Funciona
            </a>
          </nav>
          <div className="flex items-center gap-4">
            <Link to="/auth/login">
              <Button variant="ghost" className="text-sm">Entrar</Button>
            </Link>
            <Link to="/auth/register">
              <Button className="text-sm bg-blue-600 hover:bg-blue-700 text-white">Criar Conta</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-32 container px-4 md:px-6 mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-center max-w-6xl mx-auto">
          <div className="md:w-1/2 space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Simplifique o controle de <span className="text-blue-600 dark:text-blue-400">Banco de Horas</span>
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-md">
              Gerencie facilmente o banco de horas dos seus colaboradores com uma interface intuitiva e moderna.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link to="/auth/login">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto">
                  Comece Agora <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/auth/register">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Criar Uma Conta
                </Button>
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 mt-12 md:mt-0 flex justify-center">
            <div className="relative w-full max-w-md mx-auto">
              <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 opacity-30 blur-xl"></div>
              <div className="relative overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-2 shadow-xl">
                {/* Mockup de Dashboard mais realista */}
                <div className="bg-slate-100 dark:bg-slate-800 rounded-md p-3">
                  {/* Barra de navegação do dashboard */}
                  <div className="flex items-center justify-between mb-4 bg-white dark:bg-slate-900 p-2 rounded-md shadow-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span className="font-semibold text-sm">BH Fácil</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900"></div>
                    </div>
                  </div>
                  
                  {/* Header do Dashboard */}
                  <div className="bg-white dark:bg-slate-900 rounded-md p-3 mb-3 shadow-sm">
                    <h3 className="text-sm font-medium mb-2">Bem-vindo ao Dashboard</h3>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Banco de Horas: Março 2024</p>
                        <p className="text-lg font-bold">+12:30</p>
                      </div>
                      <Button size="sm" variant="outline" className="text-xs">Ver Detalhes</Button>
                    </div>
                  </div>
                  
                  {/* Estatísticas */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-white dark:bg-slate-900 p-3 rounded-md shadow-sm">
                      <p className="text-xs text-slate-500 dark:text-slate-400">Profissionais</p>
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-bold">18</p>
                        <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-3 rounded-md shadow-sm">
                      <p className="text-xs text-slate-500 dark:text-slate-400">Registros hoje</p>
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-bold">42</p>
                        <BarChart className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Gráfico simplificado */}
                  <div className="bg-white dark:bg-slate-900 p-3 rounded-md shadow-sm mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium">Horas Trabalhadas</h3>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Mar 2024</div>
                    </div>
                    <div className="h-24 flex items-end justify-between gap-1 pt-2">
                      {[35, 42, 30, 45, 38, 50, 40].map((height, index) => (
                        <div 
                          key={index} 
                          className="w-full bg-blue-100 dark:bg-blue-900 rounded-t-sm"
                          style={{ height: `${height}%` }}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-slate-500">Seg</span>
                      <span className="text-xs text-slate-500">Ter</span>
                      <span className="text-xs text-slate-500">Qua</span>
                      <span className="text-xs text-slate-500">Qui</span>
                      <span className="text-xs text-slate-500">Sex</span>
                      <span className="text-xs text-slate-500">Sáb</span>
                      <span className="text-xs text-slate-500">Dom</span>
                    </div>
                  </div>
                  
                  {/* Lista de atividades recentes */}
                  <div className="bg-white dark:bg-slate-900 p-3 rounded-md shadow-sm">
                    <h3 className="text-sm font-medium mb-2">Atividades Recentes</h3>
                    <div className="space-y-2">
                      <div className="flex items-center text-xs">
                        <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                        <span className="text-slate-600 dark:text-slate-300">Maria Silva</span>
                        <span className="mx-2 text-slate-400">•</span>
                        <span className="text-slate-500">Check-in às 08:30</span>
                      </div>
                      <div className="flex items-center text-xs">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                        <span className="text-slate-600 dark:text-slate-300">João Santos</span>
                        <span className="mx-2 text-slate-400">•</span>
                        <span className="text-slate-500">Intervalo às 12:00</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white dark:bg-slate-900">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">Funcionalidades Principais</h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Tudo que você precisa para um gerenciamento eficiente do banco de horas
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Registro de Horas</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Registre facilmente entradas, saídas e intervalos com precisão de minutos.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Gestão de Profissionais</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Cadastre e gerencie todos os profissionais da sua equipe em um só lugar.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                <BarChart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Relatórios Detalhados</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Visualize relatórios e gráficos para melhor análise do banco de horas.
              </p>
            </div>
            
            {/* Feature 4 */}
            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Programação de Férias</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Planeje e acompanhe férias e folgas dos colaboradores.
              </p>
            </div>
            
            {/* Feature 5 */}
            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                <LayoutDashboard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Dashboard Intuitivo</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Interface amigável e de fácil navegação para todos os usuários.
              </p>
            </div>
            
            {/* Feature 6 */}
            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                <Smartphone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Responsivo</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Acesse de qualquer dispositivo: desktop, tablet ou smartphone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-slate-50 dark:bg-slate-800">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold">Por que escolher o BH Fácil?</h2>
              <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Economize tempo e recursos com nossa solução completa de gestão de banco de horas
              </p>
            </div>
            
            <div className="space-y-8">
              {/* Benefit 1 */}
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="bg-white dark:bg-slate-900 p-3 rounded-full">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Otimização de Tempo</h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Reduza o tempo gasto com processos manuais de controle de horas, permitindo que sua equipe se concentre em atividades estratégicas.
                  </p>
                </div>
              </div>
              
              {/* Benefit 2 */}
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="bg-white dark:bg-slate-900 p-3 rounded-full">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Eliminação de Erros</h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Minimize erros de cálculo e registro com nossa solução automatizada que garante a precisão dos dados.
                  </p>
                </div>
              </div>
              
              {/* Benefit 3 */}
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="bg-white dark:bg-slate-900 p-3 rounded-full">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Conformidade Legal</h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Mantenha-se em conformidade com as leis trabalhistas brasileiras com relatórios e registros adequados.
                  </p>
                </div>
              </div>
              
              {/* Benefit 4 */}
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="bg-white dark:bg-slate-900 p-3 rounded-full">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Facilidade de Uso</h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Interface amigável que não requer treinamento extensivo, permitindo adoção rápida por toda a equipe.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white dark:bg-slate-900">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">Como Funciona</h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Comece a usar o BH Fácil em apenas três passos simples
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Crie sua conta</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Registre-se gratuitamente e configure seu perfil em minutos
              </p>
            </div>
            
            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Cadastre sua equipe</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Adicione os profissionais da sua empresa e suas informações
              </p>
            </div>
            
            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Comece a registrar</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Inicie o registro de ponto e acompanhe o banco de horas da sua equipe
              </p>
            </div>
          </div>
          
          <div className="text-center mt-16">
            <Link to="/auth/register">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                Comece Agora <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 dark:bg-blue-700">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Simplifique o controle de horas com o BH Fácil
            </h2>
            <p className="mt-4 text-lg text-slate-200 max-w-2xl mx-auto">
              Economize tempo e recursos com nossa solução completa de gestão de banco de horas
            </p>
            <div className="mt-8">
              <Link to="/auth/register">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-slate-200">
                  Criar Conta
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 py-12">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <span className="text-xl font-bold">BH Fácil</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Simplifique o controle de banco de horas com nossa solução completa.
              </p>
              <div className="flex gap-3">
                <a href="#" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                </a>
                <a href="#" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                  </svg>
                </a>
                <a href="#" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>
                <a href="#" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                    <rect x="2" y="9" width="4" height="12"></rect>
                    <circle cx="4" cy="4" r="2"></circle>
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold mb-4">Recursos</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#features" className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400">
                    Funcionalidades
                  </a>
                </li>
                <li>
                  <a href="#benefits" className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400">
                    Benefícios
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400">
                    Como Funciona
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400">
                    Preços
                  </a>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400">
                    Sobre Nós
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400">
                    Contato
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400">
                    Carreiras
                  </a>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold mb-4">Suporte</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400">
                    Centro de Ajuda
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400">
                    Documentação
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400">
                    Status do Sistema
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400">
                    Termos de Serviço
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} BH Fácil. Todos os direitos reservados.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400">
                Privacidade
              </a>
              <a href="#" className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400">
                Termos
              </a>
              <a href="#" className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 