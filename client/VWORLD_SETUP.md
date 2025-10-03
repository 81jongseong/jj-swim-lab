# 🗺️ VWorld + MapLibre + deck.gl 설정 가이드

## 📋 개요

JJ Swim Lab의 회원 분포도 시각화는 **완전 무료**인 국내 지도 서비스를 사용합니다:

- **VWorld WMTS**: 국내 무료 배경 지도
- **MapLibre GL JS**: 오픈소스 지도 렌더러  
- **deck.gl**: WebGL 기반 데이터 시각화
- **H3 헥사곤**: 지리적 집계 시스템

## 🔑 VWorld API 키 발급

### 1. VWorld 개발자센터 가입
```
https://www.vworld.kr/dev/
```

### 2. API 키 발급
- **WMTS 키**: 배경 지도 타일용
- **Geocoder 키**: 주소→좌표 변환용 (일 40,000건 무료)

### 3. 도메인 등록
- 개발: `localhost`, `127.0.0.1`
- 운영: 실제 도메인 등록 필수

## ⚙️ 환경변수 설정

### `.env.local` 파일 생성
```bash
# VWorld API 키
NEXT_PUBLIC_VWORLD_KEY=여기에_브이월드_API_키
VWORLD_KEY_SERVER=여기에_서버용_브이월드_API_키

# 기존 설정 유지
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1Ijoi...
```

## 📦 패키지 설치

```bash
cd client
npm install maplibre-gl deck.gl @deck.gl/mapbox @deck.gl/geo-layers h3-js
```

## 🗺️ 지도 서비스 비교

| 서비스 | 비용 | 라이선스 | 국내 최적화 | 제한사항 |
|--------|------|----------|-------------|----------|
| **VWorld** | ✅ 무료 | ✅ 자유 | ✅ 최적 | 도메인 등록 필요 |
| Mapbox | 💰 유료 | 제한적 | 보통 | 토큰 제한 |
| Google Maps | 💰 유료 | 제한적 | 보통 | 사용량 제한 |
| OSM | ✅ 무료 | ✅ 자유 | 보통 | 직접 사용 비권장 |

## 🔒 프라이버시 보호

### 적용된 기술
1. **k-익명성** (k≥5): 5명 미만 지역 숨김
2. **라플라스 노이즈** (ε=2): 개별 수치에 노이즈 추가
3. **5단위 반올림**: 정확한 개인 수 파악 방지
4. **H3 헥사곤 집계**: 600m-1km 단위로 지역 통합

### 데이터 흐름
```
원본 주소 → VWorld Geocoder → H3 집계 → 프라이버시 보호 → 시각화
```

## 🚀 사용법

### 1. 페이지 접근
```
http://localhost:3000/admin/geo-distribution
```

### 2. 필터링
- 센터별 필터
- 회원 유형별 필터  
- 가입 기간별 필터

### 3. 데이터 내보내기
- CSV 형식으로 집계 데이터만 내보내기
- 원본 주소/좌표는 절대 포함하지 않음

## 🛠️ 개발 가이드

### API 엔드포인트
```
GET /api/members/heatmap
```

### 쿼리 파라미터
- `centerId`: 센터 ID 필터
- `userType`: 회원 유형 필터
- `from`: 시작 날짜
- `to`: 종료 날짜

### 응답 형식
```json
{
  "success": true,
  "data": {
    "cells": [
      {
        "h3": "88283082bffffff",
        "countApprox": 15
      }
    ],
    "metadata": {
      "totalCells": 42,
      "h3Resolution": 8,
      "kAnonymityThreshold": 5,
      "laplaceEpsilon": 2
    }
  }
}
```

## 🔧 문제 해결

### 1. 지도가 표시되지 않는 경우
```bash
# VWorld API 키 확인
echo $NEXT_PUBLIC_VWORLD_KEY

# 도메인 등록 확인
# VWorld 개발자센터에서 도메인 등록 상태 확인
```

### 2. 패키지 설치 오류
```bash
# husky 문제 우회
npm install --ignore-scripts

# 또는 package.json에 직접 추가 후
npm install
```

### 3. H3 헥사곤이 표시되지 않는 경우
```bash
# deck.gl 라이브러리 로딩 확인
# 브라우저 콘솔에서 에러 메시지 확인
```

## 📚 참고 자료

- [VWorld 개발자센터](https://www.vworld.kr/dev/)
- [VWorld WMTS 가이드](https://www.vworld.kr/dev/v4dv_wmtsguide_s001.do)
- [VWorld Geocoder 2.0](https://www.vworld.kr/dev/v4dv_geocoderguide2_s001.do)
- [MapLibre GL JS](https://maplibre.org/)
- [deck.gl 공식 문서](https://deck.gl/)
- [H3 헥사곤 시스템](https://h3geo.org/)

## ⚠️ 주의사항

1. **API 키 보안**: 서버용 키는 절대 클라이언트에 노출하지 않음
2. **도메인 등록**: VWorld API는 도메인 등록 필수
3. **사용량 제한**: Geocoder는 일 40,000건 제한
4. **프라이버시**: 원본 주소/좌표는 절대 클라이언트에 전송하지 않음
5. **OSM 직접 사용 금지**: tile.openstreetmap.org 직접 사용은 정책상 비권장

## 🎯 완전 무료 운영

이 설정으로 **완전 무료**로 국내 최적화된 지도 서비스를 운영할 수 있습니다:

- ✅ VWorld WMTS: 무료 배경 지도
- ✅ VWorld Geocoder: 일 40,000건 무료
- ✅ MapLibre GL JS: 오픈소스
- ✅ deck.gl: 오픈소스
- ✅ H3-js: 오픈소스

**총 비용: 0원** 🎉
