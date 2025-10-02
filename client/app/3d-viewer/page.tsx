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
  
  // 영법 관리 상태
  const [swimmingStyles, setSwimmingStyles] = useState<any[]>([]);
  const [showStyleModal, setShowStyleModal] = useState(false);
  const [editingStyle, setEditingStyle] = useState<any>(null);
  const [styleForm, setStyleForm] = useState({
    name: '',
    displayName: '',
    description: '',
    difficulty: 'beginner',
    isActive: true,
    isPublicDemo: true,
    tags: '',
    cues: '',
    cautions: ''
  });

  // 영법 데이터 로드
  useEffect(() => {
    if (isAdminMode) {
      loadSwimmingStyles();
    }
  }, [isAdminMode]);

  const loadSwimmingStyles = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/swimming-styles', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSwimmingStyles(data.data || []);
        }
      }
    } catch (error) {
      console.error('영법 로드 오류:', error);
    }
  };

  // 영법 생성/수정
  const handleSaveStyle = async () => {
    try {
      const payload = {
        ...styleForm,
        tags: styleForm.tags.split(',').map(t => t.trim()).filter(t => t),
        cues: styleForm.cues.split(',').map(c => c.trim()).filter(c => c),
        cautions: styleForm.cautions.split(',').map(c => c.trim()).filter(c => c)
      };

      const url = editingStyle 
        ? `http://localhost:5000/api/swimming-styles/${editingStyle._id}`
        : 'http://localhost:5000/api/swimming-styles';
      
      const method = editingStyle ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert(editingStyle ? '영법이 수정되었습니다!' : '영법이 생성되었습니다!');
        setShowStyleModal(false);
        setEditingStyle(null);
        resetStyleForm();
        loadSwimmingStyles();
      } else {
        alert('저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('저장 오류:', error);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  // 영법 삭제
  const handleDeleteStyle = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/swimming-styles/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        alert('영법이 삭제되었습니다!');
        loadSwimmingStyles();
      }
    } catch (error) {
      console.error('삭제 오류:', error);
    }
  };

  // 폼 초기화
  const resetStyleForm = () => {
    setStyleForm({
      name: '',
      displayName: '',
      description: '',
      difficulty: 'beginner',
      isActive: true,
      isPublicDemo: true,
      tags: '',
      cues: '',
      cautions: ''
    });
  };

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
              <h2 className="text-xl font-bold text-gray-900">
                영법 데이터 관리 ({swimmingStyles.length}개)
              </h2>
              <button
                onClick={() => {
                  resetStyleForm();
                  setEditingStyle(null);
                  setShowStyleModal(true);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                + 영법 추가
              </button>
            </div>

            {/* 영법 목록 */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {swimmingStyles.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>등록된 영법이 없습니다. "영법 추가" 버튼을 눌러 추가하세요.</p>
                </div>
              ) : (
                swimmingStyles.map((style: any) => (
                  <div key={style._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{style.displayName}</span>
                        <span className="text-xs text-gray-500">({style.name})</span>
                        {style.isPublicDemo && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                            🌍 공개
                          </span>
                        )}
                        {!style.isActive && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                            비활성
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{style.description}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => {
                          setEditingStyle(style);
                          setStyleForm({
                            name: style.name,
                            displayName: style.displayName,
                            description: style.description,
                            difficulty: style.difficulty,
                            isActive: style.isActive,
                            isPublicDemo: style.isPublicDemo,
                            tags: (style.tags || []).join(', '),
                            cues: (style.cues || []).join(', '),
                            cautions: (style.cautions || []).join(', ')
                          });
                          setShowStyleModal(true);
                        }}
                        className="px-3 py-1 bg-blue-100 text-blue-600 text-sm rounded hover:bg-blue-200"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDeleteStyle(style._id)}
                        className="px-3 py-1 bg-red-100 text-red-600 text-sm rounded hover:bg-red-200"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
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

      {/* 영법 추가/수정 모달 */}
      {showStyleModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4"
          onClick={() => {
            setShowStyleModal(false);
            setEditingStyle(null);
            resetStyleForm();
          }}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingStyle ? '영법 수정' : '영법 추가'}
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">영어명 *</label>
                  <input
                    type="text"
                    value={styleForm.name}
                    onChange={(e) => setStyleForm({ ...styleForm, name: e.target.value.toLowerCase() })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="예: freestyle"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">한글명 *</label>
                  <input
                    type="text"
                    value={styleForm.displayName}
                    onChange={(e) => setStyleForm({ ...styleForm, displayName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="예: 자유형"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">설명 *</label>
                <textarea
                  value={styleForm.description}
                  onChange={(e) => setStyleForm({ ...styleForm, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="영법 설명을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">난이도 *</label>
                <select
                  value={styleForm.difficulty}
                  onChange={(e) => setStyleForm({ ...styleForm, difficulty: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="beginner">초급</option>
                  <option value="intermediate">중급</option>
                  <option value="advanced">고급</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">태그 (쉼표로 구분)</label>
                <input
                  type="text"
                  value={styleForm.tags}
                  onChange={(e) => setStyleForm({ ...styleForm, tags: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="예: 빠름, 초보자 추천"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">코칭 큐 (쉼표로 구분)</label>
                <input
                  type="text"
                  value={styleForm.cues}
                  onChange={(e) => setStyleForm({ ...styleForm, cues: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="예: 팔꿈치를 높게, 발차기는 무릎 펴기"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">주의사항 (쉼표로 구분)</label>
                <input
                  type="text"
                  value={styleForm.cautions}
                  onChange={(e) => setStyleForm({ ...styleForm, cautions: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="예: 어깨 부상 주의"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={styleForm.isActive}
                    onChange={(e) => setStyleForm({ ...styleForm, isActive: e.target.checked })}
                    className="w-5 h-5 rounded"
                  />
                  <span className="text-sm font-medium">활성화</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={styleForm.isPublicDemo}
                    onChange={(e) => setStyleForm({ ...styleForm, isPublicDemo: e.target.checked })}
                    className="w-5 h-5 rounded"
                  />
                  <span className="text-sm font-medium">🌍 체험 공개</span>
                </label>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowStyleModal(false);
                  setEditingStyle(null);
                  resetStyleForm();
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                취소
              </button>
              <button
                onClick={handleSaveStyle}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingStyle ? '수정하기' : '추가하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}