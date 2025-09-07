"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const auth_1 = require("../middleware/auth");
const Video3DConversionEngine_1 = require("../utils/Video3DConversionEngine");
const VideoAnalysisCriteria_1 = require("../models/VideoAnalysisCriteria");
const execAsync_1 = require("../utils/execAsync");
const router = express_1.default.Router();
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path_1.default.join(__dirname, '../../uploads/videos');
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `video-${uniqueSuffix}${path_1.default.extname(file.originalname)}`);
    }
});
const upload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/mkv',
            'video/quicktime', 'video/x-msvideo', 'video/x-ms-wmv',
            'application/octet-stream',
            'video/webm', 'video/3gpp', 'video/x-flv'
        ];
        const allowedExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.mkv', '.webm', '.3gp', '.flv'];
        const fileExt = path_1.default.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(fileExt)) {
            cb(null, true);
        }
        else {
            console.log(`파일 업로드 거부 - MIME: ${file.mimetype}, 확장자: ${fileExt}, 파일명: ${file.originalname}`);
            cb(new Error('지원되지 않는 파일 형식입니다. 동영상 파일만 업로드 가능합니다.'));
        }
    }
});
const modelStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path_1.default.join(__dirname, '../../uploads/models');
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `model-${uniqueSuffix}${path_1.default.extname(file.originalname)}`);
    }
});
const modelUpload = (0, multer_1.default)({
    storage: modelStorage,
    limits: {
        fileSize: 50 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'application/octet-stream',
            'model/obj',
            'application/x-tgif',
            'model/gltf-binary',
            'model/gltf+json',
            'application/x-blender'
        ];
        const allowedExtensions = ['.obj', '.fbx', '.glb', '.gltf', '.blend'];
        const fileExt = path_1.default.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(fileExt)) {
            cb(null, true);
        }
        else {
            cb(new Error('지원되지 않는 3D 모델 형식입니다. OBJ, FBX, GLB, GLTF, BLEND 파일을 업로드해주세요.'));
        }
    }
});
router.post('/upload', auth_1.auth, (0, auth_1.requireRole)(['instructor', 'centerAdmin', 'superAdmin']), upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'customModel', maxCount: 1 }
]), async (req, res) => {
    try {
        if (!req.files) {
            return res.status(400).json({
                success: false,
                message: '파일이 업로드되지 않았습니다.'
            });
        }
        if (!req.files.video || !Array.isArray(req.files.video) || req.files.video.length === 0) {
            return res.status(400).json({
                success: false,
                message: '동영상 파일이 필요합니다.'
            });
        }
        const videoFile = req.files.video[0];
        const customModelFile = req.files.customModel && Array.isArray(req.files.customModel) && req.files.customModel.length > 0
            ? req.files.customModel[0]
            : null;
        const { studentId, technique, level } = req.body;
        if (!videoFile.filename || !videoFile.path) {
            return res.status(400).json({
                success: false,
                message: '동영상 파일 정보가 올바르지 않습니다.'
            });
        }
        if (!studentId || !technique || !level) {
            return res.status(400).json({
                success: false,
                message: '학생 ID, 수영 기법, 레벨이 필요합니다.'
            });
        }
        console.log('🎬 3D 동영상 분석 요청:', {
            studentId,
            technique,
            level,
            videoFile: videoFile.filename,
            customModelFile: customModelFile ? customModelFile.filename : null
        });
        const outputDir = path_1.default.join(__dirname, '../../uploads/3d-analysis', Date.now().toString());
        if (!fs_1.default.existsSync(outputDir)) {
            fs_1.default.mkdirSync(outputDir, { recursive: true });
        }
        let result;
        if (customModelFile) {
            console.log('🎯 사용자 3D 모델을 사용한 변환 시작...');
            result = await convertWithCustomModel(videoFile.path, customModelFile.path, outputDir, technique, level);
        }
        else {
            console.log('📹 기본 3D 변환 시작...');
            result = await Video3DConversionEngine_1.Video3DConversionEngine.convertAndAnalyzeVideo(videoFile.path, outputDir, technique, level);
        }
        console.log('🔍 Python 변환 결과:', JSON.stringify(result, null, 2));
        let swimming3DAnalysis = null;
        if (result.data?.analysisData?.swimming3DAnalysis) {
            swimming3DAnalysis = result.data.analysisData.swimming3DAnalysis;
            console.log('✅ 데이터를 analysisData.swimming3DAnalysis에서 찾았습니다');
        }
        else if (result.data?.swimming3DAnalysis) {
            swimming3DAnalysis = result.data.swimming3DAnalysis;
            console.log('✅ 데이터를 data.swimming3DAnalysis에서 찾았습니다');
        }
        else if (result.swimming3DAnalysis) {
            swimming3DAnalysis = result.swimming3DAnalysis;
            console.log('✅ 데이터를 result.swimming3DAnalysis에서 찾았습니다');
        }
        else {
            console.error('❌ swimming3DAnalysis 데이터를 찾을 수 없습니다');
            return res.status(500).json({
                success: false,
                message: '분석 데이터를 찾을 수 없습니다.'
            });
        }
        console.log('🔍 추출된 swimming3DAnalysis:', JSON.stringify(swimming3DAnalysis, null, 2));
        if (!result.success) {
            return res.status(500).json({
                success: false,
                message: result.message || '3D 변환 분석 중 오류가 발생했습니다.'
            });
        }
        const analysisResult = new VideoAnalysisCriteria_1.VideoAnalysisResult({
            studentId,
            instructorId: req.user.id,
            videoId: videoFile.filename,
            technique,
            level,
            videoMetadata: {
                duration: 30,
                frameRate: 30,
                resolution: { width: 1920, height: 1080 },
                fileSize: videoFile.size,
                uploadDate: new Date()
            },
            analysisResult: {
                overallScore: calculateOverallScore3D(swimming3DAnalysis),
                categoryScores: {
                    posture: swimming3DAnalysis?.swimming3DAnalysis?.bodyAlignment3D?.score || 0,
                    breathing: swimming3DAnalysis?.swimming3DAnalysis?.breathingPattern3D?.score || 0,
                    movement: swimming3DAnalysis?.swimming3DAnalysis?.strokeTechnique3D?.score || 0,
                    efficiency: swimming3DAnalysis?.swimming3DAnalysis?.efficiency3D?.score || 0
                },
                detailedAnalysis: swimming3DAnalysis,
                keyFrames: generateKeyFrames3D(result.data?.analysisData || {}),
                strengths: identifyStrengths3D(swimming3DAnalysis),
                weaknesses: identifyWeaknesses3D(swimming3DAnalysis),
                improvementAreas: identifyImprovementAreas3D(swimming3DAnalysis)
            },
            recommendations: generateRecommendations3D(swimming3DAnalysis),
            feedback: generateFeedback3D(swimming3DAnalysis),
            filePaths: {
                video3D: (() => {
                    const videoPath = result.data?.filePaths?.video3D || result.data?.video3D || path_1.default.join(outputDir, '3d_video_simulation.mp4');
                    console.log('🔍 데이터베이스 저장용 video3D 경로:', videoPath);
                    return videoPath;
                })()
            },
            analysisDate: new Date()
        });
        console.log('🔍 analysisResult 저장 시작...');
        await analysisResult.save();
        console.log('✅ analysisResult 저장 완료');
        console.log('🔍 저장된 filePaths:', JSON.stringify(analysisResult.filePaths, null, 2));
        console.log('🔍 응답 데이터 생성 시작...');
        console.log('🔍 result.data 구조:', JSON.stringify(result.data, null, 2));
        const responseData = {
            success: true,
            data: {
                analysisId: analysisResult._id,
                overallScore: analysisResult.analysisResult.overallScore,
                categoryScores: analysisResult.analysisResult.categoryScores,
                strengths: analysisResult.analysisResult.strengths,
                weaknesses: analysisResult.analysisResult.weaknesses,
                improvementAreas: analysisResult.analysisResult.improvementAreas,
                recommendations: analysisResult.recommendations,
                feedback: analysisResult.feedback,
                filePaths: {
                    video3D: result.data?.filePaths?.video3D || result.data?.video3D || path_1.default.join(outputDir, '3d_video_simulation.mp4')
                }
            },
            message: '3D 동영상 분석이 성공적으로 완료되었습니다.'
        };
        console.log('🔍 응답 데이터 크기:', JSON.stringify(responseData).length, 'bytes');
        console.log('✅ 응답 데이터 생성 완료');
        console.log('🔍 응답 전송 시작...');
        res.status(200).json(responseData);
        console.log('✅ 응답 전송 완료');
    }
    catch (error) {
        console.error('❌ 3D 동영상 분석 오류:', error);
        res.status(500).json({
            success: false,
            message: '3D 동영상 분석 중 오류가 발생했습니다.'
        });
    }
});
router.get('/results/:analysisId', auth_1.auth, (0, auth_1.requireRole)(['instructor', 'centerAdmin', 'superAdmin']), async (req, res) => {
    try {
        const { analysisId } = req.params;
        const analysisResult = await VideoAnalysisCriteria_1.VideoAnalysisResult.findById(analysisId)
            .populate('studentId', 'name email')
            .populate('instructorId', 'name email');
        if (!analysisResult) {
            return res.status(404).json({
                success: false,
                message: '분석 결과를 찾을 수 없습니다.'
            });
        }
        res.status(200).json({
            success: true,
            data: analysisResult,
            message: '3D 분석 결과를 성공적으로 조회했습니다.'
        });
    }
    catch (error) {
        console.error('❌ 3D 분석 결과 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '3D 분석 결과 조회 중 오류가 발생했습니다.'
        });
    }
});
router.get('/student/:studentId', auth_1.auth, (0, auth_1.requireRole)(['instructor', 'centerAdmin', 'superAdmin']), async (req, res) => {
    try {
        const { studentId } = req.params;
        const { technique, limit = 10 } = req.query;
        const query = { studentId };
        if (technique) {
            query.technique = technique;
        }
        const analysisResults = await VideoAnalysisCriteria_1.VideoAnalysisResult.find(query)
            .sort({ analysisDate: -1 })
            .limit(parseInt(limit))
            .populate('instructorId', 'name email');
        res.status(200).json({
            success: true,
            data: analysisResults,
            message: '학생의 3D 분석 결과를 성공적으로 조회했습니다.'
        });
    }
    catch (error) {
        console.error('❌ 학생 3D 분석 결과 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '학생 3D 분석 결과 조회 중 오류가 발생했습니다.'
        });
    }
});
router.delete('/results/:analysisId', auth_1.auth, (0, auth_1.requireRole)(['centerAdmin', 'superAdmin']), async (req, res) => {
    try {
        const { analysisId } = req.params;
        const analysisResult = await VideoAnalysisCriteria_1.VideoAnalysisResult.findByIdAndDelete(analysisId);
        if (!analysisResult) {
            return res.status(404).json({
                success: false,
                message: '분석 결과를 찾을 수 없습니다.'
            });
        }
        res.status(200).json({
            success: true,
            message: '3D 분석 결과가 성공적으로 삭제되었습니다.'
        });
    }
    catch (error) {
        console.error('❌ 3D 분석 결과 삭제 오류:', error);
        res.status(500).json({
            success: false,
            message: '3D 분석 결과 삭제 중 오류가 발생했습니다.'
        });
    }
});
function calculateOverallScore3D(swimming3DAnalysis) {
    console.log('🔍 calculateOverallScore3D - swimming3DAnalysis:', JSON.stringify(swimming3DAnalysis, null, 2));
    console.log('🔍 swimming3DAnalysis type:', typeof swimming3DAnalysis);
    console.log('🔍 swimming3DAnalysis keys:', Object.keys(swimming3DAnalysis || {}));
    if (!swimming3DAnalysis) {
        console.error('❌ swimming3DAnalysis is undefined');
        return 0;
    }
    const actualAnalysisData = swimming3DAnalysis.swimming3DAnalysis;
    console.log('🔍 actualAnalysisData:', JSON.stringify(actualAnalysisData, null, 2));
    if (!actualAnalysisData) {
        console.error('❌ actualAnalysisData is undefined');
        return 0;
    }
    console.log('🔍 bodyAlignment3D exists:', !!actualAnalysisData.bodyAlignment3D);
    console.log('🔍 strokeTechnique3D exists:', !!actualAnalysisData.strokeTechnique3D);
    console.log('🔍 breathingPattern3D exists:', !!actualAnalysisData.breathingPattern3D);
    console.log('🔍 efficiency3D exists:', !!actualAnalysisData.efficiency3D);
    if (actualAnalysisData.bodyAlignment3D) {
        console.log('🔍 bodyAlignment3D keys:', Object.keys(actualAnalysisData.bodyAlignment3D));
        console.log('🔍 bodyAlignment3D.score:', actualAnalysisData.bodyAlignment3D.score);
    }
    let bodyAlignmentScore = 0;
    let strokeTechniqueScore = 0;
    let breathingPatternScore = 0;
    let efficiencyScore = 0;
    try {
        if (actualAnalysisData.bodyAlignment3D && actualAnalysisData.bodyAlignment3D.score !== undefined) {
            bodyAlignmentScore = actualAnalysisData.bodyAlignment3D.score;
            console.log('✅ bodyAlignmentScore:', bodyAlignmentScore);
        }
        else {
            console.log('❌ bodyAlignment3D.score not found');
        }
        if (actualAnalysisData.strokeTechnique3D && actualAnalysisData.strokeTechnique3D.score !== undefined) {
            strokeTechniqueScore = actualAnalysisData.strokeTechnique3D.score;
            console.log('✅ strokeTechniqueScore:', strokeTechniqueScore);
        }
        else {
            console.log('❌ strokeTechnique3D.score not found');
        }
        if (actualAnalysisData.breathingPattern3D && actualAnalysisData.breathingPattern3D.score !== undefined) {
            breathingPatternScore = actualAnalysisData.breathingPattern3D.score;
            console.log('✅ breathingPatternScore:', breathingPatternScore);
        }
        else {
            console.log('❌ breathingPattern3D.score not found');
        }
        if (actualAnalysisData.efficiency3D && actualAnalysisData.efficiency3D.score !== undefined) {
            efficiencyScore = actualAnalysisData.efficiency3D.score;
            console.log('✅ efficiencyScore:', efficiencyScore);
        }
        else {
            console.log('❌ efficiency3D.score not found');
        }
    }
    catch (error) {
        console.error('❌ Error extracting scores:', error);
    }
    const scores = [bodyAlignmentScore, strokeTechniqueScore, breathingPatternScore, efficiencyScore];
    console.log('🔍 final scores:', scores);
    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
}
function generateKeyFrames3D(analysisData) {
    const keyFrames = [];
    const bodyPositions = analysisData?.bodyPositions3D || [];
    const totalFrames = bodyPositions.length;
    if (totalFrames === 0) {
        console.log('⚠️ bodyPositions3D가 비어있습니다. 기본 키프레임을 생성합니다.');
        return [
            { frameNumber: 0, timestamp: 0, analysis: '기본 3D 프레임', score: 75 },
            { frameNumber: 1, timestamp: 1 / 30, analysis: '기본 3D 프레임', score: 80 },
            { frameNumber: 2, timestamp: 2 / 30, analysis: '기본 3D 프레임', score: 85 }
        ];
    }
    const interval = Math.floor(totalFrames / 10);
    for (let i = 0; i < totalFrames; i += interval) {
        keyFrames.push({
            frameNumber: i,
            timestamp: i / 30,
            analysis: `3D 프레임 ${i} 분석 결과`,
            score: 70 + Math.random() * 30
        });
    }
    return keyFrames;
}
function identifyStrengths3D(swimming3DAnalysis) {
    const strengths = [];
    const actualAnalysisData = swimming3DAnalysis?.swimming3DAnalysis;
    const bodyAlignmentScore = actualAnalysisData?.bodyAlignment3D?.score || 0;
    const strokeTechniqueScore = actualAnalysisData?.strokeTechnique3D?.score || 0;
    const breathingPatternScore = actualAnalysisData?.breathingPattern3D?.score || 0;
    const efficiencyScore = actualAnalysisData?.efficiency3D?.score || 0;
    if (bodyAlignmentScore >= 80) {
        strengths.push('3D 자세 분석: 우수한 몸의 정렬');
    }
    if (strokeTechniqueScore >= 80) {
        strengths.push('3D 스트로크 기법: 효율적인 팔 동작');
    }
    if (breathingPatternScore >= 80) {
        strengths.push('3D 호흡 패턴: 적절한 호흡 타이밍');
    }
    if (efficiencyScore >= 80) {
        strengths.push('3D 효율성: 높은 수영 효율');
    }
    return strengths;
}
function identifyWeaknesses3D(swimming3DAnalysis) {
    const weaknesses = [];
    const actualAnalysisData = swimming3DAnalysis?.swimming3DAnalysis;
    const bodyAlignmentScore = actualAnalysisData?.bodyAlignment3D?.score || 0;
    const strokeTechniqueScore = actualAnalysisData?.strokeTechnique3D?.score || 0;
    const breathingPatternScore = actualAnalysisData?.breathingPattern3D?.score || 0;
    const efficiencyScore = actualAnalysisData?.efficiency3D?.score || 0;
    if (bodyAlignmentScore < 60) {
        weaknesses.push('3D 자세 분석: 몸의 정렬 개선 필요');
    }
    if (strokeTechniqueScore < 60) {
        weaknesses.push('3D 스트로크 기법: 팔 동작 개선 필요');
    }
    if (breathingPatternScore < 60) {
        weaknesses.push('3D 호흡 패턴: 호흡 타이밍 개선 필요');
    }
    if (efficiencyScore < 60) {
        weaknesses.push('3D 효율성: 수영 효율 개선 필요');
    }
    return weaknesses;
}
function identifyImprovementAreas3D(swimming3DAnalysis) {
    return identifyWeaknesses3D(swimming3DAnalysis);
}
function generateRecommendations3D(swimming3DAnalysis) {
    const exercises = [];
    const weaknesses = identifyWeaknesses3D(swimming3DAnalysis);
    for (const weakness of weaknesses) {
        if (weakness.includes('자세')) {
            exercises.push({
                name: '3D 자세 교정 운동',
                priority: 'high',
                reason: '3D 분석 결과 기반 자세 개선',
                duration: 30
            });
        }
        if (weakness.includes('스트로크')) {
            exercises.push({
                name: '3D 스트로크 연습',
                priority: 'high',
                reason: '3D 분석 결과 기반 스트로크 개선',
                duration: 25
            });
        }
        if (weakness.includes('호흡')) {
            exercises.push({
                name: '3D 호흡 연습',
                priority: 'medium',
                reason: '3D 분석 결과 기반 호흡 개선',
                duration: 20
            });
        }
        if (weakness.includes('효율성')) {
            exercises.push({
                name: '3D 효율성 훈련',
                priority: 'high',
                reason: '3D 분석 결과 기반 효율성 개선',
                duration: 35
            });
        }
    }
    return {
        exercises,
        workoutPlan: {
            name: '3D 분석 기반 맞춤 훈련 계획',
            description: '3D 동영상 분석 결과를 바탕으로 한 개인별 맞춤형 훈련 계획',
            duration: 60,
            frequency: 3
        },
        nextAnalysisDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    };
}
function generateFeedback3D(swimming3DAnalysis) {
    const overallScore = calculateOverallScore3D(swimming3DAnalysis);
    const strengths = identifyStrengths3D(swimming3DAnalysis);
    const weaknesses = identifyWeaknesses3D(swimming3DAnalysis);
    let feedbackLevel = 'average';
    if (overallScore >= 90)
        feedbackLevel = 'excellent';
    else if (overallScore >= 75)
        feedbackLevel = 'good';
    else if (overallScore < 60)
        feedbackLevel = 'poor';
    const feedbackMessages = {
        excellent: '3D 분석 결과 매우 우수한 수영 실력을 보여주고 있습니다!',
        good: '3D 분석 결과 양호한 수영 실력을 보여주고 있습니다.',
        average: '3D 분석 결과 보통 수준의 수영 실력을 보여주고 있습니다.',
        poor: '3D 분석 결과 개선이 필요한 부분들이 있습니다.'
    };
    return {
        summary: `3D 분석 전체 점수: ${overallScore}점 (${feedbackLevel})`,
        detailedFeedback: feedbackMessages[feedbackLevel],
        encouragement: strengths.length > 0
            ? `특히 ${strengths.join(', ')} 영역에서 우수한 실력을 보여주고 있습니다.`
            : '꾸준한 연습을 통해 더욱 향상될 수 있습니다.',
        goals: weaknesses.map(weakness => `${weakness} 개선하기`)
    };
}
router.get('/download/:analysisId', async (req, res) => {
    try {
        const { analysisId } = req.params;
        console.log('🔍 3D 영상 다운로드 요청:', analysisId);
        console.log('🔍 요청 헤더:', req.headers);
        const analysis = await VideoAnalysisCriteria_1.VideoAnalysisResult.findById(analysisId);
        if (!analysis) {
            console.log('❌ 분석 결과를 찾을 수 없습니다:', analysisId);
            return res.status(404).json({
                success: false,
                message: '분석 결과를 찾을 수 없습니다.'
            });
        }
        console.log('✅ 분석 결과 찾음:', analysis._id);
        let video3DPath = analysis.filePaths?.video3D;
        console.log('🔍 3D 영상 파일 경로 (원본):', video3DPath);
        if (video3DPath && !path_1.default.isAbsolute(video3DPath)) {
            const analysisDir = path_1.default.join(__dirname, '../../uploads/3d-analysis', analysisId);
            video3DPath = path_1.default.join(analysisDir, video3DPath);
            console.log('🔍 절대 경로로 변환:', video3DPath);
        }
        if (!video3DPath || !fs_1.default.existsSync(video3DPath)) {
            console.log('❌ 3D 영상 파일을 찾을 수 없습니다:', video3DPath);
            const alternativePaths = [
                path_1.default.join(__dirname, '../../uploads/3d-analysis', analysisId, '3d_video_enhanced.mp4'),
                path_1.default.join(__dirname, '../../uploads/3d-analysis', analysisId, '3d_video_simulation.mp4'),
                path_1.default.join(__dirname, '../../uploads/3d-analysis', analysisId, '3d_video.mp4')
            ];
            for (const altPath of alternativePaths) {
                if (fs_1.default.existsSync(altPath)) {
                    video3DPath = altPath;
                    console.log('✅ 대안 경로에서 파일 발견:', video3DPath);
                    break;
                }
            }
            if (!video3DPath || !fs_1.default.existsSync(video3DPath)) {
                return res.status(404).json({
                    success: false,
                    message: '3D 영상 파일을 찾을 수 없습니다.'
                });
            }
        }
        console.log('✅ 3D 영상 파일 존재 확인:', video3DPath);
        const stats = fs_1.default.statSync(video3DPath);
        console.log('🔍 파일 크기:', stats.size, 'bytes');
        console.log('🔍 파일 수정 시간:', stats.mtime);
        res.download(video3DPath, `3d_analysis_${analysisId}.mp4`, (err) => {
            if (err) {
                console.error('3D 영상 다운로드 오류:', err);
                if (!res.headersSent) {
                    res.status(500).json({
                        success: false,
                        message: '3D 영상 다운로드 중 오류가 발생했습니다.'
                    });
                }
            }
            else {
                console.log('✅ 3D 영상 다운로드 성공');
            }
        });
    }
    catch (error) {
        console.error('3D 영상 다운로드 오류:', error);
        res.status(500).json({
            success: false,
            message: '3D 영상 다운로드 중 오류가 발생했습니다.'
        });
    }
});
router.get('/download-3d-model/:analysisId', async (req, res) => {
    try {
        const { analysisId } = req.params;
        console.log('🔍 3D 모델 다운로드 요청:', analysisId);
        const analysis = await VideoAnalysisCriteria_1.VideoAnalysisResult.findById(analysisId);
        if (!analysis) {
            return res.status(404).json({ error: '분석 결과를 찾을 수 없습니다.' });
        }
        const outputDir = path_1.default.dirname(analysis.filePaths?.video3D || '');
        const animatedModelsDir = path_1.default.join(outputDir, 'animated_models');
        console.log('🔍 3D 모델 디렉토리:', animatedModelsDir);
        if (!fs_1.default.existsSync(animatedModelsDir)) {
            return res.status(404).json({ error: '3D 모델 파일을 찾을 수 없습니다.' });
        }
        const files = fs_1.default.readdirSync(animatedModelsDir);
        const objFiles = files.filter(file => file.endsWith('.obj'));
        const blendFiles = files.filter(file => file.endsWith('.blend'));
        if (objFiles.length === 0 && blendFiles.length === 0) {
            return res.status(404).json({ error: '3D 모델 파일(.obj, .blend)을 찾을 수 없습니다.' });
        }
        const targetFile = objFiles[0] || blendFiles[0];
        const filePath = path_1.default.join(animatedModelsDir, targetFile);
        console.log('✅ 3D 모델 파일 다운로드:', filePath);
        res.download(filePath, `3d_model_${analysisId}_${targetFile}`, (err) => {
            if (err) {
                console.error('3D 모델 다운로드 오류:', err);
                res.status(500).json({ error: '3D 모델 파일 다운로드 중 오류가 발생했습니다.' });
            }
        });
    }
    catch (error) {
        console.error('3D 모델 다운로드 오류:', error);
        res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});
router.get('/threejs-data/*', async (req, res) => {
    try {
        const filePath = req.params[0];
        console.log('🔍 Three.js 데이터 요청:', filePath);
        const fullPath = path_1.default.join(__dirname, '../../uploads/3d-analysis', filePath);
        console.log('🔍 전체 경로:', fullPath);
        if (!fs_1.default.existsSync(fullPath)) {
            console.log('❌ Three.js 데이터 파일을 찾을 수 없습니다:', fullPath);
            return res.status(404).json({
                success: false,
                message: 'Three.js 데이터 파일을 찾을 수 없습니다.'
            });
        }
        const data = fs_1.default.readFileSync(fullPath, 'utf-8');
        const jsonData = JSON.parse(data);
        console.log('✅ Three.js 데이터 제공 완료');
        res.json(jsonData);
    }
    catch (error) {
        console.error('Three.js 데이터 제공 오류:', error);
        res.status(500).json({
            success: false,
            message: 'Three.js 데이터 제공 중 오류가 발생했습니다.'
        });
    }
});
async function convertWithCustomModel(videoPath, modelPath, outputDir, technique, level) {
    try {
        console.log('🎯 사용자 3D 모델 변환 시작...');
        console.log('  - 비디오:', videoPath);
        console.log('  - 모델:', modelPath);
        console.log('  - 출력:', outputDir);
        const scriptPath = path_1.default.join(__dirname, '../../scripts/custom_model_3d_converter.py');
        const pythonCommand = process.platform === 'win32' ? 'py' : 'python3';
        const command = process.platform === 'win32'
            ? `${pythonCommand} -3.11 "${scriptPath}" "${videoPath}" "${outputDir}" --model_path "${modelPath}" --technique "${technique}" --level "${level}"`
            : `${pythonCommand} "${scriptPath}" "${videoPath}" "${outputDir}" --model_path "${modelPath}" --technique "${technique}" --level "${level}"`;
        console.log('🔍 사용자 모델 변환 명령어:', command);
        const options = {
            cwd: path_1.default.dirname(scriptPath),
            timeout: 300000,
            shell: process.platform === 'win32' ? 'cmd.exe' : '/bin/bash',
            windowsHide: false,
            env: {
                ...process.env,
                PYTHONPATH: path_1.default.dirname(scriptPath),
                PYTHONIOENCODING: 'utf-8',
                PYTHONUNBUFFERED: '1'
            }
        };
        console.log('🚀 사용자 모델 Python 스크립트 실행 시작...');
        const { stdout, stderr } = await (0, execAsync_1.execAsync)(command, options);
        console.log('✅ 사용자 모델 Python 스크립트 실행 완료');
        console.log('📤 stdout:', stdout);
        if (stderr) {
            console.log('⚠️ stderr:', stderr);
        }
        const jsonStart = stdout.indexOf('=== JSON 결과 시작 ===');
        const jsonEnd = stdout.indexOf('=== JSON 결과 끝 ===');
        if (jsonStart !== -1 && jsonEnd !== -1) {
            const jsonStr = stdout.substring(jsonStart + 20, jsonEnd).trim();
            console.log('🔍 파싱할 JSON:', jsonStr);
            try {
                const result = JSON.parse(jsonStr);
                console.log('✅ 사용자 모델 변환 결과 파싱 성공');
                return result;
            }
            catch (parseError) {
                console.error('❌ JSON 파싱 오류:', parseError);
                throw new Error(`JSON 파싱 실패: ${parseError.message}`);
            }
        }
        else {
            console.error('❌ JSON 결과를 찾을 수 없습니다');
            throw new Error('Python 스크립트에서 JSON 결과를 찾을 수 없습니다');
        }
    }
    catch (error) {
        console.error('❌ 사용자 모델 변환 오류:', error);
        throw error;
    }
}
exports.default = router;
//# sourceMappingURL=video-3d-analysis.js.map