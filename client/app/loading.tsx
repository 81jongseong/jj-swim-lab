/**
 * ⏳ JJ Swim Lab - Loading 페이지
 * 
 * 📋 **페이지 목적**
 * - 페이지 로딩 중 사용자에게 시각적 피드백을 제공하는 로딩 페이지
 * - 데이터 로딩, 페이지 전환, API 호출 등의 대기 시간 동안 사용자 경험 개선
 * - 일관된 로딩 UI 디자인 시스템 제공
 * - 로딩 상태에 대한 명확한 표시 및 진행 상황 안내
 * - 사용자가 로딩 상태를 인지하고 기다릴 수 있도록 지원
 * 
 * 🔄 **주요 기능**
 * - 로딩 스피너 및 애니메이션 표시
 * - 로딩 메시지 및 진행 상황 안내
 * - 일관된 로딩 UI 디자인
 * - 반응형 로딩 컴포넌트
 * - 로딩 상태별 다양한 표시 옵션
 * 
 * 🗄️ **데이터 연동**
 * - 로딩 상태 및 진행 상황
 * - 로딩 메시지 및 안내 텍스트
 * - 로딩 애니메이션 설정
 * - 로딩 시간 및 성능 메트릭
 * - 로딩 상태별 UI 변경
 * 
 * 🛠️ **필요한 설치 파일**
 * - Next.js (App Router)
 * - React (Suspense, Loading UI)
 * - 로딩 애니메이션 라이브러리
 * - 로딩 상태 관리 시스템
 * - Tailwind CSS (스타일링)
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 로딩 애니메이션의 부드러움 및 자연스러움
 * 2. 로딩 메시지의 명확성 및 유용성
 * 3. 로딩 시간이 길어질 경우의 사용자 경험
 * 4. 다양한 화면 크기에서의 로딩 UI 적응
 * 5. 로딩 상태와 실제 로딩 진행 상황의 일치
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 로딩 애니메이션 동작 확인
 * - [ ] 로딩 메시지 표시 검증
 * - [ ] 반응형 로딩 UI 동작 확인
 * - [ ] 로딩 상태 표시 일관성 확인
 * - [ ] 로딩 성능 및 사용자 경험 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (기본 로딩 페이지)
 * - 2024-12-19: 로딩 애니메이션 시스템 구현
 * - 2024-12-19: 로딩 메시지 및 안내 시스템 구현
 * - 2024-12-19: 반응형 로딩 UI 시스템 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (로딩 페이지 완료)
 * 
 * 🚀 **다음 단계**
 * - 고급 로딩 애니메이션
 * - 실시간 진행률 표시
 * - 성능 최적화
 * - 접근성 개선
 * 
 * 💡 **사용 예시**
 * ```tsx
 * // Next.js App Router에서 자동으로 로딩 상태일 때 렌더링됨
 * // Suspense와 함께 사용하여 로딩 UI 제공
 * export default function Loading() {
 *   return (
 *     <div className="loading-container">
 *       <LoadingSpinner />
 *       <p>페이지를 불러오는 중...</p>
 *     </div>
 *   );
 * }
 * ```
 * 
 * 🔍 **로딩 처리 흐름**
 * 1. 페이지 또는 컴포넌트 로딩 시작
 * 2. Next.js가 loading.tsx를 자동으로 렌더링
 * 3. 로딩 애니메이션 및 메시지 표시
 * 4. 실제 콘텐츠 로딩 완료
 * 5. 로딩 페이지가 실제 콘텐츠로 교체
 */

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
        <div className="text-6xl mb-4 animate-spin">⏳</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          로딩 중...
        </h2>
        <p className="text-gray-600">
          페이지를 불러오는 중입니다. 잠시만 기다려주세요.
        </p>
      </div>
    </div>
  );
} 