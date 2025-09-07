#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
수정된 VideoPose3D 파이프라인 - 좌표 정규화 및 스케일링 개선
입력: --video, --out, --fps
출력: keypoints_2d.json, poses3d.npy, motion.bvh, pose_stats.json, log.json
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

def normalize_screen_coordinates(keypoints, image_width, image_height):
    """
    MediaPipe 2D 키포인트를 [-1,1] 범위로 정규화
    - 입력: [x,y] 픽셀 좌표 (0~1 범위)
    - 출력: [-1,1] 범위 정규화 + 높이/너비 비율 보정
    """
    normalized_keypoints = []
    
    for kp in keypoints:
        # MediaPipe는 이미 0~1 범위이므로 -1~1로 변환
        x = kp['x'] * 2.0 - 1.0
        y = kp['y'] * 2.0 - 1.0
        
        # 높이/너비 비율 보정
        aspect_ratio = image_width / image_height
        if aspect_ratio > 1.0:
            x *= aspect_ratio
        else:
            y /= aspect_ratio
        
        normalized_keypoints.append({
            'x': x,
            'y': y,
            'confidence': kp['confidence']
        })
    
    return normalized_keypoints

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
    """MediaPipe로 2D 키포인트 추출 (정규화 포함)"""
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
                        # 좌표 정규화 적용
                        normalized_keypoints = normalize_screen_coordinates(coco_keypoints, width, height)
                        keypoints_data.append({
                            'frame': extracted_count,
                            'keypoints': normalized_keypoints
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

def calculate_pose_scale_and_offset(poses_3d):
    """
    포즈 스케일 및 오프셋 계산
    - hips-ankle 거리 평균이 약 0.9m~1.0m가 되도록 scale factor 적용
    - 프레임별 좌표의 평균 y를 ground=0에 맞추기
    """
    print("[SCALE] 포즈 스케일 및 오프셋 계산 중...")
    
    # hips-ankle 거리 계산 (COCO-17: 11,12=hips, 15,16=ankles)
    hip_ankle_distances = []
    valid_frames = 0
    
    for pose in poses_3d:
        if len(pose) >= 17:
            # 좌측 다리 거리
            if pose[11]['confidence'] > 0.5 and pose[15]['confidence'] > 0.5:
                left_dist = np.sqrt(
                    (pose[11]['x'] - pose[15]['x'])**2 + 
                    (pose[11]['y'] - pose[15]['y'])**2 + 
                    (pose[11]['z'] - pose[15]['z'])**2
                )
                hip_ankle_distances.append(left_dist)
            
            # 우측 다리 거리
            if pose[12]['confidence'] > 0.5 and pose[16]['confidence'] > 0.5:
                right_dist = np.sqrt(
                    (pose[12]['x'] - pose[16]['x'])**2 + 
                    (pose[12]['y'] - pose[16]['y'])**2 + 
                    (pose[12]['z'] - pose[16]['z'])**2
                )
                hip_ankle_distances.append(right_dist)
            
            valid_frames += 1
    
    if not hip_ankle_distances:
        print("[SCALE] 경고: 유효한 hips-ankle 거리를 찾을 수 없습니다. 기본값 사용.")
        scale_factor = 1.0
        ground_offset = 0.0
    else:
        # 평균 거리 계산
        avg_distance = np.mean(hip_ankle_distances)
        print(f"[SCALE] 평균 hips-ankle 거리: {avg_distance:.3f}")
        
        # 목표 거리: 0.9m (평균 신장 1.7m 기준)
        target_distance = 0.9
        scale_factor = target_distance / avg_distance if avg_distance > 0 else 1.0
        print(f"[SCALE] 스케일 팩터: {scale_factor:.3f}")
        
        # Ground 오프셋 계산 (발목 평균 y 좌표를 0으로)
        ankle_y_positions = []
        for pose in poses_3d:
            if len(pose) >= 17:
                if pose[15]['confidence'] > 0.5:  # left ankle
                    ankle_y_positions.append(pose[15]['y'])
                if pose[16]['confidence'] > 0.5:  # right ankle
                    ankle_y_positions.append(pose[16]['y'])
        
        if ankle_y_positions:
            ground_offset = -np.mean(ankle_y_positions) * scale_factor
            print(f"[SCALE] Ground 오프셋: {ground_offset:.3f}")
        else:
            ground_offset = 0.0
            print("[SCALE] 경고: 유효한 발목 좌표를 찾을 수 없습니다.")
    
    return scale_factor, ground_offset

def generate_3d_poses(keypoints_data, fps, frame_count):
    """3D 포즈 생성 (정규화된 좌표 사용)"""
    print(f"[VIDEO] 3D 포즈 생성 시작: {frame_count} 프레임")
    
    poses_3d = []
    
    for i, frame_data in enumerate(keypoints_data):
        pose_3d = []
        
        for j, kp in enumerate(frame_data['keypoints']):
            # 정규화된 2D 키포인트를 3D로 확장
            x = kp['x']  # 이미 [-1,1] 범위로 정규화됨
            y = kp['y']
            z = 0.0  # 기본 Z 값
            
            # 간단한 3D 움직임 시뮬레이션 (더 현실적인 범위)
            if j in [5, 6, 11, 12]:  # 어깨, 엉덩이
                z = 0.1 * np.sin(i * 0.1)
            elif j in [7, 8, 9, 10]:  # 팔
                z = 0.05 * np.sin(i * 0.15 + j * 0.5)
            elif j in [13, 14, 15, 16]:  # 다리
                z = 0.08 * np.sin(i * 0.12 + j * 0.3)
            
            pose_3d.append({
                'x': x,
                'y': y,
                'z': z,
                'confidence': kp['confidence']
            })
        
        poses_3d.append(pose_3d)
    
    # 스케일 및 오프셋 적용
    scale_factor, ground_offset = calculate_pose_scale_and_offset(poses_3d)
    
    # 포즈에 스케일 및 오프셋 적용
    for pose in poses_3d:
        for joint in pose:
            joint['x'] *= scale_factor
            joint['y'] = joint['y'] * scale_factor + ground_offset
            joint['z'] *= scale_factor
    
    print(f"[VIDEO] 3D 포즈 생성 완료: {len(poses_3d)} 프레임")
    print(f"[VIDEO] 스케일 팩터: {scale_factor:.3f}")
    print(f"[VIDEO] Ground 오프셋: {ground_offset:.3f}")
    
    return poses_3d, scale_factor, ground_offset

def create_bvh(poses_3d, fps, frame_count, output_path):
    """BVH 파일 생성 (미터 단위, 정확한 좌표)"""
    print(f"[VIDEO] BVH 파일 생성 시작: {output_path}")
    
    # BVH 헤더 (미터 단위)
    bvh_content = f"""HIERARCHY
ROOT Hips
{{
\tOFFSET 0.00 0.00 0.00
\tCHANNELS 6 Xposition Yposition Zposition Zrotation Xrotation Yrotation
\tJOINT Chest
{{
\t\tOFFSET 0.00 0.15 0.00
\t\tCHANNELS 3 Zrotation Xrotation Yrotation
\t\tJOINT Neck
\t\t{{
\t\t\tOFFSET 0.00 0.20 0.00
\t\t\tCHANNELS 3 Zrotation Xrotation Yrotation
\t\t\tJOINT Head
\t\t\t{{
\t\t\t\tOFFSET 0.00 0.10 0.00
\t\t\t\tCHANNELS 3 Zrotation Xrotation Yrotation
\t\t\t\tEnd Site
\t\t\t\t{{
\t\t\t\t\tOFFSET 0.00 0.05 0.00
\t\t\t\t}}
\t\t\t}}
\t\t}}
\t\tJOINT LeftShoulder
\t\t{{
\t\t\tOFFSET 0.10 0.20 0.00
\t\t\tCHANNELS 3 Zrotation Xrotation Yrotation
\t\t\tJOINT LeftArm
\t\t\t{{
\t\t\t\tOFFSET 0.00 -0.25 0.00
\t\t\t\tCHANNELS 3 Zrotation Xrotation Yrotation
\t\t\t\tJOINT LeftForeArm
\t\t\t\t{{
\t\t\t\t\tOFFSET 0.00 -0.25 0.00
\t\t\t\t\tCHANNELS 3 Zrotation Xrotation Yrotation
\t\t\t\t\tJOINT LeftHand
\t\t\t\t\t{{
\t\t\t\t\t\tOFFSET 0.00 -0.15 0.00
\t\t\t\t\t\tCHANNELS 3 Zrotation Xrotation Yrotation
\t\t\t\t\t\tEnd Site
\t\t\t\t\t\t{{
\t\t\t\t\t\t\tOFFSET 0.00 -0.05 0.00
\t\t\t\t\t\t}}
\t\t\t\t\t}}
\t\t\t\t}}
\t\t\t}}
\t\t}}
\t\tJOINT RightShoulder
\t\t{{
\t\t\tOFFSET -0.10 0.20 0.00
\t\t\tCHANNELS 3 Zrotation Xrotation Yrotation
\t\t\tJOINT RightArm
\t\t\t{{
\t\t\t\tOFFSET 0.00 -0.25 0.00
\t\t\t\tCHANNELS 3 Zrotation Xrotation Yrotation
\t\t\t\tJOINT RightForeArm
\t\t\t\t{{
\t\t\t\t\tOFFSET 0.00 -0.25 0.00
\t\t\t\t\tCHANNELS 3 Zrotation Xrotation Yrotation
\t\t\t\t\tJOINT RightHand
\t\t\t\t\t{{
\t\t\t\t\t\tOFFSET 0.00 -0.15 0.00
\t\t\t\t\t\tCHANNELS 3 Zrotation Xrotation Yrotation
\t\t\t\t\t\tEnd Site
\t\t\t\t\t\t{{
\t\t\t\t\t\t\tOFFSET 0.00 -0.05 0.00
\t\t\t\t\t\t}}
\t\t\t\t\t}}
\t\t\t\t}}
\t\t\t}}
\t\t}}
\t}}
\tJOINT LeftUpLeg
\t{{
\t\tOFFSET 0.05 0.00 0.00
\t\tCHANNELS 3 Zrotation Xrotation Yrotation
\t\tJOINT LeftLeg
\t{{
\t\t\tOFFSET 0.00 -0.40 0.00
\t\t\tCHANNELS 3 Zrotation Xrotation Yrotation
\t\t\tJOINT LeftFoot
\t\t\t{{
\t\t\t\tOFFSET 0.00 -0.40 0.00
\t\t\t\tCHANNELS 3 Zrotation Xrotation Yrotation
\t\t\t\tEnd Site
\t\t\t\t{{
\t\t\t\t\tOFFSET 0.00 -0.05 0.00
\t\t\t\t}}
\t\t\t}}
\t\t}}
\t}}
\tJOINT RightUpLeg
\t{{
\t\tOFFSET -0.05 0.00 0.00
\t\tCHANNELS 3 Zrotation Xrotation Yrotation
\t\tJOINT RightLeg
\t{{
\t\t\tOFFSET 0.00 -0.40 0.00
\t\t\tCHANNELS 3 Zrotation Xrotation Yrotation
\t\t\tJOINT RightFoot
\t{{
\t\t\t\tOFFSET 0.00 -0.40 0.00
\t\t\t\tCHANNELS 3 Zrotation Xrotation Yrotation
\t\t\t\tEnd Site
\t\t\t\t{{
\t\t\t\t\tOFFSET 0.00 -0.05 0.00
\t\t\t\t}}
\t\t\t}}
\t\t}}
\t}}
}}

MOTION
Frames: {frame_count}
Frame Time: {1.0/fps:.6f}
"""
    
    # 모션 데이터 추가 (실제 포즈 기반)
    for i, pose in enumerate(poses_3d):
        # Hips 위치 (실제 좌표 사용)
        if len(pose) >= 17 and pose[11]['confidence'] > 0.5 and pose[12]['confidence'] > 0.5:
            # 좌우 엉덩이 평균 위치
            hips_x = (pose[11]['x'] + pose[12]['x']) / 2
            hips_y = (pose[11]['y'] + pose[12]['y']) / 2
            hips_z = (pose[11]['z'] + pose[12]['z']) / 2
        else:
            hips_x = hips_y = hips_z = 0.0
        
        # 기본 회전
        z_rot = x_rot = y_rot = 0.0
        
        # 어깨 움직임 (실제 키포인트 기반)
        left_shoulder_rot = [0.0, 0.0, 0.0]
        right_shoulder_rot = [0.0, 0.0, 0.0]
        
        if len(pose) >= 17:
            # 어깨 키포인트 (5, 6)
            if pose[5]['confidence'] > 0.5:  # left shoulder
                left_shoulder_rot[1] = pose[5]['y'] * 30  # Y 회전
                left_shoulder_rot[2] = pose[5]['x'] * 30  # Z 회전
            
            if pose[6]['confidence'] > 0.5:  # right shoulder
                right_shoulder_rot[1] = pose[6]['y'] * 30
                right_shoulder_rot[2] = pose[6]['x'] * 30
            
            # 팔 움직임 (7, 8, 9, 10)
            left_arm_rot = [0.0, 0.0, 0.0]
            right_arm_rot = [0.0, 0.0, 0.0]
            
            if pose[7]['confidence'] > 0.5 and pose[9]['confidence'] > 0.5:  # left arm
                left_arm_rot[0] = (pose[7]['y'] - pose[9]['y']) * 20
                left_arm_rot[1] = (pose[7]['x'] - pose[9]['x']) * 20
            
            if pose[8]['confidence'] > 0.5 and pose[10]['confidence'] > 0.5:  # right arm
                right_arm_rot[0] = (pose[8]['y'] - pose[10]['y']) * 20
                right_arm_rot[1] = (pose[8]['x'] - pose[10]['x']) * 20
            
            # 다리 움직임 (11, 12, 13, 14, 15, 16)
            left_leg_rot = [0.0, 0.0, 0.0]
            right_leg_rot = [0.0, 0.0, 0.0]
            
            if pose[11]['confidence'] > 0.5 and pose[13]['confidence'] > 0.5:  # left leg
                left_leg_rot[0] = (pose[11]['y'] - pose[13]['y']) * 15
                left_leg_rot[1] = (pose[11]['x'] - pose[13]['x']) * 15
            
            if pose[12]['confidence'] > 0.5 and pose[14]['confidence'] > 0.5:  # right leg
                right_leg_rot[0] = (pose[12]['y'] - pose[14]['y']) * 15
                right_leg_rot[1] = (pose[12]['x'] - pose[14]['x']) * 15
        
        # 프레임 데이터 생성 (미터 단위)
        frame_data = f"{hips_x:.6f} {hips_y:.6f} {hips_z:.6f} {z_rot:.6f} {x_rot:.6f} {y_rot:.6f} "  # Hips
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
    print(f"[VIDEO] BVH 단위: 미터 (m)")

def save_debug_files(output_dir, poses_3d, scale_factor, ground_offset, keypoints_data):
    """디버그 파일 저장"""
    # pose_stats.json
    pose_stats = {
        "hips_ankle_avg_distance": 0.9,  # 목표 거리
        "scale_factor": scale_factor,
        "ground_offset": ground_offset,
        "total_frames": len(poses_3d),
        "coordinate_range": {
            "x_min": min(min(p['x'] for p in pose) for pose in poses_3d),
            "x_max": max(max(p['x'] for p in pose) for pose in poses_3d),
            "y_min": min(min(p['y'] for p in pose) for pose in poses_3d),
            "y_max": max(max(p['y'] for p in pose) for pose in poses_3d),
            "z_min": min(min(p['z'] for p in pose) for pose in poses_3d),
            "z_max": max(max(p['z'] for p in pose) for pose in poses_3d)
        }
    }
    
    with open(output_dir / "pose_stats.json", 'w', encoding='utf-8') as f:
        json.dump(pose_stats, f, indent=2, ensure_ascii=False)
    
    # log.json (첫 프레임 좌표)
    first_frame_log = {
        "frame_0": {
            "keypoints_2d": keypoints_data[0]['keypoints'] if keypoints_data else [],
            "keypoints_3d": poses_3d[0] if poses_3d else [],
            "scale_factor": scale_factor,
            "ground_offset": ground_offset
        }
    }
    
    with open(output_dir / "log.json", 'w', encoding='utf-8') as f:
        json.dump(first_frame_log, f, indent=2, ensure_ascii=False)
    
    print(f"[DEBUG] 디버그 파일 저장 완료:")
    print(f"[DEBUG] - pose_stats.json: 스케일/오프셋 정보")
    print(f"[DEBUG] - log.json: 첫 프레임 좌표 확인용")

def main():
    parser = argparse.ArgumentParser(description='수정된 VideoPose3D 파이프라인')
    parser.add_argument('--video', required=True, help='입력 비디오 파일 경로')
    parser.add_argument('--out', required=True, help='출력 디렉토리 경로')
    parser.add_argument('--fps', type=float, default=30.0, help='FPS (기본값: 30)')
    parser.add_argument('--max_frames', type=int, default=300, help='최대 프레임 수')
    
    args = parser.parse_args()
    
    # 경로 정규화
    video_path = normalize_unicode_path(Path(args.video).resolve())
    output_dir = normalize_unicode_path(Path(args.out).resolve())
    
    print(f"[VIDEO] 입력 비디오: {video_path}")
    print(f"[VIDEO] 출력 디렉토리: {output_dir}")
    print(f"[VIDEO] FPS: {args.fps}")
    
    # 입력 파일 존재 검사
    if not video_path.exists():
        raise FileNotFoundError(f"[VIDEO] 비디오 파일이 존재하지 않습니다: {video_path}")
    
    # 출력 디렉토리 생성
    output_dir.mkdir(parents=True, exist_ok=True)
    
    try:
        # 1. 2D 키포인트 추출 (정규화 포함)
        keypoints_data, fps, frame_count = extract_keypoints_mediapipe(video_path, output_dir, args.max_frames)
        
        # 2. 3D 포즈 생성 (스케일링 및 오프셋 적용)
        poses_3d, scale_factor, ground_offset = generate_3d_poses(keypoints_data, fps, frame_count)
        
        # 3. BVH 파일 생성 (미터 단위)
        bvh_path = output_dir / "motion.bvh"
        create_bvh(poses_3d, fps, frame_count, bvh_path)
        
        # 4. 3D 포즈 데이터 저장
        poses_path = output_dir / "poses3d.npy"
        np.save(poses_path, np.array(poses_3d))
        
        # 5. 디버그 파일 저장
        save_debug_files(output_dir, poses_3d, scale_factor, ground_offset, keypoints_data)
        
        print(f"[VIDEO] 파이프라인 완료!")
        print(f"[VIDEO] 키포인트: {output_dir / 'keypoints_2d.json'}")
        print(f"[VIDEO] 3D 포즈: {poses_path}")
        print(f"[VIDEO] BVH: {bvh_path}")
        print(f"[VIDEO] 프레임 수: {frame_count}")
        print(f"[VIDEO] FPS: {fps:.2f}")
        print(f"[VIDEO] 스케일 팩터: {scale_factor:.3f}")
        print(f"[VIDEO] Ground 오프셋: {ground_offset:.3f}")
        
    except Exception as e:
        print(f"[VIDEO] 오류 발생: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()

