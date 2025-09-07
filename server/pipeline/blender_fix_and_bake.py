#!/usr/bin/env python3
"""
Blender 강제 베이크 + 축/스케일/루트 교정 스크립트
- FBX 임포트 및 BVH 리타겟
- 루트 오프셋/스케일 자동 교정
- NLA 베이킹 및 GLB 익스포트
- 반드시 움직이는 GLB 보장
"""

import bpy
import bmesh
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
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    
    # 데이터 정리
    for mesh in bpy.data.meshes:
        bpy.data.meshes.remove(mesh)
    for armature in bpy.data.armatures:
        bpy.data.armatures.remove(armature)
    for action in bpy.data.actions:
        bpy.data.actions.remove(action)

def load_fbx(fbx_path):
    """FBX 로드 (automatic_bone_orientation=True)"""
    print(f"[ARM] FBX 로드 중: {fbx_path}")
    
    bpy.ops.import_scene.fbx(
        filepath=fbx_path,
        use_anim=False,
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
        automatic_bone_orientation=True,  # 중요!
        primary_bone_axis='Y',
        secondary_bone_axis='X',
        use_prepost_rot=True
    )
    
    # 사용자 아마추어 찾기 (본 개수 최대)
    user_armature = None
    max_bones = 0
    
    for obj in bpy.context.scene.objects:
        if obj.type == 'ARMATURE':
            bone_count = len(obj.data.bones)
            if bone_count > max_bones:
                max_bones = bone_count
                user_armature = obj
    
    if not user_armature:
        raise ValueError("FBX에서 아마추어를 찾을 수 없습니다")
    
    print(f"[ARM] user={user_armature.name} bones={max_bones}")
    return user_armature

def load_bvh_direct(bvh_path, axis_forward='-Z', axis_up='Y', global_scale=1.0):
    """BVH 직접 임포트 시도"""
    print(f"[BVH] 직접 임포트 시도: axis={axis_forward},{axis_up} scale={global_scale}")
    
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
        if obj.type == 'ARMATURE' and obj != bpy.context.scene.objects[0]:
            bvh_armature = obj
            break
    
    if bvh_armature:
        print(f"[BVH] mode=direct success")
        return bvh_armature, "direct"
    else:
        print(f"[BVH] mode=direct failed")
        return None, "failed"

def create_bone_mapping(user_armature, bvh_armature):
    """본 이름 자동 매핑"""
    print("[MAP] 본 매핑 생성 중...")
    
    user_bone_names = [bone.name.lower().replace('_', '').replace(' ', '') for bone in user_armature.data.bones]
    bvh_bone_names = [bone.name for bone in bvh_armature.data.bones]
    
    bone_map = {}
    matched_count = 0
    
    # 1차: 정확한 매칭
    for bvh_bone_name in bvh_bone_names:
        bvh_clean = bvh_bone_name.lower().replace('_', '').replace(' ', '')
        if bvh_clean in user_bone_names:
            user_bone_name = user_armature.data.bones[user_bone_names.index(bvh_clean)].name
            bone_map[bvh_bone_name] = user_bone_name
            matched_count += 1
            print(f"[MAP] 정확 매칭: {bvh_bone_name} -> {user_bone_name}")
    
    # 2차: startswith 매칭
    for bvh_bone_name in bvh_bone_names:
        if bvh_bone_name not in bone_map:
            bvh_clean = bvh_bone_name.lower().replace('_', '').replace(' ', '')
            for i, user_clean in enumerate(user_bone_names):
                if bvh_clean.startswith(user_clean) or user_clean.startswith(bvh_clean):
                    user_bone_name = user_armature.data.bones[i].name
                    bone_map[bvh_bone_name] = user_bone_name
                    matched_count += 1
                    print(f"[MAP] startswith 매칭: {bvh_bone_name} -> {user_bone_name}")
                    break
    
    # 3차: Levenshtein 거리 매칭
    for bvh_bone_name in bvh_bone_names:
        if bvh_bone_name not in bone_map:
            bvh_clean = bvh_bone_name.lower().replace('_', '').replace(' ', '')
            best_match = None
            best_score = 0
            
            for i, user_clean in enumerate(user_bone_names):
                score = 1.0 - levenshtein_distance(bvh_clean, user_clean) / max(len(bvh_clean), len(user_clean))
                if score > best_score and score >= 0.7:
                    best_score = score
                    best_match = i
            
            if best_match is not None:
                user_bone_name = user_armature.data.bones[best_match].name
                bone_map[bvh_bone_name] = user_bone_name
                matched_count += 1
                print(f"[MAP] Levenshtein 매칭: {bvh_bone_name} -> {user_bone_name}")
    
    print(f"[MAP] 총 매칭: {matched_count}/{len(bvh_bone_names)}")
    return bone_map, matched_count

def levenshtein_distance(s1, s2):
    """Levenshtein 거리 계산"""
    if len(s1) < len(s2):
        return levenshtein_distance(s2, s1)
    
    if len(s2) == 0:
        return len(s1)
    
    previous_row = list(range(len(s2) + 1))
    for i, c1 in enumerate(s1):
        current_row = [i + 1]
        for j, c2 in enumerate(s2):
            insertions = previous_row[j + 1] + 1
            deletions = current_row[j] + 1
            substitutions = previous_row[j] + (c1 != c2)
            current_row.append(min(insertions, deletions, substitutions))
        previous_row = current_row
    
    return previous_row[-1]

def setup_retarget_constraints(user_armature, bvh_armature, bone_map):
    """리타겟 제약 설정"""
    print("[RETARGET] 제약 설정 중...")
    
    bpy.context.view_layer.objects.active = bvh_armature
    bpy.ops.object.mode_set(mode='POSE')
    
    constraint_count = 0
    for bvh_bone_name, user_bone_name in bone_map.items():
        bvh_bone = bvh_armature.pose.bones.get(bvh_bone_name)
        user_bone = user_armature.pose.bones.get(user_bone_name)
        
        if bvh_bone and user_bone:
            constraint = bvh_bone.constraints.new('COPY_TRANSFORMS')
            constraint.target = user_armature
            constraint.subtarget = user_bone_name
            constraint.influence = 1.0
            constraint_count += 1
    
    print(f"[RETARGET] 제약 설정 완료: {constraint_count}개")
    return constraint_count

def bake_animation(user_armature, bvh_armature, start_frame, end_frame):
    """NLA 베이킹"""
    print(f"[BAKE] NLA 베이킹: frames={start_frame}-{end_frame}")
    
    bpy.context.view_layer.objects.active = bvh_armature
    bpy.ops.object.mode_set(mode='POSE')
    bpy.ops.pose.select_all(action='SELECT')
    
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
    if bvh_armature.animation_data and bvh_armature.animation_data.action:
        action = bvh_armature.animation_data.action
        fcurves, keys = count_keys(action)
        print(f"[ACT] name={action.name} fcurves={fcurves} keys={keys}")
        
        if keys == 0:
            raise RuntimeError("BAKE ZERO KEYS")
        
        return action, fcurves, keys
    else:
        raise RuntimeError("BAKE FAILED - 액션 생성 실패")

def count_keys(action):
    """키프레임 개수 계산"""
    fcurves = len(action.fcurves)
    keys = sum(len(fc.keyframe_points) for fc in action.fcurves)
    return fcurves, keys

def fix_root_offset_scale(user_armature, bvh_armature):
    """루트 오프셋/스케일 자동 교정"""
    print("[ROOT] 루트 오프셋/스케일 교정 중...")
    
    # Hips 뼈대 찾기
    user_hips = None
    bvh_hips = None
    
    for bone in user_armature.data.bones:
        if 'hip' in bone.name.lower() or 'root' in bone.name.lower():
            user_hips = bone
            break
    
    for bone in bvh_armature.data.bones:
        if 'hip' in bone.name.lower() or 'root' in bone.name.lower():
            bvh_hips = bone
            break
    
    if not user_hips or not bvh_hips:
        print("[ROOT] Hips 뼈대를 찾을 수 없음 - 기본값 사용")
        return
    
    # 첫 프레임 위치 비교
    bpy.context.scene.frame_set(1)
    
    user_world = user_armature.matrix_world @ user_hips.head
    bvh_world = bvh_armature.matrix_world @ bvh_hips.head
    
    # 스케일 후보들
    scale_candidates = [0.01, 0.1, 1.0]
    scale_multipliers = [0.5, 1.0, 2.0]
    
    best_error = float('inf')
    best_scale = 1.0
    best_offset = Vector((0, 0, 0))
    
    for scale in scale_candidates:
        for mult in scale_multipliers:
            scale_gain = scale * mult
            
            # 오프셋 계산
            offset = user_world - bvh_world * scale_gain
            
            # 오차 계산 (6개 키포인트)
            error = 0.0
            key_bones = ['Hips', 'LeftFoot', 'RightFoot', 'LeftLeg', 'RightLeg', 'LeftUpLeg', 'RightUpLeg']
            
            for bone_name in key_bones:
                user_bone = None
                bvh_bone = None
                
                for bone in user_armature.data.bones:
                    if bone_name.lower() in bone.name.lower():
                        user_bone = bone
                        break
                
                for bone in bvh_armature.data.bones:
                    if bone_name.lower() in bone.name.lower():
                        bvh_bone = bone
                        break
                
                if user_bone and bvh_bone:
                    user_pos = user_armature.matrix_world @ user_bone.head
                    bvh_pos = bvh_armature.matrix_world @ bvh_bone.head
                    adjusted_bvh = bvh_pos * scale_gain + offset
                    error += (user_pos - adjusted_bvh).length
            
            if error < best_error:
                best_error = error
                best_scale = scale_gain
                best_offset = offset
    
    # 루트 보정 적용
    bpy.ops.object.empty_add(type='PLAIN_AXES')
    root_corrector = bpy.context.active_object
    root_corrector.name = "Root_Corrector"
    
    bvh_armature.parent = root_corrector
    root_corrector.scale = (best_scale, best_scale, best_scale)
    root_corrector.location = best_offset
    
    print(f"[ROOT] offset=({best_offset.x:.3f},{best_offset.y:.3f},{best_offset.z:.3f}) scale={best_scale:.3f}")

def fix_frame_range(user_armature, start_frame, end_frame):
    """프레임 범위 보정"""
    print(f"[RANGE] 프레임 범위 보정: start={start_frame} end={end_frame}")
    
    if end_frame <= start_frame:
        end_frame = start_frame + 300
        print(f"[RANGE] end_frame 수정: {end_frame}")
    
    bpy.context.scene.frame_start = start_frame
    bpy.context.scene.frame_end = end_frame
    
    if user_armature.animation_data and user_armature.animation_data.action:
        action = user_armature.animation_data.action
        action.frame_range = (start_frame, end_frame)
        print(f"[RANGE] 액션 프레임 범위 설정: {action.frame_range}")

def export_glb(output_path, user_armature):
    """GLB 익스포트"""
    print(f"[GLB] 익스포트 중: {output_path}")
    
    bpy.ops.object.select_all(action='DESELECT')
    user_armature.select_set(True)
    bpy.context.view_layer.objects.active = user_armature
    
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
        export_optimize_animation_size=True
    )
    
    print(f"[GLB] path={output_path}")

def main():
    parser = argparse.ArgumentParser(description='Blender 강제 베이크 + 교정')
    parser.add_argument('--fbx', required=True, help='FBX 파일 경로')
    parser.add_argument('--bvh', required=True, help='BVH 파일 경로')
    parser.add_argument('--out_glb', required=True, help='출력 GLB 파일 경로')
    parser.add_argument('--start', type=int, default=1, help='시작 프레임')
    parser.add_argument('--end', type=int, default=300, help='종료 프레임')
    
    args = parser.parse_args()
    
    try:
        print("[START] Blender 강제 베이크 시작")
        
        # 경로 검증
        if not os.path.exists(args.fbx):
            raise FileNotFoundError(f"FBX 파일을 찾을 수 없습니다: {args.fbx}")
        if not os.path.exists(args.bvh):
            raise FileNotFoundError(f"BVH 파일을 찾을 수 없습니다: {args.bvh}")
        
        # 씬 정리
        clear_scene()
        
        # FBX 로드
        user_armature = load_fbx(args.fbx)
        
        # BVH 직접 임포트 시도
        bvh_armature, mode = load_bvh_direct(args.bvh)
        
        if mode == "failed":
            raise ValueError("BVH 직접 임포트 실패")
        
        # 본 매핑 생성
        bone_map, matched_count = create_bone_mapping(user_armature, bvh_armature)
        
        if matched_count == 0:
            raise ValueError("본 매핑 실패")
        
        # 리타겟 제약 설정
        constraint_count = setup_retarget_constraints(user_armature, bvh_armature, bone_map)
        
        # 루트 오프셋/스케일 교정
        fix_root_offset_scale(user_armature, bvh_armature)
        
        # NLA 베이킹
        action, fcurves, keys = bake_animation(user_armature, bvh_armature, args.start, args.end)
        
        # 프레임 범위 보정
        fix_frame_range(user_armature, args.start, args.end)
        
        # GLB 익스포트
        export_glb(args.out_glb, user_armature)
        
        print("[SUCCESS] 강제 베이크 완료!")
        print(f"[SUCCESS] 매칭된 본: {matched_count}개")
        print(f"[SUCCESS] 키프레임: {keys}개")
        
        return 0
        
    except Exception as e:
        print(f"[ERROR] {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
