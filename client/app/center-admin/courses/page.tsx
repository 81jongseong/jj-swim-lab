'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { BookOpen, Users, Clock, Star, Plus, Edit, Trash2 } from 'lucide-react';
import withAuth from '@/components/withAuth';

interface Course {
  _id: string;
  name: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // minutes
  maxStudents: number;
  currentStudents: number;
  instructorId: string;
  instructorName: string;
  price: number;
  schedule: {
    dayOfWeek: string;
    startTime: string;
    endTime: string;
  }[];
  status: 'active' | 'inactive' | 'full';
  createdAt: Date;
}

function CoursesManagement() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (user) {
      loadCourses();
    }
  }, [user]);

  const loadCourses = async () => {
    try {
      setIsLoading(true);
      // 임시 데이터
      const tempCourses: Course[] = [
        {
          _id: '1',
          name: '초급 자유형 클래스',
          description: '수영을 처음 시작하는 분들을 위한 기초 자유형 클래스',
          level: 'beginner',
          duration: 60,
          maxStudents: 8,
          currentStudents: 6,
          instructorId: 'instructor001',
          instructorName: '김강사',
          price: 80000,
          schedule: [
            { dayOfWeek: '월', startTime: '19:00', endTime: '20:00' },
            { dayOfWeek: '수', startTime: '19:00', endTime: '20:00' }
          ],
          status: 'active',
          createdAt: new Date('2024-01-15')
        },
        {
          _id: '2',
          name: '중급 배영 클래스',
          description: '배영 기술을 향상시키고 싶은 분들을 위한 클래스',
          level: 'intermediate',
          duration: 60,
          maxStudents: 6,
          currentStudents: 6,
          instructorId: 'instructor002',
          instructorName: '이코치',
          price: 100000,
          schedule: [
            { dayOfWeek: '화', startTime: '20:00', endTime: '21:00' },
            { dayOfWeek: '목', startTime: '20:00', endTime: '21:00' }
          ],
          status: 'full',
          createdAt: new Date('2024-01-10')
        },
        {
          _id: '3',
          name: '고급 접영 클래스',
          description: '접영 기술을 완성하고 싶은 분들을 위한 고급 클래스',
          level: 'advanced',
          duration: 90,
          maxStudents: 4,
          currentStudents: 3,
          instructorId: 'instructor001',
          instructorName: '김강사',
          price: 120000,
          schedule: [
            { dayOfWeek: '토', startTime: '10:00', endTime: '11:30' }
          ],
          status: 'active',
          createdAt: new Date('2024-01-05')
        }
      ];
      setCourses(tempCourses);
    } catch (error) {
      console.error('강습 과정 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
      'full': '정원마감'
    };
    return statuses[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'active': 'bg-green-100 text-green-800',
      'inactive': 'bg-red-100 text-red-800',
      'full': 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🏊‍♂️ 강습 과정 관리
        </h1>
        <p className="text-gray-600">센터의 강습 과정을 관리하고 모니터링하세요</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">총 과정</p>
              <p className="text-2xl font-bold text-gray-900">{courses.length}개</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">총 학생</p>
              <p className="text-2xl font-bold text-gray-900">
                {courses.reduce((sum, course) => sum + course.currentStudents, 0)}명
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">평균 수업시간</p>
              <p className="text-2xl font-bold text-gray-900">
                {courses.length > 0 
                  ? Math.round(courses.reduce((sum, course) => sum + course.duration, 0) / courses.length)
                  : 0
                }분
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Star className="w-8 h-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">활성 과정</p>
              <p className="text-2xl font-bold text-gray-900">
                {courses.filter(course => course.status === 'active').length}개
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 과정 목록 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">강습 과정 목록</h3>
          <button 
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            새 과정 추가
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  과정명
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  레벨
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  강사
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  학생 수
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  수업시간
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  가격
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  액션
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {courses.map((course) => (
                <tr key={course._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{course.name}</div>
                      <div className="text-sm text-gray-500">{course.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLevelColor(course.level)}`}>
                      {getLevelLabel(course.level)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {course.instructorName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(course.currentStudents / course.maxStudents) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900">
                        {course.currentStudents}/{course.maxStudents}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {course.duration}분
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(course.price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(course.status)}`}>
                      {getStatusLabel(course.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default withAuth(CoursesManagement, { 
  requireTypes: ['centerAdmin', 'superAdmin'] 
});