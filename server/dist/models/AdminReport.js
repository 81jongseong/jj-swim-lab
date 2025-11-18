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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminReport = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const AdminReportSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
        maxlength: 200
    },
    description: {
        type: String,
        required: true,
        maxlength: 2000
    },
    type: {
        type: String,
        required: true,
        enum: ['bug', 'feature', 'complaint', 'suggestion']
    },
    status: {
        type: String,
        required: true,
        enum: ['open', 'in_progress', 'resolved', 'closed'],
        default: 'open'
    },
    priority: {
        type: String,
        required: true,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    reportedBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    assignedTo: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User'
    },
    centerId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Center'
    },
    category: {
        type: String,
        maxlength: 100
    },
    tags: [{
            type: String,
            maxlength: 50
        }],
    attachments: [{
            type: String,
            maxlength: 500
        }],
    resolution: {
        type: String,
        maxlength: 1000
    },
    resolvedAt: {
        type: Date
    }
}, {
    timestamps: true
});
AdminReportSchema.index({ status: 1, priority: -1 });
AdminReportSchema.index({ type: 1, createdAt: -1 });
AdminReportSchema.index({ reportedBy: 1, createdAt: -1 });
AdminReportSchema.index({ assignedTo: 1, status: 1 });
exports.AdminReport = mongoose_1.default.model('AdminReport', AdminReportSchema);
//# sourceMappingURL=AdminReport.js.map