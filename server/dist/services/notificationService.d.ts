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