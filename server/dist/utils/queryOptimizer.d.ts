/// <reference types="mongoose/types/aggregate" />
/// <reference types="mongoose/types/callback" />
/// <reference types="mongoose/types/collection" />
/// <reference types="mongoose/types/connection" />
/// <reference types="mongoose/types/cursor" />
/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/error" />
/// <reference types="mongoose/types/expressions" />
/// <reference types="mongoose/types/helpers" />
/// <reference types="mongoose/types/middlewares" />
/// <reference types="mongoose/types/indexes" />
/// <reference types="mongoose/types/models" />
/// <reference types="mongoose/types/mongooseoptions" />
/// <reference types="mongoose/types/pipelinestage" />
/// <reference types="mongoose/types/populate" />
/// <reference types="mongoose/types/query" />
/// <reference types="mongoose/types/schemaoptions" />
/// <reference types="mongoose/types/schematypes" />
/// <reference types="mongoose/types/session" />
/// <reference types="mongoose/types/types" />
/// <reference types="mongoose/types/utility" />
/// <reference types="mongoose/types/validation" />
/// <reference types="mongoose/types/virtuals" />
/// <reference types="mongoose/types/inferschematype" />
import mongoose from 'mongoose';
interface QueryAnalysis {
    query: string;
    collection: string;
    executionTime: number;
    documentsExamined: number;
    documentsReturned: number;
    indexUsed: boolean;
    indexName?: string;
    executionStats?: any;
    recommendations: string[];
    score: number;
}
interface IndexRecommendation {
    collection: string;
    fields: string[];
    type: 'single' | 'compound' | 'text' | 'geospatial';
    priority: 'high' | 'medium' | 'low';
    reason: string;
    estimatedImpact: string;
}
declare class QueryOptimizer {
    private static instance;
    private queryHistory;
    private maxHistorySize;
    private constructor();
    static getInstance(): QueryOptimizer;
    analyzeQuery(model: mongoose.Model<any>, query: any, options?: any): Promise<QueryAnalysis>;
    private generateRecommendations;
    private calculateScore;
    private addToHistory;
    generateIndexRecommendations(collection: string): IndexRecommendation[];
    private analyzeQueryPatterns;
    private extractQueryFields;
    getSlowQueries(threshold?: number): QueryAnalysis[];
    getPoorPerformingQueries(scoreThreshold?: number): QueryAnalysis[];
    getCollectionStats(): any;
    generateOptimizationReport(): any;
    clearHistory(): void;
}
export default QueryOptimizer;
//# sourceMappingURL=queryOptimizer.d.ts.map