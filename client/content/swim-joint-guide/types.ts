export interface Condition {
  id: string;
  name: string;
  recommended: string[];
  avoidOrCaution: string[];
  modifications: string[];
  tools: string[];
  sessionExample: string;
  evidenceKeys: string[];
}

export interface Evidence {
  key: string;
  label: string;
  link: string;
  note: string;
}

export interface MatrixRow {
  conditionId: string;
  자유형: number;
  배영: number;
  평영: number;
  접영: number;
  기본배영: number;
  사이드스트로크: number;
}

export interface SwimJointGuideData {
  lastUpdatedKST: string;
  strokes: string[];
  conditions: Condition[];
  matrix: MatrixRow[];
  evidenceRegistry: Evidence[];
}

export type StrokeKey = keyof Omit<MatrixRow, 'conditionId'>;

export interface MatrixScore {
  score: number;
  level: 'recommended' | 'possible' | 'caution' | 'avoid';
  color: string;
  icon: string;
}
