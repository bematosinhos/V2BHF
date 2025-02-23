import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import { cn } from '@/lib/utils'
import { Menu, Home, Info, Github, PlayCircle } from 'lucide-react'
import { useState } from 'react'

const mainNavItems = [
  {
    title: 'Home',
    href: '/',
    icon: Home,
  },
  {
    title: 'Start Using',
    href: '/start',
    icon: PlayCircle,
  },
  {
    title: 'About',
    href: '/about',
    icon: Info,
  },
]

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600/10 via-blue-500/10 to-teal-400/10">
      {/* Header */}
      <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="sm:mr-2 md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[240px] p-0">
                  <div className="flex flex-col gap-4 p-6">
                    <div className="flex items-center gap-2">
                      <img src="/vite.svg" alt="Logo" className="h-6 w-6" />
                      <h2 className="font-semibold">SBC Starter Kit</h2>
                    </div>
                    <Separator />
                    <nav className="flex flex-col gap-2">
                      {mainNavItems.map((item) => {
                        const Icon = item.icon
                        return (
                          <Link
                            key={item.href}
                            to={item.href}
                            onClick={() => setIsSidebarOpen(false)}
                            className={cn(
                              'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                              location.pathname === item.href
                                ? 'bg-secondary'
                                : 'hover:bg-secondary/80',
                            )}
                          >
                            <Icon className="h-4 w-4" />
                            {item.title}
                          </Link>
                        )
                      })}
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>

              {/* Desktop Logo */}
              <div className="flex items-center gap-2">
                <img src="/vite.svg" alt="Logo" className="h-6 w-6" />
                <span className="hidden font-semibold md:inline-block">SBC Starter Kit</span>
              </div>

              {/* Desktop Navigation */}
              <NavigationMenu className="hidden md:ml-6 md:flex">
                <NavigationMenuList>
                  {mainNavItems.map((item) => (
                    <NavigationMenuItem key={item.href}>
                      <Link to={item.href}>
                        <NavigationMenuLink
                          className={cn(
                            navigationMenuTriggerStyle(),
                            location.pathname === item.href &&
                              'bg-secondary text-secondary-foreground',
                          )}
                        >
                          {item.title}
                        </NavigationMenuLink>
                      </Link>
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" asChild>
                <a
                  href="https://github.com/m4n3z40/sbc-cursor-starter-kit"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="h-5 w-5" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  )
}
