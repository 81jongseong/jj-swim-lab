/**
 * ✅ JJ Swim Lab - 3D 뷰어 컴포넌트
 * 
 * 📋 **기능**
 * - 3D 수영 자세 표시
 * - 기본 3D 씬 렌더링
 * - 카메라 컨트롤
 * - 안전한 에러 처리
 * 
 * 🛠️ **기술 스택**
 * - Three.js: 3D 렌더링 엔진
 * - React Three Fiber: React 통합
 * - Drei: 유틸리티 컴포넌트
 */

'use client';

import React, { Suspense, useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Stats } from '@react-three/drei';
import { ErrorBoundary } from './errorboundary';

interface ThreeDViewerProps {
  className?: string;
  showStats?: boolean;
  showEnvironment?: boolean;
  onError?: (error: Error) => void;
}

// 기본 3D 씬 컴포넌트
function BasicScene() {
  return (
    <>
      {/* 기본 조명 */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />

      {/* 간단한 3D 객체들 */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="blue" />
      </mesh>

      <mesh position={[2, 0, 0]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="red" />
      </mesh>

      <mesh position={[-2, 0, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 1, 32]} />
        <meshStandardMaterial color="green" />
      </mesh>
    </>
  );
}

// 로딩 컴포넌트
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">3D 뷰어 로딩 중...</p>
      </div>
    </div>
  );
}

// 에러 발생 시 fallback 컴포넌트
function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center p-6 bg-red-50 rounded-lg border border-red-200">
        <div className="text-red-600 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-red-800 mb-2">3D 뷰어 오류</h3>
        <p className="text-red-600 mb-4 text-sm">
          {error.message || '3D 뷰어를 로드하는 중 오류가 발생했습니다.'}
        </p>
        <button
          onClick={resetErrorBoundary}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          다시 시도
        </button>
      </div>
    </div>
  );
}

export function ThreeDViewer({
  className = '',
  showStats = false,
  showEnvironment = true,
  onError
}: ThreeDViewerProps) {
  const [hasError, setHasError] = useState(false);

  const handleError = useCallback((error: Error) => {
    console.error('3D 뷰어 오류:', error);
    setHasError(true);
    onError?.(error);
  }, [onError]);

  const handleReset = useCallback(() => {
    setHasError(false);
  }, []);

  // 오류가 발생한 경우 fallback UI 표시
  if (hasError) {
    return (
      <div className={`w-full h-96 bg-gray-100 rounded-lg ${className}`}>
        <ErrorFallback
          error={new Error('3D 뷰어 초기화 실패')}
          resetErrorBoundary={handleReset}
        />
      </div>
    );
  }

  return (
    <div className={`w-full h-96 bg-gray-900 rounded-lg overflow-hidden ${className}`}>
      <ErrorBoundary
        fallback={<ErrorFallback error={new Error('3D 렌더링 오류')} resetErrorBoundary={handleReset} />}
        onError={handleError}
      >
        <Canvas
          camera={{ position: [5, 5, 5], fov: 75 }}
          onCreated={({ gl }) => {
            gl.setClearColor('#1f2937'); // 다크 그레이 배경
          }}
        >
          <Suspense fallback={null}>
            <BasicScene />

            {/* 환경 조명 */}
            {showEnvironment && (
              <Environment preset="sunset" />
            )}

            {/* 카메라 컨트롤 */}
            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={2}
              maxDistance={20}
            />

            {/* 성능 통계 (개발 환경에서만) */}
            {showStats && process.env.NODE_ENV === 'development' && (
              <Stats />
            )}
          </Suspense>
        </Canvas>
      </ErrorBoundary>
    </div>
  );
}

export default ThreeDViewer;

