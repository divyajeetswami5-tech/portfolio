// =========================================================
// Notification service (mock).
//
// On a new contact submission we want to alert the owner. This
// module abstracts "how" so you can wire a real provider later:
//   - Webhook  : Slack/Discord/Make/Zapier incoming webhook
//   - Email    : SendGrid/Resend/SES/Nodemailer (placeholder here)
//
// With no config set it simply logs to the console — perfect for
// local development and as a clear integration point.
// =========================================================
import { config } from '../config.js';

/**
 * Dispatch a contact notification.
 * @param {{name:string,email:string,subject:string,message:string}} msg
 * @returns {Promise<{channel:string, ok:boolean}>}
 */
export async function notifyContact(msg) {
  const text =
    `📬 New portfolio message\n` +
    `From: ${msg.name} <${msg.email}>\n` +
    `Subject: ${msg.subject}\n\n` +
    `${msg.message}`;

  // 1) Webhook channel (preferred when configured).
  if (config.contact.webhookUrl) {
    try {
      const res = await fetch(config.contact.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Most webhook receivers (Slack/Discord) accept a "content"/"text" field.
        body: JSON.stringify({ text, content: text })
      });
      return { channel: 'webhook', ok: res.ok };
    } catch (err) {
      console.error('[notify] webhook dispatch failed:', err.message);
      // fall through to log
    }
  }

  // 2) Email channel — placeholder.
  // TODO: integrate a provider, e.g.:
  //   import { Resend } from 'resend';
  //   await new Resend(process.env.RESEND_API_KEY).emails.send({
  //     from: 'portfolio@your-domain.com',
  //     to: config.contact.toEmail,
  //     subject: `[Portfolio] ${msg.subject}`,
  //     text
  //   });

  // 3) Fallback: structured console log so nothing is ever lost in dev.
  console.log('\n──────── CONTACT (mock notify) ────────');
  console.log(text);
  console.log(`(would email -> ${config.contact.toEmail})`);
  console.log('───────────────────────────────────────\n');

  return { channel: 'log', ok: true };
}
