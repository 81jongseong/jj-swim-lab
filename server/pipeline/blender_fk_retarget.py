#!/usr/bin/env python3
"""
Blender FK 리타겟 스크립트
BVH 애니메이션을 타겟 아마추어에 FK 방식으로 리타겟팅
"""

import bpy
import bmesh
import mathutils
import os
import sys
from mathutils import Vector, Quaternion, Matrix
import logging

# 로깅 설정
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger(__name__)

class FKRetargeter:
    def __init__(self):
        self.target_armature = None
        self.source_armature = None
        self.bvh_file = None
        self.output_path = None
        
    def setup_fk_constraints(self):
        """FK 방식 제약 조건 설정"""
        logger.info("[MAP] FK 제약 조건 설정 시작")
        
        if not self.target_armature:
            logger.error("[MAP] 타겟 아마추어를 찾을 수 없습니다")
            return False
            
        # Pose 모드로 전환
        bpy.context.view_layer.objects.active = self.target_armature
        bpy.ops.object.mode_set(mode='POSE')
        
        # 모든 본 선택 해제
        bpy.ops.pose.select_all(action='DESELECT')
        
        constraint_count = 0
        root_constraints = 0
        rotation_constraints = 0
        
        for bone in self.target_armature.pose.bones:
            bone_name = bone.name
            
            # IK/컨트롤 본 제외
            if self._is_ik_control_bone(bone_name):
                logger.info(f"[MAP] IK/컨트롤 본 제외: {bone_name}")
                continue
                
            # 루트 본 (Hips) 처리
            if self._is_root_bone(bone_name):
                # Copy Transforms (위치 + 회전)
                constraint = bone.constraints.new('COPY_TRANSFORMS')
                constraint.target = self.source_armature
                constraint.subtarget = self._find_source_bone(bone_name)
                constraint.mix_mode = 'REPLACE'
                constraint.influence = 1.0
                
                logger.info(f"[MAP] copy_type=transforms bone={bone_name} influence=1.0")
                root_constraints += 1
                
            else:
                # Copy Rotation (회전만)
                constraint = bone.constraints.new('COPY_ROTATION')
                constraint.target = self.source_armature
                constraint.subtarget = self._find_source_bone(bone_name)
                constraint.mix_mode = 'ADD'
                
                # 손/발 끝 본은 낮은 영향력
                if self._is_end_effector_bone(bone_name):
                    constraint.influence = 0.7  # 0.6~0.8 범위
                    logger.info(f"[MAP] copy_type=rotation bone={bone_name} influence=0.7 (end_effector)")
                else:
                    constraint.influence = 1.0
                    logger.info(f"[MAP] copy_type=rotation bone={bone_name} influence=1.0")
                
                rotation_constraints += 1
            
            # 모든 본을 QUATERNION 모드로 설정
            bone.rotation_mode = 'QUATERNION'
            constraint_count += 1
        
        logger.info(f"[MAP] 제약 조건 설정 완료: 총 {constraint_count}개 (루트: {root_constraints}, 회전: {rotation_constraints})")
        return True
    
    def _is_ik_control_bone(self, bone_name):
        """IK/컨트롤 본 여부 확인"""
        ik_keywords = ['IK', 'Ctrl', 'Pole', 'Helper', 'Target', 'MCH', 'DEF', 'ORG']
        return any(keyword in bone_name for keyword in ik_keywords)
    
    def _is_root_bone(self, bone_name):
        """루트 본 여부 확인"""
        root_names = ['Hips', 'Root', 'rootx', 'pelvis', 'hip']
        return any(name.lower() in bone_name.lower() for name in root_names)
    
    def _is_end_effector_bone(self, bone_name):
        """손/발 끝 본 여부 확인"""
        end_keywords = ['hand', 'foot', 'finger', 'toe', 'thumb', 'index', 'middle', 'ring', 'pinky']
        return any(keyword in bone_name.lower() for keyword in end_keywords)
    
    def _find_source_bone(self, target_bone_name):
        """소스 본 찾기 (이름 매칭)"""
        if not self.source_armature:
            return target_bone_name
            
        # 정확한 이름 매칭
        if target_bone_name in [bone.name for bone in self.source_armature.pose.bones]:
            return target_bone_name
            
        # 부분 매칭 시도
        for source_bone in self.source_armature.pose.bones:
            if target_bone_name.lower() in source_bone.name.lower():
                return source_bone.name
                
        return target_bone_name
    
    def fix_bvh_axis_scale(self):
        """BVH 축/스케일 고정 및 루트 보정"""
        logger.info("[ROOT] BVH 축/스케일 고정 시작")
        
        if not self.source_armature:
            logger.error("[ROOT] 소스 아마추어를 찾을 수 없습니다")
            return False
            
        # Object 모드로 전환
        bpy.context.view_layer.objects.active = self.source_armature
        bpy.ops.object.mode_set(mode='OBJECT')
        
        # BVH 축 보정 (Y-up to Z-up)
        self.source_armature.rotation_euler = (0, 0, 0)
        
        # 스케일 고정
        self.source_armature.scale = (1, 1, 1)
        
        # 루트 본 오프셋 자동 보정
        root_bone = None
        for bone in self.source_armature.pose.bones:
            if self._is_root_bone(bone.name):
                root_bone = bone
                break
                
        if root_bone:
            # 루트 본 위치를 원점으로 조정
            root_bone.location = (0, 0, 0)
            
            # 스케일 게인 자동 보정
            bpy.ops.object.mode_set(mode='EDIT')
            bpy.ops.armature.select_all(action='SELECT')
            bpy.ops.armature.calculate_roll()
            bpy.ops.object.mode_set(mode='OBJECT')
            
            logger.info(f"[ROOT] 루트 본 보정 완료: {root_bone.name}")
        
        logger.info("[ROOT] BVH 축/스케일 고정 완료")
        return True
    
    def bake_animation(self, start_frame=1, end_frame=100):
        """NLA Bake 및 검증"""
        logger.info("[ACT] NLA Bake 시작")
        
        if not self.target_armature:
            logger.error("[ACT] 타겟 아마추어를 찾을 수 없습니다")
            return False
            
        # Object 모드로 전환
        bpy.context.view_layer.objects.active = self.target_armature
        bpy.ops.object.mode_set(mode='OBJECT')
        
        # 모든 본 선택
        bpy.ops.object.mode_set(mode='POSE')
        bpy.ops.pose.select_all(action='SELECT')
        
        # 본 롤 재정렬
        bpy.ops.armature.calculate_roll()
        
        # NLA Bake 실행
        bpy.ops.nla.bake(
            frame_start=start_frame,
            frame_end=end_frame,
            visual_keying=True,
            clear_constraints=True,
            use_current_action=True,
            bake_types={'POSE'}
        )
        
        # Bake 결과 검증
        if self.target_armature.animation_data and self.target_armature.animation_data.action:
            action = self.target_armature.animation_data.action
            fcurves = len(action.fcurves)
            keyframes = sum(len(fcurve.keyframe_points) for fcurve in action.fcurves)
            
            logger.info(f"[ACT] Bake 완료: fcurves={fcurves}, keyframes={keyframes}")
            
            if fcurves > 0 and keyframes > 0:
                logger.info("[ACT] ✅ 애니메이션 Bake 성공")
                return True
            else:
                logger.error("[ACT] ❌ 애니메이션 Bake 실패: fcurves=0 또는 keyframes=0")
                return False
        else:
            logger.error("[ACT] ❌ 애니메이션 데이터가 없습니다")
            return False
    
    def setup_armature_modifier(self):
        """Armature Modifier 설정"""
        logger.info("[MOD] Armature Modifier 설정 시작")
        
        # 메쉬 오브젝트 찾기
        mesh_objects = [obj for obj in bpy.context.scene.objects if obj.type == 'MESH']
        
        for mesh_obj in mesh_objects:
            # Armature Modifier 찾기 또는 생성
            armature_modifier = None
            for modifier in mesh_obj.modifiers:
                if modifier.type == 'ARMATURE':
                    armature_modifier = modifier
                    break
            
            if not armature_modifier:
                armature_modifier = mesh_obj.modifiers.new(name="Armature", type='ARMATURE')
            
            # 타겟 아마추어 설정
            armature_modifier.object = self.target_armature
            
            # Preserve Volume 활성화
            armature_modifier.use_deform_preserve_volume = True
            
            logger.info(f"[MOD] {mesh_obj.name}: Preserve Volume 활성화")
        
        logger.info("[MOD] Armature Modifier 설정 완료")
        return True
    
    def export_glb(self, output_path):
        """GLB 애니메이션 내보내기"""
        logger.info(f"[GLB] GLB 내보내기 시작: {output_path}")
        
        # 내보내기 전 설정
        bpy.context.view_layer.objects.active = self.target_armature
        
        # GLB 내보내기
        bpy.ops.export_scene.gltf(
            filepath=output_path,
            export_format='GLB',
            export_animations=True,
            export_frame_range=True,
            export_frame_step=1,
            export_force_sampling=True,
            export_nla_strips=True,
            export_def_bones=True,
            export_current_frame=False,
            export_skins=True,
            export_all_influences=False,
            export_morph=False,
            export_lights=False,
            export_cameras=False,
            export_extras=False,
            export_yup=True,
            export_apply=False,
            export_anim_single_armature=True,
            export_optimize_animation_size=True,
            export_anim_slide_to_zero=False,
            export_anim_export_all=False,
            export_anim_export_nla_strips_as_tracks=False,
            export_anim_export_extra_anim_curves=False,
            export_anim_export_extra_anim_curves_as_morph=False,
            export_anim_export_extra_anim_curves_as_morph_rest=False,
            export_anim_export_extra_anim_curves_as_morph_rest_use_rest_pose=False,
            export_anim_export_extra_anim_curves_as_morph_rest_use_rest_pose_use_rest_pose=False,
            export_anim_export_extra_anim_curves_as_morph_rest_use_rest_pose_use_rest_pose_use_rest_pose=False
        )
        
        # 파일 존재 확인
        if os.path.exists(output_path):
            file_size = os.path.getsize(output_path)
            logger.info(f"[GLB] ✅ GLB 내보내기 성공: {output_path} ({file_size} bytes)")
            return True
        else:
            logger.error(f"[GLB] ❌ GLB 내보내기 실패: {output_path}")
            return False
    
    def cleanup(self):
        """정리 작업"""
        logger.info("[CLEANUP] 정리 작업 시작")
        
        # 소스 아마추어 제거
        if self.source_armature:
            bpy.data.objects.remove(self.source_armature, do_unlink=True)
            logger.info("[CLEANUP] 소스 아마추어 제거 완료")
        
        # Object 모드로 전환
        if self.target_armature:
            bpy.context.view_layer.objects.active = self.target_armature
            bpy.ops.object.mode_set(mode='OBJECT')
        
        logger.info("[CLEANUP] 정리 작업 완료")
    
    def retarget(self, bvh_file, target_armature_name, output_path, start_frame=1, end_frame=100):
        """메인 리타겟팅 함수"""
        logger.info("=== FK 리타겟팅 시작 ===")
        
        self.bvh_file = bvh_file
        self.output_path = output_path
        
        try:
            # 1. BVH 파일 로드
            logger.info(f"[LOAD] BVH 파일 로드: {bvh_file}")
            bpy.ops.import_anim.bvh(filepath=bvh_file)
            
            # 소스 아마추어 찾기
            self.source_armature = bpy.context.active_object
            
            # 타겟 아마추어 찾기
            self.target_armature = bpy.data.objects.get(target_armature_name)
            if not self.target_armature:
                logger.error(f"[LOAD] 타겟 아마추어를 찾을 수 없습니다: {target_armature_name}")
                return False
            
            # 2. BVH 축/스케일 고정
            if not self.fix_bvh_axis_scale():
                return False
            
            # 3. FK 제약 조건 설정
            if not self.setup_fk_constraints():
                return False
            
            # 4. Armature Modifier 설정
            if not self.setup_armature_modifier():
                return False
            
            # 5. 애니메이션 Bake
            if not self.bake_animation(start_frame, end_frame):
                return False
            
            # 6. GLB 내보내기
            if not self.export_glb(output_path):
                return False
            
            logger.info("=== FK 리타겟팅 완료 ===")
            return True
            
        except Exception as e:
            logger.error(f"[ERROR] 리타겟팅 실패: {str(e)}")
            return False
        
        finally:
            # 7. 정리 작업
            self.cleanup()

def main():
    """메인 함수"""
    if len(sys.argv) < 4:
        print("사용법: python blender_fk_retarget.py <bvh_file> <target_armature_name> <output_path> [start_frame] [end_frame]")
        sys.exit(1)
    
    bvh_file = sys.argv[1]
    target_armature_name = sys.argv[2]
    output_path = sys.argv[3]
    start_frame = int(sys.argv[4]) if len(sys.argv) > 4 else 1
    end_frame = int(sys.argv[5]) if len(sys.argv) > 5 else 100
    
    # FK 리타겟터 생성 및 실행
    retargeter = FKRetargeter()
    success = retargeter.retarget(bvh_file, target_armature_name, output_path, start_frame, end_frame)
    
    if success:
        print("✅ FK 리타겟팅 성공!")
        sys.exit(0)
    else:
        print("❌ FK 리타겟팅 실패!")
        sys.exit(1)

if __name__ == "__main__":
    main()






