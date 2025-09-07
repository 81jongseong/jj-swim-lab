#!/usr/bin/env python3
"""
완전한 파이프라인 테스트 스크립트
- 모든 단계 검증
- 수락 기준 확인
- 결과 리포트 생성
"""

import os
import sys
import json
import subprocess
import argparse
from pathlib import Path

def run_command(command, cwd=None):
    """명령어 실행"""
    try:
        result = subprocess.run(
            command, 
            shell=True, 
            cwd=cwd, 
            capture_output=True, 
            text=True, 
            encoding='utf-8'
        )
        return result.returncode == 0, result.stdout, result.stderr
    except Exception as e:
        return False, "", str(e)

def test_video_processing(video_path, output_dir):
    """비디오 처리 테스트"""
    print("[TEST] 비디오 처리 테스트...")
    
    if not os.path.exists(video_path):
        print(f"❌ 비디오 파일을 찾을 수 없습니다: {video_path}")
        return False, {}
    
    # 비디오 처리 스크립트 실행
    script_path = Path(__file__).parent / "process_video_fixed.py"
    command = f"python {script_path} --input {video_path} --output {output_dir}"
    
    success, stdout, stderr = run_command(command)
    
    if not success:
        print(f"❌ 비디오 처리 실패: {stderr}")
        return False, {}
    
    # 결과 파일 확인
    overlay_path = Path(output_dir) / "overlay.mp4"
    pose_stats_path = Path(output_dir) / "pose_stats.json"
    
    results = {
        "overlay_exists": overlay_path.exists(),
        "pose_stats_exists": pose_stats_path.exists(),
        "overlay_size": overlay_path.stat().st_size if overlay_path.exists() else 0
    }
    
    if pose_stats_path.exists():
        try:
            with open(pose_stats_path, 'r', encoding='utf-8') as f:
                pose_data = json.load(f)
                results["pose_stats"] = pose_data
        except:
            results["pose_stats"] = {}
    
    if results["overlay_exists"] and results["pose_stats_exists"]:
        print("✅ 비디오 처리 성공")
        return True, results
    else:
        print("❌ 비디오 처리 실패")
        return False, results

def test_bvh_validation(bvh_path):
    """BVH 검증 테스트"""
    print("[TEST] BVH 검증 테스트...")
    
    if not os.path.exists(bvh_path):
        print(f"❌ BVH 파일을 찾을 수 없습니다: {bvh_path}")
        return False, {}
    
    # BVH 검증 스크립트 실행
    script_path = Path(__file__).parent / "check_bvh.py"
    command = f"python {script_path} {bvh_path}"
    
    success, stdout, stderr = run_command(command)
    
    if not success:
        print(f"❌ BVH 검증 실패: {stderr}")
        return False, {}
    
    # 결과 파싱
    results = {}
    for line in stdout.split('\n'):
        if '프레임 수:' in line:
            results["frame_count"] = int(line.split(':')[1].strip())
        elif '지속시간:' in line:
            results["duration"] = float(line.split(':')[1].strip().replace('초', ''))
        elif '뼈대 개수:' in line:
            results["bone_count"] = int(line.split(':')[1].strip())
    
    if results.get("frame_count", 0) > 0 and results.get("duration", 0) > 0:
        print("✅ BVH 검증 성공")
        return True, results
    else:
        print("❌ BVH 검증 실패")
        return False, results

def test_blender_retarget(fbx_path, bvh_path, output_dir):
    """Blender 리타겟 테스트"""
    print("[TEST] Blender 리타겟 테스트...")
    
    if not os.path.exists(fbx_path):
        print(f"❌ FBX 파일을 찾을 수 없습니다: {fbx_path}")
        return False, {}
    
    if not os.path.exists(bvh_path):
        print(f"❌ BVH 파일을 찾을 수 없습니다: {bvh_path}")
        return False, {}
    
    # Blender 리타겟 스크립트 실행
    script_path = Path(__file__).parent / "blender_retarget_auto.py"
    output_json = Path(output_dir) / "retarget_result.json"
    command = f"python {script_path} --fbx {fbx_path} --bvh {bvh_path} --out_json {output_json}"
    
    success, stdout, stderr = run_command(command)
    
    if not success:
        print(f"❌ Blender 리타겟 실패: {stderr}")
        return False, {}
    
    # 결과 파일 확인
    if output_json.exists():
        try:
            with open(output_json, 'r', encoding='utf-8') as f:
                results = json.load(f)
            
            matched_count = results.get("matched_count", 0)
            if matched_count > 0:
                print(f"✅ Blender 리타겟 성공: {matched_count}개 본 매칭")
                return True, results
            else:
                print("❌ Blender 리타겟 실패: 본 매칭 없음")
                return False, results
        except:
            print("❌ Blender 리타겟 실패: 결과 파싱 오류")
            return False, {}
    else:
        print("❌ Blender 리타겟 실패: 결과 파일 없음")
        return False, {}

def test_blender_bake_export(fbx_path, bvh_path, output_dir):
    """Blender 베이킹 및 익스포트 테스트"""
    print("[TEST] Blender 베이킹 및 익스포트 테스트...")
    
    if not os.path.exists(fbx_path):
        print(f"❌ FBX 파일을 찾을 수 없습니다: {fbx_path}")
        return False, {}
    
    if not os.path.exists(bvh_path):
        print(f"❌ BVH 파일을 찾을 수 없습니다: {bvh_path}")
        return False, {}
    
    # Blender 베이킹 스크립트 실행
    script_path = Path(__file__).parent / "blender_force_bake_export.py"
    output_glb = Path(output_dir) / "animated_model.glb"
    command = f"python {script_path} --fbx {fbx_path} --bvh {bvh_path} --out_glb {output_glb} --out_dir {output_dir}"
    
    success, stdout, stderr = run_command(command)
    
    if not success:
        print(f"❌ Blender 베이킹 실패: {stderr}")
        return False, {}
    
    # 결과 파일 확인
    if output_glb.exists():
        file_size = output_glb.stat().st_size
        print(f"✅ Blender 베이킹 성공: {output_glb} ({file_size} bytes)")
        return True, {"glb_path": str(output_glb), "file_size": file_size}
    else:
        print("❌ Blender 베이킹 실패: GLB 파일 없음")
        return False, {}

def generate_test_report(results, output_dir):
    """테스트 리포트 생성"""
    print("[REPORT] 테스트 리포트 생성...")
    
    report = {
        "test_summary": {
            "video_processing": results.get("video_processing", {}).get("success", False),
            "bvh_validation": results.get("bvh_validation", {}).get("success", False),
            "blender_retarget": results.get("blender_retarget", {}).get("success", False),
            "blender_bake_export": results.get("blender_bake_export", {}).get("success", False)
        },
        "detailed_results": results,
        "acceptance_criteria": {
            "overlay_mp4_exists": results.get("video_processing", {}).get("overlay_exists", False),
            "pose_stats_ok": results.get("video_processing", {}).get("pose_stats", {}).get("verdict") == "ok",
            "bvh_frames_gt_0": results.get("bvh_validation", {}).get("frame_count", 0) > 0,
            "bvh_duration_gt_0": results.get("bvh_validation", {}).get("duration", 0) > 0,
            "retarget_matched_gt_0": results.get("blender_retarget", {}).get("matched_count", 0) > 0,
            "glb_export_success": results.get("blender_bake_export", {}).get("success", False)
        }
    }
    
    # 전체 성공 여부
    all_criteria = report["acceptance_criteria"]
    report["overall_success"] = all(
        all_criteria["overlay_mp4_exists"],
        all_criteria["pose_stats_ok"],
        all_criteria["bvh_frames_gt_0"],
        all_criteria["bvh_duration_gt_0"],
        all_criteria["retarget_matched_gt_0"],
        all_criteria["glb_export_success"]
    )
    
    # 리포트 저장
    report_path = Path(output_dir) / "test_report.json"
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    
    print(f"[REPORT] 리포트 저장됨: {report_path}")
    
    # 콘솔 출력
    print("\n" + "="*50)
    print("🎯 파이프라인 테스트 결과")
    print("="*50)
    
    for test_name, success in report["test_summary"].items():
        status = "✅ 성공" if success else "❌ 실패"
        print(f"{test_name}: {status}")
    
    print("\n📋 수락 기준:")
    for criterion, passed in report["acceptance_criteria"].items():
        status = "✅ 통과" if passed else "❌ 실패"
        print(f"  {criterion}: {status}")
    
    overall_status = "✅ 전체 성공" if report["overall_success"] else "❌ 전체 실패"
    print(f"\n🏆 전체 결과: {overall_status}")
    
    return report

def main():
    parser = argparse.ArgumentParser(description='완전한 파이프라인 테스트')
    parser.add_argument('--video', required=True, help='테스트 비디오 파일 경로')
    parser.add_argument('--fbx', required=True, help='FBX 모델 파일 경로')
    parser.add_argument('--output', required=True, help='출력 디렉토리')
    
    args = parser.parse_args()
    
    # 출력 디렉토리 생성
    output_dir = Path(args.output)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    results = {}
    
    try:
        print("🚀 완전한 파이프라인 테스트 시작")
        print(f"📁 출력 디렉토리: {output_dir}")
        
        # 1. 비디오 처리 테스트
        success, data = test_video_processing(args.video, str(output_dir))
        results["video_processing"] = {"success": success, **data}
        
        # BVH 파일 경로 (비디오 처리 결과에서 추정)
        bvh_path = output_dir / "pose_data.bvh"
        
        # 2. BVH 검증 테스트
        if bvh_path.exists():
            success, data = test_bvh_validation(str(bvh_path))
            results["bvh_validation"] = {"success": success, **data}
        else:
            print("❌ BVH 파일을 찾을 수 없습니다")
            results["bvh_validation"] = {"success": False}
        
        # 3. Blender 리타겟 테스트
        success, data = test_blender_retarget(args.fbx, str(bvh_path), str(output_dir))
        results["blender_retarget"] = {"success": success, **data}
        
        # 4. Blender 베이킹 및 익스포트 테스트
        success, data = test_blender_bake_export(args.fbx, str(bvh_path), str(output_dir))
        results["blender_bake_export"] = {"success": success, **data}
        
        # 5. 테스트 리포트 생성
        report = generate_test_report(results, str(output_dir))
        
        return 0 if report["overall_success"] else 1
        
    except Exception as e:
        print(f"[ERROR] 테스트 실패: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
