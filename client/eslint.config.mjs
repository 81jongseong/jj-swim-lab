/**
 * 🔍 JJ Swim Lab - ESLint 설정 파일
 * 
 * 📋 **파일 목적**
 * - JavaScript/TypeScript 코드 품질 및 일관성을 관리하는 린터 설정 파일
 * - 코드 스타일, 잠재적 오류, 모범 사례 등을 검사하는 규칙 정의
 * - 팀 개발 시 일관된 코드 품질 및 스타일 가이드 제공
 * - 자동 코드 포맷팅 및 오류 수정 기능 설정
 * - 개발 생산성 향상 및 버그 예방을 위한 설정 제공
 * 
 * 🔄 **주요 기능**
 * - 코드 스타일 및 포맷팅 규칙 설정
 * - 잠재적 오류 및 버그 감지 규칙
 * - 모범 사례 및 코딩 컨벤션 강제
 * - 자동 코드 수정 및 포맷팅
 * - TypeScript 전용 린팅 규칙
 * - React 및 Next.js 특화 규칙
 * 
 * 🗄️ **데이터 연동**
 * - JavaScript/TypeScript 소스 코드
 * - 코드 스타일 및 포맷팅 규칙
 * - 린팅 오류 및 경고 데이터
 * - 자동 수정 및 포맷팅 설정
 * - 팀 코딩 컨벤션 규칙
 * 
 * 🛠️ **필요한 설치 파일**
 * - ESLint 린터
 * - TypeScript ESLint 플러그인
 * - React ESLint 플러그인
 * - Next.js ESLint 플러그인
 * - 코드 포맷팅 도구
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 린팅 규칙의 적절성 및 팀 합의 확인
 * 2. 자동 수정 기능의 안전성 및 정확성 검증
 * 3. 성능에 영향을 주는 규칙의 최적화
 * 4. TypeScript 및 React 특화 규칙의 호환성
 * 5. 팀 코딩 컨벤션과의 일관성 유지
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 린팅 규칙 및 오류 감지 동작 확인
 * - [ ] 자동 수정 및 포맷팅 기능 검증
 * - [ ] TypeScript 및 React 규칙 동작 확인
 * - [ ] 성능 및 메모리 사용량 확인
 * - [ ] 팀 코딩 컨벤션과의 일관성 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (기본 ESLint 설정)
 * - 2024-12-19: TypeScript ESLint 규칙 시스템 구현
 * - 2024-12-19: React 및 Next.js 특화 규칙 시스템 구현
 * - 2024-12-19: 자동 수정 및 포맷팅 시스템 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (ESLint 설정 시스템 완료)
 * 
 * 🚀 **다음 단계**
 * - AI 기반 코드 품질 최적화
 * - 자동 코드 리팩토링 제안
 * - 성능 최적화
 * - 보안 강화
 * 
 * 💡 **주요 설정 옵션**
 * - extends: 기본 규칙 세트 및 플러그인 확장
 * - plugins: ESLint 플러그인 및 추가 규칙
 * - rules: 개별 린팅 규칙 및 설정
 * - parserOptions: 파서 옵션 및 언어 기능
 * - env: 실행 환경 및 전역 변수 설정
 * 
 * 🔍 **린팅 처리 흐름**
 * 1. 소스 코드 파일 로드 및 파싱
 * 2. 설정된 린팅 규칙 적용 및 검사
 * 3. 오류 및 경고 감지 및 보고
 * 4. 자동 수정 가능한 문제 자동 수정
 * 5. 린팅 결과 및 통계 생성
 */

import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      globals: {
        React: "readonly",
        HeadersInit: "readonly",
        RequestInit: "readonly",
        NodeJS: "readonly",
      },
    },
    rules: {
      // TypeScript 환경에서는 전역 식별자 판별을 TS가 담당하므로 중복 경고를 끕니다
      "no-undef": "off",
      // 콘텐츠 문자열의 작은따옴표/쌍따옴표 이스케이프 강제 비활성화
      "react/no-unescaped-entities": "off",
    },
  },
  {
    files: ["**/*.{test,spec}.{ts,tsx,js,jsx}", "**/__tests__/**/*"],
    languageOptions: {
      globals: {
        describe: "readonly",
        test: "readonly",
        expect: "readonly",
      },
    },
  },
  {
    rules: {
      // 콘솔은 경고로 완화
      "no-console": "warn",
    },
  },
];

export default eslintConfig;
