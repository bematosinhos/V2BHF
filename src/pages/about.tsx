import { motion } from 'framer-motion'
import reactLogo from '@/assets/react.svg'
import viteLogo from '/vite.svg'

const features = [
  {
    title: 'Modern Stack',
    description:
      'Built with React 19, Vite, TypeScript, React Router, and Tailwind CSS for a powerful and flexible development experience',
  },
  {
    title: 'State Management',
    description:
      'Integrated with Zustand for simple and efficient state management without boilerplate code',
  },
  {
    title: 'Component Library',
    description:
      'Includes Shadcn/ui components for beautiful, accessible, and customizable UI elements',
  },
  {
    title: 'Animations',
    description: 'Framer Motion integration for smooth, professional animations and transitions',
  },
]

const principles = [
  {
    title: 'Simplicity',
    description: 'Keep things simple but powerful, avoiding unnecessary complexity',
  },
  {
    title: 'Performance',
    description: 'Optimized for speed and efficiency from development to production',
  },
  {
    title: 'Developer Experience',
    description: 'Great DX with hot reload, TypeScript support, and intuitive project structure',
  },
  {
    title: 'Best Practices',
    description: 'Following modern web development standards and patterns',
  },
]

export default function About() {
  return (
    <div className="flex min-h-screen flex-col items-center bg-gradient-to-br from-purple-600 via-blue-500 to-teal-400 p-4 text-white sm:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl"
      >
        <div className="mb-8 flex items-center justify-center gap-4 sm:mb-12 sm:gap-8">
          <motion.img
            src={viteLogo}
            className="h-12 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] sm:h-16"
            animate={{ rotate: 360 }}
            initial={{ rotate: 0 }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
          <motion.img
            src={reactLogo}
            className="h-12 drop-shadow-[0_0_15px_rgba(0,216,255,0.5)] sm:h-16"
            animate={{ rotateY: 360 }}
            initial={{ rotateY: 0 }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6 rounded-2xl bg-white/10 p-4 shadow-2xl backdrop-blur-lg sm:mb-8 sm:p-8"
        >
          <h1 className="mb-4 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-center text-3xl font-bold text-transparent sm:mb-6 sm:text-4xl">
            About SBC Starter Kit
          </h1>

          <p className="mb-6 text-center text-base text-white/90 sm:mb-8 sm:text-lg">
            A modern, feature-rich boilerplate for building scalable React applications with best
            practices and powerful tools built-in.
          </p>

          <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
            <div>
              <h2 className="mb-3 text-xl font-semibold text-white/90 sm:mb-4 sm:text-2xl">
                Features
              </h2>
              <div className="space-y-4 sm:space-y-6">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="rounded-lg bg-white/5 p-3 sm:p-4"
                  >
                    <h3 className="mb-1 text-base font-semibold sm:mb-2 sm:text-lg">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-white/70 sm:text-base">{feature.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="mb-4 text-2xl font-semibold text-white/90">Principles</h2>
              <div className="space-y-6">
                {principles.map((principle, index) => (
                  <motion.div
                    key={principle.title}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="rounded-lg bg-white/5 p-4"
                  >
                    <h3 className="mb-2 text-lg font-semibold">{principle.title}</h3>
                    <p className="text-white/70">{principle.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-white/80"
        >
          <p className="text-sm">Start building amazing applications today with SBC Starter Kit</p>
        </motion.div>
      </motion.div>
    </div>
  )
}
