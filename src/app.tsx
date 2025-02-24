import { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, RouteProps } from 'react-router-dom'
import { ThemeProvider } from 'next-themes'
import { Loader2 } from 'lucide-react'
import { MainLayout } from './components/layout/main-layout'
import { Toaster } from './components/ui/sonner'

const routes: RouteProps[] = [
  {
    index: true,
    path: '/',
    Component: lazy(() => import('./pages/index')),
  },
  {
    path: '/start',
    Component: lazy(() => import('./pages/start')),
  },
  {
    path: '/about',
    Component: lazy(() => import('./pages/about')),
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
        <MainLayout>
          <Suspense fallback={loading}>
            <Routes>
              {routes.map((route) => (
                <Route key={route.path} {...route} />
              ))}
            </Routes>
          </Suspense>
        </MainLayout>
        <Toaster />
      </Router>
    </ThemeProvider>
  )
}

export { App }
