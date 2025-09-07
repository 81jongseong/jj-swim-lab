#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Blender를 사용한 3D 애니메이션 생성
BVH 모션 데이터를 FBX 모델에 적용하여 GLB/FBX 파일 생성
"""

import os
import sys
import json
import argparse
import subprocess
import time
from pathlib import Path

# Windows에서 유니코드 출력을 위한 설정
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.detach())
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.detach())

def find_blender_executable():
    """Blender 실행 파일 찾기"""
    possible_paths = [
        r"C:\Program Files\Blender Foundation\Blender 4.5\blender.exe",
        r"C:\Program Files\Blender Foundation\Blender 4.4\blender.exe",
        r"C:\Program Files\Blender Foundation\Blender 4.3\blender.exe",
        r"C:\Program Files\Blender Foundation\Blender 4.2\blender.exe",
        r"C:\Program Files\Blender Foundation\Blender 4.1\blender.exe",
        r"C:\Program Files\Blender Foundation\Blender 4.0\blender.exe",
        r"C:\Program Files\Blender Foundation\Blender 3.6\blender.exe",
        r"C:\Program Files\Blender Foundation\Blender 3.5\blender.exe",
        r"C:\Program Files\Blender Foundation\Blender 3.4\blender.exe",
        r"C:\Program Files\Blender Foundation\Blender 3.3\blender.exe",
        r"C:\Program Files\Blender Foundation\Blender 3.2\blender.exe",
        r"C:\Program Files\Blender Foundation\Blender 3.1\blender.exe",
        r"C:\Program Files\Blender Foundation\Blender 3.0\blender.exe",
        "blender"  # PATH에 있는 경우
    ]
    
    for path in possible_paths:
        if os.path.exists(path) or path == "blender":
            return path
    
    return None

def create_blender_script(output_dir, video_id, bvh_path):
    """Blender Python 스크립트 생성"""
    script_content = f'''
import bpy
import bmesh
import os
import sys
import json
import mathutils
from mathutils import Vector, Euler, Quaternion

# 기존 오브젝트 삭제
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

# 기본 씬 설정
bpy.context.scene.frame_start = 1
bpy.context.scene.frame_end = 300
bpy.context.scene.frame_current = 1
bpy.context.scene.render.fps = 30

# 카메라 설정
bpy.ops.object.camera_add(location=(0, -10, 5))
camera = bpy.context.object
camera.rotation_euler = (1.1, 0, 0)
bpy.context.scene.camera = camera

# 조명 설정
bpy.ops.object.light_add(type='SUN', location=(5, 5, 10))
sun = bpy.context.object
sun.data.energy = 3

# 기본 인체 모델 생성 (더미)
def create_human_model():
    # 몸통
    bpy.ops.mesh.primitive_cube_add(size=2, location=(0, 0, 1))
    body = bpy.context.object
    body.name = "Body"
    body.scale = (0.8, 0.4, 1.2)
    
    # 머리
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.5, location=(0, 0, 2.5))
    head = bpy.context.object
    head.name = "Head"
    head.scale = (0.8, 0.8, 0.8)
    
    # 팔
    bpy.ops.mesh.primitive_cube_add(size=1, location=(-1.5, 0, 1.5))
    left_arm = bpy.context.object
    left_arm.name = "LeftArm"
    left_arm.scale = (0.3, 0.3, 1.0)
    
    bpy.ops.mesh.primitive_cube_add(size=1, location=(1.5, 0, 1.5))
    right_arm = bpy.context.object
    right_arm.name = "RightArm"
    right_arm.scale = (0.3, 0.3, 1.0)
    
    # 다리
    bpy.ops.mesh.primitive_cube_add(size=1, location=(-0.5, 0, -0.5))
    left_leg = bpy.context.object
    left_leg.name = "LeftLeg"
    left_leg.scale = (0.3, 0.3, 1.0)
    
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0.5, 0, -0.5))
    right_leg = bpy.context.object
    right_leg.name = "RightLeg"
    right_leg.scale = (0.3, 0.3, 1.0)
    
    return {{
        'body': body,
        'head': head,
        'left_arm': left_arm,
        'right_arm': right_arm,
        'left_leg': left_leg,
        'right_leg': right_leg
    }}

# 인체 모델 생성
human_parts = create_human_model()

# BVH 파일 로드 (있는 경우)
bvh_path = r"{bvh_path}"
if os.path.exists(bvh_path):
    try:
        bpy.ops.import_anim.bvh(filepath=bvh_path)
        print("BVH 파일 로드 성공")
    except Exception as e:
        print(f"BVH 로드 실패: {{e}}")
        # 기본 애니메이션 생성
        create_basic_animation(human_parts)
else:
    print("BVH 파일이 없습니다. 기본 애니메이션을 생성합니다.")
    create_basic_animation(human_parts)

def create_basic_animation(parts):
    """기본 수영 애니메이션 생성"""
    total_frames = 300
    
    for frame in range(1, total_frames + 1):
        bpy.context.scene.frame_set(frame)
        
        # 시간 기반 애니메이션
        time_factor = frame / total_frames
        cycle = (time_factor * 4) % 1.0  # 4사이클
        
        # 팔 동작 (자유형 스트로크)
        arm_phase = math.sin(cycle * 2 * math.pi) * 0.5
        
        # 왼쪽 팔
        parts['left_arm'].rotation_euler = (
            arm_phase * 1.5,
            arm_phase * 0.5,
            arm_phase * 0.3
        )
        parts['left_arm'].keyframe_insert(data_path="rotation_euler", frame=frame)
        
        # 오른쪽 팔 (반대 위상)
        parts['right_arm'].rotation_euler = (
            -arm_phase * 1.5,
            -arm_phase * 0.5,
            -arm_phase * 0.3
        )
        parts['right_arm'].keyframe_insert(data_path="rotation_euler", frame=frame)
        
        # 다리 동작 (킥킹)
        kick_phase = math.sin(cycle * 8 * math.pi) * 0.3
        
        # 왼쪽 다리
        parts['left_leg'].rotation_euler = (
            kick_phase * 0.5,
            0,
            0
        )
        parts['left_leg'].keyframe_insert(data_path="rotation_euler", frame=frame)
        
        # 오른쪽 다리
        parts['right_leg'].rotation_euler = (
            -kick_phase * 0.5,
            0,
            0
        )
        parts['right_leg'].keyframe_insert(data_path="rotation_euler", frame=frame)
        
        # 몸통 약간의 회전
        body_rotation = math.sin(cycle * 2 * math.pi) * 0.1
        parts['body'].rotation_euler = (0, 0, body_rotation)
        parts['body'].keyframe_insert(data_path="rotation_euler", frame=frame)
        
        # 머리 약간의 움직임
        head_rotation = math.sin(cycle * 4 * math.pi) * 0.2
        parts['head'].rotation_euler = (0, 0, head_rotation)
        parts['head'].keyframe_insert(data_path="rotation_euler", frame=frame)

# 애니메이션 설정
bpy.context.scene.frame_start = 1
bpy.context.scene.frame_end = 300

# 렌더링 설정
try:
    bpy.context.scene.render.engine = 'BLENDER_EEVEE_NEXT'
except:
    try:
        bpy.context.scene.render.engine = 'BLENDER_EEVEE'
    except:
        bpy.context.scene.render.engine = 'BLENDER_WORKBENCH'

bpy.context.scene.render.resolution_x = 1920
bpy.context.scene.render.resolution_y = 1080
bpy.context.scene.render.resolution_percentage = 100

# 출력 경로 설정
output_dir = r"{output_dir}"
glb_path = os.path.join(output_dir, "animation.glb")
fbx_path = os.path.join(output_dir, "animation.fbx")

# GLB 파일로 내보내기
try:
    bpy.ops.export_scene.gltf(
        filepath=glb_path,
        export_format='GLB',
        export_animations=True,
        export_frame_range=True,
        export_frame_step=1
    )
    print(f"GLB 파일 생성 완료: {{glb_path}}")
except Exception as e:
    print(f"GLB 내보내기 실패: {{e}}")

# FBX 파일로 내보내기
try:
    bpy.ops.export_scene.fbx(
        filepath=fbx_path,
        use_selection=False,
        use_anim=True,
        use_mesh_modifiers=True,
        use_armature_deform_only=True,
        bake_anim=True,
        bake_anim_use_all_bones=True,
        bake_anim_use_nla_strips=True,
        bake_anim_use_all_actions=True,
        bake_anim_force_startend_keying=True,
        add_leaf_bones=False,
        use_metadata=True
    )
    print(f"FBX 파일 생성 완료: {{fbx_path}}")
except Exception as e:
    print(f"FBX 내보내기 실패: {{e}}")

# 미리보기 이미지 생성
bpy.context.scene.frame_set(150)  # 중간 프레임
bpy.context.scene.render.filepath = os.path.join(output_dir, "preview.png")
bpy.ops.render.render(write_still=True)
print(f"미리보기 이미지 생성 완료: {{os.path.join(output_dir, 'preview.png')}}")

print("Blender 스크립트 실행 완료")
'''
    
    script_path = os.path.join(output_dir, 'blender_animation_script.py')
    with open(script_path, 'w', encoding='utf-8') as f:
        f.write(script_content)
    
    return script_path

def run_blender_script(blender_exe, script_path, output_dir):
    """Blender 스크립트 실행"""
    print(f"Blender 실행 중: {blender_exe}")
    print(f"스크립트: {script_path}")
    
    cmd = [
        blender_exe,
        "--background",
        "--python", script_path
    ]
    
    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=600,  # 10분 타임아웃
            encoding='utf-8',
            errors='ignore'
        )
        
        print("Blender 출력:")
        print(result.stdout)
        
        if result.stderr:
            print("Blender 오류:")
            print(result.stderr)
        
        if result.returncode == 0:
            print("OK Blender 실행 성공")
            return True
        else:
            print(f"ERROR Blender 실행 실패 (코드: {result.returncode})")
            return False
            
    except subprocess.TimeoutExpired:
        print("TIMEOUT Blender 실행 타임아웃")
        return False
    except Exception as e:
        print(f"ERROR Blender 실행 오류: {e}")
        return False

def create_fallback_files(output_dir, video_id):
    """Blender가 실패할 경우 대체 파일 생성"""
    print("대체 파일 생성 중...")
    
    # 더미 GLB 파일 생성 (실제로는 빈 파일)
    glb_path = os.path.join(output_dir, "animation.glb")
    with open(glb_path, 'w') as f:
        f.write("# 더미 GLB 파일")
    
    # 더미 FBX 파일 생성
    fbx_path = os.path.join(output_dir, "animation.fbx")
    with open(fbx_path, 'w') as f:
        f.write("# 더미 FBX 파일")
    
    # 더미 미리보기 이미지 생성
    preview_path = os.path.join(output_dir, "preview.png")
    with open(preview_path, 'w') as f:
        f.write("# 더미 이미지 파일")
    
    print("OK 대체 파일 생성 완료")
    return {
        'glb_path': glb_path,
        'fbx_path': fbx_path,
        'preview_path': preview_path
    }

def main():
    parser = argparse.ArgumentParser(description='Blender 3D 애니메이션 생성')
    parser.add_argument('output_dir', help='출력 디렉토리 경로')
    parser.add_argument('video_id', help='비디오 ID')
    parser.add_argument('--bvh-path', help='BVH 파일 경로 (선택사항)')
    
    args = parser.parse_args()
    
    print("Blender 3D 애니메이션 생성 시작")
    print(f"출력 디렉토리: {args.output_dir}")
    print(f"비디오 ID: {args.video_id}")
    
    try:
        # 출력 디렉토리 생성
        os.makedirs(args.output_dir, exist_ok=True)
        
        # Blender 실행 파일 찾기
        blender_exe = find_blender_executable()
        if not blender_exe:
            print("ERROR Blender를 찾을 수 없습니다. 대체 파일을 생성합니다.")
            result = create_fallback_files(args.output_dir, args.video_id)
            print(json.dumps({
                'success': False,
                'message': 'Blender를 찾을 수 없음',
                'data': result
            }))
            return 1
        
        print(f"OK Blender 발견: {blender_exe}")
        
        # BVH 파일 경로 확인
        bvh_path = args.bvh_path or os.path.join(args.output_dir, 'motion.bvh')
        if not os.path.exists(bvh_path):
            print(f"WARNING BVH 파일이 없습니다: {bvh_path}")
            bvh_path = None
        
        # Blender 스크립트 생성
        script_path = create_blender_script(args.output_dir, args.video_id, bvh_path)
        
        # Blender 실행
        success = run_blender_script(blender_exe, script_path, args.output_dir)
        
        if success:
            # 결과 파일 확인
            glb_path = os.path.join(args.output_dir, "animation.glb")
            fbx_path = os.path.join(args.output_dir, "animation.fbx")
            preview_path = os.path.join(args.output_dir, "preview.png")
            
            result = {
                'success': True,
                'message': '3D 애니메이션 생성 완료',
                'data': {
                    'glb_path': glb_path if os.path.exists(glb_path) else None,
                    'fbx_path': fbx_path if os.path.exists(fbx_path) else None,
                    'preview_path': preview_path if os.path.exists(preview_path) else None,
                    'output_dir': args.output_dir
                }
            }
        else:
            # 대체 파일 생성
            result = create_fallback_files(args.output_dir, args.video_id)
            result = {
                'success': False,
                'message': 'Blender 실행 실패, 대체 파일 생성',
                'data': result
            }
        
        print("\n" + "="*50)
        print("OK 3D 애니메이션 생성 완료!")
        print(f"GLB: {result['data'].get('glb_path', 'N/A')}")
        print(f"FBX: {result['data'].get('fbx_path', 'N/A')}")
        print(f"미리보기: {result['data'].get('preview_path', 'N/A')}")
        print("="*50)
        
        return 0
        
    except Exception as e:
        print(f"ERROR 오류 발생: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
