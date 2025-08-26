# 🔌 JJ Swim Lab - API 문서

**최종 업데이트**: 2025년 1월 26일  
**프로젝트 버전**: v1.2.0  
**기본 URL**: `http://localhost:5000/api`

---

## 📋 **API 개요**

### **인증 방식**
- **JWT (JSON Web Token)** 기반 인증
- 모든 보호된 엔드포인트에서 `Authorization: Bearer <token>` 헤더 필요
- 토큰 만료 시 자동으로 로그아웃 처리

### **응답 형식**
```json
{
  "success": true,
  "message": "작업이 성공적으로 완료되었습니다",
  "data": { ... },
  "timestamp": "2025-01-26T10:30:00.000Z"
}
```

### **오류 응답 형식**
```json
{
  "success": false,
  "error": "오류 메시지",
  "code": "ERROR_CODE",
  "timestamp": "2025-01-26T10:30:00.000Z"
}
```

---

## 🔐 **인증 API**

### **1. 사용자 로그인**
```http
POST /api/auth/login
Content-Type: application/json

{
  "userId": "user@example.com",
  "password": "password123"
}
```

**응답 예시:**
```json
{
  "success": true,
  "message": "로그인이 성공했습니다",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "user@example.com",
      "name": "홍길동",
      "userType": "instructor",
      "centerId": "507f1f77bcf86cd799439012"
    }
  }
}
```

### **2. 토큰 검증**
```http
GET /api/auth/verify
Authorization: Bearer <token>
```

**응답 예시:**
```json
{
  "success": true,
  "message": "토큰이 유효합니다",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "user@example.com",
      "name": "홍길동",
      "userType": "instructor"
    }
  }
}
```

### **3. 사용자 등록**
```http
POST /api/auth/register
Content-Type: application/json

{
  "userId": "newuser@example.com",
  "password": "password123",
  "name": "새사용자",
  "userType": "student",
  "centerId": "507f1f77bcf86cd799439012"
}
```

---

## 👥 **사용자 관리 API**

### **1. 사용자 목록 조회**
```http
GET /api/users?userType=student&centerId=507f1f77bcf86cd799439012
Authorization: Bearer <token>
```

**쿼리 파라미터:**
- `userType`: 사용자 타입 (student, instructor, centerAdmin, superAdmin)
- `centerId`: 센터 ID (선택사항)
- `page`: 페이지 번호 (기본값: 1)
- `limit`: 페이지당 항목 수 (기본값: 10)

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "userId": "student@example.com",
        "name": "학생1",
        "userType": "student",
        "centerId": "507f1f77bcf86cd799439012",
        "studentInfo": {
          "age": 15,
          "currentLevel": "beginner",
          "levelChangeHistory": []
        }
      }
    ],
    "total": 25,
    "page": 1,
    "limit": 10,
    "pages": 3
  }
}
```

### **2. 사용자 상세 정보 조회**
```http
GET /api/users/:userId
Authorization: Bearer <token>
```

### **3. 사용자 정보 수정**
```http
PUT /api/users/:userId
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "수정된 이름",
  "studentInfo": {
    "age": 16,
    "emergencyContact": "010-1234-5678"
  }
}
```

### **4. 사용자 삭제**
```http
DELETE /api/users/:userId
Authorization: Bearer <token>
```

---

## 🎯 **센터별 레벨 관리 API**

### **1. 센터별 레벨 목록 조회**
```http
GET /api/center-levels?centerId=507f1f77bcf86cd799439012
Authorization: Bearer <token>
```

**응답 예시:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "centerId": "507f1f77bcf86cd799439012",
      "name": "beginner",
      "displayName": "입문반",
      "order": 1,
      "color": "#3B82F6",
      "description": "수영을 처음 배우는 학생들을 위한 반",
      "isActive": true
    }
  ]
}
```

### **2. 새 레벨 생성**
```http
POST /api/center-levels
Authorization: Bearer <token>
Content-Type: application/json

{
  "centerId": "507f1f77bcf86cd799439012",
  "name": "expert",
  "displayName": "전문가반",
  "order": 5,
  "color": "#EF4444",
  "description": "고급 기술을 습득한 학생들을 위한 반"
}
```

### **3. 레벨 정보 수정**
```http
PUT /api/center-levels/:levelId
Authorization: Bearer <token>
Content-Type: application/json

{
  "displayName": "수정된 표시명",
  "order": 3,
  "color": "#10B981"
}
```

### **4. 레벨 삭제**
```http
DELETE /api/center-levels/:levelId
Authorization: Bearer <token>
```

---

## 👨‍🎓 **학생 레벨 관리 API**

### **1. 학생 레벨 변경**
```http
PUT /api/student-levels/:studentId/level
Authorization: Bearer <token>
Content-Type: application/json

{
  "newLevel": "intermediate",
  "reason": "기초 과정 완료로 인한 승급"
}
```

**응답 예시:**
```json
{
  "success": true,
  "message": "학생 레벨이 성공적으로 변경되었습니다",
  "data": {
    "studentId": "507f1f77bcf86cd799439011",
    "fromLevel": "beginner",
    "toLevel": "intermediate",
    "changedBy": "507f1f77bcf86cd799439014",
    "changedByType": "instructor",
    "reason": "기초 과정 완료로 인한 승급",
    "changedAt": "2025-01-26T10:30:00.000Z"
  }
}
```

### **2. 학생 레벨 변경 이력 조회**
```http
GET /api/student-levels/:studentId/level-history
Authorization: Bearer <token>
```

**응답 예시:**
```json
{
  "success": true,
  "data": [
    {
      "fromLevel": "beginner",
      "toLevel": "intermediate",
      "changedBy": "507f1f77bcf86cd799439014",
      "changedByType": "instructor",
      "reason": "기초 과정 완료로 인한 승급",
      "changedAt": "2025-01-26T10:30:00.000Z"
    }
  ]
}
```

### **3. 센터별 학생 레벨 통계**
```http
GET /api/student-levels/center/:centerId/levels
Authorization: Bearer <token>
```

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "centerId": "507f1f77bcf86cd799439012",
    "totalStudents": 45,
    "levelDistribution": {
      "beginner": 15,
      "intermediate": 20,
      "advanced": 8,
      "expert": 2
    },
    "recentChanges": [
      {
        "studentName": "학생1",
        "fromLevel": "beginner",
        "toLevel": "intermediate",
        "changedAt": "2025-01-26T10:30:00.000Z"
      }
    ]
  }
}
```

---

## 📚 **강습법 관리 API**

### **1. 강습법 목록 조회**
```http
GET /api/teaching-methods?level=beginner&centerId=507f1f77bcf86cd799439012
Authorization: Bearer <token>
```

**쿼리 파라미터:**
- `level`: 레벨 (beginner, intermediate, advanced, expert)
- `centerId`: 센터 ID
- `category`: 카테고리 (선택사항)

### **2. 새 강습법 생성**
```http
POST /api/teaching-methods
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "자유형 팔 동작",
  "description": "자유형에서 팔을 올바르게 움직이는 방법",
  "level": "intermediate",
  "category": "freestyle",
  "centerId": "507f1f77bcf86cd799439012",
  "content": "상세한 강습 내용...",
  "videoUrl": "https://example.com/video.mp4"
}
```

### **3. 강습법 수정**
```http
PUT /api/teaching-methods/:methodId
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "수정된 제목",
  "description": "수정된 설명"
}
```

### **4. 강습법 삭제**
```http
DELETE /api/teaching-methods/:methodId
Authorization: Bearer <token>
```

---

## 🏊‍♂️ **강습 과정 관리 API**

### **1. 강습 과정 목록 조회**
```http
GET /api/courses?centerId=507f1f77bcf86cd799439012&level=beginner
Authorization: Bearer <token>
```

### **2. 새 강습 과정 생성**
```http
POST /api/courses
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "초급 자유형 과정",
  "description": "자유형 기초를 배우는 8주 과정",
  "level": "beginner",
  "centerId": "507f1f77bcf86cd799439012",
  "duration": 8,
  "maxStudents": 12,
  "price": 200000
}
```

### **3. 강습 과정 수정**
```http
PUT /api/courses/:courseId
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "수정된 과정 제목",
  "maxStudents": 15
}
```

### **4. 강습 과정 삭제**
```http
DELETE /api/courses/:courseId
Authorization: Bearer <token>
```

---

## ✅ **체크리스트 관리 API**

### **1. 체크리스트 목록 조회**
```http
GET /api/checklists?centerId=507f1f77bcf86cd799439012&level=beginner
Authorization: Bearer <token>
```

### **2. 새 체크리스트 생성**
```http
POST /api/checklists
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "자유형 기초 체크리스트",
  "description": "자유형 기초 과정 완료 여부를 확인하는 체크리스트",
  "level": "beginner",
  "centerId": "507f1f77bcf86cd799439012",
  "items": [
    {
      "text": "물에 대한 두려움 극복",
      "required": true
    },
    {
      "text": "기본 호흡법 습득",
      "required": true
    }
  ]
}
```

### **3. 체크리스트 수정**
```http
PUT /api/checklists/:checklistId
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "수정된 체크리스트 제목",
  "items": [
    {
      "text": "수정된 체크 항목",
      "required": true
    }
  ]
}
```

### **4. 체크리스트 삭제**
```http
DELETE /api/checklists/:checklistId
Authorization: Bearer <token>
```

---

## 📊 **통계 및 분석 API**

### **1. 센터별 통계 요약**
```http
GET /api/analytics/center/:centerId/summary
Authorization: Bearer <token>
```

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "centerId": "507f1f77bcf86cd799439012",
    "totalUsers": 150,
    "totalStudents": 120,
    "totalInstructors": 8,
    "levelDistribution": {
      "beginner": 45,
      "intermediate": 50,
      "advanced": 20,
      "expert": 5
    },
    "recentActivity": {
      "levelChanges": 12,
      "newStudents": 8,
      "completedCourses": 15
    }
  }
}
```

### **2. 사용자 활동 로그**
```http
GET /api/analytics/activity-logs?centerId=507f1f77bcf86cd799439012&startDate=2025-01-01&endDate=2025-01-26
Authorization: Bearer <token>
```

---

## 🔒 **권한 및 보안**

### **API 접근 권한**
- **Super Admin**: 모든 API 엔드포인트 접근 가능
- **Center Admin**: 센터 관련 API 및 사용자 관리 API 접근 가능
- **Instructor**: 학생 관리 및 강습 관련 API 접근 가능
- **Student**: 개인 정보 및 학습 진행 상황 API만 접근 가능

### **데이터 격리**
- 각 센터는 자신의 데이터만 접근 가능
- 사용자는 자신의 권한에 맞는 데이터만 조회/수정 가능
- 모든 API 요청에서 사용자 권한 및 센터 소속 검증

### **입력 검증**
- 모든 입력 데이터에 대한 유효성 검사
- SQL Injection 방지를 위한 파라미터화된 쿼리 사용
- XSS 공격 방지를 위한 입력 데이터 sanitization

---

## 📈 **성능 및 제한사항**

### **API 제한**
- **요청 속도 제한**: 분당 100회 요청 (IP별)
- **파일 업로드 크기**: 최대 10MB
- **응답 시간**: 평균 200ms 이내
- **동시 연결**: 최대 1000개

### **캐싱 전략**
- **정적 데이터**: 1시간 캐시
- **사용자 데이터**: 5분 캐시
- **통계 데이터**: 15분 캐시

### **오류 처리**
- **4xx 오류**: 클라이언트 오류 (잘못된 요청, 권한 없음 등)
- **5xx 오류**: 서버 오류 (내부 서버 오류, 데이터베이스 오류 등)
- **오류 로깅**: 모든 오류는 서버 로그에 기록

---

## 🧪 **API 테스트**

### **Postman 컬렉션**
프로젝트에 포함된 Postman 컬렉션을 사용하여 API를 테스트할 수 있습니다.

### **테스트 환경**
- **개발 환경**: `http://localhost:5000/api`
- **테스트 환경**: `https://test-api.jj-swim-lab.com/api`
- **프로덕션 환경**: `https://api.jj-swim-lab.com/api`

### **테스트 계정**
```json
{
  "superAdmin": {
    "userId": "admin@jjswim.com",
    "password": "101010"
  },
  "centerAdmin": {
    "userId": "center@jjswim.com",
    "password": "101010"
  },
  "instructor": {
    "userId": "instructor@jjswim.com",
    "password": "101010"
  }
}
```

---

## 📝 **API 버전 관리**

### **현재 버전**
- **API 버전**: v1.0
- **호환성**: 하위 호환성 보장
- **업데이트 주기**: 월 1회

### **버전 관리 정책**
- 새로운 기능 추가 시 기존 API 호환성 유지
- 주요 변경사항은 새로운 엔드포인트로 제공
- 사용 중단 예정 API는 6개월 전 공지

---

## 🔗 **관련 문서**

- [프로젝트 구조 문서](./프로젝트-구조.md)
- [현재 작업 상황](./현재-작업-상황.md)
- [사용자 가이드](./사용자-가이드.md)

---

**🔌 이 API 문서는 지속적으로 업데이트되며, 최신 정보는 개발팀에 문의하시기 바랍니다.**
