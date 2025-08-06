import { useState, useEffect } from 'react';
import apiClient from '../../utils/api';

export default function AdminPayments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('전체');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.getPayments();
        
        if (response.data && Array.isArray(response.data)) {
          setPayments(response.data);
        } else if (response.data && !Array.isArray(response.data)) {
          // If response.data exists but is not an array, set empty array
          setPayments([]);
        } else if (response.error) {
          setError(response.error);
          setPayments([]);
        } else {
          // If no data or error, set empty array
          setPayments([]);
        }
      } catch (err) {
        setError('결제 내역을 불러오는데 실패했습니다.');
        setPayments([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const handleFilter = (filterType: string) => {
    setFilter(filterType);
  };

  const handleViewDetail = (payment: any) => {
    setSelectedPayment(payment);
    setShowDetailModal(true);
  };

  const handleRefundRequest = async (paymentId: string) => {
    if (window.confirm('이 결제에 대한 환불 요청을 처리하시겠습니까?')) {
      try {
        const response = await apiClient.refundPayment(paymentId);
        if (response.data) {
          setPayments(payments.map(payment => 
            payment._id === paymentId ? { ...payment, status: 'refunded' } : payment
          ));
          alert('환불 요청이 처리되었습니다.');
        } else {
          alert('환불 처리에 실패했습니다.');
        }
      } catch (err) {
        alert('환불 처리 중 오류가 발생했습니다.');
      }
    }
  };

  const handleExportPayments = () => {
    // CSV 내보내기 기능 (실제 구현은 서버에서 처리)
    alert('결제 내역 내보내기 기능은 서버에서 구현됩니다.');
  };

  const filteredPayments = payments.filter(payment => {
    if (filter === '전체') return true;
    if (filter === '완료') return payment.status === 'completed';
    if (filter === '환불') return payment.status === 'refunded';
    if (filter === '취소') return payment.status === 'cancelled';
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'refunded': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return '완료';
      case 'refunded': return '환불됨';
      case 'cancelled': return '취소됨';
      case 'pending': return '처리 중';
      default: return '알 수 없음';
    }
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'card': return '카드 결제';
      case 'bank_transfer': return '계좌이체';
      case 'cash': return '현금';
      default: return '기타';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">결제 관리</h1>
          <p className="text-gray-600">결제 내역을 관리하세요</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">로딩 중...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">결제 내역</h3>
                <div className="flex space-x-2">
                  <button 
                    onClick={handleExportPayments}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    내보내기
                  </button>
                </div>
              </div>
              
              <div className="flex space-x-4 mb-6">
                <button 
                  onClick={() => handleFilter('전체')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    filter === '전체' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  전체
                </button>
                <button 
                  onClick={() => handleFilter('완료')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    filter === '완료' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  완료
                </button>
                <button 
                  onClick={() => handleFilter('환불')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    filter === '환불' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  환불
                </button>
                <button 
                  onClick={() => handleFilter('취소')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    filter === '취소' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  취소
                </button>
              </div>

              <div className="space-y-4">
                {filteredPayments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {filter === '전체' ? '등록된 결제 내역이 없습니다.' : `${filter} 결제 내역이 없습니다.`}
                  </div>
                ) : (
                  filteredPayments.map((payment) => (
                    <div key={payment._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 font-semibold">✓</span>
                        </div>
                        <div>
                          <p className="text-gray-900 font-semibold">
                            {payment.userName || '사용자'} - {payment.courseName || '강습 과정'}
                          </p>
                          <p className="text-gray-500 text-sm">
                            {payment.date || '날짜 미정'} {payment.time || '시간 미정'}
                          </p>
                          <p className="text-gray-500 text-sm">
                            {getPaymentMethodText(payment.paymentMethod)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-lg font-semibold text-green-600">
                          ₩{payment.amount?.toLocaleString() || 0}
                        </span>
                        <span className={`px-3 py-1 ${getStatusColor(payment.status)} text-xs rounded-full`}>
                          {getStatusText(payment.status)}
                        </span>
                        <button 
                          onClick={() => handleViewDetail(payment)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          상세보기
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Payment Detail Modal */}
      {showDetailModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">결제 상세 정보</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">결제자</label>
                <p className="text-gray-900">{selectedPayment.userName || '이름 없음'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">강습 과정</label>
                <p className="text-gray-900">{selectedPayment.courseName || '과정명 없음'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">결제 금액</label>
                <p className="text-gray-900 font-semibold">₩{selectedPayment.amount?.toLocaleString() || 0}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">결제 방법</label>
                <p className="text-gray-900">{getPaymentMethodText(selectedPayment.paymentMethod)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">결제 날짜</label>
                <p className="text-gray-900">{selectedPayment.date || '날짜 미정'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
                <span className={`px-3 py-1 ${getStatusColor(selectedPayment.status)} text-xs rounded-full`}>
                  {getStatusText(selectedPayment.status)}
                </span>
              </div>
              {selectedPayment.transactionId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">거래 ID</label>
                  <p className="text-gray-900 text-sm">{selectedPayment.transactionId}</p>
                </div>
              )}
              {selectedPayment.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">특이사항</label>
                  <p className="text-gray-900">{selectedPayment.notes}</p>
                </div>
              )}
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowDetailModal(false)}
                className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 