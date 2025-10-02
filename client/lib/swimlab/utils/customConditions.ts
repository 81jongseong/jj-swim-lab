/**
 * 🏊 SwimLab - 커스텀 질환 관리
 * 
 * 📋 **파일 목적**
 * - 사용자가 추가한 질환을 저장
 * - 기본 질환과 병합하여 사용
 * - 실시간 반영
 */

export type CustomCondition = {
  id: string;
  name: string;
  label: string;
  group: 'ACUTE' | 'CHRONIC';
  category?: string;
  severity?: 'mild' | 'moderate' | 'severe';
  keywords?: string[];
  impacts?: Array<{
    type: string;
    how: string;
  }>;
  strokeNotes?: any;
  evidenceKeys?: string[];
  notes?: string;
  swimmingGuidance?: {
    freestyle: { level: 'safe' | 'caution' | 'avoid'; detailedExplanation: string; reason: string; medicalEvidence?: any[] };
    backstroke: { level: 'safe' | 'caution' | 'avoid'; detailedExplanation: string; reason: string };
    breaststroke: { level: 'safe' | 'caution' | 'avoid'; detailedExplanation: string; reason: string };
    butterfly: { level: 'safe' | 'caution' | 'avoid'; detailedExplanation: string; reason: string };
    elementary_backstroke: { level: 'safe' | 'caution' | 'avoid'; detailedExplanation: string; reason: string };
    sidestroke: { level: 'safe' | 'caution' | 'avoid'; detailedExplanation: string; reason: string };
  };
  exerciseRestrictions?: {
    intensityReduction: number;
    durationLimit: number;
    frequencyLimit: number;
    contraindicatedExercises: string[];
    recommendedExercises: string[];
  };
};

const KEY = 'swimlab.custom.conditions.v1';

/**
 * 커스텀 질환 저장
 */
export function saveCustomCondition(condition: CustomCondition): void {
  const customs = getCustomConditions();
  const index = customs.findIndex(c => c.id === condition.id);
  
  if (index >= 0) {
    customs[index] = condition;
  } else {
    customs.push(condition);
  }
  
  localStorage.setItem(KEY, JSON.stringify(customs));
}

/**
 * 커스텀 질환 조회
 */
export function getCustomConditions(): CustomCondition[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

/**
 * 커스텀 질환 삭제
 */
export function deleteCustomCondition(id: string): void {
  const customs = getCustomConditions().filter(c => c.id !== id);
  localStorage.setItem(KEY, JSON.stringify(customs));
}

/**
 * 기본 + 커스텀 질환 병합
 */
export function getMergedConditions(baseConditions: any[]): any[] {
  const customs = getCustomConditions();
  return [...baseConditions, ...customs];
}

/**
 * 간단 질환 추가 (기본 템플릿)
 */
export function createSimpleCondition(
  name: string, 
  category: string, 
  group: 'ACUTE' | 'CHRONIC'
): CustomCondition {
  return {
    id: `custom_${Date.now()}`,
    name,
    label: name,
    group,
    category,
    severity: 'moderate',
    keywords: [name.toLowerCase()],
    impacts: [
      { type: '동작', how: '제한적' }
    ],
    notes: '커스텀 추가 질환',
    swimmingGuidance: {
      freestyle: { level: 'caution', detailedExplanation: '주의하여 진행', reason: '커스텀 질환' },
      backstroke: { level: 'caution', detailedExplanation: '주의하여 진행', reason: '커스텀 질환' },
      breaststroke: { level: 'caution', detailedExplanation: '주의하여 진행', reason: '커스텀 질환' },
      butterfly: { level: 'avoid', detailedExplanation: '피하는 것을 권장', reason: '커스텀 질환' },
      elementary_backstroke: { level: 'safe', detailedExplanation: '안전하게 진행 가능', reason: '낮은 강도' },
      sidestroke: { level: 'safe', detailedExplanation: '안전하게 진행 가능', reason: '낮은 강도' }
    },
    exerciseRestrictions: {
      intensityReduction: 20,
      durationLimit: 45,
      frequencyLimit: 3,
      contraindicatedExercises: ['고강도 스프린트', '과도한 회전'],
      recommendedExercises: ['이지 스윔', '기술 드릴']
    }
  };
}

