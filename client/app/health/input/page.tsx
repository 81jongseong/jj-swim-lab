/**
 * 회원 건강정보 입력 페이지 (2단계 간소화 버전)
 * 
 * Step 1: 기본+건강 정보 (신체정보, 건강검진, 질환/상황)
 * Step 2: 수영+목표 (급수, CSS, 영법, 일정, 생리학적 지표, 운동목표)
 * 
 * 연동되는 데이터:
 * - 회원 기본 정보 (나이, 성별, 신체 정보)
 * - 건강검진 결과 (혈압, 혈당, 콜레스테롤 등)
 * - 관절질환 정보 (AllConditionsDrawer 사용)
 * - 수영 실력 평가
 * - 운동 목표
 * 
 * 연동되는 파일:
 * - /data/joint-conditions.ts (관절질환 가이드라인)
 * - /components/swimlab/AllConditionsDrawer (50+ 컨디션)
 */

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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
import AllConditionsDrawer from '@/components/swimlab/AllConditionsDrawer';
import CSSInputSection from '@/components/swimlab/member-variables/CSSInputSection';
import PhysiologicalMetricsSection from '@/components/swimlab/member-variables/PhysiologicalMetricsSection';
import StrokesSelectionSection from '@/components/swimlab/member-variables/StrokesSelectionSection';
import TrainingScheduleSection from '@/components/swimlab/member-variables/TrainingScheduleSection';

// 타입 정의
interface HealthInput {
  demographics: { age: number; sex: string };
  anthropometrics: { height_cm: number; weight_kg: number };
  vitals: { 
    rest_hr: number; 
    rest_bp: { sbp: number; dbp: number }; 
    on_beta_blocker: boolean;
    bloodSugar?: number;
    totalCholesterol?: number;
    ldlCholesterol?: number;
    hdlCholesterol?: number;
  };
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
    css?: {
      freestyle: number;
      backstroke: number;
      breaststroke: number;
      butterfly: number;
    };
    mainStrokes?: string[];
    excludedStrokes?: string[];
    trainingDays?: number[]; // 요일 선택 (0:일 ~ 6:토)
    daysPerWeek?: number;
    sessionDuration?: number;
    poolLength?: number;
    vo2max?: number;
    maxHeartRate?: number;
    restingHeartRate?: number;
  };
  goals?: {
    primary: string;
    secondary: string;
    target: string;
  };
}

export default function HealthInputPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [healthData, setHealthData] = useState<HealthInput>({
    demographics: { age: 30, sex: 'male' },
    anthropometrics: { height_cm: 170, weight_kg: 70 },
    vitals: { 
      rest_hr: 70, 
      rest_bp: { sbp: 120, dbp: 80 }, 
      on_beta_blocker: false,
      bloodSugar: 0,
      totalCholesterol: 0,
      ldlCholesterol: 0,
      hdlCholesterol: 0
    },
    conditions: {
      hypertension: 'none',
      obesity: 'none',
      dyslipidemia: false,
      diabetes: false,
      heartDisease: false,
      respiratoryDisease: false,
      mentalHealth: false
    },
    orthopedics: [],
    swim_profile: {
      level: 'beginner_1',
      grade: '초급',
      css: { freestyle: 0, backstroke: 0, breaststroke: 0, butterfly: 0 },
      mainStrokes: [],
      excludedStrokes: [],
      trainingDays: [],
      daysPerWeek: 0,
      sessionDuration: 60,
      poolLength: 25,
      vo2max: 0,
      maxHeartRate: 0,
      restingHeartRate: 0
    },
    goals: { primary: '', secondary: '', target: '' }
  });

  const [showConditionsDrawer, setShowConditionsDrawer] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 단계 정의 (3단계)
  const steps = [
    { 
      id: 1, 
      title: '기본+건강 정보', 
      icon: '🏥',
      description: '나이, 성별, 신체정보, 건강검진, 질환/상황' 
    },
    { 
      id: 2, 
      title: '수영+운동 목표', 
      icon: '🏊',
      description: '수영 급수, CSS, 영법, 주간 일정, 운동 목표' 
    },
    {
      id: 3,
      title: '건강 브리핑',
      icon: '📊',
      description: '건강 분석, 운동 강도 권장, 체험 프로그램'
    }
  ];

  // 입력 핸들러
  const handleInputChange = (field: string, value: any) => {
    setHealthData(prev => {
      const keys = field.split('.');
      let updated = { ...prev };
      let current: any = updated;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;

      // BMI 자동 계산 및 비만 진단
      if (field === 'anthropometrics.height_cm' || field === 'anthropometrics.weight_kg') {
        const bmi = updated.anthropometrics.weight_kg / Math.pow(updated.anthropometrics.height_cm / 100, 2);
        if (bmi >= 30) {
          updated.conditions.obesity = 'severe';
          if (!updated.orthopedics.includes('obesity-severe')) {
            updated.orthopedics = [...updated.orthopedics.filter(id => !id.startsWith('obesity') && id !== 'overweight'), 'obesity-severe'];
          }
        } else if (bmi >= 25) {
          updated.conditions.obesity = 'mild';
          if (!updated.orthopedics.includes('obesity')) {
            updated.orthopedics = [...updated.orthopedics.filter(id => !id.startsWith('obesity') && id !== 'overweight'), 'obesity'];
          }
        } else if (bmi >= 23) {
          updated.conditions.obesity = 'none';
          if (!updated.orthopedics.includes('overweight')) {
            updated.orthopedics = [...updated.orthopedics.filter(id => !id.startsWith('obesity') && id !== 'overweight'), 'overweight'];
          }
        } else {
          updated.conditions.obesity = 'none';
          updated.orthopedics = updated.orthopedics.filter(id => !id.startsWith('obesity') && id !== 'overweight');
        }
      }

      // 고혈압 자동 진단
      if (field === 'vitals.rest_bp.sbp' || field === 'vitals.rest_bp.dbp') {
        if (updated.vitals.rest_bp.sbp >= 140 || updated.vitals.rest_bp.dbp >= 90) {
          updated.conditions.hypertension = 'stage2';
          if (!updated.orthopedics.includes('hypertension-stage2')) {
            updated.orthopedics = [...updated.orthopedics.filter(id => !id.startsWith('hypertension')), 'hypertension-stage2'];
          }
        } else if (updated.vitals.rest_bp.sbp >= 130 || updated.vitals.rest_bp.dbp >= 80) {
          updated.conditions.hypertension = 'stage1';
          if (!updated.orthopedics.includes('hypertension')) {
            updated.orthopedics = [...updated.orthopedics.filter(id => !id.startsWith('hypertension')), 'hypertension'];
          }
        } else if (updated.vitals.rest_bp.sbp >= 120) {
          updated.conditions.hypertension = 'elevated';
          if (!updated.orthopedics.includes('hypertension-elevated')) {
            updated.orthopedics = [...updated.orthopedics.filter(id => !id.startsWith('hypertension')), 'hypertension-elevated'];
          }
        } else {
          updated.conditions.hypertension = 'none';
          updated.orthopedics = updated.orthopedics.filter(id => !id.startsWith('hypertension'));
        }
      }

      // 당뇨 자동 진단
      if (field === 'vitals.bloodSugar' && updated.vitals.bloodSugar && updated.vitals.bloodSugar >= 126) {
        updated.conditions.diabetes = true;
        if (!updated.orthopedics.includes('diabetes')) {
          updated.orthopedics = [...updated.orthopedics, 'diabetes'];
        }
      } else if (field === 'vitals.bloodSugar') {
        updated.conditions.diabetes = false;
        updated.orthopedics = updated.orthopedics.filter(id => id !== 'diabetes');
      }

      // 고지혈증 자동 진단
      if ((field === 'vitals.totalCholesterol' || field === 'vitals.ldlCholesterol') && 
          ((updated.vitals.totalCholesterol && updated.vitals.totalCholesterol >= 240) || 
           (updated.vitals.ldlCholesterol && updated.vitals.ldlCholesterol >= 160))) {
        updated.conditions.dyslipidemia = true;
        if (!updated.orthopedics.includes('dyslipidemia')) {
          updated.orthopedics = [...updated.orthopedics, 'dyslipidemia'];
        }
      } else if (field === 'vitals.totalCholesterol' || field === 'vitals.ldlCholesterol') {
        updated.conditions.dyslipidemia = false;
        updated.orthopedics = updated.orthopedics.filter(id => id !== 'dyslipidemia');
      }

      return updated;
    });
  };

  // 질환 토글
  const handleJointConditionToggle = (conditionId: string) => {
    setHealthData(prev => {
      const newOrthopedics = prev.orthopedics.includes(conditionId)
        ? prev.orthopedics.filter(id => id !== conditionId)
        : [...prev.orthopedics, conditionId];
      return { ...prev, orthopedics: newOrthopedics };
    });
  };

  // 건강 분석 로직 (상세 버전)
  const analyzeHealth = () => {
    const bmi = healthData.anthropometrics.weight_kg / Math.pow(healthData.anthropometrics.height_cm / 100, 2);
    const hasHighBP = healthData.vitals.rest_bp.sbp >= 130 || healthData.vitals.rest_bp.dbp >= 80;
    const hasSevereHypertension = healthData.vitals.rest_bp.sbp >= 140 || healthData.vitals.rest_bp.dbp >= 90;
    const hasDiabetes = healthData.vitals.bloodSugar && healthData.vitals.bloodSugar >= 126;
    const hasDyslipidemia = (healthData.vitals.totalCholesterol && healthData.vitals.totalCholesterol >= 240) || 
                            (healthData.vitals.ldlCholesterol && healthData.vitals.ldlCholesterol >= 160);
    
    const recommendations = [];
    let baseIntensity = 100; // 기본 강도 100%
    
    // 비만 관련 권장사항 (WHO/ACSM 기반)
    if (bmi >= 30) {
      baseIntensity = Math.min(baseIntensity, 70); // 고도비만: 70% 강도
      recommendations.push({ 
        icon: '⚠️', 
        type: 'warning',
        title: '고도비만 (BMI ≥30)', 
        intensity: '정상 대비 70% 강도',
        duration: '주당 250-300분 (주 5-6일)',
        avoid: ['고강도 인터벌', '점프 동작', '무릎에 부담가는 킥'],
        recommend: ['Zone 2 강도 유지', '긴 거리 천천히', '배영/평영 중심', '풀부이 사용'],
        detail: 'WHO 가이드라인: 비만인 경우 일반인보다 더 긴 시간(250분+)의 유산소 운동이 필요합니다. 관절 보호를 위해 저강도로 시작하세요.'
      });
    } else if (bmi >= 25) {
      baseIntensity = Math.min(baseIntensity, 80); // 경도비만: 80% 강도
      recommendations.push({ 
        icon: '💡', 
        type: 'info',
        title: '경도비만 (BMI 25-29.9)', 
        intensity: '정상 대비 80% 강도',
        duration: '주당 150-250분 (주 3-5일)',
        avoid: ['과도한 스프린트', '무리한 인터벌'],
        recommend: ['Zone 2-3 강도', '유산소 중심', '점진적 강도 증가'],
        detail: '체중 감량을 위해서는 일반 권장량(150분)보다 더 많은 운동 시간이 필요합니다. 꾸준히 하는 것이 중요합니다.'
      });
    }
    
    // 고혈압 관련 (ACSM 기반)
    if (hasSevereHypertension) {
      baseIntensity = Math.min(baseIntensity, 60); // 고혈압 2기: 60% 강도
      recommendations.push({ 
        icon: '❤️', 
        type: 'danger',
        title: '고혈압 2기 (≥140/90 mmHg)', 
        intensity: '정상 대비 60% 강도 (의사 상담 필수)',
        duration: '주당 150분 이상 (주 5일 이상)',
        avoid: ['고강도 인터벌', '숨참기', '발살바 동작', '무산소 운동'],
        recommend: ['Zone 1-2만 사용', '느린 페이스', '충분한 호흡', '혈압 모니터링'],
        detail: 'ACSM 권고: 고혈압 환자는 중강도(40-60% HRR) 이하로만 운동해야 합니다. 운동 중 혈압이 180/110 이상 상승하면 즉시 중단하세요.'
      });
    } else if (hasHighBP) {
      baseIntensity = Math.min(baseIntensity, 75); // 고혈압 1기: 75% 강도
      recommendations.push({ 
        icon: '❤️', 
        type: 'warning',
        title: '고혈압 1기 (≥130/80 mmHg)', 
        intensity: '정상 대비 75% 강도',
        duration: '주당 150-200분 (주 4-5일)',
        avoid: ['고강도 스프린트', '과도한 킥 세트', '숨참기'],
        recommend: ['Zone 2 중심', '편안한 페이스', '일정한 호흡 패턴'],
        detail: '고혈압 초기 단계입니다. 규칙적인 유산소 운동으로 혈압을 낮출 수 있습니다. Zone 2 강도(대화 가능한 수준)를 유지하세요.'
      });
    }
    
    // 당뇨 관련 (ADA 기반)
    if (hasDiabetes) {
      baseIntensity = Math.min(baseIntensity, 65); // 당뇨: 65% 강도
      recommendations.push({ 
        icon: '🩺', 
        type: 'danger',
        title: '당뇨 의심 (공복혈당 ≥126 mg/dL)', 
        intensity: '정상 대비 65% 강도 (의사 상담 필수)',
        duration: '주당 150분 이상 (주 3일 이상, 연속 이틀 공백 금지)',
        avoid: ['공복 운동', '과도한 유산소', '저혈당 위험 상황'],
        recommend: ['혈당 측정 후 운동', '당분 준비', '중강도 유산소', '근력운동 병행'],
        detail: 'ADA 권고: 당뇨 환자는 운동 전후 혈당을 체크해야 합니다. 혈당 100 미만이면 당분 섭취 후 운동하세요. 연속 2일 이상 쉬지 마세요.'
      });
    }
    
    // 고지혈증 관련
    if (hasDyslipidemia) {
      baseIntensity = Math.min(baseIntensity, 80); // 고지혈증: 80% 강도
      recommendations.push({ 
        icon: '💊', 
        type: 'warning',
        title: '고지혈증 의심 (TC ≥240 or LDL ≥160)', 
        intensity: '정상 대비 80% 강도',
        duration: '주당 150-200분 (주 4-5일)',
        avoid: ['과도한 무산소 운동', '불규칙한 운동'],
        recommend: ['중강도 유산소 중심', 'Zone 2-3 강도', '꾸준한 운동 습관'],
        detail: 'ACSM 권고: 고지혈증 개선을 위해서는 규칙적인 유산소 운동이 필수입니다. LDL 콜레스테롤을 낮추고 HDL을 높이는 효과가 있습니다.'
      });
    }
    
    // 관절 질환 관련
    const hasKneePain = healthData.orthopedics.includes('knee-pain');
    const hasBackPain = healthData.orthopedics.includes('back-pain');
    const hasShoulderPain = healthData.orthopedics.includes('shoulder-pain');
    
    if (hasKneePain) {
      baseIntensity = Math.min(baseIntensity, 75);
      recommendations.push({ 
        icon: '🦵', 
        type: 'warning',
        title: '무릎 통증', 
        intensity: '정상 대비 75% 강도',
        duration: '통증 없는 범위 내에서',
        avoid: ['강한 킥 세트', '접영', '턴 시 무릎 굽히기', '브레스트 킥'],
        recommend: ['풀부이 사용', '배영 중심', '부드러운 플러터 킥', '스트레칭 필수'],
        detail: '무릎에 부담이 가는 브레스트 킥과 접영은 피하세요. 풀부이를 사용하거나 배영 위주로 운동하세요.'
      });
    }
    
    if (hasBackPain) {
      baseIntensity = Math.min(baseIntensity, 75);
      recommendations.push({ 
        icon: '🦴', 
        type: 'warning',
        title: '허리/등 통증', 
        intensity: '정상 대비 75% 강도',
        duration: '통증 없는 범위 내에서',
        avoid: ['접영', '과도한 아치 동작', '무리한 회전', '급격한 방향 전환'],
        recommend: ['배영 중심', '코어 강화', '바른 자세 유지', '워밍업 충분히'],
        detail: '허리에 무리가 가는 접영과 과도한 회전 동작은 피하세요. 배영으로 코어를 강화하는 것이 도움됩니다.'
      });
    }
    
    if (hasShoulderPain) {
      baseIntensity = Math.min(baseIntensity, 75);
      recommendations.push({ 
        icon: '💪', 
        type: 'warning',
        title: '어깨 통증', 
        intensity: '정상 대비 75% 강도',
        duration: '통증 없는 범위 내에서',
        avoid: ['접영', '과도한 풀 동작', '무리한 스트로크', '높은 엘보우'],
        recommend: ['평영 중심', '짧은 스트로크', '어깨 스트레칭', '로테이터 커프 강화'],
        detail: '어깨에 부담이 큰 접영과 자유형의 과도한 풀은 피하세요. 평영으로 부담을 줄이고 어깨 근력을 강화하세요.'
      });
    }
    
    return { bmi, recommendations, baseIntensity };
  };

  // 유효성 검사
  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(
          healthData.demographics.age > 0 &&
          healthData.demographics.sex &&
          healthData.anthropometrics.height_cm > 0 &&
          healthData.anthropometrics.weight_kg > 0
        );
      case 2:
        return !!(
          healthData.swim_profile?.level &&
          healthData.goals?.primary &&
          healthData.goals.primary !== ''
        );
      case 3:
        return true; // Step 3은 항상 유효 (브리핑만 보여줌)
      default:
        return false;
    }
  };

  // 저장만 하기 (나중에 프로그램 생성)
  const handleSaveOnly = async () => {
    setIsSaving(true);
    try {
      // TODO: API 호출
      console.log('건강정보 저장:', healthData);
      alert('건강정보가 저장되었습니다! 대시보드에서 프로그램을 생성할 수 있습니다.');
      router.push('/dashboard');
    } catch (error) {
      console.error('저장 오류:', error);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  // 하루짜리 체험 프로그램 생성
  const handleGenerateDailyProgram = async () => {
    setIsSaving(true);
    try {
      // 1. 건강정보 저장
      console.log('건강정보 저장:', healthData);
      
      // 2. 하루짜리 프로그램 생성
      const programParams = {
        athleteId: 'guest', // 게스트 사용자
        athleteName: '체험 회원',
        programType: 'daily', // 하루짜리 체험
        params: {
          startDate: new Date().toISOString().split('T')[0],
          daysPerWeek: 1, // 하루만
          sessionDuration: healthData.swim_profile.sessionDuration || 60,
          pool: 25,
          mainStrokes: healthData.swim_profile.mainStrokes || ['freestyle'],
          excludedStrokes: healthData.swim_profile.excludedStrokes || [],
          cssPer100: healthData.swim_profile.css || {},
          conditionIds: healthData.orthopedics,
          goal: healthData.goals?.primary || '체력 향상'
        }
      };
      
      console.log('🏊 하루짜리 체험 프로그램 생성:', programParams);
      
      // TODO: 실제 API 호출
      // const response = await apiClient.post('/api/programs/daily-trial', programParams);
      
      alert('🎉 오늘의 맞춤 프로그램이 생성되었습니다!\n\n프로그램 페이지로 이동합니다.');
      router.push('/dashboard'); // 게스트는 대시보드로
    } catch (error) {
      console.error('프로그램 생성 오류:', error);
      alert('프로그램 생성 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  // Step 렌더링
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            {/* 기본 정보 */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <User className="h-5 w-5 mr-2" />
                기본 정보
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">나이</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={healthData.demographics.age}
                    onChange={(e) => handleInputChange('demographics.age', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">성별</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={healthData.demographics.sex}
                    onChange={(e) => handleInputChange('demographics.sex', e.target.value)}
                  >
                    <option value="male">남성</option>
                    <option value="female">여성</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">키 (cm)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={healthData.anthropometrics.height_cm}
                    onChange={(e) => handleInputChange('anthropometrics.height_cm', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">몸무게 (kg)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={healthData.anthropometrics.weight_kg}
                    onChange={(e) => handleInputChange('anthropometrics.weight_kg', parseInt(e.target.value))}
                  />
                </div>
              </div>
            </div>

            {/* 건강검진 */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Heart className="h-5 w-5 mr-2" />
                건강검진 <span className="ml-2 text-sm font-normal text-gray-500">(선택사항)</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">수축기 혈압 (mmHg)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={healthData.vitals.rest_bp.sbp}
                    onChange={(e) => handleInputChange('vitals.rest_bp.sbp', parseInt(e.target.value))}
                    placeholder="120"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">이완기 혈압 (mmHg)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={healthData.vitals.rest_bp.dbp}
                    onChange={(e) => handleInputChange('vitals.rest_bp.dbp', parseInt(e.target.value))}
                    placeholder="80"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">공복 혈당 (mg/dL)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={healthData.vitals.bloodSugar || ''}
                    onChange={(e) => handleInputChange('vitals.bloodSugar', parseInt(e.target.value) || 0)}
                    placeholder="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">총 콜레스테롤 (mg/dL)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={healthData.vitals.totalCholesterol || ''}
                    onChange={(e) => handleInputChange('vitals.totalCholesterol', parseInt(e.target.value) || 0)}
                    placeholder="200"
                  />
                </div>
              </div>

              {/* 자동 진단 결과 */}
              {(healthData.conditions.obesity !== 'none' || healthData.conditions.hypertension !== 'none' || 
                healthData.conditions.diabetes || healthData.conditions.dyslipidemia) && (
                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-semibold mb-2">✨ 자동 진단 결과</p>
                      <ul className="list-disc list-inside space-y-1">
                        {healthData.conditions.obesity === 'severe' && <li>고도비만 (BMI ≥30)</li>}
                        {healthData.conditions.obesity === 'mild' && <li>경도비만 (BMI 25-29.9)</li>}
                        {healthData.conditions.hypertension === 'stage2' && <li>고혈압 2기 (≥140/90)</li>}
                        {healthData.conditions.hypertension === 'stage1' && <li>고혈압 1기 (≥130/80)</li>}
                        {healthData.conditions.diabetes && <li>당뇨 의심 (공복혈당 ≥126)</li>}
                        {healthData.conditions.dyslipidemia && <li>고지혈증 의심 (TC ≥240 or LDL ≥160)</li>}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 질환/상황 */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                질환/상황 <span className="ml-2 text-sm font-normal text-gray-500">(선택사항)</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowConditionsDrawer(true)}
                className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all font-medium flex items-center justify-between shadow-md"
              >
                <span className="flex items-center space-x-2">
                  <span>🏥</span>
                  <span>질환/특수상황 선택하기</span>
                </span>
                <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                  {healthData.orthopedics.length > 0 ? `${healthData.orthopedics.length}개 선택됨` : '선택 안함'}
                </span>
              </button>

              {/* 선택된 질환 목록 */}
              {healthData.orthopedics.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {healthData.orthopedics.map((conditionId) => {
                    const isAutoDiagnosed = ['obesity', 'obesity-severe', 'overweight', 'hypertension', 'hypertension-stage2', 'hypertension-elevated', 'diabetes', 'dyslipidemia'].includes(conditionId);
                    return (
                      <div
                        key={conditionId}
                        className={`px-3 py-1 rounded-lg text-sm flex items-center space-x-2 ${
                          isAutoDiagnosed ? 'bg-yellow-100 border border-yellow-300 text-yellow-800' : 'bg-blue-100 border border-blue-300 text-blue-800'
                        }`}
                      >
                        {isAutoDiagnosed && <span>✨</span>}
                        <span>{conditionId}</span>
                        <button
                          type="button"
                          onClick={() => handleJointConditionToggle(conditionId)}
                          className="text-gray-500 hover:text-gray-700 font-bold"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            {/* 수영 급수 */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <span className="text-2xl mr-2">🏊</span>
                수영 급수
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { value: 'beginner_1', title: '완전 초보', desc: '물에 익숙해지는 단계' },
                  { value: 'beginner_2', title: '초급', desc: '자유형 기본, 배영 가능' },
                  { value: 'intermediate_1', title: '중급 하위', desc: '자유형, 배영, 평영 가능' },
                  { value: 'intermediate_2', title: '중급 상위', desc: '모든 영법으로 100m 연속 수영' },
                  { value: 'advanced_1', title: '고급 하위', desc: '모든 영법으로 장거리 수영 가능' },
                  { value: 'advanced_2', title: '고급 상위 (마스터즈)', desc: '경쟁 수준, 기록 향상 목표' }
                ].map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => handleInputChange('swim_profile.level', level.value)}
                    className={`w-full text-left p-4 border rounded-lg transition-all duration-200 ${
                      healthData.swim_profile?.level === level.value
                        ? 'bg-blue-600 text-white shadow-lg border-blue-700' 
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {healthData.swim_profile?.level === level.value && <CheckCircle className="h-4 w-4" />}
                      <div>
                        <div className="font-medium">{level.title}</div>
                        <div className="text-sm opacity-80">{level.desc}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 운동 목표 */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Target className="h-5 w-5 mr-2" />
                운동 목표
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {['체력 향상', '체중 감량', '기술 연마', '실력 향상', '재활', '스트레스 해소', '장거리 수영', '오픈워터', '생존수영', '인명구조원'].map((goal) => (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => handleInputChange('goals.primary', goal)}
                    className={`px-4 py-3 border-2 rounded-lg transition-all ${
                      healthData.goals?.primary === goal
                        ? 'border-purple-500 bg-purple-50 text-purple-700 font-semibold'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </div>

            {/* 선호/회피 영법 - 재사용 컴포넌트 */}
            <StrokesSelectionSection
              mainStrokes={healthData.swim_profile?.mainStrokes || []}
              excludedStrokes={healthData.swim_profile?.excludedStrokes || []}
              strokes={[
                { id: 'freestyle', label: '자유형', icon: '🏊' },
                { id: 'backstroke', label: '배영', icon: '🏊‍♂️' },
                { id: 'breaststroke', label: '평영', icon: '🏊‍♀️' },
                { id: 'butterfly', label: '접영', icon: '🦋' }
              ]}
              onUpdate={(data) => {
                if (data.mainStrokes !== undefined) handleInputChange('swim_profile.mainStrokes', data.mainStrokes);
                if (data.excludedStrokes !== undefined) handleInputChange('swim_profile.excludedStrokes', data.excludedStrokes);
              }}
            />

            {/* CSS - 재사용 컴포넌트 */}
            <CSSInputSection
              css={healthData.swim_profile?.css || { freestyle: 0, backstroke: 0, breaststroke: 0, butterfly: 0 }}
              strokes={[
                { id: 'freestyle', label: '자유형', icon: '🏊' },
                { id: 'backstroke', label: '배영', icon: '🏊‍♂️' },
                { id: 'breaststroke', label: '평영', icon: '🏊‍♀️' },
                { id: 'butterfly', label: '접영', icon: '🦋' }
              ]}
              onUpdate={(css) => handleInputChange('swim_profile.css', css)}
            />

            {/* 주간 훈련 일정 - 재사용 컴포넌트 */}
            <TrainingScheduleSection
              trainingDays={healthData.swim_profile?.trainingDays || []}
              sessionDuration={healthData.swim_profile?.sessionDuration || 60}
              poolLength={healthData.swim_profile?.poolLength || 25}
              onUpdate={(data) => {
                if (data.trainingDays !== undefined) {
                  handleInputChange('swim_profile.trainingDays', data.trainingDays);
                  handleInputChange('swim_profile.daysPerWeek', data.trainingDays.length);
                }
                if (data.sessionDuration !== undefined) handleInputChange('swim_profile.sessionDuration', data.sessionDuration);
                if (data.poolLength !== undefined) handleInputChange('swim_profile.poolLength', data.poolLength);
              }}
            />

            {/* 생리학적 지표 - 재사용 컴포넌트 */}
            <PhysiologicalMetricsSection
              vo2max={healthData.swim_profile?.vo2max}
              maxHeartRate={healthData.swim_profile?.maxHeartRate}
              restingHeartRate={healthData.swim_profile?.restingHeartRate}
              onUpdate={(metrics) => {
                if (metrics.vo2max !== undefined) handleInputChange('swim_profile.vo2max', metrics.vo2max);
                if (metrics.maxHeartRate !== undefined) handleInputChange('swim_profile.maxHeartRate', metrics.maxHeartRate);
                if (metrics.restingHeartRate !== undefined) handleInputChange('swim_profile.restingHeartRate', metrics.restingHeartRate);
              }}
            />

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                ✅ <strong>필수 항목:</strong> 수영 급수, 운동 목표<br/>
                💡 <strong>선택 항목:</strong> CSS, 선호/회피 영법, 주간 일정, 생리학적 지표<br/>
                <span className="text-xs">※ 선택 항목은 더 정확한 프로그램 생성을 위해 입력을 권장합니다</span>
              </p>
            </div>
          </div>
        );

      case 3:
        const { bmi, recommendations, baseIntensity } = analyzeHealth();
        
        return (
          <div className="space-y-8">
            {/* 건강 상태 요약 */}
            <div>
              <h3 className="text-2xl font-bold mb-6 flex items-center">
                <span className="text-3xl mr-3">📊</span>
                나의 건강 상태 요약
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* BMI */}
                <div className="bg-white border-2 border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">BMI</p>
                      <p className="text-3xl font-bold text-gray-900">{bmi.toFixed(1)}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      bmi >= 30 ? 'bg-red-100 text-red-700' :
                      bmi >= 25 ? 'bg-orange-100 text-orange-700' :
                      bmi >= 23 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {bmi >= 30 ? '고도비만' : bmi >= 25 ? '경도비만' : bmi >= 23 ? '과체중' : '정상'}
                    </div>
                  </div>
                </div>

                {/* 혈압 */}
                <div className="bg-white border-2 border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">혈압</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {healthData.vitals.rest_bp.sbp}/{healthData.vitals.rest_bp.dbp}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      healthData.vitals.rest_bp.sbp >= 140 || healthData.vitals.rest_bp.dbp >= 90 ? 'bg-red-100 text-red-700' :
                      healthData.vitals.rest_bp.sbp >= 130 || healthData.vitals.rest_bp.dbp >= 80 ? 'bg-orange-100 text-orange-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {healthData.vitals.rest_bp.sbp >= 140 || healthData.vitals.rest_bp.dbp >= 90 ? '고혈압 2기' :
                       healthData.vitals.rest_bp.sbp >= 130 || healthData.vitals.rest_bp.dbp >= 80 ? '고혈압 1기' : '정상'}
                    </div>
                  </div>
                </div>

                {/* 혈당 */}
                {healthData.vitals.bloodSugar && healthData.vitals.bloodSugar > 0 && (
                  <div className="bg-white border-2 border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">공복 혈당</p>
                        <p className="text-2xl font-bold text-gray-900">{healthData.vitals.bloodSugar} mg/dL</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        healthData.vitals.bloodSugar >= 126 ? 'bg-red-100 text-red-700' :
                        healthData.vitals.bloodSugar >= 100 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {healthData.vitals.bloodSugar >= 126 ? '당뇨 의심' :
                         healthData.vitals.bloodSugar >= 100 ? '전단계' : '정상'}
                      </div>
                    </div>
                  </div>
                )}

                {/* 질환 개수 */}
                <div className="bg-white border-2 border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">선택된 질환/상황</p>
                      <p className="text-3xl font-bold text-gray-900">{healthData.orthopedics.length}개</p>
                    </div>
                    <div className="text-4xl">
                      {healthData.orthopedics.length === 0 ? '✅' : '🏥'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 전체 운동 강도 요약 */}
            <div className="bg-gradient-to-r from-purple-100 to-blue-100 border-2 border-purple-300 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                  <span className="text-3xl mr-3">⚡</span>
                  권장 운동 강도
                </h3>
                <div className="text-right">
                  <p className="text-4xl font-black text-purple-600">{baseIntensity}%</p>
                  <p className="text-sm text-gray-600">정상 대비</p>
                </div>
              </div>
              <p className="text-sm text-gray-700">
                {baseIntensity === 100 ? (
                  <>✅ 건강 상태가 양호합니다. 일반적인 운동 강도로 진행하세요.</>
                ) : baseIntensity >= 80 ? (
                  <>💡 약간의 주의가 필요합니다. 정상보다 약간 낮은 강도로 시작하세요.</>
                ) : baseIntensity >= 70 ? (
                  <>⚠️ 주의가 필요합니다. 정상보다 낮은 강도로 운동하고 점진적으로 증가하세요.</>
                ) : (
                  <>🚨 많은 주의가 필요합니다. 의사 상담 후 매우 낮은 강도로 시작하세요.</>
                )}
              </p>
            </div>

            {/* 맞춤 운동 강도 권장 (상세) */}
            {recommendations.length > 0 && (
              <div>
                <h3 className="text-2xl font-bold mb-6 flex items-center">
                  <span className="text-3xl mr-3">🎯</span>
                  상세 건강 브리핑
                </h3>
                
                <div className="space-y-6">
                  {recommendations.map((rec: any, idx) => (
                    <div 
                      key={idx}
                      className={`border-2 rounded-xl p-6 ${
                        rec.type === 'danger' ? 'border-red-400 bg-red-50' :
                        rec.type === 'warning' ? 'border-orange-400 bg-orange-50' :
                        'border-blue-400 bg-blue-50'
                      }`}
                    >
                      <div className="flex items-start space-x-4">
                        <span className="text-4xl">{rec.icon}</span>
                        <div className="flex-1">
                          {/* 제목 */}
                          <h4 className={`font-bold text-xl mb-3 ${
                            rec.type === 'danger' ? 'text-red-800' :
                            rec.type === 'warning' ? 'text-orange-800' :
                            'text-blue-800'
                          }`}>
                            {rec.title}
                          </h4>

                          {/* 운동 강도 */}
                          <div className="bg-white/70 rounded-lg p-4 mb-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs font-semibold text-gray-600 mb-1">💪 권장 강도</p>
                                <p className="text-lg font-bold text-purple-600">{rec.intensity}</p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-gray-600 mb-1">⏱️ 권장 운동량</p>
                                <p className="text-lg font-bold text-blue-600">{rec.duration}</p>
                              </div>
                            </div>
                          </div>

                          {/* 피해야 할 것 */}
                          <div className="mb-4">
                            <p className="text-sm font-bold text-red-700 mb-2">❌ 피해야 할 동작/훈련</p>
                            <ul className="space-y-1">
                              {rec.avoid.map((item: string, i: number) => (
                                <li key={i} className="text-sm text-red-600 flex items-start">
                                  <span className="mr-2">•</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* 권장사항 */}
                          <div className="mb-4">
                            <p className="text-sm font-bold text-green-700 mb-2">✅ 권장 동작/훈련</p>
                            <ul className="space-y-1">
                              {rec.recommend.map((item: string, i: number) => (
                                <li key={i} className="text-sm text-green-600 flex items-start">
                                  <span className="mr-2">•</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* 상세 설명 */}
                          <div className={`bg-white/50 rounded-lg p-3 text-sm ${
                            rec.type === 'danger' ? 'text-red-800' :
                            rec.type === 'warning' ? 'text-orange-800' :
                            'text-blue-800'
                          }`}>
                            <p className="font-semibold mb-1">📚 전문가 조언</p>
                            <p>{rec.detail}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 체험 프로그램 생성 안내 */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-300 rounded-xl p-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  🏊‍♂️ 오늘의 맞춤 프로그램을 받아보세요!
                </h3>
                <p className="text-gray-700 mb-2">
                  입력하신 건강 정보를 바탕으로 <strong className="text-purple-600">오늘 하루 동안</strong> 실천할 수 있는
                </p>
                <p className="text-gray-700">
                  <strong className="text-purple-600">맞춤형 수영 프로그램</strong>을 자동으로 생성해드립니다.
                </p>
              </div>

              <div className="bg-white/70 border border-purple-200 rounded-lg p-5 mb-6">
                <p className="text-sm text-gray-800 mb-3 font-semibold">📝 프로그램에 포함될 내용:</p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span><strong>준비운동</strong> - 관절 보호를 위한 스트레칭</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span><strong>메인 세트</strong> - {healthData.goals?.primary || '체력 향상'} 목표에 맞춘 운동</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span><strong>안전한 강도</strong> - 질환 고려한 적절한 운동 강도</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span><strong>마무리 운동</strong> - 쿨다운 및 회복</span>
                  </li>
                </ul>
              </div>

              <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-semibold mb-1">💡 체험 프로그램 안내</p>
                    <p>• 하루짜리 프로그램으로 간단히 체험해보세요</p>
                    <p>• 정회원 가입 시 주간/월간 프로그램과 대회 준비 프로그램을 이용하실 수 있습니다</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleGenerateDailyProgram}
                  disabled={isSaving}
                  className="flex-1 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2"
                >
                  <span>🏊</span>
                  <span>{isSaving ? '프로그램 생성 중...' : '오늘의 프로그램 생성하기'}</span>
                </button>
                
                <button
                  onClick={handleSaveOnly}
                  disabled={isSaving}
                  className="px-6 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all"
                >
                  나중에 하기
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">건강정보 입력</h1>
        <p className="text-gray-600">나의 건강 상태를 입력하여 맞춤형 수영 프로그램을 받아보세요.</p>
      </div>

      {/* 진행 단계 - 업그레이드된 UI */}
      <div className="mb-8">
        <div className="flex items-center justify-center mb-6">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div 
                className="flex flex-col items-center cursor-pointer hover:scale-105 transition-all"
                onClick={() => setCurrentStep(step.id)}
              >
                {/* 아이콘 + 번호 */}
                <div className={`relative flex items-center justify-center w-16 h-16 rounded-2xl border-3 transition-all shadow-md ${
                  currentStep >= step.id 
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 border-blue-600 text-white shadow-blue-200' 
                    : 'bg-white border-gray-300 text-gray-500 hover:border-blue-300'
                }`}>
                  {currentStep > step.id && isStepValid(step.id) ? (
                    <CheckCircle className="h-8 w-8" />
                  ) : (
                    <div className="flex flex-col items-center">
                      <span className="text-2xl">{step.icon}</span>
                      <span className="text-xs font-semibold">{step.id}</span>
                    </div>
                  )}
                </div>
                
                {/* 제목 */}
                <div className={`mt-3 text-center max-w-[120px] transition-all ${
                  currentStep === step.id ? 'scale-110' : ''
                }`}>
                  <p className={`text-sm font-bold ${
                    currentStep >= step.id ? 'text-blue-600' : 'text-gray-600'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 leading-tight">
                    {step.description}
                  </p>
                </div>
              </div>
              
              {/* 연결선 */}
              {index < steps.length - 1 && (
                <div className={`w-24 h-1 rounded-full mx-4 mb-8 transition-all ${
                  currentStep > step.id ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 콘텐츠 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        {renderStepContent()}
      </div>

      {/* 버튼 - Step 3에서는 숨김 (자체 버튼 사용) */}
      {currentStep !== 3 && (
        <div className="flex justify-between">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            이전
          </button>

          <button
            onClick={() => setCurrentStep(currentStep + 1)}
            disabled={!isStepValid(currentStep)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <span>다음</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* AllConditionsDrawer */}
      {showConditionsDrawer && (
        <AllConditionsDrawer
          value={healthData.orthopedics}
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

