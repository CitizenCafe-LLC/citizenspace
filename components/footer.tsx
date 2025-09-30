import Link from 'next/link';
import { Coffee, MapPin, Clock, Phone, Mail } from 'lucide-react';

const footerSections = [
  {
    title: 'Spaces',
    links: [
      { name: 'Desks', href: '/workspaces/desks' },
      { name: 'Meeting Rooms', href: '/workspaces/meeting-rooms' },
      { name: 'Communications Pods', href: '/workspaces/communications-pods' },
      { name: 'Membership', href: '/membership' },
    ],
  },
  {
    title: 'Cafe',
    links: [
      { name: 'Menu', href: '/cafe/menu' },
      { name: 'Partners', href: '/cafe/partners' },
      { name: 'Events', href: '/events' },
    ],
  },
  {
    title: 'Company',
    links: [
      { name: 'About', href: '/about' },
      { name: 'Blog', href: '/blog' },
      { name: 'Gallery', href: '/gallery' },
      { name: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Support',
    links: [
      { name: 'FAQ', href: '/faq' },
      { name: 'Location', href: '/location' },
      { name: 'App', href: '/app' },
      { name: 'Terms', href: '/legal/terms' },
      { name: 'Privacy', href: '/legal/privacy' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-muted/30 border-t">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <Coffee className="h-8 w-8 text-cs-blue" />
              <span className="font-display text-xl font-bold">Citizen Space</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4 max-w-sm">
              Where coffee meets power in the heart of Santa Cruz. Part of the global 
              Open Coworking movement, committed to collaboration, openness, community, 
              accessibility, and sustainability.
            </p>
            
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>420 Pacific Ave, Santa Cruz, CA</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Mon-Fri 7am-10pm, Sat-Sun 8am-8pm</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>(831) 295-1482</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>hello@citizenspace.com</span>
              </div>
            </div>
          </div>

          {/* Navigation Sections */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold mb-3">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-8 border-t flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Citizen Space. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-4 sm:mt-0">
            <Link 
              href="/legal/terms" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms
            </Link>
            <Link 
              href="/legal/privacy" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}