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
exports.redisClient = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const redisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0'),
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    keepAlive: 30000,
    connectTimeout: 10000,
    commandTimeout: 5000,
    maxMemoryPolicy: 'allkeys-lru',
    maxMemory: '256mb'
};
class RedisClient {
    constructor() {
        this.client = null;
        this.subscriber = null;
    }
    async connect() {
        try {
            this.client = new ioredis_1.default(redisConfig);
            this.subscriber = new ioredis_1.default(redisConfig);
            this.client.on('connect', () => {
                console.log('✅ Redis 클라이언트 연결 성공');
            });
            this.client.on('error', (error) => {
                console.error('❌ Redis 클라이언트 오류:', error);
            });
            this.client.on('ready', () => {
                console.log('🚀 Redis 클라이언트 준비 완료');
            });
            return true;
        }
        catch (error) {
            console.error('❌ Redis 연결 실패:', error);
            return false;
        }
    }
    async get(key) {
        if (!this.client)
            return null;
        try {
            return await this.client.get(key);
        }
        catch (error) {
            console.error('Redis GET 오류:', error);
            return null;
        }
    }
    async set(key, value, ttl) {
        if (!this.client)
            return false;
        try {
            if (ttl) {
                await this.client.setex(key, ttl, value);
            }
            else {
                await this.client.set(key, value);
            }
            return true;
        }
        catch (error) {
            console.error('Redis SET 오류:', error);
            return false;
        }
    }
    async del(key) {
        if (!this.client)
            return false;
        try {
            await this.client.del(key);
            return true;
        }
        catch (error) {
            console.error('Redis DEL 오류:', error);
            return false;
        }
    }
    async exists(key) {
        if (!this.client)
            return false;
        try {
            const result = await this.client.exists(key);
            return result === 1;
        }
        catch (error) {
            console.error('Redis EXISTS 오류:', error);
            return false;
        }
    }
    async flushdb() {
        if (!this.client)
            return false;
        try {
            await this.client.flushdb();
            return true;
        }
        catch (error) {
            console.error('Redis FLUSHDB 오류:', error);
            return false;
        }
    }
    async disconnect() {
        if (this.client) {
            await this.client.disconnect();
        }
        if (this.subscriber) {
            await this.subscriber.disconnect();
        }
    }
    getClient() {
        return this.client;
    }
}
exports.redisClient = new RedisClient();
exports.default = exports.redisClient;
//# sourceMappingURL=redis.js.map