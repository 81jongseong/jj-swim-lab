# 📋 TODO 주석 목록

> **생성일**: 2025-11-23  
> **목적**: 프로젝트 내 모든 TODO 주석을 정리하고 우선순위를 분류

---

## 📊 통계

- **Client TODO**: 38개 파일
- **Server TODO**: 19개 파일
- **총 TODO 파일**: 57개

---

## 🎯 우선순위 분류

### 🔴 긴급 (즉시 처리 필요)
- [ ] 인증/보안 관련 TODO
- [ ] 데이터 무결성 관련 TODO
- [ ] 에러 핸들링 관련 TODO

### 🟡 중요 (단기간 내 처리)
- [ ] 성능 최적화 관련 TODO
- [ ] 사용자 경험 개선 관련 TODO
- [ ] API 개선 관련 TODO

### 🟢 개선 (여유 있을 때 처리)
- [ ] 코드 리팩토링 관련 TODO
- [ ] 문서화 관련 TODO
- [ ] 테스트 관련 TODO

---

## 📁 Client TODO 목록

### Components
- `components/swimlab/ProgramListView.tsx`
- `components/swimlab/MemberStatistics.tsx`
- `components/center-admin/WeeklyCalendar.tsx`
- `components/center-admin/InstructorStudentManagement.tsx`
- `components/3d-viewer/ThreeDPlayer.tsx`

### Pages
- `app/job-board/page.tsx`
- `app/center-admin/manage/page.tsx`
- `app/admin/swim-training-engine/page.tsx`
- `app/admin/lesson-plans/page.tsx`
- `app/admin/courses/page.tsx`
- `app/admin/center-management/page.tsx`
- `app/swimlab/trial/result/page.tsx`
- `app/swimlab/trial/page.tsx`
- `app/super-admin/page.tsx`
- `app/instructor/teaching-methods/page.tsx`
- `app/instructor/program-builder/page.tsx`
- `app/instructor/curriculum-program/page.tsx`
- `app/health/measurements/page.tsx`
- `app/health/input/page.tsx`
- `app/guest/programs/page.tsx`
- `app/center/[centerSlug]/admin/levels/page.tsx`
- `app/center-admin/levels/page.tsx`
- `app/admin/policy-settings/page.tsx`

### API Routes
- `app/api/health/measurements/route.ts`
- `app/api/members/heatmap/route.ts`
- `app/api/health/analytics/route.ts`
- `app/api/health/goals/route.ts`
- `app/api/geo/points/route.ts`
- `app/api/geo/aggregate-centers/route.ts`

### Libraries
- `src/swimlab/utils/catalog.ts`
- `src/swimlab/types/index.ts`
- `src/swimlab/data/trainingMethods.ts`
- `src/swimlab/components/SwimProgramGenerator.tsx`
- `src/swimlab/components/Planner.tsx`
- `lib/swimlab/engine-v31.ts`
- `lib/geo/privacy.ts`

---

## 📁 Server TODO 목록

### Routes
- `src/routes/smartwatch.ts`
- `src/routes/community-posts.ts`
- `src/routes/center-admin.ts`
- `src/routes/auth.ts`
- `src/routes/student.ts`
- `src/routes/swim-programs.ts`
- `src/routes/courses.ts`
- `src/routes/approvals.ts`
- `src/routes/users.ts`
- `src/routes/student-progress.ts`
- `src/routes/classes.ts`

### Services
- `src/services/aiRoutineRecommendationService.ts`
- `src/services/settlementService.ts`
- `src/services/courseQualityService.ts`
- `src/services/advancedCache.ts`

### Scripts
- `scripts/import-training-methods-from-client.js`

---

## 🔍 상세 조사 필요

각 TODO 주석의 내용을 확인하고 우선순위를 재분류해야 합니다.

**다음 단계**:
1. 각 파일의 TODO 주석 내용 확인
2. 우선순위 재분류
3. 이슈 트래커로 이동 또는 즉시 처리

---

## 📅 업데이트 이력

- 2025-11-23: 초기 TODO 목록 작성
