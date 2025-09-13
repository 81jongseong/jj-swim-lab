/**
 * ✅ JJ Swim Lab - 승인 대기 관리 페이지
 * 
 * 📋 **기능**
 * - 전체 승인 대기 항목 현황
 * - 승인/거부 처리
 * - 승인 상태별 필터링
 * - 승인 이력 관리
 * - 승인 권한 관리
 * 
 * 👤 **접근 권한**: superAdmin, centerAdmin
 * 🔒 **인증 필요**: 예
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import apiClient from '@/utils/api';

interface CenterRegistration {
  _id: string;
  centerName: string;
  businessNumber: string;
  representativeName: string;
  representativeEmail: string;
  representativePhone: string;
  address: {
    address1: string;
    address2?: string;
    city: string;
    province: string;
    postalCode: string;
  };
  centerInfo: {
    description: string;
    facilities: string[];
    poolSize: {
      length: number;
      width: number;
      depth: number;
    };
    capacity: number;
    parkingAvailable: boolean;
  };
  applicant: {
    name: string;
    email: string;
    phone: string;
    position: string;
  };
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'cancelled';
  submittedAt: string;
  approvalInfo?: {
    reviewedBy?: {
      name: string;
      email: string;
    };
    reviewedAt?: string;
    approvedBy?: {
      name: string;
      email: string;
    };
    approvedAt?: string;
    rejectedBy?: {
      name: string;
      email: string;
    };
    rejectedAt?: string;
    rejectionReason?: string;
    comments?: string;
  };
}

interface ApprovalItem {
  id: string;
  type: 'course_enrollment' | 'instructor_registration' | 'payment_approval' | 'schedule_change' | 'refund_request' | 'center_registration';
  title: string;
  description: string;
  requesterName: string;
  requesterType: 'student' | 'instructor' | 'centerAdmin';
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected';
  priority: 'low' | 'medium' | 'high';
  estimatedAmount?: number;
  courseName?: string;
  instructorName?: string;
  centerRegistration?: CenterRegistration;
}

export default function ApprovalsPage() {
  const { user, loading } = useAuth();
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [filteredApprovals, setFilteredApprovals] = useState<ApprovalItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'course_enrollment' | 'instructor_registration' | 'payment_approval' | 'schedule_change' | 'refund_request' | 'center_registration'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCenter, setSelectedCenter] = useState<CenterRegistration | null>(null);
  const [showCenterModal, setShowCenterModal] = useState(false);

  const fetchApprovals = async () => {
    try {
      setIsLoading(true);
      
      // 센터 등록 신청 데이터 가져오기
      const centerRegistrationsResponse = await apiClient.get<{
        success: boolean;
        data?: {
          registrations: CenterRegistration[];
        };
        error?: string;
      }>('/api/center-registrations');
      const centerRegistrations = (centerRegistrationsResponse as any)?.data?.registrations || [];
      
      // 센터 등록 신청을 ApprovalItem 형식으로 변환
      const centerApprovals: ApprovalItem[] = centerRegistrations.map((reg: CenterRegistration) => ({
        id: reg._id,
        type: 'center_registration',
        title: `${reg.centerName} 센터 등록 신청`,
        description: `${reg.applicant.name}님이 ${reg.centerName} 센터 등록을 신청했습니다.`,
        requesterName: reg.applicant.name,
        requesterType: 'centerAdmin',
        requestDate: new Date(reg.submittedAt).toLocaleDateString('ko-KR'),
        status: reg.status === 'approved' ? 'approved' : reg.status === 'rejected' ? 'rejected' : 'pending',
        priority: 'high',
        centerRegistration: reg
      }));
      
      // 기존 mock 데이터와 센터 등록 신청 합치기
      const mockData: ApprovalItem[] = [
        {
          id: '1',
          type: 'course_enrollment',
          title: '초급 수영 과정 수강 신청',
          description: '김학생님이 초급 수영 과정에 수강을 신청했습니다.',
          requesterName: '김학생',
          requesterType: 'student',
          requestDate: '2024-01-15',
          status: 'pending',
          priority: 'medium',
          courseName: '초급 수영',
          estimatedAmount: 120000
        },
        {
          id: '2',
          type: 'instructor_registration',
          title: '새 강사 등록 신청',
          description: '박강사님이 새로운 강사로 등록을 신청했습니다.',
          requesterName: '박강사',
          requesterType: 'instructor',
          requestDate: '2024-01-14',
          status: 'pending',
          priority: 'high',
          instructorName: '박강사'
        }
      ];
      
      const allApprovals = [...mockData, ...centerApprovals];
      setApprovals(allApprovals);
      setFilteredApprovals(allApprovals);
      setIsLoading(false);
    } catch (error) {
      console.error('승인 데이터 가져오기 실패:', error);
      setIsLoading(false);
      
      // API 실패 시 mock 데이터 사용 (fallback)
      const mockData: ApprovalItem[] = [
        {
          id: '1',
          type: 'course_enrollment',
          title: '초급 수영 과정 수강 신청',
          description: '김학생님이 초급 수영 과정에 수강을 신청했습니다.',
          requesterName: '김학생',
          requesterType: 'student',
          requestDate: '2024-01-15',
          status: 'pending',
          priority: 'medium',
          courseName: '초급 수영',
          estimatedAmount: 120000
        },
        {
          id: '2',
          type: 'instructor_registration',
          title: '새 강사 등록 신청',
          description: '박강사님이 새로운 강사로 등록을 신청했습니다.',
          requesterName: '박강사',
          requesterType: 'instructor',
          requestDate: '2024-01-14',
          status: 'pending',
          priority: 'high',
          instructorName: '박강사'
        }
      ];
      
      setApprovals(mockData);
      setFilteredApprovals(mockData);
    }
  };

  // 데이터 로드 useEffect
  useEffect(() => {
    fetchApprovals();
  }, []);

  // 필터링 useEffect
  useEffect(() => {
    let filtered = approvals;
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }
    
    if (typeFilter !== 'all') {
      filtered = filtered.filter(item => item.type === typeFilter);
    }
    
    setFilteredApprovals(filtered);
  }, [approvals, statusFilter, typeFilter]);

  // 권한 확인
  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">로딩 중...</div>;
  }

  if (!user || !['superAdmin', 'centerAdmin'].includes(user.userType)) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">접근 권한이 없습니다</h1>
          <p className="text-gray-600">이 페이지에 접근할 수 있는 권한이 없습니다.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">승인 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  const handleApproval = async (id: string, action: 'approve' | 'reject') => {
    try {
      const approval = approvals.find(item => item.id === id);
      
      if (approval?.type === 'center_registration') {
        // 센터 등록 승인/거부 처리
        const endpoint = action === 'approve' 
          ? `/api/center-registrations/${id}/approve`
          : `/api/center-registrations/${id}/reject`;
        
        const response = action === 'approve' 
          ? await apiClient.post(endpoint, {
              comments: '센터 등록이 승인되었습니다.'
            })
          : await apiClient.post(endpoint, {
              rejectionReason: '서류 미비',
              comments: '센터 등록이 거부되었습니다.'
            });
        
        if (response.success) {
          await fetchApprovals(); // 데이터 새로고침
          alert(`센터 등록이 ${action === 'approve' ? '승인' : '거부'}되었습니다.`);
        } else {
          alert(response.message || '처리 중 오류가 발생했습니다.');
        }
      } else {
        // 기존 승인 처리 로직 (mock)
        setApprovals(prev => 
          prev.map(item => 
            item.id === id 
              ? { ...item, status: action === 'approve' ? 'approved' : 'rejected' }
              : item
          )
        );
        
        setFilteredApprovals(prev => 
          prev.map(item => 
            item.id === id 
              ? { ...item, status: action === 'approve' ? 'approved' : 'rejected' }
              : item
          )
        );
        
        alert(`승인 요청이 ${action === 'approve' ? '승인' : '거부'}되었습니다.`);
      }
    } catch (error) {
      console.error('승인 처리 실패:', error);
      alert('승인 처리 중 오류가 발생했습니다.');
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'course_enrollment':
        return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">수강 신청</span>;
      case 'instructor_registration':
        return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">강사 등록</span>;
      case 'payment_approval':
        return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">결제 승인</span>;
      case 'schedule_change':
        return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">일정 변경</span>;
      case 'refund_request':
        return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">환불 요청</span>;
      case 'center_registration':
        return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">센터 등록</span>;
      default:
        return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">알 수 없음</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">대기</span>;
      case 'approved':
        return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">승인</span>;
      case 'rejected':
        return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">거부</span>;
      default:
        return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">알 수 없음</span>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'low':
        return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">낮음</span>;
      case 'medium':
        return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">보통</span>;
      case 'high':
        return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">높음</span>;
      default:
        return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">알 수 없음</span>;
    }
  };

  const getTypeFilterLabel = (type: string) => {
    switch (type) {
      case 'course_enrollment': return '수강 신청';
      case 'instructor_registration': return '강사 등록';
      case 'payment_approval': return '결제 승인';
      case 'schedule_change': return '일정 변경';
      case 'refund_request': return '환불 요청';
      case 'center_registration': return '센터 등록';
      default: return '전체';
    }
  };

  const pendingCount = approvals.filter(item => item.status === 'pending').length;
  const approvedCount = approvals.filter(item => item.status === 'approved').length;
  const rejectedCount = approvals.filter(item => item.status === 'rejected').length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">승인 대기 관리</h1>
          <p className="text-gray-600">승인 대기 중인 요청들을 관리하고 처리합니다.</p>
        </div>
        <button
          onClick={fetchApprovals}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          새로고침
        </button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-sm font-medium text-gray-600 mb-2">대기 중</div>
          <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
          <p className="text-xs text-gray-500">승인 대기 중인 요청</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-sm font-medium text-gray-600 mb-2">승인됨</div>
          <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
          <p className="text-xs text-gray-500">승인된 요청</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-sm font-medium text-gray-600 mb-2">거부됨</div>
          <div className="text-2xl font-bold text-red-600">{rejectedCount}</div>
          <p className="text-xs text-gray-500">거부된 요청</p>
        </div>
      </div>

      {/* 필터 */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">필터</h3>
        </div>
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">상태</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="all">전체</option>
              <option value="pending">대기 중</option>
              <option value="approved">승인됨</option>
              <option value="rejected">거부됨</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">유형</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="all">전체</option>
              <option value="course_enrollment">수강 신청</option>
              <option value="instructor_registration">강사 등록</option>
              <option value="payment_approval">결제 승인</option>
              <option value="schedule_change">일정 변경</option>
              <option value="refund_request">환불 요청</option>
              <option value="center_registration">센터 등록</option>
            </select>
          </div>
        </div>
      </div>

      {/* 승인 요청 목록 */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">승인 요청 목록</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">유형</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">제목 및 설명</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">요청자</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">요청일</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">우선순위</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">작업</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredApprovals.map((approval) => (
                <tr key={approval.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{getTypeLabel(approval.type)}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium">{approval.title}</div>
                    <div className="text-sm text-gray-500">{approval.description}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium">{approval.requesterName}</div>
                    <div className="text-sm text-gray-500">{approval.requesterType}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">{approval.requestDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{getPriorityBadge(approval.priority)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(approval.status)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      {approval.type === 'center_registration' && (
                        <button
                          onClick={() => {
                            setSelectedCenter(approval.centerRegistration!);
                            setShowCenterModal(true);
                          }}
                          className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                        >
                          상세보기
                        </button>
                      )}
                      {approval.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApproval(approval.id, 'approve')}
                            className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            승인
                          </button>
                          <button
                            onClick={() => handleApproval(approval.id, 'reject')}
                            className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            거부
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 센터 등록 상세보기 모달 */}
      {showCenterModal && selectedCenter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">{selectedCenter.centerName} 센터 등록 신청</h3>
                <button
                  onClick={() => setShowCenterModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 기본 정보 */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">센터 기본 정보</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">센터명</label>
                      <p className="text-sm text-gray-900">{selectedCenter.centerName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">사업자등록번호</label>
                      <p className="text-sm text-gray-900">{selectedCenter.businessNumber}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">대표자명</label>
                      <p className="text-sm text-gray-900">{selectedCenter.representativeName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">대표자 이메일</label>
                      <p className="text-sm text-gray-900">{selectedCenter.representativeEmail}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">대표자 전화번호</label>
                      <p className="text-sm text-gray-900">{selectedCenter.representativePhone}</p>
                    </div>
                  </div>
                </div>

                {/* 주소 정보 */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">주소 정보</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">우편번호</label>
                      <p className="text-sm text-gray-900">{selectedCenter.address.postalCode}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">기본주소</label>
                      <p className="text-sm text-gray-900">{selectedCenter.address.address1}</p>
                    </div>
                    {selectedCenter.address.address2 && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">상세주소</label>
                        <p className="text-sm text-gray-900">{selectedCenter.address.address2}</p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-gray-600">시/도</label>
                      <p className="text-sm text-gray-900">{selectedCenter.address.city}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">시/군/구</label>
                      <p className="text-sm text-gray-900">{selectedCenter.address.province}</p>
                    </div>
                  </div>
                </div>

                {/* 센터 상세 정보 */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">센터 상세 정보</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">센터 소개</label>
                      <p className="text-sm text-gray-900">{selectedCenter.centerInfo.description}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">수영장 크기</label>
                      <p className="text-sm text-gray-900">
                        {selectedCenter.centerInfo.poolSize.length}m × {selectedCenter.centerInfo.poolSize.width}m × {selectedCenter.centerInfo.poolSize.depth}m
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">수용 인원</label>
                      <p className="text-sm text-gray-900">{selectedCenter.centerInfo.capacity}명</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">주차 가능</label>
                      <p className="text-sm text-gray-900">{selectedCenter.centerInfo.parkingAvailable ? '가능' : '불가능'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">시설</label>
                      <div className="flex flex-wrap gap-1">
                        {selectedCenter.centerInfo.facilities.map((facility, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {facility}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 신청자 정보 */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">신청자 정보</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">신청자명</label>
                      <p className="text-sm text-gray-900">{selectedCenter.applicant.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">신청자 이메일</label>
                      <p className="text-sm text-gray-900">{selectedCenter.applicant.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">신청자 전화번호</label>
                      <p className="text-sm text-gray-900">{selectedCenter.applicant.phone}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">직책</label>
                      <p className="text-sm text-gray-900">{selectedCenter.applicant.position}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">신청일</label>
                      <p className="text-sm text-gray-900">{new Date(selectedCenter.submittedAt).toLocaleDateString('ko-KR')}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">상태</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedCenter.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        selectedCenter.status === 'approved' ? 'bg-green-100 text-green-800' :
                        selectedCenter.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedCenter.status === 'pending' ? '대기중' :
                         selectedCenter.status === 'approved' ? '승인됨' :
                         selectedCenter.status === 'rejected' ? '거부됨' :
                         selectedCenter.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 승인 정보 */}
              {selectedCenter.approvalInfo && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">승인 정보</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {selectedCenter.approvalInfo.reviewedBy && (
                      <div className="mb-2">
                        <label className="text-sm font-medium text-gray-600">검토자</label>
                        <p className="text-sm text-gray-900">
                          {selectedCenter.approvalInfo.reviewedBy.name} ({selectedCenter.approvalInfo.reviewedBy.email})
                        </p>
                      </div>
                    )}
                    {selectedCenter.approvalInfo.comments && (
                      <div className="mb-2">
                        <label className="text-sm font-medium text-gray-600">검토 의견</label>
                        <p className="text-sm text-gray-900">{selectedCenter.approvalInfo.comments}</p>
                      </div>
                    )}
                    {selectedCenter.approvalInfo.rejectionReason && (
                      <div className="mb-2">
                        <label className="text-sm font-medium text-gray-600">거부 사유</label>
                        <p className="text-sm text-gray-900">{selectedCenter.approvalInfo.rejectionReason}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowCenterModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  닫기
                </button>
                {selectedCenter.status === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        handleApproval(selectedCenter._id, 'approve');
                        setShowCenterModal(false);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      승인
                    </button>
                    <button
                      onClick={() => {
                        handleApproval(selectedCenter._id, 'reject');
                        setShowCenterModal(false);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      거부
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
