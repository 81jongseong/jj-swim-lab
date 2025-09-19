import { ICourseAction } from '../models/CourseAction';
export interface QualityCheck {
    courseId: string;
    centerId: string;
    issues: QualityIssue[];
    overallScore: number;
    recommendedAction: 'none' | 'warning' | 'suspend' | 'deactivate';
}
export interface QualityIssue {
    category: 'safety' | 'quality' | 'policy' | 'financial' | 'certification' | 'facility';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    evidence?: string;
    threshold: number;
    currentValue: number;
}
export declare class CourseQualityService {
    static performQualityCheck(courseId: string): Promise<QualityCheck>;
    static issueWarning(courseId: string, adminId: string, qualityCheck: QualityCheck, warningLevel: 1 | 2 | 3): Promise<ICourseAction>;
    static deactivateCourseWithJustification(courseId: string, adminId: string, reason: {
        category: 'safety' | 'quality' | 'policy' | 'financial' | 'certification' | 'facility' | 'other';
        description: string;
        evidence?: string[];
    }, qualityCheck?: QualityCheck): Promise<ICourseAction>;
    static submitAppeal(actionId: string, centerId: string, appealReason: string, evidence?: string[]): Promise<ICourseAction>;
    static reviewAppeal(actionId: string, reviewerId: string, decision: 'approved' | 'rejected', reviewResult: string): Promise<ICourseAction>;
    static getQualityDashboard(): Promise<any>;
}
//# sourceMappingURL=courseQualityService.d.ts.map