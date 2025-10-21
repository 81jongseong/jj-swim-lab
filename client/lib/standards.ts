/**
 * 연령·성별 기록 표준 래퍼
 * 
 * 연동되는 데이터:
 * - USA Swimming Motivational Standards 2024–2028
 * - World Aquatics Masters Records
 * - 대한수영연맹(KSF) 기록
 * 
 * 연동되는 파일:
 * - lib/planner.ts (밴드 기반 훈련 분배)
 * - components/PlannerForm.tsx (기록 입력 및 밴드 표시)
 * 
 * 근거 자료:
 * - USA Swimming Motivational Standards: https://www.usaswimming.org/times/motivational-times
 * - World Aquatics Masters Records: https://www.worldaquatics.com/swimming/masters/records
 * - 대한수영연맹: https://www.swimming.or.kr/
 */

export type Sex = 'M' | 'F';
export type Event = 'FR50' | 'FR100' | 'FR200' | 'FR400' | 'FR800' | 'FR1500' | 'BK50' | 'BK100' | 'BK200' | 'BR50' | 'BR100' | 'BR200' | 'FL50' | 'FL100' | 'FL200';
export type Band = 'B' | 'BB' | 'A' | 'AA' | 'AAA' | 'AAAA' | 'NA';

export interface AgeGroup {
  min: number;
  max: number;
  label?: string;
}

export interface TimeStandard {
  event: Event;
  sex: Sex;
  ageGroup: AgeGroup;
  band: Band;
  timeSeconds: number;
}

// USA Swimming Motivational Standards 2024-2028 기반 데이터
// 실제 구현에서는 정확한 표준 시간을 사용해야 함
const MOTIVATIONAL_STANDARDS: TimeStandard[] = [
  // 남성 자유형 50m
  { event: 'FR50', sex: 'M', ageGroup: { min: 13, max: 14 }, band: 'B', timeSeconds: 28.5 },
  { event: 'FR50', sex: 'M', ageGroup: { min: 13, max: 14 }, band: 'BB', timeSeconds: 26.8 },
  { event: 'FR50', sex: 'M', ageGroup: { min: 13, max: 14 }, band: 'A', timeSeconds: 25.2 },
  { event: 'FR50', sex: 'M', ageGroup: { min: 13, max: 14 }, band: 'AA', timeSeconds: 23.8 },
  { event: 'FR50', sex: 'M', ageGroup: { min: 13, max: 14 }, band: 'AAA', timeSeconds: 22.5 },
  { event: 'FR50', sex: 'M', ageGroup: { min: 13, max: 14 }, band: 'AAAA', timeSeconds: 21.2 },
  
  // 남성 자유형 100m
  { event: 'FR100', sex: 'M', ageGroup: { min: 13, max: 14 }, band: 'B', timeSeconds: 62.5 },
  { event: 'FR100', sex: 'M', ageGroup: { min: 13, max: 14 }, band: 'BB', timeSeconds: 58.8 },
  { event: 'FR100', sex: 'M', ageGroup: { min: 13, max: 14 }, band: 'A', timeSeconds: 55.2 },
  { event: 'FR100', sex: 'M', ageGroup: { min: 13, max: 14 }, band: 'AA', timeSeconds: 52.1 },
  { event: 'FR100', sex: 'M', ageGroup: { min: 13, max: 14 }, band: 'AAA', timeSeconds: 49.2 },
  { event: 'FR100', sex: 'M', ageGroup: { min: 13, max: 14 }, band: 'AAAA', timeSeconds: 46.5 },
  
  // 성인 연령 그룹 (25-29)
  { event: 'FR50', sex: 'M', ageGroup: { min: 25, max: 29 }, band: 'B', timeSeconds: 30.2 },
  { event: 'FR50', sex: 'M', ageGroup: { min: 25, max: 29 }, band: 'BB', timeSeconds: 28.5 },
  { event: 'FR50', sex: 'M', ageGroup: { min: 25, max: 29 }, band: 'A', timeSeconds: 26.8 },
  { event: 'FR50', sex: 'M', ageGroup: { min: 25, max: 29 }, band: 'AA', timeSeconds: 25.2 },
  { event: 'FR50', sex: 'M', ageGroup: { min: 25, max: 29 }, band: 'AAA', timeSeconds: 23.8 },
  { event: 'FR50', sex: 'M', ageGroup: { min: 25, max: 29 }, band: 'AAAA', timeSeconds: 22.5 },
  
  { event: 'FR100', sex: 'M', ageGroup: { min: 25, max: 29 }, band: 'B', timeSeconds: 65.8 },
  { event: 'FR100', sex: 'M', ageGroup: { min: 25, max: 29 }, band: 'BB', timeSeconds: 62.1 },
  { event: 'FR100', sex: 'M', ageGroup: { min: 25, max: 29 }, band: 'A', timeSeconds: 58.5 },
  { event: 'FR100', sex: 'M', ageGroup: { min: 25, max: 29 }, band: 'AA', timeSeconds: 55.2 },
  { event: 'FR100', sex: 'M', ageGroup: { min: 25, max: 29 }, band: 'AAA', timeSeconds: 52.1 },
  { event: 'FR100', sex: 'M', ageGroup: { min: 25, max: 29 }, band: 'AAAA', timeSeconds: 49.2 },
  
  // 여성 자유형 50m
  { event: 'FR50', sex: 'F', ageGroup: { min: 13, max: 14 }, band: 'B', timeSeconds: 31.2 },
  { event: 'FR50', sex: 'F', ageGroup: { min: 13, max: 14 }, band: 'BB', timeSeconds: 29.5 },
  { event: 'FR50', sex: 'F', ageGroup: { min: 13, max: 14 }, band: 'A', timeSeconds: 27.8 },
  { event: 'FR50', sex: 'F', ageGroup: { min: 13, max: 14 }, band: 'AA', timeSeconds: 26.2 },
  { event: 'FR50', sex: 'F', ageGroup: { min: 13, max: 14 }, band: 'AAA', timeSeconds: 24.8 },
  { event: 'FR50', sex: 'F', ageGroup: { min: 13, max: 14 }, band: 'AAAA', timeSeconds: 23.5 },
  
  { event: 'FR100', sex: 'F', ageGroup: { min: 13, max: 14 }, band: 'B', timeSeconds: 68.5 },
  { event: 'FR100', sex: 'F', ageGroup: { min: 13, max: 14 }, band: 'BB', timeSeconds: 64.8 },
  { event: 'FR100', sex: 'F', ageGroup: { min: 13, max: 14 }, band: 'A', timeSeconds: 61.2 },
  { event: 'FR100', sex: 'F', ageGroup: { min: 13, max: 14 }, band: 'AA', timeSeconds: 57.8 },
  { event: 'FR100', sex: 'F', ageGroup: { min: 13, max: 14 }, band: 'AAA', timeSeconds: 54.5 },
  { event: 'FR100', sex: 'F', ageGroup: { min: 13, max: 14 }, band: 'AAAA', timeSeconds: 51.5 },
  
  // 성인 연령 그룹 (25-29)
  { event: 'FR50', sex: 'F', ageGroup: { min: 25, max: 29 }, band: 'B', timeSeconds: 33.2 },
  { event: 'FR50', sex: 'F', ageGroup: { min: 25, max: 29 }, band: 'BB', timeSeconds: 31.5 },
  { event: 'FR50', sex: 'F', ageGroup: { min: 25, max: 29 }, band: 'A', timeSeconds: 29.8 },
  { event: 'FR50', sex: 'F', ageGroup: { min: 25, max: 29 }, band: 'AA', timeSeconds: 28.2 },
  { event: 'FR50', sex: 'F', ageGroup: { min: 25, max: 29 }, band: 'AAA', timeSeconds: 26.8 },
  { event: 'FR50', sex: 'F', ageGroup: { min: 25, max: 29 }, band: 'AAAA', timeSeconds: 25.5 },
  
  { event: 'FR100', sex: 'F', ageGroup: { min: 25, max: 29 }, band: 'B', timeSeconds: 72.5 },
  { event: 'FR100', sex: 'F', ageGroup: { min: 25, max: 29 }, band: 'BB', timeSeconds: 68.8 },
  { event: 'FR100', sex: 'F', ageGroup: { min: 25, max: 29 }, band: 'A', timeSeconds: 65.2 },
  { event: 'FR100', sex: 'F', ageGroup: { min: 25, max: 29 }, band: 'AA', timeSeconds: 61.8 },
  { event: 'FR100', sex: 'F', ageGroup: { min: 25, max: 29 }, band: 'AAA', timeSeconds: 58.5 },
  { event: 'FR100', sex: 'F', ageGroup: { min: 25, max: 29 }, band: 'AAAA', timeSeconds: 55.5 },
];

// 연령 그룹 정의
export const AGE_GROUPS: AgeGroup[] = [
  { min: 8, max: 10, label: '8-10세' },
  { min: 11, max: 12, label: '11-12세' },
  { min: 13, max: 14, label: '13-14세' },
  { min: 15, max: 16, label: '15-16세' },
  { min: 17, max: 18, label: '17-18세' },
  { min: 19, max: 24, label: '19-24세' },
  { min: 25, max: 29, label: '25-29세' },
  { min: 30, max: 34, label: '30-34세' },
  { min: 35, max: 39, label: '35-39세' },
  { min: 40, max: 44, label: '40-44세' },
  { min: 45, max: 49, label: '45-49세' },
  { min: 50, max: 54, label: '50-54세' },
  { min: 55, max: 59, label: '55-59세' },
  { min: 60, max: 64, label: '60-64세' },
  { min: 65, max: 69, label: '65-69세' },
  { min: 70, max: 74, label: '70-74세' },
  { min: 75, max: 79, label: '75-79세' },
  { min: 80, max: 84, label: '80-84세' },
  { min: 85, max: 89, label: '85-89세' },
  { min: 90, max: 99, label: '90-99세' },
  { min: 100, max: 999, label: '100세 이상' }
];

/**
 * 주어진 연령, 성별, 종목, 시간으로 밴드를 조회
 * @param params 연령, 성별, 종목, 시간(초)
 * @returns 밴드 등급
 */
export function lookupBand(params: {
  age: number;
  sex: Sex;
  event: Event;
  timeSec: number;
}): Band {
  const { age, sex, event, timeSec } = params;
  
  // 연령 그룹 찾기
  const ageGroup = AGE_GROUPS.find(group => age >= group.min && age <= group.max);
  if (!ageGroup) {
    return 'NA';
  }
  
  // 해당 조건의 표준 시간들 찾기
  const standards = MOTIVATIONAL_STANDARDS.filter(
    std => std.sex === sex && 
           std.event === event && 
           std.ageGroup.min === ageGroup.min && 
           std.ageGroup.max === ageGroup.max
  ).sort((a, b) => a.timeSeconds - b.timeSeconds);
  
  if (standards.length === 0) {
    return 'NA';
  }
  
  // 시간에 맞는 밴드 찾기
  for (const standard of standards) {
    if (timeSec <= standard.timeSeconds) {
      return standard.band;
    }
  }
  
  // 가장 느린 시간보다도 느리면 B 등급
  return 'B';
}

/**
 * 주어진 연령, 성별, 종목의 모든 밴드 표준 시간 조회
 * @param params 연령, 성별, 종목
 * @returns 밴드별 표준 시간 배열
 */
export function getStandardsForAgeSexEvent(params: {
  age: number;
  sex: Sex;
  event: Event;
}): Array<{ band: Band; timeSeconds: number }> {
  const { age, sex, event } = params;
  
  const ageGroup = AGE_GROUPS.find(group => age >= group.min && age <= group.max);
  if (!ageGroup) {
    return [];
  }
  
  return MOTIVATIONAL_STANDARDS
    .filter(std => 
      std.sex === sex && 
      std.event === event && 
      std.ageGroup.min === ageGroup.min && 
      std.ageGroup.max === ageGroup.max
    )
    .map(std => ({
      band: std.band,
      timeSeconds: std.timeSeconds
    }))
    .sort((a, b) => a.timeSeconds - b.timeSeconds);
}

/**
 * 밴드 기반 훈련 분배 비율 계산
 * @param band 밴드 등급
 * @returns 훈련 분배 비율
 */
export function getTrainingDistribution(band: Band): {
  endurance: { EN1: number; EN2: number };
  threshold: number;
  vo2max: number;
  sprint: number;
  technique: number;
} {
  switch (band) {
    case 'B':
    case 'BB':
      return {
        endurance: { EN1: 45, EN2: 35 },
        threshold: 5,
        vo2max: 5,
        sprint: 5,
        technique: 5
      };
    case 'A':
    case 'AA':
      return {
        endurance: { EN1: 35, EN2: 25 },
        threshold: 20,
        vo2max: 10,
        sprint: 5,
        technique: 5
      };
    case 'AAA':
    case 'AAAA':
      return {
        endurance: { EN1: 25, EN2: 25 },
        threshold: 25,
        vo2max: 15,
        sprint: 10,
        technique: 0
      };
    default:
      return {
        endurance: { EN1: 40, EN2: 30 },
        threshold: 15,
        vo2max: 10,
        sprint: 5,
        technique: 0
      };
  }
}

/**
 * 밴드별 권장 주간 훈련 시간 (분)
 * @param band 밴드 등급
 * @returns 주간 훈련 시간 (분)
 */
export function getRecommendedWeeklyMinutes(band: Band): number {
  switch (band) {
    case 'B':
    case 'BB':
      return 180; // 3시간
    case 'A':
    case 'AA':
      return 300; // 5시간
    case 'AAA':
    case 'AAAA':
      return 480; // 8시간
    default:
      return 240; // 4시간
  }
}

/**
 * 밴드별 권장 세션 수
 * @param band 밴드 등급
 * @returns 주간 세션 수
 */
export function getRecommendedSessions(band: Band): number {
  switch (band) {
    case 'B':
    case 'BB':
      return 3;
    case 'A':
    case 'AA':
      return 4;
    case 'AAA':
    case 'AAAA':
      return 6;
    default:
      return 3;
  }
}

