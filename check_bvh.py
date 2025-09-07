#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
BVH 유효성 검사 스크립트
- BVH 파일의 구조와 데이터 유효성 검증
"""

import argparse
import sys
from pathlib import Path
import re

def parse_bvh_header(bvh_path):
    """BVH 헤더 파싱"""
    print(f"[BVH] 파일 분석: {bvh_path}")
    
    with open(bvh_path, 'r') as f:
        lines = f.readlines()
    
    # 기본 정보
    frames = 0
    frame_time = 0.0
    joints = []
    channels = []
    
    in_motion = False
    current_joint = None
    joint_stack = []
    
    for i, line in enumerate(lines):
        line = line.strip()
        
        if line.startswith('Frames:'):
            frames = int(line.split(':')[1].strip())
            print(f"[BVH] 프레임 수: {frames}")
        
        elif line.startswith('Frame Time:'):
            frame_time = float(line.split(':')[1].strip())
            print(f"[BVH] 프레임 시간: {frame_time}")
        
        elif line.startswith('MOTION'):
            in_motion = True
            print(f"[BVH] 모션 데이터 섹션 시작")
        
        elif not in_motion and line.startswith('ROOT'):
            joint_name = line.split()[1]
            joints.append(joint_name)
            current_joint = joint_name
            joint_stack.append(joint_name)
            print(f"[BVH] 루트 관절: {joint_name}")
        
        elif not in_motion and line.startswith('JOINT'):
            joint_name = line.split()[1]
            joints.append(joint_name)
            current_joint = joint_name
            joint_stack.append(joint_name)
            print(f"[BVH] 관절: {joint_name}")
        
        elif not in_motion and line.startswith('End Site'):
            joint_name = f"{current_joint}_end"
            joints.append(joint_name)
            print(f"[BVH] 엔드 사이트: {joint_name}")
        
        elif not in_motion and line.startswith('CHANNELS'):
            parts = line.split()
            channel_count = int(parts[1])
            channel_types = parts[2:]
            channels.extend(channel_types)
            print(f"[BVH] 채널: {channel_count}개 - {channel_types}")
        
        elif not in_motion and line == '}':
            if joint_stack:
                joint_stack.pop()
                if joint_stack:
                    current_joint = joint_stack[-1]
                else:
                    current_joint = None
    
    return {
        'frames': frames,
        'frame_time': frame_time,
        'joints': joints,
        'channels': channels,
        'duration': frames * frame_time if frames > 0 and frame_time > 0 else 0.0
    }

def validate_bvh_data(bvh_path, header_info):
    """BVH 데이터 유효성 검증"""
    print(f"[BVH] 데이터 유효성 검증 중...")
    
    with open(bvh_path, 'r') as f:
        lines = f.readlines()
    
    # 모션 데이터 섹션 찾기
    motion_start = -1
    for i, line in enumerate(lines):
        if line.strip().startswith('MOTION'):
            motion_start = i
            break
    
    if motion_start == -1:
        print("[ERROR] MOTION 섹션을 찾을 수 없습니다")
        return False
    
    # 데이터 라인 수 확인
    data_lines = lines[motion_start + 3:]  # Frames, Frame Time, 빈 줄 제외
    data_lines = [line.strip() for line in data_lines if line.strip()]
    
    expected_frames = header_info['frames']
    actual_frames = len(data_lines)
    
    print(f"[BVH] 예상 프레임: {expected_frames}, 실제 프레임: {actual_frames}")
    
    if actual_frames != expected_frames:
        print(f"[WARNING] 프레임 수 불일치: 예상 {expected_frames}, 실제 {actual_frames}")
    
    # 첫 번째 프레임 데이터 검증
    if data_lines:
        first_frame = data_lines[0].split()
        expected_channels = len(header_info['channels'])
        actual_channels = len(first_frame)
        
        print(f"[BVH] 예상 채널: {expected_channels}, 실제 채널: {actual_channels}")
        
        if actual_channels != expected_channels:
            print(f"[ERROR] 채널 수 불일치: 예상 {expected_channels}, 실제 {actual_channels}")
            return False
        
        # 숫자 유효성 검증
        try:
            for i, value in enumerate(first_frame[:5]):  # 처음 5개만 검증
                float(value)
        except ValueError:
            print(f"[ERROR] 숫자 형식 오류: {first_frame[:5]}")
            return False
    
    return True

def main():
    parser = argparse.ArgumentParser(description='BVH 유효성 검사 스크립트')
    parser.add_argument('--bvh', required=True, help='BVH 파일 경로')
    
    args = parser.parse_args()
    
    # 절대 경로 변환
    bvh_path = Path(args.bvh).resolve()
    
    if not bvh_path.exists():
        print(f"[ERROR] BVH 파일을 찾을 수 없습니다: {bvh_path}")
        sys.exit(1)
    
    print(f"[BVH] 시작: {bvh_path}")
    
    # 헤더 파싱
    header_info = parse_bvh_header(bvh_path)
    
    # 기본 유효성 검증
    if header_info['frames'] == 0:
        print("[ERROR] 프레임 수가 0입니다")
        sys.exit(1)
    
    if header_info['duration'] == 0:
        print("[ERROR] 지속 시간이 0입니다")
        sys.exit(1)
    
    if not header_info['joints']:
        print("[ERROR] 관절이 없습니다")
        sys.exit(1)
    
    # 데이터 유효성 검증
    if not validate_bvh_data(bvh_path, header_info):
        print("[ERROR] 데이터 유효성 검증 실패")
        sys.exit(1)
    
    # 결과 출력
    print(f"[BVH] 최종 결과:")
    print(f"  - 프레임 수: {header_info['frames']}")
    print(f"  - 프레임 시간: {header_info['frame_time']}")
    print(f"  - 지속 시간: {header_info['duration']:.2f}초")
    print(f"  - 관절 수: {len(header_info['joints'])}")
    print(f"  - 채널 수: {len(header_info['channels'])}")
    
    print("[SUCCESS] BVH 파일 유효성 검증 성공!")
    sys.exit(0)

if __name__ == "__main__":
    main()


