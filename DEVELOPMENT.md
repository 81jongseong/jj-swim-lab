# 개발 문서

## 건강 지표와 운동 프로그램 생성

### 신사구체여과율(eGFR)과 당화혈색소(HbA1c)의 의미

#### 1. 신사구체여과율 (eGFR, Estimated Glomerular Filtration Rate)
- **의미**: 신장이 혈액을 얼마나 잘 여과하는지를 나타내는 지표
- **정상 범위**: 90mL/min/1.73㎡ 이상
- **운동 프로그램 생성 시 영향**:
  - eGFR < 60: 신장 기능 저하 (만성 신장 질환 3기 이상)
    - 운동 강도 20% 감소
    - 저강도 운동 권장
    - 운동 중 혈압 모니터링 필수
    - 충분한 수분 섭취 필요
  - eGFR < 30: 신장 기능 심각 저하 (만성 신장 질환 4-5기)
    - 운동 강도 40% 감소
    - 고강도 운동 금지 (접영 제한)
    - 의료진 상담 필수

#### 2. 당화혈색소 (HbA1c, Hemoglobin A1c)
- **의미**: 최근 2~3개월간의 평균 혈당 수치를 반영하는 지표
- **정상 범위**: 4~5.6%
- **당뇨 전단계**: 5.7~6.4%
- **당뇨병 진단**: 6.5% 이상
- **운동 프로그램 생성 시 영향**:
  - HbA1c 6.5~6.9%: 혈당 조절 양호
    - 운동 강도 10% 감소
    - 정상 운동 가능하나 주의 필요
    - 운동 전후 혈당 모니터링 필수
  - HbA1c 7.0~7.9%: 혈당 조절 개선 필요
    - 운동 강도 15% 감소
    - 점진적 운동 강도 증가
    - 저혈당 증상 모니터링 필요
  - HbA1c ≥ 8.0%: 혈당 조절 불량
    - 운동 강도 25% 감소
    - 중등도 강도 운동 권장
    - 의료진 상담 후 운동 시작 권장
  - 공통 주의사항:
    - 운동 전후 혈당 모니터링 필수
    - 저혈당 증상 모니터링 필요
    - 발 상태 정기 점검 권장

### 구현 위치
- `client/swim-training-engine/src/engine/swim-plan.ts`의 `handleSpecialConditions` 함수에 eGFR과 HbA1c 평가 로직 추가
- `client/swim-training-engine/src/engine/health-policy.ts`의 `medicalClearanceNeeded` 함수에 의료 승인 필요 여부 판단 로직 추가

---

## 오류 사항 및 해결 방법

### 🔴 반복 발생 오류

#### 0. **JWT 토큰 만료 오류**
- **오류 메시지**: `JWT 토큰 검증 실패: jwt expired`, `TokenExpiredError: jwt expired`
- **발생 위치**: `server/src/middleware/auth.ts:164`, `client/utils/api.ts:352`
- **원인**: 
  - JWT 토큰이 만료되었는데 클라이언트에서 계속 사용하려고 시도
  - 토큰 만료 시간(expiredAt)이 지나면 서버에서 401 오류 반환
  - 클라이언트에서 만료된 토큰을 자동으로 제거하지 않음
- **해결 방법**:
  1. 서버의 `auth.ts` 미들웨어에서 토큰 만료 오류를 명확하게 처리:
     - `TokenExpiredError` 감지 시 만료 시간 정보와 함께 401 응답
     - 응답에 `code: 'TOKEN_EXPIRED'` 포함
  2. 클라이언트의 `api.ts`에서 토큰 만료 오류 감지:
     - 401 응답의 `code`가 `TOKEN_EXPIRED`인 경우 자동 로그아웃
     - localStorage와 sessionStorage에서 토큰 및 사용자 정보 제거
     - 홈 페이지로 리다이렉트 (로그인 페이지가 아닌 경우)
  3. 토큰 만료 시 사용자에게 친화적인 메시지 표시
- **예방 방법**:
  - 토큰 만료 시간을 적절하게 설정 (예: 24시간)
  - 토큰 만료 전 자동 갱신 로직 구현 (향후)
  - 클라이언트에서 토큰 만료 시간을 확인하고 만료 전에 갱신 요청
- **상태**: ✅ 해결됨 (2025-01-22)

#### 1. **JSX 구문 오류 - React Fragment 미닫힘**
- **오류 메시지**: `Unexpected token 'div'. Expected jsx identifier`, `Expected corresponding closing tag for JSX fragment`
- **발생 위치**: `client/app/instructor/checklist/page.tsx:301`, `client/app/instructor/checklist/page.tsx:664`
- **원인**: 
  - `<>` (React Fragment)를 열었지만 `</>`로 닫지 않음
  - 탭별 조건부 렌더링에서 Fragment가 제대로 닫히지 않음
- **해결 방법**:
  1. 모든 Fragment (`<>...</>`)가 쌍으로 매칭되는지 확인
  2. 조건부 렌더링 블록이 제대로 닫혔는지 확인
  3. JSX 태그 매칭 검증 도구 사용
- **예방 방법**:
  - Fragment 사용 시 항상 닫는 태그 `</>` 확인
  - 코드 에디터의 JSX 태그 하이라이팅 기능 활용
  - 조건부 렌더링 블록을 명확하게 구분하여 작성
- **상태**: ✅ 해결됨 (2025-01-18)

---

#### 4. **레벨 체크리스트 중복 관리 문제**
- **오류 메시지**: 실제 수업 체크리스트와 레벨 체크리스트가 중복 관리됨
- **발생 위치**: `server/src/routes/instructor-progress.ts`, `client/app/instructor/progress/page.tsx`
- **원인**: 
  - 실제 수업 체크리스트(Checklist, ClassChecklist)와 레벨 체크리스트(InstructorProgress.levelChecklist)가 별도로 관리됨
  - 실제 수업에서 체크한 항목이 레벨 체크리스트에 자동 반영되지 않음
  - 중복 관리로 인한 데이터 불일치 가능성
- **해결 방법**:
  1. 레벨 체크리스트를 실제 수업 체크리스트의 실시간 집계 뷰로 변경
  2. `aggregateLevelChecklist` 함수 구현:
     - 학생의 모든 Checklist에서 완료된 항목 수집 (teachingMethodId + stepName 기준)
     - 학생이 속한 반의 StudentProgress에서 완료된 항목 수집
     - 강습법의 checklist 필드와 매칭하여 레벨 체크리스트 생성
  3. 레벨 체크리스트 조회 시 실시간 집계 (저장하지 않음)
  4. 클라이언트에서 레벨 체크리스트 직접 체크/수정 불가 (읽기 전용)
- **예방 방법**:
  - 단일 소스 원칙 준수 (실제 수업 체크리스트만 원천 데이터)
  - 집계 로직을 서버에서 중앙 관리
  - 데이터 일관성 보장
- **상태**: ✅ 해결됨 (2025-01-18)

---

#### 2. **TypeScript 타입 비교 오류**
- **오류 메시지**: `This comparison appears to be unintentional because the types have no overlap`
- **발생 위치**: `client/app/instructor/checklist/page.tsx:664, 674`
- **원인**: 
  - `activeTab` 타입이 정확히 지정되지 않아 타입 추론 오류 발생
- **해결 방법**:
  1. `TabType` 타입을 명시적으로 선언하고 사용
  2. 타입 가드 함수 사용
- **예방 방법**:
  - 타입을 명시적으로 선언
  - 타입 체크를 활성화하여 오류 조기 발견
- **상태**: ✅ 해결됨 (2025-01-18)

---

#### 4. **레벨 체크리스트 중복 관리 문제**
- **오류 메시지**: 실제 수업 체크리스트와 레벨 체크리스트가 중복 관리됨
- **발생 위치**: `server/src/routes/instructor-progress.ts`, `client/app/instructor/progress/page.tsx`
- **원인**: 
  - 실제 수업 체크리스트(Checklist, ClassChecklist)와 레벨 체크리스트(InstructorProgress.levelChecklist)가 별도로 관리됨
  - 실제 수업에서 체크한 항목이 레벨 체크리스트에 자동 반영되지 않음
  - 중복 관리로 인한 데이터 불일치 가능성
- **해결 방법**:
  1. 레벨 체크리스트를 실제 수업 체크리스트의 실시간 집계 뷰로 변경
  2. `aggregateLevelChecklist` 함수 구현:
     - 학생의 모든 Checklist에서 완료된 항목 수집 (teachingMethodId + stepName 기준)
     - 학생이 속한 반의 StudentProgress에서 완료된 항목 수집
     - 강습법의 checklist 필드와 매칭하여 레벨 체크리스트 생성
  3. 레벨 체크리스트 조회 시 실시간 집계 (저장하지 않음)
  4. 클라이언트에서 레벨 체크리스트 직접 체크/수정 불가 (읽기 전용)
- **예방 방법**:
  - 단일 소스 원칙 준수 (실제 수업 체크리스트만 원천 데이터)
  - 집계 로직을 서버에서 중앙 관리
  - 데이터 일관성 보장
- **상태**: ✅ 해결됨 (2025-01-18)

---

#### 5. **최고 관리자 계정명 표시 오류**
- **오류 메시지**: 최고 관리자(superAdmin)로 로그인했는데 우측 상단에 "센터 관리자 님"으로 표시됨
- **발생 위치**: `client/components/Navigation.tsx`, `client/hooks/useAuth.tsx`
- **원인**: 
  - 데이터베이스에 저장된 사용자의 `name` 필드가 "센터 관리자"로 잘못 저장되어 있음
  - `userType`은 `superAdmin`이지만 `name`이 사용자 타입 라벨과 동일하게 저장됨
  - Navigation 컴포넌트가 `user.name`을 그대로 표시함
- **해결 방법**:
  1. Navigation 컴포넌트에 `getUserDisplayName()` 함수 추가
  2. `user.name`이 사용자 타입 라벨("센터 관리자", "최고 관리자" 등)과 같은 경우 처리:
     - superAdmin인데 name이 "센터 관리자"인 경우 → 이메일에서 이름 추출 또는 userId 사용
     - 다른 타입도 동일하게 처리
  3. 실제 이름이 있는 경우 그대로 표시
- **예방 방법**:
  - 사용자 생성 시 `name` 필드에 실제 이름을 저장하도록 검증
  - 사용자 타입 라벨과 동일한 이름 저장 방지
  - 데이터베이스 마이그레이션으로 기존 잘못된 데이터 수정
- **상태**: ✅ 해결됨 (2025-01-19)

---

#### 6. **같은 카테고리 문제가 별도 카드로 생성되는 문제**
- **오류 메시지**: 같은 카테고리(예: 운동생리학)로 생성된 문제들이 각각 별도의 퀴즈 카드로 생성됨
- **발생 위치**: `server/src/routes/quiz-question-generator.ts`, `client/app/admin/quiz-question-generator/page.tsx`
- **원인**: 
  - 각 문제를 저장할 때마다 새로운 Quiz를 생성함
  - 같은 카테고리로 생성된 기존 Quiz를 찾아서 문제를 추가하는 로직이 없음
- **해결 방법**:
  1. `save-quiz` API 엔드포인트 수정:
     - 같은 카테고리로 생성된 기존 Quiz를 찾는 로직 추가
     - 기존 Quiz가 있으면 문제를 추가, 없으면 새 Quiz 생성
     - 여러 문제를 한 번에 저장할 수 있도록 `generatedQuestions` 배열 지원
  2. 클라이언트에서 여러 문제를 한 번에 저장하도록 수정:
     - `handleSaveQuiz`에서 여러 문제를 한 번에 전송
     - 단일 문제도 같은 카테고리로 묶이도록 처리
- **예방 방법**:
  - 같은 카테고리로 생성된 문제는 항상 하나의 Quiz로 묶어서 관리
  - Quiz 저장 시 카테고리와 생성자 기준으로 기존 Quiz 검색
- **상태**: ✅ 해결됨 (2025-01-19)

---

#### 7. **퀴즈 관리 페이지 UI 개선 및 메타데이터 지원**
- **요청 사항**: 
  - 난이도 필드 제거
  - 최대 시도 회수 필드 제거
  - JSON으로 추가 항목 입력 가능하도록 개선
  - 최고 관리자 상세보기에서 모든 입력 정보 표시 (conceptBlock, originalExplanation, incorrectPoolDetails 등)
- **발생 위치**: `client/app/admin/quiz-management/page.tsx`, `server/src/models/Quiz.ts`, `server/src/routes/quiz-question-generator.ts`
- **해결 방법**:
  1. Quiz 모델에 메타데이터 필드 추가:
     - `questions` 배열에 `conceptBlock`, `originalExplanation`, `incorrectPoolDetails`, `metadata` 필드 추가
     - Quiz 전체에 `metadata` 필드 추가 (JSON 형태)
  2. 퀴즈 관리 페이지 UI 수정:
     - 난이도 필드 및 관련 통계 제거
     - 최대 시도 회수 필드 제거
     - 퀴즈 추가/수정 폼에 "추가 메타데이터 (JSON)" 필드 추가
  3. 상세보기 모달 개선:
     - 최고 관리자(`superAdmin`)일 때만 상세 정보 표시:
       - 개념 블록 (conceptBlock)
       - 원본 해설 (originalExplanation)
       - 오답 Pool 상세 (incorrectPoolDetails)
       - 문제별 메타데이터
       - 퀴즈 전체 메타데이터
     - 강사/회원은 기본 정보만 표시
  4. 퀴즈 저장 시 메타데이터 포함:
     - `quiz-question-generator` API에서 저장 시 모든 메타데이터 포함
- **예방 방법**:
  - 문제 생성 시 모든 메타데이터를 questions 배열에 저장
  - 최고 관리자는 모든 정보를 볼 수 있도록 권한 기반 UI 구현
- **상태**: ✅ 해결됨 (2025-01-19)

---

#### 3. **체크리스트 생성 시 강습법 필터링 부재**
- **오류 메시지**: 체크리스트 생성 시 모든 강습법을 가져오는 문제
- **발생 위치**: `server/src/routes/class-checklist.ts:24, 79`
- **원인**: 
  - 체크리스트 생성 시 모든 강습법을 가져옴 (`TeachingMethod.find({})`)
  - 최고관리자 강습법과 강사가 직접 등록한 강습법만 필터링해야 함
- **해결 방법**:
  1. 강습법 조회 쿼리에 필터링 조건 추가:
     - `createdByRole === 'superAdmin'` 또는 `createdByRole`이 없는 경우 (최고관리자 강습법)
     - `createdByRole === 'instructor' && createdBy === userId` (해당 강사가 직접 등록한 강습법)
  2. `isActive: true` 조건 추가
  3. 로그 추가로 디버깅 용이하게 함
- **예방 방법**:
  - 강습법 조회 시 항상 권한 기반 필터링 적용
  - 강습법 모델의 `createdByRole`과 `createdBy` 필드 활용
  - 테스트 시 다양한 사용자 권한으로 검증
- **상태**: ✅ 해결됨 (2025-01-18)

---

#### 4. **레벨 체크리스트 중복 관리 문제**
- **오류 메시지**: 실제 수업 체크리스트와 레벨 체크리스트가 중복 관리됨
- **발생 위치**: `server/src/routes/instructor-progress.ts`, `client/app/instructor/progress/page.tsx`
- **원인**: 
  - 실제 수업 체크리스트(Checklist, ClassChecklist)와 레벨 체크리스트(InstructorProgress.levelChecklist)가 별도로 관리됨
  - 실제 수업에서 체크한 항목이 레벨 체크리스트에 자동 반영되지 않음
  - 중복 관리로 인한 데이터 불일치 가능성
- **해결 방법**:
  1. 레벨 체크리스트를 실제 수업 체크리스트의 실시간 집계 뷰로 변경
  2. `aggregateLevelChecklist` 함수 구현:
     - 학생의 모든 Checklist에서 완료된 항목 수집 (teachingMethodId + stepName 기준)
     - 학생이 속한 반의 StudentProgress에서 완료된 항목 수집
     - 강습법의 checklist 필드와 매칭하여 레벨 체크리스트 생성
  3. 레벨 체크리스트 조회 시 실시간 집계 (저장하지 않음)
  4. 클라이언트에서 레벨 체크리스트 직접 체크/수정 불가 (읽기 전용)
- **예방 방법**:
  - 단일 소스 원칙 준수 (실제 수업 체크리스트만 원천 데이터)
  - 집계 로직을 서버에서 중앙 관리
  - 데이터 일관성 보장
- **상태**: ✅ 해결됨 (2025-01-18)

---

#### 8. **routes 파일들의 console.error를 logger로 교체**
- **요청 사항**: 모든 routes 파일의 console.error를 logger의 logError로 교체
- **발생 위치**: server/src/routes/*.ts (모든 routes 파일)
- **해결 방법**:
  1. logger import가 없는 파일들에 `import { logInfo, logError, logWarn, logDebug } from '../utils/logger';` 추가
  2. 모든 `console.error` 호출을 `logError`로 교체
  3. 사용하지 않는 logger import 제거 (logInfo, logWarn, logDebug 등)
  4. linter 오류 확인 및 수정
- **처리 결과**:
  - 총 처리된 파일: 약 56개 routes 파일
  - 교체된 console.error: 약 365개
  - 남은 console.error: 0개
  - linter 오류: 0개
- **예방 방법**:
  - 새로운 routes 파일 작성 시 console.error 대신 logError 사용
  - 코드 리뷰 시 console.error 사용 금지
- **상태**: ✅ 해결됨 (2025-01-19)

---

#### 9. **대소문자 불일치 문제 (반복 발생)**
- **오류 메시지**: `There are multiple modules with names that only differ in casing. This can lead to unexpected behavior when compiling on a filesystem with other case-semantic.`
- **발생 위치**: 
  - `client/components/ui/index.ts` - import 경로와 실제 파일명 불일치
  - 모든 UI 컴포넌트를 사용하는 파일들
- **원인**: 
  - Windows는 대소문자를 구분하지 않지만, Next.js/Linux는 구분함
  - `index.ts`에서 소문자로 import (`'./button'`)하지만 실제 파일은 대문자 (`Button.tsx`)
  - 파일명과 import 경로가 일치하지 않음
  - 여러 파일에서 소문자로 import하는 경로 사용
- **해결 방법**:
  1. `client/components/ui/index.ts`에서 모든 import 경로를 실제 파일명과 정확히 일치시키기:
     - `'./button'` → `'./Button'`
     - `'./barchart'` → `'./BarChart'`
     - `'./loadingspinner'` → `'./LoadingSpinner'`
     - `'./themeprovider'` → `'./ThemeProvider'`
     - `'./input'` → `'./Input'`
     - `'./badge'` → `'./Badge'`
     - `'./modal'` → `'./Modal'`
     - `'./progress'` → `'./Progress'`
  2. 모든 파일에서 `'@/components/ui/button'` → `'@/components/ui'`로 변경 (index.ts를 통해 import)
  3. 모든 파일에서 `'@/components/ui/modal'` → `'@/components/ui/Modal'` 또는 `'@/components/ui'`로 변경
  4. 모든 파일에서 `'@/components/ui/input'` → `'@/components/ui'`로 변경
  5. 모든 파일에서 `'@/components/ui/badge'` → `'@/components/ui'`로 변경
  6. 모든 파일에서 `'@/components/ui/progress'` → `'@/components/ui'`로 변경
  7. 모든 파일에서 `'@/components/ui/textarea'` → `'@/components/ui/Textarea'`로 변경
  8. 모든 파일에서 `'@/components/ui/label'` → `'@/components/ui/Label'`로 변경
  9. 모든 파일에서 `'@/components/ui/select'` → `'@/components/ui/Select'`로 변경
  10. 모든 파일에서 `'@/components/ui/tabs'` → `'@/components/ui/Tabs'`로 변경
  11. 모든 파일에서 `'@/components/ui/slider'` → `'@/components/ui/Slider'`로 변경
  12. 모든 파일에서 `'@/components/ui/switch'` → `'@/components/ui/Switch'`로 변경
  13. 모든 파일에서 `'@/components/ui/loadingspinner'` → `'@/components/ui'`로 변경
- **예방 방법**:
  - **중요**: import 경로는 항상 실제 파일명과 정확히 일치시킬 것
  - 파일명과 import 경로의 대소문자를 일치시키기
  - 가능하면 `index.ts`를 통해 import하여 대소문자 문제 방지
  - TypeScript/ESLint 설정으로 대소문자 불일치 경고 활성화
  - 코드 리뷰 시 import 경로 검증
- **상태**: ✅ 해결됨 (2025-01-22)
  - `client/components/ui/index.ts`의 모든 import 경로를 실제 파일명과 일치시킴
  - 총 50개 이상의 파일에서 import 경로 수정 완료
  - 모든 대소문자 불일치 문제 해결

---

#### 10. **Dashboard API 404 오류**
- **오류 메시지**: `Failed to load resource: the server responded with a status of 404 (Not Found)`, `대시보드 통계를 가져올 수 없습니다: 404`
- **발생 위치**: `client/lib/api/dashboard.ts:42`, `client/app/admin/dashboard/page.tsx:57`
- **원인**: 
  - 클라이언트가 `http://localhost:3000/api/dashboard/stats`를 호출 (잘못된 URL)
  - 환경 변수 `NEXT_PUBLIC_API_URL`이 설정되지 않아 기본값이 적용되지 않음
  - 서버는 `http://localhost:5000`에서 실행 중이지만 클라이언트가 다른 포트로 호출
  - 서버 라우트는 `/api/dashboard/stats`로 등록되어 있고, `authMiddleware`와 `requireRole(['superAdmin', 'centerAdmin'])`이 필요
- **해결 방법**:
  1. `dashboard.ts`에서 환경 변수 처리 개선 (클라이언트 사이드 체크 추가)
  2. 401 오류 발생 시 토큰 제거 및 로그인 페이지로 리다이렉트 처리 추가
  3. 토큰이 없을 때 기본값 반환하여 에러 방지
  4. API 호출 시 에러 핸들링 개선 (기본값 반환)
- **예방 방법**:
  - 환경 변수 `.env.local` 파일에 `NEXT_PUBLIC_API_URL=http://localhost:5000` 설정
  - API 호출 전 서버 상태 확인
  - 인증 토큰 유효성 검사
  - 권한 부족 시 사용자에게 명확한 메시지 표시
- **상태**: ✅ 해결됨 (2025-01-22)
  - `dashboard.ts`에 환경 변수 처리 및 401 오류 처리 로직 추가
  - 클라이언트 사이드에서 명시적으로 서버 URL 설정

---

#### 11. **API 인증 401 오류 (quiz-question-generator, notifications)**
- **상태**: ✅ 해결됨 (2025-11-23)

---

#### 12. **미뤄둔 작업 정리**
- **작업 내용**: 프로젝트 내 미뤄둔 작업 정리 및 문서화
- **완료 사항**:
  1. TODO 주석 목록 작성 (`docs/TODO-목록.md`)
  2. 주석 부족 파일 목록 작성 (`docs/주석-부족-파일-목록.md`)
  3. 테스트 파일 정리 계획 수립 (`docs/테스트-파일-정리-계획.md`)
  4. 미뤄둔 작업 완료 보고서 작성 (`docs/미뤄둔-작업-완료-보고서.md`)
- **현황**:
  - TODO 주석: 57개 파일 (Client 38개, Server 19개)
  - console.log: 3,365개 (284개 파일) - logger 교체 필요
  - 보안 취약점: Client 6개, Server 2개
  - 테스트 파일: 110개
- **상태**: 🔄 진행 중 (2025-11-23)
  - 문서화 계획 수립 완료
  - 보안 점검 진행 중
  - console.log 교체 계획 수립 필요

---

#### 13. **보안 취약점**
- **오류 메시지**: `Failed to load resource: the server responded with a status of 401 (Unauthorized)`
- **발생 위치**: 
  - `/api/quiz-question-generator/generate`
  - `/api/notifications?limit=20` (`client/hooks/useNotifications.ts:138`)
- **원인**: 
  - 두 API 모두 `authMiddleware`가 필요
  - 인증 토큰이 없거나 만료되었을 수 있음
  - 토큰이 localStorage에 저장되어 있지 않거나, 서버로 전송되지 않음
- **해결 방법**:
  1. `useNotifications.ts`에서 401 오류 발생 시 토큰 제거 및 로그인 페이지로 리다이렉트 처리 추가
  2. 클라이언트에서 인증 토큰이 localStorage에 있는지 확인
  3. API 호출 시 Authorization 헤더에 토큰이 포함되는지 확인
  4. 토큰 만료 시 자동 로그아웃 및 로그인 페이지로 리다이렉트
  5. 401 오류 발생 시 사용자에게 명확한 메시지 표시
- **예방 방법**:
  - API 호출 전 토큰 유효성 검사
  - 토큰 만료 전 자동 갱신 로직 구현
  - 인증 실패 시 사용자 친화적인 에러 메시지 표시
- **상태**: ✅ 해결됨 (2025-01-22)
  - `useNotifications.ts`에 401 오류 처리 로직 추가
  - 토큰 만료 시 자동 로그아웃 및 로그인 페이지로 리다이렉트

---
