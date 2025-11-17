"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.suggestIndexes = exports.checkDatabaseHealth = exports.getDBStats = exports.disconnectDB = exports.isConnected = exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = require("./utils/logger");
const MONGODB_URI = 'mongodb+srv://jjswim:qkxm1010@jjswim-cluster.t5e3a9y.mongodb.net/jj-swim-lab?retryWrites=true&w=majority';
if (process.env.MONGODB_URI && process.env.MONGODB_URI.includes('localhost')) {
    throw new Error('❌ 로컬 MongoDB 사용 금지! Atlas만 사용 가능합니다.');
}
console.log('🔍 db.ts에서 환경 변수 확인:');
console.log('   - MONGODB_URI:', process.env.MONGODB_URI ? '✅ 설정됨' : '❌ 설정되지 않음');
console.log('   - MONGODB_URI 값:', process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 50) + '...' : '없음');
console.log('   - 사용할 URI:', MONGODB_URI.substring(0, 50) + '...');
const connectionOptions = {
    bufferCommands: true,
    autoIndex: false,
    serverSelectionTimeoutMS: 2000,
    socketTimeoutMS: 10000,
    maxPoolSize: 15,
    minPoolSize: 3,
    retryWrites: true,
    w: 'majority',
    maxIdleTimeMS: 20000,
    connectTimeoutMS: 8000,
    heartbeatFrequencyMS: 8000,
    compressors: ['zlib'],
    zlibCompressionLevel: 6,
    ...(process.env.NODE_ENV === 'development' && {
        serverSelectionTimeoutMS: 1000,
        socketTimeoutMS: 5000,
    })
};
mongoose_1.default.connection.on('connected', () => {
    (0, logger_1.logInfo)('✅ MongoDB 연결 성공');
    (0, logger_1.logDatabase)('Database connected', { status: 'connected' });
});
mongoose_1.default.connection.on('error', (error) => {
    (0, logger_1.logError)('❌ MongoDB 연결 오류', error);
    (0, logger_1.logDatabase)('Database error', { error: error.message });
});
mongoose_1.default.connection.on('disconnected', () => {
    (0, logger_1.logInfo)('⚠️ MongoDB 연결 해제');
    (0, logger_1.logDatabase)('Database disconnected', { status: 'disconnected' });
});
mongoose_1.default.connection.on('reconnected', () => {
    (0, logger_1.logInfo)('🔄 MongoDB 재연결 성공');
    (0, logger_1.logDatabase)('Database reconnected', { status: 'reconnected' });
});
if (process.env.NODE_ENV === 'development') {
    mongoose_1.default.set('debug', (collectionName, methodName, ...methodArgs) => {
        (0, logger_1.logDatabase)(`Query: ${collectionName}.${methodName}`, {
            method: methodName,
            args: methodArgs
        });
    });
}
const connectDB = async () => {
    try {
        (0, logger_1.logInfo)('🔗 MongoDB 연결 시도 중...');
        console.log('🔗 MongoDB 연결 시도 중...');
        console.log('🔗 URI:', MONGODB_URI.substring(0, 50) + '...');
        console.log('🔗 연결 옵션:', JSON.stringify(connectionOptions, null, 2));
        const startTime = Date.now();
        console.log('🔗 mongoose.connect 호출 중...');
        const connectionPromise = mongoose_1.default.connect(MONGODB_URI, connectionOptions);
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('MongoDB 연결 타임아웃 (10초)')), 10000);
        });
        console.log('🔗 Promise.race 대기 중...');
        await Promise.race([connectionPromise, timeoutPromise]);
        console.log('🔗 mongoose.connect 완료!');
        const connectionTime = Date.now() - startTime;
        (0, logger_1.logInfo)(`✅ MongoDB 연결 완료 (${connectionTime}ms)`);
        console.log(`✅ MongoDB 연결 완료 (${connectionTime}ms)`);
        console.log(`✅ 연결 상태: ${mongoose_1.default.connection.readyState}`);
        (0, logger_1.logDatabase)('Database connection successful', {
            status: 'success',
            connectionTime
        });
        return true;
    }
    catch (error) {
        (0, logger_1.logError)('❌ MongoDB 연결 실패:', error);
        console.log('❌ MongoDB 연결 실패:', error);
        console.log('❌ 에러 타입:', error instanceof Error ? error.constructor.name : typeof error);
        console.log('❌ 에러 메시지:', error instanceof Error ? error.message : String(error));
        console.log('❌ 에러 스택:', error instanceof Error ? error.stack : '스택 없음');
        if (error instanceof Error && error.message.includes('ECONNREFUSED')) {
            console.log('❌ MongoDB 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인하세요.');
        }
        else if (error instanceof Error && error.message.includes('ENOTFOUND')) {
            console.log('❌ MongoDB 호스트를 찾을 수 없습니다. URI를 확인하세요.');
        }
        else if (error instanceof Error && error.message.includes('authentication')) {
            console.log('❌ MongoDB 인증 실패. 사용자명과 비밀번호를 확인하세요.');
        }
        (0, logger_1.logDatabase)('Database connection failed', {
            error: error instanceof Error ? error.message : String(error)
        });
        return false;
    }
};
exports.connectDB = connectDB;
const isConnected = () => {
    return mongoose_1.default.connection.readyState === 1;
};
exports.isConnected = isConnected;
const disconnectDB = async () => {
    try {
        await mongoose_1.default.connection.close();
        (0, logger_1.logInfo)('✅ MongoDB 연결 종료');
        console.log('✅ MongoDB 연결 종료');
        return true;
    }
    catch (error) {
        (0, logger_1.logError)('❌ MongoDB 연결 종료 실패:', error);
        console.log('❌ MongoDB 연결 종료 실패:', error);
        return false;
    }
};
exports.disconnectDB = disconnectDB;
const getDBStats = async () => {
    try {
        if (!mongoose_1.default.connection.db) {
            throw new Error('Database not connected');
        }
        const stats = await mongoose_1.default.connection.db.stats();
        return {
            collections: stats.collections,
            dataSize: stats.dataSize,
            storageSize: stats.storageSize,
            indexes: stats.indexes,
            indexSize: stats.indexSize,
            objects: stats.objects,
            avgObjSize: stats.avgObjSize,
            dataFileVersion: stats.dataFileVersion,
            extents: stats.extents,
            fileSize: stats.fileSize,
            nsSizeMB: stats.nsSizeMB,
            ok: stats.ok
        };
    }
    catch (error) {
        (0, logger_1.logError)('❌ 데이터베이스 통계 조회 실패:', error);
        return null;
    }
};
exports.getDBStats = getDBStats;
const checkDatabaseHealth = async () => {
    try {
        const stats = await (0, exports.getDBStats)();
        return {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            type: 'mongodb',
            collections: stats?.collections || 0,
            objects: stats?.objects || 0
        };
    }
    catch (error) {
        return {
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? error.message : String(error)
        };
    }
};
exports.checkDatabaseHealth = checkDatabaseHealth;
const suggestIndexes = async () => {
    try {
        if (!mongoose_1.default.connection.db) {
            throw new Error('Database not connected');
        }
        const collections = await mongoose_1.default.connection.db.listCollections().toArray();
        const suggestions = [];
        for (const collection of collections) {
            try {
                const dbCollection = mongoose_1.default.connection.db.collection(collection.name);
                const count = await dbCollection.countDocuments();
                if (count > 1000) {
                    suggestions.push({
                        collection: collection.name,
                        documentCount: count,
                        size: 'N/A',
                        recommendation: '인덱스 추가 고려'
                    });
                }
            }
            catch {
                continue;
            }
        }
        return suggestions;
    }
    catch (error) {
        (0, logger_1.logError)('인덱스 제안 조회 실패:', error);
        return [];
    }
};
exports.suggestIndexes = suggestIndexes;
//# sourceMappingURL=db.js.map