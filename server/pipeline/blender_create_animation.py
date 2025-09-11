#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Blender 애니메이션 생성 스크립트
포즈 데이터를 GLB 애니메이션으로 변환
"""

import bpy
import json
import mathutils
import math
import argparse
import sys
from pathlib import Path
from mathutils import Vector, Euler

def clear_scene():
    """씬 정리"""
    print("[CLEAR] 씬 정리 중...")
    
    # 모든 오브젝트 선택 및 삭제
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    
    # 데이터 정리
    for mesh in bpy.data.meshes:
        bpy.data.meshes.remove(mesh)
    for armature in bpy.data.armatures:
        bpy.data.armatures.remove(armature)
    for action in bpy.data.actions:
        bpy.data.actions.remove(action)
    
    print("[CLEAR] 씬 정리 완료")

def create_base_armature():
    """기본 아마추어 생성"""
    print("[ARMATURE] 기본 아마추어 생성 중...")
    
    # 아마추어 생성
    bpy.ops.object.armature_add(location=(0, 0, 0))
    armature = bpy.context.active_object
    armature.name = "BaseArmature"
    
    # 편집 모드로 전환
    bpy.context.view_layer.objects.active = armature
    bpy.ops.object.mode_set(mode='EDIT')
    
    # 기본 뼈대 구조 생성 (간단한 형태)
    bones = armature.data.edit_bones
    
    # 루트 뼈대
    root = bones.new("Hips")
    root.head = (0, 0, 0)
    root.tail = (0, 0, 0.1)
    
    # 척추
    spine = bones.new("Spine")
    spine.parent = root
    spine.head = (0, 0, 0.1)
    spine.tail = (0, 0, 0.3)
    
    # 목
    neck = bones.new("Neck")
    neck.parent = spine
    neck.head = (0, 0, 0.3)
    neck.tail = (0, 0, 0.4)
    
    # 머리
    head = bones.new("Head")
    head.parent = neck
    head.head = (0, 0, 0.4)
    head.tail = (0, 0, 0.5)
    
    # 왼쪽 어깨
    left_shoulder = bones.new("LeftShoulder")
    left_shoulder.parent = spine
    left_shoulder.head = (0, 0, 0.3)
    left_shoulder.tail = (-0.1, 0, 0.3)
    
    # 왼쪽 팔
    left_arm = bones.new("LeftArm")
    left_arm.parent = left_shoulder
    left_arm.head = (-0.1, 0, 0.3)
    left_arm.tail = (-0.2, 0, 0.3)
    
    # 왼쪽 팔꿈치
    left_forearm = bones.new("LeftForeArm")
    left_forearm.parent = left_arm
    left_forearm.head = (-0.2, 0, 0.3)
    left_forearm.tail = (-0.3, 0, 0.3)
    
    # 왼쪽 손목
    left_hand = bones.new("LeftHand")
    left_hand.parent = left_forearm
    left_hand.head = (-0.3, 0, 0.3)
    left_hand.tail = (-0.35, 0, 0.3)
    
    # 오른쪽 어깨
    right_shoulder = bones.new("RightShoulder")
    right_shoulder.parent = spine
    right_shoulder.head = (0, 0, 0.3)
    right_shoulder.tail = (0.1, 0, 0.3)
    
    # 오른쪽 팔
    right_arm = bones.new("RightArm")
    right_arm.parent = right_shoulder
    right_arm.head = (0.1, 0, 0.3)
    right_arm.tail = (0.2, 0, 0.3)
    
    # 오른쪽 팔꿈치
    right_forearm = bones.new("RightForeArm")
    right_forearm.parent = right_arm
    right_forearm.head = (0.2, 0, 0.3)
    right_forearm.tail = (0.3, 0, 0.3)
    
    # 오른쪽 손목
    right_hand = bones.new("RightHand")
    right_hand.parent = right_forearm
    right_hand.head = (0.3, 0, 0.3)
    right_hand.tail = (0.35, 0, 0.3)
    
    # 다리 뼈대들
    left_hip = bones.new("LeftUpLeg")
    left_hip.parent = root
    left_hip.head = (0, 0, 0)
    left_hip.tail = (-0.05, 0, -0.2)
    
    left_knee = bones.new("LeftLeg")
    left_knee.parent = left_hip
    left_knee.head = (-0.05, 0, -0.2)
    left_knee.tail = (-0.05, 0, -0.4)
    
    left_ankle = bones.new("LeftFoot")
    left_ankle.parent = left_knee
    left_ankle.head = (-0.05, 0, -0.4)
    left_ankle.tail = (-0.05, 0, -0.5)
    
    right_hip = bones.new("RightUpLeg")
    right_hip.parent = root
    right_hip.head = (0, 0, 0)
    right_hip.tail = (0.05, 0, -0.2)
    
    right_knee = bones.new("RightLeg")
    right_knee.parent = right_hip
    right_knee.head = (0.05, 0, -0.2)
    right_knee.tail = (0.05, 0, -0.4)
    
    right_ankle = bones.new("RightFoot")
    right_ankle.parent = right_knee
    right_ankle.head = (0.05, 0, -0.4)
    right_ankle.tail = (0.05, 0, -0.5)
    
    # 오브젝트 모드로 전환
    bpy.ops.object.mode_set(mode='OBJECT')
    
    print("[ARMATURE] 기본 아마추어 생성 완료")
    return armature

def create_animation_from_pose_data(armature, pose_data):
    """포즈 데이터로 애니메이션 생성"""
    print("[ANIMATION] 애니메이션 생성 시작...")
    
    # 액션 생성
    action = bpy.data.actions.new("PoseAnimation")
    armature.animation_data_create()
    armature.animation_data.action = action
    
    # 프레임 설정
    fps = pose_data.get("fps", 30)
    bpy.context.scene.frame_start = 1
    bpy.context.scene.frame_end = len(pose_data["keypoints"])
    bpy.context.scene.render.fps = fps
    
    # 뼈대 매핑
    bone_mapping = {
        "Hips": "Hips",
        "Spine": "Spine", 
        "Neck": "Neck",
        "Head": "Head",
        "LeftShoulder": "LeftShoulder",
        "LeftArm": "LeftArm",
        "LeftForeArm": "LeftForeArm",
        "LeftHand": "LeftHand",
        "RightShoulder": "RightShoulder",
        "RightArm": "RightArm",
        "RightForeArm": "RightForeArm",
        "RightHand": "RightHand",
        "LeftUpLeg": "LeftUpLeg",
        "LeftLeg": "LeftLeg",
        "LeftFoot": "LeftFoot",
        "RightUpLeg": "RightUpLeg",
        "RightLeg": "RightLeg",
        "RightFoot": "RightFoot"
    }
    
    # MediaPipe → Blender 뼈대 매핑
    mp_to_blender = {
        11: "LeftShoulder",   # 왼쪽 어깨
        12: "RightShoulder",  # 오른쪽 어깨
        13: "LeftArm",        # 왼쪽 팔꿈치
        14: "RightArm",       # 오른쪽 팔꿈치
        15: "LeftForeArm",    # 왼쪽 손목
        16: "RightForeArm",   # 오른쪽 손목
        23: "LeftUpLeg",      # 왼쪽 허벅지
        24: "RightUpLeg",     # 오른쪽 허벅지
        25: "LeftLeg",        # 왼쪽 무릎
        26: "RightLeg",       # 오른쪽 무릎
        27: "LeftFoot",       # 왼쪽 발목
        28: "RightFoot"       # 오른쪽 발목
    }
    
    # 키프레임 생성
    for frame_data in pose_data["keypoints"]:
        frame_num = frame_data["frame"] + 1  # Blender는 1부터 시작
        landmarks = frame_data["landmarks"]
        
        # 각 뼈대에 대해 키프레임 설정
        for mp_idx, bone_name in mp_to_blender.items():
            if mp_idx < len(landmarks):
                landmark = landmarks[mp_idx]
                
                # 뼈대 찾기
                bone = armature.pose.bones.get(bone_name)
                if bone:
                    # 위치 기반 회전 계산 (간단한 예시)
                    x = landmark["x"] - 0.5  # 중앙 기준
                    y = landmark["y"] - 0.5
                    z = landmark["z"]
                    
                    # 간단한 회전 계산
                    rotation_x = x * 0.5  # ±0.25 라디안
                    rotation_y = y * 0.5
                    rotation_z = z * 0.2
                    
                    # 키프레임 설정
                    bone.rotation_euler = (rotation_x, rotation_y, rotation_z)
                    bone.keyframe_insert(data_path="rotation_euler", frame=frame_num)
    
    print(f"[ANIMATION] 애니메이션 생성 완료: {len(pose_data['keypoints'])}개 프레임")
    return action

def export_glb(output_path):
    """GLB 파일로 익스포트"""
    print(f"[EXPORT] GLB 익스포트 시작: {output_path}")
    
    # GLB 익스포트 설정
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
        export_anim_bake_anim_use_all_bones=True,
        export_anim_bake_anim_force_startend_keying=True,
        export_anim_bake_anim_step=1,
        export_anim_bake_anim_simplify_factor=0.0
    )
    
    print(f"[EXPORT] GLB 익스포트 완료: {output_path}")

def main():
    # 명령행 인수 파싱
    argv = sys.argv
    if "--" in argv:
        argv = argv[argv.index("--") + 1:]
    
    parser = argparse.ArgumentParser(description="Blender 애니메이션 생성")
    parser.add_argument("--pose-data", required=True, help="포즈 데이터 JSON 파일")
    parser.add_argument("--output", required=True, help="출력 GLB 파일")
    
    args = parser.parse_args(argv)
    
    pose_data_path = Path(args.pose_data)
    output_path = Path(args.output)
    
    if not pose_data_path.exists():
        print(f"[ERROR] 포즈 데이터 파일이 존재하지 않습니다: {pose_data_path}")
        return 1
    
    # 포즈 데이터 로드
    with open(pose_data_path, 'r', encoding='utf-8') as f:
        pose_data = json.load(f)
    
    # 씬 정리
    clear_scene()
    
    # 아마추어 생성
    armature = create_base_armature()
    
    # 애니메이션 생성
    action = create_animation_from_pose_data(armature, pose_data)
    
    # GLB 익스포트
    export_glb(output_path)
    
    print("[COMPLETE] 모든 작업 완료!")
    return 0

if __name__ == "__main__":
    exit(main())
