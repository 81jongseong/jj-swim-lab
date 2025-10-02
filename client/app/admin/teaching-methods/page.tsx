'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { updateAllLevels } from '../../../utils/updateLevels';
import ExcelUploader from '../../../components/ExcelUploader';
import YouTubeVideoManager from '../../../components/YouTubeVideoManager';

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
  const [loading, setLoading] = useState(true);
  const [steps, setSteps] = useState<string[]>([]);
  const [tips, setTips] = useState<string[]>([]);
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
      console.log('🔍 강습법 데이터 가져오기 시작...');
      
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('❌ 토큰이 없습니다.');
        return;
      }
      
      console.log('🔑 JWT 토큰 확인됨');

      const response = await fetch('/api/teaching-methods', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 서버 응답 상태:', response.status, response.statusText);

      if (response.ok) {
        const data = await response.json();
        console.log('📊 서버 응답 데이터:', data);
        
        const transformedMethods = data.data.map((method: any) => ({
          ...method,
          steps: method.steps || [],
          tips: method.tips || [],
          checklist: method.checklist || []
        }));
        
        console.log('🔄 변환된 강습법 데이터:', transformedMethods);
        console.log('📊 API 응답 데이터 개수:', transformedMethods.length);
        console.log('📋 첫 번째 강습법 샘플:', transformedMethods[0]);
        console.log('📋 마지막 강습법 샘플:', transformedMethods[transformedMethods.length - 1]);
        
        setMethods(transformedMethods);
        console.log('✅ 73개의 강습법을 성공적으로 로드했습니다.');
        console.log('🔍 methods 상태 업데이트 완료');
      } else {
        console.error('❌ 강습법 데이터 가져오기 실패:', response.status);
      }
    } catch (error) {
      console.error('❌ 강습법 데이터 가져오기 오류:', error);
    } finally {
      setLoading(false);
      console.log('🏁 강습법 데이터 로딩 완료');
    }
  };

  // 필터링 및 검색
  const filterMethods = () => {
    console.log('🔍 filterMethods 실행:', { totalMethods: methods.length, searchTerm, selectedLevel });
    
    let filtered = methods;
    
    console.log('📋 methods 배열 내용:', methods);

    // 검색어 필터링
    if (searchTerm) {
      filtered = filtered.filter(method =>
        method.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        method.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        method.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 레벨 필터링
    if (selectedLevel !== 'all') {
      filtered = filtered.filter(method => method.level === selectedLevel);
    }

    // 정렬 (order 기준)
    filtered = filtered.sort((a, b) => a.order - b.order);

    console.log('🔍 필터링 및 정렬 결과:', { filteredCount: filtered.length, filteredMethods: filtered });
    setFilteredMethods(filtered);
  };

  // 컴포넌트 마운트 시 데이터 가져오기
  useEffect(() => {
    fetchTeachingMethods();
  }, []);

  // 필터링 및 검색 효과
  useEffect(() => {
    filterMethods();
  }, [methods, searchTerm, selectedLevel]);

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
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">로딩 중...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {isCenterAdmin ? '강습법 조회' : '강습법 관리'}
          </h1>
          <p className="mt-2 text-gray-600">
            {isCenterAdmin 
              ? '수영 강습에 필요한 다양한 강습법을 조회하고 레벨별로 분류할 수 있습니다. 수정 및 삭제는 최고관리자만 가능합니다.'
              : '수영 강습에 필요한 다양한 강습법을 관리하고 체계화합니다.'
            }
          </p>
        </div>

        {/* 통계 섹션 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 shadow-md">
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-500 rounded-full">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">전체 강습법</p>
                  <p className="text-2xl font-semibold text-gray-900">{methods.length}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6 shadow-md">
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-500 rounded-full">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">카테고리</p>
                  <p className="text-2xl font-semibold text-gray-900">{TEACHING_METHOD_CATEGORIES.length}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-6 shadow-md">
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-500 rounded-full">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">레벨</p>
                  <p className="text-2xl font-semibold text-gray-900">{TEACHING_METHOD_LEVELS.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

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
                <button
                  onClick={async () => {
                    if (confirm('모든 강습법의 레벨을 한국어로 변경하시겠습니까?\n(beginner → 초급, intermediate → 중급, advanced/expert → 상급)')) {
                      try {
                        const result = await updateAllLevels();
                        if (result.success) {
                          alert(`레벨 변경 완료!\n${result.updatedCount}개의 강습법이 업데이트되었습니다.`);
                          fetchTeachingMethods(); // 목록 새로고침
                        } else {
                          alert(`레벨 변경 실패: ${result.error}`);
                        }
                      } catch (error) {
                        console.error('레벨 변경 오류:', error);
                        alert('레벨 변경 중 오류가 발생했습니다.');
                      }
                    }
                  }}
                  className="px-6 py-2 border border-orange-500 text-orange-700 hover:bg-orange-50 shadow-md rounded-md"
                >
                  🔄 레벨 한국어 변경
                </button>
              </>
            )}
            <button
              onClick={() => {
                console.log('🔄 수동 새로고침 시작...');
                fetchTeachingMethods();
              }}
              className="px-6 py-2 border border-blue-500 text-blue-700 hover:bg-blue-50 shadow-md rounded-md"
            >
              🔄 새로고침
            </button>
          </div>
        </div>

        {/* 강습법 목록 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMethods.map((method) => (
            <div key={method._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{method.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{method.description}</p>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {method.category}
                      </span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        {method.level}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setSelectedMethod(method);
                      setIsDetailModalOpen(true);
                    }}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                  >
                    상세보기
                  </button>
                  {!isCenterAdmin && (
                    <>
                      <button
                        onClick={() => {
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
                        }}
                        className="px-3 py-1 bg-yellow-600 text-white text-sm rounded-md hover:bg-yellow-700"
                      >
                        수정
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm('정말로 이 강습법을 삭제하시겠습니까?')) {
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
                                fetchTeachingMethods(); // 목록 새로고침
                              } else {
                                alert('삭제에 실패했습니다.');
                              }
                            } catch (error) {
                              console.error('삭제 오류:', error);
                              alert('삭제 중 오류가 발생했습니다.');
                            }
                          }
                        }}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
                      >
                        삭제
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
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
                console.log('Excel 업로드 성공:', data);
                setIsExcelUploaderOpen(false);
                fetchTeachingMethods();
              }}
              onUploadError={(error) => {
                console.error('Excel 업로드 오류:', error);
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
                  console.error('수정 오류 응답:', errorData);
                  alert(`수정에 실패했습니다: ${errorData.error || '알 수 없는 오류'}`);
                }
              } catch (error) {
                console.error('수정 오류:', error);
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
    </div>
  );
}