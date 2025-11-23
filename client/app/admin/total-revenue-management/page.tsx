/**
 * 💎 JJ Swim Lab - 총 매출 관리 페이지 (통합)
 * 
 * 📋 페이지 목적:
 * - 최고 관리자의 전체 수익 관리 (플랫폼 수익 + 기타 수익원)
 * - 플랫폼 수익: 센터 구독료, 플랫폼 수수료, 프리미엄 기능, 제휴/광고
 * - 기타 수익: 프랜차이즈 수수료, 라이선싱, 컨설팅, 교육 등
 * 
 * 🔄 연동 파일:
 * - RegionNavigation 컴포넌트
 * - StatCard 컴포넌트
 * - Button 컴포넌트
 * - SimpleBarChart 컴포넌트
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import StatCard from '@/components/StatCard';
import { Button } from '@/components/ui';
import SimpleBarChart from '@/components/SimpleBarChart';
import RegionNavigation from '@/components/RegionNavigation';
import apiClient from '../../../utils/api';

export default function TotalRevenueManagementPage() {
  const { user, hasUserType } = useAuth();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<any[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [planFilter, setPlanFilter] = useState<string>('all');
  
  // 지역 선택
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [selectedCenters, setSelectedCenters] = useState<string[]>([]);

  // 센터 데이터 (지역별 센터 목록)
  const centerData: { [key: string]: { [key: string]: string[] } } = {
    '서울시': {
      '강남구': ['강남센터', '역삼센터', '삼성센터'],
      '서초구': ['서초센터', '반포센터'],
      '송파구': ['송파센터', '잠실센터'],
      '강동구': ['강동센터'],
      '마포구': ['마포센터', '홍대센터'],
      '영등포구': ['영등포센터'],
      '강서구': ['강서센터']
    },
    '경기도': {
      '수원시': ['수원센터', '영통센터'],
      '성남시': ['성남센터', '분당센터'],
      '용인시': ['용인센터', '수지센터'],
      '고양시': ['일산센터'],
      '부천시': ['부천센터'],
      '안양시': ['안양센터']
    },
    '인천시': {
      '남동구': ['구월센터'],
      '연수구': ['송도센터']
    },
    '부산시': {
      '해운대구': ['해운대센터'],
      '남구': ['남구센터'],
      '수영구': ['광안센터']
    },
    '대구시': {
      '수성구': ['수성센터']
    },
    '광주시': {
      '서구': ['광주센터']
    },
    '대전시': {
      '유성구': ['대전센터']
    },
    '울산시': {
      '남구': ['울산센터']
    },
    '세종시': {
      '세종시': ['세종센터']
    }
  };

  // 플랫폼 수익 데이터
  const platformRevenueData = {
    subscription: 45000000,    // 센터 구독료
    commission: 23000000,      // 플랫폼 수수료
    premium: 8500000,          // 프리미엄 기능
    partnership: 3500000       // 제휴/광고
  };

  // 기타 수익 데이터
  const otherRevenueData = {
    franchise: 120000000,      // 프랜차이즈 수수료
    licensing: 45000000,       // 라이선싱
    consulting: 28000000,      // 컨설팅
    education: 15000000,       // 교육/트레이닝
    technology: 12000000       // 기술 제공
  };

  // 센터 구독 데이터
  const centerSubscriptions = [
    { name: '강남센터', region: '서울시', district: '강남구', plan: '프리미엄', amount: 500000, status: 'active', nextBilling: '2025-11-01' },
    { name: '서초센터', region: '서울시', district: '서초구', plan: '스탠다드', amount: 300000, status: 'active', nextBilling: '2025-11-05' },
    { name: '송파센터', region: '서울시', district: '송파구', plan: '프리미엄', amount: 500000, status: 'active', nextBilling: '2025-11-10' },
    { name: '수원센터', region: '경기도', district: '수원시', plan: '스탠다드', amount: 300000, status: 'active', nextBilling: '2025-11-12' },
    { name: '성남센터', region: '경기도', district: '성남시', plan: '베이직', amount: 150000, status: 'trial', nextBilling: '2025-11-15' },
    { name: '용인센터', region: '경기도', district: '용인시', plan: '프리미엄', amount: 500000, status: 'active', nextBilling: '2025-11-18' },
    { name: '해운대센터', region: '부산시', district: '해운대구', plan: '스탠다드', amount: 300000, status: 'active', nextBilling: '2025-11-20' }
  ];

  // 센터별 상세 수익 데이터 (네트워크 효과 포함)
  const centerDataMap: any = {};
  centerSubscriptions.forEach(sub => {
    centerDataMap[sub.name] = {
      revenue: {
        total: sub.amount * 12, // 연간
        registration: sub.amount * 3,
        lessons: sub.amount * 7,
        shop: sub.amount * 2
      },
      costs: {
        total: sub.amount * 6,
        labor: sub.amount * 3,
        utilities: sub.amount * 1.5,
        rent: sub.amount * 1,
        other: sub.amount * 0.5
      },
      netProfit: (sub.amount * 12) - (sub.amount * 6)
    };
  });

  const loadPayments = async () => {
    setLoading(true);
    try {
      const res = await apiClient.getPayments();
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
      setPayments(paymentsData);
    } catch (error) {
      console.error('결제 데이터 로드 오류:', error);
      setPayments([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user && hasUserType('superAdmin')) {
      loadPayments();
    }
  }, [user]);

  const totalPlatformRevenue = Object.values(platformRevenueData).reduce((sum, val) => sum + val, 0);
  const totalOtherRevenue = Object.values(otherRevenueData).reduce((sum, val) => sum + val, 0);
  const totalRevenue = totalPlatformRevenue + totalOtherRevenue;
  const activeSubscriptions = centerSubscriptions.filter(c => c.status === 'active').length;

  // 지역 필터링된 센터 구독
  const filteredSubscriptions = centerSubscriptions.filter(sub => {
    if (selectedRegions.length > 0 && !selectedRegions.includes(sub.region)) return false;
    if (selectedDistricts.length > 0 && !selectedDistricts.includes(sub.district)) return false;
    if (selectedCenters.length > 0 && !selectedCenters.includes(sub.name)) return false;
    if (planFilter !== 'all' && sub.plan !== planFilter) return false;
    return true;
  });

  if (!hasUserType('superAdmin')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">접근 권한 없음</h1>
          <p className="text-gray-600">이 페이지는 최고 관리자만 접근할 수 있습니다.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">💎 총 매출 관리</h1>
          <p className="text-gray-600">최고 관리자의 전체 수익 현황 (플랫폼 수익 + 기타 수익원)</p>
        </div>

        {/* 전체 수익 개요 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <StatCard
            title="총 수익"
            value={`${(totalRevenue / 10000).toLocaleString()}만원`}
            icon="💎"
            color="blue"
            subtitle="이번 달 전체 수익"
          />
          <StatCard
            title="플랫폼 수익"
            value={`${(totalPlatformRevenue / 10000).toLocaleString()}만원`}
            icon="🏢"
            color="green"
            subtitle={`전체의 ${((totalPlatformRevenue / totalRevenue) * 100).toFixed(1)}%`}
          />
          <StatCard
            title="기타 수익"
            value={`${(totalOtherRevenue / 10000).toLocaleString()}만원`}
            icon="⭐"
            color="purple"
            subtitle={`전체의 ${((totalOtherRevenue / totalRevenue) * 100).toFixed(1)}%`}
          />
          <StatCard
            title="활성 센터"
            value={activeSubscriptions}
            icon="🏪"
            color="orange"
            subtitle="구독 중인 센터"
          />
        </div>

        {/* 지역 선택 컴포넌트 */}
        <div className="mb-8">
          <RegionNavigation
            centerData={centerData}
            centerDataMap={centerDataMap}
            selectedRegions={selectedRegions}
            setSelectedRegions={setSelectedRegions}
            selectedDistricts={selectedDistricts}
            setSelectedDistricts={setSelectedDistricts}
            selectedCenters={selectedCenters}
            setSelectedCenters={setSelectedCenters}
            layout="dropdown"
          />
        </div>

        {/* 수익원별 분석 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* 플랫폼 수익 상세 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🏢 플랫폼 수익 상세</h3>
            <div className="space-y-3">
              <SimpleBarChart
                label="센터 구독료"
                value={platformRevenueData.subscription}
                maxValue={totalPlatformRevenue}
                color="blue"
              />
              <SimpleBarChart
                label="플랫폼 수수료"
                value={platformRevenueData.commission}
                maxValue={totalPlatformRevenue}
                color="purple"
              />
              <SimpleBarChart
                label="프리미엄 기능"
                value={platformRevenueData.premium}
                maxValue={totalPlatformRevenue}
                color="orange"
              />
              <SimpleBarChart
                label="제휴/광고"
                value={platformRevenueData.partnership}
                maxValue={totalPlatformRevenue}
                color="green"
              />
            </div>
          </div>

          {/* 기타 수익 상세 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">⭐ 기타 수익 상세</h3>
            <div className="space-y-3">
              <SimpleBarChart
                label="프랜차이즈 수수료"
                value={otherRevenueData.franchise}
                maxValue={totalOtherRevenue}
                color="blue"
              />
              <SimpleBarChart
                label="라이선싱"
                value={otherRevenueData.licensing}
                maxValue={totalOtherRevenue}
                color="purple"
              />
              <SimpleBarChart
                label="컨설팅"
                value={otherRevenueData.consulting}
                maxValue={totalOtherRevenue}
                color="orange"
              />
              <SimpleBarChart
                label="교육/트레이닝"
                value={otherRevenueData.education}
                maxValue={totalOtherRevenue}
                color="green"
              />
              <SimpleBarChart
                label="기술 제공"
                value={otherRevenueData.technology}
                maxValue={totalOtherRevenue}
                color="yellow"
              />
            </div>
          </div>
        </div>

        {/* 구독 플랜별 현황 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 구독 플랜 현황</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div 
              onClick={() => setPlanFilter(planFilter === '프리미엄' ? 'all' : '프리미엄')}
              className={`bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                planFilter === '프리미엄' ? 'border-yellow-500 shadow-lg' : 'border-yellow-200'
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-yellow-800 font-medium">프리미엄 플랜</p>
                  <p className="text-2xl font-bold text-yellow-900">
                    {centerSubscriptions.filter(c => c.plan === '프리미엄').length}개 센터
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-yellow-700">월 50만원</p>
                  <p className="text-lg font-semibold text-yellow-900">
                    {(centerSubscriptions.filter(c => c.plan === '프리미엄').length * 500000 / 10000).toLocaleString()}만원
                  </p>
                </div>
              </div>
              {planFilter === '프리미엄' && (
                <p className="text-xs text-yellow-700 mt-2">✓ 필터 적용 중</p>
              )}
            </div>
            
            <div 
              onClick={() => setPlanFilter(planFilter === '스탠다드' ? 'all' : '스탠다드')}
              className={`bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                planFilter === '스탠다드' ? 'border-blue-500 shadow-lg' : 'border-blue-200'
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-blue-800 font-medium">스탠다드 플랜</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {centerSubscriptions.filter(c => c.plan === '스탠다드').length}개 센터
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-blue-700">월 30만원</p>
                  <p className="text-lg font-semibold text-blue-900">
                    {(centerSubscriptions.filter(c => c.plan === '스탠다드').length * 300000 / 10000).toLocaleString()}만원
                  </p>
                </div>
              </div>
              {planFilter === '스탠다드' && (
                <p className="text-xs text-blue-700 mt-2">✓ 필터 적용 중</p>
              )}
            </div>
            
            <div 
              onClick={() => setPlanFilter(planFilter === '베이직' ? 'all' : '베이직')}
              className={`bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                planFilter === '베이직' ? 'border-gray-500 shadow-lg' : 'border-gray-200'
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-800 font-medium">베이직 플랜</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {centerSubscriptions.filter(c => c.plan === '베이직').length}개 센터
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-700">월 15만원</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {(centerSubscriptions.filter(c => c.plan === '베이직').length * 150000 / 10000).toLocaleString()}만원
                  </p>
                </div>
              </div>
              {planFilter === '베이직' && (
                <p className="text-xs text-gray-700 mt-2">✓ 필터 적용 중</p>
              )}
            </div>
          </div>
        </div>

        {/* 센터별 구독 현황 테이블 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">🏢 센터별 구독 현황</h3>
            {(planFilter !== 'all' || selectedRegions.length > 0 || selectedDistricts.length > 0 || selectedCenters.length > 0) && (
              <Button
                onClick={() => {
                  setPlanFilter('all');
                  setSelectedRegions([]);
                  setSelectedDistricts([]);
                  setSelectedCenters([]);
                }}
                variant="ghost"
                size="sm"
              >
                필터 초기화
              </Button>
            )}
          </div>
          {filteredSubscriptions.length !== centerSubscriptions.length && (
            <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                필터링된 결과: <span className="font-semibold">{filteredSubscriptions.length}개 센터</span>
              </p>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">센터명</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">지역</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">플랜</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">월 구독료</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">다음 결제일</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">작업</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSubscriptions.map((sub, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{sub.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{sub.region} {sub.district}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        sub.plan === '프리미엄' ? 'bg-yellow-100 text-yellow-800' :
                        sub.plan === '스탠다드' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {sub.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {(sub.amount / 10000).toLocaleString()}만원
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        sub.status === 'active' ? 'bg-green-100 text-green-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {sub.status === 'active' ? '✅ 활성' : '🔔 체험'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{sub.nextBilling}</td>
                    <td className="px-6 py-4 text-sm">
                      <Button variant="ghost" size="sm">상세보기</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
