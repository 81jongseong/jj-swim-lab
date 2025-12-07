# 🔄 console.log → logger 교체 계획

> **작성일**: 2025-11-23  
> **목적**: 개발용 console.log를 logger로 교체하여 프로덕션 환경 최적화

---

## 📊 현황

- **총 console.log**: 3,365개 (284개 파일)
- **logger 사용**: 9개 파일만 사용 중
- **교체 완료**: common 컴포넌트 (CenterSelector.tsx)

---

## 🎯 교체 전략

### 1단계: 핵심 파일 (우선순위 높음)
- `client/lib/api/*` - API 호출 로깅
- `client/hooks/*` - 훅 내부 로깅
- `client/components/common/*` - 공통 컴포넌트 ✅ 완료

### 2단계: 주요 컴포넌트 (우선순위 중간)
- `client/components/ui/*` - UI 컴포넌트
- `client/components/swimlab/*` - 핵심 비즈니스 로직

### 3단계: 페이지 컴포넌트 (우선순위 낮음)
- `client/app/**/*.tsx` - 페이지 컴포넌트

---

## 📋 교체 규칙

### console.log → logger.info
- 개발용 정보 로깅
- 디버깅 메시지

### console.warn → logger.warn
- 경고 메시지
- 사용자 주의 필요 사항

### console.error → logger.error
- 에러 로깅
- 예외 처리

---

## ⚠️ 주의사항

1. **개발 환경 체크 불필요**: logger가 이미 NODE_ENV를 체크함
2. **에러 로깅은 항상 표시**: logger.error는 프로덕션에서도 표시
3. **민감한 정보 제거**: 프로덕션에서 제거해야 할 정보는 logger.info 사용

---

## 📅 업데이트 이력

- 2025-11-23: 초기 계획 작성
- 2025-11-23: common 컴포넌트 교체 완료

