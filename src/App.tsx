import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from 'next-themes'
import MainLayout from './components/layout/MainLayout'
import { Toaster } from './components/ui/sonner'
import Index from './pages/index'
import About from './pages/about'

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Router>
        <MainLayout>
          <Routes>
            <Route index element={<Index />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </MainLayout>
        <Toaster />
      </Router>
    </ThemeProvider>
  )
}

export default App
