import { motion } from 'framer-motion'
import { Wand2 } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MainLayout } from '@/components/layout/main-layout'
import { PageContainer } from '@/components/layout/page-container'
import { PageHeader } from '@/components/layout/page-header'
import { CardContainer } from '@/components/layout/card-container'
import { CopyCode } from '@/components/howto/copy-code'

const cursorPrompt = `Clone the SBC Starter Kit repository from https://github.com/m4n3z40/sbc-cursor-starter-kit, install all dependencies and start the development server. Then show me what's available in the project.`

const installSteps = [
  {
    title: 'Clone Repository',
    command:
      'git clone https://github.com/m4n3z40/sbc-cursor-starter-kit.git\ncd sbc-cursor-starter-kit',
    description: 'First, clone the repository and navigate to the project directory',
  },
  {
    title: 'Install Dependencies',
    command: 'npm install --legacy-peer-deps\n# or\npnpm install --legacy-peer-deps',
    description: 'Install all required dependencies using your preferred package manager',
  },
  {
    title: 'Start Development',
    command: 'npm run dev\n# or\npnpm dev',
    description: 'Start the development server and begin coding',
  },
]

const availableScripts = [
  {
    name: 'dev',
    command: 'npm run dev',
    description: 'Start development server with hot reload',
  },
  {
    name: 'build',
    command: 'npm run build',
    description: 'Build the project for production',
  },
  {
    name: 'preview',
    command: 'npm run preview',
    description: 'Preview the production build locally',
  },
  {
    name: 'lint',
    command: 'npm run lint',
    description: 'Run ESLint to check code quality',
  },
  {
    name: 'lint:fix',
    command: 'npm run lint:fix',
    description: 'Automatically fix linting issues',
  },
  {
    name: 'format',
    command: 'npm run format',
    description: 'Format code with Prettier',
  },
]

const prerequisites = [
  {
    name: 'Node.js',
    version: '18+',
    link: 'https://nodejs.org',
  },
  {
    name: 'npm',
    version: 'Latest',
    link: 'https://www.npmjs.com',
  },
  {
    name: 'pnpm',
    version: 'Latest',
    link: 'https://pnpm.io',
  },
]

export default function Start() {
  return (
    <MainLayout>
      <PageContainer>
        <PageHeader
          title="Start Using SBC Starter Kit"
          description="Choose how you want to get started with your new project"
        />

        {/* Cursor Composer Section */}
        <CardContainer className="mb-12 w-full">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-6 w-6" />
                Start with Cursor
              </CardTitle>
              <CardDescription>
                Let Cursor AI do all the work for you - just copy this prompt to Cursor Composer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CopyCode code={cursorPrompt} />
            </CardContent>
          </Card>
        </CardContainer>

        {/* Separator */}
        <div className="relative mb-12">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="rounded-full bg-gradient-to-br from-purple-600 via-blue-500 to-teal-400 px-4 py-2 font-semibold text-white shadow-lg">
              OR
            </span>
          </div>
        </div>

        {/* Manual Installation Section */}
        <CardContainer className="w-full" delay={0.2}>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Start with a Human</CardTitle>
              <CardDescription>Follow these steps to manually set up your project</CardDescription>
            </CardHeader>
          </Card>

          <Tabs defaultValue="prerequisites" className="mb-8 sm:mb-12">
            <TabsList className="grid w-full grid-cols-3 text-xs sm:text-sm">
              <TabsTrigger value="prerequisites">Prerequisites</TabsTrigger>
              <TabsTrigger value="installation">Installation</TabsTrigger>
              <TabsTrigger value="scripts">Scripts</TabsTrigger>
            </TabsList>

            <TabsContent value="prerequisites">
              <Card>
                <CardHeader>
                  <CardTitle>Prerequisites</CardTitle>
                  <CardDescription>
                    Make sure you have these tools installed before starting
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    {prerequisites.map((prereq) => (
                      <a
                        key={prereq.name}
                        href={prereq.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group rounded-lg border border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/10"
                      >
                        <h3 className="mb-2 font-semibold">{prereq.name}</h3>
                        <Badge variant="secondary">{prereq.version}</Badge>
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="installation">
              <div className="grid gap-4">
                {installSteps.map((step, index) => (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Badge variant="outline">{index + 1}</Badge>
                          {step.title}
                        </CardTitle>
                        <CardDescription>{step.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <CopyCode code={step.command} />
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="scripts">
              <div className="grid gap-4">
                {availableScripts.map((script, index) => (
                  <motion.div
                    key={script.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Badge variant="outline" className="text-md">
                            {script.name}
                          </Badge>
                        </CardTitle>
                        <CardDescription>{script.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <CopyCode code={script.command} />
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContainer>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <p className="text-white/80">
            Need help? Check our{' '}
            <a
              href="https://github.com/m4n3z40/sbc-cursor-starter-kit"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-white"
            >
              documentation
            </a>{' '}
            or{' '}
            <a
              href="https://github.com/m4n3z40/sbc-cursor-starter-kit/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-white"
            >
              open an issue
            </a>
          </p>
        </motion.div>
      </PageContainer>
    </MainLayout>
  )
}
