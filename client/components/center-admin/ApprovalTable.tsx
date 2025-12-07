/**
 * 승인 관리 테이블 컴포넌트
 * 
 * 연동되는 데이터: Approval[]
 * 연동되는 파일: client/app/center-admin/manage/page.tsx
 */

import React from 'react';
import { FileCheck, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../ui';

interface ApprovalItem {
  id: string;
  type: 'course_enrollment' | 'payment_approval' | 'schedule_change' | 'refund_request' | 'instructor_registration';
  title: string;
  description: string;
  requesterName: string;
  requesterEmail: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected';
  priority: 'low' | 'medium' | 'high';
  estimatedAmount?: number;
  courseName?: string;
}

interface ApprovalTableProps {
  approvals: ApprovalItem[];
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

const getStatusColor = (status: string) => {
  const colorMap: { [key: string]: string } = {
    'approved': 'bg-green-100 text-green-800',
    'rejected': 'bg-red-100 text-red-800',
    'pending': 'bg-yellow-100 text-yellow-800'
  };
  return colorMap[status] || 'bg-gray-100 text-gray-800';
};

const getStatusText = (status: string) => {
  const statusMap: { [key: string]: string } = {
    'approved': '승인됨',
    'rejected': '거절됨',
    'pending': '대기중'
  };
  return statusMap[status] || status;
};

const getTypeLabel = (type: string) => {
  const types: { [key: string]: string } = {
    'course_enrollment': '강습 신청',
    'payment_approval': '결제 승인',
    'schedule_change': '일정 변경',
    'refund_request': '환불 요청',
    'instructor_registration': '강사 등록'
  };
  return types[type] || type;
};

const getPriorityColor = (priority: string) => {
  const colors: { [key: string]: string } = {
    'high': 'bg-red-100 text-red-800',
    'medium': 'bg-yellow-100 text-yellow-800',
    'low': 'bg-green-100 text-green-800'
  };
  return colors[priority] || 'bg-gray-100 text-gray-800';
};

const getPriorityText = (priority: string) => {
  const priorities: { [key: string]: string } = {
    'high': '높음',
    'medium': '보통',
    'low': '낮음'
  };
  return priorities[priority] || priority;
};

export default function ApprovalTable({ 
  approvals, 
  onApprove,
  onReject 
}: ApprovalTableProps) {
  if (approvals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>승인 요청 목록</CardTitle>
          <CardDescription>강습 신청, 결제 승인, 일정 변경, 환불 요청을 관리하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <FileCheck className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>승인 요청이 없습니다.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>승인 요청 목록</CardTitle>
        <CardDescription>강습 신청, 결제 승인, 일정 변경, 환불 요청을 관리하세요</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {approvals.map((approval) => (
            <div key={approval.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow h-full overflow-visible">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0 break-words">
                  <div className="text-sm font-medium">{approval.title}</div>
                  <div className="text-xs text-gray-500">{approval.description}</div>
                  {approval.courseName && (
                    <div className="text-xs text-blue-600 mt-1">📚 {approval.courseName}</div>
                  )}
                  {approval.estimatedAmount && (
                    <div className="text-xs text-green-600 mt-1">💰 {approval.estimatedAmount.toLocaleString()}원</div>
                  )}
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(approval.status)}`}>
                  {getStatusText(approval.status)}
                </span>
              </div>
              <div className="mt-3 space-y-1 text-sm">
                <div className="text-gray-600 break-words">{approval.requesterName} • {approval.requesterEmail}</div>
                <div>
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {getTypeLabel(approval.type)}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ml-2 ${getPriorityColor(approval.priority)}`}>
                    {getPriorityText(approval.priority)}
                  </span>
                </div>
                <div className="text-gray-500">{approval.requestDate}</div>
              </div>
              {approval.status === 'pending' && (onApprove || onReject) && (
                <div className="mt-3 flex gap-2">
                  {onApprove && (
                    <Button onClick={() => onApprove(approval.id)} size="sm" className="bg-green-600 hover:bg-green-700">승인</Button>
                  )}
                  {onReject && (
                    <Button onClick={() => onReject(approval.id)} size="sm" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">거절</Button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

