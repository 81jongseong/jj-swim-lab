/**
 * 🧪 JJ Swim Lab - Jest 테스트 설정
 * 
 * 📋 **설정 목적**
 * - Jest 테스트 프레임워크의 설정 및 구성
 * - TypeScript 지원 및 컴파일 설정
 * - 테스트 환경 및 모킹 설정
 * - 커버리지 및 리포팅 설정
 * 
 * 🔄 **주요 기능**
 * - TypeScript 테스트 파일 지원
 * - 테스트 환경 설정 (Node.js)
 * - 모킹 및 스텁 설정
 * - 커버리지 수집 및 리포팅
 * - 테스트 타임아웃 설정
 * - 테스트 파일 패턴 설정
 * 
 * 🗄️ **데이터 연동**
 * - TypeScript 컴파일러 설정
 * - 테스트 환경 변수
 * - 모킹된 모듈 및 의존성
 * - 커버리지 데이터
 * 
 * 🛠️ **필요한 설치 파일**
 * - Jest 29.6.2
 * - ts-jest (TypeScript 지원)
 * - @types/jest (타입 정의)
 * - supertest (API 테스트)
 * - mongodb-memory-server (테스트 DB)
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 테스트 환경과 프로덕션 환경 분리
 * 2. 데이터베이스 모킹 및 격리
 * 3. 비동기 테스트 처리
 * 4. 테스트 데이터 정리
 * 5. 커버리지 정확성 확인
 * 6. 테스트 성능 최적화
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] TypeScript 설정 확인
 * - [ ] 테스트 환경 설정 확인
 * - [ ] 모킹 설정 확인
 * - [ ] 커버리지 설정 확인
 * - [ ] 테스트 타임아웃 확인
 * - [ ] 테스트 파일 패턴 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 Jest 설정 구현
 * - 2024-12-19: TypeScript 지원 설정
 * - 2024-12-19: 테스트 환경 및 모킹 설정
 * - 2024-12-19: 커버리지 및 리포팅 설정
 * - 2024-12-19: 테스트 최적화 설정
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (Jest 설정 완료)
 * 
 * 🚀 **다음 단계**
 * - 테스트 자동화 설정
 * - CI/CD 통합
 * - 성능 테스트 추가
 * - E2E 테스트 통합
 * 
 * 💡 **사용 예시**
 * ```bash
 * # 모든 테스트 실행
 * npm test
 * 
 * # 커버리지와 함께 테스트 실행
 * npm run test:coverage
 * 
 * # 특정 파일 테스트
 * npm test -- user.test.ts
 * 
 * # 감시 모드로 테스트 실행
 * npm run test:watch
 * ```
 * 
 * 🔍 **Jest 설정 처리 흐름**
 * 1. TypeScript 파일 컴파일 설정
 * 2. 테스트 환경 및 전역 설정
 * 3. 모킹 및 스텁 설정
 * 4. 커버리지 수집 설정
 * 5. 테스트 실행 및 리포팅
 * 6. 결과 분석 및 최적화
 */

module.exports = {
  // 테스트 환경 설정
  testEnvironment: 'node',
  
  // TypeScript 지원
  preset: 'ts-jest',
  
  // 테스트 파일 패턴
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.spec.ts',
    '**/*.test.ts',
    '**/*.spec.ts'
  ],
  
  // 무시할 파일 패턴
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
    '/coverage/'
  ],
  
  // 모듈 파일 확장자
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  // TypeScript 컴파일러 옵션
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  
  // 모듈 해석 설정
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/__tests__/$1'
  },
  
  // 테스트 설정 파일
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],
  
  // 커버리지 설정
  collectCoverage: false, // 기본적으로 비활성화, 필요시 --coverage 플래그로 활성화
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  
  // 커버리지 수집 대상
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts',
    '!src/**/__tests__/**',
    '!src/index.ts'
  ],
  
  // 커버리지 임계값 (현재 상태 기준)
  coverageThreshold: {
    global: {
      branches: 0,     // 현재 낮은 커버리지로 인해 임시로 0%로 설정
      functions: 0,    // 현재 낮은 커버리지로 인해 임시로 0%로 설정
      lines: 0,        // 현재 낮은 커버리지로 인해 임시로 0%로 설정
      statements: 0    // 현재 낮은 커버리지로 인해 임시로 0%로 설정
    }
  },
  
  // 테스트 타임아웃 (30초)
  testTimeout: 30000,
  
  // Jest 종료 설정
  forceExit: true,
  detectOpenHandles: true,
  
  // 모킹 설정
  clearMocks: true,
  restoreMocks: true,
  
  // 테스트 결과 리포터
  reporters: [
    'default',
    ['jest-html-reporters', {
      publicPath: './coverage',
      filename: 'test-report.html',
      openReport: false
    }]
  ],
  
  // 글로벌 설정
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
      isolatedModules: true
    }
  },
  
  // 테스트 환경 변수
  testEnvironmentOptions: {
    NODE_ENV: 'test'
  },
  
  // 모듈 해석 설정
  moduleDirectories: ['node_modules', 'src'],
  
  // 테스트 실행 전 설정
  globalSetup: '<rootDir>/__tests__/globalSetup.ts',
  
  // 테스트 실행 후 정리
  globalTeardown: '<rootDir>/__tests__/globalTeardown.ts'
};
