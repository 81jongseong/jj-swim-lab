#!/usr/bin/env python3
"""
강제 애니메이션 베이킹 및 GLB 익스포트 스크립트
- 씬 정리 및 FBX 로드
- 아마추어 선택 및 BVH 임포트
- 리타겟 및 NLA 베이킹
- 액션 검증 및 프레임 범위 수정
- GLB 익스포트 (애니메이션 포함)
"""

import bpy
import json
import os
import sys
import argparse
import mathutils
import math
from pathlib import Path
from mathutils import Vector, Matrix, Euler

def clear_scene():
    """씬 완전 정리"""
    print("[CLEAR] 씬 정리 중...")
    
    # 모든 오브젝트 선택 및 삭제
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    
    # 컬렉션 정리
    for collection in bpy.data.collections:
        if collection.name != "Collection":
            bpy.data.collections.remove(collection)
    
    # 데이터 정리
    for mesh in bpy.data.meshes:
        bpy.data.meshes.remove(mesh)
    for armature in bpy.data.armatures:
        bpy.data.armatures.remove(armature)
    for action in bpy.data.actions:
        bpy.data.actions.remove(action)
    
    print("[CLEAR] 씬 정리 완료")

def setup_scene_units():
    """씬 단위 설정"""
    print("[SETUP] 씬 단위 설정 중...")
    
    # 미터 단위 설정
    bpy.context.scene.unit_settings.system = 'METRIC'
    bpy.context.scene.unit_settings.length_unit = 'METERS'
    bpy.context.scene.unit_settings.scale_length = 1.0
    
    # 월드 축 설정 (Y-forward, Z-up)
    bpy.context.scene.world.axis_forward = 'Y'
    bpy.context.scene.world.axis_up = 'Z'
    
    print("[SETUP] 씬 단위 설정 완료")

def load_fbx_model(fbx_path):
    """FBX 모델 로드"""
    print(f"[LOAD] FBX 로드 중: {fbx_path}")
    
    if not os.path.exists(fbx_path):
        raise FileNotFoundError(f"FBX 파일을 찾을 수 없습니다: {fbx_path}")
    
    # FBX 임포트
    bpy.ops.import_scene.fbx(
        filepath=fbx_path,
        use_anim=False,  # 애니메이션 비활성화
        use_custom_normals=True,
        use_image_search=True,
        use_alpha_decals=False,
        decal_offset=0.0,
        use_anim_action_all=True,
        use_default_take=True,
        use_armature_deform_only=False,
        use_anim_optimize=True,
        anim_optimize_precision=6,
        use_custom_props=True,
        use_custom_props_enum_as_string=True,
        ignore_leaf_bones=False,
        force_connect_children=False,
        automatic_bone_orientation=True,
        primary_bone_axis='Y',
        secondary_bone_axis='X',
        use_prepost_rot=True
    )
    
    # 아마추어 찾기
    user_armature = None
    for obj in bpy.context.scene.objects:
        if obj.type == 'ARMATURE':
            user_armature = obj
            break
    
    if not user_armature:
        raise ValueError("FBX에서 아마추어를 찾을 수 없습니다")
    
    print(f"[LOAD] FBX 로드 완료: 아마추어={user_armature.name}")
    return user_armature

def select_user_armature(user_armature):
    """사용자 아마추어 선택"""
    print(f"[SELECT] 아마추어 선택: {user_armature.name}")
    
    # 모든 오브젝트 선택 해제
    bpy.ops.object.select_all(action='DESELECT')
    
    # 아마추어 선택 및 활성화
    user_armature.select_set(True)
    bpy.context.view_layer.objects.active = user_armature
    
    print(f"[SELECT] 아마추어 선택 완료")

def import_bvh_animation(bvh_path, axis_forward='-Z', axis_up='Y', global_scale=1.0):
    """BVH 애니메이션 임포트"""
    print(f"[BVH] BVH 임포트 중: {bvh_path}")
    print(f"[BVH] 축 설정: forward={axis_forward}, up={axis_up}, scale={global_scale}")
    
    if not os.path.exists(bvh_path):
        raise FileNotFoundError(f"BVH 파일을 찾을 수 없습니다: {bvh_path}")
    
    # BVH 임포트
    bpy.ops.import_anim.bvh(
        filepath=bvh_path,
        axis_forward=axis_forward,
        axis_up=axis_up,
        global_scale=global_scale,
        frame_start=1,
        use_fps_scale=False,
        update_scene_fps=True,
        update_scene_duration=True
    )
    
    # BVH 아마추어 찾기
    bvh_armature = None
    for obj in bpy.context.scene.objects:
        if obj.type == 'ARMATURE' and obj != bpy.context.view_layer.objects.active:
            bvh_armature = obj
            break
    
    if not bvh_armature:
        raise ValueError("BVH에서 아마추어를 찾을 수 없습니다")
    
    print(f"[BVH] BVH 임포트 완료: 아마추어={bvh_armature.name}")
    return bvh_armature

def create_bone_mapping(user_armature, bvh_armature):
    """본 매핑 생성"""
    print("[MAPPING] 본 매핑 생성 중...")
    
    # 기본 매핑 로드
    base_mapping = {}
    overrides = {}
    
    # 기본 매핑 로드
    base_path = Path(__file__).parent / "name_maps" / "mixamo_base.json"
    if base_path.exists():
        with open(base_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            base_mapping = data.get('mappings', {})
    
    # 오버라이드 로드
    override_path = Path(__file__).parent / "name_maps" / "overrides.json"
    if override_path.exists():
        with open(override_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            overrides = data.get('mappings', {})
    
    # 최종 매핑 (오버라이드 우선)
    final_mapping = {**base_mapping, **overrides}
    
    # 사용자 뼈대 이름 목록
    user_bone_names = [bone.name for bone in user_armature.data.bones]
    bvh_bone_names = [bone.name for bone in bvh_armature.data.bones]
    
    bone_map = {}
    matched_count = 0
    unmapped = []
    
    # 1차: 정확한 매핑
    for bvh_bone_name in bvh_bone_names:
        if bvh_bone_name in final_mapping:
            target_name = final_mapping[bvh_bone_name]
            if target_name in user_bone_names:
                bone_map[bvh_bone_name] = target_name
                matched_count += 1
                print(f"[MAPPING] 정확 매칭: {bvh_bone_name} -> {target_name}")
    
    # 2차: 퍼지 매칭
    for bvh_bone_name in bvh_bone_names:
        if bvh_bone_name not in bone_map:
            # 간단한 퍼지 매칭
            best_match = None
            best_score = 0
            
            for user_bone_name in user_bone_names:
                # 이름 유사도 계산
                bvh_clean = bvh_bone_name.lower().replace('_', '').replace(' ', '')
                user_clean = user_bone_name.lower().replace('_', '').replace(' ', '')
                
                if bvh_clean in user_clean or user_clean in bvh_clean:
                    score = 0.9
                elif any(part in user_clean for part in bvh_clean.split('_')):
                    score = 0.7
                else:
                    score = 0.0
                
                if score > best_score:
                    best_score = score
                    best_match = user_bone_name
            
            if best_match and best_score >= 0.7:
                bone_map[bvh_bone_name] = best_match
                matched_count += 1
                print(f"[MAPPING] 퍼지 매칭: {bvh_bone_name} -> {best_match}")
            else:
                unmapped.append(bvh_bone_name)
    
    match_ratio = matched_count / len(bvh_bone_names) * 100
    print(f"[MAPPING] 매칭 완료: {matched_count}/{len(bvh_bone_names)} ({match_ratio:.1f}%)")
    
    if match_ratio < 70:
        print(f"[MAPPING] 경고: 매칭률이 낮습니다. unmapped={unmapped}")
    
    return bone_map, matched_count, unmapped

def setup_retarget_constraints(user_armature, bvh_armature, bone_map):
    """리타겟 제약 설정"""
    print("[RETARGET] 리타겟 제약 설정 중...")
    
    # BVH 아마추어 활성화
    bpy.context.view_layer.objects.active = bvh_armature
    bpy.ops.object.mode_set(mode='POSE')
    
    constraint_count = 0
    
    for bvh_bone_name, user_bone_name in bone_map.items():
        # BVH 뼈대 찾기
        bvh_bone = bvh_armature.pose.bones.get(bvh_bone_name)
        if not bvh_bone:
            continue
        
        # 사용자 뼈대 찾기
        user_bone = user_armature.pose.bones.get(user_bone_name)
        if not user_bone:
            continue
        
        # Copy Transforms 제약 추가
        constraint = bvh_bone.constraints.new('COPY_TRANSFORMS')
        constraint.target = user_armature
        constraint.subtarget = user_bone_name
        
        # 강도 설정 (발/손 끝은 낮게)
        if any(x in bvh_bone_name.lower() for x in ['foot', 'hand', 'toe', 'finger']):
            constraint.influence = 0.6
        else:
            constraint.influence = 1.0
        
        constraint_count += 1
    
    print(f"[RETARGET] 제약 설정 완료: {constraint_count}개")
    return constraint_count

def bake_animation_to_user_armature(user_armature, bvh_armature, start_frame, end_frame):
    """사용자 아마추어에 애니메이션 베이킹"""
    print(f"[BAKE] 애니메이션 베이킹 중: frames={start_frame}-{end_frame}")
    
    # 사용자 아마추어 활성화
    bpy.context.view_layer.objects.active = user_armature
    bpy.ops.object.mode_set(mode='POSE')
    
    # 모든 뼈대 선택
    bpy.ops.pose.select_all(action='SELECT')
    
    # NLA Bake 실행
    bpy.ops.nla.bake(
        frame_start=start_frame,
        frame_end=end_frame,
        step=1,
        only_selected=False,
        visual_keying=True,
        clear_constraints=True,
        clear_parents=False,
        use_current_action=False,
        bake_types={'POSE'}
    )
    
    # 액션 확인
    if user_armature.animation_data and user_armature.animation_data.action:
        action = user_armature.animation_data.action
        fcurves = len(action.fcurves)
        frame_range = action.frame_range
        
        print(f"[BAKE] 베이킹 완료: fcurves={fcurves}, frame_range={frame_range}")
        
        if fcurves == 0:
            raise ValueError("BAKE ZERO KEYS - 애니메이션이 베이킹되지 않았습니다")
        
        return action, fcurves, frame_range
    else:
        raise ValueError("BAKE FAILED - 액션이 생성되지 않았습니다")

def validate_and_fix_animation(user_armature, start_frame, end_frame):
    """애니메이션 검증 및 수정"""
    print("[VALIDATE] 애니메이션 검증 중...")
    
    if not user_armature.animation_data or not user_armature.animation_data.action:
        raise ValueError("애니메이션 데이터가 없습니다")
    
    action = user_armature.animation_data.action
    fcurves = action.fcurves
    
    # 키프레임 개수 확인
    total_keys = sum(len(fcurve.keyframe_points) for fcurve in fcurves)
    print(f"[VALIDATE] 총 키프레임: {total_keys}")
    
    if total_keys == 0:
        raise ValueError("VALIDATION FAILED - 키프레임이 없습니다")
    
    # 프레임 범위 수정
    if action.frame_range[0] != start_frame or action.frame_range[1] != end_frame:
        print(f"[VALIDATE] 프레임 범위 수정: {action.frame_range} -> ({start_frame}, {end_frame})")
        action.frame_range = (start_frame, end_frame)
    
    # 씬 프레임 범위 설정
    bpy.context.scene.frame_start = start_frame
    bpy.context.scene.frame_end = end_frame
    
    print(f"[VALIDATE] 검증 완료: keys={total_keys}, range=({start_frame}, {end_frame})")
    return total_keys

def export_glb_with_animation(output_path, user_armature):
    """애니메이션 포함 GLB 익스포트"""
    print(f"[EXPORT] GLB 익스포트 중: {output_path}")
    
    # 사용자 아마추어 선택
    bpy.ops.object.select_all(action='DESELECT')
    user_armature.select_set(True)
    bpy.context.view_layer.objects.active = user_armature
    
    # GLB 익스포트
    bpy.ops.export_scene.gltf(
        filepath=output_path,
        export_format='GLB',
        export_animations=True,
        export_frame_range=True,
        export_frame_step=1,
        export_force_sampling=True,
        export_nla_strips=True,
        export_def_bones=True,
        export_current_frame=False,
        export_skins=True,
        export_all_influences=False,
        export_morph=False,
        export_morph_normal=False,
        export_morph_tangent=False,
        export_lights=False,
        export_cameras=False,
        export_extras=False,
        export_yup=True,
        export_apply=False,
        export_anim_single_armature=True,
        export_anim_single_armature_object_name=user_armature.name,
        export_reset_pose_bones=True,
        export_optimize_animation_size=True,
        export_anim_optimize_keep_export_armature=True,
        export_anim_optimize_keep_export_pose_bones=True,
        export_anim_optimize_keep_export_animations=True
    )
    
    print(f"[EXPORT] GLB 익스포트 완료: {output_path}")

def save_debug_report(output_dir, bone_map, matched_count, total_keys, frame_range):
    """디버그 리포트 저장"""
    debug_dir = Path(output_dir)
    debug_dir.mkdir(parents=True, exist_ok=True)
    
    # 리포트 생성
    report = {
        "bone_mapping": bone_map,
        "matched_bones": matched_count,
        "total_keyframes": total_keys,
        "frame_range": frame_range,
        "export_success": True,
        "timestamp": str(Path().cwd())
    }
    
    # 리포트 저장
    with open(debug_dir / "bake_report.json", 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    
    print(f"[DEBUG] 리포트 저장됨: {debug_dir / 'bake_report.json'}")

def main():
    """메인 함수"""
    parser = argparse.ArgumentParser(description='강제 애니메이션 베이킹 및 GLB 익스포트')
    parser.add_argument('--fbx', required=True, help='FBX 파일 경로')
    parser.add_argument('--bvh', required=True, help='BVH 파일 경로')
    parser.add_argument('--out_glb', required=True, help='출력 GLB 파일 경로')
    parser.add_argument('--out_dir', required=True, help='디버그 출력 디렉토리')
    parser.add_argument('--start', type=int, default=1, help='시작 프레임')
    parser.add_argument('--end', type=int, default=300, help='종료 프레임')
    parser.add_argument('--axis_forward', default='-Z', help='BVH 축 설정 (forward)')
    parser.add_argument('--axis_up', default='Y', help='BVH 축 설정 (up)')
    parser.add_argument('--global_scale', type=float, default=1.0, help='BVH 글로벌 스케일')
    
    args = parser.parse_args()
    
    try:
        print("[START] 강제 애니메이션 베이킹 시작")
        
        # 경로 검증
        if not os.path.exists(args.fbx):
            raise FileNotFoundError(f"FBX 파일을 찾을 수 없습니다: {args.fbx}")
        if not os.path.exists(args.bvh):
            raise FileNotFoundError(f"BVH 파일을 찾을 수 없습니다: {args.bvh}")
        
        # 씬 초기화 및 설정
        clear_scene()
        setup_scene_units()
        
        # FBX 모델 로드
        user_armature = load_fbx_model(args.fbx)
        
        # 사용자 아마추어 선택
        select_user_armature(user_armature)
        
        # BVH 애니메이션 임포트
        bvh_armature = import_bvh_animation(
            args.bvh, 
            args.axis_forward, 
            args.axis_up, 
            args.global_scale
        )
        
        # 본 매핑 생성
        bone_map, matched_count, unmapped = create_bone_mapping(user_armature, bvh_armature)
        
        if matched_count == 0:
            raise ValueError("본 매핑이 전혀 되지 않았습니다")
        
        # 리타겟 제약 설정
        constraint_count = setup_retarget_constraints(user_armature, bvh_armature, bone_map)
        
        # 애니메이션 베이킹
        action, fcurves, frame_range = bake_animation_to_user_armature(
            user_armature, bvh_armature, args.start, args.end
        )
        
        # 애니메이션 검증 및 수정
        total_keys = validate_and_fix_animation(user_armature, args.start, args.end)
        
        # GLB 익스포트
        export_glb_with_animation(args.out_glb, user_armature)
        
        # 디버그 리포트 저장
        save_debug_report(args.out_dir, bone_map, matched_count, total_keys, frame_range)
        
        print("[SUCCESS] 강제 애니메이션 베이킹 완료!")
        print(f"[SUCCESS] GLB 파일: {args.out_glb}")
        print(f"[SUCCESS] 매칭된 본: {matched_count}개")
        print(f"[SUCCESS] 총 키프레임: {total_keys}개")
        
        return 0
        
    except Exception as e:
        print(f"[ERROR] {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())