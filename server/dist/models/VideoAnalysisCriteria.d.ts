import mongoose, { Document } from 'mongoose';
export interface IVideoAnalysisCriteria extends Document {
    technique: string;
    level: string;
    analysisCriteria: {
        posture: {
            bodyAlignment: {
                criteria: string[];
                weight: number;
                thresholds: {
                    excellent: number;
                    good: number;
                    average: number;
                    poor: number;
                };
            };
            headPosition: {
                criteria: string[];
                weight: number;
                thresholds: {
                    excellent: number;
                    good: number;
                    average: number;
                    poor: number;
                };
            };
            coreStability: {
                criteria: string[];
                weight: number;
                thresholds: {
                    excellent: number;
                    good: number;
                    average: number;
                    poor: number;
                };
            };
        };
        breathing: {
            timing: {
                criteria: string[];
                weight: number;
                thresholds: {
                    excellent: number;
                    good: number;
                    average: number;
                    poor: number;
                };
            };
            technique: {
                criteria: string[];
                weight: number;
                thresholds: {
                    excellent: number;
                    good: number;
                    average: number;
                    poor: number;
                };
            };
            consistency: {
                criteria: string[];
                weight: number;
                thresholds: {
                    excellent: number;
                    good: number;
                    average: number;
                    poor: number;
                };
            };
        };
        movement: {
            strokeTechnique: {
                criteria: string[];
                weight: number;
                thresholds: {
                    excellent: number;
                    good: number;
                    average: number;
                    poor: number;
                };
            };
            rhythm: {
                criteria: string[];
                weight: number;
                thresholds: {
                    excellent: number;
                    good: number;
                    average: number;
                    poor: number;
                };
            };
            coordination: {
                criteria: string[];
                weight: number;
                thresholds: {
                    excellent: number;
                    good: number;
                    average: number;
                    poor: number;
                };
            };
        };
        efficiency: {
            power: {
                criteria: string[];
                weight: number;
                thresholds: {
                    excellent: number;
                    good: number;
                    average: number;
                    poor: number;
                };
            };
            endurance: {
                criteria: string[];
                weight: number;
                thresholds: {
                    excellent: number;
                    good: number;
                    average: number;
                    poor: number;
                };
            };
            speed: {
                criteria: string[];
                weight: number;
                thresholds: {
                    excellent: number;
                    good: number;
                    average: number;
                    poor: number;
                };
            };
        };
    };
    videoAnalysisSettings: {
        frameRate: number;
        keyFrameInterval: number;
        analysisRegions: {
            body: {
                x: number;
                y: number;
                width: number;
                height: number;
            };
            head: {
                x: number;
                y: number;
                width: number;
                height: number;
            };
            arms: {
                x: number;
                y: number;
                width: number;
                height: number;
            };
            legs: {
                x: number;
                y: number;
                width: number;
                height: number;
            };
        };
        detectionSensitivity: number;
        trackingAccuracy: number;
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
export interface IVideoAnalysisResult extends Document {
    studentId: mongoose.Types.ObjectId;
    instructorId: mongoose.Types.ObjectId;
    videoId: string;
    technique: string;
    level: string;
    videoMetadata: {
        duration: number;
        frameRate: number;
        resolution: {
            width: number;
            height: number;
        };
        fileSize: number;
        uploadDate: Date;
    };
    analysisResult: {
        overallScore: number;
        categoryScores: {
            posture: number;
            breathing: number;
            movement: number;
            efficiency: number;
        };
        detailedAnalysis: {
            posture: {
                bodyAlignment: {
                    score: number;
                    details: string[];
                };
                headPosition: {
                    score: number;
                    details: string[];
                };
                coreStability: {
                    score: number;
                    details: string[];
                };
            };
            breathing: {
                timing: {
                    score: number;
                    details: string[];
                };
                technique: {
                    score: number;
                    details: string[];
                };
                consistency: {
                    score: number;
                    details: string[];
                };
            };
            movement: {
                strokeTechnique: {
                    score: number;
                    details: string[];
                };
                rhythm: {
                    score: number;
                    details: string[];
                };
                coordination: {
                    score: number;
                    details: string[];
                };
            };
            efficiency: {
                power: {
                    score: number;
                    details: string[];
                };
                endurance: {
                    score: number;
                    details: string[];
                };
                speed: {
                    score: number;
                    details: string[];
                };
            };
        };
        keyFrames: {
            frameNumber: number;
            timestamp: number;
            analysis: string;
            score: number;
        }[];
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
        nextAnalysisDate: Date;
    };
    feedback: {
        summary: string;
        detailedFeedback: string;
        encouragement: string;
        goals: string[];
    };
    filePaths?: {
        video3D?: string;
        originalFrames?: string[];
        depthMaps?: string[];
        reconstructed3D?: string[];
    };
    analysisDate: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const VideoAnalysisCriteria: mongoose.Model<IVideoAnalysisCriteria, {}, {}, {}, mongoose.Document<unknown, {}, IVideoAnalysisCriteria> & IVideoAnalysisCriteria & {
    _id: mongoose.Types.ObjectId;
}, any>;
export declare const VideoAnalysisResult: mongoose.Model<IVideoAnalysisResult, {}, {}, {}, mongoose.Document<unknown, {}, IVideoAnalysisResult> & IVideoAnalysisResult & {
    _id: mongoose.Types.ObjectId;
}, any>;
//# sourceMappingURL=VideoAnalysisCriteria.d.ts.map