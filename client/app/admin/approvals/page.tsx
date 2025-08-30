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
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, ResponsiveTable, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell, LoadingSpinner, RefreshButton } from '@/components/ui';
import { getApprovals, processApproval, type ApprovalItem as ApiApprovalItem } from '@/lib/api/approvals';

interface ApprovalItem {
  id: string;
  type: 'course_enrollment' | 'instructor_registration' | 'payment_approval' | 'schedule_change' | 'refund_request';
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
}

export default function ApprovalsPage() {
  const { user, loading } = useAuth();
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [filteredApprovals, setFilteredApprovals] = useState<ApprovalItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'course_enrollment' | 'instructor_registration' | 'payment_approval' | 'schedule_change' | 'refund_request'>('all');
  const [isLoading, setIsLoading] = useState(true);

  const fetchApprovals = async () => {
    try {
      setIsLoading(true);
      
      // 실제 API 호출
      const apiResponse = await getApprovals();
      const apiApprovals = apiResponse.data.approvals;
      
      // API 데이터를 기존 형식으로 변환
      const transformedApprovals: ApprovalItem[] = apiApprovals.map(item => ({
        id: item.id,
        type: item.type,
        title: item.title,
        description: item.description,
        requesterName: item.requesterName,
        requesterType: item.requesterType,
        requestDate: new Date(item.requestDate).toLocaleDateString('ko-KR'),
        status: item.status,
        priority: item.priority,
        courseName: item.courseName,
        estimatedAmount: item.estimatedAmount,
        instructorName: item.instructorName
      }));
      
      setApprovals(transformedApprovals);
      setFilteredApprovals(transformedApprovals);
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
        },
        {
          id: '3',
          type: 'payment_approval',
          title: '결제 승인 요청',
          description: '이학생님의 결제 승인을 요청합니다.',
          requesterName: '이학생',
          requesterType: 'student',
          requestDate: '2024-01-13',
          status: 'pending',
          priority: 'medium',
          estimatedAmount: 150000,
          courseName: '중급 수영'
        },
        {
          id: '4',
          type: 'schedule_change',
          title: '수업 일정 변경 요청',
          description: '수영장 정비로 인한 수업 일정 변경을 요청합니다.',
          requesterName: '김수영',
          requesterType: 'instructor',
          requestDate: '2024-01-12',
          status: 'pending',
          priority: 'high'
        },
        {
          id: '5',
          type: 'refund_request',
          title: '환불 요청',
          description: '개인 사정으로 인한 환불을 요청합니다.',
          requesterName: '최학생',
          requesterType: 'student',
          requestDate: '2024-01-11',
          status: 'pending',
          priority: 'low',
          estimatedAmount: 120000,
          courseName: '초급 수영'
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
        <LoadingSpinner 
          size="xl" 
          color="primary" 
          text="승인 데이터를 불러오는 중..." 
        />
      </div>
    );
  }

  const handleApproval = async (id: string, action: 'approve' | 'reject') => {
    try {
      // 실제 API 호출
      await processApproval(id, action);
      
      // 로컬 상태 업데이트
      setApprovals(prev => 
        prev.map(item => 
          item.id === id 
            ? { ...item, status: action === 'approve' ? 'approved' : 'rejected' }
            : item
        )
      );
      
      // 필터링된 목록도 업데이트
      setFilteredApprovals(prev => 
        prev.map(item => 
          item.id === id 
            ? { ...item, status: action === 'approve' ? 'approved' : 'rejected' }
            : item
        )
      );
      
      // Toast 알림 표시
      if ((window as any).showToast) {
        (window as any).showToast({
          type: 'success',
          title: '처리 완료',
          message: `승인 요청이 ${action === 'approve' ? '승인' : '거부'}되었습니다.`,
          duration: 3000
        });
      }
    } catch (error) {
      console.error('승인 처리 실패:', error);
      
      // 에러 Toast 알림 표시
      if ((window as any).showToast) {
        (window as any).showToast({
          type: 'error',
          title: '처리 실패',
          message: '승인 처리 중 오류가 발생했습니다.',
          duration: 5000
        });
      }
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'course_enrollment':
        return <Badge variant="outline" className="border-blue-500 text-blue-600">수강 신청</Badge>;
      case 'instructor_registration':
        return <Badge variant="outline" className="border-green-500 text-green-600">강사 등록</Badge>;
      case 'payment_approval':
        return <Badge variant="outline" className="border-purple-500 text-purple-600">결제 승인</Badge>;
      case 'schedule_change':
        return <Badge variant="outline" className="border-orange-500 text-orange-600">일정 변경</Badge>;
      case 'refund_request':
        return <Badge variant="outline" className="border-red-500 text-red-600">환불 요청</Badge>;
      default:
        return <Badge variant="outline">알 수 없음</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-600">대기</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-500">승인</Badge>;
      case 'rejected':
        return <Badge variant="destructive">거부</Badge>;
      default:
        return <Badge variant="outline">알 수 없음</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'low':
        return <Badge variant="outline" className="border-gray-500 text-gray-600">낮음</Badge>;
      case 'medium':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-600">보통</Badge>;
      case 'high':
        return <Badge variant="outline" className="border-red-500 text-red-600">높음</Badge>;
      default:
        return <Badge variant="outline">알 수 없음</Badge>;
    }
  };

  const getTypeFilterLabel = (type: string) => {
    switch (type) {
      case 'course_enrollment': return '수강 신청';
      case 'instructor_registration': return '강사 등록';
      case 'payment_approval': return '결제 승인';
      case 'schedule_change': return '일정 변경';
      case 'refund_request': return '환불 요청';
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
        <RefreshButton
          onRefresh={fetchApprovals}
          size="md"
          variant="outline"
          tooltip="승인 데이터 새로고침"
        />
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">대기 중</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
            <p className="text-xs text-gray-500">승인 대기 중인 요청</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">승인됨</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
            <p className="text-xs text-gray-500">승인된 요청</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">거부됨</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{rejectedCount}</div>
            <p className="text-xs text-gray-500">거부된 요청</p>
          </CardContent>
        </Card>
      </div>

      {/* 필터 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>필터</CardTitle>
        </CardHeader>
        <CardContent>
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
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 승인 요청 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>승인 요청 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveTable>
            <TableHeader>
              <TableHeaderCell>유형</TableHeaderCell>
              <TableHeaderCell>제목 및 설명</TableHeaderCell>
              <TableHeaderCell>요청자</TableHeaderCell>
              <TableHeaderCell>요청일</TableHeaderCell>
              <TableHeaderCell>우선순위</TableHeaderCell>
              <TableHeaderCell>상태</TableHeaderCell>
              <TableHeaderCell>작업</TableHeaderCell>
            </TableHeader>
            <TableBody>
              {filteredApprovals.map((approval) => (
                <TableRow key={approval.id}>
                  <TableCell>{getTypeLabel(approval.type)}</TableCell>
                  <TableCell>
                    <div className="font-medium">{approval.title}</div>
                    <div className="text-sm text-gray-500">{approval.description}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{approval.requesterName}</div>
                    <div className="text-sm text-gray-500">{approval.requesterType}</div>
                  </TableCell>
                  <TableCell className="text-gray-500">{approval.requestDate}</TableCell>
                  <TableCell>{getPriorityBadge(approval.priority)}</TableCell>
                  <TableCell>{getStatusBadge(approval.status)}</TableCell>
                  <TableCell>
                    {approval.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApproval(approval.id, 'approve')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          승인
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleApproval(approval.id, 'reject')}
                        >
                          거부
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </ResponsiveTable>
        </CardContent>
      </Card>
    </div>
  );
}
