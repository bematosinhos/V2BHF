import { motion } from 'framer-motion'
import {
  Layers,
  Database,
  Palette,
  Sparkles,
  Lightbulb,
  Zap,
  Code,
  CheckCircle,
} from 'lucide-react'
import { MainLayout } from '@/components/layout/main-layout'
import { PageContainer } from '@/components/layout/page-container'
import { PageHeader } from '@/components/layout/page-header'
import { CardContainer } from '@/components/layout/card-container'
import { RotatingLogos } from '@/components/logos/rotating-logos'
import { FeatureCard } from '@/components/features/feature-card'

const features = [
  {
    title: 'Modern Stack',
    description:
      'Built with React 19, Vite, TypeScript, React Router, and Tailwind CSS for a powerful and flexible development experience',
    icon: Layers,
  },
  {
    title: 'State Management',
    description:
      'Integrated with Zustand for simple and efficient state management without boilerplate code',
    icon: Database,
  },
  {
    title: 'Component Library',
    description:
      'Includes Shadcn/ui components for beautiful, accessible, and customizable UI elements',
    icon: Palette,
  },
  {
    title: 'Animations',
    description: 'Framer Motion integration for smooth, professional animations and transitions',
    icon: Sparkles,
  },
]

const principles = [
  {
    title: 'Simplicity',
    description: 'Keep things simple but powerful, avoiding unnecessary complexity',
    icon: Lightbulb,
  },
  {
    title: 'Performance',
    description: 'Optimized for speed and efficiency from development to production',
    icon: Zap,
  },
  {
    title: 'Developer Experience',
    description: 'Great DX with hot reload, TypeScript support, and intuitive project structure',
    icon: Code,
  },
  {
    title: 'Best Practices',
    description: 'Following modern web development standards and patterns',
    icon: CheckCircle,
  },
]

export default function About() {
  return (
    <MainLayout>
      <PageContainer>
        <RotatingLogos />

        <CardContainer className="text-center">
          <PageHeader
            title="About SBC Starter Kit"
            description="A modern, feature-rich boilerplate for building scalable React applications with best practices and powerful tools built-in."
          />

          <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
            <div>
              <h2 className="mb-3 text-center text-xl font-semibold text-white/90 sm:mb-4 sm:text-2xl">
                Features
              </h2>
              <div className="space-y-4 sm:space-y-6">
                {features.map((feature, index) => (
                  <FeatureCard
                    key={feature.title}
                    title={feature.title}
                    description={feature.description}
                    index={index}
                    variant="left"
                    icon={feature.icon}
                  />
                ))}
              </div>
            </div>

            <div>
              <h2 className="mb-4 text-center text-2xl font-semibold text-white/90">Principles</h2>
              <div className="space-y-6">
                {principles.map((principle, index) => (
                  <FeatureCard
                    key={principle.title}
                    title={principle.title}
                    description={principle.description}
                    index={index}
                    variant="right"
                    icon={principle.icon}
                  />
                ))}
              </div>
            </div>
          </div>
        </CardContainer>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-white/80"
        >
          <p className="text-sm">Start building amazing applications today with SBC Starter Kit</p>
        </motion.div>
      </PageContainer>
    </MainLayout>
  )
}
