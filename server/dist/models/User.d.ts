import mongoose from 'mongoose';
interface IUser extends mongoose.Document {
    userId?: string;
    name: string;
    email: string;
    password: string;
    phone: string;
    address: string;
    userType: 'student' | 'instructor' | 'centerAdmin' | 'superAdmin';
    level: string;
    centerId?: mongoose.Types.ObjectId;
    studentInfo?: {
        age?: number;
        emergencyContact?: string;
        medicalConditions?: string;
        swimmingLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
        currentLevel?: string;
        enrolledCourses?: mongoose.Types.ObjectId[];
        completedCourses?: mongoose.Types.ObjectId[];
        levelChangeHistory?: Array<{
            fromLevel: string;
            toLevel: string;
            changedBy: mongoose.Types.ObjectId;
            changedByType: string;
            reason?: string;
            changedAt: Date;
        }>;
        healthProfile?: {
            height?: number;
            weight?: number;
            bmi?: number;
            bloodType?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
            allergies?: string[];
            chronicConditions?: string[];
            medications?: string[];
            emergencyContact?: {
                name: string;
                relationship: string;
                phone: string;
            };
            fitnessGoals?: string[];
            activityLevel?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
            targetWeight?: number;
            targetBMI?: number;
            lastHealthCheck?: Date;
        };
    };
    instructorInfo?: {
        experience?: string;
        certifications?: string[];
        specialties?: string[];
        instructorLevel?: 'junior' | 'senior' | 'master' | 'expert';
        assignedCenters?: mongoose.Types.ObjectId[];
        maxStudents?: number;
        currentStudents?: number;
    };
    centerAdminInfo?: {
        managedCenters?: mongoose.Types.ObjectId[];
        adminLevel?: 'assistant' | 'manager' | 'director';
        permissions?: {
            canManageUsers?: boolean;
            canManageCourses?: boolean;
            canManageBookings?: boolean;
            canManagePayments?: boolean;
            canManageNotices?: boolean;
            canViewReports?: boolean;
        };
    };
    superAdminInfo?: {
        systemPermissions?: {
            canManageAllUsers?: boolean;
            canManageAllCenters?: boolean;
            canManageSystemSettings?: boolean;
            canViewAllReports?: boolean;
            canManageSkillTemplates?: boolean;
        };
        adminLevel?: 'admin' | 'superAdmin' | 'systemAdmin';
    };
    isActive: boolean;
    lastLoginAt?: Date;
    accessPermissions: {
        dashboard: boolean;
        courses: boolean;
        bookings: boolean;
        payments: boolean;
        notices: boolean;
        progress: boolean;
        evaluations: boolean;
        reports: boolean;
        userManagement: boolean;
        systemSettings: boolean;
        aiConfigManagement: boolean;
    };
    featureSequence: {
        currentStep: string;
        completedSteps: string[];
        availableSteps: string[];
    };
    userLevelInfo: {
        type: string;
        level: string;
        nextLevel?: string;
        progress: number;
    };
    statusHistory?: Array<{
        status: string;
        reason?: string;
        changedBy: mongoose.Types.ObjectId;
        changedAt: Date;
    }>;
    getNextStudentLevel(): string | null;
    getNextInstructorLevel(): string | null;
    getNextCenterAdminLevel(): string | null;
    getNextSuperAdminLevel(): string | null;
    calculateStudentProgress(): number;
    calculateInstructorProgress(): number;
    calculateCenterAdminProgress(): number;
    calculateSuperAdminProgress(): number;
    setPermissionsByType(): void;
    setFeatureSequence(): void;
}
export declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser> & IUser & {
    _id: mongoose.Types.ObjectId;
}, any>;
export {};
//# sourceMappingURL=User.d.ts.map