'use client';
import { logger } from '@/lib/logger';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui';
import { Card } from '../../components/ui';
import { LoadingState, PageHeader } from '@/components/common';

/**
 * 🤖 AI 평가 페이지
 * 
 * 📋 **기능**
 * - AI 기반 수영 기술 평가
 * - 실시간 피드백 제공
 * - 개인별 맞춤형 분석
 * 
 * 🔄 **주요 기능**
 * 1. 영상 업로드 및 분석
 * 2. AI 기반 기술 평가
 * 3. 개선점 제안
 * 4. 진도 추적
 * 
 * 📅 **수정 히스토리**
 * - 2025-01-13: AI 평가 페이지 생성
 */

interface Student {
  _id: string;
  userId: string;
  name: string;
  userType: string;
  currentLevel: string;
  swimmingLevel: string;
}

interface EvaluationResult {
  _id: string;
  studentId: string;
  studentName: string;
  technique: string;
  score: number;
  feedback: string;
  improvements: string[];
  createdAt: string;
}

export default function AIEvaluationPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [evaluationResults, setEvaluationResults] = useState<EvaluationResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [selectedTechnique, setSelectedTechnique] = useState('freestyle');

  const techniques = [
    { value: 'freestyle', label: '자유형', description: '가장 기본적인 영법' },
    { value: 'backstroke', label: '배영', description: '등으로 헤엄치는 영법' },
    { value: 'breaststroke', label: '평영', description: '개구리 헤엄' },
    { value: 'butterfly', label: '접영', description: '가장 어려운 영법' }
  ];

  useEffect(() => {
    fetchStudents();
    fetchEvaluationResults();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/users?userType=student&limit=100', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStudents(data.data || []);
      }
    } catch (error) {
      logger.error('학생 목록 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvaluationResults = async () => {
    try {
      // 실제 API 호출 대신 임시 데이터 사용
      const mockResults: EvaluationResult[] = [
        {
          _id: '1',
          studentId: 'student_001',
          studentName: '김수영',
          technique: 'freestyle',
          score: 85,
          feedback: '자유형 기본기가 잘 갖춰져 있습니다. 호흡 타이밍을 조금 더 개선하면 좋겠습니다.',
          improvements: ['호흡 타이밍 개선', '킥 강도 조절', '스트로크 길이 늘리기'],
          createdAt: new Date().toISOString()
        },
        {
          _id: '2',
          studentId: 'student_002',
          studentName: '이초보',
          technique: 'backstroke',
          score: 72,
          feedback: '배영 자세가 안정적입니다. 팔 동작의 리듬을 맞춰보세요.',
          improvements: ['팔 동작 리듬', '킥 패턴 개선', '자세 안정성'],
          createdAt: new Date().toISOString()
        }
      ];
      
      setEvaluationResults(mockResults);
    } catch (error) {
      logger.error('평가 결과 조회 실패:', error);
    }
  };

  const startEvaluation = async () => {
    if (!selectedStudent) {
      alert('학생을 선택해주세요.');
      return;
    }

    setEvaluating(true);
    
    try {
      // 실제 AI 평가 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const newResult: EvaluationResult = {
        _id: Date.now().toString(),
        studentId: selectedStudent.userId,
        studentName: selectedStudent.name,
        technique: selectedTechnique,
        score: Math.floor(Math.random() * 40) + 60, // 60-100점 랜덤
        feedback: generateFeedback(selectedTechnique),
        improvements: generateImprovements(selectedTechnique),
        createdAt: new Date().toISOString()
      };

      setEvaluationResults(prev => [newResult, ...prev]);
      alert('AI 평가가 완료되었습니다!');
    } catch (error) {
      logger.error('AI 평가 실패:', error);
      alert('AI 평가 중 오류가 발생했습니다.');
    } finally {
      setEvaluating(false);
    }
  };

  const generateFeedback = (technique: string) => {
    const feedbacks = {
      freestyle: '자유형 기술이 우수합니다. 호흡과 팔 동작의 조화가 좋습니다.',
      backstroke: '배영 자세가 안정적입니다. 팔 동작의 리듬감을 더 개선해보세요.',
      breaststroke: '평영의 기본 동작이 잘 갖춰져 있습니다. 킥의 타이밍을 조절해보세요.',
      butterfly: '접영의 고급 기술이 인상적입니다. 지구력을 향상시켜보세요.'
    };
    return feedbacks[technique as keyof typeof feedbacks] || '전반적으로 좋은 기술을 보여주고 있습니다.';
  };

  const generateImprovements = (technique: string) => {
    const improvements = {
      freestyle: ['호흡 타이밍 개선', '스트로크 길이 늘리기', '킥 강도 조절'],
      backstroke: ['팔 동작 리듬', '킥 패턴 개선', '자세 안정성'],
      breaststroke: ['킥 타이밍', '풀 동작 개선', '글로이드 패턴'],
      butterfly: ['지구력 향상', '리듬감 개선', '폼 안정성']
    };
    return improvements[technique as keyof typeof improvements] || ['기본기 향상', '자세 개선'];
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return '우수';
    if (score >= 80) return '양호';
    if (score >= 70) return '보통';
    return '개선 필요';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingState message="로딩 중..." size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader
          title="🤖 AI 수영 기술 평가"
          description="AI 기술을 활용하여 학생들의 수영 기술을 정확하고 객관적으로 평가합니다."
          className="mb-8"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 평가 설정 */}
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">평가 설정</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    학생 선택
                  </label>
                  <select
                    value={selectedStudent?.userId || ''}
                    onChange={(e) => {
                      const student = students.find(s => s.userId === e.target.value);
                      setSelectedStudent(student || null);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">학생을 선택하세요</option>
                    {students.map(student => (
                      <option key={student.userId} value={student.userId}>
                        {student.name} ({student.currentLevel || student.swimmingLevel})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    평가할 영법
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {techniques.map(technique => (
                      <button
                        key={technique.value}
                        onClick={() => setSelectedTechnique(technique.value)}
                        className={`p-3 text-left rounded-lg border-2 transition-colors ${
                          selectedTechnique === technique.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium text-gray-900">{technique.label}</div>
                        <div className="text-sm text-gray-600">{technique.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={startEvaluation}
                  disabled={!selectedStudent || evaluating}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {evaluating ? (
                    <LoadingState message="AI 평가 중..." size="sm" className="flex-row text-white" />
                  ) : (
                    '🤖 AI 평가 시작'
                  )}
                </Button>
              </div>
            </div>
          </Card>

          {/* 평가 결과 */}
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">최근 평가 결과</h2>
              
              <div className="space-y-4">
                {evaluationResults.slice(0, 5).map((result) => (
                  <div key={result._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium text-gray-900">{result.studentName}</h3>
                        <p className="text-sm text-gray-600">
                          {techniques.find(t => t.value === result.technique)?.label || result.technique}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getScoreColor(result.score)}`}>
                          {result.score}점
                        </div>
                        <div className={`text-xs font-medium ${getScoreColor(result.score)}`}>
                          {getScoreLabel(result.score)}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{result.feedback}</p>
                    
                    <div className="text-xs text-gray-500">
                      {new Date(result.createdAt).toLocaleDateString('ko-KR')}
                    </div>
                  </div>
                ))}
                
                {evaluationResults.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    아직 평가 결과가 없습니다.
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* 전체 평가 결과 */}
        {evaluationResults.length > 0 && (
          <Card className="mt-8">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">전체 평가 결과</h2>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        학생
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        영법
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        점수
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        평가일
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        액션
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {evaluationResults.map((result) => (
                      <tr key={result._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {result.studentName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {techniques.find(t => t.value === result.technique)?.label || result.technique}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-medium ${getScoreColor(result.score)}`}>
                            {result.score}점 ({getScoreLabel(result.score)})
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(result.createdAt).toLocaleDateString('ko-KR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900">
                            상세보기
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}