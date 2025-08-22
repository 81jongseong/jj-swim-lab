# JJ Swim Lab - 수영장 관리 시스템

JJ Swim Lab은 수영장의 모든 운영을 관리할 수 있는 종합적인 웹 애플리케이션입니다.

## 🏊‍♂️ 주요 기능

### 👤 사용자 유형별 시스템

JJ Swim Lab은 4가지 사용자 유형을 지원하며, 각 유형별로 레벨 기반 기능 흐름과 권한 제어가 적용됩니다.

#### 🎓 수강생 (Student)
- **레벨**: beginner → intermediate → advanced → expert
- **주요 기능**:
  - 개인 진도 대시보드: 강사가 체크한 진도 상황 확인
  - 강습 과정 등록/관리: 수강 중인 강습 과정 확인
  - 예약 관리: 수영장 예약 및 일정 관리
  - 결제 내역: 수강료 및 기타 결제 내역 조회
  - 강습 평가: 강습 종료 후 10일 내 평가 제출
  - 공지사항: 등록 센터의 공지사항 확인

#### 👨‍🏫 강사 (Instructor)
- **레벨**: junior → senior → master → expert
- **주요 기능**:
  - 센터별 반 관리: 근무하는 센터의 반 목록 관리
  - 학생 진도 체크: 학생별 스킬 진행상황 체크 및 피드백
  - 스킬 템플릿 활용: 관리자가 설정한 스킬 목록과 연습 드릴 활용
  - 강습 내용 관리: 강습별 상세 내용 및 피드백 작성
  - 진도 관리: 학생별 진도 추적 및 목표 설정
  - 보고서: 강습 및 학생 통계 조회

#### 👨‍💼 센터 관리자 (Center Admin)
- **레벨**: assistant → manager → director
- **주요 기능**:
  - 수영장 관리: 센터별 운영시간, 요금, 시설 정보 관리
  - 사용자 관리: 센터 내 회원, 강사 계정 관리
  - 강습 과정 관리: 과정별 레벨, 요금, 일정 관리
  - 예약 관리: 수영장 예약 및 일정 관리
  - 결제 관리: 수강료 및 기타 결제 관리
  - 공지사항 관리: 센터별 공지사항 작성 및 발행
  - 통계 조회: 센터별 사용자, 강습, 결제 통계

#### 🛡️ 총관리자 (Super Admin)
- **레벨**: admin → superAdmin → systemAdmin
- **주요 기능**:
  - 전체 시스템 관리: 모든 센터 및 사용자 관리
  - 스킬 템플릿 관리: 강사가 사용할 스킬 목록과 연습 드릴 관리
  - AI 진단 알고리즘 설정: JSON 기반 AI 알고리즘 설정 및 시각적 UI 제공
  - 시스템 설정: 전체 시스템 설정 및 권한 관리
  - 통계 및 보고서: 전체 시스템 통계 조회
  - 사용자 권한 관리: 모든 사용자의 권한 및 레벨 관리

### 🎯 레벨 기반 기능 흐름 (Feature Sequence)

각 사용자 유형은 자신의 레벨에 따라 기능 접근 순서가 다르며, 단계별로 기능을 학습하고 활용할 수 있습니다.

#### 수강생 기능 흐름
1. **대시보드** → 2. **강습 과정** → 3. **예약 관리** → 4. **진도 관리** → 5. **평가 관리**

#### 강사 기능 흐름
1. **대시보드** → 2. **강습 과정** → 3. **학생 관리** → 4. **진도 관리** → 5. **평가 관리** → 6. **보고서**

#### 센터 관리자 기능 흐름
1. **대시보드** → 2. **사용자 관리** → 3. **강습 과정** → 4. **예약 관리** → 5. **결제 관리** → 6. **공지사항** → 7. **보고서**

#### 총관리자 기능 흐름
1. **대시보드** → 2. **시스템 관리** → 3. **사용자 관리** → 4. **센터 관리** → 5. **AI 설정** → 6. **보고서** → 7. **설정**

### 🗺️ 게스트 (Guest)
- **지도 기반 수영장 탐색**: 근처 수영장 찾기, 실시간 입장 인원 확인
- **수영장 상세 정보**: 운영시간, 요금, 시설 정보, 현재 상황
- **공지사항 조회**: 최신 공지사항 확인
- **회원가입/로그인**: 간편한 계정 생성

### 🎓 강습 과정 관리
- **과정 생성/수정/삭제**: 강사 및 관리자만 가능
- **과정 등록/취소**: 회원이 강습 과정에 등록/취소
- **수강생 관리**: 각 과정별 수강생 목록 및 상태 관리
- **일정 관리**: 요일별, 시간별 강습 일정 설정

### 📅 예약 시스템
- **수영장 예약**: 날짜, 시간, 레인별 예약
- **예약 관리**: 생성, 수정, 취소, 상태 변경
- **가능 시간 조회**: 실시간 예약 가능 시간 확인
- **중복 예약 방지**: 시간대별 예약 충돌 검사

### 💳 결제 시스템
- **결제 생성**: 강습 과정, 예약 등에 대한 결제
- **결제 상태 관리**: 대기, 완료, 실패, 환불 상태
- **결제 방법**: 카드, 현금, 계좌이체, 온라인
- **결제 통계**: 관리자용 매출 및 결제 통계

### 📢 공지사항 관리
- **공지사항 CRUD**: 생성, 조회, 수정, 삭제
- **발행 관리**: 공개/비공개 상태 관리
- **카테고리 분류**: 일반, 강습, 시설, 유지보수, 긴급
- **우선순위**: 낮음, 보통, 높음, 긴급

### 📊 대시보드
- **사용자별 대시보드**: 회원, 강사, 관리자별 맞춤 정보
- **통계 정보**: 사용자 수, 강습 과정, 예약, 결제 통계
- **최근 활동**: 최근 예약, 결제, 강습 과정 정보
- **실시간 데이터**: 실시간 업데이트되는 통계

### 🤖 AI 진단 알고리즘 설정 (총관리자 전용)

총관리자는 수영 교육을 위한 AI 진단 알고리즘을 JSON 기반으로 설정하고 시각적 UI를 통해 관리할 수 있습니다.

#### 주요 기능
- **JSON 기반 설정**: AI 알고리즘의 매개변수, 임계값, 가중치, 규칙을 JSON 형태로 관리
- **시각적 UI 제공**: 복잡한 JSON 설정을 직관적인 폼 인터페이스로 편집
- **템플릿 시스템**: 미리 정의된 AI 설정 템플릿 제공 (수영 분석, 성능 예측 등)
- **검증 시스템**: 설정값의 유효성을 자동으로 검증하고 오류 표시
- **내보내기/가져오기**: JSON 형태로 설정을 내보내거나 가져오기 가능
- **버전 관리**: AI 설정의 버전 관리 및 이력 추적

#### 지원하는 AI 알고리즘 타입
- **수영 분석 (swimming_analysis)**: 수영 자세와 기술 분석
- **자세 감지 (stroke_detection)**: 스트로크 자세 감지 및 분석
- **성능 예측 (performance_prediction)**: 수영 성능 향상 예측
- **루틴 생성 (routine_generation)**: 개인 맞춤 훈련 루틴 생성

#### 설정 카테고리
- **진단 (diagnostic)**: 수영 기술 진단 및 분석
- **추천 (recommendation)**: 개선 방향 추천
- **피드백 (feedback)**: 실시간 피드백 제공
- **평가 (assessment)**: 종합적인 성능 평가

#### UI 구성 요소
- **기본 정보**: 이름, 설명, 카테고리, 알고리즘 타입, 버전
- **매개변수 설정**: AI 알고리즘의 입력 매개변수 관리
- **규칙 설정**: 조건부 로직 및 액션 정의
- **UI 설정**: 사용자 인터페이스 구성 요소 정의
- **시각화 설정**: 차트 및 위젯 구성 (추후 업데이트 예정)

## 🛠 기술 스택

### Backend
- **Node.js** + **Express.js**: 서버 프레임워크
- **TypeScript**: 타입 안전성
- **MongoDB** + **Mongoose**: 데이터베이스 및 ODM
- **JWT**: 인증 토큰
- **bcryptjs**: 비밀번호 해시화
- **CORS**: 크로스 오리진 리소스 공유

### Frontend
- **Next.js**: React 프레임워크
- **TypeScript**: 타입 안전성
- **Tailwind CSS**: 스타일링
- **React Hooks**: 상태 관리

## 📁 프로젝트 구조

```
jj-swim-lab/
├── client/                 # Next.js 프론트엔드
│   ├── app/               # App Router 페이지
│   │   ├── dashboard/     # 사용자 대시보드
│   │   └── ai-config/     # AI 설정 관리 페이지
│   ├── components/        # React 컴포넌트
│   │   ├── ui/           # UI 컴포넌트
│   │   ├── UserDashboard.tsx # 사용자 대시보드 컴포넌트
│   │   └── AIConfigEditor.tsx # AI 설정 편집기 컴포넌트
│   ├── pages/            # Pages Router 페이지
│   ├── utils/            # 유틸리티 함수
│   └── package.json
├── server/                # Express.js 백엔드
│   ├── src/
│   │   ├── models/       # MongoDB 스키마
│   │   │   ├── User.ts   # 사용자 모델 (4가지 유형 지원)
│   │   │   └── AIConfig.ts # AI 설정 모델
│   │   ├── routes/       # API 라우터
│   │   │   └── ai-config.ts # AI 설정 관리 라우터
│   │   ├── middleware/   # 미들웨어
│   │   │   └── auth.ts   # 권한 기반 인증 미들웨어
│   │   └── index.ts      # 서버 진입점
│   ├── scripts/          # 스크립트
│   │   └── create-test-users.js # 테스트 사용자 생성
│   └── package.json
└── README.md
```

## 🚀 설치 및 실행

### 🚀 자동 시작 (권장)

**스마트 시작 (자동 환경 설정 + 서버 시작):**
```bash
# Windows 배치 파일 (권장)
.\start-both.bat

# PowerShell 스크립트
.\start-both.ps1

# 강제 재설정이 필요한 경우
.\start-both.ps1 -ForceSetup
```

**간단한 시작 (기본 의존성만 체크):**
```bash
.\start-simple.bat
```

### 🔧 수동 설정 (필요한 경우만)

**1. 저장소 클론**
```bash
git clone <repository-url>
cd jj-swim-lab
```

**2. 의존성 설치**
```bash
# 루트 디렉토리에서
npm run install:all

# 또는 각 디렉토리에서 개별 설치
cd client && npm install
cd ../server && npm install
```

**3. 환경 변수 설정**
```bash
# server/.env 파일 생성
cp server/.env.example server/.env

# 필요한 환경 변수 설정
MONGODB_URI=mongodb://localhost:27017/jj-swim-lab
JWT_SECRET=your-secret-key
PORT=5001
```

**4. 데이터베이스 설정**
MongoDB가 설치되어 있어야 합니다. 로컬 MongoDB 또는 MongoDB Atlas를 사용할 수 있습니다.

**5. 테스트 데이터 생성**
```bash
# 서버 디렉토리에서
cd server
node scripts/create-test-users.js
```

**6. 개발 서버 실행**
```bash
# 루트 디렉토리에서
npm run dev:both

# 또는 개별 실행
cd server && npm run dev
cd client && npm run dev
```

**7. 접속**
- **프론트엔드**: http://localhost:3000
- **백엔드 API**: http://localhost:5001
- **대시보드**: http://localhost:3000/dashboard

## 🧪 테스트

### 테스트 계정 정보

#### 수강생 (3명)
- **초급**: student1@example.com / password123
- **중급**: student2@example.com / password123  
- **고급**: student3@example.com / password123

#### 강사 (3명)
- **주니어**: instructor1@example.com / password123
- **시니어**: instructor2@example.com / password123
- **마스터**: instructor3@example.com / password123

#### 센터 관리자 (3명)
- **어시스턴트**: centeradmin1@example.com / password123
- **매니저**: centeradmin2@example.com / password123
- **디렉터**: centeradmin3@example.com / password123

#### 총관리자 (2명)
- **어드민**: superadmin1@example.com / password123
- **시스템 어드민**: superadmin2@example.com / password123

### API 테스트
```bash
# 테스트 페이지 접속
http://localhost:3000/test-api
```

## 📚 API 엔드포인트

### 인증
- `POST /api/auth/signup` - 회원가입
- `POST /api/auth/login` - 로그인
- `GET /api/auth/profile` - 프로필 조회

### 사용자 관리 (새로운 4가지 유형 지원)
- `GET /api/users` - 사용자 목록 조회 (권한별 필터링)
- `GET /api/users/profile` - 내 프로필 조회
- `GET /api/users/:id` - 특정 사용자 조회
- `PUT /api/users/:id` - 사용자 정보 수정
- `PATCH /api/users/:id/upgrade-level` - 레벨 업그레이드
- `PATCH /api/users/:id/permissions` - 권한 관리
- `PATCH /api/users/:id/feature-sequence` - 기능 시퀀스 관리
- `DELETE /api/users/:id` - 사용자 삭제
- `GET /api/users/stats/overview` - 사용자 통계 조회

### 강습 과정
- `GET /api/courses` - 강습 과정 목록
- `GET /api/courses/:id` - 특정 강습 과정 조회
- `POST /api/courses` - 강습 과정 생성 (강사/관리자)
- `PUT /api/courses/:id` - 강습 과정 수정
- `DELETE /api/courses/:id` - 강습 과정 삭제
- `POST /api/courses/:id/enroll` - 강습 과정 등록
- `POST /api/courses/:id/cancel` - 강습 과정 취소

### 예약
- `GET /api/bookings` - 예약 목록 조회
- `GET /api/bookings/:id` - 특정 예약 조회
- `POST /api/bookings` - 예약 생성
- `PUT /api/bookings/:id` - 예약 수정
- `POST /api/bookings/:id/cancel` - 예약 취소
- `PATCH /api/bookings/:id/status` - 예약 상태 변경
- `GET /api/bookings/available/:date` - 예약 가능 시간 조회

### 결제
- `GET /api/payments` - 결제 내역 조회
- `GET /api/payments/:id` - 특정 결제 조회
- `POST /api/payments` - 결제 생성
- `POST /api/payments/:id/complete` - 결제 완료 처리
- `POST /api/payments/:id/refund` - 결제 환불
- `GET /api/payments/stats/summary` - 결제 통계

### 공지사항
- `GET /api/notices` - 공지사항 목록 조회
- `GET /api/notices/:id` - 특정 공지사항 조회
- `POST /api/notices` - 공지사항 생성 (관리자)
- `PUT /api/notices/:id` - 공지사항 수정
- `DELETE /api/notices/:id` - 공지사항 삭제
- `PATCH /api/notices/:id/publish` - 공지사항 발행/비발행
- `GET /api/notices/admin/all` - 관리자용 전체 공지사항
- `GET /api/notices/admin/stats` - 공지사항 통계

### 대시보드
- `GET /api/dashboard` - 사용자별 대시보드
- `GET /api/dashboard/admin/stats` - 관리자 통계
- `GET /api/dashboard/instructor/stats` - 강사 통계

### AI 진단 알고리즘 설정 (총관리자 전용)
- `GET /api/ai-config` - AI 설정 목록 조회
- `GET /api/ai-config/:id` - 특정 AI 설정 조회
- `POST /api/ai-config` - AI 설정 생성
- `PUT /api/ai-config/:id` - AI 설정 수정
- `DELETE /api/ai-config/:id` - AI 설정 삭제
- `PATCH /api/ai-config/:id/toggle` - AI 설정 활성/비활성 토글
- `GET /api/ai-config/:id/export` - AI 설정 JSON 내보내기
- `POST /api/ai-config/import` - AI 설정 JSON 가져오기
- `POST /api/ai-config/:id/validate` - AI 설정 검증
- `GET /api/ai-config/stats/overview` - AI 설정 통계
- `GET /api/ai-config/templates/list` - AI 설정 템플릿 목록

### 수영장 (게스트용)
- `GET /api/centers` - 수영장 목록 조회 (위치 기반)
- `GET /api/centers/:id` - 수영장 상세 정보 조회
- `GET /api/centers/:id/hours` - 운영 시간 조회
- `GET /api/centers/:id/pricing` - 요금 정보 조회
- `GET /api/centers/:id/facilities` - 시설 정보 조회
- `PATCH /api/centers/:id/capacity` - 현재 입장 인원 업데이트

### 진도 관리
- `GET /api/progress/my-progress` - 내 진도 조회 (회원)
- `GET /api/progress/student/:id` - 학생 진도 조회 (강사)
- `POST /api/progress/student/:id` - 학생 진도 업데이트 (강사)
- `GET /api/progress/class/:id/students` - 반별 학생 목록 조회
- `GET /api/progress/skill-templates` - 스킬 템플릿 조회
- `POST /api/progress/evaluation` - 강습 평가 제출 (회원)
- `GET /api/progress/evaluations/available` - 평가 가능한 강습 목록

## 🔐 권한 시스템

### 레벨 기반 권한 제어
각 사용자 유형은 자신의 레벨에 따라 기능 접근이 제어됩니다.

#### 수강생 권한
- **beginner**: 기본 기능만 접근 가능
- **intermediate**: 중급 기능 추가 접근
- **advanced**: 고급 기능 추가 접근
- **expert**: 모든 기능 접근 가능

#### 강사 권한
- **junior**: 기본 강습 관리 기능
- **senior**: 학생 관리 기능 추가
- **master**: 고급 강습 및 평가 기능
- **expert**: 모든 강습 관련 기능

#### 센터 관리자 권한
- **assistant**: 기본 관리 기능
- **manager**: 사용자 관리 기능 추가
- **director**: 모든 센터 관리 기능

#### 총관리자 권한
- **admin**: 기본 시스템 관리
- **superAdmin**: 고급 시스템 관리
- **systemAdmin**: 모든 시스템 권한

### 기능별 접근 권한
- **dashboard**: 모든 사용자 접근 가능
- **courses**: 수강생, 강사, 관리자 접근 가능
- **bookings**: 수강생, 강사, 관리자 접근 가능
- **payments**: 수강생, 센터 관리자, 총관리자 접근 가능
- **notices**: 모든 사용자 접근 가능
- **progress**: 수강생, 강사, 관리자 접근 가능
- **evaluations**: 수강생, 강사 접근 가능
- **reports**: 강사, 관리자 접근 가능
- **userManagement**: 센터 관리자, 총관리자 접근 가능
- **systemSettings**: 총관리자만 접근 가능

## 📝 데이터 모델

### User (사용자) - 새로운 4가지 유형 지원
- userId, name, email, password, phone, address
- userType (student/instructor/centerAdmin/superAdmin)
- level: 사용자 레벨
- userLevelInfo: 레벨별 정보 (타입, 레벨, 다음 레벨, 진행률)
- accessPermissions: 기능별 접근 권한
- featureSequence: 기능 시퀀스 (현재 단계, 완료된 단계, 사용 가능한 단계)

#### 수강생 전용 필드
- studentInfo: 나이, 비상연락처, 건강상태, 수영 레벨, 등록/완료 강습

#### 강사 전용 필드
- instructorInfo: 경력, 자격증, 전문분야, 강사 레벨, 할당 센터, 학생 수

#### 센터 관리자 전용 필드
- centerAdminInfo: 관리 센터, 관리자 레벨, 세부 권한

#### 총관리자 전용 필드
- superAdminInfo: 시스템 권한, 관리자 레벨

### SwimmingCenter (수영장)
- name, address, location (latitude, longitude)
- phone, email, website, description
- facilities (lanes, poolLength, poolDepth, temperature, hasSauna, hasShower, hasLocker)
- operatingHours (요일별 운영시간)
- pricing (freeSwim, lesson)
- currentCapacity, maxCapacity

### Course (강습 과정)
- name, description, level, duration, price, maxStudents
- instructor (User 참조)
- schedule (요일별 시간)
- enrolledStudents (수강생 목록)

### Class (반)
- name, center, instructor, course
- level, maxStudents, currentStudents
- schedule (요일, 시작/종료 시간)
- startDate, endDate
- students (학생 목록)

### SkillTemplate (스킬 템플릿)
- name, category, level, description
- practiceDrills (연습 드릴 목록)
- commonIssues (일반적인 문제점과 해결책)
- prerequisites (선수 스킬)
- createdBy (관리자)

### Progress (진도)
- student, instructor, course, center, class
- evaluationDate, overallProgress
- skills (스킬별 진행상황)
- instructorComments, nextGoals

### Evaluation (평가)
- student, instructor, course, class
- courseEndDate, evaluationDate
- ratings (강사, 과정, 시설, 만족도)
- comments (장점, 개선점, 추가 코멘트)
- isAnonymous, isSubmitted
- 관리자 전용: centerName, centerAddress, centerPhone

### Booking (예약)
- user, date, startTime, endTime, laneNumber
- purpose, status, notes
- instructor, course (선택적)

### Payment (결제)
- user, amount, paymentMethod, status
- purpose, relatedCourse, relatedBooking
- transactionId, receiptUrl

### Notice (공지사항)
- title, content, author, category, priority
- isPublished, publishedAt, expiresAt
- attachments, viewCount, tags

## 🚀 배포

### 환경 변수 설정
프로덕션 환경에서는 다음 환경 변수를 설정해야 합니다:
- `MONGODB_URI`: MongoDB 연결 문자열
- `JWT_SECRET`: JWT 시크릿 키
- `PORT`: 서버 포트
- `NODE_ENV`: 환경 설정

### 🏗️ 빌드 및 배포

**전체 빌드:**
```bash
npm run build        # 전체 프로젝트 빌드
npm run build:client # 클라이언트만 빌드
npm run build:server # 서버만 빌드
```

**프로덕션 시작:**
```bash
npm run start:prod  # 프로덕션 모드 시작
npm start           # 기본 시작
```

**성능 최적화:**
```bash
npm run build:analyze  # 번들 분석
.\scripts\performance-check.ps1  # 성능 체크
```

### 🚀 배포 옵션

**1. Vercel (프론트엔드)**
```bash
npm run build:client
# Vercel에 배포
```

**2. Railway/Heroku (백엔드)**
```bash
npm run build:server
npm run start:prod
```

**3. Docker (전체 시스템)**
```bash
docker build -t jj-swim-lab .
docker run -p 3000:3000 -p 5000:5000 jj-swim-lab
```

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해 주세요.

---

**JJ Swim Lab** - 수영장 관리의 새로운 기준 🏊‍♂️
