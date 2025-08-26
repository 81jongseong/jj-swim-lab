"use client";

import { useState, useEffect, createContext, useContext } from 'react';

interface User {
  _id: string;
  userId: string;
  name: string;
  email: string;
  userType: 'student' | 'instructor' | 'centerAdmin' | 'superAdmin';
  level: string;
  studentInfo?: {
    age?: number;
    emergencyContact?: string;
    medicalConditions?: string;
    swimmingLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    enrolledCourses?: string[];
    completedCourses?: string[];
  };
  instructorInfo?: {
    experience?: string;
    certifications?: string[];
    specialties?: string[];
    instructorLevel?: 'junior' | 'senior' | 'master' | 'expert';
    assignedCenters?: string[];
    maxStudents?: number;
    currentStudents?: number;
  };
  centerAdminInfo?: {
    managedCenters?: string[];
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
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: any) => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  hasPermission: (permission: keyof User['accessPermissions']) => boolean;
  hasUserType: (userType: User['userType']) => boolean;
  hasLevel: (userType: User['userType'], requiredLevel: string) => boolean;
  hasFeature: (feature: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 로컬 스토리지에서 사용자 정보 복원
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      // 토큰 유효성 검증
      validateToken(token, savedUser);
    } else {
      setLoading(false);
    }
  }, []);

  const validateToken = async (token: string, savedUser: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/verify', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // 토큰이 유효한 경우 사용자 정보 복원
        const userData = JSON.parse(savedUser);
        
        // accessPermissions가 없으면 기본값 설정
        const userWithDefaults = {
          ...userData,
          accessPermissions: userData.accessPermissions || {
            dashboard: true,
            courses: true,
            bookings: true,
            payments: true,
            notices: true,
            progress: true,
            evaluations: true,
            reports: true,
            userManagement: userData.userType === 'superAdmin' || userData.userType === 'centerAdmin',
            systemSettings: userData.userType === 'superAdmin',
            aiConfigManagement: userData.userType === 'superAdmin'
          }
        };
        
        setUser(userWithDefaults);
      } else {
        // 토큰이 유효하지 않은 경우 정리
        console.log('토큰이 만료되었습니다. 로그인이 필요합니다.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      }
    } catch (error) {
      console.error('토큰 검증 실패:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      console.log('🔍 로그인 시도:', { userId: email, password: '***' });
      
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // userId로 로그인 (서버 스키마와 일치)
        body: JSON.stringify({ userId: email, password }),
      });
      
      console.log('📡 서버 응답 상태:', response.status, response.statusText);
      
      // 서버 연결 상태 확인
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ 서버 오류:', errorData);
        throw new Error(errorData.error || `서버 오류: ${response.status}`);
      }

      const data = await response.json();
      console.log('📡 서버 응답 데이터:', data);
      
      // 서버 응답 구조 확인 및 처리
      if (!data.user || !data.token) {
        console.error('❌ 서버 응답에 user 또는 token이 없음:', data);
        throw new Error('서버 응답 형식이 올바르지 않습니다.');
      }
      
      // accessPermissions가 없으면 기본값 설정
      const userWithDefaults = {
        ...data.user,
        accessPermissions: data.user.accessPermissions || {
          dashboard: true,
          courses: true,
          bookings: true,
          payments: true,
          notices: true,
          progress: true,
          evaluations: true,
          reports: true,
          userManagement: data.user.userType === 'superAdmin' || data.user.userType === 'centerAdmin',
          systemSettings: data.user.userType === 'superAdmin',
          aiConfigManagement: data.user.userType === 'superAdmin'
        }
      };
      
      // 토큰을 localStorage에 저장 (쿠키는 이미 Next Auth API에서 설정됨)
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(userWithDefaults));
      
      setUser(userWithDefaults);
      // 성공 후 사용자 타입에 따라 적절한 페이지로 이동
      if (typeof window !== 'undefined') {
        switch (userWithDefaults.userType) {
          case 'superAdmin':
            window.location.href = '/admin/dashboard';
            break;
          case 'centerAdmin':
            window.location.href = '/admin/dashboard';
            break;
          case 'instructor':
            window.location.href = '/instructor/dashboard';
            break;
          case 'student':
            window.location.href = '/dashboard';
            break;
          default:
            window.location.href = '/dashboard';
        }
      }
    } catch (error) {
      console.error('로그인 오류:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // 로컬 스토리지 정리
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // 세션 스토리지도 정리 (있다면)
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    
    // 사용자 상태 초기화
    setUser(null);
    
    // 로그아웃 후 홈페이지로 리다이렉트
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  const register = async (userData: any) => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '회원가입에 실패했습니다.');
      }

      const data = await response.json();
      
      // accessPermissions가 없으면 기본값 설정
      const userWithDefaults = {
        ...data.user,
        accessPermissions: data.user.accessPermissions || {
          dashboard: true,
          courses: true,
          bookings: true,
          payments: true,
          notices: true,
          progress: true,
          evaluations: true,
          reports: true,
          userManagement: data.user.userType === 'superAdmin' || data.user.userType === 'centerAdmin',
          systemSettings: data.user.userType === 'superAdmin',
          aiConfigManagement: data.user.userType === 'superAdmin'
        }
      };
      
      // 토큰을 localStorage에 저장 (쿠키는 이미 Next Auth API에서 설정됨)
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(userWithDefaults));
      
      setUser(userWithDefaults);
    } catch (error) {
      console.error('회원가입 오류:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const hasPermission = (permission: keyof User['accessPermissions']): boolean => {
    if (!user) return false;
    return user.accessPermissions[permission] || false;
  };

  const hasUserType = (userType: User['userType']): boolean => {
    if (!user) return false;
    return user.userType === userType;
  };

  const hasLevel = (userType: User['userType'], requiredLevel: string): boolean => {
    if (!user || user.userType !== userType) return false;
    
    const levelMaps = {
      student: ['beginner', 'intermediate', 'advanced', 'expert'],
      instructor: ['junior', 'senior', 'master', 'expert'],
      centerAdmin: ['assistant', 'manager', 'director'],
      superAdmin: ['admin', 'superAdmin', 'systemAdmin']
    };
    
    const levels = levelMaps[userType] || [];
    const userLevel = getUserLevel(user, userType);
    const requiredLevelIndex = levels.indexOf(requiredLevel);
    const userLevelIndex = levels.indexOf(userLevel);
    
    return userLevelIndex >= requiredLevelIndex;
  };

  const hasFeature = (feature: string): boolean => {
    if (!user || !user.featureSequence) return false;
    return user.featureSequence.availableSteps.includes(feature);
  };

  const getUserLevel = (user: User, userType: string): string => {
    switch(userType) {
      case 'student':
        return user.studentInfo?.swimmingLevel || 'beginner';
      case 'instructor':
        return user.instructorInfo?.instructorLevel || 'junior';
      case 'centerAdmin':
        return user.centerAdminInfo?.adminLevel || 'assistant';
      case 'superAdmin':
        return user.superAdminInfo?.adminLevel || 'admin';
      default:
        return 'beginner';
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    register,
    updateUser,
    hasPermission,
    hasUserType,
    hasLevel,
    hasFeature,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};




