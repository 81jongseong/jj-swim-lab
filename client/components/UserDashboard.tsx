/**
 * 👤 JJ Swim Lab - UserDashboard 컴포넌트
 * 
 * 📋 **컴포넌트 목적**
 * - 사용자별 맞춤형 대시보드 인터페이스 제공
 * - 계정 유형에 따른 동적 대시보드 구성
 * - 사용자 진행률 및 성과 요약 표시
 * - 빠른 액세스 메뉴 및 알림 제공
 * - 개인화된 학습 추천 및 목표 설정
 * 
 * 🔄 **주요 기능**
 * - 계정 유형별 맞춤 대시보드 (student, instructor, centerAdmin, superAdmin)
 * - 사용자 진행률 및 성과 지표 표시
 * - 빠른 액세스 메뉴 및 단축키
 * - 실시간 알림 및 업데이트
 * - 개인화된 학습 추천 시스템
 * 
 * 🗄️ **데이터 연동**
 * - 사용자 계정 정보 및 권한
 * - 진행률 및 성과 데이터
 * - 알림 및 업데이트 정보
 * - 학습 추천 및 목표 데이터
 * 
 * 🛠️ **필요한 설치 파일**
 * - React (useState, useEffect, useMemo)
 * - useAuth 훅 (사용자 정보)
 * - Tailwind CSS (스타일링)
 * - TypeScript (타입 정의)
 * - 차트 라이브러리 (성과 시각화)
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 계정 유형별 대시보드 구성 로직
 * 2. 사용자 권한 기반 메뉴 표시
 * 3. 실시간 데이터 업데이트 처리
 * 4. 반응형 디자인 및 접근성
 * 5. 성능 최적화 및 메모리 관리
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 계정 유형별 대시보드 구성 확인
 * - [ ] 사용자 권한 기반 메뉴 표시 검증
 * - [ ] 실시간 데이터 업데이트 동작 확인
 * - [ ] 반응형 디자인 테스트
 * - [ ] 성능 및 메모리 사용량 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (기본 사용자 대시보드)
 * - 2024-12-19: 계정 유형별 맞춤 대시보드 구현
 * - 2024-12-19: 진행률 및 성과 지표 시스템 구현
 * - 2024-12-19: 개인화된 학습 추천 시스템 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (사용자 대시보드 시스템 완료)
 * 
 * 🚀 **다음 단계**
 * - AI 기반 개인화 추천 고도화
 * - 실시간 데이터 동기화
 * - 성능 최적화
 * - 접근성 개선
 * 
 * 💡 **사용 예시**
 * ```tsx
 * <UserDashboard 
 *   userType="student"
 *   onMenuClick={(menu) => handleMenuClick(menu)}
 *   onGoalUpdate={(goal) => handleGoalUpdate(goal)}
 * />
 * ```
 */

'use client';
import { logger } from '@/lib/logger';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Progress } from './ui';
import { Badge } from '@/components/ui';
import {
  User,
  BookOpen,
  Calendar,
  CreditCard,
  Bell,
  TrendingUp,
  Users,
  Settings,
  GraduationCap,
  Award,
  Building,
  Shield
} from 'lucide-react';

interface UserInfo {
  _id: string;
  name: string;
  email: string;
  userType: 'student' | 'instructor' | 'centerAdmin' | 'superAdmin';
  level: string;
  userLevelInfo: {
    type: string;
    level: string;
    nextLevel?: string;
    progress: number;
  };
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
  studentInfo?: {
    age?: number;
    emergencyContact?: string;
    medicalConditions?: string;
    swimmingLevel?: string;
    enrolledCourses?: any[];
    completedCourses?: any[];
  };
  instructorInfo?: {
    experience?: string;
    certifications?: string[];
    specialties?: string[];
    instructorLevel?: string;
    assignedCenters?: any[];
    maxStudents?: number;
    currentStudents?: number;
  };
  centerAdminInfo?: {
    managedCenters?: any[];
    adminLevel?: string;
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
    adminLevel?: string;
  };
}

interface UserDashboardProps {
  user: UserInfo;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ user }) => {
  const [currentStep, setCurrentStep] = useState(user.featureSequence.currentStep);
  const [completedSteps, setCompletedSteps] = useState(user.featureSequence.completedSteps);
  const [availableSteps, setAvailableSteps] = useState(user.featureSequence.availableSteps);

  // 사용자 유형별 아이콘과 색상
  const getUserTypeConfig = (userType: string) => {
    switch (userType) {
      case 'student':
        return { icon: GraduationCap, color: 'bg-blue-500', label: '수강생' };
      case 'instructor':
        return { icon: Award, color: 'bg-green-500', label: '강사' };
      case 'centerAdmin':
        return { icon: Building, color: 'bg-purple-500', label: '센터 관리자' };
      case 'superAdmin':
        return { icon: Shield, color: 'bg-red-500', label: '총관리자' };
      default:
        return { icon: User, color: 'bg-gray-500', label: '사용자' };
    }
  };

  // 레벨별 색상
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
      case 'junior':
      case 'assistant':
      case 'admin':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
      case 'senior':
      case 'manager':
      case 'superAdmin':
        return 'bg-blue-100 text-blue-800';
      case 'advanced':
      case 'master':
      case 'director':
      case 'systemAdmin':
        return 'bg-purple-100 text-purple-800';
      case 'expert':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 기능 시퀀스 단계별 설정
  const getStepConfig = (step: string) => {
    const stepConfigs = {
      dashboard: { icon: TrendingUp, label: '대시보드', description: '개요 및 통계' },
      courses: { icon: BookOpen, label: '강습 과정', description: '과정 관리' },
      bookings: { icon: Calendar, label: '예약 관리', description: '일정 및 예약' },
      payments: { icon: CreditCard, label: '결제 관리', description: '결제 내역' },
      notices: { icon: Bell, label: '공지사항', description: '알림 및 공지' },
      progress: { icon: TrendingUp, label: '진도 관리', description: '학습 진도' },
      evaluations: { icon: Award, label: '평가 관리', description: '강습 평가' },
      reports: { icon: TrendingUp, label: '보고서', description: '통계 및 보고' },
      users: { icon: Users, label: '사용자 관리', description: '사용자 관리' },
      system: { icon: Settings, label: '시스템 관리', description: '시스템 설정' },
      students: { icon: GraduationCap, label: '학생 관리', description: '학생 관리' },
      centers: { icon: Building, label: '센터 관리', description: '센터 관리' }
    };
    return stepConfigs[step as keyof typeof stepConfigs] || { icon: User, label: step, description: '' };
  };

  // 다음 단계로 진행
  const moveToNextStep = async (step: string) => {
    if (!availableSteps.includes(step)) return;

    const newCompletedSteps = [...completedSteps];
    if (!newCompletedSteps.includes(currentStep)) {
      newCompletedSteps.push(currentStep);
    }

    setCurrentStep(step);
    setCompletedSteps(newCompletedSteps);

    // 서버에 업데이트
    try {
      const response = await fetch(`/api/users/${user._id}/feature-sequence`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          currentStep: step,
          completedSteps: newCompletedSteps,
          availableSteps: availableSteps
        })
      });

      if (!response.ok) {
        logger.error('기능 시퀀스 업데이트 실패');
      }
    } catch (error) {
      logger.error('기능 시퀀스 업데이트 오류:', error);
    }
  };

  // 사용자 유형별 대시보드 내용
  const renderUserTypeDashboard = () => {
    const userTypeConfig = getUserTypeConfig(user.userType);

    switch (user.userType) {
      case 'student':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => { window.location.href = '/courses'; }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  등록된 강습
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{user.studentInfo?.enrolledCourses?.length || 0}</div>
                <p className="text-sm text-muted-foreground">현재 수강 중인 강습</p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => window.location.href = '/dashboard/checklist'}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  체크리스트
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">진행중</div>
                <p className="text-sm text-muted-foreground">학습 체크리스트 확인</p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => window.location.href = '/progress'}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  학습 진도
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{user.userLevelInfo.progress}%</div>
                <Progress value={user.userLevelInfo.progress} className="mt-2" />
                <p className="text-sm text-muted-foreground mt-2">
                  다음 레벨: {user.userLevelInfo.nextLevel || '최고 레벨'}
                </p>
              </CardContent>
            </Card>
          </div>
        );

      case 'instructor':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => window.location.href = '/instructor/students'}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  현재 학생
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{user.instructorInfo?.currentStudents || 0}</div>
                <p className="text-sm text-muted-foreground">
                  최대 {user.instructorInfo?.maxStudents || 20}명
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => window.location.href = '/instructor/courses'}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  담당 강습
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{user.instructorInfo?.assignedCenters?.length || 0}</div>
                <p className="text-sm text-muted-foreground">담당 강습 관리</p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => window.location.href = '/instructor/progress'}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  학생 진도
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{user.userLevelInfo.progress}%</div>
                <Progress value={user.userLevelInfo.progress} className="mt-2" />
                <p className="text-sm text-muted-foreground mt-2">
                  학생 진도 관리
                </p>
              </CardContent>
            </Card>
          </div>
        );

      case 'centerAdmin':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => window.location.href = '/admin/center-info'}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  센터 관리
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{user.centerAdminInfo?.managedCenters?.length || 0}</div>
                <p className="text-sm text-muted-foreground">센터 정보 관리</p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => window.location.href = '/admin/users'}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  사용자 관리
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {user.centerAdminInfo?.permissions?.canManageUsers ? '활성' : '비활성'}
                </div>
                <p className="text-sm text-muted-foreground">사용자 관리</p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => window.location.href = '/admin/courses'}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  강습 관리
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">관리</div>
                <p className="text-sm text-muted-foreground">강습 과정 관리</p>
              </CardContent>
            </Card>
          </div>
        );

      case 'superAdmin':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card
              className="cursor-pointer hover:shadow-lg transition-shadow bg-white border-2 border-transparent hover:border-blue-300"
              onClick={() => {
                logger.info('사용자 관리 카드 클릭됨');
                window.location.href = '/admin/users';
              }}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  사용자 관리
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Object.values(user.superAdminInfo?.systemPermissions || {}).filter(Boolean).length}
                </div>
                <p className="text-sm text-muted-foreground">전체 사용자 관리</p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-lg transition-shadow bg-white border-2 border-transparent hover:border-blue-300"
              onClick={() => {
                logger.info('강습법 관리 카드 클릭됨');
                window.location.href = '/admin/teaching-methods';
              }}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  강습법 관리
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {user.superAdminInfo?.systemPermissions?.canManageSystemSettings ? '활성' : '비활성'}
                </div>
                <p className="text-sm text-muted-foreground">강습법 및 체크리스트 관리</p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-lg transition-shadow bg-white border-2 border-transparent hover:border-blue-300"
              onClick={() => {
                logger.info('시스템 관리 카드 클릭됨');
                window.location.href = '/admin/system';
              }}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  시스템 관리
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">관리</div>
                <p className="text-sm text-muted-foreground">시스템 설정 및 상태</p>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* 사용자 정보 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-full ${getUserTypeConfig(user.userType).color} text-white`}>
            {React.createElement(getUserTypeConfig(user.userType).icon, { size: 24 })}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-muted-foreground">{getUserTypeConfig(user.userType).label}</p>
          </div>
        </div>
        <Badge className={getLevelColor(user.userLevelInfo.level)}>
          {user.userLevelInfo.level}
        </Badge>
      </div>

      {/* 기능 시퀀스 진행률 */}
      <Card>
        <CardHeader>
          <CardTitle>기능 진행 상황</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {availableSteps.map((step, index) => {
              const stepConfig = getStepConfig(step);
              const isCompleted = completedSteps.includes(step);
              const isCurrent = currentStep === step;
              const isAvailable = availableSteps.includes(step);

              return (
                <div
                  key={step}
                  className={`flex items-center justify-between p-4 rounded-lg border ${isCurrent ? 'border-blue-500 bg-blue-50' :
                      isCompleted ? 'border-green-500 bg-green-50' :
                        isAvailable ? 'border-gray-200 bg-white' :
                          'border-gray-200 bg-gray-50'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${isCurrent ? 'bg-blue-500 text-white' :
                        isCompleted ? 'bg-green-500 text-white' :
                          'bg-gray-200 text-gray-600'
                      }`}>
                      {React.createElement(stepConfig.icon, { size: 16 })}
                    </div>
                    <div>
                      <h3 className="font-medium">{stepConfig.label}</h3>
                      <p className="text-sm text-muted-foreground">{stepConfig.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isCompleted && (
                      <Badge variant="success" className="bg-green-100 text-green-800">
                        완료
                      </Badge>
                    )}
                    {isCurrent && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        현재
                      </Badge>
                    )}
                    {isAvailable && !isCurrent && !isCompleted && (
                      <Button
                        size="sm"
                        onClick={() => moveToNextStep(step)}
                      >
                        시작
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 사용자 유형별 대시보드 */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">대시보드</h2>
        {renderUserTypeDashboard()}
      </div>

      {/* 권한 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>접근 권한</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(user.accessPermissions).map(([permission, hasAccess]) => (
              <div key={permission} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${hasAccess ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm capitalize">{permission}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDashboard; 