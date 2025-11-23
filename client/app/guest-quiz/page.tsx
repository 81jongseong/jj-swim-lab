/**
 * 🧠 게스트 퀴즈 체험 페이지
 * 
 * 📋 **기능**
 * - 비회원도 수영 상식 퀴즈 체험 가능
 * - 회원가입 유도를 위한 제한된 퀴즈 제공
 * - 결과 확인 및 학습 효과 제공
 * 
 * 🔄 **연동 데이터**
 * - 샘플 퀴즈 데이터 (하드코딩)
 * 
 * 🔗 **연동 파일**
 * - StatCard 컴포넌트
 * - Button 컴포넌트
 * 
 * 📅 **수정 히스토리**
 * - 2025-01-22: 게스트 퀴즈 페이지 생성
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StatCard from '@/components/StatCard';
import { Button } from '@/components/ui';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

const SAMPLE_QUIZ: Question[] = [
  {
    id: 1,
    question: '자유형(크롤) 수영에서 호흡은 언제 하는 것이 가장 좋을까요?',
    options: [
      '머리를 앞으로 들어 올릴 때',
      '팔을 물 밖으로 뻗을 때 옆으로 고개를 돌려서',
      '물속에서 계속 참고 있다가 벽에 닿았을 때',
      '언제든지 편할 때'
    ],
    correctAnswer: 1,
    explanation: '자유형에서는 팔을 물 밖으로 뻗을 때 옆으로 고개를 돌려 호흡하는 것이 가장 효율적입니다. 머리를 앞으로 들면 몸의 균형이 깨지고 저항이 증가합니다.',
    difficulty: 'easy'
  },
  {
    id: 2,
    question: '배영(등영)을 할 때 가장 중요한 것은 무엇일까요?',
    options: [
      '빠르게 팔을 돌리기',
      '엉덩이를 수면 위로 유지하기',
      '발차기를 크게 하기',
      '고개를 좌우로 흔들기'
    ],
    correctAnswer: 1,
    explanation: '배영에서는 엉덩이를 수면 위로 유지하여 몸의 자세를 수평으로 유지하는 것이 가장 중요합니다. 엉덩이가 가라앉으면 저항이 커져 속도가 느려집니다.',
    difficulty: 'easy'
  },
  {
    id: 3,
    question: '평영(개구리영)에서 팔 동작과 발차기의 순서는?',
    options: [
      '팔 동작과 발차기를 동시에',
      '발차기 후 팔 동작',
      '팔 동작 후 발차기',
      '순서는 상관없음'
    ],
    correctAnswer: 2,
    explanation: '평영에서는 팔 동작을 먼저 하고, 그 다음 발차기를 합니다. 팔로 물을 끌어당긴 후 발차기로 추진력을 얻는 것이 효율적입니다.',
    difficulty: 'medium'
  },
  {
    id: 4,
    question: '접영(버터플라이)에서 발차기는 몇 번 하나요?',
    options: [
      '팔 한 번 젓을 때 발차기 1번',
      '팔 한 번 젓을 때 발차기 2번',
      '팔 한 번 젓을 때 발차기 3번',
      '발차기는 하지 않음'
    ],
    correctAnswer: 1,
    explanation: '접영에서는 팔을 한 번 젓는 동안 돌핀킥(발차기)을 2번 합니다. 첫 번째는 팔이 물에 들어갈 때, 두 번째는 팔이 물 밖으로 나올 때입니다.',
    difficulty: 'hard'
  },
  {
    id: 5,
    question: '수영 전 준비운동을 해야 하는 가장 중요한 이유는?',
    options: [
      '체력을 미리 소모하기 위해',
      '근육과 관절을 풀어 부상을 예방하기 위해',
      '수영복이 잘 맞는지 확인하기 위해',
      '수영장 물 온도에 익숙해지기 위해'
    ],
    correctAnswer: 1,
    explanation: '준비운동은 근육과 관절을 풀어주어 부상을 예방하고, 심박수를 점진적으로 올려 운동 효과를 높이는 데 매우 중요합니다.',
    difficulty: 'easy'
  },
  {
    id: 6,
    question: '물에 빠진 사람을 구조할 때 가장 먼저 해야 할 행동은?',
    options: [
      '즉시 물에 뛰어들어 구조하기',
      '주변에 도움을 요청하고 구조 도구 찾기',
      '사진을 찍어 증거 남기기',
      '지켜보면서 상황 판단하기'
    ],
    correctAnswer: 1,
    explanation: '물에 빠진 사람을 발견하면 즉시 주변에 도움을 요청하고, 로프나 튜브 같은 구조 도구를 먼저 찾아야 합니다. 무작정 뛰어들면 구조자도 위험해질 수 있습니다.',
    difficulty: 'medium'
  },
  {
    id: 7,
    question: '수영 중 다리에 쥐가 났을 때 가장 좋은 대처법은?',
    options: [
      '계속 수영하면서 참기',
      '물속에서 발을 펴고 쥐난 근육을 스트레칭',
      '즉시 수영장 밖으로 나가기',
      '아무것도 하지 않고 가만히 있기'
    ],
    correctAnswer: 1,
    explanation: '쥐가 났을 때는 침착하게 발을 펴고 쥐난 근육을 부드럽게 스트레칭하는 것이 좋습니다. 당황하지 말고 천천히 처리하면 금방 풀립니다.',
    difficulty: 'medium'
  },
  {
    id: 8,
    question: '올림픽 수영 경기에서 인정되는 4가지 영법은?',
    options: [
      '자유형, 배영, 평영, 접영',
      '자유형, 개구리영, 측영, 잠영',
      '크롤, 백스트로크, 브레스트, 플라이',
      '전진, 후진, 좌영, 우영'
    ],
    correctAnswer: 0,
    explanation: '올림픽에서 인정되는 4가지 영법은 자유형(Freestyle/크롤), 배영(Backstroke), 평영(Breaststroke), 접영(Butterfly)입니다.',
    difficulty: 'easy'
  },
  {
    id: 9,
    question: '수영장 레인(lane) 번호는 보통 어디가 1번인가요?',
    options: [
      '왼쪽 끝',
      '오른쪽 끝',
      '가운데',
      '정해진 규칙 없음'
    ],
    correctAnswer: 0,
    explanation: '수영장 레인은 일반적으로 왼쪽 끝이 1번 레인입니다. 경기에서는 예선 기록이 좋은 선수가 가운데 레인을 배정받습니다.',
    difficulty: 'medium'
  },
  {
    id: 10,
    question: '장거리 수영 시 가장 효율적인 영법은?',
    options: [
      '접영 - 가장 빠르므로',
      '평영 - 가장 편안하므로',
      '자유형 - 속도와 효율의 균형이 좋으므로',
      '배영 - 호흡이 편하므로'
    ],
    correctAnswer: 2,
    explanation: '자유형은 속도와 에너지 효율의 균형이 가장 좋아 장거리 수영에 가장 적합합니다. 접영은 빠르지만 체력 소모가 크고, 평영은 편하지만 속도가 느립니다.',
    difficulty: 'hard'
  }
];

export default function GuestQuizPage() {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(Array(SAMPLE_QUIZ.length).fill(-1));
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10분 (600초)

  useEffect(() => {
    if (quizStarted && !quizCompleted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [quizStarted, quizCompleted, timeLeft]);

  const handleStartQuiz = () => {
    setQuizStarted(true);
    setCurrentQuestionIndex(0);
    setSelectedAnswers(Array(SAMPLE_QUIZ.length).fill(-1));
    setQuizCompleted(false);
    setTimeLeft(600);
  };

  const handleSelectAnswer = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    setShowExplanation(false);
    if (currentQuestionIndex < SAMPLE_QUIZ.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    setShowExplanation(false);
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitQuiz = () => {
    setQuizCompleted(true);
  };

  const calculateScore = () => {
    let correctCount = 0;
    SAMPLE_QUIZ.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correctCount++;
      }
    });
    return {
      correct: correctCount,
      total: SAMPLE_QUIZ.length,
      percentage: Math.round((correctCount / SAMPLE_QUIZ.length) * 100)
    };
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'hard': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '쉬움';
      case 'medium': return '보통';
      case 'hard': return '어려움';
      default: return '알 수 없음';
    }
  };

  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4 pt-20">
        <div className="max-w-4xl mx-auto">
          {/* 헤더 */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              🧠 수영 상식 퀴즈 체험
            </h1>
            <p className="text-lg text-gray-600">
              재미있는 수영 퀴즈를 풀어보세요!
            </p>
          </div>

          {/* 통계 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <StatCard
              title="총 문제"
              value={SAMPLE_QUIZ.length}
              description="체험용 퀴즈"
              color="blue"
            />
            <StatCard
              title="제한 시간"
              value="10분"
              description="충분한 시간"
              color="purple"
            />
            <StatCard
              title="난이도"
              value="혼합"
              description="쉬움~어려움"
              color="green"
            />
          </div>

          {/* 퀴즈 소개 카드 */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">📚 퀴즈 안내</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">다양한 수영 상식</h3>
                  <p className="text-gray-600">수영 영법, 안전 수칙, 경기 규칙 등 다양한 주제의 문제</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="text-2xl">🎯</span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">즉각적인 피드백</h3>
                  <p className="text-gray-600">각 문제마다 상세한 해설 제공</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="text-2xl">⏱️</span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">10분 제한 시간</h3>
                  <p className="text-gray-600">천천히 생각하며 풀어보세요</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>💡 Tip:</strong> 회원가입하시면 더 많은 퀴즈와 학습 자료를 이용하실 수 있습니다!
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleStartQuiz}
                variant="primary"
                size="lg"
                className="flex-1"
              >
                퀴즈 시작하기 🚀
              </Button>
              <Button
                onClick={() => router.push('/auth/signup-student')}
                variant="outline"
                size="lg"
              >
                회원가입
              </Button>
            </div>
          </div>

          {/* 문제 미리보기 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">📝 문제 난이도 분포</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {SAMPLE_QUIZ.filter(q => q.difficulty === 'easy').length}
                </div>
                <div className="text-sm text-green-700">쉬움</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-3xl font-bold text-yellow-600 mb-1">
                  {SAMPLE_QUIZ.filter(q => q.difficulty === 'medium').length}
                </div>
                <div className="text-sm text-yellow-700">보통</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-3xl font-bold text-red-600 mb-1">
                  {SAMPLE_QUIZ.filter(q => q.difficulty === 'hard').length}
                </div>
                <div className="text-sm text-red-700">어려움</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (quizCompleted) {
    const score = calculateScore();
    const getMessage = () => {
      if (score.percentage >= 90) return { emoji: '🏆', text: '완벽해요!', color: 'text-yellow-600' };
      if (score.percentage >= 70) return { emoji: '🎉', text: '잘했어요!', color: 'text-green-600' };
      if (score.percentage >= 50) return { emoji: '👍', text: '좋아요!', color: 'text-blue-600' };
      return { emoji: '💪', text: '다시 도전!', color: 'text-purple-600' };
    };
    const message = getMessage();

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4 pt-20">
        <div className="max-w-4xl mx-auto">
          {/* 결과 헤더 */}
          <div className="text-center mb-8">
            <div className="text-8xl mb-4">{message.emoji}</div>
            <h1 className={`text-4xl font-bold mb-2 ${message.color}`}>
              {message.text}
            </h1>
            <p className="text-lg text-gray-600">
              퀴즈를 완료했습니다!
            </p>
          </div>

          {/* 점수 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <StatCard
              title="정답 수"
              value={`${score.correct}/${score.total}`}
              description="맞힌 문제"
              color="green"
            />
            <StatCard
              title="정답률"
              value={`${score.percentage}%`}
              description="정확도"
              color="blue"
            />
            <StatCard
              title="소요 시간"
              value={formatTime(600 - timeLeft)}
              description="걸린 시간"
              color="purple"
            />
          </div>

          {/* 상세 결과 */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">📊 상세 결과</h2>
            
            <div className="space-y-4">
              {SAMPLE_QUIZ.map((question, index) => {
                const isCorrect = selectedAnswers[index] === question.correctAnswer;
                const answered = selectedAnswers[index] !== -1;
                
                return (
                  <div
                    key={question.id}
                    className={`p-4 rounded-lg border-2 ${
                      !answered
                        ? 'border-gray-200 bg-gray-50'
                        : isCorrect
                        ? 'border-green-200 bg-green-50'
                        : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900">
                            {index + 1}. {question.question}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                            {getDifficultyText(question.difficulty)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        {!answered ? (
                          <span className="text-2xl">⚪</span>
                        ) : isCorrect ? (
                          <span className="text-2xl">✅</span>
                        ) : (
                          <span className="text-2xl">❌</span>
                        )}
                      </div>
                    </div>

                    {answered && (
                      <div className="mt-2 text-sm">
                        {!isCorrect && (
                          <p className="text-red-700 mb-1">
                            <strong>선택한 답:</strong> {question.options[selectedAnswers[index]]}
                          </p>
                        )}
                        <p className="text-green-700 mb-2">
                          <strong>정답:</strong> {question.options[question.correctAnswer]}
                        </p>
                        <p className="text-gray-700 bg-white p-2 rounded border border-gray-200">
                          <strong>💡 해설:</strong> {question.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg p-6 text-center text-white mb-6">
            <h3 className="text-2xl font-bold mb-2">더 많은 퀴즈를 풀고 싶으신가요?</h3>
            <p className="mb-4 text-blue-100">
              회원가입하시면 수백 개의 퀴즈와 학습 자료를 무제한으로 이용할 수 있습니다!
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => router.push('/auth/signup-student')}
                variant="outline"
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50"
              >
                회원가입하기 🎯
              </Button>
              <Button
                onClick={handleStartQuiz}
                variant="outline"
                size="lg"
                className="bg-white/10 text-white border-white hover:bg-white/20"
              >
                다시 풀기
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = SAMPLE_QUIZ[currentQuestionIndex];
  const selectedAnswer = selectedAnswers[currentQuestionIndex];
  const answeredCount = selectedAnswers.filter(a => a !== -1).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4 pt-20">
      <div className="max-w-4xl mx-auto">
        {/* 진행 상황 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              문제 {currentQuestionIndex + 1} / {SAMPLE_QUIZ.length}
            </span>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">
                답변: {answeredCount} / {SAMPLE_QUIZ.length}
              </span>
              <span className={`text-sm font-bold ${timeLeft < 60 ? 'text-red-600' : 'text-blue-600'}`}>
                ⏱️ {formatTime(timeLeft)}
              </span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / SAMPLE_QUIZ.length) * 100}%` }}
            />
          </div>
        </div>

        {/* 문제 카드 */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(currentQuestion.difficulty)}`}>
              {getDifficultyText(currentQuestion.difficulty)}
            </span>
            <span className="text-sm text-gray-500">
              퀴즈 #{currentQuestion.id}
            </span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {currentQuestion.question}
          </h2>

          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleSelectAnswer(index)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  selectedAnswer === index
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold ${
                      selectedAnswer === index
                        ? 'border-blue-500 bg-blue-500 text-white'
                        : 'border-gray-300 text-gray-500'
                    }`}
                  >
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className={`flex-1 ${selectedAnswer === index ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                    {option}
                  </span>
                  {selectedAnswer === index && (
                    <span className="text-blue-500">✓</span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {showExplanation && selectedAnswer !== -1 && (
            <div className={`mt-6 p-4 rounded-lg ${
              selectedAnswer === currentQuestion.correctAnswer
                ? 'bg-green-50 border-l-4 border-green-500'
                : 'bg-red-50 border-l-4 border-red-500'
            }`}>
              <h3 className={`font-bold mb-2 ${
                selectedAnswer === currentQuestion.correctAnswer ? 'text-green-800' : 'text-red-800'
              }`}>
                {selectedAnswer === currentQuestion.correctAnswer ? '✅ 정답입니다!' : '❌ 틀렸습니다!'}
              </h3>
              <p className="text-gray-700 mb-2">
                <strong>정답:</strong> {currentQuestion.options[currentQuestion.correctAnswer]}
              </p>
              <p className="text-gray-700">
                <strong>💡 해설:</strong> {currentQuestion.explanation}
              </p>
            </div>
          )}
        </div>

        {/* 네비게이션 버튼 */}
        <div className="flex gap-3">
          <Button
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
            variant="outline"
          >
            ← 이전 문제
          </Button>

          {selectedAnswer !== -1 && !showExplanation && (
            <Button
              onClick={() => setShowExplanation(true)}
              variant="outline"
              className="flex-1"
            >
              💡 해설 보기
            </Button>
          )}

          {currentQuestionIndex < SAMPLE_QUIZ.length - 1 ? (
            <Button
              onClick={handleNextQuestion}
              variant="primary"
              className="flex-1"
            >
              다음 문제 →
            </Button>
          ) : (
            <Button
              onClick={handleSubmitQuiz}
              variant="primary"
              className="flex-1"
            >
              퀴즈 완료 🎉
            </Button>
          )}
        </div>

        {/* 문제 네비게이션 */}
        <div className="mt-6 bg-white rounded-xl shadow-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">문제 바로가기</h3>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {SAMPLE_QUIZ.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentQuestionIndex(index);
                  setShowExplanation(false);
                }}
                className={`w-10 h-10 rounded-lg font-semibold text-sm transition-all ${
                  currentQuestionIndex === index
                    ? 'bg-blue-500 text-white shadow-md'
                    : selectedAnswers[index] !== -1
                    ? 'bg-green-100 text-green-700 border-2 border-green-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}










