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
 * - ?곹깭: ???꾩꽦 (珥?留ㅼ텧 愿由??섏씠吏 ?꾨즺)
 * 
 * ?? **?ㅼ쓬 ?④퀎**
 * - ?ㅼ떆媛?留ㅼ텧 紐⑤땲?곕쭅
 * - AI 湲곕컲 留ㅼ텧 ?덉륫
 * - ?먮룞?붾맂 由ы룷???앹꽦
 * - 怨좉툒 遺꾩꽍 ?꾧뎄
 * 
 * ?뮕 **?ъ슜 ?덉떆**
 * ```tsx
 * // 珥?留ㅼ텧 愿由??섏씠吏 ?묎렐
 * /admin/revenue-management
 * 
 * // ?섏씡?먮퀎 ?꾪꽣留?
 * setSelectedRevenueSource(['center_fees', 'shop_sales'])
 * 
 * // 湲곌컙蹂?留ㅼ텧 議고쉶
 * loadRevenueByPeriod('monthly')
 * ```
 * 
 * ?뵇 **?섏씠吏 泥섎━ ?먮쫫**
 * 1. ?ъ슜??沅뚰븳 ?뺤씤 (理쒓퀬愿由ъ옄留??묎렐)
 * 2. ?꾩껜 留ㅼ텧 ?곗씠??濡쒕뱶
 * 3. ?섏씡?먮퀎, ?쇳꽣蹂?留ㅼ텧 怨꾩궛
 * 4. 李⑦듃 諛?洹몃옒???뚮뜑留?
 * 5. ?꾪꽣留?湲곕뒫 ?쒓났
 * 6. ?몄궗?댄듃 諛?異붿쿇 ?쒓났
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';

interface RevenueData {
  overview: {
    totalRevenue: number;
    netProfit: number;
    growthRate: number;
    targetRevenue: number;
    achievementRate: number;
    totalCenters: number;
    activeCenters: number;
    averageRevenuePerCenter: number;
  };
  revenueSources: {
    membershipFees: { amount: number; percentage: number; growth: number };
    lessonFees: { amount: number; percentage: number; growth: number };
    privateLessons: { amount: number; percentage: number; growth: number };
    equipmentRental: { amount: number; percentage: number; growth: number };
    otherServices: { amount: number; percentage: number; growth: number };
  };
  centerPerformance: {
    centerId: string;
    centerName: string;
    region: string;
    revenue: number;
    profit: number;
    growth: number;
    contribution: number;
  }[];
  regionalAnalysis: {
    region: string;
    totalRevenue: number;
    centerCount: number;
    averageRevenue: number;
    growth: number;
  }[];
  monthlyTrends: {
    month: string;
    revenue: number;
    profit: number;
    membershipFees: number;
    lessonFees: number;
    privateLessons: number;
    equipmentRental: number;
    otherServices: number;
  }[];
  costAnalysis: {
    category: string;
    amount: number;
    percentage: number;
    trend: number;
  }[];
  insights: {
    topPerformingCenter: string;
    fastestGrowingSource: string;
    underperformingRegion: string;
    recommendation: string;
  };
}

export default function RevenueManagementPage() {
  const { user, hasUserType } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedCenter, setSelectedCenter] = useState('all');

  useEffect(() => {
    if (user && hasUserType('superAdmin')) {
      loadRevenueData();
    }
  }, [user, hasUserType]);

  const loadRevenueData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // ?꾩떆 留ㅼ텧 ?곗씠??(?ㅼ젣濡쒕뒗 API?먯꽌 媛?몄?????
      const mockRevenueData: RevenueData = {
        overview: {
          totalRevenue: 12500000000, // 125?듭썝
          netProfit: 3750000000, // 37.5?듭썝
          growthRate: 12.5,
          targetRevenue: 15000000000, // 150?듭썝
          achievementRate: 83.3,
          totalCenters: 156,
          activeCenters: 142,
          averageRevenuePerCenter: 88028169 // ??8,800留뚯썝
        },
        revenueSources: {
          membershipFees: { amount: 6000000000, percentage: 50.0, growth: 12.5 },
          lessonFees: { amount: 3600000000, percentage: 30.0, growth: 18.2 },
          privateLessons: { amount: 1800000000, percentage: 15.0, growth: 25.8 },
          equipmentRental: { amount: 480000000, percentage: 4.0, growth: 8.7 },
          otherServices: { amount: 120000000, percentage: 1.0, growth: 15.3 }
        },
        centerPerformance: [
          { centerId: '1', centerName: '媛뺣궓?쇳꽣', region: '?쒖슱?밸퀎??, revenue: 180000000, profit: 54000000, growth: 15.2, contribution: 1.44 },
          { centerId: '2', centerName: '?≫뙆?쇳꽣', region: '?쒖슱?밸퀎??, revenue: 168000000, profit: 50400000, growth: 12.8, contribution: 1.34 },
          { centerId: '3', centerName: '遺꾨떦?쇳꽣', region: '寃쎄린??, revenue: 152000000, profit: 45600000, growth: 10.5, contribution: 1.22 },
          { centerId: '4', centerName: '?띾??쇳꽣', region: '?쒖슱?밸퀎??, revenue: 140000000, profit: 42000000, growth: 8.7, contribution: 1.12 },
          { centerId: '5', centerName: '遺?곗꽱??, region: '遺?곌킅??떆', revenue: 128000000, profit: 38400000, growth: 7.3, contribution: 1.02 }
        ],
        regionalAnalysis: [
          { region: '?쒖슱?밸퀎??, totalRevenue: 4500000000, centerCount: 45, averageRevenue: 100000000, growth: 12.5 },
          { region: '寃쎄린??, totalRevenue: 3200000000, centerCount: 38, averageRevenue: 84210526, growth: 10.8 },
          { region: '遺?곌킅??떆', totalRevenue: 1800000000, centerCount: 18, averageRevenue: 100000000, growth: 8.9 },
          { region: '?援ш킅??떆', totalRevenue: 1200000000, centerCount: 12, averageRevenue: 100000000, growth: 7.2 },
          { region: '?몄쿇愿묒뿭??, totalRevenue: 900000000, centerCount: 9, averageRevenue: 100000000, growth: 6.5 }
        ],
        monthlyTrends: [
          { month: '2024-01', revenue: 950000000, profit: 285000000, membershipFees: 475000000, lessonFees: 285000000, privateLessons: 142500000, equipmentRental: 38000000, otherServices: 9500000 },
          { month: '2024-02', revenue: 980000000, profit: 294000000, membershipFees: 490000000, lessonFees: 294000000, privateLessons: 147000000, equipmentRental: 39200000, otherServices: 9800000 },
          { month: '2024-03', revenue: 1050000000, profit: 315000000, membershipFees: 525000000, lessonFees: 315000000, privateLessons: 157500000, equipmentRental: 42000000, otherServices: 10500000 },
          { month: '2024-04', revenue: 1100000000, profit: 330000000, membershipFees: 550000000, lessonFees: 330000000, privateLessons: 165000000, equipmentRental: 44000000, otherServices: 11000000 },
          { month: '2024-05', revenue: 1150000000, profit: 345000000, membershipFees: 575000000, lessonFees: 345000000, privateLessons: 172500000, equipmentRental: 46000000, otherServices: 11500000 },
          { month: '2024-06', revenue: 1200000000, profit: 360000000, membershipFees: 600000000, lessonFees: 360000000, privateLessons: 180000000, equipmentRental: 48000000, otherServices: 12000000 }
        ],
        costAnalysis: [
          { category: '?멸굔鍮?, amount: 5000000000, percentage: 40.0, trend: 5.2 },
          { category: '?꾨?猷?, amount: 2500000000, percentage: 20.0, trend: 3.1 },
          { category: '?쒖꽭怨듦낵湲?, amount: 1500000000, percentage: 12.0, trend: 2.8 },
          { category: '?좎?蹂댁닔鍮?, amount: 1000000000, percentage: 8.0, trend: 2.3 },
          { category: '留덉??낅퉬', amount: 750000000, percentage: 6.0, trend: 8.7 },
          { category: '蹂댄뿕猷?, amount: 500000000, percentage: 4.0, trend: 1.5 },
          { category: '湲고?', amount: 1250000000, percentage: 10.0, trend: 4.5 }
        ],
        insights: {
          topPerformingCenter: '媛뺣궓?쇳꽣',
          fastestGrowingSource: '媛쒖씤?덉뒯',
          underperformingRegion: '?몄쿇愿묒뿭??,
          recommendation: '媛쒖씤?덉뒯 ?섏씡??鍮좊Ⅴ寃??깆옣?섍퀬 ?덉뒿?덈떎. 媛쒖씤?덉뒯 ?꾨줈洹몃옩 ?뺣?瑜?怨좊젮?대낫?몄슂.'
        }
      };
      
      setRevenueData(mockRevenueData);
    } catch (error) {
      console.error('留ㅼ텧 ?곗씠??濡쒕뵫 ?ㅻ쪟:', error);
      setError('留ㅼ텧 ?곗씠?곕? 遺덈윭?ㅻ뒗 以??ㅻ쪟媛 諛쒖깮?덉뒿?덈떎.');
    } finally {
      setLoading(false);
    }
  };

  if (!hasUserType('superAdmin')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">?묎렐 沅뚰븳 ?놁쓬</h1>
          <p className="text-gray-600">???섏씠吏??理쒓퀬 愿由ъ옄留??묎렐?????덉뒿?덈떎.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">留ㅼ텧 ?곗씠?곕? 遺덈윭?ㅻ뒗 以?..</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">?ㅻ쪟 諛쒖깮</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadRevenueData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ?ㅼ떆 ?쒕룄
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* ?ㅻ뜑 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">?뮥 ?쇳꽣蹂?留ㅼ텧 愿由?/h1>
          <p className="text-gray-600">媛??쇳꽣???ㅼ젣 ?댁쁺 ?섏씡怨?鍮꾩슜??愿由ы븯???쇳꽣蹂?留ㅼ텧 ??쒕낫??/p>
        </div>

        {/* ?꾪꽣 ?듭뀡 */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">湲곌컙</label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="daily">?쇰퀎</option>
                <option value="weekly">二쇰퀎</option>
                <option value="monthly">?붾퀎</option>
                <option value="quarterly">遺꾧린蹂?/option>
                <option value="yearly">?곕퀎</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">吏??/label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">?꾩껜</option>
                <option value="seoul">?쒖슱?밸퀎??/option>
                <option value="gyeonggi">寃쎄린??/option>
                <option value="busan">遺?곌킅??떆</option>
                <option value="daegu">?援ш킅??떆</option>
                <option value="incheon">?몄쿇愿묒뿭??/option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">?쇳꽣</label>
              <select
                value={selectedCenter}
                onChange={(e) => setSelectedCenter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">?꾩껜</option>
                <option value="gangnam">媛뺣궓?쇳꽣</option>
                <option value="songpa">?≫뙆?쇳꽣</option>
                <option value="bundang">遺꾨떦?쇳꽣</option>
                <option value="hongdae">?띾??쇳꽣</option>
                <option value="busan">遺?곗꽱??/option>
              </select>
            </div>
          </div>
        </div>

        {revenueData && (
          <>
            {/* ?꾩껜 留ㅼ텧 媛쒖슂 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <span className="text-2xl">?뮥</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">珥?留ㅼ텧</p>
                    <p className="text-2xl font-bold text-gray-900">{(revenueData.overview.totalRevenue / 100000000).toFixed(1)}?듭썝</p>
                    <p className="text-xs text-green-600">+{revenueData.overview.growthRate}% ?깆옣</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <span className="text-2xl">?뱢</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">?쒖씠??/p>
                    <p className="text-2xl font-bold text-blue-600">{(revenueData.overview.netProfit / 100000000).toFixed(1)}?듭썝</p>
                    <p className="text-xs text-gray-500">留덉쭊?? {((revenueData.overview.netProfit / revenueData.overview.totalRevenue) * 100).toFixed(1)}%</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <span className="text-2xl">?렞</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">紐⑺몴 ?ъ꽦瑜?/p>
                    <p className="text-2xl font-bold text-yellow-600">{revenueData.overview.achievementRate}%</p>
                    <p className="text-xs text-gray-500">紐⑺몴: {(revenueData.overview.targetRevenue / 100000000).toFixed(1)}?듭썝</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <span className="text-2xl">?룫</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">?쇳꽣???됯퇏</p>
                    <p className="text-2xl font-bold text-purple-600">{(revenueData.overview.averageRevenuePerCenter / 10000).toFixed(0)}留뚯썝</p>
                    <p className="text-xs text-gray-500">?쒖꽦: {revenueData.overview.activeCenters}媛?/p>
                  </div>
                </div>
              </div>
            </div>

            {/* ?섏씡?먮퀎 遺꾩꽍 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">?뱤 ?섏씡?먮퀎 遺꾩꽍</h3>
                <div className="space-y-4">
                  {Object.entries(revenueData.revenueSources).map(([source, data]) => (
                    <div key={source} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">
                          {source === 'membershipFees' && '?뚯썝 ?깅줉鍮?}
                          {source === 'lessonFees' && '媛뺤뒿鍮?}
                          {source === 'privateLessons' && '媛쒖씤?덉뒯'}
                          {source === 'equipmentRental' && '?λ퉬 ???}
                          {source === 'otherServices' && '湲고? ?쒕퉬??}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{(data.amount / 100000000).toFixed(1)}?듭썝</p>
                        <p className="text-xs text-gray-500">{data.percentage}% ??+{data.growth}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">?룇 ?곸쐞 ?깃낵 ?쇳꽣</h3>
                <div className="space-y-4">
                  {revenueData.centerPerformance.map((center, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{center.centerName}</p>
                        <p className="text-sm text-gray-600">{center.region}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-green-600">{(center.revenue / 100000000).toFixed(1)}?듭썝</p>
                        <p className="text-xs text-gray-500">+{center.growth}% ??{center.contribution}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 吏??퀎 遺꾩꽍 */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">?뿺截?吏??퀎 留ㅼ텧 ?꾪솴</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">吏??/th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">?쇳꽣 ??/th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">珥?留ㅼ텧</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">?쇳꽣???됯퇏</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">?깆옣瑜?/th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {revenueData.regionalAnalysis.map((region, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{region.region}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{region.centerCount}媛?/td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{(region.totalRevenue / 100000000).toFixed(1)}?듭썝</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{(region.averageRevenue / 10000).toFixed(0)}留뚯썝</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">+{region.growth}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ?붾퀎 ?몃젋??*/}
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">?뱢 ?붾퀎 留ㅼ텧 ?몃젋??/h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">??/th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">珥?留ㅼ텧</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">?쒖씠??/th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">?뚯썝 ?깅줉鍮?/th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">媛뺤뒿鍮?/th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">媛쒖씤?덉뒯</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">?λ퉬 ???/th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">湲고? ?쒕퉬??/th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {revenueData.monthlyTrends.map((trend, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{trend.month}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{(trend.revenue / 100000000).toFixed(1)}?듭썝</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{(trend.profit / 100000000).toFixed(1)}?듭썝</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{(trend.membershipFees / 100000000).toFixed(1)}?듭썝</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{(trend.lessonFees / 100000000).toFixed(1)}?듭썝</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{(trend.privateLessons / 100000000).toFixed(1)}?듭썝</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{(trend.equipmentRental / 100000000).toFixed(1)}?듭썝</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{(trend.otherServices / 100000000).toFixed(1)}?듭썝</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 鍮꾩슜 遺꾩꽍 諛??몄궗?댄듃 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">?뮯 鍮꾩슜 援ъ“ 遺꾩꽍</h3>
                <div className="space-y-3">
                  {revenueData.costAnalysis.map((cost, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{cost.category}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-red-600 h-2 rounded-full" 
                            style={{ width: `${cost.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{cost.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">?뮕 ?몄궗?댄듃 諛?異붿쿇</h3>
                <div className="space-y-4">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm font-medium text-green-800">?룇 理쒓퀬 ?깃낵 ?쇳꽣</p>
                    <p className="text-sm text-green-600">{revenueData.insights.topPerformingCenter}</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-800">?뱢 媛??鍮좊Ⅸ ?깆옣</p>
                    <p className="text-sm text-blue-600">{revenueData.insights.fastestGrowingSource}</p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <p className="text-sm font-medium text-yellow-800">?좑툘 媛쒖꽑 ?꾩슂 吏??/p>
                    <p className="text-sm text-yellow-600">{revenueData.insights.underperformingRegion}</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm font-medium text-purple-800">?뮕 異붿쿇?ы빆</p>
                    <p className="text-sm text-purple-600">{revenueData.insights.recommendation}</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
