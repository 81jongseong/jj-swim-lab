/**
 * 회원 건강정보 입력 페이지
 * 
 * 연동되는 데이터:
 * - 회원 기본 정보 (나이, 성별, 신체 정보)
 * - 건강검진 결과 (혈압, 혈당, 콜레스테롤 등)
 * - 관절질환 정보
 * - 수영 실력 평가
 * - 운동 목표
 * 
 * 연동되는 파일:
 * - /data/joint-conditions.ts (관절질환 가이드라인)
 * - /swim-training-engine/ (수영 트레이닝 규칙 엔진)
 */

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
// UI 컴포넌트를 HTML 요소로 대체하여 Element type is invalid 오류 해결
import { 
  User, 
  Heart, 
  Activity, 
  Target, 
  CheckCircle, 
  AlertTriangle,
  Save,
  ArrowRight
} from 'lucide-react';
import { allJointConditions } from '../../../data/joint-conditions';
import { getChecklistItems, sampleInstructorChecklists, getInstructorChecklist } from '../../../data/swimming-checklist';
import AllConditionsDrawer from '@/components/swimlab/AllConditionsDrawer';
// 로컬 함수로 대체
// 로컬 타입 정의
interface HealthInput {
  demographics: { age: number; sex: string };
  anthropometrics: { height_cm: number; weight_kg: number };
  vitals: { rest_hr: number; rest_bp: { sbp: number; dbp: number }; on_beta_blocker: boolean };
  conditions: {
    hypertension: string;
    obesity: string;
    dyslipidemia: boolean;
    diabetes: boolean;
    heartDisease: boolean;
    respiratoryDisease: boolean;
    mentalHealth: boolean;
  };
  orthopedics: string[];
  swim_profile: {
    level: 'beginner_1' | 'beginner_2' | 'intermediate_1' | 'intermediate_2' | 'advanced_1' | 'advanced_2';
    grade: string;
    zone2Pace?: number;
    max50mPace?: number;
    max400mPace?: string;
    max1500mPace?: string;
    poolType?: string;
    poolDistance?: number;
    weeklySchedule?: any;
    checklist?: string[];
    instructorNotes?: string;
    overallLevel?: string;
    css?: {
      freestyle: number;
      backstroke: number;
      breaststroke: number;
      butterfly: number;
    };
    mainStrokes?: string[];
    excludedStrokes?: string[];
  };
  availableDays: number[];
  goals?: {
    primary: string;
    secondary: string;
    target: string;
  };
  special_situations: {
    pregnancy: {
      isPregnant: boolean;
      trimester: string;
    };
    injury: {
      hasInjury: boolean;
      injuryType: string;
      injuryLocation: string;
    };
    medication: {
      takingMedication: boolean;
      medicationType: string;
    };
    postSurgery: {
      hasSurgery: boolean;
      surgeryType: string;
      surgeryDate: string;
      recoveryStage: string;
    };
  };
}

export default function HealthInputPage() {
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [birthDate, setBirthDate] = useState('');
  const [isElderly, setIsElderly] = useState(false);
  const [showConditionsDrawer, setShowConditionsDrawer] = useState(false);
  
  const [healthData, setHealthData] = useState<Partial<HealthInput>>({
    demographics: { age: 0, sex: '' },
    anthropometrics: { height_cm: 0, weight_kg: 0 },
    vitals: { rest_hr: 0, rest_bp: { sbp: 0, dbp: 0 }, on_beta_blocker: false },
    conditions: {
      obesity: '',
      hypertension: '',
      dyslipidemia: false,
      diabetes: false,
      heartDisease: false,
      respiratoryDisease: false,
      mentalHealth: false,
    },
    orthopedics: [],
    swim_profile: { 
      level: 'beginner_1',
      grade: '',
      css: {
        freestyle: 0,
        backstroke: 0,
        breaststroke: 0,
        butterfly: 0
      },
      mainStrokes: [],
      excludedStrokes: []
    },
    availableDays: [],
    goals: {
      primary: '',
      secondary: '',
      target: '',
    },
    special_situations: {
      pregnancy: {
        isPregnant: false,
        trimester: '',
      },
      injury: {
        hasInjury: false,
        injuryType: '',
        injuryLocation: '',
      },
      medication: {
        takingMedication: false,
        medicationType: '',
      },
      postSurgery: {
        hasSurgery: false,
        surgeryType: '',
        surgeryDate: '',
        recoveryStage: '',
      },
    }
  });

  // 특수 상황은 AllConditionsDrawer에서 관절질환(orthopedics)과 함께 선택됨

  // 운동 강도 가이드 생성
  const generateIntensityGuide = (): any => {
    if (!healthData.swim_profile?.level) {
      return null;
    }
    
    const availableDays = healthData.availableDays || [];
    const dayNames = ['월', '화', '수', '목', '금', '토', '일'];
    
    // 운동 가능한 날짜에 대한 강도 가이드 생성
    const days = availableDays.map(dayIndex => {
      const dayName = dayNames[dayIndex];
      const intensity = dayIndex % 3 === 0 ? 'easy' : dayIndex % 3 === 1 ? 'moderate' : 'hard';
      const focus = intensity === 'easy' ? '기초 체력' : intensity === 'moderate' ? '기술 향상' : '고강도 훈련';
      
      let description = '';
      let benefits: string[] = [];
      
      if (intensity === 'easy') {
        description = '편안한 속도로 기초 체력을 기르는 운동입니다.';
        benefits = ['심폐기능 향상', '기초 체력 강화', '부상 예방'];
      } else if (intensity === 'moderate') {
        description = '적당한 강도로 수영 기술을 향상시키는 운동입니다.';
        benefits = ['기술 향상', '지구력 증진', '칼로리 소모'];
      } else {
        description = '고강도로 체력과 속도를 향상시키는 운동입니다.';
        benefits = ['고강도 훈련', '속도 향상', '근력 강화'];
      }
      
      return {
        day: dayName,
        intensity: intensity,
        focus: focus,
        duration: intensity === 'easy' ? 30 : intensity === 'moderate' ? 45 : 60,
        description: description,
        benefits: benefits
      };
    });
    
    // 휴식일 추가
    const restDays = [];
    for (let i = 0; i < 7; i++) {
      if (!availableDays.includes(i)) {
        restDays.push({
          day: dayNames[i],
          intensity: 'rest',
          focus: '휴식',
          duration: 0
        });
      }
    }
    
    const allDays = [...days, ...restDays].sort((a, b) => dayNames.indexOf(a.day) - dayNames.indexOf(b.day));
    
    return {
      totalWorkoutDays: availableDays.length,
      totalDuration: days.reduce((sum, day) => sum + day.duration, 0),
      intensityDistribution: {
        easy: days.filter(d => d.intensity === 'easy').length,
        moderate: days.filter(d => d.intensity === 'moderate').length,
        hard: days.filter(d => d.intensity === 'hard').length
      },
      days: allDays,
      recommendedIntensity: 'moderate',
      maxDuration: 45,
      availableDays: availableDays,
      notes: '안전한 운동을 위해 점진적으로 강도를 높이세요.'
    };
  };

  const intensityGuide = generateIntensityGuide();

  // URL 파라미터 처리
  useEffect(() => {
    const condition = searchParams.get('condition');
    const specialCondition = searchParams.get('specialCondition');
    
    if (condition) {
      // 관절질환 기반 프로그램 생성 - 기본정보부터 시작
      setHealthData(prev => ({
        ...prev,
        orthopedics: [condition]
      }));
      setCurrentStep(1); // 기본정보부터 시작
    } else if (specialCondition) {
      // 특수상황도 AllConditionsDrawer에서 처리 (orthopedics 배열에 포함)
      // 예: 'pregnancy', 'post-surgery' 등이 이미 CONDITIONS 데이터에 있음
      setCurrentStep(1); // 기본정보부터 시작
    }
  }, [searchParams]);

  const steps = [
    { id: 1, title: '기본 정보', description: '나이, 성별, 신체 정보' },
    { id: 2, title: '건강검진', description: '혈압, 혈당, 콜레스테롤 등' },
    { id: 3, title: '질환/상황', description: '관절 질환, 특수 상황 통합' },
    { id: 4, title: '수영 정보', description: '실력, CSS, 선호/회피 영법' },
    { id: 5, title: '운동목표', description: '운동 목표 및 선호도' }
  ];

  const jointConditions = allJointConditions.map(condition => ({
    id: condition.conditionId,
    name: condition.conditionName,
    category: condition.category,
    severity: condition.severity
  }));

  // 관절질환 카테고리 필터링을 위한 데이터 준비


  const handleInputChange = (field: string, value: any) => {
    setHealthData(prev => {
      const newData = { ...prev };
      
      // field가 문자열인지 확인
      if (typeof field !== 'string') {
        console.error('field must be a string:', field);
        return prev;
      }
      
      const keys = field.split('.');
      let current = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const handleJointConditionToggle = (conditionId: string) => {
    setHealthData(prev => ({
      ...prev,
      orthopedics: prev.orthopedics?.includes(conditionId)
        ? prev.orthopedics.filter(id => id !== conditionId)
        : [...(prev.orthopedics || []), conditionId]
    }));
  };

  const handleGoalToggle = (goal: string) => {
    setHealthData(prev => ({
      ...prev,
      goals: prev.goals ? {
        ...prev.goals,
        primary: goal
      } : {
        primary: goal,
        secondary: '',
        target: ''
      }
    }));
  };

  // 생년월일로부터 나이 계산 및 65세 이상 판단
  const handleBirthDateChange = (dateString: string) => {
    setBirthDate(dateString);
    
    if (!dateString) return;
    
    const birth = new Date(dateString);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    // 65세 이상 여부 판단
    const elderly = age >= 65;
    setIsElderly(elderly);
    
    // healthData에 나이 업데이트
    setHealthData(prev => ({
      ...prev,
      demographics: {
        ...prev.demographics,
        age: age
      } as any
    }));
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(healthData.demographics?.age && healthData.demographics?.age > 0 && 
                 healthData.demographics?.sex && healthData.demographics?.sex !== '' &&
                 healthData.anthropometrics?.height_cm && healthData.anthropometrics?.height_cm > 0 && 
                 healthData.anthropometrics?.weight_kg && healthData.anthropometrics?.weight_kg > 0);
      case 2:
        return !!(healthData.vitals?.rest_hr && healthData.vitals?.rest_hr > 0 && 
                 healthData.vitals?.rest_bp?.sbp && healthData.vitals?.rest_bp?.sbp > 0 && 
                 healthData.vitals?.rest_bp?.dbp && healthData.vitals?.rest_bp?.dbp > 0);
      case 3:
        return true; // 질환/특수상황은 선택사항 (AllConditionsDrawer로 통합)
      case 4:
        return !!(healthData.swim_profile?.level && healthData.swim_profile?.level !== 'beginner_1'); // 수영실력은 필수
      case 5:
        return !!(healthData.goals && healthData.goals.primary && healthData.goals.primary !== ''); // 운동목표는 필수
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length && isStepValid(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const calculateBMI = () => {
    const height = healthData.anthropometrics?.height_cm || 0;
    const weight = healthData.anthropometrics?.weight_kg || 0;
    if (height > 0 && weight > 0) {
      const bmi = weight / Math.pow(height / 100, 2);
      return bmi.toFixed(1);
    }
    return '0.0';
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: '저체중', color: 'blue' };
    if (bmi < 23) return { category: '정상', color: 'green' };
    if (bmi < 25) return { category: '과체중', color: 'yellow' };
    if (bmi < 30) return { category: '경도비만', color: 'orange' };
    return { category: '고도비만', color: 'red' };
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">
                  생년월일
                </label>
                <input
                  id="birthDate"
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={birthDate}
                  onChange={(e) => handleBirthDateChange(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  placeholder="생년월일을 선택하세요"
                />
                {healthData.demographics?.age > 0 && (
                  <p className="mt-1 text-sm text-gray-600">
                    만 {healthData.demographics.age}세
                    {isElderly && <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">65세 이상</span>}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="sex" className="block text-sm font-medium text-gray-700 mb-1">성별</label>
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    className={`flex-1 px-4 py-2 rounded-lg border transition-all duration-200 ${
                      healthData.demographics?.sex === 'M' 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-lg scale-105' 
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300'
                    }`}
                    onClick={() => handleInputChange('demographics.sex', 'M')}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {healthData.demographics?.sex === 'M' && <CheckCircle className="h-4 w-4" />}
                      남성
                    </div>
                  </button>
                  <button
                    type="button"
                    className={`flex-1 px-4 py-2 rounded-lg border transition-all duration-200 ${
                      healthData.demographics?.sex === 'F' 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-lg scale-105' 
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300'
                    }`}
                    onClick={() => handleInputChange('demographics.sex', 'F')}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {healthData.demographics?.sex === 'F' && <CheckCircle className="h-4 w-4" />}
                      여성
                    </div>
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">키 (cm)</label>
                <input
                  id="height"
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={healthData.anthropometrics?.height_cm || ''}
                  onChange={(e) => handleInputChange('anthropometrics.height_cm', parseInt(e.target.value))}
                  placeholder="키를 입력하세요"
                />
              </div>
              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">체중 (kg)</label>
                <input
                  id="weight"
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={healthData.anthropometrics?.weight_kg || ''}
                  onChange={(e) => handleInputChange('anthropometrics.weight_kg', parseInt(e.target.value))}
                  placeholder="체중을 입력하세요"
                />
              </div>
            </div>
            
            {/* 65세 이상 안내 메시지 */}
            {isElderly && (
              <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">👴</div>
                  <div>
                    <h4 className="font-semibold text-purple-900 mb-1">65세 이상 맞춤 프로그램</h4>
                    <p className="text-sm text-purple-800">
                      65세 이상 회원님을 위한 안전하고 효과적인 수영 프로그램이 자동으로 설계됩니다.
                      저강도 운동과 충분한 휴식을 포함하여 건강하게 수영을 즐기실 수 있습니다.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {healthData.anthropometrics?.height_cm && healthData.anthropometrics?.weight_kg && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">BMI 계산 결과</h3>
                </div>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">{calculateBMI()}</div>
                    <div className={`px-2 py-1 rounded-full text-sm text-white ${
                      getBMICategory(parseFloat(calculateBMI())).color === 'green' ? 'bg-green-600' :
                      getBMICategory(parseFloat(calculateBMI())).color === 'yellow' ? 'bg-yellow-600' :
                      getBMICategory(parseFloat(calculateBMI())).color === 'orange' ? 'bg-orange-600' :
                      'bg-red-600'
                    }`}>
                      {getBMICategory(parseFloat(calculateBMI())).category}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="rest_hr" className="block text-sm font-medium text-gray-700 mb-1">안정시 심박수 (bpm)</label>
                <input
                  id="rest_hr"
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={healthData.vitals?.rest_hr || ''}
                  onChange={(e) => handleInputChange('vitals.rest_hr', parseInt(e.target.value))}
                  placeholder="안정시 심박수를 입력하세요"
                />
              </div>
              <div>
                <label htmlFor="sbp" className="block text-sm font-medium text-gray-700 mb-1">수축기 혈압 (mmHg)</label>
                <input
                  id="sbp"
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={healthData.vitals?.rest_bp?.sbp || ''}
                  onChange={(e) => handleInputChange('vitals.rest_bp.sbp', parseInt(e.target.value))}
                  placeholder="수축기 혈압을 입력하세요"
                />
              </div>
              <div>
                <label htmlFor="dbp" className="block text-sm font-medium text-gray-700 mb-1">이완기 혈압 (mmHg)</label>
                <input
                  id="dbp"
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={healthData.vitals?.rest_bp?.dbp || ''}
                  onChange={(e) => handleInputChange('vitals.rest_bp.dbp', parseInt(e.target.value))}
                  placeholder="이완기 혈압을 입력하세요"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  id="beta_blocker"
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  checked={healthData.vitals?.on_beta_blocker || false}
                  onChange={(e) => handleInputChange('vitals.on_beta_blocker', e.target.checked)}
                />
                <label htmlFor="beta_blocker" className="text-sm font-medium text-gray-700">베타차단제 복용 중</label>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start space-x-3">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                혈압이 180/110 이상이거나 심장 질환이 있는 경우 의사와 상담 후 운동을 시작하세요.
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">관절 질환 및 특수 상황 선택</h3>
              <p className="text-sm text-gray-600 mb-6">
                현재 가지고 있는 관절 질환, 통증, 특수 상황을 선택해주세요. (복수 선택 가능)<br/>
                <span className="text-blue-600 font-medium">💡 최고 관리자 컨디션 설정 모듈 재사용</span>
              </p>
              
              {/* AllConditionsDrawer 열기 버튼 */}
              <button
                type="button"
                onClick={() => setShowConditionsDrawer(true)}
                className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all font-medium flex items-center justify-between shadow-md hover:shadow-lg"
              >
                <span className="flex items-center space-x-2">
                  <span>🏥</span>
                  <span>질환/특수상황 선택하기</span>
                </span>
                <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                  {healthData.orthopedics && healthData.orthopedics.length > 0 
                    ? `${healthData.orthopedics.length}개 선택됨` 
                    : '선택 안함'}
                </span>
              </button>
              
              {/* 선택된 질환 목록 표시 */}
              {healthData.orthopedics && healthData.orthopedics.length > 0 && (
                <div className="mt-6 space-y-3">
                  <h4 className="text-sm font-semibold text-gray-800">✅ 선택된 질환/상황 ({healthData.orthopedics.length}개)</h4>
                  <div className="flex flex-wrap gap-2">
                    {healthData.orthopedics.map((conditionId) => {
                      const condition = jointConditions.find(c => c.id === conditionId);
                      return condition ? (
                        <div
                          key={conditionId}
                          className="group px-4 py-2 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg text-sm flex items-center space-x-2 hover:bg-blue-100 transition-colors"
                        >
                          <span className="font-medium">{condition.name}</span>
                          <button
                            type="button"
                            onClick={() => handleJointConditionToggle(conditionId)}
                            className="text-blue-400 hover:text-blue-600 font-bold text-lg leading-none group-hover:scale-110 transition-transform"
                            title="제거"
                          >
                            ×
                          </button>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>

            {healthData.orthopedics && healthData.orthopedics.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="text-sm text-green-800">
                  <p className="font-semibold mb-2">선택 완료: {healthData.orthopedics.length}개 질환/상황</p>
                  <p>선택하신 질환과 특수 상황에 따라 <strong>안전한 수영 영법과 운동 강도가 자동으로 조정</strong>됩니다.</p>
                </div>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="swim_level" className="block text-sm font-medium text-gray-700 mb-1">수영 실력</label>
              <div className="grid grid-cols-1 gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => handleInputChange('swim_profile.level', 'beginner_1')}
                  className={`w-full text-left p-4 border rounded-lg transition-all duration-200 ${
                    healthData.swim_profile?.level === 'beginner_1' 
                      ? 'bg-blue-600 text-white shadow-lg scale-105 border-blue-700' 
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300'
                  }`}
                >
                  <div className="text-left flex items-center gap-2">
                    {healthData.swim_profile?.level === 'beginner_1' && <CheckCircle className="h-4 w-4" />}
                    <div>
                      <div className="font-medium">완전 초보</div>
                      <div className="text-sm opacity-80">물에 익숙해지는 단계</div>
                    </div>
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={() => handleInputChange('swim_profile.level', 'beginner_2')}
                  className={`w-full text-left p-4 border rounded-lg transition-all duration-200 ${
                    healthData.swim_profile?.level === 'beginner_2' 
                      ? 'bg-blue-600 text-white shadow-lg scale-105 border-blue-700' 
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300'
                  }`}
                >
                  <div className="text-left flex items-center gap-2">
                    {healthData.swim_profile?.level === 'beginner_2' && <CheckCircle className="h-4 w-4" />}
                    <div>
                      <div className="font-medium">초급</div>
                      <div className="text-sm opacity-80">자유형 기본, 배영 가능</div>
                    </div>
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={() => handleInputChange('swim_profile.level', 'intermediate_1')}
                  className={`w-full text-left p-4 border rounded-lg transition-all duration-200 ${
                    healthData.swim_profile?.level === 'intermediate_1' 
                      ? 'bg-blue-600 text-white shadow-lg scale-105 border-blue-700' 
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300'
                  }`}
                >
                  <div className="text-left flex items-center gap-2">
                    {healthData.swim_profile?.level === 'intermediate_1' && <CheckCircle className="h-4 w-4" />}
                    <div>
                      <div className="font-medium">중급 하위</div>
                      <div className="text-sm opacity-80">자유형, 배영, 평영 가능</div>
                    </div>
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={() => handleInputChange('swim_profile.level', 'intermediate_2')}
                  className={`w-full text-left p-4 border rounded-lg transition-all duration-200 ${
                    healthData.swim_profile?.level === 'intermediate_2' 
                      ? 'bg-blue-600 text-white shadow-lg scale-105 border-blue-700' 
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300'
                  }`}
                >
                  <div className="text-left flex items-center gap-2">
                    {healthData.swim_profile?.level === 'intermediate_2' && <CheckCircle className="h-4 w-4" />}
                    <div>
                      <div className="font-medium">중급 상위</div>
                      <div className="text-sm opacity-80">모든 영법으로 100m 연속 수영</div>
                    </div>
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={() => handleInputChange('swim_profile.level', 'advanced_1')}
                  className={`w-full text-left p-4 border rounded-lg transition-all duration-200 ${
                    healthData.swim_profile?.level === 'advanced_1' 
                      ? 'bg-blue-600 text-white shadow-lg scale-105 border-blue-700' 
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300'
                  }`}
                >
                  <div className="text-left flex items-center gap-2">
                    {healthData.swim_profile?.level === 'advanced_1' && <CheckCircle className="h-4 w-4" />}
                    <div>
                      <div className="font-medium">고급 하위</div>
                      <div className="text-sm opacity-80">모든 영법으로 장거리 수영 가능</div>
                    </div>
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={() => handleInputChange('swim_profile.level', 'advanced_2')}
                  className={`w-full text-left p-4 border rounded-lg transition-all duration-200 ${
                    healthData.swim_profile?.level === 'advanced_2' 
                      ? 'bg-blue-600 text-white shadow-lg scale-105 border-blue-700' 
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300'
                  }`}
                >
                  <div className="text-left flex items-center gap-2">
                    {healthData.swim_profile?.level === 'advanced_2' && <CheckCircle className="h-4 w-4" />}
                    <div>
                      <div className="font-medium">고급 상위</div>
                      <div className="text-sm opacity-80">경쟁 수준, 기록 향상 목표</div>
                    </div>
                  </div>
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                💡 완전 초보: 물에 익숙해지는 단계 → 초급: 25m 자유형 가능 → 중급 하위: 100m 연속 수영 → 중급 상위: 모든 영법 가능 → 고급 하위: 장거리 수영 → 고급 상위: 경쟁 수준
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="zone2_pace" className="block text-sm font-medium text-gray-700 mb-1">존2 페이스 (초/100m)</label>
                <div className="flex gap-2">
                  <input
                    id="zone2_pace"
                    type="number"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={healthData.swim_profile?.zone2Pace || ''}
                    onChange={(e) => handleInputChange('swim_profile.zone2Pace', parseInt(e.target.value) || 0)}
                    placeholder="예: 120 (2분/100m)"
                  />
                  <button 
                    type="button" 
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                    onClick={() => {
                      const level = healthData.swim_profile?.level;
                      const recommendedPace = 
                        level === 'beginner_1' ? 240 : 
                        level === 'beginner_2' ? 180 : 
                        level === 'intermediate_1' ? 150 : 
                        level === 'intermediate_2' ? 120 : 
                        level === 'advanced_1' ? 100 : 
                        level === 'advanced_2' ? 90 : 150;
                      handleInputChange('swim_profile.zone2Pace', recommendedPace);
                    }}
                  >
                    추천
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  💡 편안하게 대화할 수 있는 페이스 (초급: 3분, 중급: 2.5분, 고급: 2분/100m)
                </p>
              </div>

              <div>
                <label htmlFor="max_50m_pace" className="block text-sm font-medium text-gray-700 mb-1">50m 최대 페이스 (초)</label>
                <div className="flex gap-2">
                  <input
                    id="max_50m_pace"
                    type="number"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={healthData.swim_profile?.max50mPace || ''}
                    onChange={(e) => handleInputChange('swim_profile.max50mPace', parseInt(e.target.value) || 0)}
                    placeholder="예: 45 (45초/50m)"
                  />
                  <button 
                    type="button" 
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                    onClick={() => {
                      const level = healthData.swim_profile?.level;
                      const recommendedPace = 
                        level === 'beginner_1' ? 120 : 
                        level === 'beginner_2' ? 90 : 
                        level === 'intermediate_1' ? 60 : 
                        level === 'intermediate_2' ? 50 : 
                        level === 'advanced_1' ? 45 : 
                        level === 'advanced_2' ? 40 : 60;
                      handleInputChange('swim_profile.max50mPace', recommendedPace);
                    }}
                  >
                    추천
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  💡 전력으로 50m 수영 시간 (초급: 90초, 중급: 60초, 고급: 45초)
                </p>
              </div>

              <div>
                <label htmlFor="max_400m_pace" className="block text-sm font-medium text-gray-700 mb-1">400m 최대 페이스 (분:초)</label>
                <div className="flex gap-2">
                  <input
                    id="max_400m_pace"
                    type="text"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={healthData.swim_profile?.max400mPace || ''}
                    onChange={(e) => handleInputChange('swim_profile.max400mPace', e.target.value)}
                    placeholder="예: 8:30 (8분30초)"
                  />
                  <button 
                    type="button" 
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                    onClick={() => {
                      const level = healthData.swim_profile?.level;
                      const recommendedPace = 
                        level === 'beginner_1' ? '20:00' : 
                        level === 'beginner_2' ? '15:00' : 
                        level === 'intermediate_1' ? '10:00' : 
                        level === 'intermediate_2' ? '8:30' : 
                        level === 'advanced_1' ? '7:00' : 
                        level === 'advanced_2' ? '6:30' : '10:00';
                      handleInputChange('swim_profile.max400mPace', recommendedPace);
                    }}
                  >
                    추천
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  💡 전력으로 400m 수영 시간 (초급: 15분, 중급: 10분, 고급: 8.5분)
                </p>
              </div>

              <div>
                <label htmlFor="max_1500m_pace" className="block text-sm font-medium text-gray-700 mb-1">1500m 최대 페이스 (분:초)</label>
                <div className="flex gap-2">
                  <input
                    id="max_1500m_pace"
                    type="text"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={healthData.swim_profile?.max1500mPace || ''}
                    onChange={(e) => handleInputChange('swim_profile.max1500mPace', e.target.value)}
                    placeholder="예: 35:00 (35분)"
                  />
                  <button 
                    type="button" 
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                    onClick={() => {
                      const level = healthData.swim_profile?.level;
                      const recommendedPace = 
                        level === 'beginner_1' ? '90:00' : 
                        level === 'beginner_2' ? '60:00' : 
                        level === 'intermediate_1' ? '45:00' : 
                        level === 'intermediate_2' ? '35:00' : 
                        level === 'advanced_1' ? '30:00' : 
                        level === 'advanced_2' ? '25:00' : '45:00';
                      handleInputChange('swim_profile.max1500mPace', recommendedPace);
                    }}
                  >
                    추천
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  💡 전력으로 1500m 수영 시간 (초급: 60분, 중급: 45분, 고급: 35분)
                </p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="space-y-2">
                  <h4 className="font-semibold text-yellow-800">페이스 측정 가이드</h4>
                  <div className="space-y-2">
                    <p><strong>📊 페이스가 프로그램에 미치는 영향:</strong></p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li><strong>존2 페이스:</strong> 기본 운동 강도 설정의 기준이 됩니다</li>
                      <li><strong>최대 페이스:</strong> 고강도 인터벌 트레이닝의 목표 시간을 결정합니다</li>
                      <li><strong>빈칸 허용:</strong> 모든 페이스를 채우지 않아도 다음 단계로 진행 가능합니다</li>
                    </ul>
                    
                    <p className="mt-3"><strong>🎯 수영실력별 추천 페이스:</strong></p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                      <div className="bg-blue-50 p-2 rounded">
                        <strong>완전 초보</strong><br/>
                        존2: 4분/100m<br/>
                        50m: 120초<br/>
                        400m: 20분<br/>
                        1500m: 90분
                      </div>
                      <div className="bg-green-50 p-2 rounded">
                        <strong>초급</strong><br/>
                        존2: 3분/100m<br/>
                        50m: 90초<br/>
                        400m: 15분<br/>
                        1500m: 60분
                      </div>
                      <div className="bg-yellow-50 p-2 rounded">
                        <strong>중급 하위</strong><br/>
                        존2: 2.5분/100m<br/>
                        50m: 60초<br/>
                        400m: 10분<br/>
                        1500m: 45분
                      </div>
                      <div className="bg-orange-50 p-2 rounded">
                        <strong>중급 상위</strong><br/>
                        존2: 2분/100m<br/>
                        50m: 50초<br/>
                        400m: 8.5분<br/>
                        1500m: 35분
                      </div>
                      <div className="bg-red-50 p-2 rounded">
                        <strong>고급 하위</strong><br/>
                        존2: 1.7분/100m<br/>
                        50m: 45초<br/>
                        400m: 7분<br/>
                        1500m: 30분
                      </div>
                      <div className="bg-purple-50 p-2 rounded">
                        <strong>고급 상위</strong><br/>
                        존2: 1.5분/100m<br/>
                        50m: 40초<br/>
                        400m: 6.5분<br/>
                        1500m: 25분
                      </div>
                    </div>
                    
                    <p className="mt-3"><strong>💡 모르는 경우:</strong> 각 페이스 옆의 "추천" 버튼을 클릭하거나, 수영장에서 실제 측정해보세요!</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="pool_type" className="block text-sm font-medium text-gray-700 mb-1">수영장 거리</label>
              <select 
                id="pool_type"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={healthData.swim_profile?.poolType || 'standard_25m'} 
                onChange={(e) => {
                  const value = e.target.value;
                  const poolDistance = value === 'standard_25m' ? 25 : value === 'standard_50m' ? 50 : 0;
                  handleInputChange('swim_profile.poolType', value);
                  handleInputChange('swim_profile.poolDistance', poolDistance);
                }}
              >
                <option value="standard_25m">25m (일반 수영장)</option>
                <option value="standard_50m">50m (올림픽 규격)</option>
                <option value="custom">직접 입력</option>
              </select>
            </div>

            {healthData.swim_profile?.poolType === 'custom' && (
              <div>
                <label htmlFor="custom_pool_distance" className="block text-sm font-medium text-gray-700 mb-1">수영장 거리 (미터)</label>
                <input
                  id="custom_pool_distance"
                  name="swim_profile.poolDistance"
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={healthData.swim_profile?.poolDistance || ''}
                  onChange={(e) => handleInputChange('swim_profile.poolDistance', parseInt(e.target.value) || 0)}
                  placeholder="예: 30 (30미터 수영장)"
                  min="10"
                  max="100"
                />
                <p className="text-sm text-gray-500 mt-1">
                  수영장의 실제 길이를 미터 단위로 입력하세요.
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                운동 가능한 요일 선택 (최대 50분/일)
                {healthData.availableDays && healthData.availableDays.length > 0 && (
                  <span className="ml-2 text-blue-600 font-semibold">
                    주 {healthData.availableDays.length}회
                  </span>
                )}
              </label>
              <div className="grid grid-cols-7 gap-2 mt-2">
                {['월', '화', '수', '목', '금', '토', '일'].map((day, index) => (
                  <div key={day} className="text-center">
                    <input
                      id={day}
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      checked={healthData.availableDays?.includes(index) || false}
                      onChange={(e) => {
                        const currentDays = healthData.availableDays || [];
                        const newDays = e.target.checked 
                          ? [...currentDays, index]
                          : currentDays.filter(day => day !== index);
                        handleInputChange('availableDays', newDays);
                      }}
                    />
                    <label htmlFor={day} className="block mt-1 text-sm font-medium text-gray-700">{day}</label>
                  </div>
                ))}
              </div>
              
              {/* 자동 계산된 주간 운동 계획 표시 */}
              {healthData.availableDays && healthData.availableDays.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-800">자동 생성된 주간 운동 계획</span>
                  </div>
                  <div className="text-sm text-blue-700">
                    <p>• 주 {healthData.availableDays.length}회 운동</p>
                    <p>• 총 운동 시간: {healthData.availableDays.length * 45}분/주</p>
                    <p>• 권장 세션 시간: 45분/회</p>
                  </div>
                </div>
              )}

              {/* CSS 입력 (Critical Swim Speed) */}
              <div className="mt-6">
                <h4 className="text-md font-semibold text-gray-800 mb-3">🏊 CSS (Critical Swim Speed)</h4>
                <p className="text-sm text-gray-600 mb-4">
                  100m 기준 최대 속도 (초). 모르면 비워두세요.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {(['freestyle', 'backstroke', 'breaststroke', 'butterfly'] as const).map((stroke) => (
                    <div key={stroke}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {stroke === 'freestyle' ? '자유형' :
                         stroke === 'backstroke' ? '배영' :
                         stroke === 'breaststroke' ? '평영' : '접영'}
                      </label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={healthData.swim_profile?.css?.[stroke] || ''}
                        onChange={(e) => handleInputChange(`swim_profile.css.${stroke}`, parseInt(e.target.value) || 0)}
                        placeholder="초"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  💡 CSS는 수영 능력을 측정하는 지표입니다. T400과 T200 측정으로 계산됩니다.
                </p>
              </div>

              {/* 선호 영법 선택 */}
              <div className="mt-6">
                <h4 className="text-md font-semibold text-gray-800 mb-3">❤️ 선호하는 영법</h4>
                <p className="text-sm text-gray-600 mb-4">
                  좋아하거나 잘하는 영법을 선택하세요. (복수 선택 가능)
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { id: 'freestyle', label: '🏊 자유형', icon: '🏊' },
                    { id: 'backstroke', label: '🤸 배영', icon: '🤸' },
                    { id: 'breaststroke', label: '🐸 평영', icon: '🐸' },
                    { id: 'butterfly', label: '🦋 접영', icon: '🦋' }
                  ].map((stroke) => (
                    <button
                      key={stroke.id}
                      type="button"
                      onClick={() => {
                        const current = healthData.swim_profile?.mainStrokes || [];
                        const excluded = healthData.swim_profile?.excludedStrokes || [];
                        
                        // 회피 영법에서 제거
                        if (excluded.includes(stroke.id)) {
                          handleInputChange('swim_profile.excludedStrokes', excluded.filter(s => s !== stroke.id));
                        }
                        
                        // 선호 영법 토글
                        const updated = current.includes(stroke.id)
                          ? current.filter(s => s !== stroke.id)
                          : [...current, stroke.id];
                        handleInputChange('swim_profile.mainStrokes', updated);
                      }}
                      className={`p-3 border-2 rounded-lg transition-all ${
                        healthData.swim_profile?.mainStrokes?.includes(stroke.id)
                          ? 'border-blue-500 bg-blue-50 text-blue-800 shadow-md'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{stroke.icon}</div>
                      <div className="text-sm font-medium">
                        {stroke.id === 'freestyle' ? '자유형' :
                         stroke.id === 'backstroke' ? '배영' :
                         stroke.id === 'breaststroke' ? '평영' : '접영'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 회피 영법 선택 */}
              <div className="mt-6">
                <h4 className="text-md font-semibold text-gray-800 mb-3">🚫 피하고 싶은 영법</h4>
                <p className="text-sm text-gray-600 mb-4">
                  불편하거나 못하는 영법을 선택하세요. (선택사항)
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { id: 'freestyle', label: '자유형', icon: '🏊' },
                    { id: 'backstroke', label: '배영', icon: '🤸' },
                    { id: 'breaststroke', label: '평영', icon: '🐸' },
                    { id: 'butterfly', label: '접영', icon: '🦋' }
                  ].map((stroke) => (
                    <button
                      key={stroke.id}
                      type="button"
                      onClick={() => {
                        const current = healthData.swim_profile?.excludedStrokes || [];
                        const preferred = healthData.swim_profile?.mainStrokes || [];
                        
                        // 선호 영법에서 제거
                        if (preferred.includes(stroke.id)) {
                          handleInputChange('swim_profile.mainStrokes', preferred.filter(s => s !== stroke.id));
                        }
                        
                        // 회피 영법 토글
                        const updated = current.includes(stroke.id)
                          ? current.filter(s => s !== stroke.id)
                          : [...current, stroke.id];
                        handleInputChange('swim_profile.excludedStrokes', updated);
                      }}
                      className={`p-3 border-2 rounded-lg transition-all ${
                        healthData.swim_profile?.excludedStrokes?.includes(stroke.id)
                          ? 'border-red-500 bg-red-50 text-red-800 shadow-md'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-red-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{stroke.icon}</div>
                      <div className="text-sm font-medium">{stroke.label}</div>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  ⚠️ 선호 영법과 회피 영법은 중복 선택할 수 없습니다.
                </p>
              </div>

              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <div className="space-y-2">
                    <h4 className="font-semibold text-yellow-800">운동 강도 가이드</h4>
                    <div className="space-y-3">
                      {intensityGuide ? (
                        <div className="space-y-3">
                          <p><strong>🎯 운동 가능한 날이 {intensityGuide.totalWorkoutDays}일인 경우:</strong></p>
                          <div className="grid gap-2">
                            {intensityGuide.days
                              .filter(day => day.intensity !== 'rest')
                              .map((day, index) => (
                                <div key={day.day} className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <strong className="text-blue-800">{day.day}요일:</strong>
                                      <span className="ml-2 text-blue-700">{day.focus}</span>
                                    </div>
                                    <div className="text-sm text-blue-600">
                                      {day.duration}분
                                    </div>
                                  </div>
                                  <p className="text-sm text-blue-600 mt-1">{day.description}</p>
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {day.benefits && day.benefits.map((benefit, idx) => (
                                      <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                                        {benefit}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              ))}
                          </div>
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">
                              <strong>총 운동 시간:</strong> {intensityGuide.totalDuration}분/주
                            </p>
                            <p className="text-sm text-gray-600">
                              <strong>강도 분포:</strong> 쉬운 운동 {intensityGuide.intensityDistribution.easy}일, 
                              보통 운동 {intensityGuide.intensityDistribution.moderate}일, 
                              힘든 운동 {intensityGuide.intensityDistribution.hard}일
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p className="mt-2"><strong>💡 강사나 회원이 필요에 따라 강도를 조정할 수 있습니다.</strong></p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">수영 체크리스트 (강사 평가 결과 반영)</label>
              
              {/* 강사 체크리스트 불러오기 버튼 */}
              <div className="mb-4">
                <button 
                  type="button" 
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-all duration-300"
                  onClick={(event) => {
                    // 실제로는 현재 사용자 ID를 사용해야 함
                    const instructorChecklist = getInstructorChecklist('user_001');
                    if (instructorChecklist) {
                      const checkedItems = instructorChecklist.items.map(item => item.id);
                      handleInputChange('swim_profile.checklist', checkedItems);
                      handleInputChange('swim_profile.instructorNotes', instructorChecklist.notes);
                      handleInputChange('swim_profile.overallLevel', instructorChecklist.overallLevel);
                      
                      // 성공 피드백
                      const button = event.currentTarget;
                      const originalText = button.textContent;
                      button.textContent = '✅ 불러오기 완료!';
                      button.className = 'px-4 py-2 bg-green-500 text-white rounded-md transition-all duration-300';
                      setTimeout(() => {
                        button.textContent = originalText;
                        button.className = 'px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-all duration-300';
                      }, 2000);
                    } else {
                      // 실패 피드백
                      const button = event.currentTarget;
                      const originalText = button.textContent;
                      button.textContent = '❌ 데이터 없음';
                      button.className = 'px-4 py-2 bg-red-500 text-white rounded-md transition-all duration-300';
                      setTimeout(() => {
                        button.textContent = originalText;
                        button.className = 'px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-all duration-300';
                      }, 2000);
                    }
                  }}
                >
                  강사 체크리스트 불러오기
                </button>
                <p className="text-xs text-gray-500 mt-1">
                  💡 강사가 평가한 체크리스트를 불러와서 자동으로 체크됩니다
                </p>
              </div>

              {/* 강사 평가 결과 표시 */}
              {healthData.swim_profile?.instructorNotes && (
                <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <div className="space-y-2">
                      <h4 className="font-semibold text-yellow-800">강사 평가 결과</h4>
                      <div className="text-sm text-yellow-800">
                        <p>{healthData.swim_profile.instructorNotes}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          전체 수준: {healthData.swim_profile.overallLevel === 'beginner' ? '초급' : 
                                      healthData.swim_profile.overallLevel === 'intermediate' ? '중급' : '고급'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                {getChecklistItems().map((item) => (
                  <div key={item.id} className="flex items-center space-x-2">
                    <input
                      id={item.id}
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      checked={healthData.swim_profile?.checklist?.includes(item.id) || false}
                      onChange={(e) => {
                        const currentChecklist = healthData.swim_profile?.checklist || [];
                        if (e.target.checked) {
                          handleInputChange('swim_profile.checklist', [...currentChecklist, item.id]);
                        } else {
                          handleInputChange('swim_profile.checklist', currentChecklist.filter(id => id !== item.id));
                        }
                      }}
                    />
                    <label htmlFor={item.id} className="text-sm font-medium text-gray-700">
                      {item.label}
                      <span className={`ml-2 px-1 py-0.5 text-xs rounded ${
                        item.level === 'beginner' ? 'bg-blue-100 text-blue-800' :
                        item.level === 'intermediate' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {item.level === 'beginner' ? '초급' : item.level === 'intermediate' ? '중급' : '고급'}
                      </span>
                      {item.checkedBy === 'instructor' && (
                        <span className="ml-1 px-1 py-0.5 text-xs rounded bg-yellow-100 text-yellow-800">
                          강사체크
                        </span>
                      )}
                    </label>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                💡 체크리스트를 기반으로 맞춤형 드릴훈련과 훈련법이 제공됩니다
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">수영 실력별 특징</h3>
              </div>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">초급 (Beginner)</h4>
                  <p className="text-sm text-gray-600">
                    기본 영법(자유형, 배영) 가능. 운동 강도와 시간이 제한적으로 설정됩니다.
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">중급 (Intermediate)</h4>
                  <p className="text-sm text-gray-600">
                    여러 영법 가능. 다양한 운동 프로그램을 제공받을 수 있습니다.
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">고급 (Advanced)</h4>
                  <p className="text-sm text-gray-600">
                    모든 영법 가능. 고강도 운동 프로그램을 제공받을 수 있습니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        const availableGoals = [
          '체중 감량',
          '심혈관 건강 개선',
          '관절 통증 완화',
          '체력 향상',
          '스트레스 해소',
          '수영 실력 향상'
        ];

        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">운동 목표 선택</h3>
              <p className="text-sm text-gray-600 mb-6">
                운동을 통해 달성하고 싶은 목표를 선택해주세요. (단일 선택)
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableGoals.map((goal) => (
                  <div key={goal} className="flex items-center space-x-2">
                    <input
                      id={goal}
                      type="radio"
                      name="primary_goal"
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      checked={healthData.goals?.primary === goal || false}
                      onChange={() => handleGoalToggle(goal)}
                    />
                    <label htmlFor={goal} className="flex-1 text-sm font-medium text-gray-700">
                      {goal}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {healthData.goals && healthData.goals.primary && healthData.goals.primary !== '' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
                <Target className="h-4 w-4 text-green-600 mt-0.5" />
                <div className="text-sm text-green-800">
                  선택된 목표에 따라 맞춤형 운동 프로그램이 생성됩니다.
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const handleSubmit = async () => {
    try {
      // 건강정보 (질환/특수상황은 orthopedics에 포함)
      const completeHealthData = {
        ...healthData
      };

      // API 호출하여 건강정보 저장 및 운동 프로그램 생성
      const response = await fetch('/api/health/input', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(completeHealthData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('건강정보 저장 성공:', result);
        
        // 운동 프로그램 페이지로 이동 후 수영 트레이닝 규칙 엔진으로 리다이렉트
        window.location.href = `/admin/swim-training-engine?generated=true&userId=${result.userId}`;
      } else {
        const error = await response.json();
        console.error('건강정보 저장 실패:', error);
        alert('건강정보 저장에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('건강정보 저장 오류:', error);
      alert('서버 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">건강정보 입력</h1>
        <p className="text-gray-600">나의 건강 상태를 입력하여 맞춤형 수영 프로그램을 받아보세요.</p>
      </div>

      {/* 진행 단계 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <div 
              key={step.id} 
              className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => {
                // 모든 단계를 미리 볼 수 있도록 허용
                setCurrentStep(step.id);
              }}
            >
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                currentStep >= step.id 
                  ? 'bg-blue-600 border-blue-600 text-white' 
                  : 'border-gray-300 text-gray-500'
              }`}>
                {currentStep > step.id ? (
                  isStepValid(step.id) ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertTriangle className="h-4 w-4" />
                  )
                ) : (
                  <span className="text-sm font-medium">{step.id}</span>
                )}
              </div>
              <div className="ml-3">
                <div className="flex items-center gap-2">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                  {step.id < currentStep && (
                    isStepValid(step.id) ? (
                      <CheckCircle className="h-3 w-3 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-3 w-3 text-orange-500" />
                    )
                  )}
                  {step.id === currentStep && (
                    <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
                  )}
                </div>
                <p className="text-xs text-gray-500">{step.description}</p>
                {step.id < currentStep && (
                  <p className={`text-xs font-medium ${isStepValid(step.id) ? 'text-green-600' : 'text-orange-600'}`}>
                    {isStepValid(step.id) ? '✓ 완료됨' : '⚠ 미입력'}
                  </p>
                )}
                {step.id === currentStep && (
                  <p className="text-xs text-blue-600 font-medium">● 진행 중</p>
                )}
                {step.id > currentStep && (
                  <p className="text-xs text-gray-400">○ 대기 중</p>
                )}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 h-0.5 mx-4 ${
                  currentStep > step.id ? 'bg-blue-600' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 text-center">
          💡 단계 제목을 클릭하면 해당 입력창으로 바로 이동할 수 있습니다
        </p>
      </div>

      {/* 단계별 콘텐츠 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            {currentStep === 1 && <User className="h-5 w-5" />}
            {currentStep === 2 && <Heart className="h-5 w-5" />}
            {currentStep === 3 && <Activity className="h-5 w-5" />}
            {currentStep === 4 && <Target className="h-5 w-5" />}
            {currentStep === 5 && <CheckCircle className="h-5 w-5" />}
            {steps[currentStep - 1].title}
          </h2>
          <p className="text-gray-600">{steps[currentStep - 1].description}</p>
        </div>
        <div className="space-y-4">
          {renderStepContent()}
        </div>
      </div>

      {/* 네비게이션 버튼 */}
      <div className="flex justify-between mt-8">
        <button
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={prevStep}
          disabled={currentStep === 1}
        >
          이전
        </button>
        
        {currentStep < steps.length ? (
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            onClick={nextStep}
            disabled={!isStepValid(currentStep)}
          >
            다음
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            onClick={handleSubmit}
            disabled={!isStepValid(currentStep)}
          >
            <Save className="h-4 w-4" />
            건강정보 저장 및 프로그램 생성
          </button>
        )}
      </div>

      {/* AllConditionsDrawer 모달 */}
      {showConditionsDrawer && (
        <AllConditionsDrawer
          value={healthData.orthopedics || []}
          onChange={(selectedIds) => {
            setHealthData(prev => ({
              ...prev,
              orthopedics: selectedIds
            }));
          }}
          onClose={() => setShowConditionsDrawer(false)}
        />
      )}
    </div>
  );
}
