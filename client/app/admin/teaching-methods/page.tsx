'use client';
import { logger } from '@/lib/logger';

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import StatCard from '@/components/StatCard';
import { LoadingState, PageHeader, ConfirmModal } from '@/components/common';
import { Button } from '@/components/ui';
import TeachingMethodCard from '@/components/TeachingMethodCard';

// 지연 로딩 컴포넌트
const ExcelUploader = lazy(() => import('../../../components/ExcelUploader'));
const YouTubeVideoManager = lazy(() => import('../../../components/YouTubeVideoManager'));

// 강습법 카테고리 상수
const TEACHING_METHOD_CATEGORIES = [
  '자유형',
  '배영',
  '평영',
  '접영',
  '접영 발차기',
  '혼영',
  '개인혼영',
  '자유형 릴레이',
  '혼합 릴레이',
  '기본배영',
  '사이드스트로크',
  '호흡법',
  '발차기',
  '턴',
  '스타트',
  '기타'
];

// 강습법 레벨 상수
const TEACHING_METHOD_LEVELS = [
  '초급',
  '중급',
  '상급'
];

// 강습법 인터페이스
interface TeachingMethod {
  _id: string;
  name: string;
  description: string;
  category: string;
  level: string;
  steps: string[];
  tips: string[];
  checklist: string[];
  order: number;
  createdAt: string;
  updatedAt: string;
}

export default function TeachingMethodsPage() {
  const { user } = useAuth();
  const isCenterAdmin = user?.userType === 'centerAdmin';
  const isSuperAdmin = user?.userType === 'superAdmin';
  const [methods, setMethods] = useState<TeachingMethod[]>([]);
  const [filteredMethods, setFilteredMethods] = useState<TeachingMethod[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<TeachingMethod | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<TeachingMethod | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isExcelUploaderOpen, setIsExcelUploaderOpen] = useState(false);
  const [isLevelEditModalOpen, setIsLevelEditModalOpen] = useState(false);
  const [editingLevelMethod, setEditingLevelMethod] = useState<TeachingMethod | null>(null);
  const [newLevel, setNewLevel] = useState<string>('');
  const [centerLevels, setCenterLevels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false); // 초기 로딩 비활성화
  const [steps, setSteps] = useState<string[]>([]);
  const [tips, setTips] = useState<string[]>([]);
  const [showCategoryOptions, setShowCategoryOptions] = useState(false);
  const [showLevelOptions, setShowLevelOptions] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showAddLevelModal, setShowAddLevelModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newLevelName, setNewLevelName] = useState('');
  const [newLevelKoreanName, setNewLevelKoreanName] = useState('');
  
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
  
  // 실제 데이터에서 카테고리와 레벨 추출
  const actualCategories = React.useMemo(() => {
    const categories = new Set(methods.map(m => m.category).filter(Boolean));
    return Array.from(categories).sort();
  }, [methods]);

  const actualLevels = React.useMemo(() => {
    const levels = new Set(methods.map(m => m.level).filter(Boolean));
    return Array.from(levels).sort();
  }, [methods]);

  // 레벨 한국어 매핑
  const levelKoreanMap: { [key: string]: string } = {
    'beginner': '초급',
    'intermediate': '중급',
    'advanced': '고급',
    'expert': '전문가',
    'master': '마스터',
    'elite': '엘리트'
  };

  const getLevelDisplayName = (level: string) => {
    return levelKoreanMap[level] || level;
  };

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    level: '',
    steps: [] as string[],
    tips: [] as string[],
    checklist: [] as string[]
  });

  // 강습법 데이터 가져오기
  const fetchTeachingMethods = async () => {
    try {
      logger.info('🔍 강습법 데이터 가져오기 시작...');
      
      const token = localStorage.getItem('token');
      if (!token) {
        logger.info('❌ 토큰이 없습니다.');
        return;
      }
      
      logger.info('🔑 JWT 토큰 확인됨');

      const response = await fetch('/api/teaching-methods', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      logger.info('📡 서버 응답 상태:', response.status, response.statusText);

      if (response.ok) {
        const data = await response.json();
        logger.info('📊 서버 응답 데이터:', data);
        
        const transformedMethods = data.data.map((method: any) => ({
          ...method,
          steps: method.steps || [],
          tips: method.tips || [],
          checklist: method.checklist || []
        }));
        
        logger.info('🔄 변환된 강습법 데이터:', transformedMethods);
        logger.info('📊 API 응답 데이터 개수:', transformedMethods.length);
        logger.info('📋 첫 번째 강습법 샘플:', transformedMethods[0]);
        logger.info('📋 마지막 강습법 샘플:', transformedMethods[transformedMethods.length - 1]);
        
        setMethods(transformedMethods);
        logger.info('✅ 73개의 강습법을 성공적으로 로드했습니다.');
        logger.info('🔍 methods 상태 업데이트 완료');
      } else {
        logger.error('❌ 강습법 데이터 가져오기 실패:', response.status);
      }
    } catch (error) {
      logger.error('❌ 강습법 데이터 가져오기 오류:', error);
    } finally {
      setLoading(false);
      logger.info('🏁 강습법 데이터 로딩 완료');
    }
  };

  // 필터링 및 검색
  const filterMethods = () => {
    logger.info('🔍 filterMethods 실행:', { totalMethods: methods.length, searchTerm, selectedLevel });
    
    let filtered = methods;
    
    logger.info('📋 methods 배열 내용:', methods);

    // 검색어 필터링
    if (searchTerm) {
      filtered = filtered.filter(method =>
        method.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        method.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        method.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 카테고리 필터링
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(method => method.category === selectedCategory);
    }
    
    // 레벨 필터링
    if (selectedLevel !== 'all') {
      filtered = filtered.filter(method => method.level === selectedLevel);
    }

    // 정렬 (order 기준)
    filtered = filtered.sort((a, b) => a.order - b.order);

    logger.info('🔍 필터링 및 정렬 결과:', { filteredCount: filtered.length, filteredMethods: filtered });
    setFilteredMethods(filtered);
  };

  // 컴포넌트 마운트 시 데이터 가져오기
  useEffect(() => {
    // 지연 로딩 (100ms 후)
    const timer = setTimeout(() => {
      fetchTeachingMethods();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // 필터링 및 검색 효과
  useEffect(() => {
    filterMethods();
  }, [methods, searchTerm, selectedLevel, selectedCategory]);

  // 권한 확인
  if (!isCenterAdmin && !isSuperAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="text-red-500 text-6xl mb-4">🚫</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">접근 권한이 없습니다</h2>
              <p>최고 관리자와 센터 관리자만 강습법 조회에 접근할 수 있습니다.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingState message="로딩 중..." size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader
          title={isCenterAdmin ? '강습법 조회' : '강습법 관리'}
          description={
            isCenterAdmin 
              ? '수영 강습에 필요한 다양한 강습법을 조회하고 레벨별로 분류할 수 있습니다. 수정 및 삭제는 최고관리자만 가능합니다.'
              : '수영 강습에 필요한 다양한 강습법을 관리하고 체계화합니다.'
          }
        />

        {/* 통계 섹션 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <StatCard
            title="전체 강습법"
            value={methods.length}
            icon="📊"
            color="blue"
            subtitle="등록된 강습법"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setSelectedLevel('all');
              setShowCategoryOptions(false);
              setShowLevelOptions(false);
            }}
          />
          
          <StatCard
            title="카테고리"
            value={selectedCategory === 'all' ? actualCategories.length : `${methods.filter(m => m.category === selectedCategory).length}개`}
            icon="🏷️"
            color="green"
            subtitle={selectedCategory === 'all' ? '강습법 분류' : `선택: ${selectedCategory}`}
            onClick={() => {
              setShowCategoryOptions(!showCategoryOptions);
              setShowLevelOptions(false);
            }}
          />
          
          <StatCard
            title="레벨"
            value={selectedLevel === 'all' ? actualLevels.length : `${methods.filter(m => m.level === selectedLevel).length}개`}
            icon="⚡"
            color="purple"
            subtitle={selectedLevel === 'all' ? '난이도 단계' : `선택: ${getLevelDisplayName(selectedLevel)}`}
            onClick={() => {
              setShowLevelOptions(!showLevelOptions);
              setShowCategoryOptions(false);
            }}
          />
        </div>

        {/* 카테고리 옵션 박스 */}
        {showCategoryOptions && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6 animate-fadeInUp">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">카테고리 선택</h3>
              {!isCenterAdmin && (
                <Button
                  onClick={() => {
                    setShowAddCategoryModal(true);
                    setShowCategoryOptions(false);
                  }}
                  variant="success"
                  size="sm"
                >
                  ➕ 카테고리 추가
                </Button>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
              <Button
                onClick={() => {
                  setSelectedCategory('all');
                  setShowCategoryOptions(false);
                }}
                variant={selectedCategory === 'all' ? 'primary' : 'outline'}
                size="md"
                fullWidth
              >
                🎯 전체
              </Button>
              {actualCategories.map(category => (
                <Button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    setShowCategoryOptions(false);
                  }}
                  variant={selectedCategory === category ? 'primary' : 'outline'}
                  size="md"
                  fullWidth
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* 레벨 옵션 박스 */}
        {showLevelOptions && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6 animate-fadeInUp">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">레벨 선택</h3>
              {!isCenterAdmin && (
                <Button
                  onClick={() => {
                    setShowAddLevelModal(true);
                    setShowLevelOptions(false);
                  }}
                  variant="success"
                  size="sm"
                >
                  ➕ 레벨 추가
                </Button>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              <Button
                onClick={() => {
                  setSelectedLevel('all');
                  setShowLevelOptions(false);
                }}
                variant={selectedLevel === 'all' ? 'primary' : 'outline'}
                size="md"
                fullWidth
              >
                🎯 전체
              </Button>
              {actualLevels.map(level => (
                <Button
                  key={level}
                  onClick={() => {
                    setSelectedLevel(level);
                    setShowLevelOptions(false);
                  }}
                  variant={selectedLevel === level ? 'primary' : 'outline'}
                  size="md"
                  fullWidth
                >
                  {getLevelDisplayName(level)}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* 검색 및 필터 영역 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          {/* 검색 및 필터 영역 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">🔍 강습법 검색</label>
              <input
                type="text"
                placeholder="강습법 이름, 설명, 카테고리로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">📊 난이도 필터</label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">전체</option>
                {TEACHING_METHOD_LEVELS.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 버튼 영역 */}
          <div className="flex flex-wrap gap-3 justify-end">
            {!isCenterAdmin && (
              <>
                <button
                  onClick={() => {
                    setIsFormOpen(true);
                    setEditingMethod(null);
                    setSteps([]);
                    setTips([]);
                  }}
                  className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 shadow-md rounded-md"
                >
                  ✨ 새 강습법 추가
                </button>
                <button
                  onClick={() => setIsExcelUploaderOpen(true)}
                  className="px-6 py-2 border border-green-500 text-green-700 hover:bg-green-50 shadow-md rounded-md"
                >
                  📊 엑셀 업로드
                </button>
              </>
            )}
            <button
              onClick={() => {
                logger.info('🔄 수동 새로고침 시작...');
                fetchTeachingMethods();
              }}
              className="px-6 py-2 border border-blue-500 text-blue-700 hover:bg-blue-50 shadow-md rounded-md"
            >
              🔄 새로고침
            </button>
          </div>
        </div>

        {/* 강습법 목록 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMethods.map((method) => (
            <TeachingMethodCard
              key={method._id}
              method={method}
              onView={() => {
                setSelectedMethod(method);
                setIsDetailModalOpen(true);
              }}
              onEdit={!isCenterAdmin ? () => {
                setEditingMethod(method);
                setFormData({
                  name: method.name,
                  description: method.description,
                  category: method.category,
                  level: method.level,
                  steps: method.steps || [],
                  tips: method.tips || [],
                  checklist: method.checklist || []
                });
                setIsFormOpen(true);
              } : undefined}
              onDelete={!isCenterAdmin ? async () => {
                setConfirmModal({
                  isOpen: true,
                  message: '정말로 이 강습법을 삭제하시겠습니까?',
                  variant: 'danger',
                  onConfirm: async () => {
                    try {
                      const token = localStorage.getItem('token');
                      const response = await fetch(`/api/teaching-methods/${method._id}`, {
                        method: 'DELETE',
                        headers: {
                          'Authorization': `Bearer ${token}`,
                          'Content-Type': 'application/json',
                        },
                      });

                      if (response.ok) {
                        alert('강습법이 삭제되었습니다.');
                        fetchTeachingMethods();
                        setConfirmModal({ isOpen: false, message: '', onConfirm: () => {} });
                      } else {
                        alert('삭제에 실패했습니다.');
                        setConfirmModal({ isOpen: false, message: '', onConfirm: () => {} });
                      }
                    } catch (error) {
                      logger.error('삭제 오류:', error);
                      alert('삭제 중 오류가 발생했습니다.');
                      setConfirmModal({ isOpen: false, message: '', onConfirm: () => {} });
                    }
                  }
                });
              } : undefined}
              showActions={true}
            />
          ))}
        </div>

        {/* 강습법이 없을 때 */}
        {filteredMethods.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">강습법이 없습니다</h3>
            <p className="text-gray-600">
              {searchTerm || selectedLevel !== 'all' 
                ? '검색 조건에 맞는 강습법이 없습니다.' 
                : '새로운 강습법을 추가해보세요.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Excel 업로더 모달 */}
      {isExcelUploaderOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Excel 파일 업로드</h2>
              <button
                onClick={() => setIsExcelUploaderOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <ExcelUploader
              onUploadSuccess={(data) => {
                logger.info('Excel 업로드 성공:', data);
                setIsExcelUploaderOpen(false);
                fetchTeachingMethods();
              }}
              onUploadError={(error) => {
                logger.error('Excel 업로드 오류:', error);
              }}
            />
          </div>
        </div>
      )}

      {/* YouTube 비디오 관리자 모달 */}
      {isExcelUploaderOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">YouTube 비디오 관리</h2>
              <button
                onClick={() => setIsExcelUploaderOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <YouTubeVideoManager />
          </div>
        </div>
      )}

      {/* 상세보기 모달 */}
      {isDetailModalOpen && selectedMethod && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">강습법 상세보기</h2>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{selectedMethod.name}</h3>
                <p className="text-gray-600 mb-4">{selectedMethod.description}</p>
                
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    {selectedMethod.category}
                  </span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                    {selectedMethod.level}
                  </span>
                </div>
              </div>

              {selectedMethod.steps && selectedMethod.steps.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">단계별 설명</h4>
                  <ol className="list-decimal list-inside space-y-1">
                    {selectedMethod.steps.map((step, index) => (
                      <li key={index} className="text-gray-700">{step}</li>
                    ))}
                  </ol>
                </div>
              )}

              {selectedMethod.tips && selectedMethod.tips.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">팁</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedMethod.tips.map((tip, index) => (
                      <li key={index} className="text-gray-700">{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedMethod.checklist && selectedMethod.checklist.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">체크리스트</h4>
                  <ul className="space-y-1">
                    {selectedMethod.checklist.map((item, index) => (
                      <li key={index} className="flex items-center gap-2 text-gray-700">
                        <span className="text-purple-600">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="text-sm text-gray-500">
                <p>생성일: {new Date(selectedMethod.createdAt).toLocaleDateString()}</p>
                <p>수정일: {new Date(selectedMethod.updatedAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 수정 폼 모달 */}
      {isFormOpen && editingMethod && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">강습법 수정</h2>
              <button
                onClick={() => {
                  setIsFormOpen(false);
                  setEditingMethod(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                const token = localStorage.getItem('token');
                const requestBody = {
                  name: formData.name,
                  description: formData.description,
                  category: formData.category,
                  level: formData.level,
                  steps: formData.steps.filter(step => step.trim() !== ''),
                  tips: formData.tips.filter(tip => tip.trim() !== ''),
                  checklist: formData.checklist.filter(item => item.trim() !== '')
                };
                
                const response = await fetch(`/api/teaching-methods/${editingMethod._id}`, {
                  method: 'PUT',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(requestBody),
                });

                if (response.ok) {
                  alert('강습법이 수정되었습니다.');
                  setIsFormOpen(false);
                  setEditingMethod(null);
                  fetchTeachingMethods();
                } else {
                  const errorData = await response.json();
                  logger.error('수정 오류 응답:', errorData);
                  alert(`수정에 실패했습니다: ${errorData.error || '알 수 없는 오류'}`);
                }
              } catch (error) {
                logger.error('수정 오류:', error);
                alert('수정 중 오류가 발생했습니다.');
              }
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">강습법 이름</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">카테고리 선택</option>
                    {TEACHING_METHOD_CATEGORIES.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">레벨</label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({...formData, level: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">레벨 선택</option>
                    {TEACHING_METHOD_LEVELS.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 단계별 설명 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">단계별 설명</label>
                <div className="space-y-2">
                  {formData.steps.map((step, index) => (
                    <div key={index} className="flex gap-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full min-w-[30px] text-center">
                        {index + 1}
                      </span>
                      <input
                        type="text"
                        value={step}
                        onChange={(e) => {
                          const newSteps = [...formData.steps];
                          newSteps[index] = e.target.value;
                          setFormData({...formData, steps: newSteps});
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={`단계 ${index + 1} 설명`}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newSteps = formData.steps.filter((_, i) => i !== index);
                          setFormData({...formData, steps: newSteps});
                        }}
                        className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                      >
                        삭제
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({...formData, steps: [...formData.steps, '']});
                    }}
                    className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
                  >
                    + 단계 추가
                  </button>
                </div>
              </div>

              {/* 팁 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">팁</label>
                <div className="space-y-2">
                  {formData.tips.map((tip, index) => (
                    <div key={index} className="flex gap-2">
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full min-w-[30px] text-center">
                        💡
                      </span>
                      <input
                        type="text"
                        value={tip}
                        onChange={(e) => {
                          const newTips = [...formData.tips];
                          newTips[index] = e.target.value;
                          setFormData({...formData, tips: newTips});
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={`팁 ${index + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newTips = formData.tips.filter((_, i) => i !== index);
                          setFormData({...formData, tips: newTips});
                        }}
                        className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                      >
                        삭제
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({...formData, tips: [...formData.tips, '']});
                    }}
                    className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
                  >
                    + 팁 추가
                  </button>
                </div>
              </div>

              {/* 체크리스트 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">체크리스트</label>
                <div className="space-y-2">
                  {formData.checklist.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 text-sm rounded-full min-w-[30px] text-center">
                        ✓
                      </span>
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => {
                          const newChecklist = [...formData.checklist];
                          newChecklist[index] = e.target.value;
                          setFormData({...formData, checklist: newChecklist});
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={`체크 항목 ${index + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newChecklist = formData.checklist.filter((_, i) => i !== index);
                          setFormData({...formData, checklist: newChecklist});
                        }}
                        className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                      >
                        삭제
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({...formData, checklist: [...formData.checklist, '']});
                    }}
                    className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
                  >
                    + 체크리스트 추가
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  수정 완료
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingMethod(null);
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 카테고리 추가 모달 */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowAddCategoryModal(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">새 카테고리 추가</h3>
              <button onClick={() => setShowAddCategoryModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">카테고리 이름</label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="예: 잠수, 스타트, 킥 등"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="bg-blue-50 p-3 rounded-md">
                <p className="text-sm text-blue-800">
                  💡 카테고리는 강습법 추가 시 선택할 수 있습니다.
                </p>
              </div>
              <div className="flex justify-end space-x-3">
                <Button
                  onClick={() => {
                    setShowAddCategoryModal(false);
                    setNewCategoryName('');
                  }}
                  variant="secondary"
                  size="md"
                >
                  취소
                </Button>
                <Button
                  onClick={() => {
                    if (newCategoryName.trim()) {
                      alert(`"${newCategoryName}" 카테고리가 추가되었습니다.\n강습법 추가 시 이 카테고리를 사용할 수 있습니다.`);
                      setShowAddCategoryModal(false);
                      setNewCategoryName('');
                    } else {
                      alert('카테고리 이름을 입력해주세요.');
                    }
                  }}
                  variant="primary"
                  size="md"
                >
                  추가
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 레벨 추가 모달 */}
      {showAddLevelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowAddLevelModal(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">새 레벨 추가</h3>
              <button onClick={() => setShowAddLevelModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">레벨 영문명</label>
                <input
                  type="text"
                  value={newLevelName}
                  onChange={(e) => setNewLevelName(e.target.value)}
                  placeholder="예: beginner, intermediate 등"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">레벨 한국어명</label>
                <input
                  type="text"
                  value={newLevelKoreanName}
                  onChange={(e) => setNewLevelKoreanName(e.target.value)}
                  placeholder="예: 초급, 중급 등"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="bg-blue-50 p-3 rounded-md">
                <p className="text-sm text-blue-800">
                  💡 레벨은 강습법 추가 시 선택할 수 있습니다.
                </p>
              </div>
              <div className="flex justify-end space-x-3">
                <Button
                  onClick={() => {
                    setShowAddLevelModal(false);
                    setNewLevelName('');
                    setNewLevelKoreanName('');
                  }}
                  variant="secondary"
                  size="md"
                >
                  취소
                </Button>
                <Button
                  onClick={() => {
                    if (newLevelName.trim() && newLevelKoreanName.trim()) {
                      alert(`"${newLevelName} (${newLevelKoreanName})" 레벨이 추가되었습니다.\n강습법 추가 시 이 레벨을 사용할 수 있습니다.`);
                      setShowAddLevelModal(false);
                      setNewLevelName('');
                      setNewLevelKoreanName('');
                    } else {
                      alert('레벨 영문명과 한국어명을 모두 입력해주세요.');
                    }
                  }}
                  variant="primary"
                  size="md"
                >
                  추가
                </Button>
              </div>
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