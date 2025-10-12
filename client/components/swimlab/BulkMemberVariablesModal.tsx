/**
 * 🏊 SwimLab - 다중 회원 개별 변수 설정 모달
 * 
 * 📋 **컴포넌트 목적**
 * - 여러 회원을 선택했을 때 각자의 변수 설정
 * - CSS, 주 영법, 제외 영법, 운동 요일 개별 입력
 * - 프로필 자동 로드 + 레벨 기반 CSS 추정
 * 
 * 🔄 **연동되는 데이터**
 * - User.studentInfo.swimmingProfile (수영 프로필)
 * - 레이스 플랜 파라미터
 * 
 * 💡 **주요 기능**
 * - 회원별 CSS 입력 (프로필 자동 로드)
 * - 회원별 주 영법 선택 (mainStrokes)
 * - 회원별 제외 영법 선택 (excludedStrokes)
 * - 회원별 운동 요일 선택
 * - 일괄 적용 (모두 동일하게)
 * - 레이스 플랜 설정 (대회 준비)
 * 
 * 📅 **개발 히스토리**
 * - 2025-01-XX: 초기 컴포넌트 생성
 */

'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Button from '@/components/Button';
import apiClient from '@/utils/api';

const FeasibilityChecker = dynamic(
  () => import('@/components/swimlab/FeasibilityChecker'),
  { ssr: false }
);

const AllConditionsDrawer = dynamic(
  () => import('@/components/swimlab/AllConditionsDrawer'),
  { ssr: false }
);

interface MemberVariable {
  memberId: string;
  memberName: string;
  memberLevel: string; // 회원 레벨
  css: Record<string, number>; // 영법별 CSS
  mainStrokes: string[]; // 주 영법 (프로그램의 메인)
  excludedStrokes: string[]; // 회피 영법
  trainingDays: number[]; // 운동 요일 (0: 일요일, 1: 월요일, ...) - 이게 곧 주당 세션 수
  sessionDuration: number; // 세션 시간(분)
  poolLength: number; // 풀 길이 (미터)
  programType: 'base' | 'race'; // 프로그램 타입
  goal: string; // 운동 목표
  conditionIds: string[]; // 질환/특수상황
  weeklyDistance?: number; // 주간 목표 거리
  // 레이스 플랜 전용
  startDate?: string;
  raceDate?: string;
  // 🏆 복수 출전 종목 지원
  raceEvents?: Array<{
    distance: number; // 50, 100, 200, 400, 800, 1500
    stroke: string;   // freestyle, backstroke, breaststroke, butterfly
    currentTime: number; // 초
    targetTime: number;  // 초
    priority: 'primary' | 'secondary'; // 주 종목 vs 부 종목
  }>;
  // 🔻 호환성을 위해 단일 종목 필드도 유지
  raceDistance?: number;
  raceStroke?: string;
  currentTime?: number;
  targetTime?: number;
  taperWeeks?: number;
  // 🧬 생리학적 지표 (선택사항) - 개선 한계 판단용
  vo2max?: number; // VO2max (ml/kg/min)
  maxHeartRate?: number; // 최고심박수 (bpm)
  restingHeartRate?: number; // 안정심박수 (bpm)
}

interface BulkMemberVariablesModalProps {
  members: Array<{ 
    _id: string; 
    name: string;
    studentInfo?: any; // 회원의 전체 정보
  }>;
  onClose: () => void;
  onConfirm: (variables: MemberVariable[], generateWeeklyPlan?: boolean) => void;
}

// 레벨 기반 CSS 추정 함수
function getEstimatedCSS(level: string) {
  const baseCSS: Record<string, number> = {
    beginner: 150,
    beginner_1: 150,
    beginner_2: 140,
    intermediate: 120,
    intermediate_1: 120,
    intermediate_2: 110,
    advanced: 90,
    advanced_1: 90,
    advanced_2: 85,
    master: 75,
    expert: 70
  };
  
  const base = baseCSS[level] || 120;
  
  return {
    freestyle: base,
    backstroke: base + 10,
    breaststroke: base + 15,
    butterfly: base + 20
  };
}

export default function BulkMemberVariablesModal({
  members,
  onClose,
  onConfirm
}: BulkMemberVariablesModalProps) {
  const [currentMemberIdx, setCurrentMemberIdx] = useState(0);
  const [availablePoolLengths, setAvailablePoolLengths] = useState<number[]>([25]);
  const [conditionsData, setConditionsData] = useState<any[]>([]);
  const [showConditionsDrawer, setShowConditionsDrawer] = useState(false);
  
  const [memberVariables, setMemberVariables] = useState<MemberVariable[]>(
    members.map(m => {
      // 회원의 기존 수영 프로필 불러오기
      const swimmingProfile = m.studentInfo?.swimmingProfile || {};
      const existingCSS = swimmingProfile.css || {};
      const healthProfile = m.studentInfo?.healthProfile || {};
      
      console.log(`🔍 ${m.name} 프로필 로드:`, {
        vo2max: swimmingProfile.vo2max,
        maxHeartRate: swimmingProfile.maxHeartRate,
        restingHeartRate: swimmingProfile.restingHeartRate,
        css: existingCSS,
        lastRacePlan: swimmingProfile.lastRacePlan,
        '전체 swimmingProfile': swimmingProfile
      });
      
      const memberLevel = m.studentInfo?.currentLevel || (m as any).level || 'beginner';
      
      // CSS: 프로필 or 레벨 추정
      const hasAnyCSS = existingCSS.freestyle > 0 || existingCSS.backstroke > 0;
      const estimatedCSS = getEstimatedCSS(memberLevel);
      const finalCSS = hasAnyCSS ? {
        freestyle: existingCSS.freestyle || estimatedCSS.freestyle,
        backstroke: existingCSS.backstroke || estimatedCSS.backstroke,
        breaststroke: existingCSS.breaststroke || estimatedCSS.breaststroke,
        butterfly: existingCSS.butterfly || estimatedCSS.butterfly
      } : estimatedCSS;
      
      const healthConditions = [];
      if (healthProfile.chronicConditions) {
        healthConditions.push(...healthProfile.chronicConditions);
      }
      if (healthProfile.allergies) {
        healthConditions.push(...healthProfile.allergies);
      }
      
      // athlete_ 접두사 제거 (API는 순수 User ID 필요)
      const rawUserId = m._id.startsWith('athlete_') ? m._id.substring(8) : m._id;
      
      return {
        memberId: rawUserId,
        memberName: m.name,
        memberLevel: memberLevel,
        css: finalCSS,
        mainStrokes: swimmingProfile.mainStrokes || ['freestyle'],
        excludedStrokes: swimmingProfile.excludedStrokes || [],
        trainingDays: swimmingProfile.trainingDays || [1, 3, 5],
        sessionDuration: swimmingProfile.sessionDuration || 60,
        poolLength: swimmingProfile.poolLength || 25,
        programType: 'base' as 'base' | 'race',
        goal: swimmingProfile.currentGoal || '체력 향상',
        conditionIds: swimmingProfile.conditionIds || healthConditions,
        weeklyDistance: swimmingProfile.weeklyDistance || 0,
        // 🏆 레이스 플랜 설정 (마지막 설정 로드)
        startDate: swimmingProfile.lastRacePlan?.startDate || '',
        raceDate: swimmingProfile.lastRacePlan?.raceDate || '',
        raceDistance: swimmingProfile.lastRacePlan?.raceDistance || 100,
        raceStroke: swimmingProfile.lastRacePlan?.raceStroke || 'freestyle',
        currentTime: swimmingProfile.lastRacePlan?.currentTime || 0,
        targetTime: swimmingProfile.lastRacePlan?.targetTime || 0,
        taperWeeks: swimmingProfile.lastRacePlan?.taperWeeks || 2,
        // 복수 출전 종목 로드
        raceEvents: swimmingProfile.lastRacePlan?.raceEvents || undefined,
        // 🧬 생리학적 지표 (프로필에서 로드 또는 기본값)
        vo2max: swimmingProfile.vo2max || undefined,
        maxHeartRate: swimmingProfile.maxHeartRate || undefined,
        restingHeartRate: swimmingProfile.restingHeartRate || undefined
      };
    })
  );

  const currentMember = memberVariables[currentMemberIdx];
  const currentMemberData = members[currentMemberIdx];
  const cssInfo = currentMemberData?.studentInfo?.swimmingProfile?.css;
  
  const strokes = [
    { id: 'freestyle', label: '자유형', icon: '🏊' },
    { id: 'backstroke', label: '배영', icon: '🏊‍♂️' },
    { id: 'breaststroke', label: '평영', icon: '🤿' },
    { id: 'butterfly', label: '접영', icon: '🦋' }
  ];
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const goals = [
    '체력 향상', '체중 감량', '기술 연마', '실력 향상', '재활', '스트레스 해소',
    '장거리 수영', '오픈워터', '생존수영', '인명구조원'
  ];

  useEffect(() => {
    const fetchCenterPoolLengths = async () => {
      try {
        const firstMember = members[0];
        if (firstMember?.studentInfo?.centerId) {
          const response = await apiClient.get(`/api/centers/${firstMember.studentInfo.centerId}`);
          const poolLengths = response.data?.facilities?.availablePoolLengths || [25];
          setAvailablePoolLengths(poolLengths);
        }
      } catch (error) {
        console.error('센터 풀 길이 조회 실패:', error);
      }
    };
    
    fetchCenterPoolLengths();
    
    // 컨디션 데이터 로드
    const loadConditions = async () => {
      try {
        const { CONDITIONS } = await import('@/src/swimlab/data/conditions_full');
        setConditionsData(CONDITIONS);
      } catch (error) {
        console.error('컨디션 데이터 로드 실패:', error);
      }
    };
    
    loadConditions();
  }, [members]);

  const updateCurrentMember = (updates: Partial<MemberVariable>) => {
    const newVariables = [...memberVariables];
    newVariables[currentMemberIdx] = { ...newVariables[currentMemberIdx], ...updates };
    setMemberVariables(newVariables);
  };

  const applyToAll = () => {
    if (!confirm('현재 설정을 모든 회원에게 동일하게 적용하시겠습니까?')) return;
    
    const template = memberVariables[currentMemberIdx];
    const newVariables = memberVariables.map(v => ({
      ...v,
      css: { ...template.css },
      mainStrokes: [...template.mainStrokes],
      excludedStrokes: [...template.excludedStrokes],
      trainingDays: [...template.trainingDays],
      sessionDuration: template.sessionDuration,
      poolLength: template.poolLength,
      programType: template.programType,
      goal: template.goal,
      conditionIds: [...template.conditionIds],
      weeklyDistance: template.weeklyDistance,
      startDate: template.startDate,
      raceDate: template.raceDate,
      raceDistance: template.raceDistance,
      raceStroke: template.raceStroke,
      currentTime: template.currentTime,
      targetTime: template.targetTime,
      taperWeeks: template.taperWeeks
    }));
    setMemberVariables(newVariables);
    alert('모든 회원에게 동일한 설정이 적용되었습니다!');
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="sticky top-0 bg-white border-b p-6 z-10">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-semibold text-gray-900">
              회원별 변수 설정 ({currentMemberIdx + 1}/{members.length})
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
          <p className="text-sm text-gray-600">
            각 회원의 프로필이 자동으로 로드되었습니다. 필요시 수정하세요
          </p>
        </div>

        {/* 본문 */}
        <div className="p-6 space-y-6">
          {/* 회원 네비게이션 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-semibold text-gray-700">현재 설정 중:</span>
              <span className="px-3 py-1 bg-blue-600 text-white rounded-lg font-semibold">
                {currentMember.memberName}
              </span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {memberVariables.map((v, idx) => (
                <button
                  key={v.memberId}
                  onClick={() => setCurrentMemberIdx(idx)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                    idx === currentMemberIdx
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:border-blue-400'
                  }`}
                >
                  {v.memberName}
                </button>
              ))}
            </div>
          </div>

          {/* CSS 입력 */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-semibold text-gray-900">📊 CSS (Critical Swim Speed)</h4>
                {cssInfo?.lastUpdated && (
                  <p className="text-xs text-gray-500 mt-1">
                    마지막 측정: {new Date(cssInfo.lastUpdated).toLocaleDateString()} 
                    {cssInfo.updatedByRole && (
                      <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                        cssInfo.updatedByRole === 'instructor' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {cssInfo.updatedByRole === 'instructor' ? '👨‍🏫 강사 측정' : '👤 본인 입력'}
                      </span>
                    )}
                  </p>
                )}
              </div>
              <button
                onClick={() => {
                  const defaultCSS = { freestyle: 90, backstroke: 100, breaststroke: 110, butterfly: 95 };
                  updateCurrentMember({ css: defaultCSS });
                }}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                기본값 설정
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {strokes.map(stroke => (
                <div key={stroke.id}>
                  <label className="block text-xs text-gray-600 mb-1">
                    {stroke.icon} {stroke.label}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={currentMember.css[stroke.id] || ''}
                      onChange={(e) => {
                        updateCurrentMember({
                          css: { ...currentMember.css, [stroke.id]: parseInt(e.target.value) || 0 }
                        });
                      }}
                      className="w-full px-3 py-2 border rounded-lg text-sm pr-12"
                      placeholder="0"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                      초/100m
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 주 영법 */}
          <div className="border rounded-lg p-4 bg-blue-50">
            <h4 className="font-semibold text-gray-900 mb-3">🏊 주 영법 (Main Strokes)</h4>
            <p className="text-xs text-gray-600 mb-3">프로그램의 메인으로 사용할 영법 (최소 1개 이상 선택)</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {strokes.map(stroke => {
                const isExcluded = currentMember.excludedStrokes.includes(stroke.id);
                return (
                  <button
                    key={stroke.id}
                    onClick={() => {
                      if (isExcluded) {
                        alert('제외 영법으로 설정된 영법은 주 영법으로 선택할 수 없습니다.');
                        return;
                      }
                      const current = currentMember.mainStrokes;
                      const isSelected = current.includes(stroke.id);
                      updateCurrentMember({
                        mainStrokes: isSelected
                          ? current.filter(s => s !== stroke.id)
                          : [...current, stroke.id]
                      });
                    }}
                    disabled={isExcluded}
                    className={`px-4 py-3 border-2 rounded-lg transition-all ${
                      isExcluded 
                        ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
                        : currentMember.mainStrokes.includes(stroke.id)
                        ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="text-xl mb-1">{stroke.icon}</div>
                    <div className="text-xs">{stroke.label}</div>
                    {isExcluded && <div className="text-xs text-red-600 mt-1">제외됨</div>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 제외 영법 */}
          <div className="border rounded-lg p-4 bg-red-50">
            <h4 className="font-semibold text-gray-900 mb-3">🚫 회피 영법</h4>
            <p className="text-xs text-gray-600 mb-3">부상이나 선호도로 인해 피하고 싶은 영법 (프로그램에서 제외)</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {strokes.map(stroke => {
                const isMainStroke = currentMember.mainStrokes.includes(stroke.id);
                return (
                  <button
                    key={stroke.id}
                    onClick={() => {
                      if (isMainStroke) {
                        alert('주 영법으로 설정된 영법은 제외 영법으로 선택할 수 없습니다.');
                        return;
                      }
                      const current = currentMember.excludedStrokes;
                      const isSelected = current.includes(stroke.id);
                      updateCurrentMember({
                        excludedStrokes: isSelected
                          ? current.filter(s => s !== stroke.id)
                          : [...current, stroke.id]
                      });
                    }}
                    disabled={isMainStroke}
                    className={`px-4 py-3 border-2 rounded-lg transition-all ${
                      isMainStroke
                        ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
                        : currentMember.excludedStrokes.includes(stroke.id)
                        ? 'border-red-500 bg-red-100 text-red-700 font-semibold'
                        : 'border-gray-200 hover:border-red-300'
                    }`}
                  >
                    <div className="text-xl mb-1">{stroke.icon}</div>
                    <div className="text-xs">{stroke.label}</div>
                    {isMainStroke && <div className="text-xs text-blue-600 mt-1">주 영법</div>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 🧬 생리학적 지표 (선택사항) */}
          <div className="border rounded-lg p-4 bg-gradient-to-r from-purple-50 to-indigo-50">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-semibold text-gray-900">🧬 생리학적 지표</h4>
                <p className="text-xs text-gray-600 mt-1">
                  개선 한계 판단 및 맞춤형 강도 조절을 위한 과학적 지표 (선택사항)
                </p>
              </div>
              <button
                onClick={() => {
                  // 기본값 설정 (성인 평균)
                  updateCurrentMember({ 
                    vo2max: 40,
                    maxHeartRate: 180,
                    restingHeartRate: 70
                  });
                }}
                className="text-xs text-purple-600 hover:text-purple-800"
              >
                기본값 설정
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* VO2max */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  VO2max (ml/kg/min)
                </label>
                <input
                  type="number"
                  value={currentMember.vo2max || ''}
                  onChange={(e) => updateCurrentMember({ 
                    vo2max: e.target.value ? parseFloat(e.target.value) : undefined 
                  })}
                  placeholder="예: 45"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  일반인: 30-40, 운동선수: 50+
                </p>
              </div>
              
              {/* 최고심박수 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  최고심박수 (bpm)
                </label>
                <input
                  type="number"
                  value={currentMember.maxHeartRate || ''}
                  onChange={(e) => updateCurrentMember({ 
                    maxHeartRate: e.target.value ? parseInt(e.target.value) : undefined 
                  })}
                  placeholder="예: 180"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  공식: 220 - 나이
                </p>
              </div>
              
              {/* 안정심박수 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  안정심박수 (bpm)
                </label>
                <input
                  type="number"
                  value={currentMember.restingHeartRate || ''}
                  onChange={(e) => updateCurrentMember({ 
                    restingHeartRate: e.target.value ? parseInt(e.target.value) : undefined 
                  })}
                  placeholder="예: 70"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  아침에 측정한 심박수
                </p>
              </div>
            </div>
            
            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-700 mb-2">
                💡 <strong>생리학적 지표를 모르는 경우:</strong>
              </p>
              <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                <li><strong>비워두셔도 됩니다:</strong> 레벨, CSS, 완료율만으로도 프로그램 생성 가능</li>
                <li><strong>입력하면 더 정확:</strong> 개인별 맞춤형 강도 조절 가능</li>
                <li><strong>스마트워치 연동 예정:</strong> Apple Watch, Garmin에서 자동 수집</li>
              </ul>
            </div>
          </div>

          {/* 운동 요일 */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900">📅 운동 요일</h4>
              <div className="flex gap-2">
                <button
                  onClick={() => updateCurrentMember({ trainingDays: [1, 2, 3, 4, 5] })}
                  className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                >
                  평일
                </button>
                <button
                  onClick={() => updateCurrentMember({ trainingDays: [1, 3, 5] })}
                  className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                >
                  월수금
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {days.map((day, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    const current = currentMember.trainingDays;
                    const isSelected = current.includes(idx);
                    updateCurrentMember({
                      trainingDays: isSelected
                        ? current.filter(d => d !== idx)
                        : [...current, idx].sort((a, b) => a - b)
                    });
                  }}
                  className={`px-3 py-2 border-2 rounded-lg font-semibold transition-all ${
                    currentMember.trainingDays.includes(idx)
                      ? 'border-blue-500 bg-blue-500 text-white'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              선택된 요일: {currentMember.trainingDays.length}일/주
            </p>
          </div>

          {/* 세션 시간 */}
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">⏱️ 세션 시간</h4>
            <div className="flex gap-2">
              {[30, 50, 60].map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => updateCurrentMember({ sessionDuration: n })}
                  className={`px-4 py-2 border rounded-lg transition ${
                    currentMember.sessionDuration === n
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white border-gray-300 hover:border-blue-300'
                  }`}
                >
                  {n}분
                </button>
              ))}
              <input
                type="number"
                min="20"
                max="180"
                value={currentMember.sessionDuration}
                onChange={(e) => updateCurrentMember({ sessionDuration: parseInt(e.target.value) || 60 })}
                placeholder="직접 입력"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              💡 1회 운동 시간 (운동 요일은 위에서 선택)
            </p>
          </div>

          {/* 풀 길이 선택 */}
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">🏊‍♂️ 풀 길이</h4>
            <div className="flex gap-2">
              {[25, 50].map(length => (
                <button
                  key={length}
                  onClick={() => updateCurrentMember({ poolLength: length })}
                  className={`px-4 py-3 border-2 rounded-lg transition-all ${
                    currentMember.poolLength === length
                      ? 'border-cyan-500 bg-cyan-100 text-cyan-700 font-semibold'
                      : 'border-gray-200 hover:border-cyan-300'
                  }`}
                >
                  {length}m
                </button>
              ))}
              <input
                type="number"
                min="20"
                max="100"
                step="5"
                value={currentMember.poolLength}
                onChange={(e) => updateCurrentMember({ poolLength: parseInt(e.target.value) || 25 })}
                placeholder="직접 입력"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              💡 25m 단수영장, 50m 장수영장, 또는 직접 입력
            </p>
          </div>

          {/* 프로그램 타입 */}
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">📋 프로그램 타입</h4>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => updateCurrentMember({ programType: 'base' })}
                className={`px-4 py-3 border-2 rounded-lg transition-all ${
                  currentMember.programType === 'base'
                    ? 'border-green-500 bg-green-100 text-green-700 font-semibold'
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <div className="text-lg mb-1">🏊</div>
                <div className="font-semibold">기본 훈련</div>
                <div className="text-xs mt-1">일반적인 체력 향상 프로그램</div>
              </button>
              <button
                onClick={() => {
                  console.log(`🏆 레이스 플랜 버튼 클릭: ${currentMember.memberName}`);
                  updateCurrentMember({ programType: 'race' });
                  console.log(`✅ ${currentMember.memberName} programType → 'race'로 변경`);
                }}
                className={`px-4 py-3 border-2 rounded-lg transition-all ${
                  currentMember.programType === 'race'
                    ? 'border-purple-500 bg-purple-100 text-purple-700 font-semibold shadow-lg'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className="text-lg mb-1">🏆</div>
                <div className="font-semibold">레이스 플랜</div>
                <div className="text-xs mt-1">대회 준비 프로그램</div>
                {currentMember.programType === 'race' && (
                  <div className="text-xs mt-2 font-bold text-purple-900">✓ 선택됨</div>
                )}
              </button>
            </div>
          </div>

          {/* 레이스 플랜 (대회 준비) */}
          {currentMember.programType === 'race' && (
            <div className="border-2 border-purple-300 rounded-lg p-4 bg-purple-50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">🏆 레이스 플랜 설정</h4>
                {(() => {
                  const isValid = currentMember.raceDate && 
                                 currentMember.currentTime > 0 && 
                                 currentMember.targetTime > 0;
                  return isValid ? (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                      ✓ 필수 항목 완료
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                      ⚠️ 필수 항목 입력 필요
                    </span>
                  );
                })()}
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">훈련 시작일</label>
                  <input
                    type="date"
                    value={currentMember.startDate || ''}
                    onChange={(e) => updateCurrentMember({ startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    💡 비워두면 오늘부터 시작됩니다
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    시합일 (목표 날짜) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={currentMember.raceDate || ''}
                    onChange={(e) => updateCurrentMember({ raceDate: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 ${
                      !currentMember.raceDate ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    required
                  />
                  {!currentMember.raceDate && (
                    <p className="text-xs text-red-600 mt-1">필수 입력 항목입니다</p>
                  )}
                </div>
              </div>

              {/* 🏆 출전 종목 (복수 가능) */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700">출전 종목</label>
                  <button
                    type="button"
                    onClick={() => {
                      const events = currentMember.raceEvents || [{
                        distance: currentMember.raceDistance || 100,
                        stroke: currentMember.raceStroke || 'freestyle',
                        currentTime: currentMember.currentTime || 0,
                        targetTime: currentMember.targetTime || 0,
                        priority: 'primary'
                      }];
                      updateCurrentMember({
                        raceEvents: [
                          ...events,
                          {
                            distance: 100,
                            stroke: 'freestyle',
                            currentTime: 0,
                            targetTime: 0,
                            priority: 'secondary'
                          }
                        ]
                      });
                    }}
                    className="px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    + 종목 추가
                  </button>
                </div>
                
                {/* 종목 목록 */}
                <div className="space-y-3">
                  {(() => {
                    const events = currentMember.raceEvents || [{
                      distance: currentMember.raceDistance || 100,
                      stroke: currentMember.raceStroke || 'freestyle',
                      currentTime: currentMember.currentTime || 0,
                      targetTime: currentMember.targetTime || 0,
                      priority: 'primary'
                    }];
                    
                    return events.map((event, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-gray-600">
                            {idx === 0 ? '🥇 주 종목' : `🥈 부 종목 ${idx}`}
                          </span>
                          {idx > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                const newEvents = events.filter((_, i) => i !== idx);
                                updateCurrentMember({ raceEvents: newEvents });
                              }}
                              className="text-red-600 hover:text-red-800 text-xs font-medium"
                            >
                              ✕ 삭제
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">거리</label>
                            <select
                              value={event.distance}
                              onChange={(e) => {
                                const newEvents = [...events];
                                newEvents[idx] = { ...newEvents[idx], distance: parseInt(e.target.value) };
                                updateCurrentMember({ 
                                  raceEvents: newEvents,
                                  ...(idx === 0 ? { raceDistance: parseInt(e.target.value) } : {})
                                });
                              }}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-lg"
                            >
                              <option value={50}>50m</option>
                              <option value={100}>100m</option>
                              <option value={200}>200m</option>
                              <option value={400}>400m</option>
                              <option value={800}>800m</option>
                              <option value={1500}>1500m</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">영법</label>
                            <select
                              value={event.stroke}
                              onChange={(e) => {
                                const newEvents = [...events];
                                newEvents[idx] = { ...newEvents[idx], stroke: e.target.value };
                                updateCurrentMember({ 
                                  raceEvents: newEvents,
                                  ...(idx === 0 ? { raceStroke: e.target.value } : {})
                                });
                              }}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-lg"
                            >
                              <option value="freestyle">자유형</option>
                              <option value="backstroke">배영</option>
                              <option value="breaststroke">평영</option>
                              <option value="butterfly">접영</option>
                              <option value="medley">개인혼영</option>
                            </select>
                          </div>
                        </div>
                        
                        {/* 현재/목표 기록 입력 */}
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">
                              현재 기록 (초) <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              value={event.currentTime || ''}
                              onChange={(e) => {
                                const newEvents = [...events];
                                newEvents[idx] = { ...newEvents[idx], currentTime: parseFloat(e.target.value) || 0 };
                                updateCurrentMember({ 
                                  raceEvents: newEvents,
                                  ...(idx === 0 ? { currentTime: parseFloat(e.target.value) || 0 } : {})
                                });
                              }}
                              placeholder="72.5"
                              className={`w-full px-2 py-1 text-sm border rounded-lg ${
                                !event.currentTime || event.currentTime <= 0 ? 'border-red-300 bg-red-50' : 'border-gray-300'
                              }`}
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">
                              목표 기록 (초) <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              value={event.targetTime || ''}
                              onChange={(e) => {
                                const newEvents = [...events];
                                newEvents[idx] = { ...newEvents[idx], targetTime: parseFloat(e.target.value) || 0 };
                                updateCurrentMember({ 
                                  raceEvents: newEvents,
                                  ...(idx === 0 ? { targetTime: parseFloat(e.target.value) || 0 } : {})
                                });
                              }}
                              placeholder="68.0"
                              className={`w-full px-2 py-1 text-sm border rounded-lg ${
                                !event.targetTime || event.targetTime <= 0 ? 'border-red-300 bg-red-50' : 'border-gray-300'
                              }`}
                            />
                          </div>
                        </div>
                        
                        {/* 🎯 종목별 실현 가능성 분석 */}
                        {event.currentTime > 0 && event.targetTime > 0 && event.targetTime < event.currentTime && currentMember.raceDate && (
                          <div className="mt-2 p-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded border border-blue-200">
                            <FeasibilityChecker
                              currentTime={event.currentTime}
                              targetTime={event.targetTime}
                              raceDate={currentMember.raceDate}
                              distance={event.distance}
                              level={currentMember.memberLevel || 'intermediate'}
                              stroke={event.stroke}
                              css={currentMember.css}
                            />
                          </div>
                        )}
                      </div>
                    ));
                  })()}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">테이퍼링 주수</label>
                  <select
                    value={currentMember.taperWeeks || 2}
                    onChange={(e) => updateCurrentMember({ taperWeeks: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value={1}>1주</option>
                    <option value={2}>2주</option>
                    <option value={3}>3주</option>
                  </select>
                </div>
              </div>

              {/* ✅ 중복 제거: 현재/목표 기록은 각 출전 종목에서 입력 */}
              
              <p className="text-xs text-gray-600 mt-3">
                💡 레이스 플랜은 테이퍼링(경기 전 감량 훈련)을 포함한 대회 준비 프로그램입니다.
              </p>
            </div>
          )}

          {/* 운동 목표 */}
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">🎯 운동 목표</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {goals.map(goal => (
                <button
                  key={goal}
                  onClick={() => updateCurrentMember({ goal })}
                  className={`px-4 py-3 border-2 rounded-lg transition-all ${
                    currentMember.goal === goal
                      ? 'border-purple-500 bg-purple-50 text-purple-700 font-semibold'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  {goal}
                </button>
              ))}
            </div>
          </div>

          {/* 컨디션 선택 (질환/특수상황) */}
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">🏥 컨디션 (질환/특수상황)</h4>
            <p className="text-xs text-gray-600 mb-3">
              해당되는 질환이나 특수상황을 선택하세요
            </p>
            
            <button
              type="button"
              onClick={() => setShowConditionsDrawer(true)}
              className="w-full px-4 py-3 bg-gradient-to-r from-red-50 to-orange-50 hover:from-red-100 hover:to-orange-100 border-2 border-red-300 rounded-lg font-medium text-red-700 transition-all"
            >
              📋 질환/특수상황 모두보기
            </button>
            
            {/* 선택된 컨디션 표시 */}
            {currentMember.conditionIds.length > 0 && (
              <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                <p className="text-xs font-semibold text-red-900 mb-2">
                  선택된 컨디션 ({currentMember.conditionIds.length}개):
                </p>
                <div className="flex flex-wrap gap-2">
                  {currentMember.conditionIds.map((id) => (
                    <span 
                      key={id}
                      className="px-2 py-1 bg-white text-red-700 rounded text-xs border border-red-300 font-medium"
                    >
                      {id}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 일괄 적용 버튼 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-1">
                  💡 현재 설정을 모든 회원에게 적용
                </p>
                <p className="text-xs text-gray-600">
                  시간을 절약하고 싶다면 대표 회원 1명의 설정을 모두에게 적용하세요
                </p>
              </div>
              <Button
                onClick={applyToAll}
                variant="secondary"
                className="ml-4"
              >
                일괄 적용
              </Button>
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className="sticky bottom-0 bg-white border-t p-6">
          <div className="flex items-center justify-between">
            {/* 진행 상태 */}
            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-600">
                진행: {currentMemberIdx + 1} / {members.length}
              </div>
              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 transition-all"
                  style={{ width: `${((currentMemberIdx + 1) / members.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* 네비게이션 버튼 */}
            <div className="flex gap-3">
              {currentMemberIdx > 0 && (
                <Button
                  onClick={() => setCurrentMemberIdx(currentMemberIdx - 1)}
                  variant="ghost"
                >
                  ← 이전
                </Button>
              )}
              {currentMemberIdx < members.length - 1 ? (
                <Button
                  onClick={() => setCurrentMemberIdx(currentMemberIdx + 1)}
                  variant="primary"
                >
                  다음 →
                </Button>
              ) : (
                <>
                  <Button
                    onClick={async () => {
                      // 🔥 각 회원의 설정을 그대로 사용 (독립적으로 유지)
                      const finalMemberVariables = memberVariables.map(mv => ({ ...mv }));
                      
                      console.log('🎯 최종 회원 변수 (✓ 설정 완료 및 저장 버튼):', finalMemberVariables.map(mv => ({
                        name: mv.memberName,
                        programType: mv.programType,
                        raceDate: mv.raceDate,
                        currentTime: mv.currentTime,
                        targetTime: mv.targetTime
                      })));
                      console.log('⚠️ 이 버튼은 프로필만 저장합니다. 프로그램을 생성하려면 "📅 저장 후 주간 계획 생성" 버튼을 클릭하세요.');
                      
                      // 각 회원의 수영 프로필을 API에 저장
                      let savedCount = 0;
                      
                      for (const memberVar of finalMemberVariables) {
                        try {
                          console.log(`💾 ${memberVar.memberName} CSS 저장 시작:`, memberVar.css);
                          
                          // CSS 저장 (강사가 즉시 적용)
                          const cssResponse = await apiClient.put(`/api/users/${memberVar.memberId}/swimming-profile/css`, {
                            css: memberVar.css,
                            updatedByRole: 'instructor',
                            reason: '강사가 CSS를 측정/수정했습니다.'
                          });
                          
                          console.log(`✅ ${memberVar.memberName} CSS 저장 완료:`, cssResponse.data);
                          
                        console.log(`💾 ${memberVar.memberName} 프로필 저장 시작:`, {
                          vo2max: memberVar.vo2max,
                          maxHeartRate: memberVar.maxHeartRate,
                          restingHeartRate: memberVar.restingHeartRate,
                          poolLength: memberVar.poolLength,
                          lastRacePlan: memberVar.programType === 'race' ? '있음' : '없음'
                        });
                          
                        // 나머지 프로필 저장 (강사가 즉시 적용)
                        const profileResponse = await apiClient.put(`/api/users/${memberVar.memberId}/swimming-profile`, {
                          mainStrokes: memberVar.mainStrokes,
                          excludedStrokes: memberVar.excludedStrokes,
                          trainingDays: memberVar.trainingDays,
                          sessionsPerWeek: memberVar.trainingDays.length, // 운동 요일 개수 = 주당 세션 수
                          sessionDuration: memberVar.sessionDuration,
                          poolLength: memberVar.poolLength,
                          currentGoal: memberVar.goal,
                          conditionIds: memberVar.conditionIds,
                          // 🧬 생리학적 지표 저장
                          vo2max: memberVar.vo2max,
                          maxHeartRate: memberVar.maxHeartRate,
                          restingHeartRate: memberVar.restingHeartRate,
                          // 🏆 레이스 플랜 설정 저장 (레이스 모드인 경우)
                          lastRacePlan: memberVar.programType === 'race' ? {
                            raceDate: memberVar.raceDate,
                            raceDistance: memberVar.raceDistance,
                            raceStroke: memberVar.raceStroke,
                            currentTime: memberVar.currentTime,
                            targetTime: memberVar.targetTime,
                            taperWeeks: memberVar.taperWeeks,
                            // 복수 출전 종목 저장
                            raceEvents: memberVar.raceEvents || [],
                            updatedAt: new Date().toISOString()
                          } : undefined,
                          reason: '강사가 회원 프로필을 설정/수정했습니다.'
                        });
                        
                        console.log(`✅ ${memberVar.memberName} 프로필 저장 완료:`, profileResponse.data);
                        
                        savedCount++;
                        console.log(`✅ ${memberVar.memberName} 총 ${savedCount}명 저장 완료`);
                        
                      } catch (error: any) {
                        console.error(`${memberVar.memberName} 프로필 저장 실패:`, error);
                        // 403, 404 오류는 무시하고 계속 진행
                        if (error.response?.status === 403) {
                          console.warn(`${memberVar.memberName}: 권한 부족 (승인 대기 상태로 저장될 수 있음)`);
                        } else if (error.response?.status === 404) {
                          console.warn(`${memberVar.memberName}: 사용자를 찾을 수 없음 (로컬 프로필만 생성됨)`);
                        }
                      }
                    }
                    
                    alert(`${savedCount}/${finalMemberVariables.length}명의 프로필이 저장되었습니다!`);
                    onConfirm(finalMemberVariables);
                  }}
                  variant="primary"
                  className="bg-green-600 hover:bg-green-700"
                >
                  ✓ 설정 완료 및 저장
                </Button>
                  <Button
                    onClick={async () => {
                    // 🔥 각 회원의 설정을 그대로 사용 (독립적으로 유지)
                    const finalMemberVariables = memberVariables.map(mv => ({ ...mv }));
                    
                    // 🔥 레이스 플랜 필수 항목 검증
                    const racePlanMembers = finalMemberVariables.filter(mv => mv.programType === 'race');
                    const invalidRaceMembers = racePlanMembers.filter(mv => 
                      !mv.raceDate || !mv.currentTime || mv.currentTime <= 0 || !mv.targetTime || mv.targetTime <= 0
                    );
                    
                    if (invalidRaceMembers.length > 0) {
                      const errorMsg = invalidRaceMembers.map(mv => {
                        const missing = [];
                        if (!mv.raceDate) missing.push('시합일');
                        if (!mv.currentTime || mv.currentTime <= 0) missing.push('현재 기록');
                        if (!mv.targetTime || mv.targetTime <= 0) missing.push('목표 기록');
                        return `• ${mv.memberName}: ${missing.join(', ')} 미입력`;
                      }).join('\n');
                      
                      alert(`⚠️ 레이스 플랜 필수 항목을 입력해주세요:\n\n${errorMsg}`);
                      return; // 생성 중단
                    }
                    
                    console.log('='.repeat(80));
                    console.log('🎯 최종 회원 변수 (📅 저장 후 주간 계획 생성 버튼):');
                    finalMemberVariables.forEach(mv => {
                      console.log(`  - ${mv.memberName}:`, {
                        programType: mv.programType,
                        raceDate: mv.raceDate,
                        currentTime: mv.currentTime,
                        targetTime: mv.targetTime
                      });
                    });
                    console.log('✅ 각 회원이 자신의 programType대로 프로그램 생성됩니다.');
                    console.log('='.repeat(80));
                    
                    // 각 회원의 수영 프로필을 API에 저장 + 주간 계획 생성
                    let savedCount = 0;
                    
                    for (const memberVar of finalMemberVariables) {
                      try {
                      await apiClient.put(`/api/users/${memberVar.memberId}/swimming-profile/css`, {
                        css: memberVar.css,
                        updatedByRole: 'instructor',
                        reason: '강사가 CSS를 측정/수정했습니다.'
                      });
                      
                      await apiClient.put(`/api/users/${memberVar.memberId}/swimming-profile`, {
                        mainStrokes: memberVar.mainStrokes,
                        excludedStrokes: memberVar.excludedStrokes,
                        trainingDays: memberVar.trainingDays,
                        sessionsPerWeek: memberVar.trainingDays.length, // 운동 요일 개수 = 주당 세션 수
                        sessionDuration: memberVar.sessionDuration,
                        poolLength: memberVar.poolLength,
                        currentGoal: memberVar.goal,
                        conditionIds: memberVar.conditionIds,
                        // 🧬 생리학적 지표 저장
                        vo2max: memberVar.vo2max,
                        maxHeartRate: memberVar.maxHeartRate,
                        restingHeartRate: memberVar.restingHeartRate,
                        reason: '강사가 회원 프로필을 설정/수정했습니다.'
                      });
                        
                        savedCount++;
                      } catch (error: any) {
                        console.error(`❌ ${memberVar.memberName} 프로필 저장 실패:`, error);
                        // 404 오류는 무시하고 계속 진행
                        if (error.response?.status === 404) {
                          console.warn(`⚠️ ${memberVar.memberName}: 사용자를 찾을 수 없음 (로컬 프로필만 생성됨)`);
                          console.warn(`📋 사용자 ID: ${memberVar.memberId}`);
                          console.warn(`💡 이 ID는 데이터베이스에 존재하지 않습니다. 회원이 아직 가입하지 않았거나 삭제되었을 수 있습니다.`);
                        } else if (error.response?.status === 403) {
                          console.warn(`⚠️ ${memberVar.memberName}: 권한 부족 (승인 대기 상태로 저장될 수 있음)`);
                        } else {
                          console.error(`💥 ${memberVar.memberName}: 예상치 못한 오류 (${error.response?.status})`, error.response?.data);
                        }
                      }
                    }
                    
                    alert(`${savedCount}/${finalMemberVariables.length}명의 프로필이 저장되었습니다!\n\n이제 주간 계획을 생성합니다.`);
                    
                    // 주간 계획 생성 신호와 함께 확인
                    onConfirm(finalMemberVariables, true);
                  }}
                  variant="primary"
                  className="bg-purple-600 hover:bg-purple-700 ml-2"
                >
                  📅 저장 후 주간 계획 생성 ({memberVariables.length}명)
                </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* AllConditionsDrawer 팝업 */}
      {showConditionsDrawer && (
        <AllConditionsDrawer
          value={currentMember.conditionIds}
          onChange={(newConditionIds) => {
            updateCurrentMember({ conditionIds: newConditionIds });
          }}
          onClose={() => setShowConditionsDrawer(false)}
        />
      )}
    </>
  );
}

