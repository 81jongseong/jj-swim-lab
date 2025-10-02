/**
 * JJ Swim Lab — 통합 인덱스
 * 모든 수영 관련 데이터와 함수를 한 곳에서 export
 */

// 기본 타입과 용어 사전
export * from './swim-glossary';

// 훈련법과 드릴
export * from './training-methods';
export { DRILLS, getDrillsByStroke, findDrillById } from './drills';

// 통합 통계
export const STATS = {
  terms: 50,      // GLOSSARY.length
  drills: 35,     // DRILLS.length  
  methods: 25,    // TRAINING_METHODS.length
};

// 사용 예시 함수들
export function parseWorkoutExample(workout: string) {
  const { parseWorkoutLine, explainToken, formatTokensHuman } = require('./swim-glossary');
  const tokens = parseWorkoutLine(workout);
  return {
    tokens,
    explanation: formatTokensHuman(tokens),
    individual: tokens.map(explainToken)
  };
}

export function getTrainingMethodWithDrills(methodId: string) {
  const { findMethodById } = require('./training-methods');
  const { suggestDrillsForMethod } = require('./drills');
  
  const method = findMethodById(methodId);
  const drills = suggestDrillsForMethod(methodId);
  
  return { method, drills };
}

export function searchEverything(query: string) {
  const { searchTerms } = require('./swim-glossary');
  const { findMethodById } = require('./training-methods');
  const { findDrillById } = require('./drills');
  
  const terms = searchTerms(query);
  const method = findMethodById(query);
  const drill = findDrillById(query);
  
  return { terms, method, drill };
}





