import React, { ReactNode } from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from 'hooks/useAuth'
import Navigation from '../components/Navigation'
// import EnhancedOfflineIndicator from '../components/EnhancedOfflineIndicator'
// import PWAInstallPrompt from '../components/PWAInstallPrompt'
// import ServiceWorkerRegistration from './sw-register'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#3b82f6',
  colorScheme: 'light',
};

export const metadata: Metadata = {
  title: 'JJ Swim Lab - AI 기반 수영 교육 플랫폼',
  description: '수영 교육을 위한 AI 기반 학습 플랫폼. 실시간 자세 분석, 개인화된 학습 계획, 진도 추적을 제공합니다.',
  keywords: '수영, 교육, AI, 자세 분석, 학습 플랫폼, 수영장',
  authors: [{ name: 'JJ Swim Lab Team' }],
  creator: 'JJ Swim Lab',
  publisher: 'JJ Swim Lab',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://jj-swim-lab.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'JJ Swim Lab - AI 기반 수영 교육 플랫폼',
    description: '수영 교육을 위한 AI 기반 학습 플랫폼',
    url: 'https://jj-swim-lab.vercel.app',
    siteName: 'JJ Swim Lab',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'JJ Swim Lab',
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JJ Swim Lab - AI 기반 수영 교육 플랫폼',
    description: '수영 교육을 위한 AI 기반 학습 플랫폼',
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
};

interface RootLayoutProps {
  children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ko" suppressHydrationWarning className="h-full">
      <body className={`${inter.className} bg-background text-foreground antialiased h-full`} suppressHydrationWarning>
        <AuthProvider>
          {/* 통합 네비게이션 시스템 */}
          <Navigation />
          
          {/* 메인 콘텐츠 */}
          <main className="min-h-screen">
            {children}
          </main>
          
          {/* PWA 및 오프라인 기능 (임시 비활성화) */}
          {/* <EnhancedOfflineIndicator /> */}
          {/* <PWAInstallPrompt /> */}
          {/* <ServiceWorkerRegistration /> */}
        </AuthProvider>
      </body>
    </html>
  )
}