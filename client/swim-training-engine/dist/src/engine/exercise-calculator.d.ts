/**
 * 운동량 계산 시스템
 *
 * 연동되는 데이터:
 * - 수영 실력별 페이스 기준
 * - 거리별 시간 계산
 * - 급수별 운동 강도 조정
 * - 개인별 맞춤형 운동량 설정
 *
 * 연동되는 파일:
 * - /swim-training-engine/src/types.ts
 * - /swim-training-engine/src/engine/health-policy.ts
 */
import { SwimLevel } from '../types';
export interface ExercisePrescription {
    totalDuration: number;
    totalDistance: number;
    pace: number;
    intensity: number;
    restRatio: number;
    strokeDistribution: {
        [key: string]: {
            distance: number;
            duration: number;
            pace: number;
        };
    };
}
export interface SwimPaceStandards {
    beginner: {
        freestyle: number;
        backstroke: number;
        breaststroke: number;
        butterfly: number;
        elementary_backstroke: number;
        sidestroke: number;
    };
    intermediate: {
        freestyle: number;
        backstroke: number;
        breaststroke: number;
        butterfly: number;
        elementary_backstroke: number;
        sidestroke: number;
    };
    advanced: {
        freestyle: number;
        backstroke: number;
        breaststroke: number;
        butterfly: number;
        elementary_backstroke: number;
        sidestroke: number;
    };
}
export declare const PACE_STANDARDS: SwimPaceStandards;
export declare const GRADE_ADJUSTMENT: {
    '1\uAE09': {
        intensity: number;
        duration: number;
        pace: number;
    };
    '2\uAE09': {
        intensity: number;
        duration: number;
        pace: number;
    };
    '3\uAE09': {
        intensity: number;
        duration: number;
        pace: number;
    };
    '4\uAE09': {
        intensity: number;
        duration: number;
        pace: number;
    };
    '5\uAE09': {
        intensity: number;
        duration: number;
        pace: number;
    };
};
export declare const DISTANCE_RECOMMENDATIONS: {
    beginner: {
        short: {
            distance: number;
            duration: number;
        };
        medium: {
            distance: number;
            duration: number;
        };
        long: {
            distance: number;
            duration: number;
        };
    };
    intermediate: {
        short: {
            distance: number;
            duration: number;
        };
        medium: {
            distance: number;
            duration: number;
        };
        long: {
            distance: number;
            duration: number;
        };
    };
    advanced: {
        short: {
            distance: number;
            duration: number;
        };
        medium: {
            distance: number;
            duration: number;
        };
        long: {
            distance: number;
            duration: number;
        };
    };
};
export declare function calculateExercisePrescription(swimLevel: SwimLevel, targetDuration: number, availableStrokes: string[], intensityReduction?: number, grade?: string, poolDistance?: number): ExercisePrescription;
export declare function generateWorkoutBlocks(prescription: ExercisePrescription, availableStrokes: string[], poolDistance?: number): Array<{
    stroke: string;
    block: string;
    distance: number;
    duration: number;
}>;
export declare function getPaceDescription(pace: number): string;
export declare function getIntensityDescription(intensity: number): string;
//# sourceMappingURL=exercise-calculator.d.ts.map