#!/usr/bin/env python3
"""
자동 리타겟 스크립트
- FBX와 BVH를 자동으로 매칭
- 본 매핑 결과 출력
- 매칭률 계산
"""

import bpy
import json
import os
import sys
import argparse
from pathlib import Path

def clear_scene():
    """씬 초기화"""
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)

def load_fbx(fbx_path):
    """FBX 로드"""
    bpy.ops.import_scene.fbx(
        filepath=fbx_path,
        use_anim=False,
        use_custom_normals=True,
        use_image_search=True,
        use_alpha_decals=False,
        decal_offset=0.0,
        use_anim_action_all=True,
        use_default_take=True,
        use_armature_deform_only=False,
        use_anim_optimize=True,
        anim_optimize_precision=6,
        use_custom_props=True,
        use_custom_props_enum_as_string=True,
        ignore_leaf_bones=False,
        force_connect_children=False,
        automatic_bone_orientation=True,
        primary_bone_axis='Y',
        secondary_bone_axis='X',
        use_prepost_rot=True
    )
    
    # 아마추어 찾기
    user_armature = None
    for obj in bpy.context.scene.objects:
        if obj.type == 'ARMATURE':
            user_armature = obj
            break
    
    if not user_armature:
        raise ValueError("FBX에서 아마추어를 찾을 수 없습니다")
    
    return user_armature

def load_bvh(bvh_path, axis_forward='-Z', axis_up='Y', global_scale=1.0):
    """BVH 로드"""
    bpy.ops.import_anim.bvh(
        filepath=bvh_path,
        axis_forward=axis_forward,
        axis_up=axis_up,
        global_scale=global_scale,
        frame_start=1,
        use_fps_scale=False,
        update_scene_fps=True,
        update_scene_duration=True
    )
    
    # BVH 아마추어 찾기
    bvh_armature = None
    for obj in bpy.context.scene.objects:
        if obj.type == 'ARMATURE' and obj != bpy.context.scene.objects[0]:
            bvh_armature = obj
            break
    
    if not bvh_armature:
        raise ValueError("BVH에서 아마추어를 찾을 수 없습니다")
    
    return bvh_armature

def load_bone_mappings():
    """본 매핑 로드"""
    base_mapping = {}
    overrides = {}
    
    # 기본 매핑 로드
    base_path = Path(__file__).parent / "name_maps" / "mixamo_base.json"
    if base_path.exists():
        with open(base_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            base_mapping = data.get('mappings', {})
    
    # 오버라이드 로드
    override_path = Path(__file__).parent / "name_maps" / "overrides.json"
    if override_path.exists():
        with open(override_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            overrides = data.get('mappings', {})
    
    # 오버라이드가 우선
    final_mapping = {**base_mapping, **overrides}
    return final_mapping

def fuzzy_bone_match(bone_name, target_bones, threshold=0.8):
    """퍼지 본 매칭"""
    bone_name_clean = bone_name.lower().replace('_', '').replace(' ', '')
    
    best_match = None
    best_score = 0
    
    for target in target_bones:
        target_clean = target.lower().replace('_', '').replace(' ', '')
        
        # 시작 문자열 매칭
        if target_clean.startswith(bone_name_clean) or bone_name_clean.startswith(target_clean):
            score = 0.9
        else:
            # 간단한 유사도 계산
            common_chars = sum(1 for c in bone_name_clean if c in target_clean)
            score = common_chars / max(len(bone_name_clean), len(target_clean))
        
        if score > best_score and score >= threshold:
            best_score = score
            best_match = target
    
    return best_match

def create_bone_mapping(user_armature, bvh_armature):
    """자동 본 매핑 생성"""
    print("[MAP] 본 매핑 생성 중...")
    
    # 매핑 로드
    bone_mappings = load_bone_mappings()
    
    # 사용자 뼈대 이름 목록
    user_bone_names = [bone.name for bone in user_armature.data.bones]
    bvh_bone_names = [bone.name for bone in bvh_armature.data.bones]
    
    bone_map = {}
    matched_count = 0
    unmapped = []
    
    # 1차: 정확한 매핑
    for bvh_bone_name in bvh_bone_names:
        if bvh_bone_name in bone_mappings:
            target_name = bone_mappings[bvh_bone_name]
            if target_name in user_bone_names:
                bone_map[bvh_bone_name] = target_name
                matched_count += 1
                print(f"[MAP] 정확 매칭: {bvh_bone_name} -> {target_name}")
    
    # 2차: 퍼지 매칭
    for bvh_bone_name in bvh_bone_names:
        if bvh_bone_name not in bone_map:
            fuzzy_match = fuzzy_bone_match(bvh_bone_name, user_bone_names)
            if fuzzy_match:
                bone_map[bvh_bone_name] = fuzzy_match
                matched_count += 1
                print(f"[MAP] 퍼지 매칭: {bvh_bone_name} -> {fuzzy_match}")
            else:
                unmapped.append(bvh_bone_name)
    
    match_ratio = matched_count / len(bvh_bone_names) * 100
    print(f"[MAP] matched={matched_count}/{len(bvh_bone_names)} ({match_ratio:.1f}%)")
    
    if match_ratio < 70:
        print(f"[MAP] 경고: 매칭률이 낮습니다. unmapped={unmapped}")
    
    return bone_map, matched_count, unmapped

def main():
    parser = argparse.ArgumentParser(description='자동 리타겟 테스트')
    parser.add_argument('--fbx', required=True, help='FBX 파일 경로')
    parser.add_argument('--bvh', required=True, help='BVH 파일 경로')
    parser.add_argument('--out_json', required=True, help='출력 JSON 파일 경로')
    
    args = parser.parse_args()
    
    try:
        # 경로 검증
        if not os.path.exists(args.fbx):
            raise FileNotFoundError(f"FBX 파일을 찾을 수 없습니다: {args.fbx}")
        if not os.path.exists(args.bvh):
            raise FileNotFoundError(f"BVH 파일을 찾을 수 없습니다: {args.bvh}")
        
        # 씬 초기화
        clear_scene()
        
        # 파일 로드
        user_armature = load_fbx(args.fbx)
        bvh_armature = load_bvh(args.bvh)
        
        # 본 매핑 생성
        bone_map, matched_count, unmapped = create_bone_mapping(user_armature, bvh_armature)
        
        # 결과 저장
        result = {
            "bone_mapping": bone_map,
            "matched_count": matched_count,
            "total_bvh_bones": len(bvh_armature.data.bones),
            "total_user_bones": len(user_armature.data.bones),
            "match_ratio": matched_count / len(bvh_armature.data.bones) * 100,
            "unmapped_bones": unmapped
        }
        
        with open(args.out_json, 'w', encoding='utf-8') as f:
            json.dump(result, f, indent=2, ensure_ascii=False)
        
        print(f"[SUCCESS] 리타겟 테스트 완료: {args.out_json}")
        print(f"[SUCCESS] 매칭된 본: {matched_count}개")
        
        return 0
        
    except Exception as e:
        print(f"[ERROR] {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
