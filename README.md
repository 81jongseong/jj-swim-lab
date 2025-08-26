# 🏊‍♂️ JJ Swim Lab - AI 기반 수영 교육 플랫폼

**수영 교육을 위한 혁신적인 AI 기반 학습 플랫폼**

## ✨ 주요 기능

### 🎯 **센터별 맞춤형 교육 시스템**
- **센터별 커스텀 레벨**: 각 수영장마다 고유한 레벨 체계 설정
- **레벨 순서 관리**: 레벨 간 순서 조정 및 활성화/비활성화
- **강습법과 연동**: 센터별 레벨을 강습법 관리에서 활용

### 👥 **역할 기반 권한 관리 (RBAC)**
- **Super Admin**: 전체 시스템 관리
- **Center Admin**: 센터별 사용자 및 레벨 관리, 강사 기능 사용 가능
- **Instructor**: 학생 관리 및 레벨 변경
- **Student**: 개인 학습 진행 상황 확인

### 📚 **학생 레벨 관리 시스템**
- **레벨 변경 기능**: 센터 관리자와 강사가 학생 레벨 조정
- **상세 이력 관리**: 누가, 언제, 왜 레벨을 변경했는지 기록
- **센터별 통계**: 각 센터의 학생 레벨 분포 현황

### 🎨 **개선된 사용자 인터페이스**
- **그룹화된 네비게이션**: 관리자용 드롭다운 메뉴로 기능 분류
- **반응형 디자인**: 데스크톱과 모바일 모두 최적화
- **직관적인 메뉴 구조**: 사용자 역할에 따른 맞춤형 메뉴

### 📱 **PWA (Progressive Web App) 기능**
- **오프라인 지원**: 네트워크 없이도 기본 기능 사용 가능
- **앱 설치**: 모바일/데스크톱에 네이티브 앱처럼 설치
- **로컬 데이터 저장**: IndexedDB를 활용한 오프라인 데이터 관리

## 🚀 기술 스택

### **Frontend**
- **Next.js 14.2.5**: React 기반 풀스택 프레임워크
- **TypeScript**: 타입 안전성과 개발 생산성 향상
- **Tailwind CSS**: 유틸리티 기반 CSS 프레임워크
- **PWA**: Service Worker, IndexedDB, Manifest

### **Backend**
- **Node.js**: 서버 사이드 JavaScript 런타임
- **Express.js**: 웹 애플리케이션 프레임워크
- **MongoDB Atlas**: 클라우드 기반 NoSQL 데이터베이스
- **WebSocket**: 실시간 양방향 통신

### **AI & ML**
- **TensorFlow.js**: 클라이언트 사이드 머신러닝
- **Pose Detection**: 수영 자세 분석 및 피드백

## 📁 프로젝트 구조

```
jj-swim-lab/
├── client/                 # Next.js 클라이언트
│   ├── app/               # App Router 구조
│   │   ├── admin/         # 관리자 페이지
│   │   │   ├── center-levels/    # 센터별 레벨 관리
│   │   │   ├── student-levels/   # 학생 레벨 관리
│   │   │   └── teaching-methods/ # 강습법 관리
│   │   ├── offline/       # 오프라인 페이지
│   │   └── install/       # PWA 설치 가이드
│   ├── components/        # 재사용 가능한 컴포넌트
│   │   ├── TopNavigation.tsx     # 관리자용 네비게이션
│   │   ├── SimpleNavigation.tsx  # 일반 페이지 네비게이션
│   │   └── ui/            # UI 기본 컴포넌트
│   ├── hooks/             # 커스텀 React 훅
│   │   └── useEnhancedOffline.ts # 오프라인 기능 관리
│   ├── lib/               # 유틸리티 라이브러리
│   │   └── offlineDB.ts   # IndexedDB 래퍼
│   └── public/            # 정적 파일
│       ├── sw.js          # Service Worker
│       └── manifest.json  # PWA 매니페스트
├── server/                # Express.js 서버
│   ├── src/
│   │   ├── models/        # MongoDB 스키마
│   │   ├── routes/        # API 엔드포인트
│   │   │   └── student-levels.ts # 학생 레벨 관리 API
│   │   └── index.ts       # 서버 진입점
│   └── .env               # 환경 변수
└── docs/                  # 프로젝트 문서
    └── 현재-작업-상황.md   # 개발 진행 상황
```

## 🛠️ 설치 및 실행

### **필수 요구사항**
- Node.js 18+ 
- npm 또는 yarn
- MongoDB Atlas 계정

### **1. 저장소 클론**
```bash
git clone https://github.com/your-username/jj-swim-lab.git
cd jj-swim-lab
```

### **2. 의존성 설치**
```bash
# 루트 디렉토리
npm install

# 클라이언트 디렉토리
cd client
npm install

# 서버 디렉토리
cd ../server
npm install
```

### **3. 환경 변수 설정**
```bash
# server/.env 파일 생성
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
PORT=5000
NODE_ENV=development
```

### **4. 개발 서버 실행**
```bash
# 루트 디렉토리에서
npm run dev
```

**클라이언트**: http://localhost:3000  
**서버**: http://localhost:5000

## 🔐 기본 계정 정보

### **Super Admin**
- **ID**: admin@jjswim.com
- **Password**: 101010

### **Center Admin**
- **ID**: center@jjswim.com  
- **Password**: 101010

### **Instructor**
- **ID**: instructor@jjswim.com
- **Password**: 101010

## 📱 PWA 설치 방법

### **Android**
1. Chrome 브라우저에서 사이트 접속
2. 주소창 옆 "설치" 버튼 클릭
3. "설치" 선택

### **iOS**
1. Safari에서 사이트 접속
2. 공유 버튼 → "홈 화면에 추가"
3. "추가" 선택

### **Desktop**
1. Chrome에서 사이트 접속
2. 주소창 옆 "설치" 버튼 클릭
3. "설치" 선택

## 🔄 최근 업데이트

### **v1.2.0** (2025-01-26)
- ✅ 센터별 커스텀 레벨 시스템 구현
- ✅ 학생 레벨 변경 및 이력 관리 기능
- ✅ 권한 시스템 개선 (센터 관리자 권한 확장)
- ✅ 네비게이션 시스템 대폭 개선
- ✅ PWA 오프라인 기능 구현
- ✅ TypeScript 설정 최적화

### **v1.1.0** (이전)
- ✅ 기본 사용자 관리 시스템
- ✅ 강습법 관리 기능
- ✅ 코스 관리 시스템

## 🚧 현재 개발 중인 기능

### **PWA 안정성 개선**
- Service Worker 등록 및 캐싱 로직 최적화
- 오프라인 데이터 동기화 안정성 향상
- 브라우저 호환성 테스트 및 개선

### **AI 기능 강화**
- 수영 자세 분석 정확도 향상
- 개인별 맞춤형 피드백 시스템
- 학습 진행 상황 AI 분석

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 연락처

**JJ Swim Lab Team**  
- **Email**: contact@jjswim.com
- **Website**: https://jj-swim-lab.vercel.app
- **GitHub**: https://github.com/your-username/jj-swim-lab

---

**🏊‍♂️ 수영 교육의 미래를 만들어갑니다!**
