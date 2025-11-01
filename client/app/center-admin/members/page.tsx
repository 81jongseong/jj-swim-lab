/**
 * 🏊‍♂️ JJ Swim Lab - 센터 회원 관리 페이지
 * 
 * 📋 **페이지 목적**
 * - 센터의 모든 회원 목록 조회 및 관리
 * - 회원을 강습 과정에 배정
 * - 회원의 수강 이력 및 상태 관리
 * - MongoDB와 실시간 연동
 * 
 * 🗄️ **데이터 연동**
 * - GET /api/center-admin/members - 회원 목록 조회
 * - PUT /api/center-admin/members/:id/course - 회원을 과정에 배정
 * - GET /api/center-admin/courses - 배정 가능한 과정 목록 조회
 * 
 * 🔄 **연동 컴포넌트**
 * - client/components/center-admin/MemberCard.tsx
 * - client/components/center-admin/CourseAssignmentModal.tsx
 */

'use client';
/* eslint-disable no-console */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Users, UserPlus, Search, Calendar, Heart, TrendingUp, TrendingDown } from 'lucide-react';
import ThemedStatCard from '@/components/ThemedStatCard';
import MemberCard, { MemberCardData } from '@/components/center-admin/MemberCard';
import withAuth from '@/components/withAuth';
import apiClient from '@/utils/api';

const DEBUG = true;

interface Member {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  userType: 'student' | 'instructor' | 'centerAdmin';
  status: 'active' | 'inactive' | 'suspended';
  enrollmentDate: Date;
  assignedCourses?: {
    courseId: string;
    courseName: string;
    instructorName: string;
    enrollmentDate: Date;
    status: 'active' | 'completed' | 'cancelled';
  }[];
  totalLessonsCompleted: number;
  lastLessonDate?: Date;
  centerMemo?: string; // 현재 메모
  centerMemos?: Array<{ // 메모 이력
    memo: string;
    createdAt: Date;
    createdBy: string;
  }>;
  studentInfo?: {
    age?: number;
    emergencyContact?: string;
    medicalConditions?: string;
    swimmingLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    centerMemo?: string;
    centerMemos?: Array<{
      memo: string;
      createdAt: Date;
      createdBy: string;
    }>;
    healthProfile?: {
      height?: number;
      weight?: number;
      bmi?: number;
      bloodType?: string;
      allergies?: string[];
      chronicConditions?: string[];
      medications?: string[];
      emergencyContact?: {
        name: string;
        relationship: string;
        phone: string;
      };
      fitnessGoals?: string[];
      activityLevel?: string;
      targetWeight?: number;
      targetBMI?: number;
      lastHealthCheck?: Date;
      bloodPressure?: {
        systolic?: number;
        diastolic?: number;
        measuredAt?: Date;
      };
      cholesterol?: {
        total?: number;
        ldl?: number;
        hdl?: number;
        triglycerides?: number;
        measuredAt?: Date;
      };
      bloodSugar?: {
        fasting?: number;
        postprandial?: number;
        hba1c?: number;
        measuredAt?: Date;
      };
      swimmingRelatedConditions?: {
        cardiovascular?: boolean;
        respiratory?: boolean;
        musculoskeletal?: boolean;
        diabetes?: boolean;
        hypertension?: boolean;
        asthma?: boolean;
        other?: string[];
      };
      healthHistory?: Array<{
        date: Date;
        weight?: number;
        bmi?: number;
        bloodPressure?: {
          systolic?: number;
          diastolic?: number;
        };
        cholesterol?: {
          total?: number;
          ldl?: number;
          hdl?: number;
          triglycerides?: number;
        };
        bloodSugar?: {
          fasting?: number;
          postprandial?: number;
          hba1c?: number;
        };
        notes?: string;
      }>;
    };
  };
}

interface Course {
  _id: string;
  name: string;
  instructorName: string;
  level: string;
  maxStudents: number;
  currentStudents: number;
}

function CenterMembersManagement() {
  const router = useRouter();
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 테넌트 경로로 리다이렉트 (Phase 3)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const slug = localStorage.getItem('centerSlug') || 'default';
      const currentPath = window.location.pathname;
      if (currentPath.startsWith('/center-admin/') && !currentPath.includes('/center/')) {
        const newPath = currentPath.replace('/center-admin', `/center/${slug}/admin`);
        router.replace(newPath);
        return;
      }
    }
  }, [router]);

  // 권한 확인 - 페이지 렌더링 전에 체크
  // center@swim.com 계정도 센터 관리자로 인식
  const isCenterAdmin = user && (
    ['centerAdmin', 'center-admin', 'superAdmin'].includes(user.userType) ||
    user.email === 'center@swim.com'
  );
  
  if (!isCenterAdmin) {
    // 권한이 없는 사용자는 게스트 버전의 화면으로 리다이렉트
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
    return null;
  }
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [courseFilter, setCourseFilter] = useState<string>('all');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showMemoModal, setShowMemoModal] = useState(false);
  const [showMemoHistoryModal, setShowMemoHistoryModal] = useState(false);
  const [showHealthModal, setShowHealthModal] = useState(false);
  const [memoText, setMemoText] = useState('');

  useEffect(() => {
    if (user) {
      loadMembers();
      loadCourses();
    }
  }, [user]);

  // 건강정보 모달 상태 추적
  useEffect(() => {
    console.log('❤️ [MembersPage] 건강정보 모달 상태 변경:', {
      showHealthModal,
      selectedMember: selectedMember ? { name: selectedMember.name, _id: selectedMember._id } : null
    });
  }, [showHealthModal, selectedMember]);

  const loadMembers = async () => {
    try {
      console.log('🔄 loadMembers 호출됨');
      setIsLoading(true);
      const response = await apiClient.get('/api/center-admin/members');
      console.log('📡 회원 목록 API 응답:', response);
      
      if (response.success && Array.isArray(response.data)) {
        console.log('✅ 회원 목록 업데이트:', response.data.length, '명');
        // 전체 API 응답 데이터 확인
        console.log('📋 API 응답 전체 데이터:', JSON.stringify(response.data, null, 2));
        // 첫 번째 회원의 studentInfo 확인
        const firstMember = response.data[0];
        if (firstMember) {
          console.log('🔍 첫 번째 회원 데이터 전체:', JSON.stringify(firstMember, null, 2));
          console.log('🔍 첫 번째 회원 studentInfo 존재:', !!firstMember.studentInfo);
          console.log('🔍 첫 번째 회원 studentInfo:', firstMember.studentInfo);
          console.log('🔍 첫 번째 회원 healthProfile 존재:', !!firstMember.studentInfo?.healthProfile);
          console.log('🔍 첫 번째 회원 healthProfile:', firstMember.studentInfo?.healthProfile);
          console.log('🔍 첫 번째 회원 age:', firstMember.studentInfo?.age);
          console.log('🔍 첫 번째 회원 height:', firstMember.studentInfo?.healthProfile?.height);
          console.log('🔍 첫 번째 회원 weight:', firstMember.studentInfo?.healthProfile?.weight);
        }
        setMembers(response.data as Member[]);
      } else {
        console.error('회원 목록 로드 실패:', response.message);
      }
    } catch (error) {
      console.error('회원 목록 로드 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCourses = async () => {
    try {
      if (DEBUG) console.log('📚 과정 목록 로드 시작');
      const response = await apiClient.get('/api/center-admin/courses');
      if (DEBUG) console.log('📚 과정 목록 API 응답:', response);
      
      if (response.success && Array.isArray(response.data)) {
        if (DEBUG) console.log('📚 로드된 과정 목록:', response.data);
        setCourses(response.data as Course[]);
      } else {
        if (DEBUG) console.error('📚 과정 목록 로드 실패:', response.message);
      }
    } catch (error) {
      if (DEBUG) console.error('📚 과정 목록 로드 오류:', error);
    }
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
    const matchesCourse = courseFilter === 'all' || 
                         (courseFilter === 'assigned' && member.assignedCourses && member.assignedCourses.length > 0) ||
                         (courseFilter === 'unassigned' && (!member.assignedCourses || member.assignedCourses.length === 0));
    
    return matchesSearch && matchesStatus && matchesCourse;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return '활성';
      case 'inactive': return '비활성';
      case 'suspended': return '정지';
      default: return status;
    }
  };

  const handleAssignCourse = async (memberId: string, courseId: string) => {
    try {
      if (DEBUG) console.log('🔄 과정 배정 시작:', { memberId, courseId });
      const response = await apiClient.put(`/api/center-admin/members/${memberId}/course`, {
        courseId: courseId
      });
      
      if (DEBUG) console.log('📡 과정 배정 응답:', { success: response.success, message: response.message });
      if (DEBUG) console.log('✅ 과정 배정 성공:', response);
      
      if (response.success) {
        alert('과정 배정이 완료되었습니다.');
        setShowAssignmentModal(false);
        // 즉시 목록 새로고침
        loadMembers();
      } else {
        if (DEBUG) console.error('❌ 과정 배정 실패:', response);
        alert('과정 배정 실패: ' + response.message);
      }
    } catch (error) {
      if (DEBUG) console.error('❌ 과정 배정 오류:', error);
      alert('과정 배정 중 오류가 발생했습니다.');
    }
  };

  const handleUnassignCourse = async (memberId: string, courseId: string) => {
    if (!confirm('과정 배정을 취소하시겠습니까?')) {
      return;
    }

    try {
      if (DEBUG) console.log('🗑️ 과정 배정 취소 시작:', { memberId, courseId });
      const response = await apiClient.delete(`/api/center-admin/members/${memberId}/course/${courseId}`);
      
      if (response.success) {
        alert('과정 배정이 취소되었습니다.');
        loadMembers();
      } else {
        alert('과정 배정 취소 실패: ' + response.message);
      }
    } catch (error) {
      if (DEBUG) console.error('과정 배정 취소 오류:', error);
      alert('과정 배정 취소 중 오류가 발생했습니다.');
    }
  };

  const handleUpdateMemo = async (memberId: string, memo: string) => {
    try {
      const response = await apiClient.put(`/api/center-admin/members/${memberId}/memo`, {
        memo: memo
      });
      
      if (response.success) {
        alert('메모가 저장되었습니다.');
        loadMembers(); // 목록 새로고침
        setShowMemoModal(false);
        setMemoText('');
      } else {
        alert('메모 저장 실패: ' + response.message);
      }
    } catch (error) {
      if (DEBUG) console.error('메모 저장 오류:', error);
      alert('메모 저장 중 오류가 발생했습니다.');
    }
  };

  const openMemoModal = (member: Member) => {
    setSelectedMember(member);
    setMemoText(member.centerMemo || member.studentInfo?.centerMemo || '');
    setShowMemoModal(true);
  };

  const handleHealthClick = (member: MemberCardData) => {
    console.log('❤️ [MembersPage] handleHealthClick 호출됨:', member);
    console.log('❤️ [MembersPage] members 배열:', members);
    console.log('❤️ [MembersPage] members 배열 길이:', members.length);
    const fullMember = members.find(m => m._id === member._id);
    if (!fullMember) {
      console.error('❌ [MembersPage] 회원을 찾을 수 없습니다:', member._id);
      console.error('❌ [MembersPage] 검색 대상 ID:', member._id);
      console.error('❌ [MembersPage] members IDs:', members.map(m => m._id));
      return;
    }
    console.log('❤️ [MembersPage] 선택된 회원 전체 데이터:', JSON.stringify(fullMember, null, 2));
    console.log('❤️ [MembersPage] 선택된 회원:', fullMember.name, fullMember._id);
    console.log('❤️ [MembersPage] 회원 studentInfo:', fullMember.studentInfo);
    console.log('❤️ [MembersPage] 회원 건강정보:', {
      age: fullMember.studentInfo?.age,
      emergencyContact: fullMember.studentInfo?.emergencyContact,
      medicalConditions: fullMember.studentInfo?.medicalConditions,
      healthProfile: fullMember.studentInfo?.healthProfile,
      height: fullMember.studentInfo?.healthProfile?.height,
      weight: fullMember.studentInfo?.healthProfile?.weight
    });
    console.log('❤️ [MembersPage] showHealthModal 상태 (이전):', showHealthModal);
    setSelectedMember(fullMember);
    setShowHealthModal(true);
    console.log('❤️ [MembersPage] showHealthModal 상태 (이후): true');
    console.log('❤️ [MembersPage] selectedMember 설정 완료:', fullMember.name);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">회원 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">회원 관리</h1>
          <p className="text-gray-600">센터의 모든 회원을 관리하고 강습 과정에 배정할 수 있습니다.</p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <ThemedStatCard className="border-2" title="전체 회원" value={members.length} icon={<Users className="h-4 w-4" />} color="blue" />
          <ThemedStatCard className="border-2" title="활성 회원" value={members.filter(m => m.status === 'active').length} icon={<UserPlus className="h-4 w-4" />} color="green" />
          <ThemedStatCard className="border-2" title="배정 회원" value={members.filter(m => m.assignedCourses && m.assignedCourses.length > 0).length} icon={<Calendar className="h-4 w-4" />} color="purple" />
          <ThemedStatCard className="border-2" title="미배정" value={members.filter(m => !m.assignedCourses || m.assignedCourses.length === 0).length} icon={<Users className="h-4 w-4" />} color="orange" />
        </div>

        {/* 건강 통계 카드 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <ThemedStatCard 
            className="border-2 border-red-200" 
            title="평균 나이" 
            value={(() => {
              const ages = members.filter(m => m.studentInfo?.age).map(m => m.studentInfo!.age!);
              return ages.length > 0 ? Math.round(ages.reduce((a, b) => a + b, 0) / ages.length) : '-';
            })()}
            icon={<Heart className="h-4 w-4" />} 
            color="red" 
          />
          <ThemedStatCard 
            className="border-2 border-green-200" 
            title="건강 데이터 보유" 
            value={members.filter(m => m.studentInfo?.age).length}
            icon={<TrendingUp className="h-4 w-4" />} 
            color="green" 
          />
          <ThemedStatCard 
            className="border-2 border-yellow-200" 
            title="만성 질환 보유" 
            value={members.filter(m => m.studentInfo?.medicalConditions).length}
            icon={<Heart className="h-4 w-4" />} 
            color="yellow" 
          />
          <ThemedStatCard 
            className="border-2 border-purple-200" 
            title="응급연락처 등록" 
            value={members.filter(m => m.studentInfo?.emergencyContact).length}
            icon={<Users className="h-4 w-4" />} 
            color="purple" 
          />
        </div>

        {/* 검색 및 필터 */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="회원 이름 또는 이메일로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-lg w-full"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg"
              >
                <option value="all">전체 상태</option>
                <option value="active">활성</option>
                <option value="inactive">비활성</option>
                <option value="suspended">정지</option>
              </select>
              
              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg"
              >
                <option value="all">전체 회원</option>
                <option value="assigned">과정 배정됨</option>
                <option value="unassigned">미배정</option>
              </select>
            </div>
          </div>
        </div>

        {/* 회원 목록 - MemberCard 그리드 */}
        <div>
          <div className="mb-3">
            <h2 className="text-lg font-semibold text-gray-900">회원 목록</h2>
            <p className="text-sm text-gray-600">총 {filteredMembers.length}명의 회원</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMembers.map((member) => (
              <MemberCard
                key={member._id}
                member={{
                  _id: member._id,
                  name: member.name,
                  email: member.email,
                  phone: member.phone,
                  status: member.status,
                  assignedCourses: (member.assignedCourses || []).map((c: any) => ({ courseId: c.courseId, courseName: c.courseName, instructorName: c.instructorName })),
                  enrollmentDate: member.enrollmentDate
                }}
                onView={() => { 
                  console.log('🔍 [MembersPage] 상세 버튼 클릭:', member.name);
                  setSelectedMember(member); 
                  setShowDetailModal(true); 
                }}
                onAssign={() => { 
                  console.log('👤 [MembersPage] 배정 버튼 클릭:', member.name);
                  setSelectedMember(member); 
                  setShowAssignmentModal(true); 
                }}
                onMemo={() => {
                  console.log('📝 [MembersPage] 메모 버튼 클릭:', member.name);
                  openMemoModal(member);
                }}
                onHealth={handleHealthClick}
              />
            ))}
          </div>
        </div>

        {/* 상세보기 모달 */}
        {showDetailModal && selectedMember && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">회원 상세 정보</h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
                  <p className="text-gray-900">{selectedMember.name}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                  <p className="text-gray-900">{selectedMember.email}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">전화번호</label>
                  <p className="text-gray-900">{selectedMember.phone || '미입력'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedMember.status)}`}>
                    {getStatusLabel(selectedMember.status)}
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">배정된 과정</label>
                  {selectedMember.assignedCourses && selectedMember.assignedCourses.length > 0 ? (
                    <div className="space-y-2">
                      {selectedMember.assignedCourses.map((course, index) => (
                        <div key={index} className="bg-blue-50 p-3 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="font-medium">{course.courseName}</div>
                              <div className="text-sm text-gray-600">강사: {course.instructorName}</div>
                              <div className="text-sm text-gray-600">
                                배정일: {new Date(course.enrollmentDate).toLocaleDateString()}
                              </div>
                              <div className="text-sm text-gray-600">
                                상태: {course.status === 'active' ? '활성' : course.status === 'completed' ? '완료' : '취소'}
                              </div>
                            </div>
                            <button
                              onClick={() => handleUnassignCourse(selectedMember._id, course.courseId)}
                              className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                            >
                              취소
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">배정된 과정이 없습니다.</p>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 과정 배정 모달 */}
        {showAssignmentModal && selectedMember && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">과정 배정</h3>
                <button
                  onClick={() => setShowAssignmentModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>{selectedMember.name}</strong> 회원을 배정할 과정을 선택하세요.
                </p>
              </div>
              
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {(() => {
                  const availableCourses = courses.filter(course => course.currentStudents < course.maxStudents);
                  if (DEBUG) console.log('📚 전체 과정 목록:', courses);
                  if (DEBUG) console.log('📚 배정 가능한 과정 목록:', availableCourses);
                  return availableCourses.map((course) => (
                  <div key={course._id} className="border rounded-lg p-3 hover:bg-gray-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{course.name}</div>
                        <div className="text-sm text-gray-600">
                          강사: {course.instructorName} | 레벨: {course.level}
                        </div>
                        <div className="text-sm text-gray-600">
                          정원: {course.currentStudents}/{course.maxStudents}명
                        </div>
                      </div>
                      <button
                        onClick={() => handleAssignCourse(selectedMember._id, course._id)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        배정
                      </button>
                    </div>
                  </div>
                  ));
                })()}
              </div>
              
              {courses.filter(course => course.currentStudents < course.maxStudents).length === 0 && (
                <p className="text-gray-400 text-center py-4">배정 가능한 과정이 없습니다.</p>
              )}
              
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowAssignmentModal(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 메모 편집 모달 */}
        {showMemoModal && selectedMember && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">특이사항 메모</h3>
                <button
                  onClick={() => setShowMemoModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>{selectedMember.name}</strong> 회원의 특이사항을 기록하세요.
                </p>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  메모 내용
                </label>
                <textarea
                  value={memoText}
                  onChange={(e) => setMemoText(e.target.value)}
                  placeholder="회원의 특이사항, 주의사항, 건강 상태 등을 기록하세요..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={6}
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowMemoModal(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  취소
                </button>
                <button
                  onClick={() => handleUpdateMemo(selectedMember._id, memoText)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 메모 이력 모달 */}
        {showMemoHistoryModal && selectedMember && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">메모 이력</h3>
                <button
                  onClick={() => setShowMemoHistoryModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-4">
                  <strong>{selectedMember.name}</strong> 회원의 메모 이력입니다.
                </p>
              </div>
              
              <div className="space-y-4">
                {selectedMember.centerMemos && selectedMember.centerMemos.length > 0 ? (
                  selectedMember.centerMemos.map((memo, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          {new Date(memo.createdAt).toLocaleString('ko-KR')}
                        </span>
                        <span className="text-xs text-gray-500">
                          작성자: {memo.createdBy}
                        </span>
                      </div>
                      <div className="text-sm text-gray-900 whitespace-pre-wrap">
                        {memo.memo}
                      </div>
                    </div>
                  ))
                ) : selectedMember.studentInfo?.centerMemos && selectedMember.studentInfo.centerMemos.length > 0 ? (
                  selectedMember.studentInfo.centerMemos.map((memo, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          {new Date(memo.createdAt).toLocaleString('ko-KR')}
                        </span>
                        <span className="text-xs text-gray-500">
                          작성자: {memo.createdBy}
                        </span>
                      </div>
                      <div className="text-sm text-gray-900 whitespace-pre-wrap">
                        {memo.memo}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    메모 이력이 없습니다.
                  </div>
                )}
              </div>
              
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowMemoHistoryModal(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 건강정보 모달 */}
        {(() => {
          const shouldShow = showHealthModal && selectedMember;
          if (process.env.NODE_ENV === 'development') {
            console.log('❤️ [MembersPage] 건강정보 모달 렌더링 체크:', {
              showHealthModal,
              hasSelectedMember: !!selectedMember,
              shouldShow,
              selectedMemberName: selectedMember?.name,
              studentInfo: selectedMember?.studentInfo,
              age: selectedMember?.studentInfo?.age,
              healthProfile: selectedMember?.studentInfo?.healthProfile,
              height: selectedMember?.studentInfo?.healthProfile?.height,
              weight: selectedMember?.studentInfo?.healthProfile?.weight
            });
          }
          return shouldShow;
        })() && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  <Heart className="inline w-6 h-6 mr-2 text-red-500" />
                  {selectedMember.name} 회원 건강정보
                </h3>
                <button
                  onClick={() => setShowHealthModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>
              
              {/* 디버깅 정보 (개발 환경에서만 표시) */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mb-4 p-4 bg-gray-100 rounded text-xs">
                  <strong>디버깅 정보:</strong>
                  <div>studentInfo 존재: {selectedMember.studentInfo ? '예' : '아니오'}</div>
                  <div>age: {selectedMember.studentInfo?.age ?? '없음'}</div>
                  <div>healthProfile 존재: {selectedMember.studentInfo?.healthProfile ? '예' : '아니오'}</div>
                  <div>height: {selectedMember.studentInfo?.healthProfile?.height ?? '없음'}</div>
                  <div>weight: {selectedMember.studentInfo?.healthProfile?.weight ?? '없음'}</div>
                  <div>전체 studentInfo: {JSON.stringify(selectedMember.studentInfo, null, 2)}</div>
                </div>
              )}
              
              {/* 인바디 차트 형태로 건강정보 표시 */}
              <div className="space-y-6">
                {/* 기본 정보 */}
                <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                  <h4 className="text-lg font-semibold text-blue-900 mb-4">기본 건강 정보</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-blue-100">
                      <div className="text-xs text-gray-600 mb-1">나이</div>
                      <div className="text-2xl font-bold text-blue-900">
                        {selectedMember.studentInfo?.age || '-'}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-blue-100">
                      <div className="text-xs text-gray-600 mb-1">신장</div>
                      <div className="text-2xl font-bold text-blue-900">
                        {selectedMember.studentInfo?.healthProfile?.height ? `${selectedMember.studentInfo.healthProfile.height}cm` : '-'}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-blue-100">
                      <div className="text-xs text-gray-600 mb-1">체중</div>
                      <div className="text-2xl font-bold text-blue-900">
                        {selectedMember.studentInfo?.healthProfile?.weight ? `${selectedMember.studentInfo.healthProfile.weight}kg` : '-'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 건강 상태 추세 차트 */}
                <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                  <h4 className="text-lg font-semibold text-green-900 mb-4">건강 상태 추세</h4>
                  {selectedMember.studentInfo?.healthProfile?.height && selectedMember.studentInfo?.healthProfile?.weight ? (
                    <div className="space-y-4">
                      {/* BMI 표시 */}
                      <div className="bg-white rounded-lg p-4 border border-green-100">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">BMI</span>
                          <span className="text-2xl font-bold text-green-900">
                            {selectedMember.studentInfo.healthProfile.bmi?.toFixed(1) || '-'}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
                          <div 
                            className={`h-3 rounded-full ${
                              selectedMember.studentInfo.healthProfile.bmi < 18.5 ? 'bg-blue-500' :
                              selectedMember.studentInfo.healthProfile.bmi < 23 ? 'bg-green-500' :
                              selectedMember.studentInfo.healthProfile.bmi < 25 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ 
                              width: `${Math.min(100, Math.max(10, (selectedMember.studentInfo.healthProfile.bmi / 35) * 100))}%` 
                            }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>저체중</span>
                          <span>정상</span>
                          <span>과체중</span>
                          <span>비만</span>
                        </div>
                      </div>

                      {/* 체중/신장 정보 */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg p-4 border border-green-100">
                          <div className="text-xs text-gray-600 mb-1">체중 추세</div>
                          <div className="text-xl font-bold text-green-900">
                            {selectedMember.studentInfo.healthProfile.weight}kg
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            최근 측정: {selectedMember.studentInfo.healthProfile.lastHealthCheck 
                              ? new Date(selectedMember.studentInfo.healthProfile.lastHealthCheck).toLocaleDateString('ko-KR')
                              : '-'}
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-green-100">
                          <div className="text-xs text-gray-600 mb-1">신장 추세</div>
                          <div className="text-xl font-bold text-green-900">
                            {selectedMember.studentInfo.healthProfile.height}cm
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            최근 측정: {selectedMember.studentInfo.healthProfile.lastHealthCheck 
                              ? new Date(selectedMember.studentInfo.healthProfile.lastHealthCheck).toLocaleDateString('ko-KR')
                              : '-'}
                          </div>
                        </div>
                      </div>

                      {/* 간단한 추세 그래프 (추후 여러 데이터로 확장 가능) */}
                      <div className="bg-white rounded-lg p-4 border border-green-100">
                        <div className="text-sm font-medium text-gray-700 mb-3">체중 변화 추세</div>
                        <div className="h-32 flex items-end justify-center">
                          {selectedMember.studentInfo.healthProfile.weight ? (
                            <div className="w-full max-w-xs">
                              <div className="flex items-end justify-center h-full">
                                <div className="flex flex-col items-center">
                                  <div 
                                    className="bg-green-500 rounded-t w-16 mb-2 flex items-end justify-center text-white text-xs font-semibold"
                                    style={{ height: `${(selectedMember.studentInfo.healthProfile.weight / 100) * 100}%` }}
                                  >
                                    {selectedMember.studentInfo.healthProfile.weight}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {selectedMember.studentInfo.healthProfile.lastHealthCheck 
                                      ? new Date(selectedMember.studentInfo.healthProfile.lastHealthCheck).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
                                      : '현재'}
                                  </div>
                                </div>
                              </div>
                              <p className="text-xs text-center text-gray-500 mt-2">
                                추가 측정 기록이 쌓이면 추세 그래프가 표시됩니다.
                              </p>
                            </div>
                          ) : (
                            <div className="text-center text-gray-400 text-sm">
                              데이터 없음
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 혈압, 콜레스테롤, 당뇨 카드 */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* 혈압 */}
                        <div className="bg-white rounded-lg p-4 border border-red-100">
                          <div className="text-xs text-gray-600 mb-2 font-medium">혈압</div>
                          {selectedMember.studentInfo?.healthProfile?.bloodPressure?.systolic ? (
                            <>
                              <div className="text-2xl font-bold text-red-900 mb-1">
                                {selectedMember.studentInfo.healthProfile.bloodPressure.systolic}/
                                {selectedMember.studentInfo.healthProfile.bloodPressure.diastolic}
                              </div>
                              <div className="text-xs text-gray-500">mmHg</div>
                              <div className="text-xs text-gray-400 mt-1">
                                {selectedMember.studentInfo.healthProfile.bloodPressure.measuredAt 
                                  ? new Date(selectedMember.studentInfo.healthProfile.bloodPressure.measuredAt).toLocaleDateString('ko-KR')
                                  : '측정일 없음'}
                              </div>
                            </>
                          ) : (
                            <div className="text-sm text-gray-400 py-4">데이터 없음</div>
                          )}
                        </div>

                        {/* 콜레스테롤 */}
                        <div className="bg-white rounded-lg p-4 border border-purple-100">
                          <div className="text-xs text-gray-600 mb-2 font-medium">콜레스테롤</div>
                          {selectedMember.studentInfo?.healthProfile?.cholesterol?.total ? (
                            <>
                              <div className="text-lg font-bold text-purple-900 mb-1">
                                총 {selectedMember.studentInfo.healthProfile.cholesterol.total}
                              </div>
                              <div className="text-xs text-gray-600 space-y-0.5">
                                <div>LDL: {selectedMember.studentInfo.healthProfile.cholesterol.ldl || '-'}</div>
                                <div>HDL: {selectedMember.studentInfo.healthProfile.cholesterol.hdl || '-'}</div>
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                {selectedMember.studentInfo.healthProfile.cholesterol.measuredAt 
                                  ? new Date(selectedMember.studentInfo.healthProfile.cholesterol.measuredAt).toLocaleDateString('ko-KR')
                                  : '측정일 없음'}
                              </div>
                            </>
                          ) : (
                            <div className="text-sm text-gray-400 py-4">데이터 없음</div>
                          )}
                        </div>

                        {/* 당뇨 (혈당) */}
                        <div className="bg-white rounded-lg p-4 border border-blue-100">
                          <div className="text-xs text-gray-600 mb-2 font-medium">혈당</div>
                          {selectedMember.studentInfo?.healthProfile?.bloodSugar?.fasting ? (
                            <>
                              <div className="text-lg font-bold text-blue-900 mb-1">
                                공복 {selectedMember.studentInfo.healthProfile.bloodSugar.fasting}
                              </div>
                              <div className="text-xs text-gray-600 space-y-0.5">
                                {selectedMember.studentInfo.healthProfile.bloodSugar.postprandial && (
                                  <div>식후: {selectedMember.studentInfo.healthProfile.bloodSugar.postprandial}</div>
                                )}
                                {selectedMember.studentInfo.healthProfile.bloodSugar.hba1c && (
                                  <div>HbA1c: {selectedMember.studentInfo.healthProfile.bloodSugar.hba1c}%</div>
                                )}
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                {selectedMember.studentInfo.healthProfile.bloodSugar.measuredAt 
                                  ? new Date(selectedMember.studentInfo.healthProfile.bloodSugar.measuredAt).toLocaleDateString('ko-KR')
                                  : '측정일 없음'}
                              </div>
                            </>
                          ) : (
                            <div className="text-sm text-gray-400 py-4">데이터 없음</div>
                          )}
                        </div>
                      </div>

                      {/* 수영 관련 건강질환 */}
                      {selectedMember.studentInfo?.healthProfile?.swimmingRelatedConditions && (
                        <div className="bg-white rounded-lg p-4 border border-orange-100">
                          <div className="text-sm font-medium text-orange-900 mb-3">수영 관련 건강질환</div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {selectedMember.studentInfo.healthProfile.swimmingRelatedConditions.cardiovascular && (
                              <span className="inline-flex items-center px-2 py-1 rounded bg-red-100 text-red-800 text-xs">심장 질환</span>
                            )}
                            {selectedMember.studentInfo.healthProfile.swimmingRelatedConditions.respiratory && (
                              <span className="inline-flex items-center px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs">호흡기 질환</span>
                            )}
                            {selectedMember.studentInfo.healthProfile.swimmingRelatedConditions.musculoskeletal && (
                              <span className="inline-flex items-center px-2 py-1 rounded bg-yellow-100 text-yellow-800 text-xs">근골격계 질환</span>
                            )}
                            {selectedMember.studentInfo.healthProfile.swimmingRelatedConditions.diabetes && (
                              <span className="inline-flex items-center px-2 py-1 rounded bg-purple-100 text-purple-800 text-xs">당뇨</span>
                            )}
                            {selectedMember.studentInfo.healthProfile.swimmingRelatedConditions.hypertension && (
                              <span className="inline-flex items-center px-2 py-1 rounded bg-pink-100 text-pink-800 text-xs">고혈압</span>
                            )}
                            {selectedMember.studentInfo.healthProfile.swimmingRelatedConditions.asthma && (
                              <span className="inline-flex items-center px-2 py-1 rounded bg-indigo-100 text-indigo-800 text-xs">천식</span>
                            )}
                            {selectedMember.studentInfo.healthProfile.swimmingRelatedConditions.other && 
                             selectedMember.studentInfo.healthProfile.swimmingRelatedConditions.other.length > 0 && (
                              selectedMember.studentInfo.healthProfile.swimmingRelatedConditions.other.map((item, idx) => (
                                <span key={idx} className="inline-flex items-center px-2 py-1 rounded bg-gray-100 text-gray-800 text-xs">{item}</span>
                              ))
                            )}
                            {!selectedMember.studentInfo.healthProfile.swimmingRelatedConditions.cardiovascular &&
                             !selectedMember.studentInfo.healthProfile.swimmingRelatedConditions.respiratory &&
                             !selectedMember.studentInfo.healthProfile.swimmingRelatedConditions.musculoskeletal &&
                             !selectedMember.studentInfo.healthProfile.swimmingRelatedConditions.diabetes &&
                             !selectedMember.studentInfo.healthProfile.swimmingRelatedConditions.hypertension &&
                             !selectedMember.studentInfo.healthProfile.swimmingRelatedConditions.asthma &&
                             (!selectedMember.studentInfo.healthProfile.swimmingRelatedConditions.other || 
                              selectedMember.studentInfo.healthProfile.swimmingRelatedConditions.other.length === 0) && (
                              <div className="text-sm text-gray-400">등록된 건강질환이 없습니다.</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p>건강 데이터가 없습니다.</p>
                      <p className="text-sm mt-2">데이터가 추가되면 인바디 차트 형태로 표시됩니다.</p>
                    </div>
                  )}
                </div>

                {/* 만성 질환 */}
                <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
                  <h4 className="text-lg font-semibold text-yellow-900 mb-4">만성 질환</h4>
                  <div className="text-center py-8 text-gray-500">
                    {selectedMember.studentInfo?.medicalConditions || '등록된 만성 질환이 없습니다.'}
                  </div>
                </div>

                {/* 응급 연락처 */}
                <div className="bg-red-50 rounded-lg p-6 border border-red-200">
                  <h4 className="text-lg font-semibold text-red-900 mb-4">응급 연락처</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-red-100">
                      <div className="text-xs text-gray-600 mb-1">이름</div>
                      <div className="text-lg font-semibold text-red-900">
                        {selectedMember.studentInfo?.emergencyContact || '-'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end mt-6 border-t pt-4">
                <button
                  onClick={() => setShowHealthModal(false)}
                  className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default withAuth(CenterMembersManagement);

