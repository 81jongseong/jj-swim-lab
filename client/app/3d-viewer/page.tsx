'use client';

import React, { useState } from 'react';

export default function ThreeDViewerPage() {
  const [showStats, setShowStats] = useState(false);
  const [showEnvironment, setShowEnvironment] = useState(true);
  const [viewerKey, setViewerKey] = useState(0);

  const handleReset = () => {
    setViewerKey(prev => prev + 1);
  };

  const handleError = (error: Error) => {
    console.error('3D 뷰어 오류 발생:', error);
    alert('3D 뷰어에서 오류가 발생했습니다.');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">3D 뷰어 테스트</h1>
        <p className="text-gray-600">
          JJ Swim Lab의 3D 뷰어 기능을 테스트하고 설정할 수 있습니다.
        </p>
      </div>

      {/* 컨트롤 패널 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">뷰어 설정</h3>
        </div>
        <div className="flex flex-wrap gap-4 items-center">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showStats}
              onChange={(e) => setShowStats(e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">성능 통계 표시</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showEnvironment}
              onChange={(e) => setShowEnvironment(e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">환경 조명</span>
          </label>
          
          <button 
            onClick={handleReset}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            뷰어 재시작
          </button>
        </div>
      </div>

      {/* 3D 뷰어 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">3D 뷰어</h3>
        </div>
        <div key={viewerKey} className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-2">🎯</div>
            <p>3D 뷰어 컴포넌트</p>
            <p className="text-sm">(Three.js 기반)</p>
          </div>
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          <p>💡 <strong>사용법:</strong></p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>마우스 왼쪽 버튼: 회전</li>
            <li>마우스 오른쪽 버튼: 이동</li>
            <li>마우스 휠: 확대/축소</li>
          </ul>
        </div>
      </div>

      {/* 정보 패널 */}
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">기술 정보</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">3D 엔진</h4>
            <ul className="space-y-1 text-gray-600">
              <li>• Three.js - 3D 렌더링</li>
              <li>• React Three Fiber - React 통합</li>
              <li>• Drei - 유틸리티 컴포넌트</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">기능</h4>
            <ul className="space-y-1 text-gray-600">
              <li>• 실시간 3D 렌더링</li>
              <li>• 카메라 컨트롤</li>
              <li>• 에러 처리 및 복구</li>
              <li>• 성능 모니터링</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}