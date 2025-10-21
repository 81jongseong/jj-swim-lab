/**
 * JJ Swim Lab: 페이스 변환 및 훈련존 계산
 */

import { Zone, PaceInputs } from './types';

export function resolveBasePace(p: PaceInputs): number /* sec/100 */ {
  if (p.cssSecPer100) return p.cssSecPer100;
  if (p.best100Sec) return p.best100Sec + 6; // 근사: best100 +6″ ≈ 임계
  if (p.z2SecPer100) return p.z2SecPer100 - 6; // 근사 변환
  
  // 연령 밴드 추정(보유 시): 대역별 표준 보정치 테이블을 둠 (간단한 맵)
  const bandPaceMap: Record<string, number> = {
    'B': 120, 'BB': 115, 'A': 110, 'AA': 105, 'AAA': 100, 'AAAA': 95
  };
  
  if (p.band && bandPaceMap[p.band]) {
    return bandPaceMap[p.band];
  }
  
  return 100; // 디폴트 안전치(1:40/100m), 이후 세션에서 곧바로 업데이트 가능
}

export function zonePace(css: number): Record<Zone, [number, number]> {
  // [빠름, 느림] 범위 (sec/100m)
  return {
    Z1: [css + 15, css + 30],    // 회복
    Z2: [css + 5, css + 14],     // 기초 지구력
    Z3: [css - 2, css + 4],      // 임계/템포
    Z4: [css - 6, css - 3],      // VO₂max
    Z5: [0, css - 7],            // 스프린트/레이스
  };
}

export function getPaceRange(zone: Zone, css: number): [number, number] {
  const ranges = zonePace(css);
  return ranges[zone];
}

export function calculateZoneDistribution(totalMeters: number, zones: Record<Zone, [number, number]>): Record<Zone, number> {
  // 목표별 존 분배 비율
  const zoneRatios: Record<Zone, number> = {
    Z1: 0.20, // 20% 회복
    Z2: 0.50, // 50% 기초 지구력
    Z3: 0.20, // 20% 임계
    Z4: 0.08, // 8% 고강도
    Z5: 0.02  // 2% 스프린트
  };
  
  const distribution: Record<Zone, number> = {
    Z1: Math.round(totalMeters * zoneRatios.Z1),
    Z2: Math.round(totalMeters * zoneRatios.Z2),
    Z3: Math.round(totalMeters * zoneRatios.Z3),
    Z4: Math.round(totalMeters * zoneRatios.Z4),
    Z5: Math.round(totalMeters * zoneRatios.Z5)
  };
  
  return distribution;
}

// 페이스 포맷 함수 (초 → mm:ss 형식)
export function formatPace(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export function formatPaceNote(pace: number, zone: Zone): string {
  const formattedPace = formatPace(pace);
  return `@ ${formattedPace} (${zone})`;
}

export function calculateRestTime(intensity: Zone, distance: number): number {
  // 거리와 강도에 따른 휴식 시간 계산
  const baseRest: Record<Zone, number> = {
    Z1: 10,  // 회복: 짧은 휴식
    Z2: 15,  // 기초: 중간 휴식
    Z3: 20,  // 임계: 긴 휴식
    Z4: 30,  // 고강도: 매우 긴 휴식
    Z5: 60   // 스프린트: 최대 휴식
  };
  
  const distanceFactor = Math.max(1, distance / 100); // 100m 기준
  return Math.round(baseRest[intensity] * distanceFactor);
}

export function adjustPaceByRPE(basePace: number, rpe: number): number {
  // RPE에 따른 페이스 조정
  // RPE 6-7: 기본 페이스
  // RPE 8-9: 5-10초 빠르게
  // RPE 4-5: 5-10초 느리게
  
  if (rpe >= 8) {
    return basePace - 8; // 빠르게
  } else if (rpe >= 7) {
    return basePace - 3; // 약간 빠르게
  } else if (rpe <= 5) {
    return basePace + 8; // 느리게
  } else if (rpe <= 6) {
    return basePace + 3; // 약간 느리게
  }
  
  return basePace; // 기본 페이스 유지
}