#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
GLB 모델 구조 분석 스크립트
- GLB 모델의 실제 뼈대 구조와 계층 관계 분석
"""

import bpy
import sys
import os

def analyze_glb_structure(glb_path):
    """GLB 모델의 뼈대 구조 분석"""
    print(f"[GLB ANALYZE] GLB 구조 분석: {glb_path}")
    
    # 씬 초기화
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    
    # GLB 임포트
    bpy.ops.import_scene.gltf(filepath=glb_path)
    
    print(f"[GLB ANALYZE] 임포트된 오브젝트들:")
    for obj in bpy.context.scene.objects:
        print(f"  - {obj.name} (타입: {obj.type})")
    
    # Armature 찾기
    armatures = [obj for obj in bpy.context.scene.objects if obj.type == 'ARMATURE']
    if not armatures:
        print("[GLB ANALYZE] ❌ Armature를 찾을 수 없습니다!")
        return False
    
    armature = armatures[0]
    print(f"[GLB ANALYZE] 메인 Armature: {armature.name}")
    
    # 뼈대 구조 분석
    print(f"[GLB ANALYZE] 뼈대 구조 분석:")
    print(f"  - 총 뼈대 수: {len(armature.data.bones)}")
    
    # 뼈대 계층 구조 출력
    def print_bone_hierarchy(bone, level=0):
        indent = "  " * level
        print(f"{indent}- {bone.name}")
        for child in bone.children:
            print_bone_hierarchy(child, level + 1)
    
    # 루트 뼈대들 찾기
    root_bones = [bone for bone in armature.data.bones if bone.parent is None]
    print(f"[GLB ANALYZE] 루트 뼈대들:")
    for root_bone in root_bones:
        print_bone_hierarchy(root_bone)
    
    # 주요 뼈대들 식별
    print(f"[GLB ANALYZE] 주요 뼈대들:")
    important_bones = []
    for bone in armature.data.bones:
        if any(keyword in bone.name.lower() for keyword in ['root', 'spine', 'head', 'shoulder', 'arm', 'leg', 'thigh']):
            important_bones.append(bone.name)
            print(f"  - {bone.name}")
    
    # 뼈대별 길이와 방향 분석
    print(f"[GLB ANALYZE] 뼈대별 길이 분석:")
    for bone in armature.data.bones:
        if bone.name in important_bones:
            head = bone.head
            tail = bone.tail
            length = (head - tail).length
            direction = (tail - head).normalized()
            print(f"  - {bone.name}: 길이={length:.3f}, 방향={direction}")
    
    return True

def main():
    # Blender에서 실행될 때는 sys.argv가 다름
    if len(sys.argv) < 2:
        print("사용법: blender --background --python analyze_glb_structure.py -- <GLB_파일>")
        sys.exit(1)
    
    # Blender에서 실행될 때는 -- 이후의 인수들을 사용
    glb_path = sys.argv[-1]
    
    if not os.path.exists(glb_path):
        print(f"[GLB ANALYZE] ❌ 파일을 찾을 수 없습니다: {glb_path}")
        sys.exit(1)
    
    success = analyze_glb_structure(glb_path)
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
