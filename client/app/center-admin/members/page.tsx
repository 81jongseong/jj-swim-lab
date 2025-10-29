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

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Users, UserPlus, Search, Filter, Eye, Edit, Calendar } from 'lucide-react';
import withAuth from '@/components/withAuth';
import apiClient from '@/utils/api';

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
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
  const [memoText, setMemoText] = useState('');

  useEffect(() => {
    if (user) {
      loadMembers();
      loadCourses();
    }
  }, [user]);

  const loadMembers = async () => {
    try {
      console.log('🔄 loadMembers 호출됨');
      setIsLoading(true);
      const response = await apiClient.get('/api/center-admin/members');
      
      console.log('📡 회원 목록 API 응답:', response);
      
      if (response.success && Array.isArray(response.data)) {
        console.log('✅ 회원 목록 업데이트:', response.data.length, '명');
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
      console.log('📚 과정 목록 로드 시작');
      const response = await apiClient.get('/api/center-admin/courses');
      
      console.log('📚 과정 목록 API 응답:', response);
      
      if (response.success && Array.isArray(response.data)) {
        console.log('📚 로드된 과정 목록:', response.data);
        setCourses(response.data as Course[]);
      } else {
        console.error('📚 과정 목록 로드 실패:', response.message);
      }
    } catch (error) {
      console.error('📚 과정 목록 로드 오류:', error);
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
      console.log('🔄 과정 배정 시작:', { memberId, courseId });
      const response = await apiClient.put(`/api/center-admin/members/${memberId}/course`, {
        courseId: courseId
      });
      
      console.log('📡 과정 배정 응답:', { success: response.success, message: response.message });
      console.log('✅ 과정 배정 성공:', response);
      
      if (response.success) {
        alert('과정 배정이 완료되었습니다.');
        console.log('🔄 loadMembers 호출 전');
        setShowAssignmentModal(false);
        // 즉시 목록 새로고침
        loadMembers();
        console.log('🔄 loadMembers 호출 후');
      } else {
        console.error('❌ 과정 배정 실패:', response);
        alert('과정 배정 실패: ' + response.message);
      }
    } catch (error) {
      console.error('❌ 과정 배정 오류:', error);
      alert('과정 배정 중 오류가 발생했습니다.');
    }
  };

  const handleUnassignCourse = async (memberId: string, courseId: string) => {
    if (!confirm('과정 배정을 취소하시겠습니까?')) {
      return;
    }

    try {
      console.log('🗑️ 과정 배정 취소 시작:', { memberId, courseId });
      const response = await apiClient.delete(`/api/center-admin/members/${memberId}/course/${courseId}`);
      
      if (response.success) {
        alert('과정 배정이 취소되었습니다.');
        loadMembers();
      } else {
        alert('과정 배정 취소 실패: ' + response.message);
      }
    } catch (error) {
      console.error('과정 배정 취소 오류:', error);
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
      console.error('메모 저장 오류:', error);
      alert('메모 저장 중 오류가 발생했습니다.');
    }
  };

  const openMemoModal = (member: Member) => {
    setSelectedMember(member);
    setMemoText(member.centerMemo || member.studentInfo?.centerMemo || '');
    setShowMemoModal(true);
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">전체 회원</p>
                <p className="text-2xl font-bold text-gray-900">{members.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <UserPlus className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">활성 회원</p>
                <p className="text-2xl font-bold text-gray-900">
                  {members.filter(m => m.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">과정 배정 회원</p>
                <p className="text-2xl font-bold text-gray-900">
                  {members.filter(m => m.assignedCourses && m.assignedCourses.length > 0).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">미배정 회원</p>
                <p className="text-2xl font-bold text-gray-900">
                  {members.filter(m => !m.assignedCourses || m.assignedCourses.length === 0).length}
                </p>
              </div>
            </div>
          </div>
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

        {/* 회원 목록 */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">회원 목록</h2>
            <p className="text-sm text-gray-600">총 {filteredMembers.length}명의 회원</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    회원 정보
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    배정된 과정
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    수강 이력
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    특이사항
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    등록일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    관리
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMembers.map((member) => (
                  <tr key={member._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{member.name}</div>
                        <div className="text-sm text-gray-500">{member.email}</div>
                        <div className="text-sm text-gray-500">{member.phone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(member.status)}`}>
                        {getStatusLabel(member.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {member.assignedCourses && member.assignedCourses.length > 0 ? (
                          <div className="space-y-1">
                            {member.assignedCourses.map((course, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {course.courseName}
                                </span>
                                <button
                                  onClick={() => handleUnassignCourse(member._id, course.courseId)}
                                  className="text-red-500 hover:text-red-700 text-xs"
                                  title="배정 취소"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">미배정</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div>완료 수업: {member.totalLessonsCompleted}회</div>
                        {member.lastLessonDate && (
                          <div className="text-xs text-gray-500">
                            최근 수업: {new Date(member.lastLessonDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs">
                        {member.centerMemo || member.studentInfo?.centerMemo ? (
                          <div className="truncate">
                            {(member.centerMemo || member.studentInfo?.centerMemo)?.substring(0, 50)}
                            {(member.centerMemo || member.studentInfo?.centerMemo)?.length > 50 && '...'}
                          </div>
                        ) : (
                          <span className="text-gray-400">메모 없음</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(member.enrollmentDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedMember(member);
                            setShowDetailModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 flex items-center"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          상세
                        </button>
                        <button
                          onClick={() => {
                            setSelectedMember(member);
                            setShowAssignmentModal(true);
                          }}
                          className="text-green-600 hover:text-green-900 flex items-center"
                        >
                          <UserPlus className="w-4 h-4 mr-1" />
                          배정
                        </button>
                        <button
                          onClick={() => openMemoModal(member)}
                          className="text-purple-600 hover:text-purple-900 flex items-center"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          메모
                        </button>
                        <button
                          onClick={() => {
                            setSelectedMember(member);
                            setShowMemoHistoryModal(true);
                          }}
                          className="text-orange-600 hover:text-orange-900 flex items-center"
                        >
                          <Calendar className="w-4 h-4 mr-1" />
                          이력
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                  console.log('📚 전체 과정 목록:', courses);
                  console.log('📚 배정 가능한 과정 목록:', availableCourses);
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
      </div>
    </div>
  );
}

export default withAuth(CenterMembersManagement);

