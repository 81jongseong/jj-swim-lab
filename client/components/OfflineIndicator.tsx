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


