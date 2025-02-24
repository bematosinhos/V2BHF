import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface CardContainerProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

export function CardContainer({ children, className, delay = 0 }: CardContainerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={cn('rounded-2xl bg-white/10 p-4 shadow-2xl backdrop-blur-lg sm:p-8', className)}
    >
      {children}
    </motion.div>
  )
}
