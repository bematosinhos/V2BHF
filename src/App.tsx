import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from 'next-themes'
import { Suspense, lazy } from 'react'
import { Loader2 } from 'lucide-react'
import MainLayout from './components/layout/MainLayout'
import { Toaster } from './components/ui/sonner'

// Importações dinâmicas de rotas
const Index = lazy(() => import('./pages/index'))
const Start = lazy(() => import('./pages/start'))
const About = lazy(() => import('./pages/about'))

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Router>
        <MainLayout>
          <Suspense
            fallback={
              <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="text-primary h-8 w-8 animate-spin" />
              </div>
            }
          >
            <Routes>
              <Route index element={<Index />} />
              <Route path="/start" element={<Start />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </Suspense>
        </MainLayout>
        <Toaster />
      </Router>
    </ThemeProvider>
  )
}

export default App
