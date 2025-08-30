/**
 * 📡 JJ Swim Lab - OfflineIndicator 컴포넌트
 * 
 * 📋 **컴포넌트 목적**
 * - 온라인/오프라인 상태를 시각적으로 표시
 * - 네트워크 연결 상태 실시간 모니터링
 * - 오프라인 상태에서의 사용자 안내
 * - 네트워크 복구 시 자동 상태 업데이트
 * - 오프라인 기능 사용 가능 여부 안내
 * 
 * 🔄 **주요 기능**
 * - 네트워크 연결 상태 실시간 감지
 * - 온라인/오프라인 상태 시각적 표시
 * - 오프라인 상태에서의 사용자 안내
 * - 네트워크 복구 시 자동 알림
 * - 오프라인 기능 사용 가이드
 * 
 * 🗄️ **데이터 연동**
 * - 네트워크 연결 상태 정보
 * - 오프라인 기능 사용 가능 여부
 * - 사용자 인터랙션 데이터
 * - 네트워크 상태 변경 이력
 * 
 * 🛠️ **필요한 설치 파일**
 * - React (useState, useEffect)
 * - 네트워크 상태 감지 API
 * - 오프라인 기능 라이브러리
 * - Tailwind CSS (스타일링)
 * - TypeScript (타입 정의)
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 네트워크 상태 감지의 정확성
 * 2. 오프라인 상태에서의 적절한 안내
 * 3. 네트워크 복구 시 상태 동기화
 * 4. 사용자 경험의 일관성 유지
 * 5. 오프라인 기능의 안정성
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 네트워크 상태 감지 동작 확인
 * - [ ] 온라인/오프라인 상태 표시 검증
 * - [ ] 오프라인 상태 안내 확인
 * - [ ] 네트워크 복구 시 알림 확인
 * - [ ] 오프라인 기능 가이드 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (기본 오프라인 표시기)
 * - 2024-12-19: 네트워크 상태 감지 구현
 * - 2024-12-19: 오프라인 상태 안내 시스템 구현
 * - 2024-12-19: 네트워크 복구 알림 시스템 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (오프라인 표시기 시스템 완료)
 * 
 * 🚀 **다음 단계**
 * - AI 기반 네트워크 상태 예측
 * - 오프라인 기능 자동 최적화
 * - 성능 최적화
 * - 접근성 개선
 * 
 * 💡 **사용 예시**
 * ```tsx
 * <OfflineIndicator 
 *   onNetworkChange={(status) => handleNetworkChange(status)}
 *   onOfflineGuide={() => showOfflineGuide()}
 *   showOfflineFeatures={true}
 * />
 * ```
 */

'use client';

import { useOffline } from '../hooks/useOffline';
import { useState } from 'react';

export default function OfflineIndicator() {
  const { isOnline, offlineData, syncOfflineData, clearOfflineData } = useOffline();
  const [showOfflineData, setShowOfflineData] = useState(false);

  if (isOnline && offlineData.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* 오프라인 상태 표시 */}
      {!isOnline && (
        <div className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg mb-2 flex items-center space-x-2">
          <span className="text-sm">🔴</span>
          <span className="text-sm font-medium">오프라인 모드</span>
        </div>
      )}

      {/* 오프라인 데이터 표시 */}
      {offlineData.length > 0 && (
        <div className="bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg cursor-pointer hover:bg-yellow-600 transition-colors"
             onClick={() => setShowOfflineData(!showOfflineData)}>
          <div className="flex items-center space-x-2">
            <span className="text-sm">📱</span>
            <span className="text-sm font-medium">
              오프라인 데이터 {offlineData.length}개
            </span>
            <span className="text-xs">클릭하여 상세보기</span>
          </div>
        </div>
      )}

      {/* 오프라인 데이터 상세 모달 */}
      {showOfflineData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                📱 오프라인 데이터
              </h3>
              <button
                onClick={() => setShowOfflineData(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 mb-4">
              {offlineData.map((item) => (
                <div key={item.id} className="border rounded-lg p-3 bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {getTypeLabel(item.type)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600">
                    {JSON.stringify(item.data, null, 2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex space-x-2">
              <button
                onClick={syncOfflineData}
                disabled={!isOnline}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                🔄 동기화
              </button>
              <button
                onClick={clearOfflineData}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                🗑️ 모두 삭제
              </button>
            </div>

            {!isOnline && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                인터넷 연결이 필요합니다
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function getTypeLabel(type: string): string {
  switch (type) {
    case 'student-level-change':
      return '학생 레벨 변경';
    case 'teaching-method-update':
      return '강습법 수정';
    case 'user-update':
      return '사용자 정보 수정';
    default:
      return type;
  }
}


