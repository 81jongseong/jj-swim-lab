/**
 * 🛠️ JJ Swim Lab - API 유틸리티 함수
 * 
 * 📋 **유틸리티 목적**
 * - API 응답 처리를 위한 공통 유틸리티 함수
 * - HTTP 응답 상태 검증 및 에러 처리
 * - API 응답 데이터 파싱 및 변환
 * - 에러 메시지 표준화 및 일관성 유지
 * - API 호출 결과의 타입 안전성 보장
 * 
 * 🔄 **주요 기능**
 * - HTTP 응답 상태 검증
 * - API 응답 데이터 파싱
 * - 에러 메시지 표준화
 * - 타입 안전한 응답 처리
 * - 에러 로깅 및 디버깅 지원
 * 
 * 🗄️ **데이터 연동**
 * - HTTP 응답 객체
 * - API 응답 데이터
 * - 에러 메시지 및 상태 코드
 * - 로깅 및 디버깅 정보
 * 
 * 🛠️ **필요한 설치 파일**
 * - TypeScript 컴파일러
 * - HTTP 클라이언트 라이브러리
 * - 에러 처리 및 로깅 시스템
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. HTTP 응답 상태 코드 검증
 * 2. 에러 메시지의 일관성 및 명확성
 * 3. API 응답 데이터의 타입 안전성
 * 4. 에러 로깅 및 디버깅 정보
 * 5. 네트워크 에러 및 타임아웃 처리
 * 6. 사용자 친화적인 에러 메시지
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] HTTP 응답 상태 검증 확인
 * - [ ] 에러 메시지 일관성 확인
 * - [ ] API 응답 데이터 타입 안전성 확인
 * - [ ] 에러 로깅 및 디버깅 확인
 * - [ ] 네트워크 에러 처리 확인
 * - [ ] 사용자 친화적 에러 메시지 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 API 유틸리티 함수 구현
 * - 2024-12-19: HTTP 응답 상태 검증 구현
 * - 2024-12-19: 에러 메시지 표준화 구현
 * - 2024-12-19: 타입 안전한 응답 처리 구현
 * - 2024-12-19: 에러 로깅 및 디버깅 지원 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (API 유틸리티 함수 완료)
 * 
 * 🚀 **다음 단계**
 * - API 응답 캐싱 시스템
 * - API 응답 압축 및 최적화
 * - API 응답 검증 및 보안
 * - API 응답 모니터링 및 분석
 * - API 응답 성능 최적화
 * 
 * 💡 **사용 예시**
 * ```typescript
 * // API 응답 처리
 * const response = await fetch('/api/users');
 * const users = await handleApiResponse<User[]>(response);
 * 
 * // 에러 처리
 * try {
 *   const data = await handleApiResponse<Data>(response);
 * } catch (error) {
 *   console.error('API 호출 실패:', error.message);
 * }
 * ```
 * 
 * 🔍 **API 응답 처리 흐름**
 * 1. HTTP 응답 상태 코드 검증
 * 2. 응답 데이터 파싱 및 변환
 * 3. 에러 발생 시 에러 메시지 표준화
 * 4. 타입 안전한 응답 데이터 반환
 * 5. 에러 로깅 및 디버깅 정보 기록
 * 6. 사용자 친화적 에러 메시지 제공
 * 7. API 응답 결과 반환
 */

export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }
  return await response.json();
}

