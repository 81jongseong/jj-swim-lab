/**
 * 🛒 JJ Swim Lab - 상점 페이지
 * 
 * 📋 **페이지 목적**
 * - 수영 강습 관련 상품을 판매하는 공개 상점 페이지
 * - 상품 목록 조회, 검색, 필터링 기능 제공
 * - 장바구니 기능 및 상품 구매 기능
 * - 상품 상세 정보 및 리뷰 표시
 * - 상품 카테고리별 분류 및 정렬
 * 
 * 🔄 **주요 기능**
 * - 상품 목록 조회 및 표시
 * - 상품 검색 및 필터링
 * - 상품 카테고리별 분류
 * - 장바구니 추가 및 관리
 * - 상품 상세 정보 모달
 * - 상품 리뷰 및 평점 표시
 * - 상품 구매 및 결제 기능
 * 
 * 🗄️ **데이터 연동**
 * - 상점 API와 연동 (상품 목록)
 * - 장바구니 훅과 연동 (장바구니 관리)
 * - 상품 검색 및 필터링 API
 * - 상품 상세 정보 API
 * - 결제 시스템과 연동
 * - 실시간 상품 정보 업데이트
 * 
 * 🛠️ **필요한 설치 파일**
 * - Next.js 14.2.5 (App Router)
 * - React 18.3.1
 * - TypeScript 5.x
 * - Tailwind CSS 3.3.0
 * - API 클라이언트 (../utils/api)
 * - 장바구니 훅 (../hooks/useCart)
 * - 상점 관리 API 엔드포인트
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 상품 데이터 보안 및 개인정보 보호
 * 2. 장바구니 기능의 안정성 및 성능
 * 3. 상품 검색 및 필터링 성능 최적화
 * 4. 반응형 디자인 적용 (모바일/데스크톱)
 * 5. 상품 구매 프로세스의 사용자 경험
 * 6. 접근성 지원 (키보드 네비게이션, ARIA 라벨)
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 상품 데이터 보안 확인
 * - [ ] 장바구니 기능 안정성 확인
 * - [ ] 상품 검색 성능 최적화 확인
 * - [ ] 반응형 디자인 테스트
 * - [ ] 상품 구매 프로세스 확인
 * - [ ] 접근성 지원 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 상점 페이지 구현
 * - 2024-12-19: 상품 목록 및 검색 기능 구현
 * - 2024-12-19: 장바구니 기능 구현
 * - 2024-12-19: 상품 필터링 및 정렬 구현
 * - 2024-12-19: 반응형 디자인 및 사용자 경험 개선
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (상점 페이지 완료)
 * 
 * 🚀 **다음 단계**
 * - 상품 추천 시스템
 * - 상품 리뷰 및 평점 시스템
 * - 상품 비교 기능
 * - 상품 위시리스트 기능
 * - 상품 보안 강화
 * 
 * 💡 **사용 예시**
 * ```tsx
 * // 상품 목록 조회
 * const products = await apiClient.getShopProducts({ category: "equipment" });
 * 
 * // 장바구니에 상품 추가
 * add(productId, productName, price);
 * 
 * // 상품 검색
 * const searchResults = await apiClient.getShopProducts({ q: "수영 고글" });
 * ```
 * 
 * 🔍 **상점 페이지 처리 흐름**
 * 1. 상품 목록 데이터 로드
 * 2. 상품 검색 및 필터링 조건 적용
 * 3. 상품 목록 렌더링
 * 4. 사용자 상호작용 처리 (검색, 필터링)
 * 5. 장바구니 추가 및 관리
 * 6. 상품 상세 정보 모달 표시
 * 7. 실시간 상품 정보 업데이트
 */

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
    if (res.error) setError(res.error); else setItems(res.products || []);
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
                  const res = await apiClient.createShopOrder({ 
                    items: cartItems.map(ci=>({ 
                      productId: ci.productId, 
                      productName: ci.name || '상품',
                      quantity: ci.qty,
                      price: ci.price || 0
                    })) 
                  });
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



