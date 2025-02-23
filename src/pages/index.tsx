import { motion } from 'framer-motion'
import { Sparkles, Zap, Brain, Rocket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppState } from '@/store'
import reactLogo from '@/assets/react.svg'
import viteLogo from '/vite.svg'
import { Badge } from '@/components/ui/badge'

export default function Index() {
  const { count, increment, decrement } = useAppState()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-purple-600 via-blue-500 to-teal-400 p-4 text-white sm:p-8">
      <div className="mb-8 flex gap-4 sm:mb-12 sm:gap-8">
        <motion.img
          src={viteLogo}
          className="h-16 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] sm:h-24"
          animate={{
            rotate: 360,
            scale: 1.1,
          }}
          initial={{ rotate: 0, scale: 1 }}
          transition={{
            rotate: { duration: 3, repeat: Infinity, ease: 'linear' },
            scale: { duration: 1.5, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' },
          }}
        />
        <motion.img
          src={reactLogo}
          className="h-16 drop-shadow-[0_0_15px_rgba(0,216,255,0.5)] sm:h-24"
          animate={{ rotateY: 360 }}
          initial={{ rotateY: 0 }}
          transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm sm:max-w-xl"
      >
        <div className="mb-8 rounded-2xl bg-white/10 p-4 shadow-2xl backdrop-blur-lg sm:p-8">
          <h1 className="mb-6 bg-gradient-to-r from-white via-blue-200 to-white bg-clip-text text-center text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl">
            Is AI creating bad, hard to maintain code?
          </h1>
          <div className="mb-8">
            <p className="text-center text-base font-medium text-white/90 sm:text-lg">
              This template is designed for AI code editors like Cursor, helping transform AI
              assistance into high-quality, maintainable code that follows development best
              practices.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-start gap-3 rounded-lg bg-white/5 p-3"
            >
              <Zap className="h-5 w-5 text-yellow-300" />
              <div>
                <h3 className="mb-1 font-semibold">Modern Stack</h3>
                <p className="text-sm text-white/70">React 19, Vite, TypeScript & Tailwind CSS</p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-start gap-3 rounded-lg bg-white/5 p-3"
            >
              <Brain className="h-5 w-5 text-purple-300" />
              <div>
                <h3 className="mb-1 font-semibold">AI-First</h3>
                <p className="text-sm text-white/70">Optimized for AI-powered development</p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-start gap-3 rounded-lg bg-white/5 p-3"
            >
              <Sparkles className="h-5 w-5 text-blue-300" />
              <div>
                <h3 className="mb-1 font-semibold">Rich UI</h3>
                <p className="text-sm text-white/70">Shadcn/ui + Framer Motion</p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-start gap-3 rounded-lg bg-white/5 p-3"
            >
              <Rocket className="h-5 w-5 text-green-300" />
              <div>
                <h3 className="mb-1 font-semibold">Productivity</h3>
                <p className="text-sm text-white/70">Exceptional DX and quick setup</p>
              </div>
            </motion.div>
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
    </div>
  )
}
