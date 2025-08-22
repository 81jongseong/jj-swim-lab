'use client';

import { useState, useEffect } from 'react';
import withAuth from '../../../components/withAuth';

interface Quiz {
  _id: string;
  title: string;
  description: string;
  category: string;
  type: string;
  questions: any[];
  timeLimit: number;
  passingScore: number;
  isActive: boolean;
  createdAt: Date;
}

interface QuizAttempt {
  _id: string;
  quiz: Quiz;
  user: { name: string };
  percentage: number;
  totalScore: number;
  maxPossibleScore: number;
  passed: boolean;
  timeSpent: number;
  completedAt: Date;
}

function QuizPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'quizzes' | 'attempts'>('quizzes');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Mock 데이터
      const mockQuizzes: Quiz[] = [
        {
          _id: '1',
          title: '자유형 기초 퀴즈',
          description: '자유형의 기본기를 테스트하는 퀴즈입니다.',
          category: '자유형',
          type: 'multiple',
          questions: [],
          timeLimit: 30,
          passingScore: 70,
          isActive: true,
          createdAt: new Date()
        },
        {
          _id: '2',
          title: '호흡법 퀴즈',
          description: '수영 호흡법에 대한 이해도를 확인합니다.',
          category: '호흡법',
          type: 'multiple',
          questions: [],
          timeLimit: 20,
          passingScore: 80,
          isActive: true,
          createdAt: new Date()
        }
      ];

      const mockAttempts: QuizAttempt[] = [
        {
          _id: '1',
          quiz: mockQuizzes[0],
          user: { name: '김학생' },
          percentage: 85,
          totalScore: 17,
          maxPossibleScore: 20,
          passed: true,
          timeSpent: 1200,
          completedAt: new Date()
        }
      ];

      setQuizzes(mockQuizzes);
      setQuizAttempts(mockAttempts);
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'multiple': return '객관식';
      case 'essay': return '주관식';
      case 'mixed': return '혼합형';
      default: return type;
    }
  };

  const getPassColor = (passed: boolean) => {
    return passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const categories = ['자유형', '호흡법', '평영', '배영'];
  const types = ['multiple', 'essay', 'mixed'];

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quiz.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || quiz.category === selectedCategory;
    const matchesType = !selectedType || quiz.type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const filteredAttempts = quizAttempts.filter(attempt => {
    const matchesSearch = attempt.quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         attempt.user.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || attempt.quiz.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="container mx-auto p-6">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">로딩 중...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">📝 퀴즈 관리</h1>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
          <button
            onClick={() => setActiveTab('quizzes')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'quizzes'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📚 퀴즈 관리
          </button>
          <button
            onClick={() => setActiveTab('attempts')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'attempts'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📊 퀴즈 기록
          </button>
        </div>

        {/* 검색 및 필터 */}
        <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              placeholder={activeTab === 'quizzes' ? "🔍 퀴즈 검색..." : "🔍 기록 검색..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">전체 카테고리</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            {activeTab === 'quizzes' && (
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">전체 유형</option>
                {types.map(type => (
                  <option key={type} value={type}>
                    {getTypeText(type)}
                  </option>
                ))}
              </select>
            )}
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
                setSelectedType('');
              }}
              className="border border-gray-300 rounded-md px-4 py-2 hover:bg-gray-50 transition-colors"
            >
              🔄 초기화
            </button>
          </div>
        </div>

        {/* 퀴즈 관리 탭 */}
        {activeTab === 'quizzes' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuizzes.map((quiz) => (
              <div key={quiz._id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {quiz.title}
                  </h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    quiz.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {quiz.isActive ? '활성' : '비활성'}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4">{quiz.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                    {quiz.category}
                  </span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                    {getTypeText(quiz.type)}
                  </span>
                  <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">
                    {quiz.timeLimit}분
                  </span>
                </div>
                
                <div className="text-sm text-gray-500 mb-4">
                  합격 점수: {quiz.passingScore}점
                </div>
                
                <div className="flex space-x-2">
                  <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                    수정
                  </button>
                  <button className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors font-semibold">
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 퀴즈 기록 탭 */}
        {activeTab === 'attempts' && (
          <div className="space-y-4">
            {filteredAttempts.map((attempt) => (
              <div key={attempt._id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {attempt.quiz.title}
                    </h3>
                    <div className="flex gap-2 mb-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {attempt.quiz.category}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${getPassColor(attempt.passed)}`}>
                        {attempt.passed ? '통과' : '미통과'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      {attempt.percentage}%
                    </div>
                    <div className="text-sm text-gray-500">
                      {attempt.totalScore}/{attempt.maxPossibleScore}점
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-sm text-gray-500">소요시간</div>
                    <div className="font-semibold">{Math.round(attempt.timeSpent / 60)}분</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-500">완료일</div>
                    <div className="font-semibold">
                      {new Date(attempt.completedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-500">응시자</div>
                    <div className="font-semibold">{attempt.user.name}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 빈 상태 메시지 */}
        {((activeTab === 'quizzes' && filteredQuizzes.length === 0) || 
          (activeTab === 'attempts' && filteredAttempts.length === 0)) && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">
              {activeTab === 'quizzes' 
                ? (quizzes.length === 0 ? '등록된 퀴즈가 없습니다.' : '검색 결과가 없습니다.')
                : (quizAttempts.length === 0 ? '퀴즈 시도 기록이 없습니다.' : '검색 결과가 없습니다.')
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default withAuth(QuizPage, { requireTypes: ['superAdmin'], requirePermission: null });


