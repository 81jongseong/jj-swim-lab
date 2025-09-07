#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
모션 추출 검증 스크립트
- MediaPipe로 2D 관절 추출 및 가시화
- 모션 통계 분석 및 품질 검증
"""

import cv2
import mediapipe as mp
import numpy as np
import json
import os
import sys
import argparse
from pathlib import Path
import matplotlib.pyplot as plt
from scipy import stats

def extract_2d_poses(video_path, output_dir, fps=30):
    """2D 포즈 추출 및 가시화"""
    print(f"[POSE] 비디오 처리 시작: {video_path}")
    
    # MediaPipe 설정
    mp_pose = mp.solutions.pose
    mp_drawing = mp.solutions.drawing_utils
    pose = mp_pose.Pose(
        static_image_mode=False,
        model_complexity=2,
        enable_segmentation=False,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5
    )
    
    # 비디오 캡처
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print(f"[ERROR] 비디오를 열 수 없습니다: {video_path}")
        return False
    
    # 비디오 정보
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    video_fps = cap.get(cv2.CAP_PROP_FPS)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    
    print(f"[POSE] 비디오 정보: {total_frames}프레임, {video_fps:.2f}FPS, {width}x{height}")
    
    # 출력 설정
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)
    
    # 비디오 작성자 설정
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(
        str(output_path / 'overlay.mp4'),
        fourcc, fps, (width, height)
    )
    
    # 데이터 저장
    keypoints_data = []
    frame_idx = 0
    valid_frames = 0
    
    print(f"[POSE] 프레임 처리 시작...")
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        # RGB 변환
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # 포즈 추출
        results = pose.process(rgb_frame)
        
        if results.pose_landmarks:
            valid_frames += 1
            
            # 키포인트 추출 (33개 관절)
            landmarks = results.pose_landmarks.landmark
            keypoints = []
            
            for landmark in landmarks:
                keypoints.append({
                    'x': landmark.x,
                    'y': landmark.y,
                    'z': landmark.z,
                    'visibility': landmark.visibility
                })
            
            keypoints_data.append({
                'frame': frame_idx,
                'keypoints': keypoints
            })
            
            # 스켈레톤 오버레이
            annotated_frame = frame.copy()
            mp_drawing.draw_landmarks(
                annotated_frame,
                results.pose_landmarks,
                mp_pose.POSE_CONNECTIONS,
                landmark_drawing_spec=mp_drawing.DrawingSpec(color=(0, 255, 0), thickness=2, circle_radius=2),
                connection_drawing_spec=mp_drawing.DrawingSpec(color=(255, 0, 0), thickness=2)
            )
            
            # 프레임 번호 표시
            cv2.putText(annotated_frame, f'Frame: {frame_idx}', (10, 30), 
                       cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
            
            out.write(annotated_frame)
        else:
            # 포즈를 찾지 못한 프레임
            out.write(frame)
        
        frame_idx += 1
        
        if frame_idx % 100 == 0:
            print(f"[POSE] 처리된 프레임: {frame_idx}/{total_frames}")
    
    # 정리
    cap.release()
    out.release()
    pose.close()
    
    print(f"[POSE] 처리 완료: {frame_idx}프레임, 유효: {valid_frames}프레임")
    
    # 키포인트 데이터 저장
    with open(output_path / 'keypoints_2d.json', 'w') as f:
        json.dump(keypoints_data, f, indent=2)
    
    return keypoints_data, valid_frames, frame_idx

def calculate_motion_stats(keypoints_data, total_frames):
    """모션 통계 계산"""
    print(f"[POSE] 모션 통계 계산 중...")
    
    if len(keypoints_data) < 2:
        return {
            'total_frames': total_frames,
            'valid_frames': len(keypoints_data),
            'valid_ratio': 0.0,
            'total_movement': 0.0,
            'verdict': 'poor',
            'per_joint': {}
        }
    
    # 관절별 이동량 계산
    joint_names = [
        'nose', 'left_eye_inner', 'left_eye', 'left_eye_outer', 'right_eye_inner',
        'right_eye', 'right_eye_outer', 'left_ear', 'right_ear', 'mouth_left',
        'mouth_right', 'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow',
        'left_wrist', 'right_wrist', 'left_pinky', 'right_pinky', 'left_index',
        'right_index', 'left_thumb', 'right_thumb', 'left_hip', 'right_hip',
        'left_knee', 'right_knee', 'left_ankle', 'right_ankle', 'left_heel',
        'right_heel', 'left_foot_index', 'right_foot_index'
    ]
    
    per_joint_stats = {}
    total_movement = 0.0
    
    for joint_idx, joint_name in enumerate(joint_names):
        movements = []
        valid_count = 0
        
        for i in range(1, len(keypoints_data)):
            prev_frame = keypoints_data[i-1]['keypoints'][joint_idx]
            curr_frame = keypoints_data[i]['keypoints'][joint_idx]
            
            if prev_frame['visibility'] > 0.5 and curr_frame['visibility'] > 0.5:
                # 2D 이동량 계산 (정규화된 좌표)
                dx = curr_frame['x'] - prev_frame['x']
                dy = curr_frame['y'] - prev_frame['y']
                movement = np.sqrt(dx*dx + dy*dy)
                movements.append(movement)
                valid_count += 1
        
        if movements:
            mean_delta = np.mean(movements)
            var_delta = np.var(movements)
            per_joint_stats[joint_name] = {
                'mean_delta': float(mean_delta),
                'var_delta': float(var_delta),
                'valid_count': valid_count
            }
            total_movement += mean_delta * valid_count
    
    # 전체 통계
    valid_ratio = len(keypoints_data) / total_frames if total_frames > 0 else 0.0
    
    # 판정
    if valid_ratio < 0.6:
        verdict = 'poor'
    elif total_movement < total_frames * 0.5:
        verdict = 'static'
    else:
        verdict = 'ok'
    
    stats_data = {
        'total_frames': total_frames,
        'valid_frames': len(keypoints_data),
        'valid_ratio': valid_ratio,
        'total_movement': total_movement,
        'verdict': verdict,
        'per_joint': per_joint_stats
    }
    
    # 통계 저장
    output_path = Path(keypoints_data[0]['keypoints'][0]) if keypoints_data else Path('.')
    with open('pose_stats.json', 'w') as f:
        json.dump(stats_data, f, indent=2)
    
    print(f"[POSE] frames={total_frames}, valid={len(keypoints_data)}, move_sum={total_movement:.2f}, verdict={verdict}")
    
    return stats_data

def main():
    parser = argparse.ArgumentParser(description='모션 추출 검증 스크립트')
    parser.add_argument('--video', required=True, help='입력 비디오 파일 경로')
    parser.add_argument('--out', required=True, help='출력 디렉토리 경로')
    parser.add_argument('--fps', type=int, default=30, help='출력 FPS')
    
    args = parser.parse_args()
    
    # 절대 경로 변환
    video_path = Path(args.video).resolve()
    output_dir = Path(args.out).resolve()
    
    if not video_path.exists():
        print(f"[ERROR] 비디오 파일을 찾을 수 없습니다: {video_path}")
        sys.exit(1)
    
    print(f"[POSE] 시작: {video_path} -> {output_dir}")
    
    # 2D 포즈 추출
    keypoints_data, valid_frames, total_frames = extract_2d_poses(str(video_path), str(output_dir), args.fps)
    
    if not keypoints_data:
        print("[ERROR] 포즈 추출 실패")
        sys.exit(1)
    
    # 모션 통계 계산
    stats_data = calculate_motion_stats(keypoints_data, total_frames)
    
    # 결과 출력
    print(f"[POSE] 최종 결과:")
    print(f"  - 총 프레임: {stats_data['total_frames']}")
    print(f"  - 유효 프레임: {stats_data['valid_frames']}")
    print(f"  - 유효 비율: {stats_data['valid_ratio']:.2%}")
    print(f"  - 총 이동량: {stats_data['total_movement']:.2f}")
    print(f"  - 판정: {stats_data['verdict']}")
    
    if stats_data['verdict'] == 'ok':
        print("[SUCCESS] 모션 추출 성공!")
        sys.exit(0)
    else:
        print(f"[WARNING] 모션 추출 품질 부족: {stats_data['verdict']}")
        sys.exit(1)

if __name__ == "__main__":
    main()


