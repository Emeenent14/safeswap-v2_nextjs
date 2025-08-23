'use client'

import React from 'react'
import Link from 'next/link'
import { Shield, Mail, Phone, MapPin, Twitter, Facebook, Linkedin, Github } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface FooterProps {
  className?: string
  variant?: 'default' | 'minimal'
}

export default function Footer({ className, variant = 'default' }: FooterProps) {
  const currentYear = new Date().getFullYear()

  if (variant === 'minimal') {
    return (
      <footer className={cn(
        "border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className
      )}>
        <div className="container py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-semibold">SafeSwap</span>
            </div>
            <p className="text-sm text-muted-foreground text-center sm:text-right">
              © {currentYear} SafeSwap. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    )
  }

  return (
    <footer className={cn(
      "border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      className
    )}>
      <div className="container px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">SafeSwap</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Secure escrow platform for safe online transactions. Building trust in digital commerce.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>support@safeswap.com</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>San Francisco, CA</span>
              </div>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-4">
            <h3 className="font-semibold">Product</h3>
            <div className="space-y-2">
              <Link href="/dashboard" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Dashboard
              </Link>
              <Link href="/dashboard/deals" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Deals
              </Link>
              <Link href="/dashboard/savings" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Savings
              </Link>
              <Link href="/dashboard/transactions" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Transactions
              </Link>
              <Link href="/dashboard/disputes" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Disputes
              </Link>
            </div>
          </div>

          {/* Support Links */}
          <div className="space-y-4">
            <h3 className="font-semibold">Support</h3>
            <div className="space-y-2">
              <Link href="/help" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Help Center
              </Link>
              <Link href="/contact" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Contact Us
              </Link>
              <Link href="/faq" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                FAQ
              </Link>
              <Link href="/security" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Security
              </Link>
              <Link href="/status" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                System Status
              </Link>
            </div>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="font-semibold">Stay Updated</h3>
            <p className="text-sm text-muted-foreground">
              Get the latest updates on new features and security improvements.
            </p>
            <div className="space-y-2">
              <div className="flex space-x-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1"
                />
                <Button type="submit" size="sm">
                  Subscribe
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                By subscribing, you agree to our privacy policy.
              </p>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {currentYear} SafeSwap. All rights reserved.
            </p>
            <div className="flex items-center space-x-4">
              <Link href="/legal/privacy" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link href="/legal/terms" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </Link>
              <Link href="/legal/cookies" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Cookies
              </Link>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Twitter className="h-4 w-4" />
              <span className="sr-only">Twitter</span>
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Facebook className="h-4 w-4" />
              <span className="sr-only">Facebook</span>
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Linkedin className="h-4 w-4" />
              <span className="sr-only">LinkedIn</span>
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Github className="h-4 w-4" />
              <span className="sr-only">GitHub</span>
            </Button>
          </div>
        </div>
      </div>
    </footer>
  )
}