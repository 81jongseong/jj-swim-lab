# JJ Swim Lab 테스트 가이드

이 문서는 JJ Swim Lab 프로젝트의 테스트 실행 방법을 설명합니다.

## 🚀 빠른 시작

### 한 번에 모든 테스트 실행

```bash
# 루트 디렉토리에서 실행
npm run test:quick    # 빠른 테스트 (서버 + 클라이언트 단위 테스트)
npm run test:full     # 전체 테스트 (서버 + 클라이언트 + E2E + 통합 테스트)
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

## 📋 테스트 종류

### 1. 단위 테스트 (Unit Tests)

**서버 테스트**
```bash
cd server
npm test                    # 모든 테스트 실행
npm run test:watch         # 감시 모드
npm run test:coverage      # 커버리지 포함
```

**클라이언트 테스트**
```bash
cd client
npm test                   # 모든 테스트 실행
npm run test:watch         # 감시 모드
npm run test:coverage      # 커버리지 포함
```

### 2. E2E 테스트 (End-to-End Tests)

```bash
cd client
npm run test:e2e           # 기본 E2E 테스트
npm run test:e2e:ui       # UI 모드로 실행
npm run test:e2e:headed   # 브라우저 창으로 실행
npm run test:e2e:debug    # 디버그 모드
```

### 3. 통합 테스트 (Integration Tests)

```bash
cd client
npm run test:integration   # API 통신 테스트
```

### 4. 성능 테스트 (Performance Tests)

```bash
cd client
npm run test:performance   # 성능 테스트
```

### 5. 접근성 테스트 (Accessibility Tests)

```bash
cd client
npm run test:accessibility # 접근성 테스트
```

## 🛠️ 테스트 환경 설정

### 환경 변수

테스트 실행 시 다음 환경 변수가 자동으로 설정됩니다:

```bash
NODE_ENV=test
MONGODB_URI=mongodb://localhost:27017/jj-swim-lab-test
JWT_SECRET=test-jwt-secret-key
REDIS_URL=redis://localhost:6379/1
```

### 테스트 데이터베이스

- 테스트용 MongoDB 데이터베이스: `jj-swim-lab-test`
- 테스트용 Redis 데이터베이스: `1`

## 📊 테스트 결과 확인

### 커버리지 리포트

```bash
# 서버 커버리지
cd server && npm run test:coverage

# 클라이언트 커버리지
cd client && npm run test:coverage
```

### E2E 테스트 리포트

```bash
cd client
npm run test:e2e:report    # HTML 리포트 열기
```

## 🔧 CI/CD 파이프라인

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

## 🐛 테스트 디버깅

### 테스트 실패 시

1. **로그 확인**
   ```bash
   npm run test:full 2>&1 | tee test-results.log
   ```

2. **개별 테스트 실행**
   ```bash
   # 특정 테스트 파일만 실행
   cd server && npm test -- --testNamePattern="사용자 관리"
   ```

3. **디버그 모드**
   ```bash
   cd client && npm run test:e2e:debug
   ```

### 일반적인 문제 해결

**포트 충돌**
```bash
# 사용 중인 포트 확인
netstat -ano | findstr :5000
netstat -ano | findstr :3000

# 프로세스 종료
taskkill /PID <PID번호> /F
```

**데이터베이스 연결 오류**
```bash
# MongoDB 서비스 상태 확인
mongosh --eval "db.adminCommand('ping')"

# Redis 서비스 상태 확인
redis-cli ping
```

## 📝 테스트 작성 가이드

### 서버 테스트

```typescript
// server/__tests__/routes/users.test.ts
describe('사용자 관리', () => {
  it('사용자 목록을 조회할 수 있어야 함', async () => {
    const response = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
```

### 클라이언트 테스트

```typescript
// client/__tests__/components/Button.test.tsx
describe('Button 컴포넌트', () => {
  it('클릭 이벤트를 처리해야 함', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>클릭</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### E2E 테스트

```typescript
// client/e2e/auth.spec.ts
test('로그인 프로세스', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[type="email"]', 'test@example.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');
  
  await expect(page).toHaveURL('/dashboard');
});
```

## 🎯 테스트 모범 사례

### 1. 테스트 명명 규칙

```typescript
// 좋은 예
describe('사용자 관리 API', () => {
  it('유효한 데이터로 사용자를 생성할 수 있어야 함', () => {});
  it('잘못된 데이터로 사용자 생성 시 400 에러를 반환해야 함', () => {});
});

// 나쁜 예
describe('User API', () => {
  it('should work', () => {});
});
```

### 2. 테스트 격리

```typescript
// 각 테스트는 독립적이어야 함
beforeEach(async () => {
  // 테스트 데이터 정리
  await cleanupTestData();
  
  // 새로운 테스트 데이터 생성
  await seedTestData();
});
```

### 3. 의미 있는 어설션

```typescript
// 좋은 예
expect(response.body.data.user.email).toBe('test@example.com');
expect(response.status).toBe(201);

// 나쁜 예
expect(response.body).toBeTruthy();
```

## 📚 추가 리소스

- [Jest 공식 문서](https://jestjs.io/docs/getting-started)
- [Playwright 공식 문서](https://playwright.dev/docs/intro)
- [Testing Library 공식 문서](https://testing-library.com/docs/)
- [Supertest 공식 문서](https://github.com/visionmedia/supertest)

## 🤝 기여하기

테스트를 추가하거나 수정할 때는 다음을 확인해주세요:

1. 테스트가 독립적으로 실행되는지
2. 의미 있는 테스트 케이스인지
3. 적절한 에러 처리가 있는지
4. 테스트 명명이 명확한지

문제가 있거나 개선 사항이 있다면 이슈를 생성해주세요!



