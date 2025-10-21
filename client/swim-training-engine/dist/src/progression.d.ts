/**
 * 🏊‍♂️ JJ Swim Lab - 진행률 추적 및 조정 로직
 *
 * 📋 **기능:**
 * - 성취율·RPE 기반 자동 증감
 * - 주간 진행률 추적
 * - 다음 주 계획 조정
 * - 개인별 맞춤 조정
 */
import { WeekPlan, ProgressionData, UserInput, SessionSet } from './types';
/**
 * 다음 주 계획 조정
 */
export declare function nextProgression(currentPlan: WeekPlan, progressionData: ProgressionData, userInput: UserInput): WeekPlan;
/**
 * 주간 진행률 계산
 */
export declare function calculateWeeklyProgress(plannedSessions: SessionSet[], completedSessions: SessionSet[]): {
    completionRate: number;
    averageRPE: number;
    notes: string[];
};
/**
 * 개인별 맞춤 조정
 */
export declare function personalizePlan(basePlan: WeekPlan, userProfile: {
    experience: 'beginner' | 'intermediate' | 'advanced';
    age: number;
    health: any;
    preferences: string[];
}): WeekPlan;
/**
 * 목표별 조정
 */
export declare function adjustForGoal(plan: WeekPlan, goal: 'fatloss' | 'endurance' | 'performance'): WeekPlan;
/**
 * 계절별 조정
 */
export declare function adjustForSeason(plan: WeekPlan, season: 'spring' | 'summer' | 'autumn' | 'winter'): WeekPlan;
//# sourceMappingURL=progression.d.ts.map