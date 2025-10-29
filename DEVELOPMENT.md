# 🏊 JJ Swim Lab - 개발 기록

## 📊 **최신 작업 현황** (2025-10-28)

### 🚀 **강사 수업 관리 기능 구현 필요** 🔧
**진행 상태: 기획 완료 → 구현 대기**

#### **요청 기능:**
센터 강사 관리 페이지에서 "수업관리" 버튼을 클릭하면 강사의 일일 수업 일정을 관리하는 기능

#### **구현 계획:**

1. **서버 API 엔드포인트 추가** (`server/src/routes/instructors.ts` 또는 `server/src/routes/center-admin.ts`)
   - `GET /api/instructors/:instructorId/lessons?date=YYYY-MM-DD` - 특정 날짜의 수업 일정 조회
   - `PUT /api/lessons/:lessonId/status` - 수업 상태 업데이트 (scheduled → in_progress → completed)
   - `PUT /api/lessons/:lessonId/progress` - 수업 진행 기록 저장

2. **데이터 모델 설계**
   - Course 모델에서 강사의 수업 일정 추출
   - 단체반 (group): Course.schedule에서 일정 추출
   - 개인레슨 (personal): PersonalLesson 모델에서 일정 추출
   - 수업 상태: scheduled, in_progress, completed, cancelled, no_show

3. **UI 구현** (`client/components/center-admin/PTLessonProgress.tsx`)
   - 날짜 선택 캘린더
   - 수업 일정 타임라인
   - 상태별 액션 버튼 (시작, 완료, 취소 등)
   - 수업 완료 시 상세 피드백 입력 폼

4. **필요한 데이터:**
   - 수업 시간, 수강생 정보, 레인 정보
   - 패키지 정보 (잔여 횟수, 만료일)
   - 수업 진행 기록 (내용, 향상된 기술, 다음 목표, 만족도)

#### **구현 완료:**
- ✅ Course 모델에서 강사별 단체반 일정 추출 로직 구현
- ✅ PersonalLesson 모델 확인 및 개인레슨 일정 추출 로직 구현
- ✅ GET /api/center-admin/instructors/:instructorId/lessons API 엔드포인트 구현
- ✅ PUT /api/center-admin/lessons/:lessonId/status API 엔드포인트 구현 (기본 틀만 완료)
- ✅ PUT /api/center-admin/lessons/:lessonId/progress API 엔드포인트 구현 (기본 틀만 완료)
- ✅ PTLessonProgress 컴포넌트와 API 연동

#### **남은 작업:**
- [ ] 수업 상태 업데이트 로직 세부 구현 (Course.enrolledStudents 또는 PersonalLesson 업데이트)
- [ ] 수업 진행 기록 저장 로직 세부 구현
- [ ] 패키지 정보 연동 (잔여 횟수, 만료일)
- [ ] 테스트 및 디버깅

---

## 🐛 오류 수정 (2025-10-29)

### ❌ 강사를 변경한 개인레슨이 변경된 강사의 수업관리 목록에 표시되지 않는 문제
**상태: ✅ 해결 완료**

**문제:**
- 강사를 변경한 개인레슨이 진행수업에는 카운트되지만 수업관리 목록에는 표시되지 않음

**원인:**
- Course 모델에 `instructorId`와 `instructor` 필드가 모두 있는데, API에서 `instructorId` 필드만 체크하고 있었음
- 강사 변경 시 `instructorId` 필드만 업데이트되고 `instructor` 필드가 업데이트되지 않았거나, 반대로 `instructor` 필드만 업데이트된 경우 조회가 되지 않음

**해결 방법:**
- `/api/center-admin/instructors/:instructorId/lessons` 엔드포인트에서 `instructorId`와 `instructor` 필드 모두를 체크하도록 `$or` 조건 추가
- 강사 통계 API (`/api/center-admin/instructors/stats`)에서도 동일하게 수정
- 수강생 관리 API (`/api/center-admin/instructors/:instructorId/students-list`)에서도 동일하게 수정

**수정된 파일:**
- `server/src/routes/center-admin.ts`:
  - 단체반 조회: `instructorId` 또는 `instructor` 필드로 조회하도록 수정
  - 개인레슨 조회: `instructorId` 또는 `instructor` 필드로 조회하도록 수정
  - 강사 통계 조회: 모든 Course 조회에서 `$or` 조건 추가
  - 수강생 관리 조회: 단체반 및 개인레슨 조회에 `$or` 조건 추가

**테스트:**
- 강사 변경 후 수업관리 목록에 개인레슨이 정상적으로 표시되는지 확인 필요

### ❌ 회원이 배정되지 않은 개인레슨/단체반이 수업관리 목록에 표시되지 않는 문제
**상태: ✅ 해결 완료**

**문제:**
- 진행수업 카운트는 맞게 나오지만, 회원이 배정되지 않은 개인레슨이 수업관리 목록에는 표시되지 않음
- 개인레슨이든 단체강습이든 회원이 배정되지 않아도 표시되어야 함

**원인:**
- `transformLessons` 함수에서 `enrolledStudents`가 없으면 수업을 생성하지 않고 `return`으로 스킵하고 있었음

**해결 방법:**
- 단체반 처리: `enrolledStudents`가 있으면 학생별로 수업 생성, 없으면 과정 자체를 "회원 미배정" 상태로 하나의 수업으로 표시
- 개인레슨 처리: `enrolledStudents`가 있으면 학생별로 수업 생성, 없으면 과정 자체를 "회원 미배정" 상태로 하나의 수업으로 표시

**수정된 파일:**
- `server/src/routes/center-admin.ts`:
  - `transformLessons` 함수에서 단체반과 개인레슨 모두 `enrolledStudents`가 없어도 수업을 생성하도록 수정
  - 회원 미배정 상태: `studentName: '회원 미배정'`, `studentId: null`로 설정

**테스트:**
- 회원이 배정되지 않은 개인레슨과 단체반이 수업관리 목록에 "회원 미배정"으로 표시되는지 확인 필요

### ❌ 수강생 관리 모달에서 중복된 키 경고 발생
**상태: ✅ 해결 완료**

**문제:**
- React에서 "Encountered two children with the same key" 경고 발생
- 같은 학생 ID(`68fbf65aa173fd3f9b813f47`)가 여러 번 렌더링됨
- 같은 학생이 여러 과정(단체반 + 개인레슨)에 등록되어 있을 때 발생

**원인:**
- `InstructorStudentManagement` 컴포넌트에서 학생 카드를 렌더링할 때 `key={student._id}`만 사용
- 같은 학생이 여러 과정에 등록되면 같은 `_id`를 가진 항목이 여러 개 생김

**해결 방법:**
- Student 인터페이스에 `courseId`와 `courseName` 필드 추가
- 키를 `${student._id}_${student.courseId}`로 변경하여 학생 ID와 과정 ID를 조합하여 고유한 키 생성
- `courseId`가 없을 경우 fallback으로 `${student._id}_${index}` 사용

**수정된 파일:**
- `client/components/center-admin/InstructorStudentManagement.tsx`:
  - Student 인터페이스에 `courseId?: string`, `courseName?: string` 필드 추가
  - 학생 카드 렌더링 시 키를 `${student._id}_${student.courseId}`로 변경

**테스트:**
- 같은 학생이 여러 과정에 등록되어 있을 때 중복 키 경고가 발생하지 않는지 확인 필요
