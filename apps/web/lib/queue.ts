import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const redisConnection = new IORedis(redisUrl);

export const connectorQueue = new Queue('connector-sync', { connection: redisConnection });
export const newsQueue = new Queue('news-sync', { connection: redisConnection });
