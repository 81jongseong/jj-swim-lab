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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">퀴즈 관리</h1>
        <p className="text-gray-600">퀴즈를 생성하고 관리합니다</p>
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
                <div className="grid grid-cols-2 gap-2 text-xs">
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
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
        <div className="font-semibold mb-1">✅ 퀴즈 관리 시스템 복원 완료!</div>
        <ul className="list-disc list-inside space-y-1">
          <li>퀴즈 목록 표시 (DB 연동)</li>
          <li>체험 공개 상태 표시</li>
          <li>통계 대시보드</li>
          <li>카드 클릭으로 상세보기</li>
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
    </div>
  );
}

