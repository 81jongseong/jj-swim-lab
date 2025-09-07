# GLB 애니메이션 디버그 가이드

## 개요

이 문서는 JJ Swim Lab 프로젝트의 GLB 애니메이션 디버그 뷰어 사용법과 개발 가이드를 제공합니다.

## GLB 디버그 뷰어 사용법

### 접속 방법
1. 개발 서버 실행: `npm run dev`
2. 브라우저에서 `http://localhost:3000/debug` 접속

### 주요 기능

#### 1. 실시간 모니터링
- **GLB 로딩 상태**: 파일이 성공적으로 로드되었는지 확인
- **애니메이션 정보**: 개수, 지속시간, 현재 재생 중인 클립
- **스켈레톤 정보**: 뼈대 개수, 헬퍼 상태, 커스텀 스켈레톤 상태
- **모션 감지**: 애니메이션이 실제로 움직이고 있는지 확인

#### 2. 스켈레톤 시각화
- **간소화된 구조**: 68개 뼈대 중 14개 주요 뼈대만 표시
- **색상 구분**:
  - 🔴 **머리**: 빨간색 (가장 큰 구체)
  - 🔵 **척추/골반**: 파란색 (큰 구체)
  - 🟡 **팔**: 노란색 (중간 구체)
  - 🟣 **다리**: 마젠타색 (중간 구체)
- **연결선**: 주요 뼈대들을 연결하는 13개의 빨간색 라인
- **메쉬 위 렌더링**: 모델에 가려지지 않고 위에 표시

#### 3. 사용자 컨트롤
- **H키**: 스켈레톤 표시/숨김 토글
- **마우스 왼쪽 버튼**: 모델 회전
- **마우스 휠**: 확대/축소
- **마우스 오른쪽 버튼**: 카메라 이동

## 개발자 가이드

### 파일 구조
```
client/app/debug/
├── page.tsx                 # 메인 디버그 페이지
└── ...

server/pipeline/
├── check_glb.py            # GLB 파일 검증 도구
├── create_simple_glb.py    # 테스트용 GLB 생성기
└── ...
```

### 핵심 컴포넌트

#### GLBViewer 컴포넌트
```typescript
function GLBViewer({ 
  glbPath, 
  onAnimationInfoChange,
  onBoneInfoChange,
  onMotionDetectedChange,
  onSkeletonVisibleChange,
  onGlbLoadedChange
})
```

**주요 기능:**
- GLB 파일 로딩 및 파싱
- 애니메이션 믹서 설정 및 재생
- 스켈레톤 시각화 (구체 + 연결선)
- 실시간 상태 업데이트

#### 스켈레톤 시각화 로직
```typescript
// 주요 뼈대들만 선택 (68개 → 14개)
const mainBones = [
  'rootx',           // 골반
  'spine_01x',       // 허리
  'spine_02x',       // 가슴
  'spine_03x',       // 어깨
  'neckx',           // 목
  'headx',           // 머리
  'shoulderl',       // 왼쪽 어깨
  'shoulderr',       // 오른쪽 어깨
  'handl',           // 왼쪽 손
  'handr',           // 오른쪽 손
  'thigh_stretchl',  // 왼쪽 허벅지
  'thigh_stretchr',  // 오른쪽 허벅지
  'footl',           // 왼쪽 발
  'footr'            // 오른쪽 발
];
```

### 스타일링 및 렌더링

#### 깊이 테스트 비활성화
```typescript
// 스켈레톤이 모델 위에 표시되도록 설정
material.depthTest = false;
material.depthWrite = false;
sphere.renderOrder = 1000;
```

#### 모델 스케일링
```typescript
// 1.7m 기준으로 모델 크기 정규화
const targetHeight = 1.7;
const scale = targetHeight / maxDimension;
glb.scene.scale.setScalar(scale);
```

### 디버깅 팁

#### 콘솔 로그 확인
브라우저 개발자 도구(F12)의 Console 탭에서 다음 로그들을 확인하세요:

```
[DEBUG] GLB 로드 완료: /animated_model.glb
[DEBUG] 모델 크기: Vector3 {x: ..., y: ..., z: ...}
[DEBUG] 모델 스케일: 0.020 (목표 높이: 1.7m)
[ANIMS] count=2, durations=[5, 5]
[SCENE] SkinnedMesh count=22, Bone count=68
[SKELETON] 가시성 변경: true
```

#### 일반적인 문제 해결

1. **스켈레톤이 안 보이는 경우**
   - H키를 눌러 토글 확인
   - 콘솔에서 `[SKELETON]` 로그 확인
   - `depthTest: false` 설정 확인

2. **애니메이션이 안 움직이는 경우**
   - GLB 파일에 애니메이션이 포함되어 있는지 확인
   - `[ANIMS] count=0`인지 확인
   - AnimationMixer가 올바르게 설정되었는지 확인

3. **모델이 안 보이는 경우**
   - GLB 파일 경로가 올바른지 확인
   - 파일 크기가 0이 아닌지 확인
   - 카메라 위치 및 스케일링 확인

## 파이프라인 스크립트

### check_glb.py
GLB 파일의 기본적인 유효성을 검증합니다.

```bash
python server/pipeline/check_glb.py --glb "client/public/animated_model.glb"
```

### create_simple_glb.py
테스트용 간단한 GLB 파일을 생성합니다.

```bash
python server/pipeline/create_simple_glb.py
```

## 기술 스택

- **React Three Fiber**: 3D 렌더링 프레임워크
- **Three.js**: 3D 그래픽스 라이브러리
- **@react-three/drei**: R3F 유틸리티 라이브러리
- **TypeScript**: 타입 안전성
- **Python**: 파이프라인 스크립트

## 버전 정보

- **버전**: 1.0.0
- **생성일**: 2025-01-07
- **작성자**: AI Assistant

## 참고 자료

- [React Three Fiber 공식 문서](https://docs.pmnd.rs/react-three-fiber)
- [Three.js 공식 문서](https://threejs.org/docs/)
- [GLB 파일 형식](https://www.khronos.org/gltf/)
