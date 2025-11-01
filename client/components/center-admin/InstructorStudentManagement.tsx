/**
 * 강사별 수강생 관리 컴포넌트
 * 헬스 PT 관리 시스템 스타일로 강사별 수강생 현황을 관리합니다.
 * 
 * 연동 데이터: 강사 정보, 수강생 목록, 예약 현황, 패키지 정보
 * 연동 파일: InstructorScheduleModal.tsx, PersonalLesson.ts, CenterSchedule.ts
 */

import React, { useState, useEffect } from 'react';
import { apiClient } from '../../utils/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { 
  User, 
  Users,
  Calendar, 
  Clock, 
  DollarSign, 
  Package, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  Eye,
  Edit,
  Phone,
  Mail,
  X
} from 'lucide-react';

interface Student {
  _id: string;
  courseId?: string;
  courseName?: string;
  name: string;
  email: string;
  phone: string;
  profileImage?: string;
  enrollmentDate: string;
  currentPackage?: {
    name: string;
    sessions: number;
    remainingSessions: number;
    expirationDate: string;
    price: number;
  };
  totalLessonsCompleted: number;
  lastLessonDate?: string;
  nextScheduledLesson?: {
    date: string;
    time: string;
    status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  };
  status: 'active' | 'inactive' | 'expired' | 'suspended';
  notes?: string;
  progress?: number;
  // 개인레슨 관련 정보
  isPersonalLesson?: boolean;
  personalLessonInfo?: {
    lessonType: '1:1' | '1:2' | '1:3' | '1:4' | '1:5';
    totalSessions: number;
    completedSessions: number;
    remainingSessions: number;
    packageType: 'weekly' | 'monthly' | 'session';
    startDate: string;
    endDate: string;
    pricePerSession: number;
    totalPaid: number;
    lastPaymentDate?: string;
  };
}

interface Instructor {
  _id: string;
  name: string;
  instructorType: 'instructor' | 'lifeguard';
  profileImage?: string;
  totalStudents: number;
  activeStudents: number;
  completedLessons: number;
  monthlyRevenue: number;
  rating: number;
}

interface InstructorStudentManagementProps {
  instructorId: string;
  onClose: () => void;
  onManageLessons?: (instructorId: string, date: string) => void;
}

export default function InstructorStudentManagement({ 
  instructorId, 
  onClose,
  onManageLessons
}: InstructorStudentManagementProps) {
  const [instructor, setInstructor] = useState<Instructor | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [lessonTypeFilter, setLessonTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showStudentDetail, setShowStudentDetail] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchInstructorData();
  }, [instructorId]);

  useEffect(() => {
    filterAndSortStudents();
  }, [students, searchTerm, statusFilter, lessonTypeFilter, sortBy]);

  const fetchInstructorData = async () => {
    try {
      setLoading(true);
      // 강사 정보 조회
      const instructorResponse = await apiClient.get(`/api/center-admin/instructors/${instructorId}`);
      if (instructorResponse.success && instructorResponse.data) {
        setInstructor(instructorResponse.data as Instructor);
      }

      // 강사별 수강생 목록 조회
      const studentsResponse = await apiClient.get(`/api/center-admin/instructors/${instructorId}/students-list`);
      
      if (studentsResponse.success) {
        const studentsData = studentsResponse.data || [];
        const studentsArray = Array.isArray(studentsData) ? studentsData : [];
        setStudents(studentsArray);
      } else {
        console.error('수강생 목록 조회 실패:', studentsResponse.message);
        setStudents([]);
      }
    } catch (error) {
      console.error('강사 데이터 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortStudents = () => {
    console.log('🔍 filterAndSortStudents 시작, students:', students.length);
    let filtered = [...students];
    console.log('🔍 초기 filtered:', filtered.length);

    // 검색어 필터링
    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.phone.includes(searchTerm)
      );
    }

    // 상태 필터링
    if (statusFilter !== 'all') {
      filtered = filtered.filter(student => student.status === statusFilter);
    }

    // 수업 타입 필터링
    if (lessonTypeFilter !== 'all') {
      filtered = filtered.filter(student => {
        if (lessonTypeFilter === 'personal') {
          return student.isPersonalLesson === true;
        } else if (lessonTypeFilter === 'group') {
          return student.isPersonalLesson === false;
        }
        return true;
      });
    }

    // 정렬
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'enrollmentDate':
          return new Date(b.enrollmentDate).getTime() - new Date(a.enrollmentDate).getTime();
        case 'remainingSessions':
          return (b.currentPackage?.remainingSessions || 0) - (a.currentPackage?.remainingSessions || 0);
        case 'lastLesson':
          return new Date(b.lastLessonDate || 0).getTime() - new Date(a.lastLessonDate || 0).getTime();
        default:
          return 0;
      }
    });

    setFilteredStudents(filtered);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      inactive: { color: 'bg-gray-100 text-gray-800', icon: AlertCircle },
      expired: { color: 'bg-red-100 text-red-800', icon: XCircle },
      suspended: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status === 'active' ? '활성' : status === 'inactive' ? '비활성' : status === 'expired' ? '만료' : '정지'}
      </span>
    );
  };

  const getPackageStatus = (student: Student) => {
    if (!student.currentPackage) {
      return <span className="text-gray-500 text-xs">패키지 없음</span>;
    }

    const { remainingSessions, expirationDate } = student.currentPackage;
    const isExpired = new Date(expirationDate) < new Date();
    const isLowSessions = remainingSessions <= 3;

    if (isExpired) {
      return <span className="text-red-600 text-xs font-medium">만료됨</span>;
    } else if (isLowSessions) {
      return <span className="text-yellow-600 text-xs font-medium">잔여 {remainingSessions}회</span>;
    } else {
      return <span className="text-green-600 text-xs">잔여 {remainingSessions}회</span>;
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-center mt-4 text-gray-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[95vh] flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-4">
            {instructor?.profileImage ? (
              <img 
                src={instructor.profileImage} 
                alt={instructor.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-gray-900">{instructor?.name} 강사</h2>
              <p className="text-sm text-gray-600">
                {instructor?.instructorType === 'lifeguard' ? '안전요원' : '수영강사'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {/* 통계 카드 */}
        <div className="p-6 border-b bg-gray-50">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">총 수강생</p>
                  <p className="text-2xl font-bold text-gray-900">{students.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">활성 수강생</p>
                  <p className="text-2xl font-bold text-gray-900">{students.filter(s => s.status === 'active').length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center">
                <Calendar className="w-8 h-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">완료 수업</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {students.reduce((total, s) => {
                      if (s.isPersonalLesson) {
                        return total + (s.personalLessonInfo?.completedSessions || 0);
                      } else {
                        // 단체반의 경우 progress를 기반으로 완료 수업 수 계산
                        return total + Math.floor((s.progress || 0) / 10);
                      }
                    }, 0)}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center">
                <DollarSign className="w-8 h-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">월 매출</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {students.reduce((total, s) => {
                      if (s.isPersonalLesson) {
                        const price = s.personalLessonInfo?.pricePerSession || 0;
                        const sessions = s.personalLessonInfo?.completedSessions || 0;
                        return total + (price * sessions);
                      } else {
                        // 단체반의 경우 고정 가격으로 계산
                        const sessions = Math.floor((s.progress || 0) / 10);
                        return total + (30000 * sessions); // 단체반 1회당 30,000원 가정
                      }
                    }, 0).toLocaleString()}원
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 필터 및 검색 */}
        <div className="p-6 border-b">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="수강생 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-lg w-64"
                />
                <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg"
              >
                <option value="all">전체 상태</option>
                <option value="active">활성</option>
                <option value="inactive">비활성</option>
                <option value="expired">만료</option>
                <option value="suspended">정지</option>
              </select>
              <select
                value={lessonTypeFilter}
                onChange={(e) => setLessonTypeFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg"
              >
                <option value="all">전체 수업</option>
                <option value="group">단체반</option>
                <option value="personal">개인레슨</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border rounded-lg"
              >
                <option value="name">이름순</option>
                <option value="enrollmentDate">등록일순</option>
                <option value="remainingSessions">잔여횟수순</option>
                <option value="lastLesson">최근 수업순</option>
              </select>
            </div>
          </div>
        </div>

        {/* 수강생 목록 */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredStudents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredStudents.map((student, index) => (
              <Card key={student.courseId ? `${student._id}_${student.courseId}` : `${student._id}_${index}`}>
                <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {student.profileImage ? (
                      <img 
                        src={student.profileImage} 
                        alt={student.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-medium text-gray-900">{student.name}</h3>
                      <p className="text-sm text-gray-600">{student.email}</p>
                    </div>
                  </div>
                  {getStatusBadge(student.status)}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    {student.phone}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    등록일: {student.enrollmentDate ? new Date(student.enrollmentDate).toLocaleDateString() : '미설정'}
                  </div>
                  {student.currentPackage && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Package className="w-4 h-4 mr-2" />
                      {student.currentPackage.name}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm">
                    <span className="text-gray-600">완료 수업: </span>
                    <span className="font-medium">{student.totalLessonsCompleted || 0}회</span>
                  </div>
                  {getPackageStatus(student)}
                </div>

                {/* 수업 정보 */}
                {student.isPersonalLesson && student.personalLessonInfo ? (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center text-purple-800">
                        <User className="w-4 h-4 mr-1" />
                        <span className="text-sm font-medium">개인레슨 {student.personalLessonInfo.lessonType}</span>
                      </div>
                      <span className="text-xs text-purple-600">
                        {student.personalLessonInfo.packageType === 'weekly' ? '주간' : 
                         student.personalLessonInfo.packageType === 'monthly' ? '월간' : '회차'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-purple-600">진행:</span>
                        <span className="font-medium ml-1">{student.personalLessonInfo.completedSessions}/{student.personalLessonInfo.totalSessions}회</span>
                      </div>
                      <div>
                        <span className="text-purple-600">남은:</span>
                        <span className="font-medium ml-1">{student.personalLessonInfo.remainingSessions}회</span>
                      </div>
                      <div>
                        <span className="text-purple-600">기간:</span>
                        <span className="font-medium ml-1">{student.personalLessonInfo.endDate ? new Date(student.personalLessonInfo.endDate).toLocaleDateString() : '미설정'}</span>
                      </div>
                      <div>
                        <span className="text-purple-600">회당:</span>
                        <span className="font-medium ml-1">{student.personalLessonInfo.pricePerSession?.toLocaleString() || '0'}원</span>
                      </div>
                    </div>
                    {/* 진행률 바 */}
                    <div className="mt-2">
                      <div className="w-full bg-purple-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full" 
                          style={{ 
                            width: `${(student.personalLessonInfo.completedSessions / student.personalLessonInfo.totalSessions) * 100}%` 
                          }}
                        ></div>
                      </div>
                      <div className="text-xs text-purple-600 mt-1">
                        {Math.round((student.personalLessonInfo.completedSessions / student.personalLessonInfo.totalSessions) * 100)}% 완료
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center text-blue-800">
                        <Users className="w-4 h-4 mr-1" />
                        <span className="text-sm font-medium">단체반</span>
                      </div>
                      <span className="text-xs text-blue-600">
                        {student.courseName || '단체 수업'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-blue-600">진행률:</span>
                        <span className="font-medium ml-1">{student.progress || 0}%</span>
                      </div>
                      <div>
                        <span className="text-blue-600">남은 수업:</span>
                        <span className="font-medium ml-1">{student.currentPackage?.remainingSessions || 0}회</span>
                      </div>
                      <div>
                        <span className="text-blue-600">만료일:</span>
                        <span className="font-medium ml-1">{student.currentPackage?.expirationDate ? new Date(student.currentPackage.expirationDate).toLocaleDateString() : '미설정'}</span>
                      </div>
                      <div>
                        <span className="text-blue-600">수업료:</span>
                        <span className="font-medium ml-1">월 30,000원</span>
                      </div>
                    </div>
                    {/* 진행률 바 */}
                    <div className="mt-2">
                      <div className="w-full bg-blue-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ 
                            width: `${student.progress || 0}%` 
                          }}
                        ></div>
                      </div>
                      <div className="text-xs text-blue-600 mt-1">
                        {student.progress || 0}% 완료
                      </div>
                    </div>
                  </div>
                )}

                {student.nextScheduledLesson && (
                  <div className="bg-blue-50 p-2 rounded text-xs mb-3">
                    <div className="flex items-center text-blue-800">
                      <Clock className="w-3 h-3 mr-1" />
                      다음 수업: {student.nextScheduledLesson.date} {student.nextScheduledLesson.time}
                    </div>
                  </div>
                )}

                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedStudent(student);
                      setShowStudentDetail(true);
                    }}
                    className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 flex items-center justify-center"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    상세보기
                  </button>
                  <button
                    onClick={() => {
                      setSelectedStudent(student);
                      setShowEditModal(true);
                    }}
                    className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-200 flex items-center justify-center"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    수정
                  </button>
                </div>
                </CardContent>
              </Card>
            ))}
          </div>
          ) : (
            <div className="text-center py-12">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">등록된 수강생이 없습니다.</p>
            </div>
          )}
        </div>
      </div>

      {/* 상세보기 모달 */}
      {showStudentDetail && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">학생 상세 정보</h3>
              <button
                onClick={() => setShowStudentDetail(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
                <p className="text-gray-900">{selectedStudent.name}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                <p className="text-gray-900">{selectedStudent.email}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">전화번호</label>
                <p className="text-gray-900">{selectedStudent.phone}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">등록일</label>
                <p className="text-gray-900">
                  {selectedStudent.enrollmentDate ? new Date(selectedStudent.enrollmentDate).toLocaleDateString() : '미설정'}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
                {getStatusBadge(selectedStudent.status)}
              </div>
              
              {selectedStudent.isPersonalLesson && selectedStudent.personalLessonInfo && (
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-medium text-purple-800 mb-2">개인레슨 정보</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-purple-600">레슨 타입:</span>
                      <span className="font-medium ml-1">{selectedStudent.personalLessonInfo.lessonType}</span>
                    </div>
                    <div>
                      <span className="text-purple-600">진행:</span>
                      <span className="font-medium ml-1">{selectedStudent.personalLessonInfo.completedSessions}/{selectedStudent.personalLessonInfo.totalSessions}회</span>
                    </div>
                    <div>
                      <span className="text-purple-600">남은 수업:</span>
                      <span className="font-medium ml-1">{selectedStudent.personalLessonInfo.remainingSessions}회</span>
                    </div>
                    <div>
                      <span className="text-purple-600">회당 가격:</span>
                      <span className="font-medium ml-1">{selectedStudent.personalLessonInfo.pricePerSession?.toLocaleString() || '0'}원</span>
                    </div>
                  </div>
                </div>
              )}
              
              {!selectedStudent.isPersonalLesson && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">단체반 정보</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-blue-600">수업명:</span>
                      <span className="font-medium ml-1">{selectedStudent.courseName || '단체 수업'}</span>
                    </div>
                    <div>
                      <span className="text-blue-600">진행률:</span>
                      <span className="font-medium ml-1">{selectedStudent.progress || 0}%</span>
                    </div>
                    <div>
                      <span className="text-blue-600">남은 수업:</span>
                      <span className="font-medium ml-1">{selectedStudent.currentPackage?.remainingSessions || 0}회</span>
                    </div>
                    <div>
                      <span className="text-blue-600">만료일:</span>
                      <span className="font-medium ml-1">
                        {selectedStudent.currentPackage?.expirationDate ? new Date(selectedStudent.currentPackage.expirationDate).toLocaleDateString() : '미설정'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowStudentDetail(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 수정 모달 */}
      {showEditModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">학생 상태 수정</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* 읽기 전용 정보 표시 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2">학생 정보</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">이름:</span>
                    <span className="font-medium ml-2">{selectedStudent.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">이메일:</span>
                    <span className="font-medium ml-2">{selectedStudent.email}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">전화번호:</span>
                    <span className="font-medium ml-2">{selectedStudent.phone}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  ※ 이름, 이메일, 전화번호는 회원 본인이 수정할 수 있습니다.
                </p>
              </div>
              
              {/* 상태 수정 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">수강 상태</label>
                <select
                  defaultValue={selectedStudent.status}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">활성</option>
                  <option value="inactive">비활성</option>
                  <option value="paused">일시정지</option>
                  <option value="completed">완료</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  ※ 센터 관리자는 수강 상태만 수정할 수 있습니다.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                취소
              </button>
              <button
                onClick={() => {
                  // TODO: 실제 상태 수정 API 호출
                  alert('상태 수정 기능은 추후 구현 예정입니다.');
                  setShowEditModal(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                상태 저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


