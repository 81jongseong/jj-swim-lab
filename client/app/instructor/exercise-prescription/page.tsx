/**
 * 🏃‍♂️ JJ Swim Lab - 강사용 개인별 운동 처방 시스템
 * 
 * 📋 **페이지 개요**
 * - 강사가 회원별 맞춤 운동 처방 생성
 * - 알고리즘 선택 및 개인별 조정
 * - 실시간 처방 조정 및 성과 모니터링
 * - 회원별 운동 이력 관리
 * 
 * 🔗 **연동 데이터**
 * - ExercisePrescription: 운동 처방 데이터
 * - User: 회원 정보
 * - HealthData: 건강 정보
 * - Center: 센터 정보
 * 
 * 📅 **개발 히스토리**
 * - 2025-01-22: 강사용 운동 처방 시스템 구현
 */

'use client';

import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { RefreshButton } from '@/components/ui/RefreshButton';
import { 
  Users, 
  Activity, 
  Target, 
  Clock, 
  Heart, 
  TrendingUp,
  Settings,
  UserCheck,
  Calendar,
  Award,
  Brain,
  Zap,
  BarChart3,
  Edit,
  Save,
  RotateCcw
} from 'lucide-react';

interface Member {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female';
  healthData: {
    bmi: number;
    bloodPressure: { systolic: number; diastolic: number };
    restingHeartRate: number;
    bloodSugar: number;
    healthConditions: string[];
  };
  exerciseHistory: {
    totalSessions: number;
    averageCompletionRate: number;
    currentStreak: number;
    lastSession: string;
  };
  currentPrescription?: {
    algorithm: string;
    sessionDuration: number;
    targetHeartRate: number;
    weeklyFrequency: number;
    lastUpdated: string;
  };
}

interface AlgorithmPerformance {
  algorithm: string;
  successRate: number;
  averageCompletionRate: number;
  memberSatisfaction: number;
  totalPrescriptions: number;
}

export default function InstructorExercisePrescription() {
  const [isLoading, setIsLoading] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<'karvonen' | 'max_hr_percentage' | 'vo2_max_percentage' | 'rpe_based' | 'hybrid' | 'ai_adaptive'>('karvonen');
  const [algorithmPerformance, setAlgorithmPerformance] = useState<AlgorithmPerformance[]>([]);
  const [activeTab, setActiveTab] = useState<'members' | 'prescription' | 'performance'>('members');

  // 알고리즘 정보
  const algorithms = {
    karvonen: { name: 'Karvonen Formula', description: '심박수 예비량법 - 가장 정확한 개인화', color: 'bg-blue-100 text-blue-800' },
    max_hr_percentage: { name: '최대 심박수 백분율', description: '간단한 백분율법 - 초보자용', color: 'bg-green-100 text-green-800' },
    vo2_max_percentage: { name: 'VO2 Max 백분율', description: '산소섭취량 기반 - 체력 수준 반영', color: 'bg-purple-100 text-purple-800' },
    rpe_based: { name: 'RPE 기반', description: '자각적 운동강도 - 주관적 느낌 반영', color: 'bg-yellow-100 text-yellow-800' },
    hybrid: { name: '하이브리드', description: '여러 방법 조합 - 더 정확한 강도', color: 'bg-orange-100 text-orange-800' },
    ai_adaptive: { name: 'AI 적응형', description: 'AI 기반 최적화 - 모든 지표 종합', color: 'bg-red-100 text-red-800' }
  };

  // 샘플 데이터 로드
  const loadSampleData = async () => {
    setIsLoading(true);
    try {
      // 샘플 회원 데이터
      const sampleMembers: Member[] = [
        {
          id: '1',
          name: '김수영',
          age: 35,
          gender: 'female',
          healthData: {
            bmi: 28.5,
            bloodPressure: { systolic: 135, diastolic: 85 },
            restingHeartRate: 75,
            bloodSugar: 95,
            healthConditions: ['고혈압 전단계']
          },
          exerciseHistory: {
            totalSessions: 12,
            averageCompletionRate: 78,
            currentStreak: 3,
            lastSession: '2025-01-20'
          },
          currentPrescription: {
            algorithm: 'karvonen',
            sessionDuration: 35,
            targetHeartRate: 130,
            weeklyFrequency: 3,
            lastUpdated: '2025-01-15'
          }
        },
        {
          id: '2',
          name: '이철수',
          age: 42,
          gender: 'male',
          healthData: {
            bmi: 32.1,
            bloodPressure: { systolic: 145, diastolic: 90 },
            restingHeartRate: 85,
            bloodSugar: 110,
            healthConditions: ['고혈압', '당뇨 전단계']
          },
          exerciseHistory: {
            totalSessions: 8,
            averageCompletionRate: 65,
            currentStreak: 1,
            lastSession: '2025-01-18'
          }
        },
        {
          id: '3',
          name: '박민지',
          age: 28,
          gender: 'female',
          healthData: {
            bmi: 22.3,
            bloodPressure: { systolic: 115, diastolic: 70 },
            restingHeartRate: 65,
            bloodSugar: 88,
            healthConditions: []
          },
          exerciseHistory: {
            totalSessions: 20,
            averageCompletionRate: 92,
            currentStreak: 7,
            lastSession: '2025-01-21'
          },
          currentPrescription: {
            algorithm: 'hybrid',
            sessionDuration: 45,
            targetHeartRate: 150,
            weeklyFrequency: 4,
            lastUpdated: '2025-01-10'
          }
        }
      ];

      // 알고리즘별 성과 데이터
      const samplePerformance: AlgorithmPerformance[] = [
        { algorithm: 'karvonen', successRate: 85, averageCompletionRate: 82, memberSatisfaction: 4.2, totalPrescriptions: 45 },
        { algorithm: 'hybrid', successRate: 88, averageCompletionRate: 85, memberSatisfaction: 4.4, totalPrescriptions: 32 },
        { algorithm: 'ai_adaptive', successRate: 90, averageCompletionRate: 87, memberSatisfaction: 4.5, totalPrescriptions: 28 },
        { algorithm: 'max_hr_percentage', successRate: 72, averageCompletionRate: 75, memberSatisfaction: 3.8, totalPrescriptions: 38 },
        { algorithm: 'vo2_max_percentage', successRate: 80, averageCompletionRate: 78, memberSatisfaction: 4.0, totalPrescriptions: 25 },
        { algorithm: 'rpe_based', successRate: 78, averageCompletionRate: 76, memberSatisfaction: 3.9, totalPrescriptions: 30 }
      ];

      setMembers(sampleMembers);
      setAlgorithmPerformance(samplePerformance);
    } catch (error) {
      console.error('데이터 로드 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSampleData();
  }, []);

  // 운동 처방 생성
  const generatePrescription = async (member: Member, algorithm: string) => {
    setIsLoading(true);
    try {
      // 실제 API 호출 대신 샘플 처방 생성
      const prescription = {
        algorithm,
        sessionDuration: algorithm === 'ai_adaptive' ? 40 : algorithm === 'hybrid' ? 38 : 35,
        targetHeartRate: algorithm === 'karvonen' ? 130 : algorithm === 'ai_adaptive' ? 135 : 125,
        weeklyFrequency: member.exerciseHistory.totalSessions > 15 ? 4 : 3,
        lastUpdated: new Date().toISOString().split('T')[0]
      };

      // 회원 데이터 업데이트
      setMembers(prev => prev.map(m => 
        m.id === member.id 
          ? { ...m, currentPrescription: prescription }
          : m
      ));

      console.log(`✅ ${member.name}님의 운동 처방 생성 완료 (${algorithm})`);
    } catch (error) {
      console.error('처방 생성 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'members', label: '👥 회원 관리', icon: Users },
    { id: 'prescription', label: '🏃‍♂️ 처방 생성', icon: Activity },
    { id: 'performance', label: '📊 성과 분석', icon: BarChart3 }
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
                개인별 운동 처방 관리
              </h1>
              <p className="text-gray-600 mt-2">
                회원별 맞춤 운동 처방 생성 및 관리
              </p>
            </div>
            <RefreshButton onClick={loadSampleData} isLoading={isLoading} />
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

        {/* 회원 관리 탭 */}
        {activeTab === 'members' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">담당 회원 목록</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {members.map((member) => (
                  <div key={member.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">{member.name}</h4>
                        <p className="text-sm text-gray-600">{member.age}세, {member.gender === 'male' ? '남성' : '여성'}</p>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        member.exerciseHistory.averageCompletionRate >= 80 
                          ? 'bg-green-100 text-green-800'
                          : member.exerciseHistory.averageCompletionRate >= 60
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {member.exerciseHistory.averageCompletionRate}% 완주율
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>BMI:</span>
                        <span className="font-medium">{member.healthData.bmi}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>혈압:</span>
                        <span className="font-medium">{member.healthData.bloodPressure.systolic}/{member.healthData.bloodPressure.diastolic}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>총 세션:</span>
                        <span className="font-medium">{member.exerciseHistory.totalSessions}회</span>
                      </div>
                      <div className="flex justify-between">
                        <span>연속 운동:</span>
                        <span className="font-medium">{member.exerciseHistory.currentStreak}일</span>
                      </div>
                    </div>

                    {member.currentPrescription && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">현재 처방:</span>
                          <span className="text-xs font-medium text-blue-600">
                            {algorithms[member.currentPrescription.algorithm as keyof typeof algorithms]?.name}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-500">목표 심박수:</span>
                          <span className="text-xs font-medium">{member.currentPrescription.targetHeartRate}bpm</span>
                        </div>
                      </div>
                    )}

                    <div className="mt-4 flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedMember(member);
                          setActiveTab('prescription');
                        }}
                        className="flex-1"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        처방 관리
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* 처방 생성 탭 */}
        {activeTab === 'prescription' && (
          <div className="space-y-6">
            {selectedMember ? (
              <>
                {/* 선택된 회원 정보 */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{selectedMember.name}님의 운동 처방</h3>
                      <p className="text-sm text-gray-600">개인별 맞춤 운동 처방 생성 및 조정</p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedMember(null)}
                    >
                      다른 회원 선택
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">건강 정보</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>나이/성별:</span>
                          <span>{selectedMember.age}세, {selectedMember.gender === 'male' ? '남성' : '여성'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>BMI:</span>
                          <span>{selectedMember.healthData.bmi}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>혈압:</span>
                          <span>{selectedMember.healthData.bloodPressure.systolic}/{selectedMember.healthData.bloodPressure.diastolic} mmHg</span>
                        </div>
                        <div className="flex justify-between">
                          <span>안정시 심박수:</span>
                          <span>{selectedMember.healthData.restingHeartRate} bpm</span>
                        </div>
                        <div className="flex justify-between">
                          <span>혈당:</span>
                          <span>{selectedMember.healthData.bloodSugar} mg/dL</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">운동 이력</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>총 세션:</span>
                          <span>{selectedMember.exerciseHistory.totalSessions}회</span>
                        </div>
                        <div className="flex justify-between">
                          <span>평균 완주율:</span>
                          <span>{selectedMember.exerciseHistory.averageCompletionRate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>현재 연속:</span>
                          <span>{selectedMember.exerciseHistory.currentStreak}일</span>
                        </div>
                        <div className="flex justify-between">
                          <span>마지막 운동:</span>
                          <span>{selectedMember.exerciseHistory.lastSession}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* 알고리즘 선택 */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">알고리즘 선택</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    {Object.entries(algorithms).map(([key, algorithm]) => (
                      <button
                        key={key}
                        onClick={() => setSelectedAlgorithm(key as any)}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          selectedAlgorithm === key
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium text-gray-900 mb-1">{algorithm.name}</div>
                        <div className="text-sm text-gray-600">{algorithm.description}</div>
                      </button>
                    ))}
                  </div>

                  <div className="flex space-x-4">
                    <Button
                      onClick={() => generatePrescription(selectedMember, selectedAlgorithm)}
                      disabled={isLoading}
                      className="flex items-center"
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      {isLoading ? '생성 중...' : '새 처방 생성'}
                    </Button>
                    
                    {selectedMember.currentPrescription && (
                      <Button
                        variant="outline"
                        onClick={() => generatePrescription(selectedMember, selectedAlgorithm)}
                        className="flex items-center"
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        처방 조정
                      </Button>
                    )}
                  </div>
                </Card>

                {/* 현재 처방 표시 */}
                {selectedMember.currentPrescription && (
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">현재 운동 처방</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          <Clock className="h-5 w-5 text-blue-600 mr-2" />
                          <span className="font-medium text-blue-900">운동 시간</span>
                        </div>
                        <p className="text-2xl font-bold text-blue-600">{selectedMember.currentPrescription.sessionDuration}분</p>
                      </div>

                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          <Heart className="h-5 w-5 text-green-600 mr-2" />
                          <span className="font-medium text-green-900">목표 심박수</span>
                        </div>
                        <p className="text-2xl font-bold text-green-600">{selectedMember.currentPrescription.targetHeartRate}bpm</p>
                      </div>

                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          <Calendar className="h-5 w-5 text-purple-600 mr-2" />
                          <span className="font-medium text-purple-900">주간 빈도</span>
                        </div>
                        <p className="text-2xl font-bold text-purple-600">{selectedMember.currentPrescription.weeklyFrequency}회</p>
                      </div>

                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          <Brain className="h-5 w-5 text-orange-600 mr-2" />
                          <span className="font-medium text-orange-900">알고리즘</span>
                        </div>
                        <p className="text-sm font-bold text-orange-600">
                          {algorithms[selectedMember.currentPrescription.algorithm as keyof typeof algorithms]?.name}
                        </p>
                      </div>
                    </div>
                  </Card>
                )}
              </>
            ) : (
              <Card className="p-6">
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">회원을 선택해주세요</h3>
                  <p className="text-gray-600 mb-4">운동 처방을 생성할 회원을 선택해주세요.</p>
                  <Button onClick={() => setActiveTab('members')}>
                    회원 목록으로 이동
                  </Button>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* 성과 분석 탭 */}
        {activeTab === 'performance' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">알고리즘별 성과 분석</h3>
              <div className="space-y-4">
                {algorithmPerformance.map((perf, index) => (
                  <div key={perf.algorithm} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-bold mr-3">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {algorithms[perf.algorithm as keyof typeof algorithms]?.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {algorithms[perf.algorithm as keyof typeof algorithms]?.description}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center">
                          <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ width: `${perf.successRate}%` }}
                            ></div>
                          </div>
                          <span className="font-semibold text-green-600">{perf.successRate}%</span>
                        </div>
                        <p className="text-sm text-gray-600">성공률</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">평균 완주율</p>
                        <p className="font-semibold text-gray-900">{perf.averageCompletionRate}%</p>
                      </div>
                      <div>
                        <p className="text-gray-600">회원 만족도</p>
                        <p className="font-semibold text-gray-900">{perf.memberSatisfaction}/5.0</p>
                      </div>
                      <div>
                        <p className="text-gray-600">총 처방 수</p>
                        <p className="font-semibold text-gray-900">{perf.totalPrescriptions}개</p>
                      </div>
                      <div>
                        <p className="text-gray-600">추천도</p>
                        <p className="font-semibold text-gray-900">
                          {perf.successRate >= 85 ? '⭐⭐⭐⭐⭐' : 
                           perf.successRate >= 80 ? '⭐⭐⭐⭐' : 
                           perf.successRate >= 75 ? '⭐⭐⭐' : '⭐⭐'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">알고리즘 선택 가이드</h3>
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-2">🏆 최고 성과 알고리즘</h4>
                  <p className="text-sm text-green-700">
                    <strong>AI 적응형</strong>과 <strong>하이브리드</strong> 알고리즘이 가장 높은 성공률을 보입니다.
                    신규 회원이나 복잡한 건강 상태를 가진 회원에게 추천합니다.
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">💡 상황별 추천</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
                    <div>
                      <h5 className="font-medium mb-1">초보자 회원</h5>
                      <p>• Karvonen Formula (안정적)</p>
                      <p>• 최대 심박수 백분율 (간단)</p>
                    </div>
                    <div>
                      <h5 className="font-medium mb-1">경험자 회원</h5>
                      <p>• AI 적응형 (최적화)</p>
                      <p>• 하이브리드 (정확성)</p>
                    </div>
                    <div>
                      <h5 className="font-medium mb-1">건강 문제 회원</h5>
                      <p>• AI 적응형 (종합 고려)</p>
                      <p>• RPE 기반 (주관적 반영)</p>
                    </div>
                    <div>
                      <h5 className="font-medium mb-1">체력 측정 가능</h5>
                      <p>• VO2 Max 백분율</p>
                      <p>• 하이브리드</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center">
              <LoadingSpinner size="sm" />
              <span className="ml-3 text-gray-600">처리 중...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
