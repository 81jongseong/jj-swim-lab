/**
 * 결제 관리 테이블 컴포넌트
 * 
 * 연동되는 데이터: Payment[]
 * 연동되는 파일: client/app/center-admin/manage/page.tsx
 */

import React from 'react';
import { CreditCard, DollarSign, CheckCircle, AlertCircle, XCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../ui';

interface Payment {
  _id: string;
  transactionId?: string;
  description: string;
  userName: string;
  userEmail: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  refundAmount?: number;
  createdAt: Date | string;
}

interface PaymentTableProps {
  payments: Payment[];
  onRefund?: (paymentId: string) => void;
  onCancel?: (paymentId: string) => void;
}

const getStatusColor = (status: string) => {
  const colorMap: { [key: string]: string } = {
    'approved': 'bg-green-100 text-green-800',
    'rejected': 'bg-red-100 text-red-800',
    'pending': 'bg-yellow-100 text-yellow-800',
    'completed': 'bg-green-100 text-green-800',
    'cancelled': 'bg-gray-100 text-gray-800',
    'failed': 'bg-red-100 text-red-800',
    'refunded': 'bg-blue-100 text-blue-800'
  };
  return colorMap[status] || 'bg-gray-100 text-gray-800';
};

const getCardTheme = (status: string) => {
  const themeMap: { [key: string]: { container: string; title: string } } = {
    'refunded': {
      container: 'bg-blue-50 border-blue-300 hover:bg-blue-100 hover:border-blue-400',
      title: 'text-blue-900'
    },
    'cancelled': {
      container: 'bg-red-50 border-red-300 hover:bg-red-100 hover:border-red-400',
      title: 'text-red-900'
    },
    'failed': {
      container: 'bg-red-50 border-red-300 hover:bg-red-100 hover:border-red-400',
      title: 'text-red-900'
    },
    'pending': {
      container: 'bg-yellow-50 border-yellow-300 hover:bg-yellow-100 hover:border-yellow-400',
      title: 'text-yellow-900'
    },
    'completed': {
      container: 'bg-green-50 border-green-300 hover:bg-green-100 hover:border-green-400',
      title: 'text-green-900'
    }
  };
  return themeMap[status] || { container: 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300', title: 'text-gray-900' };
};

const getStatusText = (status: string) => {
  const statusMap: { [key: string]: string } = {
    'approved': '승인됨',
    'rejected': '거절됨',
    'pending': '대기중',
    'completed': '승인됨',
    'cancelled': '취소됨',
    'failed': '실패',
    'refunded': '환불됨'
  };
  return statusMap[status] || status;
};

const getPaymentMethodLabel = (method: string) => {
  const methods: { [key: string]: string } = {
    'card': '카드',
    'transfer': '계좌이체',
    'cash': '현금',
    'online': '온라인',
    'mobile': '모바일'
  };
  return methods[method] || method;
};

const formatCurrency = (amount: number, currency: string = 'KRW') => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

export default function PaymentTable({ 
  payments, 
  onRefund,
  onCancel
}: PaymentTableProps) {
  if (payments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>결제 내역</CardTitle>
          <CardDescription>모든 결제 내역을 확인하고 관리하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <CreditCard className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>결제 내역이 없습니다.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>결제 내역</CardTitle>
        <CardDescription>모든 결제 내역을 확인하고 관리하세요</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {payments.map((payment) => {
            const theme = getCardTheme(payment.status);
            return (
            <div
              key={payment._id}
              className={`border-2 rounded-lg p-4 hover:shadow-lg transition-all h-full overflow-visible ${theme.container}`}
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0 break-words">
                  <div className={`text-sm font-semibold ${theme.title}`}>
                    {payment.description}
                  </div>
                </div>
              </div>
              <div className="mt-3 space-y-1 text-sm">
                <div className="text-gray-700 whitespace-nowrap">
                  {formatCurrency(payment.amount, payment.currency)}
                  {payment.refundAmount && (
                    <span className="ml-2 text-red-600">(환불 {formatCurrency(payment.refundAmount, payment.currency)})</span>
                  )}
                </div>
                <div className="text-gray-500 flex items-center">
                  <CreditCard className="w-4 h-4 mr-2 text-gray-400" />{getPaymentMethodLabel(payment.paymentMethod)}
                </div>
                <div className="text-gray-500">
                  {payment.createdAt instanceof Date 
                    ? payment.createdAt.toLocaleString('ko-KR')
                    : new Date(payment.createdAt).toLocaleString('ko-KR')}
                </div>
                <div className="text-gray-600 break-words">{payment.userName} • {payment.userEmail}</div>
              </div>
              <div className="mt-3 flex gap-2">
                {/* 카드 결제: 결제 취소 버튼 (대기중/완료 모두 노출, 이미 취소/환불 제외) */}
                {payment.paymentMethod === 'card' && !['cancelled', 'refunded'].includes(payment.status) && onCancel && (
                      <Button onClick={() => onCancel(payment._id)} size="sm" variant="outline" className="gap-1">
                    <XCircle className="w-4 h-4" /> 결제 취소
                      </Button>
                    )}
                {/* 현금 결제: 환불 버튼 (대기중/완료 모두 노출, 이미 취소/환불 제외) */}
                {payment.paymentMethod === 'cash' && !['cancelled', 'refunded'].includes(payment.status) && onRefund && (
                      <Button onClick={() => onRefund(payment._id)} size="sm" variant="danger" className="gap-1">
                        <RotateCcw className="w-4 h-4" /> 환불
                      </Button>
                    )}
                {/* 완료된 이후의 보조 버튼 (유지) */}
                {payment.status === 'completed' && (
                  <>
                    {/* 위에서 이미 노출되므로 중복 방지, 필요시 추가 동작 배치 가능 */}
                  </>
                )}
              </div>
            </div>
          );})}
        </div>
      </CardContent>
    </Card>
  );
}

