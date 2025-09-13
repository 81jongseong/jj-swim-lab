/**
 * @file 강사용 강습법 관리 페이지
 * @description 강사가 강습법을 조회하고 레벨 변경 및 코멘트를 추가할 수 있는 페이지입니다.
 * @date 2025-01-13
 * @author JJ Swim Lab
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';
import Badge from '../../../components/ui/Badge';

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
  centerLevel?: string;
  instructorComments?: string;
}

export default function InstructorTeachingMethodsPage() {
  const { user } = useAuth();
  const [methods, setMethods] = useState<TeachingMethod[]>([]);
  const [filteredMethods, setFilteredMethods] = useState<TeachingMethod[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedMethod, setSelectedMethod] = useState<TeachingMethod | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isLevelEditModalOpen, setIsLevelEditModalOpen] = useState(false);
  const [editingLevelMethod, setEditingLevelMethod] = useState<TeachingMethod | null>(null);
  const [newLevel, setNewLevel] = useState<string>('');
  const [instructorComment, setInstructorComment] = useState<string>('');
  const [centerLevels, setCenterLevels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.userType === 'instructor') {
      fetchTeachingMethods();
      fetchCenterLevels();
    }
  }, [user]);

  useEffect(() => {
    filterMethods();
  }, [methods, searchTerm, selectedLevel]);

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
      
      const response = await fetch('http://localhost:5000/api/teaching-methods', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const apiMethods = data.data || data;
        
        if (Array.isArray(apiMethods)) {
          // steps와 tips가 undefined인 경우 빈 배열로 초기화
          const processedMethods = apiMethods.map(method => ({
            ...method,
            steps: method.steps || [],
            tips: method.tips || []
          }));
          setMethods(processedMethods);
        }
      } else {
        console.error('강습법 데이터 로딩 실패:', response.status);
      }
    } catch (error) {
      console.error('강습법 데이터 로딩 중 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCenterLevels = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/center-levels', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCenterLevels(data.data || data);
      }
    } catch (error) {
      console.error('센터 레벨 데이터 로딩 중 오류:', error);
    }
  };

  const filterMethods = () => {
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

    setFilteredMethods(filtered);
  };

  const handleLevelEdit = (method: TeachingMethod) => {
    setEditingLevelMethod(method);
    setNewLevel(method.level);
    setInstructorComment(method.instructorComments || '');
    setIsLevelEditModalOpen(true);
  };

  const handleLevelUpdate = async () => {
    if (!editingLevelMethod) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/teaching-methods/${editingLevelMethod._id}/level`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          level: newLevel,
          instructorComment: instructorComment,
          updatedBy: user?._id
        })
      });

      if (response.ok) {
        const updatedMethod = await response.json();
        setMethods(prev => prev.map(method => 
          method._id === editingLevelMethod._id 
            ? { ...method, level: newLevel as 'beginner' | 'intermediate' | 'advanced', instructorComments: instructorComment }
            : method
        ));
        setIsLevelEditModalOpen(false);
        setEditingLevelMethod(null);
        setNewLevel('');
        setInstructorComment('');
        alert('강습법 레벨이 성공적으로 업데이트되었습니다!');
      } else {
        alert('레벨 업데이트에 실패했습니다.');
      }
    } catch (error) {
      console.error('레벨 업데이트 중 오류:', error);
      alert('레벨 업데이트 중 오류가 발생했습니다.');
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'beginner': return '초급';
      case 'intermediate': return '중급';
      case 'advanced': return '고급';
      default: return level;
    }
  };

  // 강사 권한 확인
  if (user?.userType !== 'instructor') {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h1 className="text-xl font-semibold text-red-800 mb-2">접근 권한 없음</h1>
            <p className="text-red-600">강사만 이 페이지에 접근할 수 있습니다.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">로딩 중...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            강습법 조회 및 관리 🏊‍♂️
          </h1>
          <p className="mt-2 text-gray-600">
            수영 강습에 필요한 다양한 강습법을 조회하고, 레벨 변경 및 코멘트를 추가할 수 있습니다.
          </p>
        </div>

        {/* 검색 및 필터 */}
        <Card className="mb-6">
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="강습법 이름, 설명, 카테고리로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={selectedLevel === 'all' ? 'default' : 'outline'}
                  onClick={() => setSelectedLevel('all')}
                >
                  전체
                </Button>
                <Button
                  variant={selectedLevel === 'beginner' ? 'default' : 'outline'}
                  onClick={() => setSelectedLevel('beginner')}
                >
                  초급
                </Button>
                <Button
                  variant={selectedLevel === 'intermediate' ? 'default' : 'outline'}
                  onClick={() => setSelectedLevel('intermediate')}
                >
                  중급
                </Button>
                <Button
                  variant={selectedLevel === 'advanced' ? 'default' : 'outline'}
                  onClick={() => setSelectedLevel('advanced')}
                >
                  고급
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* 강습법 목록 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMethods.map((method) => (
            <Card key={method._id} className="hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {method.name}
                  </h3>
                  <Badge className={getLevelColor(method.level)}>
                    {getLevelLabel(method.level)}
                  </Badge>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {method.description}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>카테고리: {method.category}</span>
                  <span>{method.steps?.length || 0}단계</span>
                </div>

                {method.instructorComments && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>강사 코멘트:</strong> {method.instructorComments}
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setSelectedMethod(method);
                      setIsDetailModalOpen(true);
                    }}
                    className="flex-1"
                  >
                    상세보기
                  </Button>
                  <Button
                    onClick={() => handleLevelEdit(method)}
                    variant="outline"
                    className="flex-1"
                  >
                    레벨 수정
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredMethods.length === 0 && (
          <Card className="text-center py-12">
            <div className="text-gray-500">
              <p className="text-lg">검색 조건에 맞는 강습법이 없습니다.</p>
            </div>
          </Card>
        )}

        {/* 상세 모달 */}
        {isDetailModalOpen && selectedMethod && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedMethod.name}
                  </h2>
                  <Button
                    onClick={() => setIsDetailModalOpen(false)}
                    variant="outline"
                  >
                    닫기
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">기본 정보</h3>
                    <div className="space-y-2">
                      <p><strong>설명:</strong> {selectedMethod.description}</p>
                      <p><strong>카테고리:</strong> {selectedMethod.category}</p>
                      <p><strong>레벨:</strong> 
                        <Badge className={`ml-2 ${getLevelColor(selectedMethod.level)}`}>
                          {getLevelLabel(selectedMethod.level)}
                        </Badge>
                      </p>
                      <p><strong>생성일:</strong> {new Date(selectedMethod.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">강습 단계</h3>
                    <ol className="list-decimal list-inside space-y-1">
                      {selectedMethod.steps?.map((step, index) => (
                        <li key={index} className="text-sm">{step}</li>
                      ))}
                    </ol>
                  </div>
                </div>

                {(selectedMethod.tips?.length || 0) > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-3">팁 및 주의사항</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {selectedMethod.tips?.map((tip, index) => (
                        <li key={index} className="text-sm">{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedMethod.instructorComments && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">강사 코멘트</h3>
                    <p className="text-blue-800">{selectedMethod.instructorComments}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 레벨 수정 모달 */}
        {isLevelEditModalOpen && editingLevelMethod && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-md w-full mx-4">
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4">강습법 레벨 수정</h2>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    강습법: {editingLevelMethod.name}
                  </label>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    레벨
                  </label>
                  <select
                    value={newLevel}
                    onChange={(e) => setNewLevel(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="beginner">초급</option>
                    <option value="intermediate">중급</option>
                    <option value="advanced">고급</option>
                  </select>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    강사 코멘트
                  </label>
                  <textarea
                    value={instructorComment}
                    onChange={(e) => setInstructorComment(e.target.value)}
                    placeholder="레벨 변경 사유나 추가 코멘트를 입력하세요..."
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-24"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleLevelUpdate}
                    className="flex-1"
                  >
                    수정 완료
                  </Button>
                  <Button
                    onClick={() => {
                      setIsLevelEditModalOpen(false);
                      setEditingLevelMethod(null);
                      setNewLevel('');
                      setInstructorComment('');
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    취소
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