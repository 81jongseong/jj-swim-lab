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
exports.ipLimiter = exports.speedLimiter = exports.uploadLimiter = exports.apiLimiter = exports.authLimiter = exports.generalLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const slowDown = __importStar(require("express-slow-down"));
exports.generalLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: 100,
    message: {
        error: '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.',
        retryAfter: '60초 후에 다시 시도해주세요.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            error: '요청 제한에 도달했습니다.',
            retryAfter: Math.ceil(60 / 1000),
            timestamp: new Date().toISOString()
        });
    }
});
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: 5,
    message: {
        error: '로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.',
        retryAfter: '60초 후에 다시 시도해주세요.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    handler: (req, res) => {
        res.status(429).json({
            error: '로그인 시도 제한에 도달했습니다.',
            retryAfter: Math.ceil(60 / 1000),
            timestamp: new Date().toISOString()
        });
    }
});
exports.apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: 1000,
    message: {
        error: 'API 요청이 너무 많습니다.',
        retryAfter: '60초 후에 다시 시도해주세요.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            error: 'API 요청 제한에 도달했습니다.',
            retryAfter: Math.ceil(60 / 1000),
            timestamp: new Date().toISOString()
        });
    }
});
exports.uploadLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000,
    max: 10,
    message: {
        error: '파일 업로드가 너무 많습니다.',
        retryAfter: '1시간 후에 다시 시도해주세요.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            error: '파일 업로드 제한에 도달했습니다.',
            retryAfter: Math.ceil(3600 / 1000),
            timestamp: new Date().toISOString()
        });
    }
});
exports.speedLimiter = slowDown({
    windowMs: 15 * 60 * 1000,
    delayAfter: 100,
    delayMs: 500,
    maxDelayMs: 20000,
    skipSuccessfulRequests: false,
    skipFailedRequests: false
});
exports.ipLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        error: 'IP별 요청 제한에 도달했습니다.',
        retryAfter: '15분 후에 다시 시도해주세요.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        return req.ip || req.connection.remoteAddress || 'unknown';
    },
    handler: (req, res) => {
        res.status(429).json({
            error: 'IP별 요청 제한에 도달했습니다.',
            retryAfter: Math.ceil(900 / 1000),
            timestamp: new Date().toISOString()
        });
    }
});
//# sourceMappingURL=rateLimit.js.map