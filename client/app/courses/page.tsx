"use client";

import { useEffect, useMemo, useState } from "react";
import apiClient from '../../utils/api';

interface ApiCourse {
  _id: string;
  name: string;
  instructor?: { _id: string; name: string; userId?: string } | string;
  level: "beginner" | "intermediate" | "advanced";
  description: string;
  price: number;
  duration: number;
  maxStudents: number;
  enrolledStudents?: Array<{ student: string; status: string } | any>;
  isActive?: boolean;
  schedule?: string[];
}

interface Instructor {
  _id: string;
  name: string;
  email: string;
  instructorInfo?: {
    instructorLevel?: string;
    experience?: string;
    specialties?: string[];
  };
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<ApiCourse[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [selectedInstructor, setSelectedInstructor] = useState<string>("all");

  const loadCourses = async () => {
    setLoading(true);
    const res = await apiClient.getCourses();
    console.log('🔍 강습과정 API 응답:', res);
    if (res.data) {
      setCourses(res.data);
    } else if (res.courses) {
      setCourses(res.courses);
    } else {
      // 샘플 데이터로 대체
      setCourses([
        {
          _id: '1',
          name: '자유형 기초반',
          level: 'beginner',
          instructor: { _id: '1', name: '김강사' },
          description: '자유형의 기본 자세와 호흡법을 배우는 초급 과정입니다.',
          duration: 60,
          price: 50000,
          maxStudents: 10,
          enrolledStudents: [
            { student: { _id: 's1', name: '학생1' }, status: 'active' },
            { student: { _id: 's2', name: '학생2' }, status: 'active' }
          ],
          isActive: true
        },
        {
          _id: '2',
          name: '배영 중급반',
          level: 'intermediate',
          instructor: { _id: '2', name: '이강사' },
          description: '배영의 롤링과 스트로크 기술을 향상시키는 중급 과정입니다.',
          duration: 60,
          price: 70000,
          maxStudents: 8,
          enrolledStudents: [
            { student: { _id: 's3', name: '학생3' }, status: 'active' },
            { student: { _id: 's4', name: '학생4' }, status: 'active' },
            { student: { _id: 's5', name: '학생5' }, status: 'active' }
          ],
          isActive: true
        },
        {
          _id: '3',
          name: '평영 고급반',
          level: 'advanced',
          instructor: { _id: '3', name: '박강사' },
          description: '평영의 고급 기술과 경기력 향상을 위한 고급 과정입니다.',
          duration: 90,
          price: 90000,
          maxStudents: 6,
          enrolledStudents: [
            { student: { _id: 's6', name: '학생6' }, status: 'active' }
          ],
          isActive: true
        },
        {
          _id: '4',
          name: '접영 마스터반',
          level: 'advanced',
          instructor: { _id: '1', name: '김강사' },
          description: '접영의 완벽한 마스터를 위한 최고급 과정입니다.',
          duration: 90,
          price: 120000,
          maxStudents: 4,
          enrolledStudents: [],
          isActive: true
        },
        {
          _id: '5',
          name: '성인 수영교실',
          level: 'beginner',
          instructor: { _id: '2', name: '이강사' },
          description: '성인을 위한 기초 수영 교실입니다.',
          duration: 60,
          price: 45000,
          maxStudents: 12,
          enrolledStudents: [
            { student: { _id: 's7', name: '학생7' }, status: 'active' },
            { student: { _id: 's8', name: '학생8' }, status: 'active' },
            { student: { _id: 's9', name: '학생9' }, status: 'active' },
            { student: { _id: 's10', name: '학생10' }, status: 'active' }
          ],
          isActive: true
        }
      ]);
    }
    setLoading(false);
  };

  const loadInstructors = async () => {
    try {
      // 강습과정에서 강사 정보 추출 (API 호출 대신)
      const uniqueInstructors = courses.reduce((acc: any[], course) => {
        const instructor = typeof course.instructor === 'string' ? 
          { _id: course.instructor, name: course.instructor } : 
          course.instructor;
        
        if (instructor && !acc.find(i => i._id === instructor._id)) {
          acc.push(instructor);
        }
        return acc;
      }, []);

      if (uniqueInstructors.length > 0) {
        setInstructors(uniqueInstructors);
      } else {
        // 강사 데이터가 없으면 샘플 데이터 사용
        setInstructors([
          { _id: '1', name: '김강사', email: 'instructor1@jjswim.com' },
          { _id: '2', name: '이강사', email: 'instructor2@jjswim.com' },
          { _id: '3', name: '박강사', email: 'instructor3@jjswim.com' }
        ]);
      }
    } catch (error) {
      console.error('강사 목록 로드 실패:', error);
      // 에러 시 샘플 데이터 사용
      setInstructors([
        { _id: '1', name: '김강사', email: 'instructor1@jjswim.com' },
        { _id: '2', name: '이강사', email: 'instructor2@jjswim.com' },
        { _id: '3', name: '박강사', email: 'instructor3@jjswim.com' }
      ]);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (courses.length > 0) {
      loadInstructors();
    }
  }, [courses]);

  const filteredCourses = useMemo(() => {
    let filtered = courses;
    
    // 레벨별 필터링
    if (selectedLevel !== "all") {
      filtered = filtered.filter((c) => c.level === (selectedLevel as any));
    }
    
    // 강사별 필터링
    if (selectedInstructor !== "all") {
      filtered = filtered.filter((c) => {
        if (typeof c.instructor === 'object') {
          return c.instructor.userId === selectedInstructor;
        }
        return c.instructor === selectedInstructor;
      });
    }
    
    return filtered;
  }, [courses, selectedLevel, selectedInstructor]);

  const getLevelText = (level: string) => {
    switch (level) {
      case "beginner":
        return "초급";
      case "intermediate":
        return "중급";
      case "advanced":
        return "고급";
      default:
        return level;
    }
  };

  const getStatusText = (course: ApiCourse) => {
    const activeCount = course.enrolledStudents?.filter((e: any) => e.status === "active").length || 0;
    if (course.isActive === false) return "마감";
    if (activeCount >= (course.maxStudents || 0)) return "마감";
    return "신청 가능";
  };

  const getStatusColor = (course: ApiCourse) => {
    const activeCount = course.enrolledStudents?.filter((e: any) => e.status === "active").length || 0;
    const status = course.isActive === false || activeCount >= (course.maxStudents || 0) ? "closed" : "available";
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleEnroll = async (courseId: string) => {
    const res = await apiClient.post(`/courses/${courseId}/enroll`);
    if (!res.error) {
      alert("강습에 신청되었습니다.");
      await loadCourses();
    } else {
      alert(res.error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">로딩 중...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-single-line">강습 과정</h1>

        <div className="mb-6 space-y-4">
          {/* 레벨별 필터 */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">레벨별 필터</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedLevel("all")}
                className={`px-4 py-2 rounded-md transition-colors ${
                  selectedLevel === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                전체
              </button>
              {["beginner", "intermediate", "advanced"].map((level) => (
                <button
                  key={level}
                  onClick={() => setSelectedLevel(level)}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    selectedLevel === level
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {getLevelText(level)}
                </button>
              ))}
            </div>
          </div>

          {/* 강사별 필터 */}
          {instructors.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">강사별 필터</h3>
              <select
                value={selectedInstructor}
                onChange={(e) => setSelectedInstructor(e.target.value)}
                className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">전체 강사</option>
                {instructors.map((instructor) => (
                  <option key={instructor._id} value={instructor._id}>
                    {instructor.name} 강사
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCourses.map((course) => {
            const activeCount = course.enrolledStudents?.filter((e: any) => e.status === "active").length || 0;
            const isAvailable = (course.isActive !== false) && activeCount < (course.maxStudents || 0);
            return (
              <div key={course._id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 card-title-text">{course.name}</h3>
                    <p className="text-sm text-gray-600 text-single-line">
                      {typeof course.instructor === "string" ? course.instructor : course.instructor?.name} 강사
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(course)}`}>
                    {getStatusText(course)}
                  </span>
                </div>

                <p className="text-gray-700 mb-4 description-text">{course.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">레벨:</span>
                    <span className="font-medium">{getLevelText(course.level)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">기간:</span>
                    <span className="font-medium">{course.duration}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">수강생:</span>
                    <span className="font-medium">{activeCount}/{course.maxStudents}명</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">수강료:</span>
                    <span className="font-medium text-blue-600">{course.price.toLocaleString()}원</span>
                  </div>
                </div>

                <button
                  onClick={() => handleEnroll(course._id)}
                  disabled={!isAvailable}
                  className={`w-full py-2 px-4 rounded-md transition-colors ${
                    isAvailable
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {isAvailable ? "신청하기" : "마감"}
                </button>
              </div>
            );
          })}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">해당 레벨의 강습이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}

