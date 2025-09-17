import * as Sentry from '@sentry/nextjs';

/**
 * Sentry 서버 설정
 * 
 * 📋 **기능**:
 *   - 서버 사이드 에러 추적
 *   - API 에러 모니터링
 *   - 데이터베이스 에러 추적
 *   - 성능 모니터링
 * 
 * 🔄 **사용법**:
 *   - 자동으로 서버 에러 캐치
 *   - API 라우트에서 에러 추적
 * 
 * ⚠️ **주의사항**:
 *   - 프로덕션 환경에서만 활성화
 *   - 민감한 정보 필터링 필요
 */

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  
  // 환경 설정
  environment: process.env.NODE_ENV,
  
  // 샘플링 설정
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  sampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // 릴리즈 정보
  release: process.env.APP_VERSION || '1.0.0',
  
  // 에러 필터링
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
      
      // 요청 본문에서 민감한 정보 제거
      if (event.request.data) {
        const sensitiveFields = ['password', 'token', 'secret', 'key'];
        sensitiveFields.forEach(field => {
          if (typeof event.request.data === 'object' && field in event.request.data) {
            event.request.data[field] = '***';
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
    // Integrations.Http은 더 이상 사용되지 않음
  ],
  
  // 사용자 컨텍스트 설정
  initialScope: {
    tags: {
      component: 'server',
    },
  },
});


