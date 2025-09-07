#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import json
import sys

# 현재 스크립트의 디렉토리를 Python 경로에 추가
script_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, script_dir)

from custom_model_3d_converter import create_animated_models_from_pose, create_dummy_files

def main():
    if len(sys.argv) != 2:
        print("사용법: python create_missing_files.py <analysis_dir>")
        sys.exit(1)
    
    analysis_dir = sys.argv[1]
    
    # 포즈 데이터 읽기
    pose_data_path = os.path.join(analysis_dir, "pose_data", "pose_data.json")
    if not os.path.exists(pose_data_path):
        print(f"포즈 데이터 파일을 찾을 수 없습니다: {pose_data_path}")
        sys.exit(1)
    
    with open(pose_data_path, 'r', encoding='utf-8') as f:
        pose_data = json.load(f)
    
    print(f"포즈 데이터 로드 완료: {len(pose_data)}개 프레임")
    
    # 애니메이션 모델 생성
    print("애니메이션 모델 생성 시작...")
    create_animated_models_from_pose(pose_data, analysis_dir)
    
    # 생성된 파일 확인
    animated_models_dir = os.path.join(analysis_dir, "animated_models")
    if os.path.exists(animated_models_dir):
        files = os.listdir(animated_models_dir)
        print(f"생성된 애니메이션 모델: {len(files)}개")
        for file in files[:5]:  # 처음 5개만 출력
            print(f"  - {file}")
    else:
        print("애니메이션 모델 디렉토리가 생성되지 않았습니다.")
    
    # 3D 비디오 파일 확인
    video_path = os.path.join(analysis_dir, "3d_video_simulation.mp4")
    if os.path.exists(video_path):
        print(f"3D 비디오 생성 완료: {video_path}")
    else:
        print("3D 비디오가 생성되지 않았습니다.")

if __name__ == "__main__":
    main()







