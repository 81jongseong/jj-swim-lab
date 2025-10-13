/**
 * 🏊 강사용 프로그램 생성 및 실시간 조정 페이지
 * 
 * 핵심 기능:
 * 1. 설명 시간 입력 및 세트별 배분
 * 2. 실시간 프로그램 조정 (페이스/세트 수)
 * 3. 남는 시간 / 초과 시간 표시
 * 
 * 연동되는 데이터:
 * - 강사 정보 (useAuth)
 * - 학생 목록 및 건강 정보
 * - 생성된 프로그램 (engine-v35-time-based)
 * 
 * 연동되는 파일:
 * - client/lib/swimlab/engine-v35-time-based.ts
 * - client/hooks/useAuth.ts
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useauth';
import { useRouter } from 'next/navigation';
import { 
  Clock, 
  Users, 
  Target, 
  Activity, 
  Plus, 
  Minus,
  AlertCircle,
  CheckCircle,
  Edit2,
  Save
} from 'lucide-react';
import { generateTimeBasedProgram } from '@/lib/swimlab/engine-v35-time-based';

interface SetWithExplanation {
  stroke: string;
  zone: string;
  restSec: number;
  rpe: number;
  equipment: string[];
  meters: number;
  desc: string;
  whyPace: string;
  whyRest: string;
  whySet: string;
  explanationMinutes: number; // 강사 설명 시간 (분)
  adjustedPace?: number; // 조정된 페이스 (초)
  adjustedReps?: number; // 조정된 반복 횟수
}

export default function InstructorProgramBuilderPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  // 프로그램 생성 상태
  const [targetMinutes, setTargetMinutes] = useState(60); // 목표 시간
  const [totalExplanationMinutes, setTotalExplanationMinutes] = useState(10); // 총 설명 시간
  const [program, setProgram] = useState<any>(null);
  const [sets, setSets] = useState<SetWithExplanation[]>([]);
  
  // 계산된 시간
  const [actualSwimTime, setActualSwimTime] = useState(0); // 실제 수영 시간
  const [totalExplanationUsed, setTotalExplanationUsed] = useState(0); // 사용된 설명 시간
  const [remainingTime, setRemainingTime] = useState(0); // 남는 시간
  
  // UI 상태
  const [editingSetIndex, setEditingSetIndex] = useState<number | null>(null);

  // 프로그램 생성 (예시)
  const generateProgram = () => {
    // TODO: 실제로는 학생 정보를 선택하고 건강 정보를 가져와야 함
    const generatedProgram = generateTimeBasedProgram({
      targetMinutes: targetMinutes - totalExplanationMinutes, // 설명 시간 제외
      css100: { freestyle: 90, backstroke: 99, breaststroke: 108, butterfly: 99 },
      poolLen: 25,
      goal: '체력 향상',
      level: 'intermediate_1',
      strokesAllowed: ['freestyle'],
      strokesAvoid: [],
      conditionIds: [],
      dayCondition: 'normal',
      weeklyFrequency: 3,
      intensityPercent: 1.0
    });
    
    setProgram(generatedProgram);
    
    // 세트별 설명 시간 자동 배분
    const setsCount = generatedProgram.sets.length;
    const explanationPerSet = Math.floor((totalExplanationMinutes * 60) / setsCount); // 초 단위
    
    const setsWithExplanation: SetWithExplanation[] = generatedProgram.sets.map((set: any, idx: number) => ({
      ...set,
      explanationMinutes: Number((explanationPerSet / 60).toFixed(1))
    }));
    
    setSets(setsWithExplanation);
    calculateTimes(setsWithExplanation);
  };

  // 시간 계산
  const calculateTimes = (currentSets: SetWithExplanation[]) => {
    // 1. 실제 수영 시간
    let swimTime = 0;
    currentSets.forEach(set => {
      const parsed = parseSetDescription(set.desc);
      const reps = set.adjustedReps || parsed.reps;
      const swimSeconds = (parsed.distPerRep / 100) * parsed.pace100m * reps;
      const restSeconds = set.restSec * reps;
      swimTime += (swimSeconds + restSeconds) / 60; // 분 단위
    });
    
    // 2. 총 설명 시간
    const explanationUsed = currentSets.reduce((sum, set) => sum + set.explanationMinutes, 0);
    
    // 3. 남는 시간
    const remaining = targetMinutes - swimTime - explanationUsed;
    
    setActualSwimTime(Math.round(swimTime));
    setTotalExplanationUsed(Math.round(explanationUsed * 10) / 10);
    setRemainingTime(Math.round(remaining * 10) / 10);
  };

  // 세트 설명 파싱
  const parseSetDescription = (desc: string) => {
    const repsMatch = desc.match(/(\d+)×(\d+)m/);
    const paceMatch = desc.match(/@\s*([\d:]+)\/([\d]+)m/);
    
    const reps = repsMatch ? parseInt(repsMatch[1]) : 1;
    const distPerRep = repsMatch ? parseInt(repsMatch[2]) : 100;
    
    let pace100m = 120; // 기본값
    if (paceMatch) {
      const [min, sec] = paceMatch[1].split(':').map(Number);
      const paceSeconds = min * 60 + sec;
      const paceDistance = parseInt(paceMatch[2]);
      pace100m = (paceSeconds / paceDistance) * 100;
    }
    
    return { reps, distPerRep, pace100m };
  };

  // 설명 시간 조정
  const updateExplanationTime = (index: number, minutes: number) => {
    const newSets = [...sets];
    newSets[index].explanationMinutes = minutes;
    setSets(newSets);
    calculateTimes(newSets);
  };

  // 세트 반복 횟수 조정
  const updateSetReps = (index: number, reps: number) => {
    const newSets = [...sets];
    newSets[index].adjustedReps = reps;
    
    // desc 업데이트
    const parsed = parseSetDescription(newSets[index].desc);
    newSets[index].desc = newSets[index].desc.replace(
      /(\d+)×/,
      `${reps}×`
    );
    newSets[index].meters = reps * parsed.distPerRep;
    
    setSets(newSets);
    calculateTimes(newSets);
  };

  if (!user || user.role !== 'instructor') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">강사 전용 페이지입니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">강사용 프로그램 빌더</h1>
          <p className="text-gray-600">설명 시간을 포함한 실시간 프로그램 조정</p>
        </div>

        {/* 1단계: 기본 설정 */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">⚙️ 기본 설정</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                목표 수업 시간 (분)
              </label>
              <input
                type="number"
                value={targetMinutes}
                onChange={(e) => setTargetMinutes(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                총 설명 시간 (분)
              </label>
              <input
                type="number"
                value={totalExplanationMinutes}
                onChange={(e) => setTotalExplanationMinutes(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                세트 전환 시 설명 시간
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                순수 운동 시간
              </label>
              <div className="w-full px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  {targetMinutes - totalExplanationMinutes}분
                </p>
              </div>
            </div>
          </div>
          
          <button
            onClick={generateProgram}
            className="mt-6 w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center"
          >
            <Target className="h-5 w-5 mr-2" />
            프로그램 생성
          </button>
        </div>

        {/* 2단계: 시간 요약 */}
        {program && (
          <>
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl shadow-lg p-6 mb-6">
              <h2 className="text-2xl font-bold mb-4">⏰ 시간 요약</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                  <p className="text-xs text-white/80 mb-1">목표 시간</p>
                  <p className="text-3xl font-bold">{targetMinutes}분</p>
                </div>
                
                <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                  <p className="text-xs text-white/80 mb-1">수영 시간</p>
                  <p className="text-3xl font-bold">{actualSwimTime}분</p>
                </div>
                
                <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                  <p className="text-xs text-white/80 mb-1">설명 시간</p>
                  <p className="text-3xl font-bold">{totalExplanationUsed}분</p>
                </div>
                
                <div className={`backdrop-blur rounded-lg p-4 ${
                  remainingTime >= 0 
                    ? 'bg-green-500/30 border-2 border-green-300' 
                    : 'bg-red-500/30 border-2 border-red-300'
                }`}>
                  <p className="text-xs text-white/80 mb-1">
                    {remainingTime >= 0 ? '남는 시간' : '초과 시간'}
                  </p>
                  <p className="text-3xl font-bold">
                    {remainingTime >= 0 ? '+' : ''}{remainingTime}분
                  </p>
                </div>
              </div>
              
              {/* 경고 메시지 */}
              {remainingTime < 0 && (
                <div className="mt-4 bg-red-500 text-white rounded-lg p-3 flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-bold">⚠️ 시간 초과</p>
                    <p className="text-sm">세트 수를 줄이거나 페이스를 빠르게 조정해주세요.</p>
                  </div>
                </div>
              )}
              
              {remainingTime > 5 && (
                <div className="mt-4 bg-yellow-500 text-white rounded-lg p-3 flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-bold">💡 시간 여유</p>
                    <p className="text-sm">세트 수를 늘리거나 설명 시간을 추가할 수 있습니다.</p>
                  </div>
                </div>
              )}
              
              {Math.abs(remainingTime) <= 2 && (
                <div className="mt-4 bg-green-500 text-white rounded-lg p-3 flex items-start">
                  <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-bold">✅ 완벽한 시간 배분</p>
                    <p className="text-sm">목표 시간에 정확히 맞춰졌습니다!</p>
                  </div>
                </div>
              )}
            </div>

            {/* 3단계: 세트별 조정 */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">📋 세트별 조정</h2>
              
              <div className="space-y-4">
                {sets.map((set, index) => {
                  const parsed = parseSetDescription(set.desc);
                  const currentReps = set.adjustedReps || parsed.reps;
                  const isEditing = editingSetIndex === index;
                  
                  return (
                    <div 
                      key={index}
                      className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-300 transition"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded">
                              세트 {index + 1}
                            </span>
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded">
                              {set.zone}
                            </span>
                          </div>
                          <p className="text-lg font-semibold text-gray-900 mb-1">
                            {set.desc}
                          </p>
                          <p className="text-sm text-gray-600">
                            {set.whySet}
                          </p>
                        </div>
                        
                        <button
                          onClick={() => setEditingSetIndex(isEditing ? null : index)}
                          className="ml-4 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          {isEditing ? <Save className="h-5 w-5" /> : <Edit2 className="h-5 w-5" />}
                        </button>
                      </div>
                      
                      {isEditing && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
                          {/* 반복 횟수 조정 */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-2">
                              반복 횟수
                            </label>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateSetReps(index, Math.max(1, currentReps - 1))}
                                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="text-2xl font-bold text-gray-900 w-12 text-center">
                                {currentReps}
                              </span>
                              <button
                                onClick={() => updateSetReps(index, currentReps + 1)}
                                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          
                          {/* 설명 시간 조정 */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-2">
                              설명 시간 (분)
                            </label>
                            <input
                              type="number"
                              step="0.5"
                              min="0"
                              max={totalExplanationMinutes}
                              value={set.explanationMinutes}
                              onChange={(e) => updateExplanationTime(index, Number(e.target.value))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          
                          {/* 총 소요 시간 */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-2">
                              세트 총 시간
                            </label>
                            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                              <p className="text-lg font-bold text-gray-900">
                                {(() => {
                                  const swimSec = (parsed.distPerRep / 100) * parsed.pace100m * currentReps;
                                  const restSec = set.restSec * currentReps;
                                  const totalSec = swimSec + restSec + (set.explanationMinutes * 60);
                                  return (totalSec / 60).toFixed(1);
                                })()}분
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* 요약 정보 */}
                      <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mt-3 text-sm">
                        <div>
                          <p className="text-xs text-gray-500">거리</p>
                          <p className="font-semibold text-gray-900">{set.meters}m</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">휴식</p>
                          <p className="font-semibold text-gray-900">{set.restSec}″</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">RPE</p>
                          <p className="font-semibold text-gray-900">{set.rpe}/10</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">설명</p>
                          <p className="font-semibold text-blue-600">{set.explanationMinutes}분</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">장비</p>
                          <p className="font-semibold text-gray-900">
                            {set.equipment.length > 0 ? set.equipment.join(', ') : '없음'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* 설명 시간 검증 */}
              {totalExplanationUsed > totalExplanationMinutes && (
                <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-red-800">⚠️ 설명 시간 초과</p>
                    <p className="text-sm text-red-700">
                      현재 {totalExplanationUsed}분, 목표 {totalExplanationMinutes}분
                      → {(totalExplanationUsed - totalExplanationMinutes).toFixed(1)}분 초과
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 4단계: 저장 및 내보내기 */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">💾 프로그램 저장</h2>
              
              <div className="flex gap-3">
                <button
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center"
                  disabled={remainingTime < 0 || totalExplanationUsed > totalExplanationMinutes}
                >
                  <Save className="h-5 w-5 mr-2" />
                  프로그램 저장
                </button>
                
                <button
                  className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center justify-center"
                >
                  <Activity className="h-5 w-5 mr-2" />
                  학생에게 전송
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// 헬퍼 함수 (컴포넌트 외부)
function parseSetDescription(desc: string) {
  const repsMatch = desc.match(/(\d+)×(\d+)m/);
  const paceMatch = desc.match(/@\s*([\d:]+)\/([\d]+)m/);
  
  const reps = repsMatch ? parseInt(repsMatch[1]) : 1;
  const distPerRep = repsMatch ? parseInt(repsMatch[2]) : 100;
  
  let pace100m = 120; // 기본값
  if (paceMatch) {
    const [min, sec] = paceMatch[1].split(':').map(Number);
    const paceSeconds = min * 60 + sec;
    const paceDistance = parseInt(paceMatch[2]);
    pace100m = (paceSeconds / paceDistance) * 100;
  }
  
  return { reps, distPerRep, pace100m };
}

