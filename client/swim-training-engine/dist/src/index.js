/**
 * 🏊‍♂️ JJ Swim Lab - 메인 인덱스
 *
 * 📋 **기능:**
 * - 모든 모듈 통합 및 내보내기
 * - 기존 엔진과의 호환성 유지
 * - 새로운 엔진 기능 제공
 */
// 타입 정의
export * from './types';
// 페이스 및 훈련존
export * from './pace';
// 훈련법 및 드릴 카탈로그
export * from './training_methods';
export * from './drills';
// 건강 규칙 및 안전 게이트
export * from './health_rules';
// 세션 생성 알고리즘
export * from './planner';
// 진행률 추적 및 조정
export * from './progression';
// 기존 엔진과의 호환성을 위한 함수들
import { buildWeek } from './planner';
/**
 * 기존 엔진과의 호환성을 위한 buildPlan 함수
 */
export function buildPlan(input) {
    try {
        // 기존 입력 형식을 새 형식으로 변환
        const newInput = {
            demographics: {
                age: input.age || 30,
                sex: input.sex || 'M'
            },
            health: {
                hypertension: input.conditions?.hypertension !== 'normal',
                obesity: input.conditions?.obesity !== 'normal',
                dyslipidemia: input.conditions?.dyslipidemia,
                diabetes: input.conditions?.diabetes,
                jointConditions: input.orthopedics || []
            },
            technique: {},
            pace: {
                cssSecPer100: input.pace?.cssSecPer100 || 95,
                best100Sec: input.pace?.best100Sec,
                z2SecPer100: input.pace?.z2SecPer100,
                band: input.pace?.band
            },
            avail: {
                pool: input.pool?.length || 25,
                daysPerWeek: input.avail?.daysPerWeek || 3,
                sessionMinutes: input.avail?.sessionMinutes || 45
            },
            goal: input.goals?.includes('체중 감량') ? 'fatloss' :
                input.goals?.includes('기록 향상') ? 'performance' : 'endurance',
            stroke: 'FR' // 기본값
        };
        const weekPlan = buildWeek(newInput);
        // 기존 출력 형식으로 변환
        return {
            microcycle_week: 1,
            weekly_target_min: weekPlan.summary.totalMeters / 25, // 대략적 분 계산
            weekly_target_distance: weekPlan.summary.totalMeters,
            medical_clearance_required: false,
            sessions: weekPlan.sessions.map(session => ({
                day: `Day ${session.dayIndex + 1}`,
                sessionType: 'Mixed',
                intensity: 70,
                exercises: session.sets.map(set => ({
                    stroke: 'freestyle',
                    distance: set.distance,
                    sets: set.reps,
                    rest: set.restSec
                }))
            })),
            strength_days: 0,
            next_week_adjustment: 'maintain',
            notes: weekPlan.sessions.flatMap(s => s.safetyBadges),
            exercisePrescription: {
                totalDuration: weekPlan.summary.totalMeters / 25,
                totalDistance: weekPlan.summary.totalMeters,
                averagePace: 95,
                intensity: 70,
                grade: 'intermediate'
            }
        };
    }
    catch (error) {
        console.error('Plan generation error:', error);
        throw new Error('Failed to generate swim plan');
    }
}
/**
 * 엔진 상태 확인
 */
export function getEngineStatus() {
    return {
        status: 'ready',
        version: '2.0.0',
        modules: [
            'types',
            'pace',
            'training_methods',
            'drills',
            'health_rules',
            'planner',
            'progression'
        ],
        lastUpdated: new Date().toISOString()
    };
}
/**
 * 엔진 초기화
 */
export function initializeEngine() {
    return new Promise((resolve) => {
        try {
            // 엔진 초기화 로직
            console.log('🏊‍♂️ JJ Swim Lab Engine 초기화 중...');
            // 모듈 로드 확인
            const status = getEngineStatus();
            if (status.status === 'ready') {
                console.log('✅ 엔진 초기화 완료');
                resolve(true);
            }
            else {
                console.error('❌ 엔진 초기화 실패');
                resolve(false);
            }
        }
        catch (error) {
            console.error('❌ 엔진 초기화 오류:', error);
            resolve(false);
        }
    });
}
/**
 * 사용자 입력 검증
 */
export function validateUserInput(input) {
    const errors = [];
    const warnings = [];
    // 필수 필드 검증
    if (!input.demographics?.age) {
        errors.push('나이가 필요합니다.');
    }
    if (!input.demographics?.sex) {
        errors.push('성별이 필요합니다.');
    }
    if (!input.avail?.daysPerWeek) {
        errors.push('주당 운동 일수가 필요합니다.');
    }
    if (!input.avail?.sessionMinutes) {
        errors.push('세션 시간이 필요합니다.');
    }
    // 경고 사항
    if (input.demographics?.age && input.demographics.age < 18) {
        warnings.push('18세 미만은 의료진 상담이 필요합니다.');
    }
    if (input.demographics?.age && input.demographics.age > 65) {
        warnings.push('65세 이상은 의료진 상담을 권장합니다.');
    }
    if (input.health?.pregnancy) {
        warnings.push('임신 중에는 의료진 상담이 필요합니다.');
    }
    if (input.health?.hypertension) {
        warnings.push('고혈압 환자는 의료진 상담을 권장합니다.');
    }
    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
}
/**
 * 계획 생성 (새로운 API)
 */
export function generateSwimPlan(input) {
    try {
        // 입력 검증
        const validation = validateUserInput(input);
        if (!validation.isValid) {
            throw new Error(`입력 검증 실패: ${validation.errors.join(', ')}`);
        }
        // 경고 사항 출력
        if (validation.warnings.length > 0) {
            console.warn('⚠️ 경고 사항:', validation.warnings);
        }
        // 계획 생성
        const plan = buildWeek(input);
        console.log('✅ 수영 계획 생성 완료');
        return plan;
    }
    catch (error) {
        console.error('❌ 계획 생성 오류:', error);
        throw error;
    }
}
/**
 * 계획 요약 생성
 */
export function generatePlanSummary(plan) {
    const totalMeters = plan.summary.totalMeters;
    const totalSessions = plan.summary.sessions;
    const averageSessionMeters = Math.round(totalMeters / totalSessions);
    const zoneDistribution = Object.entries(plan.summary.zoneDist).reduce((acc, [zone, meters]) => {
        acc[zone] = Math.round((meters / totalMeters) * 100);
        return acc;
    }, {});
    const safetyNotes = plan.sessions.flatMap(session => session.safetyBadges);
    return {
        totalMeters,
        totalSessions,
        averageSessionMeters,
        zoneDistribution,
        safetyNotes
    };
}
// 기본 내보내기
export default {
    buildPlan,
    buildWeek,
    generateSwimPlan,
    getEngineStatus,
    initializeEngine,
    validateUserInput,
    generatePlanSummary
};
//# sourceMappingURL=index.js.map