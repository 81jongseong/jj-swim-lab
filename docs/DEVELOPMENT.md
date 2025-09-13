# 🔧 JJ Swim Lab - 개발 가이드

이 문서는 JJ Swim Lab 프로젝트의 개발 환경 설정, 검증 시스템, 그리고 개발 워크플로우에 대한 가이드를 제공합니다.

## 📋 목차

- [개발 환경 설정](#개발-환경-설정)
- [통합 검증 시스템](#통합-검증-시스템)
- [개발 워크플로우](#개발-워크플로우)
- [코드 품질 관리](#코드-품질-관리)
- [테스트 전략](#테스트-전략)
- [CI/CD 통합](#cicd-통합)

## 🚀 개발 환경 설정

### 필수 요구사항

- **Node.js**: 18.0.0 이상
- **npm**: 8.0.0 이상
- **MongoDB**: 7.0 이상 (로컬 또는 Atlas)
- **Redis**: 7.2 이상 (선택사항)

### 초기 설정

```bash
# 프로젝트 클론
git clone <repository-url>
cd jj-swim-lab

# 의존성 설치
npm run install:all

# 환경 변수 설정
cp server/.env.example server/.env
# .env 파일을 편집하여 실제 값으로 설정

# 초기 빌드
npm run build
```

## 🔍 통합 검증 시스템

JJ Swim Lab은 모든 코드 품질 검증을 자동화하는 통합 시스템을 제공합니다.

### 전체 검증 (일일 작업 마무리)

```bash
# 모든 검증을 한번에 실행
npm run check
```

**실행되는 검증 항목:**
- ✅ 서버 빌드
- ✅ 클라이언트 빌드  
- ✅ 서버 테스트 (836개)
- ✅ 클라이언트 테스트 (74개)
- ✅ 서버 린팅
- ✅ 클라이언트 린팅
- ✅ 서버 타입 체크
- ✅ 클라이언트 타입 체크
- ✅ YAML 검증

### 빠른 검증 (개발 중)

```bash
# 빠른 검증 실행
npm run check:quick
```

**실행되는 검증 항목:**
- ✅ 빌드 검증
- ✅ 타입 체크
- ✅ 린팅 검사

### 개별 검증

```bash
npm run check:build    # 빌드만 검증
npm run check:test     # 테스트만 실행
npm run check:lint     # 린팅만 검사
npm run check:type     # 타입 체크만 실행
```

### 커밋 전 검증

```bash
npm run pre-commit
```

## 🔄 개발 워크플로우

### 1. 기능 개발

```bash
# 1. 새 브랜치 생성
git checkout -b feature/new-feature

# 2. 개발 작업 수행
# ... 코드 작성 ...

# 3. 빠른 검증
npm run check:quick

# 4. 커밋
git add .
git commit -m "feat: 새로운 기능 추가"

# 5. 푸시 전 전체 검증
npm run check
```

### 2. 버그 수정

```bash
# 1. 버그 수정 브랜치 생성
git checkout -b fix/bug-description

# 2. 버그 수정
# ... 코드 수정 ...

# 3. 관련 테스트 실행
npm run check:test

# 4. 전체 검증
npm run check

# 5. 커밋
git add .
git commit -m "fix: 버그 수정"
```

### 3. 리팩토링

```bash
# 1. 리팩토링 브랜치 생성
git checkout -b refactor/component-name

# 2. 리팩토링 작업
# ... 코드 개선 ...

# 3. 타입 체크
npm run check:type

# 4. 전체 검증
npm run check

# 5. 커밋
git add .
git commit -m "refactor: 컴포넌트 리팩토링"
```

## 📊 코드 품질 관리

### 린팅 규칙

#### 서버 (Node.js/Express)
- **ESLint**: JavaScript 코드 품질 검사
- **TypeScript**: 타입 안전성 보장
- **Prettier**: 코드 포맷팅

#### 클라이언트 (Next.js/React)
- **ESLint**: Next.js 규칙 적용
- **TypeScript**: 엄격한 타입 체크
- **Prettier**: 일관된 코드 스타일

### 타입 체크

```bash
# 서버 타입 체크
npm run type-check:server

# 클라이언트 타입 체크
npm run type-check:client

# 전체 타입 체크
npm run type-check
```

### 코드 포맷팅

```bash
# 전체 포맷팅
npm run format

# 서버만 포맷팅
npm run format:server

# 클라이언트만 포맷팅
npm run format:client
```

## 🧪 테스트 전략

### 테스트 구조

```
server/__tests__/
├── routes/           # API 라우트 테스트
├── models/           # 데이터베이스 모델 테스트
├── middleware/       # 미들웨어 테스트
└── utils/            # 유틸리티 함수 테스트

client/__tests__/
├── components/       # React 컴포넌트 테스트
├── hooks/           # 커스텀 훅 테스트
└── utils/           # 유틸리티 함수 테스트

client/e2e/          # End-to-End 테스트
├── accessibility.spec.ts
├── booking.spec.ts
├── homepage.spec.ts
├── integration.spec.ts
└── performance.spec.ts
```

### 테스트 실행

```bash
# 모든 테스트 실행
npm run test

# 서버 테스트만
npm run test:server

# 클라이언트 테스트만
npm run test:client

# 커버리지 확인
npm run test:coverage

# E2E 테스트
npm run test:e2e
```

### 테스트 커버리지 목표

- **라인 커버리지**: 90% 이상
- **함수 커버리지**: 95% 이상
- **브랜치 커버리지**: 85% 이상

## 🚀 CI/CD 통합

### GitHub Actions 워크플로우

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  validation:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm run install:all
      
      - name: Run all checks
        run: npm run check
```

### 배포 전 체크리스트

- [ ] 모든 테스트 통과 (`npm run check`)
- [ ] 타입 체크 통과 (`npm run type-check`)
- [ ] 린팅 통과 (`npm run lint`)
- [ ] 빌드 성공 (`npm run build`)
- [ ] YAML 검증 통과 (GitHub Actions)
- [ ] 코드 리뷰 완료
- [ ] 문서 업데이트

## 🛠️ 문제 해결

### 일반적인 문제들

#### 1. 포트 충돌 (EADDRINUSE)
```bash
# 포트 5000 사용 중인 프로세스 확인
netstat -ano | findstr :5000

# 프로세스 종료
taskkill /PID <PID> /F
```

#### 2. 의존성 문제
```bash
# node_modules 삭제 후 재설치
rm -rf node_modules
rm -rf server/node_modules
rm -rf client/node_modules
npm run install:all
```

#### 3. 타입 오류
```bash
# TypeScript 캐시 삭제
rm -rf server/dist
rm -rf client/.next
npm run build
```

### 검증 실패 시 대응

1. **빌드 실패**: TypeScript 컴파일 오류 확인
2. **테스트 실패**: 테스트 코드와 실제 구현 일치성 확인
3. **린팅 실패**: ESLint 규칙 위반 수정
4. **타입 체크 실패**: TypeScript 타입 정의 수정
5. **YAML 검증 실패**: GitHub Actions 문법 확인

## 📚 추가 리소스

- [Next.js 문서](https://nextjs.org/docs)
- [Express.js 문서](https://expressjs.com/)
- [MongoDB 문서](https://docs.mongodb.com/)
- [TypeScript 문서](https://www.typescriptlang.org/docs/)
- [Jest 문서](https://jestjs.io/docs/getting-started)

---

**문서 버전**: 1.2.0  
**최종 업데이트**: 2025-01-13  
**작성자**: AI Assistant
