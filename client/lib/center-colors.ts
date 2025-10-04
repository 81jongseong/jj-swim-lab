/**
 * 센터별 색상 관리 유틸리티
 * 
 * 연동되는 데이터:
 * - 센터 ID별 고유 색상 매핑
 * - 로컬 스토리지에 색상 설정 저장
 * 
 * 연동되는 파일:
 * - client/app/admin/geo/page-block-spots.tsx
 * - client/app/admin/geo-distribution/page.tsx
 */

// 기본 센터 색상 (HSL 기반)
const DEFAULT_COLORS = {
  '강남센터': '#FF6B6B',    // 빨간색
  '홍대센터': '#4ECDC4',    // 청록색
  '송파센터': '#45B7D1',    // 파란색
  '마포센터': '#96CEB4',    // 연두색
  '기타': '#D3D3D3',        // 회색
};

// 로컬 스토리지 키
const STORAGE_KEY = 'center_colors';

// 색상 맵 가져오기
function getColorMap(): Record<string, string> {
  if (typeof window === 'undefined') return DEFAULT_COLORS;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_COLORS, ...parsed };
    }
  } catch (error) {
    console.warn('센터 색상 로드 실패:', error);
  }
  
  return DEFAULT_COLORS;
}

// 색상 맵 저장
function saveColorMap(colors: Record<string, string>) {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(colors));
  } catch (error) {
    console.warn('센터 색상 저장 실패:', error);
  }
}

// CSS 색상으로 변환
export function colorCssOf(centerId: string): string {
  const colors = getColorMap();
  return colors[centerId] || colors['기타'] || '#D3D3D3';
}

// RGBA 배열로 변환 (Deck.gl용)
export function colorRgbaOf(centerId: string, alpha: number = 1): [number, number, number, number] {
  const css = colorCssOf(centerId);
  
  // #RRGGBB를 RGB로 변환
  const hex = css.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  return [r, g, b, Math.round(alpha * 255)];
}

// 센터 색상 설정
export function setCenterColor(centerId: string, color: string) {
  const colors = getColorMap();
  colors[centerId] = color;
  saveColorMap(colors);
}

// 색상 초기화
export function resetCenterColors() {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('센터 색상 초기화 실패:', error);
  }
}

// 모든 센터 색상 가져오기
export function getAllCenterColors(): Record<string, string> {
  return getColorMap();
}



