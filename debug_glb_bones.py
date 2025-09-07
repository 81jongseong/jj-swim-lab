#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
GLB 파일의 뼈대 구조 디버깅 스크립트
"""

import bpy
import os
import sys

def debug_glb_bones(glb_path):
    """GLB 파일의 뼈대 구조 분석"""
    print(f"[BONE DEBUG] GLB 파일 분석: {glb_path}")
    
    # 씬 초기화
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    
    # GLB 임포트
    bpy.ops.import_scene.gltf(filepath=str(glb_path))
    
    # 모든 오브젝트 검사
    print(f"\n[BONE DEBUG] 모든 오브젝트들:")
    for obj in bpy.context.scene.objects:
        print(f"  - {obj.name} (타입: {obj.type})")
    
    # Armature 찾기
    armatures = [obj for obj in bpy.context.scene.objects if obj.type == 'ARMATURE']
    print(f"\n[BONE DEBUG] Armature 오브젝트들: {[obj.name for obj in armatures]}")
    
    if not armatures:
        print("[BONE DEBUG] ERROR: Armature를 찾을 수 없습니다")
        return
    
    target_armature = armatures[0]
    print(f"\n[BONE DEBUG] 타겟 Armature: {target_armature.name}")
    
    # 뼈대 구조 분석
    print(f"\n[BONE DEBUG] 뼈대 구조:")
    print_bone_hierarchy(target_armature.data.bones, 0)
    
    # 애니메이션 데이터 확인
    if target_armature.animation_data and target_armature.animation_data.action:
        action = target_armature.animation_data.action
        print(f"\n[BONE DEBUG] 애니메이션 액션: {action.name}")
        print(f"[BONE DEBUG] F-Curve 수: {len(action.fcurves)}")
        
        # F-Curve별 뼈대 이름 추출
        bone_names = set()
        for fcurve in action.fcurves:
            if fcurve.data_path.startswith('pose.bones['):
                # pose.bones["bone_name"].property 형태에서 뼈대 이름 추출
                start = fcurve.data_path.find('"') + 1
                end = fcurve.data_path.find('"', start)
                if start > 0 and end > start:
                    bone_name = fcurve.data_path[start:end]
                    bone_names.add(bone_name)
        
        print(f"\n[BONE DEBUG] 애니메이션에 사용된 뼈대들:")
        for bone_name in sorted(bone_names):
            print(f"  - {bone_name}")
    else:
        print(f"\n[BONE DEBUG] 애니메이션 데이터 없음")

def print_bone_hierarchy(bones, level):
    """뼈대 계층 구조 출력"""
    for bone in bones:
        indent = "  " * level
        print(f"{indent}- {bone.name}")
        if bone.children:
            print_bone_hierarchy(bone.children, level + 1)

def main():
    # Blender에서 -- 이후의 인수만 파싱
    if '--' in sys.argv:
        argv = sys.argv[sys.argv.index('--') + 1:]
    else:
        argv = sys.argv[1:]
    
    if len(argv) != 1:
        print("사용법: python debug_glb_bones.py <GLB_파일>")
        print(f"받은 인수: {argv}")
        sys.exit(1)
    
    glb_path = argv[0]
    
    if not os.path.exists(glb_path):
        print(f"ERROR: GLB 파일이 없습니다: {glb_path}")
        sys.exit(1)
    
    debug_glb_bones(glb_path)

if __name__ == "__main__":
    main()
