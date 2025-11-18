import { HealthInput, PlanOutput, SwimLevel } from '../types';

export const WHO_BASE = { mod_min:150, mod_max:300, vig_min:75, vig_max:150 };

export function medicalClearanceNeeded(i:HealthInput): boolean {
  const sbp = i.vitals?.rest_bp?.sbp ?? 0, dbp = i.vitals?.rest_bp?.dbp ?? 0;
  if (sbp >= 180 || dbp >= 110) return true;
  if (i.symptoms_flags?.length) return true;
  
  // 신사구체여과율(eGFR) 기반 의료 승인 필요 여부
  if (i.labs?.egfr !== undefined) {
    const egfr = i.labs.egfr;
    if (egfr < 30) {
      // 만성 신장 질환 4-5기: 의료진 상담 필수
      return true;
    }
    if (egfr < 60) {
      // 만성 신장 질환 3기: 의료진 상담 권장 (선택적)
      // return true; // 필요시 활성화
    }
  }
  
  // 당화혈색소(HbA1c) 기반 의료 승인 필요 여부
  if (i.labs?.hba1c !== undefined) {
    const hba1c = i.labs.hba1c;
    if (hba1c >= 8.0) {
      // 혈당 조절 불량: 의료진 상담 권장
      // return true; // 필요시 활성화
    }
  }
  
  // 당뇨병 진단 시 의료 승인 권장
  if (i.conditions?.diabetes) {
    // return true; // 필요시 활성화
  }
  
  return false;
}

export function weeklyDoseMinutes(i:HealthInput): number {
  let base = 180;
  if (i.conditions.obesity !== 'normal') base = Math.max(base, 250);
  if (i.conditions.hypertension === 'stage2') base = Math.max(base, 210);
  if (i.conditions.dyslipidemia) base = Math.max(base, 200);
  return base;
}

export function levelSessionRange(level:SwimLevel): [number,number] {
  if (level==='beginner') return [30,35];
  if (level==='intermediate') return [40,50];
  return [50,60];
}

export function rpePrimary(): string { return 'RPE 11–13(중등도)'; }
export function hrSecondary(i:HealthInput): string|undefined {
  if (i.vitals?.on_beta_blocker) return undefined;
  return 'HR: 육상 목표에서 −10~15bpm(수중 보정, 개인차 큼 — 확실하지 않음)';
}

export const BP_STOP_RULE = 'SBP≥250 or DBP≥115(즉시 중지)';







