/**
 * 센터 급수(레벨) 관리 컴포넌트
 * 
 * 연동 파일:
 * - client/app/center-admin/settings/page.tsx
 */

import React, { useState } from 'react';
import { Plus, Edit, Trash2, MoveUp, MoveDown } from 'lucide-react';

interface Level {
  id: string;
  name: string;
  description: string;
  order: number;
  color?: string;
  mappedToAdminLevel?: string; // 최고관리자 강습법 레벨 매핑
}

interface LevelManagementProps {
  levels: Level[];
  onLevelsChange: (levels: Level[]) => void;
}

// 최고관리자 강습법 레벨
const ADMIN_LEVELS = [
  { id: 'beginner', name: '초급' },
  { id: 'intermediate', name: '중급' },
  { id: 'advanced', name: '고급' },
  { id: 'expert', name: '전문가' },
  { id: 'master', name: '마스터' }
];

export default function LevelManagement({ levels, onLevelsChange }: LevelManagementProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newLevel, setNewLevel] = useState({ 
    name: '', 
    description: '', 
    color: '#3b82f6',
    mappedToAdminLevel: 'beginner'
  });

  const handleAddLevel = () => {
    if (!newLevel.name.trim()) return;
    
    const level: Level = {
      id: `level-${Date.now()}`,
      name: newLevel.name.trim(),
      description: newLevel.description.trim(),
      order: levels.length + 1,
      color: newLevel.color,
      mappedToAdminLevel: newLevel.mappedToAdminLevel
    };
    
    onLevelsChange([...levels, level]);
    setNewLevel({ name: '', description: '', color: '#3b82f6', mappedToAdminLevel: 'beginner' });
    setIsAdding(false);
  };

  const handleEditLevel = (id: string) => {
    const level = levels.find(l => l.id === id);
    if (level) {
      setNewLevel({ 
        name: level.name, 
        description: level.description,
        color: level.color || '#3b82f6',
        mappedToAdminLevel: level.mappedToAdminLevel || 'beginner'
      });
      setEditingId(id);
      setIsAdding(true);
    }
  };

  const handleUpdateLevel = () => {
    if (!newLevel.name.trim() || !editingId) return;
    
    const updatedLevels = levels.map(l => 
      l.id === editingId
        ? { 
            ...l, 
            name: newLevel.name.trim(), 
            description: newLevel.description.trim(),
            color: newLevel.color,
            mappedToAdminLevel: newLevel.mappedToAdminLevel
          }
        : l
    );
    
    onLevelsChange(updatedLevels);
    setNewLevel({ name: '', description: '', color: '#3b82f6', mappedToAdminLevel: 'beginner' });
    setEditingId(null);
    setIsAdding(false);
  };

  const handleDeleteLevel = (id: string) => {
    if (confirm('정말 이 급수를 삭제하시겠습니까?')) {
      const remainingLevels = levels
        .filter(l => l.id !== id)
        .map((l, index) => ({ ...l, order: index + 1 }));
      onLevelsChange(remainingLevels);
    }
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
    onLevelsChange(reorderedLevels);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">급수(레벨) 관리</h3>
          <p className="text-sm text-gray-500 mt-1">
            센터만의 급수 체계를 설정하세요 (과정 생성 시 사용됩니다)
          </p>
        </div>
        {!isAdding && (
          <button
            onClick={() => {
              setIsAdding(true);
              setEditingId(null);
              setNewLevel({ name: '', description: '', color: '#3b82f6', mappedToAdminLevel: 'beginner' });
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
                  value={newLevel.name}
                  onChange={(e) => setNewLevel({ ...newLevel, name: e.target.value })}
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
                    value={newLevel.color}
                    onChange={(e) => setNewLevel({ ...newLevel, color: e.target.value })}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={newLevel.color}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
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
                value={newLevel.description}
                onChange={(e) => setNewLevel({ ...newLevel, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="예: 수영을 처음 시작하는 단계"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                최고관리자 강습법 매핑 *
              </label>
              <select
                value={newLevel.mappedToAdminLevel}
                onChange={(e) => setNewLevel({ ...newLevel, mappedToAdminLevel: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {ADMIN_LEVELS.map((adminLevel) => (
                  <option key={adminLevel.id} value={adminLevel.id}>
                    {adminLevel.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                💡 이 급수는 최고관리자의 "{ADMIN_LEVELS.find(al => al.id === newLevel.mappedToAdminLevel)?.name}" 강습법을 사용합니다
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setEditingId(null);
                  setNewLevel({ name: '', description: '', color: '#3b82f6', mappedToAdminLevel: 'beginner' });
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
          <div className="text-center py-8 text-gray-500">
            <p>등록된 급수가 없습니다.</p>
            <p className="text-sm mt-1">급수를 추가하여 과정 생성 시 사용하세요.</p>
          </div>
        ) : (
          levels.sort((a, b) => a.order - b.order).map((level, index) => (
            <div
              key={level.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center space-x-4">
                <div className="flex flex-col space-y-1">
                  <button
                    onClick={() => handleMoveLevel(level.id, 'up')}
                    disabled={index === 0}
                    className={`text-gray-400 ${index === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:text-gray-600'}`}
                  >
                    <MoveUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMoveLevel(level.id, 'down')}
                    disabled={index === levels.length - 1}
                    className={`text-gray-400 ${index === levels.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:text-gray-600'}`}
                  >
                    <MoveDown className="w-4 h-4" />
                  </button>
                </div>
                <div 
                  className="flex items-center justify-center w-8 h-8 rounded-full font-semibold text-white text-sm shadow-sm"
                  style={{ backgroundColor: level.color || '#3b82f6' }}
                >
                  {level.order}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{level.name}</p>
                  <p className="text-sm text-gray-500">{level.description}</p>
                  {level.mappedToAdminLevel && (
                    <p className="text-xs text-blue-600 mt-1">
                      🔗 매핑: {ADMIN_LEVELS.find(al => al.id === level.mappedToAdminLevel)?.name || level.mappedToAdminLevel} 강습법
                    </p>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditLevel(level.id)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteLevel(level.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

