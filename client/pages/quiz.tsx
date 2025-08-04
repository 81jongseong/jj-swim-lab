'use client';

import { useState } from 'react';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const sampleQuestions: Question[] = [
  {
    id: 1,
    question: "자유형에서 가장 중요한 기술은?",
    options: ["킥", "풀", "턴", "브리딩"],
    correctAnswer: 1,
    explanation: "자유형에서 풀은 추진력을 담당하는 가장 중요한 기술입니다."
  },
  {
    id: 2,
    question: "수영에서 호흡의 기본 원리는?",
    options: ["입으로 들이마시고 코로 내쉬기", "코로 들이마시고 입으로 내쉬기", "입으로 들이마시고 입으로 내쉬기", "코로 들이마시고 코로 내쉬기"],
    correctAnswer: 0,
    explanation: "수영에서는 입으로 들이마시고 코로 내쉬는 것이 기본입니다."
  },
  {
    id: 3,
    question: "배영의 특징이 아닌 것은?",
    options: ["얼굴이 항상 수면 위에 있음", "호흡이 자유로움", "시야가 제한적임", "전신 운동이 가능함"],
    correctAnswer: 2,
    explanation: "배영은 얼굴이 항상 수면 위에 있어 시야가 넓은 것이 특징입니다."
  }
];

export default function QuizPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) return;

    const isCorrect = selectedAnswer === sampleQuestions[currentQuestion].correctAnswer;
    if (isCorrect) {
      setScore(score + 1);
    }

    setShowResult(true);
  };

  const handleNext = () => {
    if (currentQuestion < sampleQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setQuizCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setQuizCompleted(false);
  };

  if (quizCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">퀴즈 완료!</h1>
            <div className="text-6xl mb-4">🎉</div>
            <p className="text-xl text-gray-600 mb-4">
              점수: <span className="font-bold text-blue-600">{score}</span> / {sampleQuestions.length}
            </p>
            <div className="mb-6">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(score / sampleQuestions.length) * 100}%` }}
                ></div>
              </div>
            </div>
            <button
              onClick={handleRestart}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
            >
              다시 시작
            </button>
          </div>
        </div>
      </div>
    );
  }

  const question = sampleQuestions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-500">
              문제 {currentQuestion + 1} / {sampleQuestions.length}
            </span>
            <span className="text-sm text-gray-500">
              점수: {score}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((currentQuestion + 1) / sampleQuestions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            {question.question}
          </h2>

          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => !showResult && handleAnswerSelect(index)}
                disabled={showResult}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                  selectedAnswer === index
                    ? showResult
                      ? index === question.correctAnswer
                        ? 'border-green-500 bg-green-50'
                        : 'border-red-500 bg-red-50'
                      : 'border-blue-500 bg-blue-50'
                    : showResult && index === question.correctAnswer
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                } ${showResult ? 'cursor-default' : 'cursor-pointer'}`}
              >
                <span className="font-medium text-gray-700">
                  {String.fromCharCode(65 + index)}. {option}
                </span>
                {showResult && selectedAnswer === index && (
                  <span className="ml-2 text-sm font-medium">
                    {index === question.correctAnswer ? '✅' : '❌'}
                  </span>
                )}
                {showResult && index === question.correctAnswer && selectedAnswer !== index && (
                  <span className="ml-2 text-sm font-medium">✅</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {showResult && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">설명</h3>
            <p className="text-blue-700">{question.explanation}</p>
          </div>
        )}

        <div className="flex justify-center">
          {!showResult ? (
            <button
              onClick={handleSubmit}
              disabled={selectedAnswer === null}
              className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              답안 제출
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600 transition-colors"
            >
              {currentQuestion < sampleQuestions.length - 1 ? '다음 문제' : '결과 보기'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 