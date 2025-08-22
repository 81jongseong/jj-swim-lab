"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const CenterInfo_1 = __importDefault(require("../models/CenterInfo"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const router = express_1.default.Router();
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/center-images/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('이미지 파일만 업로드 가능합니다.'));
        }
    }
});
router.get('/public/:centerId', async (req, res) => {
    try {
        const { centerId } = req.params;
        const centerInfo = await CenterInfo_1.default.findOne({ centerId });
        if (!centerInfo) {
            return res.status(404).json({
                success: false,
                message: '센터 정보를 찾을 수 없습니다.'
            });
        }
        res.json({
            success: true,
            data: centerInfo
        });
    }
    catch (error) {
        console.error('센터 정보 조회 실패:', error);
        res.status(500).json({
            success: false,
            message: '센터 정보 조회 중 오류가 발생했습니다.'
        });
    }
});
router.get('/admin/list', auth_1.auth, (0, auth_1.requireRole)(['centerAdmin', 'superAdmin']), async (req, res) => {
    try {
        const { user } = req;
        let centerInfo;
        if (user.userType === 'centerAdmin') {
            centerInfo = await CenterInfo_1.default.findOne({ centerId: user.centerId || 'jjswim-main' });
        }
        else {
            centerInfo = await CenterInfo_1.default.find();
        }
        if (!centerInfo) {
            return res.status(404).json({
                success: false,
                message: '센터 정보를 찾을 수 없습니다.'
            });
        }
        res.json({
            success: true,
            data: centerInfo
        });
    }
    catch (error) {
        console.error('센터 정보 조회 실패:', error);
        res.status(500).json({
            success: false,
            message: '센터 정보 조회 중 오류가 발생했습니다.'
        });
    }
});
router.post('/', auth_1.auth, (0, auth_1.requireRole)(['centerAdmin', 'superAdmin']), async (req, res) => {
    try {
        const { user } = req;
        const centerData = req.body;
        if (user.userType === 'centerAdmin') {
            centerData.centerId = user.centerId || 'jjswim-main';
        }
        const centerInfo = new CenterInfo_1.default(centerData);
        await centerInfo.save();
        res.status(201).json({
            success: true,
            message: '센터 정보가 성공적으로 생성되었습니다.',
            data: centerInfo
        });
    }
    catch (error) {
        console.error('센터 정보 생성 실패:', error);
        res.status(500).json({
            success: false,
            message: '센터 정보 생성 중 오류가 발생했습니다.'
        });
    }
});
router.put('/:id', auth_1.auth, (0, auth_1.requireRole)(['centerAdmin', 'superAdmin']), async (req, res) => {
    try {
        const { id } = req.params;
        const { user } = req;
        const updateData = req.body;
        const centerInfo = await CenterInfo_1.default.findById(id);
        if (!centerInfo) {
            return res.status(404).json({
                success: false,
                message: '센터 정보를 찾을 수 없습니다.'
            });
        }
        if (user.userType === 'centerAdmin' && centerInfo.centerId !== user.centerId) {
            return res.status(403).json({
                success: false,
                message: '수정 권한이 없습니다.'
            });
        }
        const updatedCenterInfo = await CenterInfo_1.default.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
        res.json({
            success: true,
            message: '센터 정보가 성공적으로 수정되었습니다.',
            data: updatedCenterInfo
        });
    }
    catch (error) {
        console.error('센터 정보 수정 실패:', error);
        res.status(500).json({
            success: false,
            message: '센터 정보 수정 중 오류가 발생했습니다.'
        });
    }
});
router.delete('/:id', auth_1.auth, (0, auth_1.requireRole)(['superAdmin']), async (req, res) => {
    try {
        const { id } = req.params;
        const centerInfo = await CenterInfo_1.default.findByIdAndDelete(id);
        if (!centerInfo) {
            return res.status(404).json({
                success: false,
                message: '센터 정보를 찾을 수 없습니다.'
            });
        }
        res.json({
            success: true,
            message: '센터 정보가 성공적으로 삭제되었습니다.'
        });
    }
    catch (error) {
        console.error('센터 정보 삭제 실패:', error);
        res.status(500).json({
            success: false,
            message: '센터 정보 삭제 중 오류가 발생했습니다.'
        });
    }
});
router.post('/upload-image', auth_1.auth, (0, auth_1.requireRole)(['centerAdmin', 'superAdmin']), upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: '이미지 파일이 업로드되지 않았습니다.'
            });
        }
        const imageUrl = `/uploads/center-images/${req.file.filename}`;
        res.json({
            success: true,
            message: '이미지 업로드가 성공했습니다.',
            data: { imageUrl }
        });
    }
    catch (error) {
        console.error('이미지 업로드 실패:', error);
        res.status(500).json({
            success: false,
            message: '이미지 업로드 중 오류가 발생했습니다.'
        });
    }
});
exports.default = router;
//# sourceMappingURL=center-info.js.map