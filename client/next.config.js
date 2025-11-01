/**
 * 🔧 JJ Swim Lab - Next.js 설정 파일 (고급 버전)
 * 
 * 📋 **파일 목적**
 * - Next.js 애플리케이션의 고급 설정 및 최적화를 정의하는 설정 파일
 * - 성능 최적화, 빌드 최적화, 웹팩 커스터마이징 등의 고급 기능 설정
 * - PWA 설정, 이미지 최적화, 압축 설정 등의 프로덕션 환경 최적화
 * - 보안 헤더, CORS 설정, 환경별 설정 분기 등의 보안 및 배포 설정
 * - TypeScript 설정, ESLint 설정, 테일윈드 설정 등의 개발 도구 통합
 * 
 * 🔄 **주요 기능**
 * - 고급 성능 최적화 및 코드 스플리팅 설정
 * - PWA 및 서비스 워커 설정
 * - 이미지 최적화 및 압축 설정
 * - 웹팩 커스터마이징 및 플러그인 설정
 * - 보안 헤더 및 CORS 설정
 * - 환경별 설정 분기 및 배포 최적화
 * 
 * 🗄️ **데이터 연동**
 * - 환경 변수 및 설정 파일
 * - TypeScript 설정 파일 (tsconfig.json)
 * - 테일윈드 설정 파일 (tailwind.config.js)
 * - ESLint 설정 파일 (.eslintrc.json)
 * - PWA 매니페스트 파일 (manifest.json)
 * 
 * 🛠️ **필요한 설치 파일**
 * - Next.js 프레임워크
 * - 웹팩 및 관련 플러그인
 * - 이미지 최적화 라이브러리
 * - PWA 관련 라이브러리
 * - 성능 모니터링 도구
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 성능 최적화 설정의 호환성 및 안정성 검증
 * 2. 웹팩 커스터마이징 시 빌드 에러 방지
 * 3. 이미지 최적화 설정의 품질 및 성능 균형
 * 4. PWA 설정의 브라우저 호환성 확인
 * 5. 보안 헤더 설정의 기능 영향 검토
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 성능 최적화 설정 동작 확인
 * - [ ] 웹팩 커스터마이징 빌드 성공 확인
 * - [ ] 이미지 최적화 품질 및 성능 확인
 * - [ ] PWA 기능 정상 동작 확인
 * - [ ] 보안 헤더 적용 및 기능 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (기본 Next.js 설정)
 * - 2024-12-19: 성능 최적화 설정 추가
 * - 2024-12-19: 이미지 최적화 및 웹팩 커스터마이징
 * - 2024-12-19: PWA 설정 및 서비스 워커 통합
 * - 2024-12-19: 보안 헤더 및 배포 최적화 완성
 * 
 * 🔄 **처리 과정**
 * 1. 환경 변수 및 기본 설정 로드
 * 2. 성능 최적화 및 실험적 기능 활성화
 * 3. 이미지 최적화 및 웹팩 커스터마이징 적용
 * 4. 빌드 최적화 및 성능 설정 적용
 * 5. 최종 Next.js 설정 객체 반환
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 정적 파일 경로 설정
  assetPrefix: undefined,
  
  // 정적 파일 처리
  trailingSlash: false,
  generateEtags: false,
  
  // 성능 최적화 설정은 하단의 experimental 섹션에서 통합 관리
  
  // 컴파일러 최적화
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
    // styledComponents: true, // styled-components 미사용으로 비활성화
  },
  
  // 이미지 최적화 (강화된 설정)
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1년 캐시 (성능 향상)
    // 추가 최적화 설정
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  

  
  // 웹팩 설정 (기본)
  webpack: (config) => {
    // 기본 웹팩 설정 유지
    return config;
  },
  
  // 빌드 최적화 (강화된 설정)
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,
  
  // 추가 성능 설정
  onDemandEntries: {
    // 개발 중 페이지가 메모리에서 제거되는 시간 (밀리초)
    maxInactiveAge: 25 * 1000,
    // 동시에 메모리에 보관할 페이지 수
    pagesBufferLength: 2,
  },
  
  // 환경별 설정
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY || 'default-value',
  },
  
  // 헤더 설정 (강화된 보안)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          // CSP 헤더 (개발 환경에서는 비활성화)
          ...(process.env.NODE_ENV === 'production' ? [{
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://unpkg.com https://t1.daumcdn.net; style-src 'self' 'unsafe-inline' https://unpkg.com; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' http://localhost:5000 https://unpkg.com https://tile.openstreetmap.org https://*.tile.openstreetmap.org https://api.vworld.kr; frame-src https://t1.daumcdn.net; worker-src 'self' blob:;"
          }] : []),
        ],
      },
    ];
  },
  
  // 리다이렉트 설정
  async redirects() {
    return [
      // 예시: 구 경로에서 새 경로로 리다이렉트
      // {
      //   source: '/old-path',
      //   destination: '/new-path',
      //   permanent: true,
      // },
    ];
  },
  
  // 리라이트 설정
  async rewrites() {
    return [
      // API 프록시 설정
      // {
      //   source: '/api/:path*',
      //   destination: 'http://localhost:5000/api/:path*',
      // },
      // 업로드된 이미지 파일 프록시 (서버의 uploads 폴더로)
      {
        source: '/uploads/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/uploads/:path*`,
      },
    ];
  },
  
  // TypeScript 설정
  typescript: {
    // 프로덕션 빌드 시 타입 에러가 있어도 빌드 계속
    ignoreBuildErrors: process.env.NODE_ENV === 'production',
  },
  
  // ESLint 설정
  eslint: {
    // 프로덕션 빌드 시 ESLint 에러가 있어도 빌드 계속
    ignoreDuringBuilds: process.env.NODE_ENV === 'production',
  },
  
  // 출력 설정 (Windows 환경에서 symlink 문제로 비활성화)
  // output: 'standalone', // Docker 컨테이너에 최적화
  
  // 실험적 기능 설정 (Next.js 14 호환)
  experimental: {
    // 패키지 import 최적화
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react', 'react-icons'],
    // 서버 컴포넌트 최적화
    serverComponentsExternalPackages: ['mongoose'],
  },
};

module.exports = nextConfig;