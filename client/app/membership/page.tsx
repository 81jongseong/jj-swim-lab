'use client';

import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/button';
import { Badge } from '@/components/ui';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger   } from '../../components/ui/tabs';
import apiClient from '../../utils/api';
import withAuth from '../../components/withAuth';

interface MembershipPlan {
  _id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  features: string[];
  maxClassesPerMonth?: number;
  maxVideoUploads?: number;
  prioritySupport: boolean;
  isActive: boolean;
}

interface UserMembership {
  _id: string;
  userId: { name: string; email: string };
  planId: MembershipPlan;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  autoRenew: boolean;
  totalPaid: number;
  nextPaymentDate?: string;
}

interface MembershipPayment {
  _id: string;
  membershipId: string;
  userId: { name: string };
  amount: number;
  paymentMethod: string;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  paymentDate: string;
  description: string;
}

function MembershipPage() {
  const [activeTab, setActiveTab] = useState('plans');
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [userMemberships, setUserMemberships] = useState<UserMembership[]>([]);
  const [payments, setPayments] = useState<MembershipPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [showCreateMembership, setShowCreateMembership] = useState(false);
  
  const [newPlan, setNewPlan] = useState({
    name: '',
    description: '',
    price: 0,
    duration: 30,
    features: [''],
    maxClassesPerMonth: 10,
    maxVideoUploads: 5,
    prioritySupport: false
  });

  const [newMembership, setNewMembership] = useState({
    userId: '',
    planId: '',
    startDate: '',
    endDate: '',
    autoRenew: true,
    totalPaid: 0
  });

  const currentUser = apiClient.getCurrentUser();
  const isAdmin = currentUser?.userType === 'superAdmin' || currentUser?.userType === 'centerAdmin';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // 멤버십 플랜 조회
      const plansRes = await apiClient.get<{
        success: boolean;
        data?: { plans?: MembershipPlan[] };
        error?: string;
      }>('/membership/plans');
      if ((plansRes as any).data?.plans) setPlans((plansRes as any).data.plans);

      // 사용자 멤버십 조회
      const membershipsRes = await apiClient.get<{
        success: boolean;
        data?: { memberships?: UserMembership[] };
        error?: string;
      }>('/membership');
      if ((membershipsRes as any).data?.memberships) setUserMemberships((membershipsRes as any).data.memberships);

      // 결제 내역 조회
      const paymentsRes = await apiClient.get<{
        success: boolean;
        data?: { payments?: MembershipPayment[] };
        error?: string;
      }>('/membership/payments');
      if ((paymentsRes as any).data?.payments) setPayments((paymentsRes as any).data.payments);
    } catch (error) {
      console.error('데이터 로딩 중 오류:', error);
    }
    setLoading(false);
  };

  const handleCreatePlan = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiClient.post('/membership/plans', newPlan);
      if (!res.error) {
        setShowCreatePlan(false);
        setNewPlan({
          name: '', description: '', price: 0, duration: 30,
          features: [''], maxClassesPerMonth: 10, maxVideoUploads: 5, prioritySupport: false
        });
        await loadData();
        alert('멤버십 플랜이 성공적으로 생성되었습니다.');
      }
    } catch (error) {
      alert('멤버십 플랜 생성 중 오류가 발생했습니다.');
    }
  };

  const handleCreateMembership = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiClient.post('/membership', newMembership);
      if (!res.error) {
        setShowCreateMembership(false);
        setNewMembership({
          userId: '', planId: '', startDate: '', endDate: '', autoRenew: true, totalPaid: 0
        });
        await loadData();
        alert('사용자 멤버십이 성공적으로 생성되었습니다.');
      }
    } catch (error) {
      alert('사용자 멤버십 생성 중 오류가 발생했습니다.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '활성';
      case 'expired': return '만료';
      case 'cancelled': return '취소됨';
      case 'pending': return '대기';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">멤버십 관리</h1>
        <p className="text-gray-600 mt-2">멤버십 플랜과 사용자의 멤버십을 관리합니다.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="plans">멤버십 플랜</TabsTrigger>
          <TabsTrigger value="memberships">사용자 멤버십</TabsTrigger>
          <TabsTrigger value="payments">결제 내역</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">멤버십 플랜</h2>
            {isAdmin && (
              <Button onClick={() => setShowCreatePlan(true)}>
                새 플랜 생성
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card key={plan._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex justify-between items-start">
                    <span>{plan.name}</span>
                    <Badge>
                      {plan.isActive ? '활성' : '비활성화'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">가격</span>
                      <span className="text-lg font-bold text-blue-600">
                        {plan.price.toLocaleString()}원
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>기간:</span>
                      <span>{plan.duration}개월</span>
                    </div>
                    <div className="flex justify-between">
                      <span>월 최대 강습:</span>
                      <span>{plan.maxClassesPerMonth}회</span>
                    </div>
                    <div className="flex justify-between">
                      <span>비디오 업로드:</span>
                      <span>{plan.maxVideoUploads}개</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">주요 기능:</h4>
                    <ul className="space-y-1">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-center">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="memberships" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">사용자 멤버십</h2>
            {isAdmin && (
              <Button onClick={() => setShowCreateMembership(true)}>
                새 멤버십 생성
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {userMemberships.map((membership) => (
              <Card key={membership._id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">{membership.userId.name}</h3>
                      <p className="text-gray-600">{membership.userId.email}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {membership.planId.name} - {membership.planId.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(membership.status)}>
                        {getStatusText(membership.status)}
                      </Badge>
                      <p className="text-lg font-bold text-blue-600 mt-2">
                        {membership.totalPaid.toLocaleString()}원
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                    <div>
                      <span className="text-gray-500">시작일</span>
                      <p>{new Date(membership.startDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">종료일</span>
                      <p>{new Date(membership.endDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">자동 갱신:</span>
                      <p>{membership.autoRenew ? '네' : '아니오'}</p>
                    </div>
                    {membership.nextPaymentDate && (
                      <div>
                        <span className="text-gray-500">다음 결제일:</span>
                        <p>{new Date(membership.nextPaymentDate).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <h2 className="text-2xl font-semibold">결제 내역</h2>
          <div className="space-y-4">
            {payments.map((payment) => (
              <Card key={payment._id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">{payment.userId.name}</h3>
                      <p className="text-gray-600">{payment.description}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(payment.paymentDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(payment.paymentStatus)}>
                        {getStatusText(payment.paymentStatus)}
                      </Badge>
                      <p className="text-lg font-bold text-blue-600 mt-2">
                        {payment.amount.toLocaleString()}원
                      </p>
                      <p className="text-sm text-gray-500">{payment.paymentMethod}</p>
                    </div>
                  </div>
                  {payment.transactionId && (
                    <p className="text-sm text-gray-500 mt-2">
                      거래 ID: {payment.transactionId}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* 멤버십 플랜 생성 모달 */}
      {showCreatePlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">새 멤버십 플랜 생성</h3>
            <form onSubmit={handleCreatePlan} className="space-y-4">
              <Input
                placeholder="플랜 이름"
                value={newPlan.name}
                onChange={(e) => setNewPlan({...newPlan, name: e.target.value})}
                required
              />
              <Input
                placeholder="설명"
                value={newPlan.description}
                onChange={(e) => setNewPlan({...newPlan, description: e.target.value})}
                required
              />
              <Input
                type="number"
                placeholder="가격 (원)"
                value={newPlan.price.toString()}
                onChange={(e) => setNewPlan({...newPlan, price: Number(e.target.value)})}
                required
              />
              <Input
                type="number"
                placeholder="기간 (개월)"
                value={newPlan.duration.toString()}
                onChange={(e) => setNewPlan({...newPlan, duration: Number(e.target.value)})}
                required
              />
              <div className="flex space-x-2">
                <Button type="submit" className="flex-1">생성</Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowCreatePlan(false)}
                >
                  취소
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 사용자 멤버십 생성 모달 */}
      {showCreateMembership && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">새 사용자 멤버십 생성</h3>
            <form onSubmit={handleCreateMembership} className="space-y-4">
              <Input
                placeholder="사용자 ID"
                value={newMembership.userId}
                onChange={(e) => setNewMembership({...newMembership, userId: e.target.value})}
                required
              />
              <Select value={newMembership.planId} onValueChange={(value) => setNewMembership({...newMembership, planId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="멤버십 플랜 선택" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((plan) => (
                    <SelectItem key={plan._id} value={plan._id}>
                      {plan.name} - {plan.price.toLocaleString()}원
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="date"
                value={newMembership.startDate}
                onChange={(e) => setNewMembership({...newMembership, startDate: e.target.value})}
                required
              />
              <Input
                type="date"
                value={newMembership.endDate}
                onChange={(e) => setNewMembership({...newMembership, endDate: e.target.value})}
                required
              />
              <Input
                type="number"
                placeholder="총 결제 금액"
                value={newMembership.totalPaid.toString()}
                onChange={(e) => setNewMembership({...newMembership, totalPaid: Number(e.target.value)})}
                required
              />
              <div className="flex space-x-2">
                <Button type="submit" className="flex-1">생성</Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowCreateMembership(false)}
                >
                  취소
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default withAuth(MembershipPage, { requireTypes: ['superAdmin', 'centerAdmin'] });





