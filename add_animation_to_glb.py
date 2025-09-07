#!/usr/bin/env python3
"""
GLB 파일에 기본 애니메이션을 추가하는 Blender 스크립트
"""

import bpy
import bmesh
import os
import sys
from pathlib import Path

def clear_scene():
    """씬 초기화"""
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    
    # 메시 데이터 정리
    for mesh in bpy.data.meshes:
        bpy.data.meshes.remove(mesh)
    
    # 머티리얼 정리
    for material in bpy.data.materials:
        bpy.data.materials.remove(material)
    
    # 텍스처 정리
    for texture in bpy.data.textures:
        bpy.data.textures.remove(texture)

def add_basic_animation():
    """기본 애니메이션 추가"""
    # 모든 오브젝트 선택
    bpy.ops.object.select_all(action='SELECT')
    
    # 키프레임 설정
    frame_start = 1
    frame_end = 120  # 4초 (30fps)
    
    for obj in bpy.context.selected_objects:
        if obj.type == 'ARMATURE':
            # 아마추어에 애니메이션 추가
            bpy.context.view_layer.objects.active = obj
            bpy.ops.object.mode_set(mode='POSE')
            
            # 뼈대들에 기본 애니메이션 추가
            for bone in obj.pose.bones:
                if 'spine' in bone.name.lower() or 'root' in bone.name.lower():
                    # 척추: 부드러운 좌우 흔들림
                    bone.rotation_euler = (0, 0, 0)
                    bone.keyframe_insert(data_path="rotation_euler", frame=frame_start)
                    
                    bone.rotation_euler = (0, 0, 0.1)
                    bone.keyframe_insert(data_path="rotation_euler", frame=frame_start + 30)
                    
                    bone.rotation_euler = (0, 0, -0.1)
                    bone.keyframe_insert(data_path="rotation_euler", frame=frame_start + 60)
                    
                    bone.rotation_euler = (0, 0, 0)
                    bone.keyframe_insert(data_path="rotation_euler", frame=frame_end)
                
                elif 'head' in bone.name.lower():
                    # 머리: 고개 끄덕임
                    bone.rotation_euler = (0, 0, 0)
                    bone.keyframe_insert(data_path="rotation_euler", frame=frame_start)
                    
                    bone.rotation_euler = (0.1, 0, 0)
                    bone.keyframe_insert(data_path="rotation_euler", frame=frame_start + 30)
                    
                    bone.rotation_euler = (-0.1, 0, 0)
                    bone.keyframe_insert(data_path="rotation_euler", frame=frame_start + 60)
                    
                    bone.rotation_euler = (0, 0, 0)
                    bone.keyframe_insert(data_path="rotation_euler", frame=frame_end)
                
                elif 'arm' in bone.name.lower() or 'shoulder' in bone.name.lower():
                    # 팔: 앞뒤 흔들림
                    bone.rotation_euler = (0, 0, 0)
                    bone.keyframe_insert(data_path="rotation_euler", frame=frame_start)
                    
                    bone.rotation_euler = (0.2, 0, 0)
                    bone.keyframe_insert(data_path="rotation_euler", frame=frame_start + 30)
                    
                    bone.rotation_euler = (-0.2, 0, 0)
                    bone.keyframe_insert(data_path="rotation_euler", frame=frame_start + 60)
                    
                    bone.rotation_euler = (0, 0, 0)
                    bone.keyframe_insert(data_path="rotation_euler", frame=frame_end)
                
                elif 'thigh' in bone.name.lower() or 'leg' in bone.name.lower():
                    # 다리: 걷기 모션
                    bone.rotation_euler = (0, 0, 0)
                    bone.keyframe_insert(data_path="rotation_euler", frame=frame_start)
                    
                    bone.rotation_euler = (0.3, 0, 0)
                    bone.keyframe_insert(data_path="rotation_euler", frame=frame_start + 30)
                    
                    bone.rotation_euler = (-0.3, 0, 0)
                    bone.keyframe_insert(data_path="rotation_euler", frame=frame_start + 60)
                    
                    bone.rotation_euler = (0, 0, 0)
                    bone.keyframe_insert(data_path="rotation_euler", frame=frame_end)
            
            bpy.ops.object.mode_set(mode='OBJECT')
    
    # 애니메이션 설정
    bpy.context.scene.frame_start = frame_start
    bpy.context.scene.frame_end = frame_end
    bpy.context.scene.frame_current = frame_start

def main():
    """메인 함수"""
    if len(sys.argv) < 3:
        print("사용법: blender --background --python add_animation_to_glb.py -- <input_glb> <output_glb>")
        sys.exit(1)
    
    input_glb = sys.argv[-2]
    output_glb = sys.argv[-1]
    
    print(f"입력 GLB: {input_glb}")
    print(f"출력 GLB: {output_glb}")
    
    # 씬 초기화
    clear_scene()
    
    # GLB 파일 임포트
    print("GLB 파일 임포트 중...")
    bpy.ops.import_scene.gltf(filepath=input_glb)
    
    # 애니메이션 추가
    print("애니메이션 추가 중...")
    add_basic_animation()
    
    # GLB 파일 내보내기
    print("GLB 파일 내보내기 중...")
    bpy.ops.export_scene.gltf(
        filepath=output_glb,
        export_format='GLB',
        export_animations=True,
        export_frame_range=True,
        export_frame_step=1
    )
    
    print("✅ 애니메이션 추가 완료!")

if __name__ == "__main__":
    main()

