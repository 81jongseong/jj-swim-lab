/**
 * 센터 급수(레벨) 관리 페이지
 * 
 * 연동 파일:
 * - client/components/center-admin/LevelManagement.tsx
 * - client/app/center-admin/courses/page.tsx (과정 생성 시 사용)
 * - client/app/admin/teaching-methods/page.tsx (강습법과 연동)
 * 
 * 연동 데이터:
 * - customLevels: 센터별 커스텀 급수 목록
 */

'use client';
import { logger } from '@/lib/logger';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import withAuth from '@/components/withAuth';
import StatCard from '@/components/StatCard';
import { CardGrid, ConfirmModal, LoadingState, PageHeader } from '@/components/common';
import { Plus, Edit, Trash2, MoveUp, MoveDown, BookOpen } from 'lucide-react';

interface Level {
  id: string;
  name: string;
  description: string;
  order: number;
  color?: string; // 급수별 색상
}

function LevelsManagement() {
  const { user } = useAuth();
  const [levels, setLevels] = useState<Level[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 권한 확인 - 페이지 렌더링 전에 체크
  // center@swim.com 계정도 센터 관리자로 인식
  const isCenterAdmin = user && (
    ['centerAdmin', 'center-admin', 'superAdmin'].includes(user.userType) ||
    user.email === 'center@swim.com'
  );
  
  if (!isCenterAdmin) {
    // 권한이 없는 사용자는 게스트 버전의 화면으로 리다이렉트
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
    return null;
  }
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', color: '#3b82f6' });
  
  // ConfirmModal 상태
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    message: string;
    onConfirm: () => void;
    variant?: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    message: '',
    onConfirm: () => {},
    variant: 'info'
  });

  useEffect(() => {
    if (user) {
      loadLevels();
    }
  }, [user]);

  const loadLevels = async () => {
    try {
      setIsLoading(true);
      // 임시 데이터 - 향후 API 연동
      const tempLevels: Level[] = [
        { id: 'level1', name: '입문', description: '수영을 처음 시작하는 단계', order: 1, color: '#10b981' },
        { id: 'level2', name: '초급', description: '기본 영법을 배우는 단계', order: 2, color: '#3b82f6' },
        { id: 'level3', name: '중급', description: '영법을 다듬는 단계', order: 3, color: '#f59e0b' },
        { id: 'level4', name: '상급', description: '고급 기술을 익히는 단계', order: 4, color: '#ef4444' },
        { id: 'level5', name: '마스터', description: '전문가 수준', order: 5, color: '#8b5cf6' }
      ];
      setLevels(tempLevels);
    } catch (error) {
      logger.error('급수 목록 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddLevel = () => {
    if (!formData.name.trim()) {
      alert('급수명을 입력하세요.');
      return;
    }

    const newLevel: Level = {
      id: `level-${Date.now()}`,
      name: formData.name.trim(),
      description: formData.description.trim(),
      order: levels.length + 1,
      color: formData.color
    };

    setLevels([...levels, newLevel]);
    setFormData({ name: '', description: '', color: '#3b82f6' });
    setIsAdding(false);
  };

  const handleEditLevel = (level: Level) => {
    setFormData({
      name: level.name,
      description: level.description,
      color: level.color || '#3b82f6'
    });
    setEditingId(level.id);
    setIsAdding(true);
  };

  const handleUpdateLevel = () => {
    if (!formData.name.trim() || !editingId) return;

    const updatedLevels = levels.map(l =>
      l.id === editingId
        ? { ...l, name: formData.name.trim(), description: formData.description.trim(), color: formData.color }
        : l
    );

    setLevels(updatedLevels);
    setFormData({ name: '', description: '', color: '#3b82f6' });
    setEditingId(null);
    setIsAdding(false);
  };

  const handleDeleteLevel = (id: string) => {
    setConfirmModal({
      isOpen: true,
      message: '정말 이 급수를 삭제하시겠습니까?\n이 급수를 사용하는 과정이 있을 수 있습니다.',
      variant: 'danger',
      onConfirm: () => {
        const remainingLevels = levels
          .filter(l => l.id !== id)
          .map((l, index) => ({ ...l, order: index + 1 }));
        setLevels(remainingLevels);
        setConfirmModal({ isOpen: false, message: '', onConfirm: () => {} });
      }
    });
  };

  const handleMoveLevel = (id: string, direction: 'up' | 'down') => {
    const index = levels.findIndex(l => l.id === id);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === levels.length - 1) return;

    const newLevels = [...levels];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    [newLevels[index], newLevels[targetIndex]] = [newLevels[targetIndex], newLevels[index]];

    const reorderedLevels = newLevels.map((l, i) => ({ ...l, order: i + 1 }));
    setLevels(reorderedLevels);
  };

  const handleSave = async () => {
    try {
      // TODO: API 호출로 급수 저장
      logger.info('급수 저장:', levels);
      alert('급수가 저장되었습니다.');
    } catch (error) {
      logger.error('급수 저장 실패:', error);
      alert('급수 저장에 실패했습니다.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingState message="로딩 중..." size="md" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* 페이지 헤더 */}
      <PageHeader
        title="급수(레벨) 관리 🎖️"
        description="센터만의 급수 체계를 설정하고 관리하세요"
      />

      {/* 통계 카드 */}
      <CardGrid gap={6} className="mb-8">
        <StatCard
          icon="🎖️"
          title="총 급수"
          value={`${levels.length}개`}
          color="blue"
        />
        <StatCard
          icon="📚"
          title="최저 급수"
          value={levels.length > 0 ? levels.sort((a, b) => a.order - b.order)[0].name : '-'}
          color="green"
        />
        <StatCard
          icon="🏆"
          title="최고 급수"
          value={levels.length > 0 ? levels.sort((a, b) => b.order - a.order)[0].name : '-'}
          color="purple"
        />
        <StatCard
          icon="📖"
          title="사용 과정"
          value="12개"
          color="orange"
        />
      </CardGrid>

      {/* 급수 관리 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">급수 목록</h3>
            <p className="text-sm text-gray-500 mt-1">
              급수를 추가하면 과정 생성 시 선택할 수 있습니다
            </p>
          </div>
          {!isAdding && (
            <button
              onClick={() => {
                setIsAdding(true);
                setEditingId(null);
                setFormData({ name: '', description: '', color: '#3b82f6' });
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              급수 추가
            </button>
          )}
        </div>

        {/* 급수 추가/수정 폼 */}
        {isAdding && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-gray-900 mb-3">
              {editingId ? '급수 수정' : '새 급수 추가'}
            </h4>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    급수 이름 *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="예: 10급, A레벨, 입문"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    색상
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="#3b82f6"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  설명
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="예: 수영을 처음 시작하는 단계"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setEditingId(null);
                    setFormData({ name: '', description: '', color: '#3b82f6' });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={editingId ? handleUpdateLevel : handleAddLevel}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingId ? '수정 완료' : '추가하기'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 급수 목록 */}
        <div className="space-y-2">
          {levels.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <div className="text-6xl mb-4">🎖️</div>
              <p className="text-gray-500 text-lg">등록된 급수가 없습니다.</p>
              <p className="text-sm text-gray-400 mt-2">급수를 추가하여 과정 생성 시 사용하세요.</p>
            </div>
          ) : (
            levels.sort((a, b) => a.order - b.order).map((level, index) => (
              <div
                key={level.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  {/* 순서 조정 버튼 */}
                  <div className="flex flex-col space-y-1">
                    <button
                      onClick={() => handleMoveLevel(level.id, 'up')}
                      disabled={index === 0}
                      className={`text-gray-400 ${index === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:text-gray-600'}`}
                      title="위로 이동"
                    >
                      <MoveUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleMoveLevel(level.id, 'down')}
                      disabled={index === levels.length - 1}
                      className={`text-gray-400 ${index === levels.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:text-gray-600'}`}
                      title="아래로 이동"
                    >
                      <MoveDown className="w-4 h-4" />
                    </button>
                  </div>

                  {/* 순번 */}
                  <div 
                    className="flex items-center justify-center w-10 h-10 rounded-full font-semibold text-white text-sm"
                    style={{ backgroundColor: level.color || '#3b82f6' }}
                  >
                    {level.order}
                  </div>

                  {/* 급수 정보 */}
                  <div>
                    <p className="font-semibold text-gray-900 text-lg">{level.name}</p>
                    <p className="text-sm text-gray-500">{level.description}</p>
                    <p className="text-xs text-gray-400 mt-1">ID: {level.id}</p>
                  </div>
                </div>

                {/* 액션 버튼 */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditLevel(level)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="수정"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteLevel(level.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 안내 메시지 */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
            <BookOpen className="w-4 h-4 mr-2" />
            급수 활용 방법
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 과정 생성 시 이 급수를 선택할 수 있습니다</li>
            <li>• 강습법 관리에서 급수별 지도법을 등록할 수 있습니다</li>
            <li>• 학생별 현재 급수를 추적하여 맞춤 과정을 추천할 수 있습니다</li>
            <li>• 급수 순서는 위로/아래로 버튼으로 조정 가능합니다</li>
          </ul>
        </div>
      </div>

      {/* 저장 버튼 */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center shadow-md"
        >
          💾 변경사항 저장
        </button>
      </div>

      {/* ConfirmModal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, message: '', onConfirm: () => {} })}
        onConfirm={confirmModal.onConfirm}
        message={confirmModal.message}
        variant={confirmModal.variant || 'info'}
        title="확인"
        confirmText="확인"
        cancelText="취소"
      />
    </div>
  );
}

export default withAuth(LevelsManagement, {
  requireTypes: ['centerAdmin', 'superAdmin']
});







