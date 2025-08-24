# JJ Swim Lab 🏊‍♂️

**수영 교육을 위한 AI 기반 학습 플랫폼**

## 🎯 프로젝트 상태

### ✅ 현재 상태 (2024년 12월 19일)
- **TypeScript 컴파일 오류 대량 해결** - 모든 주요 타입 오류 해결 완료
- **@faker-js/faker 최신 버전 호환성 문제 해결** - API 변경사항 반영
- **Next.js 빌드 성공** - `npm run build:analyze` 성공 달성
- **번들 분석 완료** - 54개 정적 페이지 생성, 최적화된 번들 크기

### 🚀 다음 단계
- **성능 최적화** - 번들 크기 최적화, 이미지 최적화, 코드 분할
- **성능 테스트** - Lighthouse 성능 점수 측정 및 개선

## 🏗️ 기술 스택

### Frontend
- **Next.js 14.2.5** - React 기반 풀스택 프레임워크
- **TypeScript** - 타입 안전성과 개발자 경험 향상
- **Tailwind CSS** - 유틸리티 퍼스트 CSS 프레임워크
- **Framer Motion** - 애니메이션 라이브러리

### AI & ML
- **TensorFlow.js** - 브라우저 기반 머신러닝
- **MediaPipe** - Google의 AI 솔루션
- **PoseNet** - 자세 인식 모델

### Backend
- **Node.js** - 서버 사이드 JavaScript 런타임
- **Express.js** - 웹 애플리케이션 프레임워크
- **MongoDB Atlas** - 클라우드 기반 NoSQL 데이터베이스

### DevOps
- **GitHub Actions** - CI/CD 파이프라인
- **Vercel** - 프론트엔드 배포 플랫폼
- **Docker** - 컨테이너화

## 🚀 빠른 시작

### 필수 요구사항
- Node.js 18+ 
- npm 9+
- Git

### 설치 및 실행

```bash
# 저장소 클론
git clone https://github.com/your-username/jj-swim-lab.git
cd jj-swim-lab

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 번들 분석
npm run build:analyze
```

### 환경 변수 설정

```bash
# .env.local 파일 생성
cp .env.example .env.local

# 필요한 환경 변수 설정
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
VERCEL_TOKEN=your_vercel_token
```

## 📚 주요 기능

### 🏊‍♂️ 수영 교육
- **AI 기반 자세 분석** - 실시간 자세 인식 및 피드백
- **개인화된 학습 계획** - 사용자 수준에 맞는 맞춤형 커리큘럼
- **진도 추적** - 학습 진행 상황 모니터링

### 🎓 교육 관리
- **강사 대시보드** - 학생 관리 및 진도 추적
- **센터 관리** - 수영장별 운영 관리
- **수업 예약 시스템** - 온라인 예약 및 관리

### 📊 분석 및 리포팅
- **성과 분석** - 학습 성과 및 통계
- **사용자 행동 분석** - 플랫폼 사용 패턴 분석
- **비즈니스 인사이트** - 수익 및 운영 현황

## 🔧 개발 가이드

### 코드 구조
```
jj-swim-lab/
├── client/                 # Next.js 프론트엔드
│   ├── app/               # App Router 페이지
│   ├── components/        # 재사용 가능한 컴포넌트
│   ├── hooks/            # 커스텀 React 훅
│   ├── lib/              # 유틸리티 함수
│   └── types/            # TypeScript 타입 정의
├── server/                # Node.js 백엔드
│   ├── routes/           # API 라우트
│   ├── models/           # MongoDB 모델
│   ├── middleware/       # 미들웨어
│   └── utils/            # 유틸리티 함수
└── docs/                  # 프로젝트 문서
```

### 개발 명령어

```bash
# 개발 서버
npm run dev

# 빌드
npm run build

# 프로덕션 빌드
npm run build:prod

# 번들 분석
npm run build:analyze

# 성능 테스트
npm run performance

# Lighthouse 테스트
npm run lighthouse

# 자동 최적화
npm run optimize
```

## 🚨 주의사항

### 컴파일러 오류
- **TypeScript 컴파일 오류는 빌드 과정에서만 발견**됩니다
- 편집기에서는 미리 감지할 수 없습니다
- 점진적 오류 해결이 효과적입니다

### 의존성 관리
- 최신 버전의 라이브러리는 API가 변경될 수 있습니다
- 새로운 버전 사용 시 공식 문서 참조가 필수입니다
- 호환성 문제 시 `--legacy-peer-deps` 플래그를 사용하세요

## �� 문서

### 📚 상세 문서
- **[📖 프로젝트 가이드](docs/프로젝트-가이드.md)** - **모든 내용을 포함한 종합 가이드** ⭐
- [API 문서](docs/API-문서.md) - 백엔드 API 엔드포인트
- [데이터베이스 스키마](docs/데이터베이스-스키마.md) - MongoDB 컬렉션 구조
- [배포 가이드](docs/배포-가이드.md) - Vercel 배포 방법

---

## 🤝 기여하기

### 기여 방법
1. 이 저장소를 포크합니다
2. 새로운 기능 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add amazing feature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성합니다

### 개발 가이드라인
- TypeScript 사용을 권장합니다
- ESLint 규칙을 준수합니다
- 컴포넌트는 재사용 가능하게 설계합니다
- 적절한 타입 정의를 제공합니다

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 📞 연락처

- **프로젝트 관리자**: [Your Name](mailto:your.email@example.com)
- **기술 지원**: [GitHub Issues](https://github.com/your-username/jj-swim-lab/issues)
- **문서**: [GitHub Wiki](https://github.com/your-username/jj-swim-lab/wiki)

---

**JJ Swim Lab으로 수영 교육의 새로운 경험을 만들어보세요! 🏊‍♂️✨**

**📖 자세한 내용은 [프로젝트 가이드](docs/프로젝트-가이드.md)를 참조하세요!**
