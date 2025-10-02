/**
 * SwimLab Data Pack v4 - 프로그램 엔진 + Q2: 영법별 SPL + TT 비프 시뮬레이션 + Q3: 다중 조건
 * 
 * PR 파서, CSS 추정, Zone→휴식, SPL 자동 추정(영법), TT 비프, 다중 조건 병합
 * 
 * 관련 파일:
 * - client/src/swimlab/utils/catalog.ts
 * - client/src/swimlab/utils/rules.ts
 * - client/src/swimlab/utils/rules_multi.ts
 * - client/src/swimlab/data/trainingMethods.ts
 * - client/src/swimlab/data/drills.ts
 */

import type { TrainingMethod, Drill } from './catalog';
import { applyRulesMulti } from './rules_multi';

export type Zone = 'Z1'|'Z2'|'Z3'|'Z4'|'Z5';
export const REST_BY_ZONE: Record<Zone, number | [number, number]> = {
  Z1: 10, Z2: 15, Z3: 20, Z4: [30, 40], Z5: 60,
};

export type Stroke = 'FR'|'BK'|'BR'|'FL';
export type SkillLevel = 'Beginner'|'Intermediate'|'Advanced';

// ---------- PR 파서 & CSS 추정 ----------
export type PRRecord = { dist: number; secs: number };

function parseTimeToSec(s: string) {
  const t = s.trim();
  if (/^\d+(\.\d+)?$/.test(t)) return parseFloat(t);
  const m = t.match(/(?:(\d+):)?(\d+)(?:\.(\d+))?/);
  if (!m) return NaN;
  const min = m[1] ? parseInt(m[1]) : 0;
  const sec = parseInt(m[2]);
  const ms  = m[3] ? parseInt(m[3]) : 0;
  return min*60 + sec + (ms/10 ** m[3]?.length || 0);
}
export function parsePRText(raw: string): PRRecord[] {
  return raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean).map(line => {
    const m = line.match(/(\d+)\D+([\d:.\w]+)/);
    if (!m) return null as any;
    const dist = parseInt(m[1]);
    const secs = parseTimeToSec(m[2]);
    return Number.isFinite(secs) ? { dist, secs } : null;
  }).filter((x): x is PRRecord => !!x);
}
export function estimateCSSFromPRs(prs: PRRecord[]): number | undefined {
  const by = (d: number) => prs.find(x => x.dist === d)?.secs;
  if (by(200) && by(400)) return (by(400)! - by(200)!) / 2;
  if (by(100) && by(200)) return Math.max((by(200)! - by(100)!), by(100)!*0.9);
  if (by(400) && by(800)) return (by(800)! - by(400)!) / 4;
  return undefined;
}

// ---------- 페이스 & 휴식 ----------
export function paceForZone(cssPer100: number, z: Zone) {
  const map: Record<Zone, [number, number]> = {
    Z1: [20, 30], Z2: [10, 20], Z3: [0, 10], Z4: [-5, 0], Z5: [-10, -5],
  };
  const [lo, hi] = map[z];
  const offset = (lo + hi) / 2;
  return Math.max(1, cssPer100 + offset); // sec/100
}
function scaleRestForDistance(base: number|[number,number], dist: number) {
  const factor = dist >= 100 ? 1 : dist >= 50 ? 0.7 : 0.5;
  if (Array.isArray(base)) return [Math.round(base[0]*factor), Math.round(base[1]*factor)] as [number,number];
  return Math.round(base * factor);
}

// ---------- Q2: SPL/Tempo & TT ----------
export function estimateTargetSPL25(params: {
  heightCm?: number;
  skill?: SkillLevel;
  goal?: 'Endurance'|'Tempo'|'Speed'|'Race'|'Technique'|'OpenWater'|'Rehab'|'Recovery';
  cssPer100?: number; // sec/100
  stroke?: Stroke;
}) {
  const { heightCm, skill='Intermediate', goal='Endurance', cssPer100, stroke='FR' } = params || {};
  let base = skill === 'Beginner' ? 20 : skill === 'Advanced' ? 16 : 18;
  if (heightCm) base += Math.round((175 - heightCm) / 10);
  if (goal === 'Technique' || goal === 'Rehab' || goal === 'Recovery') base -= 1;
  if (goal === 'Speed' || goal === 'Race') base += 1;
  if (cssPer100) { if (cssPer100 < 90) base += 1; else if (cssPer100 > 110) base -= 1; }
  const strokeAdj: Record<Stroke, number> = { FR:0, BK:+1, BR:-6, FL:-2 };
  base += strokeAdj[stroke];
  if (stroke==='BR' && skill==='Beginner') base += 2; // 평영 초보 보정 완화
  return Math.max(10, Math.min(28, base));
}

export function tempoTrainerRange(params: {
  stroke: Stroke; zone: Zone; cssPer100?: number; targetSPL25?: number;
}) {
  const { stroke, zone, cssPer100, targetSPL25 } = params;
  const centerByStroke: Record<Stroke, number> = { FR:1.0, BK:1.05, BR:1.4, FL:1.0 };
  const zoneScale: Record<Zone, number> = { Z1:1.15, Z2:1.08, Z3:1.0, Z4:0.92, Z5:0.85 };
  let center = centerByStroke[stroke] * zoneScale[zone];
  if (cssPer100) { if (cssPer100 < 90) center *= 0.95; else if (cssPer100 > 110) center *= 1.05; }
  if (typeof targetSPL25 === 'number') {
    const delta = targetSPL25 - 18;
    center *= (1 - delta * 0.01);
  }
  const low = Math.max(0.45, +(center * 0.92).toFixed(2));
  const high = Math.min(2.00, +(center * 1.08).toFixed(2));
  return { low, high, center: +center.toFixed(2) };
}

// Q2: TT 비프 시뮬레이션(1회 반복 기준)
// - repDist: 반복 거리(예: 50, 100)
// - pool: 25/50
// - stroke/zone/css/spl 기반으로 비프 개수와 meter 위치를 추정
export function simulateTT({
  repDist, pool, stroke='FR', zone='Z3' as Zone,
  cssPer100, targetSPL25,
}: {
  repDist: number; pool: 25|50; stroke?: Stroke; zone?: Zone;
  cssPer100?: number; targetSPL25?: number;
}) {
  const spl = targetSPL25 ?? estimateTargetSPL25({ stroke, cssPer100 });
  const per100 = cssPer100 ?? 100; // 미지정 시 임시값
  const repSec = per100 * (repDist/100);
  const strokes = Math.max(1, Math.round(spl * (repDist/25)));
  const tempo = repSec / strokes;

  // 각 비프의 대략적인 meter 위치(균등 분배, 초보용)
  const metersPerBeep = repDist / strokes;
  const beeps = Array.from({length: strokes}, (_,i)=>({
    n: i+1,
    meter: Math.round((i+1) * metersPerBeep),
    cue: i===0 ? '스트림라인·첫 입수' :
         (i<3 ? '롱 글라이드 유지' :
         (i>=strokes-2 ? '피니시 킥 업·헤드 안정' : '리듬 유지')),
  }));

  // 코칭 포인트(간단)
  const tips = [
    `초반 1~3비프: 과도한 글라이드 금지, 헤드 정렬`,
    `중반: 일정 리듬(Tempo ≈ ${tempo.toFixed(2)}s/st), 캐치 타이밍 고정`,
    `마지막 2비프: 킥 강도 +10~15%, 시선·호흡 간결`,
  ];

  // 권장 TT 범위
  const tt = tempoTrainerRange({ stroke, zone, cssPer100, targetSPL25: spl });

  return {
    strokes, tempo: +tempo.toFixed(2),
    metersPerBeep: +metersPerBeep.toFixed(1),
    beeps, tips, tt
  };
}

// 세트 문자열에 주석(페이스/휴식/SPL/Tempo/TT범위) 붙이기
function annotateSet(
  base: string, z: Zone, repDist: number, pool: 25|50,
  stroke: Stroke, cssPer100?: number, targetSPL25?: number, withTT=false
) {
  const restBase = REST_BY_ZONE[z];
  const rest = scaleRestForDistance(restBase, repDist);
  const restStr = Array.isArray(rest) ? `${rest[0]}–${rest[1]}″` : `${rest}″`;

  let paceStr = '';
  let hint = '';
  if (cssPer100 && targetSPL25) {
    const per100 = paceForZone(cssPer100, z);
    const perRep = per100 * (repDist / 100);
    const fmt = (s:number)=>`${Math.floor(s/60)}:${String(Math.round(s%60)).padStart(2,'0')}`;
    paceStr = ` @~${fmt(perRep)} per ${repDist}m`;

    const sim = simulateTT({ repDist, pool, stroke, zone: z, cssPer100: per100, targetSPL25 });
    hint = ` · SPL≈${sim.strokes}, Tempo≈${sim.tempo}s/st, TT≈${sim.tt.low}–${sim.tt.high}s (ctr ${sim.tt.center})`;
    if (withTT) {
      const seq = sim.beeps.slice(0, Math.min(8, sim.beeps.length)) // UI 과밀 방지
        .map(b=>`#${b.n}@${b.meter}m`).join(', ');
      hint += ` · Beeps: ${seq}${sim.beeps.length>8?'…':''}`;
    }
  }
  return `${base}${paceStr}, r ${restStr}${hint}`;
}

// ---------- 프로그램 엔진 ----------
export type Goal = 'Endurance'|'Tempo'|'Speed'|'Race'|'Technique'|'OpenWater'|'Rehab'|'Recovery';
export type ProgramBlock = { name: string; items: string[]; meters: number };
export type ProgramPlan = { WU: ProgramBlock[]; PRE: ProgramBlock[]; MAIN: ProgramBlock[]; CD: ProgramBlock[]; totalMeters: number; notes?: string[] };

type EngineOpts = {
  methods: ReadonlyArray<TrainingMethod>;
  drills: ReadonlyArray<Drill>;
  goal: Goal;
  targetMeters: number;
  pool: 25|50;
  stroke?: Stroke;                // FR/BK/BR/FL
  cssPer100?: number;             // sec/100
  conditionIds?: string | string[];  // Q3: 하나 또는 다중(쉼표/스페이스 허용)
  targetSPL25?: number;           // 없으면 자동 추정
  heightCm?: number;
  skill?: SkillLevel;
  withTT?: boolean;               // Q2: TT 비프 시퀀스 표시
};

const GOAL_TO_CATEGORY: Record<Goal, TrainingMethod['category'][]> = {
  Endurance: ['Endurance'],
  Tempo: ['Endurance','RaceStrategy'],
  Speed: ['Speed'],
  Race: ['RaceStrategy','Speed'],
  Technique: ['Technique'],
  OpenWater: ['OpenWater','Endurance'],
  Rehab: ['Technique','Endurance'],
  Recovery: ['Technique','Endurance'],
};

export function buildProgram(opts: EngineOpts): ProgramPlan {
  const {
    methods, goal, targetMeters, pool,
    cssPer100, conditionIds, withTT=false
  } = opts;
  const stroke = opts.stroke ?? 'FR';

  // 목표 SPL 자동결정
  const targetSPL25 = opts.targetSPL25 ?? estimateTargetSPL25({
    heightCm: opts.heightCm, skill: opts.skill, goal, cssPer100, stroke,
  });

  // Q3: 조건 병합/중재
  const multi = conditionIds ? applyRulesMulti(conditionIds) : null;
  const cats = GOAL_TO_CATEGORY[goal] || ['Endurance'];
  let poolMethods = methods.filter(m => cats.includes(m.category));
  const notes: string[] = [];

  if (multi) {
    if (multi.avoidMethods.length) poolMethods = poolMethods.filter(m => !multi.avoidMethods.includes(m.id));
    if (multi.recommendMethods.length) {
      poolMethods = [...poolMethods].sort((a,b) =>
        (multi.recommendMethods.includes(a.id)?-1:0) - (multi.recommendMethods.includes(b.id)?-1:0)
      );
    }
    notes.push(`조건 적용: ${multi.normalized.join(', ')}`);
    if (multi.cautions.length) notes.push(`충돌로 제외된 항목: ${multi.cautions.join(', ')}`);
    // rationale 합본
    multi.rationale.forEach(r => notes.push(r));
  }

  // LAP(왕복) 기준 거리 계산 - 현실적인 코칭 단위
  const LAP = pool * 2; // 25m 풀 → 50m(왕복), 50m 풀 → 100m(왕복)
  const snap = (m:number)=>Math.max(LAP, Math.round(m/LAP)*LAP); // LAP 단위로 스냅
  const wu = snap(targetMeters*0.18), pre = snap(targetMeters*0.12), main = snap(targetMeters*0.60), cd = snap(targetMeters*0.10);

  const WU: ProgramBlock[] = [
    { name:'Warm-up', meters: wu, items:[ 
      `${wu/2}m easy choice`, 
      ...(Math.floor(wu/(2*LAP)) > 0 ? [`${Math.floor(wu/(2*LAP))}×${LAP}m drill/swim by ${pool}`] : []) // 0이면 제외
    ].filter(Boolean)},
  ];
  
  const preReps1 = Math.floor(pre/(2*LAP));
  const preReps2 = Math.floor(pre/(2*LAP));
  const PRE: ProgramBlock[] = [
    { name:'Pre-set', meters: pre, items:[
      ...(preReps1 > 0 ? [annotateSet(`${preReps1}×${LAP}m build`, 'Z3', LAP, pool, stroke, cssPer100, targetSPL25, withTT)] : []),
      ...(preReps2 > 0 ? [annotateSet(`${preReps2}×${LAP}m choice drill`, 'Z2', LAP, pool, stroke, cssPer100, targetSPL25, withTT)] : []),
    ].filter(Boolean)},
  ].filter(block => block.items.length > 0); // 아이템이 없으면 블록 자체 제외

  const MAIN: ProgramBlock[] = [];
  const perBlock = Math.max(LAP, Math.round(main / Math.max(1, 3) / LAP) * LAP); // LAP 기준
  const pick = poolMethods.slice(0, 3);

  for (const m of pick) {
    const repMatch = m.howToDo.match(/(\d+)[×x]\s*(\d+)\s*m/i);
    let repDist = repMatch ? Number(repMatch[2]) : 100;
    
    // 거리를 LAP의 배수로 조정 (현실적인 거리)
    // 피라미드가 아니면 LAP 단위로 스냅
    if (repDist < LAP) {
      repDist = LAP; // 최소 1 LAP
    } else {
      repDist = Math.round(repDist / LAP) * LAP; // LAP 배수로 스냅
    }
    
    const z: Zone = m.category==='Speed'?'Z5': m.category==='RaceStrategy'?'Z4': m.category==='Endurance'?'Z3': m.category==='Technique'?'Z2':'Z3';
    const reps = Math.max(1, Math.round(perBlock / repDist));
    const line = annotateSet(`${reps}×${repDist}m ${m.title}`, z, repDist, pool, stroke, cssPer100, targetSPL25, withTT);
    MAIN.push({ name:`Main: ${m.title}`, meters: reps*repDist, items:[line, `참고: ${m.howToDo}`] });
  }

  const cdReps = Math.floor(cd/(2*LAP));
  const CD: ProgramBlock[] = [
    { name:'Cool-down', meters: cd, items:[ 
      `${cd}m easy`, 
      ...(cdReps > 0 ? [`${cdReps}×${LAP}m choice drill/back`] : []) // 0이면 제외
    ].filter(Boolean)},
  ];

  const totalMeters = [...WU,...PRE,...MAIN,...CD].reduce((s,b)=>s+b.meters,0);
  if (Math.abs(totalMeters - targetMeters) > pool) notes.push(`스케일 보정 권장: 목표 ${targetMeters}m ↔ 생성 ${totalMeters}m`);
  if (!cssPer100) notes.push('CSS 미입력: @pace/SPL/Tempo/TT는 평균 오프셋 기반 근사(확실하지 않음).');

  return { WU, PRE, MAIN, CD, totalMeters, notes };
}
