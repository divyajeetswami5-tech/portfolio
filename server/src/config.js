// =========================================================
// Centralized configuration. Reads from environment (.env)
// with safe defaults so the server runs out of the box.
// =========================================================
import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const parseList = (val) =>
  (val || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

export const config = {
  port: Number(process.env.PORT) || 4000,
  env: process.env.NODE_ENV || 'development',
  isProd: (process.env.NODE_ENV || 'development') === 'production',

  // CORS allow-list. Empty list => allow same-origin / tools only.
  allowedOrigins: parseList(process.env.ALLOWED_ORIGINS),

  contact: {
    webhookUrl: process.env.CONTACT_WEBHOOK_URL || '',
    toEmail: process.env.CONTACT_TO_EMAIL || 'divyajeetswami5@gmail.com'
  },

  // Resolve DATA_DIR relative to the server root, not the cwd.
  dataDir: path.resolve(__dirname, '..', process.env.DATA_DIR || './data')
};
