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
exports.parseCSVFile = exports.parseExcelFile = exports.defaultExcelParser = exports.SecureExcelParser = void 0;
const ExcelJS = __importStar(require("exceljs"));
const fs_1 = __importDefault(require("fs"));
const logger_1 = require("./logger");
class SecureExcelParser {
    constructor(options = {}) {
        this.options = {
            maxFileSize: 5 * 1024 * 1024,
            maxRows: 10000,
            maxColumns: 100,
            allowedSheetNames: undefined,
            sanitizeData: true,
            ...options
        };
    }
    validateFile(filePath) {
        if (!fs_1.default.existsSync(filePath)) {
            throw new Error('파일이 존재하지 않습니다.');
        }
        const stats = fs_1.default.statSync(filePath);
        if (stats.size > this.options.maxFileSize) {
            throw new Error(`파일 크기가 너무 큽니다. 최대 ${this.options.maxFileSize} bytes까지 허용됩니다.`);
        }
        if (stats.size === 0) {
            throw new Error('파일이 비어있습니다.');
        }
    }
    sanitizeData(data) {
        if (typeof data === 'string') {
            return data.replace(/<[^>]*>/g, '').trim();
        }
        if (typeof data === 'number') {
            if (!isFinite(data) || Math.abs(data) > Number.MAX_SAFE_INTEGER) {
                return 0;
            }
            return data;
        }
        if (typeof data === 'boolean') {
            return Boolean(data);
        }
        if (data === null || data === undefined) {
            return '';
        }
        if (typeof data === 'object') {
            const sanitized = {};
            for (const [key, value] of Object.entries(data)) {
                const sanitizedKey = this.sanitizeData(key);
                if (typeof sanitizedKey === 'string' && sanitizedKey.length > 0) {
                    sanitized[sanitizedKey] = this.sanitizeData(value);
                }
            }
            return sanitized;
        }
        return data;
    }
    validateWorksheet(worksheet, sheetName) {
        const rowCount = worksheet.rowCount;
        const columnCount = worksheet.columnCount;
        if (rowCount > this.options.maxRows) {
            (0, logger_1.logWarn)('엑셀 행 수 제한 초과', { sheetName: worksheet.name, rowCount, maxRows: this.options.maxRows });
            throw new Error(`행 수가 너무 많습니다. 최대 ${this.options.maxRows}행까지 허용됩니다.`);
        }
        if (columnCount > this.options.maxColumns) {
            (0, logger_1.logWarn)('엑셀 열 수 제한 초과', { sheetName: worksheet.name, columnCount, maxColumns: this.options.maxColumns });
            throw new Error(`열 수가 너무 많습니다. 최대 ${this.options.maxColumns}열까지 허용됩니다.`);
        }
        if (this.options.allowedSheetNames && !this.options.allowedSheetNames.includes(sheetName)) {
            throw new Error(`허용되지 않는 시트 이름입니다: ${sheetName}`);
        }
    }
    async parseFile(filePath) {
        try {
            this.validateFile(filePath);
            (0, logger_1.logInfo)('Excel 파일 파싱 시작', { filePath });
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.readFile(filePath);
            if (!workbook.worksheets || workbook.worksheets.length === 0) {
                throw new Error('Excel 파일에 시트가 없습니다.');
            }
            const worksheet = workbook.worksheets[0];
            const sheetName = worksheet.name;
            if (!worksheet) {
                throw new Error('첫 번째 시트를 읽을 수 없습니다.');
            }
            this.validateWorksheet(worksheet, sheetName);
            const jsonData = [];
            worksheet.eachRow((row, rowNumber) => {
                const rowData = [];
                row.eachCell((cell, colNumber) => {
                    let cellValue = cell.value;
                    if (cellValue instanceof Date) {
                        cellValue = cellValue.toISOString().split('T')[0];
                    }
                    if (cellValue === null || cellValue === undefined) {
                        cellValue = '';
                    }
                    rowData[colNumber - 1] = cellValue;
                });
                jsonData[rowNumber - 1] = rowData;
            });
            let sanitizedData = jsonData;
            if (this.options.sanitizeData) {
                sanitizedData = jsonData.map((row) => row.map((cell) => this.sanitizeData(cell)));
            }
            const stats = fs_1.default.statSync(filePath);
            const result = {
                data: sanitizedData,
                sheetName,
                rowCount: sanitizedData.length,
                columnCount: sanitizedData.length > 0 ? sanitizedData[0].length : 0,
                metadata: {
                    fileName: filePath.split('/').pop() || filePath,
                    fileSize: stats.size,
                    parsedAt: new Date()
                }
            };
            (0, logger_1.logInfo)('Excel 파일 파싱 완료', {
                fileName: result.metadata.fileName,
                rowCount: result.rowCount,
                columnCount: result.columnCount,
                fileSize: result.metadata.fileSize
            });
            return result;
        }
        catch (error) {
            (0, logger_1.logError)('Excel 파일 파싱 실패', {
                filePath,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            throw error;
        }
    }
    async parseCSV(filePath) {
        try {
            this.validateFile(filePath);
            const content = fs_1.default.readFileSync(filePath, 'utf-8');
            const lines = content.split('\n').filter(line => line.trim());
            if (lines.length > this.options.maxRows) {
                (0, logger_1.logWarn)('CSV 행 수 제한 초과', { filePath, lines: lines.length, maxRows: this.options.maxRows });
                throw new Error(`행 수가 너무 많습니다. 최대 ${this.options.maxRows}행까지 허용됩니다.`);
            }
            const data = lines.map(line => {
                const columns = line.split(',').map(col => {
                    const trimmed = col.trim().replace(/^"|"$/g, '');
                    return this.options.sanitizeData ? this.sanitizeData(trimmed) : trimmed;
                });
                if (columns.length > this.options.maxColumns) {
                    throw new Error(`열 수가 너무 많습니다. 최대 ${this.options.maxColumns}열까지 허용됩니다.`);
                }
                return columns;
            });
            const stats = fs_1.default.statSync(filePath);
            return {
                data,
                sheetName: 'CSV',
                rowCount: data.length,
                columnCount: data.length > 0 ? data[0].length : 0,
                metadata: {
                    fileName: filePath.split('/').pop() || filePath,
                    fileSize: stats.size,
                    parsedAt: new Date()
                }
            };
        }
        catch (error) {
            (0, logger_1.logError)('CSV 파일 파싱 실패', {
                filePath,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            throw error;
        }
    }
}
exports.SecureExcelParser = SecureExcelParser;
exports.defaultExcelParser = new SecureExcelParser();
const parseExcelFile = (filePath, options) => {
    const parser = new SecureExcelParser(options);
    return parser.parseFile(filePath);
};
exports.parseExcelFile = parseExcelFile;
const parseCSVFile = (filePath, options) => {
    const parser = new SecureExcelParser(options);
    return parser.parseCSV(filePath);
};
exports.parseCSVFile = parseCSVFile;
exports.default = SecureExcelParser;
//# sourceMappingURL=secureExcelParser.js.map