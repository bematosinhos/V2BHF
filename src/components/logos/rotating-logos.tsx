import { motion } from 'framer-motion'
import reactLogo from '@/assets/react.svg'
import viteLogo from '/vite.svg'

export function RotatingLogos() {
  return (
    <div className="mb-8 flex justify-center gap-4 sm:mb-12 sm:gap-8">
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
  )
}
