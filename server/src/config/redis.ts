import Redis from 'ioredis';
import * as dotenv from 'dotenv';

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
  private client: Redis | null = null;
  private subscriber: Redis | null = null;

  async connect() {
    try {
      this.client = new Redis(redisConfig);
      this.subscriber = new Redis(redisConfig);

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
    } catch (error) {
      console.error('❌ Redis 연결 실패:', error);
      return false;
    }
  }

  async get(key: string): Promise<string | null> {
    if (!this.client) return null;
    try {
      return await this.client.get(key);
    } catch (error) {
      console.error('Redis GET 오류:', error);
      return null;
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<boolean> {
    if (!this.client) return false;
    try {
      if (ttl) {
        await this.client.setex(key, ttl, value);
      } else {
        await this.client.set(key, value);
      }
      return true;
    } catch (error) {
      console.error('Redis SET 오류:', error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    if (!this.client) return false;
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error('Redis DEL 오류:', error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.client) return false;
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Redis EXISTS 오류:', error);
      return false;
    }
  }

  async flushdb(): Promise<boolean> {
    if (!this.client) return false;
    try {
      await this.client.flushdb();
      return true;
    } catch (error) {
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

  getClient(): Redis | null {
    return this.client;
  }
}

export const redisClient = new RedisClient();
export default redisClient;

