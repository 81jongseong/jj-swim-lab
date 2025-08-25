# 🏊‍♂️ JJ Swim Lab - 수영 교육 관리 시스템

## 🎯 프로젝트 개요

JJ Swim Lab은 수영 교육 센터를 위한 종합적인 관리 시스템입니다. 센터 관리자, 강사, 회원이 효율적으로 상호작용할 수 있는 웹 기반 플랫폼을 제공합니다.

## ✨ 주요 기능

### 🏢 센터 관리
- **센터별 사용자 관리**: 센터 관리자가 해당 센터의 강사와 회원을 관리
- **센터 정보 관리**: 센터 기본 정보 및 설정 관리
- **권한 관리**: 역할 기반 접근 제어 (RBAC)

### 👥 사용자 관리
- **다중 사용자 유형**: 센터 관리자, 강사, 회원, 시스템 관리자
- **센터별 데이터 분리**: 각 센터는 자신의 데이터만 접근 가능
- **사용자 프로필 관리**: 상세한 사용자 정보 및 설정

### 📚 강의 관리
- **강의 등록 및 관리**: 강의 정보, 일정, 강사 배정
- **수강생 관리**: 강의별 수강생 등록 및 관리
- **진도 추적**: 수강생별 학습 진도 및 성과 관리

### 📊 보고서 및 분석
- **센터별 통계**: 사용자 수, 강의 현황, 수익 분석
- **강사 성과 분석**: 강의별 만족도 및 성과 지표
- **회원 관리 현황**: 등록, 탈퇴, 활성도 분석

## 🚀 최근 업데이트 (2025-08-25)

### ✅ 새로 구현된 기능
- **센터별 사용자 관리 페이지** (`/admin/users/center-users`)
- **일반 사용자 관리 페이지** 개선 (`/admin/users`)
- **Next.js App Router** 구조 적용

### 🔧 해결된 문제들
- 404 라우팅 에러 해결
- API 경로 오류 수정
- 컴포넌트 import 오류 해결
- API 응답 처리 로직 개선

## 🛠️ 기술 스택

### Frontend
- **Next.js 13+** - React 기반 풀스택 프레임워크
- **React 18** - 사용자 인터페이스 라이브러리
- **TypeScript** - 타입 안전성 보장
- **Tailwind CSS** - 유틸리티 기반 CSS 프레임워크

### Backend
- **Node.js** - JavaScript 런타임 환경
- **Express.js** - 웹 애플리케이션 프레임워크
- **MongoDB Atlas** - 클라우드 기반 NoSQL 데이터베이스
- **JWT** - JSON Web Token 기반 인증

### Development Tools
- **Git** - 버전 관리
- **PowerShell** - Windows 개발 환경
- **VS Code** - 코드 에디터

## 📁 프로젝트 구조

```
jj-swim-lab/
├── client/                     # Frontend (Next.js)
│   ├── app/                   # App Router 구조
│   │   ├── admin/            # 관리자 페이지
│   │   │   ├── users/        # 사용자 관리
│   │   │   │   ├── page.tsx              # 일반 사용자 관리
│   │   │   │   └── center-users/         # 센터별 사용자 관리
│   │   │   │       └── page.tsx
│   │   │   ├── courses/      # 강의 관리
│   │   │   └── dashboard/    # 대시보드
│   │   ├── auth/             # 인증 페이지
│   │   └── api/              # API 라우트
│   ├── components/           # 재사용 가능한 컴포넌트
│   └── utils/                # 유틸리티 함수
├── server/                    # Backend (Node.js + Express)
│   ├── src/
│   │   ├── routes/           # API 엔드포인트
│   │   ├── models/           # 데이터베이스 모델
│   │   ├── middleware/       # 미들웨어
│   │   └── config/           # 설정 파일
│   └── package.json
└── docs/                     # 프로젝트 문서
    ├── 현재-작업-상황.md      # 현재 작업 상황
    └── README.md             # 이 파일
```

## 🚀 시작하기

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas 계정
- Git

### Installation

1. **프로젝트 클론**
```bash
git clone <repository-url>
cd jj-swim-lab
```

2. **Frontend 의존성 설치**
```bash
cd client
npm install
```

3. **Backend 의존성 설치**
```bash
cd ../server
npm install
```

4. **환경 변수 설정**
```bash
# server/.env
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000

# client/.env.local
NEXT_PUBLIC_API_URL=http://localhost:5000
```

5. **개발 서버 실행**
```bash
# Backend (Terminal 1)
cd server
npm run dev

# Frontend (Terminal 2)
cd client
npm run dev
```

## 🔐 인증 시스템

### 사용자 유형
- **Super Admin**: 시스템 전체 관리
- **Center Admin**: 특정 센터 관리
- **Instructor**: 강의 담당 강사
- **Student**: 수강생

### 권한 관리
- **센터별 데이터 분리**: 각 센터는 자신의 데이터만 접근
- **역할 기반 접근 제어**: 사용자 유형별 기능 제한
- **JWT 토큰**: 안전한 인증 및 세션 관리

## 📊 데이터베이스 스키마

### User Model
```typescript
interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  userType: 'student' | 'instructor' | 'centerAdmin' | 'superAdmin';
  isActive: boolean;
  centerId?: ObjectId;  // 센터 관리자용
  studentInfo?: {
    swimmingLevel: string;
    age: number;
    enrolledCenters: ObjectId[];
  };
  instructorInfo?: {
    instructorLevel: string;
    experience: string;
    assignedCenters: ObjectId[];
  };
}
```

## 🧪 테스트

### 기능 테스트
- ✅ 사용자 인증 및 권한 관리
- ✅ 센터별 사용자 관리
- ✅ 강의 관리 시스템
- ✅ 데이터 필터링 및 검색

### 브라우저 호환성
- ✅ Chrome (권장)
- ✅ Firefox
- ✅ Edge

## 📝 API 문서

### 주요 엔드포인트
- `POST /api/auth/login` - 사용자 로그인
- `GET /api/users` - 사용자 목록 조회
- `GET /api/courses` - 강의 목록 조회
- `POST /api/users` - 사용자 생성
- `PUT /api/users/:id` - 사용자 정보 수정

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 연락처

프로젝트 관련 문의사항이 있으시면 이슈를 생성해주세요.

---

**JJ Swim Lab** - 수영 교육의 디지털 혁신 🏊‍♂️✨

*마지막 업데이트: 2025-08-25*
