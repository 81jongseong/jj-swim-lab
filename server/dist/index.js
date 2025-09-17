"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const compression_1 = __importDefault(require("compression"));
const mongoose_1 = __importDefault(require("mongoose"));
const path_1 = __importDefault(require("path"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const dotenv_1 = __importDefault(require("dotenv"));
const security_1 = require("./middleware/security");
const errorHandler_1 = require("./utils/errorHandler");
const cache_1 = require("./middleware/cache");
const monitoring_1 = require("./middleware/monitoring");
const userActivity_1 = require("./middleware/userActivity");
process.on('warning', (warning) => {
    if (warning.name === 'DeprecationWarning' && warning.message.includes('util._extend')) {
        return;
    }
    if (warning.name !== 'DeprecationWarning') {
        console.warn(warning.name, warning.message);
    }
});
const envPath = path_1.default.join(__dirname, '../.env');
console.log('🔍 .env 파일 경로:', envPath);
dotenv_1.default.config({ path: envPath });
const db_1 = require("./db");
const auth_1 = __importDefault(require("./routes/auth"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
const users_1 = __importDefault(require("./routes/users"));
const courses_1 = __importDefault(require("./routes/courses"));
const bookings_1 = __importDefault(require("./routes/bookings"));
const centers_1 = __importDefault(require("./routes/centers"));
const notices_1 = __importDefault(require("./routes/notices"));
const payments_1 = __importDefault(require("./routes/payments"));
const progress_1 = __importDefault(require("./routes/progress"));
const quiz_1 = __importDefault(require("./routes/quiz"));
const membership_1 = __importDefault(require("./routes/membership"));
const report_1 = __importDefault(require("./routes/report"));
const ai_config_1 = __importDefault(require("./routes/ai-config"));
const uploads_1 = __importDefault(require("./routes/uploads"));
const teaching_methods_1 = __importDefault(require("./routes/teaching-methods"));
const community_1 = __importDefault(require("./routes/community"));
const shop_1 = __importDefault(require("./routes/shop"));
const system_1 = __importDefault(require("./routes/system"));
const center_info_1 = __importDefault(require("./routes/center-info"));
const checklist_1 = __importDefault(require("./routes/checklist"));
const checklist_template_1 = __importDefault(require("./routes/checklist-template"));
const class_checklist_1 = __importDefault(require("./routes/class-checklist"));
const classes_1 = __importDefault(require("./routes/classes"));
const student_progress_1 = __importDefault(require("./routes/student-progress"));
const center_level_1 = __importDefault(require("./routes/center-level"));
const student_levels_1 = __importDefault(require("./routes/student-levels"));
const instructor_1 = __importDefault(require("./routes/instructor"));
const instructorManagement_1 = __importDefault(require("./routes/instructorManagement"));
const revenue_1 = __importDefault(require("./routes/revenue"));
const approvals_1 = __importDefault(require("./routes/approvals"));
const center_admin_1 = __importDefault(require("./routes/center-admin"));
const student_1 = __importDefault(require("./routes/student"));
const ai_1 = __importDefault(require("./routes/ai"));
const smartwatch_1 = __importDefault(require("./routes/smartwatch"));
const video_analysis_1 = __importDefault(require("./routes/video-analysis"));
const ai_evaluation_criteria_1 = __importDefault(require("./routes/ai-evaluation-criteria"));
const video_3d_analysis_1 = __importDefault(require("./routes/video-3d-analysis"));
const video_upload_1 = __importDefault(require("./routes/video-upload"));
const ai_exercise_recommendations_1 = __importDefault(require("./routes/ai-exercise-recommendations"));
const orders_1 = __importDefault(require("./routes/orders"));
const center_registrations_1 = __importDefault(require("./routes/center-registrations"));
const center_management_1 = __importDefault(require("./routes/center-management"));
const health_config_1 = __importDefault(require("./routes/health-config"));
const center_introduction_1 = __importDefault(require("./routes/center-introduction"));
const exercise_1 = __importDefault(require("./routes/exercise"));
const youtube_videos_1 = __importDefault(require("./routes/youtube-videos"));
const learning_progress_1 = __importDefault(require("./routes/learning-progress"));
const recommendations_1 = __importDefault(require("./routes/recommendations"));
const lesson_plans_1 = __importDefault(require("./routes/lesson-plans"));
const student_goals_1 = __importDefault(require("./routes/student-goals"));
const notifications_1 = __importDefault(require("./routes/notifications"));
const monitoring_2 = __importDefault(require("./routes/monitoring"));
const backup_1 = __importDefault(require("./routes/backup"));
const user_activities_1 = __importDefault(require("./routes/user-activities"));
const performance_1 = __importDefault(require("./routes/performance"));
const advancedAI_1 = __importDefault(require("./routes/advancedAI"));
const instructorHistory_1 = __importDefault(require("./routes/instructorHistory"));
const socialCommunity_1 = __importDefault(require("./routes/socialCommunity"));
const aiTrainingPlan_1 = __importDefault(require("./routes/aiTrainingPlan"));
const aiInjuryPrediction_1 = __importDefault(require("./routes/aiInjuryPrediction"));
const aiPerformancePrediction_1 = __importDefault(require("./routes/aiPerformancePrediction"));
const medicalExercisePrescription_1 = __importDefault(require("./routes/medicalExercisePrescription"));
console.log('📦 모델 import 시작...');
require("./models/TrainingPlan");
require("./models/InjuryPrediction");
require("./models/PerformancePrediction");
require("./models/HealthAssessment");
require("./models/User");
require("./models/Checklist");
require("./models/Center");
require("./models/InstructorHistory");
require("./models/Community");
console.log('📦 기본 모델 import 완료!');
require("./models/AIAnalysis");
require("./models/AIEvaluationCriteria");
require("./models/SmartWatchData");
require("./models/VideoAnalysisCriteria");
require("./models/VideoProcessingJob");
require("./models/ExerciseRecommendation");
require("./models/Order");
require("./models/Product");
require("./models/CenterRegistration");
require("./models/YouTubeVideo");
require("./models/LearningProgress");
require("./models/Recommendation");
require("./models/LessonPlan");
require("./models/StudentGoal");
require("./models/Notification");
require("./models/UserActivity");
require("./models/HealthConfig");
console.log('📦 모든 모델 import 완료!');
console.log('🚀 index.ts 모듈 로딩 시작...');
setTimeout(() => {
    console.log('🔍 모델 등록 상태 확인:');
    console.log('   - Checklist 모델:', mongoose_1.default.models.Checklist ? '✅ 등록됨' : '❌ 미등록');
    console.log('   - User 모델:', mongoose_1.default.models.User ? '✅ 등록됨' : '❌ 미등록');
    console.log('   - TeachingMethod 모델:', mongoose_1.default.models.TeachingMethod ? '✅ 등록됨' : '❌ 미등록');
    console.log('   - Course 모델:', mongoose_1.default.models.Course ? '✅ 등록됨' : '❌ 미등록');
    if (!mongoose_1.default.models.Checklist) {
        console.log('⚠️ Checklist 모델이 등록되지 않음 - 강제 등록 시도...');
        try {
            const { ChecklistSchema } = require('./models/Checklist');
            mongoose_1.default.model('Checklist', ChecklistSchema);
            console.log('✅ Checklist 모델 강제 등록 성공!');
        }
        catch (error) {
            console.error('❌ Checklist 모델 강제 등록 실패:', error);
        }
    }
    else {
        console.log('✅ Checklist 모델이 이미 등록되어 있습니다.');
    }
}, 100);
console.log('🔍 환경 변수 확인:');
console.log('   - MONGODB_URI:', process.env.MONGODB_URI ? '✅ 설정됨' : '❌ 설정되지 않음');
console.log('   - MONGODB_URI 값:', process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 50) + '...' : '없음');
console.log('   - PORT:', process.env.PORT || '기본값 5000');
console.log('   - NODE_ENV:', process.env.NODE_ENV || '기본값 development');
const app = (0, express_1.default)();
exports.app = app;
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
        methods: ["GET", "POST"]
    }
});
io.on('connection', (socket) => {
    console.log('🔌 클라이언트 연결됨:', socket.id);
    socket.on('disconnect', () => {
        console.log('🔌 클라이언트 연결 해제:', socket.id);
    });
    socket.on('join-room', (room) => {
        socket.join(room);
        console.log(`🔌 클라이언트 ${socket.id}가 ${room}에 참여`);
    });
});
const PORT = process.env.PORT || 5000;
app.use(security_1.securityMiddleware);
app.use((0, compression_1.default)({
    level: 6,
    threshold: 1024,
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            return false;
        }
        return compression_1.default.filter(req, res);
    }
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use(monitoring_1.apiMonitoring);
app.use(monitoring_1.userActivityTracking);
app.use(monitoring_1.securityEventTracking);
app.use(userActivity_1.trackUserActivity);
app.use(userActivity_1.trackSecurityEvents);
app.use('/uploads', express_1.default.static('uploads', {
    maxAge: '1y',
    etag: true,
    lastModified: true,
    setHeaders: (res, path) => {
        if (path.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) {
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        }
        if (path.match(/\.(css|js)$/)) {
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        }
    }
}));
app.get('/', (0, cache_1.cache)({ ttl: 300 }), (req, res) => {
    res.json({ message: 'JJ Swim Lab API 서버가 실행 중입니다!' });
});
app.get('/api/health', (0, cache_1.cache)({ ttl: 60 }), (req, res) => {
    const dbStatus = mongoose_1.default.connection.readyState === 1 ? 'connected' : 'disconnected';
    res.json({
        success: true,
        message: 'JJ Swim Lab API 서버가 정상적으로 실행 중입니다!',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        database: {
            status: dbStatus,
            readyState: mongoose_1.default.connection.readyState
        }
    });
});
app.use('/api/auth', auth_1.default);
app.use('/api/dashboard', dashboard_1.default);
app.use('/api/users', users_1.default);
app.use('/api/courses', courses_1.default);
app.use('/api/bookings', bookings_1.default);
app.use('/api/centers', centers_1.default);
app.use('/api/notices', notices_1.default);
app.use('/api/payments', payments_1.default);
app.use('/api/progress', progress_1.default);
app.use('/api/quiz', quiz_1.default);
app.use('/api/membership', membership_1.default);
app.use('/api/report', report_1.default);
app.use('/api/ai-config', ai_config_1.default);
app.use('/api/uploads', uploads_1.default);
app.use('/api/teaching-methods', teaching_methods_1.default);
app.use('/api/community', community_1.default);
app.use('/api/shop', shop_1.default);
app.use('/api/system', system_1.default);
app.use('/api/center-info', center_info_1.default);
app.use('/api/checklist', checklist_1.default);
app.use('/api/checklist-template', checklist_template_1.default);
app.use('/api/class-checklist', class_checklist_1.default);
app.use('/api/classes', classes_1.default);
app.use('/api/student-progress', student_progress_1.default);
app.use('/api/notifications', notifications_1.default);
app.use('/api/center-levels', center_level_1.default);
app.use('/api/student-levels', student_levels_1.default);
app.use('/api/instructor', instructor_1.default);
app.use('/api/instructor-management', instructorManagement_1.default);
app.use('/api/revenue', revenue_1.default);
app.use('/api/approvals', approvals_1.default);
app.use('/api/center-admin', center_admin_1.default);
app.use('/api/student', student_1.default);
app.use('/api/ai', ai_1.default);
app.use('/api/smartwatch', smartwatch_1.default);
app.use('/api/video-analysis', video_analysis_1.default);
app.use('/api/ai/evaluation-criteria', ai_evaluation_criteria_1.default);
app.use('/api/video-3d-analysis', video_3d_analysis_1.default);
app.use('/api/video-upload', video_upload_1.default);
app.use('/api/ai/exercise-recommendations', ai_exercise_recommendations_1.default);
app.use('/api/shop/orders', orders_1.default);
app.use('/api/center-registrations', center_registrations_1.default);
app.use('/api/center-management', center_management_1.default);
app.use('/api/health-config', health_config_1.default);
app.use('/api/center-introduction', center_introduction_1.default);
app.use('/api/exercise', exercise_1.default);
app.use('/api/youtube-videos', youtube_videos_1.default);
app.use('/api/learning-progress', learning_progress_1.default);
app.use('/api/recommendations', recommendations_1.default);
app.use('/api/lesson-plans', lesson_plans_1.default);
app.use('/api/student-goals', student_goals_1.default);
app.use('/api/notifications', notifications_1.default);
app.use('/api/monitoring', monitoring_2.default);
app.use('/api/backup', backup_1.default);
app.use('/api/user-activities', user_activities_1.default);
app.use('/api/performance', performance_1.default);
app.use('/api/advanced-ai', advancedAI_1.default);
app.use('/api/instructor-history', instructorHistory_1.default);
app.use('/api/social-community', socialCommunity_1.default);
app.use('/api/ai-training-plan', aiTrainingPlan_1.default);
app.use('/api/ai-injury-prediction', aiInjuryPrediction_1.default);
app.use('/api/ai-performance-prediction', aiPerformancePrediction_1.default);
app.use('/api/medical-exercise-prescription', medicalExercisePrescription_1.default);
app.use(errorHandler_1.notFoundHandler);
app.use(monitoring_1.errorTracking);
app.use(errorHandler_1.errorHandler);
if (process.env.NODE_ENV !== 'test') {
    console.log('🚀 서버 시작 준비 중...');
    console.log(`📡 포트: ${PORT}`);
    server.listen(PORT, async () => {
        console.log(`🌐 HTTP 서버 시작... 포트: ${PORT}`);
        console.log(`🔌 WebSocket 서버 시작... 포트: ${PORT}`);
        try {
            console.log('🔗 MongoDB 연결 시도 중...');
            await (0, db_1.connectDB)();
        }
        catch (error) {
            console.error('❌ MongoDB 연결 실패:', error);
            console.log('⚠️ 서버는 계속 실행되지만 데이터베이스 연결에 실패했습니다.');
        }
    });
}
process.on('SIGINT', () => {
    console.log('\n🛑 서버 종료 중...');
    mongoose_1.default.connection.close().then(() => {
        console.log('🔌 MongoDB 연결 종료');
        process.exit(0);
    }).catch(() => {
        console.log('🔌 MongoDB 연결 종료 실패, 강제 종료');
        process.exit(0);
    });
});
process.on('SIGTERM', () => {
    console.log('\n🛑 서버 종료 중...');
    mongoose_1.default.connection.close().then(() => {
        console.log('🔌 MongoDB 연결 종료');
        process.exit(0);
    }).catch(() => {
        console.log('🔌 MongoDB 연결 실패, 강제 종료');
        process.exit(0);
    });
});
process.on('SIGBREAK', () => {
    console.log('\n🛑 Windows 강제 종료...');
    process.exit(0);
});
process.on('exit', () => {
    console.log('✅ 서버가 종료되었습니다.');
});
//# sourceMappingURL=index.js.map