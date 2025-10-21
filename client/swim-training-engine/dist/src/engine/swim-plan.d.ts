import type { Stroke, HealthFlags, TimeAvailability, PaceInputs, Goal } from '../types';
export interface HealthInput {
    demographics: {
        age: number;
        sex: 'M' | 'F';
    };
    anthropometrics?: {
        height_cm: number;
        weight_kg: number;
    };
    vitals?: {
        rest_hr?: number;
        rest_bp?: {
            sbp: number;
            dbp: number;
        };
        on_beta_blocker?: boolean;
        bloodSugar?: number;
        totalCholesterol?: number;
    };
    conditions?: {
        hypertension?: string;
        obesity?: string;
        dyslipidemia?: boolean;
        diabetes?: boolean;
        heartDisease?: boolean;
        respiratoryDisease?: boolean;
    };
    orthopedics?: string[];
    health?: HealthFlags;
    pace?: PaceInputs;
    avail?: TimeAvailability;
    goal?: Goal;
    stroke?: Stroke;
    technique?: any;
    specialConditions?: any;
    swimLevel?: string;
    grade?: string;
    poolDistance?: number;
}
export interface PlanOutput {
    microcycle_week: number;
    weekly_target_min: number;
    weekly_target_distance: number;
    medical_clearance_required: boolean;
    sessions: Array<{
        day: string;
        sessionType: string;
        intensity: number;
        exercises: Array<{
            stroke: string;
            distance: number;
            sets: number;
            rest: number | [number, number];
        }>;
    }>;
    strength_days: number;
    next_week_adjustment: 'maintain' | 'increase' | 'decrease';
    notes: string[];
    exercisePrescription?: {
        totalDuration: number;
        totalDistance: number;
        averagePace: number;
        intensity: number;
        grade: string;
    };
}
export declare function buildPlan(i: HealthInput): PlanOutput;
//# sourceMappingURL=swim-plan.d.ts.map