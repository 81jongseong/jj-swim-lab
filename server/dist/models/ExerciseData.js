"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExerciseData = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const exerciseDataSchema = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sessionId: {
        type: String,
        required: true,
        unique: true
    },
    exerciseType: {
        type: String,
        enum: ['swimming', 'pose_analysis', 'intensity_training', 'general_workout'],
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date
    },
    duration: {
        type: Number,
        required: true,
        min: 0
    },
    intensityData: {
        averageIntensity: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        },
        maxIntensity: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        },
        intensityHistory: [{
                timestamp: {
                    type: Date,
                    required: true
                },
                intensity: {
                    type: Number,
                    required: true,
                    min: 0,
                    max: 100
                },
                heartRate: {
                    type: Number,
                    min: 0
                },
                movementSpeed: {
                    type: Number,
                    required: true,
                    min: 0,
                    max: 100
                },
                calories: {
                    type: Number,
                    required: true,
                    min: 0
                }
            }],
        totalCalories: {
            type: Number,
            required: true,
            min: 0
        },
        averageHeartRate: {
            type: Number,
            min: 0
        },
        maxHeartRate: {
            type: Number,
            min: 0
        }
    },
    poseAnalysis: {
        overallScore: {
            type: Number,
            min: 0,
            max: 100
        },
        poseType: String,
        quality: {
            type: String,
            enum: ['Poor', 'Needs Improvement', 'Fair', 'Good', 'Excellent']
        },
        detailedAnalysis: {
            shoulderAlignment: {
                type: Number,
                min: 0,
                max: 100
            },
            hipAlignment: {
                type: Number,
                min: 0,
                max: 100
            },
            legPosition: {
                type: Number,
                min: 0,
                max: 100
            },
            armMovement: {
                type: Number,
                min: 0,
                max: 100
            },
            breathingPattern: {
                type: Number,
                min: 0,
                max: 100
            }
        },
        corrections: [String],
        improvements: [String],
        landmarks: [{
                timestamp: {
                    type: Date,
                    required: true
                },
                landmarks: [{
                        x: Number,
                        y: Number,
                        z: Number,
                        visibility: Number
                    }]
            }]
    },
    swimmingData: {
        stroke: {
            type: String,
            enum: ['freestyle', 'butterfly', 'breaststroke', 'backstroke', 'mixed']
        },
        distance: {
            type: Number,
            min: 0
        },
        laps: {
            type: Number,
            min: 0
        },
        strokeCount: {
            type: Number,
            min: 0
        },
        strokeRate: {
            type: Number,
            min: 0
        },
        efficiency: {
            type: Number,
            min: 0,
            max: 100
        },
        techniqueScore: {
            type: Number,
            min: 0,
            max: 100
        },
        breathingPattern: String,
        turnEfficiency: {
            type: Number,
            min: 0,
            max: 100
        }
    },
    performanceMetrics: {
        goalAchievement: {
            type: Number,
            min: 0,
            max: 100
        },
        improvement: {
            type: Number
        },
        consistency: {
            type: Number,
            min: 0,
            max: 100
        },
        effort: {
            type: Number,
            min: 0,
            max: 100
        }
    },
    aiRecommendations: {
        nextWorkout: String,
        focusAreas: [String],
        restDays: {
            type: Number,
            min: 0
        },
        intensityAdjustment: String,
        techniqueImprovements: [String],
        nutritionTips: [String]
    },
    notes: String,
    tags: [String],
    weather: String,
    temperature: Number,
    humidity: Number
}, {
    timestamps: true
});
exerciseDataSchema.index({ userId: 1, startTime: -1 });
exerciseDataSchema.index({ exerciseType: 1, startTime: -1 });
exerciseDataSchema.index({ 'intensityData.averageIntensity': -1 });
exerciseDataSchema.index({ 'poseAnalysis.overallScore': -1 });
exerciseDataSchema.virtual('bmi').get(function () {
    return null;
});
exerciseDataSchema.methods.completeSession = function (endTime) {
    this.endTime = endTime;
    this.duration = Math.round((endTime.getTime() - this.startTime.getTime()) / (1000 * 60));
    return this.save();
};
exerciseDataSchema.methods.calculatePerformanceScore = function () {
    let score = 0;
    if (this.intensityData.averageIntensity >= 80)
        score += 40;
    else if (this.intensityData.averageIntensity >= 60)
        score += 30;
    else if (this.intensityData.averageIntensity >= 40)
        score += 20;
    else
        score += 10;
    if (this.poseAnalysis?.overallScore) {
        if (this.poseAnalysis.overallScore >= 90)
            score += 30;
        else if (this.poseAnalysis.overallScore >= 80)
            score += 25;
        else if (this.poseAnalysis.overallScore >= 70)
            score += 20;
        else if (this.poseAnalysis.overallScore >= 60)
            score += 15;
        else
            score += 10;
    }
    if (this.duration >= 60)
        score += 20;
    else if (this.duration >= 45)
        score += 15;
    else if (this.duration >= 30)
        score += 10;
    else if (this.duration >= 15)
        score += 5;
    score += (this.performanceMetrics.consistency || 0) * 0.1;
    return Math.round(score);
};
exerciseDataSchema.statics.getUserStats = async function (userId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const stats = await this.aggregate([
        {
            $match: {
                userId: new mongoose_1.default.Types.ObjectId(userId),
                startTime: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: null,
                totalSessions: { $sum: 1 },
                totalDuration: { $sum: '$duration' },
                totalCalories: { $sum: '$intensityData.totalCalories' },
                averageIntensity: { $avg: '$intensityData.averageIntensity' },
                averagePoseScore: { $avg: '$poseAnalysis.overallScore' },
                bestIntensity: { $max: '$intensityData.maxIntensity' },
                bestPoseScore: { $max: '$poseAnalysis.overallScore' }
            }
        }
    ]);
    return stats[0] || {
        totalSessions: 0,
        totalDuration: 0,
        totalCalories: 0,
        averageIntensity: 0,
        averagePoseScore: 0,
        bestIntensity: 0,
        bestPoseScore: 0
    };
};
exerciseDataSchema.statics.generateAIRecommendations = async function (userId) {
    const userStats = await this.constructor.getUserStats(userId, 7);
    await this.find({ userId })
        .sort({ startTime: -1 })
        .limit(5);
    const recommendations = {
        nextWorkout: '',
        focusAreas: [],
        restDays: 1,
        intensityAdjustment: '',
        techniqueImprovements: [],
        nutritionTips: []
    };
    if (userStats.totalSessions === 0) {
        recommendations.nextWorkout = '가벼운 워밍업과 기본 자세 연습을 시작해보세요.';
        recommendations.focusAreas = ['기본 자세', '호흡법', '물에 대한 적응'];
    }
    else {
        if (userStats.averageIntensity < 50) {
            recommendations.intensityAdjustment = '운동 강도를 점진적으로 높여보세요.';
            recommendations.focusAreas.push('지구력 향상');
        }
        else if (userStats.averageIntensity > 80) {
            recommendations.intensityAdjustment = '과도한 운동을 피하고 적절한 휴식을 취하세요.';
            recommendations.restDays = 2;
        }
        if (userStats.averagePoseScore < 70) {
            recommendations.techniqueImprovements.push('기본 자세 연습에 집중하세요.');
            recommendations.focusAreas.push('자세 교정');
        }
        if (userStats.totalSessions >= 5) {
            recommendations.restDays = 1;
            recommendations.nextWorkout = '휴식 후 다음 운동을 계획하세요.';
        }
        else if (userStats.totalSessions < 3) {
            recommendations.nextWorkout = '규칙적인 운동 습관을 만들어보세요.';
            recommendations.focusAreas.push('일관성');
        }
    }
    if (userStats.totalCalories > 500) {
        recommendations.nutritionTips.push('충분한 수분 섭취와 단백질 보충이 필요합니다.');
    }
    return recommendations;
};
exports.ExerciseData = mongoose_1.default.model('ExerciseData', exerciseDataSchema);
//# sourceMappingURL=ExerciseData.js.map