# JJ Swim Lab - 수영장 관리 시스템

JJ Swim Lab은 수영장의 모든 운영을 관리할 수 있는 종합적인 웹 애플리케이션입니다.

## 🏊‍♂️ 주요 기능

### 🗺️ 게스트 (Guest)
- **지도 기반 수영장 탐색**: 근처 수영장 찾기, 실시간 입장 인원 확인
- **수영장 상세 정보**: 운영시간, 요금, 시설 정보, 현재 상황
- **공지사항 조회**: 최신 공지사항 확인
- **회원가입/로그인**: 간편한 계정 생성

### 👤 회원 (Member)
- **개인 진도 대시보드**: 강사가 체크한 진도 상황 확인
- **강습 평가**: 강습 종료 후 10일 내 평가 제출
- **개인 일정 관리**: 예약한 강습 일정 확인
- **결제 내역**: 수강료 및 기타 결제 내역 조회
- **등록 센터 공지사항**: 내가 등록한 센터의 공지사항 확인

### 👨‍🏫 강사 (Instructor)
- **센터별 반 관리**: 근무하는 센터의 반 목록 관리
- **학생 진도 체크**: 학생별 스킬 진행상황 체크 및 피드백
- **스킬 템플릿 활용**: 관리자가 설정한 스킬 목록과 연습 드릴 활용
- **강습 내용 관리**: 강습별 상세 내용 및 피드백 작성
- **진도 관리**: 학생별 진도 추적 및 목표 설정

### 👨‍💼 관리자 (Admin)
- **수영장 관리**: 센터별 운영시간, 요금, 시설 정보 관리
- **스킬 템플릿 관리**: 강사가 사용할 스킬 목록과 연습 드릴 관리
- **사용자 관리**: 회원, 강사, 관리자 계정 관리
- **강습 과정 관리**: 과정별 레벨, 요금, 일정 관리
- **전체 통계**: 사용자, 강습, 결제 통계 조회
- **공지사항 관리**: 센터별 공지사항 작성 및 발행

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
│   ├── components/        # React 컴포넌트
│   ├── pages/            # Pages Router 페이지
│   ├── utils/            # 유틸리티 함수
│   └── package.json
├── server/                # Express.js 백엔드
│   ├── src/
│   │   ├── models/       # MongoDB 스키마
│   │   ├── routes/       # API 라우터
│   │   ├── middleware/   # 미들웨어
│   │   └── index.ts      # 서버 진입점
│   └── package.json
└── README.md
```

## 🚀 설치 및 실행

### 1. 저장소 클론
```bash
git clone <repository-url>
cd jj-swim-lab
```

### 2. 의존성 설치
```bash
# 루트 디렉토리에서
pnpm install

# 또는 각 디렉토리에서 개별 설치
cd client && pnpm install
cd ../server && pnpm install
```

### 3. 환경 변수 설정
```bash
# server/.env 파일 생성
cp server/env.example server/.env

# 필요한 환경 변수 설정
MONGODB_URI=mongodb://localhost:27017/jj-swim-lab
JWT_SECRET=your-secret-key
PORT=5001
```

### 4. 데이터베이스 설정
MongoDB가 설치되어 있어야 합니다. 로컬 MongoDB 또는 MongoDB Atlas를 사용할 수 있습니다.

### 5. 서버 실행
```bash
# 개발 모드
cd server && pnpm run dev

# 또는 프로덕션 모드
cd server && pnpm start
```

### 6. 클라이언트 실행
```bash
# 새 터미널에서
cd client && pnpm run dev
```

### 7. 접속
- **프론트엔드**: http://localhost:3000
- **백엔드 API**: http://localhost:5001
- **API 문서**: http://localhost:5001/health

## 📚 API 엔드포인트

### 인증
- `POST /api/auth/signup` - 회원가입
- `POST /api/auth/login` - 로그인
- `GET /api/auth/profile` - 프로필 조회

### 사용자 관리
- `GET /api/users` - 사용자 목록 조회
- `GET /api/users/:id` - 특정 사용자 조회
- `PUT /api/users/:id` - 사용자 정보 수정
- `DELETE /api/users/:id` - 사용자 삭제

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

### 회원 (member)
- 본인 정보 조회/수정
- 강습 과정 조회/등록/취소
- 예약 생성/수정/취소
- 결제 내역 조회
- 공지사항 조회

### 강사 (instructor)
- 회원 권한 + 강사 전용 기능
- 본인 강습 과정 관리
- 수강생 관리
- 강습 일정 관리

### 관리자 (admin)
- 모든 권한
- 사용자 관리
- 모든 강습 과정 관리
- 예약 관리
- 결제 관리
- 공지사항 관리
- 통계 조회

## 🧪 테스트

### API 테스트
```bash
# 테스트 페이지 접속
http://localhost:3000/test-api
```

### 기본 테스트 계정
- **관리자**: admin / password123
- **강사**: instructor1 / password123
- **회원**: member1 / password123

### 테스트 데이터 생성
```bash
# 서버 디렉토리에서
cd server
node scripts/create-test-data.js
```

생성되는 테스트 데이터:
- 사용자: 6명 (관리자 1, 강사 2, 회원 3)
- 수영장: 2개 (강남점, 홍대점)
- 강습 과정: 2개 (자유형 기초, 자유형 심화)
- 반: 2개 (초급 A반, 중급 B반)
- 스킬 템플릿: 2개
- 진도 데이터: 1개
- 공지사항: 2개

## 📝 데이터 모델

### User (사용자)
- userId, name, email, password, phone, address
- userType (member/instructor/admin)
- 강사 전용: experience, certifications, specialties

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

### Course (강습 과정)
- name, description, level, duration, price, maxStudents
- instructor (User 참조)
- schedule (요일별 시간)
- enrolledStudents (수강생 목록)

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

### 빌드
```bash
# 클라이언트 빌드
cd client && pnpm build

# 서버 빌드
cd server && pnpm build
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
