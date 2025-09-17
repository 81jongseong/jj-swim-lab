"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class QueryOptimizer {
    constructor() {
        this.queryHistory = [];
        this.maxHistorySize = 1000;
    }
    static getInstance() {
        if (!QueryOptimizer.instance) {
            QueryOptimizer.instance = new QueryOptimizer();
        }
        return QueryOptimizer.instance;
    }
    async analyzeQuery(model, query, options = {}) {
        const startTime = Date.now();
        const collection = model.collection.name;
        try {
            const startQuery = Date.now();
            const result = await model.find(query, null, options);
            const executionTime = Date.now() - startTime;
            const analysis = {
                query: JSON.stringify(query),
                collection,
                executionTime,
                documentsExamined: Array.isArray(result) ? result.length : 1,
                documentsReturned: Array.isArray(result) ? result.length : 1,
                indexUsed: false,
                indexName: undefined,
                executionStats: { queryTime: executionTime },
                recommendations: [],
                score: 0
            };
            analysis.recommendations = this.generateRecommendations(analysis);
            analysis.score = this.calculateScore(analysis);
            this.addToHistory(analysis);
            return analysis;
        }
        catch (error) {
            console.error('쿼리 분석 실패:', error);
            throw error;
        }
    }
    generateRecommendations(analysis) {
        const recommendations = [];
        const examinationRatio = analysis.documentsExamined / Math.max(analysis.documentsReturned, 1);
        if (examinationRatio > 10) {
            recommendations.push('문서 검사 비율이 높습니다. 적절한 인덱스를 추가하세요.');
        }
        if (analysis.executionTime > 100) {
            recommendations.push('쿼리 실행 시간이 길어집니다. 쿼리 구조를 최적화하세요.');
        }
        if (!analysis.indexUsed) {
            recommendations.push('인덱스가 사용되지 않습니다. 쿼리 조건에 맞는 인덱스를 생성하세요.');
        }
        if (analysis.query.includes('$and') || analysis.query.includes('$or')) {
            recommendations.push('복합 쿼리입니다. 쿼리 조건 순서를 최적화하세요.');
        }
        return recommendations;
    }
    calculateScore(analysis) {
        let score = 100;
        if (analysis.executionTime > 1000)
            score -= 30;
        else if (analysis.executionTime > 500)
            score -= 20;
        else if (analysis.executionTime > 100)
            score -= 10;
        const examinationRatio = analysis.documentsExamined / Math.max(analysis.documentsReturned, 1);
        if (examinationRatio > 100)
            score -= 25;
        else if (examinationRatio > 50)
            score -= 15;
        else if (examinationRatio > 10)
            score -= 10;
        if (!analysis.indexUsed)
            score -= 20;
        return Math.max(0, score);
    }
    addToHistory(analysis) {
        this.queryHistory.push(analysis);
        if (this.queryHistory.length > this.maxHistorySize) {
            this.queryHistory = this.queryHistory.slice(-this.maxHistorySize);
        }
    }
    generateIndexRecommendations(collection) {
        const recommendations = [];
        const collectionQueries = this.queryHistory.filter(q => q.collection === collection);
        if (collectionQueries.length === 0) {
            return recommendations;
        }
        const queryPatterns = this.analyzeQueryPatterns(collectionQueries);
        queryPatterns.forEach(pattern => {
            if (pattern.frequency > 5 && pattern.score < 70) {
                recommendations.push({
                    collection,
                    fields: pattern.fields,
                    type: pattern.fields.length === 1 ? 'single' : 'compound',
                    priority: pattern.score < 50 ? 'high' : 'medium',
                    reason: `자주 사용되는 쿼리 패턴 (${pattern.frequency}회 사용)`,
                    estimatedImpact: `성능 향상 예상: ${100 - pattern.score}점`
                });
            }
        });
        return recommendations;
    }
    analyzeQueryPatterns(queries) {
        const patterns = new Map();
        queries.forEach(query => {
            try {
                const queryObj = JSON.parse(query.query);
                const fields = this.extractQueryFields(queryObj);
                const patternKey = fields.sort().join(',');
                if (patterns.has(patternKey)) {
                    const pattern = patterns.get(patternKey);
                    pattern.frequency++;
                    pattern.score = Math.min(pattern.score, query.score);
                }
                else {
                    patterns.set(patternKey, {
                        frequency: 1,
                        score: query.score,
                        fields
                    });
                }
            }
            catch (error) {
            }
        });
        return Array.from(patterns.values());
    }
    extractQueryFields(query) {
        const fields = [];
        const extractFields = (obj, prefix = '') => {
            Object.keys(obj).forEach(key => {
                if (key.startsWith('$')) {
                    return;
                }
                const fieldName = prefix ? `${prefix}.${key}` : key;
                fields.push(fieldName);
                if (typeof obj[key] === 'object' && obj[key] !== null) {
                    extractFields(obj[key], fieldName);
                }
            });
        };
        extractFields(query);
        return fields;
    }
    getSlowQueries(threshold = 100) {
        return this.queryHistory
            .filter(q => q.executionTime > threshold)
            .sort((a, b) => b.executionTime - a.executionTime);
    }
    getPoorPerformingQueries(scoreThreshold = 50) {
        return this.queryHistory
            .filter(q => q.score < scoreThreshold)
            .sort((a, b) => a.score - b.score);
    }
    getCollectionStats() {
        const stats = new Map();
        this.queryHistory.forEach(query => {
            if (!stats.has(query.collection)) {
                stats.set(query.collection, {
                    totalQueries: 0,
                    averageExecutionTime: 0,
                    averageScore: 0,
                    slowQueries: 0,
                    poorPerformingQueries: 0
                });
            }
            const stat = stats.get(query.collection);
            stat.totalQueries++;
            stat.averageExecutionTime += query.executionTime;
            stat.averageScore += query.score;
            if (query.executionTime > 100)
                stat.slowQueries++;
            if (query.score < 50)
                stat.poorPerformingQueries++;
        });
        stats.forEach(stat => {
            stat.averageExecutionTime = Math.round(stat.averageExecutionTime / stat.totalQueries);
            stat.averageScore = Math.round(stat.averageScore / stat.totalQueries);
        });
        return Object.fromEntries(stats);
    }
    generateOptimizationReport() {
        const slowQueries = this.getSlowQueries();
        const poorPerformingQueries = this.getPoorPerformingQueries();
        const collectionStats = this.getCollectionStats();
        const totalQueries = this.queryHistory.length;
        const averageExecutionTime = totalQueries > 0 ?
            this.queryHistory.reduce((sum, q) => sum + q.executionTime, 0) / totalQueries : 0;
        const averageScore = totalQueries > 0 ?
            this.queryHistory.reduce((sum, q) => sum + q.score, 0) / totalQueries : 0;
        const indexRecommendations = [];
        Object.keys(collectionStats).forEach(collection => {
            const recommendations = this.generateIndexRecommendations(collection);
            indexRecommendations.push(...recommendations);
        });
        return {
            timestamp: new Date(),
            summary: {
                totalQueries,
                averageExecutionTime: Math.round(averageExecutionTime),
                averageScore: Math.round(averageScore),
                slowQueries: slowQueries.length,
                poorPerformingQueries: poorPerformingQueries.length
            },
            collectionStats,
            slowQueries: slowQueries.slice(0, 10),
            poorPerformingQueries: poorPerformingQueries.slice(0, 10),
            indexRecommendations: indexRecommendations.sort((a, b) => {
                const priorityOrder = { high: 3, medium: 2, low: 1 };
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            })
        };
    }
    clearHistory() {
        this.queryHistory = [];
        console.log('📊 쿼리 히스토리가 초기화되었습니다.');
    }
}
exports.default = QueryOptimizer;
//# sourceMappingURL=queryOptimizer.js.map