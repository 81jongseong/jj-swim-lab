"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const Report_1 = require("../models/Report");
const router = express_1.default.Router();
router.get('/', auth_1.authMiddleware, async (req, res) => {
    try {
        const reports = await Report_1.Report.find({});
        res.json({ success: true, data: reports });
    }
    catch (error) {
        res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
    }
});
exports.default = router;
//# sourceMappingURL=report.js.map