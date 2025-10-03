/**
 * 🎨 JJ Swim Lab - 센터 컬러 프리셋 유틸리티
 * 
 * 📋 **유틸리티 목적**
 * - 센터별 브랜드 컬러 저장/불러오기
 * - HSL 해시 기반 자동 색상 배정
 * - 로컬 스토리지 기반 프리셋 관리
 * - CSS 색상 → RGBA 변환
 * 
 * 🔄 **주요 기능**
 * - loadCenterColors(): 저장된 색상 프리셋 로드
 * - saveCenterColors(): 색상 프리셋 저장
 * - colorCssOf(): 센터의 CSS 색상 반환
 * - colorRgbaOf(): 센터의 RGBA 배열 반환
 * - setCenterColor(): 센터 색상 설정
 * - resetCenterColors(): 모든 색상 초기화
 * 
 * 🗄️ **데이터 연동**
 * - localStorage (브라우저 로컬 스토리지)
 * - HSL 해시 알고리즘
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. HSL 해시는 센터 ID로 안정적 색상 생성
 * 2. 로컬 스토리지는 브라우저별로 독립적
 * 3. CSS 색상 파싱은 Canvas API 사용
 * 4. "기타" 센터는 회색 고정
 */

const STORAGE_KEY = 'swimlab.centerColors.v1';

/**
 * HSL 해시 알고리즘
 * 센터 ID로부터 안정적인 Hue 값 생성
 */
function hashHsl(centerId: string): string {
  if (centerId === '기타') {
    return 'hsl(0, 0%, 63%)'; // 회색
  }

  let hue = 0;
  for (let i = 0; i < centerId.length; i++) {
    hue = (hue * 31 + centerId.charCodeAt(i)) % 360;
  }

  // 채도 70%, 명도 52% (보기 좋은 수준)
  return `hsl(${hue}, 70%, 52%)`;
}

/**
 * CSS 색상 문자열을 RGBA 배열로 변환
 * Canvas API를 사용한 브라우저 파싱
 */
export function cssToRgba(
  css: string, 
  alpha: number = 1
): [number, number, number, number] {
  // 서버 사이드 렌더링 대응
  if (typeof document === 'undefined') {
    return [160, 160, 160, Math.round(alpha * 255)];
  }

  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      return [160, 160, 160, Math.round(alpha * 255)];
    }

    // Canvas로 색상 파싱
    ctx.fillStyle = css;
    const parsedColor = ctx.fillStyle as string;

    // RGB(A) 형식에서 숫자 추출
    const matches = parsedColor.match(/\d+(\.\d+)?/g);
    
    if (!matches) {
      return [160, 160, 160, Math.round(alpha * 255)];
    }

    const nums = matches.map(Number);
    const [r, g, b] = nums.slice(0, 3);

    return [
      Math.round(r),
      Math.round(g),
      Math.round(b),
      Math.round(alpha * 255)
    ];
  } catch (error) {
    console.warn('CSS 색상 파싱 오류:', error);
    return [160, 160, 160, Math.round(alpha * 255)];
  }
}

/**
 * 저장된 센터 색상 프리셋 로드
 */
export function loadCenterColors(): Record<string, string> {
  if (typeof localStorage === 'undefined') {
    return {};
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.warn('센터 색상 로드 오류:', error);
    return {};
  }
}

/**
 * 센터 색상 프리셋 저장
 */
export function saveCenterColors(colorMap: Record<string, string>): void {
  if (typeof localStorage === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(colorMap));
    console.log('✅ 센터 색상 프리셋 저장됨:', Object.keys(colorMap).length, '개');
  } catch (error) {
    console.error('❌ 센터 색상 저장 오류:', error);
  }
}

/**
 * 센터의 CSS 색상 반환
 * 프리셋이 있으면 프리셋, 없으면 HSL 해시
 */
export function colorCssOf(centerId: string): string {
  const preset = loadCenterColors()[centerId];
  return preset || hashHsl(centerId);
}

/**
 * 센터의 RGBA 배열 반환 (deck.gl용)
 */
export function colorRgbaOf(
  centerId: string, 
  alpha: number = 0.72
): [number, number, number, number] {
  const css = colorCssOf(centerId);
  return cssToRgba(css, alpha);
}

/**
 * 센터 색상 설정
 */
export function setCenterColor(centerId: string, cssColor: string): void {
  const colorMap = loadCenterColors();
  colorMap[centerId] = cssColor;
  saveCenterColors(colorMap);
  console.log(`🎨 센터 색상 설정: ${centerId} → ${cssColor}`);
}

/**
 * 모든 센터 색상 초기화
 */
export function resetCenterColors(): void {
  saveCenterColors({});
  console.log('🔄 센터 색상 프리셋 초기화됨');
}

/**
 * HEX 색상 변환 (color input용)
 */
export function cssToHex(css: string): string {
  const [r, g, b] = cssToRgba(css, 1);
  
  const toHex = (n: number) => {
    const hex = n.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * 센터 색상 프리셋 내보내기 (JSON)
 */
export function exportCenterColors(): string {
  const colorMap = loadCenterColors();
  return JSON.stringify(colorMap, null, 2);
}

/**
 * 센터 색상 프리셋 가져오기 (JSON)
 */
export function importCenterColors(jsonString: string): boolean {
  try {
    const colorMap = JSON.parse(jsonString);
    
    // 유효성 검사
    if (typeof colorMap !== 'object' || colorMap === null) {
      throw new Error('유효하지 않은 형식');
    }

    saveCenterColors(colorMap);
    console.log('✅ 센터 색상 프리셋 가져오기 완료');
    return true;
  } catch (error) {
    console.error('❌ 센터 색상 프리셋 가져오기 오류:', error);
    return false;
  }
}
