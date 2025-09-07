'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface ThreeJSViewerProps {
  animationData?: any;
  modelPaths?: string[];
  width?: number;
  height?: number;
}

const ThreeJSViewer: React.FC<ThreeJSViewerProps> = ({
  animationData,
  modelPaths = [],
  width = 800,
  height = 600
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const animationRef = useRef<number>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Three.js 씬 초기화
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); // 하늘색 배경
    sceneRef.current = scene;

    // 카메라 설정
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 0, 5);
    cameraRef.current = camera;

    // 렌더러 설정
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    mountRef.current.appendChild(renderer.domElement);

    // 조명 설정
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // 수영장 환경 생성
    createSwimmingPool(scene);

    // 3D 모델 로드
    if (modelPaths.length > 0) {
      loadSwimmerModel(scene, modelPaths[0]);
    } else if (animationData) {
      createSwimmerFromPoseData(scene, animationData);
    } else {
      createDefaultSwimmer(scene);
    }

    setIsLoading(false);

    // 애니메이션 루프
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      
      if (sceneRef.current && cameraRef.current && rendererRef.current) {
        // 카메라 회전 (자동 회전)
        const time = Date.now() * 0.001;
        camera.position.x = Math.cos(time * 0.2) * 5;
        camera.position.z = Math.sin(time * 0.2) * 5;
        camera.lookAt(0, 0, 0);

        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate();

    // 정리 함수
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [width, height, modelPaths, animationData]);

  const createSwimmingPool = (scene: THREE.Scene) => {
    // 수영장 바닥
    const poolGeometry = new THREE.PlaneGeometry(20, 10);
    const poolMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x0066cc,
      transparent: true,
      opacity: 0.8
    });
    const pool = new THREE.Mesh(poolGeometry, poolMaterial);
    pool.rotation.x = -Math.PI / 2;
    pool.position.y = -2;
    pool.receiveShadow = true;
    scene.add(pool);

    // 수영장 가장자리
    const edgeGeometry = new THREE.BoxGeometry(20, 0.5, 10);
    const edgeMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
    
    const edge1 = new THREE.Mesh(edgeGeometry, edgeMaterial);
    edge1.position.set(0, -1.75, 0);
    scene.add(edge1);
  };

  const createDefaultSwimmer = (scene: THREE.Scene) => {
    // 기본 수영자 모델 생성
    const group = new THREE.Group();

    // 몸통
    const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.4, 1.5, 8);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0xffdbac });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0;
    body.castShadow = true;
    group.add(body);

    // 머리
    const headGeometry = new THREE.SphereGeometry(0.2, 8, 8);
    const headMaterial = new THREE.MeshLambertMaterial({ color: 0xffdbac });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.1;
    head.castShadow = true;
    group.add(head);

    // 팔
    const armGeometry = new THREE.CylinderGeometry(0.05, 0.08, 0.8, 6);
    const armMaterial = new THREE.MeshLambertMaterial({ color: 0xffdbac });
    
    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-0.5, 0.3, 0);
    leftArm.rotation.z = Math.PI / 4;
    leftArm.castShadow = true;
    group.add(leftArm);

    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(0.5, 0.3, 0);
    rightArm.rotation.z = -Math.PI / 4;
    rightArm.castShadow = true;
    group.add(rightArm);

    // 다리
    const legGeometry = new THREE.CylinderGeometry(0.08, 0.1, 1.0, 6);
    const legMaterial = new THREE.MeshLambertMaterial({ color: 0x0066cc });
    
    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-0.2, -1.2, 0);
    leftLeg.castShadow = true;
    group.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(0.2, -1.2, 0);
    rightLeg.castShadow = true;
    group.add(rightLeg);

    scene.add(group);
  };

  const createSwimmerFromPoseData = (scene: THREE.Scene, animationData: any) => {
    if (!animationData.animation?.frames) return;

    const group = new THREE.Group();
    const frames = animationData.animation.frames;
    
    // 첫 번째 프레임의 랜드마크로 기본 모델 생성
    if (frames.length > 0) {
      const landmarks = frames[0].landmarks;
      
      // 주요 관절점들을 3D 오브젝트로 표시
      landmarks.forEach((landmark: any, index: number) => {
        if (landmark.visibility > 0.5) {
          const geometry = new THREE.SphereGeometry(0.05, 8, 8);
          const material = new THREE.MeshLambertMaterial({ 
            color: new THREE.Color().setHSL(index / landmarks.length, 0.7, 0.6)
          });
          const sphere = new THREE.Mesh(geometry, material);
          
          // 좌표 변환 (MediaPipe 좌표계 → Three.js 좌표계)
          sphere.position.set(
            (landmark.x - 0.5) * 4,
            -(landmark.y - 0.5) * 4,
            landmark.z * 2
          );
          
          group.add(sphere);
        }
      });
    }

    scene.add(group);
  };

  const loadSwimmerModel = async (scene: THREE.Scene, modelPath: string) => {
    try {
      // OBJ 로더를 사용하여 3D 모델 로드
      const loader = new THREE.ObjectLoader();
      
      // 실제 구현에서는 OBJLoader를 사용해야 하지만,
      // 여기서는 기본 모델을 생성
      createDefaultSwimmer(scene);
      
    } catch (err) {
      console.error('3D 모델 로드 실패:', err);
      setError('3D 모델을 로드할 수 없습니다.');
      createDefaultSwimmer(scene);
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-2">⚠️</div>
          <div className="text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      {isLoading && (
        <div className="flex items-center justify-center w-full h-full bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <div className="text-gray-600">3D 모델 로딩 중...</div>
          </div>
        </div>
      )}
      <div 
        ref={mountRef} 
        className="w-full h-full rounded-lg overflow-hidden"
        style={{ display: isLoading ? 'none' : 'block' }}
      />
    </div>
  );
};

export default ThreeJSViewer;







