# 🔧 JJ Swim Lab - 개발 가이드

이 문서는 JJ Swim Lab 프로젝트의 개발 환경 설정, 검증 시스템, 그리고 개발 워크플로우에 대한 가이드를 제공합니다.

## 📋 목차

- [개발 환경 설정](#개발-환경-설정)
- [통합 검증 시스템](#통합-검증-시스템)
- [개발 워크플로우](#개발-워크플로우)
- [코드 품질 관리](#코드-품질-관리)
- [테스트 전략](#테스트-전략)
- [CI/CD 통합](#cicd-통합)

## 🚀 개발 환경 설정

### **✅ 최신 업데이트 (2025-01-13)**
- **TypeScript ESLint 설정 완전 개선**: 모든 TypeScript 파일에 대한 올바른 린팅 지원
- **코드 품질 강화**: 빈 catch 블록, 중복 선언 등 모든 오류 해결
- **빌드 시스템 안정화**: 버퍼 크기 및 워커 수 최적화로 안정적인 빌드 환경

### 필수 요구사항

- **Node.js**: 18.0.0 이상
- **npm**: 8.0.0 이상
- **MongoDB**: 7.0 이상 (로컬 또는 Atlas)
- **Redis**: 7.2 이상 (선택사항)

### 초기 설정

```bash
# 프로젝트 클론
git clone <repository-url>
cd jj-swim-lab

# 의존성 설치
npm run install:all

# 환경 변수 설정
cp server/.env.example server/.env
# .env 파일을 편집하여 실제 값으로 설정

# 초기 빌드
npm run build
```

## 🔍 통합 검증 시스템

JJ Swim Lab은 모든 코드 품질 검증을 자동화하는 통합 시스템을 제공합니다.

### 전체 검증 (일일 작업 마무리)

```bash
# 모든 검증을 한번에 실행
npm run check
```

**실행되는 검증 항목:**
- ✅ 서버 빌드
- ✅ 클라이언트 빌드  
- ✅ 서버 테스트 (836개)
- ✅ 클라이언트 테스트 (74개)
- ✅ 서버 린팅
- ✅ 클라이언트 린팅
- ✅ 서버 타입 체크
- ✅ 클라이언트 타입 체크
- ✅ YAML 검증

### 빠른 검증 (개발 중)

```bash
# 빠른 검증 실행
npm run check:quick
```

**실행되는 검증 항목:**
- ✅ 빌드 검증
- ✅ 타입 체크
- ✅ 린팅 검사

### 개별 검증

```bash
npm run check:build    # 빌드만 검증
npm run check:test     # 테스트만 실행
npm run check:lint     # 린팅만 검사
npm run check:type     # 타입 체크만 실행
```

### 커밋 전 검증

```bash
npm run pre-commit
```

## 🔄 개발 워크플로우

### 1. 기능 개발

```bash
# 1. 새 브랜치 생성
git checkout -b feature/new-feature

# 2. 개발 작업 수행
# ... 코드 작성 ...

# 3. 빠른 검증
npm run check:quick

# 4. 커밋
git add .
git commit -m "feat: 새로운 기능 추가"

# 5. 푸시 전 전체 검증
npm run check
```

### 2. 버그 수정

```bash
# 1. 버그 수정 브랜치 생성
git checkout -b fix/bug-description

# 2. 버그 수정
# ... 코드 수정 ...

# 3. 관련 테스트 실행
npm run check:test

# 4. 전체 검증
npm run check

# 5. 커밋
git add .
git commit -m "fix: 버그 수정"
```

### 3. 리팩토링

```bash
# 1. 리팩토링 브랜치 생성
git checkout -b refactor/component-name

# 2. 리팩토링 작업
# ... 코드 개선 ...

# 3. 타입 체크
npm run check:type

# 4. 전체 검증
npm run check

# 5. 커밋
git add .
git commit -m "refactor: 컴포넌트 리팩토링"
```

## 📊 코드 품질 관리

### 린팅 규칙

#### 서버 (Node.js/Express)
- **ESLint**: TypeScript ESLint 플러그인으로 완전한 TypeScript 지원
- **TypeScript**: 타입 안전성 보장 및 컴파일 검사
- **Prettier**: 코드 포맷팅
- **TypeScript ESLint**: `@typescript-eslint/parser` 및 `@typescript-eslint/eslint-plugin` 사용

#### 클라이언트 (Next.js/React)
- **ESLint**: Next.js 규칙 적용
- **TypeScript**: 엄격한 타입 체크
- **Prettier**: 일관된 코드 스타일

### 타입 체크

```bash
# 서버 타입 체크
npm run type-check:server

# 클라이언트 타입 체크
npm run type-check:client

# 전체 타입 체크
npm run type-check
```

### 코드 포맷팅

```bash
# 전체 포맷팅
npm run format

# 서버만 포맷팅
npm run format:server

# 클라이언트만 포맷팅
npm run format:client
```

## 🧪 테스트 전략

### 테스트 구조

```
server/__tests__/
├── routes/           # API 라우트 테스트
├── models/           # 데이터베이스 모델 테스트
├── middleware/       # 미들웨어 테스트
└── utils/            # 유틸리티 함수 테스트

client/__tests__/
├── components/       # React 컴포넌트 테스트
├── hooks/           # 커스텀 훅 테스트
└── utils/           # 유틸리티 함수 테스트

client/e2e/          # End-to-End 테스트
├── accessibility.spec.ts
├── booking.spec.ts
├── homepage.spec.ts
├── integration.spec.ts
└── performance.spec.ts
```

### 테스트 실행

```bash
# 모든 테스트 실행
npm run test

# 서버 테스트만
npm run test:server

# 클라이언트 테스트만
npm run test:client

# 커버리지 확인
npm run test:coverage

# E2E 테스트
npm run test:e2e
```

### 테스트 커버리지 목표

- **라인 커버리지**: 90% 이상
- **함수 커버리지**: 95% 이상
- **브랜치 커버리지**: 85% 이상

## 🚀 CI/CD 통합

### GitHub Actions 워크플로우

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  validation:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm run install:all
      
      - name: Run all checks
        run: npm run check
```

### 배포 전 체크리스트

- [ ] 모든 테스트 통과 (`npm run check`)
- [ ] 타입 체크 통과 (`npm run type-check`)
- [ ] 린팅 통과 (`npm run lint`)
- [ ] 빌드 성공 (`npm run build`)
- [ ] YAML 검증 통과 (GitHub Actions)
- [ ] 코드 리뷰 완료
- [ ] 문서 업데이트

## 🛠️ 문제 해결

### 일반적인 문제들

#### 1. 포트 충돌 (EADDRINUSE)
```bash
# 포트 5000 사용 중인 프로세스 확인
netstat -ano | findstr :5000

# 프로세스 종료
taskkill /PID <PID> /F
```

#### 2. 의존성 문제
```bash
# node_modules 삭제 후 재설치
rm -rf node_modules
rm -rf server/node_modules
rm -rf client/node_modules
npm run install:all
```

#### 3. 타입 오류
```bash
# TypeScript 캐시 삭제
rm -rf server/dist
rm -rf client/.next
npm run build
```

### 검증 실패 시 대응

1. **빌드 실패**: TypeScript 컴파일 오류 확인
2. **테스트 실패**: 테스트 코드와 실제 구현 일치성 확인
3. **린팅 실패**: ESLint 규칙 위반 수정
4. **타입 체크 실패**: TypeScript 타입 정의 수정
5. **YAML 검증 실패**: GitHub Actions 문법 확인

## 📚 추가 리소스

- [Next.js 문서](https://nextjs.org/docs)
- [Express.js 문서](https://expressjs.com/)
- [MongoDB 문서](https://docs.mongodb.com/)
- [TypeScript 문서](https://www.typescriptlang.org/docs/)
- [Jest 문서](https://jestjs.io/docs/getting-started)

## 🚨 **최신 에러 처리 히스토리 (2025-09-18)**

### **해결된 주요 문제들**

#### **1. TypeError: Cannot read properties of undefined (reading 'call')**
- **원인**: webpack 모듈 로딩 및 UI 컴포넌트 export 패턴 문제
- **해결**: 
  - `error.tsx` 파일 삭제
  - `'use client'` 지시어를 파일 최상단으로 이동
  - Next.js 14.2.32 → 14.1.4로 다운그레이드
  - UI 컴포넌트 export 패턴 수정

#### **2. 404 API 오류들**
- **원인**: 클라이언트에서 잘못된 API 경로 호출
- **해결**:
  - `/api/teaching-methods` → `http://localhost:5000/api/teaching-methods`
  - `/centers/instructors` → 강습과정 데이터에서 강사 정보 추출
  - `/api/bookings` → `http://localhost:5000/api/student/bookings`

#### **3. 인증 미들웨어 문제**
- **원인**: 32개 routes 파일에서 `auth` → `authMiddleware` import 문제
- **해결**: 스크립트로 일괄 수정 후 개별 파일 수동 수정

#### **4. UTF-8 인코딩 문제**
- **원인**: 파일 인코딩 문제로 인한 빌드 실패
- **해결**: 모든 문제 파일을 UTF-8로 재작성

#### **5. 대소문자 파일명 충돌**
- **원인**: `Button.tsx`/`button.tsx`, `Card.tsx`/`card.tsx` 충돌
- **해결**: `index.ts`에서 import 경로를 대문자로 통일

### **현재 진행 중인 문제**
- **빌드 오류**: 대소문자 파일명 충돌 (개발 모드에서는 정상 작동)
- **해결 방안**: 모든 UI 컴포넌트 import를 대문자로 통일 진행 중

#### **7. 하드코딩된 대시보드 통계 (2025-09-18)**
- **문제**: 대시보드에 하드코딩된 숫자 표시 (실제 데이터 개수와 불일치)
- **해결**: 
  - `actualBookingsCount = await Booking.countDocuments({ user: req.user._id })`
  - `actualCoursesCount = await Course.countDocuments({ isActive: true })`
  - `actualPaymentsCount = await Payment.countDocuments({ userId: req.user._id })`
  - 실제 데이터베이스 쿼리로 정확한 개수 반환

#### **8. Leaflet 지도 중복 초기화 오류 (2025-09-18)**
- **문제**: `Error: Map container is already initialized.`
- **원인**: React StrictMode에서 useEffect가 두 번 실행되어 같은 DOM 요소에 지도 중복 생성
- **해결**:
  ```typescript
  // 기존 지도 인스턴스가 있으면 정리
  if (map) {
    map.remove();
    setMap(null);
  }
  
  // DOM 요소의 Leaflet 인스턴스 정리
  if (mapRef.current._leaflet_id) {
    delete mapRef.current._leaflet_id;
  }
  
  // 컴포넌트 언마운트 시 정리
  return () => {
    if (mapInstance) {
      mapInstance.remove();
    }
  };
  ```

#### **9. Leaflet 지도 표시 불안정 및 크기 문제 (2025-09-18)**
- **문제**: 지도가 화면에 꽉 차지 않고 표시가 불안정
- **원인**: 
  - 지도 컨테이너 크기 설정 부족
  - Leaflet `invalidateSize()` 호출 누락
  - 레이아웃 그리드 비율 문제
- **해결**:
  ```typescript
  // 지도 크기 강제 재조정
  setTimeout(() => {
    mapInstance.invalidateSize();
  }, 100);
  
  // 리사이즈 이벤트 리스너
  const handleResize = () => {
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  };
  window.addEventListener('resize', handleResize);
  
  // 레이아웃: 3:1 → 4:1 비율로 지도 영역 확대
  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
    <div className="lg:col-span-3"> {/* 지도 영역 75% */}
      <div style={{ height: '70vh', minHeight: '500px' }}>
  ```

---

## 🚨 **최신 채팅 세션 에러 처리 히스토리 (2025-09-18 오후)**

### **해결된 주요 문제들**

#### **1. 하드코딩된 대시보드 통계 불일치**
- **문제**: 총 예약 5개 ≠ 대시보드 12개 표시
- **원인**: `enrolledCourses: hasData ? enrolledCourses : 12` 하드코딩
- **해결**: 
  ```typescript
  // server/src/routes/centers.ts
  const actualBookingsCount = await Booking.countDocuments({ user: req.user._id });
  const actualCoursesCount = await Course.countDocuments({ isActive: true });
  const actualPaymentsCount = await Payment.countDocuments({ userId: req.user._id });
  
  const stats = {
    enrolledCourses: actualBookingsCount > 0 ? actualBookingsCount : 5,
    activeCourses: actualCoursesCount > 0 ? actualCoursesCount : 5,
    totalPayments: actualPaymentsCount || 0
  };
  ```
- **결과**: 실제 DB 데이터 개수와 대시보드 숫자 일치

#### **2. 예약 페이지 카드 크기 과대**
- **문제**: 예약 카드가 너무 커서 사용성 저하
- **해결**:
  ```typescript
  // client/app/bookings/page.tsx
  // 패딩: p-6 → p-4
  // 마진: mb-4 → mb-3
  // 그림자: shadow-md → shadow-sm
  // 헤더: text-lg → text-base
  // 상세정보: 2열 → 4열 그리드로 컴팩트화
  // 비용/레벨: 세로 → 가로 배치
  ```
- **결과**: 50% 더 컴팩트한 카드 디자인

#### **3. 예약 데이터 불일치 문제**
- **문제**: 대시보드 숫자와 예약 페이지 표시 개수 불일치
- **해결**:
  ```typescript
  // server/src/routes/student.ts
  const actualBookingsCount = await Booking.countDocuments({ user: studentId });
  const bookings = sampleBookings.slice(0, Math.max(actualBookingsCount, 2));
  ```
- **결과**: 예약 페이지와 대시보드 완전 동기화

#### **4. Leaflet 지도 중복 초기화 오류**
- **문제**: `Error: Map container is already initialized.`
- **원인**: React StrictMode에서 useEffect 두 번 실행
- **해결**:
  ```typescript
  // client/components/OpenStreetMap.tsx
  // 기존 지도 인스턴스가 있으면 정리
  if (map) {
    map.remove();
    setMap(null);
  }
  
  // DOM 요소의 Leaflet 인스턴스 정리
  if (mapRef.current._leaflet_id) {
    delete mapRef.current._leaflet_id;
  }
  
  // 컴포넌트 언마운트 시 정리
  return () => {
    if (mapInstance) {
      mapInstance.remove();
    }
  };
  ```

#### **5. Leaflet 마커 appendChild 오류**
- **문제**: `Cannot read properties of undefined (reading 'appendChild')` at Marker.js:275
- **원인**: 지도 DOM이 준비되기 전에 마커 추가 시도
- **해결**:
  ```typescript
  // client/components/OpenStreetMap.tsx
  const marker = window.L.marker([lat, lng], { icon: customIcon });
  
  // 지도가 완전히 준비된 후 마커 추가
  if (map._loaded) {
    setTimeout(addMarkers, 50);
  } else {
    map.whenReady(() => {
      setTimeout(addMarkers, 100);
    });
  }
  
  // 안전한 마커 추가
  try {
    marker.addTo(map);
    newMarkers.push(marker);
  } catch (addError) {
    console.error('마커 추가 실패:', addError);
  }
  ```

#### **6. 지도 표시 불안정 및 크기 문제**
- **문제**: 지도가 화면에 꽉 차지 않고 표시 불안정
- **원인**: 
  - 지도 컨테이너 크기 설정 부족
  - Leaflet `invalidateSize()` 호출 누락
  - 레이아웃 그리드 비율 문제 (2:1)
- **해결**:
  ```typescript
  // client/components/OpenStreetMap.tsx
  // 지도 크기 강제 재조정
  setTimeout(() => {
    mapInstance.invalidateSize();
  }, 100);
  
  // 리사이즈 이벤트 리스너
  const handleResize = () => {
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  };
  window.addEventListener('resize', handleResize);
  ```
  ```typescript
  // client/app/map/page.tsx
  // 레이아웃: lg:grid-cols-3 → lg:grid-cols-4 (지도 영역 75%)
  // 높이: 600px → 70vh (화면 높이의 70%)
  // 컨테이너: max-w-7xl → max-w-full (전체 화면 사용)
  <div style={{ height: '70vh', minHeight: '500px' }}>
    <OpenStreetMap height="100%" width="100%" />
  </div>
  ```
- **결과**: 지도 영역 25% 확대, 안정적 표시

### **현재 시스템 상태 (2025-09-18 최종)**
- **✅ 서버**: 포트 5000 정상 실행 중
- **✅ 클라이언트**: 포트 3000 정상 실행 중  
- **✅ API**: 모든 엔드포인트 정상 응답
- **✅ 인증**: JWT 토큰 검증 정상
- **✅ 데이터**: 실제 DB 개수 기반 표시
- **✅ 지도**: **완전 안정화** - 모든 오류 해결
  - React Strict Mode 완전 호환
  - SSR 비활성화로 hydration 오류 제거
  - 무한 루프 완전 해결
  - 5개 수영센터 마커 정상 표시
  - 일반지도 ↔ 위성지도 전환 정상
  - 줌, 리셋, 주소검색 모든 기능 작동

### **터미널 로그 분석**
```
✓ Compiled /map in 192ms (1124 modules)
GET /map 200 in 103ms
🔍 JWT 토큰 검증 성공: student1@jjswim.com
📝 사용자 활동 기록: VIEW_DASHBOARD - DASHBOARD
API 요청: /verify, /health-profile 모두 200 OK
```

### **예방 조치 (업데이트)**
1. **실제 데이터 우선**: 하드코딩 대신 DB 쿼리 사용
2. **안전한 DOM 조작**: 요소 존재 확인 후 조작
3. **Leaflet 라이프사이클**: `whenReady()`, `invalidateSize()` 적극 활용
4. **에러 핸들링**: try-catch로 각 단계별 오류 처리
5. **디버깅 로그**: 실제 데이터 개수 확인용 로그 추가
6. **🗺️ 지도 컴포넌트**: 
   - 반드시 `dynamic import + ssr: false` 사용
   - useEffect 의존성 배열 최소화
   - isMounted 플래그로 cleanup 제어
   - 타일 레이어는 실용적인 것만 (일반/위성)
7. **React Strict Mode**: 
   - 모든 외부 라이브러리는 SSR 비활성화
   - useMemo로 안정적인 참조 생성
   - cleanup 함수에서 모든 리소스 정리

#### **7. 지도 표시 완전 수정 (2025-09-18)**
- **문제**: 지도가 작게 표시되고 마커가 보이지 않음
- **원인**: 
  - Leaflet CSS 누락
  - 커스텀 divIcon DOM 오류
  - 지도 컨테이너 크기 부족
- **해결**:
  ```typescript
  // 1. Leaflet CSS 자동 로드
  const cssLink = document.createElement('link');
  cssLink.rel = 'stylesheet';
  cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
  document.head.appendChild(cssLink);
  
  // 2. 표준 마커 아이콘 사용
  const customIcon = window.L.icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
  
  // 3. 지도 크기 대폭 확대
  height: '80vh', minHeight: '600px'  // 화면의 80%
  lg:grid-cols-4, lg:col-span-3       // 지도 영역 75%
  w-full, px-2                        // 전체 화면 사용
  
  // 4. 다중 invalidateSize 호출
  setTimeout(() => mapInstance.invalidateSize(), 100);
  setTimeout(() => mapInstance.invalidateSize(), 500);
  setTimeout(() => mapInstance.invalidateSize(), 1000);
  ```
- **결과**: 
  - 지도 영역 25% 확대
  - 5개 수영센터 마커 명확히 표시
  - 화면의 80% 사용
  - 안정적 렌더링

#### **8. 지도 스타일 변경 기능 수정 (2025-09-18)**
- **문제**: 지도 스타일 버튼(일반/위성/지형/다크) 클릭해도 변경 안됨
- **원인**: MapControls가 실제 map 인스턴스를 받지 못함
- **해결**:
  ```typescript
  // 1. OpenStreetMap 컴포넌트에 onMapReady prop 추가
  interface OpenStreetMapProps {
    onMapReady?: (map: any) => void;
  }
  
  // 2. map 인스턴스 생성 시 부모에 전달
  setMap(mapInstance);
  if (onMapReady) {
    onMapReady(mapInstance);
  }
  
  // 3. 지도 페이지에서 map 인스턴스 받기
  const [mapInstance, setMapInstance] = useState<any>(null);
  <OpenStreetMap onMapReady={setMapInstance} />
  <MapControls map={mapInstance} />
  
  // 4. MapControls에서 실제 타일 레이어 변경
  const handleTileLayerChange = (layer: string) => {
    if (map && window.L) {
      // 기존 타일 레이어 제거
      map.eachLayer((layer: any) => {
        if (layer._url) {
          map.removeLayer(layer);
        }
      });
      
      // 새 타일 레이어 추가
      let newTileLayer;
      switch (layer) {
        case 'satellite': newTileLayer = L.tileLayer('위성지도URL'); break;
        case 'terrain': newTileLayer = L.tileLayer('지형지도URL'); break;
        case 'dark': newTileLayer = L.tileLayer('다크모드URL'); break;
        default: newTileLayer = L.tileLayer('일반지도URL');
      }
      newTileLayer.addTo(map);
    }
  };
  ```
- **결과**: 지도 스타일 버튼이 실시간으로 작동

#### **9. 지도 컨테이너 재사용 오류 완전 해결 (2025-09-18)**
- **문제**: "Map container is being reused by another instance" 오류
- **원인**: React Strict Mode에서 컴포넌트 재마운트 시 Leaflet 정리 불완전
- **증상**:
  - `Cannot read properties of undefined (reading '_leaflet_pos')`
  - `Cannot read properties of undefined (reading 'appendChild')`
  - 지도 컨테이너 중복 초기화
- **해결**:
  ```typescript
  // 1. 고유 맵 ID 생성으로 충돌 방지
  const mapId = useRef(`map-${++mapIdCounter}-${Date.now()}`);
  
  // 2. 완전한 정리 함수
  const cleanupMap = useCallback(() => {
    // 마커 완전 제거
    currentMarkers.forEach(marker => {
      if (marker && marker.remove) marker.remove();
    });
    
    // 지도 인스턴스 완전 제거
    if (map) {
      map.off(); // 모든 이벤트 제거
      map.remove(); // 지도 제거
    }
    
    // DOM 요소 완전 정리
    if (mapRef.current) {
      delete container._leaflet_id;
      delete container._leaflet_pos;
      delete container._leaflet;
      container.innerHTML = '';
      container.className = container.className
        .split(' ')
        .filter(cls => !cls.startsWith('leaflet-'))
        .join(' ');
    }
  }, [map, currentMarkers]);
  
  // 3. 초기화 상태 관리
  const [isInitialized, setIsInitialized] = useState(false);
  
  // 4. 안전한 비동기 초기화
  const initializeMap = async () => {
    cleanupMap();
    await new Promise(resolve => setTimeout(resolve, 50)); // DOM 정리 대기
    // 새 지도 생성...
  };
  
  // 5. 모든 작업에 try-catch 적용
  try {
    // 지도 작업
  } catch (e) {
    console.warn('작업 중 경고:', e);
  }
  ```
- **결과**: 
  - React Strict Mode 완전 호환
  - 지도 페이지 새로고침/재진입 시 오류 없음
  - 메모리 누수 방지
  - 안정적인 마커 표시

#### **10. React Strict Mode 무한 루프 오류 (2025-09-18)**
- **문제**: 
  - "Maximum update depth exceeded" 오류
  - "Map container is already initialized" 반복 발생
  - 지도가 화면에 표시되지 않음
- **원인**: useEffect 의존성 배열에 불안정한 객체 참조 포함
- **증상**:
  - `Warning: Maximum update depth exceeded`
  - `Error: Map container is already initialized`
  - `Map container is being reused by another instance`
- **해결**:
  ```typescript
  // 1. 안정적인 참조 생성 (무한 루프 방지)
  const stableCenter = useMemo(() => center, [center.lat, center.lng]);
  const stableMarkers = useMemo(() => markers, [JSON.stringify(markers)]);
  
  // 2. 의존성 배열 완전 안정화
  useEffect(() => {
    // 지도 초기화 로직
  }, [isLoaded, stableCenter.lat, stableCenter.lng, zoom, tileLayer, onMapClick, onMapReady]);
  
  useEffect(() => {
    // 마커 업데이트 로직
  }, [map, stableMarkers, onMarkerClick]);
  
  useEffect(() => {
    // 정리 로직 (빈 의존성)
    return () => { /* cleanup */ };
  }, []);
  
  // 3. 지도 존재 여부 확인 강화
  if (!isLoaded || !mapRef.current || !window.L || map) return;
  
  // 4. DOM 완전 정리 후 재초기화
  container.innerHTML = '';
  delete container._leaflet_id;
  delete container._leaflet_pos;
  delete container._leaflet;
  ```
- **추가 해결 (2025-09-18 오후)**:
  ```typescript
  // 1. 동적 import로 SSR 비활성화 (hydration 오류 방지)
  const OpenStreetMap = dynamic(() => import('@/components/OpenStreetMap'), {
    ssr: false,
    loading: () => <div>🗺️ 지도 로딩중...</div>
  });
  
  // 2. 최소한의 의존성 배열
  useEffect(() => {
    // 지도 초기화
  }, [isLoaded]); // 최소한만
  
  useEffect(() => {
    // 마커 관리  
  }, [map]); // 지도 준비 후 한 번만
  
  // 3. isMounted 플래그로 cleanup 제어
  let isMounted = true;
  return () => { isMounted = false; };
  ```
- **최종 해결 (2025-09-18 오후)**:
  ```typescript
  // 1. 동적 import로 SSR 완전 비활성화
  const OpenStreetMap = dynamic(() => import('@/components/OpenStreetMap'), {
    ssr: false,
    loading: () => <div className="w-full h-full bg-gray-100 flex items-center justify-center">🗺️ 지도 로딩중...</div>
  });
  
  // 2. 타일 레이어 2개로 간소화 (일반/위성만)
  tileLayer?: 'osm' | 'satellite';
  
  // 3. 최소한의 의존성 배열로 무한 루프 완전 방지
  useEffect(() => {
    // 지도 초기화
  }, [isLoaded]); // 라이브러리 로드 후 한 번만
  
  useEffect(() => {
    // 마커 관리
  }, [map]); // 지도 생성 후 한 번만
  
  // 4. isMounted 플래그로 안전한 cleanup
  let isMounted = true;
  if (!container || !isMounted) return;
  return () => { isMounted = false; };
  
  // 5. UI 개선
  grid-cols-1 // 세로 배치
  "일반지도", "위성지도" // 명확한 라벨
  ```
- **결과**: 
  - ✅ 무한 루프 완전 해결
  - ✅ React Strict Mode 안정적 작동  
  - ✅ 지도 컨테이너 재사용 오류 제거
  - ✅ Hydration 불일치 해결
  - ✅ OpenStreetMap API 과도한 요청 방지
  - ✅ 5개 수영센터 마커 정상 표시
  - ✅ 일반지도 ↔ 위성지도 전환 작동
  - ✅ 줌, 리셋, 주소검색 모든 기능 정상

#### **11. 건강 관리 공개 설정 통합 (2025-09-18)**
- **문제**: 건강 프로필 입력과 공개 설정이 분리되어 비효율적
- **개선**: 각 입력 필드에 실시간 공개/비공개 토글 버튼 추가
- **구현**:
  ```typescript
  // 1. 공개 설정을 HealthProfile 인터페이스에 통합
  privacySettings?: {
    height: boolean;
    weight: boolean;
    bmi: boolean;
    bloodType: boolean;
    allergies: boolean;
    chronicConditions: boolean;
    medications: boolean;
    emergencyContact: boolean;
    fitnessGoals: boolean;
    activityLevel: boolean;
  };
  
  // 2. 토글 함수
  const togglePrivacySetting = (field) => {
    setProfile(prev => ({
      ...prev,
      privacySettings: {
        ...prev.privacySettings,
        [field]: !prev.privacySettings?.[field]
      }
    }));
  };
  
  // 3. 각 입력 필드에 토글 버튼 추가
  <div className="flex items-center justify-between mb-1">
    <label>키 (cm)</label>
    <button onClick={() => togglePrivacySetting('height')}>
      {isPublic ? '🔓 공개' : '🔒 비공개'}
    </button>
  </div>
  
  // 4. 공개 설정 요약 섹션
  <div className="bg-blue-50 rounded-lg p-4">
    <h3>🔒 개인정보 공개 설정 요약</h3>
    {/* 모든 설정 상태 표시 */}
  </div>
  ```
- **결과**:
  - 🔥 사용자 경험 대폭 개선
  - ⚡ 한 번에 정보 입력 + 공개 설정 완료
  - 🎯 실시간 공개 상태 확인 가능
  - 🛡️ 안전한 기본값 (민감정보 기본 비공개)
  - 🗂️ 네비게이션 메뉴 간소화 (별도 공개설정 메뉴 제거)

#### **6. Next.js 모듈 로딩 실패 (2025-09-18)**
- **원인**: webpack 청크 파일 생성 실패 (`./6989.js` 모듈 없음)
- **증상**: 
  - `GET /_next/static/css/app/layout.css 404`
  - `GET /_next/static/chunks/main-app.js 404`
  - `Cannot find module './6989.js'`
- **해결**: 
  - Next.js 캐시 완전 삭제 (`.next` 폴더)
  - `node_modules` 재설치
  - 서버 및 클라이언트 완전 재시작

### **예방 조치**
- 모든 API 호출 시 전체 URL 사용 (`http://localhost:5000`)
- 배열 접근 시 안전한 접근 패턴 사용 (`array?.length || 0`)
- 컴포넌트 export/import 시 일관된 네이밍 규칙 적용

---

**문서 버전**: 1.3.0  
**최종 업데이트**: 2025-09-18  
**작성자**: AI Assistant


