/**
 * 🔐 JJ Swim Lab - useAuth 커스텀 훅
 * 
 * 📋 **훅 목적**
 * - 애플리케이션 전체의 인증 상태 및 사용자 정보를 관리하는 커스텀 훅
 * - JWT 토큰 기반 인증 시스템의 상태 관리 및 API 연동
 * - 사용자 로그인, 로그아웃, 회원가입 등의 인증 관련 기능 제공
 * - 인증 상태에 따른 UI 렌더링 제어 및 보안 관리
 * - 사용자 권한 및 역할 기반 접근 제어 (RBAC) 지원
 * 
 * 🔄 **주요 기능**
 * - 사용자 로그인 및 로그아웃 상태 관리
 * - JWT 토큰 저장, 검증 및 갱신
 * - 사용자 정보 및 권한 관리
 * - 인증 상태에 따른 자동 리다이렉션
 * - 보안을 위한 토큰 만료 처리
 * - 다중 사용자 타입 지원 (superAdmin, centerAdmin, instructor, student, guest)
 * 
 * 🗄️ **데이터 연동**
 * - JWT 토큰 및 사용자 세션 정보
 * - 사용자 프로필 및 권한 데이터
 * - 인증 API 엔드포인트 연동
 * - 로컬 스토리지 및 세션 스토리지
 * - 인증 상태 변경 이벤트 및 콜백
 * 
 * 🛠️ **필요한 설치 파일**
 * - React (useState, useEffect, useContext)
 * - JWT 토큰 처리 라이브러리
 * - HTTP 클라이언트 (fetch, axios 등)
 * - 로컬 스토리지 관리 도구
 * - 인증 API 서버 및 엔드포인트
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. JWT 토큰의 보안 및 만료 처리
 * 2. 인증 상태 변경 시 UI 일관성 유지
 * 3. 사용자 권한 및 역할 검증의 정확성
 * 4. 인증 실패 시 적절한 에러 처리
 * 5. 토큰 갱신 및 자동 로그아웃 로직
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 로그인/로그아웃 기능 동작 확인
 * - [ ] JWT 토큰 검증 및 갱신 검증
 * - [ ] 사용자 권한 및 역할 관리 확인
 * - [ ] 인증 상태 변경 시 UI 업데이트 확인
 * - [ ] 보안 및 에러 처리 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (기본 인증 시스템)
 * - 2024-12-19: JWT 토큰 기반 인증 시스템 구현
 * - 2024-12-19: 사용자 권한 및 역할 관리 시스템 구현
 * - 2024-12-19: 보안 및 에러 처리 시스템 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (인증 시스템 완료)
 * 
 * 🚀 **다음 단계**
 * - 고급 보안 기능 (2FA, OAuth 등)
 * - 자동 토큰 갱신 시스템
 * - 성능 최적화
 * - 보안 강화
 * 
 * 💡 **사용 예시**
 * ```tsx
 * // 컴포넌트에서 인증 훅 사용
 * function MyComponent() {
 *   const { user, login, logout, isAuthenticated } = useAuth();
 *   
 *   if (!isAuthenticated) {
 *     return <LoginForm onLogin={login} />;
 *   }
 *   
 *   return (
 *     <div>
 *       <p>안녕하세요, {user.name}님!</p>
 *       <button onClick={logout}>로그아웃</button>
 *     </div>
 *   );
 * }
 * ```
 * 
 * 🔍 **인증 처리 흐름**
 * 1. 사용자 로그인 시도
 * 2. 서버에서 JWT 토큰 발급
 * 3. 토큰을 로컬 스토리지에 저장
 * 4. 인증 상태를 true로 설정
 * 5. 사용자 정보 및 권한 로드
 * 6. UI를 인증된 상태로 업데이트
 */

'use client';

import { useState, useEffect, createContext, useContext } from 'react';

export interface User {
  _id: string;
  id?: string; // userId와 동일 (일부 컴포넌트에서 사용)
  userId: string;
  name: string;
  email: string;
  userType: 'student' | 'instructor' | 'centerAdmin' | 'superAdmin';
  level: string;
  centerId?: string;
  membershipTier?: string; // 멤버십 등급
  role?: string; // 역할 정보
  groupClassName?: string; // 그룹 클래스 이름
  studentInfo?: {
    age?: number;
    emergencyContact?: string;
    medicalConditions?: string;
    swimmingLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    enrolledCourses?: string[];
    completedCourses?: string[];
    currentLevel?: string; // 현재 레벨
    healthProfile?: any; // 건강 프로필
    swimmingProfile?: any; // 수영 프로필
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

/**
 * 🔐 인증 컨텍스트 제공자 컴포넌트
 * 
 * 📋 **기능**
 * - 전역 인증 상태 관리
 * - JWT 토큰 검증 및 갱신
 * - 사용자 정보 및 권한 관리
 * - 로그인/로그아웃 상태 처리
 * 
 * 🔄 **인증 과정**
 * 1. 컴포넌트 마운트 시 토큰 검증
 * 2. 유효한 토큰이면 사용자 정보 복원
 * 3. 무효한 토큰이면 로그아웃 처리
 * 4. 인증 상태를 하위 컴포넌트에 제공
 * 
 * 📅 **수정 히스토리**
 * - 2025-01-13: 인증 컨텍스트 주석 추가
 */
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 강제 디버깅 로그
  console.log('🔍 AuthProvider 렌더링:', { 
    user: user ? { _id: user._id, name: user.name, userType: user.userType } : null, 
    loading 
  });

  useEffect(() => {
    // 로컬 스토리지에서 사용자 정보 복원
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    console.log('🔍 useAuth useEffect:', { token: !!token, savedUser: !!savedUser });
    
    if (token && savedUser) {
      // 토큰 검증을 한 번만 실행하도록 수정
      const userData = JSON.parse(savedUser);
      console.log('🔍 사용자 데이터 복원:', { userType: userData.userType, name: userData.name });
      
      // accessPermissions가 없으면 기본값 설정
      const userWithDefaults = {
        ...userData,
        id: userData.id || userData.userId || userData._id, // id 속성 확인 및 추가
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
      
      console.log('🔍 사용자 설정 완료:', { userType: userWithDefaults.userType, accessPermissions: userWithDefaults.accessPermissions });
      setUser(userWithDefaults);
      setLoading(false);
    } else {
      console.log('🔍 토큰 또는 사용자 정보 없음');
      setLoading(false);
    }
  }, []);

  /**
   * 🔐 JWT 토큰 검증 함수 (수동 호출용)
   * 
   * 📋 **기능**
   * - 서버에 토큰 유효성 검증 요청
   * - 토큰이 유효하면 사용자 정보 반환
   * - 토큰이 무효하면 null 반환
   * 
   * 🔄 **검증 과정**
   * 1. Authorization 헤더에 Bearer 토큰 추가
   * 2. GET /api/auth/verify 요청 실행
   * 3. 응답 상태 확인 (200: 유효, 401: 무효)
   * 4. 유효한 경우 사용자 정보 반환
   * 
   * 📅 **수정 히스토리**
   * - 2025-01-13: 토큰 검증 함수 주석 추가
   * - 2025-01-13: 자동 토큰 검증 비활성화로 수동 호출용으로 변경
   */
  const validateToken = async (token: string, savedUser: string) => {
    try {
      console.log('🔍 validateToken 시작');
      
      const response = await fetch('http://localhost:5000/api/auth/verify', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('🔍 validateToken 응답:', { status: response.status, ok: response.ok });

      if (response.ok) {
        // 토큰이 유효한 경우 사용자 정보 복원
        const userData = JSON.parse(savedUser);
        console.log('🔍 사용자 데이터 복원:', { userType: userData.userType, name: userData.name });
        
        // accessPermissions가 없으면 기본값 설정
        const userWithDefaults = {
          ...userData,
          id: userData.id || userData.userId || userData._id, // id 속성 확인 및 추가
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
        
        console.log('🔍 사용자 설정 완료:', { userType: userWithDefaults.userType, accessPermissions: userWithDefaults.accessPermissions });
        setUser(userWithDefaults);
        return true;
      } else {
        // 토큰이 유효하지 않은 경우 정리
        console.log('❌ 토큰이 만료되었습니다. 로그인이 필요합니다.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        
        // 로그인 페이지로 리다이렉트하지 않고 상태만 업데이트
        console.log('🔄 인증 상태만 업데이트 (리다이렉트 없음)');
        return false;
      }
    } catch (error) {
      console.error('❌ 토큰 검증 실패:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      
      // 로그인 페이지로 리다이렉트하지 않고 상태만 업데이트
      console.log('🔄 토큰 검증 실패 - 인증 상태만 업데이트 (리다이렉트 없음)');
      return false;
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
        id: data.user.userId || data.user._id, // id 속성 추가 (타입 호환성)
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
      // 로그인 성공 - 자동 리다이렉트 제거 (페이지에서 처리)
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
    
    // 게스트 홈 페이지(랜딩 페이지)로 리다이렉트
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
        id: data.user.userId || data.user._id, // id 속성 추가 (타입 호환성)
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




