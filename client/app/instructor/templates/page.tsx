'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { FileText, Plus, Edit, Trash2, Eye, Search, Filter } from 'lucide-react';
import withAuth from '@/components/withAuth';

interface Template {
  _id: string;
  name: string;
  description: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  items: Array<{
    id: string;
    text: string;
    completed: boolean;
  }>;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

function ChecklistTemplates() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');

  useEffect(() => {
    if (user) {
      loadTemplates();
    }
  }, [user]);

  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      // 임시 데이터
      const tempTemplates: Template[] = [
        {
          _id: '1',
          name: '초급 자유형 수업 체크리스트',
          description: '초급 자유형 수업에서 사용할 수 있는 체크리스트 템플릿',
          category: '자유형',
          level: 'beginner',
          items: [
            { id: '1', text: '워밍업 스트레칭 완료', completed: false },
            { id: '2', text: '물 적응 연습 완료', completed: false },
            { id: '3', text: '자유형 팔 동작 연습', completed: false },
            { id: '4', text: '자유형 발차기 연습', completed: false },
            { id: '5', text: '호흡법 연습', completed: false },
            { id: '6', text: '쿨다운 완료', completed: false }
          ],
          usageCount: 15,
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-20')
        },
        {
          _id: '2',
          name: '중급 배영 수업 체크리스트',
          description: '중급 배영 수업에서 사용할 수 있는 체크리스트 템플릿',
          category: '배영',
          level: 'intermediate',
          items: [
            { id: '1', text: '어깨 스트레칭 완료', completed: false },
            { id: '2', text: '배영 자세 교정', completed: false },
            { id: '3', text: '배영 발차기 연습', completed: false },
            { id: '4', text: '배영 팔 동작 연습', completed: false },
            { id: '5', text: '턴 기술 연습', completed: false },
            { id: '6', text: '연속 수영 연습', completed: false }
          ],
          usageCount: 12,
          createdAt: new Date('2024-01-10'),
          updatedAt: new Date('2024-01-18')
        },
        {
          _id: '3',
          name: '고급 접영 수업 체크리스트',
          description: '고급 접영 수업에서 사용할 수 있는 체크리스트 템플릿',
          category: '접영',
          level: 'advanced',
          items: [
            { id: '1', text: '전신 스트레칭 완료', completed: false },
            { id: '2', text: '접영 자세 교정', completed: false },
            { id: '3', text: '접영 팔 동작 연습', completed: false },
            { id: '4', text: '접영 발차기 연습', completed: false },
            { id: '5', text: '접영 호흡법 연습', completed: false },
            { id: '6', text: '접영 턴 연습', completed: false },
            { id: '7', text: '연속 접영 연습', completed: false }
          ],
          usageCount: 8,
          createdAt: new Date('2024-01-05'),
          updatedAt: new Date('2024-01-19')
        }
      ];
      setTemplates(tempTemplates);
    } catch (error) {
      console.error('템플릿 목록 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === '' || template.category === categoryFilter;
    const matchesLevel = levelFilter === '' || template.level === levelFilter;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const getLevelLabel = (level: string) => {
    const levels: { [key: string]: string } = {
      'beginner': '초급',
      'intermediate': '중급',
      'advanced': '고급'
    };
    return levels[level] || level;
  };

  const getLevelColor = (level: string) => {
    const colors: { [key: string]: string } = {
      'beginner': 'bg-green-100 text-green-800',
      'intermediate': 'bg-yellow-100 text-yellow-800',
      'advanced': 'bg-red-100 text-red-800'
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  };

  const categories = [...new Set(templates.map(template => template.category))];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">템플릿 목록을 불러오는 중...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">체크리스트 템플릿 관리</h1>
        <p className="text-gray-600">수업에 사용할 체크리스트 템플릿을 관리하세요</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <FileText className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">총 템플릿</p>
              <p className="text-2xl font-bold text-gray-900">{templates.length}개</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Filter className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">카테고리</p>
              <p className="text-2xl font-bold text-gray-900">{categories.length}개</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Eye className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">총 사용 횟수</p>
              <p className="text-2xl font-bold text-gray-900">
                {templates.reduce((sum, t) => sum + t.usageCount, 0)}회
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Plus className="w-8 h-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">평균 항목 수</p>
              <p className="text-2xl font-bold text-gray-900">
                {templates.length > 0 
                  ? Math.round(templates.reduce((sum, t) => sum + t.items.length, 0) / templates.length)
                  : 0
                }개
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="템플릿명, 설명, 카테고리로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">모든 카테고리</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">모든 레벨</option>
              <option value="beginner">초급</option>
              <option value="intermediate">중급</option>
              <option value="advanced">고급</option>
            </select>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              새 템플릿
            </button>
          </div>
        </div>
      </div>

      {/* 템플릿 목록 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <div key={template._id} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{template.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                  <div className="flex items-center space-x-2 mb-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLevelColor(template.level)}`}>
                      {getLevelLabel(template.level)}
                    </span>
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {template.category}
                    </span>
                  </div>
                </div>
              </div>

              {/* 체크리스트 항목 미리보기 */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">체크리스트 항목 ({template.items.length}개)</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {template.items.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex items-center text-sm">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        readOnly
                        className="mr-2"
                      />
                      <span className="text-gray-700">{item.text}</span>
                    </div>
                  ))}
                  {template.items.length > 5 && (
                    <div className="text-xs text-gray-500">
                      ... 외 {template.items.length - 5}개 항목
                    </div>
                  )}
                </div>
              </div>

              {/* 사용 통계 */}
              <div className="mb-4 p-3 bg-gray-50 rounded">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">사용 횟수</span>
                  <span className="font-medium text-gray-900">{template.usageCount}회</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-gray-600">생성일</span>
                  <span className="text-gray-900">{template.createdAt.toLocaleDateString()}</span>
                </div>
              </div>

              {/* 액션 버튼 */}
              <div className="flex space-x-2">
                <button className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center justify-center">
                  <Eye className="w-4 h-4 mr-1" />
                  보기
                </button>
                <button className="flex-1 px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center justify-center">
                  <Edit className="w-4 h-4 mr-1" />
                  수정
                </button>
                <button className="flex-1 px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center justify-center">
                  <Trash2 className="w-4 h-4 mr-1" />
                  삭제
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">검색 결과가 없습니다.</p>
        </div>
      )}
    </div>
  );
}

export default withAuth(ChecklistTemplates, { 
  requireTypes: ['instructor'] 
});