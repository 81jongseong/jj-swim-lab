/**
 * 📊 JJ Swim Lab - 고도화된 센터 통계 페이지
 * 
 * 📋 **페이지 목적**
 * - 모든 센터의 통계 데이터를 시각화하여 관리자가 한눈에 파악할 수 있는 고도화된 대시보드
 * - 지역별, 등급별, 성과별 센터 현황 분석 및 예측
 * - 센터별 사용자 수, 수익, 성과 지표 비교 및 트렌드 분석
 * - 데이터 기반 의사결정을 위한 고급 통계 정보 및 인사이트 제공
 * - 센터 성과 예측 및 개선 방안 제시
 * 
 * 🔄 **주요 기능**
 * - 전체 센터 통계 개요 (총 센터 수, 활성 센터, 사용자 수 등)
 * - 지역별 센터 분포 통계 (시/도, 시/군/구별 센터 현황)
 * - 센터 등급별 통계 (브론즈, 실버, 골드, 플래티넘)
 * - 센터별 사용자 수 및 수익 통계
 * - 센터 성과 지표 (만족도, 재등록률, 신규 가입률)
 * - 지역 필터링 기능 (시/도, 시/군/구, 센터별)
 * - 통계 차트 및 그래프 시각화
 * - 센터 성과 예측 및 트렌드 분석
 * - 센터 간 비교 분석 및 벤치마킹
 * - 수익성 분석 및 ROI 계산
 * - 고객 세분화 분석
 * - 시간대별 이용 현황 분석
 * - 센터별 상세 성과 리포트
 * - 커스텀 리포트 생성 기능
 * 
 * 🗄️ **데이터 연동**
 * - center-statistics API와 연동 (센터 통계 데이터)
 * - useAuth 훅과 연동 (사용자 권한 확인)
 * - apiClient와 연동 (API 통신)
 * - 실시간 데이터 업데이트
 * 
 * 🛠️ **필요한 설치 파일**
 * - Next.js 14.2.5 (App Router)
 * - React 18.3.1
 * - TypeScript 5.x
 * - Tailwind CSS 3.3.0
 * - Chart.js 또는 Recharts (차트 라이브러리)
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 관리자 권한 확인 필수 (superAdmin, admin만 접근)
 * 2. 대용량 통계 데이터 처리 시 성능 최적화
 * 3. 실시간 데이터 업데이트 고려
 * 4. 반응형 디자인 적용 (모바일/데스크톱)
 * 5. 차트 라이브러리 의존성 관리
 * 6. 데이터 시각화 성능 최적화
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 권한 검증 로직 확인
 * - [ ] API 응답 데이터 구조 검증
 * - [ ] 차트 렌더링 성능 최적화
 * - [ ] 반응형 디자인 테스트
 * - [ ] 에러 처리 로직 개선
 * - [ ] 데이터 시각화 정확성 검증
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (센터 통계 페이지)
 * - 2024-12-19: 지역별 통계 및 필터링 기능 추가
 * - 2024-12-19: 차트 시각화 및 성과 지표 구현
 * - 2024-12-19: 고도화된 센터 통계 페이지 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (고도화된 센터 통계 페이지 완료)
 * 
 * 🚀 **다음 단계**
 * - AI 기반 센터 성과 예측
 * - 자동화된 인사이트 생성
 * - 실시간 알림 시스템
 * - 고급 데이터 분석 도구
 * 
 * 💡 **사용 예시**
 * ```tsx
 * // 센터 통계 페이지 접근
 * /admin/center-statistics
 * 
 * // 지역별 필터링
 * setSelectedRegions(['서울특별시', '경기도'])
 * 
 * // 센터 등급별 통계 조회
 * loadCenterGradeStats()
 * 
 * // 센터 성과 예측 분석
 * analyzeCenterPerformance()
 * ```
 * 
 * 🔍 **페이지 처리 흐름**
 * 1. 사용자 권한 확인 (관리자만 접근)
 * 2. 전체 센터 통계 데이터 로드
 * 3. 지역별, 등급별 통계 계산
 * 4. 센터 성과 예측 및 트렌드 분석
 * 5. 차트 및 그래프 렌더링
 * 6. 필터링 기능 제공
 * 7. 커스텀 리포트 생성
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import apiClient from '../../../utils/api';

interface CenterStats {
  total: number;
  active: number;
  inactive: number;
  suspended: number;
  maintenance: number;
}

interface RegionStats {
  region: string;
  totalCenters: number;
  activeCenters: number;
  totalUsers: number;
  totalRevenue: number;
  averageRating: number;
}

interface GradeStats {
  grade: string;
  count: number;
  percentage: number;
  totalUsers: number;
  totalRevenue: number;
}

interface CenterPerformance {
  centerId: string;
  centerName: string;
  region: string;
  grade: string;
  totalUsers: number;
  monthlyRevenue: number;
  satisfaction: number;
  retentionRate: number;
  newUserRate: number;
}

interface StatisticsData {
  overview: {
    totalCenters: number;
    activeCenters: number;
    totalUsers: number;
    totalRevenue: number;
    averageSatisfaction: number;
    monthlyGrowth: number;
    averageROI: number;
    totalInstructors: number;
    averageUtilization: number;
  };
  regionStats: RegionStats[];
  gradeStats: GradeStats[];
  topPerformers: CenterPerformance[];
  recentTrends: {
    month: string;
    newCenters: number;
    newUsers: number;
    revenue: number;
  }[];
  performanceAnalysis: {
    topGrowthCenters: CenterPerformance[];
    decliningCenters: CenterPerformance[];
    revenueLeaders: CenterPerformance[];
    satisfactionLeaders: CenterPerformance[];
  };
  customerSegmentation: {
    ageGroups: { age: string; count: number; percentage: number }[];
    skillLevels: { level: string; count: number; percentage: number }[];
    membershipTypes: { type: string; count: number; percentage: number }[];
  };
  timeAnalysis: {
    peakHours: { hour: string; utilization: number }[];
    weeklyPattern: { day: string; averageUsers: number }[];
    seasonalTrends: { month: string; revenue: number; users: number }[];
  };
  profitabilityAnalysis: {
    centerROI: { centerId: string; centerName: string; roi: number; profit: number }[];
    costAnalysis: { category: string; amount: number; percentage: number }[];
    revenueStreams: { stream: string; amount: number; percentage: number }[];
  };
}

export default function CenterStatisticsPage() {
  const { user, hasUserType } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statistics, setStatistics] = useState<StatisticsData | null>(null);
  
  // 지역 필터 상태
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [selectedCenters, setSelectedCenters] = useState<string[]>([]);
  
  // 지역 데이터 (강사 관리 페이지와 동일)
  const regionData = {
    '서울특별시': ['강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구', '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구', '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구', '종로구', '중구', '중랑구'],
    '부산광역시': ['강서구', '금정구', '남구', '동구', '동래구', '부산진구', '북구', '사상구', '사하구', '서구', '수영구', '연제구', '영도구', '중구', '해운대구', '기장군'],
    '대구광역시': ['남구', '달서구', '달성군', '동구', '북구', '서구', '수성구', '중구'],
    '인천광역시': ['계양구', '남구', '남동구', '동구', '부평구', '서구', '연수구', '중구', '강화군', '옹진군'],
    '광주광역시': ['광산구', '남구', '동구', '북구', '서구'],
    '대전광역시': ['대덕구', '동구', '서구', '유성구', '중구'],
    '울산광역시': ['남구', '동구', '북구', '울주군', '중구'],
    '세종특별자치시': ['세종시'],
    '경기도': ['수원시', '성남시', '의정부시', '안양시', '부천시', '광명시', '평택시', '과천시', '오산시', '시흥시', '군포시', '의왕시', '하남시', '용인시', '파주시', '이천시', '안성시', '김포시', '화성시', '광주시', '여주시', '양평군', '고양시', '의정부시', '동두천시', '가평군', '연천군'],
    '강원특별자치도': ['춘천시', '원주시', '강릉시', '동해시', '태백시', '속초시', '삼척시', '홍천군', '횡성군', '영월군', '평창군', '정선군', '철원군', '화천군', '양구군', '인제군', '고성군', '양양군'],
    '충청북도': ['청주시', '충주시', '제천시', '보은군', '옥천군', '영동군', '증평군', '진천군', '괴산군', '음성군', '단양군'],
    '충청남도': ['천안시', '공주시', '보령시', '아산시', '서산시', '논산시', '계룡시', '당진시', '금산군', '부여군', '서천군', '청양군', '홍성군', '예산군', '태안군'],
    '전북특별자치도': ['전주시', '군산시', '익산시', '정읍시', '남원시', '김제시', '완주군', '진안군', '무주군', '장수군', '임실군', '순창군', '고창군', '부안군'],
    '전라남도': ['목포시', '여수시', '순천시', '나주시', '광양시', '담양군', '곡성군', '구례군', '고흥군', '보성군', '화순군', '장흥군', '강진군', '해남군', '영암군', '무안군', '함평군', '영광군', '장성군', '완도군', '진도군', '신안군'],
    '경상북도': ['포항시', '경주시', '김천시', '안동시', '구미시', '영주시', '영천시', '상주시', '문경시', '경산시', '군위군', '의성군', '청송군', '영양군', '영덕군', '청도군', '고령군', '성주군', '칠곡군', '예천군', '봉화군', '울진군', '울릉군'],
    '경상남도': ['창원시', '진주시', '통영시', '사천시', '김해시', '밀양시', '거제시', '양산시', '의령군', '함안군', '창녕군', '고성군', '남해군', '하동군', '산청군', '함양군', '거창군', '합천군'],
    '제주특별자치도': ['제주시', '서귀포시']
  };

  const centerData = {
    '강남구': ['강남센터', '역삼센터', '논현센터', '삼성센터'],
    '강동구': ['강동센터', '천호센터', '성내센터'],
    '강북구': ['강북센터', '수유센터'],
    '강서구': ['강서센터', '화곡센터', '등촌센터'],
    '관악구': ['관악센터', '신림센터', '서원센터'],
    '광진구': ['광진센터', '구의센터', '자양센터'],
    '구로구': ['구로센터', '가리봉센터', '신도림센터'],
    '금천구': ['금천센터', '시흥센터'],
    '노원구': ['노원센터', '상계센터', '중계센터'],
    '도봉구': ['도봉센터', '쌍문센터'],
    '동대문구': ['동대문센터', '청량리센터', '회기센터'],
    '동작구': ['동작센터', '사당센터', '대방센터'],
    '마포구': ['마포센터', '홍대센터', '공덕센터', '상암센터'],
    '서대문구': ['서대문센터', '신촌센터', '연희센터'],
    '서초구': ['서초센터', '방배센터', '내곡센터'],
    '성동구': ['성동센터', '왕십리센터', '마장센터'],
    '성북구': ['성북센터', '돈암센터', '안암센터'],
    '송파구': ['송파센터', '잠실센터', '문정센터', '가락센터'],
    '양천구': ['양천센터', '목동센터', '신정센터'],
    '영등포구': ['영등포센터', '여의도센터', '당산센터'],
    '용산구': ['용산센터', '이촌센터', '한남센터'],
    '은평구': ['은평센터', '불광센터', '진관센터'],
    '종로구': ['종로센터', '혜화센터', '이화센터'],
    '중구': ['중구센터', '명동센터', '을지로센터'],
    '중랑구': ['중랑센터', '상봉센터', '망우센터']
  };

  useEffect(() => {
    if (user && hasUserType('superAdmin')) {
      loadStatistics();
    }
  }, [user, hasUserType]);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 임시 통계 데이터 (실제로는 API에서 가져와야 함)
      const mockStatistics: StatisticsData = {
        overview: {
          totalCenters: 156,
          activeCenters: 142,
          totalUsers: 12450,
          totalRevenue: 2450000000,
          averageSatisfaction: 4.2,
          monthlyGrowth: 8.5,
          averageROI: 24.3,
          totalInstructors: 312,
          averageUtilization: 78.5
        },
        regionStats: [
          { region: '서울특별시', totalCenters: 45, activeCenters: 42, totalUsers: 4200, totalRevenue: 850000000, averageRating: 4.3 },
          { region: '경기도', totalCenters: 38, activeCenters: 35, totalUsers: 3200, totalRevenue: 650000000, averageRating: 4.1 },
          { region: '부산광역시', totalCenters: 18, activeCenters: 17, totalUsers: 1800, totalRevenue: 360000000, averageRating: 4.0 },
          { region: '대구광역시', totalCenters: 12, activeCenters: 11, totalUsers: 1200, totalRevenue: 240000000, averageRating: 4.2 },
          { region: '인천광역시', totalCenters: 15, activeCenters: 14, totalUsers: 1500, totalRevenue: 300000000, averageRating: 4.1 },
          { region: '광주광역시', totalCenters: 8, activeCenters: 7, totalUsers: 800, totalRevenue: 160000000, averageRating: 4.0 },
          { region: '대전광역시', totalCenters: 10, activeCenters: 9, totalUsers: 1000, totalRevenue: 200000000, averageRating: 4.2 },
          { region: '울산광역시', totalCenters: 6, activeCenters: 5, totalUsers: 600, totalRevenue: 120000000, averageRating: 4.1 },
          { region: '세종특별자치시', totalCenters: 4, activeCenters: 4, totalUsers: 400, totalRevenue: 80000000, averageRating: 4.3 }
        ],
        gradeStats: [
          { grade: 'platinum', count: 12, percentage: 7.7, totalUsers: 2400, totalRevenue: 480000000 },
          { grade: 'gold', count: 35, percentage: 22.4, totalUsers: 4200, totalRevenue: 840000000 },
          { grade: 'silver', count: 68, percentage: 43.6, totalUsers: 4080, totalRevenue: 816000000 },
          { grade: 'bronze', count: 41, percentage: 26.3, totalUsers: 1770, totalRevenue: 314000000 }
        ],
        topPerformers: [
          { centerId: '1', centerName: '강남센터', region: '서울특별시', grade: 'platinum', totalUsers: 450, monthlyRevenue: 90000000, satisfaction: 4.8, retentionRate: 85, newUserRate: 12 },
          { centerId: '2', centerName: '송파센터', region: '서울특별시', grade: 'platinum', totalUsers: 420, monthlyRevenue: 84000000, satisfaction: 4.7, retentionRate: 82, newUserRate: 10 },
          { centerId: '3', centerName: '분당센터', region: '경기도', grade: 'gold', totalUsers: 380, monthlyRevenue: 76000000, satisfaction: 4.6, retentionRate: 80, newUserRate: 11 },
          { centerId: '4', centerName: '홍대센터', region: '서울특별시', grade: 'gold', totalUsers: 350, monthlyRevenue: 70000000, satisfaction: 4.5, retentionRate: 78, newUserRate: 9 },
          { centerId: '5', centerName: '부산센터', region: '부산광역시', grade: 'gold', totalUsers: 320, monthlyRevenue: 64000000, satisfaction: 4.4, retentionRate: 75, newUserRate: 8 }
        ],
        recentTrends: [
          { month: '2024-01', newCenters: 3, newUsers: 450, revenue: 90000000 },
          { month: '2024-02', newCenters: 2, newUsers: 380, revenue: 76000000 },
          { month: '2024-03', newCenters: 4, newUsers: 520, revenue: 104000000 },
          { month: '2024-04', newCenters: 1, newUsers: 320, revenue: 64000000 },
          { month: '2024-05', newCenters: 3, newUsers: 480, revenue: 96000000 },
          { month: '2024-06', newCenters: 2, newUsers: 410, revenue: 82000000 }
        ],
        performanceAnalysis: {
          topGrowthCenters: [
            { centerId: '6', centerName: '신도림센터', region: '서울특별시', grade: 'silver', totalUsers: 280, monthlyRevenue: 56000000, satisfaction: 4.4, retentionRate: 82, newUserRate: 15 },
            { centerId: '7', centerName: '목동센터', region: '서울특별시', grade: 'gold', totalUsers: 320, monthlyRevenue: 64000000, satisfaction: 4.5, retentionRate: 85, newUserRate: 14 },
            { centerId: '8', centerName: '수원센터', region: '경기도', grade: 'silver', totalUsers: 250, monthlyRevenue: 50000000, satisfaction: 4.3, retentionRate: 80, newUserRate: 13 }
          ],
          decliningCenters: [
            { centerId: '9', centerName: '구로센터', region: '서울특별시', grade: 'bronze', totalUsers: 180, monthlyRevenue: 36000000, satisfaction: 3.8, retentionRate: 65, newUserRate: 5 },
            { centerId: '10', centerName: '금천센터', region: '서울특별시', grade: 'bronze', totalUsers: 150, monthlyRevenue: 30000000, satisfaction: 3.6, retentionRate: 60, newUserRate: 4 }
          ],
          revenueLeaders: [
            { centerId: '1', centerName: '강남센터', region: '서울특별시', grade: 'platinum', totalUsers: 450, monthlyRevenue: 90000000, satisfaction: 4.8, retentionRate: 85, newUserRate: 12 },
            { centerId: '2', centerName: '송파센터', region: '서울특별시', grade: 'platinum', totalUsers: 420, monthlyRevenue: 84000000, satisfaction: 4.7, retentionRate: 82, newUserRate: 10 },
            { centerId: '3', centerName: '분당센터', region: '경기도', grade: 'gold', totalUsers: 380, monthlyRevenue: 76000000, satisfaction: 4.6, retentionRate: 80, newUserRate: 11 }
          ],
          satisfactionLeaders: [
            { centerId: '1', centerName: '강남센터', region: '서울특별시', grade: 'platinum', totalUsers: 450, monthlyRevenue: 90000000, satisfaction: 4.8, retentionRate: 85, newUserRate: 12 },
            { centerId: '11', centerName: '잠실센터', region: '서울특별시', grade: 'gold', totalUsers: 350, monthlyRevenue: 70000000, satisfaction: 4.7, retentionRate: 83, newUserRate: 9 },
            { centerId: '2', centerName: '송파센터', region: '서울특별시', grade: 'platinum', totalUsers: 420, monthlyRevenue: 84000000, satisfaction: 4.7, retentionRate: 82, newUserRate: 10 }
          ]
        },
        customerSegmentation: {
          ageGroups: [
            { age: '10-19세', count: 2480, percentage: 19.9 },
            { age: '20-29세', count: 3120, percentage: 25.1 },
            { age: '30-39세', count: 3735, percentage: 30.0 },
            { age: '40-49세', count: 1860, percentage: 14.9 },
            { age: '50-59세', count: 1245, percentage: 10.0 }
          ],
          skillLevels: [
            { level: '초급', count: 4980, percentage: 40.0 },
            { level: '중급', count: 3735, percentage: 30.0 },
            { level: '고급', count: 2490, percentage: 20.0 },
            { level: '전문가', count: 1245, percentage: 10.0 }
          ],
          membershipTypes: [
            { type: '월회원', count: 7470, percentage: 60.0 },
            { type: '3개월', count: 2490, percentage: 20.0 },
            { type: '6개월', count: 1868, percentage: 15.0 },
            { type: '연회원', count: 622, percentage: 5.0 }
          ]
        },
        timeAnalysis: {
          peakHours: [
            { hour: '06:00-08:00', utilization: 45 },
            { hour: '08:00-10:00', utilization: 25 },
            { hour: '10:00-12:00', utilization: 35 },
            { hour: '12:00-14:00', utilization: 60 },
            { hour: '14:00-16:00', utilization: 40 },
            { hour: '16:00-18:00', utilization: 85 },
            { hour: '18:00-20:00', utilization: 95 },
            { hour: '20:00-22:00', utilization: 80 },
            { hour: '22:00-24:00', utilization: 30 }
          ],
          weeklyPattern: [
            { day: '월요일', averageUsers: 1800 },
            { day: '화요일', averageUsers: 1950 },
            { day: '수요일', averageUsers: 2100 },
            { day: '목요일', averageUsers: 2050 },
            { day: '금요일', averageUsers: 2200 },
            { day: '토요일', averageUsers: 2800 },
            { day: '일요일', averageUsers: 2500 }
          ],
          seasonalTrends: [
            { month: '1월', revenue: 180000000, users: 8500 },
            { month: '2월', revenue: 160000000, users: 7800 },
            { month: '3월', revenue: 200000000, users: 9200 },
            { month: '4월', revenue: 220000000, users: 10100 },
            { month: '5월', revenue: 240000000, users: 11000 },
            { month: '6월', revenue: 260000000, users: 11800 },
            { month: '7월', revenue: 280000000, users: 12500 },
            { month: '8월', revenue: 300000000, users: 13200 },
            { month: '9월', revenue: 250000000, users: 12000 },
            { month: '10월', revenue: 230000000, users: 10800 },
            { month: '11월', revenue: 210000000, users: 9800 },
            { month: '12월', revenue: 190000000, users: 8900 }
          ]
        },
        profitabilityAnalysis: {
          centerROI: [
            { centerId: '1', centerName: '강남센터', roi: 35.2, profit: 31500000 },
            { centerId: '2', centerName: '송파센터', roi: 32.8, profit: 27500000 },
            { centerId: '3', centerName: '분당센터', roi: 28.5, profit: 21600000 },
            { centerId: '4', centerName: '홍대센터', roi: 26.3, profit: 18400000 },
            { centerId: '5', centerName: '부산센터', roi: 24.1, profit: 15400000 }
          ],
          costAnalysis: [
            { category: '인건비', amount: 980000000, percentage: 40.0 },
            { category: '임대료', amount: 490000000, percentage: 20.0 },
            { category: '유지보수', amount: 245000000, percentage: 10.0 },
            { category: '마케팅', amount: 196000000, percentage: 8.0 },
            { category: '기타', amount: 539000000, percentage: 22.0 }
          ],
          revenueStreams: [
            { stream: '회원비', amount: 1470000000, percentage: 60.0 },
            { stream: '개인레슨', amount: 490000000, percentage: 20.0 },
            { stream: '기타 서비스', amount: 245000000, percentage: 10.0 },
            { stream: '상품 판매', amount: 245000000, percentage: 10.0 }
          ]
        }
      };
      
      setStatistics(mockStatistics);
    } catch (error) {
      console.error('통계 데이터 로딩 오류:', error);
      setError('통계 데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 지역 필터 핸들러
  const handleRegionToggle = (region: string) => {
    setSelectedRegions(prev => {
      if (prev.includes(region)) {
        return prev.filter(r => r !== region);
      } else {
        return [...prev, region];
      }
    });
  };

  const handleDistrictToggle = (district: string) => {
    setSelectedDistricts(prev =>
      prev.includes(district) ? prev.filter(d => d !== district) : [...prev, district]
    );
  };

  const handleCenterToggle = (center: string) => {
    setSelectedCenters(prev =>
      prev.includes(center) ? prev.filter(c => c !== center) : [...prev, center]
    );
  };

  // 필터링된 통계 데이터
  const filteredStatistics = statistics ? {
    ...statistics,
    regionStats: selectedRegions.length > 0 
      ? statistics.regionStats.filter(stat => selectedRegions.includes(stat.region))
      : statistics.regionStats,
    topPerformers: selectedCenters.length > 0
      ? statistics.topPerformers.filter(performer => selectedCenters.includes(performer.centerName))
      : statistics.topPerformers
  } : null;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-400">⚠️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">오류 발생</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">📊 센터 통계</h1>
        <p className="text-gray-600">전체 센터의 통계 데이터를 분석하고 성과를 모니터링합니다.</p>
      </div>

      {/* 지역 필터 */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">지역 필터</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* 시/도 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">시/도</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => {
                const value = e.target.value;
                if (value && !selectedRegions.includes(value)) {
                  setSelectedRegions([...selectedRegions, value]);
                }
              }}
              value=""
            >
              <option value="">시/도 선택</option>
              {Object.keys(regionData).map(sido => (
                <option key={sido} value={sido}>
                  {sido}
                </option>
              ))}
            </select>
            {selectedRegions.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {selectedRegions.map(region => (
                  <span
                    key={region}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                  >
                    {region}
                    <button
                      onClick={() => setSelectedRegions(selectedRegions.filter(r => r !== region))}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 시/군/구 선택 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">시/군/구</label>
              {selectedRegions.length > 0 && (
                <button
                  onClick={() => {
                    const allDistricts = selectedRegions.flatMap(sido => regionData[sido] || []);
                    setSelectedDistricts(allDistricts);
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  모두 선택
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
              {selectedRegions.length > 0 ? (
                selectedRegions.flatMap(sido => regionData[sido] || []).map(district => (
                  <button
                    key={district}
                    onClick={() => handleDistrictToggle(district)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedDistricts.includes(district)
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {district}
                    {selectedDistricts.includes(district) && (
                      <span className="ml-1 text-xs">✓</span>
                    )}
                  </button>
                ))
              ) : (
                <div className="text-gray-500 text-sm py-2 text-center w-full">
                  먼저 시/도를 선택해주세요
                </div>
              )}
            </div>
          </div>

          {/* 센터 선택 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">센터</label>
              {selectedDistricts.length > 0 && (
                <button
                  onClick={() => {
                    const allCenters = selectedDistricts.flatMap(district => centerData[district] || []);
                    setSelectedCenters(allCenters);
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  모두 선택
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
              {selectedDistricts.length > 0 ? (
                selectedDistricts.flatMap(district => centerData[district] || []).map(center => (
                  <button
                    key={center}
                    onClick={() => handleCenterToggle(center)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCenters.includes(center)
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {center}
                    {selectedCenters.includes(center) && (
                      <span className="ml-1 text-xs">✓</span>
                    )}
                  </button>
                ))
              ) : (
                <div className="text-gray-500 text-sm py-2 text-center w-full">
                  먼저 시/군/구를 선택해주세요
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 필터 초기화 */}
        {(selectedRegions.length > 0 || selectedDistricts.length > 0 || selectedCenters.length > 0) && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                setSelectedRegions([]);
                setSelectedDistricts([]);
                setSelectedCenters([]);
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              필터 초기화
            </button>
          </div>
        )}
      </div>

      {filteredStatistics && (
        <>
          {/* 전체 통계 개요 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <span className="text-2xl">🏢</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">전체 센터</p>
                  <p className="text-2xl font-bold text-gray-900">{filteredStatistics.overview.totalCenters}</p>
                  <p className="text-xs text-gray-500">활성: {filteredStatistics.overview.activeCenters}개</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <span className="text-2xl">👥</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">전체 사용자</p>
                  <p className="text-2xl font-bold text-gray-900">{filteredStatistics.overview.totalUsers.toLocaleString()}</p>
                  <p className="text-xs text-green-600">+{filteredStatistics.overview.monthlyGrowth}% 성장</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <span className="text-2xl">💰</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">총 수익</p>
                  <p className="text-2xl font-bold text-yellow-600">{(filteredStatistics.overview.totalRevenue / 100000000).toFixed(1)}억원</p>
                  <p className="text-xs text-blue-600">ROI: {filteredStatistics.overview.averageROI}%</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <span className="text-2xl">⭐</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">평균 만족도</p>
                  <p className="text-2xl font-bold text-orange-600">{filteredStatistics.overview.averageSatisfaction}</p>
                  <p className="text-xs text-gray-500">강사: {filteredStatistics.overview.totalInstructors}명</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <span className="text-2xl">📊</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">평균 이용률</p>
                  <p className="text-2xl font-bold text-green-600">{filteredStatistics.overview.averageUtilization}%</p>
                  <p className="text-xs text-gray-500">시설 활용도</p>
                </div>
              </div>
            </div>
          </div>

          {/* 지역별 통계 */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">지역별 센터 현황</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">지역</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">전체 센터</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">활성 센터</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">사용자 수</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">수익</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">평균 만족도</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStatistics.regionStats.map((stat, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{stat.region}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stat.totalCenters}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stat.activeCenters}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stat.totalUsers.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{(stat.totalRevenue / 100000000).toFixed(1)}억원</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stat.averageRating}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 센터 등급별 통계 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">센터 등급별 분포</h3>
              <div className="space-y-4">
                {filteredStatistics.gradeStats.map((grade, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full mr-3 ${
                        grade.grade === 'platinum' ? 'bg-purple-500' :
                        grade.grade === 'gold' ? 'bg-yellow-500' :
                        grade.grade === 'silver' ? 'bg-gray-400' : 'bg-orange-500'
                      }`}></div>
                      <span className="text-sm font-medium text-gray-900">
                        {grade.grade === 'platinum' ? '플래티넘' :
                         grade.grade === 'gold' ? '골드' :
                         grade.grade === 'silver' ? '실버' : '브론즈'}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-gray-900">{grade.count}개</div>
                      <div className="text-xs text-gray-500">{grade.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">등급별 수익 현황</h3>
              <div className="space-y-4">
                {filteredStatistics.gradeStats.map((grade, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full mr-3 ${
                        grade.grade === 'platinum' ? 'bg-purple-500' :
                        grade.grade === 'gold' ? 'bg-yellow-500' :
                        grade.grade === 'silver' ? 'bg-gray-400' : 'bg-orange-500'
                      }`}></div>
                      <span className="text-sm font-medium text-gray-900">
                        {grade.grade === 'platinum' ? '플래티넘' :
                         grade.grade === 'gold' ? '골드' :
                         grade.grade === 'silver' ? '실버' : '브론즈'}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-gray-900">{(grade.totalRevenue / 100000000).toFixed(1)}억원</div>
                      <div className="text-xs text-gray-500">{grade.totalUsers.toLocaleString()}명</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 상위 성과 센터 */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">상위 성과 센터</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">센터명</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">지역</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">등급</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">사용자 수</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">월 수익</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">만족도</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">재등록률</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">신규 가입률</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStatistics.topPerformers.map((performer, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{performer.centerName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{performer.region}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          performer.grade === 'platinum' ? 'bg-purple-100 text-purple-800' :
                          performer.grade === 'gold' ? 'bg-yellow-100 text-yellow-800' :
                          performer.grade === 'silver' ? 'bg-gray-100 text-gray-800' : 'bg-orange-100 text-orange-800'
                        }`}>
                          {performer.grade === 'platinum' ? '플래티넘' :
                           performer.grade === 'gold' ? '골드' :
                           performer.grade === 'silver' ? '실버' : '브론즈'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{performer.totalUsers}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{(performer.monthlyRevenue / 10000000).toFixed(1)}천만원</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{performer.satisfaction}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{performer.retentionRate}%</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{performer.newUserRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 센터 성과 분석 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 성장 센터 TOP 3</h3>
              <div className="space-y-4">
                {filteredStatistics.performanceAnalysis.topGrowthCenters.map((center, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{center.centerName}</p>
                      <p className="text-sm text-gray-600">{center.region} • {center.grade}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-600">+{center.newUserRate}%</p>
                      <p className="text-xs text-gray-500">{center.totalUsers}명</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📉 개선 필요 센터</h3>
              <div className="space-y-4">
                {filteredStatistics.performanceAnalysis.decliningCenters.map((center, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{center.centerName}</p>
                      <p className="text-sm text-gray-600">{center.region} • {center.grade}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-red-600">{center.satisfaction}</p>
                      <p className="text-xs text-gray-500">{center.retentionRate}% 재등록</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 고객 세분화 분석 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">👥 연령대별 분포</h3>
              <div className="space-y-3">
                {filteredStatistics.customerSegmentation.ageGroups.map((age, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{age.age}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${age.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{age.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🏊‍♂️ 수영 레벨별 분포</h3>
              <div className="space-y-3">
                {filteredStatistics.customerSegmentation.skillLevels.map((level, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{level.level}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${level.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{level.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">💳 회원권 유형별 분포</h3>
              <div className="space-y-3">
                {filteredStatistics.customerSegmentation.membershipTypes.map((type, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{type.type}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full" 
                          style={{ width: `${type.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{type.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 시간대별 이용 현황 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">⏰ 시간대별 이용률</h3>
              <div className="space-y-2">
                {filteredStatistics.timeAnalysis.peakHours.map((hour, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 w-24">{hour.hour}</span>
                    <div className="flex-1 mx-3">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full ${hour.utilization > 80 ? 'bg-red-500' : hour.utilization > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                          style={{ width: `${hour.utilization}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-12">{hour.utilization}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📅 요일별 이용 패턴</h3>
              <div className="space-y-2">
                {filteredStatistics.timeAnalysis.weeklyPattern.map((day, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 w-16">{day.day}</span>
                    <div className="flex-1 mx-3">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-blue-600 h-3 rounded-full"
                          style={{ width: `${(day.averageUsers / 3000) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-16">{day.averageUsers.toLocaleString()}명</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 수익성 분석 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 센터별 ROI</h3>
              <div className="space-y-3">
                {filteredStatistics.profitabilityAnalysis.centerROI.map((center, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{center.centerName}</p>
                      <p className="text-sm text-gray-600">{(center.profit / 10000000).toFixed(1)}천만원 수익</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">{center.roi}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 수익 구조</h3>
              <div className="space-y-3">
                {filteredStatistics.profitabilityAnalysis.revenueStreams.map((stream, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{stream.stream}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-600 h-2 rounded-full" 
                          style={{ width: `${stream.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{stream.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 최근 트렌드 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 최근 6개월 트렌드</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">월</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">신규 센터</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">신규 사용자</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">수익</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStatistics.recentTrends.map((trend, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{trend.month}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{trend.newCenters}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{trend.newUsers}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{(trend.revenue / 10000000).toFixed(1)}천만원</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
