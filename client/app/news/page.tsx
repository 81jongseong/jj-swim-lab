'use client';

import { useState, useEffect, useMemo } from 'react';
import StatCard from '@/components/StatCard';
import Button from '@/components/Button';
import RegionNavigation from '@/components/RegionNavigation';

interface Notice {
  _id: string;
  title: string;
  content: string;
  category: 'general' | 'course' | 'facility' | 'maintenance' | 'emergency' | 'membership' | 'quiz' | 'system';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isPinned: boolean;
  viewCount: number;
  createdAt: string;
  author: { name: string };
  targetCenters: Array<{
    _id: string;
    name: string;
    region: string;
    district: string;
  }>;
}

interface Center {
  _id: string;
  name: string;
  region: string;
  district: string;
}

export default function NewsPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [centers, setCenters] = useState<Center[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [selectedCenters, setSelectedCenters] = useState<string[]>([]);

  useEffect(() => {
    loadCenters();
    loadNotices();
  }, []);

  const parseAddress = (address: string) => {
    // 주소에서 지역과 구/시 추출
    const parts = address.split(' ');
    if (parts.length >= 2) {
      let region = parts[0]; // 첫 번째 부분이 시/도
      let district = parts[1]; // 두 번째 부분이 구/시
      
      // 서울특별시, 부산광역시 등의 경우 처리
      if (region.includes('특별시') || region.includes('광역시')) {
        return { region, district };
      }
      
      // 경기도, 전라남도 등의 경우 처리
      if (region.includes('도')) {
        return { region, district };
      }
    }
    
    // 기본값
    return { region: '서울특별시', district: '강남구' };
  };

  const loadCenters = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/centers/guest');
      if (response.ok) {
        const data = await response.json();
        // 주소를 파싱해서 region과 district 필드 추가
        const processedCenters = data.map((center: any) => {
          const { region, district } = parseAddress(center.address);
          return {
            ...center,
            region,
            district
          };
        });
        console.log('로드된 센터 목록:', processedCenters);
        setCenters(processedCenters);
      } else {
        console.error('센터 목록 로드 실패, 샘플 데이터 사용:', response.statusText);
        // 임시 샘플 데이터 (서버 준비 전까지)
        setCenters([
          { _id: '1', name: '강남 수영센터', region: '서울특별시', district: '강남구', address: '강남구 테헤란로 123' },
          { _id: '2', name: '서초 수영센터', region: '서울특별시', district: '서초구', address: '서초구 서초대로 456' },
          { _id: '3', name: '수원 수영센터', region: '경기도', district: '수원시', address: '수원시 영통구 789' },
          { _id: '4', name: '부산 해운대 수영센터', region: '부산광역시', district: '해운대구', address: '해운대구 해운대로 101' },
          { _id: '5', name: '대구 수성 수영센터', region: '대구광역시', district: '수성구', address: '수성구 동대구로 202' },
          { _id: '6', name: '인천 연수 수영센터', region: '인천광역시', district: '연수구', address: '연수구 컨벤시아대로 303' }
        ]);
      }
    } catch (error) {
      console.error('센터 목록 로드 실패, 샘플 데이터 사용:', error);
      // 임시 샘플 데이터 (서버 준비 전까지)
      setCenters([
        { _id: '1', name: '강남 수영센터', region: '서울특별시', district: '강남구', address: '강남구 테헤란로 123' },
        { _id: '2', name: '서초 수영센터', region: '서울특별시', district: '서초구', address: '서초구 서초대로 456' },
        { _id: '3', name: '수원 수영센터', region: '경기도', district: '수원시', address: '수원시 영통구 789' },
        { _id: '4', name: '부산 해운대 수영센터', region: '부산광역시', district: '해운대구', address: '해운대구 해운대로 101' },
        { _id: '5', name: '대구 수성 수영센터', region: '대구광역시', district: '수성구', address: '수성구 동대구로 202' },
        { _id: '6', name: '인천 연수 수영센터', region: '인천광역시', district: '연수구', address: '연수구 컨벤시아대로 303' }
      ]);
    }
  };

  const loadNotices = async () => {
    try {
      // 게스트용 공지사항 API 호출 (실제로는 API 호출)
      // const params = new URLSearchParams();
      // if (selectedCategory !== 'all') params.append('category', selectedCategory);
      // if (selectedRegions.length > 0) params.append('region', selectedRegions[0]);
      // if (selectedDistricts.length > 0) params.append('district', selectedDistricts[0]);
      // if (selectedCenters.length > 0) params.append('centerId', selectedCenters[0]);
      // const response = await fetch(`http://localhost:5000/api/notice/guest?${params}`);
      // const data = await response.json();
      
      // 임시 샘플 데이터 (실제 DB 센터 이름과 일치하도록 수정)
      setNotices([
        {
          _id: '1',
          title: '겨울 시즌 특별 이벤트',
          content: '신규 회원 가입 시 20% 할인 혜택을 제공합니다. 2025년 2월 28일까지!',
          category: 'general',
          priority: 'high',
          isPinned: true,
          viewCount: 245,
          createdAt: '2025-01-15',
          author: { name: 'JJ Swim Lab' },
          targetCenters: []
        },
        {
          _id: '2',
          title: '강남센터 정기 점검 안내',
          content: '2025년 1월 25일(토) 시설 정기 점검으로 인해 휴무합니다.',
          category: 'maintenance',
          priority: 'high',
          isPinned: false,
          viewCount: 128,
          createdAt: '2025-01-10',
          author: { name: '강남센터' },
          targetCenters: [{ _id: '68e3e8e02c5e9ec21493aedd', name: '강남센터', region: '서울특별시', district: '강남구' }]
        },
        {
          _id: '3',
          title: '서초센터 이벤트',
          content: '서초구 주민 할인 이벤트를 진행합니다!',
          category: 'general',
          priority: 'medium',
          isPinned: false,
          viewCount: 85,
          createdAt: '2025-01-08',
          author: { name: '서초센터' },
          targetCenters: [{ _id: '68e3e8e02c5e9ec21493aee0', name: '서초센터', region: '서울특별시', district: '서초구' }]
        },
        {
          _id: '4',
          title: '역삼센터 신규 프로그램 안내',
          content: '초급자를 위한 특별 프로그램이 시작됩니다!',
          category: 'course',
          priority: 'medium',
          isPinned: false,
          viewCount: 92,
          createdAt: '2025-01-12',
          author: { name: '역삼센터' },
          targetCenters: [{ _id: '68e3e8e02c5e9ec21493aede', name: '역삼센터', region: '서울특별시', district: '강남구' }]
        },
        {
          _id: '5',
          title: '수원센터 수영 대회 개최',
          content: '2025년 2월 경기도 지역 수영 대회를 개최합니다.',
          category: 'general',
          priority: 'high',
          isPinned: true,
          viewCount: 180,
          createdAt: '2025-01-14',
          author: { name: '수원센터' },
          targetCenters: [{ _id: '68e3e8e02c5e9ec21493aee7', name: '수원센터', region: '경기도', district: '수원시' }]
        }
      ]);
    } catch (error) {
      console.error('공지사항 로드 실패:', error);
    }
  };

  const filteredNotices = useMemo(() => {
    let filtered = notices;
    
    // 카테고리 필터링
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    // 지역 필터링
    if (selectedRegions.length > 0) {
      filtered = filtered.filter(item => {
        if (item.targetCenters.length === 0) return true; // 전체 공지사항
        return item.targetCenters.some(center => selectedRegions.includes(center.region));
      });
    }
    
    // 구/군 필터링
    if (selectedDistricts.length > 0) {
      filtered = filtered.filter(item => {
        if (item.targetCenters.length === 0) return true; // 전체 공지사항
        return item.targetCenters.some(center => selectedDistricts.includes(center.district));
      });
    }
    
    // 센터 필터링
    if (selectedCenters.length > 0) {
      filtered = filtered.filter(item => {
        if (item.targetCenters.length === 0) return true; // 전체 공지사항
        return item.targetCenters.some(center => selectedCenters.includes(center.name));
      });
    }
    
    return filtered;
  }, [notices, selectedCategory, selectedRegions, selectedDistricts, selectedCenters]);

  // centerData, centerDataMap, regionData 구성 (RegionNavigation 컴포넌트용)
  const { centerData, centerDataMap, regionData } = useMemo(() => {
    const data: { [region: string]: { [district: string]: string[] } } = {};
    const map: { [centerName: string]: any } = {};
    
    // 기본 regionData (전국 시/도, 시/군/구 데이터) - 센터 데이터와 일치하도록 수정
    const regions: { [key: string]: string[] } = {
      '서울특별시': ['강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구', '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구', '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구', '종로구', '중구', '중랑구'],
      '경기도': ['고양시', '과천시', '광명시', '광주시', '구리시', '군포시', '김포시', '남양주시', '동두천시', '부천시', '성남시', '수원시', '시흥시', '안산시', '안성시', '안양시', '양주시', '오산시', '용인시', '의왕시', '의정부시', '이천시', '파주시', '평택시', '포천시', '하남시', '화성시'],
      '인천광역시': ['계양구', '남동구', '동구', '미추홀구', '부평구', '서구', '연수구', '중구', '강화군', '옹진군'],
      '부산광역시': ['강서구', '금정구', '남구', '동구', '동래구', '부산진구', '북구', '사상구', '사하구', '서구', '수영구', '연제구', '영도구', '중구', '해운대구', '기장군'],
      '대구광역시': ['남구', '달서구', '동구', '북구', '서구', '수성구', '중구', '달성군'],
      '광주광역시': ['광산구', '남구', '동구', '북구', '서구'],
      '대전광역시': ['대덕구', '동구', '서구', '유성구', '중구'],
      '울산광역시': ['남구', '동구', '북구', '중구', '울주군'],
      '세종특별자치시': ['세종시'],
      '강원도': ['강릉시', '동해시', '삼척시', '속초시', '원주시', '춘천시', '태백시', '고성군', '양구군', '양양군', '영월군', '인제군', '정선군', '철원군', '평창군', '홍천군', '화천군', '횡성군'],
      '충청북도': ['제천시', '청주시', '충주시', '괴산군', '단양군', '보은군', '영동군', '옥천군', '음성군', '진천군', '증평군', '청원군'],
      '충청남도': ['공주시', '논산시', '당진시', '보령시', '서산시', '아산시', '천안시', '계룡시', '금산군', '부여군', '서천군', '예산군', '청양군', '태안군', '홍성군'],
      '전라북도': ['군산시', '김제시', '남원시', '익산시', '전주시', '정읍시', '고창군', '무주군', '부안군', '순창군', '완주군', '임실군', '장수군', '진안군'],
      '전라남도': ['광양시', '나주시', '목포시', '순천시', '여수시', '강진군', '고흥군', '곡성군', '구례군', '담양군', '무안군', '보성군', '신안군', '영광군', '영암군', '완도군', '장성군', '장흥군', '진도군', '함평군', '해남군', '화순군'],
      '경상북도': ['경산시', '경주시', '구미시', '김천시', '문경시', '상주시', '안동시', '영주시', '영천시', '포항시', '고령군', '군위군', '봉화군', '성주군', '영덕군', '영양군', '예천군', '울릉군', '울진군', '의성군', '청도군', '청송군', '칠곡군'],
      '경상남도': ['거제시', '김해시', '밀양시', '사천시', '양산시', '진주시', '창원시', '통영시', '거창군', '고성군', '남해군', '산청군', '의령군', '창녕군', '하동군', '함안군', '함양군', '합천군'],
      '제주특별자치도': ['서귀포시', '제주시', '남제주군', '북제주군']
    };
    
    centers.forEach(center => {
      if (center.region && center.district) {
        if (!data[center.region]) {
          data[center.region] = {};
        }
        if (!data[center.region][center.district]) {
          data[center.region][center.district] = [];
        }
        data[center.region][center.district].push(center.name);
        
        // centerDataMap에 센터 정보 저장
        map[center.name] = {
          id: center._id,
          name: center.name,
          region: center.region,
          district: center.district,
          address: center.address,
          phone: center.phone,
          email: center.email,
          website: center.website,
          revenue: {
            registration: 0,
            lessons: 0,
            shop: 0,
            total: 0
          },
          costs: {
            labor: 0,
            utilities: 0,
            rent: 0,
            total: 0
          },
          netProfit: 0
        };
      }
    });
    
    return { centerData: data, centerDataMap: map, regionData: regions };
  }, [centers]);

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'general': return '일반';
      case 'course': return '수업';
      case 'facility': return '시설';
      case 'maintenance': return '점검';
      case 'emergency': return '긴급';
      case 'membership': return '회원';
      case 'quiz': return '퀴즈';
      case 'system': return '시스템';
      default: return category;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'general': return 'bg-blue-100 text-blue-800';
      case 'course': return 'bg-green-100 text-green-800';
      case 'facility': return 'bg-purple-100 text-purple-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'emergency': return 'bg-red-100 text-red-800';
      case 'membership': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent': return <span className="px-2 py-1 text-xs font-bold rounded-full bg-red-500 text-white">🚨 긴급</span>;
      case 'high': return <span className="px-2 py-1 text-xs font-bold rounded-full bg-orange-500 text-white">⚠️ 중요</span>;
      case 'medium': return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">일반</span>;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">로딩 중...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📢 공지사항</h1>
          <p className="text-gray-600">우리 지역 수영장의 최신 소식을 확인하세요</p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <StatCard
            icon="📌"
            title="중요 공지"
            value={notices.filter(n => n.isPinned).length.toString()}
            description="고정된 공지사항"
            color="red"
          />
          <StatCard
            icon="📋"
            title="전체 공지"
            value={filteredNotices.length.toString()}
            description="현재 공지 개수"
            color="blue"
          />
          <StatCard
            icon="👀"
            title="조회수"
            value={notices.reduce((sum, n) => sum + n.viewCount, 0).toString()}
            description="누적 조회"
            color="green"
          />
        </div>

        {/* 지역 필터 */}
        <RegionNavigation
          selectedRegions={selectedRegions}
          setSelectedRegions={setSelectedRegions}
          selectedDistricts={selectedDistricts}
          setSelectedDistricts={setSelectedDistricts}
          selectedCenters={selectedCenters}
          setSelectedCenters={setSelectedCenters}
          regionData={regionData}
          centerData={centerData}
          comparisonMode={false}
          layout="list"
          centerDataMap={centerDataMap}
        />

        {/* 카테고리 필터 */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setSelectedCategory('all')}
              variant={selectedCategory === 'all' ? 'primary' : 'secondary'}
              size="sm"
            >
              전체
            </Button>
            <Button
              onClick={() => setSelectedCategory('general')}
              variant={selectedCategory === 'general' ? 'primary' : 'secondary'}
              size="sm"
            >
              일반
            </Button>
            <Button
              onClick={() => setSelectedCategory('course')}
              variant={selectedCategory === 'course' ? 'primary' : 'secondary'}
              size="sm"
            >
              수업
            </Button>
            <Button
              onClick={() => setSelectedCategory('facility')}
              variant={selectedCategory === 'facility' ? 'primary' : 'secondary'}
              size="sm"
            >
              시설
            </Button>
            <Button
              onClick={() => setSelectedCategory('maintenance')}
              variant={selectedCategory === 'maintenance' ? 'primary' : 'secondary'}
              size="sm"
            >
              점검
            </Button>
            <Button
              onClick={() => setSelectedCategory('emergency')}
              variant={selectedCategory === 'emergency' ? 'primary' : 'secondary'}
              size="sm"
            >
              긴급
            </Button>
          </div>
        </div>

        {/* 공지사항 목록 */}
        <div className="space-y-4">
          {filteredNotices.map((notice) => (
            <div key={notice._id} className={`bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow ${notice.isPinned ? 'border-l-4 border-red-500' : ''}`}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {notice.isPinned && (
                    <span className="px-2 py-1 text-xs font-bold rounded-full bg-red-500 text-white">📌 고정</span>
                  )}
                  {getPriorityBadge(notice.priority)}
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(notice.category)}`}>
                    {getCategoryText(notice.category)}
                  </span>
                  {notice.targetCenters && notice.targetCenters.length > 0 && (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      🏢 {notice.targetCenters[0].name}
                    </span>
                  )}
                </div>
                <span className="text-sm text-gray-500">{new Date(notice.createdAt).toLocaleDateString()}</span>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{notice.title}</h3>
              <p className="text-gray-700 mb-4">{notice.content}</p>
              
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>👁️ {notice.viewCount} 조회</span>
                  <span>✍️ {notice.author.name}</span>
                </div>
                <Button
                  onClick={() => {}}
                  variant="secondary"
                  size="sm"
                >
                  자세히 보기
                </Button>
              </div>
            </div>
          ))}
        </div>

        {filteredNotices.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-500 text-lg mb-2">선택한 지역의 공지사항이 없습니다</p>
            <p className="text-gray-400 text-sm">다른 지역을 선택하거나 전국으로 검색해보세요</p>
          </div>
        )}
      </div>
    </div>
  );
} 