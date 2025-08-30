/**
 * ✅ JJ Swim Lab - 3D 뷰어 테스트 페이지
 * 
 * 📋 **목적**
 * - 3D 뷰어 컴포넌트 테스트
 * - 다양한 설정 옵션 확인
 * - 성능 및 안정성 검증
 */

'use client';

import React, { useState } from 'react';
import { ThreeDViewer } from '@/components/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Button } from '@/components/ui';

export default function ThreeDViewerPage() {
  const [showStats, setShowStats] = useState(false);
  const [showEnvironment, setShowEnvironment] = useState(true);
  const [viewerKey, setViewerKey] = useState(0);

  const handleReset = () => {
    setViewerKey(prev => prev + 1);
  };

  const handleError = (error: Error) => {
    console.error('3D 뷰어 오류 발생:', error);
    // 여기서 Toast 알림을 표시할 수 있습니다
    if ((window as any).showToast) {
      (window as any).showToast({
        type: 'error',
        title: '3D 뷰어 오류',
        message: '3D 뷰어에서 오류가 발생했습니다.',
        duration: 5000
      });
    }
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
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>뷰어 설정</CardTitle>
        </CardHeader>
        <CardContent>
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
            
            <Button onClick={handleReset} variant="outline">
              뷰어 재시작
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 3D 뷰어 */}
      <Card>
        <CardHeader>
          <CardTitle>3D 뷰어</CardTitle>
        </CardHeader>
        <CardContent>
          <div key={viewerKey}>
            <ThreeDViewer
              showStats={showStats}
              showEnvironment={showEnvironment}
              onError={handleError}
              className="w-full"
            />
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            <p>💡 <strong>사용법:</strong></p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>마우스 왼쪽 버튼: 회전</li>
              <li>마우스 오른쪽 버튼: 이동</li>
              <li>마우스 휠: 확대/축소</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* 정보 패널 */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>기술 정보</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
}

