/**
 * 🏊 SwimLab - 선수 프로필 관리
 * 
 * 📋 **파일 목적**
 * - 선수(이름/아이콘/컨디션/목표종목) 프로필 저장/불러오기
 * - 팀 생성 시 선택해서 자동 적용
 * - localStorage 기반 영구 저장
 * 
 * 🔄 **주요 기능**
 * - 선수 추가/수정/삭제
 * - 선수별 컨디션 저장
 * - 선수별 CSS, 영법 저장
 * - 선수별 목표 종목·기록 저장
 * - 팀 단위 일괄 내보내기
 * 
 * 💡 **사용 예시**
 * ```typescript
 * // 새 선수 추가
 * const athlete = newAthlete('김민수', '🏊‍♂️');
 * upsertAthlete(athlete);
 * 
 * // 선수 불러오기
 * const athlete = getAthlete('ath_xyz');
 * 
 * // 선수 목록
 * const athletes = listAthletes();
 * ```
 */

// RaceTarget 타입 (실제로는 MultiEventPicker에서 import)
export type RaceTarget = { event: string; targetSec: number };

export type AthleteProfile = {
  id: string; 
  name: string; 
  icon?: string; 
  conditionIds: string[]; 
  cssPer100?: number; 
  stroke?: 'FR'|'BK'|'BR'|'FL';
  raceTargets?: RaceTarget[];  // ← 추가: 종목·목표(mm:ss)
  groupClassName?: string; // 단체반 이름 (단체반인 경우)
  groupMembers?: any[]; // 단체반 회원 목록 (단체반인 경우)
};

const KEY = 'swimlab.athletes.v1';

function loadAll(): AthleteProfile[] { 
  try { 
    return JSON.parse(localStorage.getItem(KEY) || '[]'); 
  } catch { 
    return []; 
  } 
}

function saveAll(a: AthleteProfile[]) { 
  localStorage.setItem(KEY, JSON.stringify(a)); 
}

/**
 * 전체 선수 목록 조회
 */
export function listAthletes(){ 
  return loadAll(); 
}

/**
 * 선수 추가/수정
 */
export function upsertAthlete(p: AthleteProfile){
  const a = loadAll(); 
  const i = a.findIndex(x => x.id === p.id);
  if (i >= 0) a[i] = p; 
  else a.push(p); 
  saveAll(a);
}

/**
 * 선수 삭제
 */
export function removeAthlete(id: string){ 
  saveAll(loadAll().filter(x => x.id !== id)); 
}

/**
 * 특정 선수 조회
 */
export function getAthlete(id: string){ 
  return loadAll().find(x => x.id === id); 
}

/**
 * 새 선수 생성 (헬퍼)
 */
export function newAthlete(name = '선수', icon = '🏊‍♂️'): AthleteProfile {
  return { 
    id: `ath_${Date.now().toString(36)}${Math.random().toString(36).slice(2,5)}`, 
    name, 
    icon, 
    conditionIds: [] 
  };
}

