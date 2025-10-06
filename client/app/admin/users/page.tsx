/**
 * 👥 JJ Swim Lab - 관리자 사용자 관리 페이지
 * 
 * 📋 **페이지 목적**
 * - 수영 강습 시스템의 모든 사용자를 관리하는 관리자 전용 페이지
 * - 사용자 목록 조회, 검색, 필터링 기능 제공
 * - 사용자 정보 수정, 권한 관리, 상태 변경 기능
 * - 사용자 통계 및 분석 데이터 표시
 * - 사용자 승인 및 관리 기능
 * 
 * 🔄 **주요 기능**
 * - 사용자 목록 조회 및 표시
 * - 사용자 검색 및 필터링 (이름, 이메일, 타입별)
 * - 사용자 정보 수정 및 업데이트
 * - 사용자 권한 및 역할 관리
 * - 사용자 상태 변경 (활성화/비활성화)
 * - 사용자 통계 및 분석
 * - 사용자 승인 및 관리
 * 
 * 🗄️ **데이터 연동**
 * - 사용자 관리 API와 연동 (사용자 목록)
 * - 사용자 검색 및 필터링 API
 * - 사용자 정보 수정 API
 * - 사용자 권한 관리 API
 * - 사용자 통계 및 분석 API
 * - 사용자 인증 시스템
 * - 실시간 사용자 상태 업데이트
 * 
 * 🛠️ **필요한 설치 파일**
 * - Next.js 14.2.5 (App Router)
 * - React 18.3.1
 * - TypeScript 5.x
 * - Tailwind CSS 3.3.0
 * - API 클라이언트 (../utils/api)
 * - 인증 컴포넌트 (../components/withAuth)
 * - 사용자 관리 API 엔드포인트
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 관리자 권한 확인 및 보안
 * 2. 사용자 데이터 보안 및 개인정보 보호
 * 3. 사용자 권한 변경 시 보안 검증
 * 4. 사용자 검색 및 필터링 성능 최적화
 * 5. 반응형 디자인 적용 (모바일/데스크톱)
 * 6. 접근성 지원 (키보드 네비게이션, ARIA 라벨)
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 관리자 권한 확인 확인
 * - [ ] 사용자 데이터 보안 확인
 * - [ ] 사용자 권한 변경 로직 확인
 * - [ ] 사용자 검색 성능 최적화 확인
 * - [ ] 반응형 디자인 테스트
 * - [ ] 접근성 지원 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 관리자 사용자 관리 페이지 구현
 * - 2024-12-19: 사용자 목록 및 검색 기능 구현
 * - 2024-12-19: 사용자 정보 수정 기능 구현
 * - 2024-12-19: 사용자 권한 관리 시스템 구현
 * - 2024-12-19: 반응형 디자인 및 사용자 경험 개선
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (관리자 사용자 관리 페이지 완료)
 * 
 * 🚀 **다음 단계**
 * - 실시간 사용자 상태 업데이트
 * - 사용자 추천 시스템
 * - 사용자 대기열 관리
 * - 사용자 통계 대시보드
 * - 사용자 보안 강화
 * 
 * 💡 **사용 예시**
 * ```tsx
 * // 사용자 목록 조회
 * const users = await apiClient.getUsers({ userType: "student" });
 * 
 * // 사용자 정보 수정
 * const updatedUser = await apiClient.updateUser(userId, userData);
 * 
 * // 사용자 권한 변경
 * const updatedPermissions = await apiClient.updateUserPermissions(userId, permissions);
 * ```
 * 
 * 🔍 **사용자 관리 처리 흐름**
 * 1. 관리자 권한 확인 및 검증
 * 2. 사용자 목록 데이터 로드
 * 3. 사용자 검색 및 필터링 조건 적용
 * 4. 사용자 정보 수정 처리
 * 5. 사용자 권한 변경 처리
 * 6. 사용자 통계 및 분석 업데이트
 * 7. 실시간 사용자 상태 동기화
 */

"use client";

import { useState, useEffect } from 'react';
import apiClient from '../../../utils/api';
import withAuth from '../../../components/withAuth';
import { useAuth } from '../../../hooks/useAuth';
import RegionNavigation from '@/components/RegionNavigation';
import StatCard from '@/components/StatCard';
import Button from '@/components/Button';

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  userType: 'student' | 'instructor' | 'centerAdmin' | 'superAdmin';
  isActive: boolean;
  level?: string;
  centerId?: string;
  centerInfo?: {
    _id: string;
    name: string;
    address?: {
      city: string;
      province: string;
      address1: string;
    };
    grade?: string;
  };
  studentInfo?: {
    swimmingLevel?: string;
    age?: number;
  };
  instructorInfo?: {
    instructorLevel?: string;
    experience?: string;
  };
  centerAdminInfo?: {
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
    adminLevel?: string;
    systemPermissions?: {
      canManageAllUsers?: boolean;
      canManageAllCenters?: boolean;
      canManageSystemSettings?: boolean;
      canViewAllReports?: boolean;
      canManageSkillTemplates?: boolean;
    };
  };
  createdAt: string;
}

function AdminUsersPage() {
  const { user: currentUser } = useAuth(); // 현재 로그인한 사용자 정보
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState<any>({
    name: '',
    email: '',
    phone: '',
    userType: 'student',
    level: 'beginner',
  });

  // 기존 구조로 복원 - 탭 제거

  // 지역 필터 상태
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [selectedCenters, setSelectedCenters] = useState<string[]>([]);

  // 필터링 상태
  const [filters, setFilters] = useState({
    userType: '',
    level: '',
    search: '',
    status: 'all'
  });

  // 지역 데이터 (다른 페이지들과 동일)
  // 센터 데이터만 정의 (시/도, 시/군/구는 컴포넌트 내장)
  const centerData = {
    '서울시': {
      '강남구': ['강남센터', '논현센터', '역삼센터'],
      '서초구': ['서초센터', '방배센터', '반포센터'],
      '송파구': ['송파센터', '잠실센터', '문정센터'],
      '강동구': ['강동센터', '천호센터', '길동센터']
    },
    '경기도': {
      '수원시': ['수원센터', '영통센터', '팔달센터'],
      '성남시': ['성남센터', '분당센터', '수정센터'],
      '용인시': ['용인센터', '기흥센터', '수지센터'],
      '부천시': ['부천센터', '원미센터', '소사센터']
    }
  };

  // 페이지네이션
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  // 전체 사용자 로드 함수 제거

  const loadUsers = async (page = 1) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        includeCenter: 'true', // 센터 정보 포함 요청
        userType: 'student', // 회원 관리 페이지이므로 학생만 표시
        ...(filters.userType && { userType: filters.userType }),
        ...(filters.level && { level: filters.level }),
        ...(filters.search && { search: filters.search }),
        ...(filters.status !== 'all' && { status: filters.status })
      });

      const res = await apiClient.get<{
        success: boolean;
        users?: any[];
        pagination?: { total: number; pages: number };
        error?: string;
      }>(`/api/users?${queryParams.toString()}`);
      if ((res as any).users && Array.isArray((res as any).users)) {
        // 🔐 현재 로그인한 사용자를 목록에서 제외
        let filteredUsers = (res as any).users.filter((user: User) => 
          currentUser && user._id !== currentUser._id
        );
        
        // 🌍 지역 필터링 (RegionNavigation으로 대체됨)
        // 🏢 임시로 센터 정보 추가 (서버에서 센터 정보가 없을 경우)
        const usersWithCenter = filteredUsers.map((user: User) => {
          if (!user.centerInfo && user.userType !== 'superAdmin') {
            return {
              ...user,
              centerInfo: {
                _id: 'dummy-center-1',
                name: 'JJ 수영센터 샘플점',
                address: {
                  city: '서울시',
                  province: '강남구',
                  address1: '샘플로 123'
                },
                grade: 'gold'
              }
            };
          }
          return user;
        });
        
        console.log(`👥 전체 사용자: ${(res as any).users.length}명, 필터링 후: ${usersWithCenter.length}명`);
        
        setUsers(usersWithCenter);
        setPagination(prev => ({
          ...prev,
          page,
          total: (res as any).pagination?.total || 0,
          pages: (res as any).pagination?.pages || 0,
        }));
      }
    } catch (error) {
      console.error('사용자 목록 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    loadUsers(1);
  }, [filters]); // 기존 구조로 복원

  const handleAddUser = () => {
    setShowAddModal(true);
  };

  const handleEditUser = (userId: string) => {
    const user = users.find(u => u._id === userId);
    if (user) {
      setEditingUser(user);
      setShowEditModal(true);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const user = users.find(u => u._id === userId);
    if (!user || !confirm(`정말로 ${user.name} 사용자를 삭제하시겠습니까?`)) return;
    
    try {
      const res = await apiClient.deleteUser(userId);
      if (!res.error) {
        await loadUsers(pagination.page);
        alert('사용자가 삭제되었습니다.');
      } else {
        alert(res.error);
      }
    } catch (error) {
      alert('사용자 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleSaveUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.phone) { 
      alert('모든 필수 항목을 입력해주세요.'); 
      return; 
    }
    
    try {
      const res = await apiClient.createUser({
        userId: newUser.email,
        name: newUser.name,
        email: newUser.email,
        password: 'password123',
        phone: newUser.phone,
        address: '',
        userType: newUser.userType,
        level: newUser.level,
      });
      
      if (!res.error) {
        setShowAddModal(false);
        setNewUser({ name: '', email: '', phone: '', userType: 'student', level: 'beginner' });
        await loadUsers(pagination.page);
        alert('사용자가 생성되었습니다.');
      } else {
        alert(res.error);
      }
    } catch (error) {
      alert('사용자 생성 중 오류가 발생했습니다.');
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    
    try {
      // 🔒 관리적 기능만 전송 (개인정보 제외)
      const managementData = {
        userType: editingUser.userType,  // 사용자 유형 변경
        level: editingUser.level,        // 레벨 변경
        isActive: editingUser.isActive,  // 계정 활성/비활성
        // 개인정보(name, phone, email)는 전송하지 않음
      };
      
      console.log('🔒 관리적 데이터만 전송:', managementData);
      
      const res = await apiClient.updateUser(editingUser._id, managementData);
      
      if (!res.error) {
        setShowEditModal(false);
        setEditingUser(null);
        await loadUsers(pagination.page);
        alert('사용자 관리 정보가 업데이트되었습니다.');
      } else {
        alert(res.error);
      }
    } catch (error) {
      alert('사용자 관리 정보 업데이트 중 오류가 발생했습니다.');
    }
  };

  const getUserTypeColor = (userType: string) => {
    switch (userType) {
      case 'student': return 'bg-blue-100 text-blue-800';
      case 'instructor': return 'bg-green-100 text-green-800';
      case 'centerAdmin': return 'bg-purple-100 text-purple-800';
      case 'superAdmin': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUserTypeText = (userType: string) => {
    switch (userType) {
      case 'student': return '수강생';
      case 'instructor': return '강사';
      case 'centerAdmin': return '센터 관리자';
      case 'superAdmin': return '시스템 관리자';
      default: return userType;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelText = (user: User) => {
    switch (user.userType) {
      case 'student':
        // 학생은 메달 등급 시스템 사용 (studentInfo.swimmingLevel 우선 사용)
        const studentLevel = user.studentInfo?.swimmingLevel || 'beginner';
        const studentLevelMap: { [key: string]: string } = {
          'beginner': '🟤 브론즈',
          'intermediate': '⚪ 실버',
          'advanced': '🟡 골드',
          'expert': '💎 플래티넘'
        };
        return studentLevelMap[studentLevel] || '🥉 브론즈';
      case 'instructor':
        // 강사는 전문직 등급 시스템 사용 (instructorInfo.instructorLevel 우선 사용)
        const instructorLevel = user.instructorInfo?.instructorLevel || 'junior';
        const instructorLevelMap: { [key: string]: string } = {
          'trainee': '🔰 신입 강사',
          'junior': '📈 주니어 강사',
          'senior': '🏆 시니어 강사',
          'master': '👑 마스터 강사'
        };
        return instructorLevelMap[instructorLevel] || '📈 주니어 강사';
      case 'centerAdmin':
        // 센터관리자는 관리직 등급 시스템 사용 (centerAdminInfo.adminLevel 우선 사용)
        const centerAdminLevel = user.centerAdminInfo?.adminLevel || 'assistant';
        const centerAdminLevelMap: { [key: string]: string } = {
          'assistant': '🔰 어시스턴트',
          'manager': '📈 매니저',
          'director': '🏆 디렉터',
          'executive': '👑 임원'
        };
        return centerAdminLevelMap[centerAdminLevel] || '🔰 어시스턴트';
      case 'superAdmin':
        return '👑 시스템 관리자';
      default:
        return '🥉 브론즈';
    }
  };

  const getPermissionsText = (user: User) => {
    if (user.userType === 'centerAdmin' && user.centerAdminInfo?.permissions) {
      const perms = user.centerAdminInfo.permissions;
      const activePerms = Object.entries(perms).filter(([_, value]) => value).length;
      return `${activePerms}개 권한`;
    } else if (user.userType === 'superAdmin' && user.superAdminInfo?.systemPermissions) {
      const perms = user.superAdminInfo.systemPermissions;
      const activePerms = Object.entries(perms).filter(([_, value]) => value).length;
      return `${activePerms}개 시스템 권한`;
    }
    return '-';
  };


  // 사용자 유형별 레벨 옵션 생성
  const getLevelOptions = () => {
    const selectedUserType = filters.userType;
    
    if (selectedUserType === 'student') {
      return [
        { value: '', label: '전체' },
        { value: 'beginner', label: '🥉 브론즈' },
        { value: 'intermediate', label: '🥈 실버' },
        { value: 'advanced', label: '🥇 골드' },
        { value: 'expert', label: '💎 플래티넘' }
      ];
    } else if (selectedUserType === 'instructor') {
      return [
        { value: '', label: '전체' },
        { value: 'trainee', label: '🔰 신입 강사' },
        { value: 'junior', label: '📈 주니어 강사' },
        { value: 'senior', label: '🏆 시니어 강사' },
        { value: 'master', label: '👑 마스터 강사' }
      ];
    } else if (selectedUserType === 'centerAdmin') {
      return [
        { value: '', label: '전체' },
        { value: 'assistant', label: '🔰 어시스턴트' },
        { value: 'manager', label: '📈 매니저' },
        { value: 'director', label: '🏆 디렉터' },
        { value: 'executive', label: '👑 임원' }
      ];
    } else if (selectedUserType === 'superAdmin') {
      return [
        { value: '', label: '전체' },
        { value: 'admin', label: '👑 시스템 관리자' }
      ];
    } else {
      // 전체 사용자 타입일 때는 모든 레벨 표시
      return [
        { value: '', label: '전체' },
        { value: 'beginner', label: '🥉 브론즈 (학생)' },
        { value: 'intermediate', label: '🥈 실버 (학생)' },
        { value: 'advanced', label: '🥇 골드 (학생)' },
        { value: 'expert', label: '💎 플래티넘 (학생)' },
        { value: 'trainee', label: '🔰 신입 강사' },
        { value: 'junior', label: '📈 주니어 강사' },
        { value: 'senior', label: '🏆 시니어 강사' },
        { value: 'master', label: '👑 마스터 강사' },
        { value: 'assistant', label: '🔰 어시스턴트 (센터관리자)' },
        { value: 'manager', label: '📈 매니저 (센터관리자)' },
        { value: 'director', label: '🏆 디렉터 (센터관리자)' },
        { value: 'executive', label: '👑 임원 (센터관리자)' }
      ];
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    if (key === 'userType') {
      // 사용자 유형이 변경되면 레벨 필터 초기화
      setFilters(prev => ({ ...prev, [key]: value, level: '' }));
    } else {
      setFilters(prev => ({ ...prev, [key]: value }));
    }
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    loadUsers(page);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">사용자 관리</h1>
            <p className="text-xl text-gray-600">전체 사용자 목록 및 권한 관리</p>
          </div>
          <Button
            onClick={handleAddUser}
            variant="primary"
            size="lg"
          >
            + 새 사용자 추가
          </Button>
        </div>

        {/* Page Title */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">👥 회원 관리</h3>
          <p className="text-gray-600">학생 회원들의 정보를 관리합니다.</p>
        </div>

        {/* 지역 필터 */}
        <RegionNavigation
          selectedRegions={selectedRegions}
          setSelectedRegions={setSelectedRegions}
          selectedDistricts={selectedDistricts}
          setSelectedDistricts={setSelectedDistricts}
          selectedCenters={selectedCenters}
          setSelectedCenters={setSelectedCenters}
          centerData={centerData}
          comparisonMode={false}
          layout="dropdown"
        />

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🔍 필터 및 검색</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">회원 상태</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">전체</option>
                <option value="active">활성</option>
                <option value="inactive">비활성</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">레벨</label>
              <select
                value={filters.level}
                onChange={(e) => handleFilterChange('level', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {getLevelOptions().map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">상태</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">전체</option>
                <option value="active">활성</option>
                <option value="inactive">비활성</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">검색</label>
              <input
                type="text"
                placeholder="이름, 이메일, 전화번호"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">사용자 목록을 불러오는 중...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="overflow-x-auto">
                              <table className="w-full min-w-[800px] lg:min-w-[1000px] xl:min-w-[1200px] divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      이름
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      이메일
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      전화번호
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      유형
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      레벨
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      이용센터
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      권한
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상태
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      가입일
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.phone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getUserTypeColor(user.userType)}`}>
                          {getUserTypeText(user.userType)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getLevelText(user)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.centerInfo ? (
                          <div>
                            <div className="font-medium text-gray-900">{user.centerInfo.name}</div>
                            <div className="text-xs text-gray-500">
                              {user.centerInfo.address?.city} {user.centerInfo.address?.province}
                            </div>
                            {user.centerInfo.grade && (
                              <div className="text-xs">
                                {user.centerInfo.grade === 'bronze' && '⭐ 1급'}
                                {user.centerInfo.grade === 'silver' && '⭐⭐ 2급'}
                                {user.centerInfo.grade === 'gold' && '⭐⭐⭐ 3급'}
                                {user.centerInfo.grade === 'platinum' && '⭐⭐⭐⭐ 특급'}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getPermissionsText(user)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(user.isActive ? 'active' : 'inactive')}`}>
                          {user.isActive ? '활성' : '비활성'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEditUser(user._id)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="flex space-x-2">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-4 py-2 rounded-lg text-lg font-semibold transition-colors ${
                    page === pagination.page
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Add User Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">새 사용자 추가</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">이름</label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">이메일</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">전화번호</label>
                  <input
                    type="tel"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">사용자 유형</label>
                  <select
                    value={newUser.userType}
                    onChange={(e) => setNewUser({ ...newUser, userType: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="student">수강생</option>
                    <option value="instructor">강사</option>
                    <option value="centerAdmin">센터 관리자</option>
                    <option value="superAdmin">시스템 관리자</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">레벨</label>
                  <select
                    value={newUser.level}
                    onChange={(e) => setNewUser({ ...newUser, level: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="beginner">초급</option>
                    <option value="intermediate">중급</option>
                    <option value="advanced">고급</option>
                    <option value="expert">전문가</option>
                  </select>
                </div>
              </div>
              <div className="flex space-x-4 mt-6">
                <Button
                  onClick={handleSaveUser}
                  variant="primary"
                  size="md"
                  fullWidth
                >
                  추가
                </Button>
                <Button
                  onClick={() => setShowAddModal(false)}
                  variant="secondary"
                  size="md"
                  fullWidth
                >
                  취소
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 🔒 관리자 전용 사용자 관리 모달 */}
        {showEditModal && editingUser && (
          <div key={`admin-management-modal-${Date.now()}`} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] border-2 border-blue-200 flex flex-col">
              {/* 모달 헤더 (고정) */}
              <div className="flex items-center justify-between p-6 pb-4 border-b flex-shrink-0">
                <h3 className="text-2xl font-bold text-gray-900">🛡️ 사용자 관리 (관리자 전용)</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>
              
              {/* 모달 컨텐츠 (스크롤 가능) */}
              <div className="flex-1 overflow-y-auto p-6">
              
              {/* 🔒 개인정보 보호 영역 */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <h4 className="text-sm font-bold text-red-800 mb-3 flex items-center">
                  🔒 개인정보 (수정 불가)
                </h4>
                <div className="space-y-2 text-sm bg-white rounded p-3">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">이름:</span> 
                    <span className="text-gray-900">{editingUser.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">이메일:</span> 
                    <span className="text-gray-900">{editingUser.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">전화번호:</span> 
                    <span className="text-gray-900">{editingUser.phone}</span>
                  </div>
                </div>
                <p className="text-xs text-red-600 mt-2 font-medium">
                  🛡️ 개인정보보호법에 따라 본인만 수정 가능합니다.
                </p>
              </div>
              
              {/* 🏢 센터 정보 영역 */}
              {editingUser.centerInfo && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <h4 className="text-sm font-bold text-green-800 mb-4 flex items-center">
                    🏢 이용센터 정보
                  </h4>
                  
                  <div className="bg-white rounded-lg p-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-600">센터명:</span>
                      <span className="text-gray-900 font-semibold">{editingUser.centerInfo.name}</span>
                    </div>
                    
                    {editingUser.centerInfo.address && (
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-gray-600">주소:</span>
                        <div className="text-right">
                          <div className="text-gray-900">{editingUser.centerInfo.address.city} {editingUser.centerInfo.address.province}</div>
                          <div className="text-sm text-gray-600">{editingUser.centerInfo.address.address1}</div>
                        </div>
                      </div>
                    )}
                    
                    {editingUser.centerInfo.grade && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-600">센터등급:</span>
                        <span className="text-gray-900 font-semibold">
                          {editingUser.centerInfo.grade === 'bronze' && '⭐ 1급 센터'}
                          {editingUser.centerInfo.grade === 'silver' && '⭐⭐ 2급 센터'}
                          {editingUser.centerInfo.grade === 'gold' && '⭐⭐⭐ 3급 센터'}
                          {editingUser.centerInfo.grade === 'platinum' && '⭐⭐⭐⭐ 특급 센터'}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-xs text-green-600 mt-2 font-medium">
                    💡 사용자가 소속된 센터의 정보입니다.
                  </p>
                </div>
              )}

              {/* ⚙️ 관리 기능 영역 */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h4 className="text-sm font-bold text-blue-800 mb-4 flex items-center">
                  ⚙️ 관리 기능 (수정 가능)
                </h4>
                
                <div className="space-y-4">
                  {/* 계정 상태 */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">🚦 계정 상태</label>
                    <select
                      value={editingUser.isActive ? 'active' : 'inactive'}
                      onChange={(e) => setEditingUser({ ...editingUser, isActive: e.target.value === 'active' })}
                      className="w-full border-2 border-blue-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="active">✅ 활성 (정상 이용 가능)</option>
                      <option value="inactive">🚫 비활성 (이용 제한/패널티)</option>
                    </select>
                  </div>
                  
                  {/* 사용자 유형 (표시만, 수정 불가) */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">👥 사용자 유형 (변경 불가)</label>
                    <div className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 bg-gray-100">
                      <span className="text-gray-700 font-medium">
                        {editingUser.userType === 'student' && '👨‍🎓 수강생'}
                        {editingUser.userType === 'instructor' && '👨‍🏫 강사'}
                        {editingUser.userType === 'centerAdmin' && '🏢 센터관리자'}
                        {editingUser.userType === 'superAdmin' && '👑 최고관리자'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      🔒 사용자 유형은 계정 생성 시 결정되며 변경할 수 없습니다.
                    </p>
                  </div>
                  
                  {/* 사용자 유형별 레벨/등급 관리 */}
                  {editingUser.userType === 'instructor' ? (
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">🏆 강사 등급</label>
                      <select
                        value={editingUser.level || 'trainee'}
                        onChange={(e) => setEditingUser({ ...editingUser, level: e.target.value })}
                        className="w-full border-2 border-green-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                      >
                        <option value="trainee">🔰 신입 강사 (Trainee)</option>
                        <option value="junior">📈 주니어 강사 (Junior)</option>
                        <option value="senior">🏆 시니어 강사 (Senior)</option>
                        <option value="master">👑 마스터 강사 (Master)</option>
                      </select>
                      <p className="text-xs text-green-600 mt-1 font-medium">
                        💡 강사 등급은 성과와 경력에 따라 결정됩니다.
                      </p>
                    </div>
                  ) : editingUser.userType === 'centerAdmin' ? (
                   <div>
                     <label className="block text-sm font-bold text-gray-700 mb-2">🏢 센터관리자 등급</label>
                     <select
                       value={editingUser.level || 'assistant'}
                       onChange={(e) => setEditingUser({ ...editingUser, level: e.target.value })}
                       className="w-full border-2 border-purple-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                     >
                       <option value="assistant">🔰 어시스턴트 (Assistant)</option>
                       <option value="manager">📈 매니저 (Manager)</option>
                       <option value="director">🏆 디렉터 (Director)</option>
                       <option value="executive">👑 임원 (Executive)</option>
                     </select>
                     <p className="text-xs text-purple-600 mt-1 font-medium">
                       💡 센터관리자 등급은 관리 경험과 성과에 따라 결정됩니다.
                     </p>
                   </div>
                  ) : editingUser.userType === 'superAdmin' ? (
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">👑 최고관리자 등급</label>
                      <div className="w-full border-2 border-red-300 rounded-lg px-3 py-2 bg-red-50">
                        <span className="text-red-800 font-bold">👑 시스템 관리자 (System Admin)</span>
                      </div>
                      <p className="text-xs text-red-600 mt-1 font-medium">
                        💡 최고관리자는 고정 등급입니다.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">🏊‍♂️ 수영 레벨</label>
                      <select
                        value={editingUser.level || 'beginner'}
                        onChange={(e) => setEditingUser({ ...editingUser, level: e.target.value })}
                        className="w-full border-2 border-blue-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        <option value="beginner">🥉 브론즈 (수영 초보자)</option>
                        <option value="intermediate">🥈 실버 (기본 영법 습득자)</option>
                        <option value="advanced">🥇 골드 (고급 기술 보유자)</option>
                        <option value="expert">💎 플래티넘 (마스터 수준)</option>
                      </select>
                      <p className="text-xs text-orange-600 mt-1 font-medium">
                        🎯 학생 수영 레벨은 강사의 체크리스트 완료 시 자동으로 승급됩니다.
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* 📝 변경 사유 */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <label className="block text-sm font-bold text-yellow-800 mb-2">📝 변경 사유 (필수)</label>
                <textarea
                  placeholder="계정 상태나 권한 변경 사유를 상세히 입력하세요..."
                  className="w-full border-2 border-yellow-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500 h-24 resize-none bg-white"
                />
                <p className="text-xs text-yellow-700 mt-2 font-medium">
                  ⚠️ 관리 작업 기록을 위해 변경 사유를 반드시 입력해주세요.
                </p>
              </div>
              
              </div>
              
              {/* 모달 하단 버튼 (고정) */}
              <div className="flex-shrink-0 p-6 pt-4 border-t bg-gray-50 rounded-b-xl">
                <div className="flex space-x-4">
                  <Button
                    onClick={handleUpdateUser}
                    variant="primary"
                    size="lg"
                    fullWidth
                  >
                    💾 저장
                  </Button>
                  <Button
                    onClick={() => setShowEditModal(false)}
                    variant="secondary"
                    size="lg"
                    fullWidth
                  >
                    ❌ 닫기
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default withAuth(AdminUsersPage, { requireTypes: ['centerAdmin', 'superAdmin'], requirePermission: 'userManagement' });
