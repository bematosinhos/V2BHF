import { motion } from 'framer-motion'

interface FeatureCardProps {
  title: string
  description: string
  index: number
  variant?: 'left' | 'right'
}

export function FeatureCard({ title, description, index, variant = 'left' }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: variant === 'left' ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="rounded-lg bg-white/5 p-3 text-left sm:p-4"
    >
      <h3 className="mb-1 text-base font-semibold sm:mb-2 sm:text-lg">{title}</h3>
      <p className="text-sm text-white/70 sm:text-base">{description}</p>
    </motion.div>
  )
}
