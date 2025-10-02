/**
 * 🏊 SwimLab - 팀 단위 일괄 내보내기
 * 
 * 📋 **파일 목적**
 * - 선수 여러 명의 플랜을 한 번에 .ics로 내보내기
 * - 각 선수의 컨디션을 자동 반영
 * - 파일명에 선수명 포함
 * 
 * 🔄 **주요 기능**
 * - exportWeeklyForAthletes: 팀 주간 계획 일괄 내보내기
 * - exportRaceForAthletes: 팀 레이스 플랜 일괄 내보내기
 * 
 * 💡 **사용 예시**
 * ```typescript
 * const athletes = [athlete1, athlete2, athlete3];
 * exportWeeklyForAthletes(basePlan, athletes);
 * // → Swim_Weekly_민수.ics
 * // → Swim_Weekly_영희.ics
 * // → Swim_Weekly_철수.ics
 * ```
 */

// 실제 프로젝트에서는 planner.ts를 import
// import { buildWeeklyPlan, buildRacePlan, exportPlanToICS } from '@/swimlab/utils/planner';
// 여기서는 모의 구현

import type { AthleteProfile } from '@/lib/swimlab/utils/athletes';

// 모의 타입 정의
type WeeklyPlanInput = {
  startDate: string;
  daysPerWeek: number;
  weeklyMeters: number;
  pool: 25|50;
  stroke: string;
  withTT?: boolean;
  cssPer100?: number;
  conditionIds?: string[];
  skill?: string;
  heightCm?: number;
  anchorMode?: string;
  variancePct?: number;
  methods?: any[];
  drills?: any[];
};

// 모의 구현 (실제로는 planner.ts 사용)
function buildWeeklyPlan(input: any) {
  return { days: [] };
}

function buildRacePlan(input: any) {
  return { weeks: [] };
}

function exportPlanToICS(data: any) {
  return 'BEGIN:VCALENDAR\nVERSION:2.0\nEND:VCALENDAR';
}

/**
 * 팀 주간 계획 일괄 내보내기
 */
export function exportWeeklyForAthletes(base: WeeklyPlanInput, athletes: AthleteProfile[]){
  athletes.forEach(p => {
    const week = buildWeeklyPlan({ 
      ...base, 
      conditionIds: p.conditionIds, 
      cssPer100: p.cssPer100 ?? base.cssPer100, 
      stroke: (p.stroke as any) ?? base.stroke 
    });
    
    const ics = exportPlanToICS([{ week } as any]);
    const blob = new Blob([ics], {type:'text/calendar'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); 
    a.href = url;
    a.download = `Swim_Weekly_${p.name}.ics`; 
    a.click(); 
    setTimeout(() => URL.revokeObjectURL(url), 100);
  });
}

/**
 * 팀 레이스 플랜 일괄 내보내기
 */
export function exportRaceForAthletes(
  base: WeeklyPlanInput & { raceDate: string; taperWeeks?: number }, 
  athletes: AthleteProfile[]
){
  athletes.forEach(p => {
    const rp = buildRacePlan({ 
      ...base, 
      conditionIds: p.conditionIds, 
      cssPer100: p.cssPer100 ?? base.cssPer100, 
      stroke: (p.stroke as any) ?? base.stroke,
      raceTargets: p.raceTargets || [],  // ← 선수별 목표 종목 자동 반영
      rotateEvents: true,
    });
    
    const ics = exportPlanToICS(rp.weeks.map(w => ({ week: w.week }) as any));
    const blob = new Blob([ics], {type:'text/calendar'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); 
    a.href = url;
    a.download = `Swim_Race_${p.name}.ics`; 
    a.click(); 
    setTimeout(() => URL.revokeObjectURL(url), 100);
  });
}

