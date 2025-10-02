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
import { useAuth } from '../../../../hooks/useAuth';
import apiClient from '../../../../utils/api';
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
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'statistics' | 'members'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'high-risk' | 'normal'>('all');

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
    
    console.log('✅ 권한 체크 통과 - loadUsers 호출');
    loadUsers();
  }, [user, authLoading]);

  const loadUsers = async () => {
    console.log('📡 loadUsers 함수 실행 시작');
    try {
      setLoading(true);
      console.log('🔗 API 호출: /api/users');
      const response = await apiClient.get('/api/users');
      console.log('📊 API 응답:', response);
      
      // apiClient.get()은 이미 response.data를 반환함
      if (response) {
        const users = response.users || response;
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
    } catch (error: any) {
      console.error('회원 데이터 로드 오류:', error);
      
      // 토큰 만료 시 재로그인
      if (error?.response?.status === 401 || error?.code === 'TOKEN_EXPIRED') {
        alert('세션이 만료되었습니다. 다시 로그인해주세요.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }
      
      setUsers([]);
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
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
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
  }, [users, searchTerm, filterType]);

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
          <button
            onClick={loadUsers}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            새로고침
          </button>
        </div>
      </div>

      {/* 탭 메뉴 */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'dashboard', name: '대시보드', icon: BarChart3 },
              { id: 'statistics', name: '상세 통계', icon: PieChart },
              { id: 'members', name: '회원 목록', icon: Users },
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
                <tab.icon className="h-4 w-4" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* 대시보드 탭 */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* 주요 지표 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-600">전체 회원</div>
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{statistics.totalUsers}</div>
              <div className="text-xs text-gray-500 mt-1">
                건강정보: {statistics.usersWithHealth}명
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-600">고위험군</div>
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <div className="text-3xl font-bold text-red-600">{statistics.highRiskUsers}</div>
              <div className="text-xs text-gray-500 mt-1">
                전체의 {((statistics.highRiskUsers / statistics.totalUsers) * 100).toFixed(1)}%
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-600">질환 보유자</div>
                <Heart className="h-5 w-5 text-orange-500" />
              </div>
              <div className="text-3xl font-bold text-orange-600">{statistics.usersWithConditions}</div>
              <div className="text-xs text-gray-500 mt-1">
                평균 {(Object.values(statistics.conditionCounts).reduce((a, b) => a + b, 0) / statistics.usersWithConditions || 0).toFixed(1)}개/인
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-600">정상 범위</div>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div className="text-3xl font-bold text-green-600">
                {statistics.totalUsers - statistics.highRiskUsers}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                전체의 {(((statistics.totalUsers - statistics.highRiskUsers) / statistics.totalUsers) * 100).toFixed(1)}%
              </div>
            </div>
          </div>

          {/* BMI 분포 */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              BMI 분포
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

      {/* 상세 통계 탭 */}
      {activeTab === 'statistics' && (
        <div className="space-y-6">
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
          {/* 검색 및 필터 */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
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
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-4 py-2 rounded-lg ${
                    filterType === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  전체
                </button>
                <button
                  onClick={() => setFilterType('high-risk')}
                  className={`px-4 py-2 rounded-lg ${
                    filterType === 'high-risk'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  고위험군
                </button>
                <button
                  onClick={() => setFilterType('normal')}
                  className={`px-4 py-2 rounded-lg ${
                    filterType === 'normal'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  정상
                </button>
              </div>
            </div>
          </div>

          {/* 회원 목록 */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      회원
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      나이/성별
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      BMI
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      혈압
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      질환
                    </th>
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
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-xs text-gray-500">{user.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {hp?.age || '-'}세 / {hp?.gender || '-'}
                        </td>
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {hp?.chronicConditions && hp.chronicConditions.length > 0 ? (
                            <div className="text-gray-900">
                              {hp.chronicConditions.length}개
                            </div>
                          ) : (
                            <span className="text-gray-400">없음</span>
                          )}
                        </td>
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
    </div>
  );
}

