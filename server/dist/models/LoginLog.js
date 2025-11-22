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
exports.LoginLog = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const LoginLogSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userType: {
        type: String,
        enum: ['student', 'instructor', 'centerAdmin', 'center-admin', 'superAdmin'],
        required: true
    },
    loginTime: {
        type: Date,
        required: true,
        default: Date.now
    },
    logoutTime: {
        type: Date
    },
    ipAddress: {
        type: String,
        required: true
    },
    userAgent: {
        type: String,
        required: true
    },
    sessionDuration: {
        type: Number
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});
LoginLogSchema.index({ userId: 1, loginTime: -1 });
LoginLogSchema.index({ loginTime: -1 });
LoginLogSchema.index({ userType: 1, loginTime: -1 });
LoginLogSchema.index({ isActive: 1, loginTime: -1 });
exports.LoginLog = mongoose_1.default.model('LoginLog', LoginLogSchema);
//# sourceMappingURL=LoginLog.js.map