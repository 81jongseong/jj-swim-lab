'use client';

import { useState, useEffect } from 'react';
import withAuth from '../../../components/withAuth';

interface Student {
  id: number;
  name: string;
  course: string;
  level: '초급' | '중급' | '고급';
  progress: number;
  lastLesson: string;
  nextLesson: string;
  attendance: number;
  totalLessons: number;
}

interface Stats {
  activeCourses: number;
  totalStudents: number;
  totalLessons: number;
  nextLesson: string;
  averageProgress: number;
}

interface ChecklistItem {
  id: number;
  title: string;
  completed: boolean;
  dueDate: string;
}

function InstructorDashboard() {
  const [stats, setStats] = useState<Stats>({
    activeCourses: 0,
    totalStudents: 0,
    totalLessons: 0,
    nextLesson: '',
    averageProgress: 0
  });

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showProgressModal, setShowProgressModal] = useState(false);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // 실제로는 API 호출
        const mockStats: Stats = {
          activeCourses: 3,
          totalStudents: 12,
          totalLessons: 48,
          nextLesson: '오후 2시 - 초급 자유형',
          averageProgress: 75
        };

        const mockStudents: Student[] = [
          {
            id: 1,
            name: '김수영',
            course: '초급 자유형',
            level: '초급',
            progress: 60,
            lastLesson: '2025-01-20',
            nextLesson: '2025-01-22',
            attendance: 8,
            totalLessons: 10
          },
          {
            id: 2,
            name: '이영희',
            course: '중급 접영',
            level: '중급',
            progress: 80,
            lastLesson: '2025-01-19',
            nextLesson: '2025-01-23',
            attendance: 12,
            totalLessons: 15
          },
          {
            id: 3,
            name: '박철수',
            course: '고급 평영',
            level: '고급',
            progress: 90,
            lastLesson: '2025-01-18',
            nextLesson: '2025-01-24',
            attendance: 20,
            totalLessons: 25
          },
          {
            id: 4,
            name: '최민수',
            course: '초급 자유형',
            level: '초급',
            progress: 40,
            lastLesson: '2025-01-17',
            nextLesson: '2025-01-21',
            attendance: 6,
            totalLessons: 8
          }
        ];

        setStats(mockStats);
        setStudents(mockStudents);
      } catch (error) {
        console.error('대시보드 데이터 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const getChecklistItems = (student: Student): ChecklistItem[] => {
    return [
      {
        id: 1,
        title: '자유형 기본 동작 연습',
        completed: student.progress >= 30,
        dueDate: '2025-01-25'
      },
      {
        id: 2,
        title: '호흡법 숙지',
        completed: student.progress >= 50,
        dueDate: '2025-01-30'
      },
      {
        id: 3,
        title: '25m 완주',
        completed: student.progress >= 70,
        dueDate: '2025-02-05'
      },
      {
        id: 4,
        title: '기술 평가',
        completed: student.progress >= 90,
        dueDate: '2025-02-10'
      }
    ];
  };

  const handleStudentClick = (student: Student) => {
    setSelectedStudent(student);
    setShowProgressModal(true);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case '초급': return 'bg-blue-100 text-blue-800';
      case '중급': return 'bg-green-100 text-green-800';
      case '고급': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'text-green-600';
    if (progress >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">강사 대시보드</h1>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div 
            className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-xl transition-all duration-200 hover:scale-105 border-2 border-transparent hover:border-blue-300"
            onClick={() => {
              console.log('활성 강습 카드 클릭됨');
              window.location.href = '/instructor/courses';
            }}
          >
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">📚</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">활성 강습</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeCourses}</p>
              </div>
            </div>
          </div>

          <div 
            className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-xl transition-all duration-200 hover:scale-105 border-2 border-transparent hover:border-green-300"
            onClick={() => {
              console.log('담당 학생 카드 클릭됨');
              window.location.href = '/instructor/students';
            }}
          >
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">담당 학생</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
              </div>
            </div>
          </div>

          <div 
            className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-xl transition-all duration-200 hover:scale-105 border-2 border-transparent hover:border-purple-300"
            onClick={() => {
              console.log('총 강의 카드 클릭됨');
              window.location.href = '/instructor/schedule';
            }}
          >
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">📅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">총 강의</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalLessons}</p>
              </div>
            </div>
          </div>

          <div 
            className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-xl transition-all duration-200 hover:scale-105 border-2 border-transparent hover:border-yellow-300"
            onClick={() => {
              console.log('다음 강의 카드 클릭됨');
              window.location.href = '/instructor/progress';
            }}
          >
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <span className="text-2xl">⏰</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">다음 강의</p>
                <p className="text-sm font-bold text-gray-900">{stats.nextLesson || '예정 없음'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 학생 목록 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">내 학생들</h2>
          
          {/* 카드 형태로 표시 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.map((student) => (
              <div key={student.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                {/* 학생 정보 헤더 */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{student.name}</h3>
                    <p className="text-sm text-gray-600">{student.course}</p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${getLevelColor(student.level)}`}>
                    {student.level}
                  </span>
                </div>

                {/* 진행률 */}
                <div className="mb-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">진행률</span>
                    <span className={`text-sm font-semibold ${getProgressColor(student.progress)}`}>
                      {student.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${student.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* 출석률 */}
                <div className="mb-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">출석률</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {Math.round((student.attendance / student.totalLessons) * 100)}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {student.attendance}/{student.totalLessons}회
                  </p>
                </div>

                {/* 다음 강의 */}
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-1">다음 강의</p>
                  <p className="text-sm font-medium text-gray-900">{student.nextLesson}</p>
                </div>

                {/* 액션 버튼 */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleStudentClick(student)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                  >
                    상세보기
                  </button>
                  <button
                    onClick={() => window.location.href = `/instructor/progress/${student.id}`}
                    className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                  >
                    진도관리
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 진행률 상세 모달 */}
        {showProgressModal && selectedStudent && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    {selectedStudent.name} - 진행률 상세
                  </h3>
                  <button
                    onClick={() => setShowProgressModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* 학생 정보 */}
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">이름</p>
                      <p className="font-medium">{selectedStudent.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">강습 과정</p>
                      <p className="font-medium">{selectedStudent.course}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">레벨</p>
                      <p className="font-medium">{selectedStudent.level}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">전체 진행률</p>
                      <p className="font-medium">{selectedStudent.progress}%</p>
                    </div>
                  </div>
                </div>

                {/* 체크리스트 */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-900 mb-3">학습 체크리스트</h4>
                  <div className="space-y-2">
                    {getChecklistItems(selectedStudent).map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={item.completed}
                            readOnly
                            className="mr-3 h-4 w-4 text-blue-600 rounded border-gray-300"
                          />
                          <span className={`text-sm ${item.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                            {item.title}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">{item.dueDate}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 액션 버튼 */}
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setShowProgressModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                  >
                    닫기
                  </button>
                  <button
                    onClick={() => {
                      setShowProgressModal(false);
                      window.location.href = `/instructor/progress/${selectedStudent.id}`;
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    진도 관리
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default withAuth(InstructorDashboard, { requireTypes: ['instructor', 'superAdmin'], requirePermission: null });


