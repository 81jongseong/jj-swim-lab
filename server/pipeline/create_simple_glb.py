#!/usr/bin/env python3
"""
간단한 테스트용 GLB 파일 생성 스크립트

이 스크립트는 Blender를 사용하여 간단한 테스트용 GLB 파일을 생성합니다.
복잡한 모델 대신 기본 큐브에 회전 애니메이션을 적용한 GLB를 만듭니다.

주요 기능:
- 기본 큐브 생성 (2x2x2 크기)
- 빨간색 재질 적용
- 360도 회전 애니메이션 (60프레임)
- GLB 형식으로 익스포트

사용법:
    python create_simple_glb.py

출력:
- client/public/simple_test.glb 파일 생성

주의사항:
- Blender가 설치되어 있어야 함
- Blender가 시스템 PATH에 등록되어 있어야 함

@author AI Assistant
@created 2025-01-07
@version 1.0.0
"""

import bpy
import bmesh
import os
import sys

def create_simple_glb():
    """간단한 GLB 파일 생성"""
    
    # 기존 씬 정리
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    
    # 큐브 생성
    bpy.ops.mesh.primitive_cube_add(size=2, location=(0, 0, 1))
    cube = bpy.context.active_object
    cube.name = "TestCube"
    
    # 재질 추가
    material = bpy.data.materials.new(name="TestMaterial")
    material.use_nodes = True
    material.node_tree.nodes["Principled BSDF"].inputs[0].default_value = (1, 0, 0, 1)  # 빨간색
    cube.data.materials.append(material)
    
    # 애니메이션 추가
    cube.animation_data_create()
    cube.animation_data.action = bpy.data.actions.new(name="TestAnimation")
    
    # 키프레임 추가 (회전 애니메이션)
    cube.rotation_euler = (0, 0, 0)
    cube.keyframe_insert(data_path="rotation_euler", frame=1)
    
    cube.rotation_euler = (0, 0, 6.28)  # 360도 회전
    cube.keyframe_insert(data_path="rotation_euler", frame=60)
    
    # GLB로 익스포트
    output_path = "client/public/simple_test.glb"
    bpy.ops.export_scene.gltf(
        filepath=output_path,
        export_format='GLB',
        export_animations=True,
        export_frame_range=True,
        export_frame_step=1
    )
    
    print(f"간단한 GLB 파일 생성 완료: {output_path}")
    return output_path

if __name__ == "__main__":
    try:
        create_simple_glb()
    except Exception as e:
        print(f"오류 발생: {e}")
        sys.exit(1)
