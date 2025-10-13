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
    daysPerWeek?: number;
    sessionDuration?: number;
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
      daysPerWeek: 0,
      sessionDuration: 0,
      vo2max: 0,
      maxHeartRate: 0,
      restingHeartRate: 0
    },
    goals: { primary: '', secondary: '', target: '' }
  });

  const [showConditionsDrawer, setShowConditionsDrawer] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 단계 정의 (2단계만)
  const steps = [
    { id: 1, title: '기본+건강', description: '신체정보, 건강검진, 질환/상황' },
    { id: 2, title: '수영+목표', description: '급수, CSS, 영법, 목표' }
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
      default:
        return false;
    }
  };

  // 저장
  const handleSubmit = async () => {
    if (!isStepValid(2)) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    setIsSaving(true);
    try {
      // TODO: API 호출
      console.log('건강정보 저장:', healthData);
      alert('건강정보가 저장되었습니다!');
      router.push('/dashboard');
    } catch (error) {
      console.error('저장 오류:', error);
      alert('저장 중 오류가 발생했습니다.');
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
                    const condition = allJointConditions.find(c => c.id === conditionId);
                    const isAutoDiagnosed = ['obesity', 'obesity-severe', 'overweight', 'hypertension', 'hypertension-stage2', 'hypertension-elevated', 'diabetes', 'dyslipidemia'].includes(conditionId);
                    return condition ? (
                      <div
                        key={conditionId}
                        className={`px-3 py-1 rounded-lg text-sm flex items-center space-x-2 ${
                          isAutoDiagnosed ? 'bg-yellow-100 border border-yellow-300 text-yellow-800' : 'bg-blue-100 border border-blue-300 text-blue-800'
                        }`}
                      >
                        {isAutoDiagnosed && <span>✨</span>}
                        <span>{condition.name}</span>
                        <button
                          type="button"
                          onClick={() => handleJointConditionToggle(conditionId)}
                          className="text-gray-500 hover:text-gray-700 font-bold"
                        >
                          ×
                        </button>
                      </div>
                    ) : null;
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
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Target className="h-5 w-5 mr-2" />
                운동 목표
              </h3>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={healthData.goals?.primary || ''}
                onChange={(e) => handleInputChange('goals.primary', e.target.value)}
              >
                <option value="">목표를 선택하세요</option>
                <option value="weight_loss">체중 감량</option>
                <option value="fitness">체력 증진</option>
                <option value="rehabilitation">재활</option>
                <option value="performance">경기력 향상</option>
                <option value="maintenance">체력 유지</option>
              </select>
            </div>

            {/* 선호/회피 영법 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-md font-semibold mb-3">선호 영법 (복수 선택)</h4>
                <div className="space-y-2">
                  {['freestyle', 'backstroke', 'breaststroke', 'butterfly'].map((stroke) => {
                    const labels = { freestyle: '자유형', backstroke: '배영', breaststroke: '평영', butterfly: '접영' };
                    const isExcluded = healthData.swim_profile?.excludedStrokes?.includes(stroke);
                    const isSelected = healthData.swim_profile?.mainStrokes?.includes(stroke);
                    return (
                      <button
                        key={stroke}
                        type="button"
                        onClick={() => {
                          if (isExcluded) return;
                          const current = healthData.swim_profile?.mainStrokes || [];
                          const updated = isSelected ? current.filter(s => s !== stroke) : [...current, stroke];
                          handleInputChange('swim_profile.mainStrokes', updated);
                        }}
                        disabled={isExcluded}
                        className={`w-full text-left px-4 py-3 border rounded-lg transition-all ${
                          isExcluded
                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                            : isSelected ? 'bg-blue-600 text-white border-blue-700' : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{labels[stroke as keyof typeof labels]}</span>
                          {isSelected && <CheckCircle className="h-4 w-4" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <h4 className="text-md font-semibold mb-3">회피 영법 (복수 선택)</h4>
                <div className="space-y-2">
                  {['freestyle', 'backstroke', 'breaststroke', 'butterfly'].map((stroke) => {
                    const labels = { freestyle: '자유형', backstroke: '배영', breaststroke: '평영', butterfly: '접영' };
                    const isMain = healthData.swim_profile?.mainStrokes?.includes(stroke);
                    const isExcluded = healthData.swim_profile?.excludedStrokes?.includes(stroke);
                    return (
                      <button
                        key={stroke}
                        type="button"
                        onClick={() => {
                          if (isMain) return;
                          const current = healthData.swim_profile?.excludedStrokes || [];
                          const updated = isExcluded ? current.filter(s => s !== stroke) : [...current, stroke];
                          handleInputChange('swim_profile.excludedStrokes', updated);
                        }}
                        disabled={isMain}
                        className={`w-full text-left px-4 py-3 border rounded-lg transition-all ${
                          isMain
                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                            : isExcluded ? 'bg-red-600 text-white border-red-700' : 'bg-white text-gray-700 border-gray-300 hover:bg-red-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{labels[stroke as keyof typeof labels]}</span>
                          {isExcluded && <CheckCircle className="h-4 w-4" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* CSS (선택사항) */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <span className="text-2xl mr-2">💪</span>
                CSS (Critical Swim Speed)
                <span className="ml-2 text-sm font-normal text-gray-500">(선택사항)</span>
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                💡 CSS는 100m 기준 초 단위입니다. 예: 120초 = 2분/100m
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { stroke: 'freestyle', label: '자유형', placeholder: '120' },
                  { stroke: 'backstroke', label: '배영', placeholder: '130' },
                  { stroke: 'breaststroke', label: '평영', placeholder: '140' },
                  { stroke: 'butterfly', label: '접영', placeholder: '150' }
                ].map(({ stroke, label, placeholder }) => (
                  <div key={stroke}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={healthData.swim_profile?.css?.[stroke as keyof typeof healthData.swim_profile.css] || ''}
                      onChange={(e) => {
                        const current = healthData.swim_profile?.css || { freestyle: 0, backstroke: 0, breaststroke: 0, butterfly: 0 };
                        handleInputChange('swim_profile.css', { ...current, [stroke]: parseInt(e.target.value) || 0 });
                      }}
                      placeholder={placeholder}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* 주간 훈련 일정 (선택사항) */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <span className="text-2xl mr-2">📅</span>
                주간 훈련 일정
                <span className="ml-2 text-sm font-normal text-gray-500">(선택사항)</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">주당 운동 일수</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={healthData.swim_profile?.daysPerWeek || ''}
                    onChange={(e) => handleInputChange('swim_profile.daysPerWeek', parseInt(e.target.value))}
                  >
                    <option value="">선택하세요</option>
                    {[2, 3, 4, 5, 6].map(days => (
                      <option key={days} value={days}>주 {days}일</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">회당 운동 시간 (분)</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={healthData.swim_profile?.sessionDuration || ''}
                    onChange={(e) => handleInputChange('swim_profile.sessionDuration', parseInt(e.target.value))}
                  >
                    <option value="">선택하세요</option>
                    {[30, 45, 60, 75, 90].map(mins => (
                      <option key={mins} value={mins}>{mins}분</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 생리학적 지표 (선택사항) */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <span className="text-2xl mr-2">🫀</span>
                생리학적 지표
                <span className="ml-2 text-sm font-normal text-gray-500">(선택사항)</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">VO2max (ml/kg/min)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={healthData.swim_profile?.vo2max || ''}
                    onChange={(e) => handleInputChange('swim_profile.vo2max', parseInt(e.target.value) || 0)}
                    placeholder="45"
                  />
                  <p className="text-xs text-gray-500 mt-1">최대 산소 섭취량</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">최고 심박수 (bpm)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={healthData.swim_profile?.maxHeartRate || ''}
                    onChange={(e) => handleInputChange('swim_profile.maxHeartRate', parseInt(e.target.value) || 0)}
                    placeholder="190"
                  />
                  <p className="text-xs text-gray-500 mt-1">최대 운동 시 심박수</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">안정시 심박수 (bpm)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={healthData.swim_profile?.restingHeartRate || ''}
                    onChange={(e) => handleInputChange('swim_profile.restingHeartRate', parseInt(e.target.value) || 0)}
                    placeholder="60"
                  />
                  <p className="text-xs text-gray-500 mt-1">휴식 시 심박수</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                ✅ <strong>필수 항목:</strong> 수영 급수, 운동 목표<br/>
                💡 <strong>선택 항목:</strong> CSS, 선호/회피 영법, 주간 일정, 생리학적 지표<br/>
                <span className="text-xs">※ 선택 항목은 더 정확한 프로그램 생성을 위해 입력을 권장합니다</span>
              </p>
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

      {/* 진행 단계 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <div 
              key={step.id} 
              className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setCurrentStep(step.id)}
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
                    <span>{step.id}</span>
                  )
                ) : (
                  <span>{step.id}</span>
                )}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-24 h-0.5 ${currentStep > step.id ? 'bg-blue-600' : 'bg-gray-300'}`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between">
          {steps.map((step) => (
            <div key={step.id} className="text-center">
              <p className="text-sm font-medium text-gray-900">{step.title}</p>
              <p className="text-xs text-gray-500">{step.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 콘텐츠 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        {renderStepContent()}
      </div>

      {/* 버튼 */}
      <div className="flex justify-between">
        <button
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          이전
        </button>

        {currentStep < steps.length ? (
          <button
            onClick={() => setCurrentStep(currentStep + 1)}
            disabled={!isStepValid(currentStep)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <span>다음</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isSaving || !isStepValid(currentStep)}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>{isSaving ? '저장 중...' : '저장'}</span>
          </button>
        )}
      </div>

      {/* AllConditionsDrawer */}
      {showConditionsDrawer && (
        <AllConditionsDrawer
          selectedIds={healthData.orthopedics}
          onSelect={(selectedIds) => {
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



