#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
수영 애니메이션 생성 스크립트
- GLB 모델의 실제 뼈대 구조에 맞는 자연스러운 수영 동작 생성
"""

import os
import sys
import math

def create_swim_animation_bvh(output_bvh, frame_count=120):
    """자연스러운 수영 애니메이션 BVH 파일 생성"""
    print(f"[SWIM ANIM] 수영 애니메이션 BVH 생성: {output_bvh}")
    print(f"[SWIM ANIM] 프레임 수: {frame_count}")
    
    with open(output_bvh, 'w') as f:
        # BVH 헤더 - 수영에 적합한 간단한 구조
        f.write("HIERARCHY\n")
        f.write("ROOT rootx\n")
        f.write("{\n")
        f.write("    OFFSET 0.0 0.0 0.0\n")
        f.write("    CHANNELS 6 Xposition Yposition Zposition Zrotation Xrotation Yrotation\n")
        f.write("    JOINT spine_01x\n")
        f.write("    {\n")
        f.write("        OFFSET 0.0 8.0 0.0\n")
        f.write("        CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("        JOINT spine_02x\n")
        f.write("        {\n")
        f.write("            OFFSET 0.0 8.0 0.0\n")
        f.write("            CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("            JOINT spine_03x\n")
        f.write("            {\n")
        f.write("                OFFSET 0.0 8.0 0.0\n")
        f.write("                CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("                JOINT neckx\n")
        f.write("                {\n")
        f.write("                    OFFSET 0.0 6.0 0.0\n")
        f.write("                    CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("                    JOINT headx\n")
        f.write("                    {\n")
        f.write("                        OFFSET 0.0 4.0 0.0\n")
        f.write("                        CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("                        End Site\n")
        f.write("                        {\n")
        f.write("                            OFFSET 0.0 2.0 0.0\n")
        f.write("                        }\n")
        f.write("                    }\n")
        f.write("                }\n")
        f.write("                JOINT shoulderr\n")
        f.write("                {\n")
        f.write("                    OFFSET 6.0 0.0 0.0\n")
        f.write("                    CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("                    JOINT arm_stretchr\n")
        f.write("                    {\n")
        f.write("                        OFFSET 0.0 -12.0 0.0\n")
        f.write("                        CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("                        JOINT forearm_stretchr\n")
        f.write("                        {\n")
        f.write("                            OFFSET 0.0 -12.0 0.0\n")
        f.write("                            CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("                            End Site\n")
        f.write("                            {\n")
        f.write("                                OFFSET 0.0 -4.0 0.0\n")
        f.write("                            }\n")
        f.write("                        }\n")
        f.write("                    }\n")
        f.write("                }\n")
        f.write("                JOINT shoulderl\n")
        f.write("                {\n")
        f.write("                    OFFSET -6.0 0.0 0.0\n")
        f.write("                    CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("                    JOINT arm_stretchl\n")
        f.write("                    {\n")
        f.write("                        OFFSET 0.0 -12.0 0.0\n")
        f.write("                        CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("                        JOINT forearm_stretchl\n")
        f.write("                        {\n")
        f.write("                            OFFSET 0.0 -12.0 0.0\n")
        f.write("                            CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("                            End Site\n")
        f.write("                            {\n")
        f.write("                                OFFSET 0.0 -4.0 0.0\n")
        f.write("                            }\n")
        f.write("                        }\n")
        f.write("                    }\n")
        f.write("                }\n")
        f.write("            }\n")
        f.write("        }\n")
        f.write("    }\n")
        f.write("    JOINT thigh_stretchl\n")
        f.write("    {\n")
        f.write("        OFFSET -3.0 0.0 0.0\n")
        f.write("        CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("        JOINT leg_stretchl\n")
        f.write("        {\n")
        f.write("            OFFSET 0.0 -15.0 0.0\n")
        f.write("            CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("            End Site\n")
        f.write("            {\n")
        f.write("                OFFSET 0.0 -5.0 0.0\n")
        f.write("            }\n")
        f.write("        }\n")
        f.write("    }\n")
        f.write("    JOINT thigh_stretchr\n")
        f.write("    {\n")
        f.write("        OFFSET 3.0 0.0 0.0\n")
        f.write("        CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("        JOINT leg_stretchr\n")
        f.write("        {\n")
        f.write("            OFFSET 0.0 -15.0 0.0\n")
        f.write("            CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("            End Site\n")
        f.write("            {\n")
        f.write("                OFFSET 0.0 -5.0 0.0\n")
        f.write("            }\n")
        f.write("        }\n")
        f.write("    }\n")
        f.write("}\n")
        f.write("\n")
        f.write("MOTION\n")
        f.write(f"Frames: {frame_count}\n")
        f.write("Frame Time: 0.033333\n")
        f.write("\n")
        
        # 자연스러운 수영 동작 생성
        for frame_idx in range(frame_count):
            frame_data = []
            
            # 시간 기반 애니메이션 (2초 주기)
            time_factor = frame_idx / frame_count
            swim_cycle = time_factor * 2 * math.pi
            
            # rootx (6 channels) - 수영자의 전체 움직임
            root_x = math.sin(swim_cycle * 0.3) * 2.0  # 좌우 흔들림
            root_y = 0.0  # 높이 고정
            root_z = math.cos(swim_cycle * 0.2) * 1.5  # 앞뒤 움직임
            root_rot_x = math.sin(swim_cycle * 0.4) * 5.0  # 상하 기울임
            root_rot_y = 0.0  # 좌우 회전 없음
            root_rot_z = math.sin(swim_cycle * 0.3) * 3.0  # 좌우 기울임
            frame_data.extend([root_x, root_y, root_z, root_rot_x, root_rot_y, root_rot_z])
            
            # 12개 관절 각각 3개 채널 (총 36개 채널)
            joint_configs = [
                # 0: spine_01x - 몸통 상하 움직임
                {'name': 'spine_01x', 'phase': 0.0, 'amplitude': 8.0, 'freq': 1.2},
                # 1: spine_02x - 몸통 좌우 움직임  
                {'name': 'spine_02x', 'phase': 0.2, 'amplitude': 5.0, 'freq': 1.0},
                # 2: spine_03x - 몸통 회전
                {'name': 'spine_03x', 'phase': 0.4, 'amplitude': 3.0, 'freq': 0.8},
                # 3: neckx - 목 움직임
                {'name': 'neckx', 'phase': 0.1, 'amplitude': 4.0, 'freq': 1.1},
                # 4: headx - 머리 움직임
                {'name': 'headx', 'phase': 0.3, 'amplitude': 2.0, 'freq': 0.9},
                # 5: shoulderr - 오른쪽 어깨 (수영 팔짓)
                {'name': 'shoulderr', 'phase': 0.0, 'amplitude': 25.0, 'freq': 1.0},
                # 6: arm_stretchr - 오른쪽 팔 (수영 팔짓)
                {'name': 'arm_stretchr', 'phase': 0.1, 'amplitude': 35.0, 'freq': 1.0},
                # 7: forearm_stretchr - 오른쪽 팔꿈치
                {'name': 'forearm_stretchr', 'phase': 0.2, 'amplitude': 45.0, 'freq': 1.0},
                # 8: shoulderl - 왼쪽 어깨 (반대 방향)
                {'name': 'shoulderl', 'phase': 0.0 + math.pi, 'amplitude': 25.0, 'freq': 1.0},
                # 9: arm_stretchl - 왼쪽 팔 (반대 방향)
                {'name': 'arm_stretchl', 'phase': 0.1 + math.pi, 'amplitude': 35.0, 'freq': 1.0},
                # 10: forearm_stretchl - 왼쪽 팔꿈치
                {'name': 'forearm_stretchl', 'phase': 0.2 + math.pi, 'amplitude': 45.0, 'freq': 1.0},
                # 11: thigh_stretchl - 왼쪽 허벅지 (다리 차기)
                {'name': 'thigh_stretchl', 'phase': 0.0, 'amplitude': 20.0, 'freq': 0.8},
                # 12: leg_stretchl - 왼쪽 다리
                {'name': 'leg_stretchl', 'phase': 0.1, 'amplitude': 30.0, 'freq': 0.8},
                # 13: thigh_stretchr - 오른쪽 허벅지 (반대 방향)
                {'name': 'thigh_stretchr', 'phase': 0.0 + math.pi, 'amplitude': 20.0, 'freq': 0.8},
                # 14: leg_stretchr - 오른쪽 다리
                {'name': 'leg_stretchr', 'phase': 0.1 + math.pi, 'amplitude': 30.0, 'freq': 0.8},
            ]
            
            for config in joint_configs:
                phase = swim_cycle * config['freq'] + config['phase']
                amplitude = config['amplitude']
                
                # 자연스러운 수영 동작 시뮬레이션
                z_rotation = math.sin(phase) * amplitude
                x_rotation = math.cos(phase * 1.3) * (amplitude * 0.4)
                y_rotation = math.sin(phase * 0.7) * (amplitude * 0.3)
                
                frame_data.extend([z_rotation, x_rotation, y_rotation])
            
            f.write(" ".join([f"{val:.6f}" for val in frame_data]) + "\n")
    
    print(f"[SWIM ANIM] 수영 애니메이션 BVH 생성 완료: {output_bvh}")
    
    # 파일 크기 확인
    file_size = os.path.getsize(output_bvh)
    print(f"[SWIM ANIM] 파일 크기: {file_size / 1024:.2f} KB")
    
    return True

def main():
    if len(sys.argv) != 2:
        print("사용법: python create_swim_animation.py <출력_BVH>")
        sys.exit(1)
    
    output_bvh = sys.argv[1]
    
    success = create_swim_animation_bvh(output_bvh)
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()


