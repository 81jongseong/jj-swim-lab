import mongoose from 'mongoose';

// 사용자 인터페이스 정의
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
    enrolledCourses?: mongoose.Types.ObjectId[];
    completedCourses?: mongoose.Types.ObjectId[];
    // 건강상태 정보 추가
    healthProfile?: {
      height?: number; // cm
      weight?: number; // kg
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

const userSchema = new mongoose.Schema({
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
  // 4가지 사용자 유형
  userType: {
    type: String,
    enum: ['student', 'instructor', 'centerAdmin', 'superAdmin'],
    default: 'student',
  },
  // 레벨 시스템 (각 사용자 유형별로 다른 레벨 체계)
  level: {
    type: String,
    default: 'beginner', // 기본값은 초급
  },
  // 수강생 전용 필드
  studentInfo: {
    age: { type: Number, default: null },
    emergencyContact: { type: String, default: '' },
    medicalConditions: { type: String, default: '' },
    swimmingLevel: { 
      type: String, 
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'beginner'
    },
    enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    completedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  },
  // 강사 전용 필드
  instructorInfo: {
    experience: { type: String, default: '' },
    certifications: [{ type: String }],
    specialties: [{ type: String }],
    instructorLevel: {
      type: String,
      enum: ['junior', 'senior', 'master', 'expert'],
      default: 'junior'
    },
    assignedCenters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SwimmingCenter' }],
    maxStudents: { type: Number, default: 20 },
    currentStudents: { type: Number, default: 0 },
  },
  // 센터 관리자 전용 필드
  centerAdminInfo: {
    managedCenters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SwimmingCenter' }],
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
  // 총관리자 전용 필드
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
  // 공통 필드
  centerId: {
    type: mongoose.Schema.Types.ObjectId,
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
  // 기능 접근 권한 (레벨별)
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
  // 기능 흐름 시퀀스 (레벨별)
  featureSequence: {
    currentStep: { type: String, default: 'dashboard' },
    completedSteps: [{ type: String }],
    availableSteps: [{ type: String }],
  },
  // 계정 상태 변경 이력
  statusHistory: [{
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended', 'deleted'],
      required: true,
    },
    reason: { type: String },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
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

// 사용자 유형별 레벨 인덱스 (unique는 schema에서 자동 생성됨)
userSchema.index({ userType: 1, level: 1 });

// 가상 필드: 사용자 유형별 레벨 정보
userSchema.virtual('userLevelInfo').get(function(this: IUser) {
  switch(this.userType) {
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

// 수강생 레벨 업그레이드 메서드
userSchema.methods.getNextStudentLevel = function(this: IUser): string | null {
  const levels = ['beginner', 'intermediate', 'advanced', 'expert'];
  const currentIndex = levels.indexOf(this.studentInfo?.swimmingLevel || 'beginner');
  return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null;
};

// 강사 레벨 업그레이드 메서드
userSchema.methods.getNextInstructorLevel = function(this: IUser): string | null {
  const levels = ['junior', 'senior', 'master', 'expert'];
  const currentIndex = levels.indexOf(this.instructorInfo?.instructorLevel || 'junior');
  return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null;
};

// 센터 관리자 레벨 업그레이드 메서드
userSchema.methods.getNextCenterAdminLevel = function(this: IUser): string | null {
  const levels = ['assistant', 'manager', 'director'];
  const currentIndex = levels.indexOf(this.centerAdminInfo?.adminLevel || 'assistant');
  return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null;
};

// 총관리자 레벨 업그레이드 메서드
userSchema.methods.getNextSuperAdminLevel = function(this: IUser): string | null {
  const levels = ['admin', 'superAdmin', 'systemAdmin'];
  const currentIndex = levels.indexOf(this.superAdminInfo?.adminLevel || 'admin');
  return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null;
};

// 수강생 진행률 계산
userSchema.methods.calculateStudentProgress = function(this: IUser): number {
  const completedCount = this.studentInfo?.completedCourses?.length || 0;
  const enrolledCount = this.studentInfo?.enrolledCourses?.length || 0;
  const totalCount = completedCount + enrolledCount;
  
  if (totalCount === 0) return 0;
  return Math.round((completedCount / totalCount) * 100);
};

// 강사 진행률 계산
userSchema.methods.calculateInstructorProgress = function(this: IUser): number {
  const currentStudents = this.instructorInfo?.currentStudents || 0;
  const maxStudents = this.instructorInfo?.maxStudents || 20;
  return Math.round((currentStudents / maxStudents) * 100);
};

// 센터 관리자 진행률 계산
userSchema.methods.calculateCenterAdminProgress = function(this: IUser): number {
  const managedCenters = this.centerAdminInfo?.managedCenters?.length || 0;
  return Math.min(managedCenters * 25, 100); // 센터당 25%씩, 최대 100%
};

// 총관리자 진행률 계산
userSchema.methods.calculateSuperAdminProgress = function(this: IUser): number {
  const permissions = this.superAdminInfo?.systemPermissions || {};
  const totalPermissions = Object.keys(permissions).length;
  const activePermissions = Object.values(permissions).filter(Boolean).length;
  return Math.round((activePermissions / totalPermissions) * 100);
};

// 사용자 유형별 권한 설정 메서드
userSchema.methods.setPermissionsByType = function(this: IUser): void {
  switch(this.userType) {
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

// 기능 시퀀스 설정 메서드
userSchema.methods.setFeatureSequence = function(this: IUser): void {
  switch(this.userType) {
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

export const User = mongoose.model<IUser>('User', userSchema);
