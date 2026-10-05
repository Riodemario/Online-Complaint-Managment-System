// Notification Service (Section 4.2, 4.4.2, 4.4.3)
// Sends SMS via Africa's Talking and email via Nodemailer whenever a
// complaint is submitted or its status changes. Both are optional —
// if credentials aren't set in .env, notifications are skipped silently
// instead of crashing the server.
const nodemailer = require('nodemailer');
require('dotenv').config();

let sms = null;
if (process.env.AT_USERNAME && process.env.AT_API_KEY) {
  const AfricasTalking = require('africastalking')({
    apiKey: process.env.AT_API_KEY,
    username: process.env.AT_USERNAME,
  });
  sms = AfricasTalking.SMS;
}

const mailer = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

async function sendSMS(to, message) {
  if (!sms) {
    console.log(`[SMS skipped - no Africa's Talking credentials] to ${to}: ${message}`);
    return;
  }
  try {
    await sms.send({
      to: [to],
      message,
      from: process.env.AT_SENDER_ID || undefined,
    });
  } catch (err) {
    console.error('SMS send failed:', err.message);
  }
}

async function sendEmail(to, subject, text) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.log(`[Email skipped - no SMTP credentials] to ${to}: ${subject}`);
    return;
  }
  try {
    await mailer.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      text,
    });
  } catch (err) {
    console.error('Email send failed:', err.message);
  }
}

// Convenience helpers used by the controllers -------------------------------

async function notifyComplaintSubmitted(citizen, complaint) {
  const msg = `Your complaint ${complaint.reference_no} has been received and is now Pending. We will keep you updated.`;
  await Promise.all([
    sendSMS(citizen.phone_number, msg),
    sendEmail(citizen.email, `Complaint ${complaint.reference_no} received`, msg),
  ]);
}

async function notifyStatusChange(citizen, complaint) {
  const msg = `Update on complaint ${complaint.reference_no}: status changed to "${complaint.status}".`;
  await Promise.all([
    sendSMS(citizen.phone_number, msg),
    sendEmail(citizen.email, `Complaint ${complaint.reference_no} update`, msg),
  ]);
}

module.exports = { sendSMS, sendEmail, notifyComplaintSubmitted, notifyStatusChange };