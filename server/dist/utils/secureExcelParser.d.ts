interface ExcelParserOptions {
    maxFileSize: number;
    maxRows: number;
    maxColumns: number;
    allowedSheetNames?: string[];
    sanitizeData?: boolean;
}
interface ParsedExcelData {
    data: any[][];
    sheetName: string;
    rowCount: number;
    columnCount: number;
    metadata: {
        fileName: string;
        fileSize: number;
        parsedAt: Date;
    };
}
export declare class SecureExcelParser {
    private options;
    constructor(options?: Partial<ExcelParserOptions>);
    private validateFile;
    private sanitizeData;
    private validateWorksheet;
    parseFile(filePath: string): Promise<ParsedExcelData>;
    parseCSV(filePath: string): Promise<ParsedExcelData>;
}
export declare const defaultExcelParser: SecureExcelParser;
export declare const parseExcelFile: (filePath: string, options?: Partial<ExcelParserOptions>) => Promise<ParsedExcelData>;
export declare const parseCSVFile: (filePath: string, options?: Partial<ExcelParserOptions>) => Promise<ParsedExcelData>;
export default SecureExcelParser;
//# sourceMappingURL=secureExcelParser.d.ts.map