import { medicalClearanceNeeded, weeklyDoseMinutes, levelSessionRange, rpePrimary, hrSecondary, BP_STOP_RULE } from './health-policy';
import { allJointConditions } from '../data/jj-swim-lab-joint-guidance';
import { specialConditionsData } from '../data/special-conditions';
import { calculateExercisePrescription, generateWorkoutBlocks } from './exercise-calculator';
function pickSafeStrokes(orthos) {
    const strokeSet = new Map();
    const strokes = ['freestyle', 'backstroke', 'breaststroke', 'butterfly', 'elementary_backstroke', 'sidestroke'];
    for (const s of strokes)
        strokeSet.set(s, { safe: 0, caution: 0, avoid: 0, mods: new Set() });
    for (const cid of orthos) {
        const cond = allJointConditions.find(c => c.conditionId === cid);
        if (!cond)
            continue;
        for (const s of strokes) {
            const g = cond.swimmingGuidance[s];
            const obj = strokeSet.get(s);
            if (g.level === 'safe')
                obj.safe++;
            if (g.level === 'caution') {
                obj.caution++;
                g.modifications.forEach(m => obj.mods.add(m));
            }
            if (g.level === 'avoid')
                obj.avoid++;
        }
    }
    // 안전한 영법 우선 선택 (avoid가 0인 영법)
    const safeList = strokes.filter(s => strokeSet.get(s).avoid === 0).sort((a, b) => strokeSet.get(b).safe - strokeSet.get(a).safe);
    // 안전한 영법이 없으면 주의 영법 중에서 선택
    return safeList.length > 0 ? safeList : strokes.filter(s => strokeSet.get(s).avoid === 0 && strokeSet.get(s).caution > 0);
}
function handleSpecialConditions(healthData) {
    const { specialConditions } = healthData;
    let strokes = ['freestyle', 'backstroke', 'breaststroke', 'butterfly', 'elementary_backstroke', 'sidestroke'];
    let constraints = [];
    let intensityReduction = 0;
    // 임신 중인 경우
    if (specialConditions?.pregnancy?.isPregnant) {
        const trimester = specialConditions.pregnancy.trimester;
        const conditionData = specialConditionsData.find((data) => data.conditionId === `pregnancy_${trimester}_trimester`);
        if (conditionData) {
            // 임신 중 안전한 영법만 선택
            strokes = ['backstroke', 'elementary_backstroke', 'freestyle'];
            constraints.push('임신 중 안전한 영법만 사용', '과도한 복부 압박 피하기');
            intensityReduction = conditionData.exerciseRestrictions.intensityReduction;
        }
    }
    // 수술 후 재활 중인 경우
    if (specialConditions?.postSurgery?.hasSurgery) {
        const { surgeryType, recoveryStage } = specialConditions.postSurgery;
        const conditionData = specialConditionsData.find((data) => data.conditionId === `post_${surgeryType}_surgery_${recoveryStage}`);
        if (conditionData) {
            // 수술 후 재활 단계에 따른 영법 제한
            if (recoveryStage === 'acute') {
                strokes = ['elementary_backstroke'];
                constraints.push('수술 후 급성기 - 매우 제한적인 운동', '의료진 승인 필요');
                intensityReduction = conditionData.exerciseRestrictions.intensityReduction;
            }
            else if (recoveryStage === 'subacute') {
                strokes = ['elementary_backstroke', 'backstroke'];
                constraints.push('수술 후 아급성기 - 점진적 운동', '통증 시 즉시 중단');
                intensityReduction = conditionData.exerciseRestrictions.intensityReduction;
            }
            else {
                strokes = ['elementary_backstroke', 'backstroke', 'freestyle'];
                constraints.push('수술 후 만성기 - 정상 운동 가능', '의료진 상담 권장');
                intensityReduction = conditionData.exerciseRestrictions.intensityReduction;
            }
        }
    }
    return { strokes, constraints, intensityReduction };
}
function generateStrokePlan(strokes, sessionDuration, swimLevel, grade = '3급', intensityReduction = 0, poolDistance = 25) {
    // 운동량 계산 시스템 사용
    const prescription = calculateExercisePrescription(swimLevel, sessionDuration, strokes, intensityReduction, grade, poolDistance);
    // 워크아웃 블록 생성
    const workoutBlocks = generateWorkoutBlocks(prescription, strokes, poolDistance);
    // StrokeBlock 형식으로 변환
    return workoutBlocks.map(block => ({
        stroke: block.stroke,
        block: block.block,
        distance: block.distance,
        duration: block.duration,
        pace: prescription.strokeDistribution[block.stroke]?.pace
    }));
}
export function buildPlan(i) {
    const clearance = medicalClearanceNeeded(i);
    const weeklyMin = weeklyDoseMinutes(i);
    const [minPer, maxPer] = levelSessionRange(i.swim_profile.level);
    const days = (i.conditions.hypertension !== 'normal') ? 5 : 4;
    // 세션당 시간을 사용자 입력값으로 설정 (최대 50분)
    const perSession = Math.min(50, i.swim_profile.sessionMinutes || 50);
    // 특수 상황 처리
    const specialConditionsResult = handleSpecialConditions(i);
    const strokes = specialConditionsResult.strokes.length > 0 ?
        specialConditionsResult.strokes :
        pickSafeStrokes(i.orthopedics);
    const constraints = [...specialConditionsResult.constraints];
    // 관절질환별 제약사항 수집
    for (const cid of i.orthopedics) {
        const cond = allJointConditions.find(c => c.conditionId === cid);
        if (!cond)
            continue;
        for (const s of ['freestyle', 'backstroke', 'breaststroke']) {
            const g = cond.swimmingGuidance[s];
            if (g.level === 'caution') {
                constraints.push(...g.modifications, ...g.prohibitedMovements.map(p => '피하기: ' + p));
            }
        }
    }
    // 특수 상황에 따른 강도 조정
    const adjustedWeeklyMin = Math.round(weeklyMin * (1 - specialConditionsResult.intensityReduction / 100));
    const adjustedPerSession = Math.min(50, perSession * (1 - specialConditionsResult.intensityReduction / 100));
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const sessions = [];
    // 운동량 계산 시스템으로 전체 운동량 계산
    const exercisePrescription = calculateExercisePrescription(i.swim_profile.level, adjustedPerSession, // 세션당 시간 사용
    strokes, specialConditionsResult.intensityReduction, i.swim_profile.grade || '3급', i.swim_profile.poolDistance || 25);
    for (let d = 0; d < days; d++) {
        const strokePlan = generateStrokePlan(strokes, adjustedPerSession, // 세션당 시간 사용
        i.swim_profile.level, i.swim_profile.grade || '3급', specialConditionsResult.intensityReduction, i.swim_profile.poolDistance || 25);
        // 세션별 총 거리와 시간 계산
        const totalDistance = strokePlan.reduce((sum, block) => sum + (block.distance || 0), 0);
        const totalDuration = strokePlan.reduce((sum, block) => sum + (block.duration || 0), 0);
        const averagePace = totalDistance > 0 ? Math.round((totalDuration * 60) / (totalDistance / 100)) : 0;
        sessions.push({
            day: daysOfWeek[d],
            focus: i.goals,
            stroke_plan: strokePlan,
            constraints: Array.from(new Set(constraints)).slice(0, 8),
            intensity_cues: {
                primary: rpePrimary(),
                secondary: hrSecondary(i)
            },
            stop_rules: [BP_STOP_RULE, 'chest_pain', 'unusual_dyspnea'],
            totalDistance: totalDistance,
            totalDuration: totalDuration,
            averagePace: averagePace,
            intensity: exercisePrescription.intensity
        });
    }
    // 다음 주 조정 결정
    let next;
    if (i.adherence_last_week >= 0.8 && i.symptoms_flags.length === 0) {
        next = Math.random() < 0.5 ? 'progress_+5%' : 'progress_+10%';
    }
    else if (i.adherence_last_week >= 0.6) {
        next = 'maintain';
    }
    else {
        next = Math.random() < 0.5 ? 'deload_-10%' : 'deload_-20%';
    }
    const notes = [
        '수중 HR은 개인차가 큼 — 확실하지 않음',
        ...(i.vitals?.on_beta_blocker ? ['베타차단제 복용: HR 지표 비활성화'] : []),
        ...(strokes.includes('breaststroke') ? ['평영 킥 폭 축소 — 추측입니다'] : []),
        ...(strokes.includes('butterfly') ? ['접영은 고급자만 권장 — 확실하지 않음'] : []),
        ...(specialConditionsResult.intensityReduction > 0 ? [`특수 상황으로 인한 강도 ${specialConditionsResult.intensityReduction}% 감소`] : []),
        '개인차가 있으니 통증이나 불편함이 있으면 즉시 중단하세요'
    ];
    // 의료 확인이 필요한 경우 안전한 프로그램
    const finalSessions = clearance ? [{
            day: 'Mon',
            focus: ['safety_hold'],
            stroke_plan: [
                { stroke: 'elementary_backstroke', block: '10분 매우 가벼운 워밍업', distance: 100, duration: 10, pace: 180 },
                { stroke: 'backstroke', block: '10분 가벼운 운동', distance: 100, duration: 10, pace: 150 }
            ],
            constraints: ['의료확인 필요 플래그: 고혈압 또는 증상', '강도 상승 금지'],
            intensity_cues: { primary: 'RPE 9–10(매우 가벼움)' },
            stop_rules: [BP_STOP_RULE, 'chest_pain', 'unusual_dyspnea'],
            totalDistance: 200,
            totalDuration: 20,
            averagePace: 165,
            intensity: 30
        }] : sessions;
    return {
        microcycle_week: 1,
        weekly_target_min: clearance ? 60 : (adjustedPerSession * days), // 세션당 시간 × 운동일수
        weekly_target_distance: clearance ? 400 : (exercisePrescription.totalDistance * days), // 세션당 거리 × 운동일수
        medical_clearance_required: clearance,
        sessions: finalSessions,
        strength_days: 2,
        next_week_adjustment: next,
        notes,
        exercisePrescription: {
            totalDuration: clearance ? 60 : (adjustedPerSession * days), // 세션당 시간 × 운동일수
            totalDistance: clearance ? 400 : (exercisePrescription.totalDistance * days), // 세션당 거리 × 운동일수
            averagePace: exercisePrescription.pace,
            intensity: exercisePrescription.intensity,
            grade: i.swim_profile.grade || '3급'
        }
    };
}
//# sourceMappingURL=swim-plan.js.map