/**
 * 🗺️ GeoDistributionMap 컴포넌트
 * 
 * 📋 **컴포넌트 목적**
 * - 회원 분포도를 지도에 시각화하는 재사용 가능한 컴포넌트
 * - 스팟 표현, 센터별 색상, 줌 처리, 마우스 호버 등 모든 지도 기능 포함
 * 
 * 🔄 **주요 기능**
 * - 스팟 표현 (ScatterplotLayer)
 * - 센터별 색상 구분
 * - 스팟 크기 조절 (회원 수 기반, 제곱근 스케일링)
 * - 줌인/아웃에 따른 스팟 합쳐지기/분리 (API의 aggregation precision 자동 조정)
 * - 마우스 호버 시 주소 표시
 * - 선택한 센터만 필터링 (activeCenters)
 * 
 * 🗄️ **데이터 연동**
 * - spots: Spot[] - 표시할 스팟 데이터
 * - activeCenters: Set<string> - 활성화된 센터 목록 (필터링용)
 * 
 * 📝 **Props**
 * - spots: Spot[] - 스팟 데이터 배열
 * - activeCenters?: Set<string> - 활성화된 센터 목록 (없으면 모든 스팟 표시)
 * - currentZoom: number - 현재 줌 레벨
 * - onSpotHover?: (spot: Spot | null) => void - 스팟 호버 콜백
 * - className?: string - 추가 CSS 클래스
 */

'use client';
import { logger } from '@/lib/logger';

import { useEffect, useRef, useState, useCallback } from 'react';
import { getAddressFromGeohash } from '../../lib/utils/address-utils';

// 동적 import로 SSR 문제 방지
let maplibregl: any;
let MapboxOverlay: any;
let ScatterplotLayer: any;
let TextLayer: any;

export interface Spot {
  geohash: string;
  lat: number;
  lng: number;
  totalApprox: number;
  dominantCenter: string;
  centers: Array<{ centerId: string; countApprox: number }>;
  memberType?: 'member' | 'instructor' | 'guest' | 'center';
}

interface GeoDistributionMapProps {
  spots: Spot[];
  activeCenters?: Set<string>; // 필터링용 센터 목록 (없으면 모든 스팟 표시)
  currentZoom: number;
  onSpotHover?: (spot: Spot | null, address: string | null, coordinates?: { x: number; y: number }) => void;
  onZoomChange?: (zoom: number) => void; // 줌 레벨 변경 콜백
  onMapLoad?: () => void; // ✅ 지도 로딩 완료 콜백
  className?: string;
}

// 센터별 색상 매핑
const getCenterColor = (centerId: string, isVisible: boolean = true): [number, number, number, number] => {
  if (!isVisible) {
    return [128, 128, 128, 150]; // 비공개 센터는 회색
  }
  
  const colors: Record<string, [number, number, number, number]> = {
    '강남센터': [255, 99, 132, 200],   // 빨간색
    '홍대센터': [54, 162, 235, 200],   // 파란색
    '송파센터': [255, 205, 86, 200],   // 노란색
    '마포센터': [75, 192, 192, 200],   // 청록색
    '수원센터': [153, 102, 255, 200],  // 보라색
    '성남센터': [255, 159, 64, 200],   // 주황색
    '인천센터': [199, 199, 199, 200],  // 회색
    '부산센터': [83, 102, 255, 200],   // 진파랑
    '대구센터': [255, 99, 255, 200],   // 분홍색
    '광주센터': [99, 255, 132, 200],   // 연두색
    '대전센터': [255, 205, 86, 200],   // 노란색
    '울산센터': [255, 99, 132, 200],   // 빨간색
    '세종센터': [54, 162, 235, 200],   // 파란색
    '춘천센터': [75, 192, 192, 200],   // 청록색
    '강릉센터': [255, 159, 64, 200],   // 주황색
    'anonymous': [200, 200, 200, 150], // 익명화된 센터
  };
  return colors[centerId] || [153, 102, 255, 200]; // 기본 보라색
};

export default function GeoDistributionMap({
  spots,
  activeCenters,
  currentZoom,
  onSpotHover,
  onZoomChange,
  onMapLoad,
  className = ''
}: GeoDistributionMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const overlayRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [librariesLoaded, setLibrariesLoaded] = useState(false);
  const [hoveredAddress, setHoveredAddress] = useState<string | null>(null);
  const lastHoveredSpotRef = useRef<Spot | null>(null); // 마지막으로 호버된 스팟 추적

  // 라이브러리 동적 로딩
  useEffect(() => {
    const loadLibraries = async () => {
      if (typeof window === 'undefined') return;

      try {
        // maplibre-gl 로딩
        if (!maplibregl) {
          const maplibreModule = await import('maplibre-gl');
          maplibregl = maplibreModule.default;
          // CSS 로딩
          await import('maplibre-gl/dist/maplibre-gl.css');
        }

        // @deck.gl/mapbox 로딩
        if (!MapboxOverlay) {
          const mapboxModule = await import('@deck.gl/mapbox');
          MapboxOverlay = mapboxModule.MapboxOverlay;
        }

        // @deck.gl/layers 로딩
        if (!ScatterplotLayer || !TextLayer) {
          const layersModule = await import('@deck.gl/layers');
          ScatterplotLayer = layersModule.ScatterplotLayer;
          TextLayer = layersModule.TextLayer;
        }

        setLibrariesLoaded(true);
        logger.info('✅ MapLibre + deck.gl 라이브러리 로딩 완료');
      } catch (error) {
        logger.error('❌ 라이브러리 로딩 오류:', error);
      }
    };

    loadLibraries();
  }, []);

  // 지도 초기화
  useEffect(() => {
    if (!librariesLoaded || !mapRef.current || mapInstanceRef.current) return;

    // VWorld Raster Tiles 사용 (CORS 문제 방지)
    const vworldKey = process.env.NEXT_PUBLIC_VWORLD_KEY || '';
    const style: any = {
      version: 8,
      sources: {
        'vworld': {
          type: 'raster',
          tiles: [
            `https://api.vworld.kr/req/wmts/1.0.0/${vworldKey}/Base/{z}/{y}/{x}.png`
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

    const overlay = new MapboxOverlay({
      layers: []
    });

    map.addControl(overlay);
    mapInstanceRef.current = map;
    overlayRef.current = overlay;

    map.on('load', () => {
      logger.info('🗺️ VWorld 지도 로딩 완료');
      setMapLoaded(true);
      // ✅ 부모 컴포넌트에 지도 로딩 완료 알림
      if (onMapLoad) {
        onMapLoad();
      }
    });

    // 줌 레벨 변경 감지 및 콜백 호출
    map.on('zoom', () => {
      const zoom = map.getZoom();
      if (onZoomChange) {
        onZoomChange(zoom);
      }
    });

    // ✅ 마우스가 지도 밖으로 나가면 툴팁 숨김
    const handleMouseLeave = () => {
      setHoveredAddress(null);
      lastHoveredSpotRef.current = null;
      if (onSpotHover) {
        onSpotHover(null, null);
      }
    };
    
    // ✅ 마우스 이동 시 스팟 위에 있지 않으면 툴팁 숨김을 위한 타이머
    let hoverTimeout: NodeJS.Timeout | null = null;
    
    const handleMouseMove = () => {
      // 마우스 이동 시마다 타이머를 리셋
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
      
      // 짧은 시간 후에 체크: deck.gl의 onHover가 호출되지 않았다면
      // (즉, 마우스가 스팟 위에 있지 않다면) 툴팁 숨김
      hoverTimeout = setTimeout(() => {
        // deck.gl의 onHover가 호출되지 않았다면 툴팁 숨김
        // 하지만 이 방법은 부정확할 수 있으므로, onHover에서 직접 처리하는 것이 더 나음
      }, 100);
    };
    
    map.getCanvas().addEventListener('mouseleave', handleMouseLeave);
    map.getCanvas().addEventListener('mousemove', handleMouseMove);

    return () => {
      // ✅ 이벤트 리스너 정리
      if (map.getCanvas()) {
        map.getCanvas().removeEventListener('mouseleave', handleMouseLeave);
        map.getCanvas().removeEventListener('mousemove', handleMouseMove);
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [librariesLoaded]);

  // 스팟 레이어 생성
  const buildSpotsLayer = useCallback(() => {
    if (!ScatterplotLayer || !TextLayer) {
      logger.warn('⚠️ Deck.gl 라이브러리가 아직 로딩되지 않았습니다.');
      return [];
    }

    // 필터링: activeCenters가 있으면 해당 센터만 표시, 없으면 모든 스팟 표시
    const filteredSpots = spots.filter(s => {
      if (!s || !s.dominantCenter) return false;
      if (typeof s.lat !== 'number' || typeof s.lng !== 'number' || isNaN(s.lat) || isNaN(s.lng)) return false;
      
      // activeCenters가 없으면 모든 스팟 표시
      if (!activeCenters) return true;
      
      // activeCenters가 있으면 해당 센터만 표시 ("기타" 제외)
      return activeCenters.has(s.dominantCenter) && s.dominantCenter !== '기타';
    });

    if (filteredSpots.length === 0) {
      return [];
    }

    // 겹침 방지: 같은 위치의 스팟들을 약간 분산시키기 위한 맵 생성
    const positionCountMap = new Map<string, number>();
    filteredSpots.forEach((spot) => {
      const posKey = `${spot.lat.toFixed(6)},${spot.lng.toFixed(6)}`;
      positionCountMap.set(posKey, (positionCountMap.get(posKey) || 0) + 1);
    });

    // 위치별 인덱스 추적 (동일 위치의 여러 스팟 분산용)
    const positionIndexMap = new Map<string, number>();
    const textPositionIndexMap = new Map<string, number>();

    // 상대적 크기 스케일링: 현재 화면에 표시된 스팟들 중 최소/최대 회원 수 기준
    const memberCounts = filteredSpots.map(s => s.totalApprox || 0).filter(c => c > 0);
    const minCount = memberCounts.length > 0 ? Math.min(...memberCounts) : 1;
    const maxCount = memberCounts.length > 0 ? Math.max(...memberCounts) : 100;

    // 스팟 레이어 생성
    const spotsLayer = new ScatterplotLayer({
      id: 'spots',
      data: filteredSpots,
      pickable: true,
      getPosition: (d: Spot) => {
        // 겹침 방지: 같은 위치에 여러 스팟이 있을 때 약간 분산
        const posKey = `${d.lat.toFixed(6)},${d.lng.toFixed(6)}`;
        const countAtPosition = positionCountMap.get(posKey) || 1;
        const currentIndex = positionIndexMap.get(posKey) || 0;

        if (countAtPosition > 1) {
          const angle = (currentIndex / countAtPosition) * 2 * Math.PI;
          const offsetDistance = Math.min(15, 5 * countAtPosition);
          const offsetLat = (offsetDistance / 111320) * Math.sin(angle);
          const offsetLng = (offsetDistance / (111320 * Math.cos(d.lat * Math.PI / 180))) * Math.cos(angle);
          positionIndexMap.set(posKey, currentIndex + 1);
          return [d.lng + offsetLng, d.lat + offsetLat];
        }

        return [d.lng, d.lat];
      },
      getFillColor: (d: Spot) => {
        return getCenterColor(d.dominantCenter || '기타', true);
      },
      getRadius: (d: Spot) => {
        const memberCount = d.totalApprox || minCount;
        
        // ✅ 줌 레벨에 따라 스팟 크기 조정
        // 줌 레벨이 낮을수록(줌 아웃) 스팟을 작게, 높을수록(줌 인) 스팟을 크게
        // 줌 레벨 10-12: 작은 스팟 (지도 전체를 보기 위해)
        // 줌 레벨 13-15: 중간 스팟 (일반적인 탐색)
        // 줌 레벨 16+: 큰 스팟 (상세 위치 확인)
        let baseMinPixels = 12;
        let baseMaxPixels = 18;
        
        if (currentZoom <= 11) {
          // 줌 아웃 → 작은 스팟 (특정 위치 선별 방지)
          baseMinPixels = 10;
          baseMaxPixels = 14;
        } else if (currentZoom <= 13) {
          // 중간 줌 → 중간 스팟 (더 크게)
          baseMinPixels = 16;
          baseMaxPixels = 24;
        } else if (currentZoom <= 15) {
          // 줌 인 → 큰 스팟 (더 크게)
          baseMinPixels = 28;
          baseMaxPixels = 42;
        } else if (currentZoom <= 17) {
          // 고준 줌 → 매우 큰 스팟 (더 크게)
          baseMinPixels = 42;
          baseMaxPixels = 60;
        } else {
          // 매우 고준 줌 → 최대 크기 스팟 (더 크게)
          baseMinPixels = 55;
          baseMaxPixels = 75;
        }
        
        // 제곱근 스케일링으로 배수 관계 완화
        const sqrtMin = Math.sqrt(minCount);
        const sqrtMax = Math.sqrt(maxCount);
        const sqrtCurrent = Math.sqrt(memberCount);
        
        if (sqrtMax === sqrtMin) {
          return baseMinPixels;
        }
        
        const ratio = (sqrtCurrent - sqrtMin) / (sqrtMax - sqrtMin);
        const radiusPixels = baseMinPixels + (baseMaxPixels - baseMinPixels) * ratio;
        
        return radiusPixels;
      },
      radiusUnits: 'pixels', // ✅ 픽셀 단위 사용 (줌 레벨과 무관하게 화면상 크기 일정)
      // ✅ 줌 레벨에 따라 동적 조정 (getRadius에서 이미 처리)
      radiusMinPixels: currentZoom <= 11 ? 10 : (currentZoom <= 13 ? 16 : (currentZoom <= 15 ? 28 : (currentZoom <= 17 ? 42 : 55))),
      radiusMaxPixels: currentZoom <= 11 ? 14 : (currentZoom <= 13 ? 24 : (currentZoom <= 15 ? 42 : (currentZoom <= 17 ? 60 : 75))),
      onHover: (info: any) => {
        // ✅ deck.gl의 onHover는 마우스가 레이어 위에 있을 때마다 호출됩니다
        // info.picked가 false이거나 info.object가 없으면 즉시 툴팁 숨김
        // info.picked === false는 마우스가 스팟에서 벗어났을 때입니다
        
        // ⚠️ 중요: info가 없거나, info.picked가 false이거나, info.object가 null이면 즉시 툴팁 숨김
        if (!info || info.picked === false || !info.object || info.object === null) {
          // 즉시 툴팁 숨김
          setHoveredAddress(null);
          lastHoveredSpotRef.current = null;
          if (onSpotHover) {
            onSpotHover(null, null);
          }
          return;
        }
        
        // ✅ info.picked가 명시적으로 true인 경우만 처리
        if (info.picked !== true) {
          setHoveredAddress(null);
          lastHoveredSpotRef.current = null;
          if (onSpotHover) {
            onSpotHover(null, null);
          }
          return;
        }

        // info.picked가 true이고 info.object가 있을 때만 툴팁 표시
        if (info.x !== undefined && info.y !== undefined && info.object) {
          const spot = info.object as Spot;
          
          // ✅ 호버 거리 체크: 스팟 중심으로부터 일정 거리 이상 벗어나면 툴팁 숨김
          const hoverDistance = info.distance || 0;
          // 스팟 크기에 따라 거리 조정 (줌 레벨이 높을수록 스팟이 크므로 거리도 증가)
          const maxHoverDistance = currentZoom <= 13 ? 60 : (currentZoom <= 15 ? 80 : 100);
          
          if (hoverDistance > maxHoverDistance) {
            // 거리가 너무 멀면 툴팁 숨김
            setHoveredAddress(null);
            lastHoveredSpotRef.current = null;
            if (onSpotHover) {
              onSpotHover(null, null);
            }
            return;
          }
          
          // ✅ 현재 스팟을 마지막 호버 스팟으로 저장
          lastHoveredSpotRef.current = spot;
          
          // 비동기로 주소 가져오기
          getAddressFromGeohash(spot.geohash, currentZoom).then(address => {
            // ✅ 비동기 완료 후에도 여전히 같은 스팟 위에 있는지 확인
            if (lastHoveredSpotRef.current === spot) {
              setHoveredAddress(address);
              if (onSpotHover) {
                // 마우스 좌표도 함께 전달
                if (mapInstanceRef.current) {
                  const rect = mapInstanceRef.current.getContainer().getBoundingClientRect();
                  onSpotHover(spot, address, {
                    x: info.x - rect.left,
                    y: info.y - rect.top
                  });
                } else {
                  onSpotHover(spot, address, { x: info.x, y: info.y });
                }
              }
            }
            // 만약 다른 스팟으로 이동했거나 스팟에서 벗어났다면 아무것도 하지 않음
          }).catch(() => {
            // 주소 가져오기 실패 시 툴팁 숨김
            setHoveredAddress(null);
            lastHoveredSpotRef.current = null;
            if (onSpotHover) {
              onSpotHover(null, null);
            }
          });
        } else {
          // 좌표나 객체가 없으면 툴팁 숨김
          setHoveredAddress(null);
          lastHoveredSpotRef.current = null;
          if (onSpotHover) {
            onSpotHover(null, null);
          }
        }
      },
      updateTriggers: {
        getPosition: [spots, currentZoom],
        getFillColor: [spots, activeCenters],
        getRadius: [spots, currentZoom]
      }
    });

    // 텍스트 레이어 생성 (회원 수 표시)
    const textSpots = filteredSpots.filter(s => s.totalApprox >= 1);
    const layers: any[] = [spotsLayer];

    if (textSpots.length > 0) {
      // 텍스트 배경 레이어 (가독성 향상)
      const textBackgroundLayer = new TextLayer({
        id: 'text-background',
        data: textSpots,
        getPosition: (d: Spot) => {
          const posKey = `${d.lat.toFixed(6)},${d.lng.toFixed(6)}`;
          const countAtPosition = positionCountMap.get(posKey) || 1;
          const currentIndex = textPositionIndexMap.get(posKey) || 0;

          if (countAtPosition > 1) {
            const angle = (currentIndex / countAtPosition) * 2 * Math.PI;
            const offsetDistance = Math.min(15, 5 * countAtPosition);
            const offsetLat = (offsetDistance / 111320) * Math.sin(angle);
            const offsetLng = (offsetDistance / (111320 * Math.cos(d.lat * Math.PI / 180))) * Math.cos(angle);
            textPositionIndexMap.set(posKey, currentIndex + 1);
            return [d.lng + offsetLng, d.lat + offsetLat];
          }

          return [d.lng, d.lat];
        },
        getText: (d: Spot) => String(d.totalApprox || 0),
        getSize: (d: Spot) => {
          // ✅ 줌 레벨에 따라 텍스트 크기 조정 (스팟 크기와 비례)
          if (currentZoom <= 11) {
            return 12; // 작은 텍스트
          } else if (currentZoom <= 13) {
            return 16; // 중간 텍스트
          } else if (currentZoom <= 15) {
            return 20; // 큰 텍스트
          } else {
            return 24; // 매우 큰 텍스트
          }
        },
        getColor: [0, 0, 0, 255],
        sizeMaxPixels: currentZoom <= 11 ? 18 : (currentZoom <= 13 ? 24 : (currentZoom <= 15 ? 30 : 36)),
        sizeMinPixels: currentZoom <= 11 ? 10 : (currentZoom <= 13 ? 14 : (currentZoom <= 15 ? 18 : 22)),
        characterSet: 'auto'
      });

      // 텍스트 전경 레이어
      const textForegroundLayer = new TextLayer({
        id: 'text-foreground',
        data: textSpots,
        getPosition: (d: Spot) => {
          const posKey = `${d.lat.toFixed(6)},${d.lng.toFixed(6)}`;
          const countAtPosition = positionCountMap.get(posKey) || 1;
          const currentIndex = textPositionIndexMap.get(posKey) || 0;

          if (countAtPosition > 1) {
            const angle = (currentIndex / countAtPosition) * 2 * Math.PI;
            const offsetDistance = Math.min(15, 5 * countAtPosition);
            const offsetLat = (offsetDistance / 111320) * Math.sin(angle);
            const offsetLng = (offsetDistance / (111320 * Math.cos(d.lat * Math.PI / 180))) * Math.cos(angle);
            textPositionIndexMap.set(posKey, currentIndex + 1);
            return [d.lng + offsetLng, d.lat + offsetLat];
          }

          return [d.lng, d.lat];
        },
        getText: (d: Spot) => String(d.totalApprox || 0),
        getSize: (d: Spot) => {
          // ✅ 줌 레벨에 따라 텍스트 크기 조정 (스팟 크기와 비례)
          if (currentZoom <= 11) {
            return 12; // 작은 텍스트
          } else if (currentZoom <= 13) {
            return 16; // 중간 텍스트
          } else if (currentZoom <= 15) {
            return 20; // 큰 텍스트
          } else {
            return 24; // 매우 큰 텍스트
          }
        },
        getColor: (d: Spot) => getCenterColor(d.dominantCenter || '기타', true),
        sizeMaxPixels: currentZoom <= 11 ? 18 : (currentZoom <= 13 ? 24 : (currentZoom <= 15 ? 30 : 36)),
        sizeMinPixels: currentZoom <= 11 ? 10 : (currentZoom <= 13 ? 14 : (currentZoom <= 15 ? 18 : 22)),
        characterSet: 'auto'
      });

      layers.push(textBackgroundLayer, textForegroundLayer);
    }

    return layers;
  }, [spots, activeCenters, currentZoom, onSpotHover]);

  // 스팟 레이어 업데이트
  useEffect(() => {
    if (!mapLoaded || !overlayRef.current || !librariesLoaded) return;

    const layers = buildSpotsLayer();
    overlayRef.current.setProps({ layers });

    logger.info(`✅ 스팟 레이어 업데이트: ${layers.length}개 레이어, ${spots.length}개 스팟`);
  }, [mapLoaded, librariesLoaded, spots, activeCenters, currentZoom, buildSpotsLayer]);

  // CSS 클래스를 기본값과 병합
  const mapContainerClass = className || 'w-full h-full';
  
  return (
    <div className={`relative ${mapContainerClass}`} style={{ minHeight: '400px' }}>
      <div ref={mapRef} className="w-full h-full absolute inset-0" />
      {hoveredAddress && (
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg z-10">
          <p className="text-sm font-medium text-gray-800">{hoveredAddress}</p>
        </div>
      )}
    </div>
  );
}

