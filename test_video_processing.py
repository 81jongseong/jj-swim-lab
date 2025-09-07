#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
영상 처리 파이프라인 테스트 스크립트
"""

import os
import sys
import subprocess
import json
from pathlib import Path

def test_video_processing():
    """영상 처리 파이프라인 테스트"""
    print("🧪 영상 처리 파이프라인 테스트 시작")
    
    # 테스트 영상 경로 (기존 처리된 영상 사용)
    test_video_path = "server/uploads/processed/video-1757081750666-326886641/input_video.mp4"
    output_dir = "test_output"
    
    # 출력 디렉토리 생성
    os.makedirs(output_dir, exist_ok=True)
    
    if not os.path.exists(test_video_path):
        print(f"❌ 테스트 영상이 없습니다: {test_video_path}")
        return False
    
    print(f"📹 테스트 영상: {test_video_path}")
    print(f"📁 출력 디렉토리: {output_dir}")
    
    try:
        # 1. VideoPose3D 스크립트 실행
        print("\n🔍 1단계: VideoPose3D로 모션 데이터 추출")
        script_path = "server/scripts/videopose3d_extractor.py"
        
        cmd = [
            "py", "-3.11", script_path,
            test_video_path,
            output_dir,
            "--max-frames", "100"
        ]
        
        print(f"실행 명령어: {' '.join(cmd)}")
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
        
        if result.returncode != 0:
            print(f"❌ VideoPose3D 실행 실패:")
            print(f"STDOUT: {result.stdout}")
            print(f"STDERR: {result.stderr}")
            return False
        
        print("✅ VideoPose3D 실행 완료")
        print(f"STDOUT: {result.stdout}")
        
        # 2. 생성된 파일들 확인
        print("\n📋 2단계: 생성된 파일들 확인")
        
        files_to_check = [
            "frames",
            "keypoints_2d", 
            "poses_3d.json",
            "motion.bvh"
        ]
        
        for file_name in files_to_check:
            file_path = os.path.join(output_dir, file_name)
            if os.path.exists(file_path):
                if os.path.isdir(file_path):
                    file_count = len(os.listdir(file_path))
                    print(f"✅ {file_name}: 디렉토리 (파일 {file_count}개)")
                else:
                    file_size = os.path.getsize(file_path)
                    print(f"✅ {file_name}: 파일 ({file_size / 1024:.2f} KB)")
            else:
                print(f"❌ {file_name}: 없음")
        
        # 3. BVH 파일 내용 확인
        print("\n🔍 3단계: BVH 파일 내용 확인")
        bvh_path = os.path.join(output_dir, "motion.bvh")
        
        if os.path.exists(bvh_path):
            with open(bvh_path, 'r') as f:
                bvh_content = f.read()
            
            lines = bvh_content.split('\n')
            print(f"BVH 파일 라인 수: {len(lines)}")
            
            # MOTION 섹션 찾기
            motion_start = -1
            for i, line in enumerate(lines):
                if line.strip() == "MOTION":
                    motion_start = i
                    break
            
            if motion_start >= 0:
                print(f"MOTION 섹션 시작: 라인 {motion_start + 1}")
                
                # 프레임 수 확인
                if motion_start + 1 < len(lines):
                    frames_line = lines[motion_start + 1]
                    print(f"프레임 정보: {frames_line}")
                
                # 첫 번째 프레임 데이터 확인
                if motion_start + 3 < len(lines):
                    first_frame = lines[motion_start + 3]
                    values = first_frame.split()
                    print(f"첫 번째 프레임 데이터: {len(values)}개 값")
                    print(f"첫 번째 프레임 샘플: {values[:10]}...")
            else:
                print("❌ MOTION 섹션을 찾을 수 없습니다")
        else:
            print("❌ BVH 파일이 생성되지 않았습니다")
        
        # 4. 3D 포즈 데이터 확인
        print("\n🔍 4단계: 3D 포즈 데이터 확인")
        poses_path = os.path.join(output_dir, "poses_3d.json")
        
        if os.path.exists(poses_path):
            with open(poses_path, 'r') as f:
                poses_data = json.load(f)
            
            print(f"3D 포즈 데이터:")
            print(f"  - 프레임 수: {poses_data.get('frame_count', 0)}")
            print(f"  - 키포인트 수: {poses_data.get('keypoint_count', 0)}")
            
            if 'poses_3d' in poses_data and poses_data['poses_3d']:
                first_pose = poses_data['poses_3d'][0]
                print(f"  - 첫 번째 포즈: {len(first_pose)}개 키포인트")
                print(f"  - 첫 번째 키포인트: {first_pose[0] if first_pose else 'None'}")
        else:
            print("❌ 3D 포즈 데이터 파일이 없습니다")
        
        print("\n✅ 영상 처리 파이프라인 테스트 완료!")
        return True
        
    except subprocess.TimeoutExpired:
        print("❌ 타임아웃: VideoPose3D 실행 시간 초과")
        return False
    except Exception as e:
        print(f"❌ 오류 발생: {e}")
        return False

if __name__ == "__main__":
    success = test_video_processing()
    sys.exit(0 if success else 1)


