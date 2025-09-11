#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
실시간 모션 추출 스크립트
MediaPipe → 포즈 데이터 → GLB 애니메이션 생성
"""

import cv2
import numpy as np
import json
import argparse
from pathlib import Path
import mediapipe as mp

def extract_pose_from_video(video_path, output_path):
    """동영상에서 포즈 데이터 추출"""
    print(f"[EXTRACT] 동영상 처리 시작: {video_path}")
    
    # MediaPipe 초기화
    mp_pose = mp.solutions.pose
    mp_drawing = mp.solutions.drawing_utils
    
    # 비디오 캡처
    cap = cv2.VideoCapture(str(video_path))
    
    if not cap.isOpened():
        print(f"[ERROR] 비디오를 열 수 없습니다: {video_path}")
        return False
    
    # 프레임 정보
    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    duration = total_frames / fps
    
    print(f"[INFO] FPS: {fps}, 총 프레임: {total_frames}, 지속시간: {duration:.2f}초")
    
    # 포즈 데이터 저장
    pose_data = {
        "fps": fps,
        "total_frames": total_frames,
        "duration": duration,
        "keypoints": []
    }
    
    frame_count = 0
    
    with mp_pose.Pose(
        static_image_mode=False,
        model_complexity=2,
        enable_segmentation=False,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5
    ) as pose:
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            
            # BGR to RGB 변환
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            
            # 포즈 추출
            results = pose.process(rgb_frame)
            
            if results.pose_landmarks:
                # 키포인트 데이터 추출
                landmarks = []
                for landmark in results.pose_landmarks.landmark:
                    landmarks.append({
                        "x": landmark.x,
                        "y": landmark.y,
                        "z": landmark.z,
                        "visibility": landmark.visibility
                    })
                
                pose_data["keypoints"].append({
                    "frame": frame_count,
                    "timestamp": frame_count / fps,
                    "landmarks": landmarks
                })
            
            frame_count += 1
            
            # 진행률 표시
            if frame_count % 30 == 0:
                progress = (frame_count / total_frames) * 100
                print(f"[PROGRESS] {progress:.1f}% 완료 ({frame_count}/{total_frames})")
    
    cap.release()
    
    # 데이터 저장
    output_file = Path(output_path)
    output_file.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(pose_data, f, indent=2, ensure_ascii=False)
    
    print(f"[SUCCESS] 포즈 데이터 추출 완료: {output_file}")
    print(f"[INFO] 총 {len(pose_data['keypoints'])}개 프레임 처리됨")
    
    return True

def create_glb_animation_from_pose(pose_data_path, output_glb_path):
    """포즈 데이터를 GLB 애니메이션으로 변환"""
    print(f"[CONVERT] GLB 애니메이션 생성 시작")
    
    # 포즈 데이터 로드
    with open(pose_data_path, 'r', encoding='utf-8') as f:
        pose_data = json.load(f)
    
    # Blender 스크립트 호출
    blender_script = Path(__file__).parent / "blender_create_animation.py"
    
    import subprocess
    import sys
    
    cmd = [
        "blender",
        "--background",
        "--python", str(blender_script),
        "--",
        "--pose-data", pose_data_path,
        "--output", output_glb_path
    ]
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
        
        if result.returncode == 0:
            print(f"[SUCCESS] GLB 애니메이션 생성 완료: {output_glb_path}")
            return True
        else:
            print(f"[ERROR] Blender 실행 실패: {result.stderr}")
            return False
            
    except subprocess.TimeoutExpired:
        print("[ERROR] Blender 실행 시간 초과")
        return False
    except Exception as e:
        print(f"[ERROR] Blender 실행 오류: {e}")
        return False

def main():
    parser = argparse.ArgumentParser(description="실시간 모션 추출")
    parser.add_argument("--video", required=True, help="입력 동영상 파일")
    parser.add_argument("--output", required=True, help="출력 GLB 파일")
    parser.add_argument("--pose-data", help="포즈 데이터 JSON 파일 (선택사항)")
    
    args = parser.parse_args()
    
    video_path = Path(args.video)
    output_path = Path(args.output)
    
    if not video_path.exists():
        print(f"[ERROR] 동영상 파일이 존재하지 않습니다: {video_path}")
        return 1
    
    # 1단계: 포즈 데이터 추출
    pose_data_path = args.pose_data or output_path.with_suffix('.json')
    
    if not extract_pose_from_video(video_path, pose_data_path):
        return 1
    
    # 2단계: GLB 애니메이션 생성
    if not create_glb_animation_from_pose(pose_data_path, output_path):
        return 1
    
    print(f"[COMPLETE] 모든 작업 완료!")
    print(f"[OUTPUT] GLB 파일: {output_path}")
    print(f"[OUTPUT] 포즈 데이터: {pose_data_path}")
    
    return 0

if __name__ == "__main__":
    exit(main())
