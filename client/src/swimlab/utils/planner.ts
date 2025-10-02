/**
 * SwimLab Data Pack v4 - 주간/월간/대회 타임라인 계획 유틸
 * 
 * 주간 템플릿, 대회 역산 매크로사이클
 * 
 * 관련 파일:
 * - client/src/swimlab/utils/storage.ts
 * - client/src/swimlab/components/Planner.tsx
 */

import type { SwimSession } from './storage';

export type WeekPreset = 'Base'|'Build'|'Peak'|'Taper'|'Recovery';
export type Availability = { mon?:boolean; tue?:boolean; wed?:boolean; thu?:boolean; fri?:boolean; sat?:boolean; sun?:boolean };
export type AnchorMode = 'none'|'soft'|'hard'; // Q2: 앵커 모드
export type RaceTarget = { event: '50FR'|'100FR'|'200FR'|'400FR'|'100BK'|'200BK'|'100BR'|'200BR'|'100FL'|'200FL'; targetSec: number }; // 대회 목표

export type PlanSpec = {
  date: string; // YYYY-MM-DD
  goal: SwimSession['goal'];
  meters: number;
  pool: 25|50;
  stroke: SwimSession['stroke'];
  conditionIds?: string;
};

// 요일 유틸
const addDays = (s: string, n: number)=> {
  const d=new Date(s+'T00:00:00'); d.setDate(d.getDate()+n);
  return d.toISOString().slice(0,10);
};

// Q2: 간단한 시드 RNG (주차 고유 변주 재현성)
function hashSeed(s: string){ let h=0; for (let i=0;i<s.length;i++) h=(h*31 + s.charCodeAt(i))|0; return h>>>0; }
function rng(seed:number){ let x=seed||123456789; return ()=> (x = (x*1664525 + 1013904223)>>>0) / 2**32; }

// Q2: 요일-테마 배치 (앵커 모드 + 변주율)
function assignDayThemes(sessions:number, mode:AnchorMode, variancePct:number, startDate:string): SwimSession['goal'][] {
  const hard = ['Endurance','Technique','Tempo','Speed','Endurance','Recovery','Race'] as SwimSession['goal'][];
  // 기본 템플릿(세션 수만큼 슬라이스)
  let base = hard.slice(0, sessions);

  if (mode === 'none') {
    // 혼합(랜덤) — Endurance/Technique 가중치 조금 더
    const bag: SwimSession['goal'][] = ['Endurance','Endurance','Technique','Tempo','Speed','Recovery','Race'];
    const R = rng(hashSeed(startDate));
    return Array.from({length:sessions},()=> bag[Math.floor(R()*bag.length)]);
  }

  if (mode === 'hard') return base;

  // soft: base를 유지하되 일부 스왑/치환
  const R = rng(hashSeed(startDate));
  const swaps = Math.max(1, Math.round(sessions * (variancePct/100) * 0.6)); // 변주 강도
  for (let k=0;k<swaps;k++){
    const i = Math.floor(R()*sessions), j = Math.floor(R()*sessions);
    [base[i], base[j]] = [base[j], base[i]];
  }
  // 가끔(변주율의 절반 확률) 동일 계열 치환(Endurance↔Technique, Tempo↔Speed)
  if (R() < (variancePct/200)) {
    const map: Record<SwimSession['goal'], SwimSession['goal']> = { 
      Endurance:'Technique', Technique:'Endurance', Tempo:'Speed', Speed:'Tempo', 
      Race:'Race', Recovery:'Recovery', OpenWater:'OpenWater', Rehab:'Rehab' 
    };
    const idx = Math.floor(R()*sessions);
    base[idx] = map[base[idx]];
  }
  return base;
}

// 주간 템플릿 비율(대략값)
const TEMPLATE: Record<WeekPreset, { goals: SwimSession['goal'][]; vol: number[] }> = {
  Base:   { goals:['Technique','Endurance','Tempo','Endurance','Recovery','Endurance','Recovery'], vol:[0.7,1.0,1.0,1.2,0.6,1.0,0.5] },
  Build:  { goals:['Technique','Endurance','Tempo','Endurance','Speed','Endurance','Recovery'],  vol:[0.7,1.2,1.1,1.3,1.0,1.1,0.6] },
  Peak:   { goals:['Technique','Tempo','Race','Endurance','Speed','Race','Recovery'],             vol:[0.6,1.1,1.1,1.0,1.0,1.0,0.5] },
  Taper:  { goals:['Technique','Tempo','Race','Recovery','Speed','Race','Recovery'],              vol:[0.5,0.8,0.9,0.5,0.7,0.8,0.4] },
  Recovery:{goals:['Recovery','Technique','Endurance','Recovery','Technique','Endurance','Recovery'], vol:[0.5,0.6,0.8,0.5,0.6,0.8,0.5] },
};

// Q2: 주간 계획 생성 (앵커 모드 + 변주율)
export function generateWeekSpecs(params: {
  startDate: string; // 월요일
  baseMeters: number; // 하루 기준량(예 2000)
  pool: 25|50;
  stroke: SwimSession['stroke'];
  availability?: Availability;
  preset?: WeekPreset;
  conditionIds?: string;
  anchorMode?: AnchorMode;  // Q2: 앵커 모드
  variancePct?: number;      // Q2: 변주율 (0~40 권장)
}) {
  const { startDate, baseMeters, pool, stroke, availability, preset='Build', conditionIds, anchorMode='soft', variancePct=20 } = params;
  const days = ['mon','tue','wed','thu','fri','sat','sun'] as const;
  const tmpl = TEMPLATE[preset];
  
  // 활성 요일 수 계산
  const activeDays = days.filter((_, i) => !availability || (availability as any)[days[i]] !== false).length;
  
  // Q2: 앵커 모드로 테마 배치
  const dayGoals = assignDayThemes(activeDays, anchorMode, variancePct, startDate);
  
  const specs: PlanSpec[] = [];
  let dayIdx = 0;

  for (let i=0;i<7;i++){
    const on = !availability || (availability as any)[days[i]] !== false;
    if (!on) continue;
    
    const goal = dayGoals[dayIdx] || tmpl.goals[i];
    specs.push({
      date: addDays(startDate, i),
      goal,
      meters: Math.round(baseMeters * tmpl.vol[i] / pool) * pool,
      pool, stroke, conditionIds
    });
    dayIdx++;
  }
  return specs;
}

// 대회까지 주 차 계산 → 단계(Preset) 맵핑
export function macrocycleToRace(params: {
  startMonday: string; // 시작 주의 월요일
  raceDate: string;    // YYYY-MM-DD
}) {
  const { startMonday, raceDate } = params;
  const s = new Date(startMonday+'T00:00:00');
  const r = new Date(raceDate+'T00:00:00');
  const diffDays = Math.max(0, Math.round((+r - +s)/86400000));
  const weeks = Math.ceil(diffDays/7);
  const stages: WeekPreset[] = [];

  // 간단한 분배: Base(4) → Build(4) → Peak(2) → Taper(1)
  for (let i=0;i<weeks;i++){
    if (i < Math.max(1, Math.floor(weeks*0.4))) stages.push('Base');
    else if (i < Math.max(1, Math.floor(weeks*0.8))) stages.push('Build');
    else if (i < weeks-1) stages.push('Peak');
    else stages.push('Taper');
  }
  return { weeks, stages };
}

// Q3: 대회 목표 기록 → 메인세트 템플릿
export function raceMainTemplate(target: RaceTarget, cssPer100?: number) {
  const eventNum = parseInt(target.event.replace(/[A-Z]/g, ''));
  const map: Record<string, { rep:number; dist:number; zone: 'Z4'|'Z5'; rest:number }> = {
    '50':  { rep: 8,  dist: 25,  zone:'Z5', rest: 90 },
    '100': { rep: 6,  dist: 50,  zone:'Z5', rest: 120 },
    '200': { rep: 5,  dist: 100, zone:'Z4', rest: 45 },
    '400': { rep: 4,  dist: 200, zone:'Z4', rest: 30 },
  };
  const t = map[eventNum.toString()] || { rep: 4, dist: 100, zone: 'Z4' as const, rest: 30 };
  const tgtPer100 = cssPer100 
    ? Math.min(cssPer100-5, target.targetSec/(eventNum/100)) 
    : target.targetSec/(eventNum/100);
  return { ...t, tgtPer100: Math.round(tgtPer100), event: target.event };
}

// .ics 생성 (캘린더 내보내기)
export function generateICS(sessions: SwimSession[]) {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SwimLab//Planner//EN',
    'CALSCALE:GREGORIAN',
  ];
  
  sessions.forEach(s => {
    const dtstart = s.date.replace(/-/g, '') + 'T060000'; // 06:00 AM
    const dtend = s.date.replace(/-/g, '') + 'T073000';   // 07:30 AM (90분 가정)
    const uid = `${s.id}@swimlab.local`;
    const summary = `🏊 ${s.title}`;
    const desc = `Goal: ${s.goal}\\nMeters: ${s.meters}\\nPool: ${s.pool}m\\nStroke: ${s.stroke}${s.conditionIds?'\\nConditions: '+s.conditionIds:''}`;
    
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${uid}`);
    lines.push(`DTSTART:${dtstart}`);
    lines.push(`DTEND:${dtend}`);
    lines.push(`SUMMARY:${summary}`);
    lines.push(`DESCRIPTION:${desc}`);
    lines.push('END:VEVENT');
  });
  
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

