'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';
import ExcelUploader from '../../../components/ExcelUploader';

interface TeachingMethod {
  _id: string;
  name: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  steps: string[];
  tips: string[];
  videoUrl?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function TeachingMethodsPage() {
  const { user } = useAuth();
  const [methods, setMethods] = useState<TeachingMethod[]>([]);
  const [filteredMethods, setFilteredMethods] = useState<TeachingMethod[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<TeachingMethod | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<TeachingMethod | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isExcelUploaderOpen, setIsExcelUploaderOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [steps, setSteps] = useState<string[]>([]);
  const [tips, setTips] = useState<string[]>([]);

  useEffect(() => {
    if (user?.userType !== 'superAdmin') {
      return;
    }
    fetchTeachingMethods();
  }, [user]);

  useEffect(() => {
    console.log('🔄 methods 상태 변경 감지:', methods.length);
    filterMethods();
  }, [methods, searchTerm, selectedLevel]);

  useEffect(() => {
    if (editingMethod) {
      setSteps(editingMethod.steps || []);
      setTips(editingMethod.tips || []);
    } else {
      setSteps([]);
      setTips([]);
    }
  }, [editingMethod]);

  const fetchTeachingMethods = async () => {
    try {
      setLoading(true);
      console.log('🔍 강습법 데이터 가져오기 시작...');
      
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('❌ JWT 토큰이 없습니다.');
        setMethods([]);
        return;
      }
      
      console.log('🔑 JWT 토큰 확인됨');
      
      const response = await fetch('http://localhost:5000/api/teaching-methods', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 서버 응답 상태:', response.status, response.statusText);

      if (response.ok) {
        const data = await response.json();
        console.log('📊 서버 응답 데이터:', data);
        
        // API 응답 구조에 맞게 데이터 변환
        const apiMethods = data.data || data;
        console.log('🔄 변환된 강습법 데이터:', apiMethods);
        
        if (Array.isArray(apiMethods)) {
          console.log(`📊 API 응답 데이터 개수: ${apiMethods.length}`);
          console.log('📋 첫 번째 강습법 샘플:', apiMethods[0]);
          console.log('📋 마지막 강습법 샘플:', apiMethods[apiMethods.length - 1]);
          
          setMethods(apiMethods);
          console.log(`✅ ${apiMethods.length}개의 강습법을 성공적으로 로드했습니다.`);
          console.log('🔍 methods 상태 업데이트 완료');
        } else {
          console.error('❌ API 응답이 배열이 아닙니다:', typeof apiMethods);
          console.error('❌ API 응답 내용:', apiMethods);
          setMethods([]);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ 강습법 조회 실패:', response.status, errorData);
        
        if (response.status === 401) {
          console.error('❌ 인증 실패 - 토큰이 유효하지 않습니다.');
        } else if (response.status === 403) {
          console.error('❌ 권한 없음 - 접근 권한이 없습니다.');
        }
        
        setMethods([]);
      }
    } catch (error) {
      console.error('❌ 강습법 조회 중 네트워크 오류:', error);
      setMethods([]);
    } finally {
      setLoading(false);
      console.log('🏁 강습법 데이터 로딩 완료');
    }
  };

  const filterMethods = () => {
    console.log('🔍 filterMethods 실행:', {
      totalMethods: methods.length,
      searchTerm,
      selectedLevel
    });
    
    console.log('📋 methods 배열 내용:', methods);
    
    let filtered = methods;

    if (searchTerm) {
      filtered = filtered.filter(method =>
        method.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        method.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        method.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedLevel !== 'all') {
      filtered = filtered.filter(method => method.level === selectedLevel);
    }

    // 레벨별로 정렬 (초급 → 중급 → 상급 순서)
    filtered.sort((a, b) => {
      const levelOrder = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 };
      return levelOrder[a.level] - levelOrder[b.level];
    });

    console.log('🔍 필터링 및 정렬 결과:', {
      filteredCount: filtered.length,
      filteredMethods: filtered
    });

    setFilteredMethods(filtered);
  };

  const handleCardClick = (method: TeachingMethod) => {
    setSelectedMethod(method);
    setIsDetailModalOpen(true);
  };

  const handleExcelUploadSuccess = (data: any) => {
    console.log('✅ Excel 업로드 성공:', data);
    console.log('🔍 받은 데이터 구조:', {
      hasData: !!data,
      dataType: typeof data,
      hasDataProperty: data && !!data.data,
      dataPropertyType: data && typeof data.data,
      isArray: data && data.data && Array.isArray(data.data),
      dataLength: data && data.data ? data.data.length : 'N/A'
    });
    
    // 서버 응답 구조 분석
    const result = data?.data || data;
    console.log('🔄 서버 응답 결과:', result);
    console.log('🔍 savedCount 확인:', result?.savedCount);
    console.log('🔍 errorCount 확인:', result?.errorCount);
    
    if (result && result.savedCount > 0) {
      // 성공 메시지
      alert(`Excel 업로드 성공! ${result.savedCount}개의 강습법이 데이터베이스에 저장되었습니다.`);
      
      // 데이터베이스에서 최신 데이터 가져오기
      console.log('🔄 데이터베이스에서 최신 데이터 가져오기 시작...');
      console.log('🔍 fetchTeachingMethods 함수 호출 전');
      
      // 약간의 지연 후 데이터 새로고침 (서버 처리 시간 고려)
      setTimeout(() => {
        console.log('🔄 fetchTeachingMethods 함수 호출 시작...');
        fetchTeachingMethods();
      }, 1000);
      
    } else if (result && result.errorCount > 0) {
      alert(`Excel 업로드 완료! ${result.savedCount}개 저장, ${result.errorCount}개 오류`);
      
      // 저장된 데이터가 있으면 새로고침
      if (result.savedCount > 0) {
        console.log('🔄 에러가 있지만 저장된 데이터가 있음, 데이터 새로고침...');
        setTimeout(() => {
          fetchTeachingMethods();
        }, 1000);
      }
    } else {
      console.warn('⚠️ Excel 데이터 처리 결과가 예상과 다름:', result);
      alert('Excel 데이터를 처리할 수 없습니다.');
    }
    
    // 모달 닫기
    setIsExcelUploaderOpen(false);
  };

  const handleEdit = (method: TeachingMethod) => {
    setEditingMethod(method);
    setSteps(method.steps || []);
    setTips(method.tips || []);
    setIsFormOpen(true);
  };

  const handleDelete = async (methodId: string) => {
    if (!confirm('정말로 이 강습법을 삭제하시겠습니까?')) {
      return;
    }

    try {
      // 실제 API 호출
      const response = await fetch(`http://localhost:5000/api/teaching-methods/${methodId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // 성공 시 데이터베이스에서 최신 상태 가져오기
        console.log('✅ 강습법 삭제 성공:', methodId);
        console.log('🔄 데이터베이스에서 최신 상태 가져오기...');
        fetchTeachingMethods();
      } else {
        const errorData = await response.json();
        console.error('❌ 강습법 삭제 실패:', errorData);
        alert('강습법 삭제에 실패했습니다: ' + (errorData.message || '알 수 없는 오류'));
      }
    } catch (error) {
      console.error('❌ 강습법 삭제 중 오류:', error);
      alert('강습법 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleFormSubmit = async (methodData: Partial<TeachingMethod>) => {
    try {
      if (editingMethod) {
        // 수정 API 호출
        const response = await fetch(`http://localhost:5000/api/teaching-methods/${editingMethod._id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(methodData)
        });

        if (response.ok) {
          const updatedMethod = await response.json();
          setMethods(prev => prev.map(m => 
            m._id === editingMethod._id ? { ...m, ...updatedMethod.data } : m
          ));
          console.log('✅ 강습법 수정 성공');
        } else {
          const errorData = await response.json();
          console.error('❌ 강습법 수정 실패:', errorData);
          alert('강습법 수정에 실패했습니다: ' + (errorData.message || '알 수 없는 오류'));
          return;
        }
      } else {
        // 새로 생성 API 호출
        const response = await fetch('http://localhost:5000/api/teaching-methods', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(methodData)
        });

        if (response.ok) {
          const newMethod = await response.json();
          setMethods(prev => [...prev, newMethod.data]);
          console.log('✅ 강습법 생성 성공');
        } else {
          const errorData = await response.json();
          console.error('❌ 강습법 생성 실패:', errorData);
          alert('강습법 생성에 실패했습니다: ' + (errorData.message || '알 수 없는 오류'));
          return;
        }
      }
      
      setIsFormOpen(false);
      setEditingMethod(null);
      setSteps([]);
      setTips([]);
    } catch (error) {
      console.error('❌ 강습법 저장 중 오류:', error);
      alert('강습법 저장 중 오류가 발생했습니다.');
    }
  };

  const handleDetailEdit = (method: TeachingMethod) => {
    setEditingMethod(method);
    setSteps(method.steps || []);
    setTips(method.tips || []);
    setIsDetailModalOpen(false);
    setIsFormOpen(true);
  };

  const handleDetailDelete = (methodId: string) => {
    setIsDetailModalOpen(false);
    handleDelete(methodId);
  };

  const handleExcelDataParsed = (data: any[]) => {
    // 엑셀 데이터 처리 로직
    console.log('엑셀 데이터 파싱 완료:', data);
    setIsExcelUploaderOpen(false);
  };

  if (user?.userType !== 'superAdmin') {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">접근 권한 없음</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>최고 관리자만 강습법 관리에 접근할 수 있습니다.</p>
                </div>
              </div>
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
          <h1 className="text-3xl font-bold text-gray-900">강습법 관리</h1>
          <p className="mt-2 text-gray-600">
            수영 강습에 필요한 다양한 강습법을 관리하고 체계화합니다.
          </p>
        </div>

        {/* 검색 및 필터 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="강습법 이름, 설명, 카테고리로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="w-full md:w-48">
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">모든 난이도</option>
                <option value="beginner">초급</option>
                <option value="intermediate">중급</option>
                <option value="advanced">상급</option>
              </select>
            </div>
            <Button
              onClick={() => {
                setIsFormOpen(true);
                setEditingMethod(null);
                setSteps([]);
                setTips([]);
              }}
              className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700"
            >
              ✨ 새 강습법 추가
            </Button>
            <Button
              onClick={() => setIsExcelUploaderOpen(true)}
              variant="outline"
              className="px-6 py-2 border-green-500 text-green-700 hover:bg-green-50"
            >
              📊 엑셀 업로드
            </Button>
            <Button
              onClick={() => {
                console.log('🔄 수동 새로고침 시작...');
                fetchTeachingMethods();
              }}
              variant="outline"
              className="px-6 py-2 border-blue-500 text-blue-700 hover:bg-blue-50"
            >
              🔄 새로고침
            </Button>
            <Button
              onClick={async () => {
                if (confirm('정말로 모든 강습법을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
                  try {
                    console.log('🗑️ 모든 강습법 삭제 시작...');
                    
                    // 모든 강습법 ID 수집
                    const methodIds = methods.map(m => m._id);
                    console.log(`📋 삭제할 강습법 개수: ${methodIds.length}`);
                    
                    // 각 강습법을 개별적으로 삭제
                    let deletedCount = 0;
                    for (const methodId of methodIds) {
                      try {
                        const response = await fetch(`http://localhost:5000/api/teaching-methods/${methodId}`, {
                          method: 'DELETE',
                          headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`,
                            'Content-Type': 'application/json'
                          }
                        });
                        
                        if (response.ok) {
                          deletedCount++;
                          console.log(`✅ 삭제 완료: ${methodId}`);
                        } else {
                          console.error(`❌ 삭제 실패: ${methodId}`);
                        }
                      } catch (error) {
                        console.error(`❌ 삭제 중 오류: ${methodId}`, error);
                      }
                    }
                    
                    console.log(`🗑️ 모든 강습법 삭제 완료: ${deletedCount}개 삭제됨`);
                    alert(`모든 강습법이 삭제되었습니다. (${deletedCount}개)`);
                    
                    // 데이터베이스에서 최신 상태 가져오기
                    fetchTeachingMethods();
                    
                  } catch (error) {
                    console.error('❌ 모든 강습법 삭제 중 오류:', error);
                    alert('모든 강습법 삭제 중 오류가 발생했습니다.');
                  }
                }
              }}
              variant="outline"
              className="px-6 py-2 border-red-500 text-red-700 hover:bg-red-50"
            >
              🗑️ 모든 강습법 삭제
            </Button>
          </div>
        </div>

        {/* 강습법 목록 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMethods.map((method) => (
            <Card key={method._id} className="hover:shadow-lg transition-shadow duration-200">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{method.name}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    method.level === 'beginner' ? 'bg-green-100 text-green-800' :
                    method.level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-200 text-red-900'
                  }`}>
                    {method.level === 'beginner' ? '초급' :
                     method.level === 'intermediate' ? '중급' : '상급'}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {method.description}
                </p>

                <div className="mb-4 space-y-2">
                  <div className="text-sm text-gray-500">
                    📂 카테고리: {method.category}
                  </div>
                  <div className="text-sm text-gray-500">
                    📋 단계: {method.steps.length}개
                  </div>
                  {method.tips.length > 0 && (
                    <div className="text-sm text-gray-500">
                      💡 팁: {method.tips.length}개
                    </div>
                  )}
                  {(method.videoUrl || method.imageUrl) && (
                    <div className="text-sm text-gray-500">
                      🎬 미디어 포함
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center mb-4">
                  <div className="text-sm text-gray-500">
                    <div>생성일: {new Date(method.createdAt).toLocaleDateString()}</div>
                    <div className={method.isActive ? 'text-green-600' : 'text-red-600'}>
                      {method.isActive ? '활성' : '비활성'}
                    </div>
                  </div>
                </div>

                {/* 액션 버튼들 */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    onClick={() => handleCardClick(method)}
                    variant="outline"
                    className="flex-1 bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100"
                  >
                    👁️ 상세보기
                  </Button>
                  <Button
                    onClick={() => handleEdit(method)}
                    variant="outline"
                    className="flex-1 bg-green-50 text-green-700 border-green-300 hover:bg-green-100"
                  >
                    ✏️ 수정
                  </Button>
                  <Button
                    onClick={() => handleDelete(method._id)}
                    variant="outline"
                    className="flex-1 bg-red-50 text-red-700 border-red-300 hover:bg-red-100"
                  >
                    🗑️ 삭제
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredMethods.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">
              {loading ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p>데이터를 불러오는 중...</p>
                </div>
              ) : methods.length === 0 ? (
                <div className="flex flex-col items-center gap-4">
                  <p>등록된 강습법이 없습니다.</p>
                  <Button
                    onClick={() => fetchTeachingMethods()}
                    variant="outline"
                    className="px-4 py-2"
                  >
                    🔄 다시 시도
                  </Button>
                </div>
              ) : (
                '검색 결과가 없습니다.'
              )}
            </div>
          </div>
        )}

        {/* 강습법 등록/수정 폼 */}
        {isFormOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    {editingMethod ? '강습법 수정' : '새 강습법 추가'}
                  </h3>
                  <button
                    onClick={() => {
                      setIsFormOpen(false);
                      setEditingMethod(null);
                      setSteps([]);
                      setTips([]);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const methodData = {
                    name: formData.get('name') as string,
                    description: formData.get('description') as string,
                    level: formData.get('level') as 'beginner' | 'intermediate' | 'advanced',
                    category: formData.get('category') as string,
                    steps: steps.filter(s => s.trim()),
                    tips: tips.filter(s => s.trim()),
                    videoUrl: formData.get('videoUrl') as string,
                    imageUrl: formData.get('imageUrl') as string
                  };
                  handleFormSubmit(methodData);
                }} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        강습법 이름 *
                      </label>
                      <Input
                        id="name"
                        name="name"
                        defaultValue={editingMethod?.name}
                        required
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-2">
                        난이도 *
                      </label>
                      <select
                        id="level"
                        name="level"
                        defaultValue={editingMethod?.level || 'beginner'}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="beginner">초급</option>
                        <option value="intermediate">중급</option>
                        <option value="advanced">상급</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                      카테고리 *
                    </label>
                    <Input
                      id="category"
                      name="category"
                      defaultValue={editingMethod?.category}
                      required
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                      설명 *
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      defaultValue={editingMethod?.description}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        단계별 설명 * (체크리스트)
                      </label>
                      <Button
                        type="button"
                        onClick={() => {
                          setSteps(prev => [...prev, '새로운 단계']);
                        }}
                        variant="outline"
                        size="sm"
                        className="px-2 py-1 text-xs bg-green-50 text-green-700 border-green-300 hover:bg-red-100"
                      >
                        ➕ 단계 추가
                      </Button>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {steps.map((step, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <span className="text-sm font-medium text-gray-600 w-8">#{index + 1}</span>
                          <Input
                            value={step}
                            onChange={(e) => {
                              const newSteps = [...steps];
                              newSteps[index] = e.target.value;
                              setSteps(newSteps);
                            }}
                            placeholder={`${index + 1}번째 단계를 입력하세요`}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            onClick={() => {
                              setSteps(prev => prev.filter((_, i) => i !== index));
                            }}
                            variant="outline"
                            size="sm"
                            className="px-2 py-1 text-xs bg-red-50 text-red-700 border-red-300 hover:bg-red-100"
                          >
                            🗑️
                          </Button>
                        </div>
                      ))}
                      {steps.length === 0 && (
                        <div className="text-center py-4 text-gray-500 text-sm">
                          단계를 추가해주세요
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      💡 각 단계는 개별 박스로 관리됩니다. + 버튼으로 단계를 추가하고 🗑️ 버튼으로 삭제할 수 있습니다.
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        팁 (한 줄에 하나씩)
                      </label>
                      <Button
                        type="button"
                        onClick={() => {
                          setTips(prev => [...prev, '💡 새로운 팁']);
                        }}
                        variant="outline"
                        size="sm"
                        className="px-2 py-1 text-xs bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100"
                      >
                        ➕ 팁 추가
                      </Button>
                    </div>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {tips.map((tip, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <span className="text-sm font-medium text-gray-600 w-8">💡</span>
                          <Input
                            value={tip}
                            onChange={(e) => {
                              const newTips = [...tips];
                              newTips[index] = e.target.value;
                              setTips(newTips);
                            }}
                            placeholder={`${index + 1}번째 팁을 입력하세요`}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            onClick={() => {
                              setTips(prev => prev.filter((_, i) => i !== index));
                            }}
                            variant="outline"
                            size="sm"
                            className="px-2 py-1 text-xs bg-red-50 text-red-700 border-red-300 hover:bg-red-100"
                          >
                            🗑️
                          </Button>
                        </div>
                      ))}
                      {tips.length === 0 && (
                        <div className="text-center py-4 text-gray-500 text-sm">
                          팁을 추가해주세요
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      💡 각 팁은 개별 박스로 관리됩니다. + 버튼으로 팁을 추가하고 🗑️ 버튼으로 삭제할 수 있습니다.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700 mb-2">
                        동영상 URL
                      </label>
                      <Input
                        id="videoUrl"
                        name="videoUrl"
                        type="url"
                        defaultValue={editingMethod?.videoUrl}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-2">
                        이미지 URL
                      </label>
                      <Input
                        id="imageUrl"
                        name="imageUrl"
                        type="url"
                        defaultValue={editingMethod?.imageUrl}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsFormOpen(false);
                        setEditingMethod(null);
                      }}
                    >
                      취소
                    </Button>
                    <Button type="submit">
                      {editingMethod ? '수정' : '추가'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* 강습법 상세 보기 모달 */}
        {isDetailModalOpen && selectedMethod && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">{selectedMethod.name}</h3>
                  <button
                    onClick={() => {
                      setIsDetailModalOpen(false);
                      setSelectedMethod(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900">설명</h4>
                    <p className="text-gray-600">{selectedMethod.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900">난이도</h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        selectedMethod.level === 'beginner' ? 'bg-green-100 text-green-800' :
                        selectedMethod.level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-200 text-red-900'
                      }`}>
                        {selectedMethod.level === 'beginner' ? '초급' :
                         selectedMethod.level === 'intermediate' ? '중급' : '상급'}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">카테고리</h4>
                      <p className="text-gray-600">{selectedMethod.category}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900">단계별 설명</h4>
                    <ol className="list-decimal list-inside space-y-1 text-gray-600">
                      {selectedMethod.steps.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ol>
                  </div>

                  {selectedMethod.tips.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900">팁</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-600">
                        {selectedMethod.tips.map((tip, index) => (
                          <li key={index}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {(selectedMethod.videoUrl || selectedMethod.imageUrl) && (
                    <div>
                      <h4 className="font-medium text-gray-900">미디어</h4>
                      <div className="space-y-2">
                        {selectedMethod.videoUrl && (
                          <div>
                            <span className="text-sm text-gray-500">동영상:</span>
                            <a href={selectedMethod.videoUrl} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 hover:underline">
                              {selectedMethod.videoUrl}
                            </a>
                          </div>
                        )}
                        {selectedMethod.imageUrl && (
                          <div>
                            <span className="text-sm text-gray-500">이미지:</span>
                            <a href={selectedMethod.imageUrl} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 hover:underline">
                              {selectedMethod.imageUrl}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end space-x-4 pt-4 border-t">
                    <Button
                      onClick={() => handleDetailEdit(selectedMethod)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      ✏️ 수정
                    </Button>
                    <Button
                      onClick={() => handleDetailDelete(selectedMethod._id)}
                      variant="outline"
                      className="border-red-300 text-red-700 hover:bg-red-50"
                    >
                      🗑️ 삭제
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 엑셀 업로더 모달 */}
        {isExcelUploaderOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">엑셀 파일 업로드</h3>
                  <button
                    onClick={() => setIsExcelUploaderOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <ExcelUploader
                  title="강습법 엑셀 업로드"
                  description="강습법 데이터가 포함된 엑셀 파일을 업로드하세요"
                  acceptedTypes={['.xlsx', '.xls', '.csv']}
                  maxSize={5}
                  onUploadSuccess={handleExcelUploadSuccess}
                  onUploadError={(error) => {
                    console.error('강습법 업로드 실패:', error);
                  }}
                />

                <div className="flex justify-end">
                  <Button
                    onClick={() => setIsExcelUploaderOpen(false)}
                    variant="outline"
                  >
                    닫기
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
