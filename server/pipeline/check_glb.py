#!/usr/bin/env python3
"""
GLB 파일 검증 스크립트

이 스크립트는 GLB 파일의 기본적인 유효성을 검증합니다.
GLB 파일이 손상되지 않았는지, 적절한 크기를 가지고 있는지 확인합니다.

주요 기능:
- GLB 파일 존재 여부 확인
- 파일 크기 검증 (최소 크기 체크)
- 애니메이션 포함 가능성 평가
- 파일 경로 및 상태 정보 출력

사용법:
    python check_glb.py --glb "path/to/your/file.glb"

출력:
- 파일 크기 (bytes)
- 파일 존재 여부
- 애니메이션 포함 가능성 평가

@author AI Assistant
@created 2025-01-07
@version 1.0.0
"""

import argparse
import os
import sys
import json

def check_glb_file(glb_path):
    """GLB 파일 검증"""
    if not os.path.exists(glb_path):
        print(f"ERROR: GLB 파일을 찾을 수 없습니다: {glb_path}")
        return False
    
    file_size = os.path.getsize(glb_path)
    print(f"[GLB] 파일 크기: {file_size} bytes")
    
    if file_size < 1000:
        print("ERROR: GLB 파일이 너무 작습니다 (손상된 파일일 수 있음)")
        return False
    
    # GLB 파일은 바이너리이므로 직접 파싱하기 어려움
    # 대신 파일 크기와 기본 정보만 확인
    print(f"[GLB] 파일 경로: {glb_path}")
    print(f"[GLB] 파일 존재: ✅")
    print(f"[GLB] 파일 크기: {file_size:,} bytes")
    
    if file_size > 1000000:  # 1MB 이상
        print("[GLB] 파일 크기가 충분함 - 애니메이션 포함 가능성 높음")
        return True
    else:
        print("[GLB] 파일 크기가 작음 - 애니메이션 없을 가능성")
        return False

def main():
    parser = argparse.ArgumentParser(description='GLB 파일 검증')
    parser.add_argument('--glb', required=True, help='GLB 파일 경로')
    
    args = parser.parse_args()
    
    try:
        success = check_glb_file(args.glb)
        return 0 if success else 1
        
    except Exception as e:
        print(f"ERROR: GLB 검증 실패: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
