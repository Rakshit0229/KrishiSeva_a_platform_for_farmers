import app, { initializeBackend } from './app';
import { initializeCronJobs } from './services/cron';

const PORT = process.env.PORT || 4000;

async function startServer() {
  console.log('🌾 Initializing KrishiSeva Backend Engine...');

  await initializeBackend();

  // Background cron schedules
  initializeCronJobs();

  app.listen(PORT, () => {
    console.log(`🚀 KrishiSeva API Server listening on http://localhost:${PORT}`);
    console.log(`📡 SSE Queue Stream at http://localhost:${PORT}/api/queue/stream/:centreId`);
    console.log(`📺 TV Token Display at http://localhost:${PORT}/api/display/:centreId`);
  });
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
