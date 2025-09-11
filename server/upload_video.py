#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
수영 동영상 업로드 및 모션 추출 스크립트
사용법: python upload_video.py "동영상파일경로"
"""

import os
import sys
import shutil
from pathlib import Path
import time
import unicodedata

def normalize_unicode_path(path):
    """유니코드 경로 NFC 정규화"""
    return unicodedata.normalize('NFC', str(path))

def upload_and_process_video(video_path):
    """동영상 업로드 및 모션 추출"""
    
    # 입력 파일 검증
    video_path = Path(normalize_unicode_path(video_path)).resolve()
    if not video_path.exists():
        print(f"❌ 동영상 파일이 존재하지 않습니다: {video_path}")
        return False
    
    if not video_path.suffix.lower() in ['.mp4', '.avi', '.mov', '.mkv']:
        print(f"❌ 지원하지 않는 동영상 형식입니다: {video_path.suffix}")
        return False
    
    # 출력 디렉토리 생성
    timestamp = int(time.time() * 1000)
    random_id = int(time.time() * 1000) % 1000000000
    output_dir = Path(f"uploads/processed/video-{timestamp}-{random_id}")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"📁 출력 디렉토리: {output_dir}")
    
    # 동영상 파일 복사
    input_video_path = output_dir / "input_video.mp4"
    shutil.copy2(video_path, input_video_path)
    print(f"📹 동영상 복사 완료: {input_video_path}")
    
    # 모션 추출 실행
    print("🔄 모션 추출 시작...")
    try:
        import subprocess
        
        # 1단계: 기본 모션 추출
        result1 = subprocess.run([
            sys.executable, 
            "pipeline/process_video.py",
            "--video", str(input_video_path),
            "--out", str(output_dir),
            "--max_frames", "300"
        ], capture_output=True, text=True, cwd=Path.cwd())
        
        if result1.returncode == 0:
            print("✅ 기본 모션 추출 완료!")
            
            # 2단계: 개선된 BVH 생성
            print("🔄 개선된 BVH 생성...")
            result2 = subprocess.run([
                sys.executable,
                "pipeline/create_improved_bvh.py",
                str(output_dir / "poses3d.npy"),
                "30.0",
                str(output_dir / "motion_improved.bvh")
            ], capture_output=True, text=True, cwd=Path.cwd())
            
            if result2.returncode == 0:
                print("✅ 개선된 BVH 생성 완료!")
            else:
                print("⚠️ 개선된 BVH 생성 실패, 기본 BVH 사용")
            
            print(f"📊 생성된 파일들:")
            print(f"   - 키포인트: {output_dir / 'keypoints_2d.json'}")
            print(f"   - 3D 포즈: {output_dir / 'poses3d.npy'}")
            print(f"   - 기본 BVH: {output_dir / 'motion.bvh'}")
            print(f"   - 개선 BVH: {output_dir / 'motion_improved.bvh'}")
            print(f"   - 동영상: {input_video_path}")
            
            # 개선된 BVH 파일 크기 확인
            improved_bvh_path = output_dir / "motion_improved.bvh"
            if improved_bvh_path.exists():
                bvh_size = improved_bvh_path.stat().st_size
                print(f"📏 개선된 BVH 파일 크기: {bvh_size:,} bytes")
                
                # BVH 내용 미리보기
                with open(improved_bvh_path, 'r', encoding='utf-8') as f:
                    lines = f.readlines()
                    print(f"📄 BVH 프레임 수: {[line for line in lines if 'Frames:' in line][0].strip() if any('Frames:' in line for line in lines) else 'N/A'}")
            
            return True
        else:
            print(f"❌ 모션 추출 실패:")
            print(f"   stdout: {result1.stdout}")
            print(f"   stderr: {result1.stderr}")
            return False
            
    except Exception as e:
        print(f"❌ 모션 추출 중 오류 발생: {e}")
        return False

def main():
    if len(sys.argv) != 2:
        print("사용법: python upload_video.py \"동영상파일경로\"")
        print("예시: python upload_video.py \"C:\\Users\\user\\Desktop\\swim_video.mp4\"")
        sys.exit(1)
    
    video_path = sys.argv[1]
    print(f"🎬 수영 동영상 업로드 및 모션 추출")
    print(f"📹 입력 파일: {video_path}")
    print("-" * 50)
    
    success = upload_and_process_video(video_path)
    
    if success:
        print("-" * 50)
        print("🎉 업로드 및 모션 추출이 완료되었습니다!")
        print("💡 다음 단계: 블렌더에서 BVH 파일을 사용하여 모델에 애니메이션을 적용하세요.")
    else:
        print("-" * 50)
        print("❌ 업로드 및 모션 추출에 실패했습니다.")
        sys.exit(1)

if __name__ == "__main__":
    main()
