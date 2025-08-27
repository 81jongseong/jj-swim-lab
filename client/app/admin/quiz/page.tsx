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
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingQuiz, setDeletingQuiz] = useState<Quiz | null>(null);

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

  // 퀴즈 수정 함수
  const handleEditQuiz = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    setShowEditModal(true);
  };

  // 퀴즈 삭제 확인 함수
  const handleDeleteQuiz = (quiz: Quiz) => {
    setDeletingQuiz(quiz);
    setShowDeleteConfirm(true);
  };

  // 퀴즈 삭제 실행 함수
  const confirmDeleteQuiz = async () => {
    if (!deletingQuiz) return;

    try {
      // 실제 API 호출 대신 로컬 상태에서 제거
      setQuizzes(prev => prev.filter(q => q._id !== deletingQuiz._id));
      
      // 성공 메시지 표시 (실제로는 toast 라이브러리 사용 권장)
      alert(`${deletingQuiz.title} 퀴즈가 삭제되었습니다.`);
      
      setShowDeleteConfirm(false);
      setDeletingQuiz(null);
    } catch (error) {
      console.error('퀴즈 삭제 실패:', error);
      alert('퀴즈 삭제에 실패했습니다.');
    }
  };

  // 퀴즈 수정 저장 함수
  const handleSaveQuiz = async (updatedQuiz: Quiz) => {
    try {
      // 실제 API 호출 대신 로컬 상태 업데이트
      setQuizzes(prev => prev.map(q => 
        q._id === updatedQuiz._id ? updatedQuiz : q
      ));
      
      // 성공 메시지 표시
      alert('퀴즈가 수정되었습니다.');
      
      setShowEditModal(false);
      setEditingQuiz(null);
    } catch (error) {
      console.error('퀴즈 수정 실패:', error);
      alert('퀴즈 수정에 실패했습니다.');
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
                  <button 
                    onClick={() => handleEditQuiz(quiz)}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    수정
                  </button>
                  <button 
                    onClick={() => handleDeleteQuiz(quiz)}
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors font-semibold"
                  >
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

        {/* 퀴즈 수정 모달 */}
        {showEditModal && editingQuiz && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-xl font-bold mb-4">퀴즈 수정</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
                  <input
                    type="text"
                    value={editingQuiz.title}
                    onChange={(e) => setEditingQuiz({...editingQuiz, title: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
                  <textarea
                    value={editingQuiz.description}
                    onChange={(e) => setEditingQuiz({...editingQuiz, description: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
                    <select
                      value={editingQuiz.category}
                      onChange={(e) => setEditingQuiz({...editingQuiz, category: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">유형</label>
                    <select
                      value={editingQuiz.type}
                      onChange={(e) => setEditingQuiz({...editingQuiz, type: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {types.map(type => (
                        <option key={type} value={type}>{getTypeText(type)}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">제한시간 (분)</label>
                    <input
                      type="number"
                      value={editingQuiz.timeLimit}
                      onChange={(e) => setEditingQuiz({...editingQuiz, timeLimit: parseInt(e.target.value)})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">합격 점수</label>
                    <input
                      type="number"
                      value={editingQuiz.passingScore}
                      onChange={(e) => setEditingQuiz({...editingQuiz, passingScore: parseInt(e.target.value)})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={editingQuiz.isActive}
                    onChange={(e) => setEditingQuiz({...editingQuiz, isActive: e.target.checked})}
                    className="mr-2"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700">활성화</label>
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => handleSaveQuiz(editingQuiz)}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  저장
                </button>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingQuiz(null);
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 퀴즈 삭제 확인 모달 */}
        {showDeleteConfirm && deletingQuiz && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-xl font-bold mb-4 text-red-600">⚠️ 퀴즈 삭제</h3>
              <p className="text-gray-700 mb-6">
                <strong>"{deletingQuiz.title}"</strong> 퀴즈를 정말로 삭제하시겠습니까?<br />
                이 작업은 되돌릴 수 없습니다.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={confirmDeleteQuiz}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors font-semibold"
                >
                  삭제
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeletingQuiz(null);
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default withAuth(QuizPage, { requireTypes: ['superAdmin'], requirePermission: null });


