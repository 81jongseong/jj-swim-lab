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
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const XLSX = __importStar(require("xlsx"));
const User_1 = require("../models/User");
const Course_1 = require("../models/Course");
const auth_1 = require("../middleware/auth");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = require("../utils/logger");
const router = express_1.default.Router();
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            file.mimetype === 'application/vnd.ms-excel') {
            cb(null, true);
        }
        else {
            cb(new Error('엑셀 파일만 업로드 가능합니다.'));
        }
    }
});
router.post('/upload', auth_1.authMiddleware, auth_1.requireCenterAdmin, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: '파일이 업로드되지 않았습니다.'
            });
        }
        console.log('📁 엑셀 파일 업로드 시작');
        const centerAdmin = await User_1.User.findById(req.user._id);
        const centerId = centerAdmin?.centerId || centerAdmin?.centerAdminInfo?.managedCenters?.[0];
        if (!centerId) {
            return res.status(400).json({
                success: false,
                message: '관리하는 센터가 없습니다.'
            });
        }
        console.log('🏢 센터 ID:', centerId);
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);
        console.log(`📊 총 ${data.length}개의 행 발견`);
        const results = {
            success: 0,
            failed: 0,
            errors: []
        };
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            try {
                if (!row['이름'] || !row['이메일']) {
                    results.failed++;
                    results.errors.push({
                        row: i + 2,
                        error: '이름 또는 이메일이 누락되었습니다.'
                    });
                    continue;
                }
                const existingUser = await User_1.User.findOne({ email: row['이메일'] });
                if (existingUser) {
                    results.failed++;
                    results.errors.push({
                        row: i + 2,
                        error: `이미 존재하는 이메일입니다: ${row['이메일']}`
                    });
                    continue;
                }
                const defaultPassword = row['비밀번호'] || 'swim1234';
                const hashedPassword = await bcryptjs_1.default.hash(defaultPassword, 10);
                const newUser = new User_1.User({
                    name: row['이름'],
                    email: row['이메일'],
                    password: hashedPassword,
                    phone: row['전화번호'] || '',
                    userType: 'student',
                    centerId: new mongoose_1.default.Types.ObjectId(centerId),
                    studentInfo: {
                        level: row['레벨'] || 'beginner',
                        centerId: new mongoose_1.default.Types.ObjectId(centerId),
                        swimmingGoals: row['수영목표'] ? [row['수영목표']] : [],
                        emergencyContact: row['비상연락처'] ? {
                            name: row['비상연락처_이름'] || '',
                            phone: row['비상연락처'] || '',
                            relationship: row['비상연락처_관계'] || ''
                        } : undefined,
                        medicalInfo: row['의료정보'] ? {
                            conditions: [row['의료정보']],
                            medications: row['복용약물'] ? [row['복용약물']] : [],
                            allergies: row['알레르기'] ? [row['알레르기']] : [],
                            isPublic: false
                        } : undefined
                    }
                });
                await newUser.save();
                if (row['반이름']) {
                    const course = await Course_1.Course.findOne({
                        name: row['반이름'],
                        centerId: centerId
                    });
                    if (course) {
                        const enrolledStudents = course.enrolledStudents || [];
                        const validEnrolledStudents = enrolledStudents.filter((enrollment) => enrollment && enrollment.student);
                        if (validEnrolledStudents.length < course.maxStudents) {
                            validEnrolledStudents.push({
                                student: newUser._id,
                                enrollmentDate: new Date(),
                                status: 'active'
                            });
                            course.enrolledStudents = validEnrolledStudents;
                            await course.save();
                        }
                    }
                }
                results.success++;
                console.log(`✅ ${i + 1}/${data.length} - ${row['이름']} 등록 완료`);
            }
            catch (error) {
                results.failed++;
                results.errors.push({
                    row: i + 2,
                    error: error.message
                });
                (0, logger_1.logError)(`❌ ${i + 1}/${data.length} - 오류:`, error.message);
            }
        }
        console.log('📊 일괄 등록 완료:', results);
        res.json({
            success: true,
            message: `${results.success}명 등록 완료, ${results.failed}명 실패`,
            data: results
        });
    }
    catch (error) {
        (0, logger_1.logError)('❌ 일괄 등록 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.',
            error: error.message
        });
    }
});
router.get('/template', (req, res) => {
    const templateData = [
        {
            '이름': '홍길동',
            '이메일': 'hong@example.com',
            '비밀번호': 'swim1234',
            '전화번호': '010-1234-5678',
            '레벨': 'beginner',
            '수영목표': '자유형 마스터',
            '비상연락처_이름': '홍부모',
            '비상연락처': '010-9876-5432',
            '비상연락처_관계': '부모',
            '의료정보': '',
            '복용약물': '',
            '알레르기': '',
            '반이름': '초급 자유형 기초반'
        }
    ];
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '회원 목록');
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Disposition', 'attachment; filename=member_template.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
});
exports.default = router;
//# sourceMappingURL=member-bulk-import.js.map