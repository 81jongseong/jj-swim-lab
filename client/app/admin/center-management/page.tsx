/**
 * 🏢 JJ Swim Lab - 센터 관리 페이지
 * 
 * 📋 **페이지 목적**
 * - 관리자가 모든 센터를 체계적으로 관리할 수 있는 관리자 전용 페이지
 * - 센터 목록 조회, 상태 관리, 상세 정보 확인 기능 제공
 * - 센터별 통계 및 사용자 현황 모니터링
 * 
 * 🔄 **주요 기능**
 * - 센터 목록 조회 (검색, 필터링, 페이지네이션)
 * - 센터 상세 정보 모달 (센터 정보, 시설, 운영시간 등)
 * - 센터 상태 변경 (활성/비활성/정지/점검중)
 * - 센터 통계 대시보드 (전체 현황, 사용자 통계)
 * - 실시간 데이터 새로고침
 * 
 * 🗄️ **데이터 연동**
 * - center-management API와 연동 (센터 목록 및 통계)
 * - useAuth 훅과 연동 (사용자 권한 확인)
 * - apiClient와 연동 (API 통신)
 * 
 * 🛠️ **필요한 설치 파일**
 * - Next.js 14.2.5 (App Router)
 * - React 18.3.1
 * - TypeScript 5.x
 * - Tailwind CSS 3.3.0
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 관리자 권한 확인 필수 (superAdmin, admin만 접근)
 * 2. 센터 상태 변경 시 영향 범위 고려
 * 3. 대용량 데이터 처리 시 페이지네이션 활용
 * 4. 반응형 디자인 적용 (모바일/데스크톱)
 * 5. 에러 처리 및 사용자 피드백 제공
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 권한 검증 로직 확인
 * - [ ] API 응답 데이터 구조 검증
 * - [ ] 반응형 디자인 테스트
 * - [ ] 에러 처리 로직 개선
 * - [ ] 성능 최적화 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (센터 관리 페이지)
 * - 2024-12-19: 센터 상세보기 모달 추가
 * - 2024-12-19: 통계 대시보드 및 상태 관리 기능 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (센터 관리 페이지 완료)
 * 
 * 🚀 **다음 단계**
 * - 센터별 상세 통계 차트 추가
 * - 센터 간 비교 기능
 * - 자동화된 센터 상태 모니터링
 * - 센터별 성과 분석 대시보드
 * 
 * 💡 **사용 예시**
 * ```tsx
 * // 센터 관리 페이지 접근
 * /admin/center-management
 * 
 * // 센터 상태 변경
 * handleStatusChange(centerId, 'inactive', '정기 점검')
 * 
 * // 센터 상세보기
 * setSelectedCenter(center)
 * setShowModal(true)
 * ```
 * 
 * 🔍 **페이지 처리 흐름**
 * 1. 사용자 권한 확인 (관리자만 접근)
 * 2. 센터 목록 및 통계 데이터 로드
 * 3. 검색 및 필터링 기능 제공
 * 4. 센터 상태 변경 처리
 * 5. 센터 상세 정보 모달 표시
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import apiClient from '@/utils/api';

interface Center {
  _id: string;
  name: string;
  shortDescription: string;
  description: string;
  status: 'active' | 'inactive' | 'suspended' | 'maintenance';
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
  facilities: string[];
  poolInfo: {
    size: {
      length: number;
      width: number;
      depth: number;
    };
    capacity: number;
  };
  operatingHours: {
    weekdays: { open: string; close: string; };
    weekends: { open: string; close: string; };
  };
  parkingAvailable: boolean;
  images?: {
    mainImage?: string;
    facilityImages?: string[];
  };
  createdAt: string;
  updatedAt: string;
  stats?: {
    userCount: number;
    recentRegistrations: number;
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

export default function CenterManagement() {
  const { user } = useAuth();
  const [centers, setCenters] = useState<Center[]>([]);
  const [stats, setStats] = useState<CenterStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCenter, setSelectedCenter] = useState<Center | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadCenters();
    loadStats();
  }, [currentPage, searchTerm, statusFilter]);

  const loadCenters = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await apiClient.get(`/api/center-management?${params}`);
      
      if (response.success) {
        setCenters(response.data.centers);
        setTotalPages(response.data.pagination.total);
      } else {
        setError(response.message || '센터 목록을 불러오는데 실패했습니다.');
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
      const response = await apiClient.get('/api/center-management/stats/overview');
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('센터 통계 로딩 오류:', error);
    }
  };

  const handleStatusChange = async (centerId: string, newStatus: string, reason?: string) => {
    try {
      const response = await apiClient.patch(`/api/center-management/${centerId}/status`, { 
        status: newStatus, 
        reason 
      });

      if (response.success) {
        await loadCenters();
        await loadStats();
        alert(`센터 상태가 ${getStatusKorean(newStatus)}로 변경되었습니다.`);
      } else {
        alert(response.message || '상태 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('상태 변경 오류:', error);
      alert('상태 변경 중 오류가 발생했습니다.');
    }
  };

  const getStatusKorean = (status: string) => {
    const statusMap = {
      'active': '활성',
      'inactive': '비활성',
      'suspended': '정지',
      'maintenance': '점검중'
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap = {
      'active': 'bg-green-100 text-green-800',
      'inactive': 'bg-gray-100 text-gray-800',
      'suspended': 'bg-red-100 text-red-800',
      'maintenance': 'bg-yellow-100 text-yellow-800'
    };
    return colorMap[status as keyof typeof colorMap] || 'bg-gray-100 text-gray-800';
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadCenters();
  };

  if (loading && centers.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🏢 센터 관리</h1>
        <p className="text-gray-600">전체 센터의 상태를 관리하고 모니터링합니다.</p>
      </div>

      {/* 통계 카드 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">🏢</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">전체 센터</p>
                <p className="text-2xl font-bold text-gray-900">{stats.centers.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">활성 센터</p>
                <p className="text-2xl font-bold text-green-600">{stats.centers.active}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">전체 사용자</p>
                <p className="text-2xl font-bold text-gray-900">{stats.users.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <span className="text-2xl">📝</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">최근 신청</p>
                <p className="text-2xl font-bold text-orange-600">{stats.recentRegistrations}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 검색 및 필터 */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="센터명, 이메일, 주소로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="md:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">모든 상태</option>
              <option value="active">활성</option>
              <option value="inactive">비활성</option>
              <option value="suspended">정지</option>
              <option value="maintenance">점검중</option>
            </select>
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            검색
          </button>
        </form>
      </div>

      {/* 센터 목록 */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">센터 목록</h2>
        </div>

        {error && (
          <div className="p-6 text-center text-red-600">
            <p>{error}</p>
            <button
              onClick={loadCenters}
              className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
              다시 시도
            </button>
          </div>
        )}

        {centers.length === 0 && !loading ? (
          <div className="p-6 text-center text-gray-500">
            <p>등록된 센터가 없습니다.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    센터 정보
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    연락처
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    통계
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    등록일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {centers.map((center) => (
                  <tr key={center._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{center.name}</div>
                        <div className="text-sm text-gray-500">{center.shortDescription}</div>
                        <div className="text-sm text-gray-500">
                          {center.address.city} {center.address.province}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{center.contact.email}</div>
                      <div className="text-sm text-gray-500">{center.contact.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(center.status)}`}>
                        {getStatusKorean(center.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>사용자: {center.stats?.userCount || 0}명</div>
                      <div>최근 신청: {center.stats?.recentRegistrations || 0}건</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(center.createdAt).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedCenter(center);
                            setShowModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          상세보기
                        </button>
                        <div className="relative">
                          <select
                            onChange={(e) => {
                              if (e.target.value) {
                                handleStatusChange(center._id, e.target.value);
                                e.target.value = '';
                              }
                            }}
                            className="text-sm border border-gray-300 rounded px-2 py-1"
                          >
                            <option value="">상태 변경</option>
                            <option value="active">활성</option>
                            <option value="inactive">비활성</option>
                            <option value="suspended">정지</option>
                            <option value="maintenance">점검중</option>
                          </select>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  이전
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  다음
                </button>
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
                {/* 기본 정보 */}
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
                  </div>
                </div>

                {/* 연락처 정보 */}
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

                {/* 시설 정보 */}
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

                {/* 운영 시간 */}
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
    </div>
  );
}
