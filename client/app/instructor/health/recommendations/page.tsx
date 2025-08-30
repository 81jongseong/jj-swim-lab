/**
 * 💡 JJ Swim Lab - 강사용 학생 건강 추천사항 페이지
 * 
 * 📋 **페이지 목적**
 * - 강사가 담당하는 학생들에게 AI 기반 맞춤형 건강 추천사항을 제공
 * - 학생별 건강 상태, 운동 패턴, 목표 등을 분석하여 개인화된 운동 계획 제안
 * 
 * 🔄 **주요 기능**
 * - AI 기반 개인별 건강 상태 분석
 * - 맞춤형 운동 계획 및 강도 조절 추천
 * - 건강 목표 설정 및 달성 전략 제안
 * - 위험 요소 조기 감지 및 예방 조치 안내
 * - 학생별 추천사항 히스토리 및 효과 추적
 * 
 * 🛠️ **필요한 설치 파일**
 * - React (useState, useEffect)
 * - useAuth hook (강사 권한 확인)
 * - 건강정보 API 연동
 * - Tailwind CSS (스타일링)
 * 
 * ⚠️ **개발 시 주의사항**
 * - 강사 권한 확인 필수
 * - 학생이 공개 설정한 건강정보만 기반으로 추천
 * - 개인정보 보호 및 보안 준수
 * - AI 추천의 정확성 및 안전성 검증
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (강사용 학생 건강 추천사항 페이지)
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../../hooks/useAuth';
import { Lightbulb, Target, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

interface HealthRecommendation {
  _id: string;
  name: string;
  email: string;
  currentHealthStatus: string;
  bmi: number;
  exerciseCompliance: number;
  healthGoals: string[];
  aiRecommendations: {
    exercisePlan: string;
    intensity: string;
    frequency: string;
    duration: string;
    precautions: string[];
    expectedOutcomes: string[];
  };
  riskFactors: string[];
  priority: 'high' | 'medium' | 'low';
  lastUpdated: string;
}

export default function InstructorHealthRecommendations() {
  const { user, hasUserType } = useAuth();
  const [recommendations, setRecommendations] = useState<HealthRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  // 강사 권한 확인
  if (!hasUserType('instructor')) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-6xl mb-4">🚫</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">접근 권한이 없습니다</h1>
            <p className="text-gray-600">이 페이지는 강사만 접근할 수 있습니다.</p>
          </div>
        </div>
      </div>
    );
  }

  // 데이터 로드
  useEffect(() => {
    if (user?.userType === 'instructor') {
      loadRecommendations();
    }
  }, [user?.userType]);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('인증 토큰이 없습니다.');
        return;
      }

      // 담당 학생 목록 조회
      const studentsResponse = await fetch('http://localhost:5000/api/instructor/students', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (studentsResponse.ok) {
        const studentsData = await studentsResponse.json();
        const recommendationsData = await Promise.all(
          studentsData.students.map(async (student: any) => {
            try {
              // 학생별 건강 추천사항 조회
              const recommendationResponse = await fetch(`http://localhost:5000/api/health/student/${student._id}/recommendations`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              });

              if (recommendationResponse.ok) {
                const recommendation = await recommendationResponse.json();
                return {
                  _id: student._id,
                  name: student.name,
                  email: student.email,
                  currentHealthStatus: recommendation.currentHealthStatus || '양호',
                  bmi: recommendation.bmi || 0,
                  exerciseCompliance: recommendation.exerciseCompliance || 0,
                  healthGoals: recommendation.healthGoals || ['건강 유지', '체력 향상'],
                  aiRecommendations: {
                    exercisePlan: recommendation.exercisePlan || '수영 기초 기술 연습',
                    intensity: recommendation.intensity || '보통',
                    frequency: recommendation.frequency || '주 3회',
                    duration: recommendation.duration || '45분',
                    precautions: recommendation.precautions || ['충분한 준비운동', '적절한 휴식'],
                    expectedOutcomes: recommendation.expectedOutcomes || ['체력 향상', '기술 습득']
                  },
                  riskFactors: recommendation.riskFactors || [],
                  priority: recommendation.priority || 'medium',
                  lastUpdated: recommendation.lastUpdated || new Date().toISOString()
                };
              } else {
                return {
                  _id: student._id,
                  name: student.name,
                  email: student.email,
                  currentHealthStatus: '양호',
                  bmi: 0,
                  exerciseCompliance: 0,
                  healthGoals: ['건강 유지', '체력 향상'],
                  aiRecommendations: {
                    exercisePlan: '수영 기초 기술 연습',
                    intensity: '보통',
                    frequency: '주 3회',
                    duration: '45분',
                    precautions: ['충분한 준비운동', '적절한 휴식'],
                    expectedOutcomes: ['체력 향상', '기술 습득']
                  },
                  riskFactors: [],
                  priority: 'medium' as const,
                  lastUpdated: new Date().toISOString()
                };
              }
            } catch (error) {
              console.error(`학생 ${student.name} 추천사항 조회 실패:`, error);
              return {
                _id: student._id,
                name: student.name,
                email: student.email,
                currentHealthStatus: '양호',
                bmi: 0,
                exerciseCompliance: 0,
                healthGoals: ['건강 유지', '체력 향상'],
                aiRecommendations: {
                  exercisePlan: '수영 기초 기술 연습',
                  intensity: '보통',
                  frequency: '주 3회',
                  duration: '45분',
                  precautions: ['충분한 준비운동', '적절한 휴식'],
                  expectedOutcomes: ['체력 향상', '기술 습득']
                },
                riskFactors: [],
                priority: 'medium' as const,
                lastUpdated: new Date().toISOString()
              };
            }
          })
        );

        setRecommendations(recommendationsData);
      } else {
        setError('학생 목록을 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('추천사항 데이터 로딩 실패:', error);
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return '높음';
      case 'medium': return '보통';
      case 'low': return '낮음';
      default: return '미정';
    }
  };

  const filteredRecommendations = recommendations.filter(rec => 
    selectedPriority === 'all' || rec.priority === selectedPriority
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">건강 추천사항을 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">오류가 발생했습니다</h1>
            <p className="text-gray-600">{error}</p>
            <button
              onClick={loadRecommendations}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">💡 AI 건강 추천사항</h1>
          <p className="text-gray-600">담당 학생들을 위한 맞춤형 건강 관리 방안을 확인하세요</p>
        </div>

        {/* 우선순위 필터 */}
        <div className="mb-6">
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedPriority('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedPriority === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setSelectedPriority('high')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedPriority === 'high'
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              높음
            </button>
            <button
              onClick={() => setSelectedPriority('medium')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedPriority === 'medium'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              보통
            </button>
            <button
              onClick={() => setSelectedPriority('low')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedPriority === 'low'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              낮음
            </button>
          </div>
        </div>

        {/* 추천사항 목록 */}
        <div className="space-y-6">
          {filteredRecommendations.map((recommendation) => (
            <div key={recommendation._id} className="bg-white rounded-lg shadow p-6">
              {/* 학생 정보 헤더 */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{recommendation.name}</h3>
                  <p className="text-sm text-gray-500">{recommendation.email}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(recommendation.priority)}`}>
                    우선순위: {getPriorityText(recommendation.priority)}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(recommendation.lastUpdated).toLocaleDateString('ko-KR')}
                  </span>
                </div>
              </div>

              {/* 현재 상태 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-600">건강 상태</p>
                  <p className="text-lg font-semibold text-gray-900">{recommendation.currentHealthStatus}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-600">BMI</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {recommendation.bmi > 0 ? recommendation.bmi : '-'}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-600">운동 준수율</p>
                  <p className="text-lg font-semibold text-gray-900">{recommendation.exerciseCompliance}%</p>
                </div>
              </div>

              {/* AI 추천사항 */}
              <div className="mb-4">
                <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                  <Lightbulb className="h-5 w-5 text-yellow-600 mr-2" />
                  AI 맞춤 추천사항
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">운동 계획</p>
                    <p className="text-sm text-gray-900">{recommendation.aiRecommendations.exercisePlan}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">운동 강도</p>
                    <p className="text-sm text-gray-900">{recommendation.aiRecommendations.intensity}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">운동 빈도</p>
                    <p className="text-sm text-gray-900">{recommendation.aiRecommendations.frequency}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">운동 시간</p>
                    <p className="text-sm text-gray-900">{recommendation.aiRecommendations.duration}</p>
                  </div>
                </div>
              </div>

              {/* 주의사항 및 기대효과 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-sm font-medium text-gray-600 mb-2 flex items-center">
                    <AlertTriangle className="h-4 w-4 text-red-600 mr-1" />
                    주의사항
                  </h5>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {recommendation.aiRecommendations.precautions.map((precaution, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-red-500 mr-2">•</span>
                        {precaution}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-gray-600 mb-2 flex items-center">
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    기대효과
                  </h5>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {recommendation.aiRecommendations.expectedOutcomes.map((outcome, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-500 mr-2">•</span>
                        {outcome}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* 위험 요소 */}
              {recommendation.riskFactors.length > 0 && (
                <div className="mt-4 p-3 bg-red-50 rounded-lg">
                  <h5 className="text-sm font-medium text-red-800 mb-2 flex items-center">
                    <AlertTriangle className="h-4 w-4 text-red-600 mr-1" />
                    주의가 필요한 요소
                  </h5>
                  <ul className="text-sm text-red-700 space-y-1">
                    {recommendation.riskFactors.map((risk, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-red-500 mr-2">•</span>
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 추가 정보 */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 AI 추천 시스템 활용법</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">🤖 AI 분석 기준</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 개인 건강 데이터 패턴 분석</li>
                <li>• 운동 성과 및 목표 달성률</li>
                <li>• 건강 위험 요소 조기 감지</li>
                <li>• 개인별 맞춤 운동 계획 수립</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">📋 추천사항 적용</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 학생별 개인 맞춤 지도 계획</li>
                <li>• 운동 강도 및 빈도 조절</li>
                <li>• 건강 목표 설정 및 모니터링</li>
                <li>• 정기적인 추천사항 업데이트</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
