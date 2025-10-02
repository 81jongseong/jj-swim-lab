/**
 * 🏊‍♂️ 3D 드릴/영법 갤러리 페이지
 * 
 * 📋 **의존성**:
 * - ../../components/3d-viewer/DrillGrid.tsx
 * - ../../components/3d-viewer/ThreeDPlayer.tsx
 * - ../../stores/threeStore.ts
 * 
 * 🔄 **연동 데이터**:
 * - ../../data/drills3d.ts (샘플 데이터)
 * - 추후 DB API 연동 예정
 * 
 * 🎨 **레이아웃**:
 * - 데스크톱: 좌측 카드 그리드 + 우측 스티키 3D 뷰어
 * - 모바일: 카드 탭 시 하단 드로어에 3D 뷰어
 * 
 * ⚠️ **주의사항**:
 * - 체험 공개된 드릴만 표시 (isPublicDemo: true)
 * - 3D 모델은 나중에 추가 (현재는 플레이스홀더)
 * - Three.js 통합 예정 (@react-three/fiber)
 * 
 * 📅 **수정 히스토리**:
 * - 2025-01-22: 초기 구조 생성 (스켈레톤)
 * - TODO: Three.js 통합
 * - TODO: DB API 연동
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import DrillGrid from '../../components/3d-viewer/DrillGrid';
import ThreeDPlayer from '../../components/3d-viewer/ThreeDPlayer';
import { useThreeStore } from '../../stores/threeStore';

export default function ThreeDViewerPage() {
  const { user } = useAuth();
  const { selectedId, setSelected } = useThreeStore();
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileDrawer, setShowMobileDrawer] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);

  // 모바일 감지
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 모바일에서 드릴 선택 시 드로어 표시
  useEffect(() => {
    if (isMobile && selectedId) {
      setShowMobileDrawer(true);
    }
  }, [isMobile, selectedId]);

  // 드로어 닫기
  const handleCloseDrawer = () => {
    setShowMobileDrawer(false);
    // 선택 해제는 하지 않음 (다시 열 수 있도록)
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1400px] mx-auto p-4">
        {/* 헤더 */}
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              🏊‍♂️ 3D 드릴 · 영법 갤러리
            </h1>
            <p className="text-gray-600 text-sm md:text-base">
              3D 애니메이션으로 정확한 수영 동작을 학습하세요
            </p>
          </div>
          
          {/* 관리자 모드 토글 */}
          {user && (user.userType === 'superAdmin' || user.userType === 'centerAdmin') && (
            <button
              onClick={() => setIsAdminMode(!isAdminMode)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isAdminMode 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {isAdminMode ? '✏️ 관리 모드' : '👁️ 보기 모드'}
            </button>
          )}
        </div>

        {/* 관리자 모드: 영법 관리 UI */}
        {isAdminMode && (
          <div className="mb-6 p-4 bg-white rounded-lg shadow border-2 border-blue-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">영법 데이터 관리</h2>
              <button
                onClick={() => {
                  window.location.href = '/admin/3d-viewer/swimming-styles';
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                전체 관리 페이지로 이동 →
              </button>
            </div>
            <p className="text-sm text-gray-600">
              관리자 전용: 영법 추가/수정/삭제는 별도 관리 페이지에서 가능합니다.
            </p>
          </div>
        )}

        {/* 레이아웃: 데스크톱 스플릿 / 모바일 풀 */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* 좌측: 카드 그리드 */}
          <div>
            <DrillGrid />
          </div>

          {/* 우측: 스티키 3D 뷰어 (데스크톱만) */}
          <div className="hidden md:block">
            <div className="sticky top-4">
              <ThreeDPlayer />
            </div>
          </div>
        </div>

        {/* 모바일: 하단 드로어 */}
        {isMobile && showMobileDrawer && selectedId && (
          <div
            className="fixed inset-0 bg-black/40 z-40 md:hidden"
            onClick={handleCloseDrawer}
          >
            <div
              className="absolute bottom-0 inset-x-0 bg-white rounded-t-3xl p-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 드로어 헤더 */}
              <div className="flex items-center justify-between mb-4">
                <div className="text-lg font-semibold text-gray-900">3D 뷰어</div>
                <button
                  onClick={handleCloseDrawer}
                  className="text-gray-500 hover:text-gray-700 p-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* 드로어 내용 */}
              <ThreeDPlayer />
            </div>
          </div>
        )}

        {/* 안내 메시지 (하단) */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-sm text-blue-900">
            <div className="font-semibold mb-2">🎯 3D 갤러리 사용법</div>
            <ul className="list-disc list-inside space-y-1 text-blue-800">
              <li>좌측(모바일: 상단) 카드에서 드릴을 선택하세요</li>
              <li>우측(모바일: 하단 드로어)에서 3D 애니메이션을 확인하세요</li>
              <li>재생 속도, 카메라 각도, 코칭 큐 등을 조절할 수 있습니다</li>
              <li className="text-orange-700">⚠️ 현재 3D 모델 준비 중 - 플레이스홀더로 표시됩니다</li>
            </ul>
          </div>
        </div>

        {/* 기술 정보 (개발자용) */}
        <div className="mt-4 p-4 bg-gray-100 border border-gray-300 rounded-lg text-xs text-gray-600">
          <div className="font-semibold text-gray-900 mb-2">🛠️ 구현 상태</div>
          <div className="grid md:grid-cols-2 gap-2">
            <div>
              <div className="font-medium text-gray-800">✅ 완료:</div>
              <ul className="list-disc list-inside mt-1">
                <li>카드 그리드 UI</li>
                <li>필터 & 검색</li>
                <li>Zustand 상태 관리</li>
                <li>반응형 레이아웃</li>
                <li>재생 제어 UI</li>
              </ul>
            </div>
            <div>
              <div className="font-medium text-gray-800">⏳ 예정:</div>
              <ul className="list-disc list-inside mt-1">
                <li>Three.js 통합</li>
                <li>3D 모델 로딩 (GLB/GLTF)</li>
                <li>카메라 프리셋 동작</li>
                <li>코칭 큐 오버레이</li>
                <li>DB API 연동</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}