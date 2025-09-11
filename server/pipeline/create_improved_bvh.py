#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
개선된 BVH 파일 생성 스크립트
완전한 인체 구조와 더 현실적인 애니메이션 데이터 생성
"""

import os
import sys
import json
import numpy as np
from pathlib import Path

def create_improved_bvh(poses_3d, fps, frame_count, output_path):
    """개선된 BVH 파일 생성"""
    print(f"[BVH] 개선된 BVH 파일 생성 시작: {output_path}")
    
    # BVH 헤더 (완전한 인체 구조)
    bvh_content = f"""HIERARCHY
ROOT Hips
{{
\tOFFSET 0.0 0.0 0.0
\tCHANNELS 6 Xposition Yposition Zposition Zrotation Xrotation Yrotation
\tJOINT Spine
\t{{
\t\tOFFSET 0.0 5.0 0.0
\t\tCHANNELS 3 Zrotation Xrotation Yrotation
\t\tJOINT Chest
\t\t{{
\t\t\tOFFSET 0.0 5.0 0.0
\t\t\tCHANNELS 3 Zrotation Xrotation Yrotation
\t\t\tJOINT Neck
\t\t\t{{
\t\t\t\tOFFSET 0.0 8.0 0.0
\t\t\t\tCHANNELS 3 Zrotation Xrotation Yrotation
\t\t\t\tJOINT Head
\t\t\t\t{{
\t\t\t\t\tOFFSET 0.0 5.0 0.0
\t\t\t\t\tCHANNELS 3 Zrotation Xrotation Yrotation
\t\t\t\t\tEnd Site
\t\t\t\t\t{{
\t\t\t\t\t\tOFFSET 0.0 3.0 0.0
\t\t\t\t\t}}
\t\t\t\t}}
\t\t\t}}
\t\t\tJOINT LeftShoulder
\t\t\t{{
\t\t\t\tOFFSET -5.0 0.0 0.0
\t\t\t\tCHANNELS 3 Zrotation Xrotation Yrotation
\t\t\t\tJOINT LeftArm
\t\t\t\t{{
\t\t\t\t\tOFFSET 0.0 -10.0 0.0
\t\t\t\t\tCHANNELS 3 Zrotation Xrotation Yrotation
\t\t\t\t\tJOINT LeftForeArm
\t\t\t\t\t{{
\t\t\t\t\t\tOFFSET 0.0 -10.0 0.0
\t\t\t\t\t\tCHANNELS 3 Zrotation Xrotation Yrotation
\t\t\t\t\t\tEnd Site
\t\t\t\t\t\t{{
\t\t\t\t\t\t\tOFFSET 0.0 -3.0 0.0
\t\t\t\t\t\t}}
\t\t\t\t\t}}
\t\t\t\t}}
\t\t\t}}
\t\t\tJOINT RightShoulder
\t\t\t{{
\t\t\t\tOFFSET 5.0 0.0 0.0
\t\t\t\tCHANNELS 3 Zrotation Xrotation Yrotation
\t\t\t\tJOINT RightArm
\t\t\t\t{{
\t\t\t\t\tOFFSET 0.0 -10.0 0.0
\t\t\t\t\tCHANNELS 3 Zrotation Xrotation Yrotation
\t\t\t\t\tJOINT RightForeArm
\t\t\t\t\t{{
\t\t\t\t\t\tOFFSET 0.0 -10.0 0.0
\t\t\t\t\t\tCHANNELS 3 Zrotation Xrotation Yrotation
\t\t\t\t\t\tEnd Site
\t\t\t\t\t\t{{
\t\t\t\t\t\t\tOFFSET 0.0 -3.0 0.0
\t\t\t\t\t\t}}
\t\t\t\t\t}}
\t\t\t\t}}
\t\t\t}}
\t\t}}
\t}}
\tJOINT LeftUpLeg
\t{{
\t\tOFFSET 2.0 0.0 0.0
\t\tCHANNELS 3 Zrotation Xrotation Yrotation
\t\tJOINT LeftLeg
\t{{
\t\t\tOFFSET 0.0 -18.0 0.0
\t\t\tCHANNELS 3 Zrotation Xrotation Yrotation
\t\t\tJOINT LeftFoot
\t\t\t{{
\t\t\t\tOFFSET 0.0 -17.0 0.0
\t\t\t\tCHANNELS 3 Zrotation Xrotation Yrotation
\t\t\t\tEnd Site
\t\t\t\t{{
\t\t\t\t\tOFFSET 0.0 -3.0 0.0
\t\t\t\t}}
\t\t\t}}
\t\t}}
\t}}
\tJOINT RightUpLeg
\t{{
\t\tOFFSET -2.0 0.0 0.0
\t\tCHANNELS 3 Zrotation Xrotation Yrotation
\t\tJOINT RightLeg
\t{{
\t\t\tOFFSET 0.0 -18.0 0.0
\t\t\tCHANNELS 3 Zrotation Xrotation Yrotation
\t\t\tJOINT RightFoot
\t\t\t{{
\t\t\t\tOFFSET 0.0 -17.0 0.0
\t\t\t\tCHANNELS 3 Zrotation Xrotation Yrotation
\t\t\t\tEnd Site
\t\t\t\t{{
\t\t\t\t\tOFFSET 0.0 -3.0 0.0
\t\t\t\t}}
\t\t\t}}
\t\t}}
\t}}
}}

MOTION
Frames: {frame_count}
Frame Time: {1.0/fps:.6f}
"""
    
    # 모션 데이터 생성 (더 현실적인 수영 애니메이션)
    for i, pose in enumerate(poses_3d):
        time_factor = i / max(frame_count - 1, 1)
        
        # 기본 위치 (수영 시뮬레이션)
        x_pos = 0.0
        y_pos = 0.0
        z_pos = 0.0
        
        # 기본 회전
        z_rot = 0.0
        x_rot = 0.0
        y_rot = 0.0
        
        # 수영 애니메이션 시뮬레이션
        swim_cycle = np.sin(time_factor * 2 * np.pi)  # 0~1 사이 주기
        swim_cycle2 = np.sin(time_factor * 2 * np.pi + np.pi/2)  # 90도 위상차
        
        # Spine 움직임 (수영 시 몸통 회전)
        spine_z_rot = swim_cycle * 15  # 좌우 회전
        spine_x_rot = swim_cycle2 * 10  # 앞뒤 기울기
        
        # Chest 움직임
        chest_z_rot = swim_cycle * 10
        chest_x_rot = swim_cycle2 * 5
        
        # Neck/Head 움직임
        neck_z_rot = swim_cycle * 5
        head_z_rot = swim_cycle * 3
        
        # 어깨 움직임 (수영 팔 동작)
        left_shoulder_rot = [
            swim_cycle * 30,  # Z 회전 (팔 들어올리기)
            swim_cycle2 * 20,  # X 회전 (앞뒤)
            swim_cycle * 10   # Y 회전 (좌우)
        ]
        right_shoulder_rot = [
            -swim_cycle * 30,  # 반대 방향
            -swim_cycle2 * 20,
            -swim_cycle * 10
        ]
        
        # 팔 움직임
        left_arm_rot = [
            swim_cycle * 45,  # 더 큰 각도
            swim_cycle2 * 15,
            swim_cycle * 20
        ]
        right_arm_rot = [
            -swim_cycle * 45,
            -swim_cycle2 * 15,
            -swim_cycle * 20
        ]
        
        # 팔꿈치 움직임
        left_forearm_rot = [
            swim_cycle * 60,  # 팔꿈치 구부리기
            0,
            0
        ]
        right_forearm_rot = [
            -swim_cycle * 60,
            0,
            0
        ]
        
        # 다리 움직임 (수영 킥)
        left_leg_rot = [
            swim_cycle2 * 25,  # X 회전 (앞뒤)
            swim_cycle * 10,   # Y 회전 (좌우)
            swim_cycle2 * 5    # Z 회전
        ]
        right_leg_rot = [
            -swim_cycle2 * 25,
            -swim_cycle * 10,
            -swim_cycle2 * 5
        ]
        
        # 무릎 움직임
        left_knee_rot = [
            swim_cycle2 * 40,  # 무릎 구부리기
            0,
            0
        ]
        right_knee_rot = [
            -swim_cycle2 * 40,
            0,
            0
        ]
        
        # 발목 움직임
        left_foot_rot = [
            swim_cycle2 * 20,
            0,
            0
        ]
        right_foot_rot = [
            -swim_cycle2 * 20,
            0,
            0
        ]
        
        # 포즈 데이터 기반 조정 (실제 키포인트가 있으면)
        if len(pose) >= 17:
            # 어깨 키포인트 (5, 6) 기반 조정
            if len(pose[5]) >= 3 and len(pose[6]) >= 3:
                left_shoulder_rot[1] += (pose[5][1] - 0.5) * 30
                right_shoulder_rot[1] += (pose[6][1] - 0.5) * 30
            
            # 팔 키포인트 (7, 8, 9, 10) 기반 조정
            if len(pose[7]) >= 3 and len(pose[9]) >= 3:
                left_arm_rot[0] += (pose[7][1] - pose[9][1]) * 20
                left_arm_rot[1] += (pose[7][0] - pose[9][0]) * 20
            
            if len(pose[8]) >= 3 and len(pose[10]) >= 3:
                right_arm_rot[0] += (pose[8][1] - pose[10][1]) * 20
                right_arm_rot[1] += (pose[8][0] - pose[10][0]) * 20
        
        # 프레임 데이터 생성
        frame_data = f"{x_pos:.6f} {y_pos:.6f} {z_pos:.6f} {z_rot:.6f} {x_rot:.6f} {y_rot:.6f} "  # Hips
        frame_data += f"{spine_z_rot:.6f} {spine_x_rot:.6f} 0.000000 "  # Spine
        frame_data += f"{chest_z_rot:.6f} {chest_x_rot:.6f} 0.000000 "  # Chest
        frame_data += f"{neck_z_rot:.6f} 0.000000 0.000000 "  # Neck
        frame_data += f"{head_z_rot:.6f} 0.000000 0.000000 "  # Head
        frame_data += f"{left_shoulder_rot[0]:.6f} {left_shoulder_rot[1]:.6f} {left_shoulder_rot[2]:.6f} "  # LeftShoulder
        frame_data += f"{left_arm_rot[0]:.6f} {left_arm_rot[1]:.6f} {left_arm_rot[2]:.6f} "  # LeftArm
        frame_data += f"{left_forearm_rot[0]:.6f} {left_forearm_rot[1]:.6f} {left_forearm_rot[2]:.6f} "  # LeftForeArm
        frame_data += f"{right_shoulder_rot[0]:.6f} {right_shoulder_rot[1]:.6f} {right_shoulder_rot[2]:.6f} "  # RightShoulder
        frame_data += f"{right_arm_rot[0]:.6f} {right_arm_rot[1]:.6f} {right_arm_rot[2]:.6f} "  # RightArm
        frame_data += f"{right_forearm_rot[0]:.6f} {right_forearm_rot[1]:.6f} {right_forearm_rot[2]:.6f} "  # RightForeArm
        frame_data += f"{left_leg_rot[0]:.6f} {left_leg_rot[1]:.6f} {left_leg_rot[2]:.6f} "  # LeftUpLeg
        frame_data += f"{left_knee_rot[0]:.6f} {left_knee_rot[1]:.6f} {left_knee_rot[2]:.6f} "  # LeftLeg
        frame_data += f"{left_foot_rot[0]:.6f} {left_foot_rot[1]:.6f} {left_foot_rot[2]:.6f} "  # LeftFoot
        frame_data += f"{right_leg_rot[0]:.6f} {right_leg_rot[1]:.6f} {right_leg_rot[2]:.6f} "  # RightUpLeg
        frame_data += f"{right_knee_rot[0]:.6f} {right_knee_rot[1]:.6f} {right_knee_rot[2]:.6f} "  # RightLeg
        frame_data += f"{right_foot_rot[0]:.6f} {right_foot_rot[1]:.6f} {right_foot_rot[2]:.6f}"  # RightFoot
        
        bvh_content += frame_data + "\n"
    
    # BVH 파일 저장
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(bvh_content)
    
    print(f"[BVH] 개선된 BVH 파일 생성 완료: {output_path}")
    print(f"[BVH] BVH 프레임 수: {frame_count}")
    print(f"[BVH] BVH 파일 크기: {os.path.getsize(output_path):,} bytes")

def main():
    if len(sys.argv) != 4:
        print("사용법: python create_improved_bvh.py <poses3d.npy> <fps> <output.bvh>")
        sys.exit(1)
    
    poses_path = sys.argv[1]
    fps = float(sys.argv[2])
    output_path = sys.argv[3]
    
    # 3D 포즈 데이터 로드
    poses_3d = np.load(poses_path)
    frame_count = len(poses_3d)
    
    print(f"[BVH] 3D 포즈 로드: {poses_path}")
    print(f"[BVH] 프레임 수: {frame_count}")
    print(f"[BVH] FPS: {fps}")
    
    # 개선된 BVH 생성
    create_improved_bvh(poses_3d, fps, frame_count, output_path)

if __name__ == "__main__":
    main()




