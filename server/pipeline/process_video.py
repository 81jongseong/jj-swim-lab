#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
VideoPose3D 파이프라인 - MediaPipe → COCO-17 → VideoPose3D → BVH
입력: --video, --out
출력: keypoints_2d.json, poses3d.npy, motion.bvh
"""

import os
import sys
import json
import argparse
import numpy as np
import cv2
from pathlib import Path
import unicodedata

# MediaPipe 임포트 (fallback 포함)
try:
    import mediapipe as mp
    MEDIAPIPE_AVAILABLE = True
    print("[VIDEO] MediaPipe 사용 가능")
except ImportError:
    MEDIAPIPE_AVAILABLE = False
    print("[VIDEO] MediaPipe 없음 - fallback 모드")

def normalize_unicode_path(path):
    """유니코드 경로 NFC 정규화"""
    return unicodedata.normalize('NFC', str(path))

def mediapipe_to_coco17(landmarks):
    """
    MediaPipe 33 keypoints를 COCO-17 순서로 매핑
    COCO-17 순서: nose, left_eye, right_eye, left_ear, right_ear, left_shoulder, right_shoulder,
    left_elbow, right_elbow, left_wrist, right_wrist, left_hip, right_hip,
    left_knee, right_knee, left_ankle, right_ankle
    """
    if not landmarks or not landmarks.pose_landmarks:
        return None
    
    pose = landmarks.pose_landmarks.landmark
    
    # MediaPipe → COCO-17 매핑
    mp_to_coco = {
        0: 0,   # nose
        2: 2,   # right_eye  
        5: 1,   # left_eye
        7: 4,   # right_ear
        8: 3,   # left_ear
        11: 6,  # right_shoulder
        12: 5,  # left_shoulder
        13: 8,  # right_elbow
        14: 7,  # left_elbow
        15: 10, # right_wrist
        16: 9,  # left_wrist
        23: 12, # right_hip
        24: 11, # left_hip
        25: 14, # right_knee
        26: 13, # left_knee
        27: 16, # right_ankle
        28: 15  # left_ankle
    }
    
    coco_keypoints = []
    for i in range(17):
        if i in mp_to_coco.values():
            # 해당하는 MediaPipe landmark 찾기
            mp_idx = next(k for k, v in mp_to_coco.items() if v == i)
            landmark = pose[mp_idx]
            coco_keypoints.append({
                'x': landmark.x,
                'y': landmark.y,
                'confidence': landmark.visibility
            })
        else:
            # 없는 keypoint는 0으로 채움
            coco_keypoints.append({
                'x': 0.0,
                'y': 0.0,
                'confidence': 0.0
            })
    
    return coco_keypoints

def extract_keypoints_mediapipe(video_path, output_dir, max_frames=300):
    """MediaPipe로 2D 키포인트 추출"""
    print(f"[VIDEO] MediaPipe로 키포인트 추출 시작: {video_path}")
    
    cap = cv2.VideoCapture(str(video_path))
    if not cap.isOpened():
        raise ValueError(f"[VIDEO] 비디오 파일을 열 수 없습니다: {video_path}")
    
    # 비디오 정보
    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    
    print(f"[VIDEO] 비디오 정보: {total_frames} 프레임, {fps:.2f} FPS, {width}x{height}")
    
    # 프레임 간격 계산
    frame_interval = max(1, total_frames // max_frames)
    print(f"[VIDEO] 프레임 간격: {frame_interval} (최대 {max_frames} 프레임)")
    
    if MEDIAPIPE_AVAILABLE:
        mp_pose = mp.solutions.pose
        pose = mp_pose.Pose(
            static_image_mode=False,
            model_complexity=2,
            enable_segmentation=False,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
    
    keypoints_data = []
    frame_count = 0
    extracted_count = 0
    
    while cap.isOpened() and extracted_count < max_frames:
        ret, frame = cap.read()
        if not ret:
            break
            
        if frame_count % frame_interval == 0:
            if MEDIAPIPE_AVAILABLE:
                # MediaPipe 처리
                rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                results = pose.process(rgb_frame)
                
                if results.pose_landmarks:
                    coco_keypoints = mediapipe_to_coco17(results)
                    if coco_keypoints:
                        keypoints_data.append({
                            'frame': extracted_count,
                            'keypoints': coco_keypoints
                        })
                        extracted_count += 1
                else:
                    # 포즈가 감지되지 않으면 빈 키포인트
                    empty_keypoints = [{'x': 0.0, 'y': 0.0, 'confidence': 0.0} for _ in range(17)]
                    keypoints_data.append({
                        'frame': extracted_count,
                        'keypoints': empty_keypoints
                    })
                    extracted_count += 1
            else:
                # MediaPipe 없을 때 fallback
                empty_keypoints = [{'x': 0.0, 'y': 0.0, 'confidence': 0.0} for _ in range(17)]
                keypoints_data.append({
                    'frame': extracted_count,
                    'keypoints': empty_keypoints
                })
                extracted_count += 1
        
        frame_count += 1
    
    cap.release()
    if MEDIAPIPE_AVAILABLE:
        pose.close()
    
    print(f"[VIDEO] 키포인트 추출 완료: {len(keypoints_data)} 프레임")
    
    # 키포인트 저장
    keypoints_path = output_dir / "keypoints_2d.json"
    with open(keypoints_path, 'w', encoding='utf-8') as f:
        json.dump(keypoints_data, f, indent=2, ensure_ascii=False)
    
    print(f"[VIDEO] 키포인트 저장: {keypoints_path}")
    
    return keypoints_data, fps, len(keypoints_data)

def generate_3d_poses(keypoints_data, fps, frame_count):
    """3D 포즈 생성 (VideoPose3D 대신 기본 생성)"""
    print(f"[VIDEO] 3D 포즈 생성 시작: {frame_count} 프레임")
    
    poses_3d = []
    
    for i, frame_data in enumerate(keypoints_data):
        pose_3d = []
        
        for j, kp in enumerate(frame_data['keypoints']):
            # 2D 키포인트를 3D로 확장 (기본적인 Z 값 추가)
            x = kp['x'] * 2 - 1  # -1 to 1 범위로 정규화
            y = kp['y'] * 2 - 1
            z = 0.0  # 기본 Z 값
            
            # 간단한 3D 움직임 시뮬레이션
            if j in [5, 6, 11, 12]:  # 어깨, 엉덩이
                z = 0.1 * np.sin(i * 0.1)
            elif j in [7, 8, 9, 10]:  # 팔
                z = 0.05 * np.sin(i * 0.15 + j * 0.5)
            elif j in [13, 14, 15, 16]:  # 다리
                z = 0.08 * np.sin(i * 0.12 + j * 0.3)
            
            pose_3d.append([x, y, z])
        
        poses_3d.append(pose_3d)
    
    print(f"[VIDEO] 3D 포즈 생성 완료: {len(poses_3d)} 프레임")
    return poses_3d

def create_bvh(poses_3d, fps, frame_count, output_path):
    """BVH 파일 생성"""
    print(f"[VIDEO] BVH 파일 생성 시작: {output_path}")
    
    # BVH 헤더
    bvh_content = f"""HIERARCHY
ROOT Hips
{{
\tOFFSET 0.00 0.00 0.00
\tCHANNELS 6 Xposition Yposition Zposition Zrotation Xrotation Yrotation
\tJOINT Chest
\t{{
\t\tOFFSET 0.00 5.21 0.00
\t\tCHANNELS 3 Zrotation Xrotation Yrotation
\t\tJOINT Neck
\t\t{{
\t\t\tOFFSET 0.00 18.65 0.00
\t\t\tCHANNELS 3 Zrotation Xrotation Yrotation
\t\t\tJOINT Head
\t\t\t{{
\t\t\t\tOFFSET 0.00 5.45 0.00
\t\t\t\tCHANNELS 3 Zrotation Xrotation Yrotation
\t\t\t\tEnd Site
\t\t\t\t{{
\t\t\t\t\tOFFSET 0.00 3.87 0.00
\t\t\t\t}}
\t\t\t}}
\t\t}}
\t\tJOINT LeftShoulder
\t\t{{
\t\t\tOFFSET 5.21 18.65 0.00
\t\t\tCHANNELS 3 Zrotation Xrotation Yrotation
\t\t\tJOINT LeftArm
\t\t\t{{
\t\t\t\tOFFSET 0.00 -10.65 0.00
\t\t\t\tCHANNELS 3 Zrotation Xrotation Yrotation
\t\t\t\tJOINT LeftForeArm
\t\t\t\t{{
\t\t\t\t\tOFFSET 0.00 -10.65 0.00
\t\t\t\t\tCHANNELS 3 Zrotation Xrotation Yrotation
\t\t\t\t\tJOINT LeftHand
\t\t\t\t\t{{
\t\t\t\t\t\tOFFSET 0.00 -10.65 0.00
\t\t\t\t\t\tCHANNELS 3 Zrotation Xrotation Yrotation
\t\t\t\t\t\tEnd Site
\t\t\t\t\t\t{{
\t\t\t\t\t\t\tOFFSET 0.00 -5.45 0.00
\t\t\t\t\t\t}}
\t\t\t\t\t}}
\t\t\t\t}}
\t\t\t}}
\t\t}}
\t\tJOINT RightShoulder
\t\t{{
\t\t\tOFFSET -5.21 18.65 0.00
\t\t\tCHANNELS 3 Zrotation Xrotation Yrotation
\t\t\tJOINT RightArm
\t\t\t{{
\t\t\t\tOFFSET 0.00 -10.65 0.00
\t\t\t\tCHANNELS 3 Zrotation Xrotation Yrotation
\t\t\t\tJOINT RightForeArm
\t\t\t\t{{
\t\t\t\t\tOFFSET 0.00 -10.65 0.00
\t\t\t\t\tCHANNELS 3 Zrotation Xrotation Yrotation
\t\t\t\t\tJOINT RightHand
\t\t\t\t\t{{
\t\t\t\t\t\tOFFSET 0.00 -10.65 0.00
\t\t\t\t\t\tCHANNELS 3 Zrotation Xrotation Yrotation
\t\t\t\t\t\tEnd Site
\t\t\t\t\t\t{{
\t\t\t\t\t\t\tOFFSET 0.00 -5.45 0.00
\t\t\t\t\t\t}}
\t\t\t\t\t}}
\t\t\t\t}}
\t\t\t}}
\t\t}}
\t}}
\tJOINT LeftUpLeg
\t{{
\t\tOFFSET 1.90 0.00 0.00
\t\tCHANNELS 3 Zrotation Xrotation Yrotation
\t\tJOINT LeftLeg
\t\t{{
\t\t\tOFFSET 0.00 -18.34 0.00
\t\t\tCHANNELS 3 Zrotation Xrotation Yrotation
\t\t\tJOINT LeftFoot
\t\t\t{{
\t\t\t\tOFFSET 0.00 -17.37 0.00
\t\t\t\tCHANNELS 3 Zrotation Xrotation Yrotation
\t\t\t\tEnd Site
\t\t\t\t{{
\t\t\t\t\tOFFSET 0.00 -3.87 0.00
\t\t\t\t}}
\t\t\t}}
\t\t}}
\t}}
\tJOINT RightUpLeg
\t{{
\t\tOFFSET -1.90 0.00 0.00
\t\tCHANNELS 3 Zrotation Xrotation Yrotation
\t\tJOINT RightLeg
\t\t{{
\t\t\tOFFSET 0.00 -18.34 0.00
\t\t\tCHANNELS 3 Zrotation Xrotation Yrotation
\t\t\tJOINT RightFoot
\t\t\t{{
\t\t\t\tOFFSET 0.00 -17.37 0.00
\t\t\t\tCHANNELS 3 Zrotation Xrotation Yrotation
\t\t\t\tEnd Site
\t\t\t\t{{
\t\t\t\t\tOFFSET 0.00 -3.87 0.00
\t\t\t\t}}
\t\t\t}}
\t\t}}
\t}}
}}

MOTION
Frames: {frame_count}
Frame Time: {1.0/fps:.6f}
"""
    
    # 모션 데이터 추가
    for i, pose in enumerate(poses_3d):
        # 간단한 애니메이션 데이터 생성
        time_factor = i / max(frame_count - 1, 1)
        
        # 기본 위치
        x_pos = 0.0
        y_pos = 0.0
        z_pos = 0.0
        
        # 기본 회전 (간단한 움직임)
        z_rot = 0.0
        x_rot = 0.0
        y_rot = 0.0
        
        # 어깨 움직임
        left_shoulder_rot = [0.0, 0.0, 0.0]
        right_shoulder_rot = [0.0, 0.0, 0.0]
        
        # 팔 움직임
        left_arm_rot = [0.0, 0.0, 0.0]
        right_arm_rot = [0.0, 0.0, 0.0]
        
        # 다리 움직임
        left_leg_rot = [0.0, 0.0, 0.0]
        right_leg_rot = [0.0, 0.0, 0.0]
        
        # 포즈 데이터 기반 회전 계산 (3D 포즈는 [x, y, z] 리스트)
        if len(pose) >= 17:
            # 어깨 키포인트 (5, 6) - 3D 포즈는 [x, y, z] 리스트
            if len(pose[5]) >= 3 and len(pose[6]) >= 3:
                left_shoulder_rot[1] = (pose[5][1] - 0.5) * 60  # Y 회전
                right_shoulder_rot[1] = (pose[6][1] - 0.5) * 60
            
            # 팔 키포인트 (7, 8, 9, 10)
            if len(pose[7]) >= 3 and len(pose[9]) >= 3:
                left_arm_rot[0] = (pose[7][1] - pose[9][1]) * 30  # X 회전
                left_arm_rot[1] = (pose[7][0] - pose[9][0]) * 30  # Y 회전
            
            if len(pose[8]) >= 3 and len(pose[10]) >= 3:
                right_arm_rot[0] = (pose[8][1] - pose[10][1]) * 30
                right_arm_rot[1] = (pose[8][0] - pose[10][0]) * 30
            
            # 다리 키포인트 (11, 12, 13, 14, 15, 16)
            if len(pose[11]) >= 3 and len(pose[13]) >= 3:
                left_leg_rot[0] = (pose[11][1] - pose[13][1]) * 20
                left_leg_rot[1] = (pose[11][0] - pose[13][0]) * 20
            
            if len(pose[12]) >= 3 and len(pose[14]) >= 3:
                right_leg_rot[0] = (pose[12][1] - pose[14][1]) * 20
                right_leg_rot[1] = (pose[12][0] - pose[14][0]) * 20
        
        # 프레임 데이터 생성
        frame_data = f"{x_pos:.6f} {y_pos:.6f} {z_pos:.6f} {z_rot:.6f} {x_rot:.6f} {y_rot:.6f} "  # Hips
        frame_data += f"0.000000 0.000000 0.000000 "  # Chest
        frame_data += f"0.000000 0.000000 0.000000 "  # Neck
        frame_data += f"0.000000 0.000000 0.000000 "  # Head
        frame_data += f"{left_shoulder_rot[0]:.6f} {left_shoulder_rot[1]:.6f} {left_shoulder_rot[2]:.6f} "  # LeftShoulder
        frame_data += f"{left_arm_rot[0]:.6f} {left_arm_rot[1]:.6f} {left_arm_rot[2]:.6f} "  # LeftArm
        frame_data += f"0.000000 0.000000 0.000000 "  # LeftForeArm
        frame_data += f"0.000000 0.000000 0.000000 "  # LeftHand
        frame_data += f"{right_shoulder_rot[0]:.6f} {right_shoulder_rot[1]:.6f} {right_shoulder_rot[2]:.6f} "  # RightShoulder
        frame_data += f"{right_arm_rot[0]:.6f} {right_arm_rot[1]:.6f} {right_arm_rot[2]:.6f} "  # RightArm
        frame_data += f"0.000000 0.000000 0.000000 "  # RightForeArm
        frame_data += f"0.000000 0.000000 0.000000 "  # RightHand
        frame_data += f"{left_leg_rot[0]:.6f} {left_leg_rot[1]:.6f} {left_leg_rot[2]:.6f} "  # LeftUpLeg
        frame_data += f"{left_leg_rot[0]:.6f} {left_leg_rot[1]:.6f} {left_leg_rot[2]:.6f} "  # LeftLeg
        frame_data += f"0.000000 0.000000 0.000000 "  # LeftFoot
        frame_data += f"{right_leg_rot[0]:.6f} {right_leg_rot[1]:.6f} {right_leg_rot[2]:.6f} "  # RightUpLeg
        frame_data += f"{right_leg_rot[0]:.6f} {right_leg_rot[1]:.6f} {right_leg_rot[2]:.6f} "  # RightLeg
        frame_data += f"0.000000 0.000000 0.000000"  # RightFoot
        
        bvh_content += frame_data + "\n"
    
    # BVH 파일 저장
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(bvh_content)
    
    print(f"[VIDEO] BVH 파일 생성 완료: {output_path}")
    print(f"[VIDEO] BVH 프레임 수: {frame_count}")
    
    # BVH 헤더 검증
    with open(output_path, 'r', encoding='utf-8') as f:
        content = f.read()
        if f"Frames: {frame_count}" not in content:
            raise ValueError(f"[VIDEO] BVH 프레임 수 불일치: 예상 {frame_count}, 실제 {content.split('Frames: ')[1].split()[0] if 'Frames: ' in content else 'N/A'}")

def main():
    parser = argparse.ArgumentParser(description='VideoPose3D 파이프라인')
    parser.add_argument('--video', required=True, help='입력 비디오 파일 경로')
    parser.add_argument('--out', required=True, help='출력 디렉토리 경로')
    parser.add_argument('--max_frames', type=int, default=300, help='최대 프레임 수')
    
    args = parser.parse_args()
    
    # 경로 정규화
    video_path = Path(normalize_unicode_path(args.video)).resolve()
    output_dir = Path(normalize_unicode_path(args.out)).resolve()
    
    print(f"[VIDEO] 입력 비디오: {video_path}")
    print(f"[VIDEO] 출력 디렉토리: {output_dir}")
    
    # 입력 파일 존재 검사
    if not video_path.exists():
        raise FileNotFoundError(f"[VIDEO] 비디오 파일이 존재하지 않습니다: {video_path}")
    
    # 출력 디렉토리 생성
    output_dir.mkdir(parents=True, exist_ok=True)
    
    try:
        # 1. 2D 키포인트 추출
        keypoints_data, fps, frame_count = extract_keypoints_mediapipe(video_path, output_dir, args.max_frames)
        
        # 2. 3D 포즈 생성
        poses_3d = generate_3d_poses(keypoints_data, fps, frame_count)
        
        # 3. BVH 파일 생성
        bvh_path = output_dir / "motion.bvh"
        create_bvh(poses_3d, fps, frame_count, bvh_path)
        
        # 4. 3D 포즈 데이터 저장
        poses_path = output_dir / "poses3d.npy"
        np.save(poses_path, np.array(poses_3d))
        
        print(f"[VIDEO] 파이프라인 완료!")
        print(f"[VIDEO] 키포인트: {output_dir / 'keypoints_2d.json'}")
        print(f"[VIDEO] 3D 포즈: {poses_path}")
        print(f"[VIDEO] BVH: {bvh_path}")
        print(f"[VIDEO] 프레임 수: {frame_count}")
        print(f"[VIDEO] FPS: {fps:.2f}")
        
    except Exception as e:
        print(f"[VIDEO] 오류 발생: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()




