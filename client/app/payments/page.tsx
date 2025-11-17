"use client";

import { useEffect, useMemo, useState } from "react";
import apiClient from '../../utils/api';

interface ApiPayment {
  _id: string;
  user: { name: string; userId: string } | string;
  amount: number;
  createdAt: string;
  status: "pending" | "completed" | "failed" | "refunded";
  paymentMethod: string;
  purpose: string;
  relatedCourse?: { name: string } | string;
  relatedBooking?: { date: string; startTime: string; endTime: string } | string;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<ApiPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("all");
  const currentUser = apiClient.getCurrentUser();
  const isSuperAdmin = currentUser?.userType === "superAdmin";

  const loadPayments = async () => {
    setLoading(true);
    try {
      const res = await apiClient.getPayments();
      console.log('📊 결제 내역 응답:', res);
      console.log('📊 결제 내역 데이터:', res.data);
      console.log('📊 결제 내역 배열:', res.data?.payments);
      if (res.data?.payments) {
        setPayments(res.data.payments);
        console.log('✅ 결제 내역 설정 완료:', res.data.payments.length, '건');
      } else {
        console.warn('⚠️ 결제 내역 데이터가 없습니다:', res);
        setPayments([]);
      }
    } catch (error) {
      console.error('❌ 결제 내역 로딩 오류:', error);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const filteredPayments = useMemo(() => {
    let filtered = payments;
    
    // 상태 필터
    if (selectedStatus !== "all") {
      filtered = filtered.filter((p) => p.status === (selectedStatus as any));
    }
    
    // 결제 수단 필터
    if (selectedPaymentMethod !== "all") {
      filtered = filtered.filter((p) => p.paymentMethod === selectedPaymentMethod);
    }
    
    return filtered;
  }, [payments, selectedStatus, selectedPaymentMethod]);

  // ⭐ 총 결제 금액 계산 (completed 상태의 결제 금액 합계)
  const totalCompleted = useMemo(() => {
    return payments
      .filter((p) => p.status === "completed")
      .reduce((sum, p) => sum + (p.amount || 0), 0);
  }, [payments]);

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "결제완료";
      case "pending":
        return "결제대기";
      case "refunded":
        return "환불완료";
      case "failed":
        return "결제실패";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "refunded":
        return "bg-blue-100 text-blue-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleRefund = async (paymentId: string) => {
    if (!confirm("정말로 이 결제를 환불 신청하시겠습니까?")) return;
    const res = await apiClient.post(`/payments/${paymentId}/refund`, { reason: "사용자 요청" });
    if (!res.error) {
      await loadPayments();
      alert("환불 신청이 완료되었습니다.");
    } else {
      alert(res.error);
    }
  };

  const handleComplete = async (paymentId: string) => {
    const res = await apiClient.post(`/payments/${paymentId}/complete`, {});
    if (!res.error) {
      await loadPayments();
      alert("결제가 완료 처리되었습니다.");
    } else {
      alert(res.error);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">결제 내역</h1>

        <div className="flex flex-wrap justify-between gap-4 mb-4">
          <div className="bg-white rounded-lg shadow p-4 flex-1 min-w-[180px]">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-xl">💰</span>
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">총 결제</p>
                <p className="text-xl font-bold text-gray-900">
                  {totalCompleted.toLocaleString()}원
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 flex-1 min-w-[180px]">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-xl">📊</span>
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">결제 완료</p>
                <p className="text-xl font-bold text-gray-900">
                  {payments.filter((p) => p.status === "completed").length}건
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 flex-1 min-w-[180px]">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <span className="text-xl">🔄</span>
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">환불 완료</p>
                <p className="text-xl font-bold text-gray-900">
                  {payments.filter((p) => p.status === "refunded").length}건
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4 bg-white rounded-lg shadow p-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-gray-700">결제 수단:</span>
            <button
              onClick={() => setSelectedPaymentMethod("all")}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                selectedPaymentMethod === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              전체
            </button>
            {[
              { value: "card", label: "카드" },
              { value: "cash", label: "현금" },
              { value: "transfer", label: "계좌이체" }
            ].map((method) => (
              <button
                key={method.value}
                onClick={() => setSelectedPaymentMethod(method.value)}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                  selectedPaymentMethod === method.value
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {method.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
                            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    목적/강습
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    금액
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    결제일
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    결제방법
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <tr key={payment._id}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {payment.purpose === "course"
                            ? typeof payment.relatedCourse === "string"
                              ? payment.relatedCourse
                              : payment.relatedCourse?.name || "-"
                            : payment.purpose}
                        </div>
                        <div className="text-xs text-gray-500">
                          {typeof payment.user === "string"
                            ? payment.user
                            : payment.user?.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {(payment.amount || 0).toLocaleString()}원
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {new Date(payment.createdAt).toISOString().slice(0, 10)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {payment.paymentMethod === 'card' ? '카드' : payment.paymentMethod === 'cash' ? '현금' : payment.paymentMethod === 'transfer' ? '계좌이체' : payment.paymentMethod}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(payment.status)}`}>
                        {getStatusText(payment.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium space-x-3">
                      {isSuperAdmin && payment.status === "pending" && (
                        <button
                          onClick={() => handleComplete(payment._id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          완료처리
                        </button>
                      )}
                      {isSuperAdmin && payment.status === "completed" && (
                        <button
                          onClick={() => handleRefund(payment._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          환불
                        </button>
                      )}
                      {!isSuperAdmin && <span className="text-gray-400">-</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredPayments.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">해당 상태의 결제 내역이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}

