'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { CreditCard, DollarSign, TrendingUp, Users, Calendar, CheckCircle, XCircle } from 'lucide-react';
import withAuth from '@/components/withAuth';

interface Payment {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  currency: string;
  paymentMethod: 'card' | 'bank_transfer' | 'cash' | 'mobile';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  description: string;
  createdAt: Date;
  completedAt?: Date;
  transactionId?: string;
  refundAmount?: number;
  refundReason?: string;
}

function PaymentsManagement() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 권한 확인 - 페이지 렌더링 전에 체크
  // center@swim.com 계정도 센터 관리자로 인식
  const isCenterAdmin = user && (
    ['centerAdmin', 'center-admin', 'superAdmin'].includes(user.userType) ||
    user.email === 'center@swim.com'
  );
  
  if (!isCenterAdmin) {
    // 권한이 없는 사용자는 게스트 버전의 화면으로 리다이렉트
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
    return null;
  }

  useEffect(() => {
    if (user) {
      loadPayments();
    }
  }, [user]);

  const loadPayments = async () => {
    try {
      setIsLoading(true);
      // 임시 데이터
      const tempPayments: Payment[] = [
        {
          _id: '1',
          userId: 'user001',
          userName: '김학생',
          userEmail: 'student1@example.com',
          amount: 80000,
          currency: 'KRW',
          paymentMethod: 'card',
          status: 'completed',
          description: '초급 자유형 클래스 수강료',
          createdAt: new Date('2024-01-20'),
          completedAt: new Date('2024-01-20'),
          transactionId: 'TXN_001'
        },
        {
          _id: '2',
          userId: 'user002',
          userName: '이학생',
          userEmail: 'student2@example.com',
          amount: 100000,
          currency: 'KRW',
          paymentMethod: 'bank_transfer',
          status: 'completed',
          description: '중급 배영 클래스 수강료',
          createdAt: new Date('2024-01-19'),
          completedAt: new Date('2024-01-19'),
          transactionId: 'TXN_002'
        },
        {
          _id: '3',
          userId: 'user003',
          userName: '박학생',
          userEmail: 'student3@example.com',
          amount: 120000,
          currency: 'KRW',
          paymentMethod: 'card',
          status: 'pending',
          description: '고급 접영 클래스 수강료',
          createdAt: new Date('2024-01-21'),
          transactionId: 'TXN_003'
        },
        {
          _id: '4',
          userId: 'user004',
          userName: '최학생',
          userEmail: 'student4@example.com',
          amount: 80000,
          currency: 'KRW',
          paymentMethod: 'mobile',
          status: 'failed',
          description: '초급 자유형 클래스 수강료',
          createdAt: new Date('2024-01-18'),
          transactionId: 'TXN_004'
        }
      ];
      setPayments(tempPayments);
    } catch (error) {
      console.error('결제 내역 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const statuses: { [key: string]: string } = {
      'pending': '대기중',
      'completed': '완료',
      'failed': '실패',
      'refunded': '환불'
    };
    return statuses[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-green-100 text-green-800',
      'failed': 'bg-red-100 text-red-800',
      'refunded': 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'pending':
        return <Calendar className="w-4 h-4 text-yellow-600" />;
      case 'refunded':
        return <CreditCard className="w-4 h-4 text-blue-600" />;
      default:
        return <CreditCard className="w-4 h-4 text-gray-600" />;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    const methods: { [key: string]: string } = {
      'card': '카드',
      'bank_transfer': '계좌이체',
      'cash': '현금',
      'mobile': '모바일'
    };
    return methods[method] || method;
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          결제 관리
        </h1>
        <p className="text-gray-600">센터의 결제 내역과 환불을 관리하세요</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">총 결제액</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(
                  payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
                  'KRW'
                )}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">완료된 결제</p>
              <p className="text-2xl font-bold text-gray-900">
                {payments.filter(p => p.status === 'completed').length}건
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">대기중인 결제</p>
              <p className="text-2xl font-bold text-gray-900">
                {payments.filter(p => p.status === 'pending').length}건
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">총 결제 건수</p>
              <p className="text-2xl font-bold text-gray-900">{payments.length}건</p>
            </div>
          </div>
        </div>
      </div>

      {/* 결제 내역 목록 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">결제 내역</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  결제 정보
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  결제자
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  금액
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  결제수단
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  결제일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  액션
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.map((payment) => (
                <tr key={payment._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {payment.transactionId}
                      </div>
                      <div className="text-sm text-gray-500">{payment.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{payment.userName}</div>
                      <div className="text-sm text-gray-500">{payment.userEmail}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(payment.amount, payment.currency)}
                    </div>
                    {payment.refundAmount && (
                      <div className="text-sm text-red-600">
                        환불: {formatCurrency(payment.refundAmount, payment.currency)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getPaymentMethodLabel(payment.paymentMethod)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(payment.status)}
                      <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(payment.status)}`}>
                        {getStatusLabel(payment.status)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {payment.completedAt 
                      ? payment.completedAt.toLocaleDateString()
                      : payment.createdAt.toLocaleDateString()
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {payment.status === 'completed' && (
                        <button className="text-blue-600 hover:text-blue-900 text-xs">
                          환불
                        </button>
                      )}
                      {payment.status === 'pending' && (
                        <button className="text-green-600 hover:text-green-900 text-xs">
                          승인
                        </button>
                      )}
                      <button className="text-gray-600 hover:text-gray-900 text-xs">
                        상세
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default withAuth(PaymentsManagement, { 
  requireTypes: ['centerAdmin', 'superAdmin'] 
});