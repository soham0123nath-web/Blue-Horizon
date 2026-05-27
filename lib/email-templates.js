/**
 * lib/email-templates.js — Branded HTML email templates for Blue Horizon Overseas.
 *
 * Every template returns a fully inline-CSS'd HTML string ready for Resend.
 */

const BRAND = {
    navy: '#0a1628',
    navyCard: '#111d33',
    gold: '#d4a853',
    goldDim: 'rgba(212,168,83,0.3)',
    accent: '#3b82f6',
    textLight: '#e2e8f0',
    textDim: '#94a3b8',
    white: '#ffffff',
    logo: 'Blue Horizon Overseas',
    website: 'https://bluehorizonoverseas.in',
    phone: '+91 89420 69079',
    email: 'global@bluehorizonoverseas.in',
};

// ── Shared layout wrapper ──
function layout(content, preheader = '') {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Blue Horizon Overseas</title>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.navy};font-family:'Segoe UI',Roboto,Arial,sans-serif;">
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden">${preheader}</div>` : ''}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.navy};">
    <tr>
      <td align="center" style="padding:24px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:${BRAND.navyCard};border-radius:16px;border:1px solid ${BRAND.goldDim};overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="padding:28px 32px 20px;text-align:center;border-bottom:1px solid ${BRAND.goldDim};">
              <h1 style="margin:0;font-size:22px;font-weight:700;color:${BRAND.gold};letter-spacing:0.05em;">✦ ${BRAND.logo} ✦</h1>
              <p style="margin:6px 0 0;font-size:12px;color:${BRAND.textDim};letter-spacing:0.1em;text-transform:uppercase;">Government Licensed Recruitment Agency</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;text-align:center;border-top:1px solid ${BRAND.goldDim};background-color:rgba(0,0,0,0.15);">
              <p style="margin:0 0 6px;font-size:12px;color:${BRAND.textDim};">
                📞 ${BRAND.phone} &nbsp;|&nbsp; ✉️ ${BRAND.email}
              </p>
              <p style="margin:0;font-size:11px;color:${BRAND.textDim};">
                <a href="${BRAND.website}" style="color:${BRAND.gold};text-decoration:none;">${BRAND.website}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ── Status display names + next steps ──
const STATUS_INFO = {
    applied:             { label: 'Applied',             icon: '📝', next: 'Our team will screen your profile within 2-3 business days.' },
    screening:           { label: 'Screening',           icon: '🔍', next: 'Our advisors are reviewing your skills and qualifications.' },
    shortlisted:         { label: 'Shortlisted',         icon: '⭐', next: 'Great news! You\'ve been shortlisted. We\'ll contact you to schedule an interview.' },
    interview:           { label: 'Interview Scheduled',  icon: '📅', next: 'Please keep your phone reachable. Our team will contact you with interview details.' },
    selected:            { label: 'Selected',            icon: '🎯', next: 'Congratulations! You\'ve been selected. Documentation process begins next.' },
    documentation:       { label: 'Documentation',       icon: '📄', next: 'Please prepare your passport, photos, certificates, and experience letters.' },
    visa_processing:     { label: 'Visa Processing',     icon: '🛂', next: 'Your visa application is being processed. This typically takes 2-4 weeks.' },
    medical_clearance:   { label: 'Medical Clearance',   icon: '🏥', next: 'Please complete your medical examination at the designated center.' },
    ticket_booked:       { label: 'Ticket Booked',       icon: '✈️', next: 'Your travel is booked! Final briefing will be scheduled shortly.' },
    deployed:            { label: 'Deployed',            icon: '🎉', next: 'You\'re officially deployed! Welcome to your new career abroad.' },
    rejected:            { label: 'Not Selected',        icon: '📋', next: 'Unfortunately, this position has been filled. We\'ll keep your profile for future opportunities.' },
};

// ══════════════════════════════════════════════════════════════
// TEMPLATE 1: Application Confirmed
// ══════════════════════════════════════════════════════════════
function applicationConfirmed({ name, jobTitle, country, trackingId }) {
    const content = `
        <h2 style="margin:0 0 8px;font-size:20px;color:${BRAND.white};">Application Received! ✅</h2>
        <p style="color:${BRAND.textDim};font-size:14px;margin:0 0 24px;">Thank you for applying, ${esc(name)}.</p>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.navy};border:1px solid ${BRAND.goldDim};border-radius:12px;margin-bottom:24px;">
          <tr>
            <td style="padding:20px;text-align:center;">
              <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:${BRAND.textDim};">Your Tracking ID</p>
              <p style="margin:0;font-size:24px;font-weight:700;color:${BRAND.gold};letter-spacing:0.05em;">${esc(trackingId)}</p>
            </td>
          </tr>
        </table>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
          <tr>
            <td style="padding:8px 0;color:${BRAND.textDim};font-size:13px;border-bottom:1px solid rgba(255,255,255,0.05);">
              <strong style="color:${BRAND.textLight};">Position:</strong> ${esc(jobTitle)}
            </td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:${BRAND.textDim};font-size:13px;">
              <strong style="color:${BRAND.textLight};">Country:</strong> ${esc(country)}
            </td>
          </tr>
        </table>

        <p style="color:${BRAND.textDim};font-size:13px;margin:0 0 20px;">Our recruitment team will review your profile and contact you within <strong style="color:${BRAND.textLight};">2-3 business days</strong>.</p>

        <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
          <tr>
            <td style="border-radius:8px;background-color:${BRAND.gold};padding:12px 28px;">
              <a href="${BRAND.website}/tracker" style="color:${BRAND.navy};font-size:14px;font-weight:600;text-decoration:none;">Track Your Application →</a>
            </td>
          </tr>
        </table>
    `;
    return layout(content, `Application received for ${jobTitle}. Tracking ID: ${trackingId}`);
}

// ══════════════════════════════════════════════════════════════
// TEMPLATE 2: Generic Status Update
// ══════════════════════════════════════════════════════════════
function statusUpdate({ name, jobTitle, status, trackingId }) {
    const info = STATUS_INFO[status] || { label: status, icon: '📋', next: 'We\'ll keep you updated on next steps.' };
    const content = `
        <h2 style="margin:0 0 8px;font-size:20px;color:${BRAND.white};">Application Update ${info.icon}</h2>
        <p style="color:${BRAND.textDim};font-size:14px;margin:0 0 24px;">Hello ${esc(name)}, here's an update on your application.</p>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.navy};border:1px solid ${BRAND.goldDim};border-radius:12px;margin-bottom:24px;">
          <tr>
            <td style="padding:20px;text-align:center;">
              <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:${BRAND.textDim};">Current Status</p>
              <p style="margin:0;font-size:22px;font-weight:700;color:${BRAND.gold};">${info.icon} ${info.label}</p>
            </td>
          </tr>
        </table>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
          <tr>
            <td style="padding:8px 0;color:${BRAND.textDim};font-size:13px;border-bottom:1px solid rgba(255,255,255,0.05);">
              <strong style="color:${BRAND.textLight};">Position:</strong> ${esc(jobTitle)}
            </td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:${BRAND.textDim};font-size:13px;">
              <strong style="color:${BRAND.textLight};">Tracking ID:</strong> ${esc(trackingId)}
            </td>
          </tr>
        </table>

        <div style="background-color:rgba(59,130,246,0.08);border-left:3px solid ${BRAND.accent};border-radius:0 8px 8px 0;padding:14px 16px;margin-bottom:24px;">
          <p style="margin:0;color:${BRAND.textLight};font-size:13px;"><strong>What's Next:</strong> ${info.next}</p>
        </div>

        <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
          <tr>
            <td style="border-radius:8px;background-color:${BRAND.gold};padding:12px 28px;">
              <a href="${BRAND.website}/tracker" style="color:${BRAND.navy};font-size:14px;font-weight:600;text-decoration:none;">View Full Status →</a>
            </td>
          </tr>
        </table>
    `;
    return layout(content, `Your application for ${jobTitle} is now: ${info.label}`);
}

// ══════════════════════════════════════════════════════════════
// TEMPLATE 3: Interview Scheduled (special version of status update)
// ══════════════════════════════════════════════════════════════
function interviewScheduled({ name, jobTitle, country, trackingId }) {
    const content = `
        <h2 style="margin:0 0 8px;font-size:20px;color:${BRAND.white};">Interview Scheduled! 📅</h2>
        <p style="color:${BRAND.textDim};font-size:14px;margin:0 0 24px;">Congratulations ${esc(name)}, you've been selected for an interview!</p>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.navy};border:1px solid ${BRAND.goldDim};border-radius:12px;margin-bottom:24px;">
          <tr>
            <td style="padding:20px;text-align:center;">
              <p style="margin:0;font-size:28px;margin-bottom:8px;">📅</p>
              <p style="margin:0;font-size:18px;font-weight:700;color:${BRAND.gold};">Interview Stage</p>
              <p style="margin:6px 0 0;font-size:13px;color:${BRAND.textDim};">${esc(jobTitle)} — ${esc(country)}</p>
            </td>
          </tr>
        </table>

        <div style="background-color:rgba(16,185,129,0.08);border-left:3px solid #10b981;border-radius:0 8px 8px 0;padding:14px 16px;margin-bottom:24px;">
          <p style="margin:0 0 8px;color:${BRAND.textLight};font-size:13px;font-weight:600;">📋 Please prepare:</p>
          <p style="margin:0;color:${BRAND.textDim};font-size:13px;">• Keep your phone reachable at all times<br>• Have your passport and certificates ready<br>• Our team will contact you with date & time details</p>
        </div>

        <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
          <tr>
            <td style="border-radius:8px;background-color:${BRAND.gold};padding:12px 28px;">
              <a href="${BRAND.website}/tracker" style="color:${BRAND.navy};font-size:14px;font-weight:600;text-decoration:none;">Track Progress →</a>
            </td>
          </tr>
        </table>
    `;
    return layout(content, `Interview scheduled for ${jobTitle} in ${country}!`);
}

// ══════════════════════════════════════════════════════════════
// TEMPLATE 4: Deployed — Celebration email
// ══════════════════════════════════════════════════════════════
function deployedCongrats({ name, jobTitle, country, trackingId }) {
    const content = `
        <div style="text-align:center;margin-bottom:24px;">
          <p style="font-size:48px;margin:0;">🎉</p>
          <h2 style="margin:8px 0;font-size:24px;color:${BRAND.gold};">Congratulations, ${esc(name)}!</h2>
          <p style="color:${BRAND.textDim};font-size:15px;margin:0;">You are officially deployed!</p>
        </div>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.navy};border:1px solid ${BRAND.goldDim};border-radius:12px;margin-bottom:24px;">
          <tr>
            <td style="padding:20px;text-align:center;">
              <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:${BRAND.textDim};">Your New Role</p>
              <p style="margin:0;font-size:18px;font-weight:700;color:${BRAND.white};">${esc(jobTitle)}</p>
              <p style="margin:4px 0 0;font-size:14px;color:${BRAND.accent};">📍 ${esc(country)}</p>
            </td>
          </tr>
        </table>

        <div style="background-color:rgba(212,168,83,0.08);border-left:3px solid ${BRAND.gold};border-radius:0 8px 8px 0;padding:14px 16px;margin-bottom:24px;">
          <p style="margin:0;color:${BRAND.textLight};font-size:13px;">
            Your journey with Blue Horizon Overseas has been amazing. We're proud to have been part of your career transformation. 
            If you ever need assistance during your deployment, don't hesitate to reach out.
          </p>
        </div>

        <p style="text-align:center;color:${BRAND.textDim};font-size:13px;margin:0 0 20px;">We wish you incredible success in your new role! 🌟</p>

        <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
          <tr>
            <td style="border-radius:8px;background-color:${BRAND.gold};padding:12px 28px;">
              <a href="${BRAND.website}" style="color:${BRAND.navy};font-size:14px;font-weight:600;text-decoration:none;">Visit Blue Horizon →</a>
            </td>
          </tr>
        </table>
    `;
    return layout(content, `Congratulations ${name}! You're deployed to ${country} as ${jobTitle}!`);
}

// ══════════════════════════════════════════════════════════════
// TEMPLATE 5: Employer Inquiry Acknowledgement
// ══════════════════════════════════════════════════════════════
function employerInquiryAck({ companyName, contactPerson }) {
    const content = `
        <h2 style="margin:0 0 8px;font-size:20px;color:${BRAND.white};">Inquiry Received 🤝</h2>
        <p style="color:${BRAND.textDim};font-size:14px;margin:0 0 24px;">Dear ${esc(contactPerson)},</p>

        <p style="color:${BRAND.textLight};font-size:14px;margin:0 0 16px;">
          Thank you for reaching out to Blue Horizon Overseas on behalf of <strong style="color:${BRAND.gold};">${esc(companyName)}</strong>.
        </p>

        <p style="color:${BRAND.textLight};font-size:14px;margin:0 0 16px;">
          We have received your hiring inquiry and our business development team will review your requirements within <strong>1-2 business days</strong>.
        </p>

        <div style="background-color:rgba(59,130,246,0.08);border-left:3px solid ${BRAND.accent};border-radius:0 8px 8px 0;padding:14px 16px;margin-bottom:24px;">
          <p style="margin:0;color:${BRAND.textLight};font-size:13px;"><strong>What happens next?</strong><br>A dedicated account manager will contact you to discuss your workforce requirements, timelines, and pricing.</p>
        </div>

        <p style="color:${BRAND.textDim};font-size:13px;margin:0;">For urgent requirements, call us directly at <strong style="color:${BRAND.textLight};">${BRAND.phone}</strong></p>
    `;
    return layout(content, `We received your hiring inquiry from ${companyName}`);
}

// ══════════════════════════════════════════════════════════════
// TEMPLATE 6: Talent Pool Acknowledgement
// ══════════════════════════════════════════════════════════════
function talentPoolAck({ name, trade }) {
    const content = `
        <h2 style="margin:0 0 8px;font-size:20px;color:${BRAND.white};">You're in Our Talent Pool! 📋</h2>
        <p style="color:${BRAND.textDim};font-size:14px;margin:0 0 24px;">Hello ${esc(name)},</p>

        <p style="color:${BRAND.textLight};font-size:14px;margin:0 0 16px;">
          Your profile has been added to our talent pool as a <strong style="color:${BRAND.gold};">${esc(trade)}</strong>.
        </p>

        <p style="color:${BRAND.textLight};font-size:14px;margin:0 0 24px;">
          When a matching opportunity opens, our team will contact you immediately. You don't need to do anything else — we'll come to you.
        </p>

        <div style="background-color:rgba(16,185,129,0.08);border-left:3px solid #10b981;border-radius:0 8px 8px 0;padding:14px 16px;margin-bottom:24px;">
          <p style="margin:0;color:${BRAND.textLight};font-size:13px;"><strong>💡 Tip:</strong> Keep your phone reachable and check our <a href="${BRAND.website}/#jobs" style="color:${BRAND.gold};text-decoration:none;">job listings</a> regularly for new openings.</p>
        </div>

        <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
          <tr>
            <td style="border-radius:8px;background-color:${BRAND.gold};padding:12px 28px;">
              <a href="${BRAND.website}/#jobs" style="color:${BRAND.navy};font-size:14px;font-weight:600;text-decoration:none;">Browse Open Jobs →</a>
            </td>
          </tr>
        </table>
    `;
    return layout(content, `Welcome to the Blue Horizon talent pool, ${name}!`);
}

// HTML escape helper
function esc(s) {
    if (typeof s !== 'string') return s;
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

module.exports = {
    applicationConfirmed,
    statusUpdate,
    interviewScheduled,
    deployedCongrats,
    employerInquiryAck,
    talentPoolAck,
};
