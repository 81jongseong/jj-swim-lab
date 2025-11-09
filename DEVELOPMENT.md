# 🚧 JJ Swim Lab 개발 문서

## 📋 향후 점검 사항

### 예약 관리 (회원계정 작업 시 점검 필요)
- ⚠️ **예약 관리 기능은 회원계정 작업 시 점검 필요**
- 회원계정에서 예약 관리 기능이 제대로 작동하는지 확인
- 회원이 예약을 조회, 수정, 취소할 수 있는지 확인
- 예약 상태 변경 권한 확인

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

