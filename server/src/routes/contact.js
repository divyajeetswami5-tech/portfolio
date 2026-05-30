// =========================================================
// POST /api/contact
// Strict input sanitization + mock notification dispatch.
// =========================================================
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { validateContact } from '../utils/sanitize.js';
import { notifyContact } from '../services/notify.js';

const router = Router();

// Tight limiter: contact forms are a classic spam/abuse target.
const contactLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,                    // 5 submissions per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: 'Too many messages. Please try again later.' }
});

router.post('/', contactLimiter, async (req, res) => {
  const result = validateContact(req.body);

  if (!result.ok) {
    // Honeypot triggered -> pretend success so bots get no signal.
    if (result.errors.spam) return res.status(200).json({ ok: true });
    return res.status(422).json({
      ok: false,
      error: 'Please correct the highlighted fields.',
      fields: result.errors
    });
  }

  try {
    const outcome = await notifyContact(result.data);
    return res.status(201).json({
      ok: true,
      message: 'Thanks! Your message has been received.',
      channel: outcome.channel
    });
  } catch (err) {
    console.error('[contact] dispatch error:', err);
    return res.status(502).json({
      ok: false,
      error: 'Could not deliver your message right now. Please email directly.'
    });
  }
});

export default router;
