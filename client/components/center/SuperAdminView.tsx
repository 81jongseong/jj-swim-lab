'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import apiClient from '@/utils/api';

interface SuperAdminViewProps {
  centerInfo: any;
  user: any;
}

interface SuperAdminData {
  totalCenters?: number;
  totalUsers?: number;
  totalInstructors?: number;
  totalStudents?: number;
  totalCourses?: number;
  totalBookings?: number;
  systemRevenue?: number;
  systemBookings?: number;
  centerStats?: any[];
  userGrowth?: any[];
  recentActivities?: any[];
}

export default function SuperAdminView({ centerInfo, user }: SuperAdminViewProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [superAdminData, setSuperAdminData] = useState<SuperAdminData>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSuperAdminData();
  }, []);

  const loadSuperAdminData = async () => {
    try {
      setLoading(true);
      // 전체 시스템 통계 데이터 로드
      const [usersResponse, bookingsResponse, paymentsResponse] = await Promise.all([
        apiClient.getUsers(),
        apiClient.getBookings(),
        apiClient.getPayments()
      ]);

      const totalUsers = usersResponse.data?.length || 0;
      const totalInstructors = usersResponse.data?.filter((user: any) => user.userType === 'instructor').length || 0;
      const totalStudents = usersResponse.data?.filter((user: any) => user.userType === 'student').length || 0;
      const totalCenterAdmins = usersResponse.data?.filter((user: any) => user.userType === 'centerAdmin').length || 0;

      setSuperAdminData({
        totalCenters: totalCenterAdmins,
        totalUsers,
        totalInstructors,
        totalStudents,
        totalCourses: 48,
        totalBookings: bookingsResponse.data?.length || 0,
        systemRevenue: 12500000,
        systemBookings: 624,
        centerStats: [
          { name: 'JJ Swim Lab 본점', users: 156, revenue: 4500000, satisfaction: 4.8 },
          { name: 'JJ Swim Lab 강남점', users: 98, revenue: 3200000, satisfaction: 4.6 },
          { name: 'JJ Swim Lab 서초점', users: 87, revenue: 2800000, satisfaction: 4.7 },
          { name: 'JJ Swim Lab 마포점', users: 76, revenue: 2000000, satisfaction: 4.5 }
        ],
        userGrowth: [
          { month: '1월', users: 120, growth: 0 },
          { month: '2월', users: 145, growth: 21 },
          { month: '3월', users: 178, growth: 23 },
          { month: '4월', users: 203, growth: 14 },
          { month: '5월', users: 234, growth: 15 },
          { month: '6월', users: 267, growth: 14 }
        ],
        recentActivities: [
          { type: '신규 회원가입', user: '김수영', time: '2시간 전', center: '본점' },
          { type: '수업 예약', user: '이영희', time: '3시간 전', center: '강남점' },
          { type: '결제 완료', user: '박철수', time: '4시간 전', center: '서초점' },
          { type: '강사 등록', user: '최영수', time: '5시간 전', center: '마포점' }
        ]
      });
    } catch (error) {
      console.error('최고 관리자 데이터 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* 헤더 */}
      <div className="relative h-64 bg-gradient-to-r from-red-600 to-pink-700">
        {centerInfo.images?.mainImage && (
          <img 
            src={centerInfo.images.mainImage} 
            alt={centerInfo.name}
            className="w-full h-full object-cover opacity-20"
          />
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-4">JJ Swim Lab 시스템</h1>
            <p className="text-xl opacity-90 mb-2">전체 센터 통합 관리</p>
            <p className="text-lg opacity-80">안녕하세요, {user.name} 최고 관리자님! 👑</p>
          </div>
        </div>
      </div>

      {/* 전체 시스템 현황 요약 */}
      <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 mb-1">
              {superAdminData.totalCenters}
            </div>
            <div className="text-sm text-gray-600">전체 센터</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {superAdminData.totalUsers}
            </div>
            <div className="text-sm text-gray-600">전체 사용자</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {superAdminData.totalCourses}
            </div>
            <div className="text-sm text-gray-600">전체 과정</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">
              {superAdminData.systemBookings}
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
            { id: 'centers', label: '🏢 센터 관리', icon: '📊' },
            { id: 'users', label: '👥 사용자 관리', icon: '👨‍🎓' },
            { id: 'analytics', label: '📈 분석 통계', icon: '📖' },
            { id: 'system', label: '⚙️ 시스템 관리', icon: '💳' },
            { id: 'center', label: '🏢 센터 정보', icon: '🏊‍♂️' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-red-500 text-red-600'
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
              <div className="bg-red-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">📊 시스템 현황</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">전체 센터:</span>
                    <span className="font-medium text-red-600">{superAdminData.totalCenters}개</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">전체 사용자:</span>
                    <span className="font-medium text-green-600">{superAdminData.totalUsers}명</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">전체 강사:</span>
                    <span className="font-medium text-blue-600">{superAdminData.totalInstructors}명</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">전체 회원:</span>
                    <span className="font-medium text-purple-600">{superAdminData.totalStudents}명</span>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">💰 시스템 수익</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">이번 달 매출:</span>
                    <span className="font-medium text-green-600">₩{superAdminData.systemRevenue?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">이번 달 수업:</span>
                    <span className="font-medium text-blue-600">{superAdminData.systemBookings}회</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">평균 센터당:</span>
                    <span className="font-medium">₩3,125,000</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">🚀 빠른 액션</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Link 
                  href="/admin/centers"
                  className="bg-red-600 text-white p-4 rounded-lg text-center hover:bg-red-700 transition-colors"
                >
                  🏢 센터 관리
                </Link>
                <Link 
                  href="/admin/users"
                  className="bg-green-600 text-white p-4 rounded-lg text-center hover:bg-green-700 transition-colors"
                >
                  👥 사용자 관리
                </Link>
                <Link 
                  href="/admin/courses"
                  className="bg-blue-600 text-white p-4 rounded-lg text-center hover:bg-blue-700 transition-colors"
                >
                  📚 과정 관리
                </Link>
                <Link 
                  href="/admin/system"
                  className="bg-purple-600 text-white p-4 rounded-lg text-center hover:bg-purple-700 transition-colors"
                >
                  ⚙️ 시스템 설정
                </Link>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'centers' && (
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">🏢 센터 관리</h3>
            {superAdminData.centerStats && superAdminData.centerStats.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {superAdminData.centerStats.map((center: any, index: number) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">{center.name}</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">사용자:</span>
                        <span className="font-medium">{center.users}명</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">매출:</span>
                        <span className="font-medium text-green-600">₩{center.revenue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">만족도:</span>
                        <span className="font-medium text-blue-600">{center.satisfaction}/5.0</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>센터 정보가 없습니다.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">👥 사용자 관리</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">사용자 분포</h4>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">전체 사용자:</span>
                    <span className="font-medium text-blue-600">{superAdminData.totalUsers}명</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">센터 관리자:</span>
                    <span className="font-medium text-purple-600">{superAdminData.totalCenters}명</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">강사:</span>
                    <span className="font-medium text-green-600">{superAdminData.totalInstructors}명</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">회원:</span>
                    <span className="font-medium text-orange-600">{superAdminData.totalStudents}명</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">사용자 성장</h4>
                <div className="space-y-4">
                  {superAdminData.userGrowth?.slice(-3).map((month: any, index: number) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-gray-600">{month.month}</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{month.users}명</span>
                        {month.growth > 0 && (
                          <span className="text-green-600 text-sm">+{month.growth}%</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">📈 분석 통계</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">시스템 성과</h4>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">전체 매출:</span>
                    <span className="font-medium text-green-600">₩{superAdminData.systemRevenue?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">평균 만족도:</span>
                    <span className="font-medium text-blue-600">4.7/5.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">수업 완료율:</span>
                    <span className="font-medium text-purple-600">89%</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">최근 활동</h4>
                <div className="space-y-3">
                  {superAdminData.recentActivities?.slice(0, 4).map((activity: any, index: number) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <div>
                        <span className="font-medium">{activity.type}</span>
                        <span className="text-gray-600 ml-2">- {activity.user}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-gray-500">{activity.time}</div>
                        <div className="text-blue-600 text-xs">{activity.center}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">⚙️ 시스템 관리</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">시스템 상태</h4>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">서버 상태:</span>
                    <span className="font-medium text-green-600">정상</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">데이터베이스:</span>
                    <span className="font-medium text-green-600">정상</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">업로드 서버:</span>
                    <span className="font-medium text-green-600">정상</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">백업 상태:</span>
                    <span className="font-medium text-blue-600">최근 24시간 내</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">시스템 설정</h4>
                <div className="space-y-4">
                  <Link 
                    href="/admin/system/settings"
                    className="block w-full bg-blue-600 text-white p-3 rounded-lg text-center hover:bg-blue-700 transition-colors"
                  >
                    ⚙️ 시스템 설정
                  </Link>
                  <Link 
                    href="/admin/system/backup"
                    className="block w-full bg-green-600 text-white p-3 rounded-lg text-center hover:bg-green-700 transition-colors"
                  >
                    💾 백업 관리
                  </Link>
                  <Link 
                    href="/admin/system/logs"
                    className="block w-full bg-purple-600 text-white p-3 rounded-lg text-center hover:bg-purple-700 transition-colors"
                  >
                    📋 시스템 로그
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'center' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">센터 소개</h3>
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
                      className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
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

interface SuperAdminViewProps {
  centerInfo: any;
  user: any;
}

interface SuperAdminData {
  totalCenters?: number;
  totalUsers?: number;
  totalInstructors?: number;
  totalStudents?: number;
  totalCourses?: number;
  totalBookings?: number;
  systemRevenue?: number;
  systemBookings?: number;
  centerStats?: any[];
  userGrowth?: any[];
  recentActivities?: any[];
}

export default function SuperAdminView({ centerInfo, user }: SuperAdminViewProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [superAdminData, setSuperAdminData] = useState<SuperAdminData>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSuperAdminData();
  }, []);

  const loadSuperAdminData = async () => {
    try {
      setLoading(true);
      // 전체 시스템 통계 데이터 로드
      const [usersResponse, bookingsResponse, paymentsResponse] = await Promise.all([
        apiClient.getUsers(),
        apiClient.getBookings(),
        apiClient.getPayments()
      ]);

      const totalUsers = usersResponse.data?.length || 0;
      const totalInstructors = usersResponse.data?.filter((user: any) => user.userType === 'instructor').length || 0;
      const totalStudents = usersResponse.data?.filter((user: any) => user.userType === 'student').length || 0;
      const totalCenterAdmins = usersResponse.data?.filter((user: any) => user.userType === 'centerAdmin').length || 0;

      setSuperAdminData({
        totalCenters: totalCenterAdmins,
        totalUsers,
        totalInstructors,
        totalStudents,
        totalCourses: 48,
        totalBookings: bookingsResponse.data?.length || 0,
        systemRevenue: 12500000,
        systemBookings: 624,
        centerStats: [
          { name: 'JJ Swim Lab 본점', users: 156, revenue: 4500000, satisfaction: 4.8 },
          { name: 'JJ Swim Lab 강남점', users: 98, revenue: 3200000, satisfaction: 4.6 },
          { name: 'JJ Swim Lab 서초점', users: 87, revenue: 2800000, satisfaction: 4.7 },
          { name: 'JJ Swim Lab 마포점', users: 76, revenue: 2000000, satisfaction: 4.5 }
        ],
        userGrowth: [
          { month: '1월', users: 120, growth: 0 },
          { month: '2월', users: 145, growth: 21 },
          { month: '3월', users: 178, growth: 23 },
          { month: '4월', users: 203, growth: 14 },
          { month: '5월', users: 234, growth: 15 },
          { month: '6월', users: 267, growth: 14 }
        ],
        recentActivities: [
          { type: '신규 회원가입', user: '김수영', time: '2시간 전', center: '본점' },
          { type: '수업 예약', user: '이영희', time: '3시간 전', center: '강남점' },
          { type: '결제 완료', user: '박철수', time: '4시간 전', center: '서초점' },
          { type: '강사 등록', user: '최영수', time: '5시간 전', center: '마포점' }
        ]
      });
    } catch (error) {
      console.error('최고 관리자 데이터 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* 헤더 */}
      <div className="relative h-64 bg-gradient-to-r from-red-600 to-pink-700">
        {centerInfo.images?.mainImage && (
          <img 
            src={centerInfo.images.mainImage} 
            alt={centerInfo.name}
            className="w-full h-full object-cover opacity-20"
          />
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-4">JJ Swim Lab 시스템</h1>
            <p className="text-xl opacity-90 mb-2">전체 센터 통합 관리</p>
            <p className="text-lg opacity-80">안녕하세요, {user.name} 최고 관리자님! 👑</p>
          </div>
        </div>
      </div>

      {/* 전체 시스템 현황 요약 */}
      <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 mb-1">
              {superAdminData.totalCenters}
            </div>
            <div className="text-sm text-gray-600">전체 센터</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {superAdminData.totalUsers}
            </div>
            <div className="text-sm text-gray-600">전체 사용자</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {superAdminData.totalCourses}
            </div>
            <div className="text-sm text-gray-600">전체 과정</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">
              {superAdminData.systemBookings}
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
            { id: 'centers', label: '🏢 센터 관리', icon: '📊' },
            { id: 'users', label: '👥 사용자 관리', icon: '👨‍🎓' },
            { id: 'analytics', label: '📈 분석 통계', icon: '📖' },
            { id: 'system', label: '⚙️ 시스템 관리', icon: '💳' },
            { id: 'center', label: '🏢 센터 정보', icon: '🏊‍♂️' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-red-500 text-red-600'
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
              <div className="bg-red-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">📊 시스템 현황</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">전체 센터:</span>
                    <span className="font-medium text-red-600">{superAdminData.totalCenters}개</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">전체 사용자:</span>
                    <span className="font-medium text-green-600">{superAdminData.totalUsers}명</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">전체 강사:</span>
                    <span className="font-medium text-blue-600">{superAdminData.totalInstructors}명</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">전체 회원:</span>
                    <span className="font-medium text-purple-600">{superAdminData.totalStudents}명</span>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">💰 시스템 수익</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">이번 달 매출:</span>
                    <span className="font-medium text-green-600">₩{superAdminData.systemRevenue?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">이번 달 수업:</span>
                    <span className="font-medium text-blue-600">{superAdminData.systemBookings}회</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">평균 센터당:</span>
                    <span className="font-medium">₩3,125,000</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">🚀 빠른 액션</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Link 
                  href="/admin/centers"
                  className="bg-red-600 text-white p-4 rounded-lg text-center hover:bg-red-700 transition-colors"
                >
                  🏢 센터 관리
                </Link>
                <Link 
                  href="/admin/users"
                  className="bg-green-600 text-white p-4 rounded-lg text-center hover:bg-green-700 transition-colors"
                >
                  👥 사용자 관리
                </Link>
                <Link 
                  href="/admin/courses"
                  className="bg-blue-600 text-white p-4 rounded-lg text-center hover:bg-blue-700 transition-colors"
                >
                  📚 과정 관리
                </Link>
                <Link 
                  href="/admin/system"
                  className="bg-purple-600 text-white p-4 rounded-lg text-center hover:bg-purple-700 transition-colors"
                >
                  ⚙️ 시스템 설정
                </Link>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'centers' && (
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">🏢 센터 관리</h3>
            {superAdminData.centerStats && superAdminData.centerStats.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {superAdminData.centerStats.map((center: any, index: number) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">{center.name}</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">사용자:</span>
                        <span className="font-medium">{center.users}명</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">매출:</span>
                        <span className="font-medium text-green-600">₩{center.revenue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">만족도:</span>
                        <span className="font-medium text-blue-600">{center.satisfaction}/5.0</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>센터 정보가 없습니다.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">👥 사용자 관리</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">사용자 분포</h4>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">전체 사용자:</span>
                    <span className="font-medium text-blue-600">{superAdminData.totalUsers}명</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">센터 관리자:</span>
                    <span className="font-medium text-purple-600">{superAdminData.totalCenters}명</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">강사:</span>
                    <span className="font-medium text-green-600">{superAdminData.totalInstructors}명</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">회원:</span>
                    <span className="font-medium text-orange-600">{superAdminData.totalStudents}명</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">사용자 성장</h4>
                <div className="space-y-4">
                  {superAdminData.userGrowth?.slice(-3).map((month: any, index: number) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-gray-600">{month.month}</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{month.users}명</span>
                        {month.growth > 0 && (
                          <span className="text-green-600 text-sm">+{month.growth}%</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">📈 분석 통계</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">시스템 성과</h4>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">전체 매출:</span>
                    <span className="font-medium text-green-600">₩{superAdminData.systemRevenue?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">평균 만족도:</span>
                    <span className="font-medium text-blue-600">4.7/5.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">수업 완료율:</span>
                    <span className="font-medium text-purple-600">89%</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">최근 활동</h4>
                <div className="space-y-3">
                  {superAdminData.recentActivities?.slice(0, 4).map((activity: any, index: number) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <div>
                        <span className="font-medium">{activity.type}</span>
                        <span className="text-gray-600 ml-2">- {activity.user}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-gray-500">{activity.time}</div>
                        <div className="text-blue-600 text-xs">{activity.center}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">⚙️ 시스템 관리</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">시스템 상태</h4>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">서버 상태:</span>
                    <span className="font-medium text-green-600">정상</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">데이터베이스:</span>
                    <span className="font-medium text-green-600">정상</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">업로드 서버:</span>
                    <span className="font-medium text-green-600">정상</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">백업 상태:</span>
                    <span className="font-medium text-blue-600">최근 24시간 내</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">시스템 설정</h4>
                <div className="space-y-4">
                  <Link 
                    href="/admin/system/settings"
                    className="block w-full bg-blue-600 text-white p-3 rounded-lg text-center hover:bg-blue-700 transition-colors"
                  >
                    ⚙️ 시스템 설정
                  </Link>
                  <Link 
                    href="/admin/system/backup"
                    className="block w-full bg-green-600 text-white p-3 rounded-lg text-center hover:bg-green-700 transition-colors"
                  >
                    💾 백업 관리
                  </Link>
                  <Link 
                    href="/admin/system/logs"
                    className="block w-full bg-purple-600 text-white p-3 rounded-lg text-center hover:bg-purple-700 transition-colors"
                  >
                    📋 시스템 로그
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'center' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">센터 소개</h3>
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
                      className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
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


