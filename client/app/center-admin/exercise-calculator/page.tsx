'use client';
import { logger } from '@/lib/logger';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingState, PageHeader } from '@/components/common';
import { 
  Calculator, 
  Activity, 
  Clock, 
  Target,
  Zap,
  Heart,
  TrendingUp,
  Info,
  RefreshCw,
  Save,
  Download,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

export default function CenterAdminExerciseCalculatorPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    height: '',
    weight: '',
    activityLevel: '',
    swimmingExperience: '',
    fitnessGoals: '',
    availableTime: '',
    preferredIntensity: ''
  });

  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // 테넌트 경로로 리다이렉트 (Phase 3)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const slug = localStorage.getItem('centerSlug') || 'default';
      const currentPath = window.location.pathname;
      if (currentPath.startsWith('/center-admin/') && !currentPath.includes('/center/')) {
        const newPath = currentPath.replace('/center-admin', `/center/${slug}/admin`);
        router.replace(newPath);
        return;
      }
    }
  }, [router]);

  const ACTIVITY_LEVELS = [
    { value: 'sedentary', label: '거의 운동 안함', multiplier: 1.2 },
    { value: 'light', label: '가벼운 운동 (주 1-3회)', multiplier: 1.375 },
    { value: 'moderate', label: '보통 운동 (주 3-5회)', multiplier: 1.55 },
    { value: 'active', label: '활발한 운동 (주 6-7회)', multiplier: 1.725 },
    { value: 'very_active', label: '매우 활발한 운동 (주 2회 이상)', multiplier: 1.9 }
  ];

  const SWIMMING_EXPERIENCE = [
    { value: 'beginner', label: '초보자 (6개월 미만)' },
    { value: 'intermediate', label: '중급자 (6개월-2년)' },
    { value: 'advanced', label: '고급자 (2년 이상)' },
    { value: 'expert', label: '전문가 (5년 이상)' }
  ];

  const FITNESS_GOALS = [
    { value: 'weight_loss', label: '체중 감량' },
    { value: 'muscle_gain', label: '근육 증가' },
    { value: 'endurance', label: '지구력 향상' },
    { value: 'general_fitness', label: '전반적인 건강' },
    { value: 'competition', label: '경기 준비' }
  ];

  const calculateResults = () => {
    if (!formData.age || !formData.gender || !formData.height || !formData.weight || !formData.activityLevel) {
      alert('필수 정보를 모두 입력해주세요.');
      return;
    }

    setLoading(true);

    // BMR 계산 (Mifflin-St Jeor Equation)
    const age = parseInt(formData.age);
    const height = parseInt(formData.height);
    const weight = parseInt(formData.weight);
    
    let bmr;
    if (formData.gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    // TDEE 계산
    const activityMultiplier = ACTIVITY_LEVELS.find(level => level.value === formData.activityLevel)?.multiplier || 1.2;
    const tdee = bmr * activityMultiplier;

    // 목표별 칼로리 조정
    let targetCalories = tdee;
    if (formData.fitnessGoals === 'weight_loss') {
      targetCalories = tdee - 500; // 주당 0.5kg 감량
    } else if (formData.fitnessGoals === 'muscle_gain') {
      targetCalories = tdee + 300; // 근육 증가
    }

    // 수영 운동 계획 생성
    const swimmingPlan = generateSwimmingPlan(formData.swimmingExperience, formData.fitnessGoals, formData.availableTime);

    const calculatedResults = {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      targetCalories: Math.round(targetCalories),
      bmi: Math.round((weight / Math.pow(height / 100, 2)) * 10) / 10,
      swimmingPlan,
      recommendations: generateRecommendations(formData.fitnessGoals, formData.swimmingExperience)
    };

    setTimeout(() => {
      setResults(calculatedResults);
      setLoading(false);
    }, 1000);
  };

  const generateSwimmingPlan = (experience: string, goals: string, time: string) => {
    const plans: any = {
      beginner: {
        weight_loss: { sessions: 3, duration: 30, intensity: 'low' },
        muscle_gain: { sessions: 3, duration: 45, intensity: 'medium' },
        endurance: { sessions: 4, duration: 40, intensity: 'medium' },
        general_fitness: { sessions: 3, duration: 35, intensity: 'low' },
        competition: { sessions: 5, duration: 60, intensity: 'high' }
      },
      intermediate: {
        weight_loss: { sessions: 4, duration: 45, intensity: 'medium' },
        muscle_gain: { sessions: 4, duration: 60, intensity: 'high' },
        endurance: { sessions: 5, duration: 50, intensity: 'high' },
        general_fitness: { sessions: 4, duration: 40, intensity: 'medium' },
        competition: { sessions: 6, duration: 75, intensity: 'high' }
      },
      advanced: {
        weight_loss: { sessions: 5, duration: 50, intensity: 'high' },
        muscle_gain: { sessions: 5, duration: 75, intensity: 'high' },
        endurance: { sessions: 6, duration: 60, intensity: 'high' },
        general_fitness: { sessions: 4, duration: 45, intensity: 'medium' },
        competition: { sessions: 7, duration: 90, intensity: 'high' }
      },
      expert: {
        weight_loss: { sessions: 6, duration: 60, intensity: 'high' },
        muscle_gain: { sessions: 6, duration: 90, intensity: 'high' },
        endurance: { sessions: 7, duration: 75, intensity: 'high' },
        general_fitness: { sessions: 5, duration: 50, intensity: 'medium' },
        competition: { sessions: 8, duration: 120, intensity: 'high' }
      }
    };

    return plans[experience]?.[goals] || plans.beginner.general_fitness;
  };

  const generateRecommendations = (goals: string, experience: string) => {
    const recommendations: any = {
      weight_loss: [
        '유산소 운동 위주로 진행하세요',
        '고강도 인터벌 트레이닝을 포함하세요',
        '식단 관리와 함께 진행하세요'
      ],
      muscle_gain: [
        '저항 운동과 수영을 병행하세요',
        '충분한 단백질 섭취가 필요합니다',
        '점진적으로 강도를 높여가세요'
      ],
      endurance: [
        '장거리 수영을 중심으로 하세요',
        '호흡법을 중점적으로 연습하세요',
        '지속적인 운동이 중요합니다'
      ],
      general_fitness: [
        '균형잡힌 운동 계획을 세우세요',
        '규칙적인 운동 습관을 만드세요',
        '충분한 휴식도 중요합니다'
      ],
      competition: [
        '체계적인 훈련 계획이 필요합니다',
        '기술 향상에 집중하세요',
        '경기 전 충분한 준비를 하세요'
      ]
    };

    return recommendations[goals] || recommendations.general_fitness;
  };

  const saveResults = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    // 실제로는 서버에 저장
    logger.info('결과 저장:', results);
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: '저체중', color: 'text-blue-600' };
    if (bmi < 23) return { category: '정상', color: 'text-green-600' };
    if (bmi < 25) return { category: '과체중', color: 'text-yellow-600' };
    if (bmi < 30) return { category: '비만', color: 'text-orange-600' };
    return { category: '고도비만', color: 'text-red-600' };
  };

  const getIntensityLabel = (intensity: string) => {
    const labels: any = {
      low: '낮음',
      medium: '보통',
      high: '높음'
    };
    return labels[intensity] || intensity;
  };

  const getIntensityColor = (intensity: string) => {
    const colors: any = {
      low: 'text-green-600',
      medium: 'text-yellow-600',
      high: 'text-red-600'
    };
    return colors[intensity] || 'text-gray-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 페이지 헤더 */}
        <PageHeader
          title="🏊‍♀️ 운동 계산기"
          description="개인 정보를 바탕으로 맞춤형 수영 운동 계획을 계산합니다."
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 입력 폼 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Calculator className="w-5 h-5 mr-2" />
              개인 정보 입력
            </h2>

            <div className="space-y-6">
              {/* 기본 정보 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    나이 *
                  </label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="나이"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    성별 *
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">성별 선택</option>
                    <option value="male">남성</option>
                    <option value="female">여성</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    키 (cm) *
                  </label>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="키"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    몸무게 (kg) *
                  </label>
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="몸무게"
                  />
                </div>
              </div>

              {/* 활동 수준 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  활동 수준 *
                </label>
                <select
                  value={formData.activityLevel}
                  onChange={(e) => setFormData({ ...formData, activityLevel: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">활동 수준 선택</option>
                  {ACTIVITY_LEVELS.map(level => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 수영 경험 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  수영 경험
                </label>
                <select
                  value={formData.swimmingExperience}
                  onChange={(e) => setFormData({ ...formData, swimmingExperience: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">수영 경험 선택</option>
                  {SWIMMING_EXPERIENCE.map(exp => (
                    <option key={exp.value} value={exp.value}>
                      {exp.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 운동 목표 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  운동 목표
                </label>
                <select
                  value={formData.fitnessGoals}
                  onChange={(e) => setFormData({ ...formData, fitnessGoals: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">운동 목표 선택</option>
                  {FITNESS_GOALS.map(goal => (
                    <option key={goal.value} value={goal.value}>
                      {goal.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 운동 가능 시간 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  주간 운동 가능 시간
                </label>
                <select
                  value={formData.availableTime}
                  onChange={(e) => setFormData({ ...formData, availableTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">시간 선택</option>
                  <option value="2-3">2-3시간</option>
                  <option value="4-5">4-5시간</option>
                  <option value="6-8">6-8시간</option>
                  <option value="9+">9시간 이상</option>
                </select>
              </div>

              {/* 계산 버튼 */}
              <button
                onClick={calculateResults}
                disabled={loading}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <LoadingState message="계산 중..." size="sm" className="flex-row text-white" />
                ) : (
                  <>
                    <Calculator className="w-4 h-4 mr-2" />
                    운동 계획 계산
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 결과 표시 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Target className="w-5 h-5 mr-2" />
              계산 결과
            </h2>

            {results ? (
              <div className="space-y-6">
                {/* 기본 지표 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{results.bmr}</div>
                    <div className="text-sm text-gray-600">기초대사율 (kcal)</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{results.tdee}</div>
                    <div className="text-sm text-gray-600">일일 소모 칼로리 (kcal)</div>
                  </div>
                </div>

                {/* BMI */}
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{results.bmi}</div>
                  <div className="text-sm text-gray-600">
                    BMI - <span className={getBMICategory(results.bmi).color}>
                      {getBMICategory(results.bmi).category}
                    </span>
                  </div>
                </div>

                {/* 목표 칼로리 */}
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{results.targetCalories}</div>
                  <div className="text-sm text-gray-600">목표 일일 칼로리 (kcal)</div>
                </div>

                {/* 수영 계획 */}
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Activity className="w-4 h-4 mr-2" />
                    수영 운동 계획
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>주간 세션 수:</span>
                      <span className="font-medium">{results.swimmingPlan.sessions}회</span>
                    </div>
                    <div className="flex justify-between">
                      <span>세션당 시간:</span>
                      <span className="font-medium">{results.swimmingPlan.duration}분</span>
                    </div>
                    <div className="flex justify-between">
                      <span>운동 강도:</span>
                      <span className={`font-medium ${getIntensityColor(results.swimmingPlan.intensity)}`}>
                        {getIntensityLabel(results.swimmingPlan.intensity)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 권장사항 */}
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    권장사항
                  </h3>
                  <ul className="space-y-1 text-sm text-gray-700">
                    {results.recommendations.map((rec: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 저장 버튼 */}
                <button
                  onClick={saveResults}
                  className={`w-full px-4 py-3 rounded-md flex items-center justify-center ${
                    saved 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-600 text-white hover:bg-gray-700'
                  }`}
                >
                  {saved ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      저장 완료
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      결과 저장
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="text-center py-12">
                <Calculator className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  운동 계획을 계산해보세요
                </h3>
                <p className="text-gray-600">
                  왼쪽 폼에 정보를 입력하고 계산 버튼을 클릭하세요.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}