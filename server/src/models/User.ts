/**
 * 👤 JJ Swim Lab - 사용자 모델
 * 
 * 📋 **모델 목적**
 * - JJ Swim Lab 시스템의 모든 사용자 정보를 관리하는 핵심 모델
 * - 다양한 사용자 타입 지원 (학생, 강사, 센터 관리자, 슈퍼 관리자)
 * - 사용자별 상세 정보 및 권한 관리
 * - 센터별 사용자 그룹 관리 및 권한 제어
 * - 사용자 인증 및 보안 정보 관리
 * 
 * 🔄 **주요 기능**
 * - 사용자 기본 정보 관리 (이름, 이메일, 전화번호, 주소)
 * - 사용자 타입별 상세 정보 관리 (학생, 강사, 관리자)
 * - 센터별 사용자 그룹 관리
 * - 사용자 권한 및 역할 관리
 * - 사용자 인증 정보 관리 (비밀번호, 토큰)
 * - 사용자 활동 및 상태 추적
 * 
 * 🗄️ **데이터 연동**
 * - Center 모델과 연동 (센터별 사용자 관리)
 * - Course 모델과 연동 (수강 이력 관리)
 * - Booking 모델과 연동 (예약 정보 관리)
 * - Payment 모델과 연동 (결제 정보 관리)
 * - Progress 모델과 연동 (학습 진도 관리)
 * - 인증 시스템과 연동 (JWT 토큰)
 * 
 * 🛠️ **필요한 설치 파일**
 * - Mongoose 7.8.7
 * - bcrypt (비밀번호 해싱)
 * - JWT (토큰 생성/검증)
 * - MongoDB Atlas (데이터 저장)
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 비밀번호 해싱 및 보안 처리
 * 2. 사용자 타입별 권한 관리
 * 3. 센터별 사용자 그룹 관리
 * 4. 개인정보 보호 및 GDPR 준수
 * 5. 사용자 데이터 마이그레이션 시 주의
 * 6. 인덱스 최적화 및 성능 고려
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 스키마 변경 시 기존 데이터 호환성 확인
 * - [ ] 인덱스 설정 및 성능 최적화
 * - [ ] 사용자 권한 및 역할 관리 확인
 * - [ ] 보안 및 개인정보 보호 확인
 * - [ ] API 엔드포인트와의 연동 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 사용자 모델 구현
 * - 2024-12-19: 사용자 타입별 상세 정보 추가
 * - 2024-12-19: 센터별 사용자 그룹 관리 구현
 * - 2024-12-19: 권한 및 역할 관리 시스템 구현
 * - 2024-12-19: 보안 및 인증 시스템 강화
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (사용자 모델 완료)
 * 
 * 🚀 **다음 단계**
 * - 사용자 프로필 이미지 관리
 * - 사용자 활동 로그 시스템
 * - 사용자 통계 및 분석 기능
 * - 사용자 알림 및 메시지 시스템
 * - 사용자 그룹 및 팀 관리
 * 
 * 💡 **사용 예시**
 * ```typescript
 * // 사용자 생성
 * const user = new User({
 *   name: '홍길동',
 *   email: 'hong@example.com',
 *   userType: 'student',
 *   centerId: centerId
 * });
 * 
 * // 사용자 조회
 * const users = await User.find({ centerId: centerId });
 * 
 * // 권한 확인
 * const hasPermission = user.permissions.includes('manage_courses');
 * ```
 * 
 * 🔍 **사용자 데이터 처리 흐름**
 * 1. 사용자 등록 및 기본 정보 입력
 * 2. 사용자 타입별 상세 정보 설정
 * 3. 센터별 사용자 그룹 할당
 * 4. 사용자 권한 및 역할 설정
 * 5. 사용자 인증 정보 설정
 * 6. 사용자 활동 및 상태 추적
 * 7. 사용자 데이터 업데이트 및 관리
 */

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
    currentLevel?: string; // 현재 레벨 추가
    enrolledCourses?: mongoose.Types.ObjectId[];
    completedCourses?: mongoose.Types.ObjectId[];
    levelChangeHistory?: Array<{ // 레벨 변경 이력 추가
      fromLevel: string;
      toLevel: string;
      changedBy: mongoose.Types.ObjectId;
      changedByType: string;
      reason?: string;
      changedAt: Date;
    }>;
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
    enrolledCourses: [{ type: mongoose.Schema.Types.Mixed, ref: 'Course' }],
    completedCourses: [{ type: mongoose.Schema.Types.Mixed, ref: 'Course' }],
    // 반변경 이력 추가
    levelChangeHistory: [{
      fromLevel: { type: String, required: true },
      toLevel: { type: String, required: true },
      changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      changedByType: { type: String, enum: ['instructor', 'centerAdmin', 'superAdmin'], required: true },
      reason: { type: String, default: '' },
      changedAt: { type: Date, default: Date.now }
    }],
    currentLevel: { type: String, default: 'beginner' }
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
    assignedInstructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    maxStudents: { type: Number, default: 20 },
    currentStudents: { type: Number, default: 0 },
  },
  // 센터 관리자 전용 필드
  centerAdminInfo: {
    managedCenters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Center' }],
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

// 성능 최적화를 위한 인덱스 설정
userSchema.index({ userType: 1, level: 1 });
userSchema.index({ email: 1 }); // 이메일 검색 최적화
userSchema.index({ centerId: 1, userType: 1 }); // 센터별 사용자 타입 검색 최적화
userSchema.index({ 'studentInfo.swimmingLevel': 1 }); // 학생 레벨별 검색 최적화
userSchema.index({ 'instructorInfo.instructorLevel': 1 }); // 강사 레벨별 검색 최적화
userSchema.index({ createdAt: -1 }); // 최신 사용자 검색 최적화
userSchema.index({ isActive: 1, userType: 1 }); // 활성 사용자 검색 최적화
userSchema.index({ 'permissions': 1 }); // 권한별 검색 최적화

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
