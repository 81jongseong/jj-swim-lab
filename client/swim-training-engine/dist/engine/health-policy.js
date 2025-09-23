"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BP_STOP_RULE = exports.hrSecondary = exports.rpePrimary = exports.levelSessionRange = exports.weeklyDoseMinutes = exports.medicalClearanceNeeded = exports.WHO_BASE = void 0;
exports.WHO_BASE = { mod_min: 150, mod_max: 300, vig_min: 75, vig_max: 150 };
function medicalClearanceNeeded(i) {
    const sbp = i.vitals?.rest_bp?.sbp ?? 0, dbp = i.vitals?.rest_bp?.dbp ?? 0;
    if (sbp >= 180 || dbp >= 110)
        return true;
    if (i.symptoms_flags?.length)
        return true;
    return false;
}
exports.medicalClearanceNeeded = medicalClearanceNeeded;
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
exports.weeklyDoseMinutes = weeklyDoseMinutes;
function levelSessionRange(level) {
    if (level === 'beginner')
        return [30, 35];
    if (level === 'intermediate')
        return [40, 50];
    return [50, 60];
}
exports.levelSessionRange = levelSessionRange;
function rpePrimary() { return 'RPE 11–13(중등도)'; }
exports.rpePrimary = rpePrimary;
function hrSecondary(i) {
    if (i.vitals?.on_beta_blocker)
        return undefined;
    return 'HR: 육상 목표에서 −10~15bpm(수중 보정, 개인차 큼 — 확실하지 않음)';
}
exports.hrSecondary = hrSecondary;
exports.BP_STOP_RULE = 'SBP≥250 or DBP≥115(즉시 중지)';
