#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
애니메이션 바인딩 수정 스크립트
- BVH 애니메이션을 올바른 Armature에 바인딩
"""

import bpy
import os
import sys
from pathlib import Path

def clear_scene():
    """씬 초기화"""
    print("[BIND FIX] 씬 초기화 중...")
    
    # 모든 오브젝트 선택 및 삭제
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    
    # 모든 데이터 블록 정리
    for collection in bpy.data.collections:
        bpy.data.collections.remove(collection)
    
    print("[BIND FIX] 씬 초기화 완료")

def import_glb(glb_path):
    """GLB 파일 임포트"""
    print(f"[BIND FIX] GLB 임포트: {glb_path}")
    
    if not os.path.exists(glb_path):
        raise FileNotFoundError(f"GLB 파일을 찾을 수 없습니다: {glb_path}")
    
    # GLB 임포트
    bpy.ops.import_scene.gltf(filepath=str(glb_path))
    
    # 임포트된 오브젝트들
    objects = list(bpy.context.scene.objects)
    print(f"[BIND FIX] 임포트된 오브젝트들: {[obj.name for obj in objects]}")
    
    return objects

def find_main_armature():
    """메인 Armature 찾기 (rig)"""
    print("[BIND FIX] 메인 Armature 검색 중...")
    
    armatures = [obj for obj in bpy.context.scene.objects if obj.type == 'ARMATURE']
    print(f"[BIND FIX] Armature 오브젝트들: {[obj.name for obj in armatures]}")
    
    # rig를 우선적으로 찾기
    for armature in armatures:
        if armature.name == 'rig':
            print(f"[BIND FIX] 메인 Armature 선택: {armature.name}")
            return armature
    
    # rig가 없으면 첫 번째 Armature 사용
    if armatures:
        target_armature = armatures[0]
        print(f"[BIND FIX] 대체 Armature 선택: {target_armature.name}")
        return target_armature
    
    raise ValueError("Armature를 찾을 수 없습니다")

def import_bvh(bvh_path):
    """BVH 파일 임포트"""
    print(f"[BIND FIX] BVH 임포트: {bvh_path}")
    
    if not os.path.exists(bvh_path):
        raise FileNotFoundError(f"BVH 파일을 찾을 수 없습니다: {bvh_path}")
    
    # BVH 임포트
    bpy.ops.import_anim.bvh(filepath=str(bvh_path))
    
    # 새로 추가된 액션 찾기
    actions = bpy.data.actions
    if not actions:
        raise ValueError("BVH에서 액션을 찾을 수 없습니다")
    
    # 가장 최근에 추가된 액션 선택
    action = actions[-1]
    print(f"[BIND FIX] 액션 발견: {action.name}")
    
    return action

def bind_animation_to_armature(action, target_armature):
    """애니메이션을 Armature에 바인딩"""
    print(f"[BIND FIX] 애니메이션 바인딩: {action.name} -> {target_armature.name}")
    
    # Armature에 액션 할당
    if target_armature.animation_data is None:
        target_armature.animation_data_create()
    
    target_armature.animation_data.action = action
    print(f"[BIND FIX] 액션 할당 완료: {target_armature.name}")
    
    # 액션 정보 출력
    if action.fcurves:
        print(f"[BIND FIX] 액션 프레임 범위: {action.frame_range}")
        print(f"[BIND FIX] 액션 F-Curve 수: {len(action.fcurves)}")
        
        # 첫 번째 F-Curve 정보
        first_fcurve = action.fcurves[0]
        print(f"[BIND FIX] 첫 번째 F-Curve: {first_fcurve.data_path} - {first_fcurve.array_index}")
        print(f"[BIND FIX] 키프레임 수: {len(first_fcurve.keyframe_points)}")
        
        # 뼈대별 F-Curve 수 확인
        bone_curves = {}
        for fcurve in action.fcurves:
            if fcurve.data_path.startswith('pose.bones['):
                start = fcurve.data_path.find('"') + 1
                end = fcurve.data_path.find('"', start)
                if start > 0 and end > start:
                    bone_name = fcurve.data_path[start:end]
                    bone_curves[bone_name] = bone_curves.get(bone_name, 0) + 1
        
        print(f"[BIND FIX] 뼈대별 F-Curve 수:")
        for bone_name, count in bone_curves.items():
            print(f"  - {bone_name}: {count}개")

def export_glb(output_path, start_frame=1, end_frame=100):
    """GLB 파일로 내보내기 (애니메이션 포함)"""
    print(f"[BIND FIX] GLB 내보내기: {output_path}")
    print(f"[BIND FIX] 프레임 범위: {start_frame} - {end_frame}")
    
    # 프레임 범위 설정
    bpy.context.scene.frame_start = start_frame
    bpy.context.scene.frame_end = end_frame
    
    # GLB 내보내기
    bpy.ops.export_scene.gltf(
        filepath=str(output_path),
        export_format='GLB',
        export_animations=True,
        export_frame_range=True,
        export_frame_step=1,
        export_force_sampling=True,
        export_nla_strips=True,
        export_def_bones=True,
        export_anim_single_armature=True,
        export_reset_pose_bones=True,
        export_current_frame=False,
        export_skins=True,
        export_all_influences=False,
        export_morph=True,
        export_morph_normal=True,
        export_morph_tangent=False,
        export_lights=False,
        export_cameras=False,
        export_extras=False,
        export_yup=True,
        export_apply=True
    )
    
    print(f"[BIND FIX] GLB 내보내기 완료: {output_path}")
    
    # 파일 크기 확인
    file_size = Path(output_path).stat().st_size
    print(f"[BIND FIX] 파일 크기: {file_size / 1024 / 1024:.2f} MB")

def main():
    # Blender에서 -- 이후의 인수만 파싱
    if '--' in sys.argv:
        argv = sys.argv[sys.argv.index('--') + 1:]
    else:
        argv = []
    
    import argparse
    parser = argparse.ArgumentParser(description='애니메이션 바인딩 수정 스크립트')
    parser.add_argument('--glb', required=True, help='입력 GLB 파일 경로')
    parser.add_argument('--bvh', required=True, help='입력 BVH 파일 경로')
    parser.add_argument('--out', required=True, help='출력 GLB 파일 경로')
    parser.add_argument('--start', type=int, default=1, help='시작 프레임')
    parser.add_argument('--end', type=int, default=100, help='종료 프레임')
    
    args = parser.parse_args(argv)
    
    print("[BIND FIX] 애니메이션 바인딩 수정 스크립트 시작")
    print(f"[BIND FIX] GLB: {args.glb}")
    print(f"[BIND FIX] BVH: {args.bvh}")
    print(f"[BIND FIX] 출력: {args.out}")
    
    try:
        # 경로 정규화
        glb_path = Path(args.glb).resolve()
        bvh_path = Path(args.bvh).resolve()
        output_path = Path(args.out).resolve()
        output_dir = output_path.parent
        
        # 출력 디렉토리 생성
        output_dir.mkdir(parents=True, exist_ok=True)
        
        # 1. 씬 초기화
        clear_scene()
        
        # 2. GLB 임포트
        objects = import_glb(glb_path)
        
        # 3. 메인 Armature 찾기
        target_armature = find_main_armature()
        
        # 4. BVH 임포트
        action = import_bvh(bvh_path)
        
        # 5. 애니메이션 바인딩
        bind_animation_to_armature(action, target_armature)
        
        # 6. GLB 내보내기
        export_glb(output_path, args.start, args.end)
        
        print("[BIND FIX] 모든 작업 완료!")
        
    except Exception as e:
        print(f"[BIND FIX] 오류 발생: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()


