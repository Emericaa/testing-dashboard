import { Queue } from 'bullmq';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const connectorQueue = new Queue('connector-sync', { connection: { url: redisUrl } });
export const newsQueue = new Queue('news-sync', { connection: { url: redisUrl } });
