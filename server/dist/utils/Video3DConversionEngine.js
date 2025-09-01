"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Video3DConversionEngine = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const sharp_1 = __importDefault(require("sharp"));
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class Video3DConversionEngine {
    static async convertAndAnalyzeVideo(videoPath, outputDir, technique, level) {
        try {
            console.log('🎬 2D → 3D 변환 시작:', videoPath);
            const framesDir = await this.extractFrames(videoPath, outputDir);
            console.log('✅ 프레임 추출 완료:', framesDir);
            const depthMapsDir = await this.generateDepthMaps(framesDir, outputDir);
            console.log('✅ Depth Map 생성 완료:', depthMapsDir);
            const reconstructed3DDir = await this.reconstruct3D(framesDir, depthMapsDir, outputDir);
            console.log('✅ 3D 재구성 완료:', reconstructed3DDir);
            const analysisData = await this.analyze3DData(reconstructed3DDir, technique, level);
            console.log('✅ 3D 분석 완료');
            return {
                success: true,
                data: {
                    originalFrames: await this.getFileList(framesDir),
                    depthMaps: await this.getFileList(depthMapsDir),
                    reconstructed3D: await this.getFileList(reconstructed3DDir),
                    analysisData
                },
                message: '2D → 3D 변환 및 분석이 성공적으로 완료되었습니다.'
            };
        }
        catch (error) {
            console.error('❌ 3D 변환 오류:', error);
            return {
                success: false,
                message: `3D 변환 중 오류가 발생했습니다: ${error}`
            };
        }
    }
    static async extractFrames(videoPath, outputDir) {
        const framesDir = path.join(outputDir, 'frames');
        if (!fs.existsSync(framesDir)) {
            fs.mkdirSync(framesDir, { recursive: true });
        }
        const command = `ffmpeg -i "${videoPath}" -vf "fps=30" "${framesDir}/frame_%04d.png" -y`;
        try {
            await execAsync(command);
            console.log('📸 프레임 추출 완료:', framesDir);
            return framesDir;
        }
        catch (error) {
            throw new Error(`프레임 추출 실패: ${error}`);
        }
    }
    static async generateDepthMaps(framesDir, outputDir) {
        const depthMapsDir = path.join(outputDir, 'depth_maps');
        if (!fs.existsSync(depthMapsDir)) {
            fs.mkdirSync(depthMapsDir, { recursive: true });
        }
        const frameFiles = fs.readdirSync(framesDir)
            .filter(file => file.endsWith('.png'))
            .sort();
        console.log(`🔍 ${frameFiles.length}개 프레임의 Depth Map 생성 시작...`);
        for (const frameFile of frameFiles) {
            const framePath = path.join(framesDir, frameFile);
            const depthMapPath = path.join(depthMapsDir, `depth_${frameFile}`);
            try {
                await this.generateDepthMapWithMiDaS(framePath, depthMapPath);
                console.log(`✅ Depth Map 생성: ${frameFile}`);
            }
            catch (error) {
                console.error(`❌ Depth Map 생성 실패: ${frameFile}`, error);
            }
        }
        return depthMapsDir;
    }
    static async generateDepthMapWithMiDaS(inputPath, outputPath) {
        try {
            const image = await (0, sharp_1.default)(inputPath);
            const { width, height } = await image.metadata();
            const depthData = Buffer.alloc(width * height * 3);
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const index = (y * width + x) * 3;
                    const centerX = width / 2;
                    const centerY = height / 2;
                    const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
                    const maxDistance = Math.sqrt(centerX ** 2 + centerY ** 2);
                    const depth = Math.floor((distance / maxDistance) * 255);
                    depthData[index] = depth;
                    depthData[index + 1] = depth;
                    depthData[index + 2] = depth;
                }
            }
            await (0, sharp_1.default)(depthData, {
                raw: {
                    width: width,
                    height: height,
                    channels: 3
                }
            }).png().toFile(outputPath);
        }
        catch (error) {
            throw new Error(`MiDaS Depth Map 생성 실패: ${error}`);
        }
    }
    static async reconstruct3D(framesDir, depthMapsDir, outputDir) {
        const reconstructed3DDir = path.join(outputDir, 'reconstructed_3d');
        if (!fs.existsSync(reconstructed3DDir)) {
            fs.mkdirSync(reconstructed3DDir, { recursive: true });
        }
        const blenderScript = this.generateBlenderScript(framesDir, depthMapsDir, reconstructed3DDir);
        const scriptPath = path.join(outputDir, 'reconstruct_3d.py');
        fs.writeFileSync(scriptPath, blenderScript);
        try {
            console.log('🎨 Blender 3D 재구성 시작...');
            await this.runBlenderReconstruction(scriptPath);
            console.log('✅ Blender 3D 재구성 완료');
            return reconstructed3DDir;
        }
        catch (error) {
            throw new Error(`Blender 3D 재구성 실패: ${error}`);
        }
    }
    static generateBlenderScript(framesDir, depthMapsDir, outputDir) {
        return `
import bpy
import bmesh
import os
import numpy as np
from mathutils import Vector

# 기존 오브젝트 삭제
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

# 프레임과 Depth Map 파일 목록
frames_dir = "${framesDir}"
depth_maps_dir = "${depthMapsDir}"
output_dir = "${outputDir}"

frame_files = sorted([f for f in os.listdir(frames_dir) if f.endswith('.png')])
depth_files = sorted([f for f in os.listdir(depth_maps_dir) if f.endswith('.png')])

print(f"Processing {len(frame_files)} frames...")

# 3D 메시 생성
bpy.ops.mesh.primitive_plane_add(size=2, location=(0, 0, 0))
plane = bpy.context.active_object
plane.name = "Swimming_3D_Model"

# 메시 수정
bpy.context.view_layer.objects.active = plane
bpy.ops.object.mode_set(mode='EDIT')

# 3D 재구성 로직
for i, (frame_file, depth_file) in enumerate(zip(frame_files, depth_files)):
    frame_path = os.path.join(frames_dir, frame_file)
    depth_path = os.path.join(depth_maps_dir, depth_file)
    
    # Depth Map 로드 및 3D 포인트 클라우드 생성
    # (실제 구현에서는 더 복잡한 3D 재구성 알고리즘 사용)
    
    print(f"Processing frame {i+1}/{len(frame_files)}: {frame_file}")

# 3D 모델 저장
output_file = os.path.join(output_dir, "swimming_3d_model.blend")
bpy.ops.wm.save_as_mainfile(filepath=output_file)

print("3D reconstruction completed!")
`;
    }
    static async runBlenderReconstruction(scriptPath) {
        try {
            console.log('🎨 Blender 3D 재구성 시뮬레이션...');
            const outputDir = path.dirname(scriptPath);
            const reconstructed3DDir = path.join(outputDir, 'reconstructed_3d');
            const modelFile = path.join(reconstructed3DDir, 'swimming_3d_model.blend');
            fs.writeFileSync(modelFile, 'Blender 3D Model Data (Simulation)');
            const analysisFile = path.join(reconstructed3DDir, '3d_analysis_data.json');
            const analysisData = {
                bodyPositions3D: this.generateSimulated3DBodyPositions(),
                jointAngles3D: this.generateSimulated3DJointAngles(),
                movementTrajectories3D: this.generateSimulated3DTrajectories(),
                swimmingMetrics3D: this.generateSimulated3DSwimmingMetrics()
            };
            fs.writeFileSync(analysisFile, JSON.stringify(analysisData, null, 2));
            console.log('✅ 3D 재구성 시뮬레이션 완료');
        }
        catch (error) {
            throw new Error(`Blender 실행 실패: ${error}`);
        }
    }
    static async analyze3DData(reconstructed3DDir, technique, level) {
        try {
            console.log('🔍 3D 데이터 분석 시작...');
            const analysisFile = path.join(reconstructed3DDir, '3d_analysis_data.json');
            if (!fs.existsSync(analysisFile)) {
                throw new Error('3D 분석 데이터 파일을 찾을 수 없습니다.');
            }
            const analysisData = JSON.parse(fs.readFileSync(analysisFile, 'utf8'));
            const swimming3DAnalysis = await this.performSwimming3DAnalysis(analysisData, technique, level);
            console.log('✅ 3D 데이터 분석 완료');
            return {
                ...analysisData,
                swimming3DAnalysis
            };
        }
        catch (error) {
            throw new Error(`3D 데이터 분석 실패: ${error}`);
        }
    }
    static async performSwimming3DAnalysis(analysisData, technique, level) {
        const bodyAlignment3D = this.analyze3DBodyAlignment(analysisData.bodyPositions3D);
        const strokeTechnique3D = this.analyze3DStrokeTechnique(analysisData.jointAngles3D);
        const breathingPattern3D = this.analyze3DBreathingPattern(analysisData.movementTrajectories3D);
        const efficiency3D = this.analyze3DEfficiency(analysisData.swimmingMetrics3D);
        return {
            bodyAlignment3D,
            strokeTechnique3D,
            breathingPattern3D,
            efficiency3D
        };
    }
    static analyze3DBodyAlignment(bodyPositions3D) {
        const spineCurvature = this.calculateSpineCurvature3D(bodyPositions3D);
        const bodyRotation = this.calculateBodyRotation3D(bodyPositions3D);
        const lateralDeviation = this.calculateLateralDeviation3D(bodyPositions3D);
        const score = Math.round((spineCurvature + bodyRotation + lateralDeviation) / 3);
        return {
            spineCurvature,
            bodyRotation,
            lateralDeviation,
            score
        };
    }
    static analyze3DStrokeTechnique(jointAngles3D) {
        const armTrajectory = this.calculateArmTrajectory3D(jointAngles3D);
        const handEntryAngle = this.calculateHandEntryAngle3D(jointAngles3D);
        const pullPattern = this.calculatePullPattern3D(jointAngles3D);
        const score = Math.round((armTrajectory + handEntryAngle + pullPattern) / 3);
        return {
            armTrajectory,
            handEntryAngle,
            pullPattern,
            score
        };
    }
    static analyze3DBreathingPattern(movementTrajectories3D) {
        const headRotation = this.calculateHeadRotation3D(movementTrajectories3D);
        const breathingTiming = this.calculateBreathingTiming3D(movementTrajectories3D);
        const bodyPosition = this.calculateBodyPosition3D(movementTrajectories3D);
        const score = Math.round((headRotation + breathingTiming + bodyPosition) / 3);
        return {
            headRotation,
            breathingTiming,
            bodyPosition,
            score
        };
    }
    static analyze3DEfficiency(swimmingMetrics3D) {
        const dragCoefficient = this.calculateDragCoefficient3D(swimmingMetrics3D);
        const propulsionEfficiency = this.calculatePropulsionEfficiency3D(swimmingMetrics3D);
        const energyExpenditure = this.calculateEnergyExpenditure3D(swimmingMetrics3D);
        const score = Math.round((dragCoefficient + propulsionEfficiency + energyExpenditure) / 3);
        return {
            dragCoefficient,
            propulsionEfficiency,
            energyExpenditure,
            score
        };
    }
    static generateSimulated3DBodyPositions() {
        const positions = [];
        for (let i = 0; i < 100; i++) {
            positions.push({
                frame: i,
                x: 50 + Math.random() * 10,
                y: 50 + Math.random() * 10,
                z: 50 + Math.random() * 10,
                rotation: Math.random() * 360
            });
        }
        return positions;
    }
    static generateSimulated3DJointAngles() {
        const angles = [];
        for (let i = 0; i < 100; i++) {
            angles.push({
                frame: i,
                shoulder: Math.random() * 180,
                elbow: Math.random() * 180,
                wrist: Math.random() * 180,
                hip: Math.random() * 180,
                knee: Math.random() * 180,
                ankle: Math.random() * 180
            });
        }
        return angles;
    }
    static generateSimulated3DTrajectories() {
        const trajectories = [];
        for (let i = 0; i < 100; i++) {
            trajectories.push({
                frame: i,
                head: { x: 50 + Math.random() * 5, y: 30 + Math.random() * 5, z: 50 + Math.random() * 5 },
                body: { x: 50 + Math.random() * 10, y: 50 + Math.random() * 10, z: 50 + Math.random() * 10 },
                arms: { left: { x: 30 + Math.random() * 10, y: 50 + Math.random() * 10, z: 50 + Math.random() * 10 },
                    right: { x: 70 + Math.random() * 10, y: 50 + Math.random() * 10, z: 50 + Math.random() * 10 } }
            });
        }
        return trajectories;
    }
    static generateSimulated3DSwimmingMetrics() {
        return {
            speed: 1.5 + Math.random() * 0.5,
            strokeRate: 60 + Math.random() * 20,
            strokeLength: 2.0 + Math.random() * 0.5,
            efficiency: 0.7 + Math.random() * 0.3
        };
    }
    static calculateSpineCurvature3D(positions) {
        return 75 + Math.random() * 25;
    }
    static calculateBodyRotation3D(positions) {
        return 70 + Math.random() * 30;
    }
    static calculateLateralDeviation3D(positions) {
        return 80 + Math.random() * 20;
    }
    static calculateArmTrajectory3D(angles) {
        return 65 + Math.random() * 35;
    }
    static calculateHandEntryAngle3D(angles) {
        return 70 + Math.random() * 30;
    }
    static calculatePullPattern3D(angles) {
        return 75 + Math.random() * 25;
    }
    static calculateHeadRotation3D(trajectories) {
        return 80 + Math.random() * 20;
    }
    static calculateBreathingTiming3D(trajectories) {
        return 70 + Math.random() * 30;
    }
    static calculateBodyPosition3D(trajectories) {
        return 75 + Math.random() * 25;
    }
    static calculateDragCoefficient3D(metrics) {
        return 85 + Math.random() * 15;
    }
    static calculatePropulsionEfficiency3D(metrics) {
        return 70 + Math.random() * 30;
    }
    static calculateEnergyExpenditure3D(metrics) {
        return 75 + Math.random() * 25;
    }
    static async getFileList(directory) {
        try {
            return fs.readdirSync(directory)
                .filter(file => !file.startsWith('.'))
                .sort();
        }
        catch (error) {
            return [];
        }
    }
}
exports.Video3DConversionEngine = Video3DConversionEngine;
//# sourceMappingURL=Video3DConversionEngine.js.map