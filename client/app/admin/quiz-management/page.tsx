/**
 * @file 관리자용 퀴즈 관리 페이지
 * @description 관리자가 퀴즈를 생성, 수정, 삭제하고 관리할 수 있는 페이지
 * @date 2025-01-13
 * @author JJ Swim Lab
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';
import Badge from '../../../components/ui/Badge';

// 퀴즈 카테고리 상수
const QUIZ_CATEGORIES = [
  '자유형',
  '배영',
  '평영',
  '접영',
  '혼영',
  '기초기술',
  '호흡법',
  '발차기',
  '손짓',
  '턴',
  '스타트',
  '안전수칙',
  '체력향상',
  '기타'
] as const;

// 퀴즈 난이도 상수
const QUIZ_DIFFICULTIES = [
  { value: 'beginner', label: '초급', color: 'bg-green-100 text-green-800' },
  { value: 'intermediate', label: '중급', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'advanced', label: '고급', color: 'bg-red-100 text-red-800' }
] as const;

// 퀴즈 타입 상수
const QUIZ_TYPES = [
  { value: 'multiple-choice', label: '객관식', icon: '📝' },
  { value: 'essay', label: '주관식', icon: '✍️' }
] as const;

interface Quiz {
  _id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  type: 'multiple-choice' | 'essay';
  questions: Array<{
    question: string;
    type: 'multiple-choice' | 'essay';
    options?: string[];
    correctAnswer: string | string[];
    explanation?: string;
    points: number;
  }>;
  timeLimit?: number;
  passingScore: number;
  maxAttempts: number;
  isActive: boolean;
  createdBy: string;
  assignedTo?: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export default function QuizManagementPage() {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState<Quiz[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
    total: number;
    byCategory: { [key: string]: number };
    byDifficulty: { [key: string]: number };
    byType: { [key: string]: number };
  }>({ total: 0, byCategory: {}, byDifficulty: {}, byType: {} });

  useEffect(() => {
    if (user?.userType === 'superAdmin' || user?.userType === 'centerAdmin') {
      fetchQuizzes();
    }
  }, [user]);

  useEffect(() => {
    filterQuizzes();
    calculateStats();
  }, [quizzes, searchTerm, selectedCategory, selectedDifficulty]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('❌ JWT 토큰이 없습니다.');
        return;
      }

      const response = await fetch('http://localhost:5000/api/quiz', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const apiQuizzes = data.data || data;
        
        if (Array.isArray(apiQuizzes)) {
          setQuizzes(apiQuizzes);
        } else {
          console.error('❌ 퀴즈 데이터 형식 오류:', apiQuizzes);
          setQuizzes([]);
        }
      } else {
        console.error('❌ 퀴즈 조회 실패:', response.status);
        setQuizzes([]);
      }
    } catch (error) {
      console.error('❌ 퀴즈 조회 중 오류:', error);
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  };

  const filterQuizzes = () => {
    let filtered = quizzes;

    // 검색어 필터
    if (searchTerm) {
      filtered = filtered.filter(quiz =>
        quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quiz.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quiz.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 카테고리 필터
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(quiz => quiz.category === selectedCategory);
    }

    // 난이도 필터
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(quiz => quiz.difficulty === selectedDifficulty);
    }

    setFilteredQuizzes(filtered);
  };

  const calculateStats = () => {
    const byCategory: { [key: string]: number } = {};
    const byDifficulty: { [key: string]: number } = {};
    const byType: { [key: string]: number } = {};

    quizzes.forEach(quiz => {
      // 카테고리별 통계
      byCategory[quiz.category] = (byCategory[quiz.category] || 0) + 1;
      
      // 난이도별 통계
      const difficultyKey = quiz.difficulty === 'beginner' ? '초급' :
                          quiz.difficulty === 'intermediate' ? '중급' : '고급';
      byDifficulty[difficultyKey] = (byDifficulty[difficultyKey] || 0) + 1;
      
      // 타입별 통계
      const typeKey = quiz.type === 'multiple-choice' ? '객관식' : '주관식';
      byType[typeKey] = (byType[typeKey] || 0) + 1;
    });

    setStats({
      total: quizzes.length,
      byCategory,
      byDifficulty,
      byType
    });
  };

  const handleFormSubmit = async (quizData: Partial<Quiz>) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('로그인이 필요합니다.');
        return;
      }

      const url = editingQuiz 
        ? `http://localhost:5000/api/quiz/${editingQuiz._id}`
        : 'http://localhost:5000/api/quiz';
      
      const method = editingQuiz ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(quizData)
      });

      if (response.ok) {
        alert(editingQuiz ? '퀴즈가 수정되었습니다!' : '퀴즈가 추가되었습니다!');
        setIsFormOpen(false);
        setEditingQuiz(null);
        fetchQuizzes();
      } else {
        const errorData = await response.json();
        alert(`오류: ${errorData.message || '퀴즈 저장에 실패했습니다.'}`);
      }
    } catch (error) {
      console.error('❌ 퀴즈 저장 중 오류:', error);
      alert('퀴즈 저장 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async (quizId: string) => {
    if (!confirm('이 퀴즈를 삭제하시겠습니까?')) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('로그인이 필요합니다.');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/quiz/${quizId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert('퀴즈가 삭제되었습니다!');
        fetchQuizzes();
      } else {
        const errorData = await response.json();
        alert(`오류: ${errorData.message || '퀴즈 삭제에 실패했습니다.'}`);
      }
    } catch (error) {
      console.error('❌ 퀴즈 삭제 중 오류:', error);
      alert('퀴즈 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleCardClick = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setIsDetailModalOpen(true);
  };

  const handleEdit = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    setIsFormOpen(true);
  };

  if (!user || (user.userType !== 'superAdmin' && user.userType !== 'centerAdmin')) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">접근 권한이 없습니다</h1>
          <p className="text-gray-600">관리자만 이 페이지에 접근할 수 있습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            🧠 퀴즈 관리 시스템
          </h1>
          <p className="mt-2 text-gray-600">
            수영 교육을 위한 다양한 퀴즈를 생성하고 관리합니다.
          </p>
        </div>

        {/* 통계 섹션 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100">
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-500 rounded-full">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-600">총 퀴즈</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.total}개</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100">
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-500 rounded-full">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-green-600">카테고리</p>
                  <p className="text-2xl font-bold text-green-900">{Object.keys(stats.byCategory).length}개</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100">
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-500 rounded-full">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-purple-600">난이도</p>
                  <p className="text-2xl font-bold text-purple-900">{Object.keys(stats.byDifficulty).length}단계</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-r from-orange-50 to-orange-100">
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-orange-500 rounded-full">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-orange-600">타입</p>
                  <p className="text-2xl font-bold text-orange-900">{Object.keys(stats.byType).length}종류</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* 상세 통계 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📂 카테고리별 분포</h3>
              <div className="space-y-3">
                {Object.entries(stats.byCategory)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 5)
                  .map(([category, count]) => (
                    <div key={category} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{category}</span>
                      <div className="flex items-center">
                        <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${(count / stats.total) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{count}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 난이도별 분포</h3>
              <div className="space-y-3">
                {Object.entries(stats.byDifficulty)
                  .sort(([,a], [,b]) => b - a)
                  .map(([difficulty, count]) => (
                    <div key={difficulty} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{difficulty}</span>
                      <div className="flex items-center">
                        <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className={`h-2 rounded-full ${
                              difficulty === '초급' ? 'bg-green-500' :
                              difficulty === '중급' ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${(count / stats.total) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{count}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📝 타입별 분포</h3>
              <div className="space-y-3">
                {Object.entries(stats.byType)
                  .sort(([,a], [,b]) => b - a)
                  .map(([type, count]) => (
                    <div key={type} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{type}</span>
                      <div className="flex items-center">
                        <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full" 
                            style={{ width: `${(count / stats.total) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{count}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </Card>
        </div>

        {/* 검색 및 필터 */}
        <Card className="mb-6">
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="퀴즈 제목, 설명, 카테고리로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">전체 카테고리</option>
                  {QUIZ_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">전체 난이도</option>
                  {QUIZ_DIFFICULTIES.map((difficulty) => (
                    <option key={difficulty.value} value={difficulty.value}>
                      {difficulty.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* 액션 버튼 */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-4">
            <Button
              onClick={() => setIsFormOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              ➕ 새 퀴즈 추가
            </Button>
          </div>
        </div>

        {/* 퀴즈 목록 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz) => (
            <Card key={quiz._id} className="hover:shadow-lg transition-shadow duration-200">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{quiz.title}</h3>
                  <div className="flex gap-2">
                    <Badge className={QUIZ_DIFFICULTIES.find(d => d.value === quiz.difficulty)?.color || 'bg-gray-100 text-gray-800'}>
                      {QUIZ_DIFFICULTIES.find(d => d.value === quiz.difficulty)?.label || quiz.difficulty}
                    </Badge>
                    <Badge className="bg-blue-100 text-blue-800">
                      {QUIZ_TYPES.find(t => t.value === quiz.type)?.icon} {QUIZ_TYPES.find(t => t.value === quiz.type)?.label}
                    </Badge>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {quiz.description}
                </p>

                <div className="mb-4 space-y-2">
                  <div className="text-sm text-gray-500">
                    📂 카테고리: {quiz.category}
                  </div>
                  <div className="text-sm text-gray-500">
                    📋 문제: {quiz.questions?.length || 0}개
                  </div>
                  <div className="text-sm text-gray-500">
                    ⏱️ 제한시간: {quiz.timeLimit || '무제한'}분
                  </div>
                  <div className="text-sm text-gray-500">
                    🎯 합격점: {quiz.passingScore}점
                  </div>
                </div>

                <div className="flex justify-between items-center mb-4">
                  <div className="text-sm text-gray-500">
                    <div>생성일: {new Date(quiz.createdAt).toLocaleDateString()}</div>
                    <div className={quiz.isActive ? 'text-green-600' : 'text-red-600'}>
                      {quiz.isActive ? '활성' : '비활성'}
                    </div>
                  </div>
                </div>

                {/* 액션 버튼들 */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    onClick={() => handleCardClick(quiz)}
                    variant="outline"
                    className="flex-1 bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100"
                  >
                    👁️ 상세보기
                  </Button>
                  <Button
                    onClick={() => handleEdit(quiz)}
                    variant="outline"
                    className="flex-1 bg-green-50 text-green-700 border-green-300 hover:bg-green-100"
                  >
                    ✏️ 수정
                  </Button>
                  <Button
                    onClick={() => handleDelete(quiz._id)}
                    variant="outline"
                    className="flex-1 bg-red-50 text-red-700 border-red-300 hover:bg-red-100"
                  >
                    🗑️ 삭제
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredQuizzes.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">
              등록된 퀴즈가 없습니다.
            </div>
          </div>
        )}

        {/* 퀴즈 상세보기 모달 */}
        {isDetailModalOpen && selectedQuiz && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">{selectedQuiz.title}</h3>
                  <button
                    onClick={() => {
                      setIsDetailModalOpen(false);
                      setSelectedQuiz(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-gray-900">설명</h4>
                    <p className="text-gray-600">{selectedQuiz.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900">카테고리</h4>
                      <p className="text-gray-600">{selectedQuiz.category}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">난이도</h4>
                      <p className="text-gray-600">{QUIZ_DIFFICULTIES.find(d => d.value === selectedQuiz.difficulty)?.label}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">타입</h4>
                      <p className="text-gray-600">{QUIZ_TYPES.find(t => t.value === selectedQuiz.type)?.label}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">제한시간</h4>
                      <p className="text-gray-600">{selectedQuiz.timeLimit || '무제한'}분</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">합격점</h4>
                      <p className="text-gray-600">{selectedQuiz.passingScore}점</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">최대 시도</h4>
                      <p className="text-gray-600">{selectedQuiz.maxAttempts}회</p>
                    </div>
                  </div>

                  {selectedQuiz.questions && selectedQuiz.questions.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900">문제 목록</h4>
                      <div className="space-y-4 mt-2">
                        {selectedQuiz.questions.map((question, index) => (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h5 className="font-medium text-gray-800">문제 {index + 1}</h5>
                              <Badge className="bg-gray-100 text-gray-800">
                                {question.points}점
                              </Badge>
                            </div>
                            <p className="text-gray-600 mb-2">{question.question}</p>
                            {question.type === 'multiple-choice' && question.options && (
                              <div className="space-y-1">
                                {question.options.map((option, optionIndex) => (
                                  <div key={optionIndex} className="text-sm text-gray-500">
                                    {String.fromCharCode(65 + optionIndex)}. {option}
                                  </div>
                                ))}
                              </div>
                            )}
                            {question.explanation && (
                              <div className="mt-2 p-2 bg-blue-50 rounded">
                                <p className="text-sm text-blue-800">
                                  <strong>해설:</strong> {question.explanation}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end space-x-4 pt-4 border-t">
                    <Button
                      onClick={() => handleEdit(selectedQuiz)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      ✏️ 수정
                    </Button>
                    <Button
                      onClick={() => handleDelete(selectedQuiz._id)}
                      variant="outline"
                      className="border-red-300 text-red-700 hover:bg-red-50"
                    >
                      🗑️ 삭제
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 퀴즈 추가/수정 폼 */}
        {isFormOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    {editingQuiz ? '퀴즈 수정' : '새 퀴즈 추가'}
                  </h3>
                  <button
                    onClick={() => {
                      setIsFormOpen(false);
                      setEditingQuiz(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const quizData = {
                    title: formData.get('title') as string,
                    description: formData.get('description') as string,
                    category: formData.get('category') as string,
                    difficulty: formData.get('difficulty') as 'beginner' | 'intermediate' | 'advanced',
                    type: formData.get('type') as 'multiple-choice' | 'essay',
                    timeLimit: parseInt(formData.get('timeLimit') as string) || undefined,
                    passingScore: parseInt(formData.get('passingScore') as string),
                    maxAttempts: parseInt(formData.get('maxAttempts') as string),
                    questions: editingQuiz?.questions || []
                  };
                  handleFormSubmit(quizData);
                }} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                        퀴즈 제목 *
                      </label>
                      <Input
                        id="title"
                        name="title"
                        defaultValue={editingQuiz?.title}
                        required
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                        카테고리 *
                      </label>
                      <select
                        id="category"
                        name="category"
                        defaultValue={editingQuiz?.category || '자유형'}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {QUIZ_CATEGORIES.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                      설명 *
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      defaultValue={editingQuiz?.description}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-2">
                        난이도 *
                      </label>
                      <select
                        id="difficulty"
                        name="difficulty"
                        defaultValue={editingQuiz?.difficulty || 'beginner'}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {QUIZ_DIFFICULTIES.map((difficulty) => (
                          <option key={difficulty.value} value={difficulty.value}>
                            {difficulty.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                        타입 *
                      </label>
                      <select
                        id="type"
                        name="type"
                        defaultValue={editingQuiz?.type || 'multiple-choice'}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {QUIZ_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.icon} {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="timeLimit" className="block text-sm font-medium text-gray-700 mb-2">
                        제한시간 (분)
                      </label>
                      <Input
                        id="timeLimit"
                        name="timeLimit"
                        type="number"
                        defaultValue={editingQuiz?.timeLimit?.toString()}
                        min="1"
                        max="180"
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="passingScore" className="block text-sm font-medium text-gray-700 mb-2">
                        합격점 *
                      </label>
                      <Input
                        id="passingScore"
                        name="passingScore"
                        type="number"
                        defaultValue={(editingQuiz?.passingScore || 70).toString()}
                        min="0"
                        max="100"
                        required
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label htmlFor="maxAttempts" className="block text-sm font-medium text-gray-700 mb-2">
                        최대 시도 횟수 *
                      </label>
                      <Input
                        id="maxAttempts"
                        name="maxAttempts"
                        type="number"
                        defaultValue={(editingQuiz?.maxAttempts || 3).toString()}
                        min="1"
                        required
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-4">
                    <Button
                      type="button"
                      onClick={() => {
                        setIsFormOpen(false);
                        setEditingQuiz(null);
                      }}
                      variant="outline"
                    >
                      취소
                    </Button>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                      {editingQuiz ? '수정' : '추가'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
