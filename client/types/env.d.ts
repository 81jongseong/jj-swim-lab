/**
 * ✅ JJ Swim Lab - 환경 변수 타입 정의
 * 
 * 📋 **목적**
 * - 환경 변수의 타입 안전성 보장
 * - Next.js 환경 변수 자동완성 지원
 * - 런타임 에러 방지
 */

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // API 설정
      NEXT_PUBLIC_API_URL: string;
      
      // 환경 설정
      NODE_ENV: 'development' | 'production' | 'test';
      
      // 앱 설정
      NEXT_PUBLIC_APP_NAME: string;
      NEXT_PUBLIC_APP_VERSION: string;
      
      // 기능 플래그
      NEXT_PUBLIC_ENABLE_ANALYTICS: string;
      NEXT_PUBLIC_ENABLE_PWA: string;
      NEXT_PUBLIC_ENABLE_OFFLINE: string;
      
      // 디버그 설정
      NEXT_PUBLIC_DEBUG_MODE: string;
    }
  }
}

export {};

