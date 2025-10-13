/**
 * 🏊 JJ Swim Lab - 세부 레벨별 차별화 시스템
 * 
 * 연동되는 데이터:
 * - 레벨 (beginner_1, beginner_2, intermediate_1, intermediate_2, advanced_1, advanced_2, master, expert)
 * - CSS, 생리학적 지표 (VO2max, 심박수)
 * 
 * 연동되는 파일:
 * - client/lib/swimlab/engine-v35-time-based.ts
 * - client/lib/swimlab/scientific-factors.ts
 */

/**
 * 🔬 세부 레벨별 차별화 인자
 * 
 * 같은 그룹(intermediate, advanced)이라도 세부 레벨에 따라 차별화
 */
export const DETAILED_LEVEL_FACTORS = {
  beginner_1: {
    complexityScore: 1,      // 복잡도 점수 (1-10)
    varietyTolerance: 0.3,   // 다양성 허용도 (30%)
    highIntensityRatio: 0.1, // 고강도 비율 (10%)
    restMultiplier: 1.3,     // 휴식 30% 증가
    description: '입문: 기본 동작 습득, 단순 반복'
  },
  beginner_2: {
    complexityScore: 2,
    varietyTolerance: 0.4,
    highIntensityRatio: 0.15,
    restMultiplier: 1.2,
    description: '초급: 기본 영법 숙달, 간단한 조합'
  },
  intermediate_1: {
    complexityScore: 4,
    varietyTolerance: 0.6,
    highIntensityRatio: 0.3,
    restMultiplier: 1.1,
    description: '중급 하위: 다양한 드릴, 중간 강도'
  },
  intermediate_2: {
    complexityScore: 5,
    varietyTolerance: 0.7,
    highIntensityRatio: 0.4,
    restMultiplier: 1.0,
    description: '중급 상위: 복합 훈련, 고강도 도입'
  },
  advanced_1: {
    complexityScore: 7,
    varietyTolerance: 0.8,
    highIntensityRatio: 0.6,
    restMultiplier: 0.95,
    description: '고급 하위: 고강도 중심, 복잡한 세트'
  },
  advanced_2: {
    complexityScore: 8,
    varietyTolerance: 0.9,
    highIntensityRatio: 0.7,
    restMultiplier: 0.90,
    description: '고급 상위: 최대 강도, 전문적 훈련'
  },
  master: {
    complexityScore: 9,
    varietyTolerance: 1.0,
    highIntensityRatio: 0.8,
    restMultiplier: 0.85,
    description: '마스터: 엘리트 수준, 최적화된 훈련'
  },
  expert: {
    complexityScore: 10,
    varietyTolerance: 1.0,
    highIntensityRatio: 0.9,
    restMultiplier: 0.80,
    description: '전문가: 경쟁 수준, 최대 부하'
  }
} as const;

/**
 * 세부 레벨 인자 가져오기
 */
export function getDetailedLevelFactors(level: string) {
  const key = level as keyof typeof DETAILED_LEVEL_FACTORS;
  return DETAILED_LEVEL_FACTORS[key] || DETAILED_LEVEL_FACTORS.intermediate_1;
}

