'use client';

import { useState, useEffect } from 'react';

interface Course {
  id: number;
  name: string;
  level: string;
  students: number;
  maxStudents: number;
  schedule: string[];
  status: 'active' | 'inactive';
}

export default function InstructorCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setCourses([
        {
          id: 1,
          name: '초급 자유형',
          level: '초급',
          students: 8,
          maxStudents: 10,
          schedule: ['월요일 14:00-16:00', '수요일 14:00-16:00', '금요일 14:00-16:00'],
          status: 'active'
        },
        {
          id: 2,
          name: '중급 접영',
          level: '중급',
          students: 6,
          maxStudents: 8,
          schedule: ['화요일 16:00-18:00', '목요일 16:00-18:00'],
          status: 'active'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">강습 관리</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{course.name}</h3>
                  <p className="text-sm text-gray-600">{course.level}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  course.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {course.status === 'active' ? '활성' : '비활성'}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">수강생:</span>
                  <span className="font-medium">{course.students}/{course.maxStudents}명</span>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">수업 일정:</h4>
                <div className="space-y-1">
                  {course.schedule.map((time, index) => (
                    <div key={index} className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                      {time}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                  학생 관리
                </button>
                <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors">
                  일정 관리
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
































