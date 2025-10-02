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
  
  // 통합 데이터 관리 (영법 + 드릴)
  const [dataType, setDataType] = useState<'strokes' | 'drills'>('strokes'); // 영법 or 드릴
  const [swimmingStyles, setSwimmingStyles] = useState<any[]>([]);
  const [drills, setDrills] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  // 영법 폼
  const [styleForm, setStyleForm] = useState({
    name: '',
    displayName: '',
    description: '',
    difficulty: 'beginner',
    isActive: true,
    isPublicDemo: true,
    tags: '',
    cues: '',
    cautions: '',
    modelUrl: '',
    poster: ''
  });

  // 드릴 폼
  const [drillForm, setDrillForm] = useState({
    title: '',
    stroke: 'FR',
    description: '',
    tags: '',
    cues: '',
    cautions: '',
    isPublicDemo: true,
    modelUrl: '',
    poster: ''
  });

  // 파일 업로드 상태
  const [uploadingModel, setUploadingModel] = useState(false);
  const [uploadingPoster, setUploadingPoster] = useState(false);

  // 파일 업로드 핸들러
  const handleFileUpload = async (file: File, type: 'model' | 'poster') => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      type === 'model' ? setUploadingModel(true) : setUploadingPoster(true);

      const response = await fetch('http://localhost:5000/api/uploads', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        const fileUrl = data.url || data.path;

        if (dataType === 'strokes') {
          setStyleForm({
            ...styleForm,
            [type === 'model' ? 'modelUrl' : 'poster']: fileUrl
          });
        } else {
          setDrillForm({
            ...drillForm,
            [type === 'model' ? 'modelUrl' : 'poster']: fileUrl
          });
        }

        alert(`${type === 'model' ? '3D 모델' : '썸네일'} 업로드 완료!`);
      } else {
        alert('업로드 실패');
      }
    } catch (error) {
      console.error('업로드 오류:', error);
      alert('업로드 중 오류 발생');
    } finally {
      type === 'model' ? setUploadingModel(false) : setUploadingPoster(false);
    }
  };

  // 데이터 로드
  useEffect(() => {
    if (isAdminMode) {
      if (dataType === 'strokes') {
        loadSwimmingStyles();
      } else {
        loadDrills();
      }
    }
  }, [isAdminMode, dataType]);

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

  const loadDrills = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/swim-drills', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setDrills(data.data || []);
        }
      }
    } catch (error) {
      console.error('드릴 로드 오류:', error);
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

      const url = editingItem 
        ? `http://localhost:5000/api/swimming-styles/${editingItem._id}`
        : 'http://localhost:5000/api/swimming-styles';
      
      const method = editingItem ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert(editingItem ? '영법이 수정되었습니다!' : '영법이 생성되었습니다!');
        setShowModal(false);
        setEditingItem(null);
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

  // 드릴 생성/수정
  const handleSaveDrill = async () => {
    try {
      const payload = {
        ...drillForm,
        tags: drillForm.tags.split(',').map(t => t.trim()).filter(t => t),
        cues: drillForm.cues.split(',').map(c => c.trim()).filter(c => c),
        cautions: drillForm.cautions.split(',').map(c => c.trim()).filter(c => c)
      };

      const url = editingItem 
        ? `http://localhost:5000/api/swim-drills/${editingItem._id}`
        : 'http://localhost:5000/api/swim-drills';
      
      const method = editingItem ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert(editingItem ? '드릴이 수정되었습니다!' : '드릴이 생성되었습니다!');
        setShowModal(false);
        setEditingItem(null);
        resetDrillForm();
        loadDrills();
      } else {
        alert('저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('저장 오류:', error);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  // 삭제
  const handleDelete = async (id: string, type: 'strokes' | 'drills') => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const url = type === 'strokes'
        ? `http://localhost:5000/api/swimming-styles/${id}`
        : `http://localhost:5000/api/swim-drills/${id}`;

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        alert(type === 'strokes' ? '영법이 삭제되었습니다!' : '드릴이 삭제되었습니다!');
        type === 'strokes' ? loadSwimmingStyles() : loadDrills();
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
      cautions: '',
      modelUrl: '',
      poster: ''
    });
  };

  const resetDrillForm = () => {
    setDrillForm({
      title: '',
      stroke: 'FR',
      description: '',
      tags: '',
      cues: '',
      cautions: '',
      isPublicDemo: true,
      modelUrl: '',
      poster: ''
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

        {/* 관리자 모드: 통합 관리 UI */}
        {isAdminMode && (
          <div className="mb-6 p-4 bg-white rounded-lg shadow border-2 border-blue-200">
            {/* 탭 전환 */}
            <div className="flex gap-2 mb-4 border-b">
              <button
                onClick={() => setDataType('strokes')}
                className={`px-4 py-2 font-medium transition-colors ${
                  dataType === 'strokes'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🏊‍♂️ 영법 ({swimmingStyles.length})
              </button>
              <button
                onClick={() => setDataType('drills')}
                className={`px-4 py-2 font-medium transition-colors ${
                  dataType === 'drills'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🎯 드릴 ({drills.length})
              </button>
            </div>

            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {dataType === 'strokes' ? '영법 관리' : '드릴 관리'}
              </h2>
              <button
                onClick={() => {
                  if (dataType === 'strokes') {
                    resetStyleForm();
                  } else {
                    resetDrillForm();
                  }
                  setEditingItem(null);
                  setShowModal(true);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                + {dataType === 'strokes' ? '영법' : '드릴'} 추가
              </button>
            </div>

            {/* 영법 목록 */}
            {dataType === 'strokes' && (
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
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{style.description}</p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => {
                            setEditingItem(style);
                            setStyleForm({
                              name: style.name,
                              displayName: style.displayName,
                              description: style.description,
                              difficulty: style.difficulty,
                              isActive: style.isActive,
                              isPublicDemo: style.isPublicDemo,
                              tags: (style.tags || []).join(', '),
                              cues: (style.cues || []).join(', '),
                              cautions: (style.cautions || []).join(', '),
                              modelUrl: style.modelUrl || '',
                              poster: style.poster || ''
                            });
                            setShowModal(true);
                          }}
                          className="px-3 py-1 bg-blue-100 text-blue-600 text-sm rounded hover:bg-blue-200"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDelete(style._id, 'strokes')}
                          className="px-3 py-1 bg-red-100 text-red-600 text-sm rounded hover:bg-red-200"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 드릴 목록 */}
            {dataType === 'drills' && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {drills.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>등록된 드릴이 없습니다. "드릴 추가" 버튼을 눌러 추가하세요.</p>
                  </div>
                ) : (
                  drills.map((drill: any) => (
                    <div key={drill._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">{drill.title}</span>
                          <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-full">
                            {drill.stroke}
                          </span>
                          {drill.isPublicDemo && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                              🌍 공개
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{drill.description}</p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => {
                            setEditingItem(drill);
                            setDrillForm({
                              title: drill.title,
                              stroke: drill.stroke,
                              description: drill.description,
                              tags: (drill.tags || []).join(', '),
                              cues: (drill.cues || []).join(', '),
                              cautions: (drill.cautions || []).join(', '),
                              isPublicDemo: drill.isPublicDemo,
                              modelUrl: drill.modelUrl || '',
                              poster: drill.poster || ''
                            });
                            setShowModal(true);
                          }}
                          className="px-3 py-1 bg-blue-100 text-blue-600 text-sm rounded hover:bg-blue-200"
                        >
                          수정
                        </button>
          <button 
                          onClick={() => handleDelete(drill._id, 'drills')}
                          className="px-3 py-1 bg-red-100 text-red-600 text-sm rounded hover:bg-red-200"
          >
                          삭제
          </button>
        </div>
                    </div>
                  ))
                )}
              </div>
            )}
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

      {/* 통합 추가/수정 모달 */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4"
          onClick={() => {
            setShowModal(false);
            setEditingItem(null);
            dataType === 'strokes' ? resetStyleForm() : resetDrillForm();
          }}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">
                {dataType === 'strokes' 
                  ? (editingItem ? '영법 수정' : '영법 추가')
                  : (editingItem ? '드릴 수정' : '드릴 추가')
                }
              </h2>
            </div>

            <div className="p-6 space-y-4">
              {dataType === 'strokes' ? (
                // 영법 폼
                <>
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

                  {/* 3D 파일 업로드 */}
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h3 className="font-semibold text-purple-900 text-sm mb-3">📦 3D 모델 & 썸네일</h3>
                    
                    <div className="space-y-3">
                      {/* 3D 모델 업로드 */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">3D 모델 (.glb, .gltf)</label>
                        <input
                          type="file"
                          accept=".glb,.gltf"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file, 'model');
                          }}
                          disabled={uploadingModel}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 disabled:opacity-50"
                        />
                        {(dataType === 'strokes' ? styleForm.modelUrl : drillForm.modelUrl) && (
                          <p className="text-xs text-green-600 mt-1">
                            ✅ 업로드됨: {(dataType === 'strokes' ? styleForm.modelUrl : drillForm.modelUrl).substring(0, 50)}...
                          </p>
                        )}
                      </div>

                      {/* 썸네일 업로드 */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">썸네일 (.jpg, .png)</label>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/jpg"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file, 'poster');
                          }}
                          disabled={uploadingPoster}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 disabled:opacity-50"
                        />
                        {(dataType === 'strokes' ? styleForm.poster : drillForm.poster) && (
                          <p className="text-xs text-green-600 mt-1">
                            ✅ 업로드됨: {(dataType === 'strokes' ? styleForm.poster : drillForm.poster).substring(0, 50)}...
                          </p>
                        )}
                      </div>
                    </div>
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
                </>
              ) : (
                // 드릴 폼
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">드릴명 *</label>
                    <input
                      type="text"
                      value={drillForm.title}
                      onChange={(e) => setDrillForm({ ...drillForm, title: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="예: 하이엘보 캐치 드릴"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">영법 *</label>
                    <select
                      value={drillForm.stroke}
                      onChange={(e) => setDrillForm({ ...drillForm, stroke: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="FR">자유형</option>
                      <option value="BK">배영</option>
                      <option value="BR">평영</option>
                      <option value="FL">접영</option>
                      <option value="IM">IM</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">설명 *</label>
                    <textarea
                      value={drillForm.description}
                      onChange={(e) => setDrillForm({ ...drillForm, description: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="드릴 설명을 입력하세요"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">태그 (쉼표로 구분)</label>
                    <input
                      type="text"
                      value={drillForm.tags}
                      onChange={(e) => setDrillForm({ ...drillForm, tags: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="예: 캐치, 기술"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">코칭 큐 (쉼표로 구분)</label>
                    <input
                      type="text"
                      value={drillForm.cues}
                      onChange={(e) => setDrillForm({ ...drillForm, cues: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="예: 전완 세우기, 시선 아래 45°"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">주의사항 (쉼표로 구분)</label>
                    <input
                      type="text"
                      value={drillForm.cautions}
                      onChange={(e) => setDrillForm({ ...drillForm, cautions: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="예: 어깨 충돌 민감 시 주의"
                    />
                  </div>

                  {/* 3D 파일 업로드 (드릴도 동일) */}
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h3 className="font-semibold text-purple-900 text-sm mb-3">📦 3D 모델 & 썸네일</h3>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">3D 모델 (.glb, .gltf)</label>
                        <input
                          type="file"
                          accept=".glb,.gltf"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file, 'model');
                          }}
                          disabled={uploadingModel}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 disabled:opacity-50"
                        />
                        {drillForm.modelUrl && (
                          <p className="text-xs text-green-600 mt-1">✅ 업로드됨</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">썸네일 (.jpg, .png)</label>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/jpg"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file, 'poster');
                          }}
                          disabled={uploadingPoster}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 disabled:opacity-50"
                        />
                        {drillForm.poster && (
                          <p className="text-xs text-green-600 mt-1">✅ 업로드됨</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={drillForm.isPublicDemo}
                      onChange={(e) => setDrillForm({ ...drillForm, isPublicDemo: e.target.checked })}
                      className="w-5 h-5 rounded"
                    />
                    <span className="text-sm font-medium">🌍 체험 공개</span>
                  </label>
                </>
              )}
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingItem(null);
                  dataType === 'strokes' ? resetStyleForm() : resetDrillForm();
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                취소
              </button>
              <button
                onClick={dataType === 'strokes' ? handleSaveStyle : handleSaveDrill}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingItem ? '수정하기' : '추가하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}