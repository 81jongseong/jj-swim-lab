/**
 * JJ Swim Lab: 프로그램 생성기 UI
 * 사용자 입력을 받고 결과를 세션 카드로 표시
 */

'use client';

import React, { useState } from 'react';
import { buildWeek, getSafetyCaps, TRAINING_METHODS, DRILLS } from '../swim-training-engine/src';

interface SwimInput {
  goal: 'fatloss' | 'endurance' | 'performance';
  poolLength: 25 | 50;
  daysPerWeek: number;
  sessionMinutes: number;
  cssPace: number;
  stroke: 'FR' | 'BK' | 'BR' | 'FL' | 'IM';
  age?: number;
  sex?: 'M' | 'F';
  health: {
    hypertension: boolean;
    obesity: boolean;
    diabetes: boolean;
    dyslipidemia: boolean;
    pregnancy: boolean;
    asthma: boolean;
    jointConditions: string[];
  };
}

export default function PlannerForm({ onPlanGenerated }: { onPlanGenerated?: (plan: any) => void }) {
  const [input, setInput] = useState<SwimInput>({
    goal: 'endurance',
    poolLength: 25,
    daysPerWeek: 3,
    sessionMinutes: 45,
    cssPace: 95,
    stroke: 'FR',
    health: {
      hypertension: false,
      obesity: false,
      diabetes: false,
      dyslipidemia: false,
      pregnancy: false,
      asthma: false,
      jointConditions: []
    }
  });

  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const swimInput = {
        demographics: {
          age: input.age || 30,
          sex: (input.sex || 'M') as 'M' | 'F'
        },
        goal: input.goal,
        avail: {
          pool: input.poolLength,
          daysPerWeek: input.daysPerWeek,
          sessionMinutes: input.sessionMinutes
        },
        health: input.health,
        technique: {},
        pace: {
          cssSecPer100: input.cssPace
        },
        stroke: input.stroke
      };

      const weekPlan = buildWeek(swimInput as any);
      setPlan(weekPlan);
      if (onPlanGenerated) {
        onPlanGenerated(weekPlan);
      }
    } catch (error) {
      console.error('Plan generation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPace = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}/100m`;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-center mb-8 text-blue-600">
          JJ Swim Lab: 건강·질환·기술 기반 수영 프로그램 생성기
        </h1>

        {/* 입력 폼 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* 기본 정보 */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">기본 정보</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">운동 목표</label>
              <select
                value={input.goal}
                onChange={(e) => setInput({...input, goal: e.target.value as any})}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="fatloss">체중 감량</option>
                <option value="endurance">체력 증진</option>
                <option value="performance">기록 향상</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">풀 길이</label>
              <select
                value={input.poolLength}
                onChange={(e) => setInput({...input, poolLength: parseInt(e.target.value) as 25 | 50})}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value={25}>25m</option>
                <option value={50}>50m</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">주간 운동 횟수</label>
              <input
                type="number"
                min="1"
                max="7"
                value={input.daysPerWeek}
                onChange={(e) => setInput({...input, daysPerWeek: parseInt(e.target.value)})}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">1회 운동 시간 (분)</label>
              <input
                type="number"
                min="30"
                max="120"
                value={input.sessionMinutes}
                onChange={(e) => setInput({...input, sessionMinutes: parseInt(e.target.value)})}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CSS 페이스 (초/100m)</label>
              <input
                type="number"
                min="60"
                max="180"
                value={input.cssPace}
                onChange={(e) => setInput({...input, cssPace: parseInt(e.target.value)})}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                현재: {formatPace(input.cssPace)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">주 영법</label>
              <select
                value={input.stroke}
                onChange={(e) => setInput({...input, stroke: e.target.value as any})}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="FR">자유형</option>
                <option value="BK">배영</option>
                <option value="BR">평영</option>
                <option value="FL">접영</option>
                <option value="IM">개인혼영</option>
              </select>
            </div>
          </div>

          {/* 건강 정보 */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">건강 정보</h2>
            
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={input.health.hypertension}
                  onChange={(e) => setInput({
                    ...input,
                    health: {...input.health, hypertension: e.target.checked}
                  })}
                  className="mr-2"
                />
                고혈압
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={input.health.obesity}
                  onChange={(e) => setInput({
                    ...input,
                    health: {...input.health, obesity: e.target.checked}
                  })}
                  className="mr-2"
                />
                비만
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={input.health.diabetes}
                  onChange={(e) => setInput({
                    ...input,
                    health: {...input.health, diabetes: e.target.checked}
                  })}
                  className="mr-2"
                />
                당뇨
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={input.health.dyslipidemia}
                  onChange={(e) => setInput({
                    ...input,
                    health: {...input.health, dyslipidemia: e.target.checked}
                  })}
                  className="mr-2"
                />
                고지혈증
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={input.health.pregnancy}
                  onChange={(e) => setInput({
                    ...input,
                    health: {...input.health, pregnancy: e.target.checked}
                  })}
                  className="mr-2"
                />
                임신
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={input.health.asthma}
                  onChange={(e) => setInput({
                    ...input,
                    health: {...input.health, asthma: e.target.checked}
                  })}
                  className="mr-2"
                />
                천식
              </label>
            </div>
          </div>
        </div>

        {/* 생성 버튼 */}
        <div className="text-center mb-8">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors"
          >
            {loading ? '프로그램 생성 중...' : '프로그램 생성'}
          </button>
        </div>

        {/* 결과 표시 */}
        {plan && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center text-gray-800">생성된 주간 프로그램</h2>
            
            {/* 요약 정보 */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2">주간 요약</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">총 거리:</span>
                  <br />
                  {plan.summary.totalMeters.toLocaleString()}m
                </div>
                <div>
                  <span className="font-medium">세션 수:</span>
                  <br />
                  {plan.summary.sessions}회
                </div>
                <div>
                  <span className="font-medium">Z1 (회복):</span>
                  <br />
                  {plan.summary.zoneDist.Z1}m
                </div>
                <div>
                  <span className="font-medium">Z2 (기초):</span>
                  <br />
                  {plan.summary.zoneDist.Z2}m
                </div>
                <div>
                  <span className="font-medium">Z3 (임계):</span>
                  <br />
                  {plan.summary.zoneDist.Z3}m
                </div>
                <div>
                  <span className="font-medium">Z4 (고강도):</span>
                  <br />
                  {plan.summary.zoneDist.Z4}m
                </div>
                <div>
                  <span className="font-medium">Z5 (스프린트):</span>
                  <br />
                  {plan.summary.zoneDist.Z5}m
                </div>
              </div>
            </div>

            {/* 세션 카드들 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plan.sessions.map((session: any, index: number) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <h3 className="text-lg font-semibold mb-2">Day {session.dayIndex + 1}</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    총 {session.totalMeters}m
                  </p>
                  
                  <div className="space-y-2">
                    {session.sets.map((set: any, setIndex: number) => (
                      <div key={setIndex} className="bg-gray-50 rounded p-2 text-sm">
                        <div className="font-medium">{set.label}</div>
                        <div>{set.reps} × {set.distance}m</div>
                        <div className="text-blue-600">{set.paceNote}</div>
                        <div className="text-gray-500">휴식: {set.restSec}초</div>
                        {set.cues && set.cues.length > 0 && (
                          <div className="text-green-600 text-xs mt-1">
                            💡 {set.cues.join(', ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {session.safetyBadges && session.safetyBadges.length > 0 && (
                    <div className="mt-3">
                      {session.safetyBadges.map((badge: string, badgeIndex: number) => (
                        <span key={badgeIndex} className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded mr-1 mb-1">
                          ⚠️ {badge}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 훈련법 및 드릴 정보 */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3 text-green-800">사용 가능한 훈련법 ({TRAINING_METHODS.length}가지)</h3>
            <div className="space-y-1 text-sm">
              {TRAINING_METHODS.slice(0, 5).map((method) => (
                <div key={method.id} className="text-green-700">
                  • {method.name}: {method.definition}
                </div>
              ))}
              <div className="text-green-600 font-medium">... 및 {TRAINING_METHODS.length - 5}가지 더</div>
            </div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3 text-purple-800">사용 가능한 드릴 ({DRILLS.length}가지)</h3>
            <div className="space-y-1 text-sm">
              {DRILLS.slice(0, 5).map((drill) => (
                <div key={drill.id} className="text-purple-700">
                  • {drill.name}: {drill.helps.join(', ')}
                </div>
              ))}
              <div className="text-purple-600 font-medium">... 및 {DRILLS.length - 5}가지 더</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}