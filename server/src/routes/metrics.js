// =========================================================
// /api/metrics
// Lightweight, privacy-friendly engagement counter.
// Stores counts only — no IPs, no PII.
// =========================================================
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { Metric } from '../models/Metric.js';

const router = Router();

// Generous but present limiter to blunt counter-spamming.
const beaconLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: 'Rate limit exceeded.' }
});

// POST /api/metrics/hit  — fired by the page-load beacon.
router.post('/hit', beaconLimiter, async (req, res) => {
  const path = (req.body && req.body.path) || '/';
  await Metric.hit(path);
  // 204: nothing to return, keeps the beacon ultra-cheap.
  res.status(204).end();
});

// POST /api/metrics/engage  — e.g. project link clicks.
router.post('/engage', beaconLimiter, async (req, res) => {
  const key = req.body && req.body.key;
  if (!key) return res.status(400).json({ ok: false, error: 'key is required.' });
  const result = await Metric.engage(key);
  res.status(202).json({ ok: true, ...result });
});

// GET /api/metrics  — public aggregate snapshot (counts only).
router.get('/', async (_req, res) => {
  const snap = await Metric.snapshot();
  res.json({ ok: true, metrics: snap });
});

export default router;
