/**
 * 📊 JJ Swim Lab - 센터 관리자용 알고리즘 성과 모니터링
 * 
 * 📋 **페이지 개요**
 * - 센터 내 강사들의 알고리즘 사용 현황 모니터링
 * - 알고리즘별 성공률 및 효과성 분석
 * - 강사별 성과 비교 및 교육 필요성 파악
 * - 센터 전체 운동 처방 품질 관리
 * 
 * 🔗 **연동 데이터**
 * - ExercisePrescription: 운동 처방 데이터
 * - User: 강사 및 회원 정보
 * - Center: 센터 정보
 * 
 * 📅 **개발 히스토리**
 * - 2025-01-22: 센터 관리자용 성과 모니터링 시스템 구현
 */

'use client';

import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { RefreshButton } from '@/components/ui/RefreshButton';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Award, 
  Target,
  Activity,
  Calendar,
  Clock,
  Heart,
  Brain,
  AlertTriangle,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';

interface InstructorPerformance {
  instructorId: string;
  instructorName: string;
  totalPrescriptions: number;
  algorithmUsage: {
    [algorithm: string]: {
      count: number;
      successRate: number;
      averageCompletionRate: number;
    };
  };
  overallSuccessRate: number;
  memberSatisfaction: number;
  lastUpdated: string;
}

interface AlgorithmStats {
  algorithm: string;
  totalUsage: number;
  averageSuccessRate: number;
  averageCompletionRate: number;
  memberSatisfaction: number;
  trend: 'up' | 'down' | 'stable';
  recommendation: string;
}

interface CenterStats {
  totalMembers: number;
  activePrescriptions: number;
  averageSuccessRate: number;
  topPerformingAlgorithm: string;
  improvementAreas: string[];
}

export default function AlgorithmPerformanceMonitoring() {
  const [isLoading, setIsLoading] = useState(false);
  const [instructorPerformance, setInstructorPerformance] = useState<InstructorPerformance[]>([]);
  const [algorithmStats, setAlgorithmStats] = useState<AlgorithmStats[]>([]);
  const [centerStats, setCenterStats] = useState<CenterStats | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'week' | 'month' | 'quarter'>('month');
  const [activeTab, setActiveTab] = useState<'overview' | 'instructors' | 'algorithms' | 'recommendations'>('overview');

  // 알고리즘 정보
  const algorithms = {
    karvonen: { name: 'Karvonen Formula', color: 'bg-blue-100 text-blue-800' },
    max_hr_percentage: { name: '최대 심박수 백분율', color: 'bg-green-100 text-green-800' },
    vo2_max_percentage: { name: 'VO2 Max 백분율', color: 'bg-purple-100 text-purple-800' },
    rpe_based: { name: 'RPE 기반', color: 'bg-yellow-100 text-yellow-800' },
    hybrid: { name: '하이브리드', color: 'bg-orange-100 text-orange-800' },
    ai_adaptive: { name: 'AI 적응형', color: 'bg-red-100 text-red-800' }
  };

  // 샘플 데이터 로드
  const loadSampleData = async () => {
    setIsLoading(true);
    try {
      // 강사별 성과 데이터
      const sampleInstructors: InstructorPerformance[] = [
        {
          instructorId: '1',
          instructorName: '김강사',
          totalPrescriptions: 45,
          algorithmUsage: {
            karvonen: { count: 20, successRate: 85, averageCompletionRate: 82 },
            hybrid: { count: 15, successRate: 88, averageCompletionRate: 85 },
            ai_adaptive: { count: 10, successRate: 90, averageCompletionRate: 87 }
          },
          overallSuccessRate: 87,
          memberSatisfaction: 4.3,
          lastUpdated: '2025-01-21'
        },
        {
          instructorId: '2',
          instructorName: '이강사',
          totalPrescriptions: 38,
          algorithmUsage: {
            max_hr_percentage: { count: 25, successRate: 72, averageCompletionRate: 75 },
            karvonen: { count: 13, successRate: 83, averageCompletionRate: 80 }
          },
          overallSuccessRate: 76,
          memberSatisfaction: 3.9,
          lastUpdated: '2025-01-20'
        },
        {
          instructorId: '3',
          instructorName: '박강사',
          totalPrescriptions: 52,
          algorithmUsage: {
            ai_adaptive: { count: 30, successRate: 92, averageCompletionRate: 89 },
            hybrid: { count: 22, successRate: 89, averageCompletionRate: 86 }
          },
          overallSuccessRate: 91,
          memberSatisfaction: 4.6,
          lastUpdated: '2025-01-21'
        }
      ];

      // 알고리즘별 통계
      const sampleAlgorithmStats: AlgorithmStats[] = [
        {
          algorithm: 'ai_adaptive',
          totalUsage: 40,
          averageSuccessRate: 91,
          averageCompletionRate: 88,
          memberSatisfaction: 4.5,
          trend: 'up',
          recommendation: '최고 성과 알고리즘. 신규 회원에게 적극 추천'
        },
        {
          algorithm: 'hybrid',
          totalUsage: 37,
          averageSuccessRate: 88,
          averageCompletionRate: 85,
          memberSatisfaction: 4.4,
          trend: 'up',
          recommendation: '안정적이고 높은 성과. 경험자 회원에게 적합'
        },
        {
          algorithm: 'karvonen',
          totalUsage: 33,
          averageSuccessRate: 84,
          averageCompletionRate: 81,
          memberSatisfaction: 4.2,
          trend: 'stable',
          recommendation: '검증된 방법. 초보자 회원에게 안전한 선택'
        },
        {
          algorithm: 'vo2_max_percentage',
          totalUsage: 25,
          averageSuccessRate: 80,
          averageCompletionRate: 78,
          memberSatisfaction: 4.0,
          trend: 'stable',
          recommendation: '체력 측정 가능한 회원에게 효과적'
        },
        {
          algorithm: 'rpe_based',
          totalUsage: 30,
          averageSuccessRate: 78,
          averageCompletionRate: 76,
          memberSatisfaction: 3.9,
          trend: 'down',
          recommendation: '주관적 편차로 인한 성과 하락. 보완 필요'
        },
        {
          algorithm: 'max_hr_percentage',
          totalUsage: 25,
          averageSuccessRate: 72,
          averageCompletionRate: 75,
          memberSatisfaction: 3.8,
          trend: 'down',
          recommendation: '개인차 미반영으로 낮은 성과. 개선 필요'
        }
      ];

      // 센터 전체 통계
      const sampleCenterStats: CenterStats = {
        totalMembers: 156,
        activePrescriptions: 135,
        averageSuccessRate: 84,
        topPerformingAlgorithm: 'ai_adaptive',
        improvementAreas: [
          '이강사의 알고리즘 다양성 확대 필요',
          'max_hr_percentage 알고리즘 성과 개선 필요',
          'RPE 기반 알고리즘 보완 교육 필요'
        ]
      };

      setInstructorPerformance(sampleInstructors);
      setAlgorithmStats(sampleAlgorithmStats);
      setCenterStats(sampleCenterStats);
    } catch (error) {
      console.error('데이터 로드 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSampleData();
  }, []);

  const tabs = [
    { id: 'overview', label: '📊 개요', icon: BarChart3 },
    { id: 'instructors', label: '👨‍🏫 강사별 성과', icon: Users },
    { id: 'algorithms', label: '🧠 알고리즘 분석', icon: Brain },
    { id: 'recommendations', label: '💡 개선 제안', icon: Award }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUp className="h-4 w-4 text-green-600" />;
      case 'down': return <ArrowDown className="h-4 w-4 text-red-600" />;
      default: return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <BarChart3 className="h-8 w-8 text-blue-600 mr-3" />
                알고리즘 성과 모니터링
              </h1>
              <p className="text-gray-600 mt-2">
                센터 내 운동 처방 알고리즘 성과 분석 및 관리
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="week">최근 1주</option>
                <option value="month">최근 1개월</option>
                <option value="quarter">최근 3개월</option>
              </select>
              <RefreshButton onClick={loadSampleData} isLoading={isLoading} />
            </div>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* 개요 탭 */}
        {activeTab === 'overview' && centerStats && (
          <div className="space-y-6">
            {/* 주요 지표 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">총 회원 수</p>
                    <p className="text-2xl font-bold text-gray-900">{centerStats.totalMembers}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Activity className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">활성 처방</p>
                    <p className="text-2xl font-bold text-gray-900">{centerStats.activePrescriptions}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Target className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">평균 성공률</p>
                    <p className="text-2xl font-bold text-gray-900">{centerStats.averageSuccessRate}%</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Award className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">최고 성과 알고리즘</p>
                    <p className="text-lg font-bold text-gray-900">
                      {algorithms[centerStats.topPerformingAlgorithm as keyof typeof algorithms]?.name}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* 알고리즘별 성과 요약 */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">알고리즘별 성과 요약</h3>
              <div className="space-y-4">
                {algorithmStats.slice(0, 3).map((stat, index) => (
                  <div key={stat.algorithm} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-600 rounded-full font-bold mr-4">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {algorithms[stat.algorithm as keyof typeof algorithms]?.name}
                        </h4>
                        <p className="text-sm text-gray-600">{stat.totalUsage}개 처방</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">성공률</p>
                        <p className="font-semibold text-green-600">{stat.averageSuccessRate}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">완주율</p>
                        <p className="font-semibold text-blue-600">{stat.averageCompletionRate}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">만족도</p>
                        <p className="font-semibold text-purple-600">{stat.memberSatisfaction}/5.0</p>
                      </div>
                      <div className="flex items-center">
                        {getTrendIcon(stat.trend)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* 개선 영역 */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">개선 필요 영역</h3>
              <div className="space-y-3">
                {centerStats.improvementAreas.map((area, index) => (
                  <div key={index} className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-orange-500 mr-3 mt-0.5" />
                    <p className="text-gray-700">{area}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* 강사별 성과 탭 */}
        {activeTab === 'instructors' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">강사별 성과 분석</h3>
              <div className="space-y-4">
                {instructorPerformance.map((instructor, index) => (
                  <div key={instructor.instructorId} className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-full font-bold mr-4">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{instructor.instructorName}</h4>
                          <p className="text-sm text-gray-600">{instructor.totalPrescriptions}개 처방 생성</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center">
                          <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ width: `${instructor.overallSuccessRate}%` }}
                            ></div>
                          </div>
                          <span className="font-semibold text-green-600">{instructor.overallSuccessRate}%</span>
                        </div>
                        <p className="text-sm text-gray-600">전체 성공률</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="font-medium text-gray-900 mb-3">사용 알고리즘</h5>
                        <div className="space-y-2">
                          {Object.entries(instructor.algorithmUsage).map(([algorithm, stats]) => (
                            <div key={algorithm} className="flex items-center justify-between p-2 bg-white rounded">
                              <span className="text-sm font-medium">
                                {algorithms[algorithm as keyof typeof algorithms]?.name}
                              </span>
                              <div className="flex items-center space-x-3">
                                <span className="text-sm text-gray-600">{stats.count}개</span>
                                <span className="text-sm font-medium text-green-600">{stats.successRate}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h5 className="font-medium text-gray-900 mb-3">성과 지표</h5>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">회원 만족도</span>
                            <span className="font-medium">{instructor.memberSatisfaction}/5.0</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">마지막 업데이트</span>
                            <span className="font-medium">{instructor.lastUpdated}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">알고리즘 다양성</span>
                            <span className="font-medium">
                              {Object.keys(instructor.algorithmUsage).length}개
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* 알고리즘 분석 탭 */}
        {activeTab === 'algorithms' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">알고리즘 상세 분석</h3>
              <div className="space-y-4">
                {algorithmStats.map((stat, index) => (
                  <div key={stat.algorithm} className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-600 rounded-full font-bold mr-4">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {algorithms[stat.algorithm as keyof typeof algorithms]?.name}
                          </h4>
                          <p className="text-sm text-gray-600">{stat.totalUsage}개 처방 사용</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {getTrendIcon(stat.trend)}
                        <span className="ml-2 text-sm text-gray-600">
                          {stat.trend === 'up' ? '상승' : stat.trend === 'down' ? '하락' : '유지'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">성공률</p>
                        <p className="text-2xl font-bold text-green-600">{stat.averageSuccessRate}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">완주율</p>
                        <p className="text-2xl font-bold text-blue-600">{stat.averageCompletionRate}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">만족도</p>
                        <p className="text-2xl font-bold text-purple-600">{stat.memberSatisfaction}/5.0</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">사용량</p>
                        <p className="text-2xl font-bold text-orange-600">{stat.totalUsage}개</p>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg">
                      <h5 className="font-medium text-gray-900 mb-2">추천사항</h5>
                      <p className="text-sm text-gray-700">{stat.recommendation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* 개선 제안 탭 */}
        {activeTab === 'recommendations' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">센터 개선 제안</h3>
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <h4 className="font-medium text-green-900">우수 성과 유지</h4>
                  </div>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• AI 적응형 알고리즘의 높은 성공률 (91%) 유지</li>
                    <li>• 박강사의 우수한 성과 (91% 성공률) 지속</li>
                    <li>• 하이브리드 알고리즘의 안정적 성과</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                    <h4 className="font-medium text-yellow-900">개선 필요 영역</h4>
                  </div>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• 이강사의 알고리즘 다양성 확대 (현재 2개 → 4개 이상 권장)</li>
                    <li>• max_hr_percentage 알고리즘 성과 개선 (72% → 80% 목표)</li>
                    <li>• RPE 기반 알고리즘 보완 교육 필요</li>
                  </ul>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Brain className="h-5 w-5 text-blue-600 mr-2" />
                    <h4 className="font-medium text-blue-900">교육 및 훈련 제안</h4>
                  </div>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• AI 적응형 알고리즘 활용법 교육 (전체 강사 대상)</li>
                    <li>• 하이브리드 알고리즘 조합 방법 워크숍</li>
                    <li>• 개인별 건강 지표 해석 교육</li>
                  </ul>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <TrendingUp className="h-5 w-5 text-purple-600 mr-2" />
                    <h4 className="font-medium text-purple-900">성과 향상 전략</h4>
                  </div>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li>• 고성과 알고리즘(AI 적응형, 하이브리드) 사용률 증가</li>
                    <li>• 저성과 알고리즘(max_hr_percentage) 사용률 감소</li>
                    <li>• 강사별 맞춤형 알고리즘 선택 가이드 제공</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        )}

        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center">
              <LoadingSpinner size="sm" />
              <span className="ml-3 text-gray-600">데이터를 불러오는 중...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
