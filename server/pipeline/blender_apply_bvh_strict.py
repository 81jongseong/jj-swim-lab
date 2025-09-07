#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Blender BVH 적용 스크립트 (엄격한 버전)
- FBX 모델 로드
- Armature 자동 선택
- BVH 애니메이션 적용
- GLB 내보내기
"""

import bpy
import bmesh
import os
import sys
import argparse
import unicodedata
from pathlib import Path

def normalize_unicode_path(path):
    """유니코드 경로 정규화 (NFC)"""
    return unicodedata.normalize('NFC', str(path))

def clear_scene():
    """씬 초기화"""
    print("[ARMATURE] 씬 초기화 중...")
    
    # 모든 오브젝트 선택 및 삭제
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    
    # 모든 데이터 블록 정리
    for collection in bpy.data.collections:
        bpy.data.collections.remove(collection)
    
    print("[ARMATURE] 씬 초기화 완료")

def import_model(model_path):
    """모델 파일 임포트 (FBX 또는 BLEND)"""
    print(f"[MODEL] 모델 임포트 시작: {model_path}")
    
    if not os.path.exists(str(model_path)):
        raise FileNotFoundError(f"모델 파일을 찾을 수 없습니다: {model_path}")
    
    # 임포트 전 오브젝트 목록 저장
    objects_before = set(obj.name for obj in bpy.context.scene.objects)
    
    # 파일 확장자에 따른 임포트 방식 선택
    file_ext = Path(model_path).suffix.lower()
    
    if file_ext == '.blend':
        # Blender 네이티브 파일
        print(f"[MODEL] Blender 파일 임포트: {model_path}")
        bpy.ops.wm.open_mainfile(filepath=str(model_path))
    elif file_ext == '.fbx':
        # FBX 파일
        print(f"[MODEL] FBX 파일 임포트: {model_path}")
        bpy.ops.import_scene.fbx(filepath=str(model_path))
    else:
        raise ValueError(f"지원하지 않는 파일 형식: {file_ext}")
    
    # 임포트 후 오브젝트 목록 저장
    objects_after = set(obj.name for obj in bpy.context.scene.objects)
    
    # 새로 추가된 오브젝트들
    new_objects = objects_after - objects_before
    print(f"[MODEL] 새로 추가된 오브젝트들: {list(new_objects)}")
    
    print(f"[MODEL] 모델 임포트 완료: {model_path}")
    return list(new_objects)

def find_target_armature():
    """타겟 Armature 찾기"""
    print("[ARMATURE] 타겟 Armature 검색 중...")
    
    # 모든 오브젝트 출력
    print("[ARMATURE] 씬의 모든 오브젝트들:")
    for obj in bpy.context.scene.objects:
        print(f"  - {obj.name} (타입: {obj.type})")
    
    # 1. 먼저 Armature 타입 오브젝트 찾기
    armatures = [obj for obj in bpy.context.scene.objects if obj.type == 'ARMATURE']
    print(f"[ARMATURE] Armature 오브젝트들: {[obj.name for obj in armatures]}")
    
    if armatures:
        # 첫 번째 Armature 선택
        target_armature = armatures[0]
        print(f"[ARMATURE] 타겟 Armature 선택: {target_armature.name}")
        return target_armature
    
    # 2. 리깅된 메인 모델 찾기
    user_objects = [obj for obj in bpy.context.scene.objects if obj.type == 'MESH']
    print(f"[ARMATURE] 메시 오브젝트들: {[obj.name for obj in user_objects]}")
    
    # 기본 오브젝트 제외
    default_objects = ['Cube', 'Light', 'Camera', 'bubble', 'ü', '.001', 'ڽǾ.001', '', 'DefaultBody']
    
    # 리깅된 모델 우선순위
    rigged_models = ['CC_Base_Body', 'Female_Angled', 'swimGoggles', 'swimmingSuit.007']
    user_uploaded_objects = []
    
    for obj in user_objects:
        # 유니코드 정규화
        normalized_name = unicodedata.normalize('NFC', obj.name)
        print(f"[ARMATURE] 오브젝트: '{obj.name}' -> 정규화: '{normalized_name}'")
        
        # 기본 오브젝트가 아니고 리깅된 모델인 경우
        if normalized_name not in default_objects and normalized_name in rigged_models:
            user_uploaded_objects.append(obj)
            print(f"[ARMATURE] 리깅된 모델 발견: {obj.name}")
    
    print(f"[ARMATURE] 사용자 업로드 모델들: {[obj.name for obj in user_uploaded_objects]}")
    
    if user_uploaded_objects:
        # CC_Base_Body가 있으면 우선 선택
        cc_base_body = [obj for obj in user_uploaded_objects if obj.name == 'CC_Base_Body']
        if cc_base_body:
            target_armature = cc_base_body[0]
            print(f"[ARMATURE] CC_Base_Body 선택: {target_armature.name}")
            return target_armature
        else:
            # 가장 큰 메시 선택
            target_armature = max(user_uploaded_objects, key=lambda obj: len(obj.data.vertices) if obj.data else 0)
            print(f"[ARMATURE] 가장 큰 메시 선택: {target_armature.name}")
            return target_armature
    
    # 3. 기본 모델 생성
    print("[ARMATURE] 리깅된 모델이 없습니다. 기본 모델을 생성합니다.")
    create_default_model()
    target_armature = bpy.context.active_object
    print(f"[ARMATURE] 기본 모델 생성: {target_armature.name}")
    return target_armature

def create_default_model():
    """기본 모델 생성"""
    print("[ARMATURE] 기본 모델 생성 중...")
    
    # 기본 큐브 생성
    bpy.ops.mesh.primitive_cube_add(size=2)
    cube = bpy.context.active_object
    cube.name = "DefaultBody"
    
    # Armature 추가
    bpy.ops.object.armature_add()
    armature = bpy.context.active_object
    armature.name = "Armature"
    
    # Armature를 메시의 부모로 설정
    cube.parent = armature
    cube.parent_type = 'ARMATURE'
    
    print("[ARMATURE] 기본 모델 생성 완료")

def import_bvh(bvh_path, target_armature):
    """BVH 파일 임포트 및 적용"""
    print(f"[BVH] BVH 임포트 시작: {bvh_path}")
    
    if not os.path.exists(str(bvh_path)):
        raise FileNotFoundError(f"BVH 파일을 찾을 수 없습니다: {bvh_path}")
    
    # BVH 임포트
    bpy.ops.import_anim.bvh(filepath=str(bvh_path))
    
    # 새로 추가된 액션 찾기
    actions = bpy.data.actions
    if not actions:
        raise ValueError("BVH에서 액션을 찾을 수 없습니다")
    
    # 가장 최근에 추가된 액션 선택
    action = actions[-1]
    print(f"[BVH] 액션 발견: {action.name}")
    
    # Armature에 액션 할당
    if target_armature.animation_data is None:
        target_armature.animation_data_create()
    
    target_armature.animation_data.action = action
    print(f"[BVH] 액션 할당 완료: {target_armature.name}")

def export_glb(output_path, start_frame=1, end_frame=300):
    """GLB 파일로 내보내기 (애니메이션 포함)"""
    print(f"[GLB] GLB 내보내기 시작: {output_path}")
    print(f"[GLB] 프레임 범위: {start_frame} - {end_frame}")
    
    # 프레임 범위 설정
    bpy.context.scene.frame_start = start_frame
    bpy.context.scene.frame_end = end_frame
    
    # GLB 내보내기 (Blender 4.5 호환)
    bpy.ops.export_scene.gltf(
        filepath=str(output_path),
        export_format='GLB',
        export_animations=True,
        export_frame_range=True,
        export_frame_step=1,
        export_force_sampling=True,
        export_nla_strips=True,
        export_def_bones=True,
        export_anim_single_armature=True,
        export_reset_pose_bones=True,
        export_current_frame=False,
        export_skins=True,
        export_all_influences=False,
        export_morph=True,
        export_morph_normal=True,
        export_morph_tangent=False,
        export_lights=False,
        export_cameras=False,
        export_extras=False,
        export_yup=True,
        export_apply=True
    )
    
    print(f"[GLB] GLB 내보내기 완료: {output_path}")
    
    # 파일 크기 확인
    file_size = Path(output_path).stat().st_size
    print(f"[GLB] 파일 크기: {file_size / 1024 / 1024:.2f} MB")

def main():
    # Blender에서 -- 이후의 인수만 파싱
    import sys
    if '--' in sys.argv:
        argv = sys.argv[sys.argv.index('--') + 1:]
    else:
        argv = []
    
    parser = argparse.ArgumentParser(description='Blender BVH 적용 스크립트')
    parser.add_argument('--fbx', required=True, help='입력 FBX 파일 경로')
    parser.add_argument('--bvh', required=True, help='입력 BVH 파일 경로')
    parser.add_argument('--out_glb', required=True, help='출력 GLB 파일 경로')
    parser.add_argument('--start', type=int, default=1, help='시작 프레임')
    parser.add_argument('--end', type=int, default=300, help='종료 프레임')
    
    args = parser.parse_args(argv)
    
    print("[ARMATURE] Blender BVH 적용 스크립트 시작")
    print(f"[ARMATURE] FBX: {args.fbx}")
    print(f"[ARMATURE] BVH: {args.bvh}")
    print(f"[ARMATURE] GLB: {args.out_glb}")
    
    try:
        # 경로 정규화
        fbx_path = Path(normalize_unicode_path(Path(args.fbx).resolve()))
        bvh_path = Path(normalize_unicode_path(Path(args.bvh).resolve()))
        output_path = Path(normalize_unicode_path(Path(args.out_glb).resolve()))
        output_dir = output_path.parent
        
        # 출력 디렉토리 생성
        output_dir.mkdir(parents=True, exist_ok=True)
        
        # 1. 씬 초기화
        clear_scene()
        
        # 2. FBX 임포트
        new_objects = import_model(fbx_path)
        
        # 3. 타겟 Armature 찾기
        target_armature = find_target_armature()
        
        # 4. BVH 임포트 및 적용
        import_bvh(bvh_path, target_armature)
        
        # 5. GLB 내보내기
        export_glb(output_path, args.start, args.end)
        
        print("[ARMATURE] 모든 작업 완료!")
        
    except Exception as e:
        print(f"[ARMATURE] 오류 발생: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()