/**
 * ✅ JJ Swim Lab - 수영 자세 3D 모델 컴포넌트
 * 
 * 📋 **기능**
 * - 수영 자세 3D 모델 표시
 * - 자세 비교 및 분석
 * - 애니메이션 지원
 * - 포즈 데이터 연동
 * 
 * 🛠️ **기술 스택**
 * - Three.js: 3D 렌더링
 * - React Three Fiber: React 통합
 * - Drei: 유틸리티 컴포넌트
 */

'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations, Line } from '@react-three/drei';
import * as THREE from 'three';

interface SwimmingPoseModelProps {
  poseData?: {
    joints: Array<{
      x: number;
      y: number;
      z: number;
      confidence: number;
    }>;
    connections: Array<[number, number]>;
  };
  animation?: 'idle' | 'swimming' | 'freestyle' | 'breaststroke' | 'butterfly' | 'backstroke';
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  showSkeleton?: boolean;
  showJoints?: boolean;
  color?: string;
  onPoseUpdate?: (pose: any) => void;
}

// 기본 인체 골격 연결 정보 (MediaPipe Pose 기준)
const POSE_CONNECTIONS = [
  [11, 12], [11, 13], [13, 15], [12, 14], [14, 16], // 어깨와 팔
  [11, 23], [12, 24], [23, 24], // 몸통
  [23, 25], [25, 27], [27, 29], [29, 31], // 왼쪽 다리
  [24, 26], [26, 28], [28, 30], [30, 32], // 오른쪽 다리
  [15, 17], [17, 19], [19, 21], // 왼쪽 손
  [16, 18], [18, 20], [20, 22], // 오른쪽 손
];

// 기본 수영 자세 데이터 (예시)
const DEFAULT_SWIMMING_POSE = {
  joints: [
    // 머리
    { x: 0, y: 1.7, z: 0, confidence: 0.9 },
    // 어깨
    { x: -0.3, y: 1.5, z: 0, confidence: 0.9 },
    { x: 0.3, y: 1.5, z: 0, confidence: 0.9 },
    // 팔꿈치
    { x: -0.6, y: 1.3, z: 0, confidence: 0.8 },
    { x: 0.6, y: 1.3, z: 0, confidence: 0.8 },
    // 손목
    { x: -0.9, y: 1.1, z: 0, confidence: 0.7 },
    { x: 0.9, y: 1.1, z: 0, confidence: 0.7 },
    // 손
    { x: -1.0, y: 1.0, z: 0, confidence: 0.6 },
    { x: 1.0, y: 1.0, z: 0, confidence: 0.6 },
    // 엄지
    { x: -1.1, y: 1.0, z: 0, confidence: 0.5 },
    { x: 1.1, y: 1.0, z: 0, confidence: 0.5 },
    // 엉덩이
    { x: 0, y: 1.0, z: 0, confidence: 0.9 },
    // 무릎
    { x: -0.2, y: 0.5, z: 0, confidence: 0.8 },
    { x: 0.2, y: 0.5, z: 0, confidence: 0.8 },
    // 발목
    { x: -0.2, y: 0.1, z: 0, confidence: 0.7 },
    { x: 0.2, y: 0.1, z: 0, confidence: 0.7 },
    // 발
    { x: -0.2, y: 0, z: 0, confidence: 0.6 },
    { x: 0.2, y: 0, z: 0, confidence: 0.6 },
  ],
  connections: POSE_CONNECTIONS as [number, number][]
};

// 관절 표시 컴포넌트
function Joint({ position, confidence, color = '#ff6b6b' }: {
  position: [number, number, number];
  confidence: number;
  color?: string;
}) {
  const size = Math.max(0.02, confidence * 0.05);
  
  return (
    <mesh position={position}>
      <sphereGeometry args={[size, 8, 8]} />
      <meshStandardMaterial 
        color={color} 
        emissive={color}
        emissiveIntensity={confidence * 0.3}
        transparent
        opacity={0.8}
      />
    </mesh>
  );
}

// 골격 연결선 컴포넌트
function SkeletonConnection({ start, end, confidence, color = '#4ecdc4' }: {
  start: [number, number, number];
  end: [number, number, number];
  confidence: number;
  color?: string;
}) {
  return (
    <Line
      points={[start, end]}
      color={color}
      transparent
      opacity={Math.max(0.3, confidence * 0.7)}
      lineWidth={2}
    />
  );
}

// 수영 자세 모델 메인 컴포넌트
export function SwimmingPoseModel({
  poseData = DEFAULT_SWIMMING_POSE,
  animation = 'idle',
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  showSkeleton = true,
  showJoints = true,
  color = '#4ecdc4',
  onPoseUpdate
}: SwimmingPoseModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);

  // 애니메이션 프레임 업데이트 (Canvas 내부에서만 실행)
  useFrame((state) => {
    timeRef.current = state.clock.elapsedTime;
    
    if (groupRef.current && animation !== 'idle') {
      // 수영 애니메이션 적용
      const armSwing = Math.sin(timeRef.current * 3) * 0.3;
      
      // 팔 애니메이션
      const leftArm = groupRef.current.children.find(child => child.name === 'leftArm');
      const rightArm = groupRef.current.children.find(child => child.name === 'rightArm');
      
      if (leftArm) {
        leftArm.rotation.z = armSwing;
      }
      if (rightArm) {
        rightArm.rotation.z = -armSwing;
      }
      
      // 전체 몸통 움직임
      groupRef.current.position.y = Math.sin(timeRef.current * 1.5) * 0.05;
    }
  });

  // 포즈 데이터가 변경될 때 콜백 호출
  React.useEffect(() => {
    if (onPoseUpdate && poseData) {
      onPoseUpdate(poseData);
    }
  }, [poseData, onPoseUpdate]);

  // 관절 위치 계산
  const jointPositions = useMemo(() => {
    return poseData.joints.map(joint => [
      joint.x * scale,
      joint.y * scale,
      joint.z * scale
    ] as [number, number, number]);
  }, [poseData.joints, scale]);

  // 연결선 계산
  const connections = useMemo(() => {
    return poseData.connections.map(([start, end]) => ({
      start: jointPositions[start] || [0, 0, 0],
      end: jointPositions[end] || [0, 0, 0],
      confidence: Math.min(
        poseData.joints[start]?.confidence || 0,
        poseData.joints[end]?.confidence || 0
      )
    }));
  }, [poseData.connections, jointPositions, poseData.joints]);

  return (
    <group
      ref={groupRef as any}
      position={position}
      rotation={rotation}
      scale={scale}
    >
      {/* 기본 인체 모델 (간단한 기하학적 형태) */}
      <group name="body">
        {/* 머리 */}
        <mesh position={[0, 1.7 * scale, 0]}>
          <sphereGeometry args={[0.15 * scale, 16, 16]} />
          <meshStandardMaterial color="#ffdbac" />
        </mesh>
        
        {/* 몸통 */}
        <mesh position={[0, 1.25 * scale, 0]}>
          <cylinderGeometry args={[0.25 * scale, 0.3 * scale, 0.5 * scale, 16]} />
          <meshStandardMaterial color="#ffdbac" />
        </mesh>
        
        {/* 왼쪽 팔 */}
        <group name="leftArm" position={[-0.3 * scale, 1.5 * scale, 0]}>
          <mesh>
            <cylinderGeometry args={[0.08 * scale, 0.08 * scale, 0.4 * scale, 8]} />
            <meshStandardMaterial color="#ffdbac" />
          </mesh>
        </group>
        
        {/* 오른쪽 팔 */}
        <group name="rightArm" position={[0.3 * scale, 1.5 * scale, 0]}>
          <mesh>
            <cylinderGeometry args={[0.08 * scale, 0.08 * scale, 0.4 * scale, 8]} />
            <meshStandardMaterial color="#ffdbac" />
          </mesh>
        </group>
        
        {/* 왼쪽 다리 */}
        <mesh position={[-0.15 * scale, 0.75 * scale, 0]}>
          <cylinderGeometry args={[0.1 * scale, 0.1 * scale, 0.5 * scale, 8]} />
          <meshStandardMaterial color="#ffdbac" />
        </mesh>
        
        {/* 오른쪽 다리 */}
        <mesh position={[0.15 * scale, 0.75 * scale, 0]}>
          <cylinderGeometry args={[0.1 * scale, 0.1 * scale, 0.5 * scale, 8]} />
          <meshStandardMaterial color="#ffdbac" />
        </mesh>
      </group>

      {/* 골격 연결선 */}
      {showSkeleton && connections.map((connection, index) => (
        <SkeletonConnection
          key={`connection-${index}`}
          start={connection.start}
          end={connection.end}
          confidence={connection.confidence}
          color={color}
        />
      ))}

      {/* 관절 표시 */}
      {showJoints && poseData.joints.map((joint, index) => (
        <Joint
          key={`joint-${index}`}
          position={jointPositions[index]}
          confidence={joint.confidence}
          color={color}
        />
      ))}

      {/* 수영 애니메이션 효과 */}
      {animation !== 'idle' && (
        <group>
          {/* 물결 효과 (간단한 파티클) */}
          {Array.from({ length: 10 }).map((_, index) => (
            <mesh
              key={`wave-${index}`}
              position={[
                (Math.random() - 0.5) * 2 * scale,
                Math.random() * 0.5 * scale,
                (Math.random() - 0.5) * 2 * scale
              ]}
            >
              <sphereGeometry args={[0.02 * scale, 4, 4]} />
              <meshStandardMaterial 
                color="#87ceeb" 
                transparent 
                opacity={0.3}
              />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}

export default SwimmingPoseModel;
