/**
 * @file 센터 관리자 결제 관리 페이지
 * @description 센터 관리자가 결제 내역을 확인하고 관리할 수 있는 페이지입니다.
 * @date 2025-09-14
 * @author JJ Swim Lab
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { CreditCard, Search, Filter, Download, Eye, Calendar, User, DollarSign } from 'lucide-react';

interface Payment {
  id: string;
  studentName: string;
  courseName: string;
  amount: number;
  paymentMethod: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  paymentDate: string;
  transactionId: string;
}

const CenterAdminPaymentsPage: React.FC = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending' | 'failed' | 'refunded'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: '',
  });

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      
      // 실제 API 호출
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/centers/payments', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('결제 데이터를 가져올 수 없습니다.');
      }

      const result = await response.json();
      
      if (result.success) {
        setPayments(result.data);
      } else {
        throw new Error(result.message || '결제 데이터 조회에 실패했습니다.');
      }
    } catch (error) {
      console.error('결제 데이터 로딩 실패:', error);
      
      // 임시 데이터 (개발용)
      const mockPayments: Payment[] = [
        {
          id: '1',
          studentName: '김학생',
          courseName: '자유형 기초',
          amount: 150000,
          paymentMethod: '카드',
          status: 'completed',
          paymentDate: '2025-09-14',
          transactionId: 'TXN123456789',
        },
        {
          id: '2',
          studentName: '박학생',
          courseName: '배영 중급',
          amount: 200000,
          paymentMethod: '계좌이체',
          status: 'pending',
          paymentDate: '2025-09-13',
          transactionId: 'TXN123456790',
        },
        {
          id: '3',
          studentName: '정학생',
          courseName: '접영 고급',
          amount: 250000,
          paymentMethod: '카드',
          status: 'failed',
          paymentDate: '2025-09-12',
          transactionId: 'TXN123456791',
        },
        {
          id: '4',
          studentName: '이학생',
          courseName: '자유형 중급',
          amount: 180000,
          paymentMethod: '카드',
          status: 'refunded',
          paymentDate: '2025-09-11',
          transactionId: 'TXN123456792',
        },
      ];
      
      setPayments(mockPayments);
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async (paymentId: string) => {
    if (!confirm('정말로 이 결제를 환불하시겠습니까?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/centers/payments/${paymentId}/refund`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('환불 처리에 실패했습니다.');
      }

      const result = await response.json();
      
      if (result.success) {
        fetchPayments();
        alert('환불이 처리되었습니다.');
      } else {
        throw new Error(result.message || '환불 처리에 실패했습니다.');
      }
    } catch (error) {
      console.error('환불 처리 실패:', error);
      alert('환불 처리에 실패했습니다.');
    }
  };

  const handleExport = () => {
    // CSV 내보내기 기능
    const csvContent = [
      ['결제ID', '학생명', '강의명', '금액', '결제방법', '상태', '결제일', '거래ID'],
      ...payments.map(payment => [
        payment.id,
        payment.studentName,
        payment.courseName,
        payment.amount.toLocaleString(),
        payment.paymentMethod,
        payment.status,
        payment.paymentDate,
        payment.transactionId,
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `payments_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const filteredPayments = payments.filter(payment => {
    const matchesFilter = filter === 'all' || payment.status === filter;
    const matchesSearch = payment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDateRange = (!dateRange.start || payment.paymentDate >= dateRange.start) &&
                           (!dateRange.end || payment.paymentDate <= dateRange.end);
    return matchesFilter && matchesSearch && matchesDateRange;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default">완료</Badge>;
      case 'pending':
        return <Badge variant="secondary">대기중</Badge>;
      case 'failed':
        return <Badge variant="destructive">실패</Badge>;
      case 'refunded':
        return <Badge variant="outline">환불됨</Badge>;
      default:
        return <Badge variant="secondary">알 수 없음</Badge>;
    }
  };

  const getTotalAmount = () => {
    return filteredPayments
      .filter(payment => payment.status === 'completed')
      .reduce((sum, payment) => sum + payment.amount, 0);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          결제 관리
        </h1>
        <p className="text-gray-600">
          결제 내역을 확인하고 관리하세요.
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">총 결제 금액</p>
                <p className="text-2xl font-bold text-green-600">
                  {getTotalAmount().toLocaleString()}원
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">완료된 결제</p>
                <p className="text-2xl font-bold text-blue-600">
                  {payments.filter(p => p.status === 'completed').length}
                </p>
              </div>
              <CreditCard className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">대기중인 결제</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {payments.filter(p => p.status === 'pending').length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">실패한 결제</p>
                <p className="text-2xl font-bold text-red-600">
                  {payments.filter(p => p.status === 'failed').length}
                </p>
              </div>
              <CreditCard className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 필터 및 검색 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>결제 필터</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="학생명, 강의명, 거래ID로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => setFilter('all')}
              >
                전체
              </Button>
              <Button
                variant={filter === 'completed' ? 'default' : 'outline'}
                onClick={() => setFilter('completed')}
              >
                완료
              </Button>
              <Button
                variant={filter === 'pending' ? 'default' : 'outline'}
                onClick={() => setFilter('pending')}
              >
                대기중
              </Button>
              <Button
                variant={filter === 'failed' ? 'default' : 'outline'}
                onClick={() => setFilter('failed')}
              >
                실패
              </Button>
              <Button
                variant={filter === 'refunded' ? 'default' : 'outline'}
                onClick={() => setFilter('refunded')}
              >
                환불됨
              </Button>
            </div>
            <Button onClick={handleExport} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              내보내기
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 결제 목록 */}
      <div className="space-y-4">
        {filteredPayments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">결제 내역이 없습니다.</p>
            </CardContent>
          </Card>
        ) : (
          filteredPayments.map((payment) => (
            <Card key={payment.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-lg font-semibold">{payment.studentName}</h3>
                      <span className="text-xl font-bold text-green-600">
                        {payment.amount.toLocaleString()}원
                      </span>
                      {getStatusBadge(payment.status)}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      <div className="flex items-center gap-4">
                        <span>{payment.courseName}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {payment.paymentDate}
                        </span>
                        <span>{payment.paymentMethod}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">거래ID: {payment.transactionId}</p>
                  </div>
                </div>
                
                {payment.status === 'completed' && (
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRefund(payment.id)}
                    >
                      환불 처리
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="mt-8 p-4 bg-blue-50 border-l-4 border-blue-400 text-blue-800">
        <p className="font-semibold">개발 참고:</p>
        <p>이 페이지의 데이터는 하드코딩이 아닌 데이터베이스에서 관리되어야 합니다.</p>
        <p>관련 API 엔드포인트 (`/api/centers/payments` 등) 개발이 필요합니다.</p>
      </div>
    </div>
  );
};

export default CenterAdminPaymentsPage;
