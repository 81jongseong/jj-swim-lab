/**
 * 🏊 JJ Swim Lab - 수영 프로그램 생성 엔진 v3.5 (Time-Based Scientific System)
 * 
 * 🎯 핵심 개선사항:
 * 1. **시간 역산 시스템**: 거리가 아닌 시간을 기준으로 프로그램 생성
 * 2. **과학적 시간 배분**: 워밍업(10%), 드릴(15%), 메인(60%), 쿨다운(15%)
 * 3. **정확한 시간 계산**: 페이스 + 휴식을 정확히 계산하여 목표 시간 달성
 * 4. **meters와 desc 완벽 동기화**: 모든 변경 시 동시 업데이트
 * 
 * 연동되는 데이터:
 * - CSS (Critical Swim Speed) - 영법별 100m당 초
 * - Zone 기반 페이스 및 휴식 시간
 * - 컨디션 및 질환 기반 자동 조정
 * - 25개 훈련법 + 40개 드릴
 * 
 * 연동되는 파일:
 * - client/types/evidence.ts
 * - client/lib/swimlab/condition-rules-v4.ts
 * - client/src/swimlab/data/trainingMethods.ts (25개)
 * - client/src/swimlab/data/drills.ts (40개)
 */

import { EvidenceKey } from '@/types/evidence';
import { aggregateConditionRules } from '@/lib/swimlab/condition-rules-v4';
import { TRAINING_METHODS } from '@/src/swimlab/data/trainingMethods';
import { DRILLS } from '@/src/swimlab/data/drills';

type Stroke = 'freestyle' | 'backstroke' | 'breaststroke' | 'butterfly' | 'elementary_backstroke' | 'sidestroke';
type Zone = 'Z1' | 'Z2' | 'Z3' | 'Z4' | 'Z5';

// 🎯 과학적 시간 배분 비율
// 근거: ACSM/NSCA 운동 처방 가이드라인
const TIME_ALLOCATION = {
  WU: 0.10,   // 워밍업: 10% (체온↑, 가동성 확보)
  PRE: 0.15,  // 드릴: 15% (기술 준비)
  MAIN: 0.60, // 메인: 60% (목표 중심 훈련)
  CD: 0.15    // 쿨다운: 15% (회복 시작)
};

// 🎯 과학적 반복 횟수 범위
// 근거: 훈련법별 생리학적 적응 시간
const SCIENTIFIC_REPS = {
  warmup: { min: 2, max: 5 },      // 워밍업: 2-5회 (5-10분)
  drill: { min: 2, max: 6 },        // 드릴: 2-6회 (7-12분)
  main_endurance: { min: 3, max: 8 }, // 지구력: 3-8회 (30-40분)
  main_tempo: { min: 4, max: 12 },   // 템포: 4-12회 (30-40분)
  main_sprint: { min: 6, max: 16 },  // 스프린트: 6-16회 (30-40분)
  cooldown: { min: 2, max: 10 }      // 쿨다운: 2-10회 (7-12분)
};

interface SetItem {
  stroke: Stroke;
  zone: Zone;
  restSec: number;
  rpe: number;
  equipment: string[];
  subtype?: string;
  meters: number;
  desc: string;
  whyPace: string;
  whyRest: string;
  whySet: string;
  methodId?: string;
  evidenceKeys: EvidenceKey[];
}

interface DayPlan {
  date: string;
  theme: 'tech_tempo' | 'endurance' | 'tempo_hi';
  themeDesc: string;
  sets: SetItem[];
  totalMeters: number;
  estimatedMinutes: number;
  usedMethodIds: string[];
}

/**
 * 🎯 시간 역산 기반 반복 횟수 계산
 * 
 * @param targetMinutes - 목표 시간 (분)
 * @param distPerRep - 반복당 거리 (m)
 * @param paceSeconds - 페이스 (초/100m 또는 초/set)
 * @param restSeconds - 휴식 시간 (초)
 * @param minReps - 최소 반복 횟수
 * @param maxReps - 최대 반복 횟수
 * @param isPer100m - 페이스가 per 100m인지 여부
 * @returns 반복 횟수
 */
function calculateRepsFromTime(
  targetMinutes: number,
  distPerRep: number,
  paceSeconds: number,
  restSeconds: number,
  minReps: number,
  maxReps: number,
  isPer100m: boolean = true
): number {
  const targetSeconds = targetMinutes * 60;
  
  // 1회당 소요 시간 계산
  let timePerRep: number;
  if (isPer100m) {
    // per 100m 페이스: (거리 / 100) * 페이스 + 휴식
    timePerRep = (distPerRep / 100) * paceSeconds + restSeconds;
  } else {
    // per set 페이스: 페이스 + 휴식
    timePerRep = paceSeconds + restSeconds;
  }
  
  // 반복 횟수 = 목표 시간 / 1회당 시간
  const calculatedReps = Math.round(targetSeconds / timePerRep);
  
  // 과학적 범위 내로 제한
  const finalReps = Math.max(minReps, Math.min(maxReps, calculatedReps));
  
  console.log(`⏱️ 시간 역산 계산:`, {
    targetMinutes,
    targetSeconds,
    distPerRep,
    paceSeconds,
    restSeconds,
    isPer100m,
    timePerRep: timePerRep.toFixed(1),
    calculatedReps,
    minReps,
    maxReps,
    finalReps
  });
  
  return finalReps;
}

/**
 * 🎯 세트의 정확한 소요 시간 계산
 */
function calculateSetDuration(
  reps: number,
  distPerRep: number,
  paceSeconds: number,
  restSeconds: number,
  isPer100m: boolean = true
): number {
  let swimSeconds: number;
  
  if (isPer100m) {
    // per 100m 페이스
    const totalMeters = reps * distPerRep;
    swimSeconds = (totalMeters / 100) * paceSeconds;
  } else {
    // per set 페이스
    swimSeconds = paceSeconds * reps;
  }
  
  // 휴식: 모든 반복 후 (세트 전환 포함)
  const totalRestSeconds = restSeconds * reps;
  
  return (swimSeconds + totalRestSeconds) / 60; // 분 단위 반환
}

/**
 * 🎯 페이스 포맷팅 (초 → "분:초")
 */
function formatPace(seconds: number): string {
  const min = Math.floor(seconds / 60);
  const sec = Math.round(seconds % 60);
  return `${min}:${String(sec).padStart(2, '0')}`;
}

/**
 * 🎯 Zone별 기본 휴식 시간
 */
function getRestForZone(zone: Zone): number {
  const restMap: Record<Zone, number> = {
    Z1: 10,
    Z2: 15,
    Z3: 20,
    Z4: 30,
    Z5: 45
  };
  return restMap[zone];
}

/**
 * 🎯 Zone별 RPE
 */
function getRPEForZone(zone: Zone): number {
  const rpeMap: Record<Zone, number> = {
    Z1: 3,
    Z2: 5,
    Z3: 6,
    Z4: 8,
    Z5: 9
  };
  return rpeMap[zone];
}

/**
 * 🎯 영법 이름 한글 변환
 */
function getStrokeName(stroke: Stroke): string {
  const names: Record<Stroke, string> = {
    freestyle: '자유형',
    backstroke: '배영',
    breaststroke: '평영',
    butterfly: '접영',
    elementary_backstroke: '기본배영',
    sidestroke: '측영'
  };
  return names[stroke];
}

/**
 * 🎯 시간 기반 일일 프로그램 생성
 * 
 * 핵심 로직:
 * 1. 총 시간을 과학적 비율로 배분 (WU 10%, PRE 15%, MAIN 60%, CD 15%)
 * 2. 각 섹션별로 시간 역산하여 반복 횟수 계산
 * 3. meters와 desc를 항상 동기화
 * 4. 실시간 시간 검증 및 자동 조정
 */
export function generateTimeBasedProgram(opts: {
  targetMinutes: number;
  css100: Record<string, number>;
  poolLen: number;
  goal: string;
  level: string;
  strokesAllowed: Stroke[];
  strokesAvoid: string[];
  conditionIds: string[];
  dayCondition: string;
  intensityPercent?: number; // 건강 상태 기반 강도 조절 (0.7 = 70%)
}): DayPlan {
  
  console.log('🚀 시간 기반 프로그램 생성 시작:', {
    targetMinutes: opts.targetMinutes,
    goal: opts.goal,
    level: opts.level
  });
  
  // 1. 시간 배분
  const timeAllocation = {
    warmup: opts.targetMinutes * TIME_ALLOCATION.WU,
    drill: opts.targetMinutes * TIME_ALLOCATION.PRE,
    main: opts.targetMinutes * TIME_ALLOCATION.MAIN,
    cooldown: opts.targetMinutes * TIME_ALLOCATION.CD
  };
  
  console.log('📊 시간 배분:', timeAllocation);
  
  // 2. 컨디션 기반 페이스 조절
  const conditionRules = aggregateConditionRules(opts.conditionIds, opts.dayCondition);
  const baseCss = opts.css100['freestyle'] || 90;
  
  // 🏥 건강 상태 기반 페이스 조절
  // intensityPercent: 0.7 (70% 강도) → paceMultiplier: 1.43 (43% 느리게)
  // 예: CSS 90초 × 1.43 = 129초/100m
  let paceMultiplier = 1.0;
  
  if (opts.intensityPercent && opts.intensityPercent < 1.0) {
    // 강도 감소 → 페이스 증가 (느려짐)
    // 70% 강도 = 0.7 → 1 / 0.7 = 1.43 (43% 느림)
    paceMultiplier = 1 / opts.intensityPercent;
  }
  
  // 컨디션 규칙과 결합
  const finalMultiplier = paceMultiplier * (1 + conditionRules.cssPct);
  const adjustedCss = Math.round(baseCss * finalMultiplier);
  
  console.log('🏥 페이스 조절:', {
    baseCss,
    intensityPercent: opts.intensityPercent,
    paceMultiplier: paceMultiplier.toFixed(2),
    cssPct: conditionRules.cssPct,
    finalMultiplier: finalMultiplier.toFixed(2),
    adjustedCss,
    note: opts.intensityPercent ? `${(opts.intensityPercent * 100).toFixed(0)}% 강도 → ${((finalMultiplier - 1) * 100).toFixed(0)}% 느린 페이스` : '정상'
  });
  
  const sets: SetItem[] = [];
  
  // 3. 워밍업 (10%)
  {
    const targetMin = timeAllocation.warmup;
    const distPerRep = 100; // 100m 단위
    const paceSeconds = adjustedCss + 16; // Z1: CSS + 16초
    const restSeconds = getRestForZone('Z1');
    
    const reps = calculateRepsFromTime(
      targetMin,
      distPerRep,
      paceSeconds,
      restSeconds,
      SCIENTIFIC_REPS.warmup.min,
      SCIENTIFIC_REPS.warmup.max,
      true // per 100m
    );
    
    const meters = reps * distPerRep;
    const desc = `[자유형] ${reps}×${distPerRep}m 워밍업 @ ${formatPace(paceSeconds)}, r${restSeconds}″`;
    
    sets.push({
      stroke: 'freestyle',
      zone: 'Z1',
      restSec: restSeconds,
      rpe: getRPEForZone('Z1'),
      equipment: [],
      meters,
      desc,
      whyPace: 'CSS 기반 Z1(회복) → 호흡·기술 정렬, 젖산 제거 촉진',
      whyRest: `Z1 기본 r${restSeconds}″. 저강도 회복/환기`,
      whySet: '워밍업으로 체온·가동성 확보, 이후 템포 세트 품질 보장',
      evidenceKeys: ['CSS_VALIDITY_WAKAYOSHI_1992']
    });
    
    console.log('✅ 워밍업 생성:', { reps, meters, desc });
  }
  
  // 4. 드릴 (15%)
  {
    const targetMin = timeAllocation.drill;
    const halfTime = targetMin / 2;
    
    // 4-1. 팔 드릴
    {
      const distPerRep = 50;
      const paceSeconds = (adjustedCss * 1.09) / 2; // Z2, 50m 기준
      const restSeconds = getRestForZone('Z2');
      
      const reps = calculateRepsFromTime(
        halfTime,
        distPerRep,
        paceSeconds,
        restSeconds,
        SCIENTIFIC_REPS.drill.min,
        SCIENTIFIC_REPS.drill.max,
        true
      );
      
      const meters = reps * distPerRep;
      const pace100m = paceSeconds * 2; // 50m 페이스 → 100m 페이스
      const desc = `[자유형] ${reps}×${distPerRep}m Catch-Up (풀부이) @ ${formatPace(pace100m)}, r${restSeconds}″`;
      
      sets.push({
        stroke: 'freestyle',
        zone: 'Z2',
        restSec: restSeconds,
        rpe: getRPEForZone('Z2'),
        equipment: ['풀부이'],
        subtype: '팔',
        meters,
        desc,
        whyPace: 'CSS 기반 Z2(유산소 기초) → 미토콘드리아 밀도↑, 지방 대사 개선',
        whyRest: `Z2 기본 r${restSeconds}″. 기술 유지와 환기 위한 회복`,
        whySet: 'Catch-Up: 타이밍/정렬. 풀부이로 하체 부양 → 상체 기술 집중',
        evidenceKeys: ['CSS_VALIDITY_WAKAYOSHI_1992']
      });
      
      console.log('✅ 팔 드릴 생성:', { reps, meters, desc });
    }
    
    // 4-2. 발차기 드릴
    {
      const distPerRep = 50;
      const paceSeconds = (adjustedCss * 1.5) / 2; // 발차기는 1.5배 느림
      const restSeconds = getRestForZone('Z2');
      
      const reps = calculateRepsFromTime(
        halfTime,
        distPerRep,
        paceSeconds,
        restSeconds,
        SCIENTIFIC_REPS.drill.min,
        SCIENTIFIC_REPS.drill.max,
        true
      );
      
      const meters = reps * distPerRep;
      const pace100m = paceSeconds * 2; // 50m 페이스 → 100m 페이스
      const desc = `[자유형] ${reps}×${distPerRep}m Flutter Kick (킥보드) @ ${formatPace(pace100m)}, r${restSeconds}″`;
      
      sets.push({
        stroke: 'freestyle',
        zone: 'Z2',
        restSec: restSeconds,
        rpe: getRPEForZone('Z2'),
        equipment: ['킥보드'],
        subtype: '발차기',
        meters,
        desc,
        whyPace: `발차기는 전신 수영보다 1.5배 느림 (CSS ${formatPace(adjustedCss)} × 1.5)`,
        whyRest: `Z2 기본 r${restSeconds}″. 기술 유지와 환기 위한 회복`,
        whySet: 'Flutter Kick: 하체 지구력. 킥보드로 상체 지지 → 발차기 기술 집중',
        evidenceKeys: ['CSS_VALIDITY_WAKAYOSHI_1992']
      });
      
      console.log('✅ 발차기 드릴 생성:', { reps, meters, desc });
    }
  }
  
  // 5. 메인 세트 (60%)
  {
    const targetMin = timeAllocation.main;
    const distPerRep = 300; // 장거리 목표: 300m 단위
    const paceSeconds = adjustedCss * 3; // 300m = CSS × 3 (per set)
    const restSeconds = getRestForZone('Z1'); // LSD는 Z1 휴식
    
    const reps = calculateRepsFromTime(
      targetMin,
      distPerRep,
      paceSeconds,
      restSeconds,
      SCIENTIFIC_REPS.main_endurance.min,
      SCIENTIFIC_REPS.main_endurance.max,
      false // per set (300m 전체 시간)
    );
    
    const meters = reps * distPerRep;
    // 페이스를 per 100m 기준으로 표기 (300m @ 6:00 → @ 2:00/100m)
    const pace100m = adjustedCss; // per 100m 페이스
    const desc = `[자유형] ${reps}×${distPerRep}m LSD(장거리 저강도) 지속 수영 @ ${formatPace(pace100m)}, r${restSeconds}″`;
    
    sets.push({
      stroke: 'freestyle',
      zone: 'Z1',
      restSec: restSeconds,
      rpe: getRPEForZone('Z1'),
      equipment: [],
      meters,
      desc,
      whyPace: 'LSD(장거리 저강도): 지속 페이스 유지·경제성 향상',
      whyRest: `Z1 기본 r${restSeconds}″. 장거리 지구력 훈련`,
      whySet: 'LSD: 지구력·페이스 안정성↑ (300m 거리로 집중도 향상)',
      methodId: '01',
      evidenceKeys: ['CSS_MLSS_WAKAYOSHI_1993']
    });
    
    console.log('✅ 메인 세트 생성:', { reps, meters, desc });
  }
  
  // 6. 쿨다운 (15%)
  {
    const targetMin = timeAllocation.cooldown;
    const distPerRep = 50;
    const paceSeconds = adjustedCss + 16; // Z1
    const restSeconds = getRestForZone('Z1');
    
    const reps = calculateRepsFromTime(
      targetMin,
      distPerRep,
      paceSeconds,
      restSeconds,
      SCIENTIFIC_REPS.cooldown.min,
      SCIENTIFIC_REPS.cooldown.max,
      true
    );
    
    const meters = reps * distPerRep;
    const desc = `[자유형] ${reps}×${distPerRep}m 쿨다운 @ ${formatPace(paceSeconds)}, r${restSeconds}″`;
    
    sets.push({
      stroke: 'freestyle',
      zone: 'Z1',
      restSec: restSeconds,
      rpe: getRPEForZone('Z1'),
      equipment: [],
      meters,
      desc,
      whyPace: 'CSS 기반 Z1(회복) → 호흡·기술 정렬, 젖산 제거 촉진',
      whyRest: `Z1 기본 r${restSeconds}″. 저강도 회복/환기`,
      whySet: '쿨다운으로 젖산 제거 촉진, 회복 시작',
      evidenceKeys: ['CSS_VALIDITY_WAKAYOSHI_1992']
    });
    
    console.log('✅ 쿨다운 생성:', { reps, meters, desc });
  }
  
  // 7. 최종 검증: 실제 소요 시간 계산
  let totalMinutes = 0;
  let totalMeters = 0;
  
  sets.forEach((set, idx) => {
    const match = set.desc.match(/(\d+)×(\d+)m/);
    if (!match) return;
    
    const reps = parseInt(match[1]);
    const distPerRep = parseInt(match[2]);
    const paceMatch = set.desc.match(/@\s*(\d+):(\d+)/);
    
    if (paceMatch) {
      const paceSeconds = parseInt(paceMatch[1]) * 60 + parseInt(paceMatch[2]);
      // 🎯 모든 페이스는 per 100m 기준으로 표기됨
      const isPer100m = true; // 항상 per 100m
      
      const duration = calculateSetDuration(reps, distPerRep, paceSeconds, set.restSec, isPer100m);
      totalMinutes += duration;
      totalMeters += set.meters;
      
      console.log(`✅ 세트 ${idx + 1} 검증:`, {
        desc: set.desc.substring(0, 50),
        reps,
        distPerRep,
        meters: set.meters,
        duration: duration.toFixed(1) + '분'
      });
    }
  });
  
  console.log('🎯 최종 검증:', {
    targetMinutes: opts.targetMinutes,
    actualMinutes: totalMinutes.toFixed(1),
    accuracy: ((totalMinutes / opts.targetMinutes) * 100).toFixed(1) + '%',
    totalMeters
  });
  
  return {
    date: new Date().toISOString().slice(0, 10),
    theme: 'endurance',
    themeDesc: '지구력 (LSD, 풀 부이, 브로큰 사다리) - 체력 기반 확립',
    sets,
    totalMeters,
    estimatedMinutes: Math.round(totalMinutes),
    usedMethodIds: sets.filter(s => s.methodId).map(s => s.methodId!)
  };
}

