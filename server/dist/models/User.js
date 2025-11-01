"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
    userId: {
        type: String,
        required: false,
        unique: false,
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: false,
        default: '',
    },
    address: {
        type: String,
        default: '',
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            default: undefined
        }
    },
    userType: {
        type: String,
        enum: ['student', 'instructor', 'centerAdmin', 'center-admin', 'superAdmin'],
        default: 'student',
    },
    level: {
        type: String,
        default: 'beginner',
    },
    studentInfo: {
        age: { type: Number, default: null },
        emergencyContact: { type: String, default: '' },
        medicalConditions: { type: String, default: '' },
        swimmingLevel: {
            type: String,
            enum: ['초급', '중급', '고급', '전문가', '마스터'],
            default: '초급'
        },
        currentLevel: { type: String },
        instructorId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' },
        centerMemo: { type: String, default: '' },
        centerMemoUpdatedAt: { type: Date },
        centerMemos: [{
                content: { type: String, required: true },
                type: {
                    type: String,
                    enum: ['info', 'warning', 'complaint', 'special'],
                    default: 'info'
                },
                createdBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
                createdByName: { type: String, required: true },
                createdAt: { type: Date, default: Date.now }
            }],
        status: {
            type: String,
            enum: ['active', 'inactive', 'suspended'],
            default: 'active'
        },
        enrolledCourses: [{ type: mongoose_1.default.Schema.Types.Mixed, ref: 'Course' }],
        completedCourses: [{ type: mongoose_1.default.Schema.Types.Mixed, ref: 'Course' }],
        levelChangeHistory: [{
                fromLevel: { type: String, required: true },
                toLevel: { type: String, required: true },
                changedBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
                changedByType: { type: String, enum: ['instructor', 'centerAdmin', 'superAdmin'], required: true },
                reason: { type: String, default: '' },
                changedAt: { type: Date, default: Date.now }
            }],
        healthProfile: {
            height: { type: Number },
            weight: { type: Number },
            bmi: { type: Number },
            bloodType: {
                type: String,
                enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
            },
            allergies: [{ type: String }],
            chronicConditions: [{ type: String }],
            medications: [{ type: String }],
            emergencyContact: {
                name: { type: String },
                relationship: { type: String },
                phone: { type: String }
            },
            fitnessGoals: [{ type: String }],
            activityLevel: {
                type: String,
                enum: ['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active']
            },
            targetWeight: { type: Number },
            targetBMI: { type: Number },
            lastHealthCheck: { type: Date },
            bloodPressure: {
                systolic: { type: Number },
                diastolic: { type: Number },
                measuredAt: { type: Date }
            },
            cholesterol: {
                total: { type: Number },
                ldl: { type: Number },
                hdl: { type: Number },
                triglycerides: { type: Number },
                measuredAt: { type: Date }
            },
            bloodSugar: {
                fasting: { type: Number },
                postprandial: { type: Number },
                hba1c: { type: Number },
                measuredAt: { type: Date }
            },
            swimmingRelatedConditions: {
                cardiovascular: { type: Boolean, default: false },
                respiratory: { type: Boolean, default: false },
                musculoskeletal: { type: Boolean, default: false },
                diabetes: { type: Boolean, default: false },
                hypertension: { type: Boolean, default: false },
                asthma: { type: Boolean, default: false },
                other: [{ type: String }]
            },
            healthHistory: [{
                    date: { type: Date, default: Date.now },
                    weight: { type: Number },
                    bmi: { type: Number },
                    bloodPressure: {
                        systolic: { type: Number },
                        diastolic: { type: Number }
                    },
                    cholesterol: {
                        total: { type: Number },
                        ldl: { type: Number },
                        hdl: { type: Number },
                        triglycerides: { type: Number }
                    },
                    bloodSugar: {
                        fasting: { type: Number },
                        postprandial: { type: Number },
                        hba1c: { type: Number }
                    },
                    notes: { type: String }
                }]
        },
        swimmingProfile: {
            css: {
                freestyle: { type: Number },
                backstroke: { type: Number },
                breaststroke: { type: Number },
                butterfly: { type: Number },
                lastUpdated: { type: Date },
                updatedBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' },
                updatedByRole: { type: String, enum: ['self', 'instructor'] }
            },
            mainStrokes: [{ type: String }],
            preferredStrokes: [{ type: String }],
            excludedStrokes: [{ type: String }],
            trainingDays: [{ type: Number, min: 0, max: 6 }],
            sessionsPerWeek: { type: Number, default: 3 },
            sessionDuration: { type: Number, default: 60 },
            poolLength: { type: Number, default: 25 },
            currentGoal: { type: String },
            conditionIds: [{ type: String }],
            vo2max: { type: Number },
            maxHeartRate: { type: Number },
            restingHeartRate: { type: Number },
            lastRacePlan: {
                raceDate: { type: String },
                raceDistance: { type: Number },
                raceStroke: { type: String },
                currentTime: { type: Number },
                targetTime: { type: Number },
                taperWeeks: { type: Number },
                raceEvents: [{
                        distance: { type: Number },
                        stroke: { type: String },
                        currentTime: { type: Number },
                        targetTime: { type: Number },
                        priority: { type: String, enum: ['primary', 'secondary'] }
                    }],
                updatedAt: { type: Date }
            },
            pendingChanges: {
                css: { type: mongoose_1.default.Schema.Types.Mixed },
                mainStrokes: [{ type: String }],
                preferredStrokes: [{ type: String }],
                excludedStrokes: [{ type: String }],
                trainingDays: [{ type: Number }],
                sessionsPerWeek: { type: Number },
                sessionDuration: { type: Number },
                poolLength: { type: Number },
                currentGoal: { type: String },
                proposedBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' },
                proposedAt: { type: Date },
                reason: { type: String }
            }
        }
    },
    instructorInfo: {
        instructorType: {
            type: String,
            enum: ['instructor', 'lifeguard'],
            default: 'instructor'
        },
        experience: { type: String, default: '' },
        certifications: [{ type: String }],
        specialties: [{ type: String }],
        instructorLevel: {
            type: String,
            enum: ['junior', 'senior', 'master', 'expert'],
            default: 'junior'
        },
        assignedCenters: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'SwimmingCenter' }],
        assignedInstructor: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' },
        maxStudents: { type: Number, default: 20 },
        currentStudents: { type: Number, default: 0 },
        workSchedule: {
            daysOfWeek: [{ type: Number, min: 0, max: 6 }],
            timeSlots: [{ type: String }]
        },
        salaryInfo: {
            type: {
                type: String,
                enum: ['monthly', 'hourly', 'per-class'],
                default: 'monthly'
            },
            amount: { type: Number, default: 0 },
            currency: { type: String, default: 'KRW' },
            incentive: { type: Number, default: 0 }
        },
        memo: { type: String, default: '' },
        hiredAt: { type: Date },
        contractType: {
            type: String,
            enum: ['full-time', 'part-time', 'contract', 'freelance'],
            default: 'full-time'
        },
        employmentHistory: [{
                centerId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'SwimmingCenter' },
                centerName: { type: String, required: true },
                startDate: { type: Date, required: true },
                endDate: { type: Date, required: true },
                position: { type: String, default: '강사' },
                rating: { type: Number, min: 0, max: 5, default: 0 },
                totalClasses: { type: Number, default: 0 },
                totalStudents: { type: Number, default: 0 },
                leaveReason: { type: String, default: '' },
                memo: { type: String, default: '' }
            }]
    },
    centerAdminInfo: {
        managedCenters: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Center' }],
        adminLevel: {
            type: String,
            enum: ['assistant', 'manager', 'director'],
            default: 'assistant'
        },
        permissions: {
            canManageUsers: { type: Boolean, default: false },
            canManageCourses: { type: Boolean, default: true },
            canManageBookings: { type: Boolean, default: true },
            canManagePayments: { type: Boolean, default: true },
            canManageNotices: { type: Boolean, default: true },
            canViewReports: { type: Boolean, default: true },
        }
    },
    superAdminInfo: {
        systemPermissions: {
            canManageAllUsers: { type: Boolean, default: true },
            canManageAllCenters: { type: Boolean, default: true },
            canManageSystemSettings: { type: Boolean, default: true },
            canViewAllReports: { type: Boolean, default: true },
            canManageSkillTemplates: { type: Boolean, default: true },
        },
        adminLevel: {
            type: String,
            enum: ['admin', 'superAdmin', 'systemAdmin'],
            default: 'admin'
        }
    },
    centerId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'SwimmingCenter',
        default: null,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    lastLoginAt: {
        type: Date,
        default: null,
    },
    accessPermissions: {
        dashboard: { type: Boolean, default: true },
        courses: { type: Boolean, default: true },
        bookings: { type: Boolean, default: true },
        payments: { type: Boolean, default: true },
        notices: { type: Boolean, default: true },
        progress: { type: Boolean, default: true },
        evaluations: { type: Boolean, default: true },
        reports: { type: Boolean, default: false },
        userManagement: { type: Boolean, default: false },
        systemSettings: { type: Boolean, default: false },
    },
    featureSequence: {
        currentStep: { type: String, default: 'dashboard' },
        completedSteps: [{ type: String }],
        availableSteps: [{ type: String }],
    },
    statusHistory: [{
            status: {
                type: String,
                enum: ['active', 'inactive', 'suspended', 'deleted'],
                required: true,
            },
            reason: { type: String },
            changedBy: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: 'User',
                required: true,
            },
            changedAt: {
                type: Date,
                default: Date.now,
                required: true,
            },
        }],
}, {
    timestamps: true
});
userSchema.index({ userType: 1, level: 1 });
userSchema.index({ email: 1 });
userSchema.index({ centerId: 1, userType: 1 });
userSchema.index({ 'studentInfo.swimmingLevel': 1 });
userSchema.index({ 'instructorInfo.instructorLevel': 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ isActive: 1, userType: 1 });
userSchema.index({ 'permissions': 1 });
userSchema.virtual('userLevelInfo').get(function () {
    switch (this.userType) {
        case 'student':
            return {
                type: 'student',
                level: this.studentInfo?.swimmingLevel || '초급',
                nextLevel: this.getNextStudentLevel(),
                progress: this.calculateStudentProgress()
            };
        case 'instructor':
            return {
                type: 'instructor',
                level: this.instructorInfo?.instructorLevel || 'junior',
                nextLevel: this.getNextInstructorLevel(),
                progress: this.calculateInstructorProgress()
            };
        case 'centerAdmin':
            return {
                type: 'centerAdmin',
                level: this.centerAdminInfo?.adminLevel || 'assistant',
                nextLevel: this.getNextCenterAdminLevel(),
                progress: this.calculateCenterAdminProgress()
            };
        case 'superAdmin':
            return {
                type: 'superAdmin',
                level: this.superAdminInfo?.adminLevel || 'admin',
                nextLevel: this.getNextSuperAdminLevel(),
                progress: this.calculateSuperAdminProgress()
            };
        default:
            return { type: 'unknown', level: 'unknown' };
    }
});
userSchema.methods.getNextStudentLevel = function () {
    const levels = ['초급', '중급', '고급', '전문가', '마스터'];
    const currentIndex = levels.indexOf(this.studentInfo?.swimmingLevel || '초급');
    return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null;
};
userSchema.methods.getNextInstructorLevel = function () {
    const levels = ['junior', 'senior', 'master', 'expert'];
    const currentIndex = levels.indexOf(this.instructorInfo?.instructorLevel || 'junior');
    return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null;
};
userSchema.methods.getNextCenterAdminLevel = function () {
    const levels = ['assistant', 'manager', 'director'];
    const currentIndex = levels.indexOf(this.centerAdminInfo?.adminLevel || 'assistant');
    return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null;
};
userSchema.methods.getNextSuperAdminLevel = function () {
    const levels = ['admin', 'superAdmin', 'systemAdmin'];
    const currentIndex = levels.indexOf(this.superAdminInfo?.adminLevel || 'admin');
    return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null;
};
userSchema.methods.calculateStudentProgress = function () {
    const completedCount = this.studentInfo?.completedCourses?.length || 0;
    const enrolledCount = this.studentInfo?.enrolledCourses?.length || 0;
    const totalCount = completedCount + enrolledCount;
    if (totalCount === 0)
        return 0;
    return Math.round((completedCount / totalCount) * 100);
};
userSchema.methods.calculateInstructorProgress = function () {
    const currentStudents = this.instructorInfo?.currentStudents || 0;
    const maxStudents = this.instructorInfo?.maxStudents || 20;
    return Math.round((currentStudents / maxStudents) * 100);
};
userSchema.methods.calculateCenterAdminProgress = function () {
    const managedCenters = this.centerAdminInfo?.managedCenters?.length || 0;
    return Math.min(managedCenters * 25, 100);
};
userSchema.methods.calculateSuperAdminProgress = function () {
    const permissions = this.superAdminInfo?.systemPermissions || {};
    const totalPermissions = Object.keys(permissions).length;
    const activePermissions = Object.values(permissions).filter(Boolean).length;
    return Math.round((activePermissions / totalPermissions) * 100);
};
userSchema.methods.setPermissionsByType = function () {
    switch (this.userType) {
        case 'student':
            this.accessPermissions = {
                dashboard: true,
                courses: true,
                bookings: true,
                payments: true,
                notices: true,
                progress: true,
                evaluations: true,
                reports: false,
                userManagement: false,
                systemSettings: false,
                aiConfigManagement: false,
            };
            break;
        case 'instructor':
            this.accessPermissions = {
                dashboard: true,
                courses: true,
                bookings: true,
                payments: false,
                notices: true,
                progress: true,
                evaluations: true,
                reports: true,
                userManagement: false,
                systemSettings: false,
                aiConfigManagement: false,
            };
            break;
        case 'centerAdmin':
            this.accessPermissions = {
                dashboard: true,
                courses: true,
                bookings: true,
                payments: true,
                notices: true,
                progress: true,
                evaluations: true,
                reports: true,
                userManagement: true,
                systemSettings: false,
                aiConfigManagement: false,
            };
            break;
        case 'superAdmin':
            this.accessPermissions = {
                dashboard: true,
                courses: true,
                bookings: true,
                payments: true,
                notices: true,
                progress: true,
                evaluations: true,
                reports: true,
                userManagement: true,
                systemSettings: true,
                aiConfigManagement: true,
            };
            break;
    }
};
userSchema.methods.setFeatureSequence = function () {
    switch (this.userType) {
        case 'student':
            this.featureSequence = {
                currentStep: 'dashboard',
                completedSteps: [],
                availableSteps: ['dashboard', 'courses', 'bookings', 'progress', 'evaluations']
            };
            break;
        case 'instructor':
            this.featureSequence = {
                currentStep: 'dashboard',
                completedSteps: [],
                availableSteps: ['dashboard', 'courses', 'students', 'progress', 'evaluations', 'reports']
            };
            break;
        case 'centerAdmin':
            this.featureSequence = {
                currentStep: 'dashboard',
                completedSteps: [],
                availableSteps: ['dashboard', 'users', 'courses', 'bookings', 'payments', 'notices', 'reports']
            };
            break;
        case 'superAdmin':
            this.featureSequence = {
                currentStep: 'dashboard',
                completedSteps: [],
                availableSteps: ['dashboard', 'system', 'users', 'centers', 'reports', 'settings']
            };
            break;
    }
};
exports.User = mongoose_1.default.model('User', userSchema);
//# sourceMappingURL=User.js.map