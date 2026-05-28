/**
 * lib/mailer.js — Shared email helper using Resend.
 * 
 * Usage:
 *   const { sendEmail } = require('../lib/mailer');
 *   await sendEmail({ to: 'user@example.com', subject: 'Hello', html: '<p>Hi</p>' });
 *
 * Graceful: silently skips if no API key, no recipient, or on error.
 */

const { Resend } = require('resend');

const FROM_ADDRESS = 'Blue Horizon Overseas <notifications@bluehorizonoverseas.in>';

let _resend = null;

function getResend() {
    if (!_resend && process.env.RESEND_API_KEY) {
        _resend = new Resend(process.env.RESEND_API_KEY);
    }
    return _resend;
}

/**
 * Send an email via Resend. Fire-and-forget — never throws.
 * @param {{ to: string, subject: string, html: string }} opts
 */
async function sendEmail({ to, subject, html }) {
    if (!to || !subject) return;

    const resend = getResend();
    if (!resend) {
        console.log('[Mailer] No RESEND_API_KEY — skipping email.');
        return;
    }

    const MAX_RETRIES = 2;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
            const { data, error } = await resend.emails.send({
                from: FROM_ADDRESS,
                to: [to],
                subject,
                html
            });

            if (error) {
                console.error(`[Mailer] Resend error (attempt ${attempt + 1}):`, error);
                if (attempt < MAX_RETRIES) {
                    await new Promise(r => setTimeout(r, 1000 * (attempt + 1))); // 1s, 2s backoff
                    continue;
                }
            } else {
                console.log(`[Mailer] Email sent to ${to} — ID: ${data?.id}`);
                return; // Success — exit
            }
        } catch (err) {
            console.error(`[Mailer] Failed to send (attempt ${attempt + 1}):`, err.message);
            if (attempt < MAX_RETRIES) {
                await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
                continue;
            }
        }
    }
}

module.exports = { sendEmail };
