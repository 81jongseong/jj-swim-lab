# 🚀 Vercel 프로젝트 설정 가이드

## 📋 개요
JJ Swim Lab 프로젝트를 Vercel에 배포하여 프로덕션 환경을 구축합니다.

## 🔧 1단계: Vercel 계정 설정

### **계정 생성/로그인**
1. **Vercel 웹사이트**: https://vercel.com
2. **GitHub 계정으로 로그인** (권장)
3. **GitHub 저장소 연결** 확인

---

## 🏗️ 2단계: 프로젝트 생성

### **Import Git Repository**
1. **Vercel 대시보드**에서 **New Project** 클릭
2. **Import Git Repository** 선택
3. **jj-swim-lab** 저장소 선택
4. **Import** 클릭

### **프로젝트 설정**
```
Project Name: jj-swim-lab
Framework Preset: Next.js
Root Directory: client
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

---

## ⚙️ 3단계: 환경 변수 설정

### **필수 환경 변수**
```
NODE_ENV=production
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=https://your-domain.vercel.app
```

### **설정 방법**
1. **Project Settings** → **Environment Variables**
2. **Add** 클릭
3. **Name**과 **Value** 입력
4. **Production**, **Preview**, **Development** 모두 체크
5. **Save** 클릭

---

## 🔗 4단계: 도메인 설정

### **커스텀 도메인 (선택사항)**
1. **Project Settings** → **Domains**
2. **Add Domain** 클릭
3. **도메인 이름** 입력
4. **DNS 설정** 안내에 따라 설정

### **Vercel 제공 도메인**
- **기본 도메인**: `jj-swim-lab.vercel.app`
- **프로덕션**: `jj-swim-lab.vercel.app`
- **프리뷰**: `jj-swim-lab-git-develop-username.vercel.app`

---

## 🚀 5단계: 배포 설정

### **Build & Development Settings**
```
Framework Preset: Next.js
Node.js Version: 18.x
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

### **Functions 설정**
```
Max Duration: 30 seconds
Memory: 1024 MB
```

---

## 🔐 6단계: GitHub Secrets 설정

### **필요한 Secrets**
```
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id
```

### **확인 방법**
1. **Project Settings** → **General**
2. **Project ID** 복사
3. **Team Settings** → **General**
4. **Team ID** 복사

---

## 📊 7단계: 배포 모니터링

### **배포 상태 확인**
1. **Vercel 대시보드**에서 배포 상태 모니터링
2. **GitHub Actions**와 연동 확인
3. **자동 배포** 작동 확인

### **성능 모니터링**
1. **Analytics** 탭에서 성능 지표 확인
2. **Core Web Vitals** 모니터링
3. **사용자 행동** 분석

---

## 🧪 8단계: 테스트

### **기능 테스트**
1. **메인 페이지** 로딩 확인
2. **API 엔드포인트** 작동 확인
3. **데이터베이스 연결** 확인
4. **인증 시스템** 작동 확인

### **성능 테스트**
1. **Lighthouse** 성능 점수 확인
2. **페이지 로딩 속도** 측정
3. **모바일 반응형** 확인

---

## 🚨 문제 해결

### **Common Issues:**

#### 1. **빌드 실패**
- **원인**: 의존성 문제 또는 환경 변수 누락
- **해결**: 로컬에서 빌드 테스트 후 환경 변수 확인

#### 2. **API 오류**
- **원인**: 환경 변수 설정 문제
- **해결**: Vercel 환경 변수 재설정

#### 3. **데이터베이스 연결 실패**
- **원인**: MongoDB Atlas IP 제한
- **해결**: Vercel IP 범위 허용

---

## 📈 9단계: 최적화

### **성능 최적화**
1. **Image Optimization** 활성화
2. **CDN** 설정 확인
3. **Caching** 전략 적용

### **SEO 최적화**
1. **Meta 태그** 설정
2. **Sitemap** 생성
3. **robots.txt** 설정

---

## 🎯 다음 단계

Vercel 설정이 완료되면:
1. **자동화된 배포** 테스트
2. **성능 모니터링** 설정
3. **알림 시스템** 구축
4. **프로덕션 환경** 안정화

---

## 💡 Tips

- **Preview 배포**를 통해 변경사항 미리 확인
- **Rollback** 기능으로 문제 발생 시 이전 버전으로 복구
- **Team Collaboration**으로 팀원들과 협업
- **Analytics**로 사용자 행동 분석

---

**🚀 이제 Vercel에서 JJ Swim Lab을 프로덕션 환경으로 배포할 수 있습니다!**

