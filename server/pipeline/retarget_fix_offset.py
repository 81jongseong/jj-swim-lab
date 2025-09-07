#!/usr/bin/env python3
"""
BVH 리타겟 오프셋 자동 수정 스크립트
- 씬 단위/스케일 정규화
- BVH 루트 오프셋/스케일 자동 추정
- 레스트포즈 정규화 + 본 롤 정렬
- 자동 본 매핑 + 리타겟
- NLA Bake + GLB 익스포트
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
from bpy_extras.io_utils import ImportHelper

def clear_scene():
    """씬 초기화"""
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    
    # 컬렉션 정리
    for collection in bpy.data.collections:
        if collection.name != "Collection":
            bpy.data.collections.remove(collection)

def setup_scene_units():
    """씬 단위 설정 (미터)"""
    bpy.context.scene.unit_settings.system = 'METRIC'
    bpy.context.scene.unit_settings.length_unit = 'METERS'
    bpy.context.scene.unit_settings.scale_length = 1.0
    
    # 월드 축 설정
    bpy.context.scene.world.axis_forward = 'Y'
    bpy.context.scene.world.axis_up = 'Z'

def load_fbx(fbx_path):
    """FBX 로드"""
    print(f"[ARM] user=FBX bvh=None")
    
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
        automatic_bone_orientation=True,
        primary_bone_axis='Y',
        secondary_bone_axis='X',
        use_prepost_rot=True
    )
    
    # FBX에서 Armature 찾기
    user_armature = None
    for obj in bpy.context.scene.objects:
        if obj.type == 'ARMATURE':
            user_armature = obj
            break
    
    if not user_armature:
        raise ValueError("FBX에서 Armature를 찾을 수 없습니다")
    
    print(f"[ARM] user={user_armature.name} bvh=None")
    return user_armature

def load_bvh(bvh_path, axis_forward='-Z', axis_up='Y', global_scale=1.0):
    """BVH 로드 (축 설정 시도)"""
    print(f"[AXIS] choice={axis_forward},{axis_up},scale={global_scale}")
    
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
    
    # BVH에서 Armature 찾기
    bvh_armature = None
    for obj in bpy.context.scene.objects:
        if obj.type == 'ARMATURE' and obj != bpy.context.scene.objects[0]:
            bvh_armature = obj
            break
    
    if not bvh_armature:
        raise ValueError("BVH에서 Armature를 찾을 수 없습니다")
    
    print(f"[ARM] user=FBX bvh={bvh_armature.name}")
    return bvh_armature

def find_hips_bone(armature):
    """Hips 뼈대 찾기"""
    hips_candidates = ['Hips', 'Hip', 'Pelvis', 'Root', 'rootx']
    
    for bone in armature.data.bones:
        if bone.name in hips_candidates:
            return bone.name
    
    # 첫 번째 뼈대를 루트로 사용
    if armature.data.bones:
        return armature.data.bones[0].name
    
    return None

def calculate_position_error(user_armature, bvh_armature, scale_gain=1.0, offset=Vector((0,0,0))):
    """위치 오차 계산 (6개 키포인트)"""
    key_bones = ['Hips', 'LeftFoot', 'RightFoot', 'LeftLeg', 'RightLeg', 'LeftUpLeg', 'RightUpLeg']
    
    total_error = 0.0
    matched_pairs = 0
    
    for bone_name in key_bones:
        # 사용자 모델에서 뼈대 찾기
        user_bone = None
        for bone in user_armature.data.bones:
            if bone.name.lower() == bone_name.lower() or bone_name.lower() in bone.name.lower():
                user_bone = bone
                break
        
        # BVH에서 뼈대 찾기
        bvh_bone = None
        for bone in bvh_armature.data.bones:
            if bone.name.lower() == bone_name.lower() or bone_name.lower() in bone.name.lower():
                bvh_bone = bone
                break
        
        if user_bone and bvh_bone:
            # 월드 위치 계산
            user_world = user_armature.matrix_world @ user_bone.head
            bvh_world = bvh_armature.matrix_world @ bvh_bone.head
            
            # 스케일 및 오프셋 적용
            adjusted_bvh = bvh_world * scale_gain + offset
            
            # 오차 계산
            error = (user_world - adjusted_bvh).length
            total_error += error
            matched_pairs += 1
    
    return total_error, matched_pairs

def find_optimal_offset_scale(user_armature, bvh_armature):
    """최적 오프셋/스케일 찾기"""
    print("[ROOT] 최적 오프셋/스케일 탐색 중...")
    
    # 축 설정 시도
    axis_configs = [
        ('-Z', 'Y', 1.0),
        ('Z', 'Y', 1.0),
        ('-Z', 'Y', 0.1),
        ('Z', 'Y', 0.1)
    ]
    
    best_error = float('inf')
    best_config = None
    best_scale = 1.0
    best_offset = Vector((0,0,0))
    
    for axis_forward, axis_up, global_scale in axis_configs:
        try:
            # BVH 다시 로드
            clear_scene()
            user_armature = load_fbx(args.fbx_path)
            bvh_armature = load_bvh(args.bvh_path, axis_forward, axis_up, global_scale)
            
            # 스케일 후보들
            scale_candidates = [0.01, 0.05, 0.1, 0.5, 1.0, 2.0, 10.0]
            
            for scale_gain in scale_candidates:
                # 오프셋 계산
                user_hips = find_hips_bone(user_armature)
                bvh_hips = find_hips_bone(bvh_armature)
                
                if user_hips and bvh_hips:
                    user_world = user_armature.matrix_world @ user_armature.data.bones[user_hips].head
                    bvh_world = bvh_armature.matrix_world @ bvh_armature.data.bones[bvh_hips].head
                    
                    offset = user_world - bvh_world * scale_gain
                    
                    # 오차 계산
                    error, matched = calculate_position_error(user_armature, bvh_armature, scale_gain, offset)
                    
                    if error < best_error and matched >= 3:
                        best_error = error
                        best_config = (axis_forward, axis_up, global_scale)
                        best_scale = scale_gain
                        best_offset = offset
                        
                        print(f"[ROOT] offset={offset.x:.3f},{offset.y:.3f},{offset.z:.3f} scale_gain={scale_gain:.3f} error={error:.3f}")
        
        except Exception as e:
            print(f"[ROOT] 축 설정 실패: {axis_forward},{axis_up},{global_scale} - {e}")
            continue
    
    if best_config is None:
        raise ValueError("최적 설정을 찾을 수 없습니다")
    
    print(f"[ROOT] 최적 설정: axis={best_config[0]},{best_config[1]} scale={best_scale:.3f} offset={best_offset}")
    return best_config, best_scale, best_offset

def apply_offset_scale(bvh_armature, scale_gain, offset):
    """BVH에 오프셋/스케일 적용"""
    # 루트 보정용 빈 오브젝트 생성
    bpy.ops.object.empty_add(type='PLAIN_AXES')
    root_corrector = bpy.context.active_object
    root_corrector.name = "BVH_Root_Corrector"
    
    # BVH를 루트 보정자에 부모화
    bvh_armature.parent = root_corrector
    
    # 스케일 및 위치 적용
    root_corrector.scale = (scale_gain, scale_gain, scale_gain)
    root_corrector.location = offset
    
    print(f"[ROOT] 적용됨: scale={scale_gain:.3f} offset={offset}")

def normalize_rest_pose(user_armature, bvh_armature):
    """레스트포즈 정규화"""
    print("[POSE] 레스트포즈 정규화 중...")
    
    # A-pose ↔ T-pose 보정
    pose_bones = ['LeftShoulder', 'RightShoulder', 'LeftArm', 'RightArm', 'LeftForeArm', 'RightForeArm']
    
    for bone_name in pose_bones:
        for armature in [user_armature, bvh_armature]:
            for bone in armature.data.bones:
                if bone_name.lower() in bone.name.lower():
                    # 팔 각도 확인 및 보정
                    if 'arm' in bone.name.lower():
                        # 20도 이상 차이나면 T-pose로 보정
                        current_angle = bone.matrix.to_euler('XYZ')
                        if abs(current_angle.z) > math.radians(20):
                            # T-pose로 보정
                            bone.matrix = bone.matrix @ Euler((0, 0, -current_angle.z), 'XYZ').to_matrix().to_4x4()
    
    # 본 롤 정규화
    for armature in [user_armature, bvh_armature]:
        bpy.context.view_layer.objects.active = armature
        bpy.ops.object.mode_set(mode='EDIT')
        bpy.ops.armature.select_all(action='SELECT')
        bpy.ops.armature.calculate_roll(type='ACTIVE')
        bpy.ops.object.mode_set(mode='OBJECT')
    
    print("[POSE] 레스트포즈 정규화 완료")

def load_bone_mappings():
    """본 매핑 로드"""
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
    
    # 오버라이드가 우선
    final_mapping = {**base_mapping, **overrides}
    return final_mapping

def fuzzy_bone_match(bone_name, target_bones, threshold=0.8):
    """퍼지 본 매칭"""
    bone_name_clean = bone_name.lower().replace('_', '').replace(' ', '')
    
    best_match = None
    best_score = 0
    
    for target in target_bones:
        target_clean = target.lower().replace('_', '').replace(' ', '')
        
        # 시작 문자열 매칭
        if target_clean.startswith(bone_name_clean) or bone_name_clean.startswith(target_clean):
            score = 0.9
        else:
            # Levenshtein 거리 기반 매칭
            score = 1.0 - levenshtein_distance(bone_name_clean, target_clean) / max(len(bone_name_clean), len(target_clean))
        
        if score > best_score and score >= threshold:
            best_score = score
            best_match = target
    
    return best_match

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

def create_bone_mapping(user_armature, bvh_armature):
    """자동 본 매핑 생성"""
    print("[MAP] 본 매핑 생성 중...")
    
    # 매핑 로드
    bone_mappings = load_bone_mappings()
    
    # 사용자 뼈대 이름 목록
    user_bone_names = [bone.name for bone in user_armature.data.bones]
    bvh_bone_names = [bone.name for bone in bvh_armature.data.bones]
    
    bone_map = {}
    matched_count = 0
    unmapped = []
    
    # 1차: 정확한 매핑
    for bvh_bone_name in bvh_bone_names:
        if bvh_bone_name in bone_mappings:
            target_name = bone_mappings[bvh_bone_name]
            if target_name in user_bone_names:
                bone_map[bvh_bone_name] = target_name
                matched_count += 1
                print(f"[MAP] 정확 매칭: {bvh_bone_name} -> {target_name}")
    
    # 2차: 퍼지 매칭
    for bvh_bone_name in bvh_bone_names:
        if bvh_bone_name not in bone_map:
            fuzzy_match = fuzzy_bone_match(bvh_bone_name, user_bone_names)
            if fuzzy_match:
                bone_map[bvh_bone_name] = fuzzy_match
                matched_count += 1
                print(f"[MAP] 퍼지 매칭: {bvh_bone_name} -> {fuzzy_match}")
            else:
                unmapped.append(bvh_bone_name)
    
    match_ratio = matched_count / len(bvh_bone_names) * 100
    print(f"[MAP] matched={matched_count}/{len(bvh_bone_names)} ({match_ratio:.1f}%)")
    
    if match_ratio < 70:
        print(f"[MAP] 경고: 매칭률이 낮습니다. unmapped={unmapped}")
    
    return bone_map, matched_count, unmapped

def setup_retarget_constraints(user_armature, bvh_armature, bone_map):
    """리타겟 제약 설정"""
    print("[BAKE] 리타겟 제약 설정 중...")
    
    # BVH를 활성화
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
    
    print(f"[BAKE] 제약 설정 완료: {constraint_count}개")
    return constraint_count

def bake_animation(user_armature, bvh_armature, start_frame, end_frame):
    """NLA Bake 실행"""
    print(f"[BAKE] NLA Bake 실행: frames={start_frame}-{end_frame}")
    
    # BVH 활성화
    bpy.context.view_layer.objects.active = bvh_armature
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
    if bvh_armature.animation_data and bvh_armature.animation_data.action:
        fcurves = len(bvh_armature.animation_data.action.fcurves)
        print(f"[BAKE] frames={end_frame - start_frame + 1} ok={fcurves > 0}")
        
        if fcurves == 0:
            raise ValueError("BAKE ZERO KEYS")
        
        return True
    else:
        print("[BAKE] 액션 생성 실패")
        return False

def export_glb(output_path, export_anim=True):
    """GLB 익스포트"""
    print(f"[GLB] 익스포트 중: {output_path}")
    
    bpy.ops.export_scene.gltf(
        filepath=output_path,
        export_format='GLB',
        export_animations=export_anim,
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
        export_anim_single_armature_object_name="Armature",
        export_reset_pose_bones=True,
        export_optimize_animation_size=True,
        export_anim_optimize_keep_export_armature=True,
        export_anim_optimize_keep_export_pose_bones=True,
        export_anim_optimize_keep_export_animations=True,
        export_anim_optimize_keep_export_animations_armature=True,
        export_anim_optimize_keep_export_animations_pose_bones=True,
        export_anim_optimize_keep_export_animations_animations=True,
        export_anim_optimize_keep_export_animations_animations_armature=True,
        export_anim_optimize_keep_export_animations_animations_pose_bones=True,
        export_anim_optimize_keep_export_animations_animations_animations=True
    )
    
    print(f"[GLB] path={output_path}")

def save_debug_files(output_dir, bone_map, pose_report, offset_scale, before_glb=None, after_glb=None):
    """디버그 파일 저장"""
    debug_dir = Path(output_dir)
    debug_dir.mkdir(parents=True, exist_ok=True)
    
    # bone_map.json
    with open(debug_dir / "bone_map.json", 'w', encoding='utf-8') as f:
        json.dump(bone_map, f, indent=2, ensure_ascii=False)
    
    # pose_report.json
    with open(debug_dir / "pose_report.json", 'w', encoding='utf-8') as f:
        json.dump(pose_report, f, indent=2, ensure_ascii=False)
    
    # offset_scale.json
    with open(debug_dir / "offset_scale.json", 'w', encoding='utf-8') as f:
        json.dump(offset_scale, f, indent=2, ensure_ascii=False)
    
    print(f"[DEBUG] 파일 저장됨: {debug_dir}")

def main():
    """메인 함수"""
    parser = argparse.ArgumentParser(description='BVH 리타겟 오프셋 자동 수정')
    parser.add_argument('--fbx', required=True, help='FBX 파일 경로')
    parser.add_argument('--bvh', required=True, help='BVH 파일 경로')
    parser.add_argument('--out_glb', required=True, help='출력 GLB 파일 경로')
    parser.add_argument('--out_dir', required=True, help='디버그 출력 디렉토리')
    parser.add_argument('--start', type=int, default=1, help='시작 프레임')
    parser.add_argument('--end', type=int, default=300, help='종료 프레임')
    
    args = parser.parse_args()
    
    try:
        # 경로 검증
        if not os.path.exists(args.fbx):
            raise FileNotFoundError(f"FBX 파일을 찾을 수 없습니다: {args.fbx}")
        if not os.path.exists(args.bvh):
            raise FileNotFoundError(f"BVH 파일을 찾을 수 없습니다: {args.bvh}")
        
        # 씬 초기화 및 설정
        clear_scene()
        setup_scene_units()
        
        # 파일 로드
        user_armature = load_fbx(args.fbx)
        bvh_armature = load_bvh(args.bvh)
        
        # BVH 프레임 확인
        if bvh_armature.animation_data and bvh_armature.animation_data.action:
            frame_range = bvh_armature.animation_data.action.frame_range
            if frame_range[1] - frame_range[0] == 0:
                raise ValueError("BVH Frames==0 또는 duration==0")
        
        # 최적 오프셋/스케일 찾기
        best_config, best_scale, best_offset = find_optimal_offset_scale(user_armature, bvh_armature)
        
        # 오프셋/스케일 적용
        apply_offset_scale(bvh_armature, best_scale, best_offset)
        
        # 레스트포즈 정규화
        normalize_rest_pose(user_armature, bvh_armature)
        
        # 본 매핑 생성
        bone_map, matched_count, unmapped = create_bone_mapping(user_armature, bvh_armature)
        
        # 리타겟 제약 설정
        constraint_count = setup_retarget_constraints(user_armature, bvh_armature, bone_map)
        
        # NLA Bake
        bake_success = bake_animation(user_armature, bvh_armature, args.start, args.end)
        
        if not bake_success:
            raise ValueError("NLA Bake 실패")
        
        # GLB 익스포트
        export_glb(args.out_glb, export_anim=True)
        
        # 디버그 파일 저장
        pose_report = {
            "rest_pose_normalized": True,
            "bone_roll_normalized": True,
            "constraint_count": constraint_count
        }
        
        offset_scale = {
            "offset": [best_offset.x, best_offset.y, best_offset.z],
            "scale_gain": best_scale,
            "axis_config": best_config
        }
        
        save_debug_files(args.out_dir, bone_map, pose_report, offset_scale)
        
        print("[SUCCESS] 리타겟 완료!")
        return 0
        
    except Exception as e:
        print(f"[ERROR] {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())

