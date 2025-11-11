/**
 * 🏊‍♂️ JJ Swim Lab - 강사 강의 관리 페이지
 * 
 * 📋 **페이지 목적**
 * - 강사가 담당한 강의 목록을 조회하고 상세 정보 확인
 * - MongoDB와 실시간 연동
 * 
 * 🗄️ **데이터 연동**
 * - GET /api/instructor/courses - 강사별 강의 목록 조회 (MongoDB)
 * 
 * 🔄 **연동 컴포넌트**
 * - client/components/center-admin/CourseDetailModal.tsx
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. API 응답 데이터를 Course 타입으로 변환 필요
 * 2. 인증 토큰 필요 (localStorage 'token')
 * 3. 에러 처리 및 사용자 피드백 필수
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { BookOpen, Users, Calendar, Star, Eye, Search, List } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import withAuth from '@/components/withAuth';
import CourseDetailModal from '@/components/center-admin/CourseDetailModal';
import WeeklyCalendar from '@/components/center-admin/WeeklyCalendar';

interface InstructorCourse {
  _id: string;
  name: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  duration: number;
  maxStudents: number;
  price: number;
  instructorId: string;
  instructorName: string;
  schedule: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }>;
  enrolledStudents: number;
  rating: number;
  status: 'active' | 'inactive' | 'draft';
  isPersonalLesson?: boolean; // ⭐ 개인레슨 여부
  courseType?: 'group' | 'personal' | 'freeSwim'; // ⭐ 강의 타입
  createdAt: Date;
  updatedAt: Date;
}

function InstructorCoursesManagement() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<InstructorCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailCourse, setDetailCourse] = useState<InstructorCourse | null>(null);

  useEffect(() => {
    if (user) {
      loadCourses();
    }
  }, [user]);

  const loadCourses = async () => {
    try {
      setIsLoading(true);
      
      if (!user || !user._id) {
        console.error('사용자 정보가 없습니다.');
        setCourses([]);
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        console.error('토큰이 없습니다.');
        setCourses([]);
        return;
      }

      const response = await fetch(`http://localhost:5000/api/instructor/courses`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`강의 목록 조회 실패: ${response.status}`);
      }

      const result = await response.json();
      console.log('📚 강사 강의 목록 API 응답:', result);

      if (result.success && result.data) {
        const coursesData: InstructorCourse[] = result.data.map((course: any) => {
          const dayMap: { [key: string]: number } = {
            'monday': 1,
            'tuesday': 2,
            'wednesday': 3,
            'thursday': 4,
            'friday': 5,
            'saturday': 6,
            'sunday': 7
          };

          let schedule: { dayOfWeek: number; startTime: string; endTime: string }[] = [];
          if (course.schedule && Array.isArray(course.schedule) && course.schedule.length > 0) {
            schedule = course.schedule.map((sch: any) => {
              // 서버에서 day 필드로 오는 경우 (영어: 'monday', 'tuesday' 등)
              const dayEnglish = (sch.day || sch.dayOfWeek || '').toLowerCase();
              const dayNumber = dayMap[dayEnglish] || 1;
              const startTime = sch.startTime || '09:00';
              const endTime = sch.endTime || '10:00';
              
              return {
                dayOfWeek: dayNumber,
                startTime,
                endTime
              };
            });
          }
          
          console.log('📅 강의 schedule 변환:', {
            courseName: course.name,
            originalSchedule: course.schedule,
            convertedSchedule: schedule
          });

          return {
            _id: course.id || course._id?.toString() || '',
            name: course.name || '제목 없음',
            description: course.description || '',
            level: course.level || 'beginner',
            category: course.category || '자유형',
            duration: course.duration || 60,
            maxStudents: course.maxStudents || 10,
            price: course.price || 0,
            instructorId: user._id || user.id || '',
            instructorName: user.name || '강사',
            schedule,
            enrolledStudents: course.currentStudents || 0,
            enrolledStudentsList: course.enrolledStudents || [], // ⭐ 실제 수강생 목록 (DB 데이터)
            tags: course.tags || [], // ⭐ 실제 태그 정보 (DB 데이터)
            rating: course.rating || 0,
            status: course.status || 'active',
            isPersonalLesson: course.isPersonalLesson || false, // ⭐ 개인레슨 여부 추가
            courseType: course.courseType || 'group', // ⭐ 강의 타입 추가 (group, personal, freeSwim)
            createdAt: course.createdAt ? new Date(course.createdAt) : new Date(),
            updatedAt: course.updatedAt ? new Date(course.updatedAt) : new Date()
          };
        });

        setCourses(coursesData);
        console.log('✅ 강의 목록 로드 완료:', coursesData.length, '개');
      } else {
        console.warn('강의 데이터가 없습니다.');
        setCourses([]);
      }
    } catch (error) {
      console.error('강의 목록 로드 실패:', error);
      setCourses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = levelFilter === '' || course.level === levelFilter;
    const matchesStatus = statusFilter === '' || course.status === statusFilter;
    return matchesSearch && matchesLevel && matchesStatus;
  });

  const getLevelLabel = (level: string) => {
    const levels: { [key: string]: string } = {
      'beginner': '초급',
      'intermediate': '중급',
      'advanced': '고급'
    };
    return levels[level] || level;
  };

  const getLevelColor = (level: string) => {
    const colors: { [key: string]: string } = {
      'beginner': 'bg-green-100 text-green-800',
      'intermediate': 'bg-yellow-100 text-yellow-800',
      'advanced': 'bg-red-100 text-red-800'
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const statuses: { [key: string]: string } = {
      'active': '활성',
      'inactive': '비활성',
      'draft': '임시저장'
    };
    return statuses[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'active': 'bg-green-100 text-green-800',
      'inactive': 'bg-red-100 text-red-800',
      'draft': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getDayOfWeekLabel = (dayOfWeek: number) => {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const index = dayOfWeek >= 1 && dayOfWeek <= 7 ? dayOfWeek : 0;
    return days[index] || '일';
  };

  const handleViewDetail = (course: InstructorCourse) => {
    setDetailCourse(course);
    setShowDetailModal(true);
  };

  const convertCourseForDetail = (course: InstructorCourse): any => {
    const dayMap: { [key: number]: string } = {
      1: '월',
      2: '화',
      3: '수',
      4: '목',
      5: '금',
      6: '토',
      7: '일'
    };

    // ⭐ 실제 DB 데이터 사용
    const enrolledStudentsList = (course as any).enrolledStudentsList || [];
    const tags = (course as any).tags || [];

    return {
      _id: course._id,
      name: course.name,
      description: course.description,
      level: course.level,
      duration: course.duration,
      maxStudents: course.maxStudents,
      currentStudents: course.enrolledStudents,
      instructorId: course.instructorId,
      instructorName: course.instructorName,
      price: course.price,
      schedule: course.schedule.map(sch => ({
        dayOfWeek: dayMap[sch.dayOfWeek] || '',
        startTime: sch.startTime,
        endTime: sch.endTime
      })),
      status: course.status,
      createdAt: course.createdAt,
      tags: tags.length > 0 ? tags : [course.category], // ⭐ DB 태그 사용, 없으면 category 사용
      enrolledStudents: enrolledStudentsList.length > 0 
        ? enrolledStudentsList // ⭐ 실제 DB 수강생 목록 사용
        : Array.from({ length: course.enrolledStudents }, (_, i) => ({
            studentId: `student-${i}`,
            studentName: `학생 ${i + 1}`,
            status: 'active' as const
          }))
    };
  };

  const getLevelName = (level: string) => {
    const levels: { [key: string]: string } = {
      'beginner': '초급',
      'intermediate': '중급',
      'advanced': '고급'
    };
    return levels[level] || level;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">강의 목록을 불러오는 중...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card className="border border-gray-200">
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-3xl font-bold text-gray-900">강의 관리</CardTitle>
            <p className="text-gray-600 mt-2">강의 목록을 확인하고 관리하세요.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${viewMode === 'calendar' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-300 hover:bg-gray-50'}`}
            >
              <Calendar className="w-4 h-4" />
              캘린더 뷰
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${viewMode === 'list' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-300 hover:bg-gray-50'}`}
            >
              <List className="w-4 h-4" />
              리스트 뷰
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <BookOpen className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">총 강의</p>
                  <p className="text-2xl font-bold text-gray-900">{courses.length}개</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">총 수강생</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {courses.reduce((sum, course) => sum + course.enrolledStudents, 0)}명
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Calendar className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">활성 강의</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {courses.filter(c => c.status === 'active').length}개
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Star className="w-8 h-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">평균 평점</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {courses.length > 0 
                      ? (courses.reduce((sum, c) => sum + c.rating, 0) / courses.length).toFixed(1)
                      : '0.0'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 검색 및 필터 */}
          <Card className="border border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">검색 및 필터</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="강의명, 설명, 카테고리로 검색..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={levelFilter}
                    onChange={(e) => setLevelFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">모든 레벨</option>
                    <option value="beginner">초급</option>
                    <option value="intermediate">중급</option>
                    <option value="advanced">고급</option>
                  </select>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">모든 상태</option>
                    <option value="active">활성</option>
                    <option value="inactive">비활성</option>
                    <option value="draft">임시저장</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 뷰 모드에 따른 콘텐츠 */}
          <Card className="border border-gray-200">
            <CardContent className="space-y-6">
              {viewMode === 'calendar' ? (
                <>
                  <h2 className="text-xl font-semibold text-gray-900">주간 캘린더</h2>
                  <WeeklyCalendar
                    courses={filteredCourses.map(course => {
                      const calendarStatus: 'active' | 'inactive' | 'full' =
                        course.status === 'draft' ? 'inactive' : course.status;

                      return {
                      _id: course._id,
                      name: course.name,
                      description: course.description,
                      level: course.level,
                      duration: course.duration,
                      maxStudents: course.maxStudents,
                      currentStudents: course.enrolledStudents,
                      instructorId: course.instructorId,
                      instructorName: course.instructorName,
                      price: course.price,
                      schedule: course.schedule.map(sch => {
                        const dayLabel = getDayOfWeekLabel(sch.dayOfWeek);
                        const dayMap: { [key: string]: string } = {
                          '월': 'monday',
                          '화': 'tuesday',
                          '수': 'wednesday',
                          '목': 'thursday',
                          '금': 'friday',
                          '토': 'saturday',
                          '일': 'sunday'
                        };
                        return {
                          dayOfWeek: dayLabel,
                          day: dayMap[dayLabel] || dayLabel.toLowerCase(),
                          startTime: sch.startTime,
                          endTime: sch.endTime
                        };
                      }),
                      status: calendarStatus,
                      tags: (course as any).tags || [course.category], // ⭐ 실제 DB 태그 사용
                      isPersonalLesson: (course as any).isPersonalLesson || false, // ⭐ 개인레슨 여부 추가
                      courseType: (course as any).courseType || 'group' // ⭐ 강의 타입 추가 (group, personal, freeSwim)
                    };
                    })}
                    onCourseClick={(course) => {
                      const matched = courses.find((item) => item._id === course._id);
                      if (matched) {
                        handleViewDetail(matched);
                      }
                    }}
                  />
                </>
              ) : (
                <>
                  <h2 className="text-xl font-semibold text-gray-900">강의 목록</h2>
                  {filteredCourses.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                      검색 조건에 해당하는 강의가 없습니다.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {filteredCourses.map(course => (
                        <Card
                          key={course._id}
                          className="border border-blue-100 bg-gradient-to-br from-white to-blue-50 transition-all hover:border-primary/40 hover:shadow-lg cursor-pointer"
                          onClick={() => handleViewDetail(course)}
                        >
                          <CardContent className="p-6 space-y-4">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">{course.name}</h3>
                                <div className="flex items-center gap-2">
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(course.status)}`}>
                                    {getStatusLabel(course.status)}
                                  </span>
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getLevelColor(course.level)}`}>
                                    {getLevelLabel(course.level)}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Users className="w-4 h-4 text-blue-500" />
                                <span>{course.enrolledStudents}/{course.maxStudents}</span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {course.description || '강의 설명이 등록되지 않았습니다.'}
                            </p>
                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                              <div className="space-y-1">
                                <p className="font-medium text-gray-500">강사</p>
                                <p>{course.instructorName}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="font-medium text-gray-500">강의 시간</p>
                                <p>{course.duration}분</p>
                              </div>
                              <div className="space-y-1">
                                <p className="font-medium text-gray-500">평점</p>
                                <p className="flex items-center gap-1">
                                  <Star className="w-4 h-4 text-yellow-500" />
                                  {course.rating.toFixed(1)}
                                </p>
                              </div>
                              <div className="space-y-1">
                                <p className="font-medium text-gray-500">등록 수강생</p>
                                <p>{course.enrolledStudents}명</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-purple-500" />
                                <span>
                                  {course.schedule
                                    .map(schedule => `${['일','월','화','수','목','금','토'][schedule.dayOfWeek - 1] || '월'} ${schedule.startTime}`)
                                    .join(', ')}
                                </span>
                              </div>
                              <button
                                className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleViewDetail(course);
                                }}
                              >
                                <Eye className="w-4 h-4" /> 상세 보기
                              </button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <CourseDetailModal
            isOpen={showDetailModal}
            onClose={() => {
              setShowDetailModal(false);
              setDetailCourse(null);
            }}
            course={detailCourse ? convertCourseForDetail(detailCourse) : null}
            levelName={detailCourse ? getLevelName(detailCourse.level) : undefined}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default withAuth(InstructorCoursesManagement, { 
  requireTypes: ['instructor'] 
});