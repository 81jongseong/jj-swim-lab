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
    userType: {
        type: String,
        enum: ['student', 'instructor', 'centerAdmin', 'superAdmin'],
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
            enum: ['beginner', 'intermediate', 'advanced', 'expert'],
            default: 'beginner'
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
        currentLevel: { type: String, default: 'beginner' }
    },
    instructorInfo: {
        experience: { type: String, default: '' },
        certifications: [{ type: String }],
        specialties: [{ type: String }],
        instructorLevel: {
            type: String,
            enum: ['junior', 'senior', 'master', 'expert'],
            default: 'junior'
        },
        assignedCenters: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'SwimmingCenter' }],
        maxStudents: { type: Number, default: 20 },
        currentStudents: { type: Number, default: 0 },
    },
    centerAdminInfo: {
        managedCenters: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'SwimmingCenter' }],
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
userSchema.virtual('userLevelInfo').get(function () {
    switch (this.userType) {
        case 'student':
            return {
                type: 'student',
                level: this.studentInfo?.swimmingLevel || 'beginner',
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
    const levels = ['beginner', 'intermediate', 'advanced', 'expert'];
    const currentIndex = levels.indexOf(this.studentInfo?.swimmingLevel || 'beginner');
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