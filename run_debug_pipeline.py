#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
디버그 파이프라인 실행 스크립트
- 4단계 디버그 도구를 순차적으로 실행
"""

import subprocess
import sys
import os
from pathlib import Path
import json

def run_command(cmd, description):
    """명령어 실행"""
    print(f"\n{'='*60}")
    print(f"[STEP] {description}")
    print(f"[CMD] {' '.join(cmd)}")
    print('='*60)
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        print(result.stdout)
        if result.stderr:
            print(f"[STDERR] {result.stderr}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"[ERROR] 명령어 실행 실패: {e}")
        print(f"[STDOUT] {e.stdout}")
        print(f"[STDERR] {e.stderr}")
        return False

def check_file_exists(file_path, description):
    """파일 존재 확인"""
    if not Path(file_path).exists():
        print(f"[ERROR] {description} 파일을 찾을 수 없습니다: {file_path}")
        return False
    return True

def main():
    if len(sys.argv) < 3:
        print("사용법: python run_debug_pipeline.py <video_path> <output_dir> [fbx_path]")
        print("예시: python run_debug_pipeline.py /path/to/video.mp4 /path/to/output /path/to/model.fbx")
        sys.exit(1)
    
    video_path = Path(sys.argv[1]).resolve()
    output_dir = Path(sys.argv[2]).resolve()
    fbx_path = Path(sys.argv[3]).resolve() if len(sys.argv) > 3 else None
    
    print(f"[PIPELINE] 디버그 파이프라인 시작")
    print(f"  - 비디오: {video_path}")
    print(f"  - 출력: {output_dir}")
    print(f"  - FBX: {fbx_path}")
    
    # 출력 디렉토리 생성
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # 1단계: 모션 추출 검증
    print(f"\n{'='*60}")
    print("[STEP 1] 모션 추출 검증")
    print('='*60)
    
    if not check_file_exists(video_path, "비디오"):
        sys.exit(1)
    
    cmd1 = [
        "python", "debug_pose_extract.py",
        "--video", str(video_path),
        "--out", str(output_dir),
        "--fps", "30"
    ]
    
    if not run_command(cmd1, "2D 포즈 추출 및 가시화"):
        print("[ERROR] 1단계 실패: 모션 추출 검증")
        sys.exit(1)
    
    # 결과 확인
    pose_stats_path = output_dir / "pose_stats.json"
    if pose_stats_path.exists():
        with open(pose_stats_path, 'r') as f:
            stats = json.load(f)
        
        if stats['verdict'] != 'ok':
            print(f"[WARNING] 모션 품질 부족: {stats['verdict']}")
            print(f"  - 유효 프레임: {stats['valid_frames']}/{stats['total_frames']}")
            print(f"  - 총 이동량: {stats['total_movement']:.2f}")
        else:
            print("[SUCCESS] 모션 추출 검증 성공!")
    
    # 2단계: BVH 검증 (기존 BVH가 있는 경우)
    bvh_path = output_dir / "motion.bvh"
    if bvh_path.exists():
        print(f"\n{'='*60}")
        print("[STEP 2] BVH 유효성 검증")
        print('='*60)
        
        cmd2 = [
            "python", "check_bvh.py",
            "--bvh", str(bvh_path)
        ]
        
        if not run_command(cmd2, "BVH 파일 검증"):
            print("[ERROR] 2단계 실패: BVH 검증")
            sys.exit(1)
        
        print("[SUCCESS] BVH 검증 성공!")
    else:
        print("[SKIP] BVH 파일이 없어서 검증을 건너뜁니다")
    
    # 3단계: Blender 리타겟 (FBX가 있는 경우)
    if fbx_path and fbx_path.exists():
        print(f"\n{'='*60}")
        print("[STEP 3] Blender 자동 리타겟")
        print('='*60)
        
        # BVH 파일 확인
        if not bvh_path.exists():
            print("[ERROR] BVH 파일이 없어서 리타겟을 수행할 수 없습니다")
            sys.exit(1)
        
        output_glb = output_dir / "result.glb"
        
        cmd3 = [
            "blender", "--background", "--python", "blender_retarget_auto.py", "--",
            "--fbx", str(fbx_path),
            "--bvh", str(bvh_path),
            "--out_glb", str(output_glb),
            "--start", "1",
            "--end", "100"
        ]
        
        if not run_command(cmd3, "Blender 리타겟 및 GLB 내보내기"):
            print("[ERROR] 3단계 실패: Blender 리타겟")
            sys.exit(1)
        
        print("[SUCCESS] Blender 리타겟 성공!")
    else:
        print("[SKIP] FBX 파일이 없어서 리타겟을 건너뜁니다")
    
    # 4단계: Three.js 검증
    print(f"\n{'='*60}")
    print("[STEP 4] Three.js 검증")
    print('='*60)
    
    # GLB 파일 확인
    glb_path = output_dir / "result.glb"
    if not glb_path.exists():
        print("[ERROR] GLB 파일이 없어서 Three.js 검증을 수행할 수 없습니다")
        sys.exit(1)
    
    # GLB 파일을 public 디렉토리로 복사
    public_dir = Path("client/public")
    public_dir.mkdir(parents=True, exist_ok=True)
    
    import shutil
    shutil.copy2(glb_path, public_dir / "animated_model.glb")
    
    print("[SUCCESS] GLB 파일을 public 디렉토리로 복사했습니다")
    print(f"  - 원본: {glb_path}")
    print(f"  - 복사본: {public_dir / 'animated_model.glb'}")
    
    # Three.js 테스트 페이지 안내
    print(f"\n{'='*60}")
    print("[STEP 4] Three.js 검증 안내")
    print('='*60)
    print("1. 다음 명령어로 서버를 시작하세요:")
    print("   cd client && npm run dev")
    print("2. 브라우저에서 http://localhost:3000/animation-test 를 열어주세요")
    print("3. 콘솔에서 다음 로그를 확인하세요:")
    print("   - [ANIMS] count, name, duration")
    print("   - [TRACK] 첫 5개 track name")
    print("   - [SCENE] SkinnedMesh count, Bone count")
    print("   - [MOTION] true/false")
    print("4. 스켈레톤 표시: H 키 또는 '스켈레톤' 버튼")
    print("5. 애니메이션 제어: 스페이스바 또는 버튼")
    
    print(f"\n{'='*60}")
    print("[PIPELINE] 디버그 파이프라인 완료!")
    print('='*60)
    print("다음 파일들을 확인하세요:")
    print(f"  - 2D 오버레이: {output_dir / 'overlay.mp4'}")
    print(f"  - 포즈 통계: {output_dir / 'pose_stats.json'}")
    print(f"  - 본 매핑: {output_dir / 'bone_map.json'}")
    print(f"  - 최종 GLB: {output_dir / 'result.glb'}")

if __name__ == "__main__":
    main()


