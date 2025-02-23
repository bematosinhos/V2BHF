import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useAppState } from '@/store'
import reactLogo from '@/assets/react.svg'
import viteLogo from '/vite.svg'

export default function Index() {
  const { count, increment, decrement } = useAppState()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-purple-600 via-blue-500 to-teal-400 p-4 text-white sm:p-8">
      <div className="mb-8 flex gap-4 sm:mb-12 sm:gap-8">
        <motion.img
          src={viteLogo}
          className="h-20 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] sm:h-32"
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
          className="h-20 drop-shadow-[0_0_15px_rgba(0,216,255,0.5)] sm:h-32"
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
        className="w-full max-w-sm rounded-2xl bg-white/10 p-4 shadow-2xl backdrop-blur-lg sm:max-w-md sm:p-8"
      >
        <h1 className="mb-4 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-center text-3xl font-bold text-transparent sm:mb-6 sm:text-4xl">
          SBC Starter Kit
        </h1>
        <p className="mb-6 text-center text-sm sm:mb-8 sm:text-base">
          The first web app boilerplate built for AI first editors like Cursor.
        </p>

        <div className="mb-6 text-center sm:mb-8">
          <motion.p
            className="mb-2 text-4xl font-bold sm:text-6xl"
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
          <p className="text-sm text-white/80">Global Counter</p>
        </div>

        <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
          <Button
            onClick={increment}
            className="w-full transform bg-white/20 shadow-lg transition-all duration-300 hover:scale-105 hover:bg-white/30 hover:shadow-xl active:scale-95 sm:w-auto"
          >
            Increment
          </Button>
          <Button
            onClick={decrement}
            className="w-full transform bg-white/20 shadow-lg transition-all duration-300 hover:scale-105 hover:bg-white/30 hover:shadow-xl active:scale-95 sm:w-auto"
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
