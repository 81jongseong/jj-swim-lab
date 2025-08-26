'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 초기 상태 설정
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔄</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            인터넷 연결이 복구되었습니다!
          </h1>
          <p className="text-gray-600 mb-6">
            페이지를 새로고침하여 최신 정보를 확인하세요.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            새로고침
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* 오프라인 아이콘 */}
        <div className="text-8xl mb-6">📱</div>
        
        {/* 제목 */}
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          오프라인 모드
        </h1>
        
        {/* 설명 */}
        <p className="text-gray-600 mb-8 leading-relaxed">
          현재 인터넷 연결이 없습니다. 
          일부 기능은 오프라인에서도 사용할 수 있습니다.
        </p>

        {/* 오프라인 기능 목록 */}
        <div className="bg-white rounded-lg p-6 mb-8 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            🎯 오프라인에서 사용 가능한 기능
          </h2>
          <ul className="text-left text-gray-600 space-y-2">
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              저장된 강습법 보기
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              학생 체크리스트 확인
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              기본 사용자 정보
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              오프라인 데이터 입력 (동기화 대기)
            </li>
          </ul>
        </div>

        {/* 액션 버튼들 */}
        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            🔄 연결 재시도
          </button>
          
          <Link
            href="/"
            className="block w-full bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            🏠 홈으로 이동
          </Link>
        </div>

        {/* 도움말 */}
        <div className="mt-8 text-sm text-gray-500">
          <p>문제가 지속되면 네트워크 연결을 확인해주세요.</p>
        </div>
      </div>
    </div>
  );
}


