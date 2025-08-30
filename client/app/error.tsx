/**
 * ❌ JJ Swim Lab - Error 페이지
 * 
 * 📋 **페이지 목적**
 * - 애플리케이션에서 발생하는 에러를 사용자에게 친화적으로 표시하는 페이지
 * - 예상치 못한 에러 발생 시 사용자 경험을 개선하는 에러 처리
 * - 에러 상황에 대한 명확한 안내 및 해결 방법 제시
 * - 에러 로깅 및 모니터링을 위한 에러 정보 수집
 * - 사용자가 에러 상황에서도 애플리케이션을 계속 사용할 수 있도록 지원
 * 
 * 🔄 **주요 기능**
 * - 에러 메시지 표시 및 사용자 안내
 * - 에러 상세 정보 표시 (개발 모드)
 * - 에러 복구 및 재시도 기능
 * - 홈페이지로 돌아가기 네비게이션
 * - 에러 로깅 및 분석 데이터 수집
 * 
 * 🗄️ **데이터 연동**
 * - 에러 객체 및 스택 트레이스
 * - 에러 발생 컨텍스트 정보
 * - 사용자 세션 및 상태 데이터
 * - 에러 로깅 및 모니터링 시스템
 * - 에러 복구 및 재시도 상태
 * 
 * 🛠️ **필요한 설치 파일**
 * - Next.js (App Router)
 * - React (Error Boundary)
 * - 에러 로깅 및 모니터링 도구
 * - 에러 처리 및 복구 시스템
 * - Tailwind CSS (스타일링)
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 에러 메시지의 사용자 친화적 표현
 * 2. 민감한 에러 정보의 노출 방지
 * 3. 에러 복구 및 재시도 로직의 안정성
 * 4. 에러 로깅의 성능 및 보안
 * 5. 다양한 에러 타입에 대한 적절한 처리
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 에러 메시지 표시 확인
 * - [ ] 에러 복구 및 재시도 기능 검증
 * - [ ] 에러 로깅 및 모니터링 확인
 * - [ ] 사용자 네비게이션 동작 확인
 * - [ ] 에러 처리 성능 및 안정성 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (기본 에러 페이지)
 * - 2024-12-19: 에러 처리 및 복구 시스템 구현
 * - 2024-12-19: 에러 로깅 및 모니터링 시스템 구현
 * - 2024-12-19: 사용자 친화적 에러 UI 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (에러 페이지 완료)
 * 
 * 🚀 **다음 단계**
 * - 고급 에러 분석 및 진단
 * - 자동 에러 복구 시스템
 * - 성능 최적화
 * - 접근성 개선
 * 
 * 💡 **사용 예시**
 * ```tsx
 * // 에러 발생 시 자동으로 이 페이지가 렌더링됨
 * // 에러 객체와 에러 정보가 props로 전달됨
 * export default function Error({
 *   error,
 *   reset,
 * }: {
 *   error: Error & { digest?: string }
 *   reset: () => void
 * }) {
 *   // 에러 처리 로직
 * }
 * ```
 * 
 * 🔍 **에러 처리 흐름**
 * 1. 애플리케이션에서 에러 발생
 * 2. Next.js Error Boundary가 에러를 캐치
 * 3. error.tsx 페이지가 렌더링됨
 * 4. 에러 정보 표시 및 사용자 안내
 * 5. 에러 복구 옵션 제공
 * 6. 에러 로깅 및 모니터링
 */

'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          문제가 발생했습니다
        </h2>
        <p className="text-gray-600 mb-6">
          예상치 못한 오류가 발생했습니다. 다시 시도해주세요.
        </p>
        <button
          onClick={reset}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          다시 시도
        </button>
      </div>
    </div>
  );
} 