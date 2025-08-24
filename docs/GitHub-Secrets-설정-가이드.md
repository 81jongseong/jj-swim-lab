# 🔐 GitHub Secrets 설정 가이드

## 📋 개요
JJ Swim Lab 프로젝트의 CI/CD 파이프라인이 정상적으로 작동하려면 GitHub Secrets를 설정해야 합니다.

## 🚀 필수 Secrets

### 1. **VERCEL_TOKEN** (필수)
**Vercel 배포를 위한 인증 토큰**

#### 설정 방법:
1. **Vercel 계정 로그인**: https://vercel.com
2. **Settings → Tokens** 메뉴로 이동
3. **Create Token** 클릭
4. **Token Name**: `jj-swim-lab-deploy`
5. **Expiration**: `No Expiration` (또는 적절한 기간)
6. **Token 생성 후 복사**

#### GitHub에 설정:
1. **GitHub 저장소** → **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret** 클릭
3. **Name**: `VERCEL_TOKEN`
4. **Value**: 복사한 토큰 붙여넣기
5. **Add secret** 클릭

---

### 2. **VERCEL_ORG_ID** (필수)
**Vercel 조직/팀 ID**

#### 확인 방법:
1. **Vercel 대시보드**에서 조직/팀 선택
2. **Settings** → **General** 메뉴
3. **Team ID** 또는 **Org ID** 복사

#### GitHub에 설정:
1. **New repository secret** 클릭
2. **Name**: `VERCEL_ORG_ID`
3. **Value**: 복사한 ID 붙여넣기
4. **Add secret** 클릭

---

### 3. **VERCEL_PROJECT_ID** (필수)
**Vercel 프로젝트 ID**

#### 확인 방법:
1. **Vercel 대시보드**에서 프로젝트 선택
2. **Settings** → **General** 메뉴
3. **Project ID** 복사

#### GitHub에 설정:
1. **New repository secret** 클릭
2. **Name**: `VERCEL_PROJECT_ID`
3. **Value**: 복사한 ID 붙여넣기
4. **Add secret** 클릭

---

## 🔔 선택적 Secrets

### 4. **SLACK_WEBHOOK_URL** (선택사항)
**Slack 알림을 위한 웹훅 URL**

#### 설정 방법:
1. **Slack 워크스페이스**에서 앱 생성
2. **Incoming Webhooks** 앱 추가
3. **Webhook URL** 복사

#### GitHub에 설정:
1. **New repository secret** 클릭
2. **Name**: `SLACK_WEBHOOK_URL`
3. **Value**: 복사한 URL 붙여넣기
4. **Add secret** 클릭

---

### 5. **LHCI_GITHUB_APP_TOKEN** (선택사항)
**Lighthouse CI 성능 모니터링용 토큰**

#### 설정 방법:
1. **GitHub Apps**에서 Lighthouse CI 앱 설치
2. **Personal Access Token** 생성
3. **Token 복사**

#### GitHub에 설정:
1. **New repository secret** 클릭
2. **Name**: `LHCI_GITHUB_APP_TOKEN`
3. **Value**: 복사한 토큰 붙여넣기
4. **Add secret** 클릭

---

## 🛠️ 설정 완료 후 확인

### 1. **Secrets 목록 확인**
```
✅ VERCEL_TOKEN
✅ VERCEL_ORG_ID
✅ VERCEL_PROJECT_ID
✅ SLACK_WEBHOOK_URL (선택사항)
✅ LHCI_GITHUB_APP_TOKEN (선택사항)
```

### 2. **CI/CD 파이프라인 재실행**
1. **GitHub Actions** 탭으로 이동
2. **CI/CD Pipeline** 워크플로우 선택
3. **Run workflow** 클릭
4. **Branch**: `develop` 선택
5. **Run workflow** 클릭

### 3. **배포 상태 확인**
1. **Vercel 대시보드**에서 배포 상태 확인
2. **GitHub Actions**에서 워크플로우 실행 상태 확인
3. **배포된 URL** 접속 테스트

---

## 🚨 문제 해결

### **Common Issues:**

#### 1. **Vercel 배포 실패**
- **원인**: 토큰 만료 또는 권한 부족
- **해결**: 새 토큰 생성 및 권한 확인

#### 2. **Slack 알림 실패**
- **원인**: 웹훅 URL 잘못됨
- **해결**: 웹훅 URL 재생성

#### 3. **Lighthouse CI 실패**
- **원인**: GitHub App 권한 부족
- **해결**: App 권한 재설정

---

## 📞 지원

### **문제가 발생하면:**
1. **GitHub Actions 로그** 확인
2. **Vercel 배포 로그** 확인
3. **Secrets 값 재확인**
4. **토큰 재생성** 시도

---

## 🎯 다음 단계

Secrets 설정이 완료되면:
1. **자동화된 배포** 테스트
2. **성능 모니터링** 활성화
3. **알림 시스템** 테스트
4. **프로덕션 환경** 준비

---

**💡 Tip**: Secrets는 민감한 정보이므로 절대 코드에 직접 입력하지 마세요!

