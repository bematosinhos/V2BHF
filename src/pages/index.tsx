import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useAppState } from '@/store'
import reactLogo from '@/assets/react.svg'
import viteLogo from '/vite.svg'

export default function Index() {
  const { count, increment, decrement } = useAppState()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-purple-600 via-blue-500 to-teal-400 p-8 text-white">
      <div className="mb-12 flex gap-8">
        <motion.img
          src={viteLogo}
          className="h-32 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]"
          animate={{
            rotate: 360,
            scale: 1.1,
          }}
          initial={{
            rotate: 0,
            scale: 1,
          }}
          transition={{
            rotate: {
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
            },
            scale: {
              duration: 1.5,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
            },
          }}
        />
        <motion.img
          src={reactLogo}
          className="h-32 drop-shadow-[0_0_15px_rgba(0,216,255,0.5)]"
          animate={{
            rotateY: 360,
          }}
          initial={{
            rotateY: 0,
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-white/10 p-8 shadow-2xl backdrop-blur-lg"
      >
        <h1 className="mb-6 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-center text-4xl font-bold text-transparent">
          SBC Starter Kit
        </h1>
        <p className="mb-8 text-center">
          The first web app boilerplate built for AI first editors like Cursor.
        </p>

        <div className="mb-8 text-center">
          <motion.p
            className="mb-2 text-6xl font-bold"
            key={count}
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{
              type: 'spring',
              stiffness: 260,
              damping: 20,
            }}
          >
            {count}
          </motion.p>
          <p className="text-white/80">Global Counter</p>
        </div>

        <div className="flex justify-center gap-4">
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

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-12 text-center text-white/80"
      >
        <p className="text-sm">Built with Vite + React + Tailwind + Framer Motion</p>
      </motion.div>
    </div>
  )
}
