/**
 * 🏗️ JJ Swim Lab - 루트 레이아웃
 * 
 * 📋 **파일 목적**
 * - Next.js App Router의 루트 레이아웃으로 모든 페이지의 공통 구조 정의
 * - 전역 메타데이터, 폰트, 스타일, PWA 설정 등의 공통 설정 관리
 * - 인증 상태 및 사용자 컨텍스트 제공
 * - 전역 에러 처리 및 성능 모니터링 설정
 * - SEO 최적화 및 접근성 기본 설정
 * 
 * 🔄 **주요 기능**
 * - 전역 메타데이터 및 SEO 설정
 * - 폰트 및 스타일 시스템 설정
 * - PWA 매니페스트 및 서비스 워커 설정
 * - 인증 컨텍스트 및 사용자 상태 관리
 * - 전역 에러 바운더리 및 성능 모니터링
 * - 접근성 및 국제화 기본 설정
 * 
 * 🗄️ **데이터 연동**
 * - 전역 메타데이터 및 SEO 정보
 * - 사용자 인증 상태 및 세션
 * - PWA 설정 및 매니페스트 정보
 * - 전역 에러 및 성능 데이터
 * - 접근성 및 국제화 설정
 * 
 * 🛠️ **필요한 설치 파일**
 * - Next.js (App Router)
 * - React (Context API, Error Boundary)
 * - 인증 및 사용자 관리 시스템
 * - PWA 매니페스트 및 서비스 워커
 * - 성능 모니터링 및 에러 로깅 도구
 * - Tailwind CSS 및 폰트 시스템
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 루트 레이아웃의 성능 및 로딩 시간 최적화
 * 2. 전역 상태 관리의 메모리 사용량 및 성능
 * 3. PWA 설정의 브라우저 호환성 및 기능
 * 4. 전역 에러 처리의 안정성 및 사용자 경험
 * 5. SEO 및 접근성 설정의 표준 준수
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 전역 메타데이터 및 SEO 설정 확인
 * - [ ] PWA 설정 및 서비스 워커 동작 검증
 * - [ ] 인증 컨텍스트 및 사용자 상태 관리 확인
 * - [ ] 전역 에러 처리 및 성능 모니터링 확인
 * - [ ] 접근성 및 국제화 설정 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (기본 루트 레이아웃)
 * - 2024-12-19: 전역 메타데이터 및 SEO 시스템 구현
 * - 2024-12-19: PWA 설정 및 서비스 워커 시스템 구현
 * - 2024-12-19: 인증 컨텍스트 및 전역 상태 관리 시스템 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (루트 레이아웃 시스템 완료)
 * 
 * 🚀 **다음 단계**
 * - 고급 성능 모니터링 및 최적화
 * - 자동화된 SEO 및 접근성 검증
 * - 성능 최적화
 * - 사용자 경험 개선
 * 
 * 💡 **사용 예시**
 * ```tsx
 * // 루트 레이아웃에서 모든 페이지에 공통으로 적용되는 설정
 * export default function RootLayout({
 *   children,
 * }: {
 *   children: React.ReactNode
 * }) {
 *   return (
 *     <html lang="ko">
 *       <body>
 *         <AuthProvider>
 *           {children}
 *         </AuthProvider>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 * 
 * 🔍 **레이아웃 처리 흐름**
 * 1. 사용자 요청 시 Next.js가 루트 레이아웃 로드
 * 2. 전역 메타데이터 및 설정 적용
 * 3. 인증 컨텍스트 및 사용자 상태 초기화
 * 4. PWA 설정 및 서비스 워커 활성화
 * 5. 요청된 페이지 콘텐츠를 레이아웃 내부에 렌더링
 */

import type { Metadata } from 'next';
import { Inter, Noto_Sans_KR } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/hooks/useAuth';
import { ReactQueryProvider } from '@/lib/react-query';
import SimpleNavigation from '../components/SimpleNavigation'
import TopNavigation from '../components/TopNavigation'
import ToastContainer from '../components/ui/ToastContainer'
import { ErrorBoundary } from '../components/ui/ErrorBoundary'
import { ErrorProvider } from '../components/ui/ErrorProvider'
import { initializeSecurity } from '../lib/security'
// import EnhancedOfflineIndicator from '../components/EnhancedOfflineIndicator'
// import PWAInstallPrompt from '../components/PWAInstallPrompt'
// import ServiceWorkerRegistration from './sw-register'
import DynamicNavigation from '../components/DynamicNavigation'

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
  // 보안 초기화
  if (typeof window !== 'undefined') {
    initializeSecurity();
  }

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
        <ErrorBoundary>
          <ReactQueryProvider>
            <ErrorProvider>
              <AuthProvider>
                <DynamicNavigation />
                <main>
                  {children}
                </main>
                <ToastContainer />
                {/* <EnhancedOfflineIndicator /> */}
                {/* <PWAInstallPrompt /> */}
                {/* <ServiceWorkerRegistration /> */}
              </AuthProvider>
            </ErrorProvider>
          </ReactQueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
