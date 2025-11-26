/**
 * 센터 강습법 관리 페이지
 * 
 * 연동:
 * - 최고관리자 강습법 원본 (읽기 전용)
 * - 센터별 급수에 강습법 매핑
 * - 센터 전용 코멘트 추가
 * 
 * 데이터 구조:
 * - adminTeachingMethods: 최고관리자 강습법 (원본)
 * - centerLevelMappings: 센터 급수별 강습법 할당
 * - centerComments: 센터 전용 코멘트
 */

'use client';
import { logger } from '@/lib/logger';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import withAuth from '@/components/withAuth';
import StatCard from '@/components/StatCard';
import { CardGrid, LoadingState, PageHeader, ConfirmModal } from '@/components/common';
import { Search, Plus, MessageSquare, Link2, Filter } from 'lucide-react';

// 최고관리자 강습법
interface AdminTeachingMethod {
  _id: string;
  name: string;
  description: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced'; // 최고관리자 정의 난이도
  steps: string[];
  tips: string[];
}

// 센터 급수
interface CenterLevel {
  id: string;
  name: string;
  description: string;
  order: number;
  color?: string;
}

// 센터 급수별 강습법 매핑
interface LevelMethodMapping {
  centerLevelId: string;
  adminMethodId: string;
  centerComment?: string; // 센터 전용 코멘트
  addedAt: Date;
}

function CenterTeachingMethodsPage() {
  const { user } = useAuth();
  const [adminMethods, setAdminMethods] = useState<AdminTeachingMethod[]>([]);
  const [centerLevels, setCenterLevels] = useState<CenterLevel[]>([]);
  const [mappings, setMappings] = useState<LevelMethodMapping[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAdminLevel, setSelectedAdminLevel] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [editingComment, setEditingComment] = useState<{ levelId: string; methodId: string; comment: string } | null>(null);
  
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
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // 샘플: 최고관리자 강습법 (실제로는 API에서 로드)
      const sampleAdminMethods: AdminTeachingMethod[] = [
        {
          _id: 'tm1',
          name: '자유형 호흡법',
          description: '자유형 수영 시 올바른 호흡 방법',
          category: '자유형',
          level: 'beginner',
          steps: ['머리 회전', '호흡 타이밍', '물속 호흡'],
          tips: ['천천히 연습', '리듬 유지']
        },
        {
          _id: 'tm2',
          name: '자유형 팔 동작',
          description: '자유형 팔 스트로크 기술',
          category: '자유형',
          level: 'beginner',
          steps: ['입수', '푸시', '리커버리'],
          tips: ['팔꿈치 높게', '손끝 먼저']
        },
        {
          _id: 'tm3',
          name: '배영 기본 자세',
          description: '배영 기본 동작 익히기',
          category: '배영',
          level: 'intermediate',
          steps: ['누운 자세', '발차기', '팔 동작'],
          tips: ['몸 수평 유지', '시선은 위로']
        },
        {
          _id: 'tm4',
          name: '접영 돌핀킥',
          description: '접영 발차기 마스터',
          category: '접영',
          level: 'advanced',
          steps: ['전신 움직임', '파동 만들기', '타이밍'],
          tips: ['코어 사용', '부드럽게']
        },
        {
          _id: 'tm5',
          name: '평영 발차기',
          description: '평영 발차기 기술',
          category: '평영',
          level: 'intermediate',
          steps: ['무릎 접기', '발목 회전', '킥'],
          tips: ['개구리 다리', '강하게 차기']
        }
      ];

      // 샘플: 센터 급수 (실제로는 센터정보에서 로드)
      const sampleCenterLevels: CenterLevel[] = [
        { id: 'level1', name: '10급', description: '입문', order: 1, color: '#10b981' },
        { id: 'level2', name: '9급', description: '기초', order: 2, color: '#3b82f6' },
        { id: 'level3', name: '8급', description: '발전', order: 3, color: '#f59e0b' },
        { id: 'level4', name: '7급', description: '숙련', order: 4, color: '#ef4444' },
        { id: 'level5', name: '6급', description: '완성', order: 5, color: '#8b5cf6' }
      ];

      // 샘플: 기존 매핑 (실제로는 DB에서 로드)
      const sampleMappings: LevelMethodMapping[] = [
        { centerLevelId: 'level1', adminMethodId: 'tm1', centerComment: '처음 배우는 학생들에게 천천히 지도', addedAt: new Date() },
        { centerLevelId: 'level1', adminMethodId: 'tm2', addedAt: new Date() },
        { centerLevelId: 'level3', adminMethodId: 'tm3', centerComment: '8급부터 배영 시작', addedAt: new Date() }
      ];

      setAdminMethods(sampleAdminMethods);
      setCenterLevels(sampleCenterLevels);
      setMappings(sampleMappings);
    } catch (error) {
      logger.error('데이터 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 필터링된 최고관리자 강습법
  const filteredAdminMethods = adminMethods.filter(method => {
    const matchesSearch = method.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         method.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAdminLevel = selectedAdminLevel === 'all' || method.level === selectedAdminLevel;
    const matchesCategory = selectedCategory === 'all' || method.category === selectedCategory;
    return matchesSearch && matchesAdminLevel && matchesCategory;
  });

  // 선택된 센터 급수에 매핑된 강습법
  const mappedMethodsForLevel = selectedLevel !== 'all'
    ? mappings.filter(m => m.centerLevelId === selectedLevel)
    : mappings;

  // 강습법이 이미 매핑되었는지 확인
  const isMethodMapped = (methodId: string, levelId: string) => {
    return mappings.some(m => m.adminMethodId === methodId && m.centerLevelId === levelId);
  };

  // 강습법을 센터 급수에 추가
  const handleAddMethodToLevel = (methodId: string, levelId: string) => {
    if (isMethodMapped(methodId, levelId)) {
      alert('이 강습법은 이미 추가되어 있습니다.');
      return;
    }

    const newMapping: LevelMethodMapping = {
      centerLevelId: levelId,
      adminMethodId: methodId,
      addedAt: new Date()
    };

    setMappings([...mappings, newMapping]);
  };

  // 매핑 삭제
  const handleRemoveMapping = (methodId: string, levelId: string) => {
    setConfirmModal({
      isOpen: true,
      message: '이 강습법을 급수에서 제거하시겠습니까?',
      variant: 'warning',
      onConfirm: () => {
        setMappings(mappings.filter(m => 
          !(m.adminMethodId === methodId && m.centerLevelId === levelId)
        ));
        setConfirmModal({ isOpen: false, message: '', onConfirm: () => {} });
      }
    });
  };

  // 코멘트 추가/수정
  const handleSaveComment = () => {
    if (!editingComment) return;

    setMappings(mappings.map(m =>
      m.adminMethodId === editingComment.methodId && m.centerLevelId === editingComment.levelId
        ? { ...m, centerComment: editingComment.comment }
        : m
    ));

    setCommentModalOpen(false);
    setEditingComment(null);
  };

  const categories = Array.from(new Set(adminMethods.map(m => m.category)));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingState message="로딩 중..." size="md" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* 헤더 */}
      <PageHeader
        title="강습법 관리 📚"
        description="최고관리자의 강습법을 우리 센터 급수에 맞게 배치하고 코멘트를 추가하세요"
      />

      {/* 통계 */}
      <CardGrid gap={6} className="mb-8">
        <StatCard
          icon="📚"
          title="전체 강습법"
          value={`${adminMethods.length}개`}
          color="blue"
        />
        <StatCard
          icon="🎖️"
          title="우리 센터 급수"
          value={`${centerLevels.length}개`}
          color="green"
        />
        <StatCard
          icon="🔗"
          title="매핑된 강습법"
          value={`${mappings.length}개`}
          color="purple"
        />
        <StatCard
          icon="💬"
          title="코멘트 추가"
          value={`${mappings.filter(m => m.centerComment).length}개`}
          color="orange"
        />
      </CardGrid>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 왼쪽: 센터 급수 목록 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-4 sticky top-4">
            <h3 className="font-semibold text-gray-900 mb-4">우리 센터 급수</h3>
            <div className="space-y-2">
              <button
                onClick={() => setSelectedLevel('all')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                  selectedLevel === 'all'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="font-medium">전체 보기</div>
                <div className="text-xs opacity-80">모든 급수의 강습법</div>
              </button>
              {centerLevels.sort((a, b) => a.order - b.order).map((level) => {
                const mappedCount = mappings.filter(m => m.centerLevelId === level.id).length;
                return (
                  <button
                    key={level.id}
                    onClick={() => setSelectedLevel(level.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                      selectedLevel === level.id
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-6 h-6 rounded-full text-white text-xs flex items-center justify-center font-semibold"
                          style={{ backgroundColor: level.color || '#3b82f6' }}
                        >
                          {level.order}
                        </div>
                        <div>
                          <div className="font-medium">{level.name}</div>
                          <div className="text-xs opacity-80">{level.description}</div>
                        </div>
                      </div>
                      <div className={`text-xs px-2 py-1 rounded-full ${
                        selectedLevel === level.id ? 'bg-white bg-opacity-20' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {mappedCount}개
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            
            {centerLevels.length === 0 && (
              <div className="text-center py-6 text-gray-500">
                <p className="text-sm">급수가 없습니다</p>
                <a href="/center-admin/info" className="text-xs text-blue-600 hover:underline mt-2 block">
                  센터정보에서 급수 추가 →
                </a>
              </div>
            )}
          </div>
        </div>

        {/* 오른쪽: 강습법 목록 */}
        <div className="lg:col-span-2">
          {/* 검색 및 필터 */}
          <div className="bg-white rounded-lg shadow p-4 mb-4">
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="강습법 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={selectedAdminLevel}
                  onChange={(e) => setSelectedAdminLevel(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">모든 난이도</option>
                  <option value="beginner">초급</option>
                  <option value="intermediate">중급</option>
                  <option value="advanced">고급</option>
                </select>
                
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">모든 카테고리</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 강습법 카드 목록 */}
          <div className="space-y-3">
            {filteredAdminMethods.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-gray-500">검색 결과가 없습니다</p>
              </div>
            ) : (
              filteredAdminMethods.map((method) => {
                const levelMapping = selectedLevel !== 'all'
                  ? mappings.find(m => m.adminMethodId === method._id && m.centerLevelId === selectedLevel)
                  : null;
                const isMapped = selectedLevel !== 'all' && isMethodMapped(method._id, selectedLevel);
                
                return (
                  <div key={method._id} className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900">{method.name}</h4>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            method.level === 'beginner' ? 'bg-green-100 text-green-800' :
                            method.level === 'intermediate' ? 'bg-blue-100 text-blue-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {method.level === 'beginner' ? '초급' : method.level === 'intermediate' ? '중급' : '고급'}
                          </span>
                          <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded-full">
                            {method.category}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{method.description}</p>
                        
                        {/* 센터 코멘트 표시 */}
                        {levelMapping?.centerComment && (
                          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                            <p className="text-xs text-yellow-800">
                              💬 센터 코멘트: {levelMapping.centerComment}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-2 ml-4">
                        {selectedLevel !== 'all' && (
                          isMapped ? (
                            <>
                              <button
                                onClick={() => {
                                  setEditingComment({
                                    levelId: selectedLevel,
                                    methodId: method._id,
                                    comment: levelMapping?.centerComment || ''
                                  });
                                  setCommentModalOpen(true);
                                }}
                                className="px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded text-xs hover:bg-yellow-200 flex items-center gap-1"
                              >
                                <MessageSquare className="w-3 h-3" />
                                코멘트
                              </button>
                              <button
                                onClick={() => handleRemoveMapping(method._id, selectedLevel)}
                                className="px-3 py-1.5 bg-red-100 text-red-800 rounded text-xs hover:bg-red-200"
                              >
                                제거
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleAddMethodToLevel(method._id, selectedLevel)}
                              className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" />
                              추가
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 코멘트 모달 */}
      {commentModalOpen && editingComment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="font-semibold text-gray-900 mb-4">센터 전용 코멘트 추가</h3>
            <p className="text-sm text-gray-600 mb-4">
              이 코멘트는 우리 센터에서만 보이며, 최고관리자 강습법 원본에는 영향을 주지 않습니다.
            </p>
            <textarea
              value={editingComment.comment}
              onChange={(e) => setEditingComment({ ...editingComment, comment: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="예: 우리 센터 학생들에게는 이 부분을 더 강조해서 지도합니다..."
            />
            <div className="flex space-x-2 mt-4">
              <button
                onClick={() => {
                  setCommentModalOpen(false);
                  setEditingComment(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleSaveComment}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}

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

export default withAuth(CenterTeachingMethodsPage, {
  requireTypes: ['centerAdmin', 'superAdmin']
});







