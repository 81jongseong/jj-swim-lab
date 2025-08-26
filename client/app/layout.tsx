import React, { ReactNode } from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/hooks/useAuth'
import SimpleNavigation from '../components/SimpleNavigation'
import TopNavigation from '../components/TopNavigation'
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
    google: 'your-google-verification-code',
  },
  // PWA 메타 태그
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'JJ Swim Lab',
  },
  applicationName: 'JJ Swim Lab',
  referrer: 'origin-when-cross-origin',
  category: 'education',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        {/* PWA 메타 태그 */}
        <meta name="application-name" content="JJ Swim Lab" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="JJ Swim Lab" />
        <meta name="description" content="수영 교육을 위한 AI 기반 학습 플랫폼" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#3b82f6" />
        
        {/* PWA 아이콘 */}
        <link rel="apple-touch-icon" href="/icons/apple-icon-180.png" />
        <link rel="icon" type="image/png" sizes="196x196" href="/icons/favicon-196.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/manifest-icon-192.maskable.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icons/manifest-icon-512.maskable.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="shortcut icon" href="/favicon.ico" />
        
        {/* PWA 스플래시 스크린 */}
        <link rel="apple-touch-startup-image" href="/splash/apple-splash-2048-2732.png" media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" />
        <link rel="apple-touch-startup-image" href="/splash/apple-splash-1668-2388.png" media="(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" />
        <link rel="apple-touch-startup-image" href="/splash/apple-splash-1536-2048.png" media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" />
        <link rel="apple-touch-startup-image" href="/splash/apple-splash-1125-2436.png" media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" />
        <link rel="apple-touch-startup-image" href="/splash/apple-splash-750-1334.png" media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" />
        <link rel="apple-touch-startup-image" href="/splash/apple-splash-640-1136.png" media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <TopNavigation />
          <main>
            {children}
          </main>
          {/* <EnhancedOfflineIndicator /> */}
          {/* <PWAInstallPrompt /> */}
          {/* <ServiceWorkerRegistration /> */}
        </AuthProvider>
      </body>
    </html>
  )
}
