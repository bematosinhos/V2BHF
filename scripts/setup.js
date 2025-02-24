import fs from 'node:fs'
import path from 'node:path'

// Função auxiliar para remover diretório recursivamente
function removeDirRecursive(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true })
    console.log(`✓ Removido: ${dir}`)
  }
}

// Função auxiliar para remover arquivo
function removeFile(file) {
  if (fs.existsSync(file)) {
    fs.unlinkSync(file)
    console.log(`✓ Removido: ${file}`)
  }
}

// Função auxiliar para criar diretório se não existir
function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
    console.log(`✓ Criado diretório: ${dir}`)
  }
}

// Função auxiliar para criar arquivo
function createFile(file, content) {
  ensureDirectoryExists(path.dirname(file))
  fs.writeFileSync(file, content)
  console.log(`✓ Criado: ${file}`)
}

// Função para remover o script setup do package.json
function removeSetupFromPackageJson() {
  console.log('\n🔧 Removendo script setup do package.json...')
  const packageJsonPath = path.join(process.cwd(), 'package.json')
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))

  // Remove o script setup
  if (packageJson.scripts) {
    if (packageJson.scripts.prepare && packageJson.scripts.prepare !== 'husky') {
      packageJson.scripts.prepare = 'husky'
      console.log('✓ Script prepare atualizado no package.json')
    }
    if (packageJson.scripts.setup) {
      delete packageJson.scripts.setup
      console.log('✓ Script setup removido do package.json')
    }

    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n')
  }
}

// Função para atualizar o arquivo de rotas
function updateAppRoutes() {
  console.log('\n🔧 Atualizando rotas da aplicação...')
  const appPath = 'src/app.tsx'

  if (fs.existsSync(appPath)) {
    let content = fs.readFileSync(appPath, 'utf8')

    // Novo conteúdo do arquivo com apenas a rota do index
    const newContent = `import { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, RouteProps } from 'react-router-dom'
import { ThemeProvider } from 'next-themes'
import { Loader2 } from 'lucide-react'
import { Toaster } from './components/ui/sonner'

const routes: RouteProps[] = [
  {
    index: true,
    path: '/',
    Component: lazy(() => import('./pages/index')),
  },
]

const loading = (
  <div className="flex min-h-screen items-center justify-center">
    <Loader2 className="text-primary h-8 w-8 animate-spin" />
  </div>
)

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Router>
        <Suspense fallback={loading}>
          <Routes>
            {routes.map((route) => (
              <Route key={route.path} {...route} />
            ))}
          </Routes>
        </Suspense>
        <Toaster />
      </Router>
    </ThemeProvider>
  )
}

export { App }
`

    fs.writeFileSync(appPath, newContent)
    console.log('✓ Rotas atualizadas em src/app.tsx')
  }
}

// Remover diretórios
console.log('\n🗑️  Removendo diretórios...')
removeDirRecursive('src/components/features')
removeDirRecursive('src/components/howto')
removeDirRecursive('src/components/layout')
removeDirRecursive('src/components/logos')

// Remover arquivos
console.log('\n🗑️  Removendo arquivos...')
removeFile('src/pages/about.tsx')
removeFile('src/pages/start.tsx')
removeFile('src/pages/index.tsx')

// Criar nova página index
console.log('\n📝 Criando nova página index...')
const indexContent = `import { FC } from 'react';
import { MainLayout } from '../components/layout/main-layout';

const IndexPage: FC = () => {
  return (
    <MainLayout>
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-2xl w-full text-center space-y-8">
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Bem-vindo ao Seu Projeto
          </h1>
          <p className="text-xl text-gray-600">
            Este é o ponto de partida para criar algo incrível.
            Personalize esta página de acordo com suas necessidades.
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="https://sbc-cursor-starter-kit.netlify.app"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Começar
            </a>
            <a
              href="https://github.com/m4n3z40/sbc-cursor-starter-kit"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default IndexPage;
`

// Criar novo layout
console.log('\n📝 Criando novo layout...')
const layoutContent = `import { FC, PropsWithChildren } from 'react';

export const MainLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <a href="/" className="text-xl font-bold text-gray-900">
              Seu Projeto
            </a>
          </div>
          <div className="flex items-center space-x-4">
            <a
              href="https://github.com/m4n3z40/sbc-cursor-starter-kit"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900"
            >
              GitHub
            </a>
            <a
              href="https://github.com/m4n3z40/sbc-cursor-starter-kit/blob/main/README.md"
              className="text-gray-600 hover:text-gray-900"
            >
              Documentação
            </a>
          </div>
        </nav>
      </header>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500">
            © {new Date().getFullYear()} Seu Projeto. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};
`

createFile('src/pages/index.tsx', indexContent)
createFile('src/components/layout/main-layout.tsx', layoutContent)

// Atualizar rotas removendo as páginas excluídas
updateAppRoutes()

// Remover script setup do package.json
removeSetupFromPackageJson()

// Remover o hook post-install
console.log('\n🗑️  Removendo hook post-install...')
removeFile('.husky/post-install')

// Remover o próprio arquivo de setup
console.log('\n🗑️  Removendo arquivo de setup...')
process.on('exit', () => {
  try {
    fs.unlinkSync(import.meta.filename)
    console.log('✓ Arquivo de setup removido')
  } catch (err) {
    console.log(err)
    console.log('⚠️  Não foi possível remover o arquivo de setup automaticamente')
  }
})

console.log('\n✨ Setup concluído com sucesso!')
