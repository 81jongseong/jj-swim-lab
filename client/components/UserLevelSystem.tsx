'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

interface UserLevelInfo {
  type: string;
  level: string;
  nextLevel?: string;
  progress: number;
}

interface AccessPermissions {
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
}

interface FeatureSequence {
  currentStep: string;
  completedSteps: string[];
  availableSteps: string[];
}

interface UserLevelSystemProps {
  children: React.ReactNode;
  requiredPermission?: keyof AccessPermissions;
  requiredUserType?: string;
  requiredLevel?: string;
  feature?: string;
}

export const UserLevelSystem: React.FC<UserLevelSystemProps> = ({
  children,
  requiredPermission,
  requiredUserType,
  requiredLevel,
  feature
}) => {
  const { user } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setHasAccess(false);
      setLoading(false);
      return;
    }

    // 권한 검증
    let access = true;

    // 사용자 유형 검증
    if (requiredUserType && user.userType !== requiredUserType) {
      access = false;
    }

    // 권한 검증
    if (requiredPermission && user.accessPermissions) {
      if (!user.accessPermissions[requiredPermission]) {
        access = false;
      }
    }

    // 레벨 검증
    if (requiredLevel && requiredUserType) {
      const userLevel = getUserLevel(user, requiredUserType);
      const requiredLevelIndex = getLevelIndex(requiredUserType, requiredLevel);
      const userLevelIndex = getLevelIndex(requiredUserType, userLevel);
      
      if (userLevelIndex < requiredLevelIndex) {
        access = false;
      }
    }

    // 기능 시퀀스 검증
    if (feature && user.featureSequence) {
      if (!user.featureSequence.availableSteps.includes(feature)) {
        access = false;
      }
    }

    setHasAccess(access);
    setLoading(false);
  }, [user, requiredPermission, requiredUserType, requiredLevel, feature]);

  if (loading) {
    return <div className="flex justify-center items-center p-4">로딩 중...</div>;
  }

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold mb-2">접근 권한이 없습니다</h2>
        <p className="text-gray-600 mb-4">
          이 기능에 접근하려면 추가 권한이 필요합니다.
        </p>
        {user && (
          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-700">
              현재 레벨: {getUserLevelDisplay(user)}
            </p>
            {getNextLevelInfo(user) && (
              <p className="text-sm text-blue-600 mt-1">
                다음 레벨: {getNextLevelInfo(user)}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  return <>{children}</>;
};

// 사용자 레벨 가져오기
function getUserLevel(user: any, userType: string): string {
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
}

// 레벨 인덱스 가져오기
function getLevelIndex(userType: string, level: string): number {
  const levelMaps = {
    student: ['beginner', 'intermediate', 'advanced', 'expert'],
    instructor: ['junior', 'senior', 'master', 'expert'],
    centerAdmin: ['assistant', 'manager', 'director'],
    superAdmin: ['admin', 'superAdmin', 'systemAdmin']
  };
  
  const levels = levelMaps[userType as keyof typeof levelMaps] || [];
  return levels.indexOf(level);
}

// 사용자 레벨 표시
function getUserLevelDisplay(user: any): string {
  const levelNames = {
    student: {
      beginner: '초급',
      intermediate: '중급',
      advanced: '고급',
      expert: '전문가'
    },
    instructor: {
      junior: '주니어',
      senior: '시니어',
      master: '마스터',
      expert: '전문가'
    },
    centerAdmin: {
      assistant: '어시스턴트',
      manager: '매니저',
      director: '디렉터'
    },
    superAdmin: {
      admin: '관리자',
      superAdmin: '슈퍼 관리자',
      systemAdmin: '시스템 관리자'
    }
  };

  const userType = user.userType;
  const level = getUserLevel(user, userType);
  
  return levelNames[userType as keyof typeof levelNames]?.[level as keyof any] || level;
}

// 다음 레벨 정보 가져오기
function getNextLevelInfo(user: any): string | null {
  const levelNames = {
    student: {
      intermediate: '중급',
      advanced: '고급',
      expert: '전문가'
    },
    instructor: {
      senior: '시니어',
      master: '마스터',
      expert: '전문가'
    },
    centerAdmin: {
      manager: '매니저',
      director: '디렉터'
    },
    superAdmin: {
      superAdmin: '슈퍼 관리자',
      systemAdmin: '시스템 관리자'
    }
  };

  const userType = user.userType;
  const currentLevel = getUserLevel(user, userType);
  const levels = Object.keys(levelNames[userType as keyof typeof levelNames] || {});
  const currentIndex = levels.indexOf(currentLevel);
  
  if (currentIndex < levels.length - 1) {
    const nextLevel = levels[currentIndex + 1];
    return levelNames[userType as keyof typeof levelNames]?.[nextLevel as keyof any] || nextLevel;
  }
  
  return null;
}

// 레벨 진행률 컴포넌트
export const LevelProgress: React.FC<{ user: any }> = ({ user }) => {
  const levelInfo = user.userLevelInfo;
  
  if (!levelInfo) return null;

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">레벨 진행률</h3>
        <span className="text-sm text-gray-500">
          {getUserLevelDisplay(user)}
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${levelInfo.progress}%` }}
        ></div>
      </div>
      
      <div className="flex justify-between text-xs text-gray-500">
        <span>진행률: {levelInfo.progress}%</span>
        {levelInfo.nextLevel && (
          <span>다음 레벨: {levelInfo.nextLevel}</span>
        )}
      </div>
    </div>
  );
};

// 권한 표시 컴포넌트
export const PermissionDisplay: React.FC<{ user: any }> = ({ user }) => {
  if (!user.accessPermissions) return null;

  const permissions = user.accessPermissions;
  const activePermissions = Object.entries(permissions)
    .filter(([_, hasPermission]) => hasPermission)
    .map(([permission, _]) => permission);

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-3">접근 권한</h3>
      <div className="grid grid-cols-2 gap-2">
        {activePermissions.map(permission => (
          <div key={permission} className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm">{getPermissionDisplayName(permission)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// 권한 표시 이름
function getPermissionDisplayName(permission: string): string {
  const names = {
    dashboard: '대시보드',
    courses: '강습 과정',
    bookings: '예약',
    payments: '결제',
    notices: '공지사항',
    progress: '진도 관리',
    evaluations: '평가',
    reports: '보고서',
    userManagement: '사용자 관리',
    systemSettings: '시스템 설정'
  };
  
  return names[permission as keyof typeof names] || permission;
}

// 기능 시퀀스 컴포넌트
export const FeatureSequence: React.FC<{ user: any }> = ({ user }) => {
  if (!user.featureSequence) return null;

  const { currentStep, completedSteps, availableSteps } = user.featureSequence;

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-3">기능 진행 상황</h3>
      <div className="space-y-2">
        {availableSteps.map(step => (
          <div key={step} className="flex items-center">
            <div className={`w-4 h-4 rounded-full mr-3 ${
              completedSteps.includes(step) 
                ? 'bg-green-500' 
                : currentStep === step 
                  ? 'bg-blue-500' 
                  : 'bg-gray-300'
            }`}></div>
            <span className={`text-sm ${
              completedSteps.includes(step) 
                ? 'text-green-600 font-medium' 
                : currentStep === step 
                  ? 'text-blue-600 font-medium' 
                  : 'text-gray-500'
            }`}>
              {getStepDisplayName(step)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// 단계 표시 이름
function getStepDisplayName(step: string): string {
  const names = {
    dashboard: '대시보드',
    courses: '강습 과정',
    bookings: '예약',
    progress: '진도 관리',
    evaluations: '평가',
    reports: '보고서',
    users: '사용자 관리',
    payments: '결제',
    notices: '공지사항',
    system: '시스템 관리',
    centers: '센터 관리',
    settings: '설정'
  };
  
  return names[step as keyof typeof names] || step;
}

export default UserLevelSystem; 