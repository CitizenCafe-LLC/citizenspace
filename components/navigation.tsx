'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import { Menu, Coffee, Users, Calendar, Camera, MapPin, Phone, Wallet } from 'lucide-react'

const navigation = [
  { name: 'Cafe', href: '/cafe' },
  {
    name: 'Workspaces',
    href: '/workspaces',
    children: [
      { name: 'Desks', href: '/workspaces/desks', description: 'Hourly & daily workspace options' },
      {
        name: 'Meeting Rooms',
        href: '/workspaces/meeting-rooms',
        description: 'Private rooms for teams',
      },
      {
        name: 'Communications Pods',
        href: '/workspaces/communications-pods',
        description: 'Private phone booths',
      },
    ],
  },
  { name: 'Membership', href: '/membership' },
  { name: 'Events', href: '/events' },
  { name: 'Gallery', href: '/gallery' },
  { name: 'Blog', href: '/blog' },
  { name: 'Location', href: '/location' },
  { name: 'Contact', href: '/contact' },
]

export function Navigation() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Coffee className="h-8 w-8 text-cs-blue" />
          <span className="font-display text-xl font-bold">Citizen Space</span>
        </Link>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden lg:flex">
          <NavigationMenuList>
            {navigation.map(item => (
              <NavigationMenuItem key={item.name}>
                {item.children ? (
                  <>
                    <NavigationMenuTrigger className="bg-transparent">
                      {item.name}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[400px] gap-3 p-4">
                        {item.children.map(child => (
                          <li key={child.name}>
                            <NavigationMenuLink asChild>
                              <Link
                                href={child.href}
                                className={cn(
                                  'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
                                  pathname === child.href && 'bg-accent text-accent-foreground'
                                )}
                              >
                                <div className="text-sm font-medium leading-none">{child.name}</div>
                                <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                  {child.description}
                                </p>
                              </Link>
                            </NavigationMenuLink>
                          </li>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </>
                ) : (
                  <Link href={item.href} legacyBehavior passHref>
                    <NavigationMenuLink
                      className={cn(
                        'group inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50',
                        pathname === item.href && 'bg-accent text-accent-foreground'
                      )}
                    >
                      {item.name}
                    </NavigationMenuLink>
                  </Link>
                )}
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center space-x-4">
          <Button asChild variant="ghost" className="hidden md:inline-flex">
            <Link href="#" target="_blank" rel="noopener noreferrer">
              <Wallet className="mr-2 h-4 w-4" />
              Connect Wallet
            </Link>
          </Button>

          <Button asChild className="btn-primary hidden sm:inline-flex">
            <Link href="/booking">Book Now</Link>
          </Button>

          {/* Mobile Navigation */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetTitle className="sr-only">Citizen Space Mobile Navigation</SheetTitle>
              <div className="mt-4 flex flex-col space-y-4">
                <Link
                  href="/"
                  className="flex items-center space-x-2 border-b pb-4"
                  onClick={() => setIsOpen(false)}
                >
                  <Coffee className="h-6 w-6 text-cs-blue" />
                  <span className="font-display text-lg font-bold">Citizen Space</span>
                </Link>

                <nav className="flex flex-col space-y-2">
                  {navigation.map(item => (
                    <div key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          'block rounded-md px-2 py-2 text-sm font-medium transition-colors hover:bg-accent',
                          pathname === item.href && 'bg-accent text-accent-foreground'
                        )}
                        onClick={() => setIsOpen(false)}
                      >
                        {item.name}
                      </Link>
                      {item.children && (
                        <div className="ml-4 mt-2 space-y-1">
                          {item.children.map(child => (
                            <Link
                              key={child.name}
                              href={child.href}
                              className={cn(
                                'block rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground',
                                pathname === child.href && 'bg-accent text-accent-foreground'
                              )}
                              onClick={() => setIsOpen(false)}
                            >
                              {child.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </nav>

                <div className="border-t pt-4">
                  <Button asChild variant="outline" className="w-full">
                    <Link
                      href="#"
                      onClick={() => setIsOpen(false)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Wallet className="mr-2 h-4 w-4" />
                      Connect Wallet
                    </Link>
                  </Button>

                  <Button asChild className="btn-primary w-full">
                    <Link href="/booking" onClick={() => setIsOpen(false)}>
                      Book Now
                    </Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
