/**
 * 🏊 SwimLab - 프로그램 저장소
 * 
 * 📋 **파일 목적**
 * - 생성된 훈련 프로그램을 로컬/서버에 저장
 * - 프로그램 목록 조회 및 관리
 * - 수정/삭제 기능 지원
 * 
 * 🔄 **주요 기능**
 * - 프로그램 저장 (로컬/서버)
 * - 프로그램 목록 조회
 * - 프로그램 상세 조회
 * - 프로그램 수정
 * - 프로그램 삭제
 */

export type SavedProgram = {
  id: string;
  athleteName: string;
  athleteId?: string;
  programType: 'weekly' | 'race';
  createdAt: string;
  createdBy?: string;
  
  // 프로그램 파라미터
  params: {
    startDate: string;
    daysPerWeek: number;
    weeklyMeters: number;
    pool: 25 | 50;
    stroke: 'FR' | 'BK' | 'BR' | 'FL';
    skill: 'Beginner' | 'Intermediate' | 'Advanced';
    cssPer100: number;
    heightCm: number;
    conditionIds: string[];
    raceDate?: string;
    taperWeeks?: number;
  };
  
  // 생성된 프로그램 내용
  content: {
    summary: string;
    totalMeters: number;
    sessions: Array<{
      day: string;
      sets: string[];
    }>;
  };
};

const KEY = 'swimlab.programs.v1';

/**
 * 모든 프로그램 불러오기
 */
export function listPrograms(): SavedProgram[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

/**
 * 프로그램 저장
 */
export function saveProgram(program: SavedProgram): void {
  const programs = listPrograms();
  const index = programs.findIndex(p => p.id === program.id);
  
  if (index >= 0) {
    programs[index] = program;
  } else {
    programs.unshift(program); // 최신 항목을 앞에
  }
  
  localStorage.setItem(KEY, JSON.stringify(programs));
}

/**
 * 프로그램 조회
 */
export function getProgram(id: string): SavedProgram | undefined {
  return listPrograms().find(p => p.id === id);
}

/**
 * 프로그램 삭제
 */
export function deleteProgram(id: string): void {
  const programs = listPrograms().filter(p => p.id !== id);
  localStorage.setItem(KEY, JSON.stringify(programs));
}

/**
 * 프로그램 업데이트
 */
export function updateProgram(id: string, updates: Partial<SavedProgram>): void {
  const programs = listPrograms();
  const index = programs.findIndex(p => p.id === id);
  
  if (index >= 0) {
    programs[index] = { ...programs[index], ...updates };
    localStorage.setItem(KEY, JSON.stringify(programs));
  }
}

/**
 * 필터링된 프로그램 조회
 */
export function filterPrograms(options: {
  athleteName?: string;
  programType?: 'weekly' | 'race';
  dateRange?: { from: string; to: string };
}): SavedProgram[] {
  let programs = listPrograms();
  
  if (options.athleteName) {
    programs = programs.filter(p => 
      p.athleteName.toLowerCase().includes(options.athleteName!.toLowerCase())
    );
  }
  
  if (options.programType) {
    programs = programs.filter(p => p.programType === options.programType);
  }
  
  if (options.dateRange) {
    programs = programs.filter(p => 
      p.createdAt >= options.dateRange!.from && 
      p.createdAt <= options.dateRange!.to
    );
  }
  
  return programs;
}

/**
 * 통계 조회
 */
export function getProgramStats() {
  const programs = listPrograms();
  
  return {
    total: programs.length,
    weekly: programs.filter(p => p.programType === 'weekly').length,
    race: programs.filter(p => p.programType === 'race').length,
    athletes: new Set(programs.map(p => p.athleteName)).size,
    recentCount: programs.filter(p => {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      return p.createdAt >= weekAgo;
    }).length
  };
}

