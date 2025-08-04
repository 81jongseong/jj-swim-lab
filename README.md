# 🏊‍♂️ JJ Swim Lab

수영 교육의 새로운 기준, JJ Swim Lab입니다.

## 📋 프로젝트 개요

JJ Swim Lab은 체계적인 수영 교육 시스템을 제공하는 웹 플랫폼입니다. AI 기반 학습 시스템, 전문 강사 매칭, 진도 관리 등 다양한 기능을 통해 모든 연령대의 수영 실력 향상을 도와드립니다.

## ✨ 주요 기능

### 🏠 메인 웹사이트
- 브랜드 소개 및 슬로건
- 사용자 유형별 진입 (회원, 강사, 관리자)
- 공지사항 및 뉴스
- 멤버십 안내 (기본/플러스/프리미엄)

### 🧑‍🎓 회원 시스템
- 회원 가입 및 로그인 (Google/Kakao 소셜 로그인)
- 레벨 평가 및 진도표 확인
- 개인 대시보드
- AI 기반 훈련 추천

### 👨‍🏫 강사 시스템
- 강사 가입 및 정보 입력
- 레슨 관리
- 회원 평가 및 피드백

### 🏢 센터 관리자 시스템
- 센터 등록 및 정보 관리
- 프로그램 관리
- 강사 배정 및 평가 관리

### 🧠 학습 및 평가 시스템
- 모의고사/퀴즈 기능
- AI 기반 복습 추천
- 진도별 취약 파트 집중 훈련

### 📤 콘텐츠 업로드 시스템
- 관리자 콘텐츠 에디터 (Markdown 지원)
- 이미지/영상 업로드
- 퀴즈 및 강의 연결

### 🏪 쇼핑몰 & 결제 시스템
- 수영용품 및 교육 자료 구매
- 중고 거래 게시판
- 프로그램 결제 및 자동 송금

### 📊 관리자 통계 & 제어
- 공지사항 통계
- 강사/회원 매칭 통계
- 전체 로그 관리

## 🛠️ 기술 스택

### Frontend
- **Next.js 15** - React 기반 프레임워크
- **React 19** - 사용자 인터페이스
- **TypeScript** - 타입 안전성
- **Tailwind CSS** - 스타일링
- **React Markdown** - 마크다운 렌더링

### Backend
- **Express.js** - Node.js 웹 프레임워크
- **MongoDB** - NoSQL 데이터베이스
- **Mongoose** - MongoDB ODM
- **JWT** - 인증 토큰
- **bcryptjs** - 비밀번호 해싱

### Development
- **pnpm** - 패키지 매니저
- **ESLint** - 코드 품질
- **TypeScript** - 타입 체크

## 🚀 시작하기

### 필수 요구사항
- Node.js 18+ 
- pnpm 8+
- MongoDB (로컬 또는 Atlas)

### 설치 및 실행

1. **저장소 클론**
```bash
git clone https://github.com/your-username/jj-swim-lab.git
cd jj-swim-lab
```

2. **의존성 설치**
```bash
pnpm install:all
```

3. **환경 변수 설정**
```bash
# server/env.example을 복사하여 .env 파일 생성
cd server
cp env.example .env
# .env 파일을 편집하여 데이터베이스 연결 정보 설정
```

4. **개발 서버 실행**
```bash
# 루트 디렉토리에서
pnpm dev
```

이 명령어는 클라이언트(포트 3000)와 서버(포트 5000)를 동시에 실행합니다.

### 개별 실행

**클라이언트만 실행:**
```bash
pnpm dev:client
```

**서버만 실행:**
```bash
pnpm dev:server
```

## 📁 프로젝트 구조

```
jj-swim-lab/
├── client/                 # Next.js 프론트엔드
│   ├── app/               # App Router
│   ├── components/        # 재사용 가능한 컴포넌트
│   ├── pages/            # 페이지 컴포넌트
│   └── public/           # 정적 파일
├── server/                # Express.js 백엔드
│   ├── src/
│   │   ├── models/       # MongoDB 모델
│   │   ├── routes/       # API 라우터
│   │   └── types/        # TypeScript 타입
│   └── dist/             # 빌드 출력
├── package.json           # 루트 설정
└── pnpm-workspace.yaml   # 워크스페이스 설정
```

## 🔧 개발 가이드

### API 엔드포인트

**인증**
- `POST /api/auth/signup` - 회원가입
- `POST /api/auth/login` - 로그인
- `GET /api/auth/profile` - 사용자 정보 조회

**사용자 관리**
- `GET /api/users` - 사용자 목록 조회
- `POST /api/users` - 사용자 생성

### 데이터베이스 스키마

**User 모델**
```typescript
{
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  userType: 'member' | 'instructor' | 'admin';
  // 강사 전용 필드
  experience?: string;
  certifications?: string;
  specialties?: string;
  // 센터 관리자 전용 필드
  centerName?: string;
  centerAddress?: string;
  centerPhone?: string;
}
```

## 🧪 테스트

```bash
# 클라이언트 테스트
cd client && pnpm test

# 서버 테스트
cd server && pnpm test
```

## 📦 배포

### 프로덕션 빌드
```bash
pnpm build
```

### 환경 변수 설정
프로덕션 환경에서는 다음 환경 변수를 설정해야 합니다:
- `MONGODB_URI` - MongoDB 연결 문자열
- `JWT_SECRET` - JWT 시크릿 키
- `CLIENT_URL` - 클라이언트 URL

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 연락처

- 이메일: support@jjswimlab.com
- 전화: 1588-0000
- 웹사이트: https://jjswimlab.com

## 🙏 감사의 말

JJ Swim Lab을 사용해주셔서 감사합니다. 더 나은 수영 교육을 위해 지속적으로 개선해 나가겠습니다.
