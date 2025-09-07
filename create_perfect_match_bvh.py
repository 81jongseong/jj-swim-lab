#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
완벽한 매칭 BVH 파일 생성 스크립트
- GLB의 실제 뼈대 구조와 정확히 일치하는 BVH 생성
"""

import os
import sys
import math

def create_perfect_match_bvh(output_bvh, frame_count=120):
    """GLB의 실제 구조와 완벽히 매칭되는 BVH 파일 생성"""
    print(f"[PERFECT BVH] 완벽한 매칭 BVH 생성: {output_bvh}")
    print(f"[PERFECT BVH] 프레임 수: {frame_count}")
    
    with open(output_bvh, 'w') as f:
        # BVH 헤더 - GLB의 실제 구조와 정확히 일치
        f.write("HIERARCHY\n")
        f.write("ROOT root.x\n")
        f.write("{\n")
        f.write("    OFFSET 0.0 0.0 0.0\n")
        f.write("    CHANNELS 6 Xposition Yposition Zposition Zrotation Xrotation Yrotation\n")
        f.write("    JOINT foot.l\n")
        f.write("    {\n")
        f.write("        OFFSET 0.0 0.0 0.0\n")
        f.write("        CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("        JOINT toes_01.l\n")
        f.write("        {\n")
        f.write("            OFFSET 0.0 0.0 0.0\n")
        f.write("            CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("            End Site\n")
        f.write("            {\n")
        f.write("                OFFSET 0.0 0.0 0.0\n")
        f.write("            }\n")
        f.write("        }\n")
        f.write("    }\n")
        f.write("    JOINT thigh_twist.l\n")
        f.write("    {\n")
        f.write("        OFFSET 0.0 0.0 0.0\n")
        f.write("        CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("        End Site\n")
        f.write("        {\n")
        f.write("            OFFSET 0.0 0.0 0.0\n")
        f.write("        }\n")
        f.write("    }\n")
        f.write("    JOINT foot.r\n")
        f.write("    {\n")
        f.write("        OFFSET 0.0 0.0 0.0\n")
        f.write("        CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("        JOINT toes_01.r\n")
        f.write("        {\n")
        f.write("            OFFSET 0.0 0.0 0.0\n")
        f.write("            CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("            End Site\n")
        f.write("            {\n")
        f.write("                OFFSET 0.0 0.0 0.0\n")
        f.write("            }\n")
        f.write("        }\n")
        f.write("    }\n")
        f.write("    JOINT thigh_twist.r\n")
        f.write("    {\n")
        f.write("        OFFSET 0.0 0.0 0.0\n")
        f.write("        CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("        End Site\n")
        f.write("        {\n")
        f.write("            OFFSET 0.0 0.0 0.0\n")
        f.write("        }\n")
        f.write("    }\n")
        f.write("}\n")
        f.write("ROOT spine_01.x\n")
        f.write("{\n")
        f.write("    OFFSET 0.0 0.0 0.0\n")
        f.write("    CHANNELS 6 Xposition Yposition Zposition Zrotation Xrotation Yrotation\n")
        f.write("    JOINT spine_02.x\n")
        f.write("    {\n")
        f.write("        OFFSET 0.0 0.0 0.0\n")
        f.write("        CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("        JOINT spine_03.x\n")
        f.write("        {\n")
        f.write("            OFFSET 0.0 0.0 0.0\n")
        f.write("            CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("            JOINT neck.x\n")
        f.write("            {\n")
        f.write("                OFFSET 0.0 0.0 0.0\n")
        f.write("                CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("                End Site\n")
        f.write("                {\n")
        f.write("                    OFFSET 0.0 0.0 0.0\n")
        f.write("                }\n")
        f.write("            }\n")
        f.write("            JOINT shoulder.r\n")
        f.write("            {\n")
        f.write("                OFFSET 0.0 0.0 0.0\n")
        f.write("                CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("                JOINT c_arm_twist_offset.r\n")
        f.write("                {\n")
        f.write("                    OFFSET 0.0 0.0 0.0\n")
        f.write("                    CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("                    End Site\n")
        f.write("                    {\n")
        f.write("                        OFFSET 0.0 0.0 0.0\n")
        f.write("                    }\n")
        f.write("                }\n")
        f.write("            }\n")
        f.write("            JOINT shoulder.l\n")
        f.write("            {\n")
        f.write("                OFFSET 0.0 0.0 0.0\n")
        f.write("                CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("                JOINT c_arm_twist_offset.l\n")
        f.write("                {\n")
        f.write("                    OFFSET 0.0 0.0 0.0\n")
        f.write("                    CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("                    End Site\n")
        f.write("                    {\n")
        f.write("                        OFFSET 0.0 0.0 0.0\n")
        f.write("                    }\n")
        f.write("                }\n")
        f.write("            }\n")
        f.write("        }\n")
        f.write("    }\n")
        f.write("}\n")
        f.write("ROOT head.x\n")
        f.write("{\n")
        f.write("    OFFSET 0.0 0.0 0.0\n")
        f.write("    CHANNELS 6 Xposition Yposition Zposition Zrotation Xrotation Yrotation\n")
        f.write("    End Site\n")
        f.write("    {\n")
        f.write("        OFFSET 0.0 0.0 0.0\n")
        f.write("    }\n")
        f.write("}\n")
        f.write("ROOT leg_stretch.l\n")
        f.write("{\n")
        f.write("    OFFSET 0.0 0.0 0.0\n")
        f.write("    CHANNELS 6 Xposition Yposition Zposition Zrotation Xrotation Yrotation\n")
        f.write("    JOINT leg_twist.l\n")
        f.write("    {\n")
        f.write("        OFFSET 0.0 0.0 0.0\n")
        f.write("        CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("        End Site\n")
        f.write("        {\n")
        f.write("            OFFSET 0.0 0.0 0.0\n")
        f.write("        }\n")
        f.write("    }\n")
        f.write("}\n")
        f.write("ROOT leg_stretch.r\n")
        f.write("{\n")
        f.write("    OFFSET 0.0 0.0 0.0\n")
        f.write("    CHANNELS 6 Xposition Yposition Zposition Zrotation Xrotation Yrotation\n")
        f.write("    JOINT leg_twist.r\n")
        f.write("    {\n")
        f.write("        OFFSET 0.0 0.0 0.0\n")
        f.write("        CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("        End Site\n")
        f.write("        {\n")
        f.write("            OFFSET 0.0 0.0 0.0\n")
        f.write("        }\n")
        f.write("    }\n")
        f.write("}\n")
        f.write("ROOT thigh_stretch.l\n")
        f.write("{\n")
        f.write("    OFFSET 0.0 0.0 0.0\n")
        f.write("    CHANNELS 6 Xposition Yposition Zposition Zrotation Xrotation Yrotation\n")
        f.write("    End Site\n")
        f.write("    {\n")
        f.write("        OFFSET 0.0 0.0 0.0\n")
        f.write("    }\n")
        f.write("}\n")
        f.write("ROOT thigh_stretch.r\n")
        f.write("{\n")
        f.write("    OFFSET 0.0 0.0 0.0\n")
        f.write("    CHANNELS 6 Xposition Yposition Zposition Zrotation Xrotation Yrotation\n")
        f.write("    End Site\n")
        f.write("    {\n")
        f.write("        OFFSET 0.0 0.0 0.0\n")
        f.write("    }\n")
        f.write("}\n")
        f.write("ROOT arm_stretch.l\n")
        f.write("{\n")
        f.write("    OFFSET 0.0 0.0 0.0\n")
        f.write("    CHANNELS 6 Xposition Yposition Zposition Zrotation Xrotation Yrotation\n")
        f.write("    End Site\n")
        f.write("    {\n")
        f.write("        OFFSET 0.0 0.0 0.0\n")
        f.write("    }\n")
        f.write("}\n")
        f.write("ROOT arm_stretch.r\n")
        f.write("{\n")
        f.write("    OFFSET 0.0 0.0 0.0\n")
        f.write("    CHANNELS 6 Xposition Yposition Zposition Zrotation Xrotation Yrotation\n")
        f.write("    End Site\n")
        f.write("    {\n")
        f.write("        OFFSET 0.0 0.0 0.0\n")
        f.write("    }\n")
        f.write("}\n")
        f.write("ROOT forearm_stretch.l\n")
        f.write("{\n")
        f.write("    OFFSET 0.0 0.0 0.0\n")
        f.write("    CHANNELS 6 Xposition Yposition Zposition Zrotation Xrotation Yrotation\n")
        f.write("    JOINT forearm_twist.l\n")
        f.write("    {\n")
        f.write("        OFFSET 0.0 0.0 0.0\n")
        f.write("        CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("        End Site\n")
        f.write("        {\n")
        f.write("            OFFSET 0.0 0.0 0.0\n")
        f.write("        }\n")
        f.write("    }\n")
        f.write("}\n")
        f.write("ROOT forearm_stretch.r\n")
        f.write("{\n")
        f.write("    OFFSET 0.0 0.0 0.0\n")
        f.write("    CHANNELS 6 Xposition Yposition Zposition Zrotation Xrotation Yrotation\n")
        f.write("    JOINT forearm_twist.r\n")
        f.write("    {\n")
        f.write("        OFFSET 0.0 0.0 0.0\n")
        f.write("        CHANNELS 3 Zrotation Xrotation Yrotation\n")
        f.write("        End Site\n")
        f.write("        {\n")
        f.write("            OFFSET 0.0 0.0 0.0\n")
        f.write("        }\n")
        f.write("    }\n")
        f.write("}\n")
        f.write("\n")
        f.write("MOTION\n")
        f.write(f"Frames: {frame_count}\n")
        f.write("Frame Time: 0.033333\n")
        f.write("\n")
        
        # 자연스러운 수영 애니메이션 생성
        for frame_idx in range(frame_count):
            frame_data = []
            
            # 시간 기반 애니메이션 (2초 주기)
            time_factor = frame_idx / frame_count
            swim_cycle = time_factor * 2 * math.pi
            
            # 12개 루트 뼈대 각각 6개 채널 (총 72개 채널)
            root_bones = [
                'root.x', 'spine_01.x', 'head.x', 'leg_stretch.l', 'leg_stretch.r',
                'thigh_stretch.l', 'thigh_stretch.r', 'arm_stretch.l', 'arm_stretch.r',
                'forearm_stretch.l', 'forearm_stretch.r'
            ]
            
            for bone_name in root_bones:
                # 각 뼈대별로 다른 애니메이션 패턴
                if bone_name == 'root.x':
                    # 루트 - 전체 움직임
                    x = math.sin(swim_cycle * 0.3) * 2.0
                    y = 0.0
                    z = math.cos(swim_cycle * 0.2) * 1.5
                    rot_x = math.sin(swim_cycle * 0.4) * 5.0
                    rot_y = 0.0
                    rot_z = math.sin(swim_cycle * 0.3) * 3.0
                elif bone_name == 'spine_01.x':
                    # 몸통 - 상하 움직임
                    x = 0.0
                    y = math.sin(swim_cycle * 1.2) * 3.0
                    z = 0.0
                    rot_x = math.sin(swim_cycle * 1.0) * 8.0
                    rot_y = 0.0
                    rot_z = math.sin(swim_cycle * 0.8) * 5.0
                elif bone_name == 'head.x':
                    # 머리 - 호흡 움직임
                    x = 0.0
                    y = 0.0
                    z = 0.0
                    rot_x = math.sin(swim_cycle * 1.1) * 4.0
                    rot_y = 0.0
                    rot_z = math.sin(swim_cycle * 0.9) * 2.0
                elif 'arm_stretch' in bone_name:
                    # 팔 - 수영 팔짓
                    side = 1 if '.r' in bone_name else -1
                    x = 0.0
                    y = 0.0
                    z = 0.0
                    rot_x = math.sin(swim_cycle + side * math.pi) * 25.0
                    rot_y = 0.0
                    rot_z = math.sin(swim_cycle + side * math.pi) * 15.0
                elif 'leg_stretch' in bone_name:
                    # 다리 - 수영 다리 차기
                    side = 1 if '.r' in bone_name else -1
                    x = 0.0
                    y = 0.0
                    z = 0.0
                    rot_x = math.sin(swim_cycle + side * math.pi) * 20.0
                    rot_y = 0.0
                    rot_z = math.sin(swim_cycle + side * math.pi) * 10.0
                else:
                    # 기타 뼈대 - 미묘한 움직임
                    x = 0.0
                    y = 0.0
                    z = 0.0
                    rot_x = math.sin(swim_cycle * 0.5) * 2.0
                    rot_y = 0.0
                    rot_z = math.sin(swim_cycle * 0.3) * 1.0
                
                frame_data.extend([x, y, z, rot_x, rot_y, rot_z])
            
            # 1개 루트 뼈대 (spine_01.x)의 자식들
            child_bones = [
                'spine_02.x', 'spine_03.x', 'neck.x', 'shoulder.r', 'shoulder.l',
                'c_arm_twist_offset.r', 'c_arm_twist_offset.l'
            ]
            
            for bone_name in child_bones:
                if 'shoulder' in bone_name:
                    # 어깨 - 팔짓 동작
                    side = 1 if '.r' in bone_name else -1
                    rot_x = math.sin(swim_cycle + side * math.pi) * 30.0
                    rot_y = 0.0
                    rot_z = math.sin(swim_cycle + side * math.pi) * 20.0
                elif 'spine' in bone_name:
                    # 척추 - 몸통 움직임
                    rot_x = math.sin(swim_cycle * 1.0) * 5.0
                    rot_y = 0.0
                    rot_z = math.sin(swim_cycle * 0.8) * 3.0
                else:
                    # 기타 - 미묘한 움직임
                    rot_x = math.sin(swim_cycle * 0.5) * 2.0
                    rot_y = 0.0
                    rot_z = math.sin(swim_cycle * 0.3) * 1.0
                
                frame_data.extend([rot_x, rot_y, rot_z])
            
            # 2개 루트 뼈대 (leg_stretch.l/r)의 자식들
            leg_children = ['leg_twist.l', 'leg_twist.r']
            for bone_name in leg_children:
                side = 1 if '.r' in bone_name else -1
                rot_x = math.sin(swim_cycle + side * math.pi) * 15.0
                rot_y = 0.0
                rot_z = math.sin(swim_cycle + side * math.pi) * 10.0
                frame_data.extend([rot_x, rot_y, rot_z])
            
            # 2개 루트 뼈대 (forearm_stretch.l/r)의 자식들
            forearm_children = ['forearm_twist.l', 'forearm_twist.r']
            for bone_name in forearm_children:
                side = 1 if '.r' in bone_name else -1
                rot_x = math.sin(swim_cycle + side * math.pi) * 20.0
                rot_y = 0.0
                rot_z = math.sin(swim_cycle + side * math.pi) * 15.0
                frame_data.extend([rot_x, rot_y, rot_z])
            
            f.write(" ".join([f"{val:.6f}" for val in frame_data]) + "\n")
    
    print(f"[PERFECT BVH] 완벽한 매칭 BVH 생성 완료: {output_bvh}")
    
    # 파일 크기 확인
    file_size = os.path.getsize(output_bvh)
    print(f"[PERFECT BVH] 파일 크기: {file_size / 1024:.2f} KB")
    
    return True

def main():
    if len(sys.argv) != 2:
        print("사용법: python create_perfect_match_bvh.py <출력_BVH>")
        sys.exit(1)
    
    output_bvh = sys.argv[1]
    
    success = create_perfect_match_bvh(output_bvh)
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()


