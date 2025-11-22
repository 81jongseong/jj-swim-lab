"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNextTeachingStep = getNextTeachingStep;
exports.convertTeachingStepToTrainingSet = convertTeachingStepToTrainingSet;
exports.generateProgramFromTeachingMethod = generateProgramFromTeachingMethod;
exports.generateDefaultTechniqueProgram = generateDefaultTechniqueProgram;
const TeachingMethod = require('../models/TeachingMethod').default;
const LEVEL_DISTANCES = {
    beginner: {
        warmup: 200,
        main: 400,
        cooldown: 100,
        totalTarget: 1000
    },
    intermediate: {
        warmup: 300,
        main: 800,
        cooldown: 200,
        totalTarget: 1500
    },
    advanced: {
        warmup: 400,
        main: 1400,
        cooldown: 200,
        totalTarget: 2500
    },
    master: {
        warmup: 500,
        main: 2000,
        cooldown: 300,
        totalTarget: 3000
    }
};
async function getNextTeachingStep(userId, teachingProgress, preferredStrokes = ['freestyle'], currentLevel = 'beginner') {
    try {
        const inProgress = teachingProgress.filter((p) => p.completionRate < 100);
        const preferredInProgress = inProgress.filter((p) => preferredStrokes.includes(p.stroke));
        let targetProgress = null;
        if (preferredInProgress.length > 0) {
            targetProgress = preferredInProgress.sort((a, b) => a.completionRate - b.completionRate)[0];
        }
        else if (inProgress.length > 0) {
            targetProgress = inProgress[0];
        }
        if (!targetProgress) {
            const completedMethodIds = teachingProgress.map((p) => p.methodId.toString());
            const newMethod = await TeachingMethod.findOne({
                _id: { $nin: completedMethodIds },
                targetLevel: { $in: [currentLevel, 'all'] },
                stroke: { $in: preferredStrokes },
                isActive: true
            }).sort({ order: 1 });
            if (!newMethod) {
                console.log('추천할 강습법이 없습니다.');
                return null;
            }
            return {
                methodId: newMethod._id,
                methodName: newMethod.name,
                stroke: newMethod.stroke,
                nextStep: newMethod.steps[0],
                completionRate: 0
            };
        }
        const method = await TeachingMethod.findById(targetProgress.methodId);
        if (!method) {
            console.log('강습법을 찾을 수 없습니다:', targetProgress.methodId);
            return null;
        }
        const completedSteps = targetProgress.completedSteps || [];
        const nextStep = method.steps.find((step) => !completedSteps.includes(step.id || step._id?.toString()));
        if (!nextStep) {
            console.log('모든 단계가 완료되었습니다:', method.name);
            return null;
        }
        return {
            methodId: method._id,
            methodName: method.name,
            stroke: method.stroke,
            nextStep,
            completionRate: targetProgress.completionRate
        };
    }
    catch (error) {
        console.error('다음 단계 추천 실패:', error);
        return null;
    }
}
function convertTeachingStepToTrainingSet(step, stroke, level, poolLength = 25) {
    const distances = LEVEL_DISTANCES[level] || LEVEL_DISTANCES.beginner;
    const description = step.description || '';
    const hasDistance = description.match(/(\d+)m/);
    const hasReps = description.match(/(\d+)회/);
    let distance = hasDistance ? parseInt(hasDistance[1]) : poolLength * 4;
    let reps = hasReps ? parseInt(hasReps[1]) : 4;
    if (level === 'beginner') {
        distance = Math.min(distance, poolLength * 4);
        reps = Math.min(reps, 4);
    }
    else if (level === 'intermediate') {
        distance = Math.min(distance, poolLength * 8);
        reps = Math.min(reps, 6);
    }
    else if (level === 'advanced') {
        distance = Math.min(distance, poolLength * 16);
        reps = Math.min(reps, 8);
    }
    else {
        distance = Math.min(distance, poolLength * 20);
        reps = Math.min(reps, 10);
    }
    if (!hasDistance) {
        const perSetTarget = Math.max(poolLength, Math.round(distances.main / Math.max(reps, 1)));
        distance = Math.min(distance, perSetTarget);
    }
    return {
        type: 'drill',
        distance,
        reps,
        stroke,
        intensity: level === 'beginner' || level === 'intermediate' ? 'easy' : 'moderate',
        pace: 'technique-focus',
        rest: level === 'beginner' ? 30 : (level === 'intermediate' ? 20 : 15),
        description: step.name || '기술 연습',
        focusPoints: step.focusPoints || [step.description],
        equipment: step.equipment || []
    };
}
async function generateProgramFromTeachingMethod(userId, teachingProgress, memberData) {
    try {
        const { currentLevel, preferredStrokes, poolLength, sessionDuration } = memberData;
        const nextRecommendation = await getNextTeachingStep(userId, teachingProgress, preferredStrokes, currentLevel);
        if (!nextRecommendation) {
            console.log('추천할 강습법이 없습니다. 기본 프로그램을 생성합니다.');
            return null;
        }
        const distances = LEVEL_DISTANCES[currentLevel] || LEVEL_DISTANCES.beginner;
        const warmup = {
            type: 'warmup',
            distance: distances.warmup,
            reps: 1,
            stroke: 'freestyle',
            intensity: 'easy',
            pace: 'comfortable',
            rest: 0,
            description: '워밍업 - 편안한 자유형',
            focusPoints: ['호흡 안정화', '스트로크 체크'],
            equipment: []
        };
        const mainSet = convertTeachingStepToTrainingSet(nextRecommendation.nextStep, nextRecommendation.stroke, currentLevel, poolLength);
        const cooldown = {
            type: 'cooldown',
            distance: distances.cooldown,
            reps: 1,
            stroke: 'freestyle',
            intensity: 'easy',
            pace: 'recovery',
            rest: 0,
            description: '쿨다운 - 가벼운 수영',
            focusPoints: ['근육 이완', '호흡 회복'],
            equipment: []
        };
        const totalMeters = warmup.distance + (mainSet.distance * mainSet.reps) + cooldown.distance;
        return {
            summary: `${nextRecommendation.methodName} - ${nextRecommendation.nextStep.name}`,
            planExplanation: `${currentLevel.toUpperCase()} 레벨 회원을 위한 ${nextRecommendation.methodName} 훈련입니다. 현재 진행률: ${nextRecommendation.completionRate}%. 이번 세션에서는 "${nextRecommendation.nextStep.name}" 단계를 중점적으로 연습합니다.`,
            totalDuration: sessionDuration,
            totalMeters,
            blocks: [
                {
                    name: '워밍업',
                    sets: [warmup]
                },
                {
                    name: `메인 세트 - ${nextRecommendation.nextStep.name}`,
                    sets: [mainSet]
                },
                {
                    name: '쿨다운',
                    sets: [cooldown]
                }
            ]
        };
    }
    catch (error) {
        console.error('강습법 기반 프로그램 생성 실패:', error);
        return null;
    }
}
function generateDefaultTechniqueProgram(currentLevel, mainStrokes = ['freestyle'], poolLength = 25, sessionDuration = 60) {
    const distances = LEVEL_DISTANCES[currentLevel] || LEVEL_DISTANCES.beginner;
    const primaryStroke = mainStrokes[0] || 'freestyle';
    const warmup = {
        type: 'warmup',
        distance: distances.warmup,
        reps: 1,
        stroke: 'freestyle',
        intensity: 'easy',
        pace: 'comfortable',
        rest: 0,
        description: '워밍업 - 편안한 자유형',
        focusPoints: ['호흡 안정화', '스트로크 체크'],
        equipment: []
    };
    const mainSet = {
        type: 'drill',
        distance: poolLength * 4,
        reps: Math.ceil(distances.main / (poolLength * 4)),
        stroke: primaryStroke,
        intensity: currentLevel === 'beginner' || currentLevel === 'intermediate' ? 'easy' : 'moderate',
        pace: 'technique-focus',
        rest: currentLevel === 'beginner' ? 30 : (currentLevel === 'intermediate' ? 20 : 15),
        description: `${primaryStroke} 기본 기술 연습`,
        focusPoints: ['스트로크 정확도', '자세 교정', '리듬 유지'],
        equipment: []
    };
    const cooldown = {
        type: 'cooldown',
        distance: distances.cooldown,
        reps: 1,
        stroke: 'freestyle',
        intensity: 'easy',
        pace: 'recovery',
        rest: 0,
        description: '쿨다운 - 가벼운 수영',
        focusPoints: ['근육 이완', '호흡 회복'],
        equipment: []
    };
    const totalMeters = warmup.distance + (mainSet.distance * mainSet.reps) + cooldown.distance;
    return {
        summary: `${currentLevel.toUpperCase()} 레벨 기본 기술 훈련`,
        planExplanation: `${currentLevel.toUpperCase()} 레벨 회원을 위한 ${primaryStroke} 기본 기술 훈련 프로그램입니다. 정확한 자세와 기술 습득에 중점을 둡니다.`,
        totalDuration: sessionDuration,
        totalMeters,
        blocks: [
            {
                name: '워밍업',
                sets: [warmup]
            },
            {
                name: `메인 세트 - ${primaryStroke} 기술 연습`,
                sets: [mainSet]
            },
            {
                name: '쿨다운',
                sets: [cooldown]
            }
        ]
    };
}
//# sourceMappingURL=teachingMethodToProgramConverter.js.map