'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { BookOpen, Search, Filter, Plus, Edit, Trash2, Eye, Star } from 'lucide-react';
import withAuth from '@/components/withAuth';

interface TeachingMethod {
  _id: string;
  name: string;
  description: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  steps: string[];
  tips: string[];
  checklist: string[];
  rating: number;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

function InstructorTeachingMethods() {
  const { user } = useAuth();
  const [teachingMethods, setTeachingMethods] = useState<TeachingMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');

  useEffect(() => {
    if (user) {
      loadTeachingMethods();
    }
  }, [user]);

  const loadTeachingMethods = async () => {
    try {
      setIsLoading(true);
      // 임시 데이터
      const tempMethods: TeachingMethod[] = [
        {
          _id: '1',
          name: '자유형 팔 동작 교정법',
          description: '자유형 팔 동작을 올바르게 교정하는 방법',
          category: '자유형',
          level: 'beginner',
          steps: [
            '학생이 벽에 기대어 서도록 한다',
            '팔을 천천히 앞뒤로 움직이게 한다',
            '엄지손가락이 먼저 물에 들어가도록 지도한다',
            '팔이 완전히 뻗어지도록 연습한다'
          ],
          tips: [
            '너무 빠르게 하지 말고 천천히 연습하세요',
            '팔꿈치가 구부러지지 않도록 주의하세요',
            '호흡과 팔 동작을 함께 연습하세요'
          ],
          checklist: [
            '팔이 완전히 뻗어지는가?',
            '엄지손가락이 먼저 들어가는가?',
            '팔꿈치가 구부러지지 않는가?',
            '자연스러운 리듬을 유지하는가?'
          ],
          rating: 4.8,
          usageCount: 25,
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-20')
        },
        {
          _id: '2',
          name: '배영 발차기 교정법',
          description: '배영에서 올바른 발차기 기술을 가르치는 방법',
          category: '배영',
          level: 'intermediate',
          steps: [
            '벽에 등을 대고 앉아 발차기 연습',
            '무릎을 약간 구부리고 발목을 유연하게',
            '위아래로 부드럽게 발차기',
            '점진적으로 속도를 높여 연습'
          ],
          tips: [
            '무릎을 너무 많이 구부리지 마세요',
            '발목을 유연하게 유지하세요',
            '작은 동작으로 시작해서 점진적으로 확대하세요'
          ],
          checklist: [
            '무릎이 적절히 구부러지는가?',
            '발목이 유연한가?',
            '부드러운 동작을 하는가?',
            '균형을 유지하는가?'
          ],
          rating: 4.6,
          usageCount: 18,
          createdAt: new Date('2024-01-10'),
          updatedAt: new Date('2024-01-18')
        },
        {
          _id: '3',
          name: '접영 호흡법 교정',
          description: '접영에서 올바른 호흡 타이밍을 가르치는 방법',
          category: '접영',
          level: 'advanced',
          steps: [
            '벽에 기대어 호흡 연습',
            '팔 동작과 호흡 타이밍 맞추기',
            '물에서 실제 호흡 연습',
            '연속적인 호흡 패턴 연습'
          ],
          tips: [
            '호흡 타이밍이 가장 중요합니다',
            '팔 동작과 완벽하게 동기화하세요',
            '무리하지 말고 천천히 연습하세요'
          ],
          checklist: [
            '호흡 타이밍이 정확한가?',
            '팔 동작과 동기화되는가?',
            '자연스러운 호흡을 하는가?',
            '지속적으로 유지할 수 있는가?'
          ],
          rating: 4.9,
          usageCount: 12,
          createdAt: new Date('2024-01-05'),
          updatedAt: new Date('2024-01-19')
        }
      ];
      setTeachingMethods(tempMethods);
    } catch (error) {
      console.error('강습법 목록 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMethods = teachingMethods.filter(method => {
    const matchesSearch = method.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         method.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         method.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === '' || method.category === categoryFilter;
    const matchesLevel = levelFilter === '' || method.level === levelFilter;
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

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const categories = Array.from(new Set(teachingMethods.map(method => method.category)));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">강습법을 불러오는 중...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">강습법 관리</h1>
          <p className="text-gray-600">효과적인 수영 강습법을 관리하고 활용하세요</p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">총 강습법</p>
                <p className="text-2xl font-bold text-gray-900">{teachingMethods.length}개</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Star className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">평균 평점</p>
                <p className="text-2xl font-bold text-gray-900">
                  {teachingMethods.length > 0 
                    ? (teachingMethods.reduce((sum, m) => sum + m.rating, 0) / teachingMethods.length).toFixed(1)
                    : '0.0'
                  }
                </p>
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
                  {teachingMethods.reduce((sum, m) => sum + m.usageCount, 0)}회
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
                  placeholder="강습법명, 설명, 카테고리로 검색..."
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
                새 강습법
              </button>
            </div>
          </div>
        </div>

        {/* 강습법 목록 */}
        <div className="space-y-6">
          {filteredMethods.map((method) => (
            <div key={method._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h3 className="text-xl font-semibold text-gray-900 mr-3">{method.name}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLevelColor(method.level)}`}>
                      {getLevelLabel(method.level)}
                    </span>
                    <span className="ml-2 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {method.category}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">{method.description}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <div className="flex items-center mr-4">
                      <div className="flex mr-1">
                        {renderStars(method.rating)}
                      </div>
                      <span>({method.rating})</span>
                    </div>
                    <span>사용 횟수: {method.usageCount}회</span>
                    <span className="mx-2">•</span>
                    <span>생성일: {method.createdAt.toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-green-600 hover:bg-green-50 rounded">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-red-600 hover:bg-red-50 rounded">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 단계별 설명 */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">단계별 설명</h4>
                  <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
                    {method.steps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ol>
                </div>

                {/* 팁 */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">팁</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    {method.tips.map((tip, index) => (
                      <li key={index}>{tip}</li>
                    ))}
                  </ul>
                </div>

                {/* 체크리스트 */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">체크리스트</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    {method.checklist.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredMethods.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">검색 결과가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default withAuth(InstructorTeachingMethods, { 
  requireTypes: ['instructor'] 
});