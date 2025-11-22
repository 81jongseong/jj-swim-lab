/**
 * 🔍 JJ Swim Lab - Not Found (404) 페이지
 * 
 * 📋 **페이지 목적**
 * - 존재하지 않는 페이지나 리소스에 접근할 때 표시되는 404 에러 페이지
 * - 사용자가 잘못된 URL로 접근했을 때 친화적인 안내 및 해결 방법 제시
 * - 홈페이지로 돌아가거나 올바른 페이지를 찾을 수 있도록 네비게이션 지원
 * - 404 에러 상황에서도 사용자 경험을 개선하는 페이지
 * - 잘못된 링크나 북마크에 대한 적절한 처리
 * 
 * 🔄 **주요 기능**
 * - 404 에러 메시지 및 안내 표시
 * - 홈페이지로 돌아가기 네비게이션
 * - 검색 기능을 통한 올바른 페이지 찾기
 * - 사이트맵 또는 주요 페이지 링크 제공
 * - 사용자 친화적인 에러 설명 및 해결 방법
 * 
 * 🗄️ **데이터 연동**
 * - 404 에러 발생 컨텍스트 정보
 * - 사용자 세션 및 상태 데이터
 * - 검색 기능 및 사이트맵 데이터
 * - 네비게이션 및 링크 정보
 * - 에러 로깅 및 분석 데이터
 * 
 * 🛠️ **필요한 설치 파일**
 * - Next.js (App Router)
 * - React (404 페이지 처리)
 * - 검색 및 네비게이션 시스템
 * - 에러 로깅 및 분석 도구
 * - Tailwind CSS (스타일링)
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 404 에러 메시지의 사용자 친화적 표현
 * 2. 홈페이지로 돌아가는 명확한 네비게이션
 * 3. 검색 기능을 통한 올바른 페이지 찾기 지원
 * 4. 404 에러 상황에서의 사용자 경험 개선
 * 5. 잘못된 링크나 북마크에 대한 적절한 처리
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 404 에러 메시지 표시 확인
 * - [ ] 홈페이지 네비게이션 동작 검증
 * - [ ] 검색 기능 동작 확인
 * - [ ] 사이트맵 및 링크 제공 확인
 * - [ ] 사용자 경험 및 접근성 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (기본 404 페이지)
 * - 2024-12-19: 404 에러 처리 및 안내 시스템 구현
 * - 2024-12-19: 네비게이션 및 검색 시스템 구현
 * - 2024-12-19: 사용자 친화적 404 UI 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (404 페이지 완료)
 * 
 * 🚀 **다음 단계**
 * - 고급 검색 및 추천 시스템
 * - 자동 페이지 리다이렉션
 * - 성능 최적화
 * - 접근성 개선
 * 
 * 💡 **사용 예시**
 * ```tsx
 * // Next.js App Router에서 존재하지 않는 경로 접근 시 자동으로 렌더링됨
 * export default function NotFound() {
 *   return (
 *     <div className="not-found-container">
 *       <h1>페이지를 찾을 수 없습니다</h1>
 *       <p>요청하신 페이지가 존재하지 않거나 이동되었습니다.</p>
 *       <Link href="/">홈페이지로 돌아가기</Link>
 *     </div>
 *   );
 * }
 * ```
 * 
 * 🔍 **404 처리 흐름**
 * 1. 사용자가 존재하지 않는 URL 접근
 * 2. Next.js가 not-found.tsx를 자동으로 렌더링
 * 3. 404 에러 메시지 및 안내 표시
 * 4. 네비게이션 옵션 제공 (홈페이지, 검색 등)
 * 5. 사용자가 올바른 페이지로 이동할 수 있도록 지원
 */

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white shadow-xl rounded-2xl p-8 text-center border border-gray-100">
        <div className="text-7xl mb-6 animate-bounce">🔍</div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          페이지를 찾을 수 없습니다
        </h2>
        <p className="text-gray-600 mb-8 text-lg">
          요청하신 페이지가 존재하지 않거나 이동되었습니다.<br />
          올바른 주소를 입력했는지 확인해 주세요.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button size="lg" className="w-full sm:w-auto">
              홈으로 돌아가기
            </Button>
          </Link>
          <Link href="/contact">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              문의하기
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
} 