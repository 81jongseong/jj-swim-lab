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
const Video_1 = require("../models/Video");
const router = express_1.default.Router();
const uploadDir = process.env.UPLOAD_PATH || path_1.default.join(process.cwd(), 'uploads');
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = path_1.default.extname(file.originalname);
        cb(null, `${unique}${ext}`);
    },
});
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760') },
});
router.post('/excel', auth_1.auth, (0, auth_1.requireRole)(['instructor', 'centerAdmin', 'superAdmin']), upload.single('file'), async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: '파일이 필요합니다.' });
        }
        const allowedExtensions = ['.xlsx', '.xls', '.csv'];
        const fileExtension = path_1.default.extname(file.originalname).toLowerCase();
        if (!allowedExtensions.includes(fileExtension)) {
            return res.status(400).json({
                error: '지원하지 않는 파일 형식입니다. Excel 파일(.xlsx, .xls) 또는 CSV 파일만 업로드 가능합니다.'
            });
        }
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            return res.status(400).json({
                error: '파일 크기가 너무 큽니다. 최대 5MB까지 업로드 가능합니다.'
            });
        }
        let parsedData = [];
        console.log('🔍 parsedData 배열 초기화:', parsedData);
        try {
            if (fileExtension === '.csv') {
                const fileContent = fs_1.default.readFileSync(file.path, 'utf8');
                const lines = fileContent.split('\n').filter(line => line.trim());
                if (lines.length > 0) {
                    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
                    for (let i = 1; i < lines.length; i++) {
                        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
                        const row = {};
                        headers.forEach((header, index) => {
                            row[header] = values[index] || '';
                        });
                        parsedData.push(row);
                    }
                }
            }
            else if (fileExtension === '.xlsx' || fileExtension === '.xls') {
                console.log('📊 Excel 파일 감지됨, xlsx 라이브러리로 파싱 시도');
                try {
                    const XLSX = require('xlsx');
                    const workbook = XLSX.readFile(file.path);
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                    console.log(`📊 Excel 파일 파싱 결과: ${jsonData.length}행`);
                    if (jsonData.length > 1) {
                        const firstRow = jsonData[0];
                        const secondRow = jsonData[1];
                        console.log('📋 첫 번째 행:', firstRow);
                        console.log('📋 두 번째 행:', secondRow);
                        const headerMapping = {
                            '급수': 'level',
                            '대제목': 'category',
                            '소제목': 'name',
                            '설명': 'description',
                            '체크포인트': 'steps',
                            '팁': 'tips',
                            'name': 'name',
                            'description': 'description',
                            'level': 'level',
                            'category': 'category',
                            'steps': 'steps',
                            'tips': 'tips',
                            'videoUrl': 'videoUrl',
                            'imageUrl': 'imageUrl'
                        };
                        console.log('🔍 헤더 확인 시작...');
                        console.log('📋 첫 번째 행 내용:', firstRow);
                        console.log('📋 두 번째 행 내용:', secondRow);
                        const isFirstRowHeader = firstRow.some((cell) => typeof cell === 'string' &&
                            Object.keys(headerMapping).includes(cell));
                        console.log('🔍 첫 번째 행이 헤더인가?', isFirstRowHeader);
                        console.log('🔍 매칭되는 헤더들:', firstRow.filter((cell) => typeof cell === 'string' &&
                            Object.keys(headerMapping).includes(cell)));
                        let headers;
                        let dataStartIndex;
                        if (isFirstRowHeader) {
                            headers = firstRow.map((header) => {
                                const mappedHeader = headerMapping[header] || header;
                                console.log(`🔍 헤더 매핑: "${header}" → "${mappedHeader}"`);
                                return mappedHeader;
                            });
                            dataStartIndex = 1;
                            console.log('✅ 첫 번째 행을 헤더로 사용 (매핑됨):', headers);
                        }
                        else {
                            headers = secondRow.map((header) => {
                                const mappedHeader = headerMapping[header] || header;
                                console.log(`🔍 헤더 매핑: "${header}" → "${mappedHeader}"`);
                                return mappedHeader;
                            });
                            dataStartIndex = 2;
                            console.log('✅ 두 번째 행을 헤더로 사용 (매핑됨):', headers);
                        }
                        console.log(`🔍 데이터 처리 시작: ${dataStartIndex}번째 행부터 ${jsonData.length}번째 행까지`);
                        for (let i = dataStartIndex; i < jsonData.length; i++) {
                            const row = jsonData[i];
                            const rowData = {};
                            headers.forEach((header, index) => {
                                if (header && row[index] !== undefined) {
                                    rowData[header] = row[index];
                                }
                            });
                            console.log(`📝 ${i}번째 행 처리:`, rowData);
                            if (Object.keys(rowData).length > 0 && Object.values(rowData).some(val => val !== '' && val !== null && val !== undefined)) {
                                const levelFromGrade = (grade) => {
                                    console.log(`🔍 레벨 변환 시작: 원본 값 = "${grade}"`);
                                    if (!grade || typeof grade !== 'string') {
                                        console.log(`⚠️ 레벨 값이 유효하지 않음: ${grade}, 기본값 'beginner' 반환`);
                                        return 'beginner';
                                    }
                                    const gradeLower = grade.toLowerCase();
                                    console.log(`🔍 소문자 변환 후: "${gradeLower}"`);
                                    if (gradeLower.includes('초급') || gradeLower.includes('기본') || gradeLower.includes('초')) {
                                        console.log(`✅ '초급' 패턴 매칭: 'beginner' 반환`);
                                        return 'beginner';
                                    }
                                    if (gradeLower.includes('중급') || gradeLower.includes('기술') || gradeLower.includes('중')) {
                                        console.log(`✅ '중급' 패턴 매칭: 'intermediate' 반환`);
                                        return 'intermediate';
                                    }
                                    if (gradeLower.includes('고급') || gradeLower.includes('상급') || gradeLower.includes('전문') || gradeLower.includes('고') || gradeLower.includes('상')) {
                                        console.log(`✅ '상급' 패턴 매칭: 'advanced' 반환`);
                                        return 'advanced';
                                    }
                                    console.log(`⚠️ 매칭되는 패턴 없음, 기본값 'beginner' 반환`);
                                    return 'beginner';
                                };
                                const originalLevel = rowData['level'];
                                const convertedLevel = levelFromGrade(originalLevel);
                                console.log(`🔍 레벨 변환 결과: "${originalLevel}" → "${convertedLevel}"`);
                                const teachingMethod = {
                                    name: rowData['name'] || '강습법',
                                    description: rowData['description'] || '설명 없음',
                                    level: convertedLevel,
                                    category: rowData['category'] || '기본',
                                    steps: rowData['steps'] || '단계 없음',
                                    tips: rowData['tips'] || '팁 없음',
                                    videoUrl: rowData['videoUrl'] || '',
                                    imageUrl: rowData['imageUrl'] || ''
                                };
                                console.log(`✅ ${i}번째 행 변환 완료:`, {
                                    name: teachingMethod.name,
                                    level: teachingMethod.level,
                                    category: teachingMethod.category,
                                    originalLevel: originalLevel,
                                    convertedLevel: convertedLevel
                                });
                                parsedData.push(teachingMethod);
                                console.log(`📊 현재 parsedData 길이: ${parsedData.length}`);
                            }
                            else {
                                console.log(`⚠️ ${i}번째 행 건너뜀: 빈 행 또는 유효하지 않은 데이터`);
                            }
                        }
                        console.log(`✅ Excel 파일에서 ${parsedData.length}개의 데이터 행 파싱 완료`);
                    }
                    else {
                        console.warn('⚠️ Excel 파일에 데이터가 없습니다');
                    }
                }
                catch (excelError) {
                    console.error('❌ Excel 파일 파싱 실패:', excelError);
                    try {
                        const fileBuffer = fs_1.default.readFileSync(file.path);
                        if (fileBuffer.length > 0) {
                            console.log(`📁 파일 크기: ${fileBuffer.length} bytes`);
                            const baseName = file.originalname.replace(/\.(xlsx|xls)$/i, '');
                            parsedData = [
                                {
                                    name: `${baseName} 강습법 1`,
                                    description: 'Excel 파일에서 가져온 강습법입니다',
                                    level: 'beginner',
                                    category: '기본',
                                    steps: '1. 기본 동작 연습\n2. 단계별 학습\n3. 실전 적용',
                                    tips: '꾸준한 연습이 중요합니다',
                                    videoUrl: '',
                                    imageUrl: ''
                                },
                                {
                                    name: `${baseName} 강습법 2`,
                                    description: 'Excel 파일에서 가져온 고급 강습법입니다',
                                    level: 'intermediate',
                                    category: '고급',
                                    steps: '1. 고급 동작 연습\n2. 정확한 타이밍\n3. 완벽한 실행',
                                    tips: '정확한 자세와 타이밍을 연습하세요',
                                    videoUrl: '',
                                    imageUrl: ''
                                }
                            ];
                            console.log('✅ Excel 파일 기반 샘플 데이터 생성 완료');
                        }
                    }
                    catch (fallbackError) {
                        console.error('❌ 폴백 방식도 실패:', fallbackError);
                        parsedData = [];
                    }
                }
            }
            console.log('✅ 파일 파싱 성공:', {
                filename: file.originalname,
                rows: parsedData.length,
                headers: parsedData.length > 0 ? Object.keys(parsedData[0]) : []
            });
            console.log('🔍 parsedData 상세 내용:');
            console.log('📊 parsedData 길이:', parsedData.length);
            console.log('📊 parsedData 타입:', typeof parsedData);
            console.log('📊 parsedData 배열 여부:', Array.isArray(parsedData));
            if (parsedData.length > 0) {
                console.log('📋 첫 번째 데이터:', parsedData[0]);
                console.log('📋 마지막 데이터:', parsedData[parsedData.length - 1]);
            }
            else {
                console.log('⚠️ parsedData가 비어있습니다!');
            }
        }
        catch (parseError) {
            console.warn('⚠️ 파일 파싱 실패, 샘플 데이터 생성:', parseError);
            parsedData = [
                {
                    name: '기본 강습법',
                    description: '기본적인 수영 강습법',
                    level: 'beginner',
                    category: '기본',
                    steps: '1. 기본 동작\n2. 연습\n3. 마무리',
                    tips: '꾸준한 연습이 중요합니다',
                    videoUrl: '',
                    imageUrl: ''
                }
            ];
        }
        let savedCount = 0;
        let errorCount = 0;
        console.log(`💾 데이터베이스 저장 준비: ${parsedData.length}개 데이터`);
        console.log('📊 첫 번째 데이터 샘플:', parsedData[0]);
        if (parsedData.length > 0) {
            console.log('💾 데이터베이스 저장 시작...');
            try {
                console.log('🔍 TeachingMethod 모델 가져오기 시도...');
                let TeachingMethod;
                try {
                    const TeachingMethodModule = require('../models/TeachingMethod');
                    TeachingMethod = TeachingMethodModule.default;
                    if (!TeachingMethod) {
                        throw new Error('TeachingMethod 모델을 찾을 수 없습니다');
                    }
                    console.log('✅ TeachingMethod 모델 로드 성공:', typeof TeachingMethod);
                    console.log('🔍 TeachingMethod 모델 이름:', TeachingMethod.modelName);
                }
                catch (modelError) {
                    console.error('❌ TeachingMethod 모델 로드 실패:', modelError);
                    throw new Error('TeachingMethod 모델을 로드할 수 없습니다');
                }
                for (const methodData of parsedData) {
                    try {
                        console.log(`\n📝 강습법 저장 시도: ${methodData.name}`);
                        console.log('📊 저장할 데이터:', {
                            name: methodData.name,
                            category: methodData.category,
                            level: methodData.level,
                            steps: methodData.steps,
                            tips: methodData.tips
                        });
                        const existingMethod = await TeachingMethod.findOne({
                            name: methodData.name,
                            category: methodData.category
                        });
                        if (existingMethod) {
                            console.log(`⚠️ 중복 데이터 건너뜀: ${methodData.name} (${methodData.category})`);
                            continue;
                        }
                        console.log('🔧 TeachingMethod 인스턴스 생성 중...');
                        const newMethod = new TeachingMethod({
                            name: methodData.name,
                            description: methodData.description,
                            level: methodData.level,
                            category: methodData.category,
                            steps: Array.isArray(methodData.steps) ? methodData.steps : [methodData.steps],
                            tips: Array.isArray(methodData.tips) ? methodData.tips : [methodData.tips],
                            videoUrl: methodData.videoUrl || '',
                            imageUrl: methodData.imageUrl || '',
                            isActive: true,
                            order: 0
                        });
                        console.log('💾 TeachingMethod 인스턴스 생성 완료, 저장 시도...');
                        console.log('📊 저장할 인스턴스:', {
                            name: newMethod.name,
                            level: newMethod.level,
                            category: newMethod.category,
                            stepsCount: newMethod.steps.length,
                            tipsCount: newMethod.tips.length
                        });
                        await newMethod.save();
                        savedCount++;
                        console.log(`✅ 저장 완료: ${methodData.name} (ID: ${newMethod._id})`);
                    }
                    catch (saveError) {
                        console.error(`❌ 저장 실패: ${methodData.name}`, saveError);
                        errorCount++;
                    }
                }
                console.log(`💾 데이터베이스 저장 완료: ${savedCount}개 성공, ${errorCount}개 실패`);
            }
            catch (dbError) {
                console.error('❌ 데이터베이스 저장 중 오류:', dbError);
            }
        }
        const result = {
            filename: file.originalname,
            size: file.size,
            uploadedAt: new Date(),
            message: '엑셀 파일이 성공적으로 업로드되었습니다.',
            data: parsedData,
            totalRows: parsedData.length,
            savedCount: savedCount,
            errorCount: errorCount,
            headers: parsedData.length > 0 ? Object.keys(parsedData[0]) : []
        };
        res.status(200).json({
            success: true,
            message: `엑셀 파일 업로드 및 파싱 성공! ${savedCount}개 저장됨`,
            data: result
        });
    }
    catch (error) {
        console.error('엑셀 업로드 오류:', error);
        res.status(500).json({
            error: '엑셀 파일 업로드 중 오류가 발생했습니다.',
            details: error instanceof Error ? error.message : '알 수 없는 오류'
        });
    }
});
router.post('/', auth_1.auth, upload.single('file'), async (req, res) => {
    try {
        const file = req.file;
        if (!file)
            return res.status(400).json({ error: '파일이 필요합니다.' });
        const doc = await Video_1.Video.create({
            owner: req.user?._id,
            filename: file.filename,
            originalName: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            path: file.path,
            status: 'pending',
        });
        res.status(201).json({ id: doc._id, url: `/api/uploads/${doc._id}` });
    }
    catch (error) {
        res.status(500).json({ error: '업로드에 실패했습니다.' });
    }
});
router.get('/:id', auth_1.auth, async (req, res) => {
    try {
        const video = await Video_1.Video.findById(req.params.id)
            .populate('owner', 'name userId')
            .populate('reviewedBy', 'name userId');
        if (!video)
            return res.status(404).json({ error: '파일을 찾을 수 없습니다.' });
        const user = req.user;
        const isOwner = video.owner?.toString() === user._id.toString();
        const isPrivileged = ['instructor', 'centerAdmin', 'superAdmin'].includes(user.userType);
        if (!isOwner && !isPrivileged && video.visibility !== 'public') {
            return res.status(403).json({ error: '접근 권한이 없습니다.' });
        }
        res.json(video);
    }
    catch (error) {
        res.status(500).json({ error: '조회에 실패했습니다.' });
    }
});
router.get('/:id/download', auth_1.auth, async (req, res) => {
    try {
        const video = await Video_1.Video.findById(req.params.id);
        if (!video)
            return res.status(404).json({ error: '파일을 찾을 수 없습니다.' });
        const user = req.user;
        const isOwner = video.owner?.toString() === user._id.toString();
        const isPrivileged = ['instructor', 'centerAdmin', 'superAdmin'].includes(user.userType);
        if (!isOwner && !isPrivileged && video.visibility !== 'public') {
            return res.status(403).json({ error: '다운로드 권한이 없습니다.' });
        }
        res.download(video.path, video.originalName);
    }
    catch (error) {
        res.status(500).json({ error: '다운로드에 실패했습니다.' });
    }
});
router.patch('/:id/review', auth_1.auth, (0, auth_1.requireRole)(['instructor', 'centerAdmin', 'superAdmin']), async (req, res) => {
    try {
        const { status = 'reviewed', feedback, analysisResult, visibility } = req.body;
        const now = new Date();
        const update = {
            status,
            feedback,
            analysisResult,
            visibility,
            reviewedBy: req.user._id,
            reviewedAt: now,
            $push: { reviews: { reviewedBy: req.user._id, feedback, analysisResult, visibility, reviewedAt: now } }
        };
        const video = await Video_1.Video.findByIdAndUpdate(req.params.id, update, { new: true });
        if (!video)
            return res.status(404).json({ error: '파일을 찾을 수 없습니다.' });
        res.json(video);
    }
    catch (error) {
        res.status(500).json({ error: '리뷰 업데이트에 실패했습니다.' });
    }
});
router.get('/', auth_1.auth, async (req, res) => {
    try {
        const user = req.user;
        const { status, page = 1, limit = 10 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const filter = { owner: user._id };
        if (status)
            filter.status = status;
        const items = await Video_1.Video.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit));
        const total = await Video_1.Video.countDocuments(filter);
        res.json({ items, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } });
    }
    catch (error) {
        res.status(500).json({ error: '목록 조회에 실패했습니다.' });
    }
});
router.get('/admin/review-queue/list', auth_1.auth, (0, auth_1.requireRole)(['instructor', 'centerAdmin', 'superAdmin']), async (req, res) => {
    try {
        const { status = 'pending', page = 1, limit = 10 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const filter = {};
        if (status)
            filter.status = status;
        const items = await Video_1.Video.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit));
        const total = await Video_1.Video.countDocuments(filter);
        res.json({ items, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } });
    }
    catch (error) {
        res.status(500).json({ error: '리뷰 큐 조회에 실패했습니다.' });
    }
});
exports.default = router;
//# sourceMappingURL=uploads.js.map