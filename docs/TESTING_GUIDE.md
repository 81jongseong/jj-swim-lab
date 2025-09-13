# JJ Swim Lab 테스트 가이드

이 문서는 JJ Swim Lab 프로젝트의 포괄적인 테스트 전략과 실행 방법을 설명합니다.

## 📋 목차

1. [테스트 개요](#테스트-개요)
2. [테스트 종류](#테스트-종류)
3. [빠른 시작](#빠른-시작)
4. [상세 가이드](#상세-가이드)
5. [성능 최적화](#성능-최적화)
6. [CI/CD 통합](#cicd-통합)
7. [문제 해결](#문제-해결)
8. [모범 사례](#모범-사례)

## 🎯 테스트 개요

JJ Swim Lab은 다음과 같은 다층 테스트 전략을 사용합니다:

- **단위 테스트 (Unit Tests)**: 개별 함수와 컴포넌트 테스트
- **통합 테스트 (Integration Tests)**: API 엔드포인트와 데이터베이스 연동 테스트
- **E2E 테스트 (End-to-End Tests)**: 실제 브라우저에서 전체 워크플로우 테스트
- **성능 테스트 (Performance Tests)**: 응답 시간과 리소스 사용량 테스트
- **접근성 테스트 (Accessibility Tests)**: WCAG 2.1 AA 준수 테스트

## 🧪 테스트 종류

### 1. 단위 테스트

**서버 테스트**
- 라우트 핸들러 테스트
- 미들웨어 테스트
- 모델 검증 테스트
- 유틸리티 함수 테스트

**클라이언트 테스트**
- React 컴포넌트 테스트
- 커스텀 훅 테스트
- API 클라이언트 테스트
- 유틸리티 함수 테스트

### 2. 통합 테스트

- API 엔드포인트 간 상호작용
- 데이터베이스 연동 테스트
- 인증/인가 플로우 테스트
- 외부 서비스 연동 테스트

### 3. E2E 테스트

- 사용자 시나리오 테스트
- 크로스 브라우저 테스트
- 모바일 반응형 테스트
- 실제 데이터 플로우 테스트

### 4. 성능 테스트

- 페이지 로드 시간 측정
- API 응답 시간 테스트
- 메모리 사용량 모니터링
- 동시 사용자 처리 능력 테스트

### 5. 접근성 테스트

- 키보드 네비게이션 테스트
- 스크린 리더 호환성 테스트
- 색상 대비 검증
- ARIA 속성 검증

## 🚀 빠른 시작

### 한 번에 모든 테스트 실행

```bash
# 루트 디렉토리에서 실행
npm run test:quick    # 빠른 테스트 (서버 + 클라이언트 단위 테스트)
npm run test:full     # 전체 테스트 (모든 종류의 테스트)
npm run test:performance # 성능 테스트 및 최적화
```

### 개별 테스트 실행

```bash
# 서버 테스트만
npm run test:server

# 클라이언트 테스트만  
npm run test:client

# E2E 테스트만
npm run test:e2e

# 통합 테스트만
npm run test:integration
```

## 📖 상세 가이드

### 서버 테스트 실행

```bash
cd server

# 모든 테스트 실행
npm test

# 감시 모드 (파일 변경 시 자동 재실행)
npm run test:watch

# 커버리지 포함
npm run test:coverage

# CI 환경용 (캐시 없이 실행)
npm run test:ci
```

### 클라이언트 테스트 실행

```bash
cd client

# 모든 테스트 실행
npm test

# 감시 모드
npm run test:watch

# 커버리지 포함
npm run test:coverage

# CI 환경용
npm run test:ci
```

### E2E 테스트 실행

```bash
cd client

# 기본 E2E 테스트
npm run test:e2e

# UI 모드로 실행 (브라우저 창 열림)
npm run test:e2e:ui

# 헤드풀 모드 (브라우저 창으로 실행)
npm run test:e2e:headed

# 디버그 모드
npm run test:e2e:debug

# 테스트 리포트 보기
npm run test:e2e:report
```

### 통합 테스트 실행

```bash
cd client

# API 통신 테스트
npm run test:integration

# 성능 테스트
npm run test:performance

# 접근성 테스트
npm run test:accessibility
```

## ⚡ 성능 최적화

### 테스트 성능 분석

```bash
# 성능 분석 및 최적화
npm run test:performance
```

이 명령어는 다음을 수행합니다:
- 테스트 실행 시간 측정
- 병렬 테스트 실행
- 캐시 최적화
- 성능 권장사항 제공

### 성능 최적화 팁

1. **병렬 실행**: `--maxWorkers` 옵션 사용
2. **캐시 활용**: Jest 캐시 활성화
3. **선택적 실행**: `--testPathPattern` 옵션으로 특정 테스트만 실행
4. **테스트 데이터 최적화**: beforeEach/afterEach 최소화

### 예시: 병렬 테스트 실행

```bash
# 서버 테스트를 4개 워커로 병렬 실행
cd server && npm test -- --maxWorkers=4

# 클라이언트 테스트를 2개 워커로 병렬 실행
cd client && npm test -- --maxWorkers=2
```

## 🔄 CI/CD 통합

### GitHub Actions

프로젝트에는 다음 GitHub Actions 워크플로우가 설정되어 있습니다:

- **CI Pipeline** (`.github/workflows/ci.yml`)
  - 서버 테스트
  - 클라이언트 테스트
  - E2E 테스트
  - 통합 테스트
  - 성능 테스트
  - 접근성 테스트
  - 보안 테스트
  - 자동 배포

- **Security Scan** (`.github/workflows/security.yml`)
  - 의존성 보안 스캔
  - 코드 보안 분석
  - 시크릿 스캔

### 로컬 CI 테스트

```bash
# CI 환경과 동일한 테스트 실행
npm run test:ci
```

### 커스텀 CI 설정

```yaml
# .github/workflows/custom-ci.yml
name: Custom CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm install --legacy-peer-deps
      
      - name: Run tests
        run: npm run test:ci
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## 🐛 문제 해결

### 일반적인 문제들

#### 1. 포트 충돌

```bash
# 사용 중인 포트 확인
netstat -ano | findstr :5000
netstat -ano | findstr :3000

# 프로세스 종료
taskkill /PID <PID번호> /F
```

#### 2. 데이터베이스 연결 오류

```bash
# MongoDB 서비스 상태 확인
mongosh --eval "db.adminCommand('ping')"

# Redis 서비스 상태 확인
redis-cli ping
```

#### 3. 테스트 타임아웃

```bash
# Jest 타임아웃 증가
npm test -- --testTimeout=60000

# Playwright 타임아웃 증가
npm run test:e2e -- --timeout=60000
```

#### 4. 메모리 부족

```bash
# Node.js 메모리 제한 증가
node --max-old-space-size=4096 node_modules/.bin/jest

# 워커 수 감소
npm test -- --maxWorkers=1
```

### 디버깅 팁

#### 1. 테스트 실패 시

```bash
# 상세 로그와 함께 실행
npm test -- --verbose

# 특정 테스트만 실행
npm test -- --testNamePattern="사용자 관리"

# 실패한 테스트만 재실행
npm test -- --onlyFailures
```

#### 2. E2E 테스트 디버깅

```bash
# 디버그 모드로 실행
npm run test:e2e:debug

# 헤드풀 모드로 실행
npm run test:e2e:headed

# 특정 테스트만 실행
npm run test:e2e -- --grep "로그인"
```

#### 3. 성능 문제 진단

```bash
# 성능 분석 실행
npm run test:performance

# 메모리 사용량 모니터링
npm test -- --logHeapUsage

# 프로파일링 활성화
npm test -- --profile
```

## 📚 모범 사례

### 1. 테스트 작성 원칙

#### AAA 패턴 (Arrange, Act, Assert)

```typescript
describe('사용자 관리', () => {
  it('사용자를 생성할 수 있어야 함', async () => {
    // Arrange (준비)
    const userData = {
      name: '테스트 사용자',
      email: 'test@example.com',
      userType: 'student'
    };

    // Act (실행)
    const response = await request(app)
      .post('/api/users')
      .send(userData)
      .set('Authorization', `Bearer ${token}`);

    // Assert (검증)
    expect(response.status).toBe(201);
    expect(response.body.data.user.email).toBe(userData.email);
  });
});
```

#### 의미 있는 테스트 이름

```typescript
// 좋은 예
it('유효한 데이터로 사용자를 생성할 수 있어야 함', () => {});
it('잘못된 데이터로 사용자 생성 시 400 에러를 반환해야 함', () => {});

// 나쁜 예
it('should work', () => {});
it('test user creation', () => {});
```

### 2. 테스트 격리

```typescript
describe('사용자 관리', () => {
  beforeEach(async () => {
    // 각 테스트 전에 데이터 정리
    await User.deleteMany({});
    
    // 테스트 데이터 생성
    await createTestUsers();
  });

  afterEach(async () => {
    // 각 테스트 후에 정리
    await cleanupTestData();
  });
});
```

### 3. 모킹 전략

```typescript
// 외부 API 모킹
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// 데이터베이스 모킹
jest.mock('../models/User');
const mockUser = User as jest.Mocked<typeof User>;

// 시간 모킹
jest.useFakeTimers();
jest.setSystemTime(new Date('2024-01-01'));
```

### 4. 테스트 데이터 관리

```typescript
// 테스트 데이터 팩토리
export const createTestUser = (overrides = {}) => ({
  name: '테스트 사용자',
  email: 'test@example.com',
  userType: 'student',
  ...overrides
});

// 테스트 데이터 빌더
export class UserBuilder {
  private user: any = {};

  withName(name: string) {
    this.user.name = name;
    return this;
  }

  withEmail(email: string) {
    this.user.email = email;
    return this;
  }

  build() {
    return { ...this.user };
  }
}
```

### 5. 에러 처리 테스트

```typescript
describe('에러 처리', () => {
  it('네트워크 오류 시 적절한 에러 메시지를 반환해야 함', async () => {
    // 네트워크 오류 모킹
    global.fetch = jest.fn().mockRejectedValue(new Error('Network Error'));

    const response = await apiClient.get('/users');
    
    expect(response.error).toBe('네트워크 오류가 발생했습니다.');
  });
});
```

## 📊 테스트 메트릭

### 목표 지표

- **커버리지**: 80% 이상
- **실행 시간**: 30초 이내
- **테스트 수**: 100개 이상
- **실패율**: 5% 이하

### 현재 상태

```bash
# 현재 커버리지 확인
npm run test:coverage

# 성능 분석
npm run test:performance
```

## 🔧 고급 설정

### Jest 설정 커스터마이징

```javascript
// jest.config.js
module.exports = {
  // 테스트 환경
  testEnvironment: 'jsdom',
  
  // 테스트 파일 패턴
  testMatch: [
    '**/__tests__/**/*.{js,jsx,ts,tsx}',
    '**/*.{test,spec}.{js,jsx,ts,tsx}'
  ],
  
  // 커버리지 설정
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.tsx'
  ],
  
  // 커버리지 임계값
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  
  // 설정 파일
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // 모듈 매핑
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
};
```

### Playwright 설정 커스터마이징

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  
  // 병렬 실행
  fullyParallel: true,
  workers: process.env.CI ? 1 : undefined,
  
  // 재시도 설정
  retries: process.env.CI ? 2 : 0,
  
  // 리포터 설정
  reporter: 'html',
  
  // 브라우저 설정
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
  ],
  
  // 웹 서버 설정
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

## 📞 지원 및 문의

테스트 관련 문제나 개선 사항이 있다면:

1. **이슈 생성**: GitHub Issues에서 버그 리포트
2. **문서 개선**: 이 가이드의 개선 사항 제안
3. **코드 기여**: 새로운 테스트 케이스 추가

---

**마지막 업데이트**: 2024년 12월
**문서 버전**: 1.0.0


