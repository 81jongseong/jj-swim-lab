"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateProgramByLevel = exports.generateAdvancedCSSProgram = exports.calculatePaceFromCSS = void 0;
function calculatePaceFromCSS(cssPer100, intensity) {
    const intensityMultipliers = {
        recovery: 1.3,
        easy: 1.2,
        moderate: 1.1,
        hard: 0.95,
        very_hard: 0.9
    };
    const adjustedCSS = cssPer100 * intensityMultipliers[intensity];
    const minutes = Math.floor(adjustedCSS / 60);
    const seconds = Math.round(adjustedCSS % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}/100m`;
}
exports.calculatePaceFromCSS = calculatePaceFromCSS;
const ADVANCED_LEVEL_DISTANCES = {
    advanced: {
        warmup: 600,
        main: 2000,
        cooldown: 400,
        totalTarget: 3500,
        intervalDistance: 100,
        intervalReps: 8,
        paceWorkDistance: 400,
        paceWorkReps: 4
    },
    advanced_1: {
        warmup: 800,
        main: 2500,
        cooldown: 500,
        totalTarget: 4000,
        intervalDistance: 100,
        intervalReps: 10,
        paceWorkDistance: 500,
        paceWorkReps: 5
    },
    advanced_2: {
        warmup: 1000,
        main: 3000,
        cooldown: 600,
        totalTarget: 5000,
        intervalDistance: 150,
        intervalReps: 8,
        paceWorkDistance: 600,
        paceWorkReps: 4
    },
    master: {
        warmup: 1200,
        main: 3500,
        cooldown: 800,
        totalTarget: 6000,
        intervalDistance: 200,
        intervalReps: 6,
        paceWorkDistance: 800,
        paceWorkReps: 4
    },
    expert: {
        warmup: 1500,
        main: 4000,
        cooldown: 1000,
        totalTarget: 7000,
        intervalDistance: 200,
        intervalReps: 8,
        paceWorkDistance: 1000,
        paceWorkReps: 4
    }
};
function generateAdvancedCSSProgram(memberData) {
    const { currentLevel, cssPer100 = {}, mainStrokes, excludedStrokes, poolLength, sessionDuration, goal } = memberData;
    const distances = ADVANCED_LEVEL_DISTANCES[currentLevel] || ADVANCED_LEVEL_DISTANCES.advanced;
    const primaryStroke = mainStrokes.find(stroke => cssPer100[stroke]) || mainStrokes[0] || 'freestyle';
    const primaryCSS = cssPer100[primaryStroke] || 90;
    const availableStrokes = mainStrokes.filter(stroke => !excludedStrokes.includes(stroke));
    const sessions = [];
    const sessionTypes = ['interval', 'pace', 'endurance'];
    const dayNames = ['화요일', '목요일', '토요일'];
    for (let i = 0; i < 3; i++) {
        const sessionType = sessionTypes[i];
        const dayName = dayNames[i];
        let blocks = [];
        let totalDistance = 0;
        const warmupDistance = distances.warmup;
        blocks.push({
            type: 'warmup',
            description: `${warmupDistance}m 자유형 이지 스윔`,
            duration: Math.round((warmupDistance / 25) * 2),
            distance: warmupDistance,
            whyPace: '부드러운 스트로크로 근육과 관절을 준비합니다',
            whyRest: '워밍업은 휴식 없이 연속으로 진행',
            whySet: '점진적 강도 증가로 부상 방지',
            evidenceKeys: ['warmup_benefits', 'injury_prevention']
        });
        totalDistance += warmupDistance;
        if (sessionType === 'interval') {
            const intervalDistance = distances.intervalDistance;
            const intervalReps = distances.intervalReps;
            const intervalPace = calculatePaceFromCSS(primaryCSS, 'hard');
            blocks.push({
                type: 'main',
                description: `${intervalDistance}m 빠른 인터벌 (${intervalDistance}m × ${intervalReps}회)`,
                duration: Math.round((intervalDistance * intervalReps / 25) * 1.5),
                distance: intervalDistance * intervalReps,
                whyPace: `CSS ${primaryCSS}초 기준 빠른 페이스 (${intervalPace})로 유산소 능력 향상`,
                whyRest: '20-30초 휴식으로 젖산 제거와 다음 세트 준비',
                whySet: `${intervalReps}회 반복으로 VO2max 향상과 지구력 개발`,
                evidenceKeys: ['interval_training', 'vo2max_improvement', 'lactate_tolerance']
            });
            totalDistance += intervalDistance * intervalReps;
        }
        else if (sessionType === 'pace') {
            const paceDistance = distances.paceWorkDistance;
            const paceReps = distances.paceWorkReps;
            const paceTime = calculatePaceFromCSS(primaryCSS, 'moderate');
            blocks.push({
                type: 'main',
                description: `${paceDistance}m freestyle CSS 페이스 훈련`,
                duration: Math.round((paceDistance * paceReps / 25) * (primaryCSS / 60)),
                distance: paceDistance * paceReps,
                whyPace: `CSS 기준 페이스 (${paceTime})로 경기 속도 감각 익히기`,
                whyRest: '60-90초 휴식으로 충분한 회복 후 일관된 페이스 유지',
                whySet: `${paceReps}회 반복으로 페이스 판단력과 지구력 향상`,
                evidenceKeys: ['pace_training', 'race_pace_familiarity', 'mental_toughness']
            });
            totalDistance += paceDistance * paceReps;
        }
        else if (sessionType === 'endurance') {
            const enduranceDistance = distances.main;
            const endurancePace = calculatePaceFromCSS(primaryCSS, 'easy');
            blocks.push({
                type: 'main',
                description: `${enduranceDistance}m 자유형 지속 훈련`,
                duration: Math.round((enduranceDistance / 25) * (primaryCSS / 60) * 1.2),
                distance: enduranceDistance,
                whyPace: `편안한 페이스 (${endurancePace})로 장시간 지속 가능한 속도`,
                whyRest: '연속 수영으로 근지구력과 심폐지구력 개발',
                whySet: '장거리 지속 훈련으로 기초 체력 강화',
                evidenceKeys: ['endurance_training', 'aerobic_base', 'fat_burning']
            });
            totalDistance += enduranceDistance;
        }
        if (availableStrokes.length > 1) {
            const secondaryStroke = availableStrokes.find(stroke => stroke !== primaryStroke) || 'backstroke';
            const secondaryCSS = cssPer100[secondaryStroke] || primaryCSS + 10;
            const secondaryDistance = Math.min(400, distances.main * 0.2);
            const secondaryPace = calculatePaceFromCSS(secondaryCSS, 'easy');
            blocks.push({
                type: 'secondary',
                description: `${secondaryDistance}m ${secondaryStroke} 보조 훈련`,
                duration: Math.round((secondaryDistance / 25) * (secondaryCSS / 60)),
                distance: secondaryDistance,
                whyPace: `${secondaryStroke} 영법 다양화로 전신 균형 발달`,
                whyRest: '30-45초 휴식으로 영법 전환 시간 확보',
                whySet: '주 영법 외 보조 영법 연습으로 전반적 실력 향상',
                evidenceKeys: ['stroke_variety', 'muscle_balance', 'technique_diversity']
            });
            totalDistance += secondaryDistance;
        }
        const cooldownDistance = distances.cooldown;
        blocks.push({
            type: 'cooldown',
            description: `${cooldownDistance}m 자유형 천천히`,
            duration: Math.round((cooldownDistance / 25) * 3),
            distance: cooldownDistance,
            whyPace: '매우 편안한 페이스로 심박수 점진적 감소',
            whyRest: '휴식 없이 연속으로 진행',
            whySet: '근육 이완과 젖산 제거를 위한 필수 과정',
            evidenceKeys: ['cool_down_benefits', 'recovery_optimization', 'lactate_removal']
        });
        totalDistance += cooldownDistance;
        sessions.push({
            day: dayName,
            date: new Date(Date.now() + i * 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            themeDesc: sessionType === 'interval' ? '인터벌 훈련' :
                sessionType === 'pace' ? '페이스 훈련' : '체력 훈련',
            duration: sessionDuration,
            distance: totalDistance,
            intensity: sessionType === 'interval' ? 'high' :
                sessionType === 'pace' ? 'moderate' : 'low',
            blocks
        });
    }
    const totalMeters = sessions.reduce((sum, session) => sum + session.distance, 0);
    return {
        summary: `${currentLevel.toUpperCase()} ${primaryStroke} CSS 기반 고급 훈련 프로그램`,
        planExplanation: `${currentLevel.toUpperCase()} 레벨 회원을 위한 CSS 기반 과학적 훈련 프로그램입니다. ${primaryStroke} CSS ${primaryCSS}초를 기준으로 인터벌, 페이스, 체력 훈련을 조합하여 유산소 능력, 페이스 판단력, 근지구력을 종합적으로 향상시킵니다.`,
        totalDuration: sessionDuration * 3,
        totalMeters,
        sessions
    };
}
exports.generateAdvancedCSSProgram = generateAdvancedCSSProgram;
function generateProgramByLevel(memberData) {
    const { currentLevel, cssPer100 = {} } = memberData;
    if (['advanced', 'advanced_1', 'advanced_2', 'master', 'expert'].includes(currentLevel)) {
        const hasCSS = Object.values(cssPer100).some(css => css && css > 0);
        if (hasCSS) {
            console.log('🎯 CSS 기반 고급 프로그램 생성');
            return generateAdvancedCSSProgram(memberData);
        }
    }
    console.log('📚 기본 기술 프로그램 생성');
    return generateDefaultTechniqueProgram(currentLevel, memberData.mainStrokes, memberData.poolLength, memberData.sessionDuration);
}
exports.generateProgramByLevel = generateProgramByLevel;
function generateDefaultTechniqueProgram(currentLevel, mainStrokes, poolLength, sessionDuration) {
    const distances = {
        beginner: { warmup: 200, main: 400, cooldown: 100, totalTarget: 1000 },
        intermediate: { warmup: 300, main: 800, cooldown: 200, totalTarget: 1500 },
        advanced: { warmup: 400, main: 1400, cooldown: 200, totalTarget: 2500 },
        master: { warmup: 500, main: 2000, cooldown: 300, totalTarget: 3000 }
    };
    const levelDistances = distances[currentLevel] || distances.beginner;
    const primaryStroke = mainStrokes[0] || 'freestyle';
    const sessions = [];
    const dayNames = ['화요일', '목요일', '토요일'];
    for (let i = 0; i < 3; i++) {
        const dayName = dayNames[i];
        const blocks = [
            {
                type: 'warmup',
                description: `${levelDistances.warmup}m 자유형 이지 스윔`,
                duration: Math.round((levelDistances.warmup / 25) * 2),
                distance: levelDistances.warmup,
                whyPace: '부드러운 스트로크로 근육과 관절을 준비합니다',
                whyRest: '워밍업은 휴식 없이 연속으로 진행',
                whySet: '점진적 강도 증가로 부상 방지',
                evidenceKeys: ['warmup_benefits', 'injury_prevention']
            },
            {
                type: 'main',
                description: `${levelDistances.main}m freestyle CSS 페이스 훈련`,
                duration: Math.round((levelDistances.main / 25) * 2),
                distance: levelDistances.main,
                whyPace: '기본 기술 습득과 체력 향상에 중점',
                whyRest: '30-45초 휴식으로 충분한 회복',
                whySet: '기술 정확도와 지구력 동시 개발',
                evidenceKeys: ['basic_technique', 'endurance_building']
            },
            {
                type: 'cooldown',
                description: `${levelDistances.cooldown}m 자유형 천천히`,
                duration: Math.round((levelDistances.cooldown / 25) * 3),
                distance: levelDistances.cooldown,
                whyPace: '매우 편안한 페이스로 심박수 점진적 감소',
                whyRest: '휴식 없이 연속으로 진행',
                whySet: '근육 이완과 회복을 위한 필수 과정',
                evidenceKeys: ['cool_down_benefits', 'recovery_optimization']
            }
        ];
        sessions.push({
            day: dayName,
            date: new Date(Date.now() + i * 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            themeDesc: '기본 기술 훈련',
            duration: sessionDuration,
            distance: levelDistances.warmup + levelDistances.main + levelDistances.cooldown,
            intensity: currentLevel === 'beginner' ? 'low' : 'moderate',
            blocks
        });
    }
    const totalMeters = sessions.reduce((sum, session) => sum + session.distance, 0);
    return {
        summary: `${currentLevel.toUpperCase()} 레벨 기본 기술 훈련 프로그램`,
        planExplanation: `${currentLevel.toUpperCase()} 레벨 회원을 위한 기본 기술 훈련 프로그램입니다. 정확한 자세와 기술 습득에 중점을 둡니다.`,
        totalDuration: sessionDuration * 3,
        totalMeters,
        sessions
    };
}
//# sourceMappingURL=advancedProgramGenerator.js.map