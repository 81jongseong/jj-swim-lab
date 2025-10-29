/**
 * PT 수업 진행 및 완료 관리 컴포넌트
 * 헬스 PT 관리 시스템 스타일로 수업 진행 상황을 관리합니다.
 * 
 * 연동 데이터: 수업 일정, 수강생 정보, 패키지 정보, 수업 진행 기록
 * 연동 파일: InstructorStudentManagement.tsx, PersonalLesson.ts, CenterSchedule.ts
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  XCircle,
  MapPin,
  UserCheck
} from 'lucide-react';

interface Lesson {
  _id: string;
  courseId: string;
  courseName: string;
  studentId: string;
  studentName: string;
  studentPhone: string;
  instructorId: string;
  scheduledDates: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  lessonType: 'freestyle' | 'backstroke' | 'breaststroke' | 'butterfly' | 'private' | 'group';
  level: string;
  poolType: 'mainPool' | 'kidsPool' | 'auxiliaryPool';
  laneNumber: string;
  isPersonalLesson?: boolean;
}

interface CourseGroup {
  _id: string;
  courseId: string;
  courseName: string;
  level: string;
  startTime: string;
  endTime: string;
  scheduledDates: string;
  poolType: 'mainPool' | 'kidsPool' | 'auxiliaryPool';
  laneNumber: string;
  lessonType: 'private' | 'group';
  isPersonalLesson: boolean;
  studentCount: number;
  students: Array<{
    studentId: string;
    studentName: string;
  }>;
  instructorId?: string;
  instructorActive?: boolean;
}

interface PTLessonProgressProps {
  instructorId: string;
  selectedDate: string;
  onClose: () => void;
  onBack?: () => void;
}

interface Instructor {
  _id: string;
  name: string;
  isActive?: boolean;
}

interface StudentProgress {
  studentId: string;
  studentName: string;
  progress: number;
}

export default function PTLessonProgress({ 
  instructorId, 
  selectedDate,
  onClose,
  onBack
}: PTLessonProgressProps) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<CourseGroup | null>(null);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [editForm, setEditForm] = useState({
    courseName: '',
    instructorId: '',
    studentProgress: [] as StudentProgress[]
  });
  const [originalInstructorId, setOriginalInstructorId] = useState('');
  const [originalCourseName, setOriginalCourseName] = useState('');
  const [showBulkChangeModal, setShowBulkChangeModal] = useState(false);
  const [bulkChangeForm, setBulkChangeForm] = useState({
    oldInstructorId: '',
    newInstructorId: ''
  });

  // 수업 데이터를 과정별로 그룹화
  const courseGroups = useMemo(() => {
    const groups = new Map<string, CourseGroup>();
    
    lessons.forEach(lesson => {
      const key = lesson.courseId || lesson._id;
      
      if (!groups.has(key)) {
        const instructorId = lesson.instructorId?.toString?.() || lesson.instructorId || '';
        const instructor = instructors.find(i => i._id === instructorId);
        const instructorActive = instructor ? (instructor.isActive !== false) : true;
        
        groups.set(key, {
          _id: key,
          courseId: lesson.courseId || lesson._id,
          courseName: lesson.courseName || '수업',
          level: lesson.level,
          startTime: lesson.startTime,
          endTime: lesson.endTime,
          scheduledDates: lesson.scheduledDates || '',
          poolType: lesson.poolType,
          laneNumber: lesson.laneNumber || '',
          lessonType: lesson.isPersonalLesson ? 'private' : 'group',
          isPersonalLesson: lesson.isPersonalLesson || false,
          studentCount: 0,
          students: [],
          instructorId,
          instructorActive
        });
      }
      
      const group = groups.get(key)!;
      group.students.push({
        studentId: lesson.studentId,
        studentName: lesson.studentName
      });
      group.studentCount++;
    });
    
    return Array.from(groups.values());
  }, [lessons, instructors]);

  useEffect(() => {
    fetchLessons();
    fetchInstructors();
  }, [instructorId, selectedDate]);

  const fetchInstructors = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/center-admin/instructors', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      console.log('강사 목록 API 응답:', data);
      
      if (data.success && data.data) {
        // API 응답 구조: { success: true, data: { instructors: [...], pagination: {...} } }
        const instructorsList = data.data.instructors || data.data;
        if (Array.isArray(instructorsList)) {
          setInstructors(instructorsList);
        } else if (Array.isArray(data.data)) {
          setInstructors(data.data);
        } else {
          setInstructors([]);
        }
      }
    } catch (error) {
      console.error('강사 목록 조회 실패:', error);
      setInstructors([]);
    }
  };

  const fetchLessons = async () => {
    try {
      setLoading(true);
      console.log('📅 수업 일정 조회 요청:', { instructorId, selectedDate });
      
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/center-admin/instructors/${instructorId}/lessons?date=${selectedDate}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      console.log('📅 수업 일정 조회 응답:', data);
      
      if (data.success) {
        console.log('✅ 수업 일정 설정:', data.data.length, '개');
        setLessons(data.data);
      } else {
        console.error('❌ 수업 일정 조회 실패:', data.message);
      }
    } catch (error) {
      console.error('❌ 수업 데이터 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeSlot = (time: string) => {
    const [hour, minute] = time.split(':');
    return `${hour}:${minute}`;
  };

  const getPoolName = (poolType: string) => {
    const poolNames: { [key: string]: string } = {
      mainPool: '메인풀',
      kidsPool: '유아풀',
      auxiliaryPool: '보조풀'
    };
    return poolNames[poolType] || '메인풀';
  };

  const getLevelColor = (level: string, instructorActive?: boolean) => {
    // 비활성 강사가 담당하는 반은 회색으로 표시
    if (instructorActive === false) {
      return 'bg-gray-200 text-gray-600 border-gray-400';
    }
    
    const colors: { [key: string]: string } = {
      '초급': 'bg-green-100 text-green-800 border-green-300',
      '중급': 'bg-blue-100 text-blue-800 border-blue-300',
      '고급': 'bg-purple-100 text-purple-800 border-purple-300',
      '전문가': 'bg-orange-100 text-orange-800 border-orange-300',
      '마스터': 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[level] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const handleCourseClick = async (e: React.MouseEvent | React.KeyboardEvent, course: CourseGroup) => {
    console.log('카드 클릭됨:', course);
    setSelectedCourse(course);
    
    // 과정 상세 정보 조회
    try {
      const token = localStorage.getItem('token');
      console.log('과정 정보 조회:', course.courseId);
      const response = await fetch(`http://localhost:5000/api/courses/${course.courseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      console.log('과정 정보 응답:', data);
      
      const courseData = data.success ? data.data : data;
      if (courseData) {
        const currentInstructorId = courseData.instructorId?.toString?.() || courseData.instructorId || '';
        const currentCourseName = courseData.name || course.courseName;
        
        // 강사 정보 확인 및 courseGroups 업데이트
        const instructor = instructors.find(i => i._id === currentInstructorId);
        const instructorActive = instructor?.isActive !== false;
        
        // 선택된 course의 instructor 정보 업데이트
        const updatedCourse = {
          ...course,
          instructorId: currentInstructorId,
          instructorActive
        };
        setSelectedCourse(updatedCourse);
        
        console.log('수정 폼 설정:', {
          courseName: currentCourseName,
          instructorId: currentInstructorId,
          instructorActive
        });
        
        setEditForm({
          courseName: currentCourseName,
          instructorId: currentInstructorId,
          studentProgress: [] // 학생 진도는 필요 없으므로 빈 배열
        });
        setOriginalInstructorId(currentInstructorId);
        setOriginalCourseName(currentCourseName);
        setShowEditModal(true);
      } else {
        console.error('과정 정보를 찾을 수 없습니다.');
        alert('과정 정보를 불러올 수 없습니다.');
      }
    } catch (error) {
      console.error('과정 정보 조회 실패:', error);
    }
  };

  const handleSaveChanges = async () => {
    if (!selectedCourse) return;
    
    try {
      const token = localStorage.getItem('token');
      
      // 1. 과정 이름 및 담당 강사 업데이트
      const updateData: any = {};
      if (editForm.courseName !== originalCourseName) {
        updateData.name = editForm.courseName;
      }
      if (editForm.instructorId && editForm.instructorId !== originalInstructorId) {
        updateData.instructorId = editForm.instructorId;
      }
      
      if (Object.keys(updateData).length > 0) {
        const response = await fetch(`http://localhost:5000/api/courses/${selectedCourse.courseId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updateData)
        });
        
        if (!response.ok) {
          throw new Error('과정 정보 업데이트 실패');
        }
      }
      
      // 데이터 새로고침
      await fetchLessons();
      setShowEditModal(false);
      alert('변경사항이 저장되었습니다.');
    } catch (error) {
      console.error('변경사항 저장 실패:', error);
      alert('변경사항 저장에 실패했습니다.');
    }
  };

  const handleBulkChange = async () => {
    if (!bulkChangeForm.oldInstructorId || !bulkChangeForm.newInstructorId) {
      alert('기존 강사와 새 강사를 모두 선택해주세요.');
      return;
    }

    if (bulkChangeForm.oldInstructorId === bulkChangeForm.newInstructorId) {
      alert('기존 강사와 새 강사가 동일합니다.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const coursesToUpdate = courseGroups.filter(
        course => course.instructorId === bulkChangeForm.oldInstructorId
      );

      if (coursesToUpdate.length === 0) {
        alert('변경할 반이 없습니다.');
        setShowBulkChangeModal(false);
        return;
      }

      const confirmed = confirm(
        `${instructors.find(i => i._id === bulkChangeForm.oldInstructorId)?.name} 강사가 담당하는 ${coursesToUpdate.length}개의 반을 ${instructors.find(i => i._id === bulkChangeForm.newInstructorId)?.name} 강사로 변경하시겠습니까?`
      );

      if (!confirmed) return;

      let successCount = 0;
      let failCount = 0;

      for (const course of coursesToUpdate) {
        try {
          const response = await fetch(`http://localhost:5000/api/courses/${course.courseId}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              instructorId: bulkChangeForm.newInstructorId
            })
          });

          if (response.ok) {
            successCount++;
          } else {
            failCount++;
          }
        } catch (error) {
          console.error(`반 ${course.courseName} 변경 실패:`, error);
          failCount++;
        }
      }

      alert(`변경 완료: ${successCount}개 성공, ${failCount}개 실패`);
      setShowBulkChangeModal(false);
      setBulkChangeForm({ oldInstructorId: '', newInstructorId: '' });
      await fetchLessons();
    } catch (error) {
      console.error('일괄 변경 실패:', error);
      alert('일괄 변경에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-center mt-4 text-gray-600">수업 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* 헤더 */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                PT 수업 관리 - {selectedDate.replace(/-/g, '.')}
              </h2>
              <p className="text-sm text-gray-600">
                총 {courseGroups.length}개의 수업 과정
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setShowBulkChangeModal(true); setBulkChangeForm({ oldInstructorId: instructorId, newInstructorId: '' }); }}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-2"
                title="강사 일괄 변경"
              >
                <UserCheck className="w-4 h-4" />
                강사 일괄 변경
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* 수업 목록 */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courseGroups.map((course) => (
              <div 
                key={course._id} 
                onClick={(e) => {
                  console.log('카드 클릭 이벤트 발생');
                  handleCourseClick(e, course);
                }}
                className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border-2 ${getLevelColor(course.level, course.instructorActive).split(' ')[0]} overflow-hidden cursor-pointer select-none ${course.instructorActive === false ? 'opacity-60' : ''}`}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCourseClick(e as any, course);
                  }
                }}
              >
                {/* 헤더 */}
                <div className={`p-4 ${getLevelColor(course.level, course.instructorActive)} border-b-2 pointer-events-none`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold mb-1">{course.courseName}</h3>
                      <p className="text-sm opacity-80">{course.level}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          course.isPersonalLesson ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {course.isPersonalLesson ? '개인레슨' : '단체반'}
                        </span>
                        {course.instructorActive === false && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-300 text-gray-700">
                            강사 미배정
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 본문 */}
                <div className="p-4 space-y-3 pointer-events-none">
                  {/* 시간 정보 */}
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span>{getTimeSlot(course.startTime)} - {getTimeSlot(course.endTime)}</span>
                  </div>

                  {/* 요일 정보 */}
                  {course.scheduledDates && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span>{course.scheduledDates}</span>
                    </div>
                  )}

                  {/* 장소 정보 */}
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span>{getPoolName(course.poolType)} {course.laneNumber ? `레인 ${course.laneNumber}` : ''}</span>
                  </div>

                  {/* 학생 수 정보 */}
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span>수강생 {course.studentCount}명</span>
                  </div>

                  {/* 학생 목록 (간략) */}
                  {course.students.length > 0 && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-gray-500 mb-1">수강생:</p>
                      <div className="flex flex-wrap gap-1">
                        {course.students.slice(0, 5).map((student) => (
                          <span key={student.studentId} className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700 pointer-events-none">
                            {student.studentName}
                          </span>
                        ))}
                        {course.students.length > 5 && (
                          <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-500 pointer-events-none">
                            +{course.students.length - 5}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {courseGroups.length === 0 && (
              <div className="col-span-2 text-center py-12">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">해당 날짜에 예정된 수업이 없습니다.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 수정 모달 */}
      {showEditModal && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">수업 정보 수정</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* 반 이름 변경 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  반 이름
                </label>
                <input
                  type="text"
                  value={editForm.courseName}
                  onChange={(e) => setEditForm(prev => ({ ...prev, courseName: e.target.value }))}
                  className="w-full border rounded-lg p-3"
                  placeholder="반 이름을 입력하세요"
                />
              </div>

              {/* 담당 강사 변경 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  담당 강사
                </label>
                <select
                  value={editForm.instructorId}
                  onChange={(e) => setEditForm(prev => ({ ...prev, instructorId: e.target.value }))}
                  className="w-full border rounded-lg p-3"
                >
                  <option value="">강사 선택</option>
                  {instructors.map((instructor) => (
                    <option key={instructor._id} value={instructor._id}>
                      {instructor.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 버튼 */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  onClick={handleSaveChanges}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 일괄 변경 모달 */}
      {showBulkChangeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">강사 일괄 변경</h3>
                <button
                  onClick={() => {
                    setShowBulkChangeModal(false);
                    setBulkChangeForm({ oldInstructorId: '', newInstructorId: '' });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  기존 강사
                </label>
                <select
                  value={bulkChangeForm.oldInstructorId}
                  onChange={(e) => setBulkChangeForm(prev => ({ ...prev, oldInstructorId: e.target.value }))}
                  className="w-full border rounded-lg p-3"
                >
                  <option value="">기존 강사 선택</option>
                  {instructors.map((instructor) => (
                    <option key={instructor._id} value={instructor._id}>
                      {instructor.name} {instructor.isActive === false ? '(비활성)' : ''}
                    </option>
                  ))}
                </select>
                {bulkChangeForm.oldInstructorId && (
                  <p className="text-xs text-gray-500 mt-1">
                    {courseGroups.filter(c => c.instructorId === bulkChangeForm.oldInstructorId).length}개의 반이 변경됩니다.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  새 강사
                </label>
                <select
                  value={bulkChangeForm.newInstructorId}
                  onChange={(e) => setBulkChangeForm(prev => ({ ...prev, newInstructorId: e.target.value }))}
                  className="w-full border rounded-lg p-3"
                >
                  <option value="">새 강사 선택</option>
                  {instructors
                    .filter(i => i.isActive !== false)
                    .map((instructor) => (
                      <option key={instructor._id} value={instructor._id}>
                        {instructor.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setShowBulkChangeModal(false);
                    setBulkChangeForm({ oldInstructorId: '', newInstructorId: '' });
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  onClick={handleBulkChange}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  일괄 변경
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
