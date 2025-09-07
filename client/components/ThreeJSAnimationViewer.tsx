'use client';

import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface ThreeJSAnimationViewerProps {
  videoId: string;
  modelPath?: string;
  animationData?: any;
  className?: string;
}

const ThreeJSAnimationViewer: React.FC<ThreeJSAnimationViewerProps> = ({
  videoId,
  modelPath,
  animationData,
  className = ''
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!mountRef.current) return;

    // 씬 초기화
    initScene();
    
    // 모델 로드
    loadModel();
    
    // 애니메이션 설정
    setupAnimation();

    return () => {
      cleanup();
    };
  }, [videoId, modelPath]);

  const initScene = () => {
    if (!mountRef.current) return;

    // 씬 생성
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    sceneRef.current = scene;

    // 카메라 생성
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1, 3);
    cameraRef.current = camera;

    // 렌더러 생성
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true 
    });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;

    // 컨트롤 설정
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.target.set(0, 1, 0);
    controlsRef.current = controls;

    // 조명 설정
    setupLighting(scene);

    // 마운트
    mountRef.current.appendChild(renderer.domElement);

    // 리사이즈 핸들러
    const handleResize = () => {
      if (!mountRef.current || !camera || !renderer) return;
      
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);
  };

  const setupLighting = (scene: THREE.Scene) => {
    // 환경광
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    // 방향광 (태양)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;
    scene.add(directionalLight);

    // 포인트 라이트 (보조 조명)
    const pointLight = new THREE.PointLight(0xffffff, 0.5, 100);
    pointLight.position.set(-5, 5, 5);
    scene.add(pointLight);
  };

  const loadModel = async () => {
    if (!sceneRef.current) return;

    setIsLoading(true);
    setError(null);

    try {
      // GLB 로더
      const loader = new GLTFLoader();
      
      console.log(`[DEBUG] GLB 파일 로드 시도: /api/video-upload/download/${videoId}/glb`);
      
      // 모델 로드
      const gltf = await new Promise<any>((resolve, reject) => {
        loader.load(
          `/api/video-upload/download/${videoId}/glb`,
          (gltf) => {
            console.log('[DEBUG] GLB 로드 성공:', gltf);
            console.log('[DEBUG] 애니메이션 개수:', gltf.animations?.length || 0);
            resolve(gltf);
          },
          (progress) => {
            const percent = (progress.loaded / progress.total) * 100;
            console.log(`[DEBUG] 로딩 진행률: ${percent.toFixed(1)}%`);
            setProgress(percent);
          },
          (error) => {
            console.error('[DEBUG] GLB 로드 실패:', error);
            reject(error);
          }
        );
      });

      // 모델을 씬에 추가
      if (gltf.scene) {
        // 모델 크기 조정
        const box = new THREE.Box3().setFromObject(gltf.scene);
        const size = box.getSize(new THREE.Vector3());
        const maxDimension = Math.max(size.x, size.y, size.z);
        const scale = 2 / maxDimension; // 2 단위 높이로 스케일링
        
        gltf.scene.scale.setScalar(scale);
        gltf.scene.position.y = -box.min.y * scale; // 바닥에 맞춤
        
        gltf.scene.traverse((child: any) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        sceneRef.current.add(gltf.scene);
        modelRef.current = gltf.scene;

        console.log(`[DEBUG] 모델 크기 조정: 원본 ${maxDimension.toFixed(2)} → 스케일 ${scale.toFixed(3)}`);

        // 애니메이션 설정
        if (gltf.animations && gltf.animations.length > 0) {
          console.log('[DEBUG] 애니메이션 설정 시작');
          setupModelAnimation(gltf.animations);
        } else {
          console.log('[DEBUG] 애니메이션이 없습니다. 기본 애니메이션 생성');
          createDefaultAnimation();
        }
      }

      setIsLoading(false);
    } catch (err) {
      console.error('모델 로드 오류:', err);
      setError('모델을 로드할 수 없습니다.');
      console.log('[DEBUG] 기본 모델 생성');
      createDefaultModel();
      setIsLoading(false);
    }
  };

  const createDefaultModel = () => {
    if (!sceneRef.current) return;

    // 기본 인체 모델 생성
    const group = new THREE.Group();
    
    // 몸통
    const bodyGeometry = new THREE.BoxGeometry(0.8, 1.2, 0.4);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.6;
    body.castShadow = true;
    group.add(body);

    // 머리
    const headGeometry = new THREE.SphereGeometry(0.3, 32, 32);
    const headMaterial = new THREE.MeshLambertMaterial({ color: 0xFFDBB5 });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.5;
    head.castShadow = true;
    group.add(head);

    // 팔
    const armGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 8);
    const armMaterial = new THREE.MeshLambertMaterial({ color: 0xFFDBB5 });
    
    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-0.6, 1, 0);
    leftArm.rotation.z = Math.PI / 2;
    leftArm.castShadow = true;
    group.add(leftArm);

    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(0.6, 1, 0);
    rightArm.rotation.z = -Math.PI / 2;
    rightArm.castShadow = true;
    group.add(rightArm);

    // 다리
    const legGeometry = new THREE.CylinderGeometry(0.12, 0.12, 1, 8);
    const legMaterial = new THREE.MeshLambertMaterial({ color: 0x4169E1 });
    
    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-0.2, -0.5, 0);
    leftLeg.castShadow = true;
    group.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(0.2, -0.5, 0);
    rightLeg.castShadow = true;
    group.add(rightLeg);

    sceneRef.current.add(group);
    modelRef.current = group;

    // 기본 애니메이션 생성
    createDefaultAnimation();
  };

  const setupModelAnimation = (animations: THREE.AnimationClip[]) => {
    if (!modelRef.current || !animations.length) {
      console.log('[DEBUG] 모델 또는 애니메이션이 없습니다');
      return;
    }

    console.log(`[DEBUG] ${animations.length}개의 애니메이션 발견`);
    console.log('[DEBUG] 모델 정보:', modelRef.current);
    console.log('[DEBUG] 모델 자식들:', modelRef.current.children);
    
    // 모델의 모든 자식 객체를 검사하여 애니메이션 가능한 객체 찾기
    const findAnimatedObjects = (obj: THREE.Object3D): THREE.Object3D[] => {
      const animatedObjects: THREE.Object3D[] = [];
      
      if (obj.type === 'SkinnedMesh' || obj.type === 'Mesh') {
        animatedObjects.push(obj);
      }
      
      obj.children.forEach(child => {
        animatedObjects.push(...findAnimatedObjects(child));
      });
      
      return animatedObjects;
    };
    
    const animatedObjects = findAnimatedObjects(modelRef.current);
    console.log('[DEBUG] 애니메이션 가능한 객체들:', animatedObjects.map(obj => obj.name));
    
    const mixer = new THREE.AnimationMixer(modelRef.current);
    mixerRef.current = mixer;

    // 모든 애니메이션을 찾아서 재생
    let foundAction = null;
    for (const clip of animations) {
      console.log(`[DEBUG] 애니메이션 클립: ${clip.name}, 길이: ${clip.duration}초`);
      console.log(`[DEBUG] 애니메이션 트랙 수: ${clip.tracks.length}`);
      
      // 트랙 정보 상세 출력
      clip.tracks.forEach((track, index) => {
        console.log(`[DEBUG] 트랙 ${index}: ${track.name}, 키프레임 수: ${track.times.length}`);
      });
      
      const action = mixer.clipAction(clip);
      if (action) {
        foundAction = action;
        console.log('[DEBUG] 애니메이션 재생 시작:', clip.name);
        console.log('[DEBUG] 액션 정보:', action);
        
        // 액션 설정 강화
        action.setEffectiveWeight(1.0);
        action.setEffectiveTimeScale(1.0);
        action.enabled = true;
        action.clampWhenFinished = false;
        action.setLoop(THREE.LoopRepeat, Infinity);
        action.play();
        
        console.log('[DEBUG] 액션 재생 상태:', action.isRunning());
        console.log('[DEBUG] 액션 가중치:', action.getEffectiveWeight());
        console.log('[DEBUG] 액션 시간 스케일:', action.getEffectiveTimeScale());
        break;
      }
    }

    if (foundAction) {
      setIsPlaying(true);
      console.log('[DEBUG] 애니메이션 재생 성공');
    } else {
      console.log('[DEBUG] 재생 가능한 애니메이션을 찾을 수 없습니다');
    }
  };

  const createDefaultAnimation = () => {
    if (!modelRef.current) return;

    const mixer = new THREE.AnimationMixer(modelRef.current);
    mixerRef.current = mixer;

    // 수영 애니메이션 생성
    const tracks: THREE.KeyframeTrack[] = [];
    const duration = 4; // 4초
    const times = [0, duration / 4, duration / 2, 3 * duration / 4, duration];

    // 팔 동작
    const leftArmRotation = new THREE.VectorKeyframeTrack(
      '.children[2].rotation[y]',
      times,
      [0, Math.PI / 2, 0, -Math.PI / 2, 0]
    );
    tracks.push(leftArmRotation);

    const rightArmRotation = new THREE.VectorKeyframeTrack(
      '.children[3].rotation[y]',
      times,
      [0, -Math.PI / 2, 0, Math.PI / 2, 0]
    );
    tracks.push(rightArmRotation);

    // 다리 동작
    const leftLegRotation = new THREE.VectorKeyframeTrack(
      '.children[4].rotation[x]',
      times,
      [0, 0.5, 0, 0.5, 0]
    );
    tracks.push(leftLegRotation);

    const rightLegRotation = new THREE.VectorKeyframeTrack(
      '.children[5].rotation[x]',
      times,
      [0, -0.5, 0, -0.5, 0]
    );
    tracks.push(rightLegRotation);

    // 애니메이션 클립 생성
    const clip = new THREE.AnimationClip('swimming', duration, tracks);
    const action = mixer.clipAction(clip);
    action.play();
    action.setLoop(THREE.LoopRepeat, Infinity);
  };

  const setupAnimation = () => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;

    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      // 컨트롤 업데이트
      if (controlsRef.current) {
        controlsRef.current.update();
      }

      // 실제 시간 기반 delta 계산
      const currentTime = performance.now();
      const deltaTime = (currentTime - lastTimeRef.current) / 1000; // 초 단위
      lastTimeRef.current = currentTime;

      // 애니메이션 믹서 업데이트
      if (mixerRef.current) {
        mixerRef.current.update(deltaTime);
        
        // 디버그: 액션 상태 확인
        const actions = (mixerRef.current as any)._actions;
        if (actions && actions.length > 0) {
          const action = actions[0];
          if (action && action.isRunning()) {
            // 1초마다 한 번만 로그 출력 (너무 많은 로그 방지)
            if (Math.floor(action.time * 10) % 10 === 0) {
              console.log(`[DEBUG] 애니메이션 재생 중: ${action.getClip().name}, 시간: ${action.time.toFixed(2)}초`);
            }
          } else {
            // 액션이 실행되지 않는 경우 강제로 재시작
            console.log('[DEBUG] 액션이 중지됨. 재시작 시도...');
            action.play();
          }
        }
      }

      // 렌더링
      rendererRef.current!.render(sceneRef.current!, cameraRef.current!);
    };

    // 시간 초기화
    lastTimeRef.current = performance.now();
    animate();
  };

  const cleanup = () => {
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current);
    }

    if (rendererRef.current && mountRef.current) {
      mountRef.current.removeChild(rendererRef.current.domElement);
      rendererRef.current.dispose();
    }

    if (mixerRef.current) {
      mixerRef.current.stopAllAction();
    }
  };

  const togglePlayPause = () => {
    if (mixerRef.current) {
      if (isPlaying) {
        mixerRef.current.stopAllAction();
      } else {
        if (modelRef.current) {
          createDefaultAnimation();
        }
      }
      setIsPlaying(!isPlaying);
    }
  };

  const resetCamera = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(0, 1, 3);
      controlsRef.current.target.set(0, 1, 0);
      controlsRef.current.update();
    }
  };

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* 로딩 오버레이 */}
      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>3D 모델 로딩 중...</p>
            {progress > 0 && (
              <div className="w-64 bg-gray-700 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div className="absolute inset-0 bg-red-900 bg-opacity-50 flex items-center justify-center z-10">
          <div className="text-white text-center">
            <p className="text-red-300 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              다시 시도
            </button>
          </div>
        </div>
      )}

      {/* 3D 뷰어 컨테이너 */}
      <div ref={mountRef} className="w-full h-full" />

      {/* 컨트롤 패널 */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-center space-x-4">
        <button
          onClick={togglePlayPause}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          {isPlaying ? '⏸️ 일시정지' : '▶️ 재생'}
        </button>
        <button
          onClick={resetCamera}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
        >
          🔄 카메라 리셋
        </button>
      </div>

      {/* 안내 텍스트 */}
      <div className="absolute top-4 left-4 text-white text-sm bg-black bg-opacity-50 px-3 py-2 rounded">
        <p>🖱️ 마우스로 회전, 휠로 확대/축소</p>
        <p>📱 모바일: 터치로 조작</p>
      </div>
    </div>
  );
};

export default ThreeJSAnimationViewer;


