'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Bell, Plus, Edit, Trash2, Eye, Calendar, User } from 'lucide-react';
import withAuth from '@/components/withAuth';
import StatCard from '@/components/StatCard';
import Button from '@/components/Button';

interface Notice {
  _id: string;
  title: string;
  content: string;
  category: 'general' | 'course' | 'facility' | 'maintenance' | 'emergency' | 'membership' | 'quiz' | 'system';
  isPublished: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  targetUserTypes: ('student' | 'instructor' | 'centerAdmin' | 'superAdmin')[];
  targetCenters: string[];
  author: { name: string; userId: string };
  createdAt: Date;
  publishedAt?: Date;
  viewCount: number;
  tags: string[];
  isPinned: boolean;
  allowComments: boolean;
  expiresAt?: Date;
  attachments?: { filename: string; url: string; size: number; type: string; }[];
}

interface Center {
  _id: string;
  name: string;
  region: string;
  city?: string;
  district?: string;
  address?: string;
}

function SuperAdminNoticesManagement() {
  const { user } = useAuth();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [centers, setCenters] = useState<Center[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('2025-10');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general' as Notice['category'],
    priority: 'medium' as Notice['priority'],
    isPublished: false,
    targetUserTypes: [] as string[],
    targetCenters: [] as string[],
    tags: [] as string[],
    isPinned: false,
    allowComments: true,
    sendToAllUserTypes: false
  });
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [filteredCenters, setFilteredCenters] = useState<Center[]>([]);

  // 한국 행정구역 데이터
  const regions = {
    '서울특별시': ['전체', '강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구', '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구', '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구', '종로구', '중구', '중랑구'],
    '부산광역시': ['전체', '강서구', '금정구', '기장군', '남구', '동구', '동래구', '부산진구', '북구', '사상구', '사하구', '서구', '수영구', '연제구', '영도구', '중구', '해운대구'],
    '대구광역시': ['전체', '남구', '달서구', '달성군', '동구', '북구', '서구', '수성구', '중구'],
    '인천광역시': ['전체', '강화군', '계양구', '남동구', '동구', '미추홀구', '부평구', '서구', '연수구', '옹진군', '중구'],
    '광주광역시': ['전체', '광산구', '남구', '동구', '북구', '서구'],
    '대전광역시': ['전체', '대덕구', '동구', '서구', '유성구', '중구'],
    '울산광역시': ['전체', '남구', '동구', '북구', '울주군', '중구'],
    '세종특별자치시': ['전체'],
    '경기도': ['전체', '가평군', '고양시', '과천시', '광명시', '광주시', '구리시', '군포시', '김포시', '남양주시', '동두천시', '부천시', '성남시', '수원시', '시흥시', '안산시', '안성시', '안양시', '양주시', '양평군', '여주시', '연천군', '오산시', '용인시', '의왕시', '의정부시', '이천시', '파주시', '평택시', '포천시', '하남시', '화성시'],
    '강원특별자치도': ['전체', '강릉시', '고성군', '동해시', '삼척시', '속초시', '양구군', '양양군', '영월군', '원주시', '인제군', '정선군', '철원군', '춘천시', '태백시', '평창군', '홍천군', '화천군', '횡성군'],
    '충청북도': ['전체', '괴산군', '단양군', '보은군', '영동군', '옥천군', '음성군', '제천시', '증평군', '진천군', '청주시', '충주시'],
    '충청남도': ['전체', '계룡시', '공주시', '금산군', '논산시', '당진시', '보령시', '부여군', '서산시', '서천군', '아산시', '예산군', '천안시', '청양군', '태안군', '홍성군'],
    '전북특별자치도': ['전체', '고창군', '군산시', '김제시', '남원시', '무주군', '부안군', '순창군', '완주군', '익산시', '임실군', '장수군', '전주시', '정읍시', '진안군'],
    '전라남도': ['전체', '강진군', '고흥군', '곡성군', '광양시', '구례군', '나주시', '담양군', '목포시', '무안군', '보성군', '순천시', '신안군', '여수시', '영광군', '영암군', '완도군', '장성군', '장흥군', '진도군', '함평군', '해남군', '화순군'],
    '경상북도': ['전체', '경산시', '경주시', '고령군', '구미시', '군위군', '김천시', '문경시', '봉화군', '상주시', '성주군', '안동시', '영덕군', '영양군', '영주시', '영천시', '예천군', '울릉군', '울진군', '의성군', '청도군', '청송군', '칠곡군', '포항시'],
    '경상남도': ['전체', '거제시', '거창군', '고성군', '김해시', '남해군', '밀양시', '사천시', '산청군', '양산시', '의령군', '진주시', '창녕군', '창원시', '통영시', '하동군', '함안군', '함양군', '합천군'],
    '제주특별자치도': ['전체', '서귀포시', '제주시']
  };

  useEffect(() => {
    if (user) {
      loadNotices();
      loadCenters();
    }
  }, [user]);

  const loadNotices = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:5000/api/notices/admin/all', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📊 공지사항 데이터:', data);
        const noticesList = (data.notices || data || []).map((notice: any) => ({
          ...notice,
          createdAt: new Date(notice.createdAt),
          publishedAt: notice.publishedAt ? new Date(notice.publishedAt) : undefined
        }));
        console.log('📋 변환된 공지사항:', noticesList.length, '개');
        setNotices(noticesList);
      } else {
        console.error('공지사항 로드 실패:', response.status);
        setNotices([]);
      }
    } catch (error) {
      console.error('공지사항 로드 실패:', error);
      setNotices([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCenters = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/centers', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const centersList = data.centers || data || [];
        setCenters(centersList);
        setFilteredCenters(centersList);
      } else {
        // 임시 데이터
        const tempCenters = [
          { _id: 'center001', name: '강남 수영장', region: '서울', city: '서울특별시', district: '강남구', address: '서울특별시 강남구 테헤란로 123' },
          { _id: 'center002', name: '판교 수영장', region: '경기', city: '경기도', district: '성남시 분당구', address: '경기도 성남시 분당구 판교역로 456' },
          { _id: 'center003', name: '해운대 수영장', region: '부산', city: '부산광역시', district: '해운대구', address: '부산광역시 해운대구 해운대해변로 789' }
        ];
        setCenters(tempCenters);
        setFilteredCenters(tempCenters);
      }
    } catch (error) {
      console.error('센터 로드 실패:', error);
      const tempCenters = [
        { _id: 'center001', name: '강남 수영장', region: '서울', city: '서울특별시', district: '강남구', address: '서울특별시 강남구 테헤란로 123' },
        { _id: 'center002', name: '판교 수영장', region: '경기', city: '경기도', district: '성남시 분당구', address: '경기도 성남시 분당구 판교역로 456' },
        { _id: 'center003', name: '해운대 수영장', region: '부산', city: '부산광역시', district: '해운대구', address: '부산광역시 해운대구 해운대해변로 789' }
      ];
      setCenters(tempCenters);
      setFilteredCenters(tempCenters);
    }
  };

  // 지역 선택 시 해당 지역의 센터 필터링
  useEffect(() => {
    if (!centers || centers.length === 0) {
      setFilteredCenters([]);
      return;
    }

    let filtered = centers;

    // 선택된 지역들로 필터링
    if (formData.targetRegions && formData.targetRegions.length > 0) {
      filtered = centers.filter(center => {
        return formData.targetRegions.some(region => {
          if (region.includes(' > ')) {
            // "서울특별시 > 강남구" 형식
            const [province, district] = region.split(' > ');
            return (center.city?.includes(province) || center.region === province) &&
                   (center.district?.includes(district) || center.address?.includes(district));
          } else {
            // "서울특별시" 형식 (시/도만)
            return center.city?.includes(region) || center.region === region;
          }
        });
      });
    }

    setFilteredCenters(filtered);
  }, [formData.targetRegions, centers]);

  // 시/도 변경 시 시/군/구 초기화
  const handleProvinceChange = (province: string) => {
    setSelectedProvince(province);
    setSelectedCity('');
  };

  // 지역 선택 토글
  const toggleRegion = (region: string) => {
    setFormData(prev => ({
      ...prev,
      targetRegions: prev.targetRegions.includes(region)
        ? prev.targetRegions.filter(r => r !== region)
        : [...prev.targetRegions, region],
      sendToAll: false
    }));
  };

  const getCategoryLabel = (category: string) => {
    const categories: { [key: string]: string } = {
      'general': '일반',
      'course': '강습',
      'facility': '시설',
      'maintenance': '점검',
      'emergency': '긴급',
      'membership': '회원',
      'quiz': '퀴즈',
      'system': '시스템'
    };
    return categories[category] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'general': 'bg-blue-100 text-blue-800',
      'course': 'bg-purple-100 text-purple-800',
      'facility': 'bg-cyan-100 text-cyan-800',
      'maintenance': 'bg-yellow-100 text-yellow-800',
      'emergency': 'bg-red-100 text-red-800',
      'membership': 'bg-green-100 text-green-800',
      'quiz': 'bg-pink-100 text-pink-800',
      'system': 'bg-indigo-100 text-indigo-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (isPublished: boolean) => {
    return isPublished ? '발행됨' : '초안';
  };

  const getStatusColor = (isPublished: boolean) => {
    return isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  const getPriorityLabel = (priority: string) => {
    const priorities: { [key: string]: string } = {
      'low': '낮음',
      'medium': '보통',
      'high': '높음',
      'urgent': '긴급'
    };
    return priorities[priority] || priority;
  };

  const getPriorityColor = (priority: string) => {
    const colors: { [key: string]: string } = {
      'low': 'bg-green-100 text-green-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'high': 'bg-red-100 text-red-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const handleCreate = () => {
    setEditingNotice(null);
    setFormData({
      title: '',
      content: '',
      type: 'general',
      priority: 'medium',
      status: 'draft',
      targetUserTypes: [],
      targetRegions: [],
      targetCenters: [],
      sendToAll: false,
      sendToAllUserTypes: false
    });
    setSelectedProvince('');
    setSelectedCity('');
    setShowModal(true);
  };

  const handleEdit = (notice: Notice) => {
    setEditingNotice(notice);
    setFormData({
      title: notice.title,
      content: notice.content,
      category: notice.category,
      priority: notice.priority,
      isPublished: notice.isPublished,
      targetUserTypes: notice.targetUserTypes,
      targetCenters: notice.targetCenters,
      tags: notice.tags || [],
      isPinned: notice.isPinned || false,
      allowComments: notice.allowComments || true,
      sendToAllUserTypes: notice.targetUserTypes.length === 4
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...formData,
        targetUserTypes: formData.sendToAllUserTypes 
          ? ['student', 'instructor', 'centerAdmin', 'superAdmin']
          : formData.targetUserTypes,
        targetRegions: formData.sendToAll ? [] : formData.targetRegions,
        targetCenters: formData.sendToAll ? [] : formData.targetCenters,
        authorId: user?._id || user?.id,
        authorName: user?.name || '최고 관리자'
      };

      if (editingNotice) {
        // 수정
        const response = await fetch(`http://localhost:5000/api/notices/${editingNotice._id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          alert('공지사항이 수정되었습니다!');
          loadNotices();
          setShowModal(false);
        }
      } else {
        // 생성
        const response = await fetch('http://localhost:5000/api/notices', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          alert('공지사항이 생성되었습니다!');
          loadNotices();
          setShowModal(false);
        }
      }
    } catch (error) {
      console.error('저장 오류:', error);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('이 공지사항을 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/notices/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        alert('공지사항이 삭제되었습니다!');
        loadNotices();
      }
    } catch (error) {
      console.error('삭제 오류:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const handlePublish = async (notice: Notice) => {
    try {
      const response = await fetch(`http://localhost:5000/api/notices/${notice._id}/publish`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert('공지사항이 발행되었습니다!');
    loadNotices();
      }
    } catch (error) {
      console.error('발행 오류:', error);
      alert('발행 중 오류가 발생했습니다.');
    }
  };

  const toggleUserType = (type: string) => {
    setFormData(prev => ({
      ...prev,
      targetUserTypes: prev.targetUserTypes.includes(type)
        ? prev.targetUserTypes.filter(t => t !== type)
        : [...prev.targetUserTypes, type],
      sendToAllUserTypes: false
    }));
  };

  const toggleCenter = (centerId: string) => {
    setFormData(prev => ({
      ...prev,
      targetCenters: prev.targetCenters.includes(centerId)
        ? prev.targetCenters.filter(c => c !== centerId)
        : [...prev.targetCenters, centerId],
      sendToAll: false
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
        <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          최고 관리자 공지사항 관리
        </h1>
        <p className="text-gray-600">전체 시스템의 공지사항을 센터별, 지역별, 계정별로 발송하세요</p>
      </div>

      {/* 월별 선택 */}
      <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">📅 월별 조회:</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-600">
            {notices.filter(notice => {
              const noticeDate = new Date(notice.createdAt);
              const [year, month] = selectedMonth.split('-');
              return noticeDate.getFullYear() === parseInt(year) &&
                     noticeDate.getMonth() + 1 === parseInt(month);
            }).length}개의 공지사항
          </span>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="총 공지사항"
          value={`${notices.length}개`}
          icon="📢"
          color="blue"
          subtitle={statusFilter === 'all' && typeFilter === 'all' ? '전체 보기' : '클릭하여 전체 보기'}
          onClick={() => {
            setStatusFilter('all');
            setTypeFilter('all');
          }}
        />
        <StatCard
          title="발행된 공지"
          value={`${notices.filter(notice => notice.isPublished).length}개`}
          icon="✅"
          color="green"
          subtitle={statusFilter === 'published' ? '필터 적용 중' : '클릭하여 필터링'}
          onClick={() => setStatusFilter(statusFilter === 'published' ? 'all' : 'published')}
        />
        <StatCard
          title="이번 달 공지"
          value={`${notices.filter(notice => {
            const noticeDate = new Date(notice.createdAt);
            return noticeDate.getMonth() === new Date().getMonth() &&
                   noticeDate.getFullYear() === new Date().getFullYear();
          }).length}개`}
          icon="📅"
          color="purple"
          subtitle="10월 작성 통계"
        />
        <StatCard
          title="초안"
          value={`${notices.filter(notice => !notice.isPublished).length}개`}
          icon="📝"
          color="orange"
          subtitle={statusFilter === 'draft' ? '필터 적용 중' : '클릭하여 필터링'}
          onClick={() => setStatusFilter(statusFilter === 'draft' ? 'all' : 'draft')}
        />
        </div>

      {/* 공지사항 목록 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">공지사항 목록</h3>
            <Button
              onClick={handleCreate}
              variant="primary"
              size="md"
            >
              ➕ 새 공지사항 작성
            </Button>
          </div>

          {/* 필터 옵션 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">상태</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">전체</option>
                <option value="published">✅ 발행됨</option>
                <option value="draft">📝 초안</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">유형</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">전체</option>
                <option value="general">일반</option>
                <option value="course">강습</option>
                <option value="facility">시설</option>
                <option value="maintenance">점검</option>
                <option value="emergency">긴급</option>
                <option value="membership">회원</option>
                <option value="quiz">퀴즈</option>
                <option value="system">시스템</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">우선순위</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">전체</option>
                <option value="urgent">🔴 긴급</option>
                <option value="high">🟠 높음</option>
                <option value="medium">🟡 보통</option>
                <option value="low">🟢 낮음</option>
              </select>
            </div>
          </div>

          {(statusFilter !== 'all' || typeFilter !== 'all' || priorityFilter !== 'all') && (
            <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-blue-600 font-medium">
                  필터 적용 중:
                </span>
                {statusFilter !== 'all' && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    상태: {statusFilter === 'published' ? '발행됨' : '초안'}
                  </span>
                )}
                {typeFilter !== 'all' && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    유형: {getCategoryLabel(typeFilter)}
                  </span>
                )}
                {priorityFilter !== 'all' && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    우선순위: {getPriorityLabel(priorityFilter)}
                  </span>
                )}
              </div>
              <Button
                onClick={() => {
                  setStatusFilter('all');
                  setTypeFilter('all');
                  setPriorityFilter('all');
                }}
                variant="ghost"
                size="sm"
              >
                필터 초기화
              </Button>
            </div>
          )}
        </div>
          
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  제목
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  유형
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  우선순위
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작성자
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  조회수
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작성일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  액션
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {notices
                .filter(notice => {
                  // 상태 필터
                  if (statusFilter === 'published' && !notice.isPublished) return false;
                  if (statusFilter === 'draft' && notice.isPublished) return false;
                  
                  // 유형 필터
                  if (typeFilter !== 'all' && notice.category !== typeFilter) return false;
                  
                  // 우선순위 필터
                  if (priorityFilter !== 'all' && notice.priority !== priorityFilter) return false;
                  
                  // 월별 필터
                  const noticeDate = new Date(notice.createdAt);
                  const [year, month] = selectedMonth.split('-');
                  if (noticeDate.getFullYear() !== parseInt(year) || 
                      noticeDate.getMonth() + 1 !== parseInt(month)) {
                    return false;
                  }
                  
                  return true;
                })
                .map((notice) => (
                <tr key={notice._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{notice.title}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {notice.content}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(notice.category)}`}>
                      {getCategoryLabel(notice.category)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(notice.isPublished)}`}>
                      {getStatusLabel(notice.isPublished)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(notice.priority)}`}>
                      {getPriorityLabel(notice.priority)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {notice.author?.name || '관리자'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {notice.viewCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {notice.createdAt.toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {!notice.isPublished && (
                        <Button
                          onClick={() => handlePublish(notice)}
                          variant="success"
                          size="sm"
                        >
                          📢 발행
                        </Button>
                      )}
                      <Button
                        onClick={() => handleEdit(notice)}
                        variant="warning"
                        size="sm"
                      >
                        ✏️ 수정
                      </Button>
                      <Button
                        onClick={() => handleDelete(notice._id)}
                        variant="danger"
                        size="sm"
                      >
                        🗑️ 삭제
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 공지사항 작성/수정 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingNotice ? '공지사항 수정' : '새 공지사항 작성'}
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* 제목 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  제목 *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="공지사항 제목을 입력하세요"
                />
              </div>

              {/* 내용 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  내용 *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={8}
                  placeholder="공지사항 내용을 입력하세요"
                />
              </div>

              {/* 유형, 우선순위, 상태 */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    유형
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as Notice['type'] })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                  <option value="general">일반</option>
                    <option value="important">중요</option>
                    <option value="maintenance">점검</option>
                  <option value="event">이벤트</option>
                </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    우선순위
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as Notice['priority'] })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                  <option value="low">낮음</option>
                  <option value="medium">보통</option>
                  <option value="high">높음</option>
                </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    상태
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Notice['status'] })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="draft">임시저장</option>
                    <option value="published">발행</option>
                    <option value="archived">보관</option>
                  </select>
                </div>
              </div>

              {/* 발송 대상 설정 */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📤 발송 대상 설정</h3>

                {/* Step 1: 지역 선택 (시/도/구 + 센터 통합) */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-base font-semibold text-gray-800">
                      1️⃣ 발송 지역 선택
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.sendToAll}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          sendToAll: e.target.checked,
                          targetCenters: e.target.checked ? [] : formData.targetCenters,
                          targetRegions: e.target.checked ? [] : formData.targetRegions
                        })}
                        className="mr-2 w-5 h-5"
                      />
                      <span className="text-sm font-bold text-blue-600">🇰🇷 전국 전체</span>
                    </label>
                  </div>
                  {!formData.sendToAll && (
                    <>
                      {/* 계층적 지역 선택 */}
                      <div className="bg-gray-50 border rounded-lg p-4 mb-4">
                        <div className="flex gap-3 mb-3">
                          {/* 시/도 선택 */}
                          <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-600 mb-2">
                              📍 시/도
                            </label>
                            <select
                              value={selectedProvince}
                              onChange={(e) => handleProvinceChange(e.target.value)}
                              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">선택하세요</option>
                              {Object.keys(regions).map((province) => (
                                <option key={province} value={province}>{province}</option>
                              ))}
                            </select>
                          </div>

                          {/* 시/군/구 선택 */}
                          <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-600 mb-2">
                              🏘️ 시/군/구
                            </label>
                            <select
                              value={selectedCity}
                              onChange={(e) => setSelectedCity(e.target.value)}
                              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                              disabled={!selectedProvince}
                            >
                              <option value="">선택하세요</option>
                              {selectedProvince && regions[selectedProvince as keyof typeof regions]?.map((city) => (
                                <option key={city} value={city}>{city}</option>
                              ))}
                            </select>
                          </div>

                          {/* 추가 버튼 */}
                          <div className="flex items-end">
                            <Button
                              onClick={() => {
                                if (!selectedProvince) {
                                  alert('시/도를 먼저 선택하세요');
                                  return;
                                }
                                const regionKey = selectedCity && selectedCity !== '전체' && selectedCity !== '선택하세요'
                                  ? `${selectedProvince} > ${selectedCity}`
                                  : selectedProvince;
                                
                                if (!formData.targetRegions.includes(regionKey)) {
                                  setFormData(prev => ({
                                    ...prev,
                                    targetRegions: [...prev.targetRegions, regionKey],
                                    sendToAll: false
                                  }));
                                }
                                // 선택 초기화
                                setSelectedProvince('');
                                setSelectedCity('');
                              }}
                              variant="primary"
                              size="sm"
                            >
                              ➕ 추가
                            </Button>
                          </div>
                        </div>

                        {/* 선택된 지역 목록 */}
                        {formData.targetRegions.length > 0 && (
                          <div className="mb-3">
                            <label className="block text-xs font-medium text-gray-600 mb-2">
                              ✅ 선택된 지역 ({formData.targetRegions.length}개)
                            </label>
                            <div className="flex flex-wrap gap-2">
                              {formData.targetRegions.map((region, index) => (
                                <div
                                  key={index}
                                  className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                                >
                                  <span>{region}</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setFormData(prev => ({
                                        ...prev,
                                        targetRegions: prev.targetRegions.filter((_, i) => i !== index)
                                      }));
                                    }}
                                    className="text-blue-600 hover:text-blue-900 font-bold"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 필터링 결과 표시 */}
                        <div className="text-xs text-gray-700 bg-blue-50 p-2 rounded border border-blue-200">
                          <strong>📍 센터 필터링:</strong> {
                            formData.targetRegions.length > 0 
                              ? `선택된 ${formData.targetRegions.length}개 지역의 센터`
                              : '전체 지역'
                          }
                          <span className="ml-2 font-bold text-blue-700">
                            ({filteredCenters.length}개)
                          </span>
                        </div>
                      </div>
                      
                      {/* 센터 목록 */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-2">
                          🏢 특정 센터 선택 (선택사항)
                        </label>
                        <div className="border rounded-lg p-3 max-h-48 overflow-y-auto bg-white">
                          {filteredCenters.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-4">
                              {selectedProvince ? `선택한 지역에 센터가 없습니다` : '지역을 선택하거나 센터를 검색하세요'}
                            </p>
                          ) : (
                            <div className="grid grid-cols-1 gap-2">
                              {filteredCenters.map((center) => (
                                <label key={center._id} className="flex items-start p-2 hover:bg-blue-50 rounded cursor-pointer border border-gray-200">
                                  <input
                                    type="checkbox"
                                    checked={formData.targetCenters.includes(center._id)}
                                    onChange={() => toggleCenter(center._id)}
                                    className="mr-3 w-4 h-4 mt-1"
                                  />
                                  <div className="flex-1">
                                    <div className="font-medium text-sm">{center.name}</div>
                                    <div className="text-xs text-gray-500 mt-1">
                                      {center.district || center.region}
                                    </div>
                                  </div>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                          💡 센터를 선택하지 않으면 위에서 선택한 지역 전체에 발송됩니다
                        </p>
                      </div>
                    </>
                  )}
                </div>

              {/* Step 2: 계정 선택 */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-base font-semibold text-gray-800">
                    2️⃣ 발송 계정 유형 선택 *
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.sendToAllUserTypes}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        sendToAllUserTypes: e.target.checked,
                        targetUserTypes: e.target.checked ? ['student', 'instructor', 'centerAdmin', 'superAdmin'] : []
                      })}
                      className="mr-2 w-4 h-4"
                    />
                      <span className="text-sm font-bold text-blue-600">👥 전체 계정</span>
                    </label>
                  </div>
                  {!formData.sendToAllUserTypes && (
                <div className="grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded-lg border">
                  <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={formData.targetUserTypes.includes('student')}
                      onChange={() => toggleUserType('student')}
                      className="mr-3 w-4 h-4"
                    />
                    <span className="font-medium">👨‍🎓 학생 (회원)</span>
                  </label>

                  <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={formData.targetUserTypes.includes('instructor')}
                      onChange={() => toggleUserType('instructor')}
                      className="mr-3 w-4 h-4"
                    />
                    <span className="font-medium">👨‍🏫 강사</span>
                  </label>

                  <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={formData.targetUserTypes.includes('centerAdmin')}
                      onChange={() => toggleUserType('centerAdmin')}
                      className="mr-3 w-4 h-4"
                    />
                    <span className="font-medium">🏢 센터 관리자</span>
                  </label>

                  <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={formData.targetUserTypes.includes('superAdmin')}
                      onChange={() => toggleUserType('superAdmin')}
                      className="mr-3 w-4 h-4"
                    />
                    <span className="font-medium">⭐ 최고 관리자</span>
                  </label>
                </div>
                )}
                {!formData.sendToAllUserTypes && formData.targetUserTypes.length === 0 && (
                  <p className="mt-2 text-sm text-red-600">최소 1개 이상의 계정 유형을 선택해주세요</p>
                )}
              </div>
            </div>

              {/* 발송 대상 요약 */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg p-4">
                <h4 className="font-bold text-blue-900 mb-3 flex items-center">
                  <span className="text-lg">📋</span>
                  <span className="ml-2">최종 발송 대상</span>
                </h4>
                <div className="space-y-3 text-sm">
                  {/* 지역 */}
                  <div className="bg-white p-3 rounded-lg">
                    <p className="font-semibold text-gray-700 mb-1">🗺️ 지역</p>
                    <p className="text-gray-900">
                      {formData.sendToAll 
                        ? '🇰🇷 전국 전체'
                        : formData.targetCenters.length > 0
                          ? `센터 ${formData.targetCenters.length}곳 (${formData.targetCenters.map(cId => centers.find(c => c._id === cId)?.name).join(', ')})`
                          : formData.targetRegions.length > 0
                            ? formData.targetRegions.join(', ')
                            : '지역 선택 필요'
                      }
                    </p>
                  </div>
                  
                  {/* 계정 */}
                  <div className="bg-white p-3 rounded-lg">
                    <p className="font-semibold text-gray-700 mb-1">👥 계정 유형</p>
                    <p className="text-gray-900">
                      {formData.sendToAllUserTypes
                        ? '전체 계정'
                        : formData.targetUserTypes.length === 0 
                          ? '❌ 선택 필요' 
                          : formData.targetUserTypes.map(t => {
                            const labels: { [key: string]: string } = {
                              'student': '👨‍🎓회원',
                              'instructor': '👨‍🏫강사',
                              'centerAdmin': '🏢센터관리자',
                              'superAdmin': '⭐최고관리자'
                            };
                            return labels[t];
                          }).join(', ')
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 버튼 */}
            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
              <Button
                onClick={() => setShowModal(false)}
                variant="secondary"
                size="md"
              >
                취소
              </Button>
              <Button
                onClick={handleSave}
                disabled={
                  !formData.title || 
                  !formData.content || 
                  (!formData.sendToAllUserTypes && formData.targetUserTypes.length === 0)
                }
                variant="primary"
                size="md"
              >
                {editingNotice ? '수정하기' : '작성하기'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default withAuth(SuperAdminNoticesManagement, { 
  requireTypes: ['superAdmin'] 
});