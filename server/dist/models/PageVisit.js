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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageVisit = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const PageVisitSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User'
    },
    userType: {
        type: String,
        enum: ['student', 'instructor', 'centerAdmin', 'superAdmin', 'guest']
    },
    path: {
        type: String,
        required: true,
        maxlength: 500
    },
    method: {
        type: String,
        enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        default: 'GET'
    },
    statusCode: {
        type: Number,
        required: true
    },
    responseTime: {
        type: Number,
        required: true
    },
    ipAddress: {
        type: String,
        required: true
    },
    userAgent: {
        type: String,
        required: true
    },
    referrer: {
        type: String,
        maxlength: 500
    },
    visitTime: {
        type: Date,
        required: true,
        default: Date.now
    },
    sessionId: {
        type: String,
        maxlength: 100
    }
}, {
    timestamps: true
});
PageVisitSchema.index({ path: 1, visitTime: -1 });
PageVisitSchema.index({ userId: 1, visitTime: -1 });
PageVisitSchema.index({ visitTime: -1 });
PageVisitSchema.index({ userType: 1, visitTime: -1 });
exports.PageVisit = mongoose_1.default.model('PageVisit', PageVisitSchema);
//# sourceMappingURL=PageVisit.js.map