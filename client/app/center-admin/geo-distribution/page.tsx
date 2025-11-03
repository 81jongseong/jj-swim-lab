/**
 * 🗺️ JJ Swim Lab - 회원 분포도 (센터 관리자용)
 * 
 * 📋 **페이지 목적**
 * - 센터 관리자가 자신이 관리하는 센터들의 회원 분포를 확인
 * - 여러 센터 관리 시 지점별로 선택하여 조회 가능
 * - 전체 통계 및 개별 지점 통계 조회
 * 
 * 🔄 **주요 기능**
 * - 지오해시 블록별 스팟 표시
 * - 관리하는 센터 목록에서 선택하여 조회
 * - 전체 통계 및 지점별 통계 전환
 * - 회원 유형별 필터링 (전체/단체레슨/개인레슨/자유수영)
 * 
 * 🗄️ **데이터 연동**
 * - /api/geo/aggregate API (지오해시 블록 스팟)
 * - useAuth 훅 (관리하는 센터 목록)
 */

'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import apiClient from '../../../utils/api';
import { getAddressFromGeohash, getBlockCenterCoordinates } from '../../../lib/utils/address-utils';

// 동적 import로 SSR 문제 방지
let maplibregl: any;
let MapboxOverlay: any;
let ScatterplotLayer: any;

interface Spot {
  geohash: string;
  lat: number;
  lng: number;
  totalApprox: number;
  dominantCenter: string;
  centers: Array<{ centerId: string; countApprox: number }>;
  memberType?: 'member' | 'instructor' | 'guest' | 'center';
}

interface SpotsData {
  spots: Spot[];
  metadata: {
    totalSpots: number;
    hiddenBlocks: number;
    totalOriginalCount: number;
    totalApproxCount: number;
    precision: number;
    kAnonymity: number;
    noiseEpsilon: number;
    roundingUnit: number;
    memberType: string;
  };
}

const ZOOM_THRESHOLD = 10;

export default function CenterAdminGeoDistributionPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const overlayRef = useRef<any>(null);
  
  const { user, loading } = useAuth();
  const router = useRouter();
  
  // 상태 관리
  const [spots, setSpots] = useState<Spot[]>([]);
  const [metadata, setMetadata] = useState<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [hoveredSpot, setHoveredSpot] = useState<any>(null);
  const [hoveredAddress, setHoveredAddress] = useState<string | null>(null);
  const [librariesLoaded, setLibrariesLoaded] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(12);
  
  // 필터 상태
  const [memberType, setMemberType] = useState<'all' | 'group-lesson' | 'personal-lesson' | 'free-swim'>('all');
  
  // 센터 관리 상태
  const [selectedCenterId, setSelectedCenterId] = useState<string | null>(null);
  const [managedCenters, setManagedCenters] = useState<Array<{ _id: string; name: string }>>([]);

  // 인증 확인 및 센터 목록 로드
  useEffect(() => {
    if (!loading && user) {
      if (user.userType !== 'centerAdmin' && user.userType !== 'center-admin') {
        router.push('/');
        return;
      }

      // 관리하는 센터 목록 로드
      if (user.centerAdminInfo?.managedCenters) {
        const loadCentersWithNames = async () => {
          try {
            const centers = user.centerAdminInfo.managedCenters;
            const centersList = await Promise.all(
              centers.map(async (c: any) => {
                const centerId = c.toString ? c.toString() : c._id?.toString() || c;
                // 센터 정보 조회
                try {
                  const response = await apiClient.get(`/api/center-management/${centerId}`);
                  if (response.success && response.data?.center) {
                    return {
                      _id: centerId,
                      name: response.data.center.name || `센터 ${centerId.substring(0, 8)}`
                    };
                  }
                } catch (error) {
                  console.warn(`센터 ${centerId} 정보 조회 실패:`, error);
                }
                return {
                  _id: centerId,
                  name: `센터 ${centerId.substring(0, 8)}`
                };
              })
            );
            setManagedCenters(centersList);
            setSelectedCenterId(null); // 초기값: "전체 센터 회원"
          } catch (error) {
            console.error('센터 목록 로드 오류:', error);
          }
        };
        loadCentersWithNames();
      }
    }
  }, [user, loading, router]);

  // 라이브러리 동적 로딩
  useEffect(() => {
    const loadLibraries = async () => {
      try {
        console.log('📦 라이브러리 로딩 시작...');
        
        maplibregl = (await import('maplibre-gl')).default;
        console.log('✅ maplibre-gl 로딩 완료');
        
        const deckGl = await import('@deck.gl/mapbox');
        console.log('✅ @deck.gl/mapbox 로딩 완료:', Object.keys(deckGl));
        
        const coreLayers = await import('@deck.gl/layers');
        console.log('✅ @deck.gl/layers 로딩 완료:', Object.keys(coreLayers));

        // Deck.gl 컴포넌트 설정
        MapboxOverlay = deckGl.MapboxOverlay;
        ScatterplotLayer = coreLayers.ScatterplotLayer;
        
        console.log('✅ MapboxOverlay 설정:', !!MapboxOverlay);
        console.log('✅ ScatterplotLayer 설정:', !!ScatterplotLayer);

        // CSS 로딩 (타입 선언 오류 무시)
        // @ts-ignore
        await import('maplibre-gl/dist/maplibre-gl.css');

        console.log('✅ MapLibre + deck.gl 라이브러리 로딩 완료');
        setLibrariesLoaded(true);
      } catch (error) {
        console.error('🚨 라이브러리 로딩 실패:', error);
      }
    };

    loadLibraries();
  }, []);

  // 지도 초기화
  useEffect(() => {
    if (!librariesLoaded || !mapRef.current || !maplibregl || !MapboxOverlay) return;

    const style: any = {
      version: 8,
      sources: {
        'vworld': {
          type: 'raster',
          tiles: [
            `https://api.vworld.kr/req/wmts/1.0.0/${process.env.NEXT_PUBLIC_VWORLD_KEY}/Base/{z}/{y}/{x}.png`
          ],
          tileSize: 256
        }
      },
      layers: [
        {
          id: 'vworld-base',
          type: 'raster',
          source: 'vworld'
        }
      ]
    };

    // 관리자 페이지와 완전히 동일한 지도 설정
    const map = new maplibregl.Map({
      container: mapRef.current,
      style,
      center: [127.0276, 37.4979], // 서울 강남구 중심
      zoom: 12,
      maxZoom: 18,
      minZoom: 8,
      pitch: 0,
      bearing: 0,
      scrollZoom: true,
      boxZoom: true,
      dragRotate: false,
      dragPan: true,
      keyboard: true,
      doubleClickZoom: true,
      touchZoomRotate: true
    });

    mapInstanceRef.current = map;

    // 관리자 페이지와 완전히 동일하게 설정
    const overlay = new MapboxOverlay({
      interleaved: true,
      layers: []
    });
    
    // MapboxOverlay를 지도에 추가
    map.addControl(overlay);
    overlayRef.current = overlay;

    // 줌 레벨 변경 감지
    map.on('zoom', () => {
      setCurrentZoom(map.getZoom());
    });

    // 지도 로딩 완료 - 관리자 페이지와 동일하게 단순 처리
    map.on('load', () => {
      console.log('🗺️ VWorld 지도 로딩 완료');
      setMapLoaded(true);
      
      // 관리자 페이지와 동일하게 바로 데이터 로드
      fetchSpotsData();
    });

    return () => {
      map.remove();
    };
  }, [librariesLoaded]);

  // 스팟 데이터 로딩
  const fetchSpotsData = useCallback(async () => {
    if (!user || !mapLoaded) return;

    setLoadingData(true);
    try {
      const params = new URLSearchParams({
        k: '5',
        memberType: memberType === 'all' ? '' : memberType
      });

      // centerAdmin인 경우 센터 필터링 추가
      if (selectedCenterId) {
        params.append('centerId', selectedCenterId);
      }

      const apiUrl = `/api/geo/aggregate?${params.toString()}`;
      console.log('🔍 API 요청:', apiUrl);
      const response = await apiClient.get(apiUrl);
      
      console.log('🗺️ 지도 데이터 응답:', {
        success: response.success,
        hasData: !!response.data,
        hasCells: !!response.data?.cells,
        cellsCount: response.data?.cells?.length || 0,
        metadata: response.data?.metadata,
        fullResponse: response
      });
      
      if (response.success) {
        const cells = response.data?.cells || response.cells || [];
        console.log(`📍 수신된 셀 데이터: ${cells.length}개`);
        
        if (cells.length === 0) {
          console.warn('⚠️ 셀 데이터가 비어있습니다. 서버 로그를 확인하세요:');
          console.warn(`  - 필터 조건: centerId=${selectedCenterId || 'all'}, memberType=${memberType}`);
          console.warn(`  - metadata:`, response.data?.metadata || response.metadata);
        }
        
        const spotsData: Spot[] = cells
          .filter((cell: any) => {
            // 더 엄격한 유효성 검사
            const lat = Number(cell.lat);
            const lng = Number(cell.lng);
            const countApprox = Number(cell.countApprox);
            const isValid = !isNaN(lat) && !isNaN(lng) && !isNaN(countApprox) && 
                           lat !== 0 && lng !== 0 && countApprox > 0 &&
                           lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
            if (!isValid) {
              console.warn('⚠️ 유효하지 않은 셀 필터링:', cell, { lat, lng, countApprox });
            }
            return isValid;
          })
          .map((cell: any) => {
            // 명시적으로 숫자로 변환하고 0 체크
            const lat = Number(cell.lat);
            const lng = Number(cell.lng);
            const totalApprox = Number(cell.countApprox);
            return {
              geohash: cell.h3Index || cell.h3 || '',
              lat: lat,
              lng: lng,
              totalApprox: totalApprox,
              dominantCenter: cell.centerName || cell.dominantCenter || '기타',
              centers: cell.centers || [],
              memberType: memberType === 'all' ? undefined : memberType
            };
          });

        console.log(`✅ 처리된 스팟 데이터: ${spotsData.length}개`);
        setSpots(spotsData);
        setMetadata(response.data?.metadata || response.metadata || {});
      } else {
        console.warn('⚠️ API 응답이 성공하지 않았습니다:', response);
        setSpots([]);
        setMetadata(null);
      }
    } catch (error) {
      console.error('❌ 스팟 데이터 로딩 오류:', error);
      setSpots([]);
      setMetadata(null);
    } finally {
      setLoadingData(false);
    }
  }, [user, mapLoaded, memberType, selectedCenterId]);

  // 필터 변경 시 데이터 재로딩
  useEffect(() => {
    if (librariesLoaded && mapLoaded) {
      fetchSpotsData();
    }
  }, [librariesLoaded, mapLoaded, memberType, selectedCenterId, fetchSpotsData]);

  // 반경 계산 함수 (관리자 페이지와 동일한 방식)
  const scaleRadius = useCallback((n: number, memberType?: string) => {
    // 센터는 고정 크기 사용
    if (memberType === 'center') {
      if (currentZoom >= 15) {
        return 25;
      } else if (currentZoom >= 12) {
        return 40;
      } else if (currentZoom >= 10) {
        return 60;
      } else if (currentZoom >= 9) {
        return 80;
      } else {
        return 100;
      }
    }
    
    // 일반 회원/강사/게스트는 줌 레벨에 따른 크기
    let baseRadius: number;
    
    if (currentZoom >= 16) {
      baseRadius = 30;
    } else if (currentZoom >= 15) {
      baseRadius = 50;
    } else if (currentZoom >= 12) {
      baseRadius = 100;
    } else if (currentZoom >= 10) {
      baseRadius = 200;
    } else if (currentZoom >= 9) {
      baseRadius = 500;
    } else {
      baseRadius = 1000;
    }
    
    return baseRadius;
  }, [currentZoom]);

  // 스팟 레이어 생성 (관리자 페이지와 완전히 동일한 방식)
  const buildSpotsLayer = useCallback(() => {
    // 관리자 페이지처럼 단순 필터링만 수행 (데이터 변환 없이)
    const filteredSpots = spots.filter(s => {
      // null/undefined 체크
      if (!s || !s.dominantCenter) {
        console.warn('⚠️ 유효하지 않은 스팟 데이터:', s);
        return false;
      }
      // 좌표 유효성 검사 추가
      if (typeof s.lat !== 'number' || typeof s.lng !== 'number' || isNaN(s.lat) || isNaN(s.lng)) {
        console.warn('⚠️ 유효하지 않은 좌표:', s);
        return false;
      }
      // 센터 관리자는 모든 스팟 데이터를 표시
      return true;
    });
    
    console.log('🔧 스팟 레이어 생성:', filteredSpots.length, '개 스팟');
    console.log('📍 스팟 위치 샘플:', filteredSpots.slice(0, 3).map(s => ({ 
      geohash: s.geohash, 
      lat: s.lat, 
      lng: s.lng, 
      totalApprox: s.totalApprox,
      dominantCenter: s.dominantCenter 
    })));
    
    // 스팟 위치 중복 확인 및 겹침 방지 데이터 준비
    const positions = filteredSpots.map(s => `${s.lat.toFixed(6)},${s.lng.toFixed(6)}`);
    const uniquePositions = new Set(positions);
    console.log('📍 위치 중복 확인:', positions.length, '개 위치,', uniquePositions.size, '개 고유 위치');
    
    // ✅ 겹침 방지: 같은 위치의 스팟들을 약간 분산시키기 위한 맵 생성
    const positionCountMap = new Map<string, number>();
    filteredSpots.forEach((spot) => {
      const posKey = `${spot.lat.toFixed(6)},${spot.lng.toFixed(6)}`;
      positionCountMap.set(posKey, (positionCountMap.get(posKey) || 0) + 1);
    });
    
    // 위치별 인덱스 추적 (동일 위치의 여러 스팟 분산용)
    const positionIndexMap = new Map<string, number>();
    
    // ✅ 상대적 크기 스케일링: 현재 화면에 표시된 스팟들 중 최소/최대 회원 수 기준
    // - 줌 아웃 시 숫자가 커져도 상대적으로 표현 (가장 큰 스팟 = 최대 크기, 가장 작은 스팟 = 최소 크기)
    const memberCounts = filteredSpots.map(s => s.totalApprox || 0).filter(c => c > 0);
    const minCount = memberCounts.length > 0 ? Math.min(...memberCounts) : 30;
    const maxCount = memberCounts.length > 0 ? Math.max(...memberCounts) : 300;
    const minRadius = 30; // 최소 스팟 크기 (미터)
    const maxRadius = 300; // 최대 스팟 크기 (미터)
    
    // 첫 로그에만 상대적 스케일링 정보 출력
    if (filteredSpots.length > 0) {
      console.log(`📊 상대적 크기 스케일링: 회원 수 ${minCount}~${maxCount}명 → 크기 ${minRadius}~${maxRadius}m`);
    }
    
    return new ScatterplotLayer({
      id: 'spots',
      data: filteredSpots,
      pickable: true,
      getPosition: (d: Spot) => {
        if (!d || typeof d.lng !== 'number' || typeof d.lat !== 'number') {
          console.warn('⚠️ 스팟 데이터가 null이거나 좌표가 없습니다:', d);
          return [126.9780, 37.5665]; // 서울 시청 좌표 (기본값)
        }
        
        // ✅ 겹침 방지: 같은 위치에 여러 스팟이 있을 때 약간 분산
        const posKey = `${d.lat.toFixed(6)},${d.lng.toFixed(6)}`;
        const countAtPosition = positionCountMap.get(posKey) || 1;
        const currentIndex = positionIndexMap.get(posKey) || 0;
        
        // 같은 위치에 여러 스팟이 있는 경우만 약간 분산 (최대 15m 이내)
        if (countAtPosition > 1) {
          const angle = (currentIndex / countAtPosition) * 2 * Math.PI;
          const offsetDistance = Math.min(15, 5 * countAtPosition); // 스팟 개수에 비례하여 최대 15m
          const offsetLat = (offsetDistance / 111320) * Math.sin(angle);
          const offsetLng = (offsetDistance / (111320 * Math.cos(d.lat * Math.PI / 180))) * Math.cos(angle);
          
          // 인덱스 증가 (다음 스팟을 위한)
          positionIndexMap.set(posKey, currentIndex + 1);
          
          return [d.lng + offsetLng, d.lat + offsetLat];
        }
        
        // 단일 스팟은 원래 위치 사용
        // ⚠️ 중요: API에서 이미 계산된 블록 중심 좌표를 사용
        return [d.lng, d.lat];
      },
      
      getFillColor: (d: Spot) => {
        if (!d || !d.dominantCenter) {
          console.warn('⚠️ 스팟 데이터가 null이거나 dominantCenter가 없습니다:', d);
          return [128, 128, 128, 150]; // 기본 회색
        }
        const center = d.dominantCenter;
        const colors: Record<string, [number, number, number, number]> = {
          'JJ Swim Lab': [255, 99, 132, 200],
          '강남센터': [255, 99, 132, 200],
          '홍대센터': [54, 162, 235, 200],
          '송파센터': [255, 205, 86, 200],
          '마포센터': [75, 192, 192, 200],
        };
        return colors[center] || [153, 102, 255, 200];
      },
      getRadius: (d: Spot) => {
        // ✅ 화면상 픽셀 크기 고정 (줌 레벨 무관) - 제곱근 스케일링으로 배수 관계 완화
        // - 화면에서 보이는 원의 크기는 항상 고정된 픽셀 크기로 표시
        // - 줌 레벨에 상관없이 화면상에서 같은 크기 유지
        // - 회원 수에 따라 상대적 크기 표현 (제곱근 스케일링으로 배수보다 부드럽게)
        if (!d || typeof d.totalApprox !== 'number') {
          console.warn('⚠️ 스팟 데이터가 null이거나 totalApprox가 없습니다:', d);
          return 18; // 최소 픽셀 크기 반환
        }
        
        const memberCount = d.totalApprox || minCount;
        
        // ✅ 제곱근 스케일링으로 배수 관계 완화 (50명과 10명의 차이가 5배가 아닌 더 부드럽게)
        // 최소/최대 픽셀 크기 조정 (최소 크기 증가, 차이 완화)
        const minPixels = 18; // 최소 크기 증가 (이전 8px → 18px)
        const maxPixels = 38; // 최대 크기 감소 (이전 50px → 38px) - 차이 완화
        
        let radiusPixels: number;
        if (maxCount === minCount) {
          // 모든 스팟이 같은 회원 수인 경우 중간 크기 반환
          radiusPixels = (minPixels + maxPixels) / 2;
        } else {
          // 제곱근 스케일링: memberCount의 제곱근을 사용하여 배수 관계 완화
          // 예: 10명 → sqrt(10) ≈ 3.16, 50명 → sqrt(50) ≈ 7.07 (비율: 약 2.24배)
          // 선형 스케일링: 10명 → 1.0, 50명 → 5.0 (비율: 5배) ← 이전 방식
          const sqrtMin = Math.sqrt(Math.max(1, minCount)); // 최소값의 제곱근
          const sqrtMax = Math.sqrt(Math.max(1, maxCount)); // 최대값의 제곱근
          const sqrtCurrent = Math.sqrt(Math.max(1, memberCount)); // 현재값의 제곱근
          
          // 제곱근 값을 픽셀 범위로 매핑
          const ratio = (sqrtCurrent - sqrtMin) / (sqrtMax - sqrtMin);
          radiusPixels = minPixels + ratio * (maxPixels - minPixels);
        }
        
        // 범위 제한 (안전장치)
        radiusPixels = Math.max(minPixels, Math.min(maxPixels, radiusPixels));
        
        return radiusPixels;
      },
      radiusUnits: 'pixels', // ✅ 픽셀 단위로 고정 (줌 레벨과 무관하게 화면상 크기 일정)
      stroked: true,
      getLineColor: [255, 255, 255, 255],
      lineWidthMinPixels: 2,
      onHover: ({ object, x, y }) => {
        if (object) {
          setHoveredSpot({
            x,
            y,
            data: object
          });
          // Geohash를 한글 주소로 변환
          if (object.geohash) {
            getAddressFromGeohash(object.geohash)
              .then(address => setHoveredAddress(address))
              .catch(() => setHoveredAddress(null));
          } else {
            setHoveredAddress(null);
          }
        } else {
          setHoveredSpot(null);
          setHoveredAddress(null);
        }
      }
    });
    
    // 회원 수를 표시하는 TextLayer 생성 (가독성 개선)
    // ✅ 최소 단위 1명으로 변경되어 1명 이상 모두 표시
    const textSpots = filteredSpots.filter(s => {
      const memberCount = s.totalApprox || 0;
      // 최소 단위는 1명이므로 1명 이상 모두 표시
      return memberCount >= 1; // 최소 1명 이상만 숫자 표시
    });
    
    if (TextLayer && textSpots.length > 0) {
      // ✅ 텍스트 가독성 향상: 외곽선 효과 (어두운 배경 레이어 + 밝은 텍스트 레이어)
      // 1단계: 어두운 외곽선 레이어 (배경)
      const textBackgroundLayer = new TextLayer({
        id: 'spots-text-background',
        data: textSpots,
        pickable: false,
        getPosition: (d: Spot) => {
          if (!d || typeof d.lng !== 'number' || typeof d.lat !== 'number') {
            return [126.9780, 37.5665];
          }
          return [d.lng, d.lat];
        },
        getText: (d: Spot) => String(d.totalApprox || 0),
        getColor: [0, 0, 0, 220], // 검은색 반투명 (외곽선 효과)
        getSize: 18, // 배경은 조금 더 크게
        fontFamily: 'Arial, sans-serif',
        fontWeight: 'bold',
        sizeScale: 1,
        sizeMaxPixels: 24,
        sizeMinPixels: 14,
        getTextAnchor: 'middle',
        getAlignmentBaseline: 'center',
        characterSet: 'auto'
      });
      
      // 2단계: 밝은 텍스트 레이어 (전면)
      const textForegroundLayer = new TextLayer({
        id: 'spots-text-foreground',
        data: textSpots,
        pickable: false,
        getPosition: (d: Spot) => {
          if (!d || typeof d.lng !== 'number' || typeof d.lat !== 'number') {
            return [126.9780, 37.5665];
          }
          return [d.lng, d.lat];
        },
        getText: (d: Spot) => String(d.totalApprox || 0),
        getColor: [255, 255, 255, 255], // 흰색 텍스트
        getSize: 16, // 텍스트 크기 증가
        fontFamily: 'Arial, sans-serif',
        fontWeight: 'bold',
        sizeScale: 1,
        sizeMaxPixels: 22,
        sizeMinPixels: 14,
        getTextAnchor: 'middle',
        getAlignmentBaseline: 'center',
        characterSet: 'auto'
      });
      
      return [spotsLayer, textBackgroundLayer, textForegroundLayer];
    }
    
    return spotsLayer;
  }, [spots, currentZoom, scaleRadius]);

  // Deck.gl 레이어 업데이트 (관리자 페이지와 완전히 동일한 방식)
  useEffect(() => {
    if (!overlayRef.current || !spots || !spots.length) {
      console.log('⚠️ 스팟 레이어 업데이트 건너뜀:', {
        hasOverlay: !!overlayRef.current,
        spotsLength: spots?.length || 0
      });
      return;
    }

    console.log('🔧 스팟 레이어 업데이트 시작:', spots.length, '개 스팟');
    console.log('🗺️ 현재 줌 레벨:', currentZoom);
    
    const layers = buildSpotsLayer();
    
    // 레이어가 null이면 건너뛰기 (관리자 페이지에는 이 체크가 없지만 안전을 위해 추가)
    if (!layers) {
      console.warn('⚠️ 레이어 생성 실패 - 유효한 데이터가 없음');
      overlayRef.current.setProps({ layers: [] });
      return;
    }
    
    // layers는 배열일 수도 있고 단일 레이어일 수도 있음
    const layersArray = Array.isArray(layers) ? layers : [layers];
    
    console.log('📦 생성된 레이어:', layersArray.length, '개');
    
    // 관리자 페이지와 완전히 동일하게 바로 호출
    overlayRef.current.setProps({
      layers: layersArray
    });
    
    console.log('✅ 스팟 레이어 업데이트 완료');
  }, [spots, currentZoom, buildSpotsLayer]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user || (user.userType !== 'centerAdmin' && user.userType !== 'center-admin')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">접근 권한 없음</h1>
          <p className="text-gray-600">이 페이지는 센터 관리자만 접근할 수 있습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🗺️ 회원 분포도</h1>
          <p className="text-gray-600">관리하는 센터의 회원 분포를 지도에서 확인하세요</p>
        </div>

        {/* 컨트롤 패널 */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* 센터 선택 */}
            {managedCenters.length > 0 && (
              <label className="text-sm flex items-center gap-2">
                센터:
                <select 
                  className="border rounded px-3 py-1 min-w-[150px]" 
                  value={selectedCenterId || 'all'} 
                  onChange={e => {
                    const value = e.target.value;
                    setSelectedCenterId(value === 'all' ? null : value);
                  }}
                >
                  <option value="all">📊 전체 센터 회원</option>
                  {managedCenters.map((center) => (
                    <option key={center._id} value={center._id}>
                      {center.name}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {/* 유형 필터 */}
            <label className="text-sm flex items-center gap-2">
              유형:
              <select 
                className="border rounded px-3 py-1" 
                value={memberType} 
                onChange={e => setMemberType(e.target.value as any)}
              >
                <option value="all">전체</option>
                <option value="group-lesson">단체레슨</option>
                <option value="personal-lesson">개인레슨</option>
                <option value="free-swim">자유수영</option>
              </select>
            </label>

            {/* 새로고침 버튼 */}
            <button
              onClick={fetchSpotsData}
              disabled={loadingData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loadingData ? '로딩 중...' : '새로고침'}
            </button>
          </div>
        </div>

        {/* 지도 */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div ref={mapRef} className="w-full h-[600px]" />
          
          {/* 툴팁 */}
          {hoveredSpot && (
            <div className="absolute bg-white p-3 rounded-lg shadow-lg border border-gray-200 pointer-events-none z-10"
                 style={{ left: hoveredSpot.x + 15, top: hoveredSpot.y + 15 }}>
              <div className="text-sm">
                <div className="font-semibold mb-1">
                  📍 집계 구역: {hoveredAddress || hoveredSpot.data?.geohash || '알 수 없음'}
                </div>
                <div className="text-blue-600 mb-1">
                  🏠 센터: <strong>{hoveredSpot.data?.dominantCenter || hoveredSpot.dominantCenter}</strong>
                </div>
                <div className="text-gray-700">
                  예상 회원 수: <strong>약 {hoveredSpot.data?.totalApprox || hoveredSpot.totalApprox}명 (익명처리)</strong>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 메타데이터 */}
        {metadata && (
          <div className="mt-6 bg-white rounded-lg shadow-sm p-4">
            <h3 className="text-lg font-semibold mb-2">통계 정보</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-gray-600">총 스팟 수</div>
                <div className="text-2xl font-bold">{metadata.totalCells || 0}</div>
              </div>
              <div>
                <div className="text-gray-600">표시된 스팟 수</div>
                <div className="text-2xl font-bold">{metadata.filteredCells || 0}</div>
              </div>
              <div>
                <div className="text-gray-600">K-익명성</div>
                <div className="text-2xl font-bold">{metadata.k || 'N/A'}</div>
              </div>
              <div>
                <div className="text-gray-600">처리된 회원 수</div>
                <div className="text-2xl font-bold">{spots.length > 0 ? spots.reduce((sum, s) => sum + s.totalApprox, 0) : 0}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
