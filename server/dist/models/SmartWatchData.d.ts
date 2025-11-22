import mongoose from 'mongoose';
export interface ISmartWatchData {
    studentId: mongoose.Types.ObjectId;
    sessionId: string;
    deviceInfo: {
        deviceType: string;
        deviceModel: string;
        firmwareVersion: string;
    };
    sessionInfo: {
        startTime: Date;
        endTime: Date;
        duration: number;
        technique: string;
        poolLength: number;
        totalDistance: number;
    };
    performanceMetrics: {
        averageSpeed: number;
        maxSpeed: number;
        averageHeartRate: number;
        maxHeartRate: number;
        minHeartRate: number;
        strokeCount: number;
        strokeRate: number;
        caloriesBurned: number;
        efficiency: number;
    };
    detailedData: {
        heartRateData: Array<{
            timestamp: Date;
            heartRate: number;
        }>;
        strokeData: Array<{
            timestamp: Date;
            strokeType: string;
            strokeCount: number;
            strokeRate: number;
        }>;
        speedData: Array<{
            timestamp: Date;
            speed: number;
            distance: number;
        }>;
        restPeriods: Array<{
            startTime: Date;
            endTime: Date;
            duration: number;
        }>;
    };
    aiAnalysis: {
        postureScore: number;
        breathingPattern: {
            averageBreathRate: number;
            breathConsistency: number;
            breathEfficiency: number;
        };
        strokeAnalysis: {
            strokeConsistency: number;
            strokeEfficiency: number;
            strokePower: number;
        };
        overallEfficiency: number;
        recommendations: string[];
    };
    syncedAt: Date;
    isProcessed: boolean;
}
export declare const SmartWatchData: mongoose.Model<ISmartWatchData & mongoose.Document<any, any, any>, {}, {}, {}, mongoose.Document<unknown, {}, ISmartWatchData & mongoose.Document<any, any, any>> & ISmartWatchData & mongoose.Document<any, any, any> & {
    _id: mongoose.Types.ObjectId;
}, any>;
//# sourceMappingURL=SmartWatchData.d.ts.map