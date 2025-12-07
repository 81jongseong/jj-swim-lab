/**
 * 🎯 대회 목표 기록 실현 가능성 검증 UI
 * 
 * 기능:
 * - 현재 기록 vs 목표 기록 비교
 * - CSS 기반 과학적 검증
 * - 실시간 피드백 (입력 시 즉시 표시)
 * - 4단계 등급: Feasible / Stretch / Unlikely / Unrealistic
 * 
 * 연동되는 파일:
 * - client/lib/swimlab/raceGoalFeasibility.ts
 * - client/components/swimlab/BulkMemberVariablesModal.tsx
 */

'use client';
import { logger } from '@/lib/logger';

import { useEffect, useState } from 'react';
import { calculateRaceGoalFeasibility, type FeasibilityResult } from '@/lib/swimlab/raceGoalFeasibility';

interface FeasibilityCheckerProps {
  currentTime: number;
  targetTime: number;
  raceDate: string;
  distance: number;
  stroke: string;
  level: string;
  css: Record<string, number>;
}

export default function FeasibilityChecker({
  currentTime,
  targetTime,
  raceDate,
  distance,
  stroke,
  level,
  css
}: FeasibilityCheckerProps) {
  const [result, setResult] = useState<FeasibilityResult | null>(null);

  useEffect(() => {
    try {
      const today = new Date();
      const race = new Date(raceDate);
      const weeks = Math.floor((race.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 7));

      const strokeKey = stroke === 'freestyle' ? '자유형' : 
                        stroke === 'backstroke' ? '배영' :
                        stroke === 'breaststroke' ? '평영' : '접영';

      const swimmerLevel = (level || 'intermediate').includes('beginner') ? 'novice' as const : 
                          ((level || 'intermediate').includes('advanced') || (level || 'intermediate').includes('master') || (level || 'intermediate').includes('expert')) ? 'elite' as const : 
                          'trained' as const;

      logger.info('🎯 실현 가능성 계산 입력:', {
        distance,
        stroke,
        currentTime,
        targetTime,
        weeks,
        css: css[strokeKey] || css['freestyle'] || 0,
        cssType: 'sec_per_100m',
        level: swimmerLevel,
        '🔍 입력 상세': {
          'CSS 전체': css,
          'strokeKey': strokeKey,
          '현재 속도 (m/s)': distance / currentTime,
          '목표 속도 (m/s)': distance / targetTime,
          '기록 개선률 (%)': ((currentTime - targetTime) / currentTime * 100).toFixed(2) + '%'
        }
      });

      const feasibility = calculateRaceGoalFeasibility({
        event: { distance: distance as any, stroke: stroke as any },
        T_now: currentTime,
        T_goal: targetTime,
        weeks,
        CS: css[strokeKey] || css['freestyle'] || 0,
        cssType: 'sec_per_100m',
        level: swimmerLevel
      });

      logger.info('✅ 실현 가능성 결과:', feasibility);
      setResult(feasibility);
    } catch (error) {
      logger.error('실현 가능성 계산 오류:', error);
      setResult(null);
    }
  }, [currentTime, targetTime, raceDate, distance, stroke, level, css]);

  if (!result) return null;

  const gradeColors: Record<string, string> = {
    feasible: 'bg-green-100 text-green-800 border-green-300',
    stretch: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    unlikely: 'bg-orange-100 text-orange-800 border-orange-300',
    unrealistic: 'bg-red-100 text-red-800 border-red-300'
  };

  const gradeIcons: Record<string, string> = {
    feasible: '✅',
    stretch: '⚡',
    unlikely: '⚠️',
    unrealistic: '❌'
  };

  return (
    <div className="space-y-3">
      <h5 className="font-semibold text-gray-900 flex items-center gap-2">
        <span>🎯 목표 실현 가능성 분석</span>
        <span className="text-xs font-normal text-gray-500">(CSS 기반 과학적 검증)</span>
      </h5>
      
      <div className={`p-4 rounded-lg border-2 ${gradeColors[result.grade]}`}>
        <div className="flex items-center justify-between mb-3">
          <span className="font-bold text-base">
            {gradeIcons[result.grade]} {result.message}
          </span>
          <span className="text-sm font-semibold px-3 py-1 bg-white rounded-full">
            신뢰도: {result.confidence.toFixed(1)}%
          </span>
        </div>
        
        <div className="text-sm space-y-2 mb-3">
          <p className="whitespace-pre-line">{result.detailedExplanation}</p>
        </div>

        {result.actionItems && result.actionItems.length > 0 && (
          <div className="mt-3 pt-3 border-t border-current border-opacity-20">
            <p className="text-xs font-semibold mb-2">📋 권장 사항:</p>
            <div className="space-y-1">
              {result.actionItems.map((item: string, idx: number) => (
                <p key={idx} className="text-xs pl-3">• {item}</p>
              ))}
            </div>
          </div>
        )}

        <div className="mt-3 pt-3 border-t border-current border-opacity-20">
          <p className="text-xs font-semibold mb-2">💡 권장 목표 기록 (초 단위):</p>
          <div className="space-y-2 text-xs">
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="font-semibold text-green-800 mb-1">✅ 안전한 목표</p>
              <p className="text-2xl font-bold text-green-700">
                {result.recommendedTarget.conservative.toFixed(1)}초
              </p>
            </div>
            
            <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
              <p className="font-semibold text-orange-800 mb-1">⚡ 도전적 목표</p>
              <p className="text-2xl font-bold text-orange-700">
                {result.recommendedTarget.aggressive.toFixed(1)}초
              </p>
            </div>
            
            <div className="p-2 bg-gray-50 rounded border border-gray-200">
              <p className="text-gray-600">
                현재 입력: <span className="font-semibold">{targetTime.toFixed(1)}초</span>
              </p>
              <p className="text-gray-600">
                개선률: <span className="font-semibold">{((currentTime - targetTime) / currentTime * 100).toFixed(1)}%</span>
              </p>
            </div>
          </div>
        </div>
        
        {result.cssAnalysis && (
          <div className="mt-3 pt-3 border-t border-current border-opacity-20">
            <p className="text-xs font-semibold mb-2">🔬 CSS 분석 (400m+ 전용):</p>
            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-gray-600">현재 CSS:</div>
                <div className="font-semibold">{(100 / result.cssAnalysis.currentCS).toFixed(1)}초/100m</div>
                <div className="text-gray-600">필요 CSS:</div>
                <div className="font-semibold">{(100 / result.cssAnalysis.requiredCS).toFixed(1)}초/100m</div>
              </div>
              
              <p className="text-gray-500 text-[10px] leading-tight mt-2">
                ℹ️ CSS 분석은 400m 이상 장거리에만 표시됩니다. 
                단거리(50-200m)는 기록 개선률 기반 분석이 더 정확합니다.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="text-xs text-gray-500 space-y-1">
        <p>📚 근거: {result.evidenceKeys.slice(0, 2).join(', ')}</p>
      </div>
    </div>
  );
}


