/**
 * SwimLab Data Pack v4 - 로컬 저장소 (브라우저 localStorage)
 * 
 * 세션 이력, RPE 부하 추적
 * 
 * 관련 파일:
 * - client/src/swimlab/components/Planner.tsx
 * - client/src/swimlab/utils/engine.ts
 */

// 간단한 로컬 저장소(브라우저 localStorage). Next.js client 컴포넌트에서만 사용.
export type SessionBlock = { name: string; items: string[]; meters: number };
export type SessionPlan = { WU: SessionBlock[]; PRE: SessionBlock[]; MAIN: SessionBlock[]; CD: SessionBlock[]; totalMeters: number; notes?: string[] };

export type SwimSession = {
  id: string;
  date: string;            // ISO (YYYY-MM-DD)
  title: string;           // 예: Endurance(2000m) / Speed(1500m)
  goal: 'Endurance'|'Tempo'|'Speed'|'Race'|'Technique'|'OpenWater'|'Rehab'|'Recovery';
  meters: number;
  pool: 25|50;
  stroke: 'FR'|'BK'|'BR'|'FL';
  conditionIds?: string;
  cssPer100?: number;
  targetSPL25?: number;
  plan: SessionPlan;       // buildProgram 결과 스냅샷
  completed?: boolean;
  memo?: string;
  // RPE 추적
  rpe?: number;            // 1~10 (Rate of Perceived Exertion)
  duration?: number;       // 분 (실제 수영 시간)
  sessionLoad?: number;    // RPE × duration (Session-RPE 부하)
};

const KEY = 'swimlab.history.v1';

function readAll(): SwimSession[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}
function writeAll(arr: SwimSession[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(arr));
}

export const History = {
  list(): SwimSession[] { return readAll().sort((a,b)=>b.date.localeCompare(a.date)); }, // 최신순
  byId(id: string): SwimSession|undefined { return readAll().find(s=>s.id===id); },
  save(s: SwimSession) {
    const arr = readAll();
    const i = arr.findIndex(x=>x.id===s.id);
    if (i>=0) arr[i]=s; else arr.push(s);
    writeAll(arr);
  },
  remove(id: string) { writeAll(readAll().filter(s=>s.id!==id)); },
  clear() { writeAll([]); },
  exportJSON(): string { return JSON.stringify(readAll(), null, 2); },
  
  // 주간/월간 요약 (RPE 부하)
  weekSummary(monday: string) {
    const sessions = readAll().filter(s => s.date >= monday && s.date < addDays(monday, 7));
    const totalLoad = sessions.reduce((sum, s) => sum + (s.sessionLoad || 0), 0);
    const totalMeters = sessions.reduce((sum, s) => sum + s.meters, 0);
    return { sessions: sessions.length, totalLoad, totalMeters, avgRPE: totalLoad / sessions.reduce((s,x)=>s+(x.duration||0),0) || 0 };
  },
  
  monthSummary(year: number, month: number) {
    const start = `${year}-${String(month).padStart(2,'0')}-01`;
    const end = `${year}-${String(month+1).padStart(2,'0')}-01`;
    const sessions = readAll().filter(s => s.date >= start && s.date < end);
    const totalLoad = sessions.reduce((sum, s) => sum + (s.sessionLoad || 0), 0);
    const totalMeters = sessions.reduce((sum, s) => sum + s.meters, 0);
    return { sessions: sessions.length, totalLoad, totalMeters };
  }
};

function addDays(s: string, n: number) {
  const d = new Date(s+'T00:00:00'); 
  d.setDate(d.getDate()+n);
  return d.toISOString().slice(0,10);
}

