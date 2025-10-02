/**
 * 🏊 SwimLab - 코치 프리셋 저장/불러오기
 * 
 * 📋 **파일 목적**
 * - 컨디션 조합을 슬롯(1~5)에 저장
 * - 이름 입력 없이 슬롯 번호로만 관리
 * - localStorage 기반 영구 저장
 * 
 * 🔄 **주요 기능**
 * - saveConditionPreset: 슬롯에 컨디션 저장
 * - loadConditionPreset: 슬롯에서 컨디션 불러오기
 * - clearConditionPreset: 슬롯 비우기
 * - listConditionPresets: 전체 슬롯 상태 조회
 * 
 * 💡 **사용 예시**
 * ```typescript
 * // 슬롯 1에 저장
 * saveConditionPreset(1, ['sleep_deprived', 'fatigue_high']);
 * 
 * // 슬롯 1에서 불러오기
 * const ids = loadConditionPreset(1);
 * 
 * // 슬롯 1 비우기
 * clearConditionPreset(1);
 * ```
 */

const KEY = 'swimlab.condition.presets.v1';

type Store = { [slot: number]: string[] };

function loadStore(): Store {
  try { 
    return JSON.parse(localStorage.getItem(KEY) || '{}'); 
  } catch { 
    return {}; 
  }
}

function saveStore(s: Store){ 
  localStorage.setItem(KEY, JSON.stringify(s)); 
}

/**
 * 컨디션 조합을 슬롯에 저장
 */
export function saveConditionPreset(slot: number, ids: string[]){
  const s = loadStore(); 
  s[slot] = [...new Set(ids)]; // 중복 제거
  saveStore(s);
}

/**
 * 슬롯에서 컨디션 조합 불러오기
 */
export function loadConditionPreset(slot: number): string[] {
  const s = loadStore(); 
  return Array.isArray(s[slot]) ? s[slot] : [];
}

/**
 * 슬롯 비우기
 */
export function clearConditionPreset(slot: number){
  const s = loadStore(); 
  delete s[slot]; 
  saveStore(s);
}

/**
 * 전체 슬롯 상태 조회
 */
export function listConditionPresets(): Array<{slot:number; count:number}> {
  const s = loadStore(); 
  return [1,2,3,4,5].map(n => ({ 
    slot:n, 
    count:(s[n]?.length||0) 
  }));
}

