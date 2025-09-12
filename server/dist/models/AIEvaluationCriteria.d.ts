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
        distance: {
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
    };
    aiSettings: {
        confidenceThreshold: number;
        analysisDepth: 'basic' | 'intermediate' | 'advanced';
        feedbackStyle: 'encouraging' | 'technical' | 'balanced';
        language: string;
    };
    isActive: boolean;
    version: string;
    createdBy: mongoose.Types.ObjectId;
    centerId: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export interface IAIEvaluationResult extends Document {
    studentId: mongoose.Types.ObjectId;
    technique: string;
    level: string;
    analysis: {
        posture: {
            score: number;
            details: {
                bodyAlignment: {
                    score: number;
                    feedback: string;
                };
                headPosition: {
                    score: number;
                    feedback: string;
                };
                coreStability: {
                    score: number;
                    feedback: string;
                };
            };
        };
        breathing: {
            score: number;
            details: {
                timing: {
                    score: number;
                    feedback: string;
                };
                technique: {
                    score: number;
                    feedback: string;
                };
                consistency: {
                    score: number;
                    feedback: string;
                };
            };
        };
        movement: {
            score: number;
            details: {
                strokeTechnique: {
                    score: number;
                    feedback: string;
                };
                rhythm: {
                    score: number;
                    feedback: string;
                };
                coordination: {
                    score: number;
                    feedback: string;
                };
            };
        };
        efficiency: {
            score: number;
            details: {
                power: {
                    score: number;
                    feedback: string;
                };
                endurance: {
                    score: number;
                    feedback: string;
                };
                speed: {
                    score: number;
                    feedback: string;
                };
            };
        };
    };
    performance: {
        speed: {
            value: number;
            unit: string;
        };
        distance: {
            value: number;
            unit: string;
        };
        strokeCount: {
            value: number;
            unit: string;
        };
    };
    overallScore: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
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
export declare const AIEvaluationResult: mongoose.Model<IAIEvaluationResult, {}, {}, {}, mongoose.Document<unknown, {}, IAIEvaluationResult> & IAIEvaluationResult & {
    _id: mongoose.Types.ObjectId;
}, any>;
//# sourceMappingURL=AIEvaluationCriteria.d.ts.map