/**
 * JJ Swim Lab: 건강·질환·기술 기반 수영 프로그램 생성기
 * 데이터 스키마 정의
 */
export type PoolLen = 25 | 50;
export type Sex = 'M' | 'F';
export type Goal = 'fatloss' | 'endurance' | 'performance';
export type Zone = 'Z1' | 'Z2' | 'Z3' | 'Z4' | 'Z5';
export type Stroke = 'FR' | 'BK' | 'BR' | 'FL' | 'IM';
export type HealthFlags = {
    hypertension?: boolean;
    obesity?: boolean;
    dyslipidemia?: boolean;
    diabetes?: boolean;
    pregnancy?: boolean;
    asthma?: boolean;
    osa?: boolean;
    jointConditions?: string[];
};
export type TechniqueChecklist = {
    freestyle?: {
        crossover?: boolean;
        highElbow?: boolean;
        bilateralBreath?: boolean;
        headPos?: 'high' | 'low' | 'ok';
        turnBreakout?: number;
    };
};
export type PaceInputs = {
    cssSecPer100?: number;
    best100Sec?: number;
    z2SecPer100?: number;
    band?: 'B' | 'BB' | 'A' | 'AA' | 'AAA' | 'AAAA';
};
export type TimeAvailability = {
    pool: PoolLen;
    daysPerWeek: number;
    sessionMinutes: number;
};
export type Drill = {
    id: string;
    name: string;
    strokes: Stroke[];
    helps: string[];
    pros: string[];
    cons: string[];
    cautions: string[];
    cues: string[];
    typicalUse: {
        zones: Zone[];
        rep25?: number[];
        rep50?: number[];
        restSec?: number[];
    };
};
export type TrainingMethod = {
    id: string;
    name: string;
    definition: string;
    whenToUse: string[];
    goals: string[];
    pros: string[];
    cons: string[];
    cautions: string[];
    examples25: string[];
    examples50: string[];
    zones: Zone[];
    recommendedDrillIds: string[];
};
export type SessionSet = {
    label: string;
    reps: number;
    distance: number;
    paceNote: string;
    restSec: number | [number, number];
    stroke?: Stroke;
    methodId?: string;
    drillIds?: string[];
    cues?: string[];
};
export type SessionPlan = {
    dayIndex: number;
    totalMeters: number;
    sets: SessionSet[];
    safetyBadges: string[];
};
export type WeekPlan = {
    summary: {
        totalMeters: number;
        zoneDist: Record<Zone, number>;
        sessions: number;
    };
    sessions: SessionPlan[];
};
//# sourceMappingURL=types.d.ts.map