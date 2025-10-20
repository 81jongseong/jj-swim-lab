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
import mongoose from 'mongoose';
interface IUser extends mongoose.Document {
    userId?: string;
    name: string;
    email: string;
    password: string;
    phone: string;
    address: string;
    location?: {
        type: 'Point';
        coordinates: [number, number];
    };
    userType: 'student' | 'instructor' | 'centerAdmin' | 'superAdmin';
    level: string;
    centerId?: mongoose.Types.ObjectId;
    studentInfo?: {
        age?: number;
        emergencyContact?: string;
        medicalConditions?: string;
        swimmingLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
        currentLevel?: string;
        instructorId?: mongoose.Types.ObjectId;
        centerMemo?: string;
        centerMemoUpdatedAt?: Date;
        centerMemos?: Array<{
            content: string;
            type: 'info' | 'warning' | 'complaint' | 'special';
            createdBy: mongoose.Types.ObjectId;
            createdByName: string;
            createdAt: Date;
        }>;
        status?: 'active' | 'inactive' | 'suspended';
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
        swimmingProfile?: {
            css?: {
                freestyle?: number;
                backstroke?: number;
                breaststroke?: number;
                butterfly?: number;
                lastUpdated?: Date;
                updatedBy?: mongoose.Types.ObjectId;
                updatedByRole?: 'self' | 'instructor';
            };
            mainStrokes?: string[];
            preferredStrokes?: string[];
            excludedStrokes?: string[];
            trainingDays?: number[];
            sessionsPerWeek?: number;
            sessionDuration?: number;
            poolLength?: number;
            currentGoal?: string;
            conditionIds?: string[];
            teachingProgress?: Array<{
                methodId: mongoose.Types.ObjectId;
                methodName: string;
                stroke: string;
                category: string;
                completedSteps: string[];
                totalSteps: number;
                completionRate: number;
                lastPracticed?: Date;
                masteryLevel?: 'learning' | 'practicing' | 'proficient' | 'mastered';
                notes?: string;
                evaluatedBy?: mongoose.Types.ObjectId;
                evaluatedAt?: Date;
            }>;
            pendingChanges?: {
                css?: Record<string, number>;
                mainStrokes?: string[];
                preferredStrokes?: string[];
                excludedStrokes?: string[];
                trainingDays?: number[];
                sessionsPerWeek?: number;
                sessionDuration?: number;
                currentGoal?: string;
                proposedBy?: mongoose.Types.ObjectId;
                proposedAt?: Date;
                reason?: string;
            };
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