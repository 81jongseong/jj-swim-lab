# 🎨 센터별 회원 분포 지도 가이드

## 📋 개요

센터별 회원 분포를 **지배 센터 색상 모드**로 시각화하는 페이지입니다.

### 핵심 개념

**지배 센터 (Dominant Center)**
- 각 H3 헥사곤 셀에서 가장 많은 회원을 가진 센터
- 해당 센터의 색상으로 셀 전체를 칠함
- 가장 직관적이고 깔끔한 시각화 방식

---

## 🗺️ 페이지 구성

### 1. 센터별 분포 지도
```
http://localhost:3000/admin/geo-centers
```

### 2. 주요 기능

**지배 센터 색상 매핑**
- HSL 해시 알고리즘으로 센터별 안정적 색상 자동 배정
- 구별하기 쉬운 채도/명도 사용
- "기타" 센터는 회색으로 고정

**센터 필터**
- 체크박스로 표시할 센터 선택
- 실시간 지도 업데이트
- 초기 상태는 모든 센터 활성화

**마우스 호버 툴팁**
- 지배 센터 이름
- 총 회원 수 (근사값)
- 센터별 분포 (상위 3개)
- 비율 표시 (%)

**CSV 내보내기**
- H3 인덱스, 지배 센터, 총 회원 수
- 위도/경도 (셀 중심)
- 센터별 상세 정보

---

## 🔒 프라이버시 보호

### 적용된 기술

**1. k-익명성 (k≥5)**
```
- 셀 전체 회원 < 5명 → 셀 숨김
- 센터별 회원 < 5명 → "기타"로 통합
```

**2. 라플라스 노이즈 (ε=2)**
```typescript
const laplace = (n, eps=2) => 
  n + (Math.random()<0.5?-1:1) * (Math.log(1-Math.random())/-eps);
```

**3. 5단위 반올림**
```typescript
const round5 = (n) => Math.max(0, Math.round(n/5)*5);
```

**4. H3 헥사곤 집계**
- 해상도 8 (600m-1km)
- 지역 통합으로 정확한 위치 파악 불가

---

## 🎨 색상 시스템

### HSL 해시 알고리즘

```typescript
function colorOfCenter(centerId: string) {
  // "기타"는 회색
  if (centerId === '기타') {
    return [160, 160, 160, 180];
  }

  // HSL 해시로 색상 생성
  let hue = 0;
  for (let i = 0; i < centerId.length; i++) {
    hue = (hue * 31 + centerId.charCodeAt(i)) % 360;
  }

  const saturation = 70; // 채도
  const lightness = 52;  // 명도

  // HSL→RGB 변환
  // ...
  
  return [r, g, b, 185]; // RGBA
}
```

### 장점

✅ **안정적**: 같은 센터는 항상 같은 색상
✅ **구별하기 쉬움**: 채도/명도 최적화
✅ **자동화**: 센터 추가 시 자동으로 색상 배정
✅ **충돌 없음**: 해시 알고리즘으로 중복 최소화

---

## 📊 API 명세

### GET /api/geo/aggregate-centers

**쿼리 파라미터**
- `centerId`: 센터 ID 필터 (선택)
- `from`: 시작 날짜 (선택)
- `to`: 종료 날짜 (선택)

**응답 형식**
```json
{
  "success": true,
  "data": {
    "cells": [
      {
        "h3": "8928308291fffff",
        "totalApprox": 25,
        "dominantCenter": "강남센터",
        "centers": [
          { "centerId": "강남센터", "countApprox": 15 },
          { "centerId": "홍대센터", "countApprox": 10 }
        ]
      }
    ],
    "metadata": {
      "totalCells": 42,
      "h3Resolution": 8,
      "kAnonymityThreshold": 5,
      "laplaceEpsilon": 2,
      "roundUnit": 5
    }
  }
}
```

---

## 🚀 사용법

### 1. 페이지 접근
```
최고 관리자 로그인 → 🗺️ 회원 관리 → 🎨 센터별 분포 지도
```

### 2. 센터 필터링
- 상단 체크박스에서 표시할 센터 선택
- 체크 해제 시 해당 센터의 지배 지역 숨김
- "기타"는 항상 표시

### 3. 지역 정보 확인
- 마우스를 셀 위에 올리면 툴팁 표시
- 지배 센터, 총 회원 수, 센터별 분포 확인

### 4. 데이터 내보내기
- "📊 CSV 내보내기" 버튼 클릭
- 집계된 데이터만 포함 (원본 주소 미포함)

---

## 🔧 개발 가이드

### 데이터 흐름

```
원본 회원 데이터
  ↓
주소 → 좌표 변환 (VWorld Geocoder)
  ↓
H3 헥사곤 집계 (해상도 8)
  ↓
센터별 그룹화
  ↓
k-익명성 적용 (k≥5)
  ↓
작은 센터 → "기타"로 통합
  ↓
라플라스 노이즈 + 5단위 반올림
  ↓
지배 센터 계산
  ↓
클라이언트 전송 (집계 데이터만)
  ↓
HSL 해시 색상 매핑
  ↓
deck.gl H3HexagonLayer 렌더링
```

### 실제 DB 연동

**현재 상태**: 목업 데이터 사용

**TODO**: `client/app/api/geo/aggregate-centers/route.ts` 수정

```typescript
// 목업 데이터 대신 실제 DB 쿼리
async function fetchMembersFromDB(filters: any) {
  const members = await Member.find({
    // 필터 적용
    ...(filters.centerId && { centerId: filters.centerId }),
    ...(filters.from && { joinedAt: { $gte: filters.from } }),
    ...(filters.to && { joinedAt: { $lte: filters.to } })
  }).select('address centerId joinedAt');

  // 주소 → 좌표 → H3 변환
  const rows = [];
  for (const member of members) {
    const coords = await geocode(member.address);
    if (!coords) continue;
    
    const h3Index = h3.geoToH3(coords.lat, coords.lon, H3_RESOLUTION);
    rows.push({
      h3: h3Index,
      centerId: member.centerId,
      count: 1
    });
  }

  // 센터별 집계
  const aggregated = new Map();
  for (const row of rows) {
    const key = `${row.h3}:${row.centerId}`;
    aggregated.set(key, (aggregated.get(key) || 0) + 1);
  }

  return Array.from(aggregated, ([key, count]) => {
    const [h3, centerId] = key.split(':');
    return { h3, centerId, count };
  });
}
```

---

## 🆚 스택 모드 (고급, 선택)

현재는 **지배 센터 모드**만 구현되어 있습니다.

### 스택 모드란?
- 한 셀에 여러 센터가 뒤섞인 경우 더 명확히 표시
- ColumnLayer로 셀 중심에 작은 원기둥 여러 개를 방사형 배치
- 각 센터별 색상과 높이로 구분

### 구현 요청 시
```
"스택 모드로 센터별 분포를 더 상세히 보여주세요"
```

---

## 🎯 장점

### 지배 센터 모드

✅ **직관적**: 한눈에 어느 센터가 우세한지 파악
✅ **깔끔함**: 색상 충돌 없음
✅ **성능**: 빠른 렌더링
✅ **프라이버시**: 집계된 정보만 표시

### 기술적 장점

✅ **완전 무료**: VWorld + MapLibre + deck.gl
✅ **국내 최적화**: VWorld 지도 서비스
✅ **오픈소스**: 모든 라이브러리 오픈소스
✅ **확장 가능**: 스택 모드 등 추가 기능 가능

---

## 📚 참고 자료

- [VWorld 개발자센터](https://www.vworld.kr/dev/)
- [MapLibre GL JS](https://maplibre.org/)
- [deck.gl H3HexagonLayer](https://deck.gl/docs/api-reference/geo-layers/h3-hexagon-layer)
- [H3 헥사곤 시스템](https://h3geo.org/)
- [HSL 색상 시스템](https://en.wikipedia.org/wiki/HSL_and_HSV)

---

## ⚠️ 주의사항

1. **프라이버시 최우선**: 원본 주소/좌표는 절대 클라이언트 전송 금지
2. **k-익명성 유지**: 임계값 5 이상 유지 필수
3. **색상 일관성**: HSL 해시로 안정적 색상 보장
4. **DB 연동**: 목업 데이터를 실제 DB로 교체 필요
5. **VWorld API 키**: 도메인 등록 후 키 발급 필수

---

**총 비용: 0원** 🎉
