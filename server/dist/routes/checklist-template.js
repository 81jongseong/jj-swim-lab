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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = __importStar(require("express"));
const auth_1 = require("../middleware/auth");
const cache_1 = require("../middleware/cache");
const logger_1 = require("../utils/logger");
const ChecklistTemplate_1 = __importDefault(require("../models/ChecklistTemplate"));
const router = express.Router();
router.get('/', auth_1.auth, (0, cache_1.cache)({ ttl: 300 }), async (req, res) => {
    try {
        const { level, category, page = 1, limit = 20 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const filter = { isActive: true };
        if (level)
            filter.level = level;
        if (category)
            filter.category = category;
        const templates = await ChecklistTemplate_1.default.find(filter)
            .populate('createdBy', 'name email')
            .skip(skip)
            .limit(Number(limit))
            .sort({ createdAt: -1 });
        const total = await ChecklistTemplate_1.default.countDocuments(filter);
        res.json({
            templates,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('체크리스트 템플릿 목록 조회 실패', error);
        res.status(500).json({ error: '템플릿 목록을 불러오는데 실패했습니다.' });
    }
});
router.get('/level/:level', auth_1.auth, (0, auth_1.requireRole)(['instructor', 'centerAdmin', 'superAdmin']), async (req, res) => {
    try {
        const { level } = req.params;
        const { category } = req.query;
        const filter = { level, isActive: true };
        if (category)
            filter.category = category;
        const templates = await ChecklistTemplate_1.default.find(filter)
            .populate('createdBy', 'name email')
            .sort({ name: 1 });
        res.json({ templates });
    }
    catch (error) {
        (0, logger_1.logError)('레벨별 템플릿 조회 실패', error);
        res.status(500).json({ error: '템플릿을 불러오는데 실패했습니다.' });
    }
});
router.get('/:templateId', auth_1.auth, (0, auth_1.requireRole)(['instructor', 'centerAdmin', 'superAdmin']), async (req, res) => {
    try {
        const template = await ChecklistTemplate_1.default.findById(req.params.templateId)
            .populate('createdBy', 'name email');
        if (!template) {
            return res.status(404).json({ error: '템플릿을 찾을 수 없습니다.' });
        }
        res.json({ template });
    }
    catch (error) {
        (0, logger_1.logError)('템플릿 상세 조회 실패', error);
        res.status(500).json({ error: '템플릿을 불러오는데 실패했습니다.' });
    }
});
router.post('/', auth_1.auth, (0, auth_1.requireRole)(['superAdmin']), async (req, res) => {
    try {
        const { name, description, level, category, items, tags } = req.body;
        if (!name || !level || !category) {
            return res.status(400).json({ error: '필수 필드가 누락되었습니다.' });
        }
        const template = new ChecklistTemplate_1.default({
            name,
            description,
            level,
            category,
            items: items || [],
            tags: tags || [],
            createdBy: req.user._id
        });
        await template.save();
        (0, logger_1.logInfo)('체크리스트 템플릿 생성', { templateId: template._id, name, level });
        res.status(201).json({ template });
    }
    catch (error) {
        (0, logger_1.logError)('템플릿 생성 실패', error);
        res.status(500).json({ error: '템플릿 생성에 실패했습니다.' });
    }
});
router.put('/:templateId', auth_1.auth, (0, auth_1.requireRole)(['superAdmin']), async (req, res) => {
    try {
        const { name, description, level, category, items, tags, isActive } = req.body;
        const template = await ChecklistTemplate_1.default.findByIdAndUpdate(req.params.templateId, {
            name,
            description,
            level,
            category,
            items,
            tags,
            isActive,
            version: { $inc: 1 }
        }, { new: true });
        if (!template) {
            return res.status(404).json({ error: '템플릿을 찾을 수 없습니다.' });
        }
        (0, logger_1.logInfo)('템플릿 수정', { templateId: template._id, name });
        res.json({ template });
    }
    catch (error) {
        (0, logger_1.logError)('템플릿 수정 실패', error);
        res.status(500).json({ error: '템플릿 수정에 실패했습니다.' });
    }
});
router.delete('/:templateId', auth_1.auth, (0, auth_1.requireRole)(['superAdmin']), async (req, res) => {
    try {
        const template = await ChecklistTemplate_1.default.findByIdAndDelete(req.params.templateId);
        if (!template) {
            return res.status(404).json({ error: '템플릿을 찾을 수 없습니다.' });
        }
        (0, logger_1.logInfo)('템플릿 삭제', { templateId: req.params.templateId, name: template.name });
        res.json({ message: '템플릿이 성공적으로 삭제되었습니다.' });
    }
    catch (error) {
        (0, logger_1.logError)('템플릿 삭제 실패', error);
        res.status(500).json({ error: '템플릿 삭제에 실패했습니다.' });
    }
});
exports.default = router;
//# sourceMappingURL=checklist-template.js.map