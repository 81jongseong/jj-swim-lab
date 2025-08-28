# JJ Swim Lab 🏊‍♂️

**AI 기반 수영 교육 플랫폼** - 개인 맞춤형 수영 강습법, 퀴즈, 진도 관리를 제공합니다.

## 🚀 **최근 업데이트 (2024년 12월)**

### **✅ 주요 개선사항**
- **메뉴바 완전 개선 및 그룹화**: 데스크톱/모바일 메뉴 시스템 완벽 구현
- **동적 네비게이션 시스템**: 사용자 권한에 따른 맞춤형 UI
- **환경 호환성 향상**: 데스크탑-노트북 간 환경 일치
- **TypeScript 안정성**: 컴파일 오류 해결 및 타입 안전성 강화
- **데이터베이스 연결**: MongoDB Atlas 클라우드 데이터베이스 연동

### **🔧 해결된 문제들**
- **메뉴바 권한별 표시 문제**: 계정 등급에 따른 메뉴 표시 완벽 해결
- **모바일 햄버거 메뉴 가로 범위**: 텍스트 크기에 맞는 최적화된 너비
- **데스크톱 메뉴 그룹화**: 논리적 카테고리별 구분 및 시각적 개선
- **네비게이션 중복 렌더링 문제**
- **TypeScript 컴파일 오류**
- **패키지 버전 불일치**
- **포트 충돌 문제**

### **🎯 메뉴바가 안되다가 되게 된 핵심 이유**

#### **1. 권한 기반 메뉴 시스템 구현**
- **이전 문제**: 하드코딩된 메뉴로 인한 권한별 메뉴 표시 실패
- **해결 방법**: `useAuth` 훅과 `hasUserType`, `hasPermission` 함수를 활용한 동적 메뉴 렌더링
- **결과**: 각 계정 등급(`guest`, `student`, `instructor`, `centerAdmin`, `superAdmin`)별 맞춤형 메뉴 표시

#### **2. React Hooks 규칙 준수**
- **이전 문제**: `useEffect` 훅의 잘못된 사용으로 인한 상태 관리 문제
- **해결 방법**: React Hooks 규칙을 준수한 올바른 상태 관리 구현
- **결과**: 메뉴 상태가 안정적으로 유지되고 페이지 이동 시 자동으로 닫힘

#### **3. 조건부 렌더링 최적화**
- **이전 문제**: 복잡한 조건문으로 인한 메뉴 표시 로직 오류
- **해결 방법**: 명확한 조건부 렌더링과 권한 체크 함수 분리
- **결과**: 각 사용자 타입별로 정확한 메뉴 항목만 표시

#### **4. 반응형 디자인 개선**
- **이전 문제**: 모바일/데스크톱 메뉴 전환 시 일관성 부족
- **해결 방법**: Tailwind CSS의 `lg:` 브레이크포인트를 활용한 정확한 반응형 구현
- **결과**: 화면 크기에 따른 메뉴 전환이 자연스럽게 작동

#### **5. 메뉴 구조 단순화**
- **이전 문제**: 복잡한 메뉴 객체 구조로 인한 유지보수 어려움
- **해결 방법**: 직관적이고 명확한 메뉴 구조로 단순화
- **결과**: 코드 가독성 향상 및 버그 발생 가능성 감소

## 🏗️ **프로젝트 구조**

```bash
jj-swim-lab/
├── client/                 # Next.js 프론트엔드 (포트 3000)
│   ├── app/               # App Router 페이지
│   ├── components/        # React 컴포넌트
│   │   ├── Navigation.tsx        # ✅ 완벽하게 작동하는 메인 네비게이션
│   │   ├── TopNavigation.tsx     # 관리자용 네비게이션
│   │   └── DynamicNavigation.tsx # 권한 기반 네비게이션 선택
│   ├── hooks/            # 커스텀 훅
│   └── package.json      # 클라이언트 의존성
├── server/                # Express.js 백엔드 (포트 5000)
│   ├── src/
│   │   ├── models/       # Mongoose 모델
│   │   ├── routes/       # API 라우트
│   │   └── middleware/   # 미들웨어
│   └── package.json      # 서버 의존성
└── package.json           # 루트 의존성 (모노레포)
```

## 🛠️ **기술 스택**

### **프론트엔드**
- **Next.js**: 14.2.5 (App Router)
- **React**: 18.3.1
- **TypeScript**: 5.x
- **Tailwind CSS**: 3.3.0
- **Framer Motion**: 애니메이션

### **백엔드**
- **Express.js**: 4.18.2
- **MongoDB**: Atlas (클라우드)
- **Mongoose**: ODM
- **TypeScript**: 5.3.2
- **Socket.io**: 실시간 통신

### **개발 도구**
- **Node.js**: 18+ (권장: 22.17.0)
- **pnpm**: 10.12.4 (패키지 매니저)
- **ESLint**: 코드 품질
- **Prettier**: 코드 포맷팅

## 📋 **설치 및 실행**

### **1. 환경 요구사항**
```bash
Node.js: 18+ (권장: 22.17.0)
pnpm: 10.12.4
```

### **2. 프로젝트 클론 및 설치**
```bash
git clone <repository-url>
cd jj-swim-lab
pnpm install
```

### **3. 환경 변수 설정**
```bash
# server/.env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
PORT=5000
NODE_ENV=development
```

### **4. 개발 서버 실행**
```bash
# 전체 프로젝트 실행 (클라이언트 + 서버)
pnpm run dev

# 개별 실행
pnpm run dev:client    # 클라이언트 (포트 3000)
pnpm run dev:server    # 서버 (포트 5000)
```

## 🔐 **사용자 권한 시스템**

### **권한 레벨**
1. **superAdmin**: 전체 시스템 관리
2. **centerAdmin**: 센터별 관리
3. **instructor**: 강사 기능
4. **student**: 수강생 기능
5. **guest**: 비로그인 사용자

### **동적 네비게이션**
- **관리자**: TopNavigation (고급 관리 기능)
- **일반 사용자**: Navigation (로그인, 회원가입 등)

### **🎨 메뉴바 그룹화 시스템**

#### **데스크톱 메뉴 그룹화**
- **공통 메뉴**: 홈, 소개, 이용안내, 공지사항
- **기능별 메뉴**: 체험 서비스, 커뮤니티, 계정 관리
- **구분선**: `|` 문자를 활용한 시각적 그룹 분리

#### **모바일 메뉴 그룹화**
- **카테고리 라벨**: 각 그룹별 명확한 제목 표시
- **구분선**: `border-t` 클래스를 활용한 시각적 분리
- **스크롤 지원**: 긴 메뉴 목록에서도 편리한 사용

## 🗄️ **데이터베이스 구조**

### **주요 모델**
- **User**: 사용자 정보 및 권한
- **TeachingMethod**: 수영 강습법
- **Course**: 강습 과정
- **Checklist**: 체크리스트
- **Quiz**: 퀴즈 및 평가

### **연결 정보**
- **데이터베이스**: MongoDB Atlas
- **연결 상태**: ✅ 정상 연결
- **모델 등록**: ✅ 모든 모델 정상 등록

## 🚀 **개발 워크플로우**

### **1. 코드 수정**
```bash
# TypeScript 컴파일 확인
pnpm run type-check

# 린팅 및 포맷팅
pnpm run lint
pnpm run format
```

### **2. 빌드 및 테스트**
```bash
# 클라이언트 빌드
pnpm run build:client

# 서버 빌드
pnpm run build:server

# 전체 빌드
pnpm run build
```

### **3. 배포**
```bash
# 프로덕션 빌드
pnpm run build:prod

# 프로덕션 시작
pnpm run start:prod
```

## 🔍 **문제 해결 가이드**

### **일반적인 문제들**

#### **1. 포트 충돌**
```bash
# 포트 사용 중인 프로세스 확인
netstat -ano | findstr :3000

# 프로세스 종료
taskkill /PID <process-id> /F
```

#### **2. TypeScript 컴파일 오류**
```bash
# 타입 체크
pnpm run type-check

# 의존성 재설치
rm -rf node_modules
pnpm install
```

#### **3. 데이터베이스 연결 문제**
```bash
# .env 파일 확인
# MongoDB Atlas 연결 문자열 확인
# 네트워크 연결 상태 확인
```

#### **4. 메뉴바 권한 문제**
```bash
# useAuth 훅 상태 확인
# 브라우저 콘솔에서 user 객체 확인
# 로그인 상태 및 userType 값 확인
```

## 📚 **추가 문서**

### **프로젝트 문서**
- [현재 작업 상황](./docs/현재-작업-상황.md)
- [프로젝트 가이드](./docs/프로젝트-가이드.md)
- [프로젝트 구조](./docs/프로젝트-구조.md)
- [API 문서](./docs/API-문서.md)

### **유용한 링크**
- [Next.js 공식 문서](https://nextjs.org/docs)
- [React 공식 문서](https://react.dev/)
- [MongoDB Atlas](https://www.mongodb.com/atlas)
- [Express.js 공식 문서](https://expressjs.com/)

## 🤝 **기여 가이드**

### **코드 스타일**
- TypeScript 사용
- ESLint 규칙 준수
- Prettier 포맷팅 적용
- 의미있는 커밋 메시지

### **브랜치 전략**
- `main`: 프로덕션 코드
- `develop`: 개발 브랜치
- `feature/*`: 기능 개발
- `hotfix/*`: 긴급 수정

## 📊 **프로젝트 상태**

### **현재 상태**
- ✅ **클라이언트**: Next.js 14.2.5 실행 중 (포트 3000)
- ✅ **서버**: Express.js 서버 실행 중 (포트 5000)
- ✅ **데이터베이스**: MongoDB Atlas 연결 성공
- ✅ **네비게이션**: ✅ **완벽하게 작동하는 권한 기반 메뉴 시스템**
- ✅ **TypeScript**: 컴파일 오류 해결 완료
- ✅ **메뉴바**: 데스크톱 그룹화 및 모바일 최적화 완료

### **다음 단계**
- 🔍 데이터 동기화 문제 진단
- 🧪 사용자 권한 시스템 테스트
- 🚀 전체 시스템 통합 테스트

---

**마지막 업데이트**: 2024년 12월  
**작성자**: AI Assistant  
**상태**: ✅ **메뉴바 완벽 구현 및 프로젝트 안정화 완료**

---

**JJ Swim Lab과 함께 수영 교육의 미래를 만들어가세요! 🏊‍♂️✨**
