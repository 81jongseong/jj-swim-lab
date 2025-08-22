"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunityReport = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const communityReportSchema = new mongoose_1.default.Schema({
    targetType: { type: String, enum: ['post', 'comment'], required: true },
    targetId: { type: mongoose_1.default.Schema.Types.ObjectId, required: true },
    reporter: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ['open', 'reviewed', 'dismissed'], default: 'open' },
}, { timestamps: true });
communityReportSchema.index({ targetType: 1, targetId: 1, reporter: 1 }, { unique: true });
exports.CommunityReport = mongoose_1.default.model('CommunityReport', communityReportSchema);
//# sourceMappingURL=CommunityReport.js.map