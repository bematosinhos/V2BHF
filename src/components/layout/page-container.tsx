import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface PageContainerProps {
  children: React.ReactNode
  className?: string
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div
      className={cn(
        'flex min-h-screen flex-col items-center bg-gradient-to-br from-purple-600 via-blue-500 to-teal-400 p-4 text-white sm:p-8',
        className,
      )}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex w-full max-w-4xl flex-col items-center"
      >
        {children}
      </motion.div>
    </div>
  )
}
