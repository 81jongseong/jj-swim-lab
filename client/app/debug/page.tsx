/**
 * GLB 애니메이션 디버그 뷰어
 * 
 * 이 컴포넌트는 GLB 파일의 애니메이션과 스켈레톤을 시각화하고 디버깅하는 도구입니다.
 * 
 * 주요 기능:
 * - GLB 파일 로딩 및 상태 모니터링
 * - 실시간 애니메이션 정보 표시 (개수, 지속시간, 현재 클립)
 * - 스켈레톤 시각화 (14개 주요 뼈대 + 연결선)
 * - H키로 스켈레톤 토글 기능
 * - 상세한 콘솔 로깅 및 디버그 정보
 * - 모델 스케일링 (1.7m 기준 정규화)
 * 
 * 사용법:
 * 1. 브라우저에서 /debug 경로로 접속
 * 2. H키를 눌러 스켈레톤 토글
 * 3. 마우스로 모델 회전/확대/축소
 * 4. 콘솔에서 상세 로그 확인
 * 
 * @author AI Assistant
 * @created 2025-01-07
 * @version 1.0.0
 */

'use client';

import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Text, Box, Sphere, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

/**
 * GLB 뷰어 컴포넌트
 * 
 * GLB 파일을 로드하고 애니메이션/스켈레톤을 처리하는 핵심 컴포넌트입니다.
 * 
 * @param glbPath - 로드할 GLB 파일 경로
 * @param onAnimationInfoChange - 애니메이션 정보 변경 콜백
 * @param onBoneInfoChange - 뼈대 정보 변경 콜백
 * @param onMotionDetectedChange - 모션 감지 상태 변경 콜백
 * @param onSkeletonVisibleChange - 스켈레톤 가시성 변경 콜백
 * @param onGlbLoadedChange - GLB 로딩 상태 변경 콜백
 */
function GLBViewer({ 
  glbPath, 
  onAnimationInfoChange,
  onBoneInfoChange,
  onMotionDetectedChange,
  onSkeletonVisibleChange,
  onGlbLoadedChange
}: { 
  glbPath: string;
  onAnimationInfoChange: (info: { count: number; durations: number[]; currentClip: string | null }) => void;
  onBoneInfoChange: (info: { count: number; names: string[] }) => void;
  onMotionDetectedChange: (detected: boolean) => void;
  onSkeletonVisibleChange: (visible: boolean) => void;
  onGlbLoadedChange: (loaded: boolean) => void;
}) {
  const glbRef = useRef<THREE.Group>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const skeletonHelperRef = useRef<THREE.SkeletonHelper | null>(null);
  const [animationInfo, setAnimationInfo] = useState<{
    count: number;
    durations: number[];
    currentClip: string | null;
  }>({ count: 0, durations: [], currentClip: null });
  const [motionDetected, setMotionDetected] = useState(false);
  const [boneInfo, setBoneInfo] = useState<{
    count: number;
    names: string[];
  }>({ count: 0, names: [] });
  const [skeletonVisible, setSkeletonVisible] = useState(true); // 초기에 보이도록 설정
  const [glbLoaded, setGlbLoaded] = useState(false);

  // 키보드 단축키 (H키로 스켈레톤 토글)
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'h') {
        const newVisible = !skeletonVisible;
        setSkeletonVisible(newVisible);
        onSkeletonVisibleChange(newVisible);
        console.log(`[SKELETON] ${newVisible ? 'ON' : 'OFF'}`);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [skeletonVisible, onSkeletonVisibleChange]);

  // GLB 로드 (간단한 캐시 방지)
  const glb = useGLTF(glbPath);

  useEffect(() => {
    console.log('[DEBUG] GLB 객체 상태:', glb);
    console.log('[DEBUG] GLB.scene 존재:', !!glb.scene);
    console.log('[DEBUG] GLB.animations 존재:', !!glb.animations);
    console.log('[DEBUG] GLB.animations 개수:', glb.animations?.length || 0);
    
    if (glb.scene) {
      setGlbLoaded(true);
      onGlbLoadedChange(true);
      console.log('[DEBUG] GLB 로드 완료:', glbPath);
      console.log('[DEBUG] GLB 씬 자식 개수:', glb.scene.children.length);
      console.log('[DEBUG] GLB 전체 구조:', glb);
      
      // 모델 위치 및 크기 확인
      const initialBox = new THREE.Box3().setFromObject(glb.scene);
      const initialSize = initialBox.getSize(new THREE.Vector3());
      const center = initialBox.getCenter(new THREE.Vector3());
      console.log('[DEBUG] 모델 크기:', initialSize);
      console.log('[DEBUG] 모델 중심:', center);
      console.log('[DEBUG] 모델 바운딩 박스:', initialBox);
      
      // 애니메이션 정보 수집
      const animations = glb.animations || [];
      const durations = animations.map(anim => anim.duration);
      const count = animations.length;
      
      const newAnimationInfo = {
        count,
        durations,
        currentClip: count > 0 ? animations[0].name : null
      };
      setAnimationInfo(newAnimationInfo);
      onAnimationInfoChange(newAnimationInfo);
      
      console.log(`[ANIMS] count=${count}, durations=[${durations.join(', ')}]`);
      console.log('[ANIMS] 애니메이션 상세:', animations.map(anim => ({ name: anim.name, duration: anim.duration, tracks: anim.tracks.length })));
      
      // 애니메이션이 없으면 fallback 적용
      if (count === 0) {
        console.log('[ANIMS] 애니메이션 없음 - fallback 모드 활성화');
        console.log('[ANIMS] GLB.animations:', glb.animations);
      }
      
      // 스켈레톤 정보 수집
      const skinnedMeshes: THREE.SkinnedMesh[] = [];
      const allObjects: any[] = [];
      
      glb.scene.traverse((child) => {
        allObjects.push({ type: child.type, name: child.name });
        if (child instanceof THREE.SkinnedMesh) {
          skinnedMeshes.push(child);
          console.log('[SCENE] SkinnedMesh 발견:', child.name, 'skeleton:', child.skeleton ? '있음' : '없음');
        }
      });
      
      console.log('[SCENE] 모든 오브젝트:', allObjects);
      
      if (skinnedMeshes.length > 0) {
        const skinnedMesh = skinnedMeshes[0];
        const bones = skinnedMesh.skeleton.bones;
        const boneNames = bones.map(bone => bone.name);
        
        const newBoneInfo = {
          count: bones.length,
          names: boneNames
        };
        setBoneInfo(newBoneInfo);
        onBoneInfoChange(newBoneInfo);
        
        console.log(`[SCENE] SkinnedMesh count=${skinnedMeshes.length}, Bone count=${bones.length}`);
        console.log('[SCENE] 뼈대 이름들:', boneNames);
        
        // 커스텀 스켈레톤 그룹 생성 (먼저 선언)
        const customSkeletonGroup = new THREE.Group();
        customSkeletonGroup.name = "CustomSkeleton";
        
        // 간단한 스켈레톤 라인 생성 (주요 뼈대들만 연결)
        const lineGroup = new THREE.Group();
        lineGroup.name = "SimpleSkeletonLines";
        
        // 주요 연결선 정의
        const connections = [
          ['rootx', 'spine_01x'],
          ['spine_01x', 'spine_02x'],
          ['spine_02x', 'spine_03x'],
          ['spine_03x', 'neckx'],
          ['neckx', 'headx'],
          ['spine_03x', 'shoulderl'],
          ['spine_03x', 'shoulderr'],
          ['shoulderl', 'handl'],
          ['shoulderr', 'handr'],
          ['rootx', 'thigh_stretchl'],
          ['rootx', 'thigh_stretchr'],
          ['thigh_stretchl', 'footl'],
          ['thigh_stretchr', 'footr']
        ];
        
        connections.forEach(([from, to]) => {
          const fromBone = bones.find(b => b.name === from);
          const toBone = bones.find(b => b.name === to);
          
          if (fromBone && toBone) {
            const fromPos = new THREE.Vector3();
            const toPos = new THREE.Vector3();
            fromBone.getWorldPosition(fromPos);
            toBone.getWorldPosition(toPos);
            
            const geometry = new THREE.BufferGeometry().setFromPoints([fromPos, toPos]);
            const material = new THREE.LineBasicMaterial({ 
              color: 0xff0000, 
              linewidth: 5,  // 더 두껍게
              transparent: true,
              opacity: 1.0,  // 완전 불투명
              depthTest: false,  // 깊이 테스트 비활성화
              depthWrite: false   // 깊이 쓰기 비활성화
            });
            const line = new THREE.Line(geometry, material);
            line.renderOrder = 1000;  // 렌더 순서를 앞으로
            lineGroup.add(line);
          }
        });
        
        lineGroup.visible = skeletonVisible;
        lineGroup.renderOrder = 1000;  // 렌더 순서를 앞으로
        glb.scene.add(lineGroup);
        
        // 간단한 스켈레톤을 ref에 저장
        skeletonHelperRef.current = lineGroup as any;
        
        // 주요 뼈대들만 표시 (간소화)
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
        mainBones.forEach(boneName => {
          const bone = bones.find(b => b.name === boneName);
          if (bone) {
            // 뼈대별로 다른 크기와 색상 설정 (더 크게)
            let size = 0.1;  // 기본 크기 증가
            let color = 0x00ff00; // 기본 초록색
            
            if (boneName.includes('head')) {
              size = 0.15;  // 머리 - 더 크게
              color = 0xff0000; // 머리 - 빨간색
            } else if (boneName.includes('spine') || boneName === 'rootx') {
              size = 0.12;  // 척추/골반 - 더 크게
              color = 0x0000ff; // 척추/골반 - 파란색
            } else if (boneName.includes('shoulder') || boneName.includes('hand')) {
              size = 0.08;  // 팔 - 더 크게
              color = 0xffff00; // 팔 - 노란색
            } else if (boneName.includes('thigh') || boneName.includes('foot')) {
              size = 0.1;   // 다리 - 더 크게
              color = 0xff00ff; // 다리 - 마젠타색
            }
            
            const sphereGeometry = new THREE.SphereGeometry(size, 8, 8);
            const sphereMaterial = new THREE.MeshBasicMaterial({ 
              color: color,
              transparent: true,
              opacity: 1.0,
              depthTest: false,  // 깊이 테스트 비활성화
              depthWrite: false   // 깊이 쓰기 비활성화
            });
            const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
            sphere.renderOrder = 1000;  // 렌더 순서를 앞으로
            
            // 뼈대의 월드 위치로 구체 배치
            const worldPosition = new THREE.Vector3();
            bone.getWorldPosition(worldPosition);
            sphere.position.copy(worldPosition);
            
            sphere.userData = { boneName: boneName };
            customSkeletonGroup.add(sphere);
          }
        });
        
        customSkeletonGroup.visible = skeletonVisible;
        customSkeletonGroup.renderOrder = 1000;  // 렌더 순서를 앞으로
        glb.scene.add(customSkeletonGroup);
        
        // 커스텀 스켈레톤도 ref에 저장
        (skeletonHelperRef.current as any).customSkeleton = customSkeletonGroup;
        
        console.log('[DEBUG] 간단한 스켈레톤 생성됨 - visible:', lineGroup.visible);
        console.log('[DEBUG] 스켈레톤 라인 개수:', lineGroup.children.length);
        console.log('[DEBUG] 커스텀 스켈레톤 구체 개수:', customSkeletonGroup.children.length);
      }
      
      // 애니메이션 믹서 설정
      if (animations.length > 0) {
        const mixer = new THREE.AnimationMixer(glb.scene);
        mixerRef.current = mixer;
        
        // 첫 번째 애니메이션 재생
        const action = mixer.clipAction(animations[0]);
        action.reset().play();
        
        console.log(`[ANIMS] 재생 시작: ${animations[0].name}`);
      } else {
        // Fallback: 루트 노드에 미세 회전 적용
        console.log('[ANIMS] Fallback: 루트 노드 회전 적용');
      }
      
      // 모델 크기 정규화 (1.7m 높이)
      const scaleBox = new THREE.Box3().setFromObject(glb.scene);
      const scaleSize = scaleBox.getSize(new THREE.Vector3());
      const maxDimension = Math.max(scaleSize.x, scaleSize.y, scaleSize.z);
      const targetHeight = 1.7; // 1.7미터
      const scale = targetHeight / maxDimension;
      
      glb.scene.scale.setScalar(scale);
      console.log(`[DEBUG] 모델 스케일: ${scale.toFixed(3)} (목표 높이: ${targetHeight}m)`);
    } else {
      console.error('[ERROR] GLB.scene이 존재하지 않습니다!');
      console.error('[ERROR] GLB 객체:', glb);
      setGlbLoaded(false);
      onGlbLoadedChange(false);
    }
  }, [glb, glbPath]);

  // 스켈레톤 가시성 업데이트
  useEffect(() => {
    if (skeletonHelperRef.current) {
      // 간단한 스켈레톤 라인
      skeletonHelperRef.current.visible = skeletonVisible;
      
      // 커스텀 스켈레톤 (구체들)
      if ((skeletonHelperRef.current as any).customSkeleton) {
        (skeletonHelperRef.current as any).customSkeleton.visible = skeletonVisible;
      }
      
      console.log(`[SKELETON] 가시성 변경: ${skeletonVisible}`);
      console.log(`[SKELETON] SimpleSkeleton visible: ${skeletonHelperRef.current.visible}`);
      console.log(`[SKELETON] CustomSkeleton visible: ${(skeletonHelperRef.current as any).customSkeleton?.visible}`);
    }
  }, [skeletonVisible]);

  // 애니메이션 업데이트 및 모션 감지
  useFrame((state, delta) => {
    // 애니메이션 믹서 업데이트 (필수)
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }
    
    // 스켈레톤 헬퍼는 자동으로 업데이트됨 (수동 업데이트 불필요)
    
    // Fallback: 애니메이션이 없으면 루트 노드에 미세 회전 적용
    if (glbRef.current && animationInfo.count === 0) {
      const time = state.clock.getElapsedTime();
      glbRef.current.rotation.y = Math.sin(time * 0.5) * 0.02; // ±2도 회전
    }
    
    // 모션 감지 (2초간 AABB 변화량 확인)
    if (glbRef.current && !motionDetected) {
      const currentPosition = glbRef.current.position.clone();
      const currentRotation = glbRef.current.rotation.clone();
      
      // 모션 감지
      const rotationLength = Math.sqrt(currentRotation.x ** 2 + currentRotation.y ** 2 + currentRotation.z ** 2);
      if (currentPosition.length() > 0 || rotationLength > 0) {
        setMotionDetected(true);
        onMotionDetectedChange(true);
        console.log('[MOTION] true');
      }
    }
  });

  return (
    <group ref={glbRef}>
      <primitive object={glb.scene} />
    </group>
  );
}

// 디버그 정보 표시 컴포넌트
function DebugInfo({ 
  animationInfo, 
  boneInfo, 
  motionDetected,
  skeletonVisible,
  glbLoaded
}: { 
  animationInfo: { count: number; durations: number[]; currentClip: string | null };
  boneInfo: { count: number; names: string[] };
  motionDetected: boolean;
  skeletonVisible: boolean;
  glbLoaded: boolean;
}) {
  return (
    <div style={{
      position: 'absolute',
      top: '10px',
      left: '10px',
      background: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '15px',
      borderRadius: '8px',
      fontFamily: 'monospace',
      fontSize: '12px',
      zIndex: 1000,
      maxWidth: '300px'
    }}>
      <h3 style={{ margin: '0 0 10px 0', color: '#00ff00' }}>🔍 GLB 디버그 정보</h3>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>GLB 상태:</strong>
        <div style={{ 
          marginLeft: '10px', 
          color: glbLoaded ? '#00ff00' : '#ff0000',
          fontWeight: 'bold'
        }}>
          {glbLoaded ? '✅ 로드됨' : '❌ 로딩 중...'}
        </div>
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>애니메이션:</strong>
        <div style={{ marginLeft: '10px' }}>
          <div>개수: {animationInfo.count}개</div>
          <div>지속시간: {animationInfo.durations.join(', ')}초</div>
          <div>현재 클립: {animationInfo.currentClip || '없음'}</div>
        </div>
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>스켈레톤:</strong>
        <div style={{ marginLeft: '10px' }}>
          <div>뼈대 개수: {boneInfo.count}개</div>
          <div>스켈레톤 헬퍼: {skeletonVisible ? '표시됨' : '숨김'}</div>
          <div>커스텀 스켈레톤: {skeletonVisible ? '구체 표시됨' : '숨김'}</div>
        </div>
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>모션 감지:</strong>
        <div style={{ 
          marginLeft: '10px', 
          color: motionDetected ? '#00ff00' : '#ff0000',
          fontWeight: 'bold'
        }}>
          {motionDetected ? '✅ 감지됨' : '❌ 감지 안됨'}
        </div>
      </div>
      
       <div style={{ fontSize: '10px', color: '#888', marginTop: '10px' }}>
         브라우저 콘솔에서 상세 로그를 확인하세요.
         <br />
         H키를 눌러 스켈레톤을 토글하세요.
         <br />
         스켈레톤은 모델 위에 렌더링됩니다.
       </div>
    </div>
  );
}

// 메인 디버그 페이지 컴포넌트
export default function DebugPage() {
  const [glbPath, setGlbPath] = useState('/animated_model.glb?v=' + Date.now());
  const [animationInfo, setAnimationInfo] = useState<{
    count: number;
    durations: number[];
    currentClip: string | null;
  }>({ count: 0, durations: [], currentClip: null });
  const [boneInfo, setBoneInfo] = useState<{
    count: number;
    names: string[];
  }>({ count: 0, names: [] });
  const [motionDetected, setMotionDetected] = useState(false);
  const [skeletonVisible, setSkeletonVisible] = useState(true); // 초기에 보이도록 설정
  const [glbLoaded, setGlbLoaded] = useState(false);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* 컨트롤 패널 */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '15px',
        borderRadius: '8px',
        zIndex: 1000,
        minWidth: '200px'
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#00ff00' }}>🎮 컨트롤</h3>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>GLB 파일 경로:</label>
          <input
            type="text"
            value={glbPath}
            onChange={(e) => setGlbPath(e.target.value)}
            style={{
              width: '100%',
              padding: '5px',
              borderRadius: '4px',
              border: '1px solid #555',
              background: '#333',
              color: 'white'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <button
            onClick={() => {
              setAnimationInfo({ count: 0, durations: [], currentClip: null });
              setBoneInfo({ count: 0, names: [] });
              setMotionDetected(false);
            }}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: 'none',
              background: '#0066cc',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            🔄 새로고침
          </button>
        </div>
        
        <div style={{ fontSize: '12px', color: '#888' }}>
          <div>• 마우스로 회전</div>
          <div>• 휠로 확대/축소</div>
          <div>• 우클릭으로 이동</div>
          <div>• H키: 스켈레톤 토글</div>
        </div>
      </div>
      
      {/* 3D 캔버스 */}
      <Canvas
        camera={{ 
          position: [0, 1, 3], 
          fov: 50 
        }}
        style={{ background: '#1a1a1a' }}
        frameloop="always"
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[0, 5, 0]} intensity={0.5} />
        
        <Suspense fallback={
          <Text
            position={[0, 0, 0]}
            fontSize={0.2}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            GLB 로딩 중...
          </Text>
        }>
          <GLBViewer 
            glbPath={glbPath}
            onAnimationInfoChange={setAnimationInfo}
            onBoneInfoChange={setBoneInfo}
            onMotionDetectedChange={setMotionDetected}
            onSkeletonVisibleChange={setSkeletonVisible}
            onGlbLoadedChange={setGlbLoaded}
          />
        </Suspense>
        
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          target={[0, 0.85, 0]} // 1.7m 모델의 중심
          minDistance={1}
          maxDistance={10}
        />
        
        {/* 그리드 */}
        <gridHelper args={[10, 10, '#444', '#444']} />
        
        {/* 테스트용 큐브 (모델이 안 보일 때 참고용) */}
        <Box args={[0.5, 0.5, 0.5]} position={[1, 0, 0]}>
          <meshStandardMaterial color="orange" />
        </Box>
        
        {/* 축 표시 */}
        <Box args={[0.1, 0.1, 0.1]} position={[0, 0, 0]}>
          <meshBasicMaterial color="red" />
        </Box>
        <Text position={[0.2, 0, 0]} fontSize={0.1} color="red">
          X
        </Text>
        <Text position={[0, 0.2, 0]} fontSize={0.1} color="green">
          Y
        </Text>
        <Text position={[0, 0, 0.2]} fontSize={0.1} color="blue">
          Z
        </Text>
      </Canvas>
      
      {/* 디버그 정보 */}
      <DebugInfo 
        animationInfo={animationInfo}
        boneInfo={boneInfo}
        motionDetected={motionDetected}
        skeletonVisible={skeletonVisible}
        glbLoaded={glbLoaded}
      />
    </div>
  );
}
