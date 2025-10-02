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
// 수영 실력별 페이스 기준 (초/100m)
export const PACE_STANDARDS = {
    beginner: {
        freestyle: 120, // 2분/100m
        backstroke: 130, // 2분10초/100m
        breaststroke: 140, // 2분20초/100m
        butterfly: 200, // 3분20초/100m (초급자는 접영 권장 안함)
        elementary_backstroke: 150, // 2분30초/100m
        sidestroke: 160 // 2분40초/100m
    },
    intermediate: {
        freestyle: 90, // 1분30초/100m
        backstroke: 100, // 1분40초/100m
        breaststroke: 110, // 1분50초/100m
        butterfly: 150, // 2분30초/100m
        elementary_backstroke: 120, // 2분/100m
        sidestroke: 130 // 2분10초/100m
    },
    advanced: {
        freestyle: 70, // 1분10초/100m
        backstroke: 80, // 1분20초/100m
        breaststroke: 90, // 1분30초/100m
        butterfly: 120, // 2분/100m
        elementary_backstroke: 100, // 1분40초/100m
        sidestroke: 110 // 1분50초/100m
    }
};
// 급수별 운동 강도 조정 계수
export const GRADE_ADJUSTMENT = {
    '1급': { intensity: 1.0, duration: 1.0, pace: 1.0 },
    '2급': { intensity: 0.9, duration: 0.9, pace: 1.1 },
    '3급': { intensity: 0.8, duration: 0.8, pace: 1.2 },
    '4급': { intensity: 0.7, duration: 0.7, pace: 1.3 },
    '5급': { intensity: 0.6, duration: 0.6, pace: 1.4 }
};
// 거리별 권장 시간 (미터)
export const DISTANCE_RECOMMENDATIONS = {
    beginner: {
        short: { distance: 200, duration: 15 }, // 200m, 15분
        medium: { distance: 400, duration: 25 }, // 400m, 25분
        long: { distance: 600, duration: 35 } // 600m, 35분
    },
    intermediate: {
        short: { distance: 400, duration: 20 }, // 400m, 20분
        medium: { distance: 800, duration: 35 }, // 800m, 35분
        long: { distance: 1200, duration: 50 } // 1200m, 50분
    },
    advanced: {
        short: { distance: 800, duration: 25 }, // 800m, 25분
        medium: { distance: 1500, duration: 45 }, // 1500m, 45분
        long: { distance: 2000, duration: 60 } // 2000m, 60분
    }
};
export function calculateExercisePrescription(swimLevel, targetDuration, availableStrokes, intensityReduction = 0, grade = '3급', poolDistance = 25) {
    // 급수별 조정 계수 적용
    const gradeAdjustment = GRADE_ADJUSTMENT[grade] || GRADE_ADJUSTMENT['3급'];
    // 강도 감소 적용
    const adjustedIntensity = Math.max(0.3, 1 - (intensityReduction / 100));
    // 조정된 운동 시간 계산
    const adjustedDuration = Math.round(targetDuration * gradeAdjustment.duration * adjustedIntensity);
    // 페이스 기준 가져오기
    const paceStandards = PACE_STANDARDS[swimLevel];
    // 영법별 분배 계산
    const strokeDistribution = {};
    // 총 거리 계산 (페이스 기준으로 역산)
    let totalDistance = 0;
    const strokeCount = availableStrokes.length;
    availableStrokes.forEach(stroke => {
        const pace = paceStandards[stroke] * gradeAdjustment.pace;
        const strokeDuration = adjustedDuration / strokeCount;
        const strokeDistance = Math.round((strokeDuration * 60) / pace * 100); // 분을 초로 변환 후 거리 계산
        // 수영장 거리에 맞게 조정 (50m 또는 100m 단위로 조정)
        let adjustedStrokeDistance;
        if (poolDistance === 25) {
            // 25m 수영장은 25m 단위로 조정
            adjustedStrokeDistance = Math.round(strokeDistance / 25) * 25;
        }
        else if (poolDistance === 50) {
            // 50m 수영장은 50m 단위로 조정
            adjustedStrokeDistance = Math.round(strokeDistance / 50) * 50;
        }
        else {
            // 기타 수영장은 50m 단위로 조정 (최소 50m)
            adjustedStrokeDistance = Math.max(50, Math.round(strokeDistance / 50) * 50);
        }
        strokeDistribution[stroke] = {
            distance: adjustedStrokeDistance,
            duration: strokeDuration,
            pace: pace
        };
        totalDistance += adjustedStrokeDistance;
    });
    // 휴식 비율 계산 (초급자일수록 더 많은 휴식)
    const restRatio = swimLevel === 'beginner' ? 0.3 :
        swimLevel === 'intermediate' ? 0.2 : 0.15;
    return {
        totalDuration: adjustedDuration,
        totalDistance: totalDistance,
        pace: Math.round(paceStandards.freestyle * gradeAdjustment.pace),
        intensity: Math.round(adjustedIntensity * 100),
        restRatio: restRatio * 100,
        strokeDistribution
    };
}
export function generateWorkoutBlocks(prescription, availableStrokes, poolDistance = 25) {
    const blocks = [];
    // 워밍업 (총 시간의 20%)
    const warmupDuration = Math.round(prescription.totalDuration * 0.2);
    const warmupDistance = Math.round(warmupDuration * 60 / PACE_STANDARDS.beginner.elementary_backstroke * 100);
    // 거리를 50m 또는 100m 단위로 조정
    let adjustedWarmupDistance;
    if (poolDistance === 25) {
        adjustedWarmupDistance = Math.round(warmupDistance / 25) * 25;
    }
    else if (poolDistance === 50) {
        adjustedWarmupDistance = Math.round(warmupDistance / 50) * 50;
    }
    else {
        adjustedWarmupDistance = Math.max(50, Math.round(warmupDistance / 50) * 50);
    }
    blocks.push({
        stroke: 'elementary_backstroke',
        block: `${adjustedWarmupDistance}m 워밍업 (${warmupDuration}분)`,
        distance: adjustedWarmupDistance,
        duration: warmupDuration
    });
    // 메인 세트 (총 시간의 60%)
    const mainDuration = Math.round(prescription.totalDuration * 0.6);
    const mainDistance = Math.round(prescription.totalDistance * 0.6);
    availableStrokes.forEach(stroke => {
        const strokeData = prescription.strokeDistribution[stroke];
        if (strokeData) {
            const blockDuration = Math.round(mainDuration / availableStrokes.length);
            const blockDistance = Math.round(strokeData.distance * 0.6);
            // 거리를 50m 또는 100m 단위로 조정
            let adjustedBlockDistance;
            if (poolDistance === 25) {
                adjustedBlockDistance = Math.round(blockDistance / 25) * 25;
            }
            else if (poolDistance === 50) {
                adjustedBlockDistance = Math.round(blockDistance / 50) * 50;
            }
            else {
                adjustedBlockDistance = Math.max(50, Math.round(blockDistance / 50) * 50);
            }
            blocks.push({
                stroke: stroke,
                block: `${adjustedBlockDistance}m @${Math.round(strokeData.pace)}초/100m`,
                distance: adjustedBlockDistance,
                duration: blockDuration
            });
        }
    });
    // 쿨다운 (총 시간의 20%)
    const cooldownDuration = Math.round(prescription.totalDuration * 0.2);
    const cooldownDistance = Math.round(cooldownDuration * 60 / PACE_STANDARDS.beginner.elementary_backstroke * 100);
    // 거리를 50m 또는 100m 단위로 조정
    let adjustedCooldownDistance;
    if (poolDistance === 25) {
        adjustedCooldownDistance = Math.round(cooldownDistance / 25) * 25;
    }
    else if (poolDistance === 50) {
        adjustedCooldownDistance = Math.round(cooldownDistance / 50) * 50;
    }
    else {
        adjustedCooldownDistance = Math.max(50, Math.round(cooldownDistance / 50) * 50);
    }
    blocks.push({
        stroke: 'elementary_backstroke',
        block: `${adjustedCooldownDistance}m 쿨다운 (${cooldownDuration}분)`,
        distance: adjustedCooldownDistance,
        duration: cooldownDuration
    });
    return blocks;
}
export function getPaceDescription(pace) {
    if (pace <= 80)
        return '매우 빠름 (경쟁 수준)';
    if (pace <= 100)
        return '빠름 (고급자)';
    if (pace <= 120)
        return '보통 (중급자)';
    if (pace <= 140)
        return '느림 (초급자)';
    return '매우 느림 (입문자)';
}
export function getIntensityDescription(intensity) {
    if (intensity >= 80)
        return '고강도';
    if (intensity >= 60)
        return '중강도';
    if (intensity >= 40)
        return '저강도';
    return '매우 저강도';
}
//# sourceMappingURL=exercise-calculator.js.map