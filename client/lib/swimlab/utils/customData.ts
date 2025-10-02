/**
 * 🏊 SwimLab - 커스텀 데이터 관리
 * 
 * 📋 **파일 목적**
 * - 사용자가 추가한 훈련법/드릴을 저장
 * - 기본 데이터와 병합하여 사용
 * - 실시간 반영
 */

import type { TrainingMethod, Drill } from '@/src/swimlab/utils/catalog';

const METHODS_KEY = 'swimlab.custom.methods.v1';
const DRILLS_KEY = 'swimlab.custom.drills.v1';

/**
 * 커스텀 훈련법 저장
 */
export function saveCustomMethod(method: TrainingMethod): void {
  const customs = getCustomMethods();
  const index = customs.findIndex(m => m.id === method.id);
  
  if (index >= 0) {
    customs[index] = method;
  } else {
    customs.push(method);
  }
  
  localStorage.setItem(METHODS_KEY, JSON.stringify(customs));
}

/**
 * 커스텀 훈련법 조회
 */
export function getCustomMethods(): TrainingMethod[] {
  try {
    return JSON.parse(localStorage.getItem(METHODS_KEY) || '[]');
  } catch {
    return [];
  }
}

/**
 * 커스텀 훈련법 삭제
 */
export function deleteCustomMethod(id: string): void {
  const customs = getCustomMethods().filter(m => m.id !== id);
  localStorage.setItem(METHODS_KEY, JSON.stringify(customs));
}

/**
 * 커스텀 드릴 저장
 */
export function saveCustomDrill(drill: Drill): void {
  const customs = getCustomDrills();
  const index = customs.findIndex(d => d.id === drill.id);
  
  if (index >= 0) {
    customs[index] = drill;
  } else {
    customs.push(drill);
  }
  
  localStorage.setItem(DRILLS_KEY, JSON.stringify(customs));
}

/**
 * 커스텀 드릴 조회
 */
export function getCustomDrills(): Drill[] {
  try {
    return JSON.parse(localStorage.getItem(DRILLS_KEY) || '[]');
  } catch {
    return [];
  }
}

/**
 * 커스텀 드릴 삭제
 */
export function deleteCustomDrill(id: string): void {
  const customs = getCustomDrills().filter(d => d.id !== id);
  localStorage.setItem(DRILLS_KEY, JSON.stringify(customs));
}

/**
 * 기본 + 커스텀 훈련법 병합
 */
export function getMergedMethods(baseMethods: TrainingMethod[]): TrainingMethod[] {
  const customs = getCustomMethods();
  return [...baseMethods, ...customs];
}

/**
 * 기본 + 커스텀 드릴 병합
 */
export function getMergedDrills(baseDrills: Drill[]): Drill[] {
  const customs = getCustomDrills();
  return [...baseDrills, ...customs];
}

