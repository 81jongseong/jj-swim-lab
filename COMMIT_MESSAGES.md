# 커밋 메시지 수정 가이드

다음 커밋들의 메시지를 수정해야 합니다:

## 1. 0d0ebbd
```
feat: 프리미엄 UI 디자인 시스템 적용 (Antigravity)

- 디자인 시스템 전면 개편
  - Indigo/Violet 계열 프리미엄 색상 테마 적용
  - Glassmorphism 효과 추가 (backdrop-blur)
  - 그라데이션 배경 및 버튼 스타일 개선

- globals.css
  - CSS 변수 기반 색상 시스템 재구성
  - 배경 그라데이션 효과 추가
  - Glassmorphism 유틸리티 클래스 추가
  - 텍스트 그라데이션 유틸리티 추가
  - 폰트 변수 추가

- layout.tsx
  - Outfit 폰트 추가 (헤딩용)
  - 폰트 변수 설정

- Navigation.tsx
  - 네비게이션 배경에 backdrop-filter 및 그라데이션 적용
  - 메뉴 항목에 그라데이션 및 그림자 효과 추가

- UI 컴포넌트 개선
  - Badge: 그림자 효과, 그라데이션 배경
  - Button: 그라데이션 배경, 그림자 및 호버 효과
  - Card: Glassmorphism 효과, 호버 애니메이션
  - Input: Glassmorphism 효과, 호버/포커스 스타일 개선

- tailwind.config.js
  - CSS 변수 기반 색상 시스템으로 전환
  - 프리미엄 브랜드 색상 팔레트 추가
  - 애니메이션 및 키프레임 추가
  - tailwindcss-animate 플러그인 추가
```

## 2. 5f77dee
```
refactor: 모든 routes 파일에서 console.error를 logger로 변경

- 서버 측 로깅 표준화
  - console.error를 logger로 일괄 변경
  - 일관된 에러 로깅 형식 적용
```

## 3. 38039d0
```
refactor(server): instructor-progress.ts, recommendations.ts, student-goals.ts, smartwatch.ts console.error를 logger로 변경 완료

- instructor-progress.ts: 2개 변경
- recommendations.ts: 5개 변경
- student-goals.ts: 9개 변경
- smartwatch.ts: 7개 변경
```

## 4. 01497fb
```
refactor(server): teaching-methods.ts, progress.ts, shop.ts console.error를 logger로 변경 완료

- teaching-methods.ts: 8개 변경
- progress.ts: 9개 변경
- shop.ts: 10개 변경
```

## 5. 891873b
```
refactor(server): auth.ts, center-admin.ts, health-measurements.ts, center-info.ts console.error를 logger로 변경 완료

- auth.ts: 변경 완료
- center-admin.ts: 변경 완료
- health-measurements.ts: 변경 완료
- center-info.ts: 변경 완료
```

## 6. e270f00
```
refactor(server): video-3d-analysis.ts console.error를 logger로 변경 완료

- video-3d-analysis.ts: 14개 변경
```

