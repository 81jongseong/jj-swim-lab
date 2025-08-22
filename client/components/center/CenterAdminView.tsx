'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import apiClient from '@/utils/api';
import CenterInfoEditor from './CenterInfoEditor';

interface CenterAdminViewProps {
  centerInfo: any;
  user: any;
}

interface CenterAdminData {
  totalStudents?: number;
  totalInstructors?: number;
  totalCourses?: number;
  totalBookings?: number;
  monthlyRevenue?: number;
  monthlyBookings?: number;
  recentBookings?: any[];
  recentPayments?: any[];
  instructorPerformance?: any[];
  courseStats?: any[];
}

export default function CenterAdminView({ centerInfo, user }: CenterAdminViewProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [centerAdminData, setCenterAdminData] = useState<CenterAdminData>({});
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadCenterAdminData();
  }, []);

  const loadCenterAdminData = async () => {
    try {
      setLoading(true);
      // 센터 운영 통계 데이터 로드
      const [bookingsResponse, paymentsResponse, usersResponse] = await Promise.all([
        apiClient.getBookings(),
        apiClient.getPayments(),
        apiClient.getUsers()
      ]);

      const totalStudents = usersResponse.data?.filter((user: any) => user.userType === 'student').length || 0;
      const totalInstructors = usersResponse.data?.filter((user: any) => user.userType === 'instructor').length || 0;

      setCenterAdminData({
        totalStudents,
        totalInstructors,
        totalCourses: 12,
        totalBookings: bookingsResponse.data?.length || 0,
        monthlyRevenue: 2500000,
        monthlyBookings: 156,
        recentBookings: bookingsResponse.data?.slice(0, 5) || [],
        recentPayments: paymentsResponse.data?.slice(0, 5) || [],
        instructorPerformance: [
          { name: '김수영', students: 24, satisfaction: 4.8, classes: 156 },
          { name: '이영희', students: 18, satisfaction: 4.6, classes: 142 },
          { name: '박철수', students: 22, satisfaction: 4.9, classes: 168 }
        ],
        courseStats: [
          { name: '자유형 초급', students: 45, completion: 78 },
          { name: '자유형 중급', students: 32, completion: 65 },
          { name: '배영 과정', students: 28, completion: 72 },
          { name: '평영 과정', students: 25, completion: 68 }
        ]
      });
    } catch (error) {
      console.error('센터 관리자 데이터 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCenterInfo = (updatedInfo: any) => {
    // 센터 정보 업데이트 후 상태 갱신
    window.location.reload(); // 간단한 방법으로 페이지 새로고침
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <CenterInfoEditor
        centerInfo={centerInfo}
        onSave={handleSaveCenterInfo}
        onCancel={handleCancelEdit}
      />
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* 헤더 */}
      <div className="relative h-64 bg-gradient-to-r from-purple-600 to-indigo-700">
        {centerInfo.images?.mainImage && (
          <img 
            src={centerInfo.images.mainImage} 
            alt={centerInfo.name}
            className="w-full h-full object-cover opacity-20"
          />
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-4">{centerInfo.name}</h1>
            <p className="text-xl opacity-90 mb-2">{centerInfo.shortDescription}</p>
            <p className="text-lg opacity-80">안녕하세요, {user.name} 센터장님! 🏢</p>
          </div>
        </div>
      </div>

      {/* 센터 운영 현황 요약 */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {centerAdminData.totalStudents}
            </div>
            <div className="text-sm text-gray-600">전체 회원</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {centerAdminData.totalInstructors}
            </div>
            <div className="text-sm text-gray-600">전체 강사</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {centerAdminData.totalCourses}
            </div>
            <div className="text-sm text-gray-600">운영 과정</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">
              {centerAdminData.monthlyBookings}
            </div>
            <div className="text-sm text-gray-600">이번 달 수업</div>
          </div>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'overview', label: '📋 개요', icon: '🏠' },
            { id: 'operations', label: '🏢 운영 현황', icon: '📊' },
            { id: 'instructors', label: '👨‍🏫 강사 관리', icon: '👨‍🎓' },
            { id: 'courses', label: '📚 과정 관리', icon: '📖' },
            { id: 'finances', label: '💰 재무 현황', icon: '💳' },
            { id: 'center', label: '🏢 센터 정보', icon: '🏊‍♂️' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* 탭 컨텐츠 */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-purple-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">📊 센터 현황</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">전체 회원:</span>
                    <span className="font-medium text-purple-600">{centerAdminData.totalStudents}명</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">전체 강사:</span>
                    <span className="font-medium text-green-600">{centerAdminData.totalInstructors}명</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">운영 과정:</span>
                    <span className="font-medium text-blue-600">{centerAdminData.totalCourses}개</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">이번 달 수업:</span>
                    <span className="font-medium text-orange-600">{centerAdminData.monthlyBookings}회</span>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">💰 수익 현황</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">이번 달 매출:</span>
                    <span className="font-medium text-green-600">₩{centerAdminData.monthlyRevenue?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">평균 수강료:</span>
                    <span className="font-medium">₩160,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">재등록율:</span>
                    <span className="font-medium text-blue-600">78%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">🚀 빠른 액션</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Link 
                  href="/admin/users"
                  className="bg-purple-600 text-white p-4 rounded-lg text-center hover:bg-purple-700 transition-colors"
                >
                  👥 회원 관리
                </Link>
                <Link 
                  href="/admin/courses"
                  className="bg-green-600 text-white p-4 rounded-lg text-center hover:bg-green-700 transition-colors"
                >
                  📚 과정 관리
                </Link>
                <Link 
                  href="/admin/bookings"
                  className="bg-blue-600 text-white p-4 rounded-lg text-center hover:bg-blue-700 transition-colors"
                >
                  📅 예약 관리
                </Link>
                <Link 
                  href="/admin/payments"
                  className="bg-orange-600 text-white p-4 rounded-lg text-center hover:bg-orange-700 transition-colors"
                >
                  💳 결제 관리
                </Link>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'operations' && (
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">🏢 운영 현황</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">📈 월별 통계</h4>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">신규 회원:</span>
                    <span className="font-medium text-green-600">+12명</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">수업 완료율:</span>
                    <span className="font-medium text-blue-600">92%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">평균 만족도:</span>
                    <span className="font-medium text-purple-600">4.7/5.0</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">🎯 목표 달성</h4>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">매출 목표:</span>
                    <span className="font-medium text-green-600">100% 달성</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">회원 목표:</span>
                    <span className="font-medium text-blue-600">95% 달성</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">만족도 목표:</span>
                    <span className="font-medium text-purple-600">110% 달성</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'instructors' && (
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">👨‍🏫 강사 관리</h3>
            {centerAdminData.instructorPerformance && centerAdminData.instructorPerformance.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {centerAdminData.instructorPerformance.map((instructor: any, index: number) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-2xl">👨‍🏫</span>
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">{instructor.name}</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">담당 학생:</span>
                          <span className="font-medium">{instructor.students}명</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">만족도:</span>
                          <span className="font-medium text-green-600">{instructor.satisfaction}/5.0</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">총 수업:</span>
                          <span className="font-medium">{instructor.classes}회</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>강사 정보가 없습니다.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'courses' && (
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">📚 과정 관리</h3>
            {centerAdminData.courseStats && centerAdminData.courseStats.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {centerAdminData.courseStats.map((course: any, index: number) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">{course.name}</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">수강생:</span>
                        <span className="font-medium">{course.students}명</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">완료율:</span>
                        <span className="font-medium text-green-600">{course.completion}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${course.completion}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>과정 정보가 없습니다.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'finances' && (
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">💰 재무 현황</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">📊 수익 현황</h4>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">이번 달 매출:</span>
                    <span className="font-medium text-green-600">₩{centerAdminData.monthlyRevenue?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">지난 달 대비:</span>
                    <span className="font-medium text-blue-600">+12%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">연간 누적:</span>
                    <span className="font-medium">₩28,500,000</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">💳 결제 현황</h4>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">이번 달 결제:</span>
                    <span className="font-medium text-green-600">156건</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">평균 결제액:</span>
                    <span className="font-medium">₩160,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">결제 성공율:</span>
                    <span className="font-medium text-blue-600">98.5%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'center' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">센터 소개</h3>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                📝 편집하기
              </button>
            </div>
            <div>
              <p className="text-gray-700 leading-relaxed">{centerInfo.description}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">📍 위치 정보</h4>
                <div className="space-y-2 text-gray-700">
                  <p><span className="font-medium">주소:</span> {centerInfo.address}</p>
                  <p><span className="font-medium">전화:</span> {centerInfo.phone}</p>
                  <p><span className="font-medium">이메일:</span> {centerInfo.email}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">🕒 운영시간</h4>
                <div className="space-y-1 text-gray-700">
                  <p><span className="font-medium">월-금:</span> {centerInfo.businessHours?.monday}</p>
                  <p><span className="font-medium">토요일:</span> {centerInfo.businessHours?.saturday}</p>
                  <p><span className="font-medium">일요일:</span> {centerInfo.businessHours?.sunday}</p>
                </div>
              </div>
            </div>

            {centerInfo.facilities && centerInfo.facilities.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">✨ 주요 시설</h4>
                <div className="flex flex-wrap gap-2">
                  {centerInfo.facilities.map((facility: string, index: number) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                    >
                      {facility}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import Link from 'next/link';
import apiClient from '@/utils/api';
import CenterInfoEditor from './CenterInfoEditor';

interface CenterAdminViewProps {
  centerInfo: any;
  user: any;
}

interface CenterAdminData {
  totalStudents?: number;
  totalInstructors?: number;
  totalCourses?: number;
  totalBookings?: number;
  monthlyRevenue?: number;
  monthlyBookings?: number;
  recentBookings?: any[];
  recentPayments?: any[];
  instructorPerformance?: any[];
  courseStats?: any[];
}

export default function CenterAdminView({ centerInfo, user }: CenterAdminViewProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [centerAdminData, setCenterAdminData] = useState<CenterAdminData>({});
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadCenterAdminData();
  }, []);

  const loadCenterAdminData = async () => {
    try {
      setLoading(true);
      // 센터 운영 통계 데이터 로드
      const [bookingsResponse, paymentsResponse, usersResponse] = await Promise.all([
        apiClient.getBookings(),
        apiClient.getPayments(),
        apiClient.getUsers()
      ]);

      const totalStudents = usersResponse.data?.filter((user: any) => user.userType === 'student').length || 0;
      const totalInstructors = usersResponse.data?.filter((user: any) => user.userType === 'instructor').length || 0;

      setCenterAdminData({
        totalStudents,
        totalInstructors,
        totalCourses: 12,
        totalBookings: bookingsResponse.data?.length || 0,
        monthlyRevenue: 2500000,
        monthlyBookings: 156,
        recentBookings: bookingsResponse.data?.slice(0, 5) || [],
        recentPayments: paymentsResponse.data?.slice(0, 5) || [],
        instructorPerformance: [
          { name: '김수영', students: 24, satisfaction: 4.8, classes: 156 },
          { name: '이영희', students: 18, satisfaction: 4.6, classes: 142 },
          { name: '박철수', students: 22, satisfaction: 4.9, classes: 168 }
        ],
        courseStats: [
          { name: '자유형 초급', students: 45, completion: 78 },
          { name: '자유형 중급', students: 32, completion: 65 },
          { name: '배영 과정', students: 28, completion: 72 },
          { name: '평영 과정', students: 25, completion: 68 }
        ]
      });
    } catch (error) {
      console.error('센터 관리자 데이터 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCenterInfo = (updatedInfo: any) => {
    // 센터 정보 업데이트 후 상태 갱신
    window.location.reload(); // 간단한 방법으로 페이지 새로고침
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <CenterInfoEditor
        centerInfo={centerInfo}
        onSave={handleSaveCenterInfo}
        onCancel={handleCancelEdit}
      />
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* 헤더 */}
      <div className="relative h-64 bg-gradient-to-r from-purple-600 to-indigo-700">
        {centerInfo.images?.mainImage && (
          <img 
            src={centerInfo.images.mainImage} 
            alt={centerInfo.name}
            className="w-full h-full object-cover opacity-20"
          />
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-4">{centerInfo.name}</h1>
            <p className="text-xl opacity-90 mb-2">{centerInfo.shortDescription}</p>
            <p className="text-lg opacity-80">안녕하세요, {user.name} 센터장님! 🏢</p>
          </div>
        </div>
      </div>

      {/* 센터 운영 현황 요약 */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {centerAdminData.totalStudents}
            </div>
            <div className="text-sm text-gray-600">전체 회원</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {centerAdminData.totalInstructors}
            </div>
            <div className="text-sm text-gray-600">전체 강사</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {centerAdminData.totalCourses}
            </div>
            <div className="text-sm text-gray-600">운영 과정</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">
              {centerAdminData.monthlyBookings}
            </div>
            <div className="text-sm text-gray-600">이번 달 수업</div>
          </div>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'overview', label: '📋 개요', icon: '🏠' },
            { id: 'operations', label: '🏢 운영 현황', icon: '📊' },
            { id: 'instructors', label: '👨‍🏫 강사 관리', icon: '👨‍🎓' },
            { id: 'courses', label: '📚 과정 관리', icon: '📖' },
            { id: 'finances', label: '💰 재무 현황', icon: '💳' },
            { id: 'center', label: '🏢 센터 정보', icon: '🏊‍♂️' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* 탭 컨텐츠 */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-purple-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">📊 센터 현황</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">전체 회원:</span>
                    <span className="font-medium text-purple-600">{centerAdminData.totalStudents}명</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">전체 강사:</span>
                    <span className="font-medium text-green-600">{centerAdminData.totalInstructors}명</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">운영 과정:</span>
                    <span className="font-medium text-blue-600">{centerAdminData.totalCourses}개</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">이번 달 수업:</span>
                    <span className="font-medium text-orange-600">{centerAdminData.monthlyBookings}회</span>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">💰 수익 현황</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">이번 달 매출:</span>
                    <span className="font-medium text-green-600">₩{centerAdminData.monthlyRevenue?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">평균 수강료:</span>
                    <span className="font-medium">₩160,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">재등록율:</span>
                    <span className="font-medium text-blue-600">78%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">🚀 빠른 액션</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Link 
                  href="/admin/users"
                  className="bg-purple-600 text-white p-4 rounded-lg text-center hover:bg-purple-700 transition-colors"
                >
                  👥 회원 관리
                </Link>
                <Link 
                  href="/admin/courses"
                  className="bg-green-600 text-white p-4 rounded-lg text-center hover:bg-green-700 transition-colors"
                >
                  📚 과정 관리
                </Link>
                <Link 
                  href="/admin/bookings"
                  className="bg-blue-600 text-white p-4 rounded-lg text-center hover:bg-blue-700 transition-colors"
                >
                  📅 예약 관리
                </Link>
                <Link 
                  href="/admin/payments"
                  className="bg-orange-600 text-white p-4 rounded-lg text-center hover:bg-orange-700 transition-colors"
                >
                  💳 결제 관리
                </Link>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'operations' && (
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">🏢 운영 현황</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">📈 월별 통계</h4>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">신규 회원:</span>
                    <span className="font-medium text-green-600">+12명</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">수업 완료율:</span>
                    <span className="font-medium text-blue-600">92%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">평균 만족도:</span>
                    <span className="font-medium text-purple-600">4.7/5.0</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">🎯 목표 달성</h4>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">매출 목표:</span>
                    <span className="font-medium text-green-600">100% 달성</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">회원 목표:</span>
                    <span className="font-medium text-blue-600">95% 달성</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">만족도 목표:</span>
                    <span className="font-medium text-purple-600">110% 달성</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'instructors' && (
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">👨‍🏫 강사 관리</h3>
            {centerAdminData.instructorPerformance && centerAdminData.instructorPerformance.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {centerAdminData.instructorPerformance.map((instructor: any, index: number) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-2xl">👨‍🏫</span>
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">{instructor.name}</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">담당 학생:</span>
                          <span className="font-medium">{instructor.students}명</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">만족도:</span>
                          <span className="font-medium text-green-600">{instructor.satisfaction}/5.0</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">총 수업:</span>
                          <span className="font-medium">{instructor.classes}회</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>강사 정보가 없습니다.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'courses' && (
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">📚 과정 관리</h3>
            {centerAdminData.courseStats && centerAdminData.courseStats.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {centerAdminData.courseStats.map((course: any, index: number) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">{course.name}</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">수강생:</span>
                        <span className="font-medium">{course.students}명</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">완료율:</span>
                        <span className="font-medium text-green-600">{course.completion}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${course.completion}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>과정 정보가 없습니다.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'finances' && (
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">💰 재무 현황</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">📊 수익 현황</h4>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">이번 달 매출:</span>
                    <span className="font-medium text-green-600">₩{centerAdminData.monthlyRevenue?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">지난 달 대비:</span>
                    <span className="font-medium text-blue-600">+12%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">연간 누적:</span>
                    <span className="font-medium">₩28,500,000</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">💳 결제 현황</h4>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">이번 달 결제:</span>
                    <span className="font-medium text-green-600">156건</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">평균 결제액:</span>
                    <span className="font-medium">₩160,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">결제 성공율:</span>
                    <span className="font-medium text-blue-600">98.5%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'center' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">센터 소개</h3>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                📝 편집하기
              </button>
            </div>
            <div>
              <p className="text-gray-700 leading-relaxed">{centerInfo.description}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">📍 위치 정보</h4>
                <div className="space-y-2 text-gray-700">
                  <p><span className="font-medium">주소:</span> {centerInfo.address}</p>
                  <p><span className="font-medium">전화:</span> {centerInfo.phone}</p>
                  <p><span className="font-medium">이메일:</span> {centerInfo.email}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">🕒 운영시간</h4>
                <div className="space-y-1 text-gray-700">
                  <p><span className="font-medium">월-금:</span> {centerInfo.businessHours?.monday}</p>
                  <p><span className="font-medium">토요일:</span> {centerInfo.businessHours?.saturday}</p>
                  <p><span className="font-medium">일요일:</span> {centerInfo.businessHours?.sunday}</p>
                </div>
              </div>
            </div>

            {centerInfo.facilities && centerInfo.facilities.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">✨ 주요 시설</h4>
                <div className="flex flex-wrap gap-2">
                  {centerInfo.facilities.map((facility: string, index: number) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                    >
                      {facility}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


