#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
간단한 BVH 적용 스크립트
BVH 파일을 직접 모델에 적용하여 애니메이션 생성
"""

import bpy
import os
import sys
from mathutils import Vector, Quaternion, Matrix

def clear_scene():
    """씬 초기화"""
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)

def import_bvh(bvh_path):
    """BVH 파일 임포트"""
    print(f"[BVH] BVH 파일 임포트: {bvh_path}")
    
    try:
        bpy.ops.import_anim.bvh(filepath=bvh_path)
        print(f"[BVH] BVH 임포트 성공")
        
        # 임포트된 아마추어 찾기
        armatures = [obj for obj in bpy.context.scene.objects if obj.type == 'ARMATURE']
        if armatures:
            armature = armatures[0]
            print(f"[BVH] 아마추어 발견: {armature.name}")
            return armature
        else:
            print(f"[BVH] 아마추어를 찾을 수 없습니다")
            return None
            
    except Exception as e:
        print(f"[BVH] BVH 임포트 실패: {e}")
        return None

def import_glb(glb_path):
    """GLB 모델 임포트"""
    print(f"[GLB] GLB 모델 임포트: {glb_path}")
    
    try:
        bpy.ops.import_scene.gltf(filepath=glb_path)
        print(f"[GLB] GLB 임포트 성공")
        
        # 임포트된 아마추어 찾기
        armatures = [obj for obj in bpy.context.scene.objects if obj.type == 'ARMATURE']
        if armatures:
            armature = armatures[0]
            print(f"[GLB] 아마추어 발견: {armature.name}")
            return armature
        else:
            print(f"[GLB] 아마추어를 찾을 수 없습니다")
            return None
            
    except Exception as e:
        print(f"[GLB] GLB 임포트 실패: {e}")
        return None

def find_bone_mapping(source_armature, target_armature):
    """뼈대 매핑 찾기"""
    print(f"[MAP] 뼈대 매핑 시작")
    
    mapping = {}
    
    # 기본 매핑 규칙
    bone_mapping_rules = {
        'Hips': ['Hips', 'Root', 'rootx', 'pelvis', 'hip'],
        'Spine': ['Spine', 'spine', 'spine1', 'spine2'],
        'Chest': ['Chest', 'chest', 'spine3', 'spine4'],
        'Neck': ['Neck', 'neck', 'neck1', 'neck2'],
        'Head': ['Head', 'head', 'skull'],
        'LeftShoulder': ['LeftShoulder', 'left_shoulder', 'L_shoulder', 'shoulder_L'],
        'LeftArm': ['LeftArm', 'left_arm', 'L_arm', 'arm_L'],
        'LeftForeArm': ['LeftForeArm', 'left_forearm', 'L_forearm', 'forearm_L'],
        'RightShoulder': ['RightShoulder', 'right_shoulder', 'R_shoulder', 'shoulder_R'],
        'RightArm': ['RightArm', 'right_arm', 'R_arm', 'arm_R'],
        'RightForeArm': ['RightForeArm', 'right_forearm', 'R_forearm', 'forearm_R'],
        'LeftUpLeg': ['LeftUpLeg', 'left_thigh', 'L_thigh', 'thigh_L'],
        'LeftLeg': ['LeftLeg', 'left_leg', 'L_leg', 'leg_L'],
        'LeftFoot': ['LeftFoot', 'left_foot', 'L_foot', 'foot_L'],
        'RightUpLeg': ['RightUpLeg', 'right_thigh', 'R_thigh', 'thigh_R'],
        'RightLeg': ['RightLeg', 'right_leg', 'R_leg', 'leg_R'],
        'RightFoot': ['RightFoot', 'right_foot', 'R_foot', 'foot_R']
    }
    
    for source_bone_name in source_armature.data.bones.keys():
        for target_bone_name in target_armature.data.bones.keys():
            # 정확한 이름 매칭
            if source_bone_name == target_bone_name:
                mapping[source_bone_name] = target_bone_name
                print(f"[MAP] 정확 매칭: {source_bone_name} -> {target_bone_name}")
                break
            
            # 규칙 기반 매칭
            for rule_name, possible_names in bone_mapping_rules.items():
                if source_bone_name in possible_names and target_bone_name in possible_names:
                    mapping[source_bone_name] = target_bone_name
                    print(f"[MAP] 규칙 매칭: {source_bone_name} -> {target_bone_name}")
                    break
    
    print(f"[MAP] 매핑 완료: {len(mapping)}개 뼈대")
    return mapping

def apply_animation(source_armature, target_armature, bone_mapping):
    """애니메이션 적용"""
    print(f"[ANIM] 애니메이션 적용 시작")
    
    # 타겟 아마추어를 활성화
    bpy.context.view_layer.objects.active = target_armature
    bpy.ops.object.mode_set(mode='POSE')
    
    # 모든 본 선택 해제
    bpy.ops.pose.select_all(action='DESELECT')
    
    applied_count = 0
    
    for source_bone_name, target_bone_name in bone_mapping.items():
        try:
            # 소스 본 찾기
            if source_bone_name not in source_armature.data.bones:
                continue
                
            # 타겟 본 찾기
            if target_bone_name not in target_armature.pose.bones:
                continue
            
            source_bone = source_armature.data.bones[source_bone_name]
            target_bone = target_armature.pose.bones[target_bone_name]
            
            # 애니메이션 데이터 복사
            if source_armature.animation_data and source_armature.animation_data.action:
                action = source_armature.animation_data.action
                
                # 타겟 본에 애니메이션 데이터 적용
                for fcurve in action.fcurves:
                    if fcurve.data_path.endswith(f'["{source_bone_name}"]'):
                        # 뼈대 회전 애니메이션
                        if 'rotation' in fcurve.data_path:
                            target_bone.rotation_mode = 'QUATERNION'
                            
                            # 키프레임 설정
                            for keyframe in fcurve.keyframe_points:
                                frame = int(keyframe.co[0])
                                value = keyframe.co[1]
                                
                                bpy.context.scene.frame_set(frame)
                                
                                # 회전 값 적용
                                if 'rotation_quaternion' in fcurve.data_path:
                                    if fcurve.array_index == 0:
                                        target_bone.rotation_quaternion.w = value
                                    elif fcurve.array_index == 1:
                                        target_bone.rotation_quaternion.x = value
                                    elif fcurve.array_index == 2:
                                        target_bone.rotation_quaternion.y = value
                                    elif fcurve.array_index == 3:
                                        target_bone.rotation_quaternion.z = value
                                
                                # 키프레임 삽입
                                target_bone.keyframe_insert(data_path="rotation_quaternion", frame=frame)
                
                applied_count += 1
                print(f"[ANIM] 애니메이션 적용: {source_bone_name} -> {target_bone_name}")
                
        except Exception as e:
            print(f"[ANIM] 애니메이션 적용 실패 {source_bone_name} -> {target_bone_name}: {e}")
    
    print(f"[ANIM] 애니메이션 적용 완료: {applied_count}개 뼈대")

def export_animated_glb(target_armature, output_path):
    """애니메이션이 포함된 GLB 내보내기"""
    print(f"[EXPORT] GLB 내보내기: {output_path}")
    
    try:
        # 모든 오브젝트 선택
        bpy.ops.object.select_all(action='SELECT')
        
        # GLB 내보내기
        bpy.ops.export_scene.gltf(
            filepath=output_path,
            export_format='GLB',
            use_selection=True,
            export_animations=True,
            export_frame_range=True,
            export_frame_step=1,
            export_force_sampling=True,
            export_nla_strips=True,
            export_def_bones=True,
            export_optimize_vertices=True,
            export_anim_single_armature=True
        )
        
        print(f"[EXPORT] GLB 내보내기 성공: {output_path}")
        return True
        
    except Exception as e:
        print(f"[EXPORT] GLB 내보내기 실패: {e}")
        return False

def main():
    if len(sys.argv) != 4:
        print("사용법: blender --background --python blender_apply_bvh_simple.py -- <bvh_file> <glb_file> <output_file>")
        sys.exit(1)
    
    bvh_file = sys.argv[1]
    glb_file = sys.argv[2]
    output_file = sys.argv[3]
    
    print(f"[MAIN] BVH 파일: {bvh_file}")
    print(f"[MAIN] GLB 파일: {glb_file}")
    print(f"[MAIN] 출력 파일: {output_file}")
    
    # 파일 존재 확인
    if not os.path.exists(bvh_file):
        print(f"[ERROR] BVH 파일이 존재하지 않습니다: {bvh_file}")
        sys.exit(1)
    
    if not os.path.exists(glb_file):
        print(f"[ERROR] GLB 파일이 존재하지 않습니다: {glb_file}")
        sys.exit(1)
    
    # 씬 초기화
    clear_scene()
    
    # BVH 임포트
    source_armature = import_bvh(bvh_file)
    if not source_armature:
        print(f"[ERROR] BVH 임포트 실패")
        sys.exit(1)
    
    # GLB 임포트
    target_armature = import_glb(glb_file)
    if not target_armature:
        print(f"[ERROR] GLB 임포트 실패")
        sys.exit(1)
    
    # 뼈대 매핑
    bone_mapping = find_bone_mapping(source_armature, target_armature)
    if not bone_mapping:
        print(f"[ERROR] 뼈대 매핑 실패")
        sys.exit(1)
    
    # 애니메이션 적용
    apply_animation(source_armature, target_armature, bone_mapping)
    
    # GLB 내보내기
    if export_animated_glb(target_armature, output_file):
        print(f"[SUCCESS] 애니메이션 적용 완료: {output_file}")
    else:
        print(f"[ERROR] GLB 내보내기 실패")
        sys.exit(1)

if __name__ == "__main__":
    main()




