#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
BVH 파일 형식 수정 스크립트
- Blender 호환 BVH 형식으로 변환
"""

import os
import sys
import math

def fix_bvh_format(input_bvh, output_bvh):
    """BVH 파일 형식을 Blender 호환 형식으로 수정"""
    print(f"[BVH FIX] BVH 파일 수정: {input_bvh}")
    
    with open(input_bvh, 'r') as f:
        lines = f.readlines()
    
    # MOTION 섹션 찾기
    motion_start = -1
    for i, line in enumerate(lines):
        if line.strip() == "MOTION":
            motion_start = i
            break
    
    if motion_start == -1:
        print("[BVH FIX] ERROR: MOTION 섹션을 찾을 수 없습니다")
        return False
    
    print(f"[BVH FIX] MOTION 섹션 시작: 라인 {motion_start + 1}")
    
    # 프레임 정보 읽기
    frames_line = lines[motion_start + 1].strip()
    frame_time_line = lines[motion_start + 2].strip()
    
    print(f"[BVH FIX] 프레임 정보: {frames_line}")
    print(f"[BVH FIX] 프레임 시간: {frame_time_line}")
    
    # 프레임 수 추출
    frame_count = int(frames_line.split(':')[1].strip())
    print(f"[BVH FIX] 프레임 수: {frame_count}")
    
    # 첫 번째 프레임 데이터 확인 (빈 줄 건너뛰기)
    first_frame_idx = motion_start + 3
    while first_frame_idx < len(lines) and not lines[first_frame_idx].strip():
        first_frame_idx += 1
    
    if first_frame_idx >= len(lines):
        print("[BVH FIX] ERROR: 프레임 데이터를 찾을 수 없습니다")
        return False
    
    first_frame_line = lines[first_frame_idx].strip()
    first_frame_values = first_frame_line.split()
    print(f"[BVH FIX] 첫 번째 프레임 값 수: {len(first_frame_values)}")
    print(f"[BVH FIX] 첫 번째 프레임 샘플: {first_frame_values[:10]}...")
    
    # 표준 BVH 형식으로 수정
    new_lines = []
    
    # HIERARCHY 섹션 복사 (MOTION 이전까지)
    for i in range(motion_start):
        new_lines.append(lines[i])
    
    # MOTION 섹션 헤더
    new_lines.append("MOTION\n")
    new_lines.append(f"Frames: {frame_count}\n")
    new_lines.append("Frame Time: 0.033333\n")
    new_lines.append("\n")
    
    # 프레임 데이터 수정
    frame_data_start = first_frame_idx
    for i in range(frame_count):
        frame_line_idx = frame_data_start + i
        if frame_line_idx >= len(lines):
            print(f"[BVH FIX] WARNING: 프레임 {i} 데이터가 없습니다")
            break
            
        frame_line = lines[frame_line_idx].strip()
        if not frame_line:
            print(f"[BVH FIX] WARNING: 프레임 {i}이 비어있습니다")
            continue
            
        values = frame_line.split()
        
        # 표준 BVH 형식: Hips(6) + 14개 관절(각 3개) = 48개 값
        if len(values) >= 48:
            # 처음 48개 값만 사용
            fixed_values = values[:48]
        else:
            # 부족한 값은 0으로 채움
            fixed_values = values[:]
            while len(fixed_values) < 48:
                fixed_values.append("0.000000")
        
        new_lines.append(" ".join(fixed_values) + "\n")
    
    # 수정된 BVH 파일 저장
    with open(output_bvh, 'w') as f:
        f.writelines(new_lines)
    
    print(f"[BVH FIX] 수정된 BVH 파일 저장: {output_bvh}")
    
    # 파일 크기 확인
    file_size = os.path.getsize(output_bvh)
    print(f"[BVH FIX] 파일 크기: {file_size / 1024:.2f} KB")
    
    return True

def main():
    if len(sys.argv) != 3:
        print("사용법: python fix_bvh_format.py <입력_BVH> <출력_BVH>")
        sys.exit(1)
    
    input_bvh = sys.argv[1]
    output_bvh = sys.argv[2]
    
    if not os.path.exists(input_bvh):
        print(f"ERROR: 입력 BVH 파일이 없습니다: {input_bvh}")
        sys.exit(1)
    
    success = fix_bvh_format(input_bvh, output_bvh)
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
