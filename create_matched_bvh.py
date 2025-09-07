#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
매칭된 BVH 파일 생성 스크립트
- GLB의 실제 뼈대 이름과 매칭되는 BVH 생성
"""

import os
import sys
import math

def create_matched_bvh(output_bvh, frame_count=100):
    """GLB 뼈대 이름과 매칭되는 BVH 파일 생성"""
    print(f"[BVH MATCH] 매칭된 BVH 파일 생성: {output_bvh}")
    print(f"[BVH MATCH] 프레임 수: {frame_count}")
    
    with open(output_bvh, 'w') as f:
        # BVH 헤더 - GLB의 실제 뼈대 이름 사용
        f.write("HIERARCHY\n")
        f.write("ROOT root.x\n")
        f.write("{\n")
        f.write("    OFFSET 0.0 0.0 0.0\n")
        f.write("    CHANNELS 6 Xposition Yposition Zposition Zrotation Xrotation Yrotation\n")
        f.write("    JOINT spine_01.x\n")
        f.write("    {\n")
        f.write("        OFFSET 0.0 5.0 0.0\n")
        f.write("        CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("        JOINT spine_02.x\n")
        f.write("        {\n")
        f.write("            OFFSET 0.0 5.0 0.0\n")
        f.write("            CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("            JOINT spine_03.x\n")
        f.write("            {\n")
        f.write("                OFFSET 0.0 5.0 0.0\n")
        f.write("                CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("                JOINT neck.x\n")
        f.write("                {\n")
        f.write("                    OFFSET 0.0 8.0 0.0\n")
        f.write("                    CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("                    JOINT head.x\n")
        f.write("                    {\n")
        f.write("                        OFFSET 0.0 5.0 0.0\n")
        f.write("                        CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("                        End Site\n")
        f.write("                        {\n")
        f.write("                            OFFSET 0.0 3.0 0.0\n")
        f.write("                        }\n")
        f.write("                    }\n")
        f.write("                }\n")
        f.write("                JOINT shoulder.l\n")
        f.write("                {\n")
        f.write("                    OFFSET -5.0 0.0 0.0\n")
        f.write("                    CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("                    JOINT arm_stretch.l\n")
        f.write("                    {\n")
        f.write("                        OFFSET 0.0 -10.0 0.0\n")
        f.write("                        CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("                        JOINT forearm_stretch.l\n")
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
        f.write("                JOINT shoulder.r\n")
        f.write("                {\n")
        f.write("                    OFFSET 5.0 0.0 0.0\n")
        f.write("                    CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("                    JOINT arm_stretch.r\n")
        f.write("                    {\n")
        f.write("                        OFFSET 0.0 -10.0 0.0\n")
        f.write("                        CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("                        JOINT forearm_stretch.r\n")
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
        f.write("    JOINT thigh_stretch.l\n")
        f.write("    {\n")
        f.write("        OFFSET -2.0 0.0 0.0\n")
        f.write("        CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("        JOINT leg_stretch.l\n")
        f.write("        {\n")
        f.write("            OFFSET 0.0 -10.0 0.0\n")
        f.write("            CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("            End Site\n")
        f.write("            {\n")
        f.write("                OFFSET 0.0 -3.0 0.0\n")
        f.write("            }\n")
        f.write("        }\n")
        f.write("    }\n")
        f.write("    JOINT thigh_stretch.r\n")
        f.write("    {\n")
        f.write("        OFFSET 2.0 0.0 0.0\n")
        f.write("        CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("        JOINT leg_stretch.r\n")
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
        
        # 모션 데이터 - GLB 뼈대 이름과 매칭
        for frame_idx in range(frame_count):
            frame_data = []
            
            # 시간 기반 애니메이션
            time_factor = frame_idx / frame_count
            swim_cycle = time_factor * 2 * math.pi
            
            # root.x (6 channels) - 위치 + 회전
            root_x = math.sin(swim_cycle * 0.5) * 10
            root_y = 0.0
            root_z = math.cos(swim_cycle * 0.3) * 5
            root_rot_x = 0.0
            root_rot_y = 0.0
            root_rot_z = 0.0
            frame_data.extend([root_x, root_y, root_z, root_rot_x, root_rot_y, root_rot_z])
            
            # 12개 관절 각각 3개 채널 (총 36개 채널)
            joint_configs = [
                # 0: spine_01.x
                {'name': 'spine_01.x', 'phase': 0.0, 'amplitude': 5.0},
                # 1: spine_02.x  
                {'name': 'spine_02.x', 'phase': 0.1, 'amplitude': 3.0},
                # 2: spine_03.x
                {'name': 'spine_03.x', 'phase': 0.2, 'amplitude': 2.0},
                # 3: neck.x
                {'name': 'neck.x', 'phase': 0.3, 'amplitude': 1.0},
                # 4: head.x
                {'name': 'head.x', 'phase': 0.4, 'amplitude': 1.0},
                # 5: shoulder.l
                {'name': 'shoulder.l', 'phase': 0.0, 'amplitude': 30.0},
                # 6: arm_stretch.l
                {'name': 'arm_stretch.l', 'phase': 0.1, 'amplitude': 45.0},
                # 7: forearm_stretch.l
                {'name': 'forearm_stretch.l', 'phase': 0.2, 'amplitude': 60.0},
                # 8: shoulder.r
                {'name': 'shoulder.r', 'phase': 0.0 + math.pi, 'amplitude': 30.0},
                # 9: arm_stretch.r
                {'name': 'arm_stretch.r', 'phase': 0.1 + math.pi, 'amplitude': 45.0},
                # 10: forearm_stretch.r
                {'name': 'forearm_stretch.r', 'phase': 0.2 + math.pi, 'amplitude': 60.0},
                # 11: thigh_stretch.l
                {'name': 'thigh_stretch.l', 'phase': 0.0, 'amplitude': 20.0},
                # 12: leg_stretch.l
                {'name': 'leg_stretch.l', 'phase': 0.1, 'amplitude': 40.0},
                # 13: thigh_stretch.r
                {'name': 'thigh_stretch.r', 'phase': 0.0 + math.pi, 'amplitude': 20.0},
                # 14: leg_stretch.r
                {'name': 'leg_stretch.r', 'phase': 0.1 + math.pi, 'amplitude': 40.0},
            ]
            
            for config in joint_configs:
                phase = swim_cycle + config['phase']
                amplitude = config['amplitude']
                
                # 수영 동작 시뮬레이션
                z_rotation = math.sin(phase * 2) * amplitude
                x_rotation = math.cos(phase * 1.5) * (amplitude * 0.5)
                y_rotation = math.sin(phase * 3) * (amplitude * 0.3)
                
                frame_data.extend([z_rotation, x_rotation, y_rotation])
            
            f.write(" ".join([f"{val:.6f}" for val in frame_data]) + "\n")
    
    print(f"[BVH MATCH] 매칭된 BVH 파일 생성 완료: {output_bvh}")
    
    # 파일 크기 확인
    file_size = os.path.getsize(output_bvh)
    print(f"[BVH MATCH] 파일 크기: {file_size / 1024:.2f} KB")
    
    return True

def main():
    if len(sys.argv) != 2:
        print("사용법: python create_matched_bvh.py <출력_BVH>")
        sys.exit(1)
    
    output_bvh = sys.argv[1]
    
    success = create_matched_bvh(output_bvh)
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()


