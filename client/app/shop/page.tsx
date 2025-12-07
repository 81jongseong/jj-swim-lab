'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import StatCard from '@/components/StatCard';
import { CardGrid } from '@/components/common';
import { Button } from '@/components/ui';
import { logger } from '@/lib/logger';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Grid, List } from 'lucide-react';
import SearchBar from '@/components/common/SearchBar';
import SortOptions from '@/components/common/SortOptions';
import { LoadingState, PageHeader } from '@/components/common';

/**
 * 🛒 수영 용품 샵 페이지
 * 
 * 📋 **기능**
 * - 수영 관련 용품 구매
 * - 장바구니 관리
 * - 주문 및 결제
 * 
 * 🔄 **주요 기능**
 * 1. 상품 목록 조회
 * 2. 상품 상세 정보
 * 3. 장바구니 추가/제거
 * 4. 주문 처리
 * 
 * 📅 **수정 히스토리**
 * - 2025-01-13: 샵 페이지 생성
 */

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  imageUrl?: string;
  stock: number;
  isActive: boolean;
  rating: number;
  reviewCount: number;
}

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export default function ShopPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [showCart, setShowCart] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid'); // 그리드 뷰 또는 2열 리스트 뷰

  const categories = [
    { value: 'all', label: '전체' },
    { value: 'swimwear', label: '수영복' },
    { value: 'equipment', label: '용품' },
    { value: 'accessories', label: '악세서리' },
    { value: 'training', label: '트레이닝' }
  ];

  const sortOptions = [
    { value: 'name', label: '이름순' },
    { value: 'price_asc', label: '가격 낮은순' },
    { value: 'price_desc', label: '가격 높은순' },
    { value: 'rating', label: '평점순' },
    { value: 'popularity', label: '인기순' }
  ];

  useEffect(() => {
    fetchProducts();
    loadCartFromStorage();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchTerm, selectedCategory, sortBy]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // 실제 API 호출 대신 임시 데이터 사용
      const mockProducts: Product[] = [
        {
          _id: '1',
          name: '프리미엄 수영복',
          description: '편안하고 기능적인 디자인의 수영복입니다.',
          price: 89000,
          originalPrice: 120000,
          category: 'swimwear',
          imageUrl: '/images/swimwear1.jpg',
          stock: 15,
          isActive: true,
          rating: 4.5,
          reviewCount: 23
        },
        {
          _id: '2',
          name: '수영 고글',
          description: '안개 방지 기능이 있는 수영 고글입니다.',
          price: 35000,
          category: 'equipment',
          imageUrl: '/images/goggles1.jpg',
          stock: 30,
          isActive: true,
          rating: 4.2,
          reviewCount: 45
        },
        {
          _id: '3',
          name: '수영 모자',
          description: '실리콘 재질의 편안한 수영 모자입니다.',
          price: 15000,
          category: 'accessories',
          imageUrl: '/images/cap1.jpg',
          stock: 50,
          isActive: true,
          rating: 4.0,
          reviewCount: 12
        },
        {
          _id: '4',
          name: '수영 핀',
          description: '발목 근육 강화에 도움이 되는 수영 핀입니다.',
          price: 25000,
          category: 'training',
          imageUrl: '/images/fins1.jpg',
          stock: 20,
          isActive: true,
          rating: 4.7,
          reviewCount: 18
        },
        {
          _id: '5',
          name: '수영 보드',
          description: '초보자를 위한 수영 보드입니다.',
          price: 45000,
          category: 'equipment',
          imageUrl: '/images/board1.jpg',
          stock: 8,
          isActive: true,
          rating: 4.3,
          reviewCount: 31
        }
      ];
      
      setProducts(mockProducts);
    } catch (error) {
      logger.error('상품 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCartFromStorage = () => {
    try {
      const savedCart = localStorage.getItem('shop_cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (error) {
      logger.error('장바구니 로드 실패:', error);
    }
  };

  const saveCartToStorage = (cartItems: CartItem[]) => {
    try {
      localStorage.setItem('shop_cart', JSON.stringify(cartItems));
    } catch (error) {
      logger.error('장바구니 저장 실패:', error);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = products.filter(product => product.isActive);

    // 카테고리 필터
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // 검색 필터
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 정렬
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price_asc':
          return a.price - b.price;
        case 'price_desc':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'popularity':
          return b.reviewCount - a.reviewCount;
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
  };

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.productId === product._id);
    
    if (existingItem) {
      const updatedCart = cart.map(item =>
        item.productId === product._id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      setCart(updatedCart);
      saveCartToStorage(updatedCart);
    } else {
      const newItem: CartItem = {
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: 1,
        imageUrl: product.imageUrl
      };
      const updatedCart = [...cart, newItem];
      setCart(updatedCart);
      saveCartToStorage(updatedCart);
    }
    
    alert('장바구니에 추가되었습니다!');
  };

  const removeFromCart = (productId: string) => {
    const updatedCart = cart.filter(item => item.productId !== productId);
    setCart(updatedCart);
    saveCartToStorage(updatedCart);
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const updatedCart = cart.map(item =>
      item.productId === productId
        ? { ...item, quantity }
        : item
    );
    setCart(updatedCart);
    saveCartToStorage(updatedCart);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('ko-KR');
  };

  const getDiscountRate = (product: Product) => {
    if (!product.originalPrice) return 0;
    return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingState message="로딩 중..." size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader
            title="🛒 수영 용품샵"
            description="최고의 수영 용품들을 만나보세요."
            actions={
              <Button
                onClick={() => setShowCart(true)}
                variant="primary"
                size="md"
                className="relative"
              >
                🛒 장바구니
                {getTotalItems() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </Button>
          }
        />

        {/* 최고 관리자 전용 통계 카드 */}
        {user?.userType === 'superAdmin' && (
          <>
          {/* 상점 통계 카드 */}
          <CardGrid gap={6} className="mb-6">
            <StatCard
              title="오늘의 매출"
              value="₩2,450,000"
              icon="💰"
              color="green"
              subtitle="일일 매출액"
              change={{ value: 18.5, type: 'increase' }}
            />
            <StatCard
              title="결제 전환율"
              value="67%"
              icon="📊"
              color="blue"
              subtitle="장바구니→결제율"
              change={{ value: 5.2, type: 'increase' }}
            />
            <StatCard
              title="인기 브랜드"
              value="아레나"
              icon="🏆"
              color="purple"
              subtitle="최고 판매 브랜드"
              change={{ value: 22.3, type: 'increase' }}
            />
            <StatCard
              title="재고 부족"
              value="3개"
              icon="⚠️"
              color="orange"
              subtitle="품절 위험 상품"
              change={{ value: -15.7, type: 'decrease' }}
            />
          </CardGrid>

          {/* 관리자 전용 상세 통계 */}
          <CardGrid gap={6} className="mb-6">
            <StatCard
              title="브랜드별 매출"
              value="스피도 35%"
              icon="🏷️"
              color="blue"
              subtitle="브랜드 점유율"
              change={{ value: 8.5, type: 'increase' }}
            />
            <StatCard
              title="고객 재구매율"
              value="78%"
              icon="🔄"
              color="green"
              subtitle="재구매 고객 비율"
              change={{ value: 12.3, type: 'increase' }}
            />
            <StatCard
              title="평균 주문액"
              value="₩85,000"
              icon="💳"
              color="purple"
              subtitle="주문당 평균 금액"
              change={{ value: 5.7, type: 'increase' }}
            />
            <StatCard
              title="이탈률"
              value="23%"
              icon="📉"
              color="orange"
              subtitle="장바구니 이탈률"
              change={{ value: -3.2, type: 'decrease' }}
            />
          </CardGrid>
          </>
        )}

        {/* 필터 및 검색 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">상품 목록</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title="컴팩트 그리드 뷰"
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title="2열 레이아웃"
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="상품명 또는 설명으로 검색..."
              />
            </div>
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <SortOptions
                value={sortBy}
                onChange={setSortBy}
                options={sortOptions}
              />
            </div>
          </div>
        </div>

        {/* 상품 목록 */}
        {viewMode === 'grid' ? (
          /* 컴팩트 그리드 뷰 (반응형) */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {filteredProducts.map((product) => (
              <Card key={product._id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="p-3 pb-2">
                  <div className="relative mb-2">
                    <div className="aspect-square bg-gray-200 rounded-md flex items-center justify-center overflow-hidden">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-gray-400 text-2xl">🏊‍♂️</div>
                      )}
                    </div>
                    {product.originalPrice && (
                      <div className="absolute top-1 left-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded">
                        -{getDiscountRate(product)}%
                      </div>
                    )}
                  </div>
                  <CardTitle className="text-sm font-semibold line-clamp-2 mb-1 leading-tight">{product.name}</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0 space-y-2">
                  <p className="text-xs text-gray-600 line-clamp-2 min-h-[2rem]">{product.description}</p>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-1.5 flex-wrap">
                      <span className="text-base font-bold text-gray-900">
                        {formatPrice(product.price)}원
                      </span>
                      {product.originalPrice && (
                        <span className="text-xs text-gray-500 line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-0.5">
                        <div className="flex text-yellow-400 text-xs">
                          {'★'.repeat(Math.floor(product.rating))}
                          {'☆'.repeat(5 - Math.floor(product.rating))}
                        </div>
                        <span className="text-gray-600">({product.reviewCount})</span>
                      </div>
                      <div className="text-gray-500">
                        {product.stock > 0 ? `${product.stock}개` : '품절'}
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => addToCart(product)}
                    disabled={product.stock === 0}
                    variant="primary"
                    size="sm"
                    className="w-full text-xs py-1.5 h-auto"
                  >
                    {product.stock === 0 ? '품절' : '장바구니 추가'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* 2열 레이아웃 (큰 카드) */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProducts.map((product) => (
              <Card key={product._id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                <div className="flex flex-col sm:flex-row">
                  <div className="relative sm:w-48 flex-shrink-0">
                    <div className="aspect-square sm:h-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-gray-400 text-4xl">🏊‍♂️</div>
                      )}
                    </div>
                    {product.originalPrice && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                        -{getDiscountRate(product)}%
                      </div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-lg font-semibold mb-2">{product.name}</CardTitle>
                      <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 flex-1 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl font-bold text-gray-900">
                            {formatPrice(product.price)}원
                          </span>
                          {product.originalPrice && (
                            <span className="text-sm text-gray-500 line-through">
                              {formatPrice(product.originalPrice)}원
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="flex text-yellow-400">
                              {'★'.repeat(Math.floor(product.rating))}
                              {'☆'.repeat(5 - Math.floor(product.rating))}
                            </div>
                            <span className="text-sm text-gray-600">({product.reviewCount})</span>
                          </div>
                          <div className="text-sm text-gray-500">
                            재고: {product.stock > 0 ? `${product.stock}개` : '품절'}
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={() => addToCart(product)}
                        disabled={product.stock === 0}
                        variant="primary"
                        size="md"
                        className="w-full mt-4"
                      >
                        {product.stock === 0 ? '품절' : '장바구니 추가'}
                      </Button>
                    </CardContent>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">
              {products.length === 0 ? '등록된 상품이 없습니다.' : '검색 결과가 없습니다.'}
            </div>
          </div>
        )}

        {/* 장바구니 모달 */}
        {showCart && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">🛒 장바구니</h3>
                  <Button
                    onClick={() => setShowCart(false)}
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </Button>
                </div>

                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-500 text-lg">장바구니가 비어있습니다.</div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item.productId} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <div className="text-gray-400 text-xl">🏊‍♂️</div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.name}</h4>
                          <p className="text-gray-600">{formatPrice(item.price)}원</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                            variant="outline"
                            size="sm"
                            className="w-8 h-8 rounded-full p-0"
                          >
                            -
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                            variant="outline"
                            size="sm"
                            className="w-8 h-8 rounded-full p-0"
                          >
                            +
                          </Button>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">{formatPrice(item.price * item.quantity)}원</p>
                          <Button
                            onClick={() => removeFromCart(item.productId)}
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            삭제
                          </Button>
                        </div>
                      </div>
                    ))}

                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span>총 금액:</span>
                        <span className="text-blue-600">{formatPrice(getTotalPrice())}원</span>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-4">
                      <Button
                        onClick={() => setShowCart(false)}
                        variant="outline"
                        size="md"
                      >
                        계속 쇼핑
                      </Button>
                      <Button
                        onClick={() => {
                          alert('주문 기능은 준비 중입니다.');
                        }}
                        variant="primary"
                        size="md"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        주문하기
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}