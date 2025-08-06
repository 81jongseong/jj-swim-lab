'use client';

import { useState, useEffect } from 'react';
import { Card, LoadingSpinner, Badge, Button } from '../../components/ui';
import apiClient from '../../utils/api';

interface Class {
  _id: string;
  name: string;
  center: {
    name: string;
  };
  course: {
    name: string;
    level: string;
  };
  level: string;
  maxStudents: number;
  currentStudents: number;
  schedule: {
    dayOfWeek: string;
    startTime: string;
    endTime: string;
  };
  students: Array<{
    student: {
      _id: string;
      name: string;
      email: string;
      phone: string;
    };
    status: string;
  }>;
}

interface Center {
  _id: string;
  name: string;
  address: string;
}

export default function InstructorDashboard() {
  const [centers, setCenters] = useState<Center[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedCenter, setSelectedCenter] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // 사용자 정보 조회
      const userResponse = await apiClient.getUserInfo();
      if (userResponse.data) {
        setUserInfo(userResponse.data);
      }

      // 강사가 근무하는 센터 목록 조회 (실제로는 API 구현 필요)
      // 임시 데이터
      setCenters([
        { _id: '1', name: 'JJ Swim Lab 강남점', address: '서울시 강남구' },
        { _id: '2', name: 'JJ Swim Lab 홍대점', address: '서울시 마포구' },
      ]);

    } catch (err) {
      setError('대시보드 정보를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClasses = async (centerId: string) => {
    try {
      // 실제로는 API 호출
      // const response = await apiClient.get(`/instructor/centers/${centerId}/classes`);
      
      // 임시 데이터
      const mockClasses: Class[] = [
        {
          _id: '1',
          name: '초급 A반',
          center: { name: 'JJ Swim Lab 강남점' },
          course: { name: '자유형 기초', level: 'beginner' },
          level: 'beginner',
          maxStudents: 8,
          currentStudents: 6,
          schedule: {
            dayOfWeek: 'monday',
            startTime: '19:00',
            endTime: '20:00'
          },
          students: [
            { student: { _id: '1', name: '김철수', email: 'kim@test.com', phone: '010-1234-5678' }, status: 'active' },
            { student: { _id: '2', name: '이영희', email: 'lee@test.com', phone: '010-2345-6789' }, status: 'active' },
          ]
        },
        {
          _id: '2',
          name: '중급 B반',
          center: { name: 'JJ Swim Lab 강남점' },
          course: { name: '자유형 심화', level: 'intermediate' },
          level: 'intermediate',
          maxStudents: 6,
          currentStudents: 4,
          schedule: {
            dayOfWeek: 'wednesday',
            startTime: '20:00',
            endTime: '21:00'
          },
          students: [
            { student: { _id: '3', name: '박민수', email: 'park@test.com', phone: '010-3456-7890' }, status: 'active' },
          ]
        }
      ];
      
      setClasses(mockClasses);
    } catch (err) {
      console.error('반 목록 조회 오류:', err);
    }
  };

  const handleCenterSelect = (centerId: string) => {
    setSelectedCenter(centerId);
    fetchClasses(centerId);
  };

  const getDayText = (day: string) => {
    const days = {
      monday: '월',
      tuesday: '화',
      wednesday: '수',
      thursday: '목',
      friday: '금',
      saturday: '토',
      sunday: '일'
    };
    return days[day as keyof typeof days] || day;
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'error';
      default: return 'secondary';
    }
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case 'beginner': return '초급';
      case 'intermediate': return '중급';
      case 'advanced': return '고급';
      default: return level;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto" />
          <p className="mt-4 text-gray-600">대시보드를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️</div>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-700"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            안녕하세요, {userInfo?.name || '강사'}님! 👨‍🏫
          </h1>
          <p className="text-gray-600">오늘도 학생들과 함께 즐거운 수영을 가르쳐보세요</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 왼쪽 컬럼 - 센터 및 반 관리 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 센터 선택 */}
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">🏢 근무 센터</h2>
                
                {centers.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">🏢</div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">근무 중인 센터가 없습니다</h3>
                    <p className="text-gray-600">관리자에게 문의해주세요</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {centers.map((center) => (
                      <div 
                        key={center._id}
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                          selectedCenter === center._id 
                            ? 'border-primary bg-primary-50' 
                            : 'border-gray-200 hover:border-primary-200'
                        }`}
                        onClick={() => handleCenterSelect(center._id)}
                      >
                        <h3 className="font-semibold text-gray-900 mb-1">{center.name}</h3>
                        <p className="text-sm text-gray-600">{center.address}</p>
                        {selectedCenter === center._id && (
                          <Badge variant="primary" className="mt-2">선택됨</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            {/* 반 목록 */}
            {selectedCenter && (
              <Card>
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">📚 내 반 목록</h2>
                  
                  {classes.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">📚</div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">담당 반이 없습니다</h3>
                      <p className="text-gray-600">새로운 반을 생성하거나 관리자에게 문의해주세요</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {classes.map((classItem) => (
                        <div 
                          key={classItem._id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => setSelectedClass(classItem)}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-semibold text-gray-900">{classItem.name}</h3>
                              <p className="text-sm text-gray-600">{classItem.course.name}</p>
                              <p className="text-xs text-gray-500">
                                {getDayText(classItem.schedule.dayOfWeek)} {classItem.schedule.startTime} - {classItem.schedule.endTime}
                              </p>
                            </div>
                            <div className="text-right">
                              <Badge variant={getLevelColor(classItem.level)}>
                                {getLevelText(classItem.level)}
                              </Badge>
                              <div className="text-sm text-gray-600 mt-1">
                                {classItem.currentStudents}/{classItem.maxStudents}명
                              </div>
                            </div>
                          </div>

                          {/* 학생 목록 미리보기 */}
                          <div className="mt-3">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">학생 목록</h4>
                            <div className="flex flex-wrap gap-2">
                              {classItem.students.slice(0, 3).map((student) => (
                                <Badge key={student.student._id} variant="secondary" size="sm">
                                  {student.student.name}
                                </Badge>
                              ))}
                              {classItem.students.length > 3 && (
                                <Badge variant="secondary" size="sm">
                                  +{classItem.students.length - 3}명
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>

          {/* 오른쪽 컬럼 - 빠른 메뉴 */}
          <div className="space-y-6">
            {/* 빠른 메뉴 */}
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">⚡ 빠른 메뉴</h2>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    📊 진도 체크
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    📅 일정 관리
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    👥 학생 관리
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    📝 강습 내용
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    🎯 스킬 템플릿
                  </Button>
                </div>
              </div>
            </Card>

            {/* 오늘 일정 */}
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">📅 오늘 일정</h2>
                <div className="space-y-3">
                  {classes.filter(c => {
                    const today = new Date().toLocaleDateString('en-US', { weekday: 'lowercase' });
                    return c.schedule.dayOfWeek === today;
                  }).map((classItem) => (
                    <div key={classItem._id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">{classItem.name}</h3>
                          <p className="text-sm text-gray-600">
                            {classItem.schedule.startTime} - {classItem.schedule.endTime}
                          </p>
                        </div>
                        <Badge variant="primary" size="sm">
                          {classItem.currentStudents}명
                        </Badge>
                      </div>
                    </div>
                  ))}
                  
                  {classes.filter(c => {
                    const today = new Date().toLocaleDateString('en-US', { weekday: 'lowercase' });
                    return c.schedule.dayOfWeek === today;
                  }).length === 0 && (
                    <div className="text-center py-4">
                      <p className="text-gray-500 text-sm">오늘은 강습이 없습니다</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* 반 상세 모달 */}
        {selectedClass && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{selectedClass.name}</h2>
                <button 
                  onClick={() => setSelectedClass(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 반 정보 */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">📚 반 정보</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">강습 과정:</span>
                      <span>{selectedClass.course.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">레벨:</span>
                      <Badge variant={getLevelColor(selectedClass.level)}>
                        {getLevelText(selectedClass.level)}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">수업 시간:</span>
                      <span>
                        {getDayText(selectedClass.schedule.dayOfWeek)} {selectedClass.schedule.startTime} - {selectedClass.schedule.endTime}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">정원:</span>
                      <span>{selectedClass.currentStudents}/{selectedClass.maxStudents}명</span>
                    </div>
                  </div>
                </div>

                {/* 학생 목록 */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">👥 학생 목록</h3>
                  <div className="space-y-2">
                    {selectedClass.students.map((student) => (
                      <div key={student.student._id} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium text-gray-900">{student.student.name}</h4>
                            <p className="text-sm text-gray-600">{student.student.email}</p>
                            <p className="text-xs text-gray-500">{student.student.phone}</p>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="primary" size="sm">
                              진도 체크
                            </Button>
                            <Badge variant={student.status === 'active' ? 'success' : 'secondary'}>
                              {student.status === 'active' ? '수강중' : '휴강'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex space-x-3">
                <button 
                  onClick={() => setSelectedClass(null)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
                >
                  닫기
                </button>
                <Button variant="primary" className="flex-1">
                  진도 체크하기
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 