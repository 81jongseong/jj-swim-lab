import React, { useState, useEffect } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Input from './ui/Input';

interface QuizQuestion {
  question: string;
  type: 'multiple-choice' | 'essay';
  options?: string[];
  correctAnswer: string | number;
  explanation?: string;
  points: number;
}

interface Quiz {
  _id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  type: 'multiple-choice' | 'essay';
  questions: QuizQuestion[];
  timeLimit?: number;
  passingScore: number;
  maxAttempts: number;
  isActive: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface QuizFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (quizData: Partial<Quiz>) => void;
  quiz?: Quiz | null;
}

const QuizForm: React.FC<QuizFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  quiz
}) => {
  const [formData, setFormData] = useState<Partial<Quiz>>({
    title: '',
    description: '',
    category: '',
    difficulty: 'beginner',
    type: 'multiple-choice',
    questions: [],
    timeLimit: undefined,
    passingScore: 70,
    maxAttempts: 3,
    isActive: true,
    tags: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newQuestion, setNewQuestion] = useState<Partial<QuizQuestion>>({
    question: '',
    type: 'multiple-choice',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
    points: 1
  });

  useEffect(() => {
    if (quiz) {
      setFormData({
        title: quiz.title,
        description: quiz.description,
        category: quiz.category,
        difficulty: quiz.difficulty,
        type: quiz.type,
        questions: [...quiz.questions],
        timeLimit: quiz.timeLimit,
        passingScore: quiz.passingScore,
        maxAttempts: quiz.maxAttempts,
        isActive: quiz.isActive,
        tags: [...quiz.tags]
      });
    } else {
      setFormData({
        title: '',
        description: '',
        category: '',
        difficulty: 'beginner',
        type: 'multiple-choice',
        questions: [],
        timeLimit: undefined,
        passingScore: 70,
        maxAttempts: 3,
        isActive: true,
        tags: []
      });
    }
    setErrors({});
    setNewQuestion({
      question: '',
      type: 'multiple-choice',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      points: 1
    });
  }, [quiz]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = '퀴즈 제목을 입력해주세요.';
    }
    if (!formData.description?.trim()) {
      newErrors.description = '퀴즈 설명을 입력해주세요.';
    }
    if (!formData.category?.trim()) {
      newErrors.category = '카테고리를 선택해주세요.';
    }
    if (!formData.questions || formData.questions.length === 0) {
      newErrors.questions = '최소 하나의 문제를 추가해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const addQuestion = () => {
    if (!newQuestion.question?.trim()) {
      alert('문제 내용을 입력해주세요.');
      return;
    }

    if (newQuestion.type === 'multiple-choice') {
      if (!newQuestion.options || newQuestion.options.some(opt => !opt.trim())) {
        alert('4지선다 문제는 모든 선택지를 입력해야 합니다.');
        return;
      }
      if (typeof newQuestion.correctAnswer !== 'number' || newQuestion.correctAnswer < 0 || newQuestion.correctAnswer >= 4) {
        alert('정답은 0-3 사이의 숫자여야 합니다.');
        return;
      }
    } else if (newQuestion.type === 'essay') {
      if (!newQuestion.correctAnswer || typeof newQuestion.correctAnswer !== 'string') {
        alert('주관식 문제의 정답을 입력해주세요.');
        return;
      }
    }

    const question: QuizQuestion = {
      question: newQuestion.question!,
      type: newQuestion.type!,
      options: newQuestion.type === 'multiple-choice' ? newQuestion.options : undefined,
      correctAnswer: newQuestion.correctAnswer!,
      explanation: newQuestion.explanation || '',
      points: newQuestion.points || 1
    };

    setFormData(prev => ({
      ...prev,
      questions: [...(prev.questions || []), question]
    }));

    // 새 문제 입력 필드 초기화
    setNewQuestion({
      question: '',
      type: 'multiple-choice',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      points: 1
    });
  };

  const removeQuestion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions?.filter((_, i) => i !== index) || []
    }));
  };

  const updateQuestion = (index: number, field: keyof QuizQuestion, value: any) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions?.map((q, i) => 
        i === index ? { ...q, [field]: value } : q
      ) || []
    }));
  };

  const updateNewQuestion = (field: keyof QuizQuestion, value: any) => {
    setNewQuestion(prev => ({ ...prev, [field]: value }));
  };

  const addTag = (tag: string) => {
    if (tag.trim() && !formData.tags?.includes(tag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tag.trim()]
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <div className="p-6 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white pb-4 border-b">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {quiz ? '✏️ 퀴즈 수정' : '➕ 새 퀴즈 추가'}
          </h2>
          <p className="text-gray-600">
            {quiz ? '기존 퀴즈를 수정합니다.' : '새로운 퀴즈를 추가합니다.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* 기본 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                퀴즈 제목 *
              </label>
              <Input
                value={formData.title || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="예: 자유형 기초 퀴즈"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                카테고리 *
              </label>
              <select
                value={formData.category || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.category ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">카테고리 선택</option>
                <option value="자유형">자유형</option>
                <option value="평영">평영</option>
                <option value="배영">배영</option>
                <option value="접영">접영</option>
                <option value="혼영">혼영</option>
                <option value="기본기">기본기</option>
                <option value="턴">턴</option>
                <option value="스타트">스타트</option>
                <option value="안전">안전</option>
                <option value="규칙">규칙</option>
              </select>
              {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                난이도
              </label>
              <select
                value={formData.difficulty || 'beginner'}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  difficulty: e.target.value as 'beginner' | 'intermediate' | 'advanced' 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="beginner">초급</option>
                <option value="intermediate">중급</option>
                <option value="advanced">고급</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                퀴즈 유형
              </label>
              <select
                value={formData.type || 'multiple-choice'}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  type: e.target.value as 'multiple-choice' | 'essay' 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="multiple-choice">4지선다</option>
                <option value="essay">주관식</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                상태
              </label>
              <select
                value={formData.isActive ? 'true' : 'false'}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.value === 'true' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="true">활성</option>
                <option value="false">비활성</option>
              </select>
            </div>
          </div>

          {/* 설명 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              퀴즈 설명 *
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="퀴즈에 대한 자세한 설명을 입력하세요."
              rows={3}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>

          {/* 설정 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                제한시간 (분)
              </label>
              <Input
                type="number"
                                 value={formData.timeLimit?.toString() || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, timeLimit: e.target.value ? Number(e.target.value) : undefined }))}
                placeholder="제한없음"
                min="1"
                max="180"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                통과점수 (%)
              </label>
              <Input
                type="number"
                                 value={formData.passingScore?.toString() || '70'}
                onChange={(e) => setFormData(prev => ({ ...prev, passingScore: Number(e.target.value) }))}
                min="0"
                max="100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                최대시도 횟수
              </label>
              <Input
                type="number"
                                 value={formData.maxAttempts?.toString() || '3'}
                onChange={(e) => setFormData(prev => ({ ...prev, maxAttempts: Number(e.target.value) }))}
                min="1"
                max="10"
              />
            </div>
          </div>

          {/* 태그 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              태그
            </label>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="태그 입력 후 Enter"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag((e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags?.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* 기존 문제 목록 */}
          {formData.questions && formData.questions.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">📝 등록된 문제</h3>
              <div className="space-y-4">
                {formData.questions.map((question, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-medium text-gray-900">문제 {index + 1}</h4>
                      <Button
                        type="button"
                        onClick={() => removeQuestion(index)}
                        variant="outline"
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        삭제
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">문제 내용</label>
                        <Input
                          value={question.question}
                          onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                          placeholder="문제 내용을 입력하세요"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">문제 유형</label>
                          <select
                            value={question.type}
                            onChange={(e) => updateQuestion(index, 'type', e.target.value as 'multiple-choice' | 'essay')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="multiple-choice">4지선다</option>
                            <option value="essay">주관식</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">배점</label>
                          <Input
                            type="number"
                            value={question.points.toString()}
                            onChange={(e) => updateQuestion(index, 'points', Number(e.target.value))}
                            min="1"
                            max="10"
                          />
                        </div>
                      </div>

                      {question.type === 'multiple-choice' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">선택지</label>
                          <div className="space-y-2">
                            {question.options?.map((option, optIndex) => (
                              <div key={optIndex} className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name={`correct-${index}`}
                                  checked={question.correctAnswer === optIndex}
                                  onChange={() => updateQuestion(index, 'correctAnswer', optIndex)}
                                  className="text-blue-600"
                                />
                                <Input
                                  value={option}
                                  onChange={(e) => {
                                    const newOptions = [...(question.options || [])];
                                    newOptions[optIndex] = e.target.value;
                                    updateQuestion(index, 'options', newOptions);
                                  }}
                                  placeholder={`선택지 ${optIndex + 1}`}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {question.type === 'essay' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">정답</label>
                          <Input
                            value={question.correctAnswer as string}
                            onChange={(e) => updateQuestion(index, 'correctAnswer', e.target.value)}
                            placeholder="정답을 입력하세요"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">해설 (선택사항)</label>
                        <textarea
                          value={question.explanation || ''}
                          onChange={(e) => updateQuestion(index, 'explanation', e.target.value)}
                          placeholder="문제에 대한 해설을 입력하세요"
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 새 문제 추가 */}
          <div className="border border-gray-200 rounded-lg p-4 bg-blue-50">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">➕ 새 문제 추가</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">문제 내용 *</label>
                <textarea
                  value={newQuestion.question || ''}
                  onChange={(e) => updateNewQuestion('question', e.target.value)}
                  placeholder="문제 내용을 입력하세요"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">문제 유형</label>
                  <select
                    value={newQuestion.type || 'multiple-choice'}
                    onChange={(e) => updateNewQuestion('type', e.target.value as 'multiple-choice' | 'essay')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="multiple-choice">4지선다</option>
                    <option value="essay">주관식</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">배점</label>
                  <Input
                    type="number"
                                         value={newQuestion.points?.toString() || '1'}
                    onChange={(e) => updateNewQuestion('points', Number(e.target.value))}
                    min="1"
                    max="10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">정답</label>
                  {newQuestion.type === 'multiple-choice' ? (
                    <select
                      value={newQuestion.correctAnswer as number}
                      onChange={(e) => updateNewQuestion('correctAnswer', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={0}>1번</option>
                      <option value={1}>2번</option>
                      <option value={2}>3번</option>
                      <option value={3}>4번</option>
                    </select>
                  ) : (
                    <Input
                      value={newQuestion.correctAnswer as string}
                      onChange={(e) => updateNewQuestion('correctAnswer', e.target.value)}
                      placeholder="정답을 입력하세요"
                    />
                  )}
                </div>
              </div>

              {newQuestion.type === 'multiple-choice' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">선택지</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {newQuestion.options?.map((option, index) => (
                      <Input
                        key={index}
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...(newQuestion.options || [])];
                          newOptions[index] = e.target.value;
                          updateNewQuestion('options', newOptions);
                        }}
                        placeholder={`선택지 ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">해설 (선택사항)</label>
                <textarea
                  value={newQuestion.explanation || ''}
                  onChange={(e) => updateNewQuestion('explanation', e.target.value)}
                  placeholder="문제에 대한 해설을 입력하세요"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <Button
                type="button"
                onClick={addQuestion}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                ➕ 문제 추가
              </Button>
            </div>
          </div>

          {errors.questions && <p className="text-red-500 text-sm">{errors.questions}</p>}

          {/* 버튼 */}
          <div className="sticky bottom-0 bg-white pt-4 border-t flex justify-end gap-3">
            <Button type="button" onClick={onClose} variant="outline">
              취소
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              {quiz ? '수정하기' : '추가하기'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default QuizForm;
