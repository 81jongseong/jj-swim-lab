/**
 * ?뮥 JJ Swim Lab - ?쇳꽣蹂?留ㅼ텧 愿由??섏씠吏
 * 
 * ?뱥 **?섏씠吏 紐⑹쟻**
 * - 媛??쇳꽣???ㅼ젣 ?댁쁺 ?섏씡怨?鍮꾩슜??愿由ы븯???쇳꽣蹂?留ㅼ텧 ??쒕낫??
 * - ?뚯썝 ?깅줉鍮? 媛뺤뒿鍮????쇳꽣 ?섏씡?먭낵 ?멸굔鍮? ?꾨?猷? ?쒖꽭怨듦낵湲???鍮꾩슜 遺꾩꽍
 * - ?쇳꽣蹂??섏씡??遺꾩꽍 諛??댁쁺 ?⑥쑉???됯?
 * - ?쇳꽣蹂? 吏??퀎, 湲곌컙蹂?留ㅼ텧 ?꾪솴 愿由?
 * 
 * ?봽 **二쇱슂 湲곕뒫**
 * - ?꾩껜 ?쇳꽣 留ㅼ텧 媛쒖슂 (珥?留ㅼ텧, ?쒖씠?? ?깆옣瑜???
 * - ?섏씡?먮퀎 遺꾩꽍 (?뚯썝 ?깅줉鍮? 媛뺤뒿鍮? 媛쒖씤?덉뒯, 湲고? ?쒕퉬????
 * - 鍮꾩슜 援ъ“ 遺꾩꽍 (?멸굔鍮? ?꾨?猷? ?쒖꽭怨듦낵湲? ?좎?蹂댁닔鍮???
 * - ?쇳꽣蹂?留ㅼ텧 ?꾪솴 諛??섏씡??遺꾩꽍
 * - 吏??퀎 留ㅼ텧 遺꾪룷 諛??깃낵 遺꾩꽍
 * - 湲곌컙蹂?留ㅼ텧 ?몃젋??諛??덉륫
 * - ?쇳꽣 ?댁쁺 ?⑥쑉???몄궗?댄듃
 * - 留ㅼ텧 紐⑺몴 ?鍮??ㅼ쟻 遺꾩꽍
 * 
 * ?뾼截?**?곗씠???곕룞**
 * - revenue-management API? ?곕룞 (留ㅼ텧 ?곗씠??
 * - useAuth ?낃낵 ?곕룞 (?ъ슜??沅뚰븳 ?뺤씤)
 * - apiClient? ?곕룞 (API ?듭떊)
 * 
 * ?썱截?**?꾩슂???ㅼ튂 ?뚯씪**
 * - Next.js 14.2.5 (App Router)
 * - React 18.3.1
 * - TypeScript 5.x
 * - Tailwind CSS 3.3.0
 * - Chart.js ?먮뒗 Recharts (李⑦듃 ?쇱씠釉뚮윭由?
 * 
 * ?좑툘 **媛쒕컻 ??二쇱쓽?ы빆**
 * 1. 愿由ъ옄 沅뚰븳 ?뺤씤 ?꾩닔 (superAdmin留??묎렐)
 * 2. ??⑸웾 留ㅼ텧 ?곗씠??泥섎━ ???깅뒫 理쒖쟻??
 * 3. ?ㅼ떆媛??곗씠???낅뜲?댄듃 怨좊젮
 * 4. 諛섏쓳???붿옄???곸슜 (紐⑤컮???곗뒪?ы넲)
 * 5. 李⑦듃 ?쇱씠釉뚮윭由??섏〈??愿由?
 * 
 * ?뵩 **?섏젙 ??泥댄겕由ъ뒪??*
 * - [ ] 沅뚰븳 寃利?濡쒖쭅 ?뺤씤
 * - [ ] API ?묐떟 ?곗씠??援ъ“ 寃利?
 * - [ ] 李⑦듃 ?뚮뜑留??깅뒫 理쒖쟻??
 * - [ ] 諛섏쓳???붿옄???뚯뒪??
 * - [ ] ?먮윭 泥섎━ 濡쒖쭅 媛쒖꽑
 * 
 * ?뱟 **媛쒕컻 ?덉뒪?좊━**
 * - 2024-12-19: 珥덇린 援ы쁽 (珥?留ㅼ텧 愿由??섏씠吏)
 * 
 * ?뫅?랅윊?**媛쒕컻???뺣낫**
 * - ?묒꽦?? AI Assistant
 * - 理쒖쥌 ?섏젙: 2024-12-19
 * - ?곹깭: ???꾩꽦 (?쇳꽣蹂?留ㅼ텧 愿由??섏씠吏 ?꾨즺)
 * 
 * ?? **?ㅼ쓬 ?④퀎**
 * - ?ㅼ떆媛?留ㅼ텧 ?곗씠???곕룞
 * - 怨좉툒 李⑦듃 諛??쒓컖??
 * - 留ㅼ텧 ?덉륫 諛?遺꾩꽍
 * - ?먮룞?붾맂 由ы룷???앹꽦
 * - 紐⑤컮??理쒖쟻??
 * 
 * ?뮕 **?ъ슜 ?덉떆**
 * ```tsx
 * // ?쇳꽣蹂?留ㅼ텧 愿由??섏씠吏 ?ъ슜
 * <RevenueManagementPage />
 * 
 * // 沅뚰븳 ?뺤씤
 * if (!hasUserType('superAdmin')) {
 *   return <AccessDenied />;
 * }
 * ```
 * 
 * ?뵇 **留ㅼ텧 愿由?泥섎━ ?먮쫫**
 * 1. ?ъ슜??沅뚰븳 ?뺤씤 (superAdmin)
 * 2. ?쇳꽣蹂?留ㅼ텧 ?곗씠??濡쒕뱶
 * 3. ?섏씡?먮퀎 遺꾩꽍 ?곗씠??泥섎━
 * 4. 鍮꾩슜 援ъ“ 遺꾩꽍 諛?怨꾩궛
 * 5. ?쇳꽣蹂??섏씡???됯?
 * 6. 吏??퀎 留ㅼ텧 遺꾪룷 遺꾩꽍
 * 7. 湲곌컙蹂??몃젋??遺꾩꽍
 * 8. ?몄궗?댄듃 諛?異붿쿇 ?앹꽦
 * 9. ??쒕낫???뚮뜑留?
 * 10. ?ㅼ떆媛??곗씠???낅뜲?댄듃
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import RegionNavigation from '@/components/RegionNavigation';
import ComparisonChart from '@/components/ComparisonChart';

export default function RevenueManagementPage() {
  const { user, hasUserType } = useAuth();
  
  // ?곹깭 愿由?
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [selectedCenters, setSelectedCenters] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [comparisonMode, setComparisonMode] = useState(false);

  // 吏???곗씠??
  const regionData: { [key: string]: string[] } = {
    '?쒖슱?밸퀎??: ['媛뺣궓援?, '?쒖큹援?, '?≫뙆援?, '媛뺣룞援?, '留덊룷援?, '?⑹궛援?],
    '寃쎄린??: ['?섏썝??, '?깅궓??, '?⑹씤??, '遺泥쒖떆', '?붿꽦??, '怨좎뼇??, '遺꾨떦援?],
    '?몄쿇愿묒뿭??: ['?곗닔援?, '?⑤룞援?, '怨꾩뼇援?, '遺?됯뎄'],
    '遺?곌킅??떆': ['?댁슫?援?, '?ы븯援?, '湲덉젙援?, '遺곴뎄'],
    '?援ш킅??떆': ['?섏꽦援?, '?ъ꽌援?, '?ъ꽦援?],
    '愿묒＜愿묒뿭??: ['?쒓뎄', '?④뎄', '遺곴뎄'],
    '??꾧킅??떆': ['?좎꽦援?, '?쒓뎄', '以묎뎄'],
    '?몄궛愿묒뿭??: ['?④뎄', '?숆뎄', '遺곴뎄']
  };

  // ?쇳꽣 ?곗씠??(吏??퀎)
  const centerDataByRegion: { [region: string]: { [district: string]: string[] } } = {
    '?쒖슱?밸퀎??: {
      '媛뺣궓援?: ['媛뺣궓?쇳꽣', '??궪?쇳꽣'],
      '?쒖큹援?: ['?쒖큹?쇳꽣', '諛⑸같?쇳꽣'],
      '?≫뙆援?: ['?≫뙆?쇳꽣', '?좎떎?쇳꽣'],
      '媛뺣룞援?: ['媛뺣룞?쇳꽣'],
      '留덊룷援?: ['?띾??쇳꽣', '留덊룷?쇳꽣'],
      '?⑹궛援?: ['?⑹궛?쇳꽣']
    },
    '寃쎄린??: {
      '?섏썝??: ['?섏썝?쇳꽣'],
      '?깅궓??: ['遺꾨떦?쇳꽣', '?먭탳?쇳꽣'],
      '?⑹씤??: ['?⑹씤?쇳꽣'],
      '遺泥쒖떆': ['遺泥쒖꽱??],
      '?붿꽦??: ['?숉깂?쇳꽣'],
      '怨좎뼇??: ['?쇱궛?쇳꽣'],
      '遺꾨떦援?: ['遺꾨떦?쇳꽣']
    },
    '遺?곌킅??떆': {
      '?댁슫?援?: ['?댁슫??쇳꽣'],
      '?ы븯援?: ['?ы븯?쇳꽣'],
      '湲덉젙援?: ['湲덉젙?쇳꽣'],
      '遺곴뎄': ['遺?곕턿?쇳꽣']
    }
  };

  // ?쇳꽣蹂??곸꽭 ?곗씠??
  const [centersData, setCentersData] = useState<{ [centerName: string]: any }>({
    '媛뺣궓?쇳꽣': { id: 'center-1', name: '媛뺣궓?쇳꽣', region: '?쒖슱?밸퀎??, district: '媛뺣궓援?, 
      revenue: { registration: 15000000, lessons: 45000000, shop: 8000000, total: 68000000 },
      costs: { labor: 25000000, utilities: 5000000, rent: 12000000, other: 3000000, total: 45000000 },
      netProfit: 23000000, profitMargin: 33.8
    },
    '?쒖큹?쇳꽣': { id: 'center-2', name: '?쒖큹?쇳꽣', region: '?쒖슱?밸퀎??, district: '?쒖큹援?,
      revenue: { registration: 12000000, lessons: 38000000, shop: 6000000, total: 56000000 },
      costs: { labor: 22000000, utilities: 4500000, rent: 10000000, other: 2500000, total: 39000000 },
      netProfit: 17000000, profitMargin: 30.4
    },
    '遺꾨떦?쇳꽣': { id: 'center-3', name: '遺꾨떦?쇳꽣', region: '寃쎄린??, district: '遺꾨떦援?,
      revenue: { registration: 10000000, lessons: 30000000, shop: 5000000, total: 45000000 },
      costs: { labor: 18000000, utilities: 4000000, rent: 9000000, other: 2000000, total: 33000000 },
      netProfit: 12000000, profitMargin: 26.7
    },
    '?≫뙆?쇳꽣': { id: 'center-4', name: '?≫뙆?쇳꽣', region: '?쒖슱?밸퀎??, district: '?≫뙆援?,
      revenue: { registration: 13000000, lessons: 40000000, shop: 7000000, total: 60000000 },
      costs: { labor: 23000000, utilities: 4800000, rent: 11000000, other: 2700000, total: 41500000 },
      netProfit: 18500000, profitMargin: 30.8
    },
    '遺?곗꽱??: { id: 'center-5', name: '遺?곗꽱??, region: '遺?곌킅??떆', district: '?댁슫?援?,
      revenue: { registration: 9000000, lessons: 27000000, shop: 4500000, total: 40500000 },
      costs: { labor: 16000000, utilities: 3500000, rent: 8000000, other: 1800000, total: 29300000 },
      netProfit: 11200000, profitMargin: 27.7
    }
  });

  // 留ㅼ텧 ?곗씠??
  const [revenueData, setRevenueData] = useState({
    overview: {
      totalRevenue: 12500000000,
      netProfit: 3750000000,
      growthRate: 12.5,
      targetAchievement: 95.2,
      avgRevenuePerCenter: 833333333
    },
    revenueSources: {
      membershipFees: { amount: 6250000000, percentage: 50.0 },
      lessonFees: { amount: 3750000000, percentage: 30.0 },
      privateLessons: { amount: 1875000000, percentage: 15.0 },
      equipmentRental: { amount: 500000000, percentage: 4.0 },
      otherServices: { amount: 125000000, percentage: 1.0 }
    },
    centerContributions: [
      { name: '媛뺣궓?쇳꽣', revenue: 2500000000, profit: 750000000, growth: 15.2 },
      { name: '?≫뙆?쇳꽣', revenue: 2000000000, profit: 600000000, growth: 12.8 },
      { name: '遺꾨떦?쇳꽣', revenue: 1800000000, profit: 540000000, growth: 10.5 },
      { name: '?띾??쇳꽣', revenue: 1500000000, profit: 450000000, growth: 8.9 },
      { name: '遺?곗꽱??, revenue: 1200000000, profit: 360000000, growth: 6.2 }
    ],
    costAnalysis: {
      laborCosts: { amount: 2500000000, percentage: 20.0 },
      rentCosts: { amount: 1875000000, percentage: 15.0 },
      taxCosts: { amount: 1250000000, percentage: 10.0 },
      maintenanceCosts: { amount: 625000000, percentage: 5.0 },
      marketingCosts: { amount: 375000000, percentage: 3.0 },
      insuranceCosts: { amount: 250000000, percentage: 2.0 },
      otherCosts: { amount: 125000000, percentage: 1.0 }
    }
  });

  // ?곗씠???덈줈怨좎묠
  const refreshData = async () => {
    setLoading(true);
    try {
      // ?ㅼ젣 API ?몄텧 ???紐??곗씠???낅뜲?댄듃
      setLastUpdated(new Date());
      console.log('留ㅼ텧 ?곗씠???덈줈怨좎묠 ?꾨즺');
    } catch (error) {
      console.error('?곗씠???덈줈怨좎묠 ?ㅽ뙣:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // 沅뚰븳 ?뺤씤
  if (!user || !hasUserType('superAdmin')) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">?묎렐 沅뚰븳 ?놁쓬</h1>
          <p className="text-gray-600">???섏씠吏??理쒓퀬愿由ъ옄留??묎렐?????덉뒿?덈떎.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ?ㅻ뜑 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">?쇳꽣蹂?留ㅼ텧 愿由?/h1>
            <p className="text-gray-600 mt-2">JJ Swim Lab ?쇳꽣蹂??섏씡 諛?鍮꾩슜 遺꾩꽍 ??쒕낫??/p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={refreshData}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '?덈줈怨좎묠 以?..' : '?덈줈怨좎묠'}
            </button>
            <div className="text-sm text-gray-500">
              留덉?留??낅뜲?댄듃: {lastUpdated.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* ?꾪꽣 ?뱀뀡 */}
      <div className="mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">湲곌컙 ?꾪꽣</h3>
          <div className="flex gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">湲곌컙</label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="week">?대쾲 二?/option>
                <option value="month">?대쾲 ??/option>
                <option value="quarter">?대쾲 遺꾧린</option>
                <option value="year">?ы빐</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 留ㅼ텧 媛쒖슂 移대뱶 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">?뮥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">珥?留ㅼ텧</p>
              <p className="text-2xl font-bold text-gray-900">??revenueData.overview.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">?뱢</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">?쒖씠??/p>
              <p className="text-2xl font-bold text-gray-900">??revenueData.overview.netProfit.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-2xl">?뱤</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">?깆옣瑜?/p>
              <p className="text-2xl font-bold text-gray-900">{revenueData.overview.growthRate}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-2xl">?렞</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">紐⑺몴 ?ъ꽦瑜?/p>
              <p className="text-2xl font-bold text-gray-900">{revenueData.overview.targetAchievement}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <span className="text-2xl">?룫</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">?쇳꽣???됯퇏</p>
              <p className="text-2xl font-bold text-gray-900">??revenueData.overview.avgRevenuePerCenter.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ?섏씡?먮퀎 遺꾩꽍 */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">?섏씡?먮퀎 遺꾩꽍</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {Object.entries(revenueData.revenueSources).map(([key, value]) => (
            <div key={key} className="text-center">
              <div className="text-2xl font-bold text-blue-600">??value.amount.toLocaleString()}</div>
              <div className="text-sm text-gray-600">
                {key === 'membershipFees' ? '?뚯썝 ?깅줉鍮? :
                 key === 'lessonFees' ? '媛뺤뒿鍮? :
                 key === 'privateLessons' ? '媛쒖씤?덉뒯' :
                 key === 'equipmentRental' ? '?λ퉬 ??? : '湲고? ?쒕퉬??}
              </div>
              <div className="text-xs text-gray-500">{value.percentage}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* ?쇳꽣蹂?湲곗뿬??遺꾩꽍 */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">?쇳꽣蹂?湲곗뿬??遺꾩꽍</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">?쇳꽣紐?/th>
                <th className="text-left py-2">留ㅼ텧</th>
                <th className="text-left py-2">?쒖씠??/th>
                <th className="text-left py-2">?깆옣瑜?/th>
                <th className="text-left py-2">?섏씡瑜?/th>
              </tr>
            </thead>
            <tbody>
              {revenueData.centerContributions.map((center, index) => (
                <tr key={index} className="border-b">
                  <td className="py-2 font-medium">{center.name}</td>
                  <td className="py-2">??center.revenue.toLocaleString()}</td>
                  <td className="py-2">??center.profit.toLocaleString()}</td>
                  <td className="py-2 text-green-600">{center.growth}%</td>
                  <td className="py-2">{((center.profit / center.revenue) * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 鍮꾩슜 援ъ“ 遺꾩꽍 */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">鍮꾩슜 援ъ“ 遺꾩꽍</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(revenueData.costAnalysis).map(([key, value]) => (
            <div key={key} className="text-center">
              <div className="text-2xl font-bold text-red-600">??value.amount.toLocaleString()}</div>
              <div className="text-sm text-gray-600">
                {key === 'laborCosts' ? '?멸굔鍮? :
                 key === 'rentCosts' ? '?꾨?猷? :
                 key === 'taxCosts' ? '?쒖꽭怨듦낵湲? :
                 key === 'maintenanceCosts' ? '?좎?蹂댁닔鍮? :
                 key === 'marketingCosts' ? '留덉??낅퉬' :
                 key === 'insuranceCosts' ? '蹂댄뿕猷? : '湲고? 鍮꾩슜'}
              </div>
              <div className="text-xs text-gray-500">{value.percentage}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* ?쇳꽣蹂?鍮꾧탳 遺꾩꽍 */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">?룫 ?쇳꽣蹂?鍮꾧탳 遺꾩꽍</h3>
          <button
            onClick={() => setComparisonMode(!comparisonMode)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              comparisonMode 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {comparisonMode ? '??鍮꾧탳 紐⑤뱶 ?쒖꽦?? : '鍮꾧탳 紐⑤뱶'}
          </button>
        </div>

        {/* 吏???꾪꽣 */}
        <RegionNavigation
          selectedRegions={selectedRegions}
          setSelectedRegions={setSelectedRegions}
          selectedDistricts={selectedDistricts}
          setSelectedDistricts={setSelectedDistricts}
          selectedCenters={selectedCenters}
          setSelectedCenters={setSelectedCenters}
          regionData={regionData}
          centerData={centerDataByRegion}
          comparisonMode={comparisonMode}
          centerDataMap={centersData}
        />

        {/* ?좏깮???쇳꽣?ㅼ쓽 鍮꾧탳 李⑦듃 */}
        {selectedCenters.length > 0 && comparisonMode && (
          <div className="mt-8 space-y-6">
            {/* ?섏씡 鍮꾧탳 李⑦듃 */}
            <ComparisonChart
              centers={selectedCenters.map(name => centersData[name]).filter(Boolean)}
              title="?뮥 ?쇳꽣蹂??섏씡 鍮꾧탳"
              items={[
                { 
                  key: 'registration', 
                  label: '?깅줉鍮?, 
                  icon: '?뱷', 
                  color: 'text-blue-600',
                  bgColor: 'from-blue-400 via-blue-500 to-blue-600',
                  getValue: (center) => center.revenue.registration 
                },
                { 
                  key: 'lessons', 
                  label: '媛뺤뒿鍮?, 
                  icon: '?룋', 
                  color: 'text-green-600',
                  bgColor: 'from-green-400 via-green-500 to-green-600',
                  getValue: (center) => center.revenue.lessons 
                },
                { 
                  key: 'shop', 
                  label: '留ㅼ젏?먮ℓ', 
                  icon: '?썟', 
                  color: 'text-purple-600',
                  bgColor: 'from-purple-400 via-purple-500 to-purple-600',
                  getValue: (center) => center.revenue.shop 
                }
              ]}
            />

            {/* 鍮꾩슜 鍮꾧탳 李⑦듃 */}
            <ComparisonChart
              centers={selectedCenters.map(name => centersData[name]).filter(Boolean)}
              title="?뮯 ?쇳꽣蹂?鍮꾩슜 鍮꾧탳"
              hasRevenue={false}
              items={[
                { 
                  key: 'labor', 
                  label: '?멸굔鍮?, 
                  icon: '?뫁', 
                  color: 'text-orange-600',
                  bgColor: 'from-orange-400 via-orange-500 to-orange-600',
                  getValue: (center) => center.costs.labor 
                },
                { 
                  key: 'utilities', 
                  label: '怨듦낵湲?, 
                  icon: '??, 
                  color: 'text-yellow-600',
                  bgColor: 'from-yellow-400 via-yellow-500 to-yellow-600',
                  getValue: (center) => center.costs.utilities 
                },
                { 
                  key: 'rent', 
                  label: '?꾨?猷?, 
                  icon: '?룧', 
                  color: 'text-red-600',
                  bgColor: 'from-red-400 via-red-500 to-red-600',
                  getValue: (center) => center.costs.rent 
                },
                { 
                  key: 'other', 
                  label: '湲고?鍮꾩슜', 
                  icon: '?벀', 
                  color: 'text-gray-600',
                  bgColor: 'from-gray-400 via-gray-500 to-gray-600',
                  getValue: (center) => center.costs.other 
                }
              ]}
            />

            {/* ?섏씡??鍮꾧탳 李⑦듃 */}
            <ComparisonChart
              centers={selectedCenters.map(name => centersData[name]).filter(Boolean)}
              title="?뱤 ?쇳꽣蹂??섏씡??鍮꾧탳"
              items={[
                { 
                  key: 'netProfit', 
                  label: '?쒖씠??, 
                  icon: '?뭿', 
                  color: 'text-emerald-600',
                  bgColor: 'from-emerald-400 via-emerald-500 to-emerald-600',
                  getValue: (center) => center.netProfit 
                }
              ]}
            />
          </div>
        )}

        {selectedCenters.length === 0 && comparisonMode && (
          <div className="mt-8 text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-500 text-lg">?몘 ?꾩뿉???쇳꽣瑜??좏깮?섎㈃ 鍮꾧탳 李⑦듃媛 ?쒖떆?⑸땲??/p>
          </div>
        )}
      </div>
    </div>
  );
}
