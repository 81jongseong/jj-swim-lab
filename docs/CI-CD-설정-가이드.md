# 🚀 JJ Swim Lab CI/CD 파이프라인 설정 가이드

## 📋 개요

JJ Swim Lab의 지속적인 통합 및 배포(CI/CD) 파이프라인을 설정하는 상세 가이드입니다. GitHub Actions를 사용하여 자동화된 테스트, 빌드, 배포를 구현합니다.

## 🎯 CI/CD 파이프라인 구성

### 📊 전체 워크플로우

```
📥 코드 푸시/PR
    ↓
🔍 코드 품질 검사 (ESLint, TypeScript, Prettier)
    ↓
🧪 자동화된 테스트 (Jest)
    ↓
🏗️ 빌드 및 성능 검사
    ↓
🚀 스테이징/프로덕션 배포
    ↓
📊 성능 모니터링 (Lighthouse)
    ↓
🔔 알림 및 보고
```

## 🔧 GitHub Actions 설정

### 1단계: GitHub Secrets 설정

**GitHub 저장소에서 다음 시크릿을 설정해야 합니다:**

```bash
# Vercel 배포용
VERCEL_TOKEN=your_vercel_token
ORG_ID=your_org_id
PROJECT_ID=your_project_id

# Slack 알림용
SLACK_WEBHOOK_URL=your_slack_webhook_url

# Lighthouse CI용
LHCI_GITHUB_APP_TOKEN=your_lighthouse_token
```

### 2단계: 환경 설정

**GitHub 저장소에서 환경을 생성합니다:**

#### Staging Environment
- **Name**: `staging`
- **Protection rules**: 
  - Required reviewers: 1명
  - Wait timer: 0분

#### Production Environment
- **Name**: `production`
- **Protection rules**:
  - Required reviewers: 2명
  - Wait timer: 5분

## 🧪 테스트 자동화

### 클라이언트 테스트

```bash
# CI 테스트 실행
npm run test:ci

# 테스트 커버리지
npm run test -- --coverage

# 특정 테스트 파일
npm run test -- Button.test.tsx
```

### 서버 테스트

```bash
# CI 테스트 실행
npm run test:ci

# 테스트 커버리지
npm run test -- --coverage

# API 테스트
npm run test -- api.test.ts
```

## 🏗️ 빌드 자동화

### 클라이언트 빌드

```bash
# 개발 빌드
npm run build

# 프로덕션 빌드
npm run build:prod

# 번들 분석
npm run bundle:analyze

# 성능 체크
npm run performance
```

### 서버 빌드

```bash
# 개발 빌드
npm run build

# 프로덕션 빌드
npm run build:prod

# 타입 체크
npm run type-check
```

## 🚀 배포 자동화

### Vercel 배포

**스테이징 배포 (develop 브랜치)**
```yaml
- name: 🚀 Vercel 스테이징 배포
  uses: amondnet/vercel-action@v25
  with:
    vercel-token: ${{ secrets.VERCEL_TOKEN }}
    vercel-org-id: ${{ secrets.ORG_ID }}
    vercel-project-id: ${{ secrets.PROJECT_ID }}
    vercel-args: '--target=preview'
```

**프로덕션 배포 (main 브랜치)**
```yaml
- name: 🚀 Vercel 프로덕션 배포
  uses: amondnet/vercel-action@v25
  with:
    vercel-token: ${{ secrets.VERCEL_TOKEN }}
    vercel-org-id: ${{ secrets.ORG_ID }}
    vercel-project-id: ${{ secrets.PROJECT_ID }}
    vercel-args: '--prod'
```

### 수동 배포

**Vercel CLI 사용**
```bash
# Vercel CLI 설치
npm i -g vercel

# 로그인
vercel login

# 스테이징 배포
vercel --target=preview

# 프로덕션 배포
vercel --prod
```

## 📊 성능 모니터링

### Lighthouse CI 설정

**`.lighthouserc.js` 파일에서 성능 기준 설정:**

```javascript
assert: {
  assertions: {
    'categories:performance': ['warn', { minScore: 0.8 }],
    'categories:accessibility': ['error', { minScore: 0.9 }],
    'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
    'largest-contentful-paint': ['warn', { maxNumericValue: 4000 }],
    'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
    'total-blocking-time': ['warn', { maxNumericValue: 300 }]
  }
}
```

### 성능 메트릭 수집

**Core Web Vitals 모니터링:**
- **FCP** (First Contentful Paint): < 1.8초
- **LCP** (Largest Contentful Paint): < 2.5초
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

## 🔔 알림 및 보고

### Slack 알림

**배포 완료 시 자동 알림:**
```yaml
- name: 🔔 Slack 알림
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    channel: '#deployments'
    text: |
      🚀 JJ Swim Lab 배포 완료!
      - 브랜치: ${{ github.ref_name }}
      - 커밋: ${{ github.sha }}
      - 상태: ${{ job.status }}
```

### GitHub Actions 요약

**워크플로우 실행 후 자동 요약 생성:**
```yaml
- name: 📊 배포 상태 요약
  run: |
    echo "## 🚀 배포 상태 요약" >> $GITHUB_STEP_SUMMARY
    echo "- **스테이징**: ${{ needs.deploy-staging.result }}" >> $GITHUB_STEP_SUMMARY
    echo "- **프로덕션**: ${{ needs.deploy-production.result }}" >> $GITHUB_STEP_SUMMARY
```

## 🚨 문제 해결

### 일반적인 CI/CD 문제

#### 빌드 실패
```bash
# 캐시 정리
npm run clean
rm -rf node_modules
npm install

# 의존성 확인
npm audit
npm outdated
```

#### 테스트 실패
```bash
# 테스트 환경 확인
npm run test:ci

# 특정 테스트 디버깅
npm run test -- --verbose --no-coverage
```

#### 배포 실패
```bash
# Vercel 상태 확인
vercel ls

# 로그 확인
vercel logs

# 환경 변수 확인
vercel env ls
```

## 📈 모니터링 및 최적화

### 성능 추적

**번들 크기 모니터링:**
```bash
# 번들 크기 확인
npm run bundle:size

# 번들 분석
npm run bundle:analyze

# 성능 체크
npm run performance
```

### 지속적 개선

**정기적인 리뷰 항목:**
- [ ] 테스트 커버리지 증가
- [ ] 빌드 시간 단축
- [ ] 번들 크기 최적화
- [ ] 성능 점수 향상
- [ ] 배포 시간 단축

## 🎯 다음 단계

### 단기 계획 (1-2개월)
- [ ] **자동화된 테스트 커버리지 증가**
- [ ] **성능 모니터링 대시보드 구축**
- [ ] **배포 롤백 자동화**

### 중기 계획 (3-6개월)
- [ ] **Canary 배포 구현**
- [ ] **A/B 테스트 자동화**
- [ ] **인프라 모니터링 통합**

### 장기 계획 (6개월 이상)
- [ ] **멀티 클라우드 배포**
- [ ] **자동 스케일링**
- [ **AI 기반 성능 최적화**

## 📚 추가 리소스

### 공식 문서
- [GitHub Actions](https://docs.github.com/en/actions)
- [Vercel CLI](https://vercel.com/docs/cli)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)

### 도구 및 서비스
- [Codecov](https://codecov.io/) - 테스트 커버리지
- [Slack](https://slack.com/) - 알림
- [Vercel](https://vercel.com/) - 배포 플랫폼

---

**마지막 업데이트**: 2025년 8월 23일  
**버전**: 1.0.0  
**담당자**: 개발팀
