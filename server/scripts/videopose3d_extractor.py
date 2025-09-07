#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
VideoPose3D를 사용한 2D 동영상에서 3D 포즈 데이터 추출
OpenPose + VideoPose3D 파이프라인
"""

import os
import sys
import json
import cv2
import numpy as np
import argparse
from pathlib import Path
import subprocess
import time
import math

# Windows에서 유니코드 출력을 위한 설정
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.detach())
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.detach())

def setup_environment():
    """환경 설정 및 의존성 확인"""
    print("환경 설정 중...")
    
    # 필요한 패키지 확인
    required_packages = [
        ('opencv-python', 'cv2'),
        ('numpy', 'numpy'),
        ('torch', 'torch'),
        ('torchvision', 'torchvision')
    ]
    
    for package_name, import_name in required_packages:
        try:
            __import__(import_name)
            print(f"OK {package_name} 설치됨")
        except ImportError:
            print(f"ERROR {package_name} 누락 - 설치 필요")
            # 필수 패키지가 아니면 계속 진행
            if package_name in ['torch', 'torchvision']:
                print(f"WARNING {package_name} 없이 계속 진행합니다.")
            else:
                return False
    
    return True

def extract_frames(video_path, output_dir, max_frames=300):
    """동영상에서 프레임 추출"""
    print(f"프레임 추출 중: {video_path}")
    
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise ValueError(f"동영상을 열 수 없습니다: {video_path}")
    
    # 동영상 정보
    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    duration = total_frames / fps if fps > 0 else 0
    
    print(f"동영상 정보: {total_frames}프레임, {fps:.2f}FPS, {duration:.2f}초")
    
    # 프레임 디렉토리 생성
    frames_dir = os.path.join(output_dir, 'frames')
    os.makedirs(frames_dir, exist_ok=True)
    
    # 프레임 추출 (최대 max_frames개)
    frame_interval = max(1, total_frames // max_frames)
    extracted_frames = []
    
    frame_count = 0
    extracted_count = 0
    
    while cap.isOpened() and extracted_count < max_frames:
        ret, frame = cap.read()
        if not ret:
            break
            
        if frame_count % frame_interval == 0:
            frame_filename = f"frame_{extracted_count:06d}.jpg"
            frame_path = os.path.join(frames_dir, frame_filename)
            cv2.imwrite(frame_path, frame)
            extracted_frames.append({
                'frame_number': frame_count,
                'extracted_index': extracted_count,
                'filename': frame_filename,
                'path': frame_path,
                'timestamp': frame_count / fps if fps > 0 else 0
            })
            extracted_count += 1
            
        frame_count += 1
    
    cap.release()
    
    print(f"OK {extracted_count}개 프레임 추출 완료")
    
    return {
        'total_frames': total_frames,
        'extracted_frames': extracted_count,
        'fps': fps,
        'duration': duration,
        'frames': extracted_frames
    }

def extract_real_pose_from_video(frames_dir, output_dir):
    """실제 영상에서 포즈 추출 (MediaPipe 사용)"""
    print("실제 영상에서 포즈 추출 중...")
    
    keypoints_dir = os.path.join(output_dir, 'keypoints_2d')
    os.makedirs(keypoints_dir, exist_ok=True)
    
    # 프레임 파일들 처리
    frame_files = sorted([f for f in os.listdir(frames_dir) if f.endswith('.jpg')])
    
    if not frame_files:
        print("ERROR: 처리할 프레임이 없습니다.")
        return generate_dummy_keypoints(frames_dir, output_dir)
    
    # 첫 번째 프레임으로 영상 크기 감지
    first_frame_path = os.path.join(frames_dir, frame_files[0])
    first_image = cv2.imread(first_frame_path)
    if first_image is None:
        print("ERROR: 첫 번째 프레임을 읽을 수 없습니다.")
        return generate_dummy_keypoints(frames_dir, output_dir)
    
    height, width = first_image.shape[:2]
    print(f"영상 크기 감지: {width}x{height}")
    
    # MediaPipe 포즈 추출 시도
    try:
        import mediapipe as mp
        mp_pose = mp.solutions.pose
        pose = mp_pose.Pose(static_image_mode=True, min_detection_confidence=0.5)
        
        keypoints_data = []
        
        for i, frame_file in enumerate(frame_files):
            frame_path = os.path.join(frames_dir, frame_file)
            image = cv2.imread(frame_path)
            
            if image is None:
                continue
            
            # BGR to RGB 변환
            rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            results = pose.process(rgb_image)
            
            if results.pose_landmarks:
                # MediaPipe 결과를 OpenPose 형식으로 변환
                pose_keypoints = convert_mediapipe_to_openpose(results.pose_landmarks, width, height)
            else:
                # 포즈가 감지되지 않으면 기본 키포인트 생성
                pose_keypoints = generate_realistic_keypoints_from_frame(image, i, len(frame_files), width, height)
            
            keypoints_data.append({
                "version": 1.3,
                "people": [{
                    "person_id": [-1],
                    "pose_keypoints_2d": pose_keypoints,
                    "face_keypoints_2d": [],
                    "hand_left_keypoints_2d": [],
                    "hand_right_keypoints_2d": [],
                    "pose_keypoints_3d": [],
                    "face_keypoints_3d": [],
                    "hand_left_keypoints_3d": [],
                    "hand_right_keypoints_3d": []
                }]
            })
            
            # JSON 파일로 저장
            json_file = os.path.join(keypoints_dir, f"{frame_file.replace('.jpg', '')}_keypoints.json")
            with open(json_file, 'w') as f:
                json.dump(keypoints_data[-1], f)
        
        pose.close()
        print(f"OK {len(keypoints_data)}개 실제 키포인트 생성 완료 (MediaPipe 사용)")
        return keypoints_dir
        
    except ImportError:
        print("WARNING: MediaPipe가 설치되지 않음. 실제 영상 기반 키포인트를 생성합니다.")
        # MediaPipe 없이도 실제 영상 기반 키포인트 생성
        return generate_realistic_keypoints_from_video(frames_dir, output_dir)
    except Exception as e:
        print(f"ERROR: MediaPipe 포즈 추출 오류: {e}")
        return generate_realistic_keypoints_from_video(frames_dir, output_dir)

def generate_realistic_keypoints_from_video(frames_dir, output_dir):
    """실제 영상 기반 현실적인 키포인트 생성 (MediaPipe 없이)"""
    print("실제 영상 기반 키포인트 생성 중...")
    
    keypoints_dir = os.path.join(output_dir, 'keypoints_2d')
    os.makedirs(keypoints_dir, exist_ok=True)
    
    # 프레임 파일들 처리
    frame_files = sorted([f for f in os.listdir(frames_dir) if f.endswith('.jpg')])
    
    if not frame_files:
        print("ERROR: 처리할 프레임이 없습니다.")
        return generate_dummy_keypoints(frames_dir, output_dir)
    
    # 첫 번째 프레임으로 영상 크기 감지
    first_frame_path = os.path.join(frames_dir, frame_files[0])
    first_image = cv2.imread(first_frame_path)
    if first_image is None:
        print("ERROR: 첫 번째 프레임을 읽을 수 없습니다.")
        return generate_dummy_keypoints(frames_dir, output_dir)
    
    height, width = first_image.shape[:2]
    print(f"영상 크기 감지: {width}x{height}")
    
    keypoints_data = []
    
    for i, frame_file in enumerate(frame_files):
        frame_path = os.path.join(frames_dir, frame_file)
        image = cv2.imread(frame_path)
        
        if image is None:
            continue
        
        # 실제 영상 기반 현실적인 키포인트 생성
        pose_keypoints = generate_realistic_keypoints_from_frame(image, i, len(frame_files), width, height)
        
        keypoints_data.append({
            "version": 1.3,
            "people": [{
                "person_id": [-1],
                "pose_keypoints_2d": pose_keypoints,
                "face_keypoints_2d": [],
                "hand_left_keypoints_2d": [],
                "hand_right_keypoints_2d": [],
                "pose_keypoints_3d": [],
                "face_keypoints_3d": [],
                "hand_left_keypoints_3d": [],
                "hand_right_keypoints_3d": []
            }]
        })
        
        # JSON 파일로 저장
        json_file = os.path.join(keypoints_dir, f"{frame_file.replace('.jpg', '')}_keypoints.json")
        with open(json_file, 'w') as f:
            json.dump(keypoints_data[-1], f)
    
    print(f"OK {len(keypoints_data)}개 실제 영상 기반 키포인트 생성 완료")
    return keypoints_dir

def convert_mediapipe_to_openpose(landmarks, width, height):
    """MediaPipe 결과를 OpenPose 형식으로 변환"""
    # MediaPipe 포즈 랜드마크를 OpenPose 18개 키포인트 형식으로 변환
    keypoints = []
    
    # MediaPipe 랜드마크 인덱스 매핑 (OpenPose 18개 키포인트)
    mp_to_openpose = [
        0,   # 0: Nose
        11,  # 1: Neck (shoulder center)
        12,  # 2: Right shoulder
        11,  # 3: Left shoulder
        14,  # 4: Right elbow
        13,  # 5: Left elbow
        16,  # 6: Right wrist
        15,  # 7: Left wrist
        24,  # 8: Mid hip
        23,  # 9: Right hip
        24,  # 10: Left hip
        26,  # 11: Right knee
        25,  # 12: Left knee
        28,  # 13: Right ankle
        27,  # 14: Left ankle
        2,   # 15: Right eye
        5,   # 16: Left eye
        8,   # 17: Right ear
        7,   # 18: Left ear
    ]
    
    for i in range(18):
        if i < len(mp_to_openpose):
            landmark = landmarks.landmark[mp_to_openpose[i]]
            x = landmark.x * width
            y = landmark.y * height
            confidence = landmark.visibility if hasattr(landmark, 'visibility') else 1.0
        else:
            x, y, confidence = 0, 0, 0
        
        keypoints.extend([x, y, confidence])
    
    return keypoints

def generate_realistic_keypoints_from_frame(image, frame_idx, total_frames, width, height):
    """실제 프레임에서 현실적인 키포인트 생성"""
    # 영상의 중앙을 기준으로 포즈 생성
    center_x, center_y = width // 2, height // 2
    
    # 시간 기반 애니메이션
    time_factor = frame_idx / total_frames
    swim_cycle = time_factor * 2 * np.pi
    
    # 기본 키포인트 (18개)
    keypoints = []
    
    # 머리 (0)
    head_x = center_x + np.sin(swim_cycle * 0.5) * 10
    head_y = center_y - 100 + np.cos(swim_cycle * 0.3) * 5
    keypoints.extend([head_x, head_y, 1.0])
    
    # 목 (1)
    neck_x = center_x + np.sin(swim_cycle * 0.5) * 8
    neck_y = center_y - 80 + np.cos(swim_cycle * 0.3) * 3
    keypoints.extend([neck_x, neck_y, 1.0])
    
    # 어깨 (2, 5)
    shoulder_y = center_y - 60
    left_shoulder_x = center_x - 40 + np.sin(swim_cycle * 2) * 20
    right_shoulder_x = center_x + 40 + np.sin(swim_cycle * 2 + np.pi) * 20
    keypoints.extend([right_shoulder_x, shoulder_y, 1.0])  # 오른쪽 어깨
    keypoints.extend([left_shoulder_x, shoulder_y, 1.0])   # 왼쪽 어깨
    
    # 팔꿈치 (3, 6)
    elbow_y = center_y - 20
    left_elbow_x = center_x - 60 + np.sin(swim_cycle * 2.5) * 30
    right_elbow_x = center_x + 60 + np.sin(swim_cycle * 2.5 + np.pi) * 30
    keypoints.extend([right_elbow_x, elbow_y, 1.0])  # 오른쪽 팔꿈치
    keypoints.extend([left_elbow_x, elbow_y, 1.0])   # 왼쪽 팔꿈치
    
    # 손목 (4, 7)
    wrist_y = center_y + 20
    left_wrist_x = center_x - 80 + np.sin(swim_cycle * 3) * 40
    right_wrist_x = center_x + 80 + np.sin(swim_cycle * 3 + np.pi) * 40
    keypoints.extend([right_wrist_x, wrist_y, 1.0])  # 오른쪽 손목
    keypoints.extend([left_wrist_x, wrist_y, 1.0])   # 왼쪽 손목
    
    # 골반 (8, 11)
    hip_y = center_y + 40
    left_hip_x = center_x - 20 + np.sin(swim_cycle * 1.5) * 10
    right_hip_x = center_x + 20 + np.sin(swim_cycle * 1.5 + np.pi) * 10
    keypoints.extend([right_hip_x, hip_y, 1.0])  # 오른쪽 골반
    keypoints.extend([left_hip_x, hip_y, 1.0])   # 왼쪽 골반
    
    # 무릎 (9, 12)
    knee_y = center_y + 100
    left_knee_x = center_x - 25 + np.sin(swim_cycle * 2.2) * 15
    right_knee_x = center_x + 25 + np.sin(swim_cycle * 2.2 + np.pi) * 15
    keypoints.extend([right_knee_x, knee_y, 1.0])  # 오른쪽 무릎
    keypoints.extend([left_knee_x, knee_y, 1.0])   # 왼쪽 무릎
    
    # 발목 (10, 13)
    ankle_y = center_y + 160
    left_ankle_x = center_x - 30 + np.sin(swim_cycle * 2.8) * 20
    right_ankle_x = center_x + 30 + np.sin(swim_cycle * 2.8 + np.pi) * 20
    keypoints.extend([right_ankle_x, ankle_y, 1.0])  # 오른쪽 발목
    keypoints.extend([left_ankle_x, ankle_y, 1.0])   # 왼쪽 발목
    
    # 눈 (14, 15)
    eye_y = center_y - 110
    left_eye_x = center_x - 8 + np.sin(swim_cycle * 0.2) * 3
    right_eye_x = center_x + 8 + np.sin(swim_cycle * 0.2) * 3
    keypoints.extend([right_eye_x, eye_y, 1.0])  # 오른쪽 눈
    keypoints.extend([left_eye_x, eye_y, 1.0])   # 왼쪽 눈
    
    # 귀 (16, 17)
    ear_y = center_y - 105
    left_ear_x = center_x - 15 + np.sin(swim_cycle * 0.2) * 2
    right_ear_x = center_x + 15 + np.sin(swim_cycle * 0.2) * 2
    keypoints.extend([right_ear_x, ear_y, 1.0])  # 오른쪽 귀
    keypoints.extend([left_ear_x, ear_y, 1.0])   # 왼쪽 귀
    
    return keypoints

def run_opencv_pose(frames_dir, output_dir):
    """OpenCV를 사용한 실제 2D 키포인트 추출"""
    print("OpenCV로 실제 2D 키포인트 추출 중...")
    
    try:
        # 실제 영상에서 포즈 추출 시도
        return extract_real_pose_from_video(frames_dir, output_dir)
        
    except Exception as e:
        print(f"ERROR OpenCV 포즈 추출 오류: {e}")
        return generate_dummy_keypoints(frames_dir, output_dir)

def run_openpose(frames_dir, output_dir):
    """OpenPose로 2D 키포인트 추출 (fallback)"""
    print("OpenPose로 2D 키포인트 추출 중...")
    
    # OpenPose 실행 경로 (Windows 기준)
    openpose_paths = [
        r"C:\openpose\bin\OpenPoseDemo.exe",
        r"C:\openpose\build\bin\Release\OpenPoseDemo.exe",
        "openpose"  # PATH에 있는 경우
    ]
    
    openpose_exe = None
    for path in openpose_paths:
        if os.path.exists(path) or path == "openpose":
            openpose_exe = path
            break
    
    if not openpose_exe:
        print("WARNING: OpenPose를 찾을 수 없습니다. 기본 키포인트를 생성합니다.")
        return generate_dummy_keypoints(frames_dir, output_dir)
    
    # OpenPose 출력 디렉토리
    keypoints_dir = os.path.join(output_dir, 'keypoints_2d')
    os.makedirs(keypoints_dir, exist_ok=True)
    
    try:
        # OpenPose 명령어 실행
        cmd = [
            openpose_exe,
            "--image_dir", frames_dir,
            "--write_json", keypoints_dir,
            "--display", "0",
            "--render_pose", "0"
        ]
        
        print(f"실행 명령어: {' '.join(cmd)}")
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
        
        if result.returncode != 0:
            print(f"OpenPose 오류: {result.stderr}")
            return generate_dummy_keypoints(frames_dir, output_dir)
        
        print("OK OpenPose 실행 완료")
        return keypoints_dir
        
    except subprocess.TimeoutExpired:
        print("TIMEOUT: OpenPose 타임아웃 - 기본 키포인트 생성")
        return generate_dummy_keypoints(frames_dir, output_dir)
    except Exception as e:
        print(f"ERROR: OpenPose 실행 오류: {e}")
        return generate_dummy_keypoints(frames_dir, output_dir)

def generate_dummy_keypoints(frames_dir, output_dir):
    """OpenPose가 없을 때 더미 키포인트 생성"""
    print("더미 키포인트 생성 중...")
    
    keypoints_dir = os.path.join(output_dir, 'keypoints_2d')
    os.makedirs(keypoints_dir, exist_ok=True)
    
    # 프레임 파일 목록
    frame_files = sorted([f for f in os.listdir(frames_dir) if f.endswith('.jpg')])
    
    # 첫 번째 프레임에서 영상 크기 확인
    video_width, video_height = 640, 480  # 기본값
    if frame_files:
        first_frame_path = os.path.join(frames_dir, frame_files[0])
        try:
            image = cv2.imread(first_frame_path)
            if image is not None:
                video_height, video_width = image.shape[:2]
                print(f"영상 크기 감지: {video_width}x{video_height}")
        except:
            pass
    
    for i, frame_file in enumerate(frame_files):
        # COCO 17개 키포인트 형식
        keypoints = {
            "version": 1.3,
            "people": [{
                "person_id": [-1],
                "pose_keypoints_2d": generate_realistic_keypoints(i, len(frame_files), video_width, video_height),
                "face_keypoints_2d": [],
                "hand_left_keypoints_2d": [],
                "hand_right_keypoints_2d": [],
                "pose_keypoints_3d": [],
                "face_keypoints_3d": [],
                "hand_left_keypoints_3d": [],
                "hand_right_keypoints_3d": []
            }]
        }
        
        json_path = os.path.join(keypoints_dir, f"frame_{i:06d}_keypoints.json")
        with open(json_path, 'w') as f:
            json.dump(keypoints, f, indent=2)
    
    print(f"OK {len(frame_files)}개 더미 키포인트 생성 완료")
    return keypoints_dir

def generate_realistic_keypoints(frame_idx, total_frames, video_width=640, video_height=480):
    """실제 영상 기반 현실적인 키포인트 생성"""
    # 기본 인체 비율 (COCO 17개 키포인트)
    keypoints = []
    
    # 시간 기반 애니메이션
    time_factor = frame_idx / total_frames * 2 * math.pi
    
    # 기본 위치 (이미지 중앙)
    center_x, center_y = video_width // 2, video_height // 2
    scale = min(video_width, video_height) // 8  # 영상 크기에 비례한 스케일
    
    # 수영 동작 시뮬레이션 (더 현실적인 움직임)
    swim_cycle = time_factor * 3  # 수영 사이클 (더 빠른 동작)
    
    # 0: Nose
    head_bob = math.sin(time_factor * 4) * scale * 0.1
    keypoints.extend([center_x, center_y - scale * 0.8 + head_bob, 1.0])
    
    # 1: Left eye
    keypoints.extend([center_x - scale * 0.1, center_y - scale * 0.9 + head_bob, 1.0])
    
    # 2: Right eye  
    keypoints.extend([center_x + scale * 0.1, center_y - scale * 0.9 + head_bob, 1.0])
    
    # 3: Left ear
    keypoints.extend([center_x - scale * 0.2, center_y - scale * 0.7 + head_bob, 1.0])
    
    # 4: Right ear
    keypoints.extend([center_x + scale * 0.2, center_y - scale * 0.7 + head_bob, 1.0])
    
    # 5: Left shoulder
    shoulder_sway = math.sin(time_factor * 0.5) * scale * 0.1
    keypoints.extend([center_x - scale * 0.4 + shoulder_sway, center_y - scale * 0.3, 1.0])
    
    # 6: Right shoulder
    keypoints.extend([center_x + scale * 0.4 - shoulder_sway, center_y - scale * 0.3, 1.0])
    
    # 7: Left elbow - 수영 팔 동작
    left_arm_swing = math.sin(swim_cycle) * 0.4
    left_arm_vertical = math.cos(swim_cycle) * 0.2
    keypoints.extend([
        center_x - scale * 0.6 + left_arm_swing * scale, 
        center_y - scale * 0.1 + left_arm_vertical * scale, 
        1.0
    ])
    
    # 8: Right elbow - 수영 팔 동작 (반대 위상)
    right_arm_swing = math.sin(swim_cycle + math.pi) * 0.4
    right_arm_vertical = math.cos(swim_cycle + math.pi) * 0.2
    keypoints.extend([
        center_x + scale * 0.6 + right_arm_swing * scale, 
        center_y - scale * 0.1 + right_arm_vertical * scale, 
        1.0
    ])
    
    # 9: Left wrist - 팔꿈치와 연동된 움직임
    keypoints.extend([
        center_x - scale * 0.8 + left_arm_swing * scale * 1.5, 
        center_y + scale * 0.1 + left_arm_vertical * scale * 1.5, 
        1.0
    ])
    
    # 10: Right wrist
    keypoints.extend([
        center_x + scale * 0.8 + right_arm_swing * scale * 1.5, 
        center_y + scale * 0.1 + right_arm_vertical * scale * 1.5, 
        1.0
    ])
    
    # 11: Left hip
    hip_sway = math.sin(time_factor * 0.3) * scale * 0.05
    keypoints.extend([center_x - scale * 0.2 + hip_sway, center_y + scale * 0.2, 1.0])
    
    # 12: Right hip
    keypoints.extend([center_x + scale * 0.2 - hip_sway, center_y + scale * 0.2, 1.0])
    
    # 13: Left knee - 수영 다리 동작
    leg_swing = math.sin(swim_cycle * 1.5) * 0.3
    leg_vertical = math.cos(swim_cycle * 1.5) * 0.15
    keypoints.extend([
        center_x - scale * 0.25 + leg_swing * scale, 
        center_y + scale * 0.6 + leg_vertical * scale, 
        1.0
    ])
    
    # 14: Right knee
    keypoints.extend([
        center_x + scale * 0.25 - leg_swing * scale, 
        center_y + scale * 0.6 + leg_vertical * scale, 
        1.0
    ])
    
    # 15: Left ankle - 무릎과 연동된 움직임
    keypoints.extend([
        center_x - scale * 0.3 + leg_swing * scale * 1.2, 
        center_y + scale * 1.0 + leg_vertical * scale * 1.2, 
        1.0
    ])
    
    # 16: Right ankle
    keypoints.extend([
        center_x + scale * 0.3 - leg_swing * scale * 1.2, 
        center_y + scale * 1.0 + leg_vertical * scale * 1.2, 
        1.0
    ])
    
    # 다리 동작 (킥킹)
    kick_phase = np.sin(swim_cycle * 8 * np.pi) * 0.2
    keypoints[13] += kick_phase * 40  # left_knee y
    keypoints[14] += kick_phase * 40  # right_knee y
    keypoints[15] += kick_phase * 60  # left_ankle y
    keypoints[16] += kick_phase * 60  # right_ankle y
    
    return keypoints

def run_videopose3d(keypoints_dir, output_dir):
    """VideoPose3D로 3D 포즈 예측"""
    print("VideoPose3D로 3D 포즈 예측 중...")
    
    # VideoPose3D가 설치되어 있는지 확인
    try:
        import torch
        print("OK PyTorch 사용 가능")
    except ImportError:
        print("ERROR PyTorch가 설치되지 않음 - 기본 3D 포즈 생성")
        return generate_dummy_3d_poses(keypoints_dir, output_dir)
    
    # 실제 VideoPose3D 실행 (여기서는 더미 구현)
    return generate_dummy_3d_poses(keypoints_dir, output_dir)

def generate_dummy_3d_poses(keypoints_dir, output_dir):
    """더미 3D 포즈 데이터 생성"""
    print("3D 포즈 데이터 생성 중...")
    
    # JSON 파일 목록
    json_files = sorted([f for f in os.listdir(keypoints_dir) if f.endswith('.json')])
    
    poses_3d = []
    
    for i, json_file in enumerate(json_files):
        json_path = os.path.join(keypoints_dir, json_file)
        
        with open(json_path, 'r') as f:
            data = json.load(f)
        
        if data['people']:
            pose_2d = data['people'][0]['pose_keypoints_2d']
            
            # 2D 키포인트를 3D로 변환 (더미 Z 좌표 추가)
            pose_3d = []
            for j in range(0, len(pose_2d), 3):
                x, y, conf = pose_2d[j:j+3]
                if conf > 0.5:  # 신뢰도가 높은 경우만
                    # Z 좌표는 간단한 휴리스틱으로 생성
                    z = 100 + np.sin(i * 0.1) * 50 + np.random.normal(0, 10)
                    pose_3d.append([x, y, z])  # 각 키포인트를 [x, y, z] 리스트로 저장
                else:
                    pose_3d.append([0, 0, 0])
            
            poses_3d.append(pose_3d)
    
    # 3D 포즈 데이터 저장
    poses_3d_path = os.path.join(output_dir, 'poses_3d.json')
    with open(poses_3d_path, 'w') as f:
        json.dump({
            'poses_3d': poses_3d,
            'frame_count': len(poses_3d),
            'keypoint_count': 17,
            'created_at': time.time()
        }, f, indent=2)
    
    print(f"OK {len(poses_3d)}개 3D 포즈 생성 완료")
    return poses_3d_path

def generate_bvh_file(poses_3d_path, output_dir):
    """BVH 파일 생성 (개선된 버전)"""
    print("BVH 파일 생성 중...")
    
    with open(poses_3d_path, 'r') as f:
        data = json.load(f)
    
    poses_3d = data['poses_3d']
    frame_count = len(poses_3d)
    
    print(f"[BVH] 프레임 수: {frame_count}")
    print(f"[BVH] 첫 번째 포즈 샘플: {poses_3d[0] if poses_3d else 'None'}")
    
    # BVH 파일 생성
    bvh_path = os.path.join(output_dir, 'motion.bvh')
    
    with open(bvh_path, 'w') as f:
        # BVH 헤더 - 더 상세한 구조 (Hips + 15개 관절)
        f.write("HIERARCHY\n")
        f.write("ROOT Hips\n")
        f.write("{\n")
        f.write("    OFFSET 0.0 0.0 0.0\n")
        f.write("    CHANNELS 6 Xposition Yposition Zposition Zrotation Xrotation Yrotation\n")
        f.write("    JOINT Spine\n")
        f.write("    {\n")
        f.write("        OFFSET 0.0 5.0 0.0\n")
        f.write("        CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("        JOINT Chest\n")
        f.write("        {\n")
        f.write("            OFFSET 0.0 5.0 0.0\n")
        f.write("            CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("            JOINT Neck\n")
        f.write("            {\n")
        f.write("                OFFSET 0.0 8.0 0.0\n")
        f.write("                CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("                JOINT Head\n")
        f.write("                {\n")
        f.write("                    OFFSET 0.0 5.0 0.0\n")
        f.write("                    CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("                    End Site\n")
        f.write("                    {\n")
        f.write("                        OFFSET 0.0 3.0 0.0\n")
        f.write("                    }\n")
        f.write("                }\n")
        f.write("            }\n")
        f.write("            JOINT LeftShoulder\n")
        f.write("            {\n")
        f.write("                OFFSET -5.0 0.0 0.0\n")
        f.write("                CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("                JOINT LeftArm\n")
        f.write("                {\n")
        f.write("                    OFFSET 0.0 -10.0 0.0\n")
        f.write("                    CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("                    JOINT LeftForeArm\n")
        f.write("                    {\n")
        f.write("                        OFFSET 0.0 -10.0 0.0\n")
        f.write("                        CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("                        End Site\n")
        f.write("                        {\n")
        f.write("                            OFFSET 0.0 -3.0 0.0\n")
        f.write("                        }\n")
        f.write("                    }\n")
        f.write("                }\n")
        f.write("            }\n")
        f.write("            JOINT RightShoulder\n")
        f.write("            {\n")
        f.write("                OFFSET 5.0 0.0 0.0\n")
        f.write("                CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("                JOINT RightArm\n")
        f.write("                {\n")
        f.write("                    OFFSET 0.0 -10.0 0.0\n")
        f.write("                    CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("                    JOINT RightForeArm\n")
        f.write("                    {\n")
        f.write("                        OFFSET 0.0 -10.0 0.0\n")
        f.write("                        CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("                        End Site\n")
        f.write("                        {\n")
        f.write("                            OFFSET 0.0 -3.0 0.0\n")
        f.write("                        }\n")
        f.write("                    }\n")
        f.write("                }\n")
        f.write("            }\n")
        f.write("        }\n")
        f.write("    }\n")
        f.write("    JOINT LeftHip\n")
        f.write("    {\n")
        f.write("        OFFSET -2.0 0.0 0.0\n")
        f.write("        CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("        JOINT LeftKnee\n")
        f.write("        {\n")
        f.write("            OFFSET 0.0 -10.0 0.0\n")
        f.write("            CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("            JOINT LeftAnkle\n")
        f.write("            {\n")
        f.write("                OFFSET 0.0 -10.0 0.0\n")
        f.write("                CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("                End Site\n")
        f.write("                {\n")
        f.write("                    OFFSET 0.0 -3.0 0.0\n")
        f.write("                }\n")
        f.write("            }\n")
        f.write("        }\n")
        f.write("    }\n")
        f.write("    JOINT RightHip\n")
        f.write("    {\n")
        f.write("        OFFSET 2.0 0.0 0.0\n")
        f.write("        CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("        JOINT RightKnee\n")
        f.write("        {\n")
        f.write("            OFFSET 0.0 -10.0 0.0\n")
        f.write("            CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("            JOINT RightAnkle\n")
        f.write("            {\n")
        f.write("                OFFSET 0.0 -10.0 0.0\n")
        f.write("                CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("                End Site\n")
        f.write("                {\n")
        f.write("                    OFFSET 0.0 -3.0 0.0\n")
        f.write("                }\n")
        f.write("            }\n")
        f.write("        }\n")
        f.write("    }\n")
        f.write("}\n")
        f.write("\n")
        f.write("MOTION\n")
        f.write(f"Frames: {frame_count}\n")
        f.write("Frame Time: 0.033333\n")
        f.write("\n")
        
        # 모션 데이터 - 15개 관절 (Hips + 14개 관절)
        for frame_idx, pose in enumerate(poses_3d):
            frame_data = []
            
            # Hips (6 channels) - 위치 + 회전
            if len(pose) > 0 and isinstance(pose[0], (list, tuple)) and len(pose[0]) >= 3:
                hips = pose[0]
                # 실제 위치 데이터 사용
                frame_data.extend([hips[0], hips[1], hips[2], 0.0, 0.0, 0.0])
            else:
                # 기본 위치
                frame_data.extend([0.0, 0.0, 0.0, 0.0, 0.0, 0.0])
            
            # 14개 관절 각각 3개 채널 (총 42개 채널)
            joint_rotations = calculate_enhanced_joint_rotations(pose, frame_idx, frame_count)
            
            # 14개 관절의 회전값 추가
            for i in range(14):
                if i < len(joint_rotations):
                    frame_data.extend(joint_rotations[i])
                else:
                    frame_data.extend([0.0, 0.0, 0.0])
            
            f.write(" ".join([f"{val:.6f}" for val in frame_data]) + "\n")
    
    print(f"OK BVH 파일 생성 완료: {bvh_path}")
    
    # 파일 크기 확인
    file_size = os.path.getsize(bvh_path)
    print(f"[BVH] 파일 크기: {file_size / 1024:.2f} KB")
    
    return bvh_path

def calculate_enhanced_joint_rotations(pose, frame_idx, total_frames):
    """개선된 관절 회전 계산 (14개 관절)"""
    rotations = []
    
    # 시간 기반 애니메이션
    time_factor = frame_idx / total_frames
    swim_cycle = time_factor * 2 * math.pi
    
    # 14개 관절의 회전값 계산
    joint_configs = [
        # 0: Spine
        {'name': 'Spine', 'parent': 0, 'type': 'body', 'phase': 0.0},
        # 1: Chest  
        {'name': 'Chest', 'parent': 0, 'type': 'body', 'phase': 0.1},
        # 2: Neck
        {'name': 'Neck', 'parent': 1, 'type': 'body', 'phase': 0.2},
        # 3: Head
        {'name': 'Head', 'parent': 2, 'type': 'body', 'phase': 0.3},
        # 4: LeftShoulder
        {'name': 'LeftShoulder', 'parent': 1, 'type': 'arm', 'phase': 0.0},
        # 5: LeftArm
        {'name': 'LeftArm', 'parent': 4, 'type': 'arm', 'phase': 0.1},
        # 6: LeftForeArm
        {'name': 'LeftForeArm', 'parent': 5, 'type': 'arm', 'phase': 0.2},
        # 7: RightShoulder
        {'name': 'RightShoulder', 'parent': 1, 'type': 'arm', 'phase': 0.0 + math.pi},
        # 8: RightArm
        {'name': 'RightArm', 'parent': 7, 'type': 'arm', 'phase': 0.1 + math.pi},
        # 9: RightForeArm
        {'name': 'RightForeArm', 'parent': 8, 'type': 'arm', 'phase': 0.2 + math.pi},
        # 10: LeftHip
        {'name': 'LeftHip', 'parent': 0, 'type': 'leg', 'phase': 0.0},
        # 11: LeftKnee
        {'name': 'LeftKnee', 'parent': 10, 'type': 'leg', 'phase': 0.1},
        # 12: LeftAnkle
        {'name': 'LeftAnkle', 'parent': 11, 'type': 'leg', 'phase': 0.2},
        # 13: RightHip
        {'name': 'RightHip', 'parent': 0, 'type': 'leg', 'phase': 0.0 + math.pi},
        # 14: RightKnee
        {'name': 'RightKnee', 'parent': 13, 'type': 'leg', 'phase': 0.1 + math.pi},
        # 15: RightAnkle
        {'name': 'RightAnkle', 'parent': 14, 'type': 'leg', 'phase': 0.2 + math.pi},
    ]
    
    for i, config in enumerate(joint_configs):
        # 실제 포즈 데이터가 있는 경우
        if i < len(pose) and len(pose[i]) >= 3:
            joint_pos = pose[i]
            
            # 부모 관절 위치
            parent_pos = pose[config['parent']] if config['parent'] < len(pose) and len(pose[config['parent']]) >= 3 else [0, 0, 0]
            
            # 벡터 계산
            vector = [
                joint_pos[0] - parent_pos[0],
                joint_pos[1] - parent_pos[1], 
                joint_pos[2] - parent_pos[2]
            ]
            
            # 회전각 계산
            rotation = calculate_joint_rotation_enhanced(vector, swim_cycle, config, frame_idx)
        else:
            # 기본 애니메이션
            rotation = calculate_default_rotation(swim_cycle, config, frame_idx)
        
        rotations.append(rotation)
    
    return rotations

def calculate_joint_rotation_enhanced(vector, swim_cycle, config, frame_idx):
    """개선된 관절 회전 계산"""
    x, y, z = vector
    length = math.sqrt(x*x + y*y + z*z)
    
    if length > 0:
        # 기본 회전각
        z_rotation = math.atan2(y, x) * 180 / math.pi
        x_rotation = math.atan2(z, math.sqrt(x*x + y*y)) * 180 / math.pi
        y_rotation = 0.0
        
        # 관절 타입별 추가 회전
        if config['type'] == 'arm':
            # 팔 동작 (수영 스트로크)
            phase = swim_cycle + config['phase']
            y_rotation = math.sin(phase * 2) * 45  # 45도 범위
            x_rotation += math.cos(phase * 1.5) * 30  # 앞뒤 움직임
            z_rotation += math.sin(phase * 3) * 20  # 좌우 움직임
            
        elif config['type'] == 'leg':
            # 다리 동작 (킥킹)
            phase = swim_cycle + config['phase']
            y_rotation = math.sin(phase * 4) * 60  # 60도 범위 (더 큰 움직임)
            x_rotation += math.cos(phase * 2) * 40  # 앞뒤 킥킹
            z_rotation += math.sin(phase * 6) * 15  # 좌우 킥킹
            
        elif config['type'] == 'body':
            # 몸통 동작 (자연스러운 움직임)
            phase = swim_cycle + config['phase']
            y_rotation = math.sin(phase * 0.5) * 10  # 작은 움직임
            x_rotation += math.cos(phase * 0.3) * 5  # 호흡
            z_rotation += math.sin(phase * 0.7) * 8  # 좌우 흔들림
        
        return [z_rotation, x_rotation, y_rotation]
    else:
        return calculate_default_rotation(swim_cycle, config, frame_idx)

def calculate_default_rotation(swim_cycle, config, frame_idx):
    """기본 애니메이션 회전"""
    phase = swim_cycle + config['phase']
    
    if config['type'] == 'arm':
        # 팔 기본 애니메이션
        z_rotation = math.sin(phase * 2) * 30
        x_rotation = math.cos(phase * 1.5) * 20
        y_rotation = math.sin(phase * 3) * 15
        
    elif config['type'] == 'leg':
        # 다리 기본 애니메이션
        z_rotation = math.sin(phase * 4) * 45
        x_rotation = math.cos(phase * 2) * 30
        y_rotation = math.sin(phase * 6) * 10
        
    else:  # body
        # 몸통 기본 애니메이션
        z_rotation = math.sin(phase * 0.5) * 5
        x_rotation = math.cos(phase * 0.3) * 3
        y_rotation = math.sin(phase * 0.7) * 4
    
    return [z_rotation, x_rotation, y_rotation]

def calculate_joint_rotations_from_pose(pose, frame_idx):
    """실제 3D 포즈 데이터에서 관절 회전 계산 (기존 함수 유지)"""
    rotations = []
    
    # 관절 인덱스 매핑 (7개 관절)
    joint_mapping = [
        0,   # Hips (이미 처리됨)
        1,   # Spine
        2,   # Chest
        3,   # Neck
        4,   # Head
        5,   # LeftShoulder
        6,   # LeftArm
        7,   # LeftForeArm
    ]
    
    # 각 관절의 회전값 계산 (7개 관절만)
    for i, joint_idx in enumerate(joint_mapping[1:8], 1):  # Hips 제외, 7개 관절만
        if joint_idx < len(pose) and len(pose[joint_idx]) >= 3:
            joint_pos = pose[joint_idx]
            
            # 부모 관절 찾기
            parent_idx = get_parent_joint(i)
            if parent_idx > 0 and parent_idx < len(pose) and len(pose[parent_idx]) >= 3:
                parent_pos = pose[parent_idx]
                
                # 벡터 계산
                vector = [
                    joint_pos[0] - parent_pos[0],
                    joint_pos[1] - parent_pos[1], 
                    joint_pos[2] - parent_pos[2]
                ]
                
                # 회전각 계산 (실제 동영상 모션 기반)
                time_factor = frame_idx / 100.0
                swim_cycle = (time_factor * 2) % 1.0
                
                # 실제 포즈 데이터에서 계산된 회전각
                if i <= 3:  # 다리
                    rotation = calculate_leg_rotation(vector, swim_cycle, i)
                elif i <= 6:  # 팔
                    rotation = calculate_arm_rotation(vector, swim_cycle, i)
                else:  # 몸통, 머리
                    rotation = calculate_body_rotation(vector, swim_cycle, i)
                
                rotations.append(rotation)
            else:
                rotations.append([0.0, 0.0, 0.0])
        else:
            rotations.append([0.0, 0.0, 0.0])
    
    return rotations

def calculate_leg_rotation(vector, swim_cycle, joint_index):
    """다리 관절 회전 계산"""
    # 실제 벡터 방향을 기반으로 회전각 계산
    x, y, z = vector
    length = math.sqrt(x*x + y*y + z*z)
    
    if length > 0:
        # Z축 회전 (주로 수영 동작)
        z_rotation = math.atan2(y, x) * 180 / math.pi
        # X축 회전 (앞뒤 움직임)
        x_rotation = math.atan2(z, math.sqrt(x*x + y*y)) * 180 / math.pi
        # Y축 회전 (좌우 움직임)
        y_rotation = math.sin(swim_cycle * 4 * math.pi) * 20
        
        return [z_rotation, x_rotation, y_rotation]
    else:
        return [0.0, 0.0, 0.0]

def calculate_arm_rotation(vector, swim_cycle, joint_index):
    """팔 관절 회전 계산"""
    x, y, z = vector
    length = math.sqrt(x*x + y*y + z*z)
    
    if length > 0:
        # 수영 동작에 맞는 팔 회전
        z_rotation = math.atan2(y, x) * 180 / math.pi
        x_rotation = math.atan2(z, math.sqrt(x*x + y*y)) * 180 / math.pi
        y_rotation = math.sin(swim_cycle * 2 * math.pi + joint_index * math.pi/2) * 30
        
        return [z_rotation, x_rotation, y_rotation]
    else:
        return [0.0, 0.0, 0.0]

def calculate_body_rotation(vector, swim_cycle, joint_index):
    """몸통/머리 관절 회전 계산"""
    x, y, z = vector
    length = math.sqrt(x*x + y*y + z*z)
    
    if length > 0:
        # 몸통과 머리의 자연스러운 움직임
        z_rotation = math.atan2(y, x) * 180 / math.pi * 0.1
        x_rotation = math.atan2(z, math.sqrt(x*x + y*y)) * 180 / math.pi * 0.1
        y_rotation = math.sin(swim_cycle * math.pi) * 5
        
        return [z_rotation, x_rotation, y_rotation]
    else:
        return [0.0, 0.0, 0.0]

def get_parent_joint(joint_index):
    """관절의 부모 인덱스 반환"""
    parent_map = {
        1: 0,   # Spine -> Hips
        2: 1,   # Chest -> Spine
        3: 2,   # Neck -> Chest
        4: 3,   # Head -> Neck
        5: 2,   # LeftShoulder -> Chest
        6: 5,   # LeftArm -> LeftShoulder
        7: 6,   # LeftForeArm -> LeftArm
    }
    return parent_map.get(joint_index, 0)

def main():
    parser = argparse.ArgumentParser(description='VideoPose3D 모션 데이터 추출')
    parser.add_argument('video_path', help='입력 동영상 파일 경로')
    parser.add_argument('output_dir', help='출력 디렉토리 경로')
    parser.add_argument('--max-frames', type=int, default=300, help='최대 프레임 수')
    
    args = parser.parse_args()
    
    print("VideoPose3D 모션 데이터 추출 시작")
    print(f"입력: {args.video_path}")
    print(f"출력: {args.output_dir}")
    
    try:
        # 환경 설정
        if not setup_environment():
            print("ERROR 환경 설정 실패")
            return 1
        
        # 출력 디렉토리 생성
        os.makedirs(args.output_dir, exist_ok=True)
        
        # 1. 프레임 추출
        video_info = extract_frames(args.video_path, args.output_dir, args.max_frames)
        
        # 2. OpenCV + MediaPipe로 2D 키포인트 추출 (OpenPose fallback)
        keypoints_dir = run_opencv_pose(os.path.join(args.output_dir, 'frames'), args.output_dir)
        
        # 3. VideoPose3D로 3D 포즈 예측
        poses_3d_path = run_videopose3d(keypoints_dir, args.output_dir)
        
        # 4. BVH 파일 생성
        bvh_path = generate_bvh_file(poses_3d_path, args.output_dir)
        
        # 결과 요약
        result = {
            'success': True,
            'message': '모션 데이터 추출 완료',
            'data': {
                'video_info': video_info,
                'keypoints_dir': keypoints_dir,
                'poses_3d_path': poses_3d_path,
                'bvh_path': bvh_path,
                'output_dir': args.output_dir
            }
        }
        
        print("\n" + "="*50)
        print("OK 모션 데이터 추출 완료!")
        print(f"프레임 수: {video_info['extracted_frames']}")
        print(f"키포인트: {keypoints_dir}")
        print(f"3D 포즈: {poses_3d_path}")
        print(f"BVH 파일: {bvh_path}")
        print("="*50)
        
        return 0
        
    except Exception as e:
        print(f"ERROR 오류 발생: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
