'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';

interface Quiz {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  level?: string;
  questions: number | Array<any>;
  timeLimit: number;
  isActive: boolean;
  isPublicDemo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function QuizManagementPage() {
  const { user, loading } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  
  // 생성/수정 모달 상태
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '수영 이론',
    difficulty: '초급',
    timeLimit: 30,
    isActive: true,
    isPublicDemo: false,
    questions: [] as any[]
  });

  useEffect(() => {
    if (user && (user.userType === 'superAdmin' || user.userType === 'centerAdmin')) {
      loadQuizzes();
    }
  }, [user]);

  const loadQuizzes = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:5000/api/quiz?page=1&limit=100`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const apiQuizzes = (data.data || data.quizzes || []).map((quiz: any) => ({
            id: quiz._id,
            title: quiz.title,
            description: quiz.description,
            category: quiz.category,
            level: quiz.difficulty,
            questions: quiz.questions?.length || 0,
            timeLimit: quiz.timeLimit || 0,
            isActive: quiz.isActive,
            isPublicDemo: quiz.isPublicDemo,
            createdAt: quiz.createdAt,
            updatedAt: quiz.updatedAt
          }));
          setQuizzes(apiQuizzes);
        }
      }
    } catch (error) {
      console.error('퀴즈 로드 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 퀴즈 생성
  const handleCreate = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/quiz', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('퀴즈가 생성되었습니다!');
        setShowCreateModal(false);
        resetForm();
        loadQuizzes();
      } else {
        alert('퀴즈 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('퀴즈 생성 오류:', error);
      alert('퀴즈 생성 중 오류가 발생했습니다.');
    }
  };

  // 퀴즈 수정
  const handleUpdate = async () => {
    if (!editingQuiz) return;

    try {
      const response = await fetch(`http://localhost:5000/api/quiz/${editingQuiz.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('퀴즈가 수정되었습니다!');
        setShowCreateModal(false);
        setEditingQuiz(null);
        resetForm();
        loadQuizzes();
      } else {
        alert('퀴즈 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('퀴즈 수정 오류:', error);
      alert('퀴즈 수정 중 오류가 발생했습니다.');
    }
  };

  // 퀴즈 삭제
  const handleDelete = async (quizId: string) => {
    if (!confirm('정말로 이 퀴즈를 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/quiz/${quizId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        alert('퀴즈가 삭제되었습니다!');
        loadQuizzes();
      } else {
        alert('퀴즈 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('퀴즈 삭제 오류:', error);
      alert('퀴즈 삭제 중 오류가 발생했습니다.');
    }
  };

  // 수정 시작
  const startEdit = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    setFormData({
      title: quiz.title,
      description: quiz.description,
      category: quiz.category,
      difficulty: quiz.level || '초급',
      timeLimit: quiz.timeLimit,
      isActive: quiz.isActive,
      isPublicDemo: quiz.isPublicDemo || false,
      questions: []
    });
    setShowCreateModal(true);
  };

  // 폼 초기화
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '수영 이론',
      difficulty: '초급',
      timeLimit: 30,
      isActive: true,
      isPublicDemo: false,
      questions: []
    });
    setEditingQuiz(null);
  };

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  if (!user || (user.userType !== 'superAdmin' && user.userType !== 'centerAdmin')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">접근 권한 없음</h1>
          <p className="text-gray-600">이 페이지에 접근할 권한이 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">퀴즈 관리</h1>
          <p className="text-gray-600">퀴즈를 생성하고 관리합니다</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowCreateModal(true);
          }}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          + 새 퀴즈 생성
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600">총 퀴즈</div>
          <div className="text-2xl font-bold text-gray-900">{quizzes.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600">활성 퀴즈</div>
          <div className="text-2xl font-bold text-gray-900">{quizzes.filter(q => q.isActive).length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600">체험 공개</div>
          <div className="text-2xl font-bold text-blue-600">{quizzes.filter(q => q.isPublicDemo).length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600">총 문제</div>
          <div className="text-2xl font-bold text-gray-900">
            {quizzes.reduce((sum, q) => sum + (typeof q.questions === 'number' ? q.questions : 0), 0)}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {quizzes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🧠</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">퀴즈가 없습니다</h3>
            <p className="text-gray-600">API에서 퀴즈를 불러오는 중이거나 생성된 퀴즈가 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quizzes.map((quiz) => (
              <div 
                key={quiz.id} 
                onClick={() => setSelectedQuiz(quiz)}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900">{quiz.title}</h3>
                  <div className="flex flex-col gap-1">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      quiz.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {quiz.isActive ? '✅ 활성' : '❌ 비활성'}
                    </span>
                    {quiz.isPublicDemo && (
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                        🌍 체험 공개
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">{quiz.description}</p>
                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-gray-500">카테고리</div>
                    <div className="font-medium">{quiz.category}</div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-gray-500">난이도</div>
                    <div className="font-medium">{quiz.level}</div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-gray-500">문제 수</div>
                    <div className="font-medium">{quiz.questions}개</div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-gray-500">시간</div>
                    <div className="font-medium">{quiz.timeLimit}분</div>
                  </div>
                </div>
                
                {/* 수정/삭제 버튼 */}
                <div className="flex gap-2 pt-3 border-t" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => startEdit(quiz)}
                    className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors text-sm font-medium"
                  >
                    ✏️ 수정
                  </button>
                  <button
                    onClick={() => handleDelete(quiz.id)}
                    className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors text-sm font-medium"
                  >
                    🗑️ 삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
        <div className="font-semibold mb-1">✅ 퀴즈 관리 시스템 - 전체 CRUD 기능!</div>
        <ul className="list-disc list-inside space-y-1">
          <li>✅ 퀴즈 생성 (기본 정보)</li>
          <li>✅ 퀴즈 조회 및 목록 표시</li>
          <li>✅ 퀴즈 수정</li>
          <li>✅ 퀴즈 삭제</li>
          <li>✅ 체험 모드 공개 설정</li>
          <li>🔄 문제 추가 기능은 추후 구현 예정</li>
        </ul>
      </div>

      {/* 퀴즈 상세보기 모달 */}
      {selectedQuiz && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedQuiz(null)}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b">
              <div className="flex justify-between items-start">
                <h2 className="text-2xl font-bold text-gray-900">{selectedQuiz.title}</h2>
                <button
                  onClick={() => setSelectedQuiz(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">설명</div>
                <p className="text-gray-900">{selectedQuiz.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm font-medium text-gray-500 mb-1">카테고리</div>
                  <div className="text-gray-900">{selectedQuiz.category}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm font-medium text-gray-500 mb-1">난이도</div>
                  <div className="text-gray-900">{selectedQuiz.level}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm font-medium text-gray-500 mb-1">문제 수</div>
                  <div className="text-gray-900">{selectedQuiz.questions}개</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm font-medium text-gray-500 mb-1">시간 제한</div>
                  <div className="text-gray-900">{selectedQuiz.timeLimit}분</div>
                </div>
              </div>

              <div className="flex gap-2">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  selectedQuiz.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {selectedQuiz.isActive ? '✅ 활성' : '❌ 비활성'}
                </div>
                {selectedQuiz.isPublicDemo && (
                  <div className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    🌍 체험 모드 공개
                  </div>
                )}
              </div>

              <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600">
                <div>생성일: {new Date(selectedQuiz.createdAt).toLocaleString('ko-KR')}</div>
                <div>수정일: {new Date(selectedQuiz.updatedAt).toLocaleString('ko-KR')}</div>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end gap-2">
              <button
                onClick={() => setSelectedQuiz(null)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 생성/수정 모달 */}
      {showCreateModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowCreateModal(false);
            resetForm();
          }}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingQuiz ? '퀴즈 수정' : '새 퀴즈 생성'}
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">제목 *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="퀴즈 제목을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">설명 *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="퀴즈 설명을 입력하세요"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">카테고리 *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="수영 이론">수영 이론</option>
                    <option value="수영 기술">수영 기술</option>
                    <option value="안전 수칙">안전 수칙</option>
                    <option value="건강 관리">건강 관리</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">난이도 *</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="초급">초급</option>
                    <option value="중급">중급</option>
                    <option value="고급">고급</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">시간 제한 (분) *</label>
                <input
                  type="number"
                  value={formData.timeLimit}
                  onChange={(e) => setFormData({ ...formData, timeLimit: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="1"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">활성화</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPublicDemo}
                    onChange={(e) => setFormData({ ...formData, isPublicDemo: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">🌍 체험 모드 공개</span>
                </label>
              </div>

              <div className="bg-yellow-50 p-3 rounded-lg text-sm text-yellow-800">
                ℹ️ 문제 추가 기능은 추후 구현 예정입니다. 현재는 기본 정보만 저장됩니다.
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                취소
              </button>
              <button
                onClick={editingQuiz ? handleUpdate : handleCreate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingQuiz ? '수정하기' : '생성하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

