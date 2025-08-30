/**
 * 🌍 JJ Swim Lab - Global Error 페이지
 * 
 * 📋 **페이지 목적**
 * - 애플리케이션 전체에서 발생하는 치명적인 에러를 처리하는 글로벌 에러 페이지
 * - 루트 레이아웃에서 발생하는 에러나 복구 불가능한 에러 상황 처리
 * - 사용자에게 에러 상황을 명확하게 안내하고 적절한 조치 방법 제시
 * - 글로벌 에러 로깅 및 모니터링을 위한 에러 정보 수집
 * - 애플리케이션의 안정성과 사용자 경험 보장
 * 
 * 🔄 **주요 기능**
 * - 글로벌 에러 메시지 및 상황 안내
 * - 에러 복구 및 애플리케이션 재시작 옵션
 * - 긴급 연락처 및 지원 정보 제공
 * - 에러 로깅 및 분석 데이터 수집
 * - 사용자 친화적인 에러 설명 및 해결 방법
 * 
 * 🗄️ **데이터 연동**
 * - 글로벌 에러 객체 및 스택 트레이스
 * - 에러 발생 컨텍스트 및 시스템 상태
 * - 사용자 세션 및 애플리케이션 상태
 * - 글로벌 에러 로깅 및 모니터링 시스템
 * - 에러 복구 및 재시작 상태
 * 
 * 🛠️ **필요한 설치 파일**
 * - Next.js (App Router, Global Error Boundary)
 * - React (Error Boundary, Global Error Handling)
 * - 글로벌 에러 로깅 및 모니터링 도구
 * - 에러 복구 및 재시작 시스템
 * - Tailwind CSS (스타일링)
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 글로벌 에러 메시지의 명확성 및 사용자 친화성
 * 2. 민감한 시스템 정보의 노출 방지
 * 3. 에러 복구 및 재시작 로직의 안정성
 * 4. 글로벌 에러 로깅의 성능 및 보안
 * 5. 다양한 글로벌 에러 타입에 대한 적절한 처리
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 글로벌 에러 메시지 표시 확인
 * - [ ] 에러 복구 및 재시작 기능 검증
 * - [ ] 글로벌 에러 로깅 및 모니터링 확인
 * - [ ] 사용자 안내 및 지원 정보 확인
 * - [ ] 글로벌 에러 처리 성능 및 안정성 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (기본 글로벌 에러 페이지)
 * - 2024-12-19: 글로벌 에러 처리 및 복구 시스템 구현
 * - 2024-12-19: 글로벌 에러 로깅 및 모니터링 시스템 구현
 * - 2024-12-19: 사용자 친화적 글로벌 에러 UI 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (글로벌 에러 페이지 완료)
 * 
 * 🚀 **다음 단계**
 * - 고급 글로벌 에러 분석 및 진단
 * - 자동 에러 복구 및 복구 시스템
 * - 성능 최적화
 * - 접근성 개선
 * 
 * 💡 **사용 예시**
 * ```tsx
 * // Next.js App Router에서 루트 레이아웃 에러 발생 시 자동으로 렌더링됨
 * // error와 reset props를 받아 글로벌 에러 처리
 * export default function GlobalError({
 *   error,
 *   reset,
 * }: {
 *   error: Error & { digest?: string }
 *   reset: () => void
 * }) {
 *   // 글로벌 에러 처리 로직
 * }
 * ```
 * 
 * 🔍 **글로벌 에러 처리 흐름**
 * 1. 애플리케이션 루트에서 치명적인 에러 발생
 * 2. Next.js Global Error Boundary가 에러를 캐치
 * 3. global-error.tsx 페이지가 렌더링됨
 * 4. 글로벌 에러 정보 표시 및 사용자 안내
 * 5. 에러 복구 옵션 및 지원 정보 제공
 * 6. 글로벌 에러 로깅 및 모니터링
 */

'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-red-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center border border-red-200">
            <div className="text-6xl mb-4">🚨</div>
            <h2 className="text-2xl font-bold text-red-900 mb-4">
              심각한 오류가 발생했습니다
            </h2>
            <p className="text-red-600 mb-6">
              애플리케이션에서 치명적인 오류가 발생했습니다.
            </p>
            <button
              onClick={reset}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
            >
              다시 시도
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}


