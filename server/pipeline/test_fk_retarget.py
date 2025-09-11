#!/usr/bin/env python3
"""
FK 리타겟 스크립트 테스트
"""

import os
import sys

def test_script():
    """스크립트 테스트"""
    script_path = "server/pipeline/blender_fk_retarget.py"
    
    if not os.path.exists(script_path):
        print(f"❌ 스크립트 파일을 찾을 수 없습니다: {script_path}")
        return False
    
    print(f"✅ 스크립트 파일 존재: {script_path}")
    
    # 스크립트 내용 확인
    with open(script_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 주요 기능 확인
    features = [
        "class FKRetargeter",
        "setup_fk_constraints",
        "fix_bvh_axis_scale", 
        "bake_animation",
        "setup_armature_modifier",
        "export_glb",
        "COPY_TRANSFORMS",
        "COPY_ROTATION",
        "QUATERNION",
        "visual_keying=True",
        "clear_constraints=True",
        "export_animations=True",
        "use_deform_preserve_volume"
    ]
    
    missing_features = []
    for feature in features:
        if feature not in content:
            missing_features.append(feature)
    
    if missing_features:
        print(f"❌ 누락된 기능: {missing_features}")
        return False
    
    print("✅ 모든 주요 기능이 포함되어 있습니다")
    
    # 사용법 출력
    print("\n📖 사용법:")
    print("python blender_fk_retarget.py <bvh_file> <target_armature_name> <output_path> [start_frame] [end_frame]")
    print("\n예시:")
    print("python blender_fk_retarget.py input.bvh TargetArmature output.glb 1 100")
    
    return True

if __name__ == "__main__":
    success = test_script()
    if success:
        print("\n🎉 FK 리타겟 스크립트가 성공적으로 생성되었습니다!")
    else:
        print("\n❌ 스크립트에 문제가 있습니다.")
        sys.exit(1)






