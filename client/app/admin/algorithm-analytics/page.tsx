/**
 * 📈 JJ Swim Lab - 관리자용 전체 시스템 알고리즘 분석
 * 
 * 📋 **페이지 개요**
 * - 전국 센터별 알고리즘 사용 현황 및 성과 분석
 * - 알고리즘 효과성 평가 및 정책 결정 지원
 * - 센터별 성과 비교 및 벤치마킹
 * - 시스템 전체 최적화 방안 제시
 * 
 * 🔗 **연동 데이터**
 * - ExercisePrescription: 전체 운동 처방 데이터
 * - Center: 센터 정보
 * - User: 강사 및 회원 정보
 * 
 * 📅 **개발 히스토리**
 * - 2025-01-22: 관리자용 전체 시스템 분석 시스템 구현
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
  MapPin, 
  Award, 
  Target,
  Activity,
  Users,
  Brain,
  AlertTriangle,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Minus,
  Globe,
  Building,
  Star
} from 'lucide-react';

interface CenterPerformance {
  centerId: string;
  centerName: string;
  location: string;
  totalMembers: number;
  totalPrescriptions: number;
  algorithmUsage: {
    [algorithm: string]: {
      count: number;
      successRate: number;
    };
  };
  overallSuccessRate: number;
  memberSatisfaction: number;
  ranking: number;
  trend: 'up' | 'down' | 'stable';
}

interface AlgorithmEffectiveness {
  algorithm: string;
  totalUsage: number;
  averageSuccessRate: number;
  centerAdoptionRate: number;
  memberSatisfaction: number;
  costEffectiveness: number;
  recommendation: 'high' | 'medium' | 'low';
  policy: string;
}

interface SystemInsights {
  totalCenters: number;
  totalMembers: number;
  totalPrescriptions: number;
  averageSuccessRate: number;
  topPerformingCenter: string;
  mostEffectiveAlgorithm: string;
  improvementOpportunities: string[];
  policyRecommendations: string[];
}

export default function AlgorithmAnalytics() {
  const [isLoading, setIsLoading] = useState(false);
  const [centerPerformance, setCenterPerformance] = useState<CenterPerformance[]>([]);
  const [algorithmEffectiveness, setAlgorithmEffectiveness] = useState<AlgorithmEffectiveness[]>([]);
  const [systemInsights, setSystemInsights] = useState<SystemInsights | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<'all' | 'seoul' | 'busan' | 'daegu' | 'incheon'>('all');
  const [activeTab, setActiveTab] = useState<'overview' | 'centers' | 'algorithms' | 'policies'>('overview');

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
      // 센터별 성과 데이터
      const sampleCenters: CenterPerformance[] = [
        {
          centerId: '1',
          centerName: '강남 스윔센터',
          location: '서울 강남구',
          totalMembers: 245,
          totalPrescriptions: 189,
          algorithmUsage: {
            ai_adaptive: { count: 85, successRate: 92 },
            hybrid: { count: 65, successRate: 89 },
            karvonen: { count: 39, successRate: 86 }
          },
          overallSuccessRate: 90,
          memberSatisfaction: 4.6,
          ranking: 1,
          trend: 'up'
        },
        {
          centerId: '2',
          centerName: '부산 해운대센터',
          location: '부산 해운대구',
          totalMembers: 198,
          totalPrescriptions: 156,
          algorithmUsage: {
            hybrid: { count: 78, successRate: 88 },
            ai_adaptive: { count: 45, successRate: 91 },
            karvonen: { count: 33, successRate: 84 }
          },
          overallSuccessRate: 88,
          memberSatisfaction: 4.4,
          ranking: 2,
          trend: 'up'
        },
        {
          centerId: '3',
          centerName: '대구 수성센터',
          location: '대구 수성구',
          totalMembers: 167,
          totalPrescriptions: 134,
          algorithmUsage: {
            karvonen: { count: 67, successRate: 85 },
            max_hr_percentage: { count: 45, successRate: 72 },
            rpe_based: { count: 22, successRate: 78 }
          },
          overallSuccessRate: 78,
          memberSatisfaction: 3.9,
          ranking: 3,
          trend: 'stable'
        },
        {
          centerId: '4',
          centerName: '인천 연수센터',
          location: '인천 연수구',
          totalMembers: 134,
          totalPrescriptions: 98,
          algorithmUsage: {
            max_hr_percentage: { count: 56, successRate: 71 },
            karvonen: { count: 28, successRate: 83 },
            rpe_based: { count: 14, successRate: 76 }
          },
          overallSuccessRate: 76,
          memberSatisfaction: 3.7,
          ranking: 4,
          trend: 'down'
        }
      ];

      // 알고리즘 효과성 분석
      const sampleAlgorithmEffectiveness: AlgorithmEffectiveness[] = [
        {
          algorithm: 'ai_adaptive',
          totalUsage: 130,
          averageSuccessRate: 91,
          centerAdoptionRate: 100,
          memberSatisfaction: 4.5,
          costEffectiveness: 95,
          recommendation: 'high',
          policy: '전체 센터 필수 도입 권장'
        },
        {
          algorithm: 'hybrid',
          totalUsage: 143,
          averageSuccessRate: 88,
          centerAdoptionRate: 100,
          memberSatisfaction: 4.4,
          costEffectiveness: 88,
          recommendation: 'high',
          policy: '경험자 회원 대상 적극 활용'
        },
        {
          algorithm: 'karvonen',
          totalUsage: 167,
          averageSuccessRate: 84,
          centerAdoptionRate: 100,
          memberSatisfaction: 4.2,
          costEffectiveness: 85,
          recommendation: 'medium',
          policy: '초보자 회원 기본 알고리즘'
        },
        {
          algorithm: 'vo2_max_percentage',
          totalUsage: 89,
          averageSuccessRate: 80,
          centerAdoptionRate: 75,
          memberSatisfaction: 4.0,
          costEffectiveness: 78,
          recommendation: 'medium',
          policy: '체력 측정 가능 센터 권장'
        },
        {
          algorithm: 'rpe_based',
          totalUsage: 36,
          averageSuccessRate: 77,
          centerAdoptionRate: 50,
          memberSatisfaction: 3.9,
          costEffectiveness: 72,
          recommendation: 'low',
          policy: '보완 교육 후 제한적 사용'
        },
        {
          algorithm: 'max_hr_percentage',
          totalUsage: 101,
          averageSuccessRate: 72,
          centerAdoptionRate: 100,
          memberSatisfaction: 3.8,
          costEffectiveness: 65,
          recommendation: 'low',
          policy: '단계적 사용 중단 검토'
        }
      ];

      // 시스템 전체 인사이트
      const sampleSystemInsights: SystemInsights = {
        totalCenters: 4,
        totalMembers: 744,
        totalPrescriptions: 577,
        averageSuccessRate: 83,
        topPerformingCenter: '강남 스윔센터',
        mostEffectiveAlgorithm: 'ai_adaptive',
        improvementOpportunities: [
          '인천 연수센터의 알고리즘 다양성 확대 필요',
          'max_hr_percentage 알고리즘 전반적 성과 개선',
          '대구 수성센터의 AI 적응형 알고리즘 도입',
          'RPE 기반 알고리즘 보완 교육 강화'
        ],
        policyRecommendations: [
          'AI 적응형 알고리즘을 표준 알고리즘으로 지정',
          '하이브리드 알고리즘 사용률 30% 증가 목표',
          'max_hr_percentage 알고리즘 단계적 사용 중단',
          '센터별 알고리즘 성과 벤치마킹 시스템 구축'
        ]
      };

      setCenterPerformance(sampleCenters);
      setAlgorithmEffectiveness(sampleAlgorithmEffectiveness);
      setSystemInsights(sampleSystemInsights);
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
    { id: 'overview', label: '📊 시스템 개요', icon: Globe },
    { id: 'centers', label: '🏢 센터별 성과', icon: Building },
    { id: 'algorithms', label: '🧠 알고리즘 분석', icon: Brain },
    { id: 'policies', label: '📋 정책 제안', icon: Award }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUp className="h-4 w-4 text-green-600" />;
      case 'down': return <ArrowDown className="h-4 w-4 text-red-600" />;
      default: return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
                전체 시스템 알고리즘 분석
              </h1>
              <p className="text-gray-600 mt-2">
                전국 센터별 알고리즘 성과 분석 및 정책 결정 지원
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">전국</option>
                <option value="seoul">서울</option>
                <option value="busan">부산</option>
                <option value="daegu">대구</option>
                <option value="incheon">인천</option>
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

        {/* 시스템 개요 탭 */}
        {activeTab === 'overview' && systemInsights && (
          <div className="space-y-6">
            {/* 주요 지표 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">총 센터 수</p>
                    <p className="text-2xl font-bold text-gray-900">{systemInsights.totalCenters}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">총 회원 수</p>
                    <p className="text-2xl font-bold text-gray-900">{systemInsights.totalMembers.toLocaleString()}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Activity className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">총 처방 수</p>
                    <p className="text-2xl font-bold text-gray-900">{systemInsights.totalPrescriptions.toLocaleString()}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Target className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">평균 성공률</p>
                    <p className="text-2xl font-bold text-gray-900">{systemInsights.averageSuccessRate}%</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* 최고 성과 센터 및 알고리즘 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🏆 최고 성과 센터</h3>
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-100 rounded-lg mr-4">
                    <Star className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{systemInsights.topPerformingCenter}</h4>
                    <p className="text-sm text-gray-600">전국 센터 중 1위</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🧠 최고 효과 알고리즘</h3>
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg mr-4">
                    <Brain className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {algorithms[systemInsights.mostEffectiveAlgorithm as keyof typeof algorithms]?.name}
                    </h4>
                    <p className="text-sm text-gray-600">평균 성공률 91%</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* 센터별 성과 요약 */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">센터별 성과 요약</h3>
              <div className="space-y-4">
                {centerPerformance.slice(0, 3).map((center, index) => (
                  <div key={center.centerId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-600 rounded-full font-bold mr-4">
                        {center.ranking}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{center.centerName}</h4>
                        <p className="text-sm text-gray-600">{center.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">성공률</p>
                        <p className="font-semibold text-green-600">{center.overallSuccessRate}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">회원 수</p>
                        <p className="font-semibold text-blue-600">{center.totalMembers}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">만족도</p>
                        <p className="font-semibold text-purple-600">{center.memberSatisfaction}/5.0</p>
                      </div>
                      <div className="flex items-center">
                        {getTrendIcon(center.trend)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* 센터별 성과 탭 */}
        {activeTab === 'centers' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">센터별 상세 성과 분석</h3>
              <div className="space-y-6">
                {centerPerformance.map((center, index) => (
                  <div key={center.centerId} className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-full font-bold mr-4">
                          {center.ranking}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{center.centerName}</h4>
                          <p className="text-sm text-gray-600">{center.location}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center">
                          <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ width: `${center.overallSuccessRate}%` }}
                            ></div>
                          </div>
                          <span className="font-semibold text-green-600">{center.overallSuccessRate}%</span>
                        </div>
                        <p className="text-sm text-gray-600">전체 성공률</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="font-medium text-gray-900 mb-3">사용 알고리즘</h5>
                        <div className="space-y-2">
                          {Object.entries(center.algorithmUsage).map(([algorithm, stats]) => (
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
                        <h5 className="font-medium text-gray-900 mb-3">센터 지표</h5>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">총 회원 수</span>
                            <span className="font-medium">{center.totalMembers}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">총 처방 수</span>
                            <span className="font-medium">{center.totalPrescriptions}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">회원 만족도</span>
                            <span className="font-medium">{center.memberSatisfaction}/5.0</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">성과 추세</span>
                            <div className="flex items-center">
                              {getTrendIcon(center.trend)}
                              <span className="ml-1 text-sm">
                                {center.trend === 'up' ? '상승' : center.trend === 'down' ? '하락' : '유지'}
                              </span>
                            </div>
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4">알고리즘 효과성 분석</h3>
              <div className="space-y-4">
                {algorithmEffectiveness.map((algorithm, index) => (
                  <div key={algorithm.algorithm} className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-600 rounded-full font-bold mr-4">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {algorithms[algorithm.algorithm as keyof typeof algorithms]?.name}
                          </h4>
                          <p className="text-sm text-gray-600">{algorithm.totalUsage}개 처방 사용</p>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getRecommendationColor(algorithm.recommendation)}`}>
                        {algorithm.recommendation === 'high' ? '높은 추천' : 
                         algorithm.recommendation === 'medium' ? '보통 추천' : '낮은 추천'}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">성공률</p>
                        <p className="text-xl font-bold text-green-600">{algorithm.averageSuccessRate}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">센터 도입률</p>
                        <p className="text-xl font-bold text-blue-600">{algorithm.centerAdoptionRate}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">만족도</p>
                        <p className="text-xl font-bold text-purple-600">{algorithm.memberSatisfaction}/5.0</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">비용 효율성</p>
                        <p className="text-xl font-bold text-orange-600">{algorithm.costEffectiveness}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">총 사용량</p>
                        <p className="text-xl font-bold text-gray-600">{algorithm.totalUsage}</p>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg">
                      <h5 className="font-medium text-gray-900 mb-2">정책 제안</h5>
                      <p className="text-sm text-gray-700">{algorithm.policy}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* 정책 제안 탭 */}
        {activeTab === 'policies' && systemInsights && (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">시스템 개선 기회</h3>
              <div className="space-y-4">
                {systemInsights.improvementOpportunities.map((opportunity, index) => (
                  <div key={index} className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-orange-500 mr-3 mt-0.5" />
                    <p className="text-gray-700">{opportunity}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">정책 권장사항</h3>
              <div className="space-y-4">
                {systemInsights.policyRecommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                    <p className="text-gray-700">{recommendation}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">알고리즘 정책 매트릭스</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">알고리즘</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">추천도</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">정책 방향</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">실행 계획</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {algorithmEffectiveness.map((algorithm) => (
                      <tr key={algorithm.algorithm}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {algorithms[algorithm.algorithm as keyof typeof algorithms]?.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRecommendationColor(algorithm.recommendation)}`}>
                            {algorithm.recommendation === 'high' ? '높음' : 
                             algorithm.recommendation === 'medium' ? '보통' : '낮음'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {algorithm.policy}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {algorithm.recommendation === 'high' ? '즉시 실행' : 
                           algorithm.recommendation === 'medium' ? '단계적 실행' : '검토 후 결정'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center">
              <LoadingSpinner size="sm" />
              <span className="ml-3 text-gray-600">데이터를 분석하는 중...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
