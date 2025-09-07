'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useThree, Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';


interface GLBAnimationTestProps {
  glbPath: string;
}

export default function GLBAnimationTest({ glbPath }: GLBAnimationTestProps) {
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [motionDetected, setMotionDetected] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');

  return (
    <div className="w-full h-screen bg-gray-900 text-white">
      {/* 컨트롤 패널 */}
      <div className="absolute top-4 left-4 z-10 bg-black bg-opacity-50 p-4 rounded-lg">
        <h2 className="text-xl font-bold mb-4">GLB 애니메이션 테스트</h2>
        
        <div className="space-y-2">
          <button
            onClick={() => setShowSkeleton(!showSkeleton)}
            className="block w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
          >
            {showSkeleton ? '스켈레톤 숨기기' : '스켈레톤 보기'}
          </button>
          
          <div className="text-sm">
            <div>모션 감지: {motionDetected ? '✅ 감지됨' : '❌ 없음'}</div>
            <div>스켈레톤: {showSkeleton ? '✅ 표시' : '❌ 숨김'}</div>
          </div>
        </div>
        
        {/* 디버그 정보 숨김 */}
        {/* {debugInfo && (
          <div className="mt-4 p-2 bg-gray-800 rounded text-xs">
            <pre>{debugInfo}</pre>
          </div>
        )} */}
      </div>

      {/* 3D 씬 */}
      <div className="w-full h-full">
        <Canvas camera={{ position: [0, 1, 3], fov: 50 }} frameloop="always">
          <GLBViewer 
            glbPath={glbPath}
            showSkeleton={showSkeleton}
            onMotionDetected={setMotionDetected}
            onDebugInfo={setDebugInfo}
          />
          <OrbitControls 
            target={[0, 0.85, 0]} // 1.7m 인체의 중심 (0.85m 높이)
            minDistance={1}
            maxDistance={5}
          />
          <ambientLight intensity={0.5} />
          <directionalLight position={[2, 2, 1]} intensity={1} />
        </Canvas>
      </div>
    </div>
  );
}

function GLBViewer({ glbPath, showSkeleton, onMotionDetected, onDebugInfo }: {
  glbPath: string;
  showSkeleton: boolean;
  onMotionDetected: (detected: boolean) => void;
  onDebugInfo: (info: string) => void;
}) {
  const { scene } = useThree();
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const skeletonRef = useRef<THREE.SkeletonHelper | null>(null);
  const lastPositionRef = useRef<THREE.Vector3>(new THREE.Vector3());
  const motionDetectedRef = useRef(false);

  // GLB 로드
  const { scene: glbScene } = useGLTF(glbPath);

  useEffect(() => {
    if (glbScene) {
      console.log('[DEBUG] GLB 씬 로드됨:', glbScene);
      
      // 모델 크기를 1.7m 실제 인체 크기로 정확히 맞추기
      // 모델의 현재 높이를 측정하고 1.7m로 스케일링
      const box = new THREE.Box3().setFromObject(glbScene);
      const currentHeight = box.max.y - box.min.y;
      const targetHeight = 1.7; // 1.7m
      const scaleFactor = targetHeight / currentHeight;
      
      console.log('[DEBUG] 모델 크기 조정:', {
        currentHeight: currentHeight.toFixed(3) + 'm',
        targetHeight: targetHeight + 'm',
        scaleFactor: scaleFactor.toFixed(3)
      });
      
      glbScene.scale.setScalar(scaleFactor); // 1.7m로 정확히 맞춤
      
      // 씬에 추가
      scene.add(glbScene);
      
      // 애니메이션 설정
      const animations = glbScene.animations;
      console.log('[DEBUG] 애니메이션 개수:', animations.length);
      
      // 애니메이션 설정
      if (animations.length > 0) {
        const mixer = new THREE.AnimationMixer(glbScene);
        mixerRef.current = mixer;
        
        const action = mixer.clipAction(animations[0]);
        action.play();
        
        console.log('[DEBUG] 기존 애니메이션 재생 시작:', animations[0].name);
        console.log('[DEBUG] 애니메이션 길이:', animations[0].duration, '초');
      } else {
        console.log('[DEBUG] 애니메이션 없음 - 직접 뼈대 조작 모드');
      }
      
      // 스켈레톤 찾기
      const skinnedMeshes: THREE.SkinnedMesh[] = [];
      glbScene.traverse((child) => {
        if (child instanceof THREE.SkinnedMesh) {
          skinnedMeshes.push(child);
        }
      });
      
      console.log('[DEBUG] SkinnedMesh 개수:', skinnedMeshes.length);
      
      if (skinnedMeshes.length > 0) {
        const skinnedMesh = skinnedMeshes[0];
        console.log('[DEBUG] 첫 번째 SkinnedMesh:', skinnedMesh.name);
        console.log('[DEBUG] 스켈레톤 뼈 개수:', skinnedMesh.skeleton.bones.length);
        
        // 뼈 이름들 출력
        const boneNames = skinnedMesh.skeleton.bones.map(bone => bone.name);
        console.log('[DEBUG] 뼈 이름들:', boneNames);
        
        onDebugInfo(`뼈 개수: ${skinnedMesh.skeleton.bones.length}\n뼈 이름: ${boneNames.slice(0, 10).join(', ')}...\n애니메이션: 호흡 패턴 (자연스러운 움직임)`);
      }
    }
    
    return () => {
      if (glbScene) {
        scene.remove(glbScene);
      }
    };
  }, [glbScene, scene, onDebugInfo]);

  // 스켈레톤 헬퍼 관리
  useEffect(() => {
    console.log('[DEBUG] 스켈레톤 상태 변경:', { showSkeleton, hasGlbScene: !!glbScene });
    
    if (showSkeleton && glbScene) {
      // 기존 스켈레톤 제거
      if (skeletonRef.current) {
        console.log('[DEBUG] 기존 스켈레톤 제거');
        scene.remove(skeletonRef.current);
        skeletonRef.current.dispose();
        skeletonRef.current = null;
      }
      
      // 새로운 스켈레톤 생성
      const skinnedMeshes: THREE.SkinnedMesh[] = [];
      glbScene.traverse((child) => {
        if (child instanceof THREE.SkinnedMesh) {
          skinnedMeshes.push(child);
        }
      });
      
      console.log('[DEBUG] SkinnedMesh 찾음:', skinnedMeshes.length, '개');
      
      if (skinnedMeshes.length > 0) {
        try {
          const skinnedMesh = skinnedMeshes[0];
          console.log('[DEBUG] 스켈레톤 박스들 생성 시도:', skinnedMesh.name);
          
          // SkeletonHelper 대신 간단한 박스들로 스켈레톤 시각화
          const boneBoxes: THREE.Mesh[] = [];
          const bones = skinnedMesh.skeleton.bones;
          
          // 주요 관절만 표시 (깔끔하게 정리)
          const mainBones = [
            // 상체 주요 관절
            'headx', 'neckx', 'spine_01x', // 머리, 목, 척추
            'shoulderl', 'shoulderr', // 어깨
            'arm_stretchl', 'arm_stretchr', // 팔
            'forearm_stretchl', 'forearm_stretchr', // 팔꿈치
            'handl', 'handr', // 손
            // 하체 주요 관절
            'thigh_stretchl', 'thigh_stretchr', // 허벅지
            'leg_stretchl', 'leg_stretchr', // 무릎
            'footl', 'footr' // 발
          ];
          
          mainBones.forEach((boneName, index) => {
            const bone = bones.find(b => b.name === boneName);
            if (bone) {
              // 박스 생성 (1.7m 인체 크기에 맞게 조정)
              const geometry = new THREE.BoxGeometry(0.08, 0.08, 0.08); // 1.7m 인체에 적절한 크기
              
              // 뼈대별로 다른 색상 설정 (명확한 구분)
              let color = 0x00ff00; // 기본 초록색
              if (boneName.includes('head')) color = 0xff0000; // 머리: 빨간색
              else if (boneName.includes('neck')) color = 0xff8000; // 목: 주황색
              else if (boneName.includes('spine')) color = 0x0000ff; // 척추: 파란색
              else if (boneName.includes('shoulder')) color = 0xffff00; // 어깨: 노란색
              else if (boneName.includes('arm')) color = 0xff00ff; // 팔: 마젠타
              else if (boneName.includes('forearm')) color = 0xff8000; // 팔꿈치: 주황색
              else if (boneName.includes('hand')) color = 0x80ff00; // 손: 연두색
              else if (boneName.includes('thigh')) color = 0x00ffff; // 허벅지: 시안
              else if (boneName.includes('leg')) color = 0xff8000; // 무릎: 주황색
              else if (boneName.includes('foot')) color = 0x8000ff; // 발: 보라색
              
              const material = new THREE.MeshBasicMaterial({ 
                color: color,
                transparent: false,
                opacity: 1.0
              });
              const box = new THREE.Mesh(geometry, material);
              
              // 뼈대의 월드 좌표 사용 (정확한 위치)
              const worldPosition = new THREE.Vector3();
              bone.getWorldPosition(worldPosition);
              
              // 모델이 실제 스케일 팩터로 조정되었으므로 뼈대 위치도 동일하게 조정
              // 스케일 팩터는 이미 모델에 적용되어 있으므로 월드 좌표를 그대로 사용
              const adjustedPosition = new THREE.Vector3(
                worldPosition.x, // 월드 좌표 그대로 사용
                worldPosition.y, // 월드 좌표 그대로 사용
                worldPosition.z  // 월드 좌표 그대로 사용
              );
              
              // 뼈대별 위치 조정 (더 정확한 위치)
              let finalPosition = adjustedPosition.clone();
              
              // 뼈대별 위치 조정 (1.7m 인체 크기에 맞게 조정)
              // 오프셋을 최소화하고 실제 뼈대 위치를 최대한 활용
              if (boneName.includes('head')) {
                finalPosition.y += 0.1; // 머리는 약간 위로
                finalPosition.z += 0.05; // 앞으로 약간 이동
              } else if (boneName.includes('neck')) {
                finalPosition.y += 0.08; // 목은 머리 아래
                finalPosition.z += 0.03; // 앞으로 약간 이동
              } else if (boneName.includes('spine')) {
                finalPosition.y += 0.06; // 척추는 목 아래
                finalPosition.z += 0.02; // 앞으로 약간 이동
              } else if (boneName.includes('shoulder')) {
                finalPosition.y += 0.04; // 어깨는 척추 아래
                finalPosition.x += (boneName.includes('l') ? 0.15 : -0.15); // 좌우로 이동
                finalPosition.z += 0.02; // 앞으로 약간 이동
              } else if (boneName.includes('arm')) {
                finalPosition.y += 0.02; // 팔은 어깨 아래
                finalPosition.x += (boneName.includes('l') ? 0.1 : -0.1); // 좌우로 이동
              } else if (boneName.includes('forearm')) {
                finalPosition.y += 0.01; // 팔꿈치는 팔 아래
                finalPosition.x += (boneName.includes('l') ? 0.05 : -0.05); // 좌우로 이동
              } else if (boneName.includes('hand')) {
                finalPosition.y += 0.005; // 손은 팔꿈치 아래
                finalPosition.x += (boneName.includes('l') ? 0.02 : -0.02); // 좌우로 이동
              } else if (boneName.includes('thigh')) {
                finalPosition.y += 0.01; // 허벅지는 기본 위치
                finalPosition.x += (boneName.includes('l') ? 0.05 : -0.05); // 좌우로 약간 이동
              } else if (boneName.includes('leg')) {
                finalPosition.y -= 0.01; // 다리는 허벅지 아래
                finalPosition.x += (boneName.includes('l') ? 0.05 : -0.05); // 좌우로 약간 이동
              } else if (boneName.includes('foot')) {
                finalPosition.y -= 0.02; // 발은 다리 아래
                finalPosition.x += (boneName.includes('l') ? 0.05 : -0.05); // 좌우로 약간 이동
              } else if (boneName.includes('toes')) {
                finalPosition.y -= 0.03; // 발가락은 발 아래
                finalPosition.x += (boneName.includes('l') ? 0.05 : -0.05); // 좌우로 약간 이동
              }
              
              // 최종 위치 적용
              box.position.copy(finalPosition);
              
              // 박스에 뼈대 이름 표시
              box.userData = { boneName: boneName };
              
              // 디버그 로그 추가 (최종 위치 표시)
              if (boneName.includes('head') || boneName.includes('neck') || boneName.includes('spine') || boneName.includes('shoulder')) {
                console.log(`[DEBUG] 🎯 상체 뼈대: ${boneName} at Vector3 {x: ${finalPosition.x.toFixed(3)}, y: ${finalPosition.y.toFixed(3)}, z: ${finalPosition.z.toFixed(3)}}`);
              } else {
                console.log(`[DEBUG] 뼈대 박스 생성: ${boneName} at Vector3 {x: ${finalPosition.x.toFixed(3)}, y: ${finalPosition.y.toFixed(3)}, z: ${finalPosition.z.toFixed(3)}}`);
              }
              
              scene.add(box);
              boneBoxes.push(box);
            }
          });
          
          // 박스들을 ref에 저장
          skeletonRef.current = { boneBoxes: boneBoxes } as any;
          
          console.log('[DEBUG] ✅ 스켈레톤 박스들 생성 및 씬 추가 완료');
          console.log('[DEBUG] 씬 자식 개수:', scene.children.length);
          console.log('[DEBUG] 생성된 박스 개수:', boneBoxes.length);
        } catch (error) {
          console.error('[DEBUG] ❌ 스켈레톤 헬퍼 생성 실패:', error);
        }
      }
    } else if (!showSkeleton && skeletonRef.current) {
      console.log('[DEBUG] 스켈레톤 숨기기');
      
      // 박스들 제거
      if ((skeletonRef.current as any).boneBoxes) {
        (skeletonRef.current as any).boneBoxes.forEach((box: THREE.Mesh) => {
          scene.remove(box);
          box.geometry.dispose();
          if (Array.isArray(box.material)) {
            box.material.forEach(mat => mat.dispose());
          } else {
            box.material.dispose();
          }
        });
      }
      
      skeletonRef.current = null;
    }
  }, [showSkeleton, glbScene, scene]);

  // 애니메이션 믹서 업데이트 및 직접 뼈대 조작
  useFrame((state, delta) => {
    // 기존 애니메이션 믹서 업데이트
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }
    
    if (glbScene) {
      // SkinnedMesh 찾기
      const skinnedMeshes: THREE.SkinnedMesh[] = [];
      glbScene.traverse((child) => {
        if (child instanceof THREE.SkinnedMesh) {
          skinnedMeshes.push(child);
        }
      });
      
      if (skinnedMeshes.length > 0) {
        const skinnedMesh = skinnedMeshes[0];
        const bones = skinnedMesh.skeleton.bones;
        const time = state.clock.getElapsedTime();
        
        // 자연스러운 애니메이션 구현 (직접 뼈대 조작)
        // 애니메이션 활성화
        const enableAnimation = true; // 애니메이션 활성화
        
        if (!enableAnimation) {
          // 애니메이션 비활성화 - 정적 모델
          return;
        }
        
        // 주요 뼈대들에 자연스러운 움직임 적용
        const mainBoneNames = [
          'headx', 'neckx', 'spine_01x', 'spine_02x', 'spine_03x',
          'shoulderl', 'shoulderr', 'arm_stretchl', 'arm_stretchr',
          'forearm_stretchl', 'forearm_stretchr', 'handl', 'handr',
          'thigh_stretchl', 'thigh_stretchr', 'leg_stretchl', 'leg_stretchr',
          'footl', 'footr'
        ];
        
        // 더 자연스러운 호흡 애니메이션 패턴
        const breathing = Math.sin(time * 0.8) * 0.05; // 호흡 (더 눈에 띄게)
        const sway = Math.sin(time * 0.6) * 0.02; // 전체 흔들림 (더 눈에 띄게)
        const headNod = Math.sin(time * 0.4) * 0.03; // 머리 끄덕임
        
        mainBoneNames.forEach(boneName => {
          const bone = bones.find(b => b.name === boneName);
          if (bone) {
            // 각 뼈대별로 간단한 호흡 애니메이션 적용 (자연스럽게)
            if (boneName.includes('head')) {
              // 머리: 자연스러운 움직임
              bone.rotation.y = Math.sin(time * 0.3) * 0.02 + sway;
              bone.rotation.x = headNod; // 머리 끄덕임
              bone.rotation.z = Math.sin(time * 0.2) * 0.01;
            } else if (boneName.includes('neck')) {
              // 목: 머리를 따라 매우 미세하게
              bone.rotation.y = Math.sin(time * 0.3) * 0.008 + sway * 0.5;
              bone.rotation.z = Math.sin(time * 0.2) * 0.004;
            } else if (boneName.includes('spine')) {
              // 척추: 호흡 패턴만 (매우 미세)
              bone.rotation.y = Math.sin(time * 0.2) * 0.005 + sway * 0.3;
              bone.rotation.z = Math.sin(time * 0.15) * 0.003;
            } else if (boneName.includes('shoulder')) {
              // 어깨: 호흡에 따른 미세한 움직임
              bone.rotation.x = Math.sin(time * 0.4) * 0.01 + breathing;
              bone.rotation.y = Math.sin(time * 0.2) * 0.005;
            } else if (boneName.includes('arm')) {
              // 팔: 매우 미세한 흔들림
              bone.rotation.x = Math.sin(time * 0.3) * 0.008;
              bone.rotation.y = Math.sin(time * 0.2) * 0.005;
              bone.rotation.z = Math.sin(time * 0.25) * 0.003;
            } else if (boneName.includes('forearm')) {
              // 팔꿈치: 팔을 따라 미세하게
              bone.rotation.x = Math.sin(time * 0.3) * 0.006;
              bone.rotation.y = Math.sin(time * 0.2) * 0.004;
            } else if (boneName.includes('hand')) {
              // 손: 거의 움직이지 않음
              bone.rotation.x = Math.sin(time * 0.4) * 0.003;
              bone.rotation.y = Math.sin(time * 0.3) * 0.002;
            } else if (boneName.includes('thigh')) {
              // 허벅지: 매우 미세한 움직임
              bone.rotation.x = Math.sin(time * 0.35) * 0.005;
              bone.rotation.y = Math.sin(time * 0.25) * 0.003;
            } else if (boneName.includes('leg')) {
              // 무릎: 허벅지를 따라 미세하게
              bone.rotation.x = Math.sin(time * 0.35) * 0.004;
              bone.rotation.y = Math.sin(time * 0.25) * 0.002;
            } else if (boneName.includes('foot')) {
              // 발: 거의 움직이지 않음
              bone.rotation.x = Math.sin(time * 0.45) * 0.002;
              bone.rotation.y = Math.sin(time * 0.35) * 0.001;
            }
          }
        });
        
        // 스켈레톤 업데이트
        skinnedMesh.skeleton.update();
        
        // 모션 감지 활성화 (애니메이션 모델)
        if (!motionDetectedRef.current) {
          motionDetectedRef.current = true;
          onMotionDetected(true);
          console.log('[DEBUG] 🎉 호흡 애니메이션 모션 감지됨!');
        }
      }
    }
  });

  // 스켈레톤은 씬에 직접 추가되므로 렌더링할 필요 없음
  return null;
}