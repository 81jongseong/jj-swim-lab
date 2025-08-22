'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/utils/api';
import withAuth from '@/components/withAuth';

interface ShopItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  status: string;
  createdAt: string;
}

function AdminShopPage() {
  const [list, setList] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    price: 0,
    category: '',
    stock: 0,
    status: 'active'
  });

  const load = async () => {
    setLoading(true);
    const res = await apiClient.get<any>('/shop?limit=50');
    if (res.error) setError(res.error);
    else setList(res.data.products || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-200 text-green-900 border-2 border-green-500';
      case 'inactive': return 'bg-red-200 text-red-900 border-2 border-red-500';
      case 'out_of_stock': return 'bg-yellow-200 text-yellow-900 border-2 border-yellow-500';
      default: return 'bg-gray-200 text-gray-900 border-2 border-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '🟢 판매중';
      case 'inactive': return '🔴 판매중단';
      case 'out_of_stock': return '🟡 품절';
      default: return '❓ 알 수 없음';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'equipment': return 'bg-blue-200 text-blue-900 border-2 border-blue-500';
      case 'clothing': return 'bg-purple-200 text-purple-900 border-2 border-purple-500';
      case 'accessories': return 'bg-orange-200 text-orange-900 border-2 border-orange-500';
      case 'books': return 'bg-green-200 text-green-900 border-2 border-green-500';
      default: return 'bg-gray-200 text-gray-900 border-2 border-gray-500';
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'equipment': return '🏊‍♂️ 장비';
      case 'clothing': return '👕 의류';
      case 'accessories': return '👜 액세서리';
      case 'books': return '📚 도서';
      default: return '❓ 기타';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
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
    <div className="min-h-screen bg-blue-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-blue-900 mb-3">🛍️ 상점 관리</h1>
          <p className="text-xl text-blue-700">JJ Swim Lab의 모든 상품을 쉽게 관리하세요</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg border-2 border-blue-200">
          <div className="px-8 py-6 border-b-2 border-blue-200 bg-blue-50">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-blue-900">📋 상품 목록</h2>
              <button
                onClick={async () => {
                  const name = prompt('상품명을 입력하세요');
                  if (!name) return;
                  const description = prompt('상품 설명을 입력하세요') || '';
                  const price = Number(prompt('가격을 입력하세요 (숫자만)') || 0);
                  const category = prompt('카테고리를 입력하세요 (equipment, clothing, accessories, books)') || 'equipment';
                  const stock = Number(prompt('재고 수량을 입력하세요 (숫자만)') || 0);
                  
                  if (price <= 0 || stock < 0) {
                    alert('올바른 가격과 재고를 입력해주세요.');
                    return;
                  }

                  const res = await apiClient.post('/shop', {
                    name,
                    description,
                    price,
                    category,
                    stock,
                    status: 'active'
                  });
                  if (res.error) alert(res.error);
                  else load();
                }}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors text-lg font-bold shadow-lg"
              >
                ➕ 새 상품 추가
              </button>
            </div>
          </div>

          {error && (
            <div className="px-8 py-4 bg-red-100 border-l-4 border-red-500 text-red-700">
              <p className="font-medium">오류가 발생했습니다:</p>
              <p>{error}</p>
            </div>
          )}

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {list.map((item) => (
                <div key={item._id} className="bg-white border-2 border-blue-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-blue-900 truncate">{item.name}</h3>
                    <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="text-gray-700 line-clamp-2">{item.description}</div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-600">카테고리:</span>
                      <span className={`px-3 py-1 text-sm font-bold rounded-lg ${getCategoryColor(item.category)}`}>
                        {getCategoryText(item.category)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-600">가격:</span>
                      <span className="text-lg font-bold text-green-600">
                        ₩{formatPrice(item.price)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-600">재고:</span>
                      <span className={`px-3 py-1 text-sm font-bold rounded-lg ${
                        item.stock > 10 ? 'bg-green-200 text-green-900 border-2 border-green-500' :
                        item.stock > 0 ? 'bg-yellow-200 text-yellow-900 border-2 border-yellow-500' :
                        'bg-red-200 text-red-900 border-2 border-red-500'
                      }`}>
                        {item.stock > 10 ? '🟢' : item.stock > 0 ? '🟡' : '🔴'} {item.stock}개
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-600">상태:</span>
                      <span className={`px-3 py-1 text-sm font-bold rounded-lg ${getStatusColor(item.status)}`}>
                        {getStatusText(item.status)}
                      </span>
                    </div>
                  </div>

                  <div className="border-t-2 border-blue-100 pt-4">
                    <button
                      onClick={() => {
                        if (editingId === item._id) {
                          setEditingId(null);
                          setEditForm({
                            name: '',
                            description: '',
                            price: 0,
                            category: '',
                            stock: 0,
                            status: 'active'
                          });
                        } else {
                          setEditingId(item._id);
                          setEditForm({
                            name: item.name,
                            description: item.description,
                            price: item.price,
                            category: item.category,
                            stock: item.stock,
                            status: item.status
                          });
                        }
                      }}
                      className="w-full px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium mb-3"
                    >
                      {editingId === item._id ? '📝 편집 취소' : '📝 상품 편집'}
                    </button>

                    {editingId === item._id && (
                      <div className="mt-4 space-y-3 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                        <input
                          className="w-full px-3 py-2 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                          placeholder="상품명"
                          value={editForm.name}
                          onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                        />
                        <textarea
                          className="w-full px-3 py-2 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                          placeholder="상품 설명"
                          value={editForm.description}
                          onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                          rows={3}
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            className="px-3 py-2 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                            placeholder="가격"
                            type="number"
                            value={editForm.price}
                            onChange={(e) => setEditForm({...editForm, price: Number(e.target.value)})}
                          />
                          <input
                            className="px-3 py-2 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                            placeholder="재고"
                            type="number"
                            value={editForm.stock}
                            onChange={(e) => setEditForm({...editForm, stock: Number(e.target.value)})}
                          />
                        </div>
                        <select
                          className="w-full px-3 py-2 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                          value={editForm.category}
                          onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                        >
                          <option value="equipment">🏊‍♂️ 장비</option>
                          <option value="clothing">👕 의류</option>
                          <option value="accessories">👜 액세서리</option>
                          <option value="books">📚 도서</option>
                        </select>
                        <select
                          className="w-full px-3 py-2 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                          value={editForm.status}
                          onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                        >
                          <option value="active">🟢 판매중</option>
                          <option value="inactive">🔴 판매중단</option>
                          <option value="out_of_stock">🟡 품절</option>
                        </select>
                        <button
                          onClick={async () => {
                            if (!editForm.name || editForm.price <= 0 || editForm.stock < 0) {
                              alert('올바른 정보를 입력해주세요.');
                              return;
                            }
                            const res = await apiClient.put(`/shop/${item._id}`, editForm);
                            if (res.error) alert(res.error);
                            else {
                              setEditingId(null);
                              load();
                            }
                          }}
                          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                        >
                          💾 변경사항 저장
                        </button>
                      </div>
                    )}

                    <div className="flex gap-2 pt-3 border-t-2 border-blue-100">
                      <button
                        onClick={async () => {
                          const newStock = Number(prompt(`현재 재고: ${item.stock}개\n새로운 재고 수량을 입력하세요:`) || item.stock);
                          if (newStock < 0) {
                            alert('재고는 0 이상이어야 합니다.');
                            return;
                          }
                          const res = await apiClient.patch(`/shop/${item._id}`, { stock: newStock });
                          if (res.error) alert(res.error);
                          else load();
                        }}
                        className="flex-1 px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
                      >
                        📦 재고 수정
                      </button>
                      <button
                        onClick={async () => {
                          if (!confirm('정말로 이 상품을 삭제하시겠습니까?')) return;
                          const res = await apiClient.delete(`/shop/${item._id}`);
                          if (res.error) alert(res.error);
                          else load();
                        }}
                        className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                      >
                        🗑️ 삭제
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {list.length === 0 && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🛍️</div>
                <h3 className="text-2xl font-bold text-gray-700 mb-2">상품이 없습니다</h3>
                <p className="text-gray-500 mb-6">새로운 상품을 추가해보세요!</p>
                <button
                  onClick={async () => {
                    const name = prompt('상품명을 입력하세요');
                    if (!name) return;
                    const description = prompt('상품 설명을 입력하세요') || '';
                    const price = Number(prompt('가격을 입력하세요 (숫자만)') || 0);
                    const category = prompt('카테고리를 입력하세요 (equipment, clothing, accessories, books)') || 'equipment';
                    const stock = Number(prompt('재고 수량을 입력하세요 (숫자만)') || 0);
                    
                    if (price <= 0 || stock < 0) {
                      alert('올바른 가격과 재고를 입력해주세요.');
                      return;
                    }

                    const res = await apiClient.post('/shop', {
                      name,
                      description,
                      price,
                      category,
                      stock,
                      status: 'active'
                    });
                    if (res.error) alert(res.error);
                    else load();
                  }}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors text-lg font-bold shadow-lg"
                >
                  ➕ 첫 상품 추가하기
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(AdminShopPage, { requireTypes: ['centerAdmin','superAdmin'], requirePermission: null });




