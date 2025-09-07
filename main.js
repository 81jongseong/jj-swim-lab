/**
 * GLB 애니메이션 검증 스크립트
 * - 강제 움직임 보장 및 디버깅
 */

// 전역 변수
let scene, camera, renderer, controls;
let mixer, clock, model, skeletonHelper;
let isPlaying = false;
let motionDetected = false;
let lastBoundingBox = null;
let motionCheckFrames = 0;
let logElement;

// 로그 함수
function log(message) {
    console.log(message);
    if (logElement) {
        logElement.innerHTML += message + '<br>';
        logElement.scrollTop = logElement.scrollHeight;
    }
}

// 초기화
function init() {
    log('[INIT] Three.js 초기화 시작');
    
    // 씬 생성
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222222);
    
    // 카메라 생성
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1, 3);
    
    // 렌더러 생성
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('container').appendChild(renderer.domElement);
    
    // 컨트롤 생성
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    
    // 조명 설정
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    // 클록 생성
    clock = new THREE.Clock();
    
    // 로그 엘리먼트 참조
    logElement = document.getElementById('log');
    
    // 이벤트 리스너
    setupEventListeners();
    
    // GLB 로드
    loadGLB();
    
    log('[INIT] 초기화 완료');
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 윈도우 리사이즈
    window.addEventListener('resize', onWindowResize);
    
    // 키보드 이벤트
    document.addEventListener('keydown', onKeyDown);
    
    // 버튼 이벤트
    document.getElementById('playBtn').addEventListener('click', playAnimation);
    document.getElementById('pauseBtn').addEventListener('click', pauseAnimation);
    document.getElementById('skeletonBtn').addEventListener('click', toggleSkeleton);
    document.getElementById('resetBtn').addEventListener('click', resetCamera);
}

// GLB 로드
function loadGLB() {
    log('[LOAD] GLB 로드 시작');
    
    const loader = new THREE.GLTFLoader();
    loader.load(
        '/animated_model.glb',
        function(gltf) {
            log('[LOAD] GLB 로드 성공');
            
            model = gltf.scene;
            scene.add(model);
            
            // 모델 정보 로그
            logModelInfo(gltf);
            
            // 애니메이션 설정
            setupAnimations(gltf);
            
            // 자동 재생
            playAnimation();
            
            // 모션 감지 시작
            startMotionDetection();
        },
        function(progress) {
            log(`[LOAD] 로딩 진행률: ${(progress.loaded / progress.total * 100).toFixed(1)}%`);
        },
        function(error) {
            log(`[ERROR] GLB 로드 실패: ${error}`);
            createFallbackAnimation();
        }
    );
}

// 모델 정보 로그
function logModelInfo(gltf) {
    log('[ANIMS] 애니메이션 정보:');
    log(`  - 개수: ${gltf.animations.length}`);
    
    gltf.animations.forEach((anim, index) => {
        log(`  - ${index}: ${anim.name} (${anim.duration.toFixed(2)}초)`);
    });
    
    // 트랙 정보
    if (gltf.animations.length > 0) {
        const firstAnim = gltf.animations[0];
        log('[TRACK] 첫 5개 트랙:');
        firstAnim.tracks.slice(0, 5).forEach((track, index) => {
            log(`  - ${index}: ${track.name}`);
        });
    }
    
    // 씬 정보
    const skinnedMeshes = [];
    const bones = [];
    
    model.traverse((child) => {
        if (child.isSkinnedMesh) {
            skinnedMeshes.push(child);
            if (child.skeleton) {
                bones.push(...child.skeleton.bones);
            }
        }
    });
    
    log(`[SCENE] SkinnedMesh: ${skinnedMeshes.length}개, Bone: ${bones.length}개`);
    
    // 바운딩 박스 계산
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    log(`[SCENE] 바운딩 박스: ${size.x.toFixed(2)} x ${size.y.toFixed(2)} x ${size.z.toFixed(2)}`);
}

// 애니메이션 설정
function setupAnimations(gltf) {
    if (gltf.animations.length === 0) {
        log('[WARNING] 애니메이션이 없습니다');
        return;
    }
    
    // 타겟 선택
    const target = selectTarget(gltf);
    if (!target) {
        log('[ERROR] 애니메이션 타겟을 찾을 수 없습니다');
        return;
    }
    
    log(`[ANIM] 타겟 선택: ${target.name}`);
    
    // 믹서 생성
    mixer = new THREE.AnimationMixer(target);
    
    // 첫 번째 애니메이션 재생
    const firstAnim = gltf.animations[0];
    const action = mixer.clipAction(firstAnim);
    action.play();
    
    log(`[ANIM] 애니메이션 재생: ${firstAnim.name}`);
}

// 타겟 선택
function selectTarget(gltf) {
    // A) gltf.scene
    if (gltf.scene) {
        log('[TARGET] 시도 1: gltf.scene');
        return gltf.scene;
    }
    
    // B) Bone/Armature 루트 후보
    const armatures = [];
    gltf.scene.traverse((child) => {
        if (child.type === 'Bone' || child.type === 'Armature') {
            armatures.push(child);
        }
    });
    
    if (armatures.length > 0) {
        const armature = armatures[0];
        log(`[TARGET] 시도 2: ${armature.name}`);
        return armature;
    }
    
    // C) 첫 번째 트랙의 최상단 노드
    if (gltf.animations.length > 0) {
        const firstTrack = gltf.animations[0].tracks[0];
        const nodeName = firstTrack.name.split('.')[0];
        
        let targetNode = null;
        gltf.scene.traverse((child) => {
            if (child.name === nodeName) {
                targetNode = child;
            }
        });
        
        if (targetNode) {
            log(`[TARGET] 시도 3: ${targetNode.name}`);
            return targetNode;
        }
    }
    
    return null;
}

// 애니메이션 재생
function playAnimation() {
    if (mixer) {
        mixer.timeScale = 1.0;
        isPlaying = true;
        log('[ANIM] 재생 시작');
    }
}

// 애니메이션 일시정지
function pauseAnimation() {
    if (mixer) {
        mixer.timeScale = 0.0;
        isPlaying = false;
        log('[ANIM] 일시정지');
    }
}

// 스켈레톤 토글
function toggleSkeleton() {
    if (skeletonHelper) {
        scene.remove(skeletonHelper);
        skeletonHelper = null;
        log('[SKELETON] 숨김');
    } else {
        createSkeletonHelper();
        log('[SKELETON] 표시');
    }
}

// 스켈레톤 헬퍼 생성
function createSkeletonHelper() {
    if (!model) return;
    
    const skinnedMeshes = [];
    model.traverse((child) => {
        if (child.isSkinnedMesh && child.skeleton) {
            skinnedMeshes.push(child);
        }
    });
    
    if (skinnedMeshes.length > 0) {
        skeletonHelper = new THREE.SkeletonHelper(skinnedMeshes[0]);
        skeletonHelper.material.color.setHex(0xff0000);
        skeletonHelper.material.linewidth = 3;
        scene.add(skeletonHelper);
    }
}

// 카메라 리셋
function resetCamera() {
    camera.position.set(0, 1, 3);
    controls.reset();
    log('[CAMERA] 리셋');
}

// 모션 감지 시작
function startMotionDetection() {
    log('[MOTION] 모션 감지 시작');
    motionCheckFrames = 0;
    lastBoundingBox = null;
}

// 모션 감지
function checkMotion() {
    if (!model || motionCheckFrames < 60) return; // 1초 후 시작
    
    const box = new THREE.Box3().setFromObject(model);
    const currentBoundingBox = {
        min: box.min.clone(),
        max: box.max.clone()
    };
    
    if (lastBoundingBox) {
        const delta = currentBoundingBox.min.distanceTo(lastBoundingBox.min) + 
                     currentBoundingBox.max.distanceTo(lastBoundingBox.max);
        
        if (delta > 0.001) {
            if (!motionDetected) {
                motionDetected = true;
                log('[MOTION] 움직임 감지됨!');
            }
        }
    }
    
    lastBoundingBox = currentBoundingBox;
    
    // 2초 후 결과 출력
    if (motionCheckFrames === 120) {
        log(`[MOTION] 결과: ${motionDetected ? 'true' : 'false'}`);
    }
}

// 폴백 애니메이션 생성
function createFallbackAnimation() {
    log('[FALLBACK] 폴백 애니메이션 생성');
    
    // 간단한 큐브 생성
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    
    // 회전 애니메이션
    function animate() {
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
    }
    
    // 애니메이션 루프에 추가
    const originalAnimate = window.animate;
    window.animate = function() {
        animate();
        if (originalAnimate) originalAnimate();
    };
    
    log('[FALLBACK] 폴백 애니메이션 활성화');
}

// 키보드 이벤트
function onKeyDown(event) {
    switch(event.key.toLowerCase()) {
        case 'h':
            toggleSkeleton();
            break;
        case ' ':
            event.preventDefault();
            if (isPlaying) {
                pauseAnimation();
            } else {
                playAnimation();
            }
            break;
    }
}

// 윈도우 리사이즈
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// 애니메이션 루프
function animate() {
    requestAnimationFrame(animate);
    
    // 컨트롤 업데이트
    controls.update();
    
    // 믹서 업데이트
    if (mixer && isPlaying) {
        const delta = clock.getDelta();
        mixer.update(delta);
    }
    
    // 모션 감지
    motionCheckFrames++;
    checkMotion();
    
    // 렌더링
    renderer.render(scene, camera);
}

// 상태 업데이트
function updateStatus() {
    const statusElement = document.getElementById('status');
    if (statusElement) {
        let status = `재생: ${isPlaying ? 'ON' : 'OFF'}`;
        status += ` | 모션: ${motionDetected ? '감지됨' : '없음'}`;
        status += ` | 스켈레톤: ${skeletonHelper ? 'ON' : 'OFF'}`;
        statusElement.textContent = status;
    }
}

// 주기적 상태 업데이트
setInterval(updateStatus, 100);

// 초기화 실행
init();

// 애니메이션 루프 시작
animate();


