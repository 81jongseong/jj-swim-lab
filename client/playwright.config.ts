import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E 테스트 설정
 * 
 * 이 설정은 다음을 포함합니다:
 * - 다중 브라우저 테스트 (Chromium, Firefox, WebKit)
 * - 병렬 테스트 실행
 * - 스크린샷 및 비디오 녹화
 * - 테스트 실패 시 디버깅 정보 수집
 * - CI/CD 환경을 위한 설정
 */

export default defineConfig({
  // 테스트 파일 위치
  testDir: './e2e',
  
  // 테스트 실행 옵션
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  // 리포터 설정
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }]
  ],
  
  // 전역 테스트 설정
  use: {
    // 기본 URL (개발 서버)
    baseURL: 'http://localhost:3000',
    
    // 브라우저 컨텍스트 옵션
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // 네트워크 설정
    actionTimeout: 10000,
    navigationTimeout: 30000,
    
    // 접근성 테스트를 위한 설정
    colorScheme: 'light',
    locale: 'ko-KR',
    timezoneId: 'Asia/Seoul',
  },

  // 프로젝트별 브라우저 설정
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // 모바일 테스트
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // 웹 서버 설정 (개발 서버가 실행되지 않은 경우)
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});



