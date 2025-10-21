'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import StatCard from '@/components/StatCard';
import Button from '@/components/Button';

interface Quiz {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  level?: string;
  questions: Array<any>; // ✅ 항상 배열
  questionsCount?: number; // ✅ 표시용 개수
  timeLimit: number;
  isActive: boolean;
  isPublicDemo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function QuizManagementPage() {
  const { user, loading } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'demo'>('all');
  
  // 생성/수정 모달 상태
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '수영 이론',
    difficulty: 'beginner',
    type: 'practice',
    timeLimit: 30,
    isActive: true,
    isPublicDemo: false,
    questions: [] as any[]
  });

  // 문제 추가/편집 상태
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number>(-1);
  const [questionForm, setQuestionForm] = useState<{
    type: string;
    question: string;
    options: string[];
    correctAnswer: number | string;
    explanation: string;
    points: number;
  }>({
    type: 'multiple-choice',
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
    points: 10
  });

  useEffect(() => {
    if (user && (user.userType === 'superAdmin' || user.userType === 'centerAdmin')) {
      loadQuizzes();
    }
  }, [user]);

  // 필터링 로직
  useEffect(() => {
    let filtered = quizzes;
    
    if (filterStatus === 'active') {
      filtered = quizzes.filter(q => q.isActive);
    } else if (filterStatus === 'demo') {
      filtered = quizzes.filter(q => q.isPublicDemo);
    }
    
    setFilteredQuizzes(filtered);
  }, [quizzes, filterStatus]);

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
            questions: quiz.questions || [], // ✅ 실제 문제 배열 저장
            questionsCount: quiz.questions?.length || 0, // ✅ 개수는 별도 필드
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

  // 수정 시작 (DB에서 전체 데이터 다시 불러오기)
  const startEdit = async (quiz: Quiz) => {
    try {
      // DB에서 전체 퀴즈 정보 다시 불러오기 (questions 배열 포함)
      const response = await fetch(`http://localhost:5000/api/quiz/${quiz.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          const fullQuiz = data.data;
          setEditingQuiz(quiz);
          setFormData({
            title: fullQuiz.title,
            description: fullQuiz.description,
            category: fullQuiz.category,
            difficulty: fullQuiz.difficulty || 'beginner',
            type: fullQuiz.type || 'practice',
            timeLimit: fullQuiz.timeLimit || 30,
            isActive: fullQuiz.isActive,
            isPublicDemo: fullQuiz.isPublicDemo || false,
            questions: Array.isArray(fullQuiz.questions) ? fullQuiz.questions : []
          });
          setShowCreateModal(true);
        } else {
          alert('퀴즈 정보를 불러오는데 실패했습니다.');
        }
      } else {
        alert('퀴즈 정보를 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('퀴즈 정보 불러오기 오류:', error);
      alert('퀴즈 정보를 불러오는 중 오류가 발생했습니다.');
    }
  };

  // 폼 초기화
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '수영 이론',
      difficulty: 'beginner',
      type: 'practice',
      timeLimit: 30,
      isActive: true,
      isPublicDemo: false,
      questions: []
    });
    setEditingQuiz(null);
  };

  // 문제 폼 초기화
  const resetQuestionForm = () => {
    setQuestionForm({
      type: 'multiple-choice',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      points: 10
    });
    setEditingQuestion(null);
    setEditingQuestionIndex(-1);
  };

  // 문제 추가
  const handleAddQuestion = () => {
    // 필수 필드 검증
    if (!questionForm.question.trim()) {
      alert('문제를 입력해주세요.');
      return;
    }

    if (questionForm.type === 'multiple-choice') {
      // 4지선다: 모든 선택지 입력 확인
      if (questionForm.options.some(opt => !opt.trim())) {
        alert('모든 선택지를 입력해주세요.');
        return;
      }
    } else if (questionForm.type === 'ox') {
      // OX 퀴즈: 정답 선택 확인 (자동 설정되므로 생략 가능)
      // correctAnswer가 0 또는 1이어야 함
    } else {
      // 단답형: 정답 키워드 확인
      if (!questionForm.correctAnswer || (typeof questionForm.correctAnswer === 'string' && !questionForm.correctAnswer.trim())) {
        alert('정답 키워드를 입력해주세요.');
        return;
      }
    }

    const newQuestions = [...formData.questions, questionForm];
    setFormData({ ...formData, questions: newQuestions });
    resetQuestionForm();
    setShowQuestionModal(false);
  };

  // 문제 수정
  const handleUpdateQuestion = () => {
    // 필수 필드 검증
    if (!questionForm.question.trim()) {
      alert('문제를 입력해주세요.');
      return;
    }

    if (questionForm.type === 'multiple-choice') {
      // 4지선다: 모든 선택지 입력 확인
      if (questionForm.options.some(opt => !opt.trim())) {
        alert('모든 선택지를 입력해주세요.');
        return;
      }
    } else if (questionForm.type === 'ox') {
      // OX 퀴즈: 정답 선택 확인 (자동 설정되므로 생략 가능)
    } else {
      // 단답형: 정답 키워드 확인
      if (!questionForm.correctAnswer || (typeof questionForm.correctAnswer === 'string' && !questionForm.correctAnswer.trim())) {
        alert('정답 키워드를 입력해주세요.');
        return;
      }
    }

    const newQuestions = [...formData.questions];
    newQuestions[editingQuestionIndex] = questionForm;
    setFormData({ ...formData, questions: newQuestions });
    resetQuestionForm();
    setShowQuestionModal(false);
  };

  // 문제 삭제
  const handleDeleteQuestion = (index: number) => {
    if (!confirm('이 문제를 삭제하시겠습니까?')) return;
    const newQuestions = formData.questions.filter((_, i) => i !== index);
    setFormData({ ...formData, questions: newQuestions });
  };

  // 문제 편집 시작
  const startEditQuestion = (question: any, index: number) => {
    setEditingQuestion(question);
    setEditingQuestionIndex(index);
    setQuestionForm(question);
    setShowQuestionModal(true);
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
        <Button
          onClick={() => {
            resetForm();
            setShowCreateModal(true);
          }}
          variant="primary"
          size="lg"
        >
          ➕ 새 퀴즈 생성
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="총 퀴즈"
          value={quizzes.length}
          icon="🧠"
          color="blue"
          subtitle={filterStatus === 'all' ? '전체 보기' : '클릭하여 전체 보기'}
          onClick={() => setFilterStatus('all')}
        />
        <StatCard
          title="활성 퀴즈"
          value={quizzes.filter(q => q.isActive).length}
          icon="✅"
          color="green"
          subtitle={filterStatus === 'active' ? '필터 적용 중' : '클릭하여 필터링'}
          onClick={() => setFilterStatus(filterStatus === 'active' ? 'all' : 'active')}
        />
        <StatCard
          title="체험 공개"
          value={quizzes.filter(q => q.isPublicDemo).length}
          icon="🌍"
          color="purple"
          subtitle={filterStatus === 'demo' ? '필터 적용 중' : '클릭하여 필터링'}
          onClick={() => setFilterStatus(filterStatus === 'demo' ? 'all' : 'demo')}
        />
        <StatCard
          title="총 문제"
          value={quizzes.reduce((sum, q) => sum + (q.questionsCount || 0), 0)}
          icon="📝"
          color="orange"
          subtitle="전체 문제 수"
        />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {filterStatus !== 'all' && (
          <div className="mb-4 flex items-center justify-between bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-blue-600 font-medium">
                {filterStatus === 'active' ? '✅ 활성 퀴즈만 표시 중' : '🌍 체험 공개 퀴즈만 표시 중'}
              </span>
              <span className="text-sm text-blue-600">
                ({filteredQuizzes.length}개)
              </span>
            </div>
            <Button
              onClick={() => setFilterStatus('all')}
              variant="ghost"
              size="sm"
            >
              필터 초기화
            </Button>
          </div>
        )}
        
        {quizzes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🧠</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">퀴즈가 없습니다</h3>
            <p className="text-gray-600">API에서 퀴즈를 불러오는 중이거나 생성된 퀴즈가 없습니다.</p>
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">필터링된 퀴즈가 없습니다</h3>
            <p className="text-gray-600">선택한 조건에 맞는 퀴즈가 없습니다.</p>
            <Button
              onClick={() => setFilterStatus('all')}
              variant="primary"
              size="md"
              className="mt-4"
            >
              전체 퀴즈 보기
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredQuizzes.map((quiz) => (
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
                    <div className="font-medium">{quiz.questionsCount || quiz.questions?.length || 0}개</div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-gray-500">시간</div>
                    <div className="font-medium">{quiz.timeLimit}분</div>
                  </div>
                </div>
                
                {/* 수정/삭제 버튼 */}
                <div className="flex gap-2 pt-3 border-t" onClick={(e) => e.stopPropagation()}>
                  <Button
                    onClick={() => startEdit(quiz)}
                    variant="primary"
                    size="sm"
                    fullWidth
                  >
                    ✏️ 수정
                  </Button>
                  <Button
                    onClick={() => handleDelete(quiz.id)}
                    variant="danger"
                    size="sm"
                    fullWidth
                  >
                    🗑️ 삭제
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
        <div className="font-semibold mb-1">✅ 퀴즈 관리 시스템 - 전체 기능 완성!</div>
        <ul className="list-disc list-inside space-y-1">
          <li>✅ 퀴즈 생성 (기본 정보 + 문제 추가)</li>
          <li>✅ 문제 추가/수정/삭제 (4지선다, 단답형)</li>
          <li>✅ 퀴즈 조회 및 상세보기</li>
          <li>✅ 퀴즈 수정 및 삭제</li>
          <li>✅ 체험 모드 공개 설정</li>
          <li>✅ DB 연동 완료</li>
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
                  <div className="text-gray-900">{selectedQuiz.questionsCount || selectedQuiz.questions?.length || 0}개</div>
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

            <div className="p-6 border-t bg-gray-50 flex justify-between gap-2">
              <Button
                onClick={() => {
                  if (confirm('정말로 이 퀴즈를 삭제하시겠습니까?')) {
                    setSelectedQuiz(null);
                    handleDelete(selectedQuiz.id);
                  }
                }}
                variant="danger"
                size="md"
              >
                🗑️ 삭제
              </Button>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setSelectedQuiz(null);
                    startEdit(selectedQuiz);
                  }}
                  variant="primary"
                  size="md"
                >
                  ✏️ 수정
                </Button>
                <Button
                  onClick={() => setSelectedQuiz(null)}
                  variant="secondary"
                  size="md"
                >
                  닫기
                </Button>
              </div>
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
                    <option value="beginner">초급</option>
                    <option value="intermediate">중급</option>
                    <option value="advanced">고급</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">퀴즈 유형 *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="practice">연습</option>
                  <option value="test">시험</option>
                  <option value="survey">설문</option>
                </select>
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

              {/* 문제 목록 */}
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-gray-900">문제 목록 ({formData.questions.length}개)</h3>
                  <Button
                    onClick={() => {
                      resetQuestionForm();
                      setShowQuestionModal(true);
                    }}
                    variant="success"
                    size="sm"
                  >
                    ➕ 문제 추가
                  </Button>
                </div>

                {formData.questions.length === 0 ? (
                  <div className="text-center py-6 text-gray-500 text-sm">
                    추가된 문제가 없습니다. &quot;문제 추가&quot; 버튼을 눌러 문제를 추가하세요.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {formData.questions.map((q: any, index: number) => (
                      <div key={index} className="flex items-start justify-between p-3 bg-gray-50 rounded border">
                        <div className="flex-1">
                          <div className="font-medium text-sm text-gray-900">
                            {index + 1}. {q.question}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {q.type === 'multiple-choice' ? '4지선다' : q.type === 'ox' ? 'OX퀴즈' : '단답형'} · {q.points}점
                          </div>
                        </div>
                        <div className="flex gap-1 ml-2">
                          <button
                            type="button"
                            onClick={() => startEditQuestion(q, index)}
                            className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                          >
                            수정
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteQuestion(index)}
                            className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200"
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end gap-2">
              <Button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                variant="secondary"
                size="md"
              >
                취소
              </Button>
              <Button
                onClick={editingQuiz ? handleUpdate : handleCreate}
                variant="primary"
                size="md"
              >
                {editingQuiz ? '수정하기' : '생성하기'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 문제 추가/편집 모달 */}
      {showQuestionModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4"
          onClick={() => {
            setShowQuestionModal(false);
            resetQuestionForm();
          }}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingQuestionIndex >= 0 ? '문제 수정' : '문제 추가'}
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">문제 유형 *</label>
                <select
                  value={questionForm.type}
                  onChange={(e) => {
                    const newType = e.target.value;
                    setQuestionForm({ 
                      ...questionForm, 
                      type: newType,
                      options: newType === 'ox' ? ['O (맞다)', 'X (틀리다)'] : ['', '', '', ''],
                      correctAnswer: 0
                    });
                  }}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="multiple-choice">4지선다</option>
                  <option value="ox">OX 퀴즈</option>
                  <option value="short-answer">단답형 (비활성)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">문제 *</label>
                <textarea
                  value={questionForm.question}
                  onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="문제를 입력하세요"
                />
              </div>

              {questionForm.type === 'multiple-choice' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">선택지 (4개) *</label>
                    {questionForm.options.map((option, index) => (
                      <div key={index} className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-gray-600 w-6">{index + 1}.</span>
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...questionForm.options];
                            newOptions[index] = e.target.value;
                            setQuestionForm({ ...questionForm, options: newOptions });
                          }}
                          className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder={`선택지 ${index + 1}`}
                        />
                        <input
                          type="radio"
                          name="correctAnswer"
                          checked={questionForm.correctAnswer === index}
                          onChange={() => setQuestionForm({ ...questionForm, correctAnswer: index })}
                          className="w-5 h-5"
                        />
                        <span className="text-xs text-gray-600">정답</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : questionForm.type === 'ox' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">정답 선택 *</label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="oxAnswer"
                          checked={questionForm.correctAnswer === 0}
                          onChange={() => setQuestionForm({ ...questionForm, correctAnswer: 0 })}
                          className="w-5 h-5"
                        />
                        <span className="text-lg font-semibold text-green-600">O (맞다)</span>
                      </label>
                      <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="oxAnswer"
                          checked={questionForm.correctAnswer === 1}
                          onChange={() => setQuestionForm({ ...questionForm, correctAnswer: 1 })}
                          className="w-5 h-5"
                        />
                        <span className="text-lg font-semibold text-red-600">X (틀리다)</span>
                      </label>
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">정답 키워드 *</label>
                  <input
                    type="text"
                    value={questionForm.correctAnswer}
                    onChange={(e) => setQuestionForm({ ...questionForm, correctAnswer: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="정답 키워드를 입력하세요"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    쉼표로 구분하여 여러 정답을 입력할 수 있습니다 (예: 자유형,크롤)
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">해설 (선택)</label>
                <textarea
                  value={questionForm.explanation}
                  onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="문제 해설을 입력하세요 (학생에게 정답 후 표시됩니다)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">배점 *</label>
                <input
                  type="number"
                  value={questionForm.points}
                  onChange={(e) => setQuestionForm({ ...questionForm, points: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="1"
                />
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end gap-2">
              <Button
                onClick={() => {
                  setShowQuestionModal(false);
                  resetQuestionForm();
                }}
                variant="secondary"
                size="md"
              >
                취소
              </Button>
              <Button
                onClick={editingQuestionIndex >= 0 ? handleUpdateQuestion : handleAddQuestion}
                variant="primary"
                size="md"
              >
                {editingQuestionIndex >= 0 ? '수정하기' : '추가하기'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

