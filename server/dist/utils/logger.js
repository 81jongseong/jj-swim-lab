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
exports.performanceLogger = exports.dbLogger = exports.httpLogger = exports.logPerformanceMetric = exports.logDatabaseQuery = exports.logRequest = exports.logPerformance = exports.logDatabase = exports.logHttp = exports.logDebug = exports.logWarn = exports.logError = exports.logInfo = void 0;
const winston = __importStar(require("winston"));
const path_1 = __importDefault(require("path"));
const logLevels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};
const logColors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
};
winston.addColors(logColors);
const logFormat = winston.format.combine(winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }), winston.format.colorize({ all: true }), winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`));
const fileLogFormat = winston.format.combine(winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }), winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`));
const logDir = path_1.default.join(__dirname, '../../logs');
const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
    levels: logLevels,
    format: logFormat,
    transports: [
        new winston.transports.Console({
            format: logFormat,
        }),
        new winston.transports.File({
            filename: path_1.default.join(logDir, 'error.log'),
            level: 'error',
            format: fileLogFormat,
            maxsize: 5242880,
            maxFiles: 5,
        }),
        new winston.transports.File({
            filename: path_1.default.join(logDir, 'combined.log'),
            format: fileLogFormat,
            maxsize: 5242880,
            maxFiles: 5,
        }),
    ],
});
const httpLogger = winston.createLogger({
    level: 'http',
    format: winston.format.combine(winston.format.timestamp(), winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)),
    transports: [
        new winston.transports.File({
            filename: path_1.default.join(logDir, 'http.log'),
            maxsize: 5242880,
            maxFiles: 3,
        }),
    ],
});
exports.httpLogger = httpLogger;
const dbLogger = winston.createLogger({
    level: 'debug',
    format: winston.format.combine(winston.format.timestamp(), winston.format.printf((info) => `${info.timestamp} [DB] ${info.level}: ${info.message}`)),
    transports: [
        new winston.transports.File({
            filename: path_1.default.join(logDir, 'database.log'),
            maxsize: 5242880,
            maxFiles: 3,
        }),
    ],
});
exports.dbLogger = dbLogger;
const performanceLogger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(winston.format.timestamp(), winston.format.printf((info) => `${info.timestamp} [PERF] ${info.level}: ${info.message}`)),
    transports: [
        new winston.transports.File({
            filename: path_1.default.join(logDir, 'performance.log'),
            maxsize: 5242880,
            maxFiles: 3,
        }),
    ],
});
exports.performanceLogger = performanceLogger;
const logInfo = (message, meta) => {
    logger.info(message, meta);
};
exports.logInfo = logInfo;
const logError = (message, error) => {
    logger.error(message, error);
};
exports.logError = logError;
const logWarn = (message, meta) => {
    logger.warn(message, meta);
};
exports.logWarn = logWarn;
const logDebug = (message, meta) => {
    logger.debug(message, meta);
};
exports.logDebug = logDebug;
const logHttp = (message, meta) => {
    httpLogger.http(message, meta);
};
exports.logHttp = logHttp;
const logDatabase = (message, meta) => {
    dbLogger.info(message, meta);
};
exports.logDatabase = logDatabase;
const logPerformance = (message, meta) => {
    performanceLogger.info(message, meta);
};
exports.logPerformance = logPerformance;
const logRequest = (req, res, responseTime) => {
    const message = `${req.method} ${req.originalUrl} ${res.statusCode} - ${responseTime}ms`;
    (0, exports.logHttp)(message, {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        responseTime,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
    });
};
exports.logRequest = logRequest;
const logDatabaseQuery = (query, executionTime) => {
    (0, exports.logDatabase)(`Query executed in ${executionTime}ms`, { query, executionTime });
};
exports.logDatabaseQuery = logDatabaseQuery;
const logPerformanceMetric = (operation, duration, meta) => {
    (0, exports.logPerformance)(`${operation} completed in ${duration}ms`, { operation, duration, ...meta });
};
exports.logPerformanceMetric = logPerformanceMetric;
exports.default = logger;
//# sourceMappingURL=logger.js.map