'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';

/**
 * 퀴즈 관리 페이지
 * 2025-09-13: 404 오류 해결을 위해 생성
 * 기능: 퀴즈 생성, 수정, 삭제, 관리
 */

interface Quiz {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  level?: string;
  questions: Array<{
    question: string;
    type: 'multiple-choice' | 'short-answer';
    options?: string[];
    correctAnswer: number | string | string[];
    explanation?: string;
    points: number;
  }>;
  timeLimit: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function QuizManagementPage() {
  const { user, loading } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalQuizzes, setTotalQuizzes] = useState(0);
  const itemsPerPage = 10;
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [categories, setCategories] = useState([
    { id: 'swimming', name: '수영 기술', subCategories: [
      { id: 'freestyle', name: '자유형' },
      { id: 'backstroke', name: '배영' },
      { id: 'breaststroke', name: '평영' },
      { id: 'butterfly', name: '접영' }
    ]},
    { id: 'safety', name: '수중 안전', subCategories: [
      { id: 'emergency', name: '응급처치' },
      { id: 'rescue', name: '구조 기법' },
      { id: 'management', name: '안전 관리' }
    ]},
    { id: 'certification', name: '자격증', subCategories: [
      { id: 'health-exercise', name: '건강운동관리사', subCategories: [
        { id: 'anatomy', name: '해부학' },
        { id: 'physiology', name: '생리학' },
        { id: 'exercise-prescription', name: '운동처방론' },
        { id: 'training', name: '트레이닝론' },
        { id: 'sports-psychology', name: '스포츠심리학' }
      ]},
      { id: 'lifeguard', name: '수상안전요원' },
      { id: 'survival-swimming', name: '생존수영지도사' }
    ]},
    { id: 'theory', name: '이론' },
    { id: 'custom', name: '커스텀' }
  ]);
  
  // 새 퀴즈 폼 데이터
  const [newQuiz, setNewQuiz] = useState({
    title: '',
    description: '',
    category: 'freestyle',
    customCategory: '', // 커스텀 카테고리
    level: 'beginner',
    timeLimit: 30,
    questions: [] as Array<{
      question: string;
      type: 'multiple-choice' | 'short-answer';
      options: string[];
      correctAnswer: number | string | string[];
      explanation?: string;
      points: number;
    }>
  });

  // 실제 API에서 퀴즈 데이터 로드
  const loadQuizzes = async (page: number = currentPage) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/quiz?page=${page}&limit=${itemsPerPage}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
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
            createdAt: quiz.createdAt,
            updatedAt: quiz.updatedAt
          }));
          setQuizzes(apiQuizzes);
          setCurrentPage(data.page || 1);
          setTotalPages(data.totalPages || 1);
          setTotalQuizzes(data.total || apiQuizzes.length);
          console.log(`✅ 퀴즈 데이터 로드 완료: ${apiQuizzes.length}개 (페이지 ${data.page || 1}/${data.totalPages || 1})`);
        } else {
          console.warn('⚠️ 퀴즈 데이터 로드 실패, 기본 데이터 사용');
          setQuizzes([]);
        }
      } else {
        console.warn('⚠️ 퀴즈 API 응답 오류, 기본 데이터 사용');
        setQuizzes([]);
      }
    } catch (error) {
      console.error('❌ 퀴즈 데이터 로드 오류:', error);
      setQuizzes([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 퀴즈 저장
  const saveQuiz = async () => {
    try {
      setIsCreating(true);
      
      // 기본 유효성 검사
      if (!newQuiz.title.trim()) {
        alert('퀴즈 제목을 입력해주세요.');
        return;
      }
      
      if (!newQuiz.description.trim()) {
        alert('퀴즈 설명을 입력해주세요.');
        return;
      }
      
      if (newQuiz.category === 'custom' && !newQuiz.customCategory.trim()) {
        alert('커스텀 카테고리를 입력해주세요.');
        return;
      }
      
      // 문제가 없어도 저장 가능 (나중에 문제 추가 가능)
      if (newQuiz.questions.length === 0) {
        if (!confirm('문제가 없는 퀴즈를 저장하시겠습니까? 나중에 문제를 추가할 수 있습니다.')) {
          return;
        }
      }
      
      // 문제별 유효성 검사
      for (let i = 0; i < newQuiz.questions.length; i++) {
        const q = newQuiz.questions[i];
        if (!q.question.trim()) {
          alert(`문제 ${i + 1}의 내용을 입력해주세요.`);
          return;
        }
        
        if (q.type === 'multiple-choice') {
          if (q.options.some(opt => !opt.trim())) {
            alert(`문제 ${i + 1}의 모든 선택지를 입력해주세요.`);
            return;
          }
        } else if (q.type === 'short-answer') {
          if (!q.correctAnswer || (Array.isArray(q.correctAnswer) && q.correctAnswer.length === 0)) {
            alert(`문제 ${i + 1}의 정답 키워드를 입력해주세요.`);
            return;
          }
        }
      }
      
      // API 호출 - 서버가 기대하는 형식으로 데이터 변환
      const response = await fetch('http://localhost:5000/api/quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          title: newQuiz.title,
          description: newQuiz.description,
          category: newQuiz.category === 'custom' ? newQuiz.customCategory : newQuiz.category,
          difficulty: newQuiz.level, // 서버는 'difficulty' 필드를 기대함
          type: newQuiz.questions.length > 0 ? newQuiz.questions[0].type : 'multiple-choice', // 첫 번째 문제의 타입
          timeLimit: newQuiz.timeLimit,
          passingScore: 70, // 기본 합격 점수
          maxAttempts: 3, // 기본 최대 시도 횟수
          questions: newQuiz.questions.map(q => ({
            question: q.question,
            type: q.type,
            options: q.type === 'multiple-choice' ? q.options : undefined,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation || '',
            points: q.points
          })),
          tags: [
            newQuiz.category === 'custom' ? newQuiz.customCategory : newQuiz.category, 
            newQuiz.level,
            ...newQuiz.questions.map(q => q.type) // 문제 타입도 태그로 추가
          ], 
          isActive: true
        })
      });
      
      if (response.ok) {
        alert('퀴즈가 성공적으로 생성되었습니다!');
        setShowCreateModal(false);
        resetNewQuizForm();
        await loadQuizzes(); // 목록 새로고침
      } else {
        const errorData = await response.json();
        alert(`퀴즈 생성 실패: ${errorData.message || '알 수 없는 오류'}`);
      }
      
    } catch (error) {
      console.error('퀴즈 생성 오류:', error);
      alert('퀴즈 생성 중 오류가 발생했습니다.');
    } finally {
      setIsCreating(false);
    }
  };
  
  // 폼 초기화
  const resetNewQuizForm = () => {
    setNewQuiz({
      title: '',
      description: '',
      category: 'freestyle',
      customCategory: '',
      level: 'beginner',
      timeLimit: 30,
      questions: []
    });
  };
  
  // 문제 추가
  const addQuestion = (type: 'multiple-choice' | 'short-answer' = 'multiple-choice') => {
    const newQuestion = {
      question: '',
      type,
      options: type === 'multiple-choice' ? ['', '', '', ''] : [],
      correctAnswer: type === 'multiple-choice' ? 0 : '',
      explanation: '',
      points: 1
    };
    
    setNewQuiz(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };
  
  // 문제 삭제
  const removeQuestion = (index: number) => {
    setNewQuiz(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };
  
  // 문제 업데이트
  const updateQuestion = (index: number, field: string, value: any) => {
    setNewQuiz(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === index ? { ...q, [field]: value } : q
      )
    }));
  };
  
  // 선택지 업데이트
  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    setNewQuiz(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === questionIndex 
          ? { ...q, options: q.options.map((opt, j) => j === optionIndex ? value : opt) }
          : q
      )
    }));
  };

  // 퀴즈 편집 시작
  const startEditQuiz = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    // 기존 퀴즈 데이터를 편집 폼에 로드
    setNewQuiz({
      title: quiz.title,
      description: quiz.description,
      category: quiz.category,
      customCategory: '',
      level: quiz.difficulty,
      timeLimit: quiz.timeLimit || 30,
      questions: Array.isArray(quiz.questions) ? quiz.questions.map(q => ({
        question: q.question,
        type: q.type as 'multiple-choice' | 'short-answer',
        options: q.options || [],
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || '',
        points: q.points
      })) : []
    });
    setShowEditModal(true);
  };

  // 퀴즈 업데이트
  const updateQuiz = async () => {
    if (!editingQuiz) return;
    
    try {
      setIsUpdating(true);
      
      // 유효성 검사
      if (!newQuiz.title.trim()) {
        alert('퀴즈 제목을 입력해주세요.');
        return;
      }
      
      if (!newQuiz.description.trim()) {
        alert('퀴즈 설명을 입력해주세요.');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/quiz/${editingQuiz.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          title: newQuiz.title,
          description: newQuiz.description,
          category: newQuiz.category === 'custom' ? newQuiz.customCategory : newQuiz.category,
          difficulty: newQuiz.level,
          type: newQuiz.questions.length > 0 ? newQuiz.questions[0].type : 'multiple-choice',
          timeLimit: newQuiz.timeLimit,
          questions: newQuiz.questions.map(q => ({
            question: q.question,
            type: q.type,
            options: q.type === 'multiple-choice' ? q.options : undefined,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation || '',
            points: q.points
          }))
        })
      });

      if (response.ok) {
        alert('퀴즈가 성공적으로 수정되었습니다!');
        setShowEditModal(false);
        setEditingQuiz(null);
        resetNewQuizForm();
        await loadQuizzes();
      } else {
        const errorData = await response.json();
        alert(`퀴즈 수정 실패: ${errorData.message || '알 수 없는 오류'}`);
      }
      
    } catch (error) {
      console.error('퀴즈 수정 오류:', error);
      alert('퀴즈 수정 중 오류가 발생했습니다.');
    } finally {
      setIsUpdating(false);
    }
  };

  // 퀴즈 삭제
  const deleteQuiz = async (quiz: Quiz) => {
    if (!confirm(`"${quiz.title}" 퀴즈를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
      return;
    }

    try {
      setIsDeleting(true);
      
      const response = await fetch(`http://localhost:5000/api/quiz/${quiz.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        alert('퀴즈가 성공적으로 삭제되었습니다.');
        await loadQuizzes();
      } else {
        const errorData = await response.json();
        alert(`퀴즈 삭제 실패: ${errorData.message || '알 수 없는 오류'}`);
      }
      
    } catch (error) {
      console.error('퀴즈 삭제 오류:', error);
      alert('퀴즈 삭제 중 오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    if (user && (user.userType === 'superAdmin' || user.userType === 'centerAdmin')) {
      loadQuizzes();
    }
  }, [user]);

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">퀴즈 관리</h1>
        <p className="text-gray-600">퀴즈를 생성하고 관리합니다</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">총 퀴즈</p>
              <p className="text-2xl font-bold text-gray-900">{quizzes.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">활성 퀴즈</p>
              <p className="text-2xl font-bold text-gray-900">{quizzes.filter(q => q.isActive).length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">총 문제</p>
              <p className="text-2xl font-bold text-gray-900">{quizzes.reduce((sum, q) => sum + (Array.isArray(q.questions) ? q.questions.length : q.questions), 0)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">카테고리</p>
              <p className="text-2xl font-bold text-gray-900">{new Set(quizzes.map(q => q.category)).size}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 퀴즈 목록 */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">퀴즈 목록</h2>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            ✨ 새 퀴즈 생성
          </button>
        </div>
        
        {quizzes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🧠</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">퀴즈가 없습니다</h3>
            <p className="text-gray-600 mb-6">새로운 퀴즈를 생성해보세요!</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              ✨ 첫 번째 퀴즈 만들기
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quizzes.map((quiz) => (
            <div key={quiz.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200">
              {/* 카드 헤더 */}
              <div className="p-6 pb-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                      <span className="text-white text-lg">🧠</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                        {quiz.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                      {quiz.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      quiz.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {quiz.isActive ? '✅ 활성' : '❌ 비활성'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 카드 정보 */}
              <div className="px-6 pb-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">카테고리</div>
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {quiz.category}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">난이도</div>
                    <div className={`text-sm font-medium ${
                      quiz.level === 'beginner' 
                        ? 'text-green-600' 
                        : quiz.level === 'intermediate'
                        ? 'text-yellow-600'
                        : 'text-red-600'
                    }`}>
                      {quiz.level === 'beginner' ? '🟢 초급' : quiz.level === 'intermediate' ? '🟡 중급' : '🔴 고급'}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">문제 수</div>
                    <div className="text-sm font-medium text-gray-900">
                      {Array.isArray(quiz.questions) ? quiz.questions.length : quiz.questions}개
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">시간 제한</div>
                    <div className="text-sm font-medium text-gray-900">
                      {quiz.timeLimit}분
                    </div>
                  </div>
                </div>
              </div>

              {/* 카드 액션 */}
              <div className="px-6 pb-6">
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setSelectedQuiz(quiz);
                      setShowDetailModal(true);
                    }}
                    className="flex-1 bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                  >
                    👁️ 상세보기
                    </button>
                  <button 
                    onClick={() => startEditQuiz(quiz)}
                    disabled={isDeleting}
                    className="flex-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                  >
                    ✏️ 편집
                    </button>
                  <button 
                    onClick={() => deleteQuiz(quiz)}
                    disabled={isDeleting}
                    className="bg-red-50 text-red-700 hover:bg-red-100 px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center"
                    title="삭제"
                  >
                    🗑️
                    </button>
                </div>
              </div>

              {/* 카드 푸터 (생성일) */}
              <div className="px-6 py-3 bg-gray-50 rounded-b-xl">
                <div className="text-xs text-gray-500 text-center">
                  생성일: {new Date(quiz.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
          </div>
        )}
        
        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              총 {totalQuizzes}개 퀴즈 중 {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalQuizzes)}개 표시
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (currentPage > 1) {
                    setCurrentPage(prev => prev - 1);
                    loadQuizzes(currentPage - 1);
                  }
                }}
                disabled={currentPage <= 1 || isLoading}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  currentPage <= 1 || isLoading
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                ← 이전
              </button>
              
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => {
                      setCurrentPage(page);
                      loadQuizzes(page);
                    }}
                    disabled={isLoading}
                    className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                      page === currentPage
                        ? 'bg-blue-600 text-white'
                        : isLoading
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => {
                  if (currentPage < totalPages) {
                    setCurrentPage(prev => prev + 1);
                    loadQuizzes(currentPage + 1);
                  }
                }}
                disabled={currentPage >= totalPages || isLoading}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  currentPage >= totalPages || isLoading
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                다음 →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 퀴즈 생성 모달 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
              <h3 className="text-xl font-bold text-gray-900">✨ 새 퀴즈 생성</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* 기본 정보 */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-4">📋 기본 정보</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-blue-800 mb-2">
                        퀴즈 제목 *
                      </label>
                      <input
                        type="text"
                        value={newQuiz.title}
                        onChange={(e) => setNewQuiz(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="예: 자유형 기본 호흡법 퀴즈"
                        className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-blue-800 mb-2">
                        퀴즈 설명 *
                      </label>
                      <textarea
                        value={newQuiz.description}
                        onChange={(e) => setNewQuiz(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="퀴즈에 대한 자세한 설명을 입력해주세요..."
                        rows={3}
                        className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-blue-800 mb-2">
                          카테고리
                        </label>
                        <select
                          value={newQuiz.category}
                          onChange={(e) => {
                            setNewQuiz(prev => ({ 
                              ...prev, 
                              category: e.target.value,
                              customCategory: e.target.value === 'custom' ? prev.customCategory : ''
                            }));
                          }}
                          className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="freestyle">🏊‍♂️ 자유형</option>
                          <option value="backstroke">🏊‍♀️ 배영</option>
                          <option value="breaststroke">🏊 평영</option>
                          <option value="butterfly">🦋 접영</option>
                          <option value="safety">🚨 안전</option>
                          <option value="theory">📚 이론</option>
                          <option value="custom">✨ 직접 입력</option>
                        </select>
                        
                        {newQuiz.category === 'custom' && (
                          <div className="mt-2">
                            <input
                              type="text"
                              value={newQuiz.customCategory}
                              onChange={(e) => setNewQuiz(prev => ({ ...prev, customCategory: e.target.value }))}
                              placeholder="예: 수중 안전, 경영 기법, 재활 수영 등"
                              className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <p className="text-xs text-blue-600 mt-1">
                              💡 새로운 카테고리를 직접 입력해주세요
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-blue-800 mb-2">
                          난이도
                        </label>
                        <select
                          value={newQuiz.level}
                          onChange={(e) => setNewQuiz(prev => ({ ...prev, level: e.target.value }))}
                          className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="beginner">🟢 초급</option>
                          <option value="intermediate">🟡 중급</option>
                          <option value="advanced">🔴 고급</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-blue-800 mb-2">
                          시간 제한 (분)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="120"
                          value={newQuiz.timeLimit}
                          onChange={(e) => setNewQuiz(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || 30 }))}
                          className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 문제 관리 */}
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-green-900">❓ 문제 관리</h4>
                    <div className="flex gap-2">
                      <button
                        onClick={() => addQuestion('multiple-choice')}
                        className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm transition-colors"
                      >
                        🔲 객관식 추가
                      </button>
                      <button
                        onClick={() => addQuestion('short-answer')}
                        className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm transition-colors"
                      >
                        ✏️ 단답형 추가
                      </button>
                    </div>
                  </div>
                  
                  {newQuiz.questions.length === 0 ? (
                    <div className="text-center py-8 text-green-600">
                      <div className="text-2xl mb-2">📝</div>
                      <p>아직 문제가 없습니다. "문제 추가" 버튼을 클릭해주세요.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {newQuiz.questions.map((question, qIndex) => (
                        <div key={qIndex} className="bg-white rounded-lg p-4 border border-green-200">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <h5 className="font-medium text-green-800">문제 {qIndex + 1}</h5>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                question.type === 'multiple-choice' 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-blue-100 text-blue-700'
                              }`}>
                                {question.type === 'multiple-choice' ? '🔲 객관식' : '✏️ 단답형'}
                              </span>
                            </div>
                            <button
                              onClick={() => removeQuestion(qIndex)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              🗑️ 삭제
                            </button>
                          </div>
                          
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                문제 *
                              </label>
                              <textarea
                                value={question.question}
                                onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                                placeholder="문제를 입력해주세요..."
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                              />
                            </div>
                            
                            {/* 문제 유형별 답안 입력 */}
                            {question.type === 'multiple-choice' && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  선택지 *
                                </label>
                                <div className="space-y-2">
                                  {question.options.map((option, oIndex) => (
                                    <div key={oIndex} className="flex items-center gap-2">
                                      <input
                                        type="radio"
                                        name={`correct-${qIndex}`}
                                        checked={question.correctAnswer === oIndex}
                                        onChange={() => updateQuestion(qIndex, 'correctAnswer', oIndex)}
                                        className="text-green-600"
                                      />
                                      <span className="text-sm font-medium text-gray-600 w-6">
                                        {String.fromCharCode(65 + oIndex)}.
                                      </span>
                                      <input
                                        type="text"
                                        value={option}
                                        onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                        placeholder={`선택지 ${String.fromCharCode(65 + oIndex)}`}
                                        className="flex-1 px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                                      />
                                    </div>
                                  ))}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                  ✅ 정답에 해당하는 라디오 버튼을 선택해주세요
                                </p>
                              </div>
                            )}
                            
                            {question.type === 'short-answer' && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  정답 키워드 * (여러 개 가능)
                                </label>
                                <textarea
                                  value={Array.isArray(question.correctAnswer) ? question.correctAnswer.join(', ') : question.correctAnswer}
                                  onChange={(e) => {
                                    const keywords = e.target.value.split(',').map(k => k.trim()).filter(k => k);
                                    updateQuestion(qIndex, 'correctAnswer', keywords);
                                  }}
                                  placeholder="예: 호흡, 숨쉬기, 브리딩 (쉼표로 구분)"
                                  rows={2}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  💡 여러 정답이 가능한 경우 쉼표(,)로 구분해서 입력하세요
                                </p>
                              </div>
                            )}
                            
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                해설 (선택사항)
                              </label>
                              <textarea
                                value={question.explanation || ''}
                                onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)}
                                placeholder="정답에 대한 해설을 입력해주세요..."
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 요약 정보 */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">📊 퀴즈 요약</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">문제 수:</span>
                      <span className="ml-1 font-medium">{newQuiz.questions.length}개</span>
                    </div>
                    <div>
                      <span className="text-gray-600">완성된 문제:</span>
                      <span className="ml-1 font-medium">
                        {newQuiz.questions.filter(q => q.question.trim() && q.options.every(opt => opt.trim())).length}개
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">예상 소요시간:</span>
                      <span className="ml-1 font-medium">{newQuiz.timeLimit}분</span>
                    </div>
                    <div>
                      <span className="text-gray-600">카테고리:</span>
                      <span className="ml-1 font-medium">{newQuiz.category}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex-shrink-0 p-6 border-t bg-gray-50">
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetNewQuizForm();
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  disabled={isCreating}
                >
                  ❌ 취소
                </button>
                <button
                  onClick={saveQuiz}
                  disabled={isCreating || !newQuiz.title.trim() || !newQuiz.description.trim()}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isCreating || !newQuiz.title.trim() || !newQuiz.description.trim()
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isCreating ? '💾 저장중...' : '💾 퀴즈 저장'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 퀴즈 상세보기 모달 */}
      {showDetailModal && selectedQuiz && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
              <h3 className="text-xl font-bold text-gray-900">👁️ "{selectedQuiz.title}" 상세 정보</h3>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedQuiz(null);
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
      </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">📋 기본 정보</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-blue-800">제목:</span>
                      <p className="text-blue-700">{selectedQuiz.title}</p>
                    </div>
                    <div>
                      <span className="font-medium text-blue-800">카테고리:</span>
                      <p className="text-blue-700">{selectedQuiz.category}</p>
                    </div>
                    <div>
                      <span className="font-medium text-blue-800">난이도:</span>
                      <p className="text-blue-700">{selectedQuiz.level}</p>
                    </div>
                    <div>
                      <span className="font-medium text-blue-800">문제 수:</span>
                      <p className="text-blue-700">{Array.isArray(selectedQuiz.questions) ? selectedQuiz.questions.length : selectedQuiz.questions}개</p>
                    </div>
                    <div>
                      <span className="font-medium text-blue-800">시간 제한:</span>
                      <p className="text-blue-700">{selectedQuiz.timeLimit || '제한 없음'}분</p>
                    </div>
                    <div>
                      <span className="font-medium text-blue-800">상태:</span>
                      <p className="text-blue-700">{selectedQuiz.isActive ? '✅ 활성' : '❌ 비활성'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">📝 설명</h4>
                  <p className="text-gray-700 bg-gray-50 rounded p-3">{selectedQuiz.description}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">📅 생성 정보</h4>
                  <div className="bg-gray-50 rounded p-3 text-sm text-gray-600">
                    <p>생성일: {new Date(selectedQuiz.createdAt).toLocaleString()}</p>
                    <p>수정일: {new Date(selectedQuiz.updatedAt).toLocaleString()}</p>
                  </div>
                </div>

                {(Array.isArray(selectedQuiz.questions) ? selectedQuiz.questions.length : selectedQuiz.questions) > 0 ? (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">❓ 문제 정보</h4>
                    <div className="bg-green-50 rounded p-3">
                      <p className="text-green-700">이 퀴즈에는 {Array.isArray(selectedQuiz.questions) ? selectedQuiz.questions.length : selectedQuiz.questions}개의 문제가 있습니다.</p>
                      <p className="text-sm text-green-600 mt-1">
                        상세한 문제 내용은 퀴즈 편집 모드에서 확인할 수 있습니다.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">⚠️ 문제 정보</h4>
                    <div className="bg-yellow-50 rounded p-3">
                      <p className="text-yellow-700">이 퀴즈에는 아직 문제가 등록되지 않았습니다.</p>
                      <p className="text-sm text-yellow-600 mt-1">
                        편집 모드에서 문제를 추가해주세요.
        </p>
      </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex-shrink-0 p-6 border-t bg-gray-50">
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedQuiz(null);
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  ❌ 닫기
                </button>
                <button
                  onClick={() => {
                    if (selectedQuiz) {
                      setShowDetailModal(false);
                      setSelectedQuiz(null);
                      startEditQuiz(selectedQuiz);
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  ✏️ 편집하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 퀴즈 편집 모달 */}
      {showEditModal && editingQuiz && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
              <h3 className="text-xl font-bold text-gray-900">✏️ "{editingQuiz.title}" 편집</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingQuiz(null);
                  resetNewQuizForm();
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* 기본 정보 */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-4">📋 기본 정보</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-blue-800 mb-2">
                        퀴즈 제목 *
                      </label>
                      <input
                        type="text"
                        value={newQuiz.title}
                        onChange={(e) => setNewQuiz(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-blue-800 mb-2">
                        퀴즈 설명 *
                      </label>
                      <textarea
                        value={newQuiz.description}
                        onChange={(e) => setNewQuiz(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                        className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-blue-800 mb-2">
                          카테고리
                        </label>
                        <input
                          type="text"
                          value={newQuiz.category}
                          onChange={(e) => setNewQuiz(prev => ({ ...prev, category: e.target.value }))}
                          className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-blue-800 mb-2">
                          난이도
                        </label>
                        <select
                          value={newQuiz.level}
                          onChange={(e) => setNewQuiz(prev => ({ ...prev, level: e.target.value }))}
                          className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="beginner">🟢 초급</option>
                          <option value="intermediate">🟡 중급</option>
                          <option value="advanced">🔴 고급</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-blue-800 mb-2">
                          시간 제한 (분)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="120"
                          value={newQuiz.timeLimit}
                          onChange={(e) => setNewQuiz(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || 30 }))}
                          className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 문제 관리 */}
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-green-900">❓ 문제 관리</h4>
                    <div className="flex gap-2">
                      <button
                        onClick={() => addQuestion('multiple-choice')}
                        className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm transition-colors"
                      >
                        🔲 객관식 추가
                      </button>
                      <button
                        onClick={() => addQuestion('short-answer')}
                        className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm transition-colors"
                      >
                        ✏️ 단답형 추가
                      </button>
                    </div>
                  </div>
                  
                  {newQuiz.questions.length === 0 ? (
                    <div className="text-center py-8 text-green-600">
                      <div className="text-2xl mb-2">📝</div>
                      <p>문제를 추가해주세요.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {newQuiz.questions.map((question, qIndex) => (
                        <div key={qIndex} className="bg-white rounded-lg p-4 border border-green-200">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <h5 className="font-medium text-green-800">문제 {qIndex + 1}</h5>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                question.type === 'multiple-choice' 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-blue-100 text-blue-700'
                              }`}>
                                {question.type === 'multiple-choice' ? '🔲 객관식' : '✏️ 단답형'}
                              </span>
                            </div>
                            <button
                              onClick={() => removeQuestion(qIndex)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              🗑️ 삭제
                            </button>
                          </div>
                          
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                문제 *
                              </label>
                              <textarea
                                value={question.question}
                                onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                              />
                            </div>
                            
                            {/* 문제 유형별 답안 입력 */}
                            {question.type === 'multiple-choice' && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  선택지 *
                                </label>
                                <div className="space-y-2">
                                  {question.options.map((option, oIndex) => (
                                    <div key={oIndex} className="flex items-center gap-2">
                                      <input
                                        type="radio"
                                        name={`edit-correct-${qIndex}`}
                                        checked={question.correctAnswer === oIndex}
                                        onChange={() => updateQuestion(qIndex, 'correctAnswer', oIndex)}
                                        className="text-green-600"
                                      />
                                      <span className="text-sm font-medium text-gray-600 w-6">
                                        {String.fromCharCode(65 + oIndex)}.
                                      </span>
                                      <input
                                        type="text"
                                        value={option}
                                        onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                        className="flex-1 px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {question.type === 'short-answer' && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  정답 키워드 *
                                </label>
                                <textarea
                                  value={Array.isArray(question.correctAnswer) ? question.correctAnswer.join(', ') : question.correctAnswer}
                                  onChange={(e) => {
                                    const keywords = e.target.value.split(',').map(k => k.trim()).filter(k => k);
                                    updateQuestion(qIndex, 'correctAnswer', keywords);
                                  }}
                                  rows={2}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                            )}
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                해설 (선택사항)
                              </label>
                              <textarea
                                value={question.explanation || ''}
                                onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)}
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex-shrink-0 p-6 border-t bg-gray-50">
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingQuiz(null);
                    resetNewQuizForm();
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  disabled={isUpdating}
                >
                  ❌ 취소
                </button>
                <button
                  onClick={updateQuiz}
                  disabled={isUpdating || !newQuiz.title.trim() || !newQuiz.description.trim()}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isUpdating || !newQuiz.title.trim() || !newQuiz.description.trim()
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isUpdating ? '💾 수정중...' : '💾 수정 완료'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}