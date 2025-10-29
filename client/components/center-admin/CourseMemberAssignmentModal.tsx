/**
 * 강습 과정 회원 배정 모달 컴포넌트
 * 연동되는 데이터: Course, User (students), enrolledStudents
 * 연동되는 파일: courses/page.tsx, center-admin.ts (API)
 */

import React, { useState, useEffect } from 'react';
import { X, Users, CheckCircle, AlertCircle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Member {
  _id: string;
  name: string;
  email: string;
  phone: string;
  userType: string;
  currentLevel?: string;
  studentInfo?: {
    currentLevel?: string;
    level?: string;
    centerId?: string;
  };
  isEnrolledInSpecificCourse?: boolean;
}

interface Course {
  _id: string;
  name: string;
  level: string;
  maxStudents: number;
  currentStudents: number;
  enrolledStudents: any[];
  isPersonalLesson?: boolean;
}

interface CourseMemberAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course | null;
  onAssignMembers: (memberIds: string[]) => Promise<void>;
}

export default function CourseMemberAssignmentModal({
  isOpen,
  onClose,
  course,
  onAssignMembers
}: CourseMemberAssignmentModalProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);

  // 회원 목록 로드
  const loadMembers = async () => {
    if (!course) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/center-admin/members?courseId=${course._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📊 회원 목록 API 응답:', data);
        console.log('📊 API 응답 구조:', {
          success: data.success,
          message: data.message,
          dataKeys: Object.keys(data.data || {}),
          usersLength: data.data?.users?.length || 0
        });
        
        // API 응답에서 회원 목록 추출 - data.data가 배열
        const allMembers = Array.isArray(data.data) ? data.data : [];
        console.log('📊 추출된 회원 목록:', allMembers);
        console.log('📊 API 응답 구조:', {
          success: data.success,
          data: data.data,
          usersLength: allMembers.length
        });
        
        // 만약 data.data가 배열이라면 직접 사용
        if (Array.isArray(data.data) && data.data.length > 0) {
          console.log('📊 data.data가 배열입니다. 직접 사용합니다.');
          const allMembersFromArray = data.data;
          console.log('📊 배열에서 추출된 회원 목록:', allMembersFromArray);
          
          // 첫 번째 회원의 모든 필드 확인
          if (allMembersFromArray.length > 0) {
            console.log('🔍 첫 번째 회원의 모든 필드:', Object.keys(allMembersFromArray[0]));
            console.log('🔍 첫 번째 회원의 studentInfo:', allMembersFromArray[0].studentInfo);
            console.log('🔍 첫 번째 회원의 level 필드:', allMembersFromArray[0].level);
            console.log('🔍 첫 번째 회원의 currentLevel 필드:', allMembersFromArray[0].currentLevel);
          }
          
          // 학생 회원만 필터링하고 실제 레벨 정보 사용
          const studentMembersFromArray = allMembersFromArray.filter((member: Member) => 
            member.userType === 'student'
          ).map((member: Member) => {
            return {
              ...member,
              currentLevel: member.currentLevel || member.studentInfo?.level || '레벨 미설정'
            };
          });
          
          console.log('👥 배열에서 학생 회원 목록:', studentMembersFromArray.length, '명');
          if (studentMembersFromArray.length > 0) {
            console.log('📊 첫 번째 회원:', studentMembersFromArray[0].name, '레벨:', studentMembersFromArray[0].currentLevel);
          }
          
          setMembers(studentMembersFromArray);
          return;
        }
        
        // 만약 data.data가 배열이라면
        if (Array.isArray(data.data)) {
          console.log('📊 data.data가 배열입니다. 사용합니다.');
          const allMembersFromUsers = data.data;
          console.log('📊 users에서 추출된 회원 목록:', allMembersFromUsers);
          
          // 학생 회원만 필터링하고 실제 레벨 정보 사용
          const studentMembersFromUsers = allMembersFromUsers.filter((member: Member) => 
            member.userType === 'student'
          ).map((member: Member) => {
            return {
              ...member,
              currentLevel: member.currentLevel || member.studentInfo?.level || '레벨 미설정'
            };
          });
          
          console.log('👥 users에서 학생 회원 목록:', studentMembersFromUsers.length, '명');
          if (studentMembersFromUsers.length > 0) {
            console.log('📊 첫 번째 회원:', studentMembersFromUsers[0].name, '레벨:', studentMembersFromUsers[0].currentLevel);
          }
          
          setMembers(studentMembersFromUsers);
          return;
        }
        
        // 학생 회원만 필터링하고 실제 레벨 정보 사용
        const studentMembers = allMembers.filter((member: Member) => 
          member.userType === 'student'
        ).map((member: Member) => {
          return {
            ...member,
            currentLevel: member.studentInfo?.level || member.currentLevel || '레벨 미설정'
          };
        });
        
        console.log('👥 학생 회원 목록:', studentMembers.length, '명');
        if (studentMembers.length > 0) {
          console.log('📊 첫 번째 회원:', studentMembers[0].name, '레벨:', studentMembers[0].currentLevel);
        }
               
        setMembers(studentMembers);
      } else {
        const errorData = await response.json();
        console.error('❌ 회원 목록 로드 실패:', errorData);
        alert(`회원 목록 로드에 실패했습니다: ${errorData.message}`);
      }
    } catch (error) {
      console.error('회원 목록 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  // 이미 배정된 회원 필터링
  const availableMembers = members.filter(member => 
    !course?.enrolledStudents?.some(enrollment => 
      enrollment.student?.toString() === member._id
    )
  );

  // 체크박스 토글
  const toggleMemberSelection = (memberId: string) => {
    console.log('🔄 회원 선택 토글:', memberId);
    console.log('🔄 현재 선택된 회원들:', selectedMembers);
    
    setSelectedMembers(prev => {
      // 이미 선택된 경우 해제
      if (prev.includes(memberId)) {
        return prev.filter(id => id !== memberId);
      }
      
      // 개인레슨인 경우 최대 인원 체크
      if (course.isPersonalLesson) {
        const willExceed = prev.length + 1 > course.maxStudents;
        if (willExceed) {
          alert(`❌ 최대 인원을 초과할 수 없습니다.\n현재 선택: ${prev.length + 1}명 / 최대 인원: ${course.maxStudents}명`);
          return prev;
        }
      }
      
      // 새로 선택
      const newSelection = [...prev, memberId];
      console.log('🔄 새로운 선택된 회원들:', newSelection);
      return newSelection;
    });
  };

  // 전체 선택/해제
  const toggleAllMembers = () => {
    const availableMembers = filteredMembers.filter(member => !member.isEnrolledInSpecificCourse);
    
    // 개인레슨인 경우 최대 인원 체크
    if (course.isPersonalLesson && availableMembers.length > course.maxStudents) {
      alert(`❌ 최대 인원을 초과할 수 없습니다.\n선택 가능한 회원: ${availableMembers.length}명 / 최대 인원: ${course.maxStudents}명\n가능한 회원 ${course.maxStudents}명만 선택됩니다.`);
      // 최대 인원만큼만 선택
      setSelectedMembers(availableMembers.slice(0, course.maxStudents).map(member => member._id));
      return;
    }
    
    if (selectedMembers.length === availableMembers.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(availableMembers.map(member => member._id));
    }
  };

  // 회원 배정 실행
  const handleAssignMembers = async () => {
    if (selectedMembers.length === 0) {
      alert('배정할 회원을 선택해주세요.');
      return;
    }

    // 개인레슨인 경우 최대 인원 체크
    if (course.isPersonalLesson) {
      const willExceed = course.currentStudents + selectedMembers.length > course.maxStudents;
      if (willExceed) {
        alert(`❌ 최대 인원을 초과할 수 없습니다.\n현재 인원: ${course.currentStudents}명\n선택한 회원: ${selectedMembers.length}명\n최대 인원: ${course.maxStudents}명\n배정 후 인원: ${course.currentStudents + selectedMembers.length}명`);
        return;
      }
    }

    setAssigning(true);
    try {
      await onAssignMembers(selectedMembers);
      setSelectedMembers([]);
      onClose();
    } catch (error) {
      console.error('회원 배정 오류:', error);
    } finally {
      setAssigning(false);
    }
  };

  // 검색어에 따른 회원 필터링
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredMembers(members);
    } else {
      const filtered = members.filter(member => 
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.phone?.includes(searchTerm) ||
        member.currentLevel?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredMembers(filtered);
    }
  }, [members, searchTerm]);

  useEffect(() => {
    if (isOpen && course) {
      console.log('📋 모달 열림 - 강습 과정:', course.name);
      console.log('📋 선택된 회원 초기화');
      setSelectedMembers([]);
      setSearchTerm(''); // 검색어 초기화
      loadMembers();
    }
  }, [isOpen, course]);

  if (!isOpen || !course) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold flex items-center">
            <Users className="w-5 h-5 mr-2" />
            {course.name} - 회원 배정
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-800">
                <strong>과정 정보:</strong> {course.name} ({course.level})
              </p>
              <p className="text-sm text-blue-600">
                정원: {course.currentStudents}/{course.maxStudents}명
              </p>
            </div>
            <div className="text-sm text-blue-600">
              선택된 회원: {selectedMembers.length}명
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* 검색 입력 필드 */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="회원명, 이메일, 전화번호, 레벨로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-10"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    title="검색어 초기화"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              {searchTerm && (
                <p className="text-sm text-gray-600 mt-1">
                  "{searchTerm}" 검색 결과: {filteredMembers.length}명
                </p>
              )}
            </div>

            <div className="mb-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                배정 가능한 회원 목록 
                <span className="text-sm font-normal text-gray-600 ml-2">
                  ({filteredMembers.length}명)
                </span>
              </h3>
              <Button
                onClick={toggleAllMembers}
                variant="outline"
                size="sm"
              >
                {selectedMembers.length === filteredMembers.length ? '전체 해제' : '전체 선택'}
              </Button>
            </div>

            <div className="overflow-y-auto max-h-[50vh] border rounded-lg">
              {filteredMembers.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  {searchTerm ? (
                    <>
                      <p>검색 결과가 없습니다.</p>
                      <p className="text-sm">"{searchTerm}"에 해당하는 회원이 없습니다.</p>
                      <p className="text-xs mt-2">다른 검색어를 시도해보세요.</p>
                    </>
                  ) : (
                    <>
                      <p>배정 가능한 회원이 없습니다.</p>
                      <p className="text-sm">모든 회원이 이미 배정되었거나 정원이 가득 찼습니다.</p>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-2 p-4">
                  {filteredMembers.map((member) => {
                    const isSelected = selectedMembers.includes(member._id);
                    const isAlreadyEnrolled = member.isEnrolledInSpecificCourse;
                    console.log(`📋 회원 ${member.name} 렌더링 - 선택됨: ${isSelected}, 이미 배정됨: ${isAlreadyEnrolled}`);
                    
                    return (
                    <div
                      key={member._id}
                      className={`flex items-center p-3 border rounded-lg transition-colors ${
                        isAlreadyEnrolled
                          ? 'bg-gray-100 border-gray-300 opacity-75'
                          : isSelected
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={isAlreadyEnrolled}
                        onChange={(e) => {
                          e.stopPropagation();
                          console.log('🔘 체크박스 클릭:', member.name, member._id);
                          toggleMemberSelection(member._id);
                        }}
                        className={`mr-3 h-4 w-4 text-blue-600 ${
                          isAlreadyEnrolled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                        }`}
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className={`font-medium ${isAlreadyEnrolled ? 'text-gray-500' : ''}`}>
                              {member.name}
                              {isAlreadyEnrolled && <span className="ml-2 text-xs text-gray-500">(이미 배정됨)</span>}
                            </p>
                            <p className="text-sm text-gray-500">{member.email}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">{member.phone}</p>
                            <p className="text-xs text-blue-600">
                              {member.currentLevel || '레벨 미설정'}
                            </p>
                          </div>
                        </div>
                      </div>
                      {isSelected && !isAlreadyEnrolled && (
                        <CheckCircle className="w-5 h-5 text-blue-600 ml-2" />
                      )}
                      {isAlreadyEnrolled && (
                        <div className="w-5 h-5 ml-2 flex items-center justify-center">
                          <span className="text-xs text-gray-500">✓</span>
                        </div>
                      )}
                    </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
        </div>

        <div className="flex justify-end gap-2 mt-6 flex-shrink-0">
          <Button
            onClick={onClose}
            variant="outline"
            disabled={assigning}
          >
            취소
          </Button>
          <Button
            onClick={handleAssignMembers}
            disabled={selectedMembers.length === 0 || assigning}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {assigning ? '배정 중...' : `${selectedMembers.length}명 배정`}
          </Button>
        </div>
      </div>
    </div>
  );
}
