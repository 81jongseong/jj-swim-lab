"use client";

import { useEffect, useMemo, useState } from "react";
import apiClient from "@/utils/api";

interface ApiCourse {
  _id: string;
  name: string;
  instructor?: { name: string; userId: string } | string;
  level: "beginner" | "intermediate" | "advanced";
  description: string;
  price: number;
  duration: string;
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
    if (res.data?.courses) setCourses(res.data.courses);
    setLoading(false);
  };

  const loadInstructors = async () => {
    try {
      // 센터 계정인 경우 해당 센터의 강사만 조회
      const res = await apiClient.get('/users?userType=instructor');
      if (res.success && res.users) {
        setInstructors(res.users);
      }
    } catch (error) {
      console.error('강사 목록 로드 실패:', error);
    }
  };

  useEffect(() => {
    loadCourses();
    loadInstructors();
  }, []);

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
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedInstructor("all")}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    selectedInstructor === "all"
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  전체 강사
                </button>
                {instructors.map((instructor) => (
                  <button
                    key={instructor._id}
                    onClick={() => setSelectedInstructor(instructor._id)}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      selectedInstructor === instructor._id
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {instructor.name} 강사
                  </button>
                ))}
              </div>
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

