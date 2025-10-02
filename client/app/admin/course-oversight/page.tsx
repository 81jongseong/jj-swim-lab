/**
 * @file 최고관리자 강습 과정 감독 페이지
 * @description 전체 센터의 강습 과정 현황 감독 및 모니터링
 * @date 2025-01-13
 * @author JJ Swim Lab
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { 
  Eye, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  BarChart3, 
  Users, 
  DollarSign,
  Clock,
  Settings,
  AlertTriangle,
  Filter,
  Search,
  Download,
  RefreshCw,
  Star
} from 'lucide-react';

interface CourseOversightStats {
  totalCourses: number;
  activeCourses: number;
  inactiveCourses: number;
  totalRevenue: number;
  averageRating: number;
  totalStudents: number;
}

interface CenterCourseData {
  centerId: string;
  centerName: string;
  totalCourses: number;
  activeCourses: number;
  revenue: number;
  rating: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
}

const CourseOversightPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<CourseOversightStats>({
    totalCourses: 0,
    activeCourses: 0,
    inactiveCourses: 0,
    totalRevenue: 0,
    averageRating: 0,
    totalStudents: 0
  });

  const [centerData, setCenterData] = useState<CenterCourseData[]>([
    {
      centerId: '1',
      centerName: 'JJ Swim Lab 본점',
      totalCourses: 25,
      activeCourses: 22,
      revenue: 2500000,
      rating: 4.8,
      status: 'excellent'
    },
    {
      centerId: '2',
      centerName: 'JJ Swim Lab 강남점',
      totalCourses: 18,
      activeCourses: 15,
      revenue: 1800000,
      rating: 4.5,
      status: 'good'
    },
    {
      centerId: '3',
      centerName: 'JJ Swim Lab 분당점',
      totalCourses: 12,
      activeCourses: 8,
      revenue: 1200000,
      rating: 4.2,
      status: 'warning'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const loadCourseOversightData = async () => {
      try {
        console.log('강습 과정 감독 데이터 로드 중...');
        
        // 임시 데이터 설정
        setStats({
          totalCourses: 55,
          activeCourses: 45,
          inactiveCourses: 10,
          totalRevenue: 5500000,
          averageRating: 4.5,
          totalStudents: 320
        });
      } catch (error) {
        console.error('강습 과정 감독 데이터 로드 실패:', error);
      }
    };

    loadCourseOversightData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'excellent': return '우수';
      case 'good': return '양호';
      case 'warning': return '주의';
      case 'critical': return '위험';
      default: return '알 수 없음';
    }
  };

  const filteredCenterData = centerData.filter(center => {
    const matchesSearch = center.centerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || center.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">강습 과정 감독</h1>
        <p className="text-gray-600 mt-2">전체 센터의 강습 과정 현황을 감독하고 모니터링합니다.</p>
      </div>

      {/* 주요 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">총 강습 과정</h3>
            <BarChart3 className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalCourses}개</div>
          <p className="text-xs text-gray-500 mt-1">전체 센터 합계</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">활성 과정</h3>
            <CheckCircle className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.activeCourses}개</div>
          <p className="text-xs text-gray-500 mt-1">현재 운영 중</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">총 수익</h3>
            <DollarSign className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalRevenue.toLocaleString()}원</div>
          <p className="text-xs text-gray-500 mt-1">월간 총 수익</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">평균 평점</h3>
            <TrendingUp className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.averageRating}</div>
          <p className="text-xs text-gray-500 mt-1">전체 평균</p>
        </div>
      </div>

      {/* 추가 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">비활성 과정</h3>
            <XCircle className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.inactiveCourses}개</div>
          <p className="text-xs text-gray-500 mt-1">운영 중단</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">총 수강생</h3>
            <Users className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.totalStudents}명</div>
          <p className="text-xs text-gray-500 mt-1">전체 수강생</p>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="센터명으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">전체 상태</option>
              <option value="excellent">우수</option>
              <option value="good">양호</option>
              <option value="warning">주의</option>
              <option value="critical">위험</option>
            </select>
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 센터별 강습 과정 현황 */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">센터별 강습 과정 현황</h3>
              <p className="text-sm text-gray-600">각 센터의 강습 과정 운영 현황을 확인하세요.</p>
            </div>
            <button 
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              onClick={() => {/* 리포트 다운로드 로직 */}}
            >
              <Download className="h-4 w-4 mr-2" />
              리포트 다운로드
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  센터명
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  총 과정
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  활성 과정
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  수익
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  평점
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  액션
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCenterData.map((center) => (
                <tr key={center.centerId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {center.centerName.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{center.centerName}</div>
                        <div className="text-sm text-gray-500">ID: {center.centerId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {center.totalCourses}개
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {center.activeCourses}개
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {center.revenue.toLocaleString()}원
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <span className="mr-1">{center.rating}</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-4 w-4 ${i < Math.floor(center.rating) ? 'text-yellow-400' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`px-2 py-1 rounded-full text-sm ${getStatusColor(center.status)}`}>
                      {getStatusLabel(center.status)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        className="text-blue-600 hover:text-blue-900"
                        onClick={() => {/* 상세보기 로직 */}}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        className="text-green-600 hover:text-green-900"
                        onClick={() => {/* 설정 로직 */}}
                      >
                        <Settings className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 빠른 액션 */}
      <div className="bg-white rounded-lg shadow p-6 mt-8">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">빠른 액션</h3>
          <p className="text-sm text-gray-600">자주 사용하는 기능들에 빠르게 접근하세요.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            className="h-20 flex flex-col items-center justify-center bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            onClick={() => window.location.href = '/admin/teaching-methods'}
          >
            <BarChart3 className="h-6 w-6 mb-2 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">강습법 관리</span>
          </button>
          <button 
            className="h-20 flex flex-col items-center justify-center bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            onClick={() => window.location.href = '/admin/center-levels'}
          >
            <Settings className="h-6 w-6 mb-2 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">센터 레벨 관리</span>
          </button>
          <button 
            className="h-20 flex flex-col items-center justify-center bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            onClick={() => window.location.href = '/admin/revenue'}
          >
            <DollarSign className="h-6 w-6 mb-2 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">수익 분석</span>
          </button>
          <button 
            className="h-20 flex flex-col items-center justify-center bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            onClick={() => window.location.href = '/admin/reports'}
          >
            <Download className="h-6 w-6 mb-2 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">리포트 생성</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseOversightPage;