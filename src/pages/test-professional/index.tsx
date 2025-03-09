import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { supabase, isSupabaseAvailable } from '@/lib/supabase'
import { addProfessional, getAllProfessionals, Professional } from '@/lib/professionals'
import { Separator } from '@/components/ui/separator'

// Gera um CPF único para teste
function generateTestCPF() {
  const random9Digits = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10)).join('')
  // Calculando o primeiro dígito verificador
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(random9Digits[i]) * (10 - i)
  }
  const firstVerifier = 11 - (sum % 11)
  const firstDigit = firstVerifier > 9 ? 0 : firstVerifier
  
  // Calculando o segundo dígito verificador
  sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(random9Digits[i]) * (11 - i)
  }
  sum += firstDigit * 2
  const secondVerifier = 11 - (sum % 11)
  const secondDigit = secondVerifier > 9 ? 0 : secondVerifier
  
  // Formatando o CPF no padrão 000.000.000-00
  const cpf = `${random9Digits.slice(0, 3)}.${random9Digits.slice(3, 6)}.${random9Digits.slice(6, 9)}-${firstDigit}${secondDigit}`
  return cpf
}

// Cria dados de teste para um profissional
function createTestProfessionalData(): Omit<Professional, 'id' | 'created_at' | 'updated_at'> {
  const testId = Math.floor(Math.random() * 1000000)
  return {
    name: `Profissional Teste ${testId}`,
    role: 'Enfermeiro',
    status: 'active' as const,
    start_date: new Date().toISOString().split('T')[0],
    cpf: generateTestCPF(),
    birth_date: '1990-01-01',
    work_hours: '08:00-17:00',
    work_city: 'São Paulo',
    salary: '5000',
    address: 'Rua de Teste, 123',
    phone: '(11) 98765-4321',
    email: `teste${testId}@example.com`,
  }
}

type LogMessage = {
  id: number
  type: 'info' | 'success' | 'error' | 'warning'
  message: string
  timestamp: Date
}

export default function TestProfessionalPage() {
  const [isRunning, setIsRunning] = useState(false)
  const [professional, setProfessional] = useState<Professional | null>(null)
  const [logs, setLogs] = useState<LogMessage[]>([])
  const [hasError, setHasError] = useState(false)
  const [testResult, setTestResult] = useState<'success' | 'failure' | null>(null)
  const [testStartTime, setTestStartTime] = useState<Date | null>(null)
  const [testEndTime, setTestEndTime] = useState<Date | null>(null)
  
  // Adiciona log à lista
  const addLog = (type: LogMessage['type'], message: string) => {
    setLogs(prev => [
      ...prev, 
      { 
        id: Date.now(), 
        type, 
        message, 
        timestamp: new Date() 
      }
    ])
  }
  
  // Limpar logs e resultados
  const clearLogs = () => {
    setLogs([])
    setProfessional(null)
    setTestResult(null)
    setTestStartTime(null)
    setTestEndTime(null)
    setHasError(false)
  }
  
  // Função principal de teste
  const runTest = async () => {
    clearLogs()
    setIsRunning(true)
    setTestStartTime(new Date())
    
    try {
      // Verificar conexão com o Supabase
      addLog('info', 'Verificando conexão com o Supabase...')
      const connectionStatus = await isSupabaseAvailable()
      
      if (!connectionStatus) {
        addLog('error', '❌ Não foi possível conectar ao Supabase. Verifique sua conexão com a internet e as credenciais.')
        setHasError(true)
        setTestResult('failure')
        return
      }
      
      addLog('success', '✅ Conexão com o Supabase estabelecida')
      
      // Criar dados de teste
      const testData = createTestProfessionalData()
      addLog('info', `📝 Dados de teste criados: ${testData.name} (${testData.cpf})`)
      
      // Tentar cadastrar o profissional
      addLog('info', 'Enviando dados para cadastro...')
      const startTime = Date.now()
      const { data, error } = await addProfessional(testData)
      const endTime = Date.now()
      
      if (error) {
        addLog('error', `❌ Erro ao cadastrar profissional: ${error.message}`)
        setHasError(true)
        setTestResult('failure')
        return
      }
      
      if (!data || data.length === 0) {
        addLog('error', '❌ Profissional foi cadastrado, mas nenhum dado foi retornado')
        setHasError(true)
        setTestResult('failure')
        return
      }
      
      addLog('success', `✅ Profissional cadastrado com sucesso em ${endTime - startTime}ms!`)
      
      // Armazenar o profissional para referência
      if (data[0]) {
        setProfessional(data[0] as Professional)
        addLog('info', `📊 ID: ${data[0].id}`)
        addLog('info', `📊 Nome: ${data[0].name}`)
        addLog('info', `📊 CPF: ${data[0].cpf}`)
        addLog('info', `📊 Data de criação: ${data[0].created_at}`)
      }
      
      // Verificar se o profissional foi realmente cadastrado consultando todos os profissionais
      addLog('info', 'Verificando se o profissional está no banco de dados...')
      const { data: allProfessionals } = await getAllProfessionals()
      
      const foundProfessional = allProfessionals?.find(p => p.id === data[0].id)
      
      if (!foundProfessional) {
        addLog('error', '❌ Profissional não foi encontrado na lista de profissionais')
        setHasError(true)
        setTestResult('failure')
        return
      }
      
      addLog('success', '✅ Profissional encontrado no banco de dados!')
      setTestResult('success')
      
      // Oferecer botão para limpar dados de teste
      addLog('warning', 'Os dados de teste permanecem no banco. Use o botão "Limpar Dados de Teste" para removê-los.')
      
    } catch (error) {
      addLog('error', `❌ Teste falhou: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
      setHasError(true)
      setTestResult('failure')
    } finally {
      setIsRunning(false)
      setTestEndTime(new Date())
    }
  }
  
  // Limpar dados de teste do Supabase
  const cleanupTestData = async () => {
    if (!professional?.id) {
      addLog('warning', 'Não há dados de teste para limpar')
      return
    }
    
    try {
      addLog('info', `Removendo profissional de teste (ID: ${professional.id})...`)
      const { error } = await supabase
        .from('professionals')
        .delete()
        .eq('id', professional.id)
      
      if (error) {
        addLog('error', `⚠️ Não foi possível limpar os dados de teste: ${error.message}`)
        return
      }
      
      addLog('success', '✅ Dados de teste removidos com sucesso')
      setProfessional(null)
    } catch (error) {
      addLog('error', `❌ Erro ao limpar dados: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    }
  }
  
  return (
    <div className="container mx-auto py-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">Teste de Cadastro de Profissionais</h1>
          <p className="text-gray-500">
            Esta página executa um teste para verificar se o cadastro de profissionais está funcionando corretamente 
            e se os dados são persistidos no Supabase.
          </p>
        </div>
        
        <div className="flex gap-4">
          <Button 
            onClick={runTest} 
            disabled={isRunning}
            size="lg"
            className={isRunning ? "opacity-80" : ""}
          >
            {isRunning ? 'Executando teste...' : 'Executar Teste'}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={clearLogs}
            disabled={isRunning || logs.length === 0}
          >
            Limpar Logs
          </Button>
          
          {professional && (
            <Button 
              variant="destructive" 
              onClick={cleanupTestData}
              disabled={isRunning}
            >
              Limpar Dados de Teste
            </Button>
          )}
        </div>
        
        {testResult && (
          <Card className={testResult === 'success' ? 'border-green-500' : 'border-red-500'}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                {testResult === 'success' ? '✅ Teste Concluído com Sucesso' : '❌ Teste Falhou'}
                <Badge variant={testResult === 'success' ? 'default' : 'destructive'}>
                  {testResult === 'success' ? 'SUCESSO' : 'FALHA'}
                </Badge>
              </CardTitle>
              {testStartTime && testEndTime && (
                <CardDescription>
                  Duração: {((testEndTime.getTime() - testStartTime.getTime()) / 1000).toFixed(2)} segundos
                </CardDescription>
              )}
            </CardHeader>
          </Card>
        )}
        
        <Card>
          <CardHeader>
            <CardTitle>Log de Execução</CardTitle>
            <CardDescription>
              Registros do teste de cadastro de profissionais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-96 overflow-y-auto border rounded-md p-2 bg-gray-50">
              {logs.length === 0 ? (
                <div className="text-center p-8 text-gray-400">
                  Nenhum log ainda. Execute o teste para ver os resultados.
                </div>
              ) : (
                <div className="space-y-2">
                  {logs.map((log) => (
                    <div key={log.id} className="flex gap-2 text-sm">
                      <span className="text-gray-400 shrink-0">
                        {log.timestamp.toLocaleTimeString()}
                      </span>
                      <span className={
                        log.type === 'success' ? 'text-green-600' : 
                        log.type === 'error' ? 'text-red-600' :
                        log.type === 'warning' ? 'text-amber-600' : 'text-blue-600'
                      }>
                        {log.message}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 