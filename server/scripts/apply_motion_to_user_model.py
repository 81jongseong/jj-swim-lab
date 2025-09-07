# -*- coding: utf-8 -*-
"""
사용자 모델에 모션 데이터를 적용하는 Blender 스크립트
"""

import os
import sys
import argparse
import subprocess
import tempfile

def create_blender_script_with_user_model(output_dir, video_id, user_model_path, bvh_path):
    """사용자 모델을 위한 Blender 스크립트 생성"""
    
    script_content = f'''# -*- coding: utf-8 -*-
import bpy
import os
import math

def create_default_model():
    """기본 인체 모델 생성"""
    print("기본 모델 생성 중...")
    
    # 기본 큐브 생성
    bpy.ops.mesh.primitive_cube_add(size=2, location=(0, 0, 1))
    default_cube = bpy.context.active_object
    default_cube.name = "DefaultBody"
    
    # 큐브를 인체 모양으로 변형
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.transform.resize(value=(0.5, 0.3, 1.0))
    bpy.ops.object.mode_set(mode='OBJECT')
    
    print("기본 모델 생성 완료.")

def create_basic_animation():
    """기본 애니메이션 생성 (BVH 로드 실패 시)"""
    print("기본 애니메이션 생성 중...")
    
    # 모든 메시 오브젝트에 기본 애니메이션 적용
    for obj in bpy.context.scene.objects:
        if obj.type == 'MESH':
            # 기본 회전 애니메이션
            obj.rotation_euler = (0, 0, 0)
            obj.keyframe_insert(data_path="rotation_euler", frame=1)
            
            obj.rotation_euler = (0, 0, math.radians(360))
            obj.keyframe_insert(data_path="rotation_euler", frame=100)
            
            print("기본 애니메이션 적용: " + obj.name)

def apply_animation_to_user_model():
    """사용자 모델에 애니메이션 적용"""
    print("사용자 모델에 애니메이션 적용 시작...")
    
    # 모든 오브젝트 중에서 사용자 모델 찾기
    user_objects = [obj for obj in bpy.context.scene.objects if obj.type == 'MESH']
    
    if not user_objects:
        print("사용자 모델을 찾을 수 없습니다.")
        return
    
    # 첫 번째 메시 오브젝트를 사용자 모델로 간주
    user_model = user_objects[0]
    print("사용자 모델 선택: " + user_model.name)
    
    # BVH에서 로드된 Armature 찾기
    armature_objects = [obj for obj in bpy.context.scene.objects if obj.type == 'ARMATURE']
    
    if armature_objects:
        armature = armature_objects[0]
        print("BVH Armature 발견: " + armature.name)
        
        # 사용자 모델에 Armature Modifier 추가
        if not any(mod.type == 'ARMATURE' for mod in user_model.modifiers):
            armature_modifier = user_model.modifiers.new(name="Armature", type='ARMATURE')
            armature_modifier.object = armature
            print("Armature Modifier 추가 완료")
        
        # 사용자 모델을 Armature의 자식으로 설정
        user_model.parent = armature
        user_model.parent_type = 'ARMATURE'
        print("사용자 모델을 Armature에 연결 완료")
        
        # 애니메이션 데이터 확인
        if armature.animation_data and armature.animation_data.action:
            action = armature.animation_data.action
            print("애니메이션 액션 발견: " + action.name)
            print("프레임 범위: " + str(action.frame_range[0]) + " - " + str(action.frame_range[1]))
        else:
            print("Armature에 애니메이션 데이터가 없습니다.")
    else:
        print("BVH Armature를 찾을 수 없습니다.")
        create_basic_animation()

def setup_scene():
    """씬 설정"""
    print("씬 설정 중...")
    
    # 모든 오브젝트 삭제
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    
    # 카메라와 라이트 추가
    bpy.ops.object.camera_add(location=(5, -5, 5))
    bpy.ops.object.light_add(type='SUN', location=(0, 0, 10))
    
    print("씬 설정 완료.")

def export_model(output_dir, video_id):
    """모델 내보내기"""
    print("모델 내보내기 중...")
    
    glb_path = os.path.join(output_dir, video_id + "_animated.glb")
    fbx_path = os.path.join(output_dir, video_id + "_animated.fbx")
    preview_path = os.path.join(output_dir, video_id + "_preview.png")
    
    try:
        # GLB 내보내기
        bpy.ops.export_scene.gltf(
            filepath=glb_path,
            export_format='GLB',
            use_selection=False,
            export_animations=True,
            export_frame_range=True,
            export_frame_step=1
        )
        print("GLB 내보내기 완료: " + glb_path)
    except Exception as e:
        print("GLB 내보내기 실패: " + str(e))
        glb_path = None
    
    try:
        # FBX 내보내기
        bpy.ops.export_scene.fbx(
            filepath=fbx_path,
            use_selection=False,
            add_leaf_bones=False,
            use_armature_deform_only=True,
            bake_anim=True,
            bake_anim_use_all_bones=True,
            bake_anim_use_nla_strips=True,
            bake_anim_use_all_actions=True
        )
        print("FBX 내보내기 완료: " + fbx_path)
    except Exception as e:
        print("FBX 내보내기 실패: " + str(e))
        fbx_path = None
    
    try:
        # 미리보기 이미지 렌더링
        bpy.context.scene.render.filepath = preview_path
        bpy.context.scene.render.image_settings.file_format = 'PNG'
        bpy.ops.render.render(write_still=True)
        print("미리보기 이미지 생성 완료: " + preview_path)
    except Exception as e:
        print("미리보기 이미지 생성 실패: " + str(e))
        preview_path = None
    
    return glb_path, fbx_path, preview_path

# 메인 실행
try:
    # 사용자 모델 로드
    user_model_path = r"{user_model_path}"
    user_model = None

    print("사용자 모델 로드 중: " + user_model_path)

    # 파일 확장자에 따라 적절한 임포터 사용
    file_ext = os.path.splitext(user_model_path)[1].lower()

    if file_ext == '.fbx':
        bpy.ops.import_scene.fbx(filepath=user_model_path)
        print("FBX 파일 로드됨")
    elif file_ext in ['.obj', '.glb', '.gltf']:
        bpy.ops.import_scene.gltf(filepath=user_model_path)
        print("GLB/GLTF 파일 로드됨")
    elif file_ext == '.blend':
        print("DEBUG .blend 파일 로드 시도: " + user_model_path)
        print("DEBUG 파일 존재 여부: " + str(os.path.exists(user_model_path)))
        
        # .blend 파일에서 오브젝트만 추가 (씬 교체 방지)
        available_objects = []
        objects_to_load = []
        loaded_objects = []
        
        with bpy.data.libraries.load(user_model_path) as (data_from, data_to):
            available_objects = list(data_from.objects)
            print("DEBUG 사용 가능한 오브젝트들: " + str(available_objects))
            data_to.objects = [name for name in data_from.objects if name not in bpy.data.objects]
            objects_to_load = list(data_to.objects)
            print("DEBUG 로드할 오브젝트들: " + str(objects_to_load))
        
        # 로드된 오브젝트들을 씬에 추가
        for obj in data_to.objects:
            if obj is not None:
                bpy.context.collection.objects.link(obj)
                loaded_objects.append(obj.name)
                print("DEBUG 오브젝트 로드됨: " + obj.name)
        
        print("DEBUG 총 로드된 오브젝트 수: " + str(len(loaded_objects)))
        print("DEBUG 로드된 오브젝트 목록: " + str(loaded_objects))
        print("Blend 파일 로드됨")
    elif file_ext == '.bvh':
        # BVH는 모션 데이터이므로 별도 처리
        bpy.ops.import_anim.bvh(filepath=user_model_path)
        print("BVH 모션 데이터 로드됨")
    else:
        print("지원되지 않는 파일 형식: " + file_ext)
        # 기본 모델 생성
        create_default_model()

            # 사용자 모델 변수 설정 - 실제 사용자 업로드 모델 선택
        print("DEBUG 씬의 모든 오브젝트들:")
        for obj in bpy.context.scene.objects:
            print("  - " + obj.name + " (타입: " + obj.type + ")")

        # 1. 먼저 Armature 타입 오브젝트 찾기
        armatures = [obj for obj in bpy.context.scene.objects if obj.type == 'ARMATURE']
        print("DEBUG Armature 오브젝트들: " + str([obj.name for obj in armatures]))

        user_model = None
        if armatures:
            # 첫 번째 Armature 선택
            user_model = armatures[0]
            print("SUCCESS 사용자 모델 선택 (Armature): " + user_model.name)
        else:
            # 2. 리깅된 메인 모델 찾기 (CC_Base_Body 우선)
            user_objects = [obj for obj in bpy.context.scene.objects if obj.type == 'MESH']
            print("DEBUG 메시 오브젝트들: " + str([obj.name for obj in user_objects]))

            # 리깅된 메인 모델 우선순위
            rigged_models = ['CC_Base_Body', 'Female_Angled', 'swimGoggles', 'swimmingSuit.007']
            user_uploaded_objects = []
            
            for obj in user_objects:
                # 유니코드 정규화
                normalized_name = unicodedata.normalize('NFC', obj.name)
                print(f"DEBUG 오브젝트: '{obj.name}' -> 정규화: '{normalized_name}'")
                
                # 리깅된 모델 우선 선택
                if normalized_name in rigged_models:
                    user_uploaded_objects.append(obj)
                    print(f"DEBUG 리깅된 모델 발견: {obj.name}")
            
            print("DEBUG 사용자 업로드 모델들: " + str([obj.name for obj in user_uploaded_objects]))
            
            # 리깅된 모델이 있으면 우선 선택
            if user_uploaded_objects:
                # CC_Base_Body가 있으면 우선 선택
                cc_base_body = [obj for obj in user_uploaded_objects if obj.name == 'CC_Base_Body']
                if cc_base_body:
                    user_model = cc_base_body[0]
                    print("SUCCESS 사용자 모델 선택 (CC_Base_Body): " + user_model.name)
                else:
                    # CC_Base_Body가 없으면 가장 큰 메시 선택
                    user_model = max(user_uploaded_objects, key=lambda obj: len(obj.data.vertices) if obj.data else 0)
                    print("SUCCESS 사용자 모델 선택 (리깅된 모델): " + user_model.name)
            else:
                # 리깅된 모델이 없으면 기본 모델 생성
                print("WARNING 리깅된 모델이 없습니다. 기본 모델을 생성합니다.")
                create_default_model()
                user_model = bpy.context.active_object
                print("WARNING 기본 모델 생성: " + user_model.name)
    
    if user_model:
        print("DEBUG 사용자 모델 상세 정보:")
        print("  - 위치: " + str(user_model.location))
        print("  - 회전: " + str(user_model.rotation_euler))
        print("  - 크기: " + str(user_model.scale))
        if user_model.data:
            print("  - 버텍스 수: " + str(len(user_model.data.vertices)))
        print("  - 타입: " + user_model.type)

    # BVH 파일 로드 및 애니메이션 적용
    bvh_path = r"{bvh_path}"
    print("DEBUG BVH 파일 경로: " + bvh_path)
    print("DEBUG BVH 파일 존재 여부: " + str(os.path.exists(bvh_path)))
    
    if os.path.exists(bvh_path):
        try:
            print("DEBUG BVH 파일 로드 중: " + bvh_path)
            bpy.ops.import_anim.bvh(filepath=bvh_path)
            print("SUCCESS BVH 파일 로드 성공")
            
            # 잠시 대기하여 로드 완료 보장
            bpy.context.view_layer.update()
            
            # 로드된 Armature 확인
            armature_objects = [obj for obj in bpy.context.scene.objects if obj.type == 'ARMATURE']
            print("DEBUG 로드된 Armature들: " + str([obj.name for obj in armature_objects]))
            
            # 애니메이션을 사용자 모델에 적용
            print("DEBUG 애니메이션 적용 시작...")
            apply_animation_to_user_model()
            print("SUCCESS 애니메이션 적용 완료")
            
        except Exception as e:
            print("ERROR BVH 로드 실패: " + str(e))
            print("WARNING 기본 애니메이션으로 대체합니다.")
            create_basic_animation()
    else:
        print("ERROR BVH 파일이 없습니다: " + bvh_path)
        print("WARNING 기본 애니메이션으로 대체합니다.")
        create_basic_animation()

except Exception as e:
    print("오류 발생: " + str(e))
    create_basic_animation()

# 렌더링 설정
bpy.context.scene.render.engine = 'BLENDER_EEVEE_NEXT'
if bpy.context.scene.render.engine not in ['BLENDER_EEVEE_NEXT', 'BLENDER_EEVEE', 'BLENDER_WORKBENCH']:
    bpy.context.scene.render.engine = 'BLENDER_WORKBENCH'

# 모델 내보내기
glb_path, fbx_path, preview_path = export_model(r"{output_dir}", "{video_id}")

print("=" * 50)
print("OK 사용자 모델 애니메이션 생성 완료!")
print("GLB: " + str(glb_path))
print("FBX: " + str(fbx_path))
print("미리보기: " + str(preview_path))
print("=" * 50)
'''
    
    return script_content

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
    ]
    
    for path in possible_paths:
        if os.path.exists(path):
            return path
    
    return None

def main():
    """메인 함수"""
    parser = argparse.ArgumentParser(description='사용자 모델에 모션 데이터 적용')
    parser.add_argument('output_dir', help='출력 디렉토리')
    parser.add_argument('video_id', help='비디오 ID')
    parser.add_argument('--user-model', help='사용자 모델 파일 경로')
    
    args = parser.parse_args()
    
    print("사용자 모델 애니메이션 생성 시작")
    print("출력 디렉토리: " + args.output_dir)
    print("비디오 ID: " + args.video_id)
    print("사용자 모델: " + args.user_model)
    
    # Blender 실행 파일 찾기
    blender_path = find_blender_executable()
    if not blender_path:
        print("ERROR Blender를 찾을 수 없습니다.")
        return 1
    
    print("OK Blender 발견: " + blender_path)
    
    # BVH 파일 경로
    bvh_path = os.path.join(args.output_dir, "motion.bvh")
    
    # Blender 스크립트 생성
    script_content = create_blender_script_with_user_model(
        args.output_dir, 
        args.video_id, 
        args.user_model, 
        bvh_path
    )
    
    # 임시 스크립트 파일 생성
    script_path = os.path.join(args.output_dir, f"{args.video_id}_blender_script.py")
    with open(script_path, 'w', encoding='utf-8') as f:
        f.write(script_content)
    
    print("스크립트 생성 완료: " + script_path)
    
    # Blender 실행
    try:
        print("Blender 실행 중...")
        result = subprocess.run([
            blender_path,
            "--background",
            "--python", script_path
        ], capture_output=True, text=True, encoding='utf-8', timeout=300)
        
        print("Blender 출력:")
        print(result.stdout)
        
        if result.stderr:
            print("Blender 오류:")
            print(result.stderr)
        
        if result.returncode != 0:
            print(f"Blender 실행 실패 (코드: {result.returncode})")
            return 1
        
        print("OK Blender 실행 성공")
        
    except subprocess.TimeoutExpired:
        print("ERROR Blender 실행 시간 초과")
        return 1
    except Exception as e:
        print("ERROR Blender 실행 오류: " + str(e))
        return 1
    
    print("=" * 50)
    print("OK 사용자 모델 애니메이션 생성 완료!")
    print("=" * 50)
    
    return 0

if __name__ == "__main__":
    sys.exit(main())