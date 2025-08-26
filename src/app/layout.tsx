import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    template: '%s | SafeSwap',
    default: 'SafeSwap — The Trust Layer for Online Deals'
  },
  description: 'Escrow + trust profiles for freelancers, buyers, and sellers. SafeSwap secures your digital transactions until both sides deliver.',
  keywords: 'escrow, secure payments, trust layer, online deals, digital transactions, safe payments, freelancers, cross-border trade',
  authors: [{ name: 'SafeSwap Team' }],
  creator: 'SafeSwap',
  publisher: 'SafeSwap',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'SafeSwap — The Trust Layer for Online Deals',
    description: 'Escrow + trust profiles for freelancers, buyers, and sellers. SafeSwap secures your digital transactions until both sides deliver.',
    url: '/',
    siteName: 'SafeSwap',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SafeSwap - PayPal for Trust',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SafeSwap — The Trust Layer for Online Deals',
    description: 'Escrow + trust profiles for freelancers, buyers, and sellers. SafeSwap secures your digital transactions until both sides deliver.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  alternates: {
    canonical: '/',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={cn(
        inter.className,
        "min-h-screen bg-background font-sans antialiased"
      )}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}