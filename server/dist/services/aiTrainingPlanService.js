"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AITrainingPlanService = void 0;
const TrainingPlan_1 = require("../models/TrainingPlan");
class AITrainingPlanService {
    static async generatePersonalizedPlan(request) {
        try {
            const profileAnalysis = this.analyzeUserProfile(request.userProfile);
            const goalAnalysis = this.analyzeGoals(request.goals, request.userProfile);
            const skillAnalysis = this.analyzeCurrentSkills(request.currentAssessment);
            const aiAnalysis = this.performAIAnalysis(profileAnalysis, goalAnalysis, skillAnalysis);
            const weeklyPlans = this.generateWeeklyPlans(aiAnalysis, request);
            const trainingPlan = new TrainingPlan_1.TrainingPlan({
                userId: request.userId,
                title: this.generatePlanTitle(request.goals.primary, request.userProfile.currentLevel),
                description: this.generatePlanDescription(request.goals, aiAnalysis),
                userProfile: request.userProfile,
                goals: request.goals,
                currentAssessment: {
                    ...request.currentAssessment,
                    overallScore: skillAnalysis.overallScore
                },
                planDetails: {
                    duration: aiAnalysis.recommendedDuration,
                    sessionsPerWeek: aiAnalysis.sessionsPerWeek,
                    totalSessions: aiAnalysis.recommendedDuration * aiAnalysis.sessionsPerWeek,
                    weeklyPlans: weeklyPlans,
                    progressionStrategy: this.generateProgressionStrategy(aiAnalysis),
                    adaptationRules: this.generateAdaptationRules(request.userProfile, aiAnalysis)
                },
                progress: {
                    currentWeek: 1,
                    currentSession: 1,
                    completedSessions: 0,
                    totalSessions: aiAnalysis.recommendedDuration * aiAnalysis.sessionsPerWeek,
                    adherenceRate: 0,
                    performanceMetrics: []
                },
                aiAnalysis: {
                    lastAnalysisDate: new Date(),
                    performanceTrend: 'stable',
                    recommendedAdjustments: [],
                    riskFactors: aiAnalysis.riskFactors,
                    strengthAreas: skillAnalysis.strengths,
                    improvementAreas: skillAnalysis.weaknesses,
                    nextReviewDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                }
            });
            return await trainingPlan.save();
        }
        catch (error) {
            console.error('AI 훈련 계획 생성 오류:', error);
            throw new Error('훈련 계획 생성에 실패했습니다.');
        }
    }
    static analyzeUserProfile(profile) {
        const analysis = {
            fitnessLevel: this.calculateFitnessLevel(profile),
            timeConstraints: this.analyzeTimeConstraints(profile),
            physicalConstraints: this.analyzePhysicalConstraints(profile),
            motivationLevel: this.assessMotivationLevel(profile)
        };
        return analysis;
    }
    static calculateFitnessLevel(profile) {
        let score = 0;
        score += Math.min(profile.experience * 2, 30);
        if (profile.age <= 25)
            score += 20;
        else if (profile.age <= 35)
            score += 15;
        else if (profile.age <= 45)
            score += 10;
        else if (profile.age <= 55)
            score += 5;
        switch (profile.currentLevel) {
            case TrainingPlan_1.TrainingIntensity.PROFESSIONAL:
                score += 30;
                break;
            case TrainingPlan_1.TrainingIntensity.ADVANCED:
                score += 25;
                break;
            case TrainingPlan_1.TrainingIntensity.INTERMEDIATE:
                score += 15;
                break;
            case TrainingPlan_1.TrainingIntensity.BEGINNER:
                score += 5;
                break;
        }
        score += Math.min(profile.availableTime, 20);
        return Math.min(score, 100);
    }
    static analyzeTimeConstraints(profile) {
        return {
            weeklyHours: profile.availableTime,
            preferredDays: profile.preferredDays,
            preferredTimes: profile.preferredTimes,
            flexibility: profile.preferredDays.length >= 4 ? 'high' : 'low'
        };
    }
    static analyzePhysicalConstraints(profile) {
        const bmi = profile.weight / Math.pow(profile.height / 100, 2);
        return {
            bmi: bmi,
            bmiCategory: this.getBMICategory(bmi),
            medicalConstraints: profile.medicalConditions,
            ageGroup: this.getAgeGroup(profile.age),
            hasConstraints: profile.medicalConditions.length > 0
        };
    }
    static getBMICategory(bmi) {
        if (bmi < 18.5)
            return 'underweight';
        if (bmi < 25)
            return 'normal';
        if (bmi < 30)
            return 'overweight';
        return 'obese';
    }
    static getAgeGroup(age) {
        if (age < 18)
            return 'youth';
        if (age < 30)
            return 'young_adult';
        if (age < 50)
            return 'adult';
        return 'senior';
    }
    static assessMotivationLevel(profile) {
        let score = 0;
        score += profile.availableTime >= 10 ? 2 : profile.availableTime >= 5 ? 1 : 0;
        score += profile.preferredDays.length >= 5 ? 2 : profile.preferredDays.length >= 3 ? 1 : 0;
        if (score >= 3)
            return 'high';
        if (score >= 2)
            return 'medium';
        return 'low';
    }
    static analyzeGoals(goals, profile) {
        const targetDate = new Date(goals.targetDate);
        const now = new Date();
        const weeksAvailable = Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 7));
        return {
            primaryGoal: goals.primary,
            secondaryGoals: goals.secondary,
            timeframe: weeksAvailable,
            urgency: weeksAvailable <= 8 ? 'high' : weeksAvailable <= 16 ? 'medium' : 'low',
            specificity: goals.specificTargets ? 'specific' : 'general',
            difficulty: this.assessGoalDifficulty(goals, profile)
        };
    }
    static assessGoalDifficulty(goals, profile) {
        let difficulty = 0;
        switch (goals.primary) {
            case TrainingPlan_1.TrainingGoal.COMPETITION:
                difficulty += 3;
                break;
            case TrainingPlan_1.TrainingGoal.SPEED:
                difficulty += 2;
                break;
            case TrainingPlan_1.TrainingGoal.TECHNIQUE:
                difficulty += 2;
                break;
            case TrainingPlan_1.TrainingGoal.ENDURANCE:
                difficulty += 1;
                break;
            case TrainingPlan_1.TrainingGoal.FITNESS:
                difficulty += 1;
                break;
            case TrainingPlan_1.TrainingGoal.REHABILITATION:
                difficulty += 2;
                break;
        }
        if (profile.currentLevel === TrainingPlan_1.TrainingIntensity.BEGINNER && difficulty >= 2)
            difficulty += 1;
        if (profile.currentLevel === TrainingPlan_1.TrainingIntensity.PROFESSIONAL && difficulty <= 2)
            difficulty -= 1;
        if (difficulty >= 4)
            return 'very_high';
        if (difficulty >= 3)
            return 'high';
        if (difficulty >= 2)
            return 'medium';
        return 'low';
    }
    static analyzeCurrentSkills(assessment) {
        const techniqueAvg = (assessment.technique.freestyle +
            assessment.technique.backstroke +
            assessment.technique.breaststroke +
            assessment.technique.butterfly) / 4;
        const overallScore = Math.round((techniqueAvg * 0.3 +
            assessment.endurance * 0.25 +
            assessment.speed * 0.25 +
            assessment.flexibility * 0.1 +
            assessment.strength * 0.1) * 10);
        const strengths = [];
        const weaknesses = [];
        if (assessment.technique.freestyle >= 8)
            strengths.push('자유형 기술');
        if (assessment.technique.backstroke >= 8)
            strengths.push('배영 기술');
        if (assessment.technique.breaststroke >= 8)
            strengths.push('평영 기술');
        if (assessment.technique.butterfly >= 8)
            strengths.push('접영 기술');
        if (assessment.endurance >= 8)
            strengths.push('지구력');
        if (assessment.speed >= 8)
            strengths.push('순간 속력');
        if (assessment.flexibility >= 8)
            strengths.push('유연성');
        if (assessment.strength >= 8)
            strengths.push('근력');
        if (assessment.technique.freestyle <= 4)
            weaknesses.push('자유형 기술');
        if (assessment.technique.backstroke <= 4)
            weaknesses.push('배영 기술');
        if (assessment.technique.breaststroke <= 4)
            weaknesses.push('평영 기술');
        if (assessment.technique.butterfly <= 4)
            weaknesses.push('접영 기술');
        if (assessment.endurance <= 4)
            weaknesses.push('지구력');
        if (assessment.speed <= 4)
            weaknesses.push('순간 속력');
        if (assessment.flexibility <= 4)
            weaknesses.push('유연성');
        if (assessment.strength <= 4)
            weaknesses.push('근력');
        return {
            overallScore,
            techniqueScore: Math.round(techniqueAvg * 10),
            strengths,
            weaknesses,
            dominantStroke: this.findDominantStroke(assessment.technique),
            needsImprovement: weaknesses.length > 0
        };
    }
    static findDominantStroke(technique) {
        const scores = {
            [TrainingPlan_1.SwimmingStroke.FREESTYLE]: technique.freestyle,
            [TrainingPlan_1.SwimmingStroke.BACKSTROKE]: technique.backstroke,
            [TrainingPlan_1.SwimmingStroke.BREASTSTROKE]: technique.breaststroke,
            [TrainingPlan_1.SwimmingStroke.BUTTERFLY]: technique.butterfly
        };
        return Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
    }
    static performAIAnalysis(profileAnalysis, goalAnalysis, skillAnalysis) {
        const recommendedDuration = this.calculateRecommendedDuration(goalAnalysis, profileAnalysis);
        const sessionsPerWeek = this.calculateSessionsPerWeek(profileAnalysis, goalAnalysis);
        const intensityProgression = this.generateIntensityProgression(recommendedDuration, profileAnalysis, goalAnalysis);
        const focusAreas = this.identifyFocusAreas(goalAnalysis, skillAnalysis);
        const riskFactors = this.identifyRiskFactors(profileAnalysis, goalAnalysis);
        const expectedOutcomes = this.predictOutcomes(goalAnalysis, skillAnalysis, recommendedDuration);
        return {
            recommendedDuration,
            sessionsPerWeek,
            intensityProgression,
            focusAreas,
            riskFactors,
            expectedOutcomes
        };
    }
    static calculateRecommendedDuration(goalAnalysis, profileAnalysis) {
        void profileAnalysis;
        let duration = goalAnalysis.timeframe;
        duration = Math.max(4, Math.min(duration, 52));
        if (goalAnalysis.difficulty === 'very_high' && duration < 12)
            duration = 12;
        if (goalAnalysis.difficulty === 'high' && duration < 8)
            duration = 8;
        return duration;
    }
    static calculateSessionsPerWeek(profileAnalysis, goalAnalysis) {
        const maxSessions = Math.floor(profileAnalysis.timeConstraints.weeklyHours / 1.5);
        let sessions = Math.min(maxSessions, profileAnalysis.timeConstraints.preferredDays.length);
        if (goalAnalysis.primaryGoal === TrainingPlan_1.TrainingGoal.COMPETITION)
            sessions = Math.max(sessions, 4);
        if (goalAnalysis.primaryGoal === TrainingPlan_1.TrainingGoal.FITNESS)
            sessions = Math.max(sessions, 2);
        return Math.max(2, Math.min(sessions, 6));
    }
    static generateIntensityProgression(duration, profileAnalysis, goalAnalysis) {
        const progression = [];
        const baseIntensity = profileAnalysis.fitnessLevel / 100 * 10;
        void goalAnalysis;
        for (let week = 1; week <= duration; week++) {
            let intensity = baseIntensity;
            if (week <= duration * 0.7) {
                intensity += (week / (duration * 0.7)) * 2;
            }
            if (week > duration * 0.7 && week <= duration * 0.9) {
                intensity = Math.min(intensity + 2, 10);
            }
            if (week > duration * 0.9) {
                intensity = Math.max(intensity - 1, baseIntensity);
            }
            progression.push(Math.round(Math.max(1, Math.min(intensity, 10))));
        }
        return progression;
    }
    static identifyFocusAreas(goalAnalysis, skillAnalysis) {
        const areas = [];
        switch (goalAnalysis.primaryGoal) {
            case TrainingPlan_1.TrainingGoal.TECHNIQUE:
                areas.push('영법 기술', '호흡 패턴', '스트로크 효율성');
                break;
            case TrainingPlan_1.TrainingGoal.SPEED:
                areas.push('순간 속력', '스타트 기술', '턴 기술');
                break;
            case TrainingPlan_1.TrainingGoal.ENDURANCE:
                areas.push('유산소 능력', '페이싱', '장거리 기술');
                break;
            case TrainingPlan_1.TrainingGoal.FITNESS:
                areas.push('전신 체력', '근지구력', '심폐 기능');
                break;
            case TrainingPlan_1.TrainingGoal.COMPETITION:
                areas.push('경기 전술', '멘탈 트레이닝', '피크 컨디셔닝');
                break;
        }
        areas.push(...skillAnalysis.weaknesses);
        return [...new Set(areas)];
    }
    static identifyRiskFactors(profileAnalysis, goalAnalysis) {
        const risks = [];
        if (profileAnalysis.physicalConstraints.hasConstraints) {
            risks.push('기존 의학적 상태 고려 필요');
        }
        if (profileAnalysis.physicalConstraints.bmiCategory === 'obese') {
            risks.push('과체중으로 인한 관절 부담');
        }
        if (profileAnalysis.physicalConstraints.ageGroup === 'senior') {
            risks.push('연령대 고려한 점진적 훈련 필요');
        }
        if (goalAnalysis.urgency === 'high') {
            risks.push('급속한 훈련 증가로 인한 부상 위험');
        }
        if (profileAnalysis.motivationLevel === 'low') {
            risks.push('낮은 동기로 인한 중도 포기 위험');
        }
        return risks;
    }
    static predictOutcomes(goalAnalysis, skillAnalysis, duration) {
        const outcomes = [];
        if (duration >= 8) {
            outcomes.push('기초 체력 20-30% 향상');
            outcomes.push('수영 기술 전반적 개선');
        }
        if (duration >= 12) {
            outcomes.push('특정 영법 숙련도 크게 향상');
            outcomes.push('지구력 및 속력 눈에 띄는 개선');
        }
        if (duration >= 16) {
            outcomes.push('경기 참가 가능 수준 도달');
            outcomes.push('개인 기록 대폭 단축');
        }
        return outcomes;
    }
    static generateWeeklyPlans(aiAnalysis, request) {
        const weeklyPlans = [];
        for (let week = 1; week <= aiAnalysis.recommendedDuration; week++) {
            const weeklyPlan = {
                week,
                goal: this.generateWeeklyGoal(week, aiAnalysis.recommendedDuration, request.goals.primary),
                sessions: this.generateWeeklySessions(week, aiAnalysis.sessionsPerWeek, aiAnalysis.intensityProgression[week - 1], request),
                restDays: this.calculateRestDays(request.userProfile.preferredDays, aiAnalysis.sessionsPerWeek),
                progressMetrics: {
                    expectedImprovement: this.generateExpectedImprovement(week, request.goals.primary),
                    keyFocus: this.generateWeeklyFocus(week, aiAnalysis.focusAreas),
                    milestones: this.generateWeeklyMilestones(week, aiAnalysis.recommendedDuration)
                }
            };
            weeklyPlans.push(weeklyPlan);
        }
        return weeklyPlans;
    }
    static generateWeeklyGoal(week, totalWeeks, primaryGoal) {
        const phase = week <= totalWeeks * 0.3 ? 'foundation' :
            week <= totalWeeks * 0.7 ? 'development' :
                week <= totalWeeks * 0.9 ? 'peak' : 'taper';
        const goals = {
            foundation: {
                [TrainingPlan_1.TrainingGoal.FITNESS]: '기초 체력 및 수영 적응력 향상',
                [TrainingPlan_1.TrainingGoal.TECHNIQUE]: '기본 영법 동작 익히기',
                [TrainingPlan_1.TrainingGoal.ENDURANCE]: '유산소 기초 체력 구축',
                [TrainingPlan_1.TrainingGoal.SPEED]: '기본 속력 및 기술 습득',
                [TrainingPlan_1.TrainingGoal.COMPETITION]: '경기 기초 기술 및 체력 구축',
                [TrainingPlan_1.TrainingGoal.REHABILITATION]: '안전한 움직임 패턴 학습'
            },
            development: {
                [TrainingPlan_1.TrainingGoal.FITNESS]: '체력 수준 향상 및 지구력 개발',
                [TrainingPlan_1.TrainingGoal.TECHNIQUE]: '영법 기술 정교화 및 효율성 향상',
                [TrainingPlan_1.TrainingGoal.ENDURANCE]: '장거리 수영 능력 개발',
                [TrainingPlan_1.TrainingGoal.SPEED]: '순간 속력 및 파워 향상',
                [TrainingPlan_1.TrainingGoal.COMPETITION]: '경기 특화 기술 및 전술 개발',
                [TrainingPlan_1.TrainingGoal.REHABILITATION]: '기능적 움직임 강화'
            },
            peak: {
                [TrainingPlan_1.TrainingGoal.FITNESS]: '최고 컨디션 달성',
                [TrainingPlan_1.TrainingGoal.TECHNIQUE]: '완성된 기술로 일관성 확보',
                [TrainingPlan_1.TrainingGoal.ENDURANCE]: '목표 거리 완주 능력 완성',
                [TrainingPlan_1.TrainingGoal.SPEED]: '최고 속력 및 레이스 페이스 완성',
                [TrainingPlan_1.TrainingGoal.COMPETITION]: '경기 준비 완료 및 피크 컨디션',
                [TrainingPlan_1.TrainingGoal.REHABILITATION]: '완전한 기능 회복'
            },
            taper: {
                [TrainingPlan_1.TrainingGoal.FITNESS]: '컨디션 유지 및 회복',
                [TrainingPlan_1.TrainingGoal.TECHNIQUE]: '기술 유지 및 미세 조정',
                [TrainingPlan_1.TrainingGoal.ENDURANCE]: '컨디션 유지',
                [TrainingPlan_1.TrainingGoal.SPEED]: '스피드 유지 및 샤프닝',
                [TrainingPlan_1.TrainingGoal.COMPETITION]: '경기 당일 최적 컨디션 조성',
                [TrainingPlan_1.TrainingGoal.REHABILITATION]: '안정적 상태 유지'
            }
        };
        return goals[phase][primaryGoal] || '전반적 수영 능력 향상';
    }
    static generateWeeklySessions(week, sessionsPerWeek, intensity, request) {
        const sessions = [];
        for (let session = 1; session <= sessionsPerWeek; session++) {
            const sessionData = {
                sessionNumber: session,
                title: this.generateSessionTitle(session, week, request.goals.primary),
                description: this.generateSessionDescription(session, intensity, request.goals.primary),
                duration: this.calculateSessionDuration(intensity, request.userProfile.currentLevel),
                warmUp: this.generateWarmUp(intensity),
                mainSet: this.generateMainSet(session, intensity, request.goals.primary),
                coolDown: this.generateCoolDown(),
                focusAreas: this.generateSessionFocus(session, request.goals.primary),
                equipment: this.generateEquipmentList(session, request.goals.primary),
                calories: this.estimateCalories(intensity, request.userProfile),
                difficulty: Math.min(10, Math.max(1, intensity))
            };
            sessions.push(sessionData);
        }
        return sessions;
    }
    static generateSessionTitle(session, week, goal) {
        const titles = {
            [TrainingPlan_1.TrainingGoal.FITNESS]: [`체력 향상 훈련 ${session}`, `전신 컨디셔닝 ${session}`, `유산소 훈련 ${session}`],
            [TrainingPlan_1.TrainingGoal.TECHNIQUE]: [`기술 연습 ${session}`, `영법 교정 ${session}`, `동작 완성도 훈련 ${session}`],
            [TrainingPlan_1.TrainingGoal.ENDURANCE]: [`지구력 훈련 ${session}`, `장거리 수영 ${session}`, `페이싱 연습 ${session}`],
            [TrainingPlan_1.TrainingGoal.SPEED]: [`스피드 훈련 ${session}`, `순간 속력 ${session}`, `파워 개발 ${session}`],
            [TrainingPlan_1.TrainingGoal.COMPETITION]: [`경기 준비 ${session}`, `레이스 시뮬레이션 ${session}`, `전술 훈련 ${session}`],
            [TrainingPlan_1.TrainingGoal.REHABILITATION]: [`재활 운동 ${session}`, `기능 회복 ${session}`, `안전 훈련 ${session}`]
        };
        const titleArray = titles[goal] || [`수영 훈련 ${session}`];
        return titleArray[(session - 1) % titleArray.length];
    }
    static generateSessionDescription(session, intensity, goal) {
        const intensityText = intensity <= 3 ? '가벼운' : intensity <= 6 ? '중간' : intensity <= 8 ? '높은' : '최고';
        const descriptions = {
            [TrainingPlan_1.TrainingGoal.FITNESS]: `${intensityText} 강도의 전신 체력 향상 훈련`,
            [TrainingPlan_1.TrainingGoal.TECHNIQUE]: `${intensityText} 집중도의 영법 기술 개선 훈련`,
            [TrainingPlan_1.TrainingGoal.ENDURANCE]: `${intensityText} 강도의 지구력 및 심폐 기능 향상 훈련`,
            [TrainingPlan_1.TrainingGoal.SPEED]: `${intensityText} 강도의 순간 속력 및 파워 개발 훈련`,
            [TrainingPlan_1.TrainingGoal.COMPETITION]: `${intensityText} 강도의 경기 준비 및 전술 훈련`,
            [TrainingPlan_1.TrainingGoal.REHABILITATION]: `${intensityText} 강도의 안전한 기능 회복 훈련`
        };
        return descriptions[goal] || `${intensityText} 강도의 종합 수영 훈련`;
    }
    static calculateSessionDuration(intensity, level) {
        const baseDuration = {
            [TrainingPlan_1.TrainingIntensity.BEGINNER]: 45,
            [TrainingPlan_1.TrainingIntensity.INTERMEDIATE]: 60,
            [TrainingPlan_1.TrainingIntensity.ADVANCED]: 75,
            [TrainingPlan_1.TrainingIntensity.PROFESSIONAL]: 90
        };
        const base = baseDuration[level];
        const adjustment = (intensity - 5) * 5;
        return Math.max(30, Math.min(base + adjustment, 120));
    }
    static generateWarmUp(intensity) {
        const duration = intensity <= 5 ? 10 : 15;
        const exercises = [
            '가벼운 자유형 수영',
            '관절 가동범위 운동',
            '호흡 연습',
            '킥보드 킥 연습'
        ];
        if (intensity > 7) {
            exercises.push('점진적 속도 증가', '스트로크 리듬 연습');
        }
        return { exercises, duration };
    }
    static generateMainSet(session, intensity, goal) {
        const sets = Math.max(3, Math.min(intensity, 8));
        const reps = intensity <= 5 ? 4 : intensity <= 8 ? 6 : 8;
        const restTime = intensity <= 5 ? 60 : intensity <= 8 ? 45 : 30;
        const exercises = {
            [TrainingPlan_1.TrainingGoal.FITNESS]: [
                '중거리 자유형 수영',
                '다양한 영법 조합',
                '인터벌 훈련',
                '서킷 트레이닝'
            ],
            [TrainingPlan_1.TrainingGoal.TECHNIQUE]: [
                '단일 영법 집중 연습',
                '드릴 운동',
                '스트로크 카운트 연습',
                '영상 분석 후 교정'
            ],
            [TrainingPlan_1.TrainingGoal.ENDURANCE]: [
                '장거리 연속 수영',
                '페이스 조절 연습',
                '호흡 패턴 훈련',
                '지구력 빌드업'
            ],
            [TrainingPlan_1.TrainingGoal.SPEED]: [
                '스프린트 인터벌',
                '파워 개발 운동',
                '스타트 연습',
                '턴 기술 연습'
            ],
            [TrainingPlan_1.TrainingGoal.COMPETITION]: [
                '레이스 페이스 연습',
                '경기 시뮬레이션',
                '전술 훈련',
                '멘탈 트레이닝'
            ],
            [TrainingPlan_1.TrainingGoal.REHABILITATION]: [
                '저강도 연속 수영',
                '관절 친화적 운동',
                '균형 및 안정성 훈련',
                '기능적 움직임 패턴'
            ]
        };
        return {
            exercises: exercises[goal] || exercises[TrainingPlan_1.TrainingGoal.FITNESS],
            sets,
            reps,
            restTime,
            intensity
        };
    }
    static generateCoolDown() {
        return {
            exercises: [
                '가벼운 자유형 수영',
                '스트레칭',
                '호흡 정리',
                '근육 이완'
            ],
            duration: 10
        };
    }
    static generateSessionFocus(session, goal) {
        const focusAreas = {
            [TrainingPlan_1.TrainingGoal.FITNESS]: ['전신 지구력', '심폐 기능', '근지구력'],
            [TrainingPlan_1.TrainingGoal.TECHNIQUE]: ['영법 기술', '호흡 패턴', '동작 효율성'],
            [TrainingPlan_1.TrainingGoal.ENDURANCE]: ['유산소 능력', '페이싱', '지구력'],
            [TrainingPlan_1.TrainingGoal.SPEED]: ['순간 속력', '파워', '반응 속도'],
            [TrainingPlan_1.TrainingGoal.COMPETITION]: ['경기 기술', '전술', '멘탈'],
            [TrainingPlan_1.TrainingGoal.REHABILITATION]: ['안전성', '기능 회복', '점진적 강화']
        };
        return focusAreas[goal] || focusAreas[TrainingPlan_1.TrainingGoal.FITNESS];
    }
    static generateEquipmentList(session, goal) {
        const basicEquipment = ['수영복', '수경', '수모'];
        const additionalEquipment = {
            [TrainingPlan_1.TrainingGoal.FITNESS]: ['킥보드', '풀부이', '핀'],
            [TrainingPlan_1.TrainingGoal.TECHNIQUE]: ['킥보드', '풀부이', '패들', '스노클'],
            [TrainingPlan_1.TrainingGoal.ENDURANCE]: ['킥보드', '풀부이'],
            [TrainingPlan_1.TrainingGoal.SPEED]: ['핀', '패들', '스트레치 코드'],
            [TrainingPlan_1.TrainingGoal.COMPETITION]: ['패들', '핀', '스톱워치'],
            [TrainingPlan_1.TrainingGoal.REHABILITATION]: ['킥보드', '풀부이', '수중 웨이트']
        };
        return [...basicEquipment, ...(additionalEquipment[goal] || [])];
    }
    static estimateCalories(intensity, userProfile) {
        const baseCaloriesPerMinute = userProfile.weight * 0.1;
        const intensityMultiplier = 0.5 + (intensity / 10) * 1.5;
        const duration = this.calculateSessionDuration(intensity, userProfile.currentLevel);
        return Math.round(baseCaloriesPerMinute * intensityMultiplier * duration);
    }
    static calculateRestDays(preferredDays, sessionsPerWeek) {
        const allDays = [0, 1, 2, 3, 4, 5, 6];
        const trainingDays = preferredDays.slice(0, sessionsPerWeek);
        return allDays.filter(day => !trainingDays.includes(day));
    }
    static generateExpectedImprovement(week, goal) {
        void goal;
        if (week <= 2)
            return '기초 적응 및 동작 익히기';
        if (week <= 4)
            return '체력 및 기술 향상 시작';
        if (week <= 8)
            return '눈에 띄는 실력 향상';
        if (week <= 12)
            return '안정적 기술 및 체력 확보';
        return '목표 달성 및 유지';
    }
    static generateWeeklyFocus(week, focusAreas) {
        const weeklyRotation = week % focusAreas.length;
        return focusAreas.slice(weeklyRotation, weeklyRotation + 2);
    }
    static generateWeeklyMilestones(week, totalWeeks) {
        const milestones = [];
        if (week === Math.ceil(totalWeeks * 0.25)) {
            milestones.push('1/4 지점 달성');
        }
        if (week === Math.ceil(totalWeeks * 0.5)) {
            milestones.push('중간 지점 달성');
        }
        if (week === Math.ceil(totalWeeks * 0.75)) {
            milestones.push('3/4 지점 달성');
        }
        if (week === totalWeeks) {
            milestones.push('훈련 과정 완료');
        }
        return milestones;
    }
    static generatePlanTitle(goal, level) {
        const levelText = {
            [TrainingPlan_1.TrainingIntensity.BEGINNER]: '초급자',
            [TrainingPlan_1.TrainingIntensity.INTERMEDIATE]: '중급자',
            [TrainingPlan_1.TrainingIntensity.ADVANCED]: '고급자',
            [TrainingPlan_1.TrainingIntensity.PROFESSIONAL]: '전문가'
        };
        const goalText = {
            [TrainingPlan_1.TrainingGoal.FITNESS]: '체력 향상',
            [TrainingPlan_1.TrainingGoal.TECHNIQUE]: '기술 개선',
            [TrainingPlan_1.TrainingGoal.ENDURANCE]: '지구력 강화',
            [TrainingPlan_1.TrainingGoal.SPEED]: '속도 향상',
            [TrainingPlan_1.TrainingGoal.COMPETITION]: '경기 준비',
            [TrainingPlan_1.TrainingGoal.REHABILITATION]: '재활 훈련'
        };
        return `${levelText[level]} ${goalText[goal]} 맞춤 훈련 계획`;
    }
    static generatePlanDescription(goals, aiAnalysis) {
        return `AI 분석을 통해 생성된 ${aiAnalysis.recommendedDuration}주간 개인 맞춤 훈련 프로그램입니다. ` +
            `주 ${aiAnalysis.sessionsPerWeek}회 훈련으로 ${goals.primary} 목표 달성을 지원합니다.`;
    }
    static generateProgressionStrategy(aiAnalysis) {
        return `점진적 강도 증가 전략을 통해 부상 위험을 최소화하면서 최적의 훈련 효과를 달성합니다. ` +
            `${aiAnalysis.focusAreas.join(', ')} 영역에 중점을 두고 체계적으로 발전시킵니다.`;
    }
    static generateAdaptationRules(userProfile, aiAnalysis) {
        const rules = [
            '주간 진도율이 70% 미만일 경우 강도 조절',
            '연속 2회 세션 미완료 시 계획 재검토',
            '부상 또는 피로 누적 시 휴식일 추가'
        ];
        if (userProfile.medicalConditions.length > 0) {
            rules.push('의학적 상태 고려한 즉시 조정');
        }
        if (aiAnalysis.riskFactors.length > 0) {
            rules.push('위험 요소 모니터링 및 예방적 조치');
        }
        return rules;
    }
    static async adjustTrainingPlan(planId, performanceData) {
        try {
            const plan = await TrainingPlan_1.TrainingPlan.findById(planId);
            if (!plan)
                return null;
            const analysis = this.analyzePerformance(performanceData, plan);
            if (analysis.needsAdjustment) {
                plan.aiAnalysis.recommendedAdjustments = analysis.recommendations;
                plan.aiAnalysis.performanceTrend = analysis.trend;
                plan.aiAnalysis.lastAnalysisDate = new Date();
                await plan.save();
            }
            return plan;
        }
        catch (error) {
            console.error('훈련 계획 조정 오류:', error);
            throw new Error('훈련 계획 조정에 실패했습니다.');
        }
    }
    static analyzePerformance(performanceData, plan) {
        const recentMetrics = plan.progress.performanceMetrics.slice(-5);
        if (recentMetrics.length < 3) {
            return { needsAdjustment: false, recommendations: [], trend: 'stable' };
        }
        const avgCompletion = recentMetrics.reduce((sum, m) => sum + m.completion, 0) / recentMetrics.length;
        const avgExertion = recentMetrics.reduce((sum, m) => sum + m.perceivedExertion, 0) / recentMetrics.length;
        let trend = 'stable';
        const recommendations = [];
        if (avgCompletion >= 90 && avgExertion <= 7) {
            trend = 'improving';
            recommendations.push('강도를 점진적으로 증가시킬 수 있습니다');
        }
        else if (avgCompletion < 70 || avgExertion >= 9) {
            trend = 'declining';
            recommendations.push('강도를 낮추고 회복 시간을 늘려주세요');
            recommendations.push('기술 중심의 훈련으로 전환을 고려하세요');
        }
        if (plan.progress.adherenceRate < 70) {
            recommendations.push('훈련 일정을 더 유연하게 조정하세요');
            recommendations.push('동기 부여를 위한 단기 목표를 설정하세요');
        }
        return {
            needsAdjustment: recommendations.length > 0,
            recommendations,
            trend
        };
    }
    static async getUserTrainingPlans(userId) {
        try {
            return await TrainingPlan_1.TrainingPlan.find({ userId, isActive: true })
                .sort({ createdAt: -1 })
                .populate('userId', 'name email');
        }
        catch (error) {
            console.error('훈련 계획 조회 오류:', error);
            throw new Error('훈련 계획 조회에 실패했습니다.');
        }
    }
    static async completeSession(planId, sessionData) {
        try {
            const plan = await TrainingPlan_1.TrainingPlan.findById(planId);
            if (!plan)
                return null;
            plan.progress.performanceMetrics.push({
                date: new Date(),
                sessionId: sessionData.sessionId,
                completion: sessionData.completion,
                perceivedExertion: sessionData.perceivedExertion,
                actualDuration: sessionData.actualDuration,
                notes: sessionData.notes
            });
            plan.progress.completedSessions += 1;
            plan.progress.adherenceRate = Math.round((plan.progress.completedSessions / plan.progress.totalSessions) * 100);
            if (plan.progress.currentSession < plan.planDetails.sessionsPerWeek) {
                plan.progress.currentSession += 1;
            }
            else {
                plan.progress.currentSession = 1;
                plan.progress.currentWeek += 1;
            }
            await plan.save();
            return plan;
        }
        catch (error) {
            console.error('세션 완료 처리 오류:', error);
            throw new Error('세션 완료 처리에 실패했습니다.');
        }
    }
}
exports.AITrainingPlanService = AITrainingPlanService;
exports.default = AITrainingPlanService;
//# sourceMappingURL=aiTrainingPlanService.js.map