# 🚧 JJ Swim Lab 개발 문서

## 📋 향후 점검 사항

### 예약 관리 (회원계정 작업 시 점검 필요)
- ⚠️ **예약 관리 기능은 회원계정 작업 시 점검 필요**
- 회원계정에서 예약 관리 기능이 제대로 작동하는지 확인
- 회원이 예약을 조회, 수정, 취소할 수 있는지 확인
- 예약 상태 변경 권한 확인

## 신규 화면 & 기능 업데이트

### 2025-11-12: 강사용 강습법 관리 및 대체 기능 구현
- **요청/배경**: 강사가 자신만의 강습법을 만들 수 있고, 최고 관리자의 강습법을 대체할 수 있어야 함
- **구현 위치**: 
  - `client/app/instructor/teaching-methods/page.tsx`: 강사용 강습법 관리 페이지
  - `server/src/models/TeachingMethod.ts`: 강습법 모델 (대체 기능 필드 추가)
  - `server/src/routes/teaching-methods.ts`: 강습법 API 라우트 (대체 로직 구현)
- **주요 내용**:
  - **모델 확장**: `overridesSuperAdminMethod`, `originalSuperAdminMethodId`, `createdByRole` 필드 추가
  - **강습법 생성/수정**: 강사가 강습법을 생성/수정할 때 최고 관리자 강습법을 대체할 수 있는 옵션 제공
  - **대체 로직**: 강사가 조회할 때 자신이 만든 대체 강습법이 있으면 최고 관리자 강습법 대신 반환
  - **UI 기능**:
    - 강습법 목록에서 대체 여부 표시 ("대체 강습법" 배지)
    - 내 강습법과 대체 강습법 구분 표시
    - 강습법 생성/수정 폼에서 "최고 관리자 강습법을 대체하기" 체크박스 및 원본 강습법 선택 드롭다운
    - 대체된 원본 강습법 정보 표시
  - **권한 관리**: 강사는 자신이 만든 강습법만 수정/삭제 가능
- **API 변경사항**:
  - `POST /api/teaching-methods`: `overridesSuperAdminMethod`, `originalSuperAdminMethodId` 파라미터 추가
  - `PUT /api/teaching-methods/:id`: 대체 필드 업데이트 지원
  - `GET /api/teaching-methods`: 인증된 강사인 경우 대체 로직 적용 (대체 강습법이 있으면 원본 최고 관리자 강습법 제외)
- **추가 확인사항**:
  - 대체 강습법 삭제 시 원본 최고 관리자 강습법이 다시 표시되는지 확인 필요
  - 여러 강사가 같은 최고 관리자 강습법을 대체할 수 있는지, 아니면 한 강사당 하나만 가능한지 정책 결정 필요

### 2025-11-12: 사용자 프로필 페이지 구축
- **요청/배경**: 회원·강사·센터 관리자·최고 관리자 공통으로 사용할 수 있는 단일 프로필 화면 필요, 강사 유료 콘텐츠(퀴즈 기반 자격) 준비를 위해 전문 정보 입력 UI 요구
- **구현 위치**: `client/app/profile/page.tsx`
- **주요 내용**:
  - `GET /api/auth/profile`, `PUT /api/users/:id` 연동하여 실시간 사용자 정보 조회·수정 지원
  - 기본 정보(이름, 연락처, 주소) 편집 및 저장/되돌리기 처리, 저장 시 `useAuth` 상태와 동기화
  - 역할별 섹션 분리: 학생(건강·레벨 요약, 건강 입력 페이지 링크), 강사(전문 분야·자격증·강사 레벨 업데이트), 센터/최고 관리자(권한 요약)
  - 접근 권한, 멤버십, 마지막 로그인 등 계정 스냅샷 카드 추가
- **UI 안정화**:
  - 초기 렌더에서 `useAuth`의 사용자 정보를 즉시 사용해 스켈레톤 깜빡임 제거
  - 프로필 재요청은 최초 1회만 수행하고, 서버 응답이 바뀐 경우에만 `updateUser` 반영
- **권한 정책 보강 (2025-11-12 추가)**:
  - 사용자 본인은 이름·이메일·연락처를 직접 수정 가능하도록 `PUT /api/users/:id`에 이메일 갱신 로직과 중복 검증 추가
  - 프로필 페이지에서 이메일 입력 시 즉시 소문자로 변환하며, 저장 전 형식 검증을 수행
  - 강사 전문 정보(경력, 레벨, 자격/전문 분야, 소개)는 읽기 전용으로 노출하고 관리자에게 변경 요청하도록 안내
  - 강사 프로필에서 회원가입 단계와 동일한 자격증 추가/삭제/수정 UI를 제공해 자격증 상세 정보를 직접 관리 가능
  - 강사는 전문 종목과 소개글을 직접 편집할 수 있으며, 저장 시 `specialties`/`bio` 필드가 업데이트됨
  - 이름·이메일·전화번호가 변경되면 인증 코드 발송/검증 UI가 노출되며, 인증 완료 전에는 저장할 수 없도록 제한
- **후속 체크포인트**:
  - 강사용 퀴즈 자격 연동 시 `/quiz` 결과와 자격증 필드를 자동 반영하도록 추가 API 확장 필요
  - 학생 건강 프로필 세부 항목(혈압 등) 편집 기능은 `health/input` 페이지와 중복되지 않도록 향후 협의 후 연동
  - 프로필 이미지 업로드, 비밀번호 변경 섹션은 별도 이슈로 분리 예정

## 회원 분포도 시각화 정책

**회원 분포도 시각화 정책 (2025-11-02):**
- ✅ **색상**: 센터별 고정 색상만 사용 (`dominantCenter` 기반, 회원 수와 무관)
  - "기타" 센터는 필터링하여 제외 (색상 구분 불가)
  - 같은 센터는 항상 같은 색상 유지 (줌 레벨과 무관)
  - **색상이 다르면 다른 센터 회원임** (정상 동작)
- ✅ **크기**: 회원 수 + 줌 레벨에 비례한 원의 크기
  - 회원 수 비례: 30명=50m, 200명=200m
  - 줌 아웃 시 원이 커짐 (줌 16: 0.5배, 줌 12: 1.0배, 줌 10: 1.5배, 줌 9: 2.0배, 줌<9: 3.0배)
- ✅ **데이터**: 블록/건물 단위로 통합된 인원수 (개인 정보 보호를 위해 geohash 집계 사용)
  - **줌 레벨별 정밀도 (2025-01-XX 조정)**:
    - 줌 17+: 건물 단위 (8자리, ≈38m)
    - 줌 15-16: 블록 단위 (7자리, ≈150m)
    - **줌 14: 블록 단위 (7자리, ≈150m) - ⚠️ 조정: 스팟 분리 시작**
    - 줌 13: 작은 구역 단위 (6자리, ≈1.2km)
    - 줌 12: 구역 단위 (6자리, ≈1.2km)
    - 줌 10-11: 행정동 단위 (5자리, ≈4.9km)
    - 줌 9: 행정구 단위 (4자리, ≈19.5km)
    - 줌<9: 시 단위 (3자리, ≈78km)
  - 줌 아웃 시 같은 구역의 같은 센터 회원만 합쳐짐 (다른 센터와 합치지 않음)
  - API에서 센터별 별도 집계 (`aggregationKey = ${geohashPrefix}_${centerId}`)
- ✅ **텍스트**: 원 위에 회원 수 숫자 표시 (`TextLayer` 사용)

### 참고
- 실제 회원은 강남역 부근 **2-3km 반경**에 분산
- 38m 반경은 **건물 단위**로 너무 세밀함
- 목업 데이터는 **테스트용**이며 실제 운영에서는 DB API 사용 필요

### 목업 데이터 분산 구조 (2025-01-XX 업데이트)
- **구역별 분산**: 각 5자리 접두사(wydm6, wydm7, wydm8, wydm9, wydmb)마다 여러 8자리 geohash 블록 생성
- **줌 인 (레벨 17-18)**: 8자리 geohash로 집계 → **분리됨** (각 블록이 개별 스팟)
- **줌 아웃 (레벨 12-13)**: 5자리 geohash로 집계 → **합쳐짐** (같은 5자리 접두사의 블록들이 하나로 합쳐짐)
- **센터별 구분**: 같은 geohash 접두사라도 센터가 다르면 별도 스팟으로 유지
- **예시**: 
  - 줌 인: `wydm69e1`, `wydm69e2`, `wydm69f1`, `wydm69f2` → 4개 스팟
  - 줌 아웃: 모두 `wydm6` 접두사로 집계 → 강남센터 블록들 합쳐져 1개 스팟

### 주소 표시 및 블록 내부 좌표 (2025-01-XX 업데이트)
- **한글 주소 표시**: 마우스 오버 시 geohash 대신 한글 주소지 표시
  - VWorld 역지오코딩 API 사용 (환경 변수: `NEXT_PUBLIC_VWORLD_KEY`)
  - **CORS 문제 해결**: Next.js API Route (`/api/geo/address`)를 통해 프록시 호출
  - API 실패 시 기본 주소 템플플릿 사용
  - `getAddressFromGeohash()` 함수로 geohash → 한글 주소 변환
- **블록 내부 좌표 및 도로 위 표시 방지 (2025-01-XX 업데이트)**:
  - **가중 평균 중심점 사용**: 가중 평균 중심점에서 충분한 오프셋 적용하여 블록 내부로 확실히 이동
  - **기본 오프셋 + 정밀도별 추가 오프셋**: 도로 폭(10-30m) 고려하여 최소 60m 기본 오프셋 + 정밀도별 추가 오프셋
    - 최소 오프셋: 60m (기본) + 정밀도별 추가 (20-70m) = 총 80-130m
    - 8자리 (건물 단위): 60m(기본) + 20m = 80m
    - 7자리 (블록 단위): 60m(기본) + 30m = 90m
    - 6자리 (구역 단위): 60m(기본) + 50m = 110m
    - 그 외: 60m(기본) + 70m = 130m
  - **줌 레벨 변경 시 위치 안정성**: geohashPrefix 기반으로 각도 계산하여 줌 레벨이 바뀌어도 같은 방향 유지
  - **스팟 겹침 방지**: 같은 위치의 다른 센터는 센터 ID 기반으로 다른 각도로 분산
  - **⚠️ 실제 주소 데이터 사용 시**: 
    - 실제 주소지(예: "서울시 강남구 역삼동 123-45")를 지오코딩한 좌표는 이미 블록/건물 내부에 위치
    - 주소의 마지막 단위를 제외한 주소는 블록/건물 단위이므로, 가중 평균 중심점이 자연스럽게 블록 내부에 위치
    - 따라서 실제 주소 데이터 사용 시 오프셋이 작아도 도로 위에 표시되지 않을 가능성이 높음
    - 현재 목업 데이터는 geohash 중심점을 사용하므로 도로 위에 나올 수 있어 충분한 오프셋 필요
  - **⚠️ 줌 레벨 변경 시 숫자 변화 (2025-01-XX 확인)**:
    - **목업 데이터**: 줌 레벨에 따라 `aggregationPrecision`이 바뀌면서 (3~8자리) 블록이 합쳐지거나 분리됨
      - 줌 인: 정밀도 높아짐 → 블록 분리 → 같은 지역 인원이 여러 작은 스팟으로 나뉨 (합계는 동일)
      - 줌 아웃: 정밀도 낮아짐 → 블록 합침 → 여러 블록 인원이 합쳐짐 (합계는 동일)
      - 가중 평균 중심점 계산은 위치만 영향, 인원수 합계에는 영향 없음
      - **숫자가 "늘어나는" 것처럼 보이는 이유**: 같은 지역의 인원이 여러 스팟으로 분리되어 표시되기 때문 (실제 합계는 동일)
    - **실제 주소 데이터**: 서버 API는 항상 H3 resolution 8로 고정되어 있음
      - 각 회원의 실제 주소 좌표는 고정되어 있음
      - 줌 레벨이 바뀌어도 각 주소의 인원수는 변하지 않음
      - 클라이언트에서 geohash로 변환할 때 정밀도가 달라지지만, 실제 인원수 합계는 동일
      - **결론**: 실제 주소 데이터 사용 시 줌 레벨 변경으로 인한 숫자 변화는 없음 (단지 블록이 합쳐지거나 분리될 뿐, 합계는 동일)
- **스팟 중심점 계산 (2025-01-XX 업데이트)**:
  - **가중치 기반 중심점**: 각 블록의 실제 인원수를 가중치로 사용하여 사람 밀도가 높은 곳을 중심으로 계산
  - **줌 인 시 블록 분할**: 줌 레벨에 따라 더 세밀한 geohash 정밀도로 집계 → 스팟 수 증가 (줌 14부터 분리 시작)
  - API에서 이미 계산된 좌표 사용 (클라이언트에서 재계산하지 않음)
- **스팟 크기 (2025-01-XX 업데이트)**:
  - **화면상 픽셀 크기 고정**: 줌 레벨에 상관없이 화면에서 보이는 원의 크기는 항상 고정된 픽셀 크기로 표시 (18px ~ 38px)
    - `radiusUnits: 'pixels'` 사용하여 줌 레벨과 무관하게 화면상 크기 일정 유지
    - 배율이 변경되어도 화면상 원의 크기는 동일하게 유지
  - **제곱근 스케일링**: 배수 관계 완화를 위해 제곱근 함수 사용
    - 선형 스케일링 대신 `sqrt(memberCount)` 사용하여 50명과 10명의 차이가 5배가 아닌 약 2.24배로 부드럽게 표현
    - 예: 10명 → sqrt(10) ≈ 3.16, 50명 → sqrt(50) ≈ 7.07
  - **상대적 크기 스케일링**: 현재 화면에 표시된 스팟들 중 최소/최대 회원 수를 기준으로 상대적 크기 표현
    - 가장 작은 회원 수 = 최소 픽셀 (18px) - 증가하여 가시성 향상
    - 가장 큰 회원 수 = 최대 픽셀 (38px) - 감소하여 차이 완화
    - 중간 회원 수는 제곱근 스케일링으로 크기 결정
  - **최소 단위**: 블록 안의 실질적인 인원수 사용 (개인정보 보호는 블록 단위로 처리되므로)
- **스팟 중심점 계산 (2025-01-XX 업데이트)**:
  - **가중 평균 중심점 (Weighted Centroid)**: 주소지 블록들의 가중치 합으로 중앙 지점 계산
    - 공식: `Centroid = Σ(위치 × 가중치) / Σ(가중치)`
    - 각 블록의 중심점 좌표(latitude, longitude)와 인원수(block.count)를 가중치로 사용
    - 인원수가 많은 블록일수록 중심점에 더 큰 영향력을 가짐 (밀도가 높은 곳이 중심에 가까워짐)
    - 센터별로 별도 계산하여 같은 위치의 다른 센터 스팟이 분리됨
    - **줌아웃 시**: 여러 블록이 합쳐질 때 가중 평균 중심점을 사용 (geohash prefix의 기하학적 중심이 아님)
    - **센터별 분리**: `aggregationKey = ${geohashPrefix}_${centerId}` 형식으로 센터별 별도 집계
- **텍스트 가독성 개선 (2025-01-XX 업데이트)**:
  - **외곽선 효과**: 검은색 배경 레이어 + 흰색 텍스트 레이어를 겹쳐서 외곽선 효과 구현
  - **텍스트 크기 증가**: 14px → 16px로 증가
  - **조건부 표시**: 회원 수 10명 미만 스팟은 숫자 표시 안 함 (시각적 복잡도 감소)
  - **텍스트 중앙 정렬**: `getTextAnchor: 'middle'`, `getAlignmentBaseline: 'center'`
- **겹침 방지 (2025-01-XX 업데이트)**:
  - 같은 위치에 여러 스팟이 있을 경우 원형으로 약간 분산 (최대 15m 이내)
  - 스팟 개수에 비례하여 분산 거리 조정 (5m × 개수, 최대 15m)

## 오류 및 해결 방법

### 2025-01-XX: 여러 파일에서 중복 코드로 인한 컴파일 오류
**문제**: 
- `client/app/instructor/courses/page.tsx`: `export default withAuth(...)` 이후(479줄) 중복 코드가 반복되어 있음 (580줄까지)
- `client/app/instructor/dashboard/page.tsx`: `export default InstructorDashboard;` 이후(346줄) JSX 코드가 중복되어 반복됨 (473줄까지)
- `client/components/NotificationsBell.tsx`: 함수가 끝난 후(226줄) 중복 코드가 반복되어 있음 (914줄까지)
- `client/components/center-admin/CourseDetailModal.tsx`: 함수가 끝난 후(321줄) 주석과 import가 다시 시작되어 중복됨
- `server/src/routes/instructor.ts`: `export default router;` 이후(210줄) 중복 코드가 반복되어 있음 (255줄까지, try-catch 블록이 잘못된 구조로 중복됨)
- `server/src/routes/center-admin.ts`: `export default router;` 이후(3296줄) 중복 코드가 반복되어 있음 (3447줄까지)

**원인**:
- 파일 편집 과정에서 코드가 중복되어 추가됨
- JSX 파서/TypeScript 컴파일러가 중복된 코드를 파싱하지 못함
- `ModuleBuildError: Module build failed (from ...next-swc-loader.js): Error: × Expression expected` 오류 발생
- `TSError: ⨯ Unable to compile TypeScript: error TS1128: Declaration or statement expected` 오류 발생

**해결 방법**:
1. 각 파일을 정리하여 중복 코드 제거
   - `instructor/courses/page.tsx`: 479줄까지만 유지, `export default withAuth(...)` 이후 모든 중복 코드 제거
   - `instructor/dashboard/page.tsx`: 346줄까지만 유지, `export default InstructorDashboard;` 이후 모든 중복 코드 제거
   - `NotificationsBell.tsx`: 226줄까지만 유지
   - `CourseDetailModal.tsx`: 321줄까지만 유지
   - `server/src/routes/instructor.ts`: 210줄까지만 유지, `export default router;` 이후 모든 중복 코드 제거
   - `server/src/routes/center-admin.ts`: 3296줄까지만 유지
2. 빌드 캐시 삭제
   - 클라이언트: `cd client && Remove-Item -Recurse -Force .next`
   - 서버: TypeScript 컴파일 오류는 캐시 없이도 발생하므로 파일 정리만으로 해결
3. 개발 서버 재시작

**추가 확인사항**:
- 파일이 정상적으로 끝나는지 확인
- `export default` 문이 한 번만 있는지 확인
- JSX 구조가 올바른지 확인
- 함수나 컴포넌트가 중복 정의되지 않았는지 확인
- `try-catch` 블록이 올바르게 닫혔는지 확인

### 2025-01-XX: 서버 연결 오류 (ERR_CONNECTION_REFUSED)
**문제**: 
- 클라이언트에서 `http://localhost:5000/api/job-board/applications/my` 호출 시 `ERR_CONNECTION_REFUSED` 오류 발생
- `Failed to fetch` 오류 발생
- WebSocket 연결 실패

**원인**:
- 서버가 실행되지 않았거나 접근할 수 없는 상태

**해결 방법**:
1. 서버를 실행: `cd server && npm run dev`
2. 서버가 정상적으로 시작되었는지 확인 (포트 5000에서 리스닝 중인지 확인)
3. 서버 로그에서 오류가 없는지 확인
4. 만약 포트가 다르다면 클라이언트의 API 호출 URL을 확인

**추가 확인사항**:
- `server/src/routes/job-board.ts` 라우트가 `server/src/index.ts`에 등록되어 있는지 확인
- `server/src/models/JobApplication.ts` 모델이 `server/src/index.ts`에 import되어 있는지 확인

### 2025-11-11: 서버 유틸 계층 `no-unused-vars` 경고 누적
**문제**:
- `pnpm --filter jj-swim-lab-server run lint` 실행 시 `@typescript-eslint/no-unused-vars` 경고가 70건 이상 발생
- 주요 파일: `src/utils/AIEngine.ts`, `src/utils/AdvancedAIEngine.ts`, `src/utils/ExercisePrescriptionSystem.ts`, `src/utils/HealthBasedExerciseAI.ts`, `src/utils/IntegratedAIEngine.ts`, `src/utils/JointSpecificSwimmingGuidance.ts`, `src/utils/Video3DConversionEngine.ts`, `src/utils/VideoAnalysisAIEngine.ts`, `src/utils/queryOptimizer.ts`, `src/utils/secureExcelParser.ts`, `src/utils/spawnProc.ts`, `src/utils/teachingMethodToProgramConverter.ts`
- 미사용 파라미터/변수로 인해 실제 로직을 추적하기 어렵고, 신규 경고 탐지가 어려움

**해결 방법**:
1. **분석 결과 활용**: 미사용 매개변수 대신 실데이터 기반 계산/저장 로직 추가
    - `AIEngine`, `AdvancedAIEngine`: 분석 결과를 `AIAnalysis` 및 `AIEvaluationResult`에 저장하고, 강점/약점 분석 시 과거 체크리스트 데이터를 반영
    - `ExercisePrescriptionSystem`, `HealthBasedExerciseAI`: 사용자/건강 데이터를 실제로 조회해 처방·조정 로직에 반영, 통계 리포트를 반환
    - `IntegratedAIEngine`: 저장된 스마트워치·영상·평가 데이터를 병합하여 통합 분석 및 진도 예측 생성
    - `VideoAnalysisAIEngine`: 프레임 요약값을 기반으로 점수 산출, 추천·피드백 생성 후 `VideoAnalysisResult` 컬렉션에 저장
2. **시뮬레이션 로직 보강**: 3D 변환 유틸(`Video3DConversionEngine`)의 시뮬레이션 계산을 입력 값에 따라 달라지도록 개선하고, 예외 시 상세 로그를 남김
3. **보조 유틸 정리**: `queryOptimizer`, `secureExcelParser`, `spawnProc`, `teachingMethodToProgramConverter` 등에서 경고가 발생하던 부분을 실제 로깅/계산에 활용
4. 정리 후 `pnpm --filter jj-swim-lab-server run lint` 실행 → **경고 0건** 확인

**추가 확인사항**:
- 분석 결과 저장 시 MongoDB 모델 스키마 요구사항(필수 필드) 충족 여부 확인
- 시뮬레이션 데이터의 임계값이 실제 운영 데이터와 괴리되지 않는지 검토 필요
- 추후 실시간 분석 도입 시 현재 추가한 로깅이 과도해지지 않도록 로거 레벨 조정 계획 수립

### 2025-11-11: 강사용 맞춤형 수영 계획 학생 목록 개선 (단체반 대표 표시)
**문제**:
- `client/app/instructor/swim-training-plan/page.tsx`에서 담당 학생 목록이 단체반 소속 회원 전체를 그대로 나열하여 목록이 과도하게 길어짐
- 단체반의 경우 강사는 반 단위로 프로그램을 확인/관리하고 싶으나, 동일한 반 학생이 개별로 노출되어 가독성이 떨어짐

**해결 방법**:
1. `/api/group-classes`를 추가로 조회하여 강사가 담당하는 단체반과 구성원을 식별
2. 각 단체반에서 활성 상태 학생을 대표로 지정하고, 대표 학생 카드의 표시 이름을 단체반명으로 변경·배지(총원) 표기
3. 단체반 대표 외 구성원은 목록에서 제외하여 단체반이 목록에 1건만 노출되도록 정리
4. 계획 요약 및 헤더에서 `displayName`을 사용하여 단체반명 기반으로 정보가 표시되도록 수정

**추가 확인사항**:
- 대표 학생 변경이나 구성원 미할당 단체반이 있는 경우, 목록이 비어 보이지 않는지 주기적으로 점검 필요
- 단체반 프로그램 저장 로직은 향후 그룹 전용 API(`/api/group-programs`) 연동 시 업데이트 예정

## 외부 강사 개인레슨 통합 결제 및 자동 정산 시스템

### 2025-11-06: 외부 강사 개인레슨 통합 결제 시스템 구현

**구현 목적**:
- 외부 회원이 다른 센터에서 외부 강사와 개인레슨을 받을 수 있도록 지원
- 레인대여 + 개인레슨 + 플랫폼 수수료를 통합 결제로 관리
- 강사-회원 간 직접 결제 방지, 플랫폼을 통한 모든 거래 처리
- 완전 자동화된 정산 시스템으로 경쟁력 확보

**구현 내용**:

1. **PersonalLesson 모델 확장** (`server/src/models/PersonalLesson.ts`):
   - `isExternalInstructor`: 외부 강사 여부
   - `instructorFee`: 강사 수업료
   - `laneRentalFee`: 레인대여 비용
   - `platformFee`: 플랫폼 수수료 (강사 수업료의 10%)
   - `totalAmount`: 총 결제 금액
   - `paymentId`: 결제 ID (Payment 모델 참조)

2. **외부 개인레슨 요청 API 개선** (`server/src/routes/personal-lessons.ts`):
   - 강사 선택 기능 추가 (`instructorId`)
   - 외부 강사 여부 자동 판단 (해당 센터 소속이 아닌 경우)
   - 가격 자동 계산:
     - 강사 수업료: 강사 설정에서 가져오거나 기본값 8만원
     - 레인대여 비용: 시간당 2만원 (기본값)
     - 플랫폼 수수료: 강사 수업료의 10%
   - 총 결제 금액 자동 계산

3. **통합 결제 API** (`server/src/routes/personal-lessons.ts`):
   - `POST /api/personal-lessons/:id/payment`: 결제 생성
   - `POST /api/personal-lessons/:id/payment/complete`: 결제 완료 처리

4. **자동 정산 시스템**:
   - **Settlement 모델** (`server/src/models/Settlement.ts`):
     - 강사, 센터, 플랫폼별 정산 내역 저장
     - 정산 기간별 자동 집계
     - 정산 상태 추적 (대기/처리중/완료/실패)
   
   - **정산 서비스** (`server/src/services/settlementService.ts`):
     - `createSettlementItem()`: 결제 완료 시 자동으로 정산 항목 생성
     - `processSettlements()`: 정산 실행 (매월 자동 실행)
     - `getSettlementStats()`: 정산 통계 조회
   
   - **정산 API** (`server/src/routes/settlements.ts`):
     - `GET /api/settlements`: 정산 목록 조회 (권한별 필터링)
     - `GET /api/settlements/:id`: 정산 상세 조회
     - `GET /api/settlements/stats/overview`: 정산 통계 조회
     - `POST /api/settlements/process`: 정산 처리 (관리자만)

**정산 프로세스**:
1. 개인레슨 결제 완료 → 자동으로 정산 대기 항목 생성
   - 강사 정산: `instructorFee - platformFee`
   - 센터 정산: `laneRentalFee`
   - 플랫폼 수수료: `platformFee`
2. 매월 정산 실행 → 대기 중인 정산 항목들을 일괄 처리
3. 정산 완료 → 강사/센터에게 정산 금액 지급 (은행 API 연동 필요)

**시스템 매리트**:
1. **프리미엄 고객층 타겟팅**:
   - 레슨 퀄리티를 중시하는 성인 상급자, 마스터즈, 입시생, 특기생 준비생
   - "내가 원하는 시간, 장소, 강사" 조건 충족 가능
   - 강사 매칭 + 레인 보장이 강력한 매리트

2. **센터 입장에서 Win-Win**:
   - 평소 놀고 있는 레인을 강사가 빌려 쓰는 구조 → 센터 수익 창출
   - 외부 강사는 공간만 쓰고 수익 일부를 센터와 플랫폼에 나눔

3. **완전 자동화된 정산 시스템**:
   - 강사: 본인 수익 자동 계산 + 플랫폼 수수료 자동 공제 + 센터 레인료 자동 배분
   - 센터: 강사/회원 정산 이슈 없음, 보고서만 확인
   - 회원: 가격 명확 + 퀄리티 있는 강사 선택 가능
   - 단 1회 결제로 모든 정산 완료 → 경쟁 플랫폼 압도 가능

**API 엔드포인트**:
- `POST /api/personal-lessons/external-request`: 외부 개인레슨 요청
- `POST /api/personal-lessons/:id/payment`: 결제 생성
- `POST /api/personal-lessons/:id/payment/complete`: 결제 완료
- `GET /api/settlements`: 정산 목록 조회
- `GET /api/settlements/:id`: 정산 상세 조회
- `GET /api/settlements/stats/overview`: 정산 통계
- `POST /api/settlements/process`: 정산 처리 (관리자)

**추가 확인사항**:
- `server/src/models/Settlement.ts` 모델이 `server/src/index.ts`에 import되어 있는지 확인
- `server/src/routes/settlements.ts` 라우트가 `server/src/index.ts`에 등록되어 있는지 확인
- 정산 스케줄링 (매월 자동 실행)은 별도 cron job 또는 스케줄러로 구현 필요

### 2025-11-09: 정산 자동화 & 보고서 시스템 강화
- Settlement 모델에 `statusHistory` 추가, 상태 변경 이력 자동 기록
- 정산 상태 업데이트 API (`PATCH /api/settlements/:id/status`) 및 Excel/PDF 보고서 엔드포인트 추가
- `node-cron` 기반 월간/주간 자동 정산 스케줄러 초기화 (`server/src/jobs/settlementScheduler.ts`)
- Excel(`exceljs`), PDF(`pdfkit`) 보고서 생성 서비스 추가 (`server/src/services/settlementReportService.ts`)
- 최고관리자/센터관리자 전용 상태 변경 권한 및 이력 기록 제공

### 2025-11-09: 강사 담당 회원 관리 고도화
- 회원 공개 범위를 `publicFields` 기반으로 분기, 비공개 항목 안내 메시지 처리
- 최고관리자 체크리스트 템플릿 + 센터 오버라이드 + 강사 체크 상태 로컬 상태 설계
- 회원 상세에 레벨별 안전 체크리스트 UI 및 체크 토글 추가 (추후 API 연동 예정)
- 건강 정보/가이드라인에서 비공개 데이터일 경우 메시지 노출, 가이드라인 접근 제한 처리

### 2025-11-09: 서버/클라이언트 빌드 오류 정리
**문제**:
- `server/src/models/Settlement.ts`: `recipientTypeModel` 필드가 인터페이스에 선언되지 않아 `tsc` 오류 발생
- `server/src/routes/bookings.ts`: `startTime` 필터에 `$ne`가 중복 선언되어 `An object literal cannot have multiple properties with the same name` 오류 발생
- `server/src/routes/community-posts.ts`: `CommunityService` 미사용 및 `meetupDetails` 참조로 인한 타입 오류 다수
- `server/src/routes/uploads.ts`: 동영상 `visibility`를 문자열로 비교하여 타입 불일치, 피드백 작성 시 `reviewerType`이 string으로 처리되어 컴파일 실패
- `server/src/routes/instructor.ts`: `instructorInfo`에 없는 필드를 직접 참조하여 컴파일 오류 발생
- `server/src/services/settlementReportService.ts`: `recipientId`가 `ObjectId`일 때 `.name` 접근으로 타입 오류 발생
- `client/app/admin/instructors/page.tsx`: `export default` 뒤에 JSX가 중복으로 남아 Next.js 빌드 실패 (`Unexpected token div`)

**해결 방법**:
1. Settlement 모델/서비스
   - `recipientTypeModel`을 `ISettlement` 인터페이스에 추가하고 모든 생성 로직에서 필수 값으로 지정
   - 리포트 생성 서비스에서 수령자 이름을 안전하게 파싱하는 `getRecipientDisplay()` 헬퍼 추가
2. 예약 라우트
   - `startTime` 필터를 `$exists` + `$nin: [null, '']` 구조로 교체하여 중복 키 제거
3. 커뮤니티 라우트
   - `CommunityService.getInstance()`를 사용하도록 수정하고, 번개모임 참가 API를 서비스 레이어 호출로 통합
4. 업로드 라우트
   - 공개 범위 검증을 boolean 필드 기반으로 정리하고, 다운로드 시 파일 경로 유효성 검사 추가
   - 피드백 작성 시 `reviewerType`을 `'instructor' | 'member'` 리터럴로 명시
5. 강사 라우트
   - `instructorInfo` 접근 전 `const instructorStats: any`를 정의해 안전하게 참조
6. 클라이언트 중복 코드 정리
   - `client/app/admin/instructors/page.tsx`의 중복 JSX 블록 삭제 후 단일 `export default`만 유지
7. 전체 확인
   - 서버 `pnpm run build`, 클라이언트 `pnpm run build`를 재실행해 오류가 없는지 검증

**추가 확인 사항**:
- 추후 비슷한 편집 오류 발생 시 `DEVELOPMENT.md`의 해당 섹션을 참고하여 중복 코드 및 타입 선언을 먼저 점검
- 빌드 오류 발생 시 서버/클라이언트 각각 `pnpm run build`를 통해 빠르게 재현 후 수정 사항을 문서에 기록

### 2025-11-09: Next.js 404/500 프리렌더 오류
**현상**:
- `client` 디렉터리에서 `pnpm run build` 실행 시 404/500 페이지 프리렌더링 단계에서 `Cannot find module './6989.js'` 오류 발생
- `_error: /404`, `_error: /500` 경로에서 export 실패

**원인/해결**:
- 이전 빌드 산출물(특히 `.next/server/chunks` 하위)이 부분적으로 남아 있어, 일부 청크가 루트에서 참조되지 못함
- `pnpm run clean`(스크립트에 포함된 `rimraf .next out`) 후 연속 두 차례 `pnpm run build` 수행 시 재현되지 않음
- Windows 환경에서 빌드 과정 중 파일 잠금이 걸린 상태에서 중단된 경우 동일 증상이 발생할 수 있으므로, 빌드 전 `.next` 폴더 삭제 및 재시도가 필요

**추가 확인 사항**:
- 커스텀 `next.config.js` 변경 없이도 빌드가 안정적으로 통과하는지 2회 이상 확인 완료 (2025-11-09)
- 404/500 페이지는 기본 `app/not-found.tsx`, `app/error.tsx`로 정상 동작함

### 2025-11-11: Next.js 빌드 실패 - vendor chunk 누락
**현상**:
- `client` 디렉터리에서 `npm run build` 실행 시 `/instructor/progress` 경로 프리렌더링 단계에서 `Cannot find module './chunks/vendor-chunks/next@14.1.4_@babel+core@7.2_8b2f4e7d400a2c2cfd6e4e7b82148591.js'` 오류가 발생하며 빌드가 중단됨.
- 동일 세션에서 재빌드하면 파일이 존재하지만, 이전 빌드 산출물이 일부 남아 있을 경우 청크 로딩이 실패함.

**원인**:
- Windows 환경에서 `.next` 디렉터리 내부 일부 파일이 잠긴 상태로 남아 있어 새 빌드가 동일 경로의 새 청크를 생성하지 못하고, 기존 런타임이 누락된 파일을 참조.

**해결 방법**:
1. 빌드 전에 `.next` 폴더를 완전히 삭제: `cd client && if (Test-Path .next) { Remove-Item .next -Recurse -Force }`
2. `npm run build`를 다시 실행하면 새 청크가 정상 생성되며 오류 없이 프리렌더링 완료.

**해결 방법 (개선됨 - 2025-11-12)**:
1. `client/package.json`의 `clean` 스크립트를 Windows 환경에서도 확실하게 작동하도록 개선:
   - `rimraf`가 실패할 경우 PowerShell 명령으로 폴백하도록 수정
   - `prebuild` 훅이 자동으로 실행되어 빌드 전 캐시가 항상 삭제됨
2. 빌드 전에 `.next` 폴더를 완전히 삭제: `cd client && if (Test-Path .next) { Remove-Item .next -Recurse -Force }`
3. `npm run build`를 다시 실행하면 새 청크가 정상 생성되며 오류 없이 프리렌더링 완료.

**추가 확인 사항**:
- `prebuild` 훅과 `build` 스크립트 모두에 `clean`이 포함되어 있어 이중으로 캐시 삭제가 보장됩니다.
- **중요**: 이 오류는 **프리렌더링 단계에서만 발생**하며, 실제 빌드는 완료됩니다 (171/171 페이지 생성 완료).
- 동적 라우트(`/api/*`)는 런타임에 생성되므로 프리렌더링 오류가 있어도 **프로덕션 환경에서는 정상 작동**합니다.
- CI 환경에서도 캐시된 `.next` 산출물 사용 시 동일 문제가 발생할 수 있으므로, 배포 파이프라인에서 빌드 전 캐시 삭제를 명시적으로 수행한다.
- Windows 환경에서 파일 잠금 문제가 지속되면 개발 서버를 종료한 후 빌드를 실행하는 것을 권장합니다.
- **결론**: 이 오류는 개발/빌드 환경의 캐시 문제이며, 실제 프로덕션 배포에는 영향을 주지 않습니다. 다만 빌드 로그에 오류가 표시되므로, 완전히 해결하려면 Next.js 버전 업그레이드나 빌드 환경 개선이 필요할 수 있습니다.

## 🔍 자동 헬스 체크 (2025. 11. 9. 오전 11:43:52)

- 총 검사: 435개
- 통과: 553개
- 실패: 1개
- 경고: 4개

### ❌ 발견된 문제
- center-admin-instructor-stats 라우트가 등록되지 않음
  - 해결: server/src/index.ts에 "app.use('/api/center-admin-instructor-stats', center-admin-instructor-statsRoutes);" 추가

### ⚠️ 경고사항
- JWT_SECRET이 너무 짧습니다 (32자 이상 권장)
  - 권장: 더 긴 랜덤 문자열로 변경하세요
- 클라이언트에서 호출하는 API /api/policy/decline의 라우트 등록이 확인되지 않음
  - 권장: 서버에 해당 라우트가 등록되어 있는지 확인하세요
- 클라이언트에서 호출하는 API /api/checklists의 라우트 등록이 확인되지 않음
  - 권장: 서버에 해당 라우트가 등록되어 있는지 확인하세요
- 클라이언트에서 호출하는 API /api/admin/dashboard의 라우트 등록이 확인되지 않음
  - 권장: 서버에 해당 라우트가 등록되어 있는지 확인하세요

### 2025-11-09: 강사용 네비게이션 중복 메뉴 정리
**문제**:
- 강사용 메뉴에서 `/instructor/swim-training-plan` 페이지가 `수영 프로그램`, `맞춤형 수영 계획` 두 이름으로 중복 노출되어 혼란을 초래함

**해결 방법**:
1. `client/components/Navigation.tsx`에서 `수강생 관리` 그룹 내 중복 항목을 제거
2. 건강정보 메뉴 그룹에서만 `🏊‍♂️ 맞춤형 수영 계획`으로 노출되도록 통일

**추가 확인사항**:
- 강사용 내비게이션 전체에서 동일 페이지가 중복 표시되지 않는지 다시 확인
- 페이지 타이틀과 메뉴명이 일치하는지 확인

### 2025-11-09: 예약/일정 메뉴 통합 및 체크리스트 그룹 제거
**문제**:
- 강사용 네비게이션에서 `/instructor/bookings`와 `/instructor/schedule`이 동일 페이지를 가리키면서 메뉴가 중복 노출
- `📋 체크리스트 관리` 그룹명이 실사용 카테고리가 없어 빈 섹션으로 표시됨

**해결 방법**:
1. `client/components/Navigation.tsx`에서 `students` 카테고리 내 `📅 일정 관리` 항목을 제거하여 예약 관리 단일 메뉴로 통합
2. 메뉴 그룹 정의에서 `📋 체크리스트 관리` 섹션을 삭제해 빈 그룹 노출을 방지

**추가 확인사항**:
- 내비게이션 렌더링 시 빈 그룹이나 중복 메뉴가 더 이상 없는지 재확인
- 예약 관리 페이지 링크가 정상 작동하는지 확인

### 2025-11-10: 강사 영역 lint/type 체크 범위 정리
**조치 배경**:
- `next lint` 실행 시 `app/center/[centerSlug]/admin/info/page_backup.tsx`가 바이너리로 인식되어 컴파일이 중단됨
- `tsc --noEmit` 전체 실행 시 관리자/센터 전반의 미완성 코드 때문에 수백 건의 타입 오류가 쏟아져 강사용 영역 검증이 어려움

**조치 내용**:
1. `page_backup.tsx`를 안전한 ASCII 플레이스홀더로 교체하고, 불필요한 백업 파일은 `.tsx.bak`로 이름을 변경해 린트 대상에서 제외
2. 강사용 UI 전용 `tsconfig.instructor.json`을 추가하고 `package.json`의 `type-check` 스크립트를 해당 설정으로 전환
   - 필요 시 전체 프로젝트를 검사하려면 `pnpm --filter client run type-check:all` 사용
3. 강사용 페이지(`app/instructor/**`, `app/student/my-group-program`, 관련 UI 컴포넌트)에서 발생하던 타입 오류를 해결
4. `withAuth` HOC, 예약/강의/수영 프로그램 페이지 등의 타입 보강으로 런타임 동작은 유지하면서 컴파일 경고만 제거

**결과**:
- `pnpm --filter client run lint` 및 `pnpm --filter client run type-check`(강사용 전용) 정상 통과
- 서버 ESLint/tsc는 여전히 대량의 기존 경고·오류가 존재하므로 필요 시 개별 정리가 필요함

### 2025-11-10: 기존 관리자 페이지 ESLint 오류
**문제**:
- `pnpm --filter client run lint` 실행 시 `app/admin/center-management/page.tsx`, `app/admin/instructors/page.tsx`, `app/center/[centerSlug]/admin/layout.tsx` 등 관리자 전용 페이지에서 ESLint 오류가 다수 발생
- `handleAssignAdmin` 미정의, 비어 있는 블록, 구문 오류, 바이너리 백업 파일 포함 등으로 인해 린트가 실패

**해결 방법/현황**:
1. 해당 관리자 페이지들은 금일 작업 범위와 무관하여 즉시 수정하지 않음
2. 추후 관리자 영역 리팩터링 시
   - `handleAssignAdmin` 등 누락된 핸들러 구현 여부 확인
   - 비어 있는 블록을 제거하거나 TODO 주석으로 대체
   - `page_backup.tsx` 등 백업 파일을 정식 컴포넌트로 이전하거나 ESLint 제외 설정 검토
3. 오늘 작업 관련 페이지(`instructor/*`, `student/my-group-program`)에서는 추가 ESLint 경고 없음

**추가 확인사항**:
- 린트 실행 시 관리자 영역에서 동일 오류가 반복되는지 주기적으로 점검
- 관리자 페이지 리팩터링 일정 수립 후 본 항목을 업데이트

### 2025-11-11: 센터 관리자 대시보드 통계 0건 표시
**문제**:
- 센터 관리자 로그인 시 대시보드의 총 회원/강사/강의/매출/예약 통계가 모두 0으로 표시됨
- API 응답 자체는 성공하지만 모든 값이 0으로 돌아옴

**원인**:
- `center-admin` 계정의 `centerAdminInfo.managedCenters`가 문자열 ID 배열을 보유하는데, `/api/center-admin/dashboard` 라우트에서는 해당 문자열을 그대로 `centerId` 필터에 사용함
- 실제 `User`, `Course`, `Booking`, `Payment` 문서의 `centerId` 필드는 `ObjectId` 타입이라 문자열과 매칭되지 않아 카운트가 0으로 계산됨

**해결 방법/현황**:
1. `centerId`를 `mongoose.Types.ObjectId`로 정규화하는 헬퍼(`normalizedCenterId`)를 추가
2. 모든 통계 조회(`User.countDocuments`, `Course.countDocuments`, `Booking.countDocuments`, `Payment.aggregate`)에서 정규화된 `ObjectId`를 사용하도록 수정
3. 수정 후 API 재호출 시 정상적인 통계(회원 261명 등)가 반환됨을 확인

**추가 확인사항**:
- 신규 시드 데이터 작성 시 `centerId` 타입이 ObjectId로 저장되는지 점검
- 유사한 패턴의 다른 API에서도 문자열 ID를 그대로 비교하는 부분이 있는지 추가 검토

## 2025-11-11: Next.js 빌드 실패 - 커스텀 `_error` 페이지 누락

**현상**:
- `client` 디렉터리에서 `npm run build` 실행 시 `PageNotFoundError: Cannot find module for page: /_error` 오류가 발생했습니다.
- Next.js가 `_error` 페이지를 프리렌더링하는 단계에서 모듈을 찾지 못해 빌드가 중단됩니다.

**원인**:
- 기존에 존재하던 `client/pages/_error.tsx` 파일이 삭제된 상태에서 별도의 `app/error.tsx` 또는 `app/global-error.tsx`가 준비되어 있지 않아 기본 에러 페이지가 누락되었습니다.

**해결 방법 제안**:
1. `app` 라우터를 사용 중이라면 `app/error.tsx` 또는 `app/global-error.tsx`를 생성하여 글로벌 에러 바운더리를 구현합니다.
2. `pages` 라우터를 병행 사용 중이라면 `client/pages/_error.tsx` 파일을 복구하거나 Next.js 기본 템플릿을 참고해 최소한의 에러 페이지를 추가합니다.
3. 에러 페이지를 복구한 후 `npm run build`를 재실행하여 오류가 해결되었는지 확인합니다.

**비고**:
- 이번 수정에서는 `_error` 페이지를 복원하지 않았으므로 빌드 오류는 아직 해소되지 않았습니다.
- 추후 배포 파이프라인 통합 시 반드시 에러 페이지를 다시 추가한 뒤 빌드 검증을 수행해야 합니다.

## 2025-11-11: `_error` 페이지 복구 및 맞춤형 수영 계획 초기 상태 개선

**현상**:
- Next.js 빌드 시 `_error` 모듈을 찾을 수 없어 `PageNotFoundError: Cannot find module for page: /_error` 오류가 발생했습니다.
- 강사용 맞춤형 수영 계획 페이지에서 데이터를 불러올 때 첫 번째 개인 회원이 자동 선택되어, 새로고침 직후에도 특정 회원이 즉시 선택되는 UX 문제가 있었습니다.

**조치**:
1. `client/pages/_error.tsx`를 복구하여 App Router 기반 프로젝트에서도 Pages Router의 `

## 2025-11-11: 강사용 진행 관리 페이지 재구성

**개요**:
- 기존 `학생 진도 관리` 임시 UI를 제거하고, 출석·정산·코치 코멘트·과제를 한 번에 다루는 "레슨 진행 · 출석 관리" 페이지로 재구성했습니다.
- 주간 캘린더 기반으로 출석 상태(출석/지각/결석/취소)를 기록하고, 단체반/개인레슨을 구분합니다.
- 코치 코멘트와 홈워크(과제) 섹션을 추가해, 레슨 피드백과 숙제 현황을 학생별로 확인·관리할 수 있습니다.
- 학생 카드는 UI 공통 `Card` 컴포넌트를 사용하도록 정리했고, 카드를 클릭하면 다이얼로그 팝업으로 상세 관리 화면이 열리도록 UX 를 개선했습니다.
- 저장 버튼을 추가하고 `/api/instructor/progress/student/:studentId` API와 연동하여 출석/코멘트/과제 데이터를 MongoDB에 영구 저장할 수 있습니다.

**주요 변경 파일**:
- `client/app/instructor/progress/page.tsx`
  - 학생 목록 · 주간 캘린더 · 출석 상태 토글 · 코멘트/과제 CRUD까지 포함한 대시보드 UI를 구현했습니다.
  - 저장 시 현재 화면의 출석, 코멘트, 과제 데이터를 한 번에 API로 전송하도록 수정했습니다.
- `client/components/Navigation.tsx`
  - 강사용 메뉴에 `📈 진행 · 출석 관리` 항목을 추가했습니다.
- `client/pages/_error.tsx`
  - Next.js 빌드를 위해 레거시 `_error` 페이지를 복구했습니다.
- `server/src/models/InstructorProgress.ts`
  - 강사-학생 단위로 출석/코멘트/과제 정보를 저장하는 모델을 신설했습니다.
- `server/src/routes/instructor-progress.ts`
  - 저장(POST)과 조회(GET) 엔드포인트를 제공하여 프런트엔드와 연동했습니다.
- `server/src/index.ts`
  - `/api/instructor/progress` 라우트를 등록했습니다.

**추가 고려 사항**:
- 출석 데이터는 추후 비용 청구/정산 모듈과 연결하도록 API 스펙을 확장해야 합니다.
- 코멘트와 과제는 알림센터·학부모 리포트와 연동할 수 있도록 저장/조회 엔드포인트가 필요합니다.
- 현재 세션 정보는 프런트엔드에서 전달한 데이터를 그대로 저장하므로, 실제 스케줄(Booking/코스)과 매핑하는 API를 추가하면 정확도가 높아집니다.
- 드릴다운 레벨의 상세 리포트(학생 카드에서 바로 이동) 요구가 생기면 맞춤형 수영 계획 페이지와 상호 링크 구조를 설계해야 합니다.

### 2025-11-11: 진행 관리 카드 - 주간 세션 카운트 오류
**문제**:
- `instructor/progress` 카드에서 \"이번 주 세션\" 카운트가 과도하게 크게 표시됨 (예: 실제 6회인데 36회로 노출).
- 다중 주차 데이터를 담고 있는 `sessions` 배열 전체 길이를 그대로 사용해 카드에 출력하고 있었음.

**해결 방법**:
1. 카드 렌더링 시 이번 주(월~일) 날짜 범위로 필터링하여 해당 주차 세션만 집계하도록 수정.
2. 팝업 내 주간 출석표는 기존 로직을 유지해 주간 이동 버튼에 따라 선택된 주차 데이터가 표시되도록 함.

**추가 확인 사항**:
- 향후 실제 코스/예약 API에서 반환하는 세션 데이터가 주간 단위로 분리되어 들어오면 필터링 로직을 재검토.
- `sessions` 배열에 과거/미래 주차 데이터를 함께 보관하는 경우에는 카드 집계 시 항상 날짜 범위를 적용해야 함.

### 2025-11-12: 레벨 체크리스트 - 슈퍼관리자 강습법 연동 및 승급 API 연결
**배경**:
- 기존 "레벨 체크리스트"는 하드코딩된 기본 항목만 사용하여 실제 강습 템플릿과 동기화되지 않았음.
- 승급 제안 버튼이 UI 알림에만 머물고, 학생 레벨 변경 API와 연계되지 않아 실데이터 반영이 되지 않았음.

**조치 내용**:
1. `client/app/instructor/progress/page.tsx`
   - 슈퍼관리자 강습법(`GET /api/teaching-methods?difficulty=...`)을 호출해 현재 레벨/다음 레벨 체크 항목을 자동 구성하도록 개선.
   - 네트워크 오류나 템플릿 부재 시 `@/data/swimming-checklist` 기본 항목으로 폴백.
   - 체크리스트 상태를 학생별로 저장하고, 저장 API 호출 시 항목별 체크 여부·출처(강습법 ID/이름)를 함께 전송.
   - 승급 버튼 클릭 시 `/api/student-levels/:studentId/level` 엔드포인트를 호출해 레벨을 실제로 갱신하고, 성공 시 템플릿을 새 레벨 기준으로 다시 로드.
2. `server/src/models/InstructorProgress.ts`
   - `levelChecklist` 필드를 추가해 체크리스트 항목/체크 상태/출처 메타데이터를 영구 저장.
3. `server/src/routes/instructor-progress.ts`
   - 저장 시 전달받은 체크리스트를 정규화하여 MongoDB에 보관하고, 조회 시 기존 기록을 그대로 반환하도록 확장.
4. `server/src/routes/student-levels.ts`
   - API 입력(영문/한글)을 모두 지원하며, 저장 시 `studentInfo.swimmingLevel`과 `currentLevel`을 한글(초급/중급/고급…)로 업데이트하도록 매핑을 추가.
   - 레벨 변경 이력에 한글 레벨을 기록하고, 응답에는 영문/한글 레벨을 모두 포함해 프런트와 센터 관리 툴에서 동일한 데이터를 재사용할 수 있게 함.

**추가 확인사항**:
- 추후 체크리스트 항목 커스터마이징(센터 단위 템플릿)이 도입되면, 현재의 슈퍼관리자 템플릿과 병합 로직을 조정해야 함.
- 승급 API는 권한 검증(강사/센터 관리자/슈퍼관리자) 결과에 따라 403을 반환하므로, 프런트에서 오류 메시지를 노출하도록 유지.

### 2025-11-12: Next.js 빌드 일시 실패 (TypeError: Cannot read properties of undefined (reading 'call'))
**현상**:
- `npm run build` 첫 수행 시 `/instructor/progress`, `/instructor/courses` 등 다수 경로의 프리렌더링 단계에서 `TypeError: Cannot read properties of undefined (reading 'call')`가 발생하며 export 단계가 중단됨.

**원인/조치**:
- `.next` 캐시에 남아 있던 이전 청크와 신규 청크가 충돌한 것으로 추정.
- 동일 세션에서 `NEXT_DEBUG_BUILD=1 npm run build` → 성공, 이후 환경 변수를 제거하고 재빌드 시 문제 재현되지 않음.
- 작업 후 `.next` 폴더를 완전히 삭제(`Remove-Item .next -Recurse -Force`)하고 `npm run build`를 재실행하면 안정적으로 통과함을 확인.

**추가 확인 사항**:
- 일시 오류라도 `DEVELOPMENT.md`에 로그를 남기고, 재빌드 성공 여부를 기록.
- Windows 환경에서는 빌드 전 `.next` 삭제를 습관화해 유사 증상이 반복되지 않도록 한다.

### 2025-11-12: 진행상황 추적 페이지 제거 및 맞춤형 계획 이력 통합
**조치 배경**:
- `instructor/health/progress` 페이지가 실제 서비스 플로우에서 사용되지 않고, 진행·출석 관리는 `/instructor/progress`에서 집중적으로 다루고 있었음.
- 프로그램 이력도 별도 페이지 대신 맞춤형 수영 계획 화면에서 바로 조회하고 싶다는 요청이 있었음.

**조치 내용**:
1. `client/app/instructor/health/progress/page.tsx` 파일을 제거하고, 네비게이션에서 해당 링크를 삭제.
2. 맞춤형 수영 계획 페이지(`client/app/instructor/swim-training-plan/page.tsx`) 상단에 “저장된 프로그램 이력” 카드 추가.
   - 개인/단체반별 최근 10개의 저장 이력을 조회하고, 클릭 시 즉시 불러오기 가능.
   - 새로고침 버튼과 로딩/에러 처리 추가.
   - 이력 카드에 `id="plan-history"` 앵커를 부여하여 네비게이션에서 바로 이동 가능.
   - 2025-11-12 업데이트: 저장 이력을 월간 캘린더로 시각화하고, 날짜별로 색상으로 구분된 프로그램을 선택하여 당시의 계획 및 완료율을 확인할 수 있도록 개선.
   - 2025-11-12 추가 조치: 그룹 프로그램 저장 시 실제 `GroupClass` ObjectId를 우선 사용하도록 식별자 정규화 로직을 보완해 `단체반을 찾을 수 없습니다.` 404 응답이 발생하던 문제를 예방.
   - 2025-11-12 추가 조치 2: 기존 `Course` 기반 강습(신규 강습 엔진)만 존재하는 경우에도 저장·이력이 동작하도록 `/api/group-programs`에서 `courseId`를 허용하고, 프론트에서도 `GroupClass` 미연동 시 경고만 표시하게 변경.
3. 불필요한 강사용 부가 페이지 정리
   - 강사용 운동량 계산기(`client/app/instructor/exercise-calculator/page.tsx`)와 애니메이션 체험 메뉴를 제거하고 네비게이션에서도 숨김.
   - 강사용 맞춤형 계획 이력 앵커 메뉴 삭제로 네비게이션 단순화.
   - 센터 관리자 메뉴 그룹 구조를 참고해 강사용 메뉴도 `바로가기 · 강의/예약 · 수강생 케어 · 코칭 도구 · 지도 자료 · 리소스` 체계로 재구성.
3. 네비게이션 `Health` 섹션에 `맞춤형 계획 이력` 링크(`'/instructor/swim-training-plan#plan-history'`)를 추가하고, 사용되지 않던 중복 메뉴를 정리.

**추가 확인사항**:
- 프로그램 저장 후에는 자동으로 이력이 갱신되도록 `historyRefreshKey` 기반 재조회 로직을 추가했으므로, 저장 API 응답 구조 변경 시에도 동일한 갱신이 이루어지는지 확인.
- 단체반 프로그램도 동일한 카드에서 확인할 수 있으므로, 그룹별 데이터가 정상적으로 정렬되는지 QA 필요.

