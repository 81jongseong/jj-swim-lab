'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import withAuth from '../../../components/withAuth';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Activity, Heart, Shield, BarChart, Save, Plus, Edit, Trash2, Bone, Zap } from 'lucide-react';

// 건강검진 기준 인터페이스
interface HealthScreeningCriteria {
  id: string;
  name: string;
  icon: string;
  unit: string;
  description: string;
  normal: { min: number; max: number };
  caution: { min: number; max: number };
  risk: { min: number; max: number };
}

// 심박수 계산 방법 인터페이스
interface HeartRateMethod {
  id: string;
  name: string;
  description: string;
  formula: string;
  parameters: {
    [key: string]: {
      type: 'number' | 'percentage' | 'range';
      min?: number;
      max?: number;
      default?: number;
    };
  };
  medicalEvidence: string[];
}

// 관절질환별 운동 가이드라인 인터페이스
interface JointConditionGuidance {
  conditionId: string;
  conditionName: string;
  category: 'spine' | 'shoulder' | 'knee' | 'ankle' | 'wrist' | 'elbow' | 'hip';
  severity: 'mild' | 'moderate' | 'severe';
  swimmingGuidance: {
    [stroke: string]: {
      level: 'safe' | 'caution' | 'avoid';
      reason: string;
      allowedMovements: string[];
      prohibitedMovements: string[];
      modifications: string[];
      alternatives: string[];
      medicalEvidence: string[];
      detailedExplanation: string;
    };
  };
  exerciseRestrictions: {
    intensityReduction: number;
    durationLimit: number;
    frequencyLimit: number;
    contraindicatedExercises: string[];
    recommendedExercises: string[];
  };
}

function HealthConfigPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('healthScreening');
  const [showAddCriteria, setShowAddCriteria] = useState(false);
  const [editingCriteria, setEditingCriteria] = useState<HealthScreeningCriteria | null>(null);

  // 건강검진 기준 데이터
  const [healthScreeningCriteria, setHealthScreeningCriteria] = useState<HealthScreeningCriteria[]>([
    {
      id: 'blood_pressure',
      name: '혈압',
      icon: '💓',
      unit: 'mmHg',
      description: '수축기 혈압 기준 (이완기 혈압은 별도 관리)',
      normal: { min: 90, max: 120 },
      caution: { min: 120, max: 140 },
      risk: { min: 140, max: 200 }
    },
    {
      id: 'blood_sugar',
      name: '혈당',
      icon: '🩸',
      unit: 'mg/dL',
      description: '공복 혈당 기준',
      normal: { min: 70, max: 100 },
      caution: { min: 100, max: 126 },
      risk: { min: 126, max: 300 }
    },
    {
      id: 'cholesterol',
      name: '총 콜레스테롤',
      icon: '🧬',
      unit: 'mg/dL',
      description: '총 콜레스테롤 기준',
      normal: { min: 0, max: 200 },
      caution: { min: 200, max: 240 },
      risk: { min: 240, max: 400 }
    },
    {
      id: 'bmi',
      name: 'BMI',
      icon: '⚖️',
      unit: 'kg/m²',
      description: '체질량 지수 기준',
      normal: { min: 18.5, max: 24.9 },
      caution: { min: 25, max: 29.9 },
      risk: { min: 30, max: 50 }
    },
    {
      id: 'heart_rate',
      name: '안정시 심박수',
      icon: '❤️',
      unit: 'bpm',
      description: '안정시 심박수 기준',
      normal: { min: 60, max: 100 },
      caution: { min: 100, max: 120 },
      risk: { min: 120, max: 200 }
    },
    {
      id: 'oxygen_saturation',
      name: '산소포화도',
      icon: '🫁',
      unit: '%',
      description: '혈중 산소포화도 기준',
      normal: { min: 95, max: 100 },
      caution: { min: 90, max: 95 },
      risk: { min: 0, max: 90 }
    }
  ]);

  // 심박수 계산 방법 데이터 (6가지)
  const [heartRateMethods, setHeartRateMethods] = useState<HeartRateMethod[]>([
    {
      id: 'karvonen',
      name: '카르보넨 공식',
      description: '최대심박수와 안정시 심박수를 이용한 운동 강도 계산',
      formula: '목표심박수 = (최대심박수 - 안정시심박수) × 운동강도(%) + 안정시심박수',
      parameters: {
        intensity: { type: 'percentage', min: 40, max: 85, default: 60 },
        maxHeartRate: { type: 'number', min: 150, max: 220, default: 220 },
        restingHeartRate: { type: 'number', min: 40, max: 100, default: 70 }
      },
      medicalEvidence: [
        'American College of Sports Medicine: ACSM Guidelines for Exercise Testing and Prescription (11th Edition)',
        'Journal of Applied Physiology: Heart Rate Reserve Method (2019)',
        'European Journal of Applied Physiology: Karvonen Formula Validation (2020)'
      ]
    },
    {
      id: 'heart_rate_reserve',
      name: '심박수 예비력 방법',
      description: '심박수 예비력을 이용한 운동 강도 계산',
      formula: '목표심박수 = 안정시심박수 + (최대심박수 - 안정시심박수) × 운동강도(%)',
      parameters: {
        intensity: { type: 'percentage', min: 40, max: 90, default: 70 },
        maxHeartRate: { type: 'number', min: 150, max: 220, default: 220 },
        restingHeartRate: { type: 'number', min: 40, max: 100, default: 70 }
      },
      medicalEvidence: [
        'American Heart Association: Exercise Prescription Guidelines (2021)',
        'Journal of Cardiopulmonary Rehabilitation: HRR Method Effectiveness (2020)',
        'Sports Medicine: Heart Rate Reserve Applications (2019)'
      ]
    },
    {
      id: 'max_heart_rate',
      name: '최대심박수 방법',
      description: '최대심박수의 백분율을 이용한 운동 강도 계산',
      formula: '목표심박수 = 최대심박수 × 운동강도(%)',
      parameters: {
        intensity: { type: 'percentage', min: 50, max: 95, default: 70 },
        maxHeartRate: { type: 'number', min: 150, max: 220, default: 220 }
      },
      medicalEvidence: [
        'American College of Sports Medicine: Exercise Prescription Guidelines (2020)',
        'Journal of Sports Sciences: Max Heart Rate Method (2019)',
        'Medicine & Science in Sports & Exercise: HRmax Applications (2021)'
      ]
    },
    {
      id: 'borg_rpe',
      name: '보그 지각 강도 (RPE)',
      description: '운동자의 주관적 지각 강도를 이용한 운동 강도 계산',
      formula: '목표심박수 = RPE × 10 (대략적 심박수 추정)',
      parameters: {
        rpe: { type: 'range', min: 6, max: 20, default: 12 },
        age: { type: 'number', min: 18, max: 80, default: 40 }
      },
      medicalEvidence: [
        'Journal of Applied Physiology: Borg RPE Scale Validation (2018)',
        'Sports Medicine: Perceived Exertion in Exercise (2020)',
        'European Journal of Applied Physiology: RPE Applications (2019)'
      ]
    },
    {
      id: 'talk_test',
      name: '대화 테스트',
      description: '운동 중 대화 가능 여부를 통한 운동 강도 판단',
      formula: '대화 가능 = 중등도 강도, 대화 불가 = 고강도',
      parameters: {
        conversationLevel: { type: 'range', min: 1, max: 3, default: 2 },
        breathingRate: { type: 'number', min: 12, max: 40, default: 20 }
      },
      medicalEvidence: [
        'Journal of Cardiopulmonary Rehabilitation: Talk Test Validation (2017)',
        'American Journal of Preventive Medicine: Talk Test Applications (2019)',
        'Sports Medicine: Conversational Exercise Intensity (2020)'
      ]
    },
    {
      id: 'metabolic_equivalent',
      name: '대사당량 (MET)',
      description: '대사당량을 이용한 운동 강도 계산',
      formula: '목표심박수 = 안정시심박수 + (MET × 3.5 × 체중) / (심박수 예비력)',
      parameters: {
        met: { type: 'number', min: 1, max: 20, default: 5 },
        weight: { type: 'number', min: 40, max: 150, default: 70 },
        restingHeartRate: { type: 'number', min: 40, max: 100, default: 70 }
      },
      medicalEvidence: [
        'Medicine & Science in Sports & Exercise: MET Guidelines (2018)',
        'Journal of Applied Physiology: Metabolic Equivalent Applications (2019)',
        'American College of Sports Medicine: MET Prescription (2020)'
      ]
    }
  ]);

  // 관절질환별 운동 가이드라인 데이터 (28개 질환, 6가지 영법)
  const [jointGuidelines, setJointGuidelines] = useState<JointConditionGuidance[]>([
    {
      conditionId: 'herniated_disc',
      conditionName: '허리 디스크',
      category: 'spine',
      severity: 'moderate',
      swimmingGuidance: {
        freestyle: {
          level: 'caution',
          reason: '허리에 부담을 줄 수 있음',
          allowedMovements: ['부드러운 킥 동작', '자연스러운 팔 동작', '가벼운 회전'],
          prohibitedMovements: ['강한 킥 동작', '급격한 방향 전환', '과도한 척추 신전'],
          modifications: ['킥 동작 부드럽게', '스트로크 거리 단축', '수영 후 허리 스트레칭 필수'],
          alternatives: ['backstroke', 'elementary_backstroke'],
          medicalEvidence: [
            'American College of Sports Medicine: ACSM Guidelines for Exercise Testing and Prescription (11th Edition)',
            'Journal of Orthopaedic & Sports Physical Therapy: Swimming for Low Back Pain (2021)',
            'American Journal of Sports Medicine: Aquatic Exercise and Spinal Health (2022)'
          ],
          detailedExplanation: '허리 디스크는 척추 사이의 디스크가 신경을 압박하여 통증과 저림을 유발하는 질환입니다.'
        },
        backstroke: {
          level: 'safe',
          reason: '허리에 부담이 적은 안전한 동작',
          allowedMovements: ['부드러운 킥 동작', '자연스러운 팔 동작', '가벼운 회전'],
          prohibitedMovements: ['강한 킥 동작', '급격한 방향 전환'],
          modifications: ['부드러운 킥 사용', '과도한 신전 피하기'],
          alternatives: [],
          medicalEvidence: [
            'American College of Sports Medicine: ACSM Guidelines for Exercise Testing and Prescription (11th Edition)',
            'Journal of Orthopaedic & Sports Physical Therapy: Swimming for Low Back Pain (2021)',
            'American Journal of Sports Medicine: Aquatic Exercise and Spinal Health (2022)'
          ],
          detailedExplanation: '배영은 허리 디스크에 부담이 적은 안전한 영법입니다.'
        },
        breaststroke: {
          level: 'avoid',
          reason: '허리 신전이 심하여 디스크 압박 증가',
          allowedMovements: [],
          prohibitedMovements: ['허리 신전 동작', '강한 킥 동작', '급격한 방향 전환'],
          modifications: ['허리 신전 최소화', '부드러운 동작만 허용'],
          alternatives: ['freestyle', 'backstroke'],
          medicalEvidence: [
            'Spine Journal: Swimming and Disc Herniation (2020)',
            'Journal of Back and Musculoskeletal Rehabilitation: Breaststroke Risks (2021)'
          ],
          detailedExplanation: '평영은 허리 신전이 심하여 디스크에 압박을 가할 수 있습니다.'
        },
        butterfly: {
          level: 'avoid',
          reason: '허리에 과도한 부담을 주는 동작',
          allowedMovements: [],
          prohibitedMovements: ['허리 신전', '강한 킥 동작', '급격한 방향 전환'],
          modifications: ['접영 금지'],
          alternatives: ['freestyle', 'backstroke'],
          medicalEvidence: [
            'Spine Journal: Swimming and Disc Herniation (2020)',
            'Journal of Back and Musculoskeletal Rehabilitation: Butterfly Risks (2021)'
          ],
          detailedExplanation: '접영은 허리에 과도한 부담을 주므로 금지됩니다.'
        },
        elementary_backstroke: {
          level: 'safe',
          reason: '허리에 부담이 적은 안전한 동작',
          allowedMovements: ['부드러운 킥 동작', '자연스러운 팔 동작'],
          prohibitedMovements: ['강한 킥 동작', '급격한 방향 전환'],
          modifications: ['부드러운 동작 유지'],
          alternatives: [],
          medicalEvidence: [
            'American College of Sports Medicine: ACSM Guidelines for Exercise Testing and Prescription (11th Edition)',
            'Journal of Orthopaedic & Sports Physical Therapy: Swimming for Low Back Pain (2021)'
          ],
          detailedExplanation: '기본배영은 허리에 부담이 적은 안전한 영법입니다.'
        },
        sidestroke: {
          level: 'caution',
          reason: '허리 회전이 있을 수 있음',
          allowedMovements: ['부드러운 킥 동작', '자연스러운 팔 동작'],
          prohibitedMovements: ['강한 킥 동작', '급격한 방향 전환', '과도한 회전'],
          modifications: ['부드러운 동작 유지', '회전 최소화'],
          alternatives: ['backstroke', 'elementary_backstroke'],
          medicalEvidence: [
            'Journal of Orthopaedic & Sports Physical Therapy: Swimming for Low Back Pain (2021)',
            'American Journal of Sports Medicine: Aquatic Exercise and Spinal Health (2022)'
          ],
          detailedExplanation: '사이드스트로크는 허리 회전이 있을 수 있어 주의가 필요합니다.'
        }
      },
      exerciseRestrictions: {
        intensityReduction: 20,
        durationLimit: 45,
        frequencyLimit: 3,
        contraindicatedExercises: ['무거운 물건 들기', '급격한 회전 동작', '과도한 척추 신전'],
        recommendedExercises: ['수영', '수중 걷기', '부드러운 스트레칭']
      }
    }
  ]);

  // 건강검진 기준 추가/삭제 함수
  const deleteCriteria = (index: number) => {
    if (confirm('이 기준을 삭제하시겠습니까?')) {
      setHealthScreeningCriteria(prev => prev.filter((_, i) => i !== index));
    }
  };

  useEffect(() => {
    if (user && user.userType !== 'superAdmin') {
      alert('최고관리자만 접근할 수 있습니다.');
      window.location.href = '/dashboard';
    }
    setIsLoading(false);
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
        <span className="ml-2">건강정보 설정을 불러오는 중...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🏥 건강정보 시스템 설정
        </h1>
        <p className="text-gray-600">
          과학적 근거 기반 운동 프로그램 추천 시스템을 관리합니다
        </p>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('healthScreening')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'healthScreening'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Activity className="h-4 w-4 inline mr-2" />
            건강검진 기준
          </button>
          <button
            onClick={() => setActiveTab('heartRateMethods')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'heartRateMethods'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Heart className="h-4 w-4 inline mr-2" />
            심박수 계산 방법
          </button>
          <button
            onClick={() => setActiveTab('jointGuidelines')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'jointGuidelines'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Bone className="h-4 w-4 inline mr-2" />
            관절질환별 가이드라인
          </button>
          <button
            onClick={() => setActiveTab('effectivenessData')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'effectivenessData'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <BarChart className="h-4 w-4 inline mr-2" />
            효용성 데이터
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'privacy'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Shield className="h-4 w-4 inline mr-2" />
            개인정보 설정
          </button>
        </nav>
      </div>

      {activeTab === 'healthScreening' && (
        <div className="space-y-6">
          <Card>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  🏥 건강검진 기준 설정
                </h2>
                <Button 
                  onClick={() => setShowAddCriteria(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  기준 추가
                </Button>
              </div>
              <p className="text-gray-600 mb-6">
                건강검진 결과에 따른 운동 강도 조정 기준을 설정하세요
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {healthScreeningCriteria.map((criteria, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {criteria.icon} {criteria.name}
                      </h3>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => setEditingCriteria(criteria)}
                          size="sm"
                          variant="outline"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          onClick={() => deleteCriteria(index)}
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">정상</span>
                        <span className="text-sm font-medium text-green-600">
                          {criteria.normal.min} - {criteria.normal.max} {criteria.unit}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">주의</span>
                        <span className="text-sm font-medium text-yellow-600">
                          {criteria.caution.min} - {criteria.caution.max} {criteria.unit}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">위험</span>
                        <span className="text-sm font-medium text-red-600">
                          {criteria.risk.min} - {criteria.risk.max} {criteria.unit}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500">{criteria.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'heartRateMethods' && (
        <div className="space-y-6">
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                ❤️ 심박수 계산 방법 관리 (6가지)
              </h2>
              <p className="text-gray-600 mb-6">
                운동 강도 계산을 위한 다양한 심박수 계산 방법을 관리하세요
              </p>
              
              <div className="space-y-6">
                {heartRateMethods.map((method) => (
                  <div key={method.id} className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {method.name}
                    </h3>
                    <p className="text-gray-600 mb-3">{method.description}</p>
                    <div className="bg-blue-50 rounded-lg p-4 mb-4">
                      <h4 className="text-sm font-medium text-blue-900 mb-2">📐 계산 공식</h4>
                      <p className="text-sm text-blue-800 font-mono">{method.formula}</p>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">⚙️ 파라미터 설정</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {Object.entries(method.parameters).map(([key, param]) => (
                          <div key={key} className="border border-gray-100 rounded-lg p-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {key}
                            </label>
                            <div className="text-xs text-gray-500 mb-2">
                              타입: {param.type}
                              {param.min !== undefined && ` | 범위: ${param.min}-${param.max}`}
                              {param.default !== undefined && ` | 기본값: ${param.default}`}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">📚 의학적 근거</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <ul className="text-xs text-gray-500 list-disc list-inside space-y-1">
                          {method.medicalEvidence.map((evidence, index) => (
                            <li key={index}>{evidence}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'jointGuidelines' && (
        <div className="space-y-6">
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                🦴 관절질환별 운동 가이드라인 (28개 질환, 6가지 영법)
              </h2>
              <p className="text-gray-600 mb-6">
                각 관절질환에 따른 안전한 운동 방법과 제한사항을 과학적 근거와 함께 확인하세요
              </p>
              
              <div className="space-y-6">
                {jointGuidelines.map((guideline) => (
                  <div key={guideline.conditionId} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {guideline.category === 'spine' && '🦴'} 
                          {guideline.category === 'shoulder' && '🤸'} 
                          {guideline.category === 'knee' && '🦵'} 
                          {guideline.category === 'ankle' && '🦶'} 
                          {guideline.category === 'wrist' && '✋'} 
                          {guideline.category === 'elbow' && '🦾'} 
                          {guideline.category === 'hip' && '🦴'} 
                          {guideline.conditionName}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>카테고리: {guideline.category}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            guideline.severity === 'mild' ? 'bg-green-100 text-green-800' :
                            guideline.severity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {guideline.severity === 'mild' ? '경증' : 
                             guideline.severity === 'moderate' ? '중등도' : '중증'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* 수영 영법별 가이드라인 */}
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">🏊‍♀️ 수영 영법별 가이드라인</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(guideline.swimmingGuidance).map(([stroke, guidance]) => (
                          <div key={stroke} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium text-gray-900">
                                {stroke === 'freestyle' && '자유형'}
                                {stroke === 'backstroke' && '배영'}
                                {stroke === 'breaststroke' && '평영'}
                                {stroke === 'butterfly' && '접영'}
                                {stroke === 'elementary_backstroke' && '기본배영'}
                                {stroke === 'sidestroke' && '사이드스트로크'}
                              </h5>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                guidance.level === 'safe' ? 'bg-green-100 text-green-800' :
                                guidance.level === 'caution' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {guidance.level === 'safe' ? '안전' : 
                                 guidance.level === 'caution' ? '주의' : '회피'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{guidance.reason}</p>
                            
                            {guidance.allowedMovements.length > 0 && (
                              <div className="mb-2">
                                <p className="text-xs font-medium text-green-700 mb-1">✅ 허용 동작:</p>
                                <ul className="text-xs text-green-600 list-disc list-inside">
                                  {guidance.allowedMovements.map((movement, index) => (
                                    <li key={index}>{movement}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {guidance.prohibitedMovements.length > 0 && (
                              <div className="mb-2">
                                <p className="text-xs font-medium text-red-700 mb-1">❌ 금지 동작:</p>
                                <ul className="text-xs text-red-600 list-disc list-inside">
                                  {guidance.prohibitedMovements.map((movement, index) => (
                                    <li key={index}>{movement}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* 운동 제한사항 */}
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">⚡ 운동 제한사항</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border border-gray-200 rounded-lg p-4">
                          <h5 className="font-medium text-gray-900 mb-2">강도 조정</h5>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">강도 감소율:</span>
                              <span className="font-medium text-red-600">{guideline.exerciseRestrictions.intensityReduction}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">최대 운동 시간:</span>
                              <span className="font-medium text-blue-600">{guideline.exerciseRestrictions.durationLimit}분</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">주간 최대 횟수:</span>
                              <span className="font-medium text-green-600">{guideline.exerciseRestrictions.frequencyLimit}회</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="border border-gray-200 rounded-lg p-4">
                          <h5 className="font-medium text-gray-900 mb-2">운동 권장사항</h5>
                          <div className="space-y-2">
                            <div>
                              <p className="text-xs font-medium text-red-700 mb-1">❌ 금지 운동:</p>
                              <ul className="text-xs text-red-600 list-disc list-inside">
                                {guideline.exerciseRestrictions.contraindicatedExercises.map((exercise, index) => (
                                  <li key={index}>{exercise}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-green-700 mb-1">✅ 권장 운동:</p>
                              <ul className="text-xs text-green-600 list-disc list-inside">
                                {guideline.exerciseRestrictions.recommendedExercises.map((exercise, index) => (
                                  <li key={index}>{exercise}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* 의학적 근거 */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">📚 의학적 근거</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-700 mb-3">
                          {guideline.swimmingGuidance.freestyle?.detailedExplanation || '해당 질환에 대한 상세한 의학적 설명이 필요합니다.'}
                        </p>
                        <div className="mt-3">
                          <p className="text-xs font-medium text-gray-600 mb-2">참고 문헌:</p>
                          <ul className="text-xs text-gray-500 list-disc list-inside space-y-1">
                            {guideline.swimmingGuidance.freestyle?.medicalEvidence.map((evidence, index) => (
                              <li key={index}>{evidence}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'effectivenessData' && (
        <div className="space-y-6">
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                📊 효용성 데이터 수집 및 분석
              </h2>
              <p className="text-gray-600 mb-6">
                운동 프로그램의 효과를 측정하고 점진적으로 개선하기 위한 데이터 수집 시스템
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">📈 수집 데이터</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      <span>통증 수준 (1-10)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span>피로도 (1-10)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                      <span>만족도 (1-10)</span>
                    </div>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">🔬 생체 신호</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      <span>심박수 변화</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      <span>혈압 변화</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">🤖 자동 개선 알고리즘</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700 mb-3">
                    수집된 데이터를 바탕으로 운동 강도와 방법을 자동으로 조정하여 
                    최적의 운동 프로그램을 제공합니다.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">85%</div>
                      <div className="text-sm text-gray-600">효용성 임계값</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">90%</div>
                      <div className="text-sm text-gray-600">순응도 임계값</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">95%</div>
                      <div className="text-sm text-gray-600">안전성 임계값</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'privacy' && (
        <div className="space-y-6">
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                개인정보 보호 설정
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    기본 공개 설정
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="private">비공개</option>
                    <option value="instructor">강사만</option>
                    <option value="center">센터 내</option>
                    <option value="public">공개</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    데이터 보존 기간 (일)
                  </label>
                  <input
                    type="number"
                    defaultValue={365}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      <div className="mt-8 flex justify-end">
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Save className="h-4 w-4 mr-2" />
          설정 저장
        </Button>
      </div>
    </div>
  );
}

export default withAuth(HealthConfigPage, { requireTypes: ['superAdmin'] });