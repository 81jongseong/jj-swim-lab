#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Blender BVH 리타겟 스크립트 (백업 경로)
BVH 임포트로 새 Armature가 생겼을 때 이름 매핑 기반 리타겟 + Bake 처리
"""

import bpy
import bmesh
import os
import sys
import argparse
import unicodedata
from pathlib import Path

def normalize_unicode_path(path):
    """유니코드 경로 NFC 정규화"""
    return unicodedata.normalize('NFC', str(path))

# 표준 Mixamo 이름 세트 기본값 + 사용자 본명으로 쉽게 편집 가능
NAME_MAP = {
    # BVH → Mixamo 매핑
    'Hips': 'Hips',
    'Chest': 'Spine',
    'Neck': 'Neck',
    'Head': 'Head',
    'LeftShoulder': 'LeftShoulder',
    'LeftArm': 'LeftArm',
    'LeftForeArm': 'LeftForeArm',
    'LeftHand': 'LeftHand',
    'RightShoulder': 'RightShoulder',
    'RightArm': 'RightArm',
    'RightForeArm': 'RightForeArm',
    'RightHand': 'RightHand',
    'LeftUpLeg': 'LeftUpLeg',
    'LeftLeg': 'LeftLeg',
    'LeftFoot': 'LeftFoot',
    'RightUpLeg': 'RightUpLeg',
    'RightLeg': 'RightLeg',
    'RightFoot': 'RightFoot',
    
    # 대체 이름들
    'Spine': 'Spine',
    'Spine1': 'Spine1',
    'Spine2': 'Spine2',
    'LeftShoulderBlade': 'LeftShoulder',
    'RightShoulderBlade': 'RightShoulder',
    'LeftElbow': 'LeftForeArm',
    'RightElbow': 'RightForeArm',
    'LeftWrist': 'LeftHand',
    'RightWrist': 'RightHand',
    'LeftThigh': 'LeftUpLeg',
    'RightThigh': 'RightUpLeg',
    'LeftShin': 'LeftLeg',
    'RightShin': 'RightLeg',
    'LeftAnkle': 'LeftFoot',
    'RightAnkle': 'RightFoot',
}

def find_armatures():
    """씬의 모든 Armature 찾기"""
    print("[RETARGET] Armature 검색 중...")
    
    armatures = [obj for obj in bpy.context.scene.objects if obj.type == 'ARMATURE']
    
    print(f"[RETARGET] 발견된 Armature: {len(armatures)}")
    for i, armature in enumerate(armatures):
        bone_count = len(armature.data.bones)
        print(f"[RETARGET]   {i+1}. {armature.name} ({bone_count} 본)")
    
    return armatures

def get_bone_mapping(source_armature, target_armature):
    """본 이름 매핑 생성"""
    print(f"[RETARGET] 본 매핑 생성: {source_armature.name} → {target_armature.name}")
    
    mapping = {}
    source_bones = {bone.name: bone for bone in source_armature.data.bones}
    target_bones = {bone.name: bone for bone in target_armature.data.bones}
    
    print(f"[RETARGET] 소스 본: {list(source_bones.keys())}")
    print(f"[RETARGET] 타겟 본: {list(target_bones.keys())}")
    
    # NAME_MAP을 사용한 매핑
    for source_name, target_name in NAME_MAP.items():
        if source_name in source_bones and target_name in target_bones:
            mapping[source_name] = target_name
            print(f"[RETARGET]   매핑: {source_name} → {target_name}")
    
    # 직접 이름 매칭
    for source_name in source_bones.keys():
        if source_name in target_bones and source_name not in mapping:
            mapping[source_name] = source_name
            print(f"[RETARGET]   직접 매칭: {source_name} → {source_name}")
    
    print(f"[RETARGET] 총 매핑 수: {len(mapping)}")
    return mapping

def copy_animation_data(source_armature, target_armature, bone_mapping):
    """애니메이션 데이터 복사"""
    print(f"[RETARGET] 애니메이션 데이터 복사 시작")
    
    if not source_armature.animation_data or not source_armature.animation_data.action:
        print("[RETARGET] 소스 Armature에 애니메이션이 없습니다.")
        return
    
    source_action = source_armature.animation_data.action
    print(f"[RETARGET] 소스 액션: {source_action.name}")
    print(f"[RETARGET] 프레임 범위: {source_action.frame_range[0]} - {source_action.frame_range[1]}")
    
    # 타겟 Armature에 새 액션 생성
    target_action = bpy.data.actions.new(f"{source_action.name}_retargeted")
    
    if target_armature.animation_data is None:
        target_armature.animation_data_create()
    
    target_armature.animation_data.action = target_action
    
    # 본별로 키프레임 복사
    for source_bone_name, target_bone_name in bone_mapping.items():
        if source_bone_name not in source_armature.data.bones:
            continue
        if target_bone_name not in target_armature.data.bones:
            continue
        
        print(f"[RETARGET] 본 복사: {source_bone_name} → {target_bone_name}")
        
        # 위치, 회전, 스케일 키프레임 복사
        for fcurve in source_action.fcurves:
            if fcurve.data_path.startswith(f'pose.bones["{source_bone_name}"]'):
                # 새 데이터 경로 생성
                new_data_path = fcurve.data_path.replace(f'pose.bones["{source_bone_name}"]', f'pose.bones["{target_bone_name}"]')
                
                # 새 F-curve 생성
                new_fcurve = target_action.fcurves.new(new_data_path, index=fcurve.array_index)
                new_fcurve.keyframe_points.add(len(fcurve.keyframe_points))
                
                # 키프레임 복사
                for i, keyframe in enumerate(fcurve.keyframe_points):
                    new_keyframe = new_fcurve.keyframe_points[i]
                    new_keyframe.co = keyframe.co
                    new_keyframe.handle_left = keyframe.handle_left
                    new_keyframe.handle_right = keyframe.handle_right
                    new_keyframe.handle_left_type = keyframe.handle_left_type
                    new_keyframe.handle_right_type = keyframe.handle_right_type
    
    print(f"[RETARGET] 애니메이션 데이터 복사 완료")

def bake_animation(target_armature, start_frame=1, end_frame=300):
    """애니메이션 Bake"""
    print(f"[RETARGET] 애니메이션 Bake 시작: {start_frame} - {end_frame}")
    
    # 타겟 Armature 선택
    bpy.ops.object.select_all(action='DESELECT')
    target_armature.select_set(True)
    bpy.context.view_layer.objects.active = target_armature
    
    # 모든 본 선택
    bpy.ops.object.mode_set(mode='POSE')
    bpy.ops.pose.select_all(action='SELECT')
    
    # NLA Bake 실행
    bpy.ops.nla.bake(
        frame_start=start_frame,
        frame_end=end_frame,
        step=1,
        only_selected=True,
        visual_keying=True,
        clear_constraints=False,
        clear_parents=False,
        use_current_action=True,
        bake_types={'POSE'}
    )
    
    print(f"[RETARGET] 애니메이션 Bake 완료")

def cleanup_source_armature(source_armature):
    """소스 Armature 정리"""
    print(f"[RETARGET] 소스 Armature 정리: {source_armature.name}")
    
    # 소스 Armature 선택
    bpy.ops.object.select_all(action='DESELECT')
    source_armature.select_set(True)
    bpy.context.view_layer.objects.active = source_armature
    
    # 삭제
    bpy.ops.object.delete()
    
    print(f"[RETARGET] 소스 Armature 삭제 완료")

def main():
    parser = argparse.ArgumentParser(description='Blender BVH 리타겟 스크립트')
    parser.add_argument('--source_armature', help='소스 Armature 이름 (기본: 첫 번째)')
    parser.add_argument('--target_armature', help='타겟 Armature 이름 (기본: 두 번째)')
    parser.add_argument('--start', type=int, default=1, help='시작 프레임')
    parser.add_argument('--end', type=int, default=300, help='종료 프레임')
    parser.add_argument('--cleanup', action='store_true', help='소스 Armature 삭제')
    
    args = parser.parse_args()
    
    print(f"[RETARGET] 리타겟 시작")
    print(f"[RETARGET] 프레임 범위: {args.start} - {args.end}")
    
    try:
        # 1. Armature 찾기
        armatures = find_armatures()
        
        if len(armatures) < 2:
            raise ValueError("[RETARGET] 리타겟을 위해 최소 2개의 Armature가 필요합니다.")
        
        # 2. 소스/타겟 Armature 선택
        if args.source_armature:
            source_armature = next((a for a in armatures if a.name == args.source_armature), None)
            if not source_armature:
                raise ValueError(f"[RETARGET] 소스 Armature를 찾을 수 없습니다: {args.source_armature}")
        else:
            source_armature = armatures[0]
        
        if args.target_armature:
            target_armature = next((a for a in armatures if a.name == args.target_armature), None)
            if not target_armature:
                raise ValueError(f"[RETARGET] 타겟 Armature를 찾을 수 없습니다: {args.target_armature}")
        else:
            target_armature = armatures[1]
        
        print(f"[RETARGET] 소스: {source_armature.name}")
        print(f"[RETARGET] 타겟: {target_armature.name}")
        
        # 3. 본 매핑 생성
        bone_mapping = get_bone_mapping(source_armature, target_armature)
        
        if not bone_mapping:
            raise ValueError("[RETARGET] 매핑할 본이 없습니다.")
        
        # 4. 애니메이션 데이터 복사
        copy_animation_data(source_armature, target_armature, bone_mapping)
        
        # 5. 애니메이션 Bake
        bake_animation(target_armature, args.start, args.end)
        
        # 6. 소스 Armature 정리
        if args.cleanup:
            cleanup_source_armature(source_armature)
        
        print(f"[RETARGET] 리타겟 완료!")
        print(f"[RETARGET] 결과 Armature: {target_armature.name}")
        
    except Exception as e:
        print(f"[RETARGET] 오류 발생: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()




