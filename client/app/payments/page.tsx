"use client";

import { useEffect, useMemo, useState } from "react";
import apiClient from "@/utils/api";

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
  const currentUser = apiClient.getCurrentUser();
  const isSuperAdmin = currentUser?.userType === "superAdmin";
  const [newPayment, setNewPayment] = useState({ amount: 10000, paymentMethod: "card", purpose: "other" });

  const loadPayments = async () => {
    setLoading(true);
    const res = await apiClient.getPayments();
    if (res.data?.payments) setPayments(res.data.payments);
    setLoading(false);
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const filteredPayments = useMemo(() => {
    return selectedStatus === "all"
      ? payments
      : payments.filter((p) => p.status === (selectedStatus as any));
  }, [payments, selectedStatus]);

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

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiClient.post("/payments", {
      amount: Number(newPayment.amount),
      paymentMethod: newPayment.paymentMethod,
      purpose: newPayment.purpose,
    });
    if (!res.error) {
      await loadPayments();
      alert("결제가 생성되었습니다.");
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

  const totalCompleted = payments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">결제 내역</h1>

        <form onSubmit={handleCreatePayment} className="mb-6 bg-white p-4 rounded-lg shadow grid grid-cols-1 md:grid-cols-5 gap-3">
          <input
            type="number"
            min={1}
            value={newPayment.amount}
            onChange={(e) => setNewPayment({ ...newPayment, amount: Number(e.target.value) as any })}
            className="border rounded px-3 py-2"
            placeholder="금액"
            required
          />
          <select
            value={newPayment.paymentMethod}
            onChange={(e) => setNewPayment({ ...newPayment, paymentMethod: e.target.value })}
            className="border rounded px-3 py-2"
          >
            <option value="card">카드</option>
            <option value="cash">현금</option>
            <option value="transfer">계좌이체</option>
            <option value="online">온라인</option>
          </select>
          <select
            value={newPayment.purpose}
            onChange={(e) => setNewPayment({ ...newPayment, purpose: e.target.value })}
            className="border rounded px-3 py-2"
          >
            <option value="other">기타</option>
            <option value="course">강습</option>
            <option value="booking">예약</option>
            <option value="membership">멤버십</option>
          </select>
          <div className="col-span-1 md:col-span-2 text-right">
            <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700">테스트 결제 생성</button>
          </div>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">💰</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">총 결제</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalCompleted.toLocaleString()}원
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">결제 완료</p>
                <p className="text-2xl font-bold text-gray-900">
                  {payments.filter((p) => p.status === "completed").length}건
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <span className="text-2xl">⏳</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">결제 대기</p>
                <p className="text-2xl font-bold text-gray-900">
                  {payments.filter((p) => p.status === "pending").length}건
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <span className="text-2xl">🔄</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">환불 완료</p>
                <p className="text-2xl font-bold text-gray-900">
                  {payments.filter((p) => p.status === "refunded").length}건
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedStatus("all")}
              className={`px-4 py-2 rounded-md transition-colors ${
                selectedStatus === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              전체
            </button>
            {["completed", "pending", "refunded", "failed"].map((key) => (
              <button
                key={key}
                onClick={() => setSelectedStatus(key)}
                className={`px-4 py-2 rounded-md transition-colors ${
                  selectedStatus === key
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {getStatusText(key)}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    목적/강습
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    금액
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    결제일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    결제방법
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <tr key={payment._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {payment.amount.toLocaleString()}원
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(payment.createdAt).toISOString().slice(0, 10)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.paymentMethod}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(payment.status)}`}>
                        {getStatusText(payment.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
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

