'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/utils/api';
import { useCart } from '@/hooks/useCart';

interface Product { _id: string; name: string; price: number; currency: string; images?: string[]; description?: string; }

export default function ShopPage() {
  const [items, setItems] = useState<Product[]>([]);
  const { add, items: cartItems, total, setQty, remove, clear } = useCart();
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    const params: any = {};
    if (q) params.q = q;
    if (category) params.category = category;
    const res = await apiClient.getShopProducts(params);
    console.log('🔍 상점 API 응답:', res);
    if (res.error) setError(res.error); else setItems((res.data as any)?.items || res.data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">상점</h1>
          <div className="flex items-center gap-2">
            <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="검색" className="px-3 py-2 border rounded" />
            <select value={category} onChange={(e)=>setCategory(e.target.value)} className="px-2 py-2 border rounded">
              <option value="">전체</option>
              <option value="gear">장비</option>
              <option value="wear">수영복</option>
              <option value="general">기타</option>
            </select>
            <button onClick={load} className="px-3 py-2 bg-gray-800 text-white rounded">검색</button>
          </div>
        </div>
        {loading && <div className="text-gray-600">로딩 중...</div>}
        {error && <div className="text-red-700">{error}</div>}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map(p => (
            <div key={p._id} className="bg-white rounded shadow p-3">
              <div className="aspect-square bg-gray-100 rounded mb-2 flex items-center justify-center">
                <span className="text-gray-400">이미지</span>
              </div>
              <div className="font-semibold">{p.name}</div>
              <div className="text-sm text-gray-600">{p.price.toLocaleString()} {p.currency || 'KRW'}</div>
              <button onClick={()=>add({ productId: p._id, name: p.name, price: p.price }, 1)} className="mt-2 w-full px-3 py-2 bg-blue-600 text-white rounded">담기</button>
            </div>
          ))}
        </div>
        {/* Cart Drawer (simple inline) */}
        <div className="mt-8 bg-white rounded shadow p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">장바구니</h2>
            <button onClick={clear} className="text-sm text-red-600">비우기</button>
          </div>
          {cartItems.length === 0 ? (
            <div className="text-sm text-gray-600">담은 상품이 없습니다.</div>
          ) : (
            <div className="space-y-2">
              {cartItems.map(ci => (
                <div key={ci.productId} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <div className="font-medium">{ci.name}</div>
                    <div className="text-xs text-gray-600">{ci.price.toLocaleString()}원</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="number" min={1} value={ci.qty} onChange={(e)=>setQty(ci.productId, parseInt(e.target.value))} className="w-16 px-2 py-1 border rounded" />
                    <button onClick={()=>remove(ci.productId)} className="text-sm text-gray-600">삭제</button>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between mt-3">
                <div className="font-semibold">합계</div>
                <div className="font-semibold">{total.toLocaleString()}원</div>
              </div>
              <div className="flex justify-end">
                <button onClick={async()=>{
                  const res = await apiClient.createShopOrder({ items: cartItems.map(ci=>({ productId: ci.productId, qty: ci.qty })) });
                  if (res.error) return alert(res.error);
                  alert('주문이 생성되었습니다.');
                  clear();
                }} className="px-4 py-2 bg-green-600 text-white rounded">주문하기</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



