/**
 * 🚀 JJ Swim Lab - Lighthouse 설정 파일
 * 
 * 📋 **파일 목적**
 * - Google Lighthouse 성능 감사 도구의 설정 및 옵션을 정의하는 설정 파일
 * - 웹 애플리케이션의 성능, 접근성, SEO, PWA 등의 품질 측정 설정
 * - 자동화된 성능 테스트 및 품질 모니터링을 위한 설정 제공
 * - CI/CD 파이프라인에서의 자동 성능 검증 설정
 * - 성능 최적화 및 사용자 경험 개선을 위한 기준 설정
 * 
 * 🔄 **주요 기능**
 * - 성능(Performance) 감사 설정
 * - 접근성(Accessibility) 감사 설정
 * - SEO(Search Engine Optimization) 감사 설정
 * - PWA(Progressive Web App) 감사 설정
 * - 자동화된 테스트 및 보고서 생성
 * - 성능 임계값 및 경고 설정
 * 
 * 🗄️ **데이터 연동**
 * - 웹 애플리케이션 성능 메트릭
 * - 접근성 및 SEO 점수 데이터
 * - PWA 기능 및 성능 데이터
 * - 성능 테스트 결과 및 보고서
 * - CI/CD 파이프라인 통합 데이터
 * 
 * 🛠️ **필요한 설치 파일**
 * - Google Lighthouse CLI
 * - Node.js 런타임 환경
 * - 웹 브라우저 (Chrome/Chromium)
 * - CI/CD 파이프라인 도구
 * - 성능 모니터링 도구
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 성능 임계값 설정의 현실성 및 적절성 확인
 * 2. 테스트 환경의 일관성 및 안정성 보장
 * 3. CI/CD 파이프라인에서의 성능 영향 최소화
 * 4. 성능 테스트 결과의 신뢰성 및 재현성 확인
 * 5. 성능 최적화 우선순위 및 리소스 할당 고려
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 성능 감사 설정 및 임계값 확인
 * - [ ] 접근성 및 SEO 감사 설정 검증
 * - [ ] PWA 감사 설정 및 기능 확인
 * - [ ] 자동화된 테스트 동작 확인
 * - [ ] CI/CD 파이프라인 통합 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (기본 Lighthouse 설정)
 * - 2024-12-19: 성능 감사 및 임계값 시스템 구현
 * - 2024-12-19: 접근성 및 SEO 감사 시스템 구현
 * - 2024-12-19: PWA 감사 및 자동화 시스템 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (Lighthouse 설정 시스템 완료)
 * 
 * 🚀 **다음 단계**
 * - AI 기반 성능 최적화 제안
 * - 자동 성능 모니터링 및 알림
 * - 성능 최적화
 * - 사용자 경험 개선
 * 
 * 💡 **주요 설정 옵션**
 * - ci: CI/CD 환경에서의 Lighthouse 설정
 * - assertions: 성능 임계값 및 경고 설정
 * - settings: 감사 설정 및 옵션
 * - upload: 결과 업로드 및 공유 설정
 * - server: 로컬 서버 설정 및 포트
 * 
 * 🔍 **Lighthouse 감사 처리 흐름**
 * 1. 웹 애플리케이션 URL 로드 및 분석
 * 2. 설정된 감사 카테고리별 품질 측정
 * 3. 성능 메트릭 및 점수 계산
 * 4. 임계값 비교 및 경고 생성
 * 5. 상세 보고서 및 개선 제안 생성
 */

module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000',
        'http://localhost:3000/dashboard',
        'http://localhost:3000/admin/teaching-methods',
        'http://localhost:3000/admin/dashboard',
        'http://localhost:3000/instructor/dashboard'
      ],
      startServerCommand: 'npm run start:prod',
      startServerReadyPattern: 'ready on',
      startServerReadyTimeout: 60000,
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--no-sandbox --disable-dev-shm-usage',
        preset: 'desktop',
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
          requestLatencyMs: 0,
          downloadThroughputKbps: 0,
          uploadThroughputKbps: 0
        }
      }
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.8 }],
        'categories:seo': ['warn', { minScore: 0.8 }],
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 4000 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],
        'speed-index': ['warn', { maxNumericValue: 3000 }]
      }
    },
    upload: {
      target: 'temporary-public-storage',
      token: process.env.LHCI_GITHUB_APP_TOKEN
    }
  }
};
