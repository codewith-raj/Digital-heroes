let resendClient = null;

async function getResend() {
  if (!resendClient && process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 're_your-resend-api-key') {
    try {
      const { Resend } = require('resend');
      resendClient = new Resend(process.env.RESEND_API_KEY);
    } catch (err) {
      console.warn('Resend not available:', err.message);
    }
  }
  return resendClient;
}

const FROM_EMAIL = 'Digital Heroes Golf <noreply@digitalherosgolf.com>';

async function sendEmail({ to, subject, html }) {
  const resend = await getResend();
  if (!resend) {
    console.log(`📧 [Email Stub] To: ${to} | Subject: ${subject}`);
    return { success: true, stubbed: true };
  }
  try {
    const result = await resend.emails.send({ from: FROM_EMAIL, to, subject, html });
    return { success: true, id: result.id };
  } catch (err) {
    console.error('Email send failed:', err);
    return { success: false, error: err.message };
  }
}

async function sendWinnerNotificationEmail(email, name, matched, prizeAmount) {
  const prize = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(prizeAmount);
  return sendEmail({
    to: email,
    subject: `🎉 You won ${prize} in the Digital Heroes Draw!`,
    html: `<div style="font-family:sans-serif;background:#020617;color:#f1f5f9;padding:40px;border-radius:16px;max-width:600px;margin:0 auto;">
      <h1 style="color:#00d4aa;">🏆 You're a Winner!</h1>
      <p>Hi ${name},</p>
      <p>You matched <strong>${matched} numbers</strong>! Your prize: <strong style="color:#f59e0b;font-size:1.4em;">${prize}</strong></p>
      <p>Log in to upload your score proof within 7 days.</p>
      <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" style="display:inline-block;background:#00d4aa;color:#020617;padding:12px 24px;border-radius:8px;font-weight:bold;text-decoration:none;margin-top:16px;">Upload Proof →</a>
    </div>`,
  });
}

async function sendSubscriptionEmail(email, name, plan) {
  const label = plan === 'yearly' ? '₹4,999/year' : '₹499/month';
  return sendEmail({
    to: email,
    subject: `Welcome to Digital Heroes Golf! Your ${plan} subscription is active`,
    html: `<div style="font-family:sans-serif;background:#020617;color:#f1f5f9;padding:40px;border-radius:16px;max-width:600px;margin:0 auto;">
      <h1 style="color:#00d4aa;">Welcome, ${name}! 🎉</h1>
      <p>Your <strong>${label}</strong> subscription is now active.</p>
      <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" style="display:inline-block;background:#00d4aa;color:#020617;padding:12px 24px;border-radius:8px;font-weight:bold;text-decoration:none;margin-top:16px;">Go to Dashboard →</a>
    </div>`,
  });
}

async function sendWinnerProofEmail(email, name, status, prizeAmount) {
  const prize = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(prizeAmount);
  const isApproved = status === 'approved';
  return sendEmail({
    to: email,
    subject: `Your prize claim has been ${status}`,
    html: `<div style="font-family:sans-serif;background:#020617;color:#f1f5f9;padding:40px;border-radius:16px;max-width:600px;margin:0 auto;">
      <h1 style="color:${isApproved ? '#00d4aa' : '#f87171'};">${isApproved ? '✅ Claim Approved!' : '❌ Claim Rejected'}</h1>
      <p>Hi ${name},</p>
      ${isApproved ? `<p>Your prize of <strong>${prize}</strong> has been approved and payment is being processed.</p>` : '<p>Your proof submission was rejected. Contact support if you believe this is an error.</p>'}
    </div>`,
  });
}

module.exports = { sendEmail, sendWinnerNotificationEmail, sendSubscriptionEmail, sendWinnerProofEmail };
