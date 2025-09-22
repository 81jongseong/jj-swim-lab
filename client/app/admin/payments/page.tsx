"use client";

import { useEffect, useMemo, useState } from 'react';
import apiClient from '@/utils/api';
import withAuth from '@/components/withAuth';

function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const load = async () => {
    setLoading(true);
    try {
      console.log('🔍 결제 데이터 로드 시작...');
      const res = await apiClient.getPayments();
      console.log('📊 API 응답:', res);
      
      // 다양한 응답 형태 처리
      let paymentsData = [];
      if (res.data?.payments) {
        paymentsData = res.data.payments;
      } else if (res.data && Array.isArray(res.data)) {
        paymentsData = res.data;
      } else if (res.payments) {
        paymentsData = res.payments;
      } else if (Array.isArray(res)) {
        paymentsData = res;
      }
      
      console.log('💳 결제 데이터:', paymentsData.length, '개');
      setPayments(paymentsData);
    } catch (error) {
      console.error('❌ 결제 데이터 로드 오류:', error);
      setPayments([]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(()=> filter==='all' ? payments : payments.filter(p=>p.status===filter), [payments, filter]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">로딩 중...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">결제 관리</h1>
          <p className="text-gray-600">JJ Swim Lab의 모든 결제를 관리하세요</p>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">결제 목록</h2>
              <button 
                onClick={async ()=>{
                  const amount = Number(prompt('금액(원):','10000')||'0');
                  if (!amount) return;
                  const res = await apiClient.createPayment({ amount, paymentMethod: 'cash', purpose: 'other' });
                  if (!res.error) await load(); else alert(res.error);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                새 결제 추가
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
                            <table className="w-full min-w-[800px] lg:min-w-[1000px] xl:min-w-[1200px] divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    결제자
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    금액
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    결제방법
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    날짜
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.map((payment) => (
                  <tr key={payment._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {payment.user?.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.amount.toLocaleString()}원
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.paymentMethod}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                        payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        payment.status === 'refunded' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(payment.createdAt).toISOString().slice(0,10)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => alert(JSON.stringify(payment, null, 2))}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        상세보기
                      </button>
                      <button 
                        onClick={async () => {
                          if (payment.status !== 'completed') return;
                          if (!confirm('정말로 이 결제를 환불하시겠습니까?')) return;
                          const res = await apiClient.refundPayment(payment._id, '관리자 환불');
                          if (!res.error) await load(); else alert(res.error);
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        환불
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* 빈 상태 UI */}
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💳</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">결제 내역이 없습니다</h3>
              <p className="text-gray-500 mb-6">
                아직 결제 내역이 없습니다. 새로운 결제를 추가해보세요.
              </p>
              <button
                onClick={async () => {
                  const amount = Number(prompt('금액(원):', '10000') || '0');
                  if (!amount) return;
                  const res = await apiClient.createPayment({ 
                    amount, 
                    paymentMethod: 'cash', 
                    purpose: 'other',
                    notes: '테스트 결제'
                  });
                  if (!res.error) {
                    await load();
                  } else {
                    alert(res.error);
                  }
                }}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                💳 테스트 결제 추가
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default withAuth(AdminPaymentsPage, { requireTypes: ['centerAdmin','superAdmin'], requirePermission: null });
