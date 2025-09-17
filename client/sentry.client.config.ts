import * as Sentry from '@sentry/nextjs';

/**
 * Sentry 클라이언트 설정
 * 
 * 📋 **기능**:
 *   - 클라이언트 사이드 에러 추적
 *   - 성능 모니터링
 *   - 사용자 피드백 수집
 *   - 릴리즈 추적
 * 
 * 🔄 **사용법**:
 *   - 자동으로 에러 캐치 및 전송
 *   - 수동 에러 리포팅 가능
 * 
 * ⚠️ **주의사항**:
 *   - 프로덕션 환경에서만 활성화
 *   - 민감한 정보 필터링 필요
 */

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // 환경 설정
  environment: process.env.NODE_ENV,
  
  // 샘플링 설정 (성능 모니터링)
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // 에러 샘플링 설정
  sampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // 릴리즈 정보
  release: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  
  // 사용자 정보 설정
  beforeSend(event) {
    // 민감한 정보 필터링
    if (event.request) {
      // URL에서 민감한 정보 제거
      if (event.request.url) {
        event.request.url = event.request.url.replace(/password=[^&]*/g, 'password=***');
        event.request.url = event.request.url.replace(/token=[^&]*/g, 'token=***');
      }
      
      // 헤더에서 민감한 정보 제거
      if (event.request.headers) {
        const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
        sensitiveHeaders.forEach(header => {
          if (event.request.headers[header]) {
            event.request.headers[header] = '***';
          }
        });
      }
    }
    
    // 스택 트레이스에서 민감한 정보 제거
    if (event.exception) {
      event.exception.values?.forEach(exception => {
        if (exception.stacktrace) {
          exception.stacktrace.frames?.forEach(frame => {
            if (frame.filename) {
              frame.filename = frame.filename.replace(/\/[^\/]*\/[^\/]*\//g, '/***/');
            }
          });
        }
      });
    }
    
    return event;
  },
  
  // 성능 모니터링 설정
  integrations: [
    // BrowserTracing은 더 이상 사용되지 않음
  ],
  
  // 에러 필터링
  beforeBreadcrumb(breadcrumb) {
    // 민감한 정보가 포함된 breadcrumb 제거
    if (breadcrumb.category === 'http' && breadcrumb.data) {
      const sensitiveData = ['password', 'token', 'key', 'secret'];
      sensitiveData.forEach(key => {
        if (breadcrumb.data && typeof breadcrumb.data === 'object' && key in breadcrumb.data) {
          breadcrumb.data[key] = '***';
        }
      });
    }
    return breadcrumb;
  },
  
  // 사용자 컨텍스트 설정
  initialScope: {
    tags: {
      component: 'client',
    },
  },
});

// 전역 에러 핸들러
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    Sentry.captureException(event.reason);
  });
  
  window.addEventListener('error', (event) => {
    Sentry.captureException(event.error);
  });
}


