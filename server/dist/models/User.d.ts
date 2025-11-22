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
    birthDate?: string;
    gender?: 'male' | 'female' | 'other' | '';
    socialAccounts?: Array<{
        provider: 'kakao' | 'naver' | 'google' | 'facebook';
        providerId: string;
        connectedAt: Date;
    }>;
    location?: {
        type: 'Point';
        coordinates: [number, number];
    };
    userType: 'student' | 'instructor' | 'centerAdmin' | 'center-admin' | 'superAdmin';
    level: string;
    centerId?: mongoose.Types.ObjectId;
    studentInfo?: {
        age?: number;
        emergencyContact?: string;
        medicalConditions?: string;
        swimmingLevel?: '초급' | '중급' | '고급' | '전문가' | '마스터';
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
            bloodPressure?: {
                systolic?: number;
                diastolic?: number;
                measuredAt?: Date;
            };
            cholesterol?: {
                total?: number;
                ldl?: number;
                hdl?: number;
                triglycerides?: number;
                measuredAt?: Date;
            };
            bloodSugar?: {
                fasting?: number;
                postprandial?: number;
                hba1c?: number;
                measuredAt?: Date;
            };
            swimmingRelatedConditions?: {
                cardiovascular?: boolean;
                respiratory?: boolean;
                musculoskeletal?: boolean;
                diabetes?: boolean;
                hypertension?: boolean;
                asthma?: boolean;
                other?: string[];
            };
            fitnessMetrics?: {
                restingHeartRate?: number;
                maxHeartRate?: number;
                bodyFatPercentage?: number;
                muscleMass?: number;
                lungCapacity?: number;
                hydrationLevel?: number;
                boneDensity?: number;
                measuredAt?: Date;
            };
            healthHistory?: Array<{
                date: Date;
                weight?: number;
                bmi?: number;
                bloodPressure?: {
                    systolic?: number;
                    diastolic?: number;
                };
                cholesterol?: {
                    total?: number;
                    ldl?: number;
                    hdl?: number;
                    triglycerides?: number;
                };
                bloodSugar?: {
                    fasting?: number;
                    postprandial?: number;
                    hba1c?: number;
                };
                notes?: string;
            }>;
            privacySettings?: {
                height?: boolean;
                weight?: boolean;
                bmi?: boolean;
                waist_circumference?: boolean;
                heart_rate?: boolean;
                max_heart_rate?: boolean;
                blood_pressure_systolic?: boolean;
                blood_pressure_diastolic?: boolean;
                beta_blocker?: boolean;
                muscle_mass?: boolean;
                body_fat?: boolean;
                lung_capacity?: boolean;
                bone_density?: boolean;
                cholesterol_total?: boolean;
                cholesterol_ldl?: boolean;
                cholesterol_hdl?: boolean;
                cholesterol_triglycerides?: boolean;
                blood_sugar_fasting?: boolean;
                blood_sugar_postprandial?: boolean;
                blood_sugar_hba1c?: boolean;
                egfr?: boolean;
                swim_level?: boolean;
                css_freestyle?: boolean;
                css_backstroke?: boolean;
                css_breaststroke?: boolean;
                css_butterfly?: boolean;
                vo2max?: boolean;
                sessions_per_week?: boolean;
                session_duration?: boolean;
                pool_length?: boolean;
                exercise_goals?: boolean;
                adherence_rate?: boolean;
                chronic_conditions?: boolean;
                medications?: boolean;
                allergies?: boolean;
            };
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
        instructorType?: 'instructor' | 'lifeguard';
        experience?: string;
        certifications?: string[];
        specialties?: string[];
        instructorLevel?: 'junior' | 'senior' | 'master' | 'expert';
        analysisFee?: number;
        assignedCenters?: mongoose.Types.ObjectId[];
        maxStudents?: number;
        currentStudents?: number;
        workSchedule?: {
            daysOfWeek?: number[];
            timeSlots?: string[];
        };
        salaryInfo?: {
            type?: 'monthly' | 'hourly' | 'per-class';
            amount?: number;
            currency?: string;
            incentive?: number;
        };
        memo?: string;
        hiredAt?: Date;
        contractType?: 'full-time' | 'part-time' | 'contract' | 'freelance';
        employmentHistory?: Array<{
            centerId?: mongoose.Types.ObjectId;
            centerName?: string;
            startDate?: Date;
            endDate?: Date;
            position?: string;
            rating?: number;
            totalClasses?: number;
            totalStudents?: number;
            leaveReason?: string;
            memo?: string;
        }>;
        personalLessonSettings?: {
            isPersonalLessonEnabled?: boolean;
            lessonTypes?: Array<{
                type: '1:1' | '1:2' | '1:3' | '1:4' | '1:5';
                maxStudents: number;
                pricePerSession: number;
                monthlyPrice?: number;
            }>;
            frequencyOptions?: Array<{
                type: 'weekly' | 'monthly';
                sessions: number;
                price: number;
                expirationDays?: number;
            }>;
            availability?: {
                timeSlots?: Array<{
                    dayOfWeek: number;
                    startTime: string;
                    endTime: string;
                    isActive: boolean;
                }>;
                maxDailyLessons?: number;
                bufferTime?: number;
            };
        };
        availableRegions?: string[];
        introduction?: string;
        photo?: string;
        profileCustomization?: {
            theme?: 'default' | 'blue' | 'green' | 'purple' | 'orange' | 'custom';
            primaryColor?: string;
            secondaryColor?: string;
            layout?: 'compact' | 'standard' | 'detailed';
            showPhoto?: boolean;
            showCertifications?: boolean;
            showExperience?: boolean;
            showSpecialties?: boolean;
            showRegions?: boolean;
        };
        certificates?: Array<{
            name: string;
            issuer: string;
            certificateNumber: string;
            acquiredDate: string;
        }>;
        teachingExperiences?: Array<{
            centerName: string;
            startDate: string;
            endDate: string;
            workType: string;
        }>;
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