/**
 * 🏊‍♂️ 3D 드릴/영법 타입 정의
 * 
 * 📋 **의존성**:
 * - 없음 (순수 타입 정의)
 * 
 * 🔄 **사용처**:
 * - /3d-viewer (체험 페이지)
 * - /admin/3d-viewer/swimming-styles (관리 페이지)
 * - 3D 갤러리 컴포넌트들
 * 
 * 📅 **수정 히스토리**:
 * - 2025-01-22: 3D 구조 초기 생성
 */

export type StrokeType = 'FR' | 'BK' | 'BR' | 'FL' | 'IM';

export type Drill3D = {
  id: string;
  title: string;
  stroke: StrokeType;
  tags: string[];
  modelUrl: string;         // glb/gltf (draco/meshopt 압축 권장)
  poster: string;           // 썸네일 이미지 경로
  description: string;
  cues: string[];           // 코칭 큐
  cautions?: string[];      // 주의 사항
  evidenceKeys?: string[];  // 근거 데이터 키
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isActive: boolean;
  isPublicDemo?: boolean;   // 체험 모드 공개 여부
  createdAt: string;
  updatedAt: string;
};

export type CameraPreset = 'side' | 'front' | 'top' | 'diagonal';

export type ThreeViewerState = {
  selectedId?: string;
  speed: number;
  camera: CameraPreset;
  showSkeleton: boolean;
  showCues: boolean;
  isPlaying: boolean;
};

