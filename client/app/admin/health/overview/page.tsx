/**
 * 🏥 JJ Swim Lab - 전체 건강 현황 및 통계 페이지
 * 
 * 📋 **페이지 목적**
 * - 전체 회원의 건강 데이터를 실시간으로 조회 및 분석
 * - 건강 현황 대시보드 (BMI, 혈압, 질환 분포)
 * - 상세 통계 (연령대별, 성별, 트렌드 분석)
 * - 회원 목록 (필터링 및 검색)
 * 
 * 🗄️ **데이터 연동**
 * - GET /api/users - 전체 회원 데이터
 * - User 모델의 healthProfile 사용
 * - 실시간 DB 쿼리
 * 
 * 📅 **생성일**: 2025-01-22
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import apiClient from '@/utils/api';
import StatCard from '@/components/StatCard';
import { Button } from '@/components/ui';
import RegionNavigation from '@/components/RegionNavigation';
import AnimatedComparisonChart from '@/components/AnimatedComparisonChart';
import TrendLineChart, { TrendLineData, TrendMetric } from '@/components/TrendLineChart';
import { 
  Users, 
  Activity, 
  Heart, 
  TrendingUp, 
  TrendingDown,
  AlertCircle,
  CheckCircle,
  BarChart3,
  PieChart,
  Search,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';

interface HealthProfile {
  age?: number;
  gender?: string;
  height?: number;
  weight?: number;
  bloodPressure?: {
    systolic: number;
    diastolic: number;
  };
  chronicConditions?: string[];
  allergies?: string[];
  medications?: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

interface User {
  _id: string;
  email: string;
  name: string;
  userType: string;
  centerId?: string;
  healthProfile?: HealthProfile;
  createdAt: string;
}

export default function HealthOverviewPage() {
  const { user, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [centers, setCenters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'members'>('overview');
  const [periodFilter, setPeriodFilter] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [trendStartDate, setTrendStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 3);
    return date.toISOString().split('T')[0];
  });
  const [trendEndDate, setTrendEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetailModal, setShowUserDetailModal] = useState(false);
  const [showTrendView, setShowTrendView] = useState(false);
  const [trendMetric, setTrendMetric] = useState<'highRisk' | 'avgBMI' | 'avgBP' | 'healthRate'>('highRisk');
  const [hoveredPointIdx, setHoveredPointIdx] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'high-risk' | 'normal'>('all');
  const [visibleColumns, setVisibleColumns] = useState({
    age: true,
    gender: true,
    bmi: true,
    bloodPressure: true,
    conditions: true,
    medications: false,
    emergencyContact: false
  });
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [selectedCenters, setSelectedCenters] = useState<string[]>([]);
  const [comparisonMode, setComparisonMode] = useState(false);

  // 데이터 로드
  useEffect(() => {
    if (authLoading) return;
    
    console.log('🔍 건강 현황 - 사용자 확인:', { user, userType: user?.userType });
    
    if (!user) {
      alert('로그인이 필요합니다');
      window.location.href = '/login';
      return;
    }
    
    // 관리자 권한 체크 (superAdmin, admin, centerAdmin 모두 허용)
    const allowedTypes = ['superAdmin', 'admin', 'centerAdmin'];
    if (!allowedTypes.includes(user.userType)) {
      alert('관리자 권한이 필요합니다');
      window.location.href = '/';
      return;
    }
    
    console.log('✅ 권한 체크 통과 - loadData 호출');
    loadData();
  }, [user, authLoading]);

  const loadData = async () => {
    console.log('📡 loadData 함수 실행 시작');
    try {
      setLoading(true);
      
      // 회원 데이터 로드
      console.log('🔗 API 호출: /api/users');
      const usersResponse = await apiClient.get('/api/users');
      console.log('📊 회원 API 응답:', usersResponse);
      
      if (usersResponse) {
        const users = (usersResponse as any).users || usersResponse;
        if (Array.isArray(users)) {
          setUsers(users);
          console.log(`✅ ${users.length}명의 회원 데이터 로드 완료`);
        } else {
          console.warn('회원 데이터 배열이 아님:', typeof users);
          setUsers([]);
        }
      } else {
        console.warn('회원 데이터 응답 없음');
        setUsers([]);
      }
      
      // 센터 데이터 로드
      console.log('🔗 API 호출: /api/centers');
      const centersResponse = await apiClient.get('/api/centers');
      console.log('📊 센터 API 응답:', centersResponse);
      
      if ((centersResponse as any)?.data?.centers) {
        const centersData = (centersResponse as any).data.centers;
        setCenters(centersData);
        console.log(`✅ ${centersData.length}개의 센터 데이터 로드 완료`);
      } else if ((centersResponse as any)?.centers) {
        setCenters((centersResponse as any).centers);
        console.log(`✅ ${(centersResponse as any).centers.length}개의 센터 데이터 로드 완료`);
      } else {
        console.warn('센터 데이터 응답 없음');
        setCenters([]);
      }
      
    } catch (error: any) {
      console.error('데이터 로드 오류:', error);
      
      // 토큰 만료 시 재로그인
      if (error?.response?.status === 401 || error?.code === 'TOKEN_EXPIRED') {
        alert('세션이 만료되었습니다. 다시 로그인해주세요.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }
      
      setUsers([]);
      setCenters([]);
    } finally {
      setLoading(false);
    }
  };

  // BMI 계산
  const calculateBMI = (height?: number, weight?: number): number | null => {
    if (!height || !weight) return null;
    return weight / Math.pow(height / 100, 2);
  };

  // BMI 상태 판단
  const getBMIStatus = (bmi: number | null): string => {
    if (!bmi) return 'unknown';
    if (bmi < 18.5) return 'underweight';
    if (bmi < 23.0) return 'normal';
    if (bmi < 25.0) return 'overweight';
    return 'obese';
  };

  // 혈압 상태 판단
  const getBloodPressureStatus = (systolic?: number, diastolic?: number): string => {
    if (!systolic || !diastolic) return 'unknown';
    if (systolic < 120 && diastolic < 80) return 'normal';
    if (systolic < 130 && diastolic < 80) return 'elevated';
    if (systolic < 140 || diastolic < 90) return 'stage1';
    return 'stage2';
  };

  // 통계 계산
  const statistics = useMemo(() => {
    const totalUsers = users.length;
    const usersWithHealth = users.filter(u => u.healthProfile).length;
    
    // BMI 분포
    const bmiDistribution = {
      underweight: 0,
      normal: 0,
      overweight: 0,
      obese: 0,
      unknown: 0
    };
    
    // 혈압 분포
    const bpDistribution = {
      normal: 0,
      elevated: 0,
      stage1: 0,
      stage2: 0,
      unknown: 0
    };
    
    // 연령대 분포
    const ageDistribution = {
      '10-19': 0,
      '20-29': 0,
      '30-39': 0,
      '40-49': 0,
      '50-59': 0,
      '60+': 0
    };
    
    // 성별 분포
    const genderDistribution = {
      male: 0,
      female: 0,
      other: 0,
      unknown: 0
    };
    
    // 질환 보유자 수
    let usersWithConditions = 0;
    const conditionCounts: { [key: string]: number } = {};
    
    users.forEach(user => {
      const hp = user.healthProfile;
      if (!hp) return;
      
      // BMI
      const bmi = calculateBMI(hp.height, hp.weight);
      const bmiStatus = getBMIStatus(bmi);
      bmiDistribution[bmiStatus as keyof typeof bmiDistribution]++;
      
      // 혈압
      const bpStatus = getBloodPressureStatus(hp.bloodPressure?.systolic, hp.bloodPressure?.diastolic);
      bpDistribution[bpStatus as keyof typeof bpDistribution]++;
      
      // 연령대
      if (hp.age) {
        if (hp.age < 20) ageDistribution['10-19']++;
        else if (hp.age < 30) ageDistribution['20-29']++;
        else if (hp.age < 40) ageDistribution['30-39']++;
        else if (hp.age < 50) ageDistribution['40-49']++;
        else if (hp.age < 60) ageDistribution['50-59']++;
        else ageDistribution['60+']++;
      }
      
      // 성별
      if (hp.gender) {
        if (hp.gender === '남성' || hp.gender === 'male' || hp.gender === 'M') genderDistribution.male++;
        else if (hp.gender === '여성' || hp.gender === 'female' || hp.gender === 'F') genderDistribution.female++;
        else genderDistribution.other++;
      } else {
        genderDistribution.unknown++;
      }
      
      // 질환
      if (hp.chronicConditions && hp.chronicConditions.length > 0) {
        usersWithConditions++;
        hp.chronicConditions.forEach(condition => {
          conditionCounts[condition] = (conditionCounts[condition] || 0) + 1;
        });
      }
    });
    
    // 고위험군 계산
    const highRiskUsers = users.filter(u => {
      if (!u.healthProfile) return false;
      const bmi = calculateBMI(u.healthProfile.height, u.healthProfile.weight);
      const bmiStatus = getBMIStatus(bmi);
      const bpStatus = getBloodPressureStatus(u.healthProfile.bloodPressure?.systolic, u.healthProfile.bloodPressure?.diastolic);
      
      return bmiStatus === 'obese' || bpStatus === 'stage2' || (u.healthProfile.chronicConditions && u.healthProfile.chronicConditions.length > 2);
    }).length;
    
    return {
      totalUsers,
      usersWithHealth,
      highRiskUsers,
      usersWithConditions,
      bmiDistribution,
      bpDistribution,
      ageDistribution,
      genderDistribution,
      conditionCounts,
      topConditions: Object.entries(conditionCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, count]) => ({ name, count }))
    };
  }, [users]);

  // 필터링된 사용자
  // 센터별 회원 데이터 (DB에서 가져온 실제 센터 정보 사용)
  const centerData = useMemo(() => {
    // RegionNavigation이 기대하는 형식으로 변환: { [region]: { [district]: centerName[] } }
    const regionDistrictMap: { [region: string]: { [district: string]: string[] } } = {};
    
    console.log('🏢 센터 데이터 변환 시작:', centers.length, '개 센터');
    
    centers.forEach(center => {
      // province, city, gu 필드가 따로 있는지 확인
      const region = center.province || center.city || '미지정';
      const district = center.gu || center.dong || '미지정';
      const centerName = center.name;
      
      console.log('📍 센터 매핑:', { 
        centerName, 
        region, 
        district, 
        province: center.province,
        city: center.city,
        gu: center.gu,
        dong: center.dong,
        fullCenter: center 
      });
      
      if (!regionDistrictMap[region]) {
        regionDistrictMap[region] = {};
      }
      if (!regionDistrictMap[region][district]) {
        regionDistrictMap[region][district] = [];
      }
      regionDistrictMap[region][district].push(centerName);
    });
    
    console.log('✅ 최종 centerData 구조:', regionDistrictMap);
    console.log('📊 지역별 센터 수:', Object.keys(regionDistrictMap).map(region => 
      `${region}: ${Object.keys(regionDistrictMap[region]).length}개 구, ${
        Object.values(regionDistrictMap[region]).flat().length
      }개 센터`
    ));
    
    return regionDistrictMap;
  }, [centers]);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // 지역/센터 필터
      if (selectedCenters.length > 0) {
        // selectedCenters는 센터 이름을 가지고 있으므로, user.centerId (ID)를 센터 이름으로 변환
        const userCenterId = user.centerId?.toString();
        const userCenterName = centers.find(c => c._id.toString() === userCenterId)?.name || '미지정';
        if (!selectedCenters.includes(userCenterName)) {
          return false;
        }
      }
      
      // 검색 필터
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        if (!user.name?.toLowerCase().includes(term) && 
            !user.email?.toLowerCase().includes(term)) {
          return false;
        }
      }
      
      // 위험도 필터
      if (filterType !== 'all' && user.healthProfile) {
        const bmi = calculateBMI(user.healthProfile.height, user.healthProfile.weight);
        const bmiStatus = getBMIStatus(bmi);
        const bpStatus = getBloodPressureStatus(user.healthProfile.bloodPressure?.systolic, user.healthProfile.bloodPressure?.diastolic);
        
        const isHighRisk = bmiStatus === 'obese' || bpStatus === 'stage2' || 
          (user.healthProfile.chronicConditions && user.healthProfile.chronicConditions.length > 2);
        
        if (filterType === 'high-risk' && !isHighRisk) return false;
        if (filterType === 'normal' && isHighRisk) return false;
      }
      
      return true;
    });
  }, [users, searchTerm, filterType, selectedCenters]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Heart className="h-8 w-8 text-red-500" />
              전체 건강 현황 및 통계
            </h1>
            <p className="text-gray-600">
              전체 회원의 건강 데이터를 실시간으로 분석합니다
            </p>
          </div>
          <Button
            onClick={loadData}
            variant="primary"
            size="md"
          >
            🔄 새로고침
          </Button>
        </div>
      </div>

      {/* 탭 메뉴 */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: '📊 건강 현황 및 통계', icon: BarChart3 },
              { id: 'members', name: '👥 회원 목록', icon: Users },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* 건강 현황 및 통계 탭 */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* 지역/센터 선택 */}
          <RegionNavigation
            selectedRegions={selectedRegions}
            setSelectedRegions={setSelectedRegions}
            selectedDistricts={selectedDistricts}
            setSelectedDistricts={setSelectedDistricts}
            selectedCenters={selectedCenters}
            setSelectedCenters={setSelectedCenters}
            centerData={centerData}
            comparisonMode={comparisonMode}
            layout="dropdown"
            centerDataMap={{}}
          />

          {/* 주요 지표 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatCard
              title="전체 회원"
              value={`${statistics.totalUsers}명`}
              icon="👥"
              color="blue"
              subtitle={`건강정보: ${statistics.usersWithHealth}명`}
              onClick={() => setFilterType('all')}
            />
            <StatCard
              title="고위험군"
              value={`${statistics.highRiskUsers}명`}
              icon="⚠️"
              color="red"
              subtitle={`전체의 ${((statistics.highRiskUsers / statistics.totalUsers) * 100).toFixed(1)}%`}
              onClick={() => setFilterType(filterType === 'high-risk' ? 'all' : 'high-risk')}
            />
            <StatCard
              title="질환 보유자"
              value={`${statistics.usersWithConditions}명`}
              icon="💊"
              color="orange"
              subtitle={`평균 ${(Object.values(statistics.conditionCounts).reduce((a, b) => a + b, 0) / statistics.usersWithConditions || 0).toFixed(1)}개/인`}
            />
            <StatCard
              title="정상 범위"
              value={`${statistics.totalUsers - statistics.highRiskUsers}명`}
              icon="✅"
              color="green"
              subtitle={`전체의 ${(((statistics.totalUsers - statistics.highRiskUsers) / statistics.totalUsers) * 100).toFixed(1)}%`}
              onClick={() => setFilterType(filterType === 'normal' ? 'all' : 'normal')}
            />
          </div>

          {/* 센터별 건강 분포 요약 (선택된 센터가 있을 때) */}
          {selectedCenters.length > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold mb-4 text-blue-900">
                📊 선택된 센터 건강 현황 ({selectedCenters.length}개 센터)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {selectedCenters.slice(0, 3).map(centerName => {
                  const center = centers.find(c => c.name === centerName);
                  const centerId = center?._id.toString();
                  const centerUsers = users.filter(u => u.centerId?.toString() === centerId);
                  const centerHighRisk = centerUsers.filter(u => {
                    if (!u.healthProfile) return false;
                    const bmi = calculateBMI(u.healthProfile.height, u.healthProfile.weight);
                    const bmiStatus = getBMIStatus(bmi);
                    const bpStatus = getBloodPressureStatus(u.healthProfile.bloodPressure?.systolic, u.healthProfile.bloodPressure?.diastolic);
                    return bmiStatus === 'obese' || bpStatus === 'stage2' || (u.healthProfile.chronicConditions && u.healthProfile.chronicConditions.length > 2);
                  }).length;
                  
                  return (
                    <div key={centerName} className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="font-semibold text-blue-600 mb-2">{centerName}</div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">회원 수</span>
                        <span className="text-lg font-bold">{centerUsers.length}명</span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-sm text-gray-600">고위험</span>
                        <span className={`text-sm font-bold ${centerHighRisk > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {centerHighRisk}명 ({centerUsers.length > 0 ? ((centerHighRisk/centerUsers.length)*100).toFixed(1) : 0}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
                {selectedCenters.length > 3 && (
                  <div className="bg-white rounded-lg p-4 border border-gray-200 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <div className="text-2xl font-bold">+{selectedCenters.length - 3}</div>
                      <div className="text-sm">더 많은 센터</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 기간별 건강 추이 */}
          {selectedCenters.length > 0 && (
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex flex-col gap-4 mb-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">📅 기간별 건강 추이</h3>
                </div>
                
                {/* 기간 설정 */}
                <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">시작일:</label>
                    <input
                      type="date"
                      value={trendStartDate}
                      onChange={(e) => setTrendStartDate(e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">종료일:</label>
                    <input
                      type="date"
                      value={trendEndDate}
                      onChange={(e) => setTrendEndDate(e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div className="flex-1"></div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">데이터 간격:</label>
                    <div className="flex gap-2">
                      {[
                        { value: 'week', label: '주간' },
                        { value: 'month', label: '월간' },
                        { value: 'quarter', label: '분기' },
                        { value: 'year', label: '년간' }
                      ].map(period => (
                        <Button
                          key={period.value}
                          onClick={() => setPeriodFilter(period.value as any)}
                          variant={periodFilter === period.value ? 'primary' : 'outline'}
                          size="sm"
                        >
                          {period.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 항목 선택 */}
              <div className="flex gap-2 mb-4">
                {[
                  { value: 'highRisk', label: '⚠️ 고위험 회원', color: 'red' },
                  { value: 'avgBMI', label: '⚖️ 평균 BMI', color: 'blue' },
                  { value: 'avgBP', label: '💗 평균 혈압', color: 'purple' },
                  { value: 'healthRate', label: '📊 건강정보 등록률', color: 'green' }
                ].map(metric => (
                  <Button
                    key={metric.value}
                    onClick={() => setTrendMetric(metric.value as any)}
                    variant={trendMetric === metric.value ? 'primary' : 'ghost'}
                    size="sm"
                  >
                    {metric.label}
                  </Button>
                ))}
              </div>

              {/* 선택된 지표의 추이 (다중 센터) */}
              <div className="space-y-4">
                {(() => {
                  // 시작일/종료일 기반으로 간격에 따라 날짜 생성
                  const generateDates = (startDate: string, endDate: string, interval: string) => {
                    const start = new Date(startDate);
                    const end = new Date(endDate);
                    const dates: string[] = [];
                    let current = new Date(start);
                    
                    while (current <= end) {
                      if (interval === 'week') {
                        dates.push(`${current.getMonth() + 1}/${current.getDate()}`);
                        current.setDate(current.getDate() + 7);
                      } else if (interval === 'month') {
                        dates.push(`${current.getFullYear()}.${String(current.getMonth() + 1).padStart(2, '0')}`);
                        current.setMonth(current.getMonth() + 1);
                      } else if (interval === 'quarter') {
                        dates.push(`${current.getFullYear()}.Q${Math.floor(current.getMonth() / 3) + 1}`);
                        current.setMonth(current.getMonth() + 3);
                      } else {
                        dates.push(`${current.getFullYear()}년`);
                        current.setFullYear(current.getFullYear() + 1);
                      }
                    }
                    
                    if (dates.length === 0 || current > end) {
                      const lastDate = interval === 'week' ? `${end.getMonth() + 1}/${end.getDate()}` :
                                      interval === 'month' ? `${end.getFullYear()}.${String(end.getMonth() + 1).padStart(2, '0')}` :
                                      interval === 'quarter' ? `${end.getFullYear()}.Q${Math.floor(end.getMonth() / 3) + 1}` :
                                      `${end.getFullYear()}년`;
                      if (dates[dates.length - 1] !== lastDate) {
                        dates.push(lastDate);
                      }
                    }
                    
                    return dates;
                  };

                  const periodDates = generateDates(trendStartDate, trendEndDate, periodFilter);
                  
                  // 센터별 추이 데이터 (Mock)
                  const centerColors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
                  const trendData: TrendLineData[] = selectedCenters.slice(0, 5).map((centerName, centerIdx) => {
                    const data = periodDates.map((date, idx) => {
                      let value = 0;
                      const baseValue = 25 + (centerIdx * 5);
                      const trend = -0.5 * idx;
                      const seed = (centerIdx * 100 + idx * 10) % 5;
                      
                      if (trendMetric === 'highRisk') {
                        value = baseValue + trend + seed;
                      } else if (trendMetric === 'avgBMI') {
                        value = 23.5 + (centerIdx * 0.5) + (trend * 0.1) + (seed * 0.1);
                      } else if (trendMetric === 'avgBP') {
                        value = 120 + (centerIdx * 3) + trend + seed;
                      } else {
                        value = 75 + (centerIdx * 3) + (idx * 2) + seed;
                      }
                      
                      return { date, value };
                    });
                    
                    return { name: centerName, color: centerColors[centerIdx], data };
                  });

                  // 지표 정보
                  const metric: TrendMetric = {
                    label: trendMetric === 'highRisk' ? '고위험 회원 수' :
                           trendMetric === 'avgBMI' ? '평균 BMI' :
                           trendMetric === 'avgBP' ? '평균 수축기 혈압' :
                           '건강정보 등록률',
                    unit: trendMetric === 'highRisk' ? '명' :
                          trendMetric === 'healthRate' ? '%' : '',
                    decimals: trendMetric === 'avgBMI' ? 1 : 0
                  };

                  return <TrendLineChart data={trendData} metric={metric} height="400px" />;
                })()}
              </div>
            </div>
          )}

          {/* 센터/구/시도별 건강 분포 비교 */}
          {(selectedCenters.length > 0 || selectedDistricts.length > 0 || selectedRegions.length > 0) && (
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  {selectedCenters.length > 0 ? '센터별' : selectedDistricts.length > 0 ? '구/시별' : '시/도별'} 건강 분포 비교
                </h3>
                <Button
                  onClick={() => setShowTrendView(!showTrendView)}
                  variant={showTrendView ? 'primary' : 'outline'}
                  size="sm"
                >
                  {showTrendView ? '📊 분포 비교로 보기' : '📈 기간별 추이로 보기'}
                </Button>
              </div>
              
              <div className="space-y-6">
                {/* BMI 분포 비교 */}
                <div>
                  <h4 className="text-md font-medium mb-3 text-gray-700">BMI 분포 비교</h4>
                  {(() => {
                    let comparisonData: any[] = [];
                    
                    // 센터 선택 시: 센터별 비교
                    if (selectedCenters.length > 0) {
                      comparisonData = selectedCenters.map(centerName => {
                        const center = centers.find(c => c.name === centerName);
                        const centerId = center?._id.toString();
                        const centerUsers = users.filter(u => u.centerId?.toString() === centerId);
                        const total = centerUsers.length;
                        const bmiDist = { underweight: 0, normal: 0, overweight: 0, obese: 0, unknown: 0 };
                        
                        centerUsers.forEach(u => {
                          if (!u.healthProfile) {
                            bmiDist.unknown++;
                            return;
                          }
                          const bmi = calculateBMI(u.healthProfile.height, u.healthProfile.weight);
                          const status = getBMIStatus(bmi);
                          bmiDist[status as keyof typeof bmiDist]++;
                        });
                        
                        return { name: centerName, total, ...bmiDist };
                      });
                    }
                    // 구/시 선택 시 (센터 미선택): 구/시별 합산
                    else if (selectedDistricts.length > 0 && selectedCenters.length === 0) {
                      comparisonData = selectedDistricts.map(district => {
                        // 해당 구/시의 모든 센터 찾기
                        const districtsCenter = centers.filter(c => c.gu === district);
                        const districtUsers = users.filter(u => {
                          const userCenterId = u.centerId?.toString();
                          return districtsCenter.some(c => c._id.toString() === userCenterId);
                        });
                        const total = districtUsers.length;
                        const bmiDist = { underweight: 0, normal: 0, overweight: 0, obese: 0, unknown: 0 };
                        
                        districtUsers.forEach(u => {
                          if (!u.healthProfile) {
                            bmiDist.unknown++;
                            return;
                          }
                          const bmi = calculateBMI(u.healthProfile.height, u.healthProfile.weight);
                          const status = getBMIStatus(bmi);
                          bmiDist[status as keyof typeof bmiDist]++;
                        });
                        
                        return { name: district, total, ...bmiDist };
                      });
                    }
                    // 시/도 선택 시 (구/시 미선택): 시/도별 합산
                    else if (selectedRegions.length > 0) {
                      comparisonData = selectedRegions.map(region => {
                        // 해당 시/도의 모든 센터 찾기
                        const regionCenters = centers.filter(c => c.province === region || c.city === region);
                        const regionUsers = users.filter(u => {
                          const userCenterId = u.centerId?.toString();
                          return regionCenters.some(c => c._id.toString() === userCenterId);
                        });
                        const total = regionUsers.length;
                        const bmiDist = { underweight: 0, normal: 0, overweight: 0, obese: 0, unknown: 0 };
                        
                        regionUsers.forEach(u => {
                          if (!u.healthProfile) {
                            bmiDist.unknown++;
                            return;
                          }
                          const bmi = calculateBMI(u.healthProfile.height, u.healthProfile.weight);
                          const status = getBMIStatus(bmi);
                          bmiDist[status as keyof typeof bmiDist]++;
                        });
                        
                        return { name: region, total, ...bmiDist };
                      });
                    }

                    // 항목별로 비교 데이터 생성
                    const bmiCategories = [
                      { key: 'underweight', label: '저체중', color: 'blue' },
                      { key: 'normal', label: '정상', color: 'green' },
                      { key: 'overweight', label: '과체중', color: 'yellow' },
                      { key: 'obese', label: '비만', color: 'red' },
                      { key: 'unknown', label: '미등록', color: 'gray' }
                    ];

                    return (
                      <AnimatedComparisonChart
                        title=""
                        data={bmiCategories.map(category => ({
                          center: category.label,
                          items: comparisonData.map(data => {
                            const amount = data[category.key as keyof typeof data] as number;
                            const total = data.total;
                            const percentage = total > 0 ? ((amount / total) * 100).toFixed(1) : '0.0';
                            return {
                              label: `${data.name} (${percentage}%)`,
                              amount: amount,
                              color: category.color
                            };
                          })
                        }))}
                      />
                    );
                  })()}
                </div>

                {/* 혈압 분포 비교 */}
                <div>
                  <h4 className="text-md font-medium mb-3 text-gray-700">혈압 분포 비교</h4>
                  {(() => {
                    // 각 센터의 혈압 분포 계산
                    const centerBPData = selectedCenters.map(centerName => {
                      const center = centers.find(c => c.name === centerName);
                      const centerId = center?._id.toString();
                      const centerUsers = users.filter(u => u.centerId?.toString() === centerId);
                      const total = centerUsers.length;
                      const bpDist = { normal: 0, elevated: 0, stage1: 0, stage2: 0, unknown: 0 };
                      
                      centerUsers.forEach(u => {
                        if (!u.healthProfile?.bloodPressure) {
                          bpDist.unknown++;
                          return;
                        }
                        const status = getBloodPressureStatus(u.healthProfile.bloodPressure.systolic, u.healthProfile.bloodPressure.diastolic);
                        bpDist[status as keyof typeof bpDist]++;
                      });
                      
                      return { centerName, total, ...bpDist };
                    });

                    // 항목별로 센터 비교 데이터 생성
                    const bpCategories = [
                      { key: 'normal', label: '정상', color: 'green' },
                      { key: 'elevated', label: '주의', color: 'yellow' },
                      { key: 'stage1', label: '1단계 고혈압', color: 'orange' },
                      { key: 'stage2', label: '2단계 고혈압', color: 'red' },
                      { key: 'unknown', label: '미등록', color: 'gray' }
                    ];

                    return (
                      <AnimatedComparisonChart
                        title=""
                        data={bpCategories.map(category => ({
                          center: category.label,
                          items: centerBPData.map(centerData => {
                            const amount = centerData[category.key as keyof typeof centerData] as number;
                            const total = centerData.total;
                            const percentage = total > 0 ? ((amount / total) * 100).toFixed(1) : '0.0';
                            return {
                              label: `${centerData.centerName} (${percentage}%)`,
                              amount: amount,
                              color: category.color
                            };
                          })
                        }))}
                      />
                    );
                  })()}
                </div>

                {/* 연령대 분포 비교 */}
                <div>
                  <h4 className="text-md font-medium mb-3 text-gray-700">연령대 분포 비교</h4>
                  {(() => {
                    // 각 센터의 연령대 분포 계산
                    const centerAgeData = selectedCenters.map(centerName => {
                      const center = centers.find(c => c.name === centerName);
                      const centerId = center?._id.toString();
                      const centerUsers = users.filter(u => u.centerId?.toString() === centerId);
                      const total = centerUsers.length;
                      const ageDist = { '10-19': 0, '20-29': 0, '30-39': 0, '40-49': 0, '50-59': 0, '60+': 0 };
                      
                      centerUsers.forEach(u => {
                        if (!u.healthProfile?.age) return;
                        const age = u.healthProfile.age;
                        if (age < 20) ageDist['10-19']++;
                        else if (age < 30) ageDist['20-29']++;
                        else if (age < 40) ageDist['30-39']++;
                        else if (age < 50) ageDist['40-49']++;
                        else if (age < 60) ageDist['50-59']++;
                        else ageDist['60+']++;
                      });
                      
                      return { centerName, total, ...ageDist };
                    });

                    // 항목별로 센터 비교 데이터 생성
                    const ageCategories = [
                      { key: '10-19', label: '10-19세', color: 'purple' },
                      { key: '20-29', label: '20-29세', color: 'blue' },
                      { key: '30-39', label: '30-39세', color: 'green' },
                      { key: '40-49', label: '40-49세', color: 'yellow' },
                      { key: '50-59', label: '50-59세', color: 'orange' },
                      { key: '60+', label: '60세 이상', color: 'red' }
                    ];

                    return (
                      <AnimatedComparisonChart
                        title=""
                        data={ageCategories.map(category => ({
                          center: category.label,
                          items: centerAgeData.map(centerData => {
                            const amount = centerData[category.key as keyof typeof centerData] as number;
                            const total = centerData.total;
                            const percentage = total > 0 ? ((amount / total) * 100).toFixed(1) : '0.0';
                            return {
                              label: `${centerData.centerName} (${percentage}%)`,
                              amount: amount,
                              color: category.color
                            };
                          })
                        }))}
                      />
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* BMI 분포 */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              BMI 분포 {selectedCenters.length > 0 && `(선택된 센터: ${selectedCenters.join(', ')})`}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{statistics.bmiDistribution.underweight}</div>
                <div className="text-sm text-gray-600">저체중</div>
                <div className="text-xs text-gray-500">&lt; 18.5</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{statistics.bmiDistribution.normal}</div>
                <div className="text-sm text-gray-600">정상</div>
                <div className="text-xs text-gray-500">18.5 - 23.0</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{statistics.bmiDistribution.overweight}</div>
                <div className="text-sm text-gray-600">과체중</div>
                <div className="text-xs text-gray-500">23.0 - 25.0</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{statistics.bmiDistribution.obese}</div>
                <div className="text-sm text-gray-600">비만</div>
                <div className="text-xs text-gray-500">≥ 25.0</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-400">{statistics.bmiDistribution.unknown}</div>
                <div className="text-sm text-gray-600">미등록</div>
                <div className="text-xs text-gray-500">-</div>
              </div>
            </div>
          </div>

          {/* 혈압 분포 */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              혈압 분포
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{statistics.bpDistribution.normal}</div>
                <div className="text-sm text-gray-600">정상</div>
                <div className="text-xs text-gray-500">&lt; 120/80</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{statistics.bpDistribution.elevated}</div>
                <div className="text-sm text-gray-600">주의</div>
                <div className="text-xs text-gray-500">120-129/&lt;80</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{statistics.bpDistribution.stage1}</div>
                <div className="text-sm text-gray-600">1단계</div>
                <div className="text-xs text-gray-500">130-139/80-89</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{statistics.bpDistribution.stage2}</div>
                <div className="text-sm text-gray-600">2단계</div>
                <div className="text-xs text-gray-500">≥140/90</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-400">{statistics.bpDistribution.unknown}</div>
                <div className="text-sm text-gray-600">미등록</div>
                <div className="text-xs text-gray-500">-</div>
              </div>
            </div>
          </div>

          {/* 상위 질환 */}
          {statistics.topConditions.length > 0 && (
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">
                상위 10개 질환
              </h3>
              <div className="space-y-2">
                {statistics.topConditions.map((condition, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-medium text-gray-700">{index + 1}.</div>
                      <div className="text-sm text-gray-900">{condition.name}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-medium text-blue-600">{condition.count}명</div>
                      <div className="text-xs text-gray-500">
                        ({((condition.count / statistics.totalUsers) * 100).toFixed(1)}%)
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 회원 목록 탭 */}
      {activeTab === 'members' && (
        <div className="space-y-6">
          {/* 지역/센터 선택 */}
          <RegionNavigation
            selectedRegions={selectedRegions}
            setSelectedRegions={setSelectedRegions}
            selectedDistricts={selectedDistricts}
            setSelectedDistricts={setSelectedDistricts}
            selectedCenters={selectedCenters}
            setSelectedCenters={setSelectedCenters}
            centerData={centerData}
            comparisonMode={comparisonMode}
            layout="dropdown"
            centerDataMap={{}}
          />

          {/* 비교 모드 토글 */}
          {selectedCenters.length > 1 && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">
                    {selectedCenters.length}개 센터 선택됨 - 센터별 비교 모드
                  </span>
                </div>
                <Button
                  onClick={() => setComparisonMode(!comparisonMode)}
                  variant={comparisonMode ? 'primary' : 'outline'}
                  size="sm"
                >
                  {comparisonMode ? '📊 비교 모드 활성' : '📊 비교 모드'}
                </Button>
              </div>
              
              <div className="space-y-6">
                {/* BMI 분포 비교 */}
                <div>
                  <h4 className="text-md font-medium mb-3 text-gray-700">BMI 분포 비교</h4>
                  {(() => {
                    // 각 센터의 BMI 분포 계산
                    const centerBMIData = selectedCenters.map(centerName => {
                      const center = centers.find(c => c.name === centerName);
                      const centerId = center?._id.toString();
                      const centerUsers = users.filter(u => u.centerId?.toString() === centerId);
                      const total = centerUsers.length;
                      const bmiDist = { underweight: 0, normal: 0, overweight: 0, obese: 0, unknown: 0 };
                      
                      centerUsers.forEach(u => {
                        if (!u.healthProfile) {
                          bmiDist.unknown++;
                          return;
                        }
                        const bmi = calculateBMI(u.healthProfile.height, u.healthProfile.weight);
                        const status = getBMIStatus(bmi);
                        bmiDist[status as keyof typeof bmiDist]++;
                      });
                      
                      return { centerName, total, ...bmiDist };
                    });

                    // 항목별로 센터 비교 데이터 생성
                    const bmiCategories = [
                      { key: 'underweight', label: '저체중', color: 'blue' },
                      { key: 'normal', label: '정상', color: 'green' },
                      { key: 'overweight', label: '과체중', color: 'yellow' },
                      { key: 'obese', label: '비만', color: 'red' },
                      { key: 'unknown', label: '미등록', color: 'gray' }
                    ];

                    return (
                      <AnimatedComparisonChart
                        title=""
                        data={bmiCategories.map(category => ({
                          center: category.label,
                          items: centerBMIData.map(centerData => {
                            const amount = centerData[category.key as keyof typeof centerData] as number;
                            const total = centerData.total;
                            const percentage = total > 0 ? ((amount / total) * 100).toFixed(1) : '0.0';
                            return {
                              label: `${centerData.centerName} (${percentage}%)`,
                              amount: amount,
                              color: category.color
                            };
                          })
                        }))}
                      />
                    );
                  })()}
                </div>

                {/* 혈압 분포 비교 */}
                <div>
                  <h4 className="text-md font-medium mb-3 text-gray-700">혈압 분포 비교</h4>
                  {(() => {
                    // 각 센터의 혈압 분포 계산
                    const centerBPData = selectedCenters.map(centerName => {
                      const center = centers.find(c => c.name === centerName);
                      const centerId = center?._id.toString();
                      const centerUsers = users.filter(u => u.centerId?.toString() === centerId);
                      const total = centerUsers.length;
                      const bpDist = { normal: 0, elevated: 0, stage1: 0, stage2: 0, unknown: 0 };
                      
                      centerUsers.forEach(u => {
                        if (!u.healthProfile?.bloodPressure) {
                          bpDist.unknown++;
                          return;
                        }
                        const status = getBloodPressureStatus(u.healthProfile.bloodPressure.systolic, u.healthProfile.bloodPressure.diastolic);
                        bpDist[status as keyof typeof bpDist]++;
                      });
                      
                      return { centerName, total, ...bpDist };
                    });

                    // 항목별로 센터 비교 데이터 생성
                    const bpCategories = [
                      { key: 'normal', label: '정상', color: 'green' },
                      { key: 'elevated', label: '주의', color: 'yellow' },
                      { key: 'stage1', label: '1단계 고혈압', color: 'orange' },
                      { key: 'stage2', label: '2단계 고혈압', color: 'red' },
                      { key: 'unknown', label: '미등록', color: 'gray' }
                    ];

                    return (
                      <AnimatedComparisonChart
                        title=""
                        data={bpCategories.map(category => ({
                          center: category.label,
                          items: centerBPData.map(centerData => {
                            const amount = centerData[category.key as keyof typeof centerData] as number;
                            const total = centerData.total;
                            const percentage = total > 0 ? ((amount / total) * 100).toFixed(1) : '0.0';
                            return {
                              label: `${centerData.centerName} (${percentage}%)`,
                              amount: amount,
                              color: category.color
                            };
                          })
                        }))}
                      />
                    );
                  })()}
                </div>

                {/* 연령대 분포 비교 */}
                <div>
                  <h4 className="text-md font-medium mb-3 text-gray-700">연령대 분포 비교</h4>
                  {(() => {
                    // 각 센터의 연령대 분포 계산
                    const centerAgeData = selectedCenters.map(centerName => {
                      const center = centers.find(c => c.name === centerName);
                      const centerId = center?._id.toString();
                      const centerUsers = users.filter(u => u.centerId?.toString() === centerId);
                      const total = centerUsers.length;
                      const ageDist = { '10-19': 0, '20-29': 0, '30-39': 0, '40-49': 0, '50-59': 0, '60+': 0 };
                      
                      centerUsers.forEach(u => {
                        if (!u.healthProfile?.age) return;
                        const age = u.healthProfile.age;
                        if (age < 20) ageDist['10-19']++;
                        else if (age < 30) ageDist['20-29']++;
                        else if (age < 40) ageDist['30-39']++;
                        else if (age < 50) ageDist['40-49']++;
                        else if (age < 60) ageDist['50-59']++;
                        else ageDist['60+']++;
                      });
                      
                      return { centerName, total, ...ageDist };
                    });

                    // 항목별로 센터 비교 데이터 생성
                    const ageCategories = [
                      { key: '10-19', label: '10-19세', color: 'purple' },
                      { key: '20-29', label: '20-29세', color: 'blue' },
                      { key: '30-39', label: '30-39세', color: 'green' },
                      { key: '40-49', label: '40-49세', color: 'yellow' },
                      { key: '50-59', label: '50-59세', color: 'orange' },
                      { key: '60+', label: '60세 이상', color: 'red' }
                    ];

                    return (
                      <AnimatedComparisonChart
                        title=""
                        data={ageCategories.map(category => ({
                          center: category.label,
                          items: centerAgeData.map(centerData => {
                            const amount = centerData[category.key as keyof typeof centerData] as number;
                            const total = centerData.total;
                            const percentage = total > 0 ? ((amount / total) * 100).toFixed(1) : '0.0';
                            return {
                              label: `${centerData.centerName} (${percentage}%)`,
                              amount: amount,
                              color: category.color
                            };
                          })
                        }))}
                      />
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* 연령대 분포 */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">연령대별 분포</h3>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              {Object.entries(statistics.ageDistribution).map(([range, count]) => (
                <div key={range} className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{count}</div>
                  <div className="text-sm text-gray-600">{range}세</div>
                  <div className="text-xs text-gray-500">
                    {((count / statistics.totalUsers) * 100).toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 성별 분포 */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">성별 분포</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{statistics.genderDistribution.male}</div>
                <div className="text-sm text-gray-600">남성</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-600">{statistics.genderDistribution.female}</div>
                <div className="text-sm text-gray-600">여성</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{statistics.genderDistribution.other}</div>
                <div className="text-sm text-gray-600">기타</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-400">{statistics.genderDistribution.unknown}</div>
                <div className="text-sm text-gray-600">미등록</div>
              </div>
            </div>
          </div>

          {/* 건강 데이터 등록률 */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">건강 데이터 등록률</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">건강 프로필</span>
                  <span className="font-medium">{statistics.usersWithHealth} / {statistics.totalUsers}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${(statistics.usersWithHealth / statistics.totalUsers) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 회원 목록 탭 */}
      {activeTab === 'members' && (
        <div className="space-y-6">
          {/* 지역/센터 선택 */}
          <RegionNavigation
            selectedRegions={selectedRegions}
            setSelectedRegions={setSelectedRegions}
            selectedDistricts={selectedDistricts}
            setSelectedDistricts={setSelectedDistricts}
            selectedCenters={selectedCenters}
            setSelectedCenters={setSelectedCenters}
            centerData={centerData}
            comparisonMode={comparisonMode}
            layout="dropdown"
            centerDataMap={{}}
          />

          {/* 비교 모드 토글 */}
          {selectedCenters.length > 1 && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">
                    {selectedCenters.length}개 센터 선택됨 - 센터별 비교 모드
                  </span>
                </div>
                <Button
                  onClick={() => setComparisonMode(!comparisonMode)}
                  variant={comparisonMode ? 'primary' : 'outline'}
                  size="sm"
                >
                  {comparisonMode ? '📊 비교 모드 활성' : '📊 비교 모드'}
                </Button>
              </div>
            </div>
          )}

          {/* 검색 및 필터 */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="이름 또는 이메일 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setFilterType('all')}
                    variant={filterType === 'all' ? 'primary' : 'outline'}
                    size="md"
                  >
                    전체
                  </Button>
                  <Button
                    onClick={() => setFilterType('high-risk')}
                    variant={filterType === 'high-risk' ? 'danger' : 'outline'}
                    size="md"
                  >
                    고위험군
                  </Button>
                  <Button
                    onClick={() => setFilterType('normal')}
                    variant={filterType === 'normal' ? 'success' : 'outline'}
                    size="md"
                  >
                    정상
                  </Button>
                </div>
              </div>
              
              {/* 컬럼 선택 */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">표시할 컬럼 선택:</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setVisibleColumns({
                        age: true,
                        gender: true,
                        bmi: true,
                        bloodPressure: true,
                        conditions: true,
                        medications: true,
                        emergencyContact: true
                      })}
                      variant="outline"
                      size="sm"
                    >
                      ✅ 전체 선택
                    </Button>
                    <Button
                      onClick={() => setVisibleColumns({
                        age: true,
                        gender: true,
                        bmi: true,
                        bloodPressure: true,
                        conditions: true,
                        medications: false,
                        emergencyContact: false
                      })}
                      variant="outline"
                      size="sm"
                    >
                      🔄 기본값
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: 'age', label: '나이', icon: '👤' },
                    { key: 'gender', label: '성별', icon: '⚥' },
                    { key: 'bmi', label: 'BMI', icon: '⚖️' },
                    { key: 'bloodPressure', label: '혈압', icon: '💗' },
                    { key: 'conditions', label: '질환', icon: '💊' },
                    { key: 'medications', label: '복용약', icon: '💉' },
                    { key: 'emergencyContact', label: '비상연락처', icon: '📞' }
                  ].map(col => (
                    <Button
                      key={col.key}
                      onClick={() => setVisibleColumns(prev => ({ ...prev, [col.key]: !prev[col.key as keyof typeof prev] }))}
                      variant={visibleColumns[col.key as keyof typeof visibleColumns] ? 'primary' : 'ghost'}
                      size="sm"
                    >
                      {col.icon} {col.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 센터별 비교 통계 */}
          {comparisonMode && selectedCenters.length > 1 && (
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">센터별 건강 통계 비교</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedCenters.map(centerName => {
                  const center = centers.find(c => c.name === centerName);
                  const centerId = center?._id.toString();
                  const centerUsers = users.filter(u => u.centerId?.toString() === centerId);
                  const centerUsersWithHealth = centerUsers.filter(u => u.healthProfile).length;
                  const centerHighRisk = centerUsers.filter(u => {
                    if (!u.healthProfile) return false;
                    const bmi = calculateBMI(u.healthProfile.height, u.healthProfile.weight);
                    const bmiStatus = getBMIStatus(bmi);
                    const bpStatus = getBloodPressureStatus(u.healthProfile.bloodPressure?.systolic, u.healthProfile.bloodPressure?.diastolic);
                    return bmiStatus === 'obese' || bpStatus === 'stage2' || (u.healthProfile.chronicConditions && u.healthProfile.chronicConditions.length > 2);
                  }).length;
                  
                  return (
                    <div key={centerName} className="border border-gray-200 rounded-lg p-4 hover:border-blue-400 transition-colors">
                      <h4 className="font-semibold text-blue-600 mb-3">{centerName}</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">전체 회원</span>
                          <span className="font-medium">{centerUsers.length}명</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">건강정보 등록</span>
                          <span className="font-medium text-green-600">{centerUsersWithHealth}명</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">고위험군</span>
                          <span className="font-medium text-red-600">{centerHighRisk}명</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">고위험 비율</span>
                          <span className="font-medium text-orange-600">
                            {centerUsers.length > 0 ? ((centerHighRisk / centerUsers.length) * 100).toFixed(1) : 0}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 회원 목록 */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      회원
                    </th>
                    {selectedCenters.length > 0 && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        센터
                      </th>
                    )}
                    {visibleColumns.age && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        나이
                      </th>
                    )}
                    {visibleColumns.gender && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        성별
                      </th>
                    )}
                    {visibleColumns.bmi && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        BMI
                      </th>
                    )}
                    {visibleColumns.bloodPressure && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        혈압
                      </th>
                    )}
                    {visibleColumns.conditions && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        질환
                      </th>
                    )}
                    {visibleColumns.medications && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        복용약
                      </th>
                    )}
                    {visibleColumns.emergencyContact && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        비상연락처
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상태
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => {
                    const hp = user.healthProfile;
                    const bmi = hp ? calculateBMI(hp.height, hp.weight) : null;
                    const bmiStatus = getBMIStatus(bmi);
                    const bpStatus = getBloodPressureStatus(hp?.bloodPressure?.systolic, hp?.bloodPressure?.diastolic);
                    
                    return (
                      <tr 
                        key={user._id} 
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => {
                          setSelectedUser(user);
                          setShowUserDetailModal(true);
                        }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-xs text-gray-500">{user.email}</div>
                          </div>
                        </td>
                        {selectedCenters.length > 0 && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                              {centers.find(c => c._id.toString() === user.centerId?.toString())?.name || '미지정'}
                            </span>
                          </td>
                        )}
                        {visibleColumns.age && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {hp?.age ? `${hp.age}세` : '-'}
                          </td>
                        )}
                        {visibleColumns.gender && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {hp?.gender === 'male' ? '남성' : hp?.gender === 'female' ? '여성' : '-'}
                          </td>
                        )}
                        {visibleColumns.bmi && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            {bmi ? (
                              <div>
                                <div className="text-sm font-medium">{bmi.toFixed(1)}</div>
                                <div className={`text-xs ${
                                  bmiStatus === 'obese' ? 'text-red-600' :
                                  bmiStatus === 'overweight' ? 'text-yellow-600' :
                                  bmiStatus === 'normal' ? 'text-green-600' : 'text-gray-500'
                                }`}>
                                  {bmiStatus === 'obese' ? '비만' :
                                   bmiStatus === 'overweight' ? '과체중' :
                                   bmiStatus === 'normal' ? '정상' :
                                   bmiStatus === 'underweight' ? '저체중' : '미등록'}
                                </div>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">-</span>
                            )}
                          </td>
                        )}
                        {visibleColumns.bloodPressure && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            {hp?.bloodPressure ? (
                              <div>
                                <div className="text-sm font-medium">
                                  {hp.bloodPressure.systolic}/{hp.bloodPressure.diastolic}
                                </div>
                                <div className={`text-xs ${
                                  bpStatus === 'stage2' ? 'text-red-600' :
                                  bpStatus === 'stage1' ? 'text-orange-600' :
                                  bpStatus === 'elevated' ? 'text-yellow-600' :
                                  bpStatus === 'normal' ? 'text-green-600' : 'text-gray-500'
                                }`}>
                                  {bpStatus === 'stage2' ? '2단계 고혈압' :
                                   bpStatus === 'stage1' ? '1단계 고혈압' :
                                   bpStatus === 'elevated' ? '주의' :
                                   bpStatus === 'normal' ? '정상' : '미등록'}
                                </div>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">-</span>
                            )}
                          </td>
                        )}
                        {visibleColumns.conditions && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {hp?.chronicConditions && hp.chronicConditions.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {hp.chronicConditions.map((condition, idx) => (
                                  <span key={idx} className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded">
                                    {condition}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-400">없음</span>
                            )}
                          </td>
                        )}
                        {visibleColumns.medications && (
                          <td className="px-6 py-4">
                            {hp?.medications && hp.medications.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {hp.medications.map((med, idx) => (
                                  <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                                    {med}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">없음</span>
                            )}
                          </td>
                        )}
                        {visibleColumns.emergencyContact && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            {hp?.emergencyContact ? (
                              <div>
                                <div className="text-sm font-medium">{hp.emergencyContact.name}</div>
                                <div className="text-xs text-gray-500">{hp.emergencyContact.phone}</div>
                                <div className="text-xs text-gray-400">{hp.emergencyContact.relationship}</div>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">-</span>
                            )}
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {(bmiStatus === 'obese' || bpStatus === 'stage2' || 
                            (hp?.chronicConditions && hp.chronicConditions.length > 2)) ? (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
                              고위험
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                              정상
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {filteredUsers.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                검색 결과가 없습니다
              </div>
            )}
          </div>
        </div>
      )}

      {/* 회원 건강 추이 상세 모달 */}
      {showUserDetailModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowUserDetailModal(false)}>
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              {/* 헤더 */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedUser.name}님의 건강 추이</h2>
                  <p className="text-gray-600 mt-1">{selectedUser.email}</p>
                </div>
                <Button onClick={() => setShowUserDetailModal(false)} variant="ghost" size="sm">
                  ✕ 닫기
                </Button>
              </div>

              {/* 현재 건강 정보 */}
              {selectedUser.healthProfile && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <StatCard
                    title="현재 BMI"
                    value={(() => {
                      const bmi = calculateBMI(selectedUser.healthProfile.height, selectedUser.healthProfile.weight);
                      return bmi ? bmi.toFixed(1) : '-';
                    })()}
                    icon="⚖️"
                    color="blue"
                    subtitle={(() => {
                      const bmi = calculateBMI(selectedUser.healthProfile.height, selectedUser.healthProfile.weight);
                      const status = getBMIStatus(bmi);
                      return status === 'obese' ? '비만' :
                             status === 'overweight' ? '과체중' :
                             status === 'normal' ? '정상' :
                             status === 'underweight' ? '저체중' : '미등록';
                    })()}
                  />
                  <StatCard
                    title="현재 혈압"
                    value={selectedUser.healthProfile.bloodPressure 
                      ? `${selectedUser.healthProfile.bloodPressure.systolic}/${selectedUser.healthProfile.bloodPressure.diastolic}`
                      : '-'
                    }
                    icon="💗"
                    color="red"
                    subtitle={(() => {
                      const status = getBloodPressureStatus(
                        selectedUser.healthProfile.bloodPressure?.systolic,
                        selectedUser.healthProfile.bloodPressure?.diastolic
                      );
                      return status === 'stage2' ? '2단계 고혈압' :
                             status === 'stage1' ? '1단계 고혈압' :
                             status === 'elevated' ? '주의' :
                             status === 'normal' ? '정상' : '미등록';
                    })()}
                  />
                  <StatCard
                    title="질환"
                    value={selectedUser.healthProfile.chronicConditions?.length.toString() || '0'}
                    icon="💊"
                    color="orange"
                    subtitle={selectedUser.healthProfile.chronicConditions?.join(', ') || '없음'}
                  />
                </div>
              )}

              {/* 건강 추이 그래프 (Mock 데이터 - 실제로는 API에서 가져와야 함) */}
              <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
                <h3 className="text-lg font-semibold mb-4">📈 BMI 추이 ({periodFilter})</h3>
                <div className="relative h-64">
                  {(() => {
                    const mockBMIHistory = [
                      { date: '2025-07', bmi: 24.5, weight: 70 },
                      { date: '2025-08', bmi: 24.2, weight: 69 },
                      { date: '2025-09', bmi: 23.8, weight: 68 },
                      { date: '2025-10', bmi: 23.5, weight: 67 }
                    ];

                    const maxBMI = Math.max(...mockBMIHistory.map(r => r.bmi)) + 2;
                    const minBMI = Math.min(...mockBMIHistory.map(r => r.bmi)) - 2;
                    const range = maxBMI - minBMI;

                    return (
                      <>
                        {/* Y축 기준선 */}
                        <div className="absolute left-0 top-0 bottom-8 w-full">
                          {[25, 23, 18.5].map(threshold => {
                            const y = ((maxBMI - threshold) / range) * 100;
                            return (
                              <div key={threshold} className="absolute left-0 right-0" style={{ top: `${y}%` }}>
                                <div className="border-t border-dashed border-gray-300"></div>
                                <span className="absolute -left-2 -top-2 text-xs text-gray-500 bg-white px-1">
                                  {threshold}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {/* 꺾은선 그래프 */}
                        <svg className="absolute left-0 top-0 w-full h-full" style={{ paddingBottom: '2rem' }}>
                          <defs>
                            <linearGradient id="bmiGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
                            </linearGradient>
                          </defs>
                          
                          {/* 면적 */}
                          <path
                            d={mockBMIHistory.map((record, idx) => {
                              const x = (idx / (mockBMIHistory.length - 1)) * 100;
                              const y = ((maxBMI - record.bmi) / range) * 100;
                              return `${idx === 0 ? 'M' : 'L'} ${x}% ${y}%`;
                            }).join(' ') + ` L 100% 100% L 0% 100% Z`}
                            fill="url(#bmiGradient)"
                          />
                          
                          {/* 선 */}
                          <path
                            d={mockBMIHistory.map((record, idx) => {
                              const x = (idx / (mockBMIHistory.length - 1)) * 100;
                              const y = ((maxBMI - record.bmi) / range) * 100;
                              return `${idx === 0 ? 'M' : 'L'} ${x}% ${y}%`;
                            }).join(' ')}
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="3"
                            className="animate-draw"
                          />
                          
                          {/* 점 */}
                          {mockBMIHistory.map((record, idx) => {
                            const x = (idx / (mockBMIHistory.length - 1)) * 100;
                            const y = ((maxBMI - record.bmi) / range) * 100;
                            return (
                              <g key={idx}>
                                <circle
                                  cx={`${x}%`}
                                  cy={`${y}%`}
                                  r="6"
                                  fill="#3b82f6"
                                  className="hover:r-8 transition-all"
                                />
                                <text
                                  x={`${x}%`}
                                  y={`${y - 3}%`}
                                  textAnchor="middle"
                                  className="text-xs font-semibold fill-blue-600"
                                  style={{ transform: 'translateY(-10px)' }}
                                >
                                  {record.bmi}
                                </text>
                              </g>
                            );
                          })}
                        </svg>

                        {/* X축 레이블 */}
                        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2">
                          {mockBMIHistory.map((record, idx) => (
                            <div key={idx} className="text-xs text-gray-600">
                              {record.date}
                            </div>
                          ))}
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* 혈압 추이 그래프 */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold mb-4">💗 혈압 추이 ({periodFilter})</h3>
                <div className="relative h-64">
                  {(() => {
                    const mockBPHistory = [
                      { date: '2025-07', systolic: 125, diastolic: 82 },
                      { date: '2025-08', systolic: 122, diastolic: 80 },
                      { date: '2025-09', systolic: 120, diastolic: 79 },
                      { date: '2025-10', systolic: 118, diastolic: 78 }
                    ];

                    const maxBP = 150;
                    const minBP = 60;
                    const range = maxBP - minBP;

                    return (
                      <>
                        {/* Y축 기준선 */}
                        <div className="absolute left-0 top-0 bottom-8 w-full">
                          {[140, 130, 120, 90, 80].map(threshold => {
                            const y = ((maxBP - threshold) / range) * 100;
                            return (
                              <div key={threshold} className="absolute left-0 right-0" style={{ top: `${y}%` }}>
                                <div className={`border-t ${threshold === 120 || threshold === 80 ? 'border-green-300' : 'border-dashed border-gray-300'}`}></div>
                                <span className="absolute -left-2 -top-2 text-xs text-gray-500 bg-white px-1">
                                  {threshold}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {/* 꺾은선 그래프 (수축기) */}
                        <svg className="absolute left-0 top-0 w-full h-full" style={{ paddingBottom: '2rem' }}>
                          <defs>
                            <linearGradient id="bpSystolicGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
                              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.05" />
                            </linearGradient>
                          </defs>
                          
                          {/* 수축기 혈압 선 */}
                          <path
                            d={mockBPHistory.map((record, idx) => {
                              const x = (idx / (mockBPHistory.length - 1)) * 100;
                              const y = ((maxBP - record.systolic) / range) * 100;
                              return `${idx === 0 ? 'M' : 'L'} ${x}% ${y}%`;
                            }).join(' ')}
                            fill="none"
                            stroke="#ef4444"
                            strokeWidth="3"
                          />
                          
                          {/* 수축기 점 */}
                          {mockBPHistory.map((record, idx) => {
                            const x = (idx / (mockBPHistory.length - 1)) * 100;
                            const y = ((maxBP - record.systolic) / range) * 100;
                            return (
                              <g key={`sys-${idx}`}>
                                <circle cx={`${x}%`} cy={`${y}%`} r="6" fill="#ef4444" />
                                <text
                                  x={`${x}%`}
                                  y={`${y - 3}%`}
                                  textAnchor="middle"
                                  className="text-xs font-semibold fill-red-600"
                                  style={{ transform: 'translateY(-10px)' }}
                                >
                                  {record.systolic}
                                </text>
                              </g>
                            );
                          })}
                          
                          {/* 이완기 혈압 선 */}
                          <path
                            d={mockBPHistory.map((record, idx) => {
                              const x = (idx / (mockBPHistory.length - 1)) * 100;
                              const y = ((maxBP - record.diastolic) / range) * 100;
                              return `${idx === 0 ? 'M' : 'L'} ${x}% ${y}%`;
                            }).join(' ')}
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="3"
                            strokeDasharray="5,5"
                          />
                          
                          {/* 이완기 점 */}
                          {mockBPHistory.map((record, idx) => {
                            const x = (idx / (mockBPHistory.length - 1)) * 100;
                            const y = ((maxBP - record.diastolic) / range) * 100;
                            return (
                              <g key={`dia-${idx}`}>
                                <circle cx={`${x}%`} cy={`${y}%`} r="5" fill="#3b82f6" />
                                <text
                                  x={`${x}%`}
                                  y={`${y + 3}%`}
                                  textAnchor="middle"
                                  className="text-xs font-semibold fill-blue-600"
                                  style={{ transform: 'translateY(15px)' }}
                                >
                                  {record.diastolic}
                                </text>
                              </g>
                            );
                          })}
                        </svg>

                        {/* X축 레이블 */}
                        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2">
                          {mockBPHistory.map((record, idx) => (
                            <div key={idx} className="text-xs text-gray-600">
                              {record.date}
                            </div>
                          ))}
                        </div>

                        {/* 범례 */}
                        <div className="absolute top-0 right-0 flex gap-4 text-xs">
                          <div className="flex items-center gap-1">
                            <div className="w-4 h-0.5 bg-red-500"></div>
                            <span>수축기</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-4 h-0.5 bg-blue-500 border-dashed"></div>
                            <span>이완기</span>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

