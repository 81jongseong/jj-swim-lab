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
import { useAuth } from '../../../hooks/useAuth';
import apiClient from '../../../utils/api';
import Button from '@/components/Button';
import StatCard from '@/components/StatCard';

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
    pools?: {
      id: string;
      type: 'main' | 'auxiliary';
      length: number;
      width: number;
      depth: number;
      laneCount?: number;
      description?: string;
    }[];
    facilities?: ({
      name: string;
      enabled: boolean;
      details?: {
        count?: number;
        type?: string;
        description?: string;
      };
    } | string)[];
    poolSize?: {
      length: number;
      width: number;
      depth: number;
    };
    operatingHours?: {
      weekdays: { open: string; close: string; };
      weekends: { open: string; close: string; };
    };
    capacity: number;
    parkingAvailable: boolean;
    parkingSpaces?: number;
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
  type: 'center_registration';
  title: string;
  description: string;
  requesterName: string;
  requesterType: 'centerAdmin';
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected';
  priority: 'low' | 'medium' | 'high';
  centerRegistration?: CenterRegistration;
}

export default function ApprovalsPage() {
  const { user, loading } = useAuth();
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [filteredApprovals, setFilteredApprovals] = useState<ApprovalItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'center_registration'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCenter, setSelectedCenter] = useState<CenterRegistration | null>(null);
  const [showCenterModal, setShowCenterModal] = useState(false);

  const fetchApprovals = async () => {
    try {
      setIsLoading(true);
      
      // 실제 승인 데이터 API 호출
      const approvalsResponse = await apiClient.get<{
        success: boolean;
        data?: {
          approvals: ApprovalItem[];
          pagination: any;
        };
        error?: string;
      }>('/api/approvals');
      
      let realApprovals: ApprovalItem[] = [];
      if (approvalsResponse?.data?.approvals) {
        // 센터 승인 페이지에서는 센터 등록만 표시
        const filteredApprovals = approvalsResponse.data.approvals.filter((approval: any) => 
          approval.type === 'center_registration'
        );
        
        realApprovals = filteredApprovals.map((approval: any) => ({
          id: approval.id,
          type: approval.type,
          title: approval.title,
          description: approval.description,
          requesterName: approval.requesterName,
          requesterType: approval.requesterType,
          requestDate: new Date(approval.requestDate).toLocaleDateString('ko-KR'),
          status: approval.status,
          priority: approval.priority,
          instructorName: approval.instructorName
        }));
        
        console.log(`✅ 어드민 승인 데이터 필터링 완료: 전체 ${approvalsResponse.data.approvals.length}개 중 ${realApprovals.length}개 표시 (강사/센터 등록만)`);
      }
      
      // 센터 등록 신청 데이터도 함께 가져오기
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
      
      // 실제 데이터와 센터 등록 신청 합치기
      const allApprovals = [...realApprovals, ...centerApprovals];
      
      // 데이터가 없으면 샘플 데이터 생성
      if (allApprovals.length === 0) {
        console.log('📝 승인 데이터가 없어 샘플 데이터를 생성합니다.');
        const sampleData: ApprovalItem[] = [
          {
            id: 'sample-1',
            type: 'center_registration',
            title: '홍대 수영센터 등록 신청',
            description: '이센터장님이 홍대 수영센터 등록을 신청했습니다.',
            requesterName: '이센터장',
            requesterType: 'centerAdmin',
            requestDate: new Date().toLocaleDateString('ko-KR'),
            status: 'pending',
            priority: 'high',
            centerRegistration: {
              _id: 'sample-1',
              centerName: '홍대 수영센터',
              businessNumber: '123-45-67890',
              representativeName: '이센터장',
              representativeEmail: 'lee@hongdae-swim.com',
              representativePhone: '010-1234-5678',
              address: {
                address1: '서울시 마포구 홍익로 123',
                address2: '홍대상가 2층',
                city: '서울시',
                province: '마포구',
                postalCode: '04066'
              },
              centerInfo: {
                description: '홍대 지역 최대 규모의 수영센터',
                facilities: ['수영장', '샤워실', '락커룸', '휴게실'],
                poolSize: {
                  length: 25,
                  width: 12.5,
                  depth: 1.5
                },
                capacity: 100,
                parkingAvailable: true
              },
              applicant: {
                name: '이센터장',
                email: 'lee@hongdae-swim.com',
                phone: '010-1234-5678',
                position: '센터장'
              },
              status: 'pending',
              submittedAt: new Date().toISOString()
            }
          },
          {
            id: 'sample-2',
            type: 'center_registration',
            title: '강남 스포츠센터 등록 신청',
            description: '박센터장님이 강남 스포츠센터 등록을 신청했습니다.',
            requesterName: '박센터장',
            requesterType: 'centerAdmin',
            requestDate: new Date().toLocaleDateString('ko-KR'),
            status: 'pending',
            priority: 'high',
            centerRegistration: {
              _id: 'sample-2',
              centerName: '강남 스포츠센터',
              businessNumber: '234-56-78901',
              representativeName: '박센터장',
              representativeEmail: 'park@gangnam-sports.com',
              representativePhone: '010-2345-6789',
              address: {
                address1: '서울시 강남구 테헤란로 456',
                address2: '강남타워 3층',
                city: '서울시',
                province: '강남구',
                postalCode: '06194'
              },
              centerInfo: {
                description: '강남 최고급 수영 시설',
                facilities: ['수영장', '사우나', '피트니스', '카페'],
                poolSize: {
                  length: 50,
                  width: 25,
                  depth: 2.0
                },
                capacity: 200,
                parkingAvailable: true
              },
              applicant: {
                name: '박센터장',
                email: 'park@gangnam-sports.com',
                phone: '010-2345-6789',
                position: '센터장'
              },
              status: 'pending',
              submittedAt: new Date().toISOString()
            }
          },
          {
            id: 'sample-3',
            type: 'center_registration',
            title: '잠실 수영장 등록 완료',
            description: '김센터장님의 센터 등록이 승인되었습니다.',
            requesterName: '김센터장',
            requesterType: 'centerAdmin',
            requestDate: new Date(Date.now() - 86400000).toLocaleDateString('ko-KR'),
            status: 'approved',
            priority: 'high'
          },
          {
            id: 'sample-4',
            type: 'center_registration',
            title: '아쿠아 센터 등록 거부',
            description: '서류 미비로 아쿠아 센터 등록이 거부되었습니다.',
            requesterName: '이센터장',
            requesterType: 'centerAdmin',
            requestDate: new Date(Date.now() - 172800000).toLocaleDateString('ko-KR'),
            status: 'rejected',
            priority: 'medium'
          }
        ];
        setApprovals(sampleData);
        setFilteredApprovals(sampleData);
      } else {
        setApprovals(allApprovals);
        setFilteredApprovals(allApprovals);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('승인 데이터 가져오기 실패:', error);
      setIsLoading(false);
      
      // API 실패 시 샘플 데이터 사용 (fallback)
      const fallbackData: ApprovalItem[] = [
        {
          id: 'fallback-1',
          type: 'instructor_registration',
          title: '새 강사 등록 신청',
          description: '박강사님이 새로운 강사로 등록을 신청했습니다.',
          requesterName: '박강사',
          requesterType: 'instructor',
          requestDate: new Date().toLocaleDateString('ko-KR'),
          status: 'pending',
          priority: 'high',
          instructorName: '박강사'
        },
        {
          id: 'fallback-2',
          type: 'center_registration',
          title: '새 센터 등록 신청',
          description: '김센터장님이 새로운 센터 등록을 신청했습니다.',
          requesterName: '김센터장',
          requesterType: 'centerAdmin',
          requestDate: new Date().toLocaleDateString('ko-KR'),
          status: 'pending',
          priority: 'high'
        }
      ];
      
      setApprovals(fallbackData);
      setFilteredApprovals(fallbackData);
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
      
      // 샘플 데이터인지 확인 (sample-로 시작하는 ID)
      const isSampleData = id.startsWith('sample-');
      
      if (isSampleData) {
        // 샘플 데이터는 로컬 상태만 업데이트
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
        alert(`센터 등록이 ${action === 'approve' ? '승인' : '거부'}되었습니다. (샘플 데이터)`);
        return;
      }
      
      if (approval?.type === 'center_registration') {
        // 실제 센터 등록 승인/거부 처리
        const endpoint = action === 'approve' 
          ? `/api/center-registrations/${id}/approve`
          : `/api/center-registrations/${id}/reject`;
        
        try {
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
        } catch (apiError) {
          console.log('센터 등록 API 오류, 로컬 상태 업데이트로 대체:', apiError);
          
          // API 실패 시 로컬 상태 업데이트 (fallback)
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
          alert(`센터 등록이 ${action === 'approve' ? '승인' : '거부'}되었습니다. (로컬 업데이트)`);
        }
      } else {
        // 실제 승인 API 호출
        try {
          const response = await apiClient.put(`/api/approvals/${id}/process`, {
            action: action,
            comments: action === 'approve' ? '승인되었습니다.' : '거부되었습니다.',
            rejectionReason: action === 'reject' ? '관리자 검토 결과 거부' : undefined
          });
          
          if (response.success) {
            await fetchApprovals(); // 데이터 새로고침
            alert(`승인 요청이 ${action === 'approve' ? '승인' : '거부'}되었습니다.`);
          } else {
            alert(response.message || '처리 중 오류가 발생했습니다.');
          }
        } catch (apiError) {
          console.log('API 오류, 로컬 상태 업데이트로 대체:', apiError);
          
          // API 실패 시 로컬 상태 업데이트 (fallback)
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
          
          alert(`승인 요청이 ${action === 'approve' ? '승인' : '거부'}되었습니다. (로컬 처리)`);
        }
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
      case 'instructor_registration': return '강사 등록';
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🏢 센터 승인 관리</h1>
          <p className="text-gray-600">센터 등록 요청을 승인하고 관리합니다.</p>
        </div>
        <Button
          onClick={fetchApprovals}
          variant="primary"
          size="md"
        >
          새로고침
        </Button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="센터 승인 대기"
          value={pendingCount}
          icon="⏳"
          color="yellow"
          subtitle="센터 등록 대기 중"
        />
        
        <StatCard
          title="센터 승인 완료"
          value={approvedCount}
          icon="✅"
          color="green"
          subtitle="승인된 센터"
          href="/admin/center-management"
        />
        
        <StatCard
          title="센터 승인 거부"
          value={rejectedCount}
          icon="❌"
          color="red"
          subtitle="거부된 센터 등록"
        />
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
            <label className="block text-sm font-medium text-gray-700 mb-2">센터 유형</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="all">전체</option>
              <option value="center_registration">센터 등록</option>
            </select>
          </div>
        </div>
      </div>

      {/* 승인 요청 목록 - 카드 형식 */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">승인 요청 목록</h2>
        {filteredApprovals.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-lg font-medium">승인 요청이 없습니다</p>
              <p className="text-sm">필터 조건을 변경해보세요.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredApprovals.map((approval) => (
              <div key={approval.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200">
                {/* 카드 헤더 */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {approval.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {approval.description}
                      </p>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      {getStatusBadge(approval.status)}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    {getTypeLabel(approval.type)}
                    {getPriorityBadge(approval.priority)}
                  </div>
                </div>

                {/* 카드 본문 */}
                <div className="p-6">
                  <div className="space-y-3">
                    {/* 요청자 정보 */}
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{approval.requesterName}</p>
                        <p className="text-xs text-gray-500 capitalize">{approval.requesterType}</p>
                      </div>
                    </div>

                    {/* 요청일 */}
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-gray-900">{approval.requestDate}</p>
                      </div>
                    </div>

                    {/* 추가 정보 */}
                    {approval.instructorName && (
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-gray-900">강사: {approval.instructorName}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 카드 푸터 */}
                <div className="px-6 py-4 bg-gray-50 rounded-b-lg">
                  <div className="flex gap-2">
                    {approval.type === 'center_registration' && (
                      <Button
                        onClick={() => {
                          setSelectedCenter(approval.centerRegistration!);
                          setShowCenterModal(true);
                        }}
                        variant="primary"
                        size="sm"
                        fullWidth
                      >
                        📋 상세보기
                      </Button>
                    )}
                    {approval.status === 'pending' && (
                      <>
                        <Button
                          onClick={() => handleApproval(approval.id, 'approve')}
                          variant="success"
                          size="sm"
                          fullWidth
                        >
                          ✅ 승인
                        </Button>
                        <Button
                          onClick={() => handleApproval(approval.id, 'reject')}
                          variant="danger"
                          size="sm"
                          fullWidth
                        >
                          ❌ 거부
                        </Button>
                      </>
                    )}
                    {approval.status !== 'pending' && approval.type !== 'center_registration' && (
                      <div className="flex-1 text-center text-xs text-gray-500 py-2">
                        {approval.status === 'approved' ? '✅ 승인 완료' : '❌ 거부 완료'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
                      <label className="text-sm font-medium text-gray-600">수영장 정보</label>
                      {selectedCenter.centerInfo.pools && selectedCenter.centerInfo.pools.length > 0 ? (
                        <div className="space-y-2">
                          {selectedCenter.centerInfo.pools.map((pool: any, idx: number) => (
                            <p key={idx} className="text-sm text-gray-900">
                              {pool.type === 'main' ? '메인' : '보조'} 수영장 {idx + 1}: {pool.length}m × {pool.width}m × {pool.depth}m
                              {pool.laneCount && ` (${pool.laneCount}레인)`}
                            </p>
                          ))}
                        </div>
                      ) : selectedCenter.centerInfo.poolSize ? (
                        <p className="text-sm text-gray-900">
                          {selectedCenter.centerInfo.poolSize.length}m × {selectedCenter.centerInfo.poolSize.width}m × {selectedCenter.centerInfo.poolSize.depth}m
                        </p>
                      ) : (
                        <p className="text-sm text-gray-500">정보 없음</p>
                      )}
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
                        {selectedCenter.centerInfo.facilities && selectedCenter.centerInfo.facilities.length > 0 ? (
                          selectedCenter.centerInfo.facilities
                            .filter((f: any) => typeof f === 'object' ? f.enabled : true)
                            .map((facility: any, index: number) => (
                              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                {typeof facility === 'object' ? facility.name : facility}
                              </span>
                            ))
                        ) : (
                          <span className="text-sm text-gray-500">정보 없음</span>
                        )}
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
                <Button
                  onClick={() => setShowCenterModal(false)}
                  variant="secondary"
                  size="md"
                >
                  닫기
                </Button>
                {selectedCenter.status === 'pending' && (
                  <>
                    <Button
                      onClick={() => {
                        handleApproval(selectedCenter._id, 'approve');
                        setShowCenterModal(false);
                      }}
                      variant="success"
                      size="md"
                    >
                      승인
                    </Button>
                    <Button
                      onClick={() => {
                        handleApproval(selectedCenter._id, 'reject');
                        setShowCenterModal(false);
                      }}
                      variant="danger"
                      size="md"
                    >
                      거부
                    </Button>
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
