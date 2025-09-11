# Blender FK 리타겟 스크립트

## 개요
BVH 애니메이션을 타겟 아마추어에 FK(Forward Kinematics) 방식으로 리타겟팅하는 Blender 스크립트입니다.

## 주요 기능

### 1. FK 방식 제약 조건 설정
- **루트 본 (Hips)**: `COPY_TRANSFORMS` (위치 + 회전)
- **나머지 본**: `COPY_ROTATION` (회전만, mix=ADD)
- **손/발 끝 본**: influence 0.6~0.8로 제한
- **IK/컨트롤 본**: 자동 제외

### 2. 뼈대 최적화
- 모든 본 `rotation_mode='QUATERNION'` 설정
- 본 롤 자동 재정렬 (`calculate_roll()`)
- BVH 축/스케일 고정 및 루트 오프셋 자동 보정

### 3. 애니메이션 처리
- NLA Bake (`visual_keying=True`, `clear_constraints=True`)
- fcurves/keyframes > 0 검증
- Armature Modifier 'Preserve Volume' 활성화

### 4. GLB 내보내기
- `export_anim=True`로 애니메이션 포함
- 최적화된 애니메이션 크기
- 상세한 로그 출력

## 사용법

```bash
python blender_fk_retarget.py <bvh_file> <target_armature_name> <output_path> [start_frame] [end_frame]
```

### 매개변수
- `bvh_file`: 입력 BVH 파일 경로
- `target_armature_name`: 타겟 아마추어 오브젝트 이름
- `output_path`: 출력 GLB 파일 경로
- `start_frame`: 시작 프레임 (기본값: 1)
- `end_frame`: 끝 프레임 (기본값: 100)

### 예시
```bash
python blender_fk_retarget.py input.bvh TargetArmature output.glb 1 100
```

## 로그 출력

### [MAP] - 제약 조건 매핑
```
[MAP] copy_type=transforms bone=Hips influence=1.0
[MAP] copy_type=rotation bone=spine_01 influence=1.0
[MAP] copy_type=rotation bone=handl influence=0.7 (end_effector)
```

### [ROOT] - 루트 본 보정
```
[ROOT] BVH 축/스케일 고정 시작
[ROOT] 루트 본 보정 완료: Hips
[ROOT] BVH 축/스케일 고정 완료
```

### [ACT] - 애니메이션 Bake
```
[ACT] NLA Bake 시작
[ACT] Bake 완료: fcurves=45, keyframes=4500
[ACT] ✅ 애니메이션 Bake 성공
```

### [GLB] - GLB 내보내기
```
[GLB] GLB 내보내기 시작: output.glb
[GLB] ✅ GLB 내보내기 성공: output.glb (2048576 bytes)
```

## IK/컨트롤 본 제외 키워드
다음 키워드가 포함된 본은 자동으로 제외됩니다:
- `IK`, `Ctrl`, `Pole`, `Helper`, `Target`
- `MCH`, `DEF`, `ORG`

## 손/발 끝 본 감지 키워드
다음 키워드가 포함된 본은 낮은 영향력(0.7)을 적용받습니다:
- `hand`, `foot`, `finger`, `toe`
- `thumb`, `index`, `middle`, `ring`, `pinky`

## 루트 본 감지 키워드
다음 키워드가 포함된 본은 루트 본으로 처리됩니다:
- `Hips`, `Root`, `rootx`, `pelvis`, `hip`

## 특징

### 메쉬 안정성
- Armature Modifier의 'Preserve Volume' 활성화로 메쉬 늘어짐 방지
- FK 방식으로 자연스러운 관절 움직임 구현

### 성능 최적화
- 불필요한 IK/컨트롤 본 제외
- 효율적인 제약 조건 설정
- 최적화된 GLB 내보내기

### 오류 처리
- 각 단계별 검증 및 로그 출력
- 실패 시 자동 정리 작업
- 상세한 오류 메시지

## 요구사항
- Blender 3.0+
- Python 3.7+
- BVH 파일
- 타겟 아마추어 오브젝트

## 주의사항
1. BVH 파일과 타겟 아마추어의 본 이름이 유사해야 합니다
2. 타겟 아마추어는 미리 로드되어 있어야 합니다
3. 스크립트 실행 후 소스 아마추어는 자동으로 제거됩니다
4. GLB 내보내기 전에 메쉬 오브젝트가 Armature Modifier를 가지고 있어야 합니다






