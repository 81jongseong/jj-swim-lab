/**
 * 🏊‍♂️ JJ Swim Lab - 메인 인덱스
 *
 * 📋 **기능:**
 * - 모든 모듈 통합 및 내보내기
 * - 기존 엔진과의 호환성 유지
 * - 새로운 엔진 기능 제공
 */
export * from './types';
export * from './pace';
export * from './training_methods';
export * from './drills';
export * from './health_rules';
export * from './planner';
export * from './progression';
import { buildWeek } from './planner';
import { UserInput, WeekPlan } from './types';
/**
 * 기존 엔진과의 호환성을 위한 buildPlan 함수
 */
export declare function buildPlan(input: any): any;
/**
 * 엔진 상태 확인
 */
export declare function getEngineStatus(): {
    status: 'ready' | 'error';
    version: string;
    modules: string[];
    lastUpdated: string;
};
/**
 * 엔진 초기화
 */
export declare function initializeEngine(): Promise<boolean>;
/**
 * 사용자 입력 검증
 */
export declare function validateUserInput(input: any): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
};
/**
 * 계획 생성 (새로운 API)
 */
export declare function generateSwimPlan(input: UserInput): WeekPlan;
/**
 * 계획 요약 생성
 */
export declare function generatePlanSummary(plan: WeekPlan): {
    totalMeters: number;
    totalSessions: number;
    averageSessionMeters: number;
    zoneDistribution: Record<string, number>;
    safetyNotes: string[];
};
declare const _default: {
    buildPlan: typeof buildPlan;
    buildWeek: typeof buildWeek;
    generateSwimPlan: typeof generateSwimPlan;
    getEngineStatus: typeof getEngineStatus;
    initializeEngine: typeof initializeEngine;
    validateUserInput: typeof validateUserInput;
    generatePlanSummary: typeof generatePlanSummary;
};
export default _default;
//# sourceMappingURL=index.d.ts.map