#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
정확한 매칭 BVH 파일 생성 스크립트
- GLB의 실제 뼈대 이름과 정확히 매칭되는 BVH 생성
"""

import os
import sys
import math

def create_exact_match_bvh(output_bvh, frame_count=100):
    """GLB 뼈대 이름과 정확히 매칭되는 BVH 파일 생성"""
    print(f"[BVH EXACT] 정확한 매칭 BVH 파일 생성: {output_bvh}")
    print(f"[BVH EXACT] 프레임 수: {frame_count}")
    
    with open(output_bvh, 'w') as f:
        # BVH 헤더 - GLB의 실제 뼈대 이름 사용 (점 없음)
        f.write("HIERARCHY\n")
        f.write("ROOT rootx\n")
        f.write("{\n")
        f.write("    OFFSET 0.0 0.0 0.0\n")
        f.write("    CHANNELS 6 Xposition Yposition Zposition Zrotation Xrotation Yrotation\n")
        f.write("    JOINT spine_01x\n")
        f.write("    {\n")
        f.write("        OFFSET 0.0 5.0 0.0\n")
        f.write("        CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("        JOINT spine_02x\n")
        f.write("        {\n")
        f.write("            OFFSET 0.0 5.0 0.0\n")
        f.write("            CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("            JOINT spine_03x\n")
        f.write("            {\n")
        f.write("                OFFSET 0.0 5.0 0.0\n")
        f.write("                CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("                JOINT neckx\n")
        f.write("                {\n")
        f.write("                    OFFSET 0.0 8.0 0.0\n")
        f.write("                    CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("                    JOINT headx\n")
        f.write("                    {\n")
        f.write("                        OFFSET 0.0 5.0 0.0\n")
        f.write("                        CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("                        End Site\n")
        f.write("                        {\n")
        f.write("                            OFFSET 0.0 3.0 0.0\n")
        f.write("                        }\n")
        f.write("                    }\n")
        f.write("                }\n")
        f.write("                JOINT shoulderr\n")
        f.write("                {\n")
        f.write("                    OFFSET 5.0 0.0 0.0\n")
        f.write("                    CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("                    JOINT arm_stretchr\n")
        f.write("                    {\n")
        f.write("                        OFFSET 0.0 -10.0 0.0\n")
        f.write("                        CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("                        JOINT forearm_stretchr\n")
        f.write("                        {\n")
        f.write("                            OFFSET 0.0 -10.0 0.0\n")
        f.write("                            CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("                            End Site\n")
        f.write("                            {\n")
        f.write("                                OFFSET 0.0 -3.0 0.0\n")
        f.write("                            }\n")
        f.write("                        }\n")
        f.write("                    }\n")
        f.write("                }\n")
        f.write("                JOINT shoulderl\n")
        f.write("                {\n")
        f.write("                    OFFSET -5.0 0.0 0.0\n")
        f.write("                    CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("                    JOINT arm_stretchl\n")
        f.write("                    {\n")
        f.write("                        OFFSET 0.0 -10.0 0.0\n")
        f.write("                        CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("                        JOINT forearm_stretchl\n")
        f.write("                        {\n")
        f.write("                            OFFSET 0.0 -10.0 0.0\n")
        f.write("                            CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("                            End Site\n")
        f.write("                            {\n")
        f.write("                                OFFSET 0.0 -3.0 0.0\n")
        f.write("                            }\n")
        f.write("                        }\n")
        f.write("                    }\n")
        f.write("                }\n")
        f.write("            }\n")
        f.write("        }\n")
        f.write("    }\n")
        f.write("    JOINT thigh_stretchl\n")
        f.write("    {\n")
        f.write("        OFFSET -2.0 0.0 0.0\n")
        f.write("        CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("        JOINT leg_stretchl\n")
        f.write("        {\n")
        f.write("            OFFSET 0.0 -10.0 0.0\n")
        f.write("            CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("            End Site\n")
        f.write("            {\n")
        f.write("                OFFSET 0.0 -3.0 0.0\n")
        f.write("            }\n")
        f.write("        }\n")
        f.write("    }\n")
        f.write("    JOINT thigh_stretchr\n")
        f.write("    {\n")
        f.write("        OFFSET 2.0 0.0 0.0\n")
        f.write("        CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("        JOINT leg_stretchr\n")
        f.write("        {\n")
        f.write("            OFFSET 0.0 -10.0 0.0\n")
        f.write("            CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("            End Site\n")
        f.write("            {\n")
        f.write("                OFFSET 0.0 -3.0 0.0\n")
        f.write("            }\n")
        f.write("        }\n")
        f.write("    }\n")
        f.write("}\n")
        f.write("\n")
        f.write("MOTION\n")
        f.write(f"Frames: {frame_count}\n")
        f.write("Frame Time: 0.033333\n")
        f.write("\n")
        
        # 모션 데이터 - GLB 뼈대 이름과 정확히 매칭
        for frame_idx in range(frame_count):
            frame_data = []
            
            # 시간 기반 애니메이션
            time_factor = frame_idx / frame_count
            swim_cycle = time_factor * 2 * math.pi
            
            # rootx (6 channels) - 위치 + 회전
            root_x = math.sin(swim_cycle * 0.5) * 5
            root_y = 0.0
            root_z = math.cos(swim_cycle * 0.3) * 3
            root_rot_x = 0.0
            root_rot_y = 0.0
            root_rot_z = 0.0
            frame_data.extend([root_x, root_y, root_z, root_rot_x, root_rot_y, root_rot_z])
            
            # 12개 관절 각각 3개 채널 (총 36개 채널)
            joint_configs = [
                # 0: spine_01x
                {'name': 'spine_01x', 'phase': 0.0, 'amplitude': 3.0},
                # 1: spine_02x  
                {'name': 'spine_02x', 'phase': 0.1, 'amplitude': 2.0},
                # 2: spine_03x
                {'name': 'spine_03x', 'phase': 0.2, 'amplitude': 1.5},
                # 3: neckx
                {'name': 'neckx', 'phase': 0.3, 'amplitude': 1.0},
                # 4: headx
                {'name': 'headx', 'phase': 0.4, 'amplitude': 0.8},
                # 5: shoulderr
                {'name': 'shoulderr', 'phase': 0.0, 'amplitude': 20.0},
                # 6: arm_stretchr
                {'name': 'arm_stretchr', 'phase': 0.1, 'amplitude': 30.0},
                # 7: forearm_stretchr
                {'name': 'forearm_stretchr', 'phase': 0.2, 'amplitude': 40.0},
                # 8: shoulderl
                {'name': 'shoulderl', 'phase': 0.0 + math.pi, 'amplitude': 20.0},
                # 9: arm_stretchl
                {'name': 'arm_stretchl', 'phase': 0.1 + math.pi, 'amplitude': 30.0},
                # 10: forearm_stretchl
                {'name': 'forearm_stretchl', 'phase': 0.2 + math.pi, 'amplitude': 40.0},
                # 11: thigh_stretchl
                {'name': 'thigh_stretchl', 'phase': 0.0, 'amplitude': 15.0},
                # 12: leg_stretchl
                {'name': 'leg_stretchl', 'phase': 0.1, 'amplitude': 25.0},
                # 13: thigh_stretchr
                {'name': 'thigh_stretchr', 'phase': 0.0 + math.pi, 'amplitude': 15.0},
                # 14: leg_stretchr
                {'name': 'leg_stretchr', 'phase': 0.1 + math.pi, 'amplitude': 25.0},
            ]
            
            for config in joint_configs:
                phase = swim_cycle + config['phase']
                amplitude = config['amplitude']
                
                # 수영 동작 시뮬레이션 (더 부드럽고 자연스럽게)
                z_rotation = math.sin(phase * 1.5) * amplitude
                x_rotation = math.cos(phase * 1.2) * (amplitude * 0.3)
                y_rotation = math.sin(phase * 2.5) * (amplitude * 0.2)
                
                frame_data.extend([z_rotation, x_rotation, y_rotation])
            
            f.write(" ".join([f"{val:.6f}" for val in frame_data]) + "\n")
    
    print(f"[BVH EXACT] 정확한 매칭 BVH 파일 생성 완료: {output_bvh}")
    
    # 파일 크기 확인
    file_size = os.path.getsize(output_bvh)
    print(f"[BVH EXACT] 파일 크기: {file_size / 1024:.2f} KB")
    
    return True

def main():
    if len(sys.argv) != 2:
        print("사용법: python create_exact_match_bvh.py <출력_BVH>")
        sys.exit(1)
    
    output_bvh = sys.argv[1]
    
    success = create_exact_match_bvh(output_bvh)
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()


