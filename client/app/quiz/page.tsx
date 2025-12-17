'use client';

import React, { useState, useEffect } from 'react';

// 동적 렌더링 강제 (prerendering 비활성화)
export const dynamic = 'force-dynamic';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import StatCard from '@/components/StatCard';
import { Button } from '@/components/ui';
import { CardGrid, LoadingState, PageHeader, ErrorState } from '@/components/common';
import { logger } from '@/lib/logger';

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
  type?: 'multiple-choice' | 'short-answer' | 'ox'; // 문제 타입
  options?: string[]; // 객관식용
  correctAnswer: number | string | string[]; // 객관식: 인덱스, 주관식: 정답 텍스트 또는 [1차 답변, 2차 답변]
  explanation?: string;
  metadata?: {
    isTwoStep?: boolean; // 2단계 답변 여부
    정답_1차?: string;
    정답_2차?: string;
  };
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
  const router = useRouter();
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | string | string[])[]>([]); // 객관식만 입력, 주관식은 스텝 미리보기
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [result, setResult] = useState<QuizAttempt | null>(null);
  const [loading, setLoading] = useState(false); // 초기 로딩 비활성화
  const [useRandomMode, setUseRandomMode] = useState(false); // 🎲 랜덤 모드 선택
  const [questionTypeFilter, setQuestionTypeFilter] = useState<'all' | 'multiple-choice' | 'short-answer'>('all'); // 문제 타입 필터
  const [revealSteps, setRevealSteps] = useState<Array<{ step1: boolean; step2: boolean }>>([]); // 주관식 단계별 공개 상태

  const renderFormatted = (text?: string) => {
    if (!text) return null;

    // 숫자 패턴이 있으면 원본 번호를 유지한 채 줄로 나눠서 표시
    const parts = text
      .split(/(?=\s*\d+\))/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (parts.length > 1) {
      return (
        <div className="space-y-2 whitespace-pre-wrap break-words leading-7">
          {parts.map((p, idx) => (
            <div key={idx}>{p}</div>
          ))}
        </div>
      );
    }

    // 단일 항목은 그대로 줄바꿈 유지
    return <div className="whitespace-pre-wrap break-words leading-7">{text}</div>;
  };

  // 게스트는 게스트 퀴즈 페이지로 리다이렉트
  useEffect(() => {
    if (!user) {
      router.push('/guest-quiz');
    }
  }, [user, router]);

  useEffect(() => {
    if (user) {
      fetchQuizzes();
    }
  }, [user]);

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
          logger.warn('인증 실패, 임시 데이터 사용');
        }
      } catch (apiError) {
        logger.warn('API 호출 실패, 임시 데이터 사용:', apiError);
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
      logger.error('퀴즈 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = (quiz: Quiz) => {
    // 문제 타입 필터링
    let filteredQuestions = quiz.questions;
    if (questionTypeFilter !== 'all') {
      filteredQuestions = quiz.questions.filter((q: any) => {
        const questionType = q.type || 'multiple-choice'; // 기본값: 객관식
        return questionType === questionTypeFilter;
      });
    }

    if (filteredQuestions.length === 0) {
      alert(`선택한 문제 타입(${questionTypeFilter === 'multiple-choice' ? '객관식' : '주관식'})의 문제가 없습니다.`);
      return;
    }

    // 🎲 랜덤 모드: 사용자가 선택한 경우에만 보기 순서 섞기
    const processedQuestions = useRandomMode ? filteredQuestions.map((q: any) => {
      if (q.type === 'multiple-choice' || q.type === 'ox') {
        // 보기 순서 섞기
        const shuffled = [...(q.options || [])].map((opt, idx) => ({ opt, idx }));
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
    }) : filteredQuestions;
    
    const processedQuiz = {
      ...quiz,
      questions: processedQuestions
    };
    
    setSelectedQuiz(processedQuiz);
    setCurrentQuestionIndex(0);
    // 초기 답안/공개 상태 생성 (객관식: -1, 주관식: 입력 없이 안내용)
    setAnswers(processedQuestions.map((q: any) => q.type === 'short-answer' ? '' : -1));
    setRevealSteps(processedQuestions.map(() => ({ step1: false, step2: false })));
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

  // 주관식은 입력 없이 정답 스텝 안내만 표시

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
      const question = selectedQuiz.questions[index];
      if (question.type === 'short-answer') {
        // 주관식은 입력/채점 없이 안내만 하므로 점수 계산 제외
        return count;
      } else {
        // 객관식: 인덱스 비교
        return count + (answer === question.correctAnswer ? 1 : 0);
      }
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
    setRevealSteps([]);
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
      case 'beginner': return '초급';
      case 'intermediate': return '중급';
      case 'advanced': return '고급';
      case 'none': return '';
      default: return difficulty;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingState message="로딩 중..." size="lg" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ErrorState 
            message="퀴즈를 풀기 위해서는 로그인이 필요합니다."
            onRetry={() => window.location.href = '/auth/login'}
            retryText="로그인하기"
          />
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
                <StatCard
                  title="정답"
                  value={result.correctAnswers.toString()}
                  icon="✅"
                  color="green"
                  subtitle="맞힌 문제 수"
                  change={{ value: Math.round((result.correctAnswers / result.totalQuestions) * 100), type: 'increase' }}
                />
                <StatCard
                  title="총 문제"
                  value={result.totalQuestions.toString()}
                  icon="📝"
                  color="blue"
                  subtitle="전체 문제 수"
                  change={{ value: 0, type: 'increase' }}
                />
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">문제별 정답 확인</h3>
                <div className="space-y-4 text-left">
                  {selectedQuiz?.questions.map((question, index) => {
                    const userAnswer = answers[index];
                    const isSubjective = question.type === 'short-answer';
                    let isCorrect = false;
                    
                    if (isSubjective) {
                      const isTwoStep = Array.isArray(question.correctAnswer) || question.metadata?.isTwoStep;
                      
                      if (isTwoStep) {
                        // 2단계 답변 채점
                        const correctAnswers = Array.isArray(question.correctAnswer) 
                          ? question.correctAnswer 
                          : [question.metadata?.정답_1차 || '', question.metadata?.정답_2차 || ''];
                        const userAnswers = Array.isArray(userAnswer) ? userAnswer : ['', ''];
                        
                        const firstCorrect = userAnswers[0]?.trim().toLowerCase() === correctAnswers[0]?.trim().toLowerCase();
                        const secondCorrect = userAnswers[1]?.trim().toLowerCase() === correctAnswers[1]?.trim().toLowerCase();
                        isCorrect = firstCorrect && secondCorrect;
                      } else {
                        // 1단계 답변 채점
                        const userAnswerText = typeof userAnswer === 'string' ? userAnswer.trim().toLowerCase() : '';
                        const correctAnswerText = typeof question.correctAnswer === 'string' 
                          ? question.correctAnswer.trim().toLowerCase() 
                          : '';
                        isCorrect = userAnswerText === correctAnswerText;
                      }
                    } else {
                      isCorrect = userAnswer === question.correctAnswer;
                    }
                    
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
                          {isSubjective && <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-800 rounded text-xs">주관식</span>}
                        </div>
                        <p className="font-medium text-gray-900 mb-2">{question.question}</p>
                        {isSubjective ? (() => {
                          const isTwoStep = Array.isArray(question.correctAnswer) || question.metadata?.isTwoStep;
                          
                          if (isTwoStep) {
                            const correctAnswers = Array.isArray(question.correctAnswer) 
                              ? question.correctAnswer 
                              : [question.metadata?.정답_1차 || '', question.metadata?.정답_2차 || ''];
                            const userAnswers = Array.isArray(userAnswer) ? userAnswer : ['', ''];
                            
                            return (
                              <>
                                <p className="text-sm text-gray-600 mb-2">
                                  <strong>내 1차 답:</strong> {userAnswers[0] || '(미입력)'}
                                </p>
                                <p className="text-sm text-gray-600 mb-2">
                                  <strong>정답 1차:</strong> {correctAnswers[0]}
                                </p>
                                <p className="text-sm text-gray-600 mb-2">
                                  <strong>내 2차 답:</strong> {userAnswers[1] || '(미입력)'}
                                </p>
                                <p className="text-sm text-gray-600">
                                  <strong>정답 2차:</strong> {correctAnswers[1]}
                                </p>
                              </>
                            );
                          } else {
                            return (
                              <>
                                <p className="text-sm text-gray-600 mb-1">
                                  <strong>내 답:</strong> {typeof userAnswer === 'string' ? userAnswer : '(미입력)'}
                                </p>
                                <p className="text-sm text-gray-600">
                                  <strong>정답:</strong> {typeof question.correctAnswer === 'string' ? question.correctAnswer : ''}
                                </p>
                              </>
                            );
                          }
                        })() : (
                          <p className="text-sm text-gray-600">
                            <strong>정답:</strong> {question.options && question.options[question.correctAnswer as number]}
                          </p>
                        )}
                        {question.explanation && (
                          <p className="text-sm text-gray-600 mt-1">
                            <strong>해설:</strong> {question.explanation}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-center space-x-4">
                <Button
                  onClick={resetQuiz}
                  variant="outline"
                  size="md"
                >
                  다른 퀴즈 풀기
                </Button>
                <Button
                  onClick={() => window.location.href = '/dashboard'}
                  variant="primary"
                  size="md"
                >
                  대시보드로
                </Button>
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
    const isSubjective = currentQuestion.type === 'short-answer';

    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 진행 상황 */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                문제 {currentQuestionIndex + 1} / {selectedQuiz.questions.length}
                {isSubjective && (() => {
                  const isTwoStep = Array.isArray(currentQuestion.correctAnswer) || currentQuestion.metadata?.isTwoStep;
                  return (
                    <>
                      <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">주관식</span>
                      {isTwoStep && <span className="ml-1 px-2 py-1 bg-green-100 text-green-800 rounded text-xs">2단계</span>}
                    </>
                  );
                })()}
                {!isSubjective && <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">객관식</span>}
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

          <div className="bg-white rounded-xl shadow-lg border border-gray-100">
            <div className="p-6 md:p-7">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 leading-9 whitespace-pre-line break-words">
                {currentQuestion.question}
              </h2>

              {/* 객관식 문제 */}
              {!isSubjective && currentQuestion.options && (
                <div className="space-y-3 mb-6">
                  {currentQuestion.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      className={`w-full p-4 text-left rounded-lg border-2 transition-colors leading-7 break-words ${
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
              )}

              {/* 주관식 문제 */}
              {isSubjective && (() => {
                const currentQuestion = selectedQuiz.questions[currentQuestionIndex];
                const isTwoStep = Array.isArray(currentQuestion.correctAnswer) || currentQuestion.metadata?.isTwoStep;
                const currentAnswer = answers[currentQuestionIndex];
                
                const currentReveal = revealSteps[currentQuestionIndex] || { step1: false, step2: false };

                if (isTwoStep) {
                  return (
                    <div className="mb-6 space-y-3">
                      <div className="flex gap-3 mb-4">
                        <Button
                          size="md"
                          variant={currentReveal.step1 ? 'default' : 'outline'}
                          onClick={() =>
                            setRevealSteps(prev =>
                              prev.map((v, idx) =>
                                idx === currentQuestionIndex ? { ...v, step1: true } : v
                              )
                            )
                          }
                        >
                          1차 보기
                        </Button>
                        <Button
                          size="md"
                          variant={currentReveal.step2 ? 'default' : 'outline'}
                          disabled={!currentReveal.step1}
                          onClick={() =>
                            setRevealSteps(prev =>
                              prev.map((v, idx) =>
                                idx === currentQuestionIndex ? { ...v, step2: true } : v
                              )
                            )
                          }
                        >
                          2차 보기
                        </Button>
                      </div>

                      <div className="p-5 border-2 border-yellow-300 rounded-lg bg-yellow-50 shadow-sm">
                        <div className="text-sm font-semibold text-yellow-700 mb-2">1차 정답 (핵심)</div>
                        <div className="text-gray-900 font-semibold">
                          {currentReveal.step1
                            ? renderFormatted(
                                currentQuestion.metadata?.정답_1차 ||
                                  (Array.isArray(currentQuestion.correctAnswer) ? currentQuestion.correctAnswer[0] : '')
                              )
                            : '클릭해서 확인'}
                        </div>
                      </div>

                      <div className="p-5 border-2 border-blue-200 rounded-lg bg-blue-50 shadow-sm">
                        <div className="text-sm font-semibold text-blue-700 mb-2">2차 정답 (세부)</div>
                        <div className="text-gray-900">
                          {currentReveal.step2
                            ? renderFormatted(
                                currentQuestion.metadata?.정답_2차 ||
                                  (Array.isArray(currentQuestion.correctAnswer) ? currentQuestion.correctAnswer[1] : currentQuestion.correctAnswer)
                              )
                            : '1차 확인 후 클릭'}
                        </div>
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div className="mb-6 space-y-2">
                      <Button
                        size="md"
                        variant={currentReveal.step1 ? 'default' : 'outline'}
                        onClick={() =>
                          setRevealSteps(prev =>
                            prev.map((v, idx) =>
                              idx === currentQuestionIndex ? { ...v, step1: true } : v
                            )
                          )
                        }
                      >
                        정답 보기
                      </Button>
                      <div className="p-5 border-2 border-blue-200 rounded-lg bg-blue-50 shadow-sm">
                        <div className="text-sm font-semibold text-blue-700 mb-2">정답</div>
                        <div className="text-gray-900">
                          {currentReveal.step1
                            ? renderFormatted(
                                typeof currentQuestion.correctAnswer === 'string'
                                  ? currentQuestion.correctAnswer
                                  : currentQuestion.metadata?.정답_1차 || ''
                              )
                            : '클릭해서 확인'}
                        </div>
                      </div>
                    </div>
                  );
                }
              })()}

              <div className="flex justify-between">
                <Button
                  onClick={resetQuiz}
                  variant="outline"
                  size="md"
                >
                  퀴즈 종료
                </Button>
                <Button
                  onClick={nextQuestion}
                  disabled={isSubjective ? false : answers[currentQuestionIndex] === -1}
                  variant="primary"
                  size="md"
                >
                  {currentQuestionIndex === selectedQuiz.questions.length - 1 ? '완료' : '다음'}
                </Button>
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
        <PageHeader
          title="🧠 수영 퀴즈"
          description="수영에 대한 지식을 테스트하고 실력을 향상시켜보세요."
          className="mb-8"
        />
        
        <div className="mb-8 space-y-4">
          {/* 문제 타입 필터 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="font-semibold text-blue-900 text-sm mb-3">
              📝 문제 타입 선택
            </div>
            <div className="flex flex-wrap gap-3">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="questionTypeFilter"
                  value="all"
                  checked={questionTypeFilter === 'all'}
                  onChange={(e) => setQuestionTypeFilter(e.target.value as any)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-blue-800">전체 (객관식 + 주관식)</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="questionTypeFilter"
                  value="multiple-choice"
                  checked={questionTypeFilter === 'multiple-choice'}
                  onChange={(e) => setQuestionTypeFilter(e.target.value as any)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-blue-800">객관식만</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="questionTypeFilter"
                  value="short-answer"
                  checked={questionTypeFilter === 'short-answer'}
                  onChange={(e) => setQuestionTypeFilter(e.target.value as any)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-blue-800">주관식만</span>
              </label>
            </div>
            <p className="text-xs text-blue-700 mt-2">
              💡 선택한 문제 타입만 퀴즈에 포함됩니다.
            </p>
          </div>

          {/* 랜덤 모드 선택 */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
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

        <CardGrid>
          {quizzes.map((quiz) => (
            <div key={quiz._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{quiz.title}</h3>
                  {quiz.difficulty && quiz.difficulty !== 'none' && (
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(quiz.difficulty)}`}>
                      {getDifficultyText(quiz.difficulty)}
                    </span>
                  )}
                </div>

                <p className="text-gray-600 text-sm mb-4">{quiz.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="text-sm text-gray-500">
                    📝 전체 문제 수: {quiz.questions.length}개
                    {questionTypeFilter !== 'all' && (
                      <span className="ml-2 text-blue-600">
                        (필터 적용 시: {
                          quiz.questions.filter((q: any) => {
                            const questionType = q.type || 'multiple-choice';
                            return questionTypeFilter === 'all' || questionType === questionTypeFilter;
                          }).length
                        }개)
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    ⏰ 제한 시간: {quiz.timeLimit}분
                  </div>
                  <div className="text-sm text-gray-500">
                    📂 카테고리: {quiz.category}
                  </div>
                  {/* 문제 타입 통계 */}
                  <div className="text-xs text-gray-400 mt-2 pt-2 border-t border-gray-200">
                    객관식: {quiz.questions.filter((q: any) => (q.type || 'multiple-choice') === 'multiple-choice').length}개
                    {' | '}
                    주관식: {quiz.questions.filter((q: any) => q.type === 'short-answer').length}개
                  </div>
                </div>

                <Button
                  onClick={() => startQuiz(quiz)}
                  variant="primary"
                  size="md"
                  className="w-full"
                >
                  퀴즈 시작
                </Button>
              </div>
            </div>
          ))}
        </CardGrid>

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