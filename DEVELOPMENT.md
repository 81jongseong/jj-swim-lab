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
