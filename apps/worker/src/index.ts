import http from 'node:http';
import { Worker } from 'bullmq';
import { connectorQueue, newsQueue, queueConnection } from './queues';
import { handleConnectorJob } from './jobs/connectorSync';
import { handleNewsSync } from './jobs/newsSync';
import { log } from './services/logger';

const connectorWorker = new Worker('connector-sync', handleConnectorJob, { connection: queueConnection });
const newsWorker = new Worker('news-sync', async () => handleNewsSync(), { connection: queueConnection });

connectorWorker.on('failed', (job, err) => {
  log('error', 'Connector job failed', { jobId: job?.id, error: err.message });
});

newsWorker.on('failed', (job, err) => {
  log('error', 'News job failed', { jobId: job?.id, error: err.message });
});

async function scheduleJobs() {
  await connectorQueue.add(
    'nightly-sync',
    { connectorType: 'all', orgId: 'all' },
    { repeat: { cron: '0 2 * * *' } }
  );
  await newsQueue.add(
    'hourly-news',
    {},
    { repeat: { every: 60 * 60 * 1000 } }
  );
  log('info', 'Scheduled repeatable jobs');
}

scheduleJobs().catch((error) => log('error', 'Schedule failed', { error: error.message }));

const port = Number(process.env.WORKER_PORT || 4001);
const server = http.createServer((_req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'ok' }));
});

server.listen(port, () => {
  log('info', 'Worker listening', { port });
});
