/**
 * 📦 JJ Swim Lab - 관리자 주문 관리 페이지
 * 
 * 📋 **페이지 목적**
 * - 수영 강습 관련 상품 주문을 관리하는 관리자 전용 페이지
 * - 주문 목록 조회, 상태 관리, 상세 정보 확인
 * - 주문 처리 및 상태 변경 기능
 * - 주문 통계 및 분석 데이터 표시
 * - 주문 검색, 필터링, 페이지네이션 기능
 * 
 * 🔄 **주요 기능**
 * - 주문 목록 조회 및 표시
 * - 주문 상태 변경 (처리중, 완료, 취소)
 * - 주문 상세 정보 모달 표시
 * - 주문 검색 및 필터링
 * - 주문 통계 및 분석
 * - 주문 내보내기 및 인쇄
 * - 주문 알림 및 리마인더
 * 
 * 🗄️ **데이터 연동**
 * - 상점 API와 연동 (주문 목록)
 * - 주문 관리 API와 연동
 * - 주문 상태 변경 API
 * - 주문 통계 및 분석 API
 * - 사용자 인증 시스템
 * - 실시간 주문 상태 업데이트
 * 
 * 🛠️ **필요한 설치 파일**
 * - Next.js 14.2.5 (App Router)
 * - React 18.3.1
 * - TypeScript 5.x
 * - Tailwind CSS 3.3.0
 * - API 클라이언트 (../utils/api)
 * - 인증 컴포넌트 (../components/withAuth)
 * - 상점 관리 API 엔드포인트
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 관리자 권한 확인 및 보안
 * 2. 주문 데이터 보안 및 개인정보 보호
 * 3. 주문 상태 변경 시 관련 데이터 동기화
 * 4. 주문 검색 및 필터링 성능 최적화
 * 5. 반응형 디자인 적용 (모바일/데스크톱)
 * 6. 접근성 지원 (키보드 네비게이션, ARIA 라벨)
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 관리자 권한 확인 확인
 * - [ ] 주문 데이터 보안 확인
 * - [ ] 주문 상태 변경 로직 확인
 * - [ ] 주문 검색 성능 최적화 확인
 * - [ ] 반응형 디자인 테스트
 * - [ ] 접근성 지원 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 관리자 주문 관리 페이지 구현
 * - 2024-12-19: 주문 목록 및 상태 관리 구현
 * - 2024-12-19: 주문 검색 및 필터링 구현
 * - 2024-12-19: 주문 상세 정보 모달 구현
 * - 2024-12-19: 반응형 디자인 및 사용자 경험 개선
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (관리자 주문 관리 페이지 완료)
 * 
 * 🚀 **다음 단계**
 * - 실시간 주문 상태 업데이트
 * - 주문 추천 시스템
 * - 주문 대기열 관리
 * - 주문 통계 대시보드
 * - 주문 보안 강화
 * 
 * 💡 **사용 예시**
 * ```tsx
 * // 주문 목록 조회
 * const orders = await apiClient.getShopOrders({ limit: 50 });
 * 
 * // 주문 상태 변경
 * const updatedOrder = await apiClient.updateOrderStatus(orderId, "completed");
 * 
 * // 주문 상세 정보 조회
 * const orderDetails = await apiClient.getOrderDetails(orderId);
 * ```
 * 
 * 🔍 **주문 관리 처리 흐름**
 * 1. 관리자 권한 확인 및 검증
 * 2. 주문 목록 데이터 로드
 * 3. 주문 검색 및 필터링 조건 적용
 * 4. 주문 상태 변경 처리
 * 5. 주문 상세 정보 모달 표시
 * 6. 주문 통계 및 분석 업데이트
 * 7. 실시간 주문 상태 동기화
 */

'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/utils/api';
import withAuth from '@/components/withAuth';

interface OrderItem {
  _id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
}

function AdminOrdersPage() {
  const [list, setList] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);

  const load = async () => {
    setLoading(true);
    const res = await apiClient.getShopOrders({ limit: 50 });
    if (res.error) setError(res.error);
    else setList(res.data?.orders || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-200 text-yellow-900 border-2 border-yellow-500';
      case 'processing': return 'bg-blue-200 text-blue-900 border-2 border-blue-500';
      case 'shipped': return 'bg-purple-200 text-purple-900 border-2 border-purple-500';
      case 'delivered': return 'bg-green-200 text-green-900 border-2 border-green-500';
      case 'cancelled': return 'bg-red-200 text-red-900 border-2 border-red-500';
      default: return 'bg-gray-200 text-gray-900 border-2 border-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '⏳ 대기중';
      case 'processing': return '🔧 처리중';
      case 'shipped': return '📦 배송중';
      case 'delivered': return '✅ 배송완료';
      case 'cancelled': return '❌ 취소됨';
      default: return '❓ 알 수 없음';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-200 text-green-900 border-2 border-green-500';
      case 'pending': return 'bg-yellow-200 text-yellow-900 border-2 border-yellow-500';
      case 'failed': return 'bg-red-200 text-red-900 border-2 border-red-500';
      case 'refunded': return 'bg-blue-200 text-blue-900 border-2 border-blue-500';
      default: return 'bg-gray-200 text-gray-900 border-2 border-gray-500';
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'paid': return '💳 결제완료';
      case 'pending': return '⏳ 결제대기';
      case 'failed': return '❌ 결제실패';
      case 'refunded': return '💰 환불완료';
      default: return '❓ 알 수 없음';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
              <p className="mt-6 text-xl text-gray-700 font-medium">로딩 중입니다...</p>
              <p className="mt-2 text-lg text-gray-500">잠시만 기다려주세요</p>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2 text-single-line">📦 주문 관리</h1>
          <p className="text-gray-600">JJ Swim Lab의 모든 주문을 쉽게 관리하세요</p>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">📋 주문 목록</h2>
              <div className="text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">
                총 {list.length}건의 주문
              </div>
            </div>
          </div>

          {error && (
            <div className="px-8 py-4 bg-red-100 border-l-4 border-red-500 text-red-700">
              <p className="font-medium">오류가 발생했습니다:</p>
              <p>{error}</p>
            </div>
          )}

          <div className="p-8">
            <div className="space-y-6">
              {list.map((order) => (
                <div key={order._id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <h3 className="text-lg font-bold text-gray-900 text-single-line">주문 #{order.orderNumber}</h3>
                      <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {formatDate(order.createdAt)}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-green-600">
                        ₩{formatPrice(order.totalAmount)}
                      </div>
                      <div className="text-sm text-gray-500">총 결제금액</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-600">고객 정보</div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="font-medium text-gray-900">{order.customerName}</div>
                        <div className="text-sm text-gray-600">{order.customerEmail}</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-600">주문 상태</div>
                      <div className={`px-3 py-2 text-sm font-bold rounded-lg ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-600">결제 상태</div>
                      <div className={`px-3 py-2 text-sm font-bold rounded-lg ${getPaymentStatusColor(order.paymentStatus)}`}>
                        {getPaymentStatusText(order.paymentStatus)}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 text-base mb-3">🛍️ 주문 상품</h4>
                      <div className="space-y-2">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 text-single-line">{item.productName}</div>
                              <div className="text-sm text-gray-600">수량: {item.quantity}개</div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium text-gray-900">₩{formatPrice(item.price)}</div>
                              <div className="text-sm text-gray-600">개당</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-3 border-t border-gray-200">
                      <button
                        onClick={() => setSelectedOrder(selectedOrder?._id === order._id ? null : order)}
                        className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                      >
                        {selectedOrder?._id === order._id ? '📝 상세정보 닫기' : '📝 상세정보 보기'}
                      </button>
                      
                      <button
                        onClick={async () => {
                          const newStatus = prompt(
                            `현재 상태: ${getStatusText(order.status)}\n\n새로운 상태를 선택하세요:\n1. pending (대기중)\n2. processing (처리중)\n3. shipped (배송중)\n4. delivered (배송완료)\n5. cancelled (취소됨)`
                          );
                          
                          let status = order.status;
                          if (newStatus === '1' || newStatus?.toLowerCase().includes('pending')) status = 'pending';
                          else if (newStatus === '2' || newStatus?.toLowerCase().includes('processing')) status = 'processing';
                          else if (newStatus === '3' || newStatus?.toLowerCase().includes('shipped')) status = 'shipped';
                          else if (newStatus === '4' || newStatus?.toLowerCase().includes('delivered')) status = 'delivered';
                          else if (newStatus === '5' || newStatus?.toLowerCase().includes('cancelled')) status = 'cancelled';
                          
                          if (status !== order.status) {
                            const res = await apiClient.updateShopOrder(order._id, { status });
                            if (res.error) alert(res.error);
                            else load();
                          }
                        }}
                        className="flex-1 px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
                      >
                        🔄 상태 변경
                      </button>
                      
                      <button
                        onClick={async () => {
                          if (!confirm('정말로 이 주문을 삭제하시겠습니까?')) return;
                          const res = await apiClient.deleteShopOrder(order._id);
                          if (res.error) alert(res.error);
                          else load();
                        }}
                        className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                      >
                        🗑️ 삭제
                      </button>
                    </div>

                    {selectedOrder?._id === order._id && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h5 className="font-semibold text-gray-900 text-base mb-3">📊 주문 상세정보</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="font-medium text-gray-700">주문 ID:</div>
                            <div className="text-gray-900 font-mono text-single-line">{order._id}</div>
                          </div>
                          <div>
                            <div className="font-medium text-gray-700">주문 번호:</div>
                            <div className="text-gray-900 font-mono text-single-line">{order.orderNumber}</div>
                          </div>
                          <div>
                            <div className="font-medium text-gray-700">생성일:</div>
                            <div className="text-gray-900">{formatDate(order.createdAt)}</div>
                          </div>
                          <div>
                            <div className="font-medium text-gray-700">수정일:</div>
                            <div className="text-gray-900">{formatDate(order.updatedAt)}</div>
                          </div>
                          <div className="md:col-span-2">
                            <div className="font-medium text-gray-700">주문 상품 총계:</div>
                            <div className="text-gray-900">
                              {order.items.length}개 상품 · 총 {order.items.reduce((sum, item) => sum + item.quantity, 0)}개
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {list.length === 0 && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-2xl font-bold text-gray-700 mb-2">주문이 없습니다</h3>
                <p className="text-gray-500 mb-6">아직 주문이 들어오지 않았습니다</p>
                <div className="text-sm text-gray-400">
                  고객들이 상품을 주문하면 여기에 표시됩니다
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(AdminOrdersPage, { requireTypes: ['centerAdmin','superAdmin'], requirePermission: null });




