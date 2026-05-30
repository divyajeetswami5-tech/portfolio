// =========================================================
// Input sanitization & validation helpers.
// No external deps — small, auditable, dependency-light.
// =========================================================

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Strip control characters and collapse excessive whitespace.
const stripControl = (str) =>
  str.replace(/[\u0000-\u001F\u007F]/g, ' ').replace(/\s+/g, ' ').trim();

// Escape HTML-significant characters to neutralize stored/reflected XSS.
const ESCAPE_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
  '`': '&#x60;'
};
export const escapeHtml = (str = '') =>
  String(str).replace(/[&<>"'`/]/g, (ch) => ESCAPE_MAP[ch]);

/**
 * Coerce an unknown value to a clean, bounded string.
 * @param {*} value raw input
 * @param {number} maxLen hard cap (defends against huge payloads)
 */
export const cleanString = (value, maxLen = 2000) => {
  if (value == null) return '';
  const str = stripControl(String(value));
  return str.slice(0, maxLen);
};

export const isEmail = (value) =>
  typeof value === 'string' && EMAIL_RE.test(value) && value.length <= 254;

/**
 * Validate + sanitize a contact form payload.
 * Returns { ok, data?, errors? } — never throws on bad input.
 */
export function validateContact(body = {}) {
  const errors = {};

  const name = cleanString(body.name, 120);
  const email = cleanString(body.email, 254).toLowerCase();
  const subject = cleanString(body.subject, 160);
  const message = cleanString(body.message, 5000);

  if (name.length < 2) errors.name = 'Name must be at least 2 characters.';
  if (!isEmail(email)) errors.email = 'A valid email is required.';
  if (subject.length < 2) errors.subject = 'Subject is required.';
  if (message.length < 10) errors.message = 'Message must be at least 10 characters.';

  // Honeypot: bots fill hidden fields. Real users never will.
  if (body.website || body.company_url) errors.spam = 'Spam detected.';

  if (Object.keys(errors).length) return { ok: false, errors };

  return {
    ok: true,
    data: {
      // Store HTML-escaped copies — safe to render anywhere later.
      name: escapeHtml(name),
      email,
      subject: escapeHtml(subject),
      message: escapeHtml(message)
    }
  };
}
