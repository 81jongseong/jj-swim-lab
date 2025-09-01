/// <reference types="mongoose/types/aggregate" />
/// <reference types="mongoose/types/callback" />
/// <reference types="mongoose/types/collection" />
/// <reference types="mongoose/types/connection" />
/// <reference types="mongoose/types/cursor" />
/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/error" />
/// <reference types="mongoose/types/expressions" />
/// <reference types="mongoose/types/helpers" />
/// <reference types="mongoose/types/middlewares" />
/// <reference types="mongoose/types/indexes" />
/// <reference types="mongoose/types/models" />
/// <reference types="mongoose/types/mongooseoptions" />
/// <reference types="mongoose/types/pipelinestage" />
/// <reference types="mongoose/types/populate" />
/// <reference types="mongoose/types/query" />
/// <reference types="mongoose/types/schemaoptions" />
/// <reference types="mongoose/types/schematypes" />
/// <reference types="mongoose/types/session" />
/// <reference types="mongoose/types/types" />
/// <reference types="mongoose/types/utility" />
/// <reference types="mongoose/types/validation" />
/// <reference types="mongoose/types/virtuals" />
/// <reference types="mongoose/types/inferschematype" />
import mongoose, { Document } from 'mongoose';
export interface IEvaluationCriteria extends Document {
    technique: string;
    level: string;
    categories: {
        posture: {
            weight: number;
            subCategories: {
                bodyAlignment: {
                    weight: number;
                    criteria: string[];
                };
                headPosition: {
                    weight: number;
                    criteria: string[];
                };
                coreStability: {
                    weight: number;
                    criteria: string[];
                };
            };
        };
        breathing: {
            weight: number;
            subCategories: {
                timing: {
                    weight: number;
                    criteria: string[];
                };
                technique: {
                    weight: number;
                    criteria: string[];
                };
                consistency: {
                    weight: number;
                    criteria: string[];
                };
            };
        };
        movement: {
            weight: number;
            subCategories: {
                strokeTechnique: {
                    weight: number;
                    criteria: string[];
                };
                rhythm: {
                    weight: number;
                    criteria: string[];
                };
                coordination: {
                    weight: number;
                    criteria: string[];
                };
            };
        };
        efficiency: {
            weight: number;
            subCategories: {
                power: {
                    weight: number;
                    criteria: string[];
                };
                endurance: {
                    weight: number;
                    criteria: string[];
                };
                speed: {
                    weight: number;
                    criteria: string[];
                };
            };
        };
    };
    performanceMetrics: {
        speed: {
            beginner: {
                min: number;
                max: number;
                unit: string;
            };
            intermediate: {
                min: number;
                max: number;
                unit: string;
            };
            advanced: {
                min: number;
                max: number;
                unit: string;
            };
            expert: {
                min: number;
                max: number;
                unit: string;
            };
        };
        endurance: {
            beginner: {
                min: number;
                max: number;
                unit: string;
            };
            intermediate: {
                min: number;
                max: number;
                unit: string;
            };
            advanced: {
                min: number;
                max: number;
                unit: string;
            };
            expert: {
                min: number;
                max: number;
                unit: string;
            };
        };
        strokeCount: {
            beginner: {
                min: number;
                max: number;
                unit: string;
            };
            intermediate: {
                min: number;
                max: number;
                unit: string;
            };
            advanced: {
                min: number;
                max: number;
                unit: string;
            };
            expert: {
                min: number;
                max: number;
                unit: string;
            };
        };
        heartRate: {
            beginner: {
                min: number;
                max: number;
                unit: string;
            };
            intermediate: {
                min: number;
                max: number;
                unit: string;
            };
            advanced: {
                min: number;
                max: number;
                unit: string;
            };
            expert: {
                min: number;
                max: number;
                unit: string;
            };
        };
    };
    scoringMethod: {
        type: 'weighted' | 'threshold' | 'progressive';
        parameters: any;
    };
    feedbackTemplates: {
        excellent: string[];
        good: string[];
        average: string[];
        poor: string[];
    };
    improvementSuggestions: {
        posture: string[];
        breathing: string[];
        movement: string[];
        efficiency: string[];
    };
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface IExerciseRecommendation extends Document {
    technique: string;
    level: string;
    category: 'posture' | 'breathing' | 'movement' | 'efficiency';
    exercises: {
        name: string;
        description: string;
        difficulty: 'easy' | 'medium' | 'hard';
        duration: number;
        repetitions?: number;
        sets?: number;
        equipment: string[];
        instructions: string[];
        benefits: string[];
        precautions: string[];
    }[];
    workoutPlan: {
        name: string;
        description: string;
        totalDuration: number;
        exercises: {
            exerciseName: string;
            duration: number;
            order: number;
        }[];
        frequency: number;
        progression: {
            week1: any;
            week2: any;
            week3: any;
            week4: any;
        };
    }[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface IAIEvaluationResult extends Document {
    studentId: mongoose.Types.ObjectId;
    instructorId: mongoose.Types.ObjectId;
    technique: string;
    level: string;
    inputData: {
        performanceMetrics: {
            speed?: number;
            endurance?: number;
            strokeCount?: number;
            heartRate?: number;
            distance?: number;
        };
        instructorObservations: {
            posture: number;
            breathing: number;
            movement: number;
            efficiency: number;
        };
    };
    analysisResult: {
        overallScore: number;
        categoryScores: {
            posture: number;
            breathing: number;
            movement: number;
            efficiency: number;
        };
        levelAssessment: string;
        strengths: string[];
        weaknesses: string[];
        improvementAreas: string[];
    };
    recommendations: {
        exercises: {
            name: string;
            priority: 'high' | 'medium' | 'low';
            reason: string;
            duration: number;
        }[];
        workoutPlan: {
            name: string;
            description: string;
            duration: number;
            frequency: number;
        };
        nextEvaluationDate: Date;
    };
    feedback: {
        summary: string;
        detailedFeedback: string;
        encouragement: string;
        goals: string[];
    };
    evaluationDate: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const EvaluationCriteria: mongoose.Model<IEvaluationCriteria, {}, {}, {}, mongoose.Document<unknown, {}, IEvaluationCriteria> & IEvaluationCriteria & {
    _id: mongoose.Types.ObjectId;
}, any>;
export declare const ExerciseRecommendation: mongoose.Model<IExerciseRecommendation, {}, {}, {}, mongoose.Document<unknown, {}, IExerciseRecommendation> & IExerciseRecommendation & {
    _id: mongoose.Types.ObjectId;
}, any>;
export declare const AIEvaluationResult: mongoose.Model<IAIEvaluationResult, {}, {}, {}, mongoose.Document<unknown, {}, IAIEvaluationResult> & IAIEvaluationResult & {
    _id: mongoose.Types.ObjectId;
}, any>;
//# sourceMappingURL=AIEvaluationCriteria.d.ts.map