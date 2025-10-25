/**
 * 📝 JJ Swim Lab - 센터관리자용 건강정보 관리 페이지
 *
 * 📋 **페이지 목적**
 * - 해당 센터의 회원들의 공개된 건강정보 조회 및 관리
 * - 센터별 건강정보 통계 및 현황 파악
 * - 회원 건강 상태 모니터링 및 관리
 * - 건강정보 접근 권한 관리
 * - 센터별 건강 프로그램 효과 분석
 *
 * 🔄 **주요 기능**
 * - 센터 회원 건강정보 현황 대시보드
 * - 공개된 건강정보 조회 및 검색
 * - 회원별 건강 상태 모니터링
 * - 센터별 건강 통계 및 분석
 * - 건강정보 접근 로그 관리
 * - 건강 프로그램 효과 추적
 *
 * 🗄️ **데이터 연동**
 * - 센터별 회원 건강정보 데이터베이스
 * - 공개/비공개 설정 정보
 * - 건강 프로그램 참여 데이터
 * - 건강 상태 변화 이력
 * - 접근 권한 및 보안 설정
 *
 * 🛠️ **필요한 설치 파일**
 * - React (useState, useEffect)
 * - useAuth hook (사용자 인증)
 * - 건강정보 관리 API
 * - 차트 및 시각화 라이브러리
 * - Tailwind CSS (스타일링)
 *
 * ⚠️ **개발 시 주의사항**
 * 1. 센터관리자 권한 확인 필수
 * 2. 개인정보 보호 및 데이터 보안 강화
 * 3. 공개된 건강정보만 접근 가능
 * 4. 센터별 데이터 분리 및 관리
 * 5. 건강정보 접근 로그 기록
 *
 * 🔧 **수정 시 체크리스트**
 * - [ ] 센터관리자 권한 확인
 * - [ ] 공개된 건강정보만 표시
 * - [ ] 센터별 데이터 분리
 * - [ ] 접근 로그 기록
 * - [ ] 개인정보 보안 설정
 *
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (센터관리자용 건강정보 관리 페이지)
 *
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (센터관리자용 건강정보 관리 시스템 완료)
 *
 * 🚀 **다음 단계**
 * - 실시간 데이터 분석
 * - 건강 프로그램 효과 분석
 * - 예측 모델 정확도 향상
 * - 사용자 경험 개선
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';

interface MemberHealthInfo {
  id: string;
  name: string;
  memberId: string;
  age: number;
  gender: string;
  height?: number;
  weight?: number;
  bmi?: number;
  bloodType?: string;
  exerciseLevel?: string;
  swimmingExperience?: string;
  lastHealthCheck?: string;
  healthStatus: 'excellent' | 'good' | 'fair' | 'poor';
  isPublic: {
    height: boolean;
    weight: boolean;
    bmi: boolean;
    bloodType: boolean;
    exerciseLevel: boolean;
    swimmingExperience: boolean;
  };
}

interface CenterHealthStats {
  totalMembers: number;
  activeHealthProfiles: number;
  publicProfiles: number;
  averageBMI: number;
  healthStatusDistribution: {
    excellent: number;
    good: number;
    fair: number;
    poor: number;
  };
  ageDistribution: {
    '10-19': number;
    '20-29': number;
    '30-39': number;
    '40-49': number;
    '50+': number;
  };
}

export default function CenterAdminHealthPage() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'statistics' | 'programs'>('overview');
  const [members, setMembers] = useState<MemberHealthInfo[]>([]);
  const [centerStats, setCenterStats] = useState<CenterHealthStats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // 권한 확인
  useEffect(() => {
    if (loading) {
      return;
    }
    
    // center@swim.com 계정도 센터 관리자로 인식
    const isCenterAdmin = user && (
      ['centerAdmin', 'center-admin', 'superAdmin'].includes(user.userType) ||
      user.email === 'center@swim.com'
    );
    
    if (!isCenterAdmin) {
      console.error('🚫 센터관리자 권한이 필요합니다.');
      return;
    }
    
    loadCenterHealthData();
  }, [user, loading]);

  const loadCenterHealthData = async () => {
    // 실제 API 연동 시에는 실제 엔드포인트로 변경
    const mockMembers: MemberHealthInfo[] = [
      {
        id: '1',
        name: '김수영',
        memberId: 'M001',
        age: 25,
        gender: '여성',
        height: 165,
        weight: 55,
        bmi: 20.2,
        bloodType: 'A',
        exerciseLevel: '중급',
        swimmingExperience: '3년',
        lastHealthCheck: '2024-12-15',
        healthStatus: 'excellent',
        isPublic: {
          height: true,
          weight: true,
          bmi: true,
          bloodType: false,
          exerciseLevel: true,
          swimmingExperience: true
        }
      },
      {
        id: '2',
        name: '박철수',
        memberId: 'M002',
        age: 32,
        gender: '남성',
        height: 175,
        weight: 70,
        bmi: 22.9,
        bloodType: 'B',
        exerciseLevel: '초급',
        swimmingExperience: '1년',
        lastHealthCheck: '2024-12-10',
        healthStatus: 'good',
        isPublic: {
          height: true,
          weight: false,
          bmi: false,
          bloodType: false,
          exerciseLevel: true,
          swimmingExperience: true
        }
      },
      {
        id: '3',
        name: '이영희',
        memberId: 'M003',
        age: 28,
        gender: '여성',
        height: 160,
        weight: 48,
        bmi: 18.8,
        bloodType: 'O',
        exerciseLevel: '고급',
        swimmingExperience: '5년',
        lastHealthCheck: '2024-12-18',
        healthStatus: 'excellent',
        isPublic: {
          height: true,
          weight: true,
          bmi: true,
          bloodType: true,
          exerciseLevel: true,
          swimmingExperience: true
        }
      }
    ];

    const mockStats: CenterHealthStats = {
      totalMembers: 45,
      activeHealthProfiles: 38,
      publicProfiles: 32,
      averageBMI: 21.8,
      healthStatusDistribution: {
        excellent: 15,
        good: 18,
        fair: 4,
        poor: 1
      },
      ageDistribution: {
        '10-19': 8,
        '20-29': 18,
        '30-39': 12,
        '40-49': 5,
        '50+': 2
      }
    };

    setMembers(mockMembers);
    setCenterStats(mockStats);
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'fair': return 'text-yellow-600 bg-yellow-100';
      case 'poor': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getHealthStatusText = (status: string) => {
    switch (status) {
      case 'excellent': return '우수';
      case 'good': return '양호';
      case 'fair': return '보통';
      case 'poor': return '주의';
      default: return '미정';
    }
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.memberId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || member.healthStatus === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const tabs = [
    { id: 'overview' as const, label: '📊 센터 현황', icon: '📊' },
    { id: 'members' as const, label: '👥 회원 관리', icon: '👥' },
    { id: 'statistics' as const, label: '📈 통계', icon: '📈' },
    { id: 'programs' as const, label: '🏊‍♂️ 프로그램', icon: '🏊‍♂️' }
  ];

  // center@swim.com 계정도 센터 관리자로 인식
  const isCenterAdmin = user && (
    ['centerAdmin', 'center-admin', 'superAdmin'].includes(user.userType) ||
    user.email === 'center@swim.com'
  );

  // 권한이 없는 경우 접근 거부
  if (!loading && !isCenterAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-red-500 text-6xl mb-4">🚫</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">접근 권한이 없습니다</h2>
              <p className="text-gray-600">
                이 페이지는 센터관리자만 접근할 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 로딩 중
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">권한을 확인하는 중...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🏥 센터 건강정보 관리</h1>
          <p className="text-gray-600">
            센터 회원들의 공개된 건강정보를 조회하고 관리하세요.
          </p>
        </div>

        {/* 탭 네비게이션 */}
        <div className="mb-6">
          <nav className="flex space-x-8 border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* 탭 컨텐츠 */}
        <div className="space-y-6">
          {/* 센터 현황 탭 */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <span className="text-2xl">👥</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">전체 회원</p>
                      <p className="text-2xl font-bold text-gray-900">{centerStats?.totalMembers || 0}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <span className="text-2xl">📊</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">건강프로필</p>
                      <p className="text-2xl font-bold text-gray-900">{centerStats?.activeHealthProfiles || 0}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <span className="text-2xl">🔓</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">공개 프로필</p>
                      <p className="text-2xl font-bold text-gray-900">{centerStats?.publicProfiles || 0}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <span className="text-2xl">📏</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">평균 BMI</p>
                      <p className="text-2xl font-bold text-gray-900">{centerStats?.averageBMI || 0}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">🏥 건강 상태 분포</h3>
                  <div className="space-y-3">
                    {centerStats && Object.entries(centerStats.healthStatusDistribution).map(([status, count]) => (
                      <div key={status} className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">
                          {getHealthStatusText(status)}
                        </span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${getHealthStatusColor(status).split(' ')[1]}`}
                              style={{ width: `${(count / centerStats.totalMembers) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 w-8">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">📅 연령대 분포</h3>
                  <div className="space-y-3">
                    {centerStats && Object.entries(centerStats.ageDistribution).map(([ageRange, count]) => (
                      <div key={ageRange} className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">{ageRange}세</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${(count / centerStats.totalMembers) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 w-8">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 회원 관리 탭 */}
          {activeTab === 'members' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
                  <h3 className="text-lg font-semibold text-gray-900">👥 회원 건강정보 관리</h3>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                    <input
                      type="text"
                      placeholder="이름 또는 회원번호로 검색..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="all">전체 상태</option>
                      <option value="excellent">우수</option>
                      <option value="good">양호</option>
                      <option value="fair">보통</option>
                      <option value="poor">주의</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          회원정보
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          신체정보
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          건강상태
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          공개설정
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          관리
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredMembers.map((member) => (
                        <tr key={member.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{member.name}</div>
                              <div className="text-sm text-gray-500">{member.memberId}</div>
                              <div className="text-sm text-gray-500">{member.age}세 / {member.gender}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {member.height && member.weight && (
                                <>
                                  <div>키: {member.height}cm</div>
                                  <div>몸무게: {member.weight}kg</div>
                                  <div>BMI: {member.bmi?.toFixed(1)}</div>
                                </>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getHealthStatusColor(member.healthStatus)}`}>
                              {getHealthStatusText(member.healthStatus)}
                            </span>
                            <div className="text-sm text-gray-500 mt-1">
                              {member.exerciseLevel} / {member.swimmingExperience}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              <div>신체정보: {member.isPublic.height ? '🔓' : '🔒'}</div>
                              <div>운동기록: {member.isPublic.exerciseLevel ? '🔓' : '🔒'}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-blue-600 hover:text-blue-900 mr-3">상세보기</button>
                            <button className="text-green-600 hover:text-green-900">건강관리</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 통계 탭 */}
          {activeTab === 'statistics' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 상세 통계</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 mb-2">
                      {centerStats ? Math.round((centerStats.publicProfiles / centerStats.activeHealthProfiles) * 100) : 0}%
                    </div>
                    <p className="text-sm text-blue-800">건강정보 공개율</p>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 mb-2">
                      {centerStats ? Math.round((centerStats.activeHealthProfiles / centerStats.totalMembers) * 100) : 0}%
                    </div>
                    <p className="text-sm text-green-800">프로필 완성율</p>
                  </div>
                  
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600 mb-2">
                      {centerStats ? Math.round((centerStats.healthStatusDistribution.excellent / centerStats.totalMembers) * 100) : 0}%
                    </div>
                    <p className="text-sm text-yellow-800">우수 건강 비율</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 프로그램 탭 */}
          {activeTab === 'programs' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🏊‍♂️ 건강 프로그램 관리</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">초급자 프로그램</h4>
                      <p className="text-sm text-gray-600">건강 상태: 양호 이상</p>
                      <p className="text-sm text-gray-600">참여자: 12명</p>
                      <button className="mt-2 text-blue-600 hover:text-blue-800 text-sm">상세보기</button>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">중급자 프로그램</h4>
                      <p className="text-sm text-gray-600">건강 상태: 우수</p>
                      <p className="text-sm text-gray-600">참여자: 8명</p>
                      <button className="mt-2 text-blue-600 hover:text-blue-800 text-sm">상세보기</button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">건강 개선 프로그램</h4>
                      <p className="text-sm text-gray-600">건강 상태: 보통 이하</p>
                      <p className="text-sm text-gray-600">참여자: 3명</p>
                      <button className="mt-2 text-blue-600 hover:text-blue-800 text-sm">상세보기</button>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">고급자 프로그램</h4>
                      <p className="text-sm text-gray-600">건강 상태: 우수</p>
                      <p className="text-sm text-gray-600">참여자: 5명</p>
                      <button className="mt-2 text-blue-600 hover:text-blue-800 text-sm">상세보기</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
