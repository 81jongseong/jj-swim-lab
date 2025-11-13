/**
 * 🏢 센터 관리 탭 컴포넌트
 * @description 센터 정보 관리 페이지에 통합될 센터 관리 기능
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import apiClient from '../../../utils/api';
import RegionNavigation from '@/components/RegionNavigation';
import StatCard from '@/components/StatCard';
import Button from '@/components/Button';

interface Center {
  _id: string;
  name: string;
  shortDescription: string;
  description: string;
  status: 'active' | 'inactive' | 'suspended' | 'maintenance';
  grade: 'bronze' | 'silver' | 'gold' | 'platinum';
  contact: {
    email: string;
    phone: string;
  };
  address: {
    address1: string;
    address2?: string;
    city: string;
    province: string;
    postalCode: string;
  };
  poolInfo: {
    size: {
      length: number;
      width: number;
      depth: number;
    };
    capacity: number;
  };
  operatingHours: {
    weekdays: { open: string; close: string };
    weekends: { open: string; close: string };
  };
  facilities: string[];
  parkingAvailable: boolean;
  createdAt: string;
  stats?: {
    userCount: number;
    recentRegistrations: number;
  };
  performance?: {
    memberCount: number;
    instructorCount: number;
    customerSatisfaction: number;
    operatingMonths: number;
  };
}

interface CenterStats {
  centers: {
    total: number;
    active: number;
    inactive: number;
    suspended: number;
    maintenance: number;
  };
  users: {
    total: number;
    students: number;
    instructors: number;
    centerAdmins: number;
    superAdmins: number;
  };
  recentRegistrations: number;
}

export default function CenterManagementTab() {
  const { user } = useAuth();
  const [centers, setCenters] = useState<Center[]>([]);
  const [stats, setStats] = useState<CenterStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCenter, setSelectedCenter] = useState<Center | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [selectedCenters, setSelectedCenters] = useState<string[]>([]);
  
  const [showAssignAdminModal, setShowAssignAdminModal] = useState(false);
  const [centerAdmins, setCenterAdmins] = useState<Array<{ _id: string; name: string; email: string; managedCentersCount: number }>>([]);
  const [selectedAdminId, setSelectedAdminId] = useState<string>('');

  const centerData = {
    '서울특별시': {
      '강남구': ['강남센터', '역삼센터', '논현센터', '삼성센터'],
      '강동구': ['강동센터', '천호센터', '성내센터'],
      '강북구': ['강북센터', '수유센터'],
      '강서구': ['강서센터', '화곡센터', '등촌센터'],
      '관악구': ['관악센터', '신림센터', '서원센터'],
      '광진구': ['광진센터', '구의센터', '자양센터'],
      '구로구': ['구로센터', '가리봉센터', '신도림센터'],
      '금천구': ['금천센터', '시흥센터'],
      '노원구': ['노원센터', '상계센터', '중계센터'],
      '도봉구': ['도봉센터', '쌍문센터'],
      '동대문구': ['동대문센터', '청량리센터', '회기센터'],
      '동작구': ['동작센터', '사당센터', '대방센터'],
      '마포구': ['마포센터', '홍대센터', '공덕센터', '상암센터'],
      '서대문구': ['서대문센터', '신촌센터', '연희센터'],
      '서초구': ['서초센터', '방배센터', '내곡센터'],
      '성동구': ['성동센터', '왕십리센터', '마장센터'],
      '성북구': ['성북센터', '돈암센터', '안암센터'],
      '송파구': ['송파센터', '잠실센터', '문정센터', '가락센터'],
      '양천구': ['양천센터', '목동센터', '신정센터'],
      '영등포구': ['영등포센터', '여의도센터', '당산센터'],
      '용산구': ['용산센터', '이촌센터', '한남센터'],
      '은평구': ['은평센터', '불광센터', '진관센터'],
      '종로구': ['종로센터', '혜화센터', '이화센터'],
      '중구': ['중구센터', '명동센터', '을지로센터'],
      '중랑구': ['중랑센터', '상봉센터', '망우센터']
    }
  };

  useEffect(() => {
    loadCenters();
    loadStats();
    loadCenterAdmins();
  }, [currentPage, searchTerm, statusFilter, gradeFilter, selectedRegions, selectedDistricts]);

  const loadCenters = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (gradeFilter !== 'all') params.append('grade', gradeFilter);

      const response = await apiClient.get<{
        success: boolean;
        data?: {
          centers: any[];
          pagination: { total: number };
        };
        message?: string;
      }>(`/api/center-management?${params}`).catch(error => {
        console.warn('센터 목록 API 호출 실패:', error);
        return { success: false, data: { centers: [], pagination: { total: 0 } } };
      });
      
      if ((response as any).success) {
        let filteredCenters = (response as any).data.centers;
        
        if (gradeFilter !== 'all') {
          filteredCenters = filteredCenters.filter((center: any) => 
            center.grade === gradeFilter
          );
        }
        
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          filteredCenters = filteredCenters.filter((center: any) => 
            center.name?.toLowerCase().includes(searchLower) ||
            center.contact?.email?.toLowerCase().includes(searchLower) ||
            center.address?.address1?.toLowerCase().includes(searchLower) ||
            center.address?.city?.toLowerCase().includes(searchLower) ||
            center.address?.province?.toLowerCase().includes(searchLower)
          );
        }
        
        setCenters(filteredCenters);
        setTotalPages(Math.ceil(filteredCenters.length / 10));
      } else {
        setError((response as any).message || '센터 목록을 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('센터 목록 로딩 오류:', error);
      setError('센터 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data?: CenterStats;
      }>('/api/center-management/stats/overview');
      if ((response as any).success) {
        setStats((response as any).data);
      }
    } catch (error) {
      console.error('센터 통계 로딩 오류:', error);
    }
  };

  const loadCenterAdmins = async () => {
    try {
      const response = await apiClient.get('/api/center-management/admins');
      if (response.success && response.data && 'admins' in response.data && Array.isArray(response.data.admins)) {
        setCenterAdmins(response.data.admins);
      }
    } catch (error) {
      console.error('센터 관리자 목록 로드 실패:', error);
    }
  };

  const handleStatusChange = async (centerId: string, newStatus: string, reason?: string) => {
    try {
      const response = await apiClient.patch(`/api/center-management/${centerId}/status`, { 
        status: newStatus, 
        reason: reason || '상태 변경'
      });
      
      if (response.success) {
        await loadCenters();
        alert('센터 상태가 변경되었습니다.');
      } else {
        alert(response.message || '상태 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('상태 변경 오류:', error);
      alert('상태 변경 중 오류가 발생했습니다.');
    }
  };

  const handleAssignAdmin = async () => {
    if (!selectedCenter || !selectedAdminId) {
      alert('센터와 관리자를 선택해주세요.');
      return;
    }

    try {
      const response = await apiClient.post(`/api/center-management/centers/${selectedCenter._id}/assign-admin`, {
        adminId: selectedAdminId
      });

      if (response.success) {
        alert('센터 관리자 할당이 완료되었습니다.');
        setShowAssignAdminModal(false);
        setSelectedAdminId('');
        loadCenters();
        loadCenterAdmins();
      } else {
        alert(response.message || '관리자 할당에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('관리자 할당 실패:', error);
      alert(error.message || '관리자 할당 중 오류가 발생했습니다.');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadCenters();
  };

  const handleRegionToggle = (region: string) => {
    setSelectedRegions(prev => {
      if (prev.includes(region)) {
        return prev.filter(r => r !== region);
      } else {
        return [...prev, region];
      }
    });
  };

  const handleDistrictToggle = (district: string) => {
    setSelectedDistricts(prev =>
      prev.includes(district) ? prev.filter(d => d !== district) : [...prev, district]
    );
  };

  const handleCenterToggle = (center: string) => {
    setSelectedCenters(prev =>
      prev.includes(center) ? prev.filter(c => c !== center) : [...prev, center]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusKorean = (status: string) => {
    switch (status) {
      case 'active': return '✅ 활성';
      case 'inactive': return '❌ 비활성';
      case 'suspended': return '🚫 정지';
      case 'maintenance': return '🔧 점검중';
      default: return status;
    }
  };

  const getCenterGradeColor = (grade: string) => {
    switch (grade) {
      case 'bronze': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'silver': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'gold': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'platinum': return 'bg-purple-100 text-purple-800 border-purple-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getCenterGradeKorean = (grade: string) => {
    switch (grade) {
      case 'bronze': return '⭐ 1급 센터';
      case 'silver': return '⭐⭐ 2급 센터';
      case 'gold': return '⭐⭐⭐ 3급 센터';
      case 'platinum': return '⭐⭐⭐⭐ 특급 센터';
      default: return grade;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 통계 카드 */}
      {stats && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="전체 센터"
            value={stats.centers.total}
            icon="🏢"
            color="blue"
            subtitle="등록된 센터"
            href="/admin/center-management"
          />
          <StatCard
            title="활성 센터"
            value={stats.centers.active}
            icon="✅"
            color="green"
            subtitle="운영 중인 센터"
            href="/admin/center-management"
          />
          <StatCard
            title="전체 사용자"
            value={stats.users.total}
            icon="👥"
            color="purple"
            subtitle="등록된 사용자"
            href="/admin/users"
          />
          <StatCard
            title="최근 신청"
            value={stats.recentRegistrations}
            icon="📝"
            color="orange"
            subtitle="신규 등록"
            href="/admin/approvals"
          />
        </div>
      )}

      {/* 지역 필터 */}
      <RegionNavigation
        selectedRegions={selectedRegions}
        setSelectedRegions={setSelectedRegions}
        selectedDistricts={selectedDistricts}
        setSelectedDistricts={setSelectedDistricts}
        selectedCenters={selectedCenters}
        setSelectedCenters={setSelectedCenters}
        centerData={centerData}
        comparisonMode={false}
        layout="dropdown"
      />

      {/* 검색 및 필터 */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <form onSubmit={handleSearch} className="flex flex-col gap-4">
          <div>
            <input
              type="text"
              placeholder="센터명, 이메일, 주소, 지역으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="md:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">모든 상태</option>
                <option value="active">✅ 활성</option>
                <option value="inactive">❌ 비활성</option>
                <option value="suspended">🚫 정지</option>
                <option value="maintenance">🔧 점검중</option>
              </select>
            </div>
            
            <div className="md:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-1">등급</label>
              <select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">모든 등급</option>
                <option value="bronze">⭐ 1급 센터</option>
                <option value="silver">⭐⭐ 2급 센터</option>
                <option value="gold">⭐⭐⭐ 3급 센터</option>
                <option value="platinum">⭐⭐⭐⭐ 특급 센터</option>
              </select>
            </div>
            
            <div className="flex items-end gap-2">
              <Button type="submit" variant="primary" size="md">
                🔍 검색
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setSelectedRegions([]);
                  setSelectedDistricts([]);
                  setGradeFilter('all');
                  setCurrentPage(1);
                }}
              >
                🔄 초기화
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* 센터 목록 */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">센터 목록</h2>
        
        {error && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-red-600">
              <p className="text-lg font-medium mb-2">데이터를 불러오는데 실패했습니다</p>
              <p className="text-sm mb-4">{error}</p>
              <Button
                onClick={loadCenters}
                variant="danger"
                size="md"
              >
                🔄 다시 시도
              </Button>
            </div>
          </div>
        )}

        {centers.length === 0 && !loading && !error ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-gray-500">
              <p className="text-lg font-medium">등록된 센터가 없습니다</p>
              <p className="text-sm">새로운 센터 등록을 기다리고 있습니다.</p>
            </div>
          </div>
        ) : !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {centers.map((center) => (
              <div 
                key={center._id} 
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 cursor-pointer hover:scale-105 hover:border-blue-400"
                onClick={() => {
                  setSelectedCenter(center);
                  setShowModal(true);
                }}
              >
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center flex-1">
                      <div className="flex-shrink-0 h-12 w-12">
                        <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
                          {center.name}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-1">
                          {center.shortDescription || `${center.address.city} ${center.address.province}`}
                        </p>
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0 space-y-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(center.status)}`}>
                        {getStatusKorean(center.status)}
                      </span>
                      <div className={`inline-flex px-2 py-1 text-xs font-bold rounded-md border ${getCenterGradeColor(center.grade)}`}>
                        {getCenterGradeKorean(center.grade)}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <div className="ml-3">
                        <p className="text-sm text-gray-900">{center.contact.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <div className="ml-3">
                        <p className="text-sm text-gray-900">{center.contact.phone}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <div className="ml-3">
                        <p className="text-sm text-gray-900 line-clamp-1">{center.address.address1}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <div className="ml-3">
                        <p className="text-sm text-gray-900">{new Date(center.createdAt).toLocaleDateString('ko-KR')}</p>
                      </div>
                    </div>
                    
                    {center.performance && (
                      <div className="bg-blue-50 rounded-lg p-3 mb-3">
                        <h4 className="text-xs font-bold text-blue-800 mb-2">📊 센터 성과</h4>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>회원: {center.performance.memberCount}명</div>
                          <div>강사: {center.performance.instructorCount}명</div>
                          <div>만족도: ⭐{center.performance.customerSatisfaction}/5.0</div>
                          <div>운영: {Math.floor(center.performance.operatingMonths/12)}년 {center.performance.operatingMonths%12}개월</div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900">{center.stats?.userCount || 0}</div>
                        <div className="text-xs text-gray-500">사용자</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900">{center.stats?.recentRegistrations || 0}</div>
                        <div className="text-xs text-gray-500">최근 신청</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900">{center.facilities?.length || 0}</div>
                        <div className="text-xs text-gray-500">시설</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="px-6 py-4 bg-gray-50 rounded-b-lg">
                  <div className="flex gap-2 mb-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCenter(center);
                        setShowModal(true);
                      }}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                    >
                      📋 상세보기
                    </button>
                    <div className="flex-1">
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            handleStatusChange(center._id, e.target.value);
                            e.target.value = '';
                          }
                        }}
                        className="w-full px-3 py-2 text-xs font-medium bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors"
                      >
                        <option value="">⚙️ 상태 변경</option>
                        <option value="active">▶️ 활성</option>
                        <option value="inactive">⏸️ 비활성</option>
                        <option value="suspended">🚫 정지</option>
                        <option value="maintenance">🔧 점검중</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCenter(center);
                        setShowAssignAdminModal(true);
                        setSelectedAdminId('');
                      }}
                      className="flex-1 px-3 py-2 text-xs font-medium bg-green-100 text-green-800 rounded-md hover:bg-green-200 transition-colors"
                      title="센터 관리자 할당"
                    >
                      👤 관리자 할당
                    </button>
                    <div className="flex-1">
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            const reason = prompt(`센터 등급을 ${getCenterGradeKorean(e.target.value)}로 변경하는 이유를 입력하세요:`);
                            if (reason) {
                              console.log(`센터 등급 변경: ${center._id} → ${e.target.value}, 사유: ${reason}`);
                              alert(`센터 등급이 ${getCenterGradeKorean(e.target.value)}로 변경되었습니다.`);
                            }
                            e.target.value = '';
                          }
                        }}
                        className="w-full px-3 py-2 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200 transition-colors"
                      >
                        <option value="">🏆 등급 변경</option>
                        <option value="bronze">⭐ 1급 센터</option>
                        <option value="silver">⭐⭐ 2급 센터</option>
                        <option value="gold">⭐⭐⭐ 3급 센터</option>
                        <option value="platinum">⭐⭐⭐⭐ 특급 센터</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                페이지 {currentPage} / {totalPages}
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                  size="sm"
                >
                  이전
                </Button>
                <Button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  size="sm"
                >
                  다음
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 센터 상세 모달 */}
      {showModal && selectedCenter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">{selectedCenter.name}</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">기본 정보</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">센터명</label>
                      <p className="text-sm text-gray-900">{selectedCenter.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">설명</label>
                      <p className="text-sm text-gray-900">{selectedCenter.description}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">상태</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedCenter.status)}`}>
                        {getStatusKorean(selectedCenter.status)}
                      </span>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">센터 등급</label>
                      <div className={`inline-flex px-3 py-2 text-sm font-bold rounded-lg border-2 ${getCenterGradeColor(selectedCenter.grade)}`}>
                        {getCenterGradeKorean(selectedCenter.grade)}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">연락처 정보</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">이메일</label>
                      <p className="text-sm text-gray-900">{selectedCenter.contact.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">전화번호</label>
                      <p className="text-sm text-gray-900">{selectedCenter.contact.phone}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">주소</label>
                      <p className="text-sm text-gray-900">
                        {selectedCenter.address.address1} {selectedCenter.address.address2 || ''}
                        <br />
                        {selectedCenter.address.city} {selectedCenter.address.province} {selectedCenter.address.postalCode}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">시설 정보</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">수영장 크기</label>
                      <p className="text-sm text-gray-900">
                        {selectedCenter.poolInfo.size.length}m × {selectedCenter.poolInfo.size.width}m × {selectedCenter.poolInfo.size.depth}m
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">수용 인원</label>
                      <p className="text-sm text-gray-900">{selectedCenter.poolInfo.capacity}명</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">주차 가능</label>
                      <p className="text-sm text-gray-900">{selectedCenter.parkingAvailable ? '가능' : '불가능'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">시설</label>
                      <div className="flex flex-wrap gap-1">
                        {selectedCenter.facilities.map((facility, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {facility}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">운영 시간</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">평일</label>
                      <p className="text-sm text-gray-900">
                        {selectedCenter.operatingHours.weekdays.open} - {selectedCenter.operatingHours.weekdays.close}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">주말</label>
                      <p className="text-sm text-gray-900">
                        {selectedCenter.operatingHours.weekends.open} - {selectedCenter.operatingHours.weekends.close}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 관리자 할당 모달 */}
      {showAssignAdminModal && selectedCenter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  센터 관리자 할당
                </h3>
                <button
                  onClick={() => {
                    setShowAssignAdminModal(false);
                    setSelectedAdminId('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>{selectedCenter.name}</strong> 센터에 관리자를 할당합니다.
                </p>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  센터 관리자 선택
                </label>
                <select
                  value={selectedAdminId}
                  onChange={(e) => setSelectedAdminId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- 관리자 선택 --</option>
                  {centerAdmins.map((admin) => (
                    <option key={admin._id} value={admin._id}>
                      {admin.name} ({admin.email}) - 관리 센터: {admin.managedCentersCount}개
                    </option>
                  ))}
                </select>
                {centerAdmins.length === 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    등록된 센터 관리자가 없습니다. 새 관리자 계정을 먼저 생성해주세요.
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowAssignAdminModal(false);
                    setSelectedAdminId('');
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleAssignAdmin}
                  disabled={!selectedAdminId}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  할당하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

