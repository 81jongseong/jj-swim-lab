
import { Evidence, HealthCondition, Drill, TrainingMethod } from '../types';
import { EVIDENCE } from '../data/evidence';
import { JOINT_CONDITIONS } from '../data/health/conditions.joint';
import { DERM_CONDITIONS } from '../data/health/conditions.derm';
import { GENERAL_CONDITIONS, MENTAL_CONDITIONS, SPECIAL_CASES } from '../data/health/conditions.general';
import { DRILLS } from '../data/training/drills';
import { TRAINING_METHODS } from '../data/training/methods';

export interface Registry {
  evidence: Evidence[];
  conditions: HealthCondition[];
  drills: Drill[];
  methods: TrainingMethod[];
  masters?: { rows: any[] };
}
const KEY = 'swimlab_registry_v2';
export function loadRegistry(): Registry {
  if (typeof window!=='undefined'){
    const raw = window.localStorage.getItem(KEY);
    if (raw) try{ return JSON.parse(raw); }catch{}
  }
  const reg: Registry = { evidence:EVIDENCE, conditions:[...JOINT_CONDITIONS, ...DERM_CONDITIONS, ...GENERAL_CONDITIONS, ...MENTAL_CONDITIONS, ...SPECIAL_CASES], drills:DRILLS, methods:TRAINING_METHODS };
  if (typeof window!=='undefined') window.localStorage.setItem(KEY, JSON.stringify(reg));
  return reg;
}
export function saveRegistry(reg: Registry){ if (typeof window==='undefined') return; window.localStorage.setItem(KEY, JSON.stringify(reg)); }
