/**
 * 🏃‍♂️ JJ Swim Lab - 관리자용 운동 처방 가이드 시스템
 * 
 * 📋 **페이지 개요**
 * - 개인별 맞춤 운동 처방 생성 및 관리
 * - 건강 상태별 등급 시스템 가이드
 * - 운동 강도 계산 알고리즘 설명
 * - 센터별 운동 처방 현황 모니터링
 * 
 * 🔗 **연동 데이터**
 * - ExercisePrescription: 운동 처방 데이터
 * - User: 사용자 정보
 * - HealthData: 건강 정보
 * - Center: 센터 정보
 * 
 * 📅 **개발 히스토리**
 * - 2025-01-22: 관리자용 운동 처방 가이드 시스템 구현
 */

'use client';

import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { RefreshButton } from '@/components/ui/RefreshButton';
import { 
  Brain, 
  Heart, 
  Activity, 
  Users, 
  TrendingUp, 
  Target, 
  Clock, 
  MapPin,
  AlertTriangle,
  CheckCircle,
  Info,
  Settings,
  BarChart3,
  UserCheck,
  Calendar,
  Award
} from 'lucide-react';

interface HealthGrade {
  obesityGrade: 'normal' | 'overweight' | 'obesity1' | 'obesity2' | 'obesity3';
  cardiovascularGrade: 'low' | 'moderate' | 'high' | 'very_high';
  fitnessGrade: 'beginner' | 'intermediate' | 'advanced';
  ageGrade: 'young' | 'middle' | 'senior';
  overallGrade: 'A' | 'B' | 'C' | 'D' | 'E';
}

interface ExercisePrescription {
  sessionDuration: number;
  totalDistance: number;
  targetHeartRate: {
    min: number;
    max: number;
    optimal: number;
  };
  recommendedExercises: {
    warmUp: { duration: number; intensity: string; };
    mainExercise: { duration: number; intensity: string; sets?: number; };
    coolDown: { duration: number; intensity: string; };
  };
  weeklyFrequency: number;
  progressionPlan: {
    currentWeek: number;
    totalWeeks: number;
    weeklyIncrease: number;
  };
  safetyGuidelines: string[];
  contraindications: string[];
}

interface PrescriptionStats {
  totalPrescriptions: number;
  activePrescriptions: number;
  averageCompletionRate: number;
  topPerformingCenters: Array<{
    centerId: string;
    centerName: string;
    prescriptionCount: number;
    averageCompletionRate: number;
  }>;
  gradeDistribution: {
    [key: string]: number;
  };
}

export default function ExercisePrescriptionGuide() {
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<PrescriptionStats | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<HealthGrade['overallGrade']>('C');
  const [samplePrescription, setSamplePrescription] = useState<ExercisePrescription | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'guide' | 'algorithm' | 'monitoring'>('overview');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<'karvonen' | 'max_hr_percentage' | 'vo2_max_percentage' | 'rpe_based' | 'hybrid' | 'ai_adaptive'>('karvonen');

  // 건강 등급별 색상 매핑
  const gradeColors = {
    A: 'text-green-600 bg-green-100',
    B: 'text-blue-600 bg-blue-100', 
    C: 'text-yellow-600 bg-yellow-100',
    D: 'text-orange-600 bg-orange-100',
    E: 'text-red-600 bg-red-100'
  };

  const gradeLabels = {
    A: '우수 (건강한 상태)',
    B: '양호 (약간의 주의 필요)',
    C: '보통 (적당한 운동 강도)',
    D: '주의 (낮은 강도 권장)',
    E: '위험 (의료진 상담 필수)'
  };

  // 비만도 등급 설명
  const obesityGrades = {
    normal: { label: '정상체중', bmi: '< 23', color: 'text-green-600' },
    overweight: { label: '과체중', bmi: '23-24.9', color: 'text-yellow-600' },
    obesity1: { label: '1도 비만', bmi: '25-29.9', color: 'text-orange-600' },
    obesity2: { label: '2도 비만', bmi: '30-34.9', color: 'text-red-600' },
    obesity3: { label: '3도 비만', bmi: '≥ 35', color: 'text-red-700' }
  };

  // 심혈관 위험도 설명
  const cardiovascularGrades = {
    low: { label: '낮음', description: '표준 강도 운동 가능', color: 'text-green-600' },
    moderate: { label: '보통', description: '중강도 운동 권장', color: 'text-yellow-600' },
    high: { label: '높음', description: '저강도 운동 권장', color: 'text-orange-600' },
    very_high: { label: '매우 높음', description: '의료진 상담 필수', color: 'text-red-600' }
  };

  // 샘플 처방 생성
  const generateSamplePrescription = (grade: HealthGrade['overallGrade']) => {
    const basePrescriptions = {
      A: {
        sessionDuration: 45,
        totalDistance: 1800,
        targetHeartRate: { min: 140, max: 160, optimal: 150 },
        recommendedExercises: {
          warmUp: { duration: 7, intensity: '낮음 (50-60% 최대심박수)' },
          mainExercise: { duration: 31, intensity: '7/10 (힘듦)', sets: 2 },
          coolDown: { duration: 7, intensity: '낮음 (40-50% 최대심박수)' }
        },
        weeklyFrequency: 4,
        progressionPlan: { currentWeek: 1, totalWeeks: 12, weeklyIncrease: 5 },
        safetyGuidelines: ['운동 전 충분한 준비운동 필수', '운동 중 충분한 수분 섭취', '이상 증상 발생 시 즉시 운동 중단'],
        contraindications: []
      },
      B: {
        sessionDuration: 40,
        totalDistance: 1600,
        targetHeartRate: { min: 130, max: 150, optimal: 140 },
        recommendedExercises: {
          warmUp: { duration: 6, intensity: '낮음 (50-60% 최대심박수)' },
          mainExercise: { duration: 28, intensity: '6/10 (약간 힘듦)', sets: 2 },
          coolDown: { duration: 6, intensity: '낮음 (40-50% 최대심박수)' }
        },
        weeklyFrequency: 3,
        progressionPlan: { currentWeek: 1, totalWeeks: 12, weeklyIncrease: 4 },
        safetyGuidelines: ['운동 전 충분한 준비운동 필수', '운동 중 충분한 수분 섭취', '이상 증상 발생 시 즉시 운동 중단'],
        contraindications: []
      },
      C: {
        sessionDuration: 35,
        totalDistance: 1400,
        targetHeartRate: { min: 120, max: 140, optimal: 130 },
        recommendedExercises: {
          warmUp: { duration: 5, intensity: '낮음 (50-60% 최대심박수)' },
          mainExercise: { duration: 25, intensity: '6/10 (약간 힘듦)', sets: 1 },
          coolDown: { duration: 5, intensity: '낮음 (40-50% 최대심박수)' }
        },
        weeklyFrequency: 3,
        progressionPlan: { currentWeek: 1, totalWeeks: 12, weeklyIncrease: 3 },
        safetyGuidelines: ['운동 전 충분한 준비운동 필수', '운동 중 충분한 수분 섭취', '이상 증상 발생 시 즉시 운동 중단'],
        contraindications: []
      },
      D: {
        sessionDuration: 25,
        totalDistance: 1000,
        targetHeartRate: { min: 100, max: 120, optimal: 110 },
        recommendedExercises: {
          warmUp: { duration: 4, intensity: '낮음 (50-60% 최대심박수)' },
          mainExercise: { duration: 17, intensity: '5/10 (적당함)', sets: 1 },
          coolDown: { duration: 4, intensity: '낮음 (40-50% 최대심박수)' }
        },
        weeklyFrequency: 2,
        progressionPlan: { currentWeek: 1, totalWeeks: 12, weeklyIncrease: 2 },
        safetyGuidelines: ['운동 전 충분한 준비운동 필수', '운동 중 충분한 수분 섭취', '이상 증상 발생 시 즉시 운동 중단', '점진적 강도 증가'],
        contraindications: ['급격한 강도 증가 금지']
      },
      E: {
        sessionDuration: 20,
        totalDistance: 800,
        targetHeartRate: { min: 90, max: 110, optimal: 100 },
        recommendedExercises: {
          warmUp: { duration: 3, intensity: '낮음 (50-60% 최대심박수)' },
          mainExercise: { duration: 14, intensity: '4/10 (쉬움)', sets: 1 },
          coolDown: { duration: 3, intensity: '낮음 (40-50% 최대심박수)' }
        },
        weeklyFrequency: 2,
        progressionPlan: { currentWeek: 1, totalWeeks: 12, weeklyIncrease: 2 },
        safetyGuidelines: ['운동 전 충분한 준비운동 필수', '운동 중 충분한 수분 섭취', '이상 증상 발생 시 즉시 운동 중단', '의료진 상담 후 운동 시작 권장'],
        contraindications: ['고강도 운동 금지', '의료진 감독 하에서만 운동']
      }
    };

    return basePrescriptions[grade];
  };

  // 통계 로드
  const loadStats = async () => {
    try {
      setIsLoading(true);
      // 실제 API 호출 대신 샘플 데이터 사용
      const sampleStats: PrescriptionStats = {
        totalPrescriptions: 1247,
        activePrescriptions: 892,
        averageCompletionRate: 78.5,
        topPerformingCenters: [
          { centerId: '1', centerName: '강남 수영센터', prescriptionCount: 156, averageCompletionRate: 85.2 },
          { centerId: '2', centerName: '서초 수영센터', prescriptionCount: 134, averageCompletionRate: 82.7 },
          { centerId: '3', centerName: '송파 수영센터', prescriptionCount: 98, averageCompletionRate: 79.1 }
        ],
        gradeDistribution: {
          A: 156,
          B: 234,
          C: 312,
          D: 189,
          E: 67
        }
      };
      
      setStats(sampleStats);
    } catch (error) {
      console.error('통계 로드 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    setSamplePrescription(generateSamplePrescription(selectedGrade));
  }, [selectedGrade]);

  const tabs = [
    { id: 'overview', label: '📊 개요', icon: BarChart3 },
    { id: 'guide', label: '📚 가이드', icon: Info },
    { id: 'algorithm', label: '🧠 알고리즘', icon: Brain },
    { id: 'monitoring', label: '📈 모니터링', icon: TrendingUp }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Activity className="h-8 w-8 text-blue-600 mr-3" />
                운동 처방 가이드 시스템
              </h1>
              <p className="text-gray-600 mt-2">
                개인별 맞춤 운동 처방 생성 및 관리 시스템
              </p>
            </div>
            <RefreshButton onClick={loadStats} isLoading={isLoading} />
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
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* 주요 통계 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">총 처방 수</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.totalPrescriptions || 0}</p>
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
                    <p className="text-2xl font-bold text-gray-900">{stats?.activePrescriptions || 0}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Target className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">평균 완주율</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.averageCompletionRate || 0}%</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Award className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">우수 센터</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.topPerformingCenters.length || 0}</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* 등급별 분포 */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">건강 등급별 분포</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(stats?.gradeDistribution || {}).map(([grade, count]) => (
                  <div key={grade} className="text-center">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full text-2xl font-bold ${gradeColors[grade as keyof typeof gradeColors]}`}>
                      {grade}
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{gradeLabels[grade as keyof typeof gradeLabels]}</p>
                    <p className="text-lg font-semibold text-gray-900">{count}명</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* 우수 센터 */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">우수 센터 현황</h3>
              <div className="space-y-4">
                {stats?.topPerformingCenters.map((center, index) => (
                  <div key={center.centerId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-semibold">
                        {index + 1}
                      </div>
                      <div className="ml-4">
                        <p className="font-medium text-gray-900">{center.centerName}</p>
                        <p className="text-sm text-gray-600">{center.prescriptionCount}개 처방</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">{center.averageCompletionRate}%</p>
                      <p className="text-sm text-gray-600">완주율</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* 가이드 탭 */}
        {activeTab === 'guide' && (
          <div className="space-y-6">
            {/* 건강 등급 설명 */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">건강 상태 등급 시스템 (확장된 버전)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">비만도 등급</h4>
                  <div className="space-y-2">
                    {Object.entries(obesityGrades).map(([grade, info]) => (
                      <div key={grade} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="font-medium">{info.label}</span>
                        <span className={`text-sm ${info.color}`}>BMI {info.bmi}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">심혈관 위험도</h4>
                  <div className="space-y-2">
                    {Object.entries(cardiovascularGrades).map(([grade, info]) => (
                      <div key={grade} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="font-medium">{info.label}</span>
                        <span className={`text-sm ${info.color}`}>{info.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">대사 질환 등급</h4>
                  <div className="space-y-2">
                    {[
                      { grade: 'normal', label: '정상', description: '대사 지표 정상', color: 'text-green-600' },
                      { grade: 'prediabetes', label: '당뇨 전단계', description: '공복혈당 100-125', color: 'text-yellow-600' },
                      { grade: 'diabetes', label: '당뇨병', description: '공복혈당 ≥126', color: 'text-orange-600' },
                      { grade: 'metabolic_syndrome', label: '대사증후군', description: '복합 대사 이상', color: 'text-red-600' }
                    ].map(({ grade, label, description, color }) => (
                      <div key={grade} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="font-medium">{label}</span>
                        <span className={`text-sm ${color}`}>{description}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">근골격계 위험도</h4>
                  <div className="space-y-2">
                    {[
                      { grade: 'normal', label: '정상', description: '관절 건강', color: 'text-green-600' },
                      { grade: 'mild_risk', label: '경미한 위험', description: '관절 주의', color: 'text-yellow-600' },
                      { grade: 'moderate_risk', label: '중등도 위험', description: '관절염 위험', color: 'text-orange-600' },
                      { grade: 'high_risk', label: '높은 위험', description: '심각한 관절 문제', color: 'text-red-600' }
                    ].map(({ grade, label, description, color }) => (
                      <div key={grade} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="font-medium">{label}</span>
                        <span className={`text-sm ${color}`}>{description}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">운동 경험</h4>
                  <div className="space-y-2">
                    {[
                      { grade: 'none', label: '무경험', description: '운동 초보', color: 'text-red-600' },
                      { grade: 'beginner', label: '초급자', description: '6개월 미만', color: 'text-orange-600' },
                      { grade: 'intermediate', label: '중급자', description: '6개월-2년', color: 'text-yellow-600' },
                      { grade: 'advanced', label: '고급자', description: '2년 이상', color: 'text-green-600' },
                      { grade: 'elite', label: '엘리트', description: '전문 수준', color: 'text-blue-600' }
                    ].map(({ grade, label, description, color }) => (
                      <div key={grade} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="font-medium">{label}</span>
                        <span className={`text-sm ${color}`}>{description}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">생활습관 등급</h4>
                  <div className="space-y-2">
                    {[
                      { grade: 'excellent', label: '우수', description: '건강한 생활습관', color: 'text-green-600' },
                      { grade: 'good', label: '양호', description: '대체로 건강함', color: 'text-blue-600' },
                      { grade: 'fair', label: '보통', description: '개선 필요', color: 'text-yellow-600' },
                      { grade: 'poor', label: '나쁨', description: '전면 개선 필요', color: 'text-red-600' }
                    ].map(({ grade, label, description, color }) => (
                      <div key={grade} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="font-medium">{label}</span>
                        <span className={`text-sm ${color}`}>{description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* 샘플 처방 생성기 */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">등급별 샘플 처방</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">건강 등급 선택</label>
                <div className="flex space-x-2">
                  {Object.entries(gradeLabels).map(([grade, label]) => (
                    <button
                      key={grade}
                      onClick={() => setSelectedGrade(grade as HealthGrade['overallGrade'])}
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        selectedGrade === grade
                          ? gradeColors[grade as keyof typeof gradeColors]
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {grade}등급
                    </button>
                  ))}
                </div>
              </div>

              {samplePrescription && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center mb-4">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full text-xl font-bold mr-4 ${gradeColors[selectedGrade]}`}>
                      {selectedGrade}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{gradeLabels[selectedGrade]}</h4>
                      <p className="text-sm text-gray-600">샘플 운동 처방</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Clock className="h-5 w-5 text-blue-600 mr-2" />
                        <span className="font-medium">운동 시간</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{samplePrescription.sessionDuration}분</p>
                    </div>

                    <div className="bg-white p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <MapPin className="h-5 w-5 text-green-600 mr-2" />
                        <span className="font-medium">목표 거리</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{samplePrescription.totalDistance}m</p>
                    </div>

                    <div className="bg-white p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Heart className="h-5 w-5 text-red-600 mr-2" />
                        <span className="font-medium">목표 심박수</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{samplePrescription.targetHeartRate.optimal}bpm</p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-3 rounded">
                      <h5 className="font-medium text-gray-900 mb-1">준비운동</h5>
                      <p className="text-sm text-gray-600">{samplePrescription.recommendedExercises.warmUp.duration}분</p>
                      <p className="text-xs text-gray-500">{samplePrescription.recommendedExercises.warmUp.intensity}</p>
                    </div>
                    <div className="bg-white p-3 rounded">
                      <h5 className="font-medium text-gray-900 mb-1">본운동</h5>
                      <p className="text-sm text-gray-600">{samplePrescription.recommendedExercises.mainExercise.duration}분</p>
                      <p className="text-xs text-gray-500">{samplePrescription.recommendedExercises.mainExercise.intensity}</p>
                    </div>
                    <div className="bg-white p-3 rounded">
                      <h5 className="font-medium text-gray-900 mb-1">정리운동</h5>
                      <p className="text-sm text-gray-600">{samplePrescription.recommendedExercises.coolDown.duration}분</p>
                      <p className="text-xs text-gray-500">{samplePrescription.recommendedExercises.coolDown.intensity}</p>
                    </div>
                  </div>

                  {samplePrescription.safetyGuidelines.length > 0 && (
                    <div className="mt-4">
                      <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                        <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
                        안전 가이드라인
                      </h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {samplePrescription.safetyGuidelines.map((guideline, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            {guideline}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* 알고리즘 탭 */}
        {activeTab === 'algorithm' && (
          <div className="space-y-6">
            {/* 과학적 근거 안내 */}
            <Card className="p-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <Brain className="h-5 w-5 text-green-600 mt-0.5 mr-2" />
                  <div>
                    <h4 className="font-medium text-green-900 mb-2">🔬 과학적 근거 기반 알고리즘</h4>
                    <p className="text-sm text-green-700 mb-3">
                      모든 알고리즘은 국제 의학 가이드라인과 연구 결과를 기반으로 개발되었습니다.
                      각 알고리즘의 GRADE 등급과 과학적 근거를 확인하세요.
                    </p>
                    <div className="text-xs text-green-600">
                      <strong>참고 문헌:</strong> ACSM Guidelines, AHA Guidelines, WHO Guidelines, Cochrane Reviews
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Brain className="h-5 w-5 text-blue-600 mr-2" />
                운동 강도 계산 알고리즘 (GRADE 시스템)
              </h3>
              <div className="space-y-4">
                {/* 알고리즘 선택 */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">알고리즘 선택 (과학적 근거 등급별)</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { 
                        id: 'karvonen', 
                        name: 'Karvonen Formula', 
                        description: 'ACSM 권장 표준', 
                        color: 'bg-green-100 text-green-800',
                        grade: 'A',
                        evidence: 'ACSM Guidelines (11th Edition)'
                      },
                      { 
                        id: 'vo2_max_percentage', 
                        name: 'VO2 Max 백분율', 
                        description: '체력 직접 반영', 
                        color: 'bg-green-100 text-green-800',
                        grade: 'A',
                        evidence: 'ACSM Guidelines'
                      },
                      { 
                        id: 'max_hr_percentage', 
                        name: '최대 심박수 백분율', 
                        description: '간단한 방법', 
                        color: 'bg-yellow-100 text-yellow-800',
                        grade: 'B',
                        evidence: 'Tanaka et al. (2001)'
                      },
                      { 
                        id: 'rpe_based', 
                        name: 'RPE 기반', 
                        description: '실시간 조정', 
                        color: 'bg-yellow-100 text-yellow-800',
                        grade: 'B',
                        evidence: 'Borg GA (1982)'
                      },
                      { 
                        id: 'hybrid', 
                        name: '하이브리드', 
                        description: '복합 접근', 
                        color: 'bg-yellow-100 text-yellow-800',
                        grade: 'B',
                        evidence: 'ACSM Guidelines'
                      },
                      { 
                        id: 'ai_adaptive', 
                        name: 'AI 적응형', 
                        description: '연구 단계', 
                        color: 'bg-red-100 text-red-800',
                        grade: 'C',
                        evidence: 'Machine Learning (2023)'
                      }
                    ].map((algorithm) => (
                      <button
                        key={algorithm.id}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          selectedAlgorithm === algorithm.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedAlgorithm(algorithm.id)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className={`text-xs font-medium px-2 py-1 rounded-full ${algorithm.color}`}>
                            {algorithm.name}
                          </div>
                          <span className={`text-xs font-bold px-1 py-0.5 rounded ${
                            algorithm.grade === 'A' ? 'bg-green-200 text-green-800' :
                            algorithm.grade === 'B' ? 'bg-yellow-200 text-yellow-800' :
                            'bg-red-200 text-red-800'
                          }`}>
                            GRADE {algorithm.grade}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{algorithm.description}</p>
                        <p className="text-xs text-gray-500">{algorithm.evidence}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 선택된 알고리즘의 과학적 근거 설명 */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-blue-900">
                      {selectedAlgorithm === 'karvonen' && 'Karvonen Formula (GRADE A)'}
                      {selectedAlgorithm === 'vo2_max_percentage' && 'VO2 Max 백분율 (GRADE A)'}
                      {selectedAlgorithm === 'max_hr_percentage' && '최대 심박수 백분율 (GRADE B)'}
                      {selectedAlgorithm === 'rpe_based' && 'RPE 기반 (GRADE B)'}
                      {selectedAlgorithm === 'hybrid' && '하이브리드 (GRADE B)'}
                      {selectedAlgorithm === 'ai_adaptive' && 'AI 적응형 (GRADE C)'}
                    </h4>
                    <span className={`text-xs font-bold px-2 py-1 rounded ${
                      selectedAlgorithm === 'karvonen' || selectedAlgorithm === 'vo2_max_percentage' ? 'bg-green-200 text-green-800' :
                      selectedAlgorithm === 'ai_adaptive' ? 'bg-red-200 text-red-800' :
                      'bg-yellow-200 text-yellow-800'
                    }`}>
                      GRADE {selectedAlgorithm === 'karvonen' || selectedAlgorithm === 'vo2_max_percentage' ? 'A' : selectedAlgorithm === 'ai_adaptive' ? 'C' : 'B'}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    {/* 과학적 근거 */}
                    <div>
                      <h5 className="font-medium text-blue-800 mb-1">🔬 과학적 근거</h5>
                      <p className="text-sm text-blue-700">
                        {selectedAlgorithm === 'karvonen' && 'ACSM Guidelines for Exercise Testing and Prescription (11th Edition)에서 권장하는 표준 방법'}
                        {selectedAlgorithm === 'vo2_max_percentage' && 'ACSM Guidelines에서 체력 수준을 직접 반영하는 가장 과학적인 방법으로 평가'}
                        {selectedAlgorithm === 'max_hr_percentage' && 'Tanaka et al. (2001) 연구에서 검증된 간단하고 실용적인 방법'}
                        {selectedAlgorithm === 'rpe_based' && 'Borg GA (1982)의 RPE 스케일은 주관적 평가이지만 실용적이고 즉시 적용 가능'}
                        {selectedAlgorithm === 'hybrid' && 'ACSM Guidelines에서 여러 방법의 장점을 결합한 접근법으로 복잡한 건강 상태에 적합'}
                        {selectedAlgorithm === 'ai_adaptive' && 'Machine Learning in Exercise Prescription (2023) 연구에서 제안된 새로운 접근법이지만 아직 연구 단계'}
                      </p>
                    </div>

                    {/* 공식 */}
                    <div>
                      <h5 className="font-medium text-blue-800 mb-1">📐 계산 공식</h5>
                      <div className="bg-white p-3 rounded border">
                        <code className="text-sm">
                          {selectedAlgorithm === 'karvonen' && 'Target HR = Resting HR + (Max HR - Resting HR) × Intensity'}
                          {selectedAlgorithm === 'vo2_max_percentage' && 'Target HR = f(VO2 Max × Intensity)'}
                          {selectedAlgorithm === 'max_hr_percentage' && 'Target HR = Max HR × Intensity'}
                          {selectedAlgorithm === 'rpe_based' && 'Target HR = f(RPE Scale)'}
                          {selectedAlgorithm === 'hybrid' && 'Target HR = (Karvonen + MaxHR% + RPE) / 3'}
                          {selectedAlgorithm === 'ai_adaptive' && 'Target HR = AI(HealthGrade, ExerciseHistory, ...)'}
                        </code>
                      </div>
                    </div>

                    {/* 장점과 사용 권장 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <h5 className="font-medium text-blue-800 mb-1">✅ 장점</h5>
                        <p className="text-sm text-blue-700">
                          {selectedAlgorithm === 'karvonen' && '개인의 안정시 심박수와 최대 심박수를 모두 고려하여 가장 정확한 운동 강도 계산'}
                          {selectedAlgorithm === 'vo2_max_percentage' && '실제 체력 수준을 직접 측정하여 개인화된 운동 강도 제공'}
                          {selectedAlgorithm === 'max_hr_percentage' && '간단하고 즉시 적용 가능, 초보자도 이해하기 쉬움'}
                          {selectedAlgorithm === 'rpe_based' && '실시간 조정 가능, 개인의 주관적 느낌 반영'}
                          {selectedAlgorithm === 'hybrid' && '다양한 건강 지표를 종합적으로 고려'}
                          {selectedAlgorithm === 'ai_adaptive' && '개인별 맞춤화 가능, 지속적 학습'}
                        </p>
                      </div>
                      <div>
                        <h5 className="font-medium text-blue-800 mb-1">🎯 사용 권장</h5>
                        <p className="text-sm text-blue-700">
                          {selectedAlgorithm === 'karvonen' && '일반적인 성인, 체력 측정이 가능한 경우'}
                          {selectedAlgorithm === 'vo2_max_percentage' && '체력 측정이 가능한 경우, 정확한 처방이 필요한 경우'}
                          {selectedAlgorithm === 'max_hr_percentage' && '초보자, 간단한 평가가 필요한 경우'}
                          {selectedAlgorithm === 'rpe_based' && '실시간 조정이 필요한 경우, 보조적으로 사용'}
                          {selectedAlgorithm === 'hybrid' && '복잡한 건강 상태를 가진 경우'}
                          {selectedAlgorithm === 'ai_adaptive' && '연구 목적으로만 사용, 임상 적용 전 추가 검증 필요'}
                        </p>
                      </div>
                    </div>

                    {/* 주요 연구 문헌 */}
                    <div>
                      <h5 className="font-medium text-blue-800 mb-1">📚 주요 연구 문헌</h5>
                      <p className="text-xs text-blue-600">
                        {selectedAlgorithm === 'karvonen' && 'Karvonen MJ, et al. (1957), Swain DP, et al. (1994), ACSM Guidelines (11th Edition)'}
                        {selectedAlgorithm === 'vo2_max_percentage' && 'ACSM Guidelines (11th Edition), Fletcher GF, et al. (2013), Garber CE, et al. (2011)'}
                        {selectedAlgorithm === 'max_hr_percentage' && 'Tanaka H, et al. (2001), Gellish RL, et al. (2007)'}
                        {selectedAlgorithm === 'rpe_based' && 'Borg GA (1982), Noble BJ, et al. (1983), ACSM Guidelines (11th Edition)'}
                        {selectedAlgorithm === 'hybrid' && 'Swain DP, et al. (1994), ACSM Guidelines (11th Edition)'}
                        {selectedAlgorithm === 'ai_adaptive' && 'Machine learning in exercise prescription (2023), AI-based personalized exercise prescription (2024)'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-900 mb-2">강도별 심박수 범위</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>저강도 (50-60%)</span>
                        <span className="font-medium">안전한 시작</span>
                      </div>
                      <div className="flex justify-between">
                        <span>중강도 (60-70%)</span>
                        <span className="font-medium">체력 향상</span>
                      </div>
                      <div className="flex justify-between">
                        <span>고강도 (70-85%)</span>
                        <span className="font-medium">심폐기능 향상</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-medium text-yellow-900 mb-2">건강 상태별 조정</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>심혈관 위험도 높음</span>
                        <span className="font-medium">강도 20% 감소</span>
                      </div>
                      <div className="flex justify-between">
                        <span>고도비만 (BMI ≥35)</span>
                        <span className="font-medium">강도 15% 감소</span>
                      </div>
                      <div className="flex justify-between">
                        <span>고령자 (≥65세)</span>
                        <span className="font-medium">최대 25분 제한</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">동적 조정 알고리즘</h3>
              <div className="space-y-4">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-medium text-purple-900 mb-2">성과 기반 자동 조정</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-white p-3 rounded">
                      <h5 className="font-medium text-green-600 mb-1">완주율 95% 이상</h5>
                      <p className="text-gray-600">강도 5% 증가</p>
                    </div>
                    <div className="bg-white p-3 rounded">
                      <h5 className="font-medium text-yellow-600 mb-1">완주율 70-95%</h5>
                      <p className="text-gray-600">현재 강도 유지</p>
                    </div>
                    <div className="bg-white p-3 rounded">
                      <h5 className="font-medium text-red-600 mb-1">완주율 70% 이하</h5>
                      <p className="text-gray-600">강도 10% 감소</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">주관적 피드백 반영</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h5 className="font-medium mb-1">난이도 평가</h5>
                      <ul className="space-y-1 text-gray-600">
                        <li>• 너무 쉬움 → 강도 증가</li>
                        <li>• 적당함 → 현재 강도 유지</li>
                        <li>• 너무 어려움 → 강도 감소</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium mb-1">피로도 평가</h5>
                      <ul className="space-y-1 text-gray-600">
                        <li>• 높은 피로도 → 강도 감소</li>
                        <li>• 적당한 피로도 → 현재 강도 유지</li>
                        <li>• 낮은 피로도 → 강도 증가 고려</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* 모니터링 탭 */}
        {activeTab === 'monitoring' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">실시간 모니터링 대시보드</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <UserCheck className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="font-medium text-blue-900">활성 사용자</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">892명</p>
                  <p className="text-sm text-blue-600">현재 운동 중</p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Calendar className="h-5 w-5 text-green-600 mr-2" />
                    <span className="font-medium text-green-900">오늘 완료</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">156회</p>
                  <p className="text-sm text-green-600">운동 세션</p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <TrendingUp className="h-5 w-5 text-yellow-600 mr-2" />
                    <span className="font-medium text-yellow-900">평균 완주율</span>
                  </div>
                  <p className="text-2xl font-bold text-yellow-600">78.5%</p>
                  <p className="text-sm text-yellow-600">이번 주</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">센터별 성과 분석</h3>
              <div className="space-y-4">
                {stats?.topPerformingCenters.map((center, index) => (
                  <div key={center.centerId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-600 rounded-full font-bold">
                        {index + 1}
                      </div>
                      <div className="ml-4">
                        <p className="font-medium text-gray-900">{center.centerName}</p>
                        <p className="text-sm text-gray-600">{center.prescriptionCount}개 처방 관리</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center">
                        <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${center.averageCompletionRate}%` }}
                          ></div>
                        </div>
                        <span className="font-semibold text-green-600">{center.averageCompletionRate}%</span>
                      </div>
                      <p className="text-sm text-gray-600">평균 완주율</p>
                    </div>
                  </div>
                ))}
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
