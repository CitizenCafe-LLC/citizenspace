"use client";

import { Coffee, Twitter, MessageCircle, Mail } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-cs-espresso text-cs-bg py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Coffee className="h-8 w-8 text-cs-sun" />
              <span className="font-display text-xl font-bold">
                Citizen Space
              </span>
            </div>
            <p className="text-cs-bg/70 text-sm">
              Local people + coffee + power = Work Cafe with community support.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold mb-4">Community</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/events" className="text-cs-bg/70 hover:text-cs-sun transition-colors">
                  Events
                </Link>
              </li>
              <li>
                <Link href="/updates" className="text-cs-bg/70 hover:text-cs-sun transition-colors">
                  Updates
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-cs-bg/70 hover:text-cs-sun transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <a 
                  href="https://discord.gg/citizenspace" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-cs-bg/70 hover:text-cs-sun transition-colors"
                >
                  Discord
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/terms" className="text-cs-bg/70 hover:text-cs-sun transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-cs-bg/70 hover:text-cs-sun transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Connect</h3>
            <div className="flex space-x-4">
              <a 
                href="https://twitter.com/citizenspacesf" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-cs-bg/70 hover:text-cs-sun transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a 
                href="https://discord.gg/citizenspace" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-cs-bg/70 hover:text-cs-sun transition-colors"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
              <a 
                href="mailto:hello@citizenspace.co"
                className="text-cs-bg/70 hover:text-cs-sun transition-colors"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
            <div className="mt-4 text-sm text-cs-bg/70">
              <p>hello@citizenspace.co</p>
              <p>San Francisco, CA</p>
            </div>
          </div>
        </div>

        <div className="border-t border-cs-bg/20 mt-12 pt-8 text-center text-sm text-cs-bg/70">
          <p>&copy; 2025 Citizen Space. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}