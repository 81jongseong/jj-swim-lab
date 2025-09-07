#!/usr/bin/env python3
"""
BVH 유효성 체크 스크립트
- Frames, Frame Time, Joint 수, Root Channels 확인
- Frames==0 또는 duration==0이면 실패
"""

import argparse
import os
import sys

def parse_bvh_header(file_path):
    """BVH 헤더 파싱"""
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    frame_count = 0
    frame_time = 0.0
    joint_count = 0
    root_channels = []
    
    in_hierarchy = False
    in_motion = False
    
    for i, line in enumerate(lines):
        line = line.strip()
        
        if line.startswith('HIERARCHY'):
            in_hierarchy = True
            continue
        
        if line.startswith('MOTION'):
            in_hierarchy = False
            in_motion = True
            continue
        
        if in_hierarchy:
            if line.startswith('ROOT') or line.startswith('JOINT'):
                joint_count += 1
                
                # ROOT의 CHANNELS 찾기
                if line.startswith('ROOT'):
                    # 다음 몇 줄에서 CHANNELS 찾기
                    for j in range(i+1, min(i+10, len(lines))):
                        if 'CHANNELS' in lines[j]:
                            channels_line = lines[j].strip()
                            parts = channels_line.split()
                            if len(parts) > 1:
                                root_channels = parts[2:]  # CHANNELS 6 Xposition Yposition Zposition Zrotation Xrotation Yrotation
                            break
        
        if in_motion:
            if line.startswith('Frames:'):
                frame_count = int(line.split(':')[1].strip())
            elif line.startswith('Frame Time:'):
                frame_time = float(line.split(':')[1].strip())
    
    duration = frame_count * frame_time if frame_count > 0 and frame_time > 0 else 0
    
    return {
        'frame_count': frame_count,
        'frame_time': frame_time,
        'duration': duration,
        'joint_count': joint_count,
        'root_channels': root_channels
    }

def main():
    parser = argparse.ArgumentParser(description='BVH 유효성 체크')
    parser.add_argument('--bvh', required=True, help='BVH 파일 경로')
    
    args = parser.parse_args()
    
    if not os.path.exists(args.bvh):
        print(f"ERROR: BVH 파일을 찾을 수 없습니다: {args.bvh}")
        return 1
    
    try:
        info = parse_bvh_header(args.bvh)
        
        print(f"[BVH] frames={info['frame_count']}")
        print(f"[BVH] frame_time={info['frame_time']}")
        print(f"[BVH] duration={info['duration']:.3f}")
        print(f"[BVH] joints={info['joint_count']}")
        print(f"[BVH] root_channels={info['root_channels']}")
        
        # 유효성 검사
        if info['frame_count'] == 0:
            print("ERROR: Frames==0")
            return 1
        
        if info['duration'] == 0:
            print("ERROR: duration==0")
            return 1
        
        if info['joint_count'] == 0:
            print("ERROR: joints==0")
            return 1
        
        # Root Channels 확인
        expected_channels = ['Xposition', 'Yposition', 'Zposition', 'Xrotation', 'Yrotation', 'Zrotation']
        if not all(channel in info['root_channels'] for channel in expected_channels):
            print(f"WARNING: Root channels 불완전: {info['root_channels']}")
        
        print("SUCCESS: BVH 파일이 유효합니다")
        return 0
        
    except Exception as e:
        print(f"ERROR: BVH 파싱 실패: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())