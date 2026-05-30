// =========================================================
// Express application factory.
// Wires security middleware, CORS, body limits, routes, and
// a JSON error handler. Kept separate from server.js so it can
// be imported by tests without binding a port.
// =========================================================
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { config } from './config.js';

import contactRoutes from './routes/contact.js';
import projectRoutes from './routes/projects.js';
import metricsRoutes from './routes/metrics.js';

export function createApp() {
  const app = express();

  // Behind a proxy (Render/Vercel/Nginx) so rate-limit sees real client IPs.
  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  // Security headers (CSP left permissive here; tighten for your asset hosts).
  app.use(helmet({ contentSecurityPolicy: false }));

  // CORS allow-list. If none configured, reflect no cross-origin (same-origin only).
  app.use(
    cors({
      origin(origin, cb) {
        // Allow tools/curl (no Origin) and same-origin requests.
        if (!origin || config.allowedOrigins.length === 0) return cb(null, true);
        return cb(null, config.allowedOrigins.includes(origin));
      },
      methods: ['GET', 'POST'],
      maxAge: 86400
    })
  );

  // Small body cap: defends against oversized payloads.
  app.use(express.json({ limit: '16kb' }));

  // Health check for uptime monitors / load balancers.
  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, env: config.env, uptime: process.uptime() });
  });

  app.use('/api/contact', contactRoutes);
  app.use('/api/projects', projectRoutes);
  app.use('/api/metrics', metricsRoutes);

  // 404 for unknown API routes.
  app.use('/api', (_req, res) => {
    res.status(404).json({ ok: false, error: 'Not found.' });
  });

  // Central error handler — never leak stack traces in production.
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    console.error('[error]', err);
    const status = err.status || 500;
    res.status(status).json({
      ok: false,
      error: config.isProd ? 'Internal server error.' : err.message
    });
  });

  return app;
}
