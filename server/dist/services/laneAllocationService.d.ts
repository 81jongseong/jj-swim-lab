export declare class LaneAllocationService {
    static adjustLanesForPersonalLesson(personalLessonData: any): Promise<{
        success: boolean;
        adjustedCourses: number;
        personalLessonLane: number;
        adjustedCoursesList: {
            name: any;
            lanes: any;
        }[];
    }>;
    static restoreLanesAfterPersonalLessonCancellation(personalLessonId: string): Promise<{
        success: boolean;
        restoredCourses: number;
    }>;
    static checkLaneConflicts(date: string, time: string, centerId: string, duration: number): Promise<any[]>;
    static findAvailableLanes(date: string, time: string, centerId: string, duration: number): Promise<{
        availableLanes: number[];
        conflictingLanes: unknown[];
        conflicts: any[];
    }>;
    static organizeAllCourseLanes(centerId: string): Promise<{
        success: boolean;
        adjustedCount: number;
        errorCount: number;
        totalCourses: number;
    }>;
}
//# sourceMappingURL=laneAllocationService.d.ts.map