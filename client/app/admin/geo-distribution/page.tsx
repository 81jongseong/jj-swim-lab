'use client';

/**
 * 🗺️ 회원 지리적 분포 시각화 페이지
 * 
 * 📋 **기능**
 * - 프라이버시 보호된 회원 분포 지도 시각화
 * - deck.gl H3HexagonLayer 사용
 * - 센터별 색상 구분 및 필터링
 * - k-익명성(k≥5) 보장
 * 
 * 🔄 **주요 기능**
 * 1. H3 헥사곤 지도 시각화
 * 2. 센터/기간/회원유형 필터
 * 3. 인터랙티브 툴팁
 * 4. CSV 내보내기
 * 
 * 🔒 **프라이버시 보호**
 * - 원본 주소 절대 노출 금지
 * - 집계 데이터만 표시
 * - k<5 셀 자동 필터링
 * - 노이즈 추가 및 반올림
 * 
 * 📅 **수정 히스토리**
 * - 2025-01-13: 초기 구현 (deck.gl + H3)
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import DeckGL from '@deck.gl/react';
import { H3HexagonLayer } from '@deck.gl/geo-layers';
import { Map } from 'react-map-gl';
import { PRIVACY_NOTICE } from '../../../lib/geo/privacy';

// Mapbox 토큰 (환경변수 또는 기본값)
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 'pk.your_token_here';

interface H3Cell {
  h3Index: string;
  lat: number;
  lng: number;
  countApprox: number;
  centerId?: string;
  centerName?: string;
}

interface Center {
  _id: string;
  name: string;
  region?: string;
  city?: string;
}

const INITIAL_VIEW_STATE = {
  longitude: 126.9780,
  latitude: 37.5665,
  zoom: 10,
  pitch: 45,
  bearing: 0,
};

// 색상 스케일 (회원 수에 따라)
const COLOR_SCALE = [
  [26, 152, 80],    // 5-10명: 초록
  [102, 189, 99],   // 10-20명: 연한 초록
  [166, 217, 106],  // 20-30명: 노랑-초록
  [254, 224, 139],  // 30-40명: 노랑
  [253, 174, 97],   // 40-50명: 주황
  [244, 109, 67],   // 50-60명: 진한 주황
  [215, 48, 39],    // 60+명: 빨강
];

export default function GeoDistributionPage() {
  const { user } = useAuth();
  const [cells, setCells] = useState<H3Cell[]>([]);
  const [centers, setCenters] = useState<Center[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCenter, setSelectedCenter] = useState<string>('all');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [memberType, setMemberType] = useState<string>('all');
  const [metadata, setMetadata] = useState<any>(null);
  const [hoverInfo, setHoverInfo] = useState<any>(null);

  // 권한 확인
  useEffect(() => {
    if (!user) return;
    if (user.userType !== 'superAdmin' && user.userType !== 'centerAdmin') {
      alert('지리적 분포 조회 권한이 없습니다.');
      window.location.href = '/';
    }
  }, [user]);

  // 센터 목록 로드
  useEffect(() => {
    loadCenters();
  }, []);

  // 분포 데이터 로드
  useEffect(() => {
    if (user) {
      loadDistribution();
    }
  }, [user, selectedCenter, dateRange, memberType]);

  const loadCenters = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/geo/centers', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCenters(data.centers || []);
      }
    } catch (error) {
      console.error('센터 목록 로드 실패:', error);
    }
  };

  const loadDistribution = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (selectedCenter !== 'all') params.append('centerId', selectedCenter);
      if (dateRange.from) params.append('from', dateRange.from);
      if (dateRange.to) params.append('to', dateRange.to);
      if (memberType !== 'all') params.append('memberType', memberType);

      const response = await fetch(`http://localhost:5000/api/geo/aggregate?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCells(data.cells || []);
        setMetadata(data.metadata);
        console.log(`📍 분포 데이터 로드: ${data.cells?.length || 0}개 셀`);
      } else {
        console.error('분포 데이터 로드 실패:', response.statusText);
        setCells([]);
      }
    } catch (error) {
      console.error('분포 데이터 로드 오류:', error);
      setCells([]);
    } finally {
      setLoading(false);
    }
  };

  // H3 Hexagon Layer
  const hexagonLayer = useMemo(() => {
    if (!cells || cells.length === 0) return null;

    return new H3HexagonLayer({
      id: 'h3-hexagon-layer',
      data: cells,
      pickable: true,
      wireframe: false,
      filled: true,
      extruded: true,
      elevationScale: 20,
      getHexagon: (d: H3Cell) => d.h3Index,
      getFillColor: (d: H3Cell) => {
        // 회원 수에 따른 색상 선택
        const count = d.countApprox;
        if (count < 10) return COLOR_SCALE[0];
        if (count < 20) return COLOR_SCALE[1];
        if (count < 30) return COLOR_SCALE[2];
        if (count < 40) return COLOR_SCALE[3];
        if (count < 50) return COLOR_SCALE[4];
        if (count < 60) return COLOR_SCALE[5];
        return COLOR_SCALE[6];
      },
      getElevation: (d: H3Cell) => d.countApprox,
      onHover: (info: any) => setHoverInfo(info),
      updateTriggers: {
        getFillColor: [cells],
        getElevation: [cells],
      },
    });
  }, [cells]);

  // CSV 내보내기
  const exportToCSV = () => {
    if (cells.length === 0) {
      alert('내보낼 데이터가 없습니다.');
      return;
    }

    const csvHeader = 'H3 Index,Latitude,Longitude,Count (Approx),Center\n';
    const csvRows = cells.map(cell => 
      `${cell.h3Index},${cell.lat},${cell.lng},${cell.countApprox},${cell.centerName || 'N/A'}`
    ).join('\n');

    const csvContent = csvHeader + csvRows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `member-distribution-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading && cells.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">데이터 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">🗺️ 회원 지리적 분포</h1>
          <p className="mt-2 text-gray-600">
            프라이버시 보호된 회원 분포 시각화 (k-익명성 보장)
          </p>
        </div>

        {/* 필터 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* 센터 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">센터</label>
              <select
                value={selectedCenter}
                onChange={(e) => setSelectedCenter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">전체 센터</option>
                {centers.map(center => (
                  <option key={center._id} value={center._id}>
                    {center.name} ({center.region || '지역 미설정'})
                  </option>
                ))}
              </select>
            </div>

            {/* 시작일 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">가입 시작일</label>
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 종료일 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">가입 종료일</label>
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 회원 유형 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">회원 유형</label>
              <select
                value={memberType}
                onChange={(e) => setMemberType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">전체</option>
                <option value="student">학생</option>
                <option value="instructor">강사</option>
              </select>
            </div>
          </div>

          {/* 통계 */}
          {metadata && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{metadata.filteredCells}</div>
                  <div className="text-sm text-gray-600">표시된 지역</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">k ≥ {metadata.k}</div>
                  <div className="text-sm text-gray-600">익명성 보장</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">{metadata.totalCells - metadata.filteredCells}</div>
                  <div className="text-sm text-gray-600">필터링된 지역</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 지도 */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden" style={{ height: '600px' }}>
          <DeckGL
            initialViewState={INITIAL_VIEW_STATE}
            controller={true}
            layers={hexagonLayer ? [hexagonLayer] : []}
          >
            <Map
              mapboxAccessToken={MAPBOX_TOKEN}
              mapStyle="mapbox://styles/mapbox/light-v10"
            />

            {/* 툴팁 */}
            {hoverInfo && hoverInfo.object && (
              <div
                style={{
                  position: 'absolute',
                  zIndex: 1,
                  pointerEvents: 'none',
                  left: hoverInfo.x,
                  top: hoverInfo.y,
                }}
              >
                <div className="bg-white rounded-lg shadow-lg p-3 border border-gray-200">
                  <div className="text-sm font-medium text-gray-900">
                    {hoverInfo.object.centerName || '여러 센터'}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    회원 수: 약 {hoverInfo.object.countApprox}명
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    (±1~±2 노이즈 포함)
                  </div>
                </div>
              </div>
            )}
          </DeckGL>
        </div>

        {/* 범례 */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">범례</h3>
          <div className="flex flex-wrap gap-4">
            {[
              { range: '5-10명', color: COLOR_SCALE[0] },
              { range: '10-20명', color: COLOR_SCALE[1] },
              { range: '20-30명', color: COLOR_SCALE[2] },
              { range: '30-40명', color: COLOR_SCALE[3] },
              { range: '40-50명', color: COLOR_SCALE[4] },
              { range: '50-60명', color: COLOR_SCALE[5] },
              { range: '60+명', color: COLOR_SCALE[6] },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <div
                  className="w-6 h-6 rounded"
                  style={{ backgroundColor: `rgb(${item.color.join(',')})` }}
                />
                <span className="text-sm text-gray-700">{item.range}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
          >
            📥 CSV 내보내기
          </button>
        </div>

        {/* 프라이버시 안내 */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">🔒 개인정보 보호 안내</h4>
          <p className="text-xs text-blue-800 whitespace-pre-line">{PRIVACY_NOTICE}</p>
        </div>
      </div>
    </div>
  );
}

