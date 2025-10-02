/**
 * 🏊‍♂️ JJ Swim Lab - 페이스 변환 규칙
 * 
 * 📋 **기능:**
 * - CSS 기준 페이스 해결
 * - 훈련존별 페이스 범위 계산
 * - 연령 밴드 기반 추정
 */

import { PaceInputs, Zone } from './types';

export function resolveBasePace(p: PaceInputs): number /* sec/100 */ {
  if (p.cssSecPer100) return p.cssSecPer100;
  if (p.best100Sec) return p.best100Sec + 6; // 근사: best100 +6″ ≈ 임계
  if (p.z2SecPer100) return p.z2SecPer100 - 6; // 근사 변환
  
  // 연령 밴드 추정(보유 시): 대역별 표준 보정치 테이블을 둠 (간단한 맵)
  const bandPaceMap: Record<string, number> = {
    'B': 120,    // 2:00/100m
    'BB': 110,   // 1:50/100m
    'A': 100,    // 1:40/100m
    'AA': 90,    // 1:30/100m
    'AAA': 80,   // 1:20/100m
    'AAAA': 70   // 1:10/100m
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
    Z3: [css - 2, css + 4],      // 임계
    Z4: [css - 6, css - 3],      // VO2max
    Z5: [0, css - 7],            // 스프린트/레이스
  };
}

export function formatPace(secPer100: number): string {
  const minutes = Math.floor(secPer100 / 60);
  const seconds = secPer100 % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}/100m`;
}

export function getZoneFromPace(currentPace: number, css: number): Zone {
  const zones = zonePace(css);
  
  for (const [zone, [fast, slow]] of Object.entries(zones)) {
    if (currentPace >= fast && currentPace <= slow) {
      return zone as Zone;
    }
  }
  
  // 범위를 벗어나면 가장 가까운 존 반환
  if (currentPace < zones.Z5[0]) return 'Z5';
  if (currentPace > zones.Z1[1]) return 'Z1';
  
  return 'Z2'; // 기본값
}










