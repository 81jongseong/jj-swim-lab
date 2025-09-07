#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
표준 BVH 파일 생성 스크립트
- Blender 호환 표준 BVH 형식
"""

import os
import sys
import math

def create_standard_bvh(output_bvh, frame_count=100):
    """표준 BVH 파일 생성"""
    print(f"[BVH CREATE] 표준 BVH 파일 생성: {output_bvh}")
    print(f"[BVH CREATE] 프레임 수: {frame_count}")
    
    with open(output_bvh, 'w') as f:
        # BVH 헤더 - 표준 형식
        f.write("HIERARCHY\n")
        f.write("ROOT Hips\n")
        f.write("{\n")
        f.write("    OFFSET 0.0 0.0 0.0\n")
        f.write("    CHANNELS 6 Xposition Yposition Zposition Zrotation Xrotation Yrotation\n")
        f.write("    JOINT Spine\n")
        f.write("    {\n")
        f.write("        OFFSET 0.0 5.0 0.0\n")
        f.write("        CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("        JOINT Chest\n")
        f.write("        {\n")
        f.write("            OFFSET 0.0 5.0 0.0\n")
        f.write("            CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("            JOINT Neck\n")
        f.write("            {\n")
        f.write("                OFFSET 0.0 8.0 0.0\n")
        f.write("                CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("                JOINT Head\n")
        f.write("                {\n")
        f.write("                    OFFSET 0.0 5.0 0.0\n")
        f.write("                    CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("                    End Site\n")
        f.write("                    {\n")
        f.write("                        OFFSET 0.0 3.0 0.0\n")
        f.write("                    }\n")
        f.write("                }\n")
        f.write("            }\n")
        f.write("            JOINT LeftShoulder\n")
        f.write("            {\n")
        f.write("                OFFSET -5.0 0.0 0.0\n")
        f.write("                CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("                JOINT LeftArm\n")
        f.write("                {\n")
        f.write("                    OFFSET 0.0 -10.0 0.0\n")
        f.write("                    CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("                    JOINT LeftForeArm\n")
        f.write("                    {\n")
        f.write("                        OFFSET 0.0 -10.0 0.0\n")
        f.write("                        CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("                        End Site\n")
        f.write("                        {\n")
        f.write("                            OFFSET 0.0 -3.0 0.0\n")
        f.write("                        }\n")
        f.write("                    }\n")
        f.write("                }\n")
        f.write("            }\n")
        f.write("            JOINT RightShoulder\n")
        f.write("            {\n")
        f.write("                OFFSET 5.0 0.0 0.0\n")
        f.write("                CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("                JOINT RightArm\n")
        f.write("                {\n")
        f.write("                    OFFSET 0.0 -10.0 0.0\n")
        f.write("                    CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("                    JOINT RightForeArm\n")
        f.write("                    {\n")
        f.write("                        OFFSET 0.0 -10.0 0.0\n")
        f.write("                        CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("                        End Site\n")
        f.write("                        {\n")
        f.write("                            OFFSET 0.0 -3.0 0.0\n")
        f.write("                        }\n")
        f.write("                    }\n")
        f.write("                }\n")
        f.write("            }\n")
        f.write("        }\n")
        f.write("    }\n")
        f.write("    JOINT LeftHip\n")
        f.write("    {\n")
        f.write("        OFFSET -2.0 0.0 0.0\n")
        f.write("        CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("        JOINT LeftKnee\n")
        f.write("        {\n")
        f.write("            OFFSET 0.0 -10.0 0.0\n")
        f.write("            CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("            JOINT LeftAnkle\n")
        f.write("            {\n")
        f.write("                OFFSET 0.0 -10.0 0.0\n")
        f.write("                CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("                End Site\n")
        f.write("                {\n")
        f.write("                    OFFSET 0.0 -3.0 0.0\n")
        f.write("                }\n")
        f.write("            }\n")
        f.write("        }\n")
        f.write("    }\n")
        f.write("    JOINT RightHip\n")
        f.write("    {\n")
        f.write("        OFFSET 2.0 0.0 0.0\n")
        f.write("        CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("        JOINT RightKnee\n")
        f.write("        {\n")
        f.write("            OFFSET 0.0 -10.0 0.0\n")
        f.write("            CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("            JOINT RightAnkle\n")
        f.write("            {\n")
        f.write("                OFFSET 0.0 -10.0 0.0\n")
        f.write("                CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("                End Site\n")
        f.write("                {\n")
        f.write("                    OFFSET 0.0 -3.0 0.0\n")
        f.write("                }\n")
        f.write("            }\n")
        f.write("        }\n")
        f.write("    }\n")
        f.write("}\n")
        f.write("\n")
        f.write("MOTION\n")
        f.write(f"Frames: {frame_count}\n")
        f.write("Frame Time: 0.033333\n")
        f.write("\n")
        
        # 모션 데이터 - 표준 형식 (Hips 6 + 14개 관절 3개씩 = 48개 값)
        for frame_idx in range(frame_count):
            frame_data = []
            
            # 시간 기반 애니메이션
            time_factor = frame_idx / frame_count
            swim_cycle = time_factor * 2 * math.pi
            
            # Hips (6 channels) - 위치 + 회전
            hips_x = math.sin(swim_cycle * 0.5) * 10
            hips_y = 0.0
            hips_z = math.cos(swim_cycle * 0.3) * 5
            hips_rot_x = 0.0
            hips_rot_y = 0.0
            hips_rot_z = 0.0
            frame_data.extend([hips_x, hips_y, hips_z, hips_rot_x, hips_rot_y, hips_rot_z])
            
            # 14개 관절 각각 3개 채널 (총 42개 채널)
            joint_configs = [
                # 0: Spine
                {'name': 'Spine', 'phase': 0.0, 'amplitude': 5.0},
                # 1: Chest  
                {'name': 'Chest', 'phase': 0.1, 'amplitude': 3.0},
                # 2: Neck
                {'name': 'Neck', 'phase': 0.2, 'amplitude': 2.0},
                # 3: Head
                {'name': 'Head', 'phase': 0.3, 'amplitude': 1.0},
                # 4: LeftShoulder
                {'name': 'LeftShoulder', 'phase': 0.0, 'amplitude': 30.0},
                # 5: LeftArm
                {'name': 'LeftArm', 'phase': 0.1, 'amplitude': 45.0},
                # 6: LeftForeArm
                {'name': 'LeftForeArm', 'phase': 0.2, 'amplitude': 60.0},
                # 7: RightShoulder
                {'name': 'RightShoulder', 'phase': 0.0 + math.pi, 'amplitude': 30.0},
                # 8: RightArm
                {'name': 'RightArm', 'phase': 0.1 + math.pi, 'amplitude': 45.0},
                # 9: RightForeArm
                {'name': 'RightForeArm', 'phase': 0.2 + math.pi, 'amplitude': 60.0},
                # 10: LeftHip
                {'name': 'LeftHip', 'phase': 0.0, 'amplitude': 20.0},
                # 11: LeftKnee
                {'name': 'LeftKnee', 'phase': 0.1, 'amplitude': 40.0},
                # 12: LeftAnkle
                {'name': 'LeftAnkle', 'phase': 0.2, 'amplitude': 30.0},
                # 13: RightHip
                {'name': 'RightHip', 'phase': 0.0 + math.pi, 'amplitude': 20.0},
                # 14: RightKnee
                {'name': 'RightKnee', 'phase': 0.1 + math.pi, 'amplitude': 40.0},
                # 15: RightAnkle
                {'name': 'RightAnkle', 'phase': 0.2 + math.pi, 'amplitude': 30.0},
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
    
    print(f"[BVH CREATE] 표준 BVH 파일 생성 완료: {output_bvh}")
    
    # 파일 크기 확인
    file_size = os.path.getsize(output_bvh)
    print(f"[BVH CREATE] 파일 크기: {file_size / 1024:.2f} KB")
    
    return True

def main():
    if len(sys.argv) != 2:
        print("사용법: python create_standard_bvh.py <출력_BVH>")
        sys.exit(1)
    
    output_bvh = sys.argv[1]
    
    success = create_standard_bvh(output_bvh)
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
