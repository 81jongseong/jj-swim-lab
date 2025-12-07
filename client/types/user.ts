/**
 * 👤 JJ Swim Lab - 사용자 타입 정의 (통합)
 * 
 * 📋 **목적**
 * - 프로젝트 전체에서 사용하는 User 타입의 단일 소스
 * - 모든 페이지/컴포넌트에서 이 타입을 import하여 사용
 * - 타입 불일치 문제 근본 해결
 * 
 * 🔄 **사용법**
 * ```tsx
 * import type { User } from '@/types/user';
 * ```
 * 
 * ⚠️ **중요**
 * - 이 파일 외에는 User 타입을 정의하지 말 것
 * - 필요한 속성이 있으면 여기에만 추가
 * - 서버 모델과 클라이언트 타입 간 매핑은 별도 유틸에서 처리
 */

export interface User {
  _id: string;
  id?: string; // userId와 동일 (일부 컴포넌트에서 사용)
  userId: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  birthDate?: string;
  gender?: 'male' | 'female' | 'other' | '';
  userType: 'student' | 'instructor' | 'centerAdmin' | 'center-admin' | 'superAdmin';
  level: string;
  centerId?: string;
  membershipTier?: string;
  role?: string;
  groupClassName?: string;
  isActive?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  
  // 학생 정보
  studentInfo?: {
    age?: number;
    emergencyContact?: string;
    medicalConditions?: string;
    swimmingLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert' | '초급' | '중급' | '고급' | '전문가' | '마스터' | string;
    enrolledCourses?: string[] | any[];
    enrolledCenters?: string[];
    completedCourses?: string[] | any[];
    currentLevel?: string;
    healthProfile?: any;
    swimmingProfile?: any;
    status?: 'active' | 'inactive' | 'suspended';
    instructorId?: string;
    centerMemo?: string;
    centerMemoUpdatedAt?: string | Date;
    parentName?: string;
    parentPhone?: string;
  };
  
  // 강사 정보
  instructorInfo?: {
    experience?: string | number;
    certifications?: string[];
    specialties?: string[];
    instructorLevel?: 'junior' | 'senior' | 'master' | 'expert' | string;
    assignedCenters?: string[];
    maxStudents?: number;
    currentStudents?: number;
  };
  
  // 센터 관리자 정보
  centerAdminInfo?: {
    managedCenters?: string[];
    adminLevel?: 'assistant' | 'manager' | 'director' | string;
    centerName?: string;
    permissions?: {
      canManageUsers?: boolean;
      canManageCourses?: boolean;
      canManageBookings?: boolean;
      canManagePayments?: boolean;
      canManageNotices?: boolean;
      canViewReports?: boolean;
    };
  };
  
  // 슈퍼 관리자 정보
  superAdminInfo?: {
    systemPermissions?: {
      canManageAllUsers?: boolean;
      canManageAllCenters?: boolean;
      canManageSystemSettings?: boolean;
      canViewAllReports?: boolean;
      canManageSkillTemplates?: boolean;
    } | string[];
    adminLevel?: 'admin' | 'superAdmin' | 'systemAdmin' | string;
  };
  
  // 기타 정보
  centerInfo?: {
    _id?: string;
    name?: string;
    address?: {
      city?: string;
      province?: string;
      address1?: string;
    };
    grade?: string;
  };
  
  // useAuth에서 사용하는 추가 필드
  lastLoginAt?: Date | string;
  accessPermissions?: {
    dashboard?: boolean;
    courses?: boolean;
    bookings?: boolean;
    payments?: boolean;
    notices?: boolean;
    progress?: boolean;
    evaluations?: boolean;
    reports?: boolean;
    userManagement?: boolean;
    systemSettings?: boolean;
  };
  featureSequence?: {
    currentStep?: string;
    completedSteps?: string[];
    availableSteps?: string[];
  };
  userLevelInfo?: {
    type?: string;
    level?: string;
    nextLevel?: string;
    progress?: number;
  };
  
  // 사용자 상태 및 건강 정보
  status?: 'active' | 'inactive' | 'suspended' | string;
  joinedAt?: string | Date;
  healthProfile?: {
    age?: number;
    gender?: string;
    height?: number;
    weight?: number;
    bloodPressure?: {
      systolic: number;
      diastolic: number;
    };
    chronicConditions?: string[];
    allergies?: string[];
    medications?: string[];
    activityLevel?: string;
    emergencyContact?: {
      name: string;
      phone: string;
      relationship: string;
    };
    [key: string]: any;
  };
  
  // 추가 사용자 정보
  membershipType?: string;
  membershipExpiry?: string | Date;
  totalClasses?: number;
  totalPayments?: number;
}

// 타입 유틸리티
export type UserType = User['userType'];
export type StudentInfo = NonNullable<User['studentInfo']>;
export type InstructorInfo = NonNullable<User['instructorInfo']>;
export type CenterAdminInfo = NonNullable<User['centerAdminInfo']>;

