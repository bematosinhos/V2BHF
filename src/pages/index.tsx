import { motion } from 'framer-motion'
import { Sparkles, Zap, Brain, Rocket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppState } from '@/store'
import { Badge } from '@/components/ui/badge'
import { PageContainer } from '@/components/ui/page-container'
import { PageHeader } from '@/components/ui/page-header'
import { RotatingLogos } from '@/components/logos/rotating-logos'

const features = [
  {
    icon: Zap,
    title: 'Modern Stack',
    description: 'React 19, Vite, TypeScript & Tailwind CSS',
    iconColor: 'text-yellow-300',
  },
  {
    icon: Brain,
    title: 'AI-First',
    description: 'Optimized for AI-powered development',
    iconColor: 'text-purple-300',
  },
  {
    icon: Sparkles,
    title: 'Rich UI',
    description: 'Shadcn/ui + Framer Motion',
    iconColor: 'text-blue-300',
  },
  {
    icon: Rocket,
    title: 'Productivity',
    description: 'Exceptional DX and quick setup',
    iconColor: 'text-green-300',
  },
]

export default function Index() {
  const { count, increment, decrement } = useAppState()

  return (
    <PageContainer>
      <RotatingLogos />

      <motion.div className="w-full max-w-sm text-center sm:max-w-xl">
        <div className="mb-8 rounded-2xl bg-white/10 p-4 shadow-2xl backdrop-blur-lg sm:p-8">
          <PageHeader
            title="Is AI creating bad, hard to maintain code?"
            description="This template is designed for AI code editors like Cursor, helping transform AI assistance into high-quality, maintainable code that follows development best practices."
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                whileHover={{ scale: 1.05 }}
                className="flex items-start gap-3 rounded-lg bg-white/5 p-3 text-left"
              >
                <feature.icon className={`h-5 w-5 ${feature.iconColor}`} />
                <div>
                  <h3 className="mb-1 font-semibold">{feature.title}</h3>
                  <p className="text-sm text-white/70">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <Button
              asChild
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            >
              <a href="/start">Get Started →</a>
            </Button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl bg-white/10 p-4 shadow-2xl backdrop-blur-lg sm:p-8"
        >
          <div className="mb-6 text-center">
            <Badge variant="secondary" className="mb-2">
              Interactive Demo
            </Badge>
            <h2 className="mb-2 text-xl font-semibold sm:text-2xl">Global State Management</h2>
            <p className="text-sm text-white/70">
              Experience Zustand&apos;s simplicity with this counter example
            </p>
          </div>

          <motion.div
            className="flex flex-col items-center gap-4 rounded-lg bg-white/5 p-4"
            whileHover={{ scale: 1.02 }}
          >
            <motion.p
              className="text-4xl font-bold sm:text-5xl"
              key={count}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: 'spring',
                stiffness: 260,
                damping: 20,
              }}
            >
              {count}
            </motion.p>

            <div className="flex gap-3 sm:gap-4">
              <Button
                onClick={increment}
                className="transform bg-white/20 shadow-lg transition-all duration-300 hover:scale-105 hover:bg-white/30 hover:shadow-xl active:scale-95"
              >
                Increment
              </Button>
              <Button
                onClick={decrement}
                className="transform bg-white/20 shadow-lg transition-all duration-300 hover:scale-105 hover:bg-white/30 hover:shadow-xl active:scale-95"
              >
                Decrement
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-center text-white/80"
      >
        <p className="text-sm">Built with modern technologies for fast and efficient development</p>
      </motion.div>
    </PageContainer>
  )
}
