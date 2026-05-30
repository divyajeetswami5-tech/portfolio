// =========================================================
// Server entrypoint.
// Seeds demo content, then starts listening.
// =========================================================
import { createApp } from './app.js';
import { config } from './config.js';
import { Project } from './models/Project.js';
import { seedProjects } from './models/seedProjects.js';

async function main() {
  // Seed the projects store on first boot so the API has content.
  try {
    const seeded = await Project.seedIfEmpty(seedProjects);
    console.log(`[seed] projects ready (${seeded.length} records)`);
  } catch (err) {
    console.error('[seed] failed:', err.message);
  }

  const app = createApp();

  const server = app.listen(config.port, () => {
    console.log(`\n🚀 Portfolio API listening on http://localhost:${config.port}`);
    console.log(`   env: ${config.env}`);
    console.log(`   health: http://localhost:${config.port}/api/health\n`);
  });

  // Graceful shutdown.
  const shutdown = (sig) => {
    console.log(`\n${sig} received — closing server...`);
    server.close(() => process.exit(0));
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main();
