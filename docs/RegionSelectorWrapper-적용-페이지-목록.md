# RegionSelectorWrapper 적용 페이지 목록

## 📋 개요
`RegionSelectorWrapper`는 지역 선택 로직을 통합한 컴포넌트로, 시/도 선택 시 구/군 선택이 자동으로 표시되도록 합니다.

## ✅ 적용된 페이지

### 1. **수영 센터 찾기 (Map Page)**
- **경로**: `client/app/map/page.tsx`
- **용도**: 센터 검색 시 지역 필터링
- **레이아웃**: `simple`

### 2. **센터 관리 (Admin)**
- **경로**: `client/app/admin/center-management/page.tsx`
- **용도**: 최고관리자가 센터 목록을 지역별로 필터링
- **레이아웃**: `dropdown`

### 3. **회원가입 (일반)**
- **경로**: `client/app/auth/signup/page.tsx`
- **용도**: 강사 회원가입 시 근무 가능 지역 선택
- **레이아웃**: `simple`

### 4. **강사 회원가입**
- **경로**: `client/app/auth/signup-instructor/page.tsx`
- **용도**: 강사 회원가입 시 근무 가능 지역 선택
- **레이아웃**: `simple`

### 5. **회원 분포도 (Admin)**
- **경로**: `client/app/admin/geo-distribution/page.tsx`
- **용도**: 회원 분포도 조회 시 지역 필터링
- **레이아웃**: `simple`
- **적용일**: 2024-12-19

## 📝 적용 전후 비교

### 적용 전
- 각 페이지마다 지역 선택 로직이 중복 구현됨
- 시/도 선택 시 구/군 선택 표시 로직이 일관되지 않음
- 상태 관리 로직이 분산되어 있음

### 적용 후
- 지역 선택 로직이 통합되어 유지보수 용이
- 시/도 선택 시 구/군 선택이 자동으로 표시됨
- 상태 관리 로직이 일관되게 처리됨

## 🔧 컴포넌트 위치
- **컴포넌트**: `client/components/common/RegionSelectorWrapper.tsx`
- **의존성**: `client/components/common/UnifiedRegionSelector.tsx`

## 📌 참고사항
- `RegionSelectorWrapper`는 내부적으로 `UnifiedRegionSelector`를 사용합니다.
- 외부에서 `selectedRegions`와 `onRegionsChange`를 전달하면 외부 상태를 사용하고, 전달하지 않으면 내부 상태를 사용합니다.
- `layout` prop으로 `simple`, `dropdown`, `list` 중 선택할 수 있습니다.

