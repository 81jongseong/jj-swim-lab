#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Blender 자동 리타겟 스크립트
- FBX와 BVH를 자동으로 매핑하고 GLB로 내보내기
- 자동 본 이름 매핑 및 스케일 보정
"""

import bpy
import bmesh
import sys
import os
import json
import argparse
from pathlib import Path
import mathutils
from mathutils import Vector, Euler, Quaternion
import re

def clean_scene():
    """씬 정리"""
    print("[ARM] 씬 정리 중...")
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    
    # 메시 데이터 정리
    for mesh in bpy.data.meshes:
        bpy.data.meshes.remove(mesh)
    
    # 아마처 데이터 정리
    for armature in bpy.data.armatures:
        bpy.data.armatures.remove(armature)
    
    # 액션 데이터 정리
    for action in bpy.data.actions:
        bpy.data.actions.remove(action)

def import_fbx(fbx_path):
    """FBX 임포트"""
    print(f"[ARM] FBX 임포트: {fbx_path}")
    
    # 임포트 전 오브젝트 수
    before_objects = set(bpy.context.scene.objects.keys())
    
    # FBX 임포트
    bpy.ops.import_scene.fbx(filepath=str(fbx_path))
    
    # 임포트 후 오브젝트 수
    after_objects = set(bpy.context.scene.objects.keys())
    imported_objects = after_objects - before_objects
    
    print(f"[ARM] 임포트된 오브젝트: {len(imported_objects)}개")
    
    return list(imported_objects)

def find_user_armature():
    """사용자 아마처 찾기 (뼈 개수 최대)"""
    print("[ARM] 사용자 아마처 검색 중...")
    
    armatures = [obj for obj in bpy.context.scene.objects if obj.type == 'ARMATURE']
    
    if not armatures:
        print("[ERROR] 아마처를 찾을 수 없습니다")
        return None
    
    # 뼈 개수로 정렬
    armatures.sort(key=lambda x: len(x.data.bones), reverse=True)
    user_armature = armatures[0]
    
    print(f"[ARM] 사용자 아마처 선택: {user_armature.name} ({len(user_armature.data.bones)}개 뼈)")
    
    return user_armature

def import_bvh(bvh_path):
    """BVH 임포트"""
    print(f"[ARM] BVH 임포트: {bvh_path}")
    
    # BVH 임포트
    bpy.ops.import_anim.bvh(filepath=str(bvh_path))
    
    # BVH 아마처 찾기
    bvh_armatures = [obj for obj in bpy.context.scene.objects if obj.type == 'ARMATURE']
    bvh_armature = None
    
    for armature in bvh_armatures:
        if armature.animation_data and armature.animation_data.action:
            bvh_armature = armature
            break
    
    if not bvh_armature:
        print("[ERROR] BVH 아마처를 찾을 수 없습니다")
        return None
    
    print(f"[ARM] BVH 아마처: {bvh_armature.name} ({len(bvh_armature.data.bones)}개 뼈)")
    
    return bvh_armature

def normalize_bone_name(name):
    """본 이름 정규화"""
    # 소문자 변환, 공백 제거, 특수문자 제거
    normalized = re.sub(r'[^a-zA-Z0-9]', '', name.lower())
    return normalized

def create_bone_mapping(user_armature, bvh_armature):
    """자동 본 이름 매핑"""
    print("[MAP] 본 이름 매핑 시작...")
    
    # 기본 매핑 사전 (Mixamo 표준)
    default_mapping = {
        'hips': ['root', 'hip', 'pelvis'],
        'spine': ['spine', 'spine1', 'spine2', 'spine3'],
        'spine1': ['spine1', 'spine01'],
        'spine2': ['spine2', 'spine02'],
        'spine3': ['spine3', 'spine03'],
        'neck': ['neck', 'neck1'],
        'head': ['head', 'head1'],
        'leftshoulder': ['leftshoulder', 'shoulderl', 'lshoulder'],
        'rightshoulder': ['rightshoulder', 'shoulderr', 'rshoulder'],
        'leftarm': ['leftarm', 'arml', 'larm'],
        'rightarm': ['rightarm', 'armr', 'rarm'],
        'leftforearm': ['leftforearm', 'forearml', 'lforearm'],
        'rightforearm': ['rightforearm', 'forearmr', 'rforearm'],
        'lefthand': ['lefthand', 'handl', 'lhand'],
        'righthand': ['righthand', 'handr', 'rhand'],
        'leftthigh': ['leftthigh', 'thighl', 'lthigh'],
        'rightthigh': ['rightthigh', 'thighr', 'rthigh'],
        'leftleg': ['leftleg', 'legl', 'lleg'],
        'rightleg': ['rightleg', 'legr', 'rleg'],
        'leftfoot': ['leftfoot', 'footl', 'lfoot'],
        'rightfoot': ['rightfoot', 'footr', 'rfoot']
    }
    
    user_bones = [bone.name for bone in user_armature.data.bones]
    bvh_bones = [bone.name for bone in bvh_armature.data.bones]
    
    print(f"[MAP] 사용자 뼈: {len(user_bones)}개")
    print(f"[MAP] BVH 뼈: {len(bvh_bones)}개")
    
    # 매핑 생성
    bone_mapping = {}
    matched = 0
    unmapped = []
    
    for bvh_bone in bvh_bones:
        bvh_normalized = normalize_bone_name(bvh_bone)
        best_match = None
        best_score = 0
        
        # 정확한 매칭 시도
        for user_bone in user_bones:
            user_normalized = normalize_bone_name(user_bone)
            
            if bvh_normalized == user_normalized:
                best_match = user_bone
                best_score = 1.0
                break
        
        # 부분 매칭 시도
        if not best_match:
            for user_bone in user_bones:
                user_normalized = normalize_bone_name(user_bone)
                
                # 시작 부분 매칭
                if bvh_normalized.startswith(user_normalized) or user_normalized.startswith(bvh_normalized):
                    score = min(len(bvh_normalized), len(user_normalized)) / max(len(bvh_normalized), len(user_normalized))
                    if score > best_score:
                        best_match = user_bone
                        best_score = score
        
        # 기본 매핑 사전 사용
        if not best_match:
            for key, values in default_mapping.items():
                if bvh_normalized in [normalize_bone_name(v) for v in values]:
                    for user_bone in user_bones:
                        user_normalized = normalize_bone_name(user_bone)
                        if user_normalized in [normalize_bone_name(v) for v in values]:
                            best_match = user_bone
                            best_score = 0.8
                            break
                    break
        
        if best_match and best_score > 0.5:
            bone_mapping[bvh_bone] = best_match
            matched += 1
            print(f"[MAP] {bvh_bone} -> {best_match} (점수: {best_score:.2f})")
        else:
            unmapped.append(bvh_bone)
    
    print(f"[MAP] 매칭 결과: {matched}개 매칭, {len(unmapped)}개 미매칭")
    
    if unmapped:
        print(f"[MAP] 미매칭 뼈: {unmapped}")
    
    # 매핑 결과 저장
    mapping_data = {
        'matched': matched,
        'unmapped': unmapped,
        'mapping': bone_mapping
    }
    
    with open('bone_map.json', 'w') as f:
        json.dump(mapping_data, f, indent=2)
    
    return bone_mapping

def apply_retargeting(user_armature, bvh_armature, bone_mapping):
    """리타겟 적용"""
    print("[BAKE] 리타겟 적용 중...")
    
    # 사용자 아마처 선택
    bpy.context.view_layer.objects.active = user_armature
    user_armature.select_set(True)
    
    # 모드 전환
    bpy.context.view_layer.objects.active = user_armature
    bpy.ops.object.mode_set(mode='POSE')
    
    # 제약 조건 생성
    for bvh_bone_name, user_bone_name in bone_mapping.items():
        if bvh_bone_name in bvh_armature.data.bones and user_bone_name in user_armature.data.bones:
            # 사용자 뼈 선택
            user_armature.data.bones[user_bone_name].select = True
            
            # Copy Transforms 제약 조건 추가
            constraint = user_armature.pose.bones[user_bone_name].constraints.new('COPY_TRANSFORMS')
            constraint.target = bvh_armature
            constraint.subtarget = bvh_bone_name
    
    # NLA Bake
    print("[BAKE] NLA Bake 실행 중...")
    bpy.ops.nla.bake(
        frame_start=1,
        frame_end=100,  # 기본값
        visual_keying=True,
        clear_constraints=True,
        clear_parents=False,
        use_current_action=True,
        bake_types={'POSE'}
    )
    
    print("[BAKE] 리타겟 완료")

def calculate_scale_factor(user_armature):
    """스케일 팩터 계산"""
    print("[SCALE] 스케일 팩터 계산 중...")
    
    # 바운딩 박스 계산
    bbox = user_armature.bound_box
    min_co = Vector(bbox[0])
    max_co = Vector(bbox[6])
    
    size = max_co - min_co
    height = size.z
    
    print(f"[SCALE] 현재 높이: {height:.2f}")
    
    # 목표 높이 (1.5~2.0m)
    target_height = 1.8
    scale_factor = target_height / height if height > 0 else 1.0
    
    print(f"[SCALE] 스케일 팩터: {scale_factor:.3f}")
    
    return scale_factor

def apply_scale_correction(user_armature, scale_factor):
    """스케일 보정 적용"""
    print(f"[SCALE] 스케일 보정 적용: {scale_factor:.3f}")
    
    # 아마처 스케일 적용
    user_armature.scale = (scale_factor, scale_factor, scale_factor)
    
    # 액션의 위치 채널에 스케일 적용
    if user_armature.animation_data and user_armature.animation_data.action:
        action = user_armature.animation_data.action
        
        for fcurve in action.fcurves:
            if fcurve.data_path.endswith('location'):
                for keyframe in fcurve.keyframe_points:
                    keyframe.co[1] *= scale_factor
                    keyframe.handle_left[1] *= scale_factor
                    keyframe.handle_right[1] *= scale_factor

def export_glb(output_path):
    """GLB 내보내기"""
    print(f"[GLB] 내보내기: {output_path}")
    
    # GLB 내보내기
    bpy.ops.export_scene.gltf(
        filepath=str(output_path),
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
        export_lights=False,
        export_cameras=False,
        export_extras=False,
        export_yup=True,
        export_apply=False,
        export_anim_single_armature=True,
        export_reset_pose_bones=True,
        export_current_frame_only=False,
        export_original_specular=False,
        export_keep_originals=False,
        export_texcoords=True,
        export_normals=True,
        export_draco_mesh_compression_enable=False,
        export_draco_mesh_compression_level=6,
        export_draco_position_quantization=14,
        export_draco_normal_quantization=10,
        export_draco_texcoord_quantization=12,
        export_draco_color_quantization=10,
        export_draco_generic_quantization=12,
        export_tangents=False,
        export_materials='EXPORT',
        export_original_specular=False,
        export_colors=True,
        export_attributes=False,
        export_morph_normal=False,
        export_morph_tangent=False,
        export_loose_edges=False,
        export_loose_points=False,
        export_unused_vertices=False,
        export_optimize_vertices=False,
        export_anim_single_armature=True,
        export_reset_pose_bones=True,
        export_current_frame_only=False,
        export_original_specular=False,
        export_keep_originals=False,
        export_texcoords=True,
        export_normals=True,
        export_draco_mesh_compression_enable=False,
        export_draco_mesh_compression_level=6,
        export_draco_position_quantization=14,
        export_draco_normal_quantization=10,
        export_draco_texcoord_quantization=12,
        export_draco_color_quantization=10,
        export_draco_generic_quantization=12,
        export_tangents=False,
        export_materials='EXPORT',
        export_original_specular=False,
        export_colors=True,
        export_attributes=False,
        export_morph_normal=False,
        export_morph_tangent=False,
        export_loose_edges=False,
        export_loose_points=False,
        export_unused_vertices=False,
        export_optimize_vertices=False
    )
    
    print(f"[GLB] 내보내기 완료: {output_path}")

def main():
    parser = argparse.ArgumentParser(description='Blender 자동 리타겟 스크립트')
    parser.add_argument('--fbx', required=True, help='FBX 파일 경로')
    parser.add_argument('--bvh', required=True, help='BVH 파일 경로')
    parser.add_argument('--out_glb', required=True, help='출력 GLB 파일 경로')
    parser.add_argument('--start', type=int, default=1, help='시작 프레임')
    parser.add_argument('--end', type=int, default=100, help='종료 프레임')
    
    args = parser.parse_args()
    
    # 절대 경로 변환
    fbx_path = Path(args.fbx).resolve()
    bvh_path = Path(args.bvh).resolve()
    output_path = Path(args.out_glb).resolve()
    
    print(f"[ARM] 시작: {fbx_path} + {bvh_path} -> {output_path}")
    
    try:
        # 1. 씬 정리
        clean_scene()
        
        # 2. FBX 임포트
        imported_objects = import_fbx(fbx_path)
        
        # 3. 사용자 아마처 찾기
        user_armature = find_user_armature()
        if not user_armature:
            print("[ERROR] 사용자 아마처를 찾을 수 없습니다")
            sys.exit(1)
        
        # 4. BVH 임포트
        bvh_armature = import_bvh(bvh_path)
        if not bvh_armature:
            print("[ERROR] BVH 아마처를 찾을 수 없습니다")
            sys.exit(1)
        
        # 5. 본 매핑 생성
        bone_mapping = create_bone_mapping(user_armature, bvh_armature)
        if not bone_mapping:
            print("[ERROR] 본 매핑을 생성할 수 없습니다")
            sys.exit(1)
        
        # 6. 리타겟 적용
        apply_retargeting(user_armature, bvh_armature, bone_mapping)
        
        # 7. 스케일 보정
        scale_factor = calculate_scale_factor(user_armature)
        apply_scale_correction(user_armature, scale_factor)
        
        # 8. GLB 내보내기
        export_glb(output_path)
        
        print("[SUCCESS] 리타겟 완료!")
        sys.exit(0)
        
    except Exception as e:
        print(f"[ERROR] 리타겟 실패: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()


