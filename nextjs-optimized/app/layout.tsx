import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
})

const poppins = Poppins({ 
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap'
})

export const metadata: Metadata = {
  title: {
    default: 'Santos Cleaning Solutions: Professional House Cleaning Services | Marietta & Atlanta GA',
    template: '%s | Santos Cleaning Solutions'
  },
  description: 'Professional house cleaning services in Marietta, Buckhead & Atlanta. Licensed, insured, family-owned since 2015. Deep cleaning, regular maintenance, move-in/out. Free estimates. ⭐ 5-star rated.',
  keywords: ['house cleaning marietta ga', 'cleaning services buckhead atlanta', 'hamod cleaning', 'deep cleaning sandy springs', 'move in out cleaning', 'residential cleaning atlanta metro', 'professional cleaning services georgia', 'licensed cleaning company', 'insured house cleaning', 'family owned cleaning business'],
  authors: [{ name: 'Santos Cleaning Solutions LLC' }],
  creator: 'Santos Cleaning Solutions LLC',
  publisher: 'Santos Cleaning Solutions LLC',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://santoscsolutions.com'),
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/en-US',
      'es-US': '/es-US', 
      'pt-BR': '/pt-BR'
    }
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://santoscsolutions.com',
    siteName: 'Santos Cleaning Solutions',
    title: 'House Cleaning Marietta GA | Buckhead Atlanta | Santos Cleaning',
    description: 'Premium house cleaning in Marietta & Buckhead. Licensed & insured. Deep cleaning, move-in/out, regular maintenance. Get free estimate!',
    images: [
      {
        url: '/images/og-image-home.jpg',
        width: 1200,
        height: 630,
        alt: 'Santos Cleaning Solutions - Professional House Cleaning in Marietta, GA'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    site: '@SantosCleaning',
    creator: '@SantosCleaning',
    title: 'House Cleaning Marietta GA | Buckhead Atlanta | Santos Cleaning',
    description: 'Premium house cleaning in Marietta & Buckhead. Licensed & insured. Deep cleaning, move-in/out, regular maintenance. Get free estimate!',
    images: ['/images/twitter-card-home.jpg']
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#3B82F6" />
      </head>
      <body className={`${inter.className} antialiased bg-white text-gray-900`}>
        {children}
      </body>
    </html>
  )
}