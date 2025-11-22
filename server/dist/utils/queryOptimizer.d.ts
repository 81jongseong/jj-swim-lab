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