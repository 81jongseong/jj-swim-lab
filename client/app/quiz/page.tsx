'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';

/**
 * 🧠 퀴즈 페이지
 * 
 * 📋 **기능**
 * - 수영 관련 퀴즈 풀기
 * - 퀴즈 결과 및 점수 확인
 * - 학습 진도 관리
 * 
 * 🔄 **주요 기능**
 * 1. 퀴즈 목록 조회
 * 2. 퀴즈 풀기
 * 3. 결과 확인
 * 4. 진도 관리
 * 
 * 📅 **수정 히스토리**
 * - 2025-01-13: 퀴즈 페이지 생성
 */

interface Quiz {
  _id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  questions: Question[];
  timeLimit: number; // 분
  isActive: boolean;
}

interface Question {
  _id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface QuizAttempt {
  _id: string;
  quizId: string;
  userId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  completedAt: string;
}

export default function QuizPage() {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [result, setResult] = useState<QuizAttempt | null>(null);
  const [loading, setLoading] = useState(false); // 초기 로딩 비활성화
  const [useRandomMode, setUseRandomMode] = useState(false); // 🎲 랜덤 모드 선택

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      
      // 지연 로딩 (200ms 후)
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // 실제 API에서 공개된 퀴즈만 가져오기
      try {
        const token = localStorage.getItem('token');
        const headers: HeadersInit = {
          'Content-Type': 'application/json'
        };
        
        // 토큰이 있으면 Authorization 헤더 추가
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch('http://localhost:5000/api/quiz?isPublicDemo=true', {
          headers
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && Array.isArray(data.data)) {
            const publicQuizzes = data.data.filter((quiz: any) => quiz.isPublicDemo && quiz.isActive);
            setQuizzes(publicQuizzes.map((quiz: any) => ({
              _id: quiz._id,
              title: quiz.title,
              description: quiz.description,
              difficulty: quiz.difficulty,
              category: quiz.category,
              timeLimit: quiz.timeLimit,
              isActive: quiz.isActive,
              questions: quiz.questions || []
            })));
            return;
          }
        } else if (response.status === 401) {
          console.warn('인증 실패, 임시 데이터 사용');
        }
      } catch (apiError) {
        console.warn('API 호출 실패, 임시 데이터 사용:', apiError);
      }
      
      // API 실패 시 임시 데이터 사용
      const mockQuizzes: Quiz[] = [
        {
          _id: '1',
          title: '수영 기본기 퀴즈',
          description: '수영의 기본 동작과 자세에 대한 퀴즈입니다.',
          difficulty: 'easy',
          category: 'basic',
          timeLimit: 10,
          isActive: true,
          questions: [
            {
              _id: 'q1',
              question: '수영에서 가장 기본이 되는 영법은?',
              options: ['자유형', '배영', '평영', '접영'],
              correctAnswer: 0,
              explanation: '자유형은 가장 기본적이고 효율적인 영법입니다.'
            },
            {
              _id: 'q2',
              question: '수영 시 호흡은 언제 해야 할까요?',
              options: ['물속에서', '수면 위에서', '몸이 회전할 때', '팔을 뻗을 때'],
              correctAnswer: 2,
              explanation: '몸이 회전할 때 자연스럽게 호흡을 해야 합니다.'
            }
          ]
        },
        {
          _id: '2',
          title: '수영 안전 수칙 퀴즈',
          description: '수영장에서 지켜야 할 안전 수칙에 대한 퀴즈입니다.',
          difficulty: 'medium',
          category: 'safety',
          timeLimit: 15,
          isActive: true,
          questions: [
            {
              _id: 'q3',
              question: '수영 전에 해야 할 준비 운동은?',
              options: ['스트레칭', '달리기', '무거운 물건 들기', '고개 돌리기'],
              correctAnswer: 0,
              explanation: '스트레칭은 부상 예방과 혈액 순환에 도움이 됩니다.'
            }
          ]
        }
      ];
      
      setQuizzes(mockQuizzes);
    } catch (error) {
      console.error('퀴즈 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = (quiz: Quiz) => {
    // 🎲 랜덤 모드: 사용자가 선택한 경우에만 보기 순서 섞기
    const processedQuiz = useRandomMode ? {
      ...quiz,
      questions: quiz.questions.map((q: any) => {
        if (q.type === 'multiple-choice' || q.type === 'ox') {
          // 보기 순서 섞기
          const shuffled = [...q.options].map((opt, idx) => ({ opt, idx }));
          for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
          }
          
          // 새로운 정답 인덱스 찾기
          const newCorrectIndex = shuffled.findIndex(item => item.idx === q.correctAnswer);
          
          return {
            ...q,
            options: shuffled.map(item => item.opt),
            correctAnswer: newCorrectIndex,
            _originalCorrectAnswer: q.correctAnswer
          };
        }
        return q;
      })
    } : quiz;
    
    setSelectedQuiz(processedQuiz);
    setCurrentQuestionIndex(0);
    setAnswers(new Array(quiz.questions.length).fill(-1));
    setTimeLeft(quiz.timeLimit * 60); // 초 단위로 변환
    setQuizStarted(true);
    setQuizCompleted(false);
    setResult(null);
  };

  useEffect(() => {
    if (quizStarted && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && quizStarted) {
      finishQuiz();
    }
  }, [timeLeft, quizStarted]);

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < selectedQuiz!.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    if (!selectedQuiz) return;

    const correctAnswers = answers.reduce((count, answer, index) => {
      return count + (answer === selectedQuiz.questions[index].correctAnswer ? 1 : 0);
    }, 0);

    const score = Math.round((correctAnswers / selectedQuiz.questions.length) * 100);

    const quizResult: QuizAttempt = {
      _id: Date.now().toString(),
      quizId: selectedQuiz._id,
      userId: user?.userId || '',
      score,
      totalQuestions: selectedQuiz.questions.length,
      correctAnswers,
      completedAt: new Date().toISOString()
    };

    setResult(quizResult);
    setQuizCompleted(true);
    setQuizStarted(false);
  };

  const resetQuiz = () => {
    setSelectedQuiz(null);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setTimeLeft(0);
    setQuizStarted(false);
    setQuizCompleted(false);
    setResult(null);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '쉬움';
      case 'medium': return '보통';
      case 'hard': return '어려움';
      default: return difficulty;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">로그인 필요</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>퀴즈를 풀기 위해서는 로그인이 필요합니다.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (quizCompleted && result) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-md text-center">
            <div className="p-8">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">퀴즈 완료!</h1>
                <p className="text-gray-600">{selectedQuiz?.title}</p>
              </div>

              <div className="mb-8">
                <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full text-3xl font-bold ${
                  result.score >= 80 ? 'bg-green-100 text-green-800' :
                  result.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {result.score}점
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-800">{result.correctAnswers}</div>
                  <div className="text-sm text-blue-600">정답</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-gray-800">{result.totalQuestions}</div>
                  <div className="text-sm text-gray-600">총 문제</div>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">문제별 정답 확인</h3>
                <div className="space-y-4 text-left">
                  {selectedQuiz?.questions.map((question, index) => {
                    const userAnswer = answers[index];
                    const isCorrect = userAnswer === question.correctAnswer;
                    
                    return (
                      <div key={question._id} className={`p-4 rounded-lg border ${
                        isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                      }`}>
                        <div className="flex items-center mb-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {isCorrect ? '정답' : '오답'}
                          </span>
                          <span className="ml-2 text-sm text-gray-600">문제 {index + 1}</span>
                        </div>
                        <p className="font-medium text-gray-900 mb-2">{question.question}</p>
                        <p className="text-sm text-gray-600">
                          <strong>정답:</strong> {question.options[question.correctAnswer]}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          <strong>해설:</strong> {question.explanation}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-center space-x-4">
                <button
                  onClick={resetQuiz}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  다른 퀴즈 풀기
                </button>
                <button
                  onClick={() => window.location.href = '/dashboard'}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  대시보드로
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (quizStarted && selectedQuiz) {
    const currentQuestion = selectedQuiz.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / selectedQuiz.questions.length) * 100;

    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 진행 상황 */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                문제 {currentQuestionIndex + 1} / {selectedQuiz.questions.length}
              </span>
              <span className={`text-sm font-medium ${
                timeLeft < 60 ? 'text-red-600' : 'text-gray-700'
              }`}>
                ⏰ {formatTime(timeLeft)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {currentQuestion.question}
              </h2>

              <div className="space-y-3 mb-6">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-colors ${
                      answers[currentQuestionIndex] === index
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="font-medium text-gray-700">
                      {String.fromCharCode(65 + index)}. {option}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex justify-between">
                <button
                  onClick={resetQuiz}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  퀴즈 종료
                </button>
                <button
                  onClick={nextQuestion}
                  disabled={answers[currentQuestionIndex] === -1}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {currentQuestionIndex === selectedQuiz.questions.length - 1 ? '완료' : '다음'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🧠 수영 퀴즈</h1>
          <p className="mt-2 text-gray-600">
            수영에 대한 지식을 테스트하고 실력을 향상시켜보세요.
          </p>
          
          {/* 랜덤 모드 선택 */}
          <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg p-4">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={useRandomMode}
                onChange={(e) => setUseRandomMode(e.target.checked)}
                className="w-5 h-5 rounded border-purple-300 text-purple-600 focus:ring-purple-500"
              />
              <div>
                <div className="font-semibold text-purple-900 text-sm">
                  🎲 랜덤 모드로 풀기
                </div>
                <p className="text-xs text-purple-700 mt-1">
                  체크 시 보기 순서가 랜덤하게 섞입니다 (매번 다른 순서)
                </p>
              </div>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <div key={quiz._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{quiz.title}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(quiz.difficulty)}`}>
                    {getDifficultyText(quiz.difficulty)}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-4">{quiz.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="text-sm text-gray-500">
                    📝 문제 수: {quiz.questions.length}개
                  </div>
                  <div className="text-sm text-gray-500">
                    ⏰ 제한 시간: {quiz.timeLimit}분
                  </div>
                  <div className="text-sm text-gray-500">
                    📂 카테고리: {quiz.category}
                  </div>
                </div>

                <button
                  onClick={() => startQuiz(quiz)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  퀴즈 시작
                </button>
              </div>
            </div>
          ))}
        </div>

        {quizzes.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">
              등록된 퀴즈가 없습니다.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}