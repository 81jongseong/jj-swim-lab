'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { Suspense } from 'react';

interface SwimmingPoseViewerProps {
  swimmingStyle: 'freestyle' | 'breaststroke' | 'backstroke' | 'butterfly';
}

// 3D 모델 컴포넌트
function SwimmingModel({ swimmingStyle }: { swimmingStyle: string }) {
  // 실제 3D 모델 파일이 있을 때 사용
  // const { scene } = useGLTF(`/models/${swimmingStyle}.glb`);
  
  // 임시로 기본 수인 모델 사용
  return (
    <group>
      {/* 기본 수인 모델 (임시) */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.5, 1.8, 0.3]} />
        <meshStandardMaterial color="#4A90E2" />
      </mesh>
      
      {/* 머리 */}
      <mesh position={[0, 1.2, 0]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color="#F5B5A5" />
      </mesh>
      
      {/* 팔 (수영법에 따라 다른 자세) */}
      {swimmingStyle === 'freestyle' && (
        <>
          {/* 왼팔 - 앞으로 뻗기 */}
          <mesh position={[-0.8, 0.5, 0]} rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[0.2, 0.8, 0.2]} />
            <meshStandardMaterial color="#F5B5A5" />
          </mesh>
          {/* 오른팔 - 뒤로 젖히기 */}
          <mesh position={[0.8, 0.3, 0]} rotation={[0, 0, -Math.PI / 3]}>
            <boxGeometry args={[0.2, 0.8, 0.2]} />
            <meshStandardMaterial color="#F5B5A5" />
          </mesh>
        </>
      )}
      
      {swimmingStyle === 'breaststroke' && (
        <>
          {/* 팔 - 앞으로 뻗기 (평영 자세) */}
          <mesh position={[0, 0.5, 0.5]} rotation={[Math.PI / 6, 0, 0]}>
            <boxGeometry args={[0.2, 0.8, 0.2]} />
            <meshStandardMaterial color="#F5B5A5" />
          </mesh>
        </>
      )}
      
      {swimmingStyle === 'backstroke' && (
        <>
          {/* 팔 - 위로 뻗기 (배영 자세) */}
          <mesh position={[0, 0.5, -0.5]} rotation={[-Math.PI / 6, 0, 0]}>
            <boxGeometry args={[0.2, 0.8, 0.2]} />
            <meshStandardMaterial color="#F5B5A5" />
          </mesh>
        </>
      )}
      
      {swimmingStyle === 'butterfly' && (
        <>
          {/* 팔 - 양쪽으로 뻗기 (접영 자세) */}
          <mesh position={[-0.6, 0.5, 0]} rotation={[0, 0, Math.PI / 3]}>
            <boxGeometry args={[0.2, 0.8, 0.2]} />
            <meshStandardMaterial color="#F5B5A5" />
          </mesh>
          <mesh position={[0.6, 0.5, 0]} rotation={[0, 0, -Math.PI / 3]}>
            <boxGeometry args={[0.2, 0.8, 0.2]} />
            <meshStandardMaterial color="#F5B5A5" />
          </mesh>
        </>
      )}
      
      {/* 다리 */}
      <mesh position={[0, -1.2, 0]}>
        <boxGeometry args={[0.3, 0.8, 0.3]} />
        <meshStandardMaterial color="#4A90E2" />
      </mesh>
      
      {/* 발 */}
      <mesh position={[0, -1.7, 0.1]}>
        <boxGeometry args={[0.4, 0.1, 0.6]} />
        <meshStandardMaterial color="#F5B5A5" />
      </mesh>
    </group>
  );
}

// 로딩 컴포넌트
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <span className="ml-3 text-lg text-gray-600">3D 모델 로딩 중...</span>
    </div>
  );
}

// 메인 3D 뷰어 컴포넌트
export default function SwimmingPoseViewer({ swimmingStyle }: SwimmingPoseViewerProps) {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
      >
        {/* 조명 */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        {/* 3D 모델 */}
        <Suspense fallback={null}>
          <SwimmingModel swimmingStyle={swimmingStyle} />
        </Suspense>
        
        {/* 카메라 컨트롤 */}
        <OrbitControls
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          zoomSpeed={0.8}
          panSpeed={0.8}
          rotateSpeed={0.8}
          minDistance={2}
          maxDistance={10}
        />
        
        {/* 그리드 (참고용) */}
        <gridHelper args={[10, 10, '#666', '#999']} />
        
        {/* 축 표시 (참고용) */}
        <axesHelper args={[2]} />
      </Canvas>
    </div>
  );
}
