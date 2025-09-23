const WHO_BASE = { mod_min: 150, mod_max: 300, vig_min: 75, vig_max: 150 };
function medicalClearanceNeeded(i) {
    const sbp = i.vitals?.rest_bp?.sbp ?? 0, dbp = i.vitals?.rest_bp?.dbp ?? 0;
    if (sbp >= 180 || dbp >= 110)
        return true;
    if (i.symptoms_flags?.length)
        return true;
    return false;
}
function weeklyDoseMinutes(i) {
    let base = 180;
    if (i.conditions.obesity !== 'normal')
        base = Math.max(base, 250);
    if (i.conditions.hypertension === 'stage2')
        base = Math.max(base, 210);
    if (i.conditions.dyslipidemia)
        base = Math.max(base, 200);
    return base;
}
function levelSessionRange(level) {
    if (level === 'beginner')
        return [30, 35];
    if (level === 'intermediate')
        return [40, 50];
    return [50, 60];
}
function rpePrimary() { return 'RPE 11–13(중등도)'; }
function hrSecondary(i) {
    if (i.vitals?.on_beta_blocker)
        return undefined;
    return 'HR: 육상 목표에서 −10~15bpm(수중 보정, 개인차 큼 — 확실하지 않음)';
}
const BP_STOP_RULE = 'SBP≥250 or DBP≥115(즉시 중지)';

module.exports = { 
  WHO_BASE, 
  medicalClearanceNeeded, 
  weeklyDoseMinutes, 
  levelSessionRange, 
  rpePrimary, 
  hrSecondary, 
  BP_STOP_RULE 
};
