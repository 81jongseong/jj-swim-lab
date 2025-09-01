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
        const allowedTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/mkv'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('지원되지 않는 파일 형식입니다. 동영상 파일만 업로드 가능합니다.'));
        }
    }
});
router.post('/upload', auth_1.auth, (0, auth_1.requireRole)(['instructor', 'centerAdmin', 'superAdmin']), upload.single('video'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: '동영상 파일이 필요합니다.'
            });
        }
        const { studentId, technique, level } = req.body;
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
            videoFile: req.file.filename
        });
        const outputDir = path_1.default.join(__dirname, '../../uploads/3d-analysis', Date.now().toString());
        if (!fs_1.default.existsSync(outputDir)) {
            fs_1.default.mkdirSync(outputDir, { recursive: true });
        }
        const result = await Video3DConversionEngine_1.Video3DConversionEngine.convertAndAnalyzeVideo(req.file.path, outputDir, technique, level);
        if (!result.success) {
            return res.status(500).json({
                success: false,
                message: result.message || '3D 변환 분석 중 오류가 발생했습니다.'
            });
        }
        const analysisResult = new VideoAnalysisCriteria_1.VideoAnalysisResult({
            studentId,
            instructorId: req.user.id,
            videoId: req.file.filename,
            technique,
            level,
            videoMetadata: {
                duration: 30,
                frameRate: 30,
                resolution: { width: 1920, height: 1080 },
                fileSize: req.file.size,
                uploadDate: new Date()
            },
            analysisResult: {
                overallScore: calculateOverallScore3D(result.data.analysisData.swimming3DAnalysis),
                categoryScores: {
                    posture: result.data.analysisData.swimming3DAnalysis.bodyAlignment3D.score,
                    breathing: result.data.analysisData.swimming3DAnalysis.breathingPattern3D.score,
                    movement: result.data.analysisData.swimming3DAnalysis.strokeTechnique3D.score,
                    efficiency: result.data.analysisData.swimming3DAnalysis.efficiency3D.score
                },
                detailedAnalysis: result.data.analysisData.swimming3DAnalysis,
                keyFrames: generateKeyFrames3D(result.data.analysisData),
                strengths: identifyStrengths3D(result.data.analysisData.swimming3DAnalysis),
                weaknesses: identifyWeaknesses3D(result.data.analysisData.swimming3DAnalysis),
                improvementAreas: identifyImprovementAreas3D(result.data.analysisData.swimming3DAnalysis)
            },
            recommendations: generateRecommendations3D(result.data.analysisData.swimming3DAnalysis),
            feedback: generateFeedback3D(result.data.analysisData.swimming3DAnalysis),
            analysisDate: new Date()
        });
        await analysisResult.save();
        res.status(200).json({
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
                    originalFrames: result.data.originalFrames,
                    depthMaps: result.data.depthMaps,
                    reconstructed3D: result.data.reconstructed3D
                }
            },
            message: '3D 동영상 분석이 성공적으로 완료되었습니다.'
        });
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
    const scores = [
        swimming3DAnalysis.bodyAlignment3D.score,
        swimming3DAnalysis.strokeTechnique3D.score,
        swimming3DAnalysis.breathingPattern3D.score,
        swimming3DAnalysis.efficiency3D.score
    ];
    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
}
function generateKeyFrames3D(analysisData) {
    const keyFrames = [];
    const totalFrames = analysisData.bodyPositions3D.length;
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
    if (swimming3DAnalysis.bodyAlignment3D.score >= 80) {
        strengths.push('3D 자세 분석: 우수한 몸의 정렬');
    }
    if (swimming3DAnalysis.strokeTechnique3D.score >= 80) {
        strengths.push('3D 스트로크 기법: 효율적인 팔 동작');
    }
    if (swimming3DAnalysis.breathingPattern3D.score >= 80) {
        strengths.push('3D 호흡 패턴: 적절한 호흡 타이밍');
    }
    if (swimming3DAnalysis.efficiency3D.score >= 80) {
        strengths.push('3D 효율성: 높은 수영 효율');
    }
    return strengths;
}
function identifyWeaknesses3D(swimming3DAnalysis) {
    const weaknesses = [];
    if (swimming3DAnalysis.bodyAlignment3D.score < 60) {
        weaknesses.push('3D 자세 분석: 몸의 정렬 개선 필요');
    }
    if (swimming3DAnalysis.strokeTechnique3D.score < 60) {
        weaknesses.push('3D 스트로크 기법: 팔 동작 개선 필요');
    }
    if (swimming3DAnalysis.breathingPattern3D.score < 60) {
        weaknesses.push('3D 호흡 패턴: 호흡 타이밍 개선 필요');
    }
    if (swimming3DAnalysis.efficiency3D.score < 60) {
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
exports.default = router;
//# sourceMappingURL=video-3d-analysis.js.map