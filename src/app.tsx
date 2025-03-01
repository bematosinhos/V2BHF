import { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, RouteProps, Navigate } from 'react-router-dom'
import { ThemeProvider } from 'next-themes'
import { Loader2 } from 'lucide-react'
import { Toaster } from './components/ui/sonner'

const routes: RouteProps[] = [
  {
    path: '/',
    element: <Navigate to="/auth/login" replace />,
  },
  {
    path: '/auth/login',
    Component: lazy(() => import('./pages/auth/login')),
  },
  {
    path: '/dashboard',
    Component: lazy(() => import('./pages/dashboard')),
  },
  {
    path: '/professionals',
    Component: lazy(() => import('./pages/professionals')),
  },
  {
    path: '/professionals/:id',
    Component: lazy(() => import('./pages/professionals/detail')),
  },
  {
    path: '/schedule',
    Component: lazy(() => import('./pages/schedule')),
  },
  {
    path: '/register',
    Component: lazy(() => import('./pages/register')),
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
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
            {routes.map((route, index) => (
              <Route key={index} {...route} />
            ))}
          </Routes>
        </Suspense>
        <Toaster />
      </Router>
    </ThemeProvider>
  )
}

export { App }
