export declare class LaneAllocationService {
    static adjustLanesForPersonalLesson(personalLessonData: any): Promise<{
        success: boolean;
        adjustedCourses: number;
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
}
//# sourceMappingURL=laneAllocationService.d.ts.map