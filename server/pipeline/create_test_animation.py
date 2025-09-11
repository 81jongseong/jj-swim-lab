#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
간단한 테스트 애니메이션 생성 스크립트
기존 GLB 파일에 기본 애니메이션 추가
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

def load_existing_glb(glb_path):
    """기존 GLB 파일 로드"""
    print(f"[LOAD] GLB 파일 로드 중: {glb_path}")
    
    bpy.ops.import_scene.gltf(filepath=str(glb_path))
    
    # 아마추어 찾기
    armature = None
    for obj in bpy.context.scene.objects:
        if obj.type == 'ARMATURE':
            armature = obj
            break
    
    if not armature:
        print("[ERROR] 아마추어를 찾을 수 없습니다")
        return None
    
    print(f"[LOAD] 아마추어 발견: {armature.name}")
    return armature

def create_simple_animation(armature, duration=5.0, fps=30):
    """간단한 애니메이션 생성"""
    print(f"[ANIMATION] 간단한 애니메이션 생성 중...")
    
    # 액션 생성
    action = bpy.data.actions.new("SimpleAnimation")
    armature.animation_data_create()
    armature.animation_data.action = action
    
    # 프레임 설정
    total_frames = int(duration * fps)
    bpy.context.scene.frame_start = 1
    bpy.context.scene.frame_end = total_frames
    bpy.context.scene.render.fps = fps
    
    print(f"[ANIMATION] 프레임 설정: {total_frames}개 프레임, {fps} FPS")
    
    # 주요 뼈대들에 애니메이션 추가
    target_bones = [
        "handl", "handr",           # 손목
        "shoulderl", "shoulderr",   # 어깨
        "thigh_stretchl", "thigh_stretchr",  # 허벅지
        "footl", "footr"            # 발
    ]
    
    for frame in range(1, total_frames + 1):
        time = (frame - 1) / fps
        
        for bone_name in target_bones:
            bone = armature.pose.bones.get(bone_name)
            if bone:
                # 각 뼈대별로 다른 애니메이션 패턴
                if "hand" in bone_name:
                    # 손목: 접었다 폈다
                    rotation_z = math.sin(time * 4) * 0.3  # ±0.3 라디안
                    bone.rotation_euler = (0, 0, rotation_z)
                elif "shoulder" in bone_name:
                    # 어깨: 위아래 움직임
                    rotation_x = math.sin(time * 2 + (1 if "r" in bone_name else 0)) * 0.2
                    bone.rotation_euler = (rotation_x, 0, 0)
                elif "thigh" in bone_name:
                    # 허벅지: 앞뒤 움직임
                    rotation_x = math.sin(time * 1.5 + (1 if "r" in bone_name else 0)) * 0.4
                    bone.rotation_euler = (rotation_x, 0, 0)
                elif "foot" in bone_name:
                    # 발: 좌우 움직임
                    rotation_y = math.sin(time * 3 + (1 if "r" in bone_name else 0)) * 0.2
                    bone.rotation_euler = (0, rotation_y, 0)
                
                # 키프레임 삽입
                bone.keyframe_insert(data_path="rotation_euler", frame=frame)
    
    print(f"[ANIMATION] 애니메이션 생성 완료: {len(target_bones)}개 뼈대")
    return action

def export_animated_glb(output_path, armature):
    """애니메이션 포함 GLB 익스포트"""
    print(f"[EXPORT] 애니메이션 GLB 익스포트 중: {output_path}")
    
    # 아마추어 선택
    bpy.ops.object.select_all(action='DESELECT')
    armature.select_set(True)
    bpy.context.view_layer.objects.active = armature
    
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
    
    parser = argparse.ArgumentParser(description="간단한 테스트 애니메이션 생성")
    parser.add_argument("--input", required=True, help="입력 GLB 파일")
    parser.add_argument("--output", required=True, help="출력 GLB 파일")
    parser.add_argument("--duration", type=float, default=5.0, help="애니메이션 지속시간 (초)")
    parser.add_argument("--fps", type=int, default=30, help="프레임 레이트")
    
    args = parser.parse_args(argv)
    
    input_path = Path(args.input)
    output_path = Path(args.output)
    
    if not input_path.exists():
        print(f"[ERROR] 입력 파일이 존재하지 않습니다: {input_path}")
        return 1
    
    # 씬 정리
    clear_scene()
    
    # 기존 GLB 로드
    armature = load_existing_glb(input_path)
    if not armature:
        return 1
    
    # 간단한 애니메이션 생성
    action = create_simple_animation(armature, args.duration, args.fps)
    
    # 애니메이션 GLB 익스포트
    export_animated_glb(output_path, armature)
    
    print("[COMPLETE] 모든 작업 완료!")
    print(f"[OUTPUT] 애니메이션 GLB: {output_path}")
    
    return 0

if __name__ == "__main__":
    exit(main())
