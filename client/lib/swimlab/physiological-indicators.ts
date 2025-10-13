/**
 * 🧬 JJ Swim Lab - 생리학적 지표 기반 고강도 조정 시스템
 * 
 * 연동되는 데이터:
 * - VO2max (ml/kg/min)
 * - 최고 심박수 (bpm)
 * - 안정시 심박수 (bpm)
 * 
 * 연동되는 파일:
 * - client/lib/swimlab/engine-v35-time-based.ts
 */

/**
 * 🔬 과학적 근거:
 * 
 * **1. VO2max 기준 (ACSM 2018)**
 *    - < 35: Poor (고강도 제한)
 *    - 35-45: Fair (고강도 50%)
 *    - 45-55: Good (고강도 70%)
 *    - > 55: Excellent (고강도 100%)
 * 
 * **2. 심박수 여유도 (Karvonen Formula)**
 *    - HRR = 최고심박 - 안정심박
 *    - HRR < 80: 고강도 제한
 *    - HRR 80-100: 고강도 70%
 *    - HRR > 100: 고강도 100%
 */

export interface PhysiologicalProfile {
  vo2max?: number;
  maxHeartRate?: number;
  restingHeartRate?: number;
}

export interface HighIntensityAdjustment {
  z4z5VolumeMultiplier: number; // Z4/Z5 거리 배율
  z4z5DurationMultiplier: number; // Z4/Z5 지속 시간 배율
  maxConsecutiveHighSets: number; // 연속 고강도 세트 최대 개수
  recoveryRatio: number; // 고강도 후 회복 비율
  explanation: string;
  scientificBasis: string;
}

/**
 * 생리학적 지표 기반 고강도 조정 계산
 */
export function calculateHighIntensityAdjustment(
  profile: PhysiologicalProfile
): HighIntensityAdjustment {
  let score = 0;
  const factors: string[] = [];
  
  // 1. VO2max 평가
  if (profile.vo2max) {
    if (profile.vo2max >= 55) {
      score += 3;
      factors.push(`VO2max ${profile.vo2max} (Excellent)`);
    } else if (profile.vo2max >= 45) {
      score += 2;
      factors.push(`VO2max ${profile.vo2max} (Good)`);
    } else if (profile.vo2max >= 35) {
      score += 1;
      factors.push(`VO2max ${profile.vo2max} (Fair)`);
    } else {
      score += 0;
      factors.push(`VO2max ${profile.vo2max} (Poor - 고강도 제한)`);
    }
  }
  
  // 2. 심박수 여유도 (HRR)
  if (profile.maxHeartRate && profile.restingHeartRate) {
    const hrr = profile.maxHeartRate - profile.restingHeartRate;
    
    if (hrr >= 100) {
      score += 3;
      factors.push(`HRR ${hrr} (우수한 심폐 능력)`);
    } else if (hrr >= 80) {
      score += 2;
      factors.push(`HRR ${hrr} (양호한 심폐 능력)`);
    } else {
      score += 1;
      factors.push(`HRR ${hrr} (제한적 심폐 능력)`);
    }
  }
  
  // 3. 점수 기반 조정 (0-6점)
  let z4z5VolumeMultiplier = 0.5; // 기본 50%
  let z4z5DurationMultiplier = 0.5;
  let maxConsecutiveHighSets = 1;
  let recoveryRatio = 2.0; // 고강도 1 : 회복 2
  
  if (score >= 5) {
    // 5-6점: 엘리트 수준
    z4z5VolumeMultiplier = 1.0;
    z4z5DurationMultiplier = 1.0;
    maxConsecutiveHighSets = 3;
    recoveryRatio = 1.0; // 1:1
  } else if (score >= 3) {
    // 3-4점: 우수 수준
    z4z5VolumeMultiplier = 0.8;
    z4z5DurationMultiplier = 0.8;
    maxConsecutiveHighSets = 2;
    recoveryRatio = 1.5; // 1:1.5
  } else if (score >= 1) {
    // 1-2점: 보통 수준
    z4z5VolumeMultiplier = 0.6;
    z4z5DurationMultiplier = 0.6;
    maxConsecutiveHighSets = 1;
    recoveryRatio = 2.0; // 1:2
  } else {
    // 0점: 고강도 제한
    z4z5VolumeMultiplier = 0.3;
    z4z5DurationMultiplier = 0.3;
    maxConsecutiveHighSets = 1;
    recoveryRatio = 3.0; // 1:3
  }
  
  return {
    z4z5VolumeMultiplier,
    z4z5DurationMultiplier,
    maxConsecutiveHighSets,
    recoveryRatio,
    explanation: `생리학적 점수: ${score}/6 - ${factors.join(', ')}`,
    scientificBasis: 'ACSM (2018): VO2max & HRR 기반 고강도 처방'
  };
}

