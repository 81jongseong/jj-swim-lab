# 🚀 JJ Swim Lab GitHub 저장소 설정 및 CI/CD 활성화 가이드

## 📋 개요

JJ Swim Lab 프로젝트를 GitHub 저장소에 설정하고 CI/CD 파이프라인을 활성화하는 상세 가이드입니다.

## 🔧 GitHub 저장소 설정

### 1단계: 새 저장소 생성

1. **GitHub에 로그인**
   - [github.com](https://github.com) 접속
   - 계정 로그인

2. **새 저장소 생성**
   - 우측 상단 "+" 버튼 클릭
   - "New repository" 선택

3. **저장소 정보 입력**
   ```
   Repository name: jj-swim-lab
   Description: 🏊‍♂️ JJ Swim Lab - 수영 강습 관리 시스템
   Visibility: Public (또는 Private)
   Initialize with: README 체크
   Add .gitignore: Node 선택
   Choose a license: MIT License
   ```

4. **"Create repository" 클릭**

### 2단계: 로컬 저장소 초기화

```bash
# 프로젝트 디렉토리에서
git init
git add .
git commit -m "🎉 Initial commit: JJ Swim Lab 프로젝트"

# 원격 저장소 연결
git remote add origin https://github.com/your-username/jj-swim-lab.git
git branch -M main
git push -u origin main
```

### 3단계: 브랜치 전략 설정

```bash
# develop 브랜치 생성
git checkout -b develop
git push -u origin develop

# 브랜치 보호 규칙 설정 (GitHub 웹에서)
# Settings > Branches > Add rule
# Branch name pattern: main
# Require a pull request before merging: 체크
# Require status checks to pass before merging: 체크
# Require branches to be up to date before merging: 체크
```

## 🔐 GitHub Secrets 설정

### 1단계: CI/CD용 시크릿 설정

**GitHub 저장소에서 Settings > Secrets and variables > Actions로 이동**

#### 필수 시크릿 설정:

```bash
# Vercel 배포용
VERCEL_TOKEN=your_vercel_token
ORG_ID=your_org_id
PROJECT_ID=your_project_id

# Slack 알림용
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/your-webhook-url

# Lighthouse CI용
LHCI_GITHUB_APP_TOKEN=your_lighthouse_token

# MongoDB 연결 (테스트용)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/jjswimlab_test

# JWT 시크릿 (테스트용)
JWT_SECRET=test-jwt-secret-key-for-ci-cd
```

### 2단계: 환경별 시크릿 설정

#### Staging Environment:
```bash
# Settings > Environments > New environment
# Environment name: staging
# Protection rules: Required reviewers: 1명

# Environment secrets:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/jjswimlab_staging
JWT_SECRET=staging-jwt-secret-key
NODE_ENV=staging
```

#### Production Environment:
```bash
# Settings > Environments > New environment
# Environment name: production
# Protection rules: Required reviewers: 2명, Wait timer: 5분

# Environment secrets:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/jjswimlab_prod
JWT_SECRET=production-jwt-secret-key
NODE_ENV=production
```

## 🚀 CI/CD 파이프라인 활성화

### 1단계: GitHub Actions 워크플로우 파일 확인

**`.github/workflows/ci-cd.yml` 파일이 올바르게 설정되었는지 확인:**

```yaml
name: 🚀 JJ Swim Lab CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

env:
  NODE_VERSION: '18'
  NPM_VERSION: '9'

jobs:
  # ... (기존 워크플로우 내용)
```

### 2단계: 첫 번째 CI/CD 실행

```bash
# develop 브랜치에 푸시하여 CI/CD 테스트
git checkout develop
git add .
git commit -m "🧪 CI/CD 파이프라인 테스트"
git push origin develop
```

### 3단계: GitHub Actions 모니터링

1. **GitHub 저장소에서 Actions 탭 확인**
2. **워크플로우 실행 상태 모니터링**
3. **각 단계별 실행 결과 확인**

## 📊 CI/CD 파이프라인 검증

### 1단계: 코드 품질 검사

**GitHub Actions에서 다음 단계들이 성공적으로 실행되는지 확인:**

- ✅ **코드 품질 검사**
  - ESLint 검사
  - TypeScript 타입 검사
  - Prettier 포맷 검사

- ✅ **테스트 실행**
  - 클라이언트 테스트
  - 서버 테스트
  - 테스트 커버리지 업로드

- ✅ **빌드 및 성능 검사**
  - 클라이언트 빌드
  - 서버 빌드
  - 번들 크기 분석
  - 성능 체크

### 2단계: 배포 테스트

**develop 브랜치 푸시 시:**

- ✅ **스테이징 배포 자동 실행**
- ✅ **Vercel 프리뷰 배포**
- ✅ **성능 모니터링 자동 실행**

**main 브랜치 머지 시:**

- ✅ **프로덕션 배포 자동 실행**
- ✅ **Vercel 프로덕션 배포**
- ✅ **Slack 알림 자동 발송**

## 🔍 CI/CD 문제 해결

### 일반적인 문제 및 해결 방법

#### 1. 빌드 실패
```bash
# 로컬에서 빌드 테스트
npm run build:client
npm run build:server

# 의존성 문제 해결
rm -rf node_modules package-lock.json
npm install
```

#### 2. 테스트 실패
```bash
# 로컬에서 테스트 실행
npm run test:client
npm run test:server

# 특정 테스트 디버깅
npm run test -- --verbose --no-coverage
```

#### 3. 배포 실패
```bash
# Vercel CLI로 수동 배포 테스트
npm i -g vercel
vercel login
vercel --prod
```

#### 4. 시크릿 설정 문제
```bash
# GitHub Secrets 재설정
# Settings > Secrets and variables > Actions
# 기존 시크릿 삭제 후 재생성
```

## 📈 CI/CD 성과 모니터링

### 1단계: GitHub Actions 인사이트

**GitHub 저장소에서 다음 지표 확인:**

- **워크플로우 실행 빈도**
- **성공/실패 비율**
- **실행 시간 트렌드**
- **가장 많이 실패하는 단계**

### 2단계: 성능 모니터링

**Lighthouse CI 결과 확인:**

- **Core Web Vitals 점수**
- **성능 개선 추이**
- **접근성 및 SEO 점수**

### 3단계: 배포 상태 추적

**Vercel 대시보드에서:**

- **배포 성공률**
- **배포 시간**
- **성능 메트릭**

## 🎯 다음 단계

### 단기 계획 (1-2주)
- [ ] **CI/CD 파이프라인 안정화**
- [ ] **자동화된 테스트 커버리지 증가**
- [ ] **성능 모니터링 대시보드 통합**

### 중기 계획 (1-2개월)
- [ ] **Canary 배포 구현**
- [ ] **A/B 테스트 자동화**
- [ ] **롤백 자동화**

### 장기 계획 (3-6개월)
- [ ] **멀티 클라우드 배포**
- [ ] **자동 스케일링**
- [ **AI 기반 성능 최적화**

## 📚 추가 리소스

### GitHub Actions 문서
- [GitHub Actions 공식 문서](https://docs.github.com/en/actions)
- [GitHub Actions 예제](https://github.com/actions/starter-workflows)

### CI/CD 모범 사례
- [CI/CD 파이프라인 설계](https://martinfowler.com/articles/cd.html)
- [DevOps 모범 사례](https://www.atlassian.com/devops)

### 문제 해결 가이드
- [GitHub Actions 문제 해결](https://docs.github.com/en/actions/troubleshooting)
- [Vercel 배포 문제 해결](https://vercel.com/docs/troubleshooting)

---

**마지막 업데이트**: 2025년 8월 23일  
**버전**: 1.0.0  
**담당자**: 개발팀
