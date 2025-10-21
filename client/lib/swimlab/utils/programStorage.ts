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
  _id?: string; // MongoDB ID (삭제 시 사용)
  athleteName: string;
  athleteId?: string;
  athleteLevel?: string;
  groupClassName?: string; // 단체반 이름
  groupClassId?: string; // 단체반 ID
  programScope?: 'individual' | 'group';
  programType: 'weekly' | 'race';
  createdAt: string;
  createdBy?: string;
  
  // 프로그램 파라미터
  params: {
    startDate: string;
    daysPerWeek: number;
    weeklyMeters?: number; // 선택적
    sessionDuration?: number; // 세션 시간
    selectedDays?: string[]; // 선택된 요일들
    pool: 25 | 50;
    stroke: 'FR' | 'BK' | 'BR' | 'FL';
    mainStrokes?: string[]; // 주요 영법들
    excludedStrokes?: string[]; // 제외할 영법들
    skill?: 'Beginner' | 'Intermediate' | 'Advanced'; // 선택적
    cssPer100: number | Record<string, number>; // CSS per 100m (단일 값 또는 영법별)
    strokeCSS?: Record<string, number>; // 영법별 CSS
    heightCm?: number; // 선택적
    conditionIds: string[];
    goal?: string; // 훈련 목표 추가 (기술 연마, 체력 향상, 실력 향상, 체중 감량)
    raceDate?: string;
    taperWeeks?: number;
    intensityMultiplier?: number; // 강도 조절 (레이스 플랜용)
  };
  
  // 생성된 프로그램 내용
  content: {
    summary: string;
    planExplanation?: string; // 주간 계획 설명 추가
    totalMeters: number;
    totalDuration?: number; // 총 소요 시간
    phases?: any[]; // 레이스 프로그램용 페이즈
    sessions: Array<{
      day: string;
      date?: string; // 날짜 정보
      themeDesc?: string; // 테마 설명 추가
      sets: string[];
      blocks?: any[]; // 세부 블록 정보
      completion?: number | { // 완료율 (number 또는 객체)
        completionRate: number;
        feeling?: 'easy' | 'moderate' | 'hard' | 'very_hard';
        notes?: string;
        inputAt?: string;
      };
      dayCondition?: string | any; // 일일 컨디션 (string 또는 객체)
      duration?: number; // 소요 시간
      distance?: number; // 거리
      intensity?: number; // 강도
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

