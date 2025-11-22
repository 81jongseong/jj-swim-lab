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
/// <reference types="mongoose" />
/// <reference types="mongoose/types/inferschematype" />
export declare class NotificationService {
    static createLearningProgressNotification(userId: string, progressData: any): Promise<import("mongoose").Document<unknown, {}, import("../models/Notification").INotification> & import("../models/Notification").INotification & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    static createRecommendationNotification(userId: string, recommendationData: any): Promise<import("mongoose").Document<unknown, {}, import("../models/Notification").INotification> & import("../models/Notification").INotification & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    static createLessonPlanNotification(instructorId: string, studentId: string, lessonData: any): Promise<import("mongoose").Document<unknown, {}, import("../models/Notification").INotification> & import("../models/Notification").INotification & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    static createQuizNotification(userId: string, quizData: any): Promise<import("mongoose").Document<unknown, {}, import("../models/Notification").INotification> & import("../models/Notification").INotification & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    static createSystemNotification(userId: string, systemData: any): Promise<import("mongoose").Document<unknown, {}, import("../models/Notification").INotification> & import("../models/Notification").INotification & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    static createAchievementNotification(userId: string, achievementData: any): Promise<import("mongoose").Document<unknown, {}, import("../models/Notification").INotification> & import("../models/Notification").INotification & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    static getUserNotificationStats(userId: string): Promise<{
        total: any;
        unread: any;
        byType: any;
    }>;
    static cleanupExpiredNotifications(): Promise<number>;
}
//# sourceMappingURL=notificationService.d.ts.map