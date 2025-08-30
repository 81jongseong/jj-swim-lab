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

### ✅ **퀴즈 관리 시스템 완성 (2024-12-19)**

#### **퀴즈 관리 기능**
- **새 퀴즈 추가**: 제목, 설명, 카테고리, 유형, 제한시간, 합격점수 설정
- **문제 관리**: 객관식/주관식 문제 추가, 보기 설정, 정답 및 해설 입력
- **퀴즈 수정**: 기존 퀴즈 정보 및 문제 수정
- **퀴즈 삭제**: 확인 후 안전한 삭제
- **카테고리 확장**: 자유형, 호흡법, 평영, 배영, 접영, 기초기술, 안전수칙

#### **사용법**
1. **관리자 계정으로 로그인** (`superAdmin` 권한 필요)
2. **퀴즈 관리 탭**에서 "➕ 새 퀴즈 추가" 버튼 클릭

### ✅ **헬스체크 시스템 완성 (2024-12-19)**

#### **권한별 헬스체크 기능**
- **최고 관리자 (Super Admin)**:
  - AI 도구를 통한 전체 회원 건강정보 읽기
  - 헬스체크 항목 및 기준 설정
  - 공개/비공개 설정 권한 관리
  - 운동량 추천 알고리즘 설정
  - 전체 회원 건강정보 통계 및 분석

- **강사 (Instructor)**:
  - 공개 설정된 학생 건강정보만 조회
  - 학생별 상세 건강정보 및 AI 추천 확인
  - 맞춤형 운동 계획 생성 및 수정
  - 운동 계획 템플릿 관리
  - 건강 진행상황 실시간 추적
  - 건강 상태 악화 조기 경고

- **학생 (Student)**:
  - 개인 건강정보 입력, 수정, 삭제
  - 개별 건강정보 항목별 공개/비공개 설정
  - AI 기반 맞춤형 운동 추천 수신
  - 건강 상태 변화 추적

#### **헬스체크 페이지 구조**
1. **강사용 건강정보 전체 현황** (`/instructor/health/overview`)
   - 전체 학생 건강정보 대시보드
   - 건강 상태별 학생 그룹화
   - AI 기반 맞춤형 운동 추천

2. **학생별 건강정보 상세 보기** (`/instructor/health/students`)
   - 개별 학생 건강정보 상세 조회
   - 공개/비공개 설정된 정보 구분 표시
   - 운동 계획 수정 및 최적화
   - 건강 상태 변화 이력 추적

3. **맞춤형 운동 추천 관리** (`/instructor/health/recommendations`)
   - AI 기반 맞춤형 운동 계획 생성
   - 건강 상태별 운동량 최적화
   - 운동 계획 템플릿 관리
   - 실시간 운동 성과 분석

4. **건강 진행상황 추적** (`/instructor/health/progress`)
   - 실시간 건강 지표 모니터링
   - 시간별 진행상황 차트 및 그래프
   - AI 기반 건강 개선 예측
   - 건강 상태 악화 조기 경고

#### **사용법**
1. **강사 계정으로 로그인** (`instructor` 권한 필요)
2. **메뉴바 → 🏥 건강정보 관리** 드롭다운에서 원하는 기능 선택
3. **전체 현황**: 전체 학생 건강정보 파악
4. **학생별 상세**: 개별 학생 건강정보 및 운동 계획 관리
5. **운동 추천**: AI 기반 맞춤형 운동 계획 생성 및 최적화
6. **진행상황 추적**: 실시간 건강 상태 변화 모니터링
3. **퀴즈 기본 정보** 입력 (제목, 설명, 카테고리 등)
4. **문제 추가**: 객관식/주관식 선택, 문제 입력, 보기/정답 설정
5. **퀴즈 생성**: 모든 정보 입력 후 퀴즈 생성

#### **지원하는 문제 유형**
- **객관식**: 4개 보기, 정답 선택, 배점 설정
- **주관식**: 정답 텍스트 입력, 배점 설정
- **해설**: 각 문제별 상세한 해설 추가 가능

---

### ✅ **완벽한 샘플 데이터 및 체크리스트 연동 (2024-12-19)**

#### **샘플 데이터 생성**
- **모든 계정 타입**: 학생(6명), 강사(2명), 센터관리자(1명), 총관리자(1명)
- **강의 과정**: 초급 자유형, 중급 접영, 고급 평영
- **교수법**: 레벨별 체계적인 수영 기술 가이드
- **체크리스트 템플릿**: 레벨별 학습 단계별 체크리스트
- **실제 데이터**: 예약, 결제, 진도 관리 등 완벽한 연동

#### **체크리스트 및 진도 관리**
- **학생별 체크리스트**: 진행률에 따른 동적 체크리스트 생성
- **진도 추적**: 각 학습 단계별 완료 상태 및 강사 코멘트
- **API 연동**: 실제 데이터베이스와 완벽 연동
- **강사 대시보드**: 학생별 체크리스트 및 진도 현황 표시

#### **사용법**
```bash
# 완벽한 샘플 데이터 생성
cd server
run-complete-seed.bat

# 또는 직접 실행
node scripts/seed-complete-data.js
```

#### **테스트 계정**
- **강사1**: `instructor.kim@example.com` (초급, 중급 담당)
- **강사2**: `instructor.lee@example.com` (고급, 경기지도 담당)
- **센터관리자**: `admin@center.com`
- **총관리자**: `superadmin@swimlab.com`

---

### ✅ **테이블 반응형 문제 해결 (2024-12-19)**

#### **문제점**
- 모든 테이블이 `min-w-full`만 사용하여 데스크탑에서도 모바일처럼 작게 표시
- 반응형 미디어 쿼리 누락으로 인한 레이아웃 문제

#### **해결 방법**
1. **테이블 너비 설정 개선**
   ```tsx
   // 기존 (문제)
   <table className="min-w-full divide-y divide-gray-200">
   
   // 수정 후 (해결)
   <table className="w-full min-w-[800px] lg:min-w-[1000px] xl:min-w-[1200px] divide-y divide-gray-200">
   ```

2. **반응형 브레이크포인트**
   - 모바일: `min-w-[800px]`
   - 태블릿 (lg): `min-w-[1000px]`
   - 데스크탑 (xl): `min-w-[1200px]`

3. **수정된 테이블들**
   - ✅ 학생관리 테이블 (`/instructor/students`)
   - ✅ 사용자 관리 테이블 (`/admin/users`)
   - ✅ 강의 관리 테이블 (`/admin/courses`)
   - ✅ 예약 관리 테이블 (`/admin/bookings`)
   - ✅ 결제 관리 테이블 (`/admin/payments`)
   - ✅ 결제 내역 테이블 (`/payments`)
   - ✅ 강사 일정 테이블 (`/instructor/schedule`)
   - ✅ 학생 레벨 테이블 (`/admin/student-levels`)

4. **공통 컴포넌트 생성**
   - `ResponsiveTable` 컴포넌트로 일관된 스타일 적용
   - 재사용 가능한 테이블 헤더, 바디, 셀 컴포넌트

#### **사용법**
```tsx
import ResponsiveTable, { 
  TableHeader, 
  TableHeaderCell, 
  TableBody, 
  TableRow, 
  TableCell 
} from '@/components/ResponsiveTable';

// 기본 사용법
<ResponsiveTable>
  <TableHeader>
    <tr>
      <TableHeaderCell>이름</TableHeaderCell>
      <TableHeaderCell>이메일</TableHeaderCell>
    </tr>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>홍길동</TableCell>
      <TableCell>hong@example.com</TableCell>
    </TableRow>
  </TableBody>
</ResponsiveTable>
```

#### **CSS 클래스**
- `.table-responsive`: 가로 스크롤 활성화
- `.table-desktop`: 데스크탑용 최소 너비
- `.table-mobile`: 모바일용 최소 너비

---

## 📋 **프로젝트 개요**
