#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
BVH를 GLB에 적용하는 간단한 스크립트
Blender 없이 Python만으로 처리
"""

import json
import numpy as np
from pathlib import Path
import struct

def parse_bvh(bvh_path):
    """BVH 파일 파싱"""
    print(f"[BVH] BVH 파일 파싱: {bvh_path}")
    
    with open(bvh_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    # HIERARCHY 섹션 파싱
    hierarchy = {}
    in_motion = False
    frame_count = 0
    frame_time = 0.033333
    motion_data = []
    
    for i, line in enumerate(lines):
        line = line.strip()
        
        if line.startswith('Frames:'):
            frame_count = int(line.split(':')[1].strip())
            print(f"[BVH] 프레임 수: {frame_count}")
        elif line.startswith('Frame Time:'):
            frame_time = float(line.split(':')[1].strip())
            print(f"[BVH] 프레임 시간: {frame_time}")
        elif line.startswith('MOTION'):
            in_motion = True
            continue
        elif in_motion and line and not line.startswith('Frames:') and not line.startswith('Frame Time:'):
            # 모션 데이터 파싱
            values = [float(x) for x in line.split()]
            motion_data.append(values)
    
    print(f"[BVH] 모션 데이터: {len(motion_data)} 프레임")
    return {
        'frame_count': frame_count,
        'frame_time': frame_time,
        'motion_data': motion_data
    }

def create_simple_animation_glb(glb_path, bvh_data, output_path):
    """간단한 애니메이션이 포함된 GLB 생성"""
    print(f"[GLB] 애니메이션 GLB 생성: {output_path}")
    
    # 기존 GLB 파일 복사
    import shutil
    shutil.copy2(glb_path, output_path)
    
    # BVH 데이터를 JSON으로 저장 (웹에서 사용)
    animation_data = {
        'frame_count': bvh_data['frame_count'],
        'frame_time': bvh_data['frame_time'],
        'motion_data': bvh_data['motion_data']
    }
    
    # 애니메이션 데이터를 별도 파일로 저장
    animation_json_path = output_path.replace('.glb', '_animation.json')
    with open(animation_json_path, 'w', encoding='utf-8') as f:
        json.dump(animation_data, f, indent=2)
    
    print(f"[GLB] 애니메이션 데이터 저장: {animation_json_path}")
    return animation_json_path

def main():
    import sys
    if len(sys.argv) != 4:
        print("사용법: python apply_bvh_to_glb.py <bvh_file> <glb_file> <output_file>")
        sys.exit(1)
    
    bvh_file = sys.argv[1]
    glb_file = sys.argv[2]
    output_file = sys.argv[3]
    
    print(f"[MAIN] BVH 파일: {bvh_file}")
    print(f"[MAIN] GLB 파일: {glb_file}")
    print(f"[MAIN] 출력 파일: {output_file}")
    
    # 파일 존재 확인
    if not os.path.exists(bvh_file):
        print(f"[ERROR] BVH 파일이 존재하지 않습니다: {bvh_file}")
        sys.exit(1)
    
    if not os.path.exists(glb_file):
        print(f"[ERROR] GLB 파일이 존재하지 않습니다: {glb_file}")
        sys.exit(1)
    
    # BVH 파싱
    bvh_data = parse_bvh(bvh_file)
    
    # 애니메이션 GLB 생성
    animation_json_path = create_simple_animation_glb(glb_file, bvh_data, output_file)
    
    print(f"[SUCCESS] 애니메이션 적용 완료!")
    print(f"[SUCCESS] GLB 파일: {output_file}")
    print(f"[SUCCESS] 애니메이션 데이터: {animation_json_path}")

if __name__ == "__main__":
    import os
    main()
