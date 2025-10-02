
/**
 * SwimLab PRO — types.ts
 */
export type Zone = 'Z1'|'Z2'|'Z3'|'Z4'|'Z5';
export type Stroke = 'FR'|'BK'|'BR'|'FL'|'IM';

export interface Evidence { id: string; title: string; href: string; note?: string; }
export type ImpactAxis = 'technique'|'volume'|'intensity'|'rest'|'pace'|'contraindication';

export interface Rule {
  id: string;
  axis: ImpactAxis;
  description: string;
  adjust?: number|string;
  evidenceIds: string[];
}

export interface HealthCondition {
  id: string;
  name: string;
  category: 'joint'|'derm'|'general'|'mental'|'special';
  affectsProgram: boolean;
  rules: Rule[];
}

export interface Drill {
  id: string;
  name: string;
  strokes: Stroke[];
  helps: string[];
  pros: string[]; cons: string[]; cautions: string[];
  cues: string[];
}

export interface TrainingMethod {
  id: string;
  name: string;
  pattern: 'even'|'threshold'|'vo2'|'sprint'|'descend'|'ascend'|'build'|'ladder'|'pyramid'|'broken'|'fartlek'|'tempo'|'choice'|'kick'|'pull'|'drillswim';
  zones: Zone[];
  definition: string;
  who: string[];   // 누가
  when: string[];  // 언제
  how: string[];   // 어떻게
  why: string[];   // 왜
  pros: string[];
  cons: string[];
  restGuide: string[];
  examples: string[];
  recommendedDrillIds?: string[];
}

export interface MastersAnchorRow {
  gender: 'M'|'F'|'X';
  ageMin: number; ageMax: number;
  event: string;
  recordSec: number;
}

export interface AthleteProfile {
  name: string;
  gender: 'M'|'F'|'X';
  age: number;
  poolLen: 25|50;
  goals: Array<'mood'|'endurance'|'immune'|'rehab'|'posture'|'record'|'speed'|'vo2'>;
  weeklySessions: number;
  sessionMinutes: number;
  cssSec100?: number;
  healthIds: string[];
  skillNotes?: string[];
}

export interface WorkoutBlock { title: string; lines: string[]; tooltip?: string; }
export interface WorkoutPlan { profile: AthleteProfile; blocks: WorkoutBlock[]; totalMeters: number; }
