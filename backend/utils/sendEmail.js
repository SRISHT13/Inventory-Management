// utils/sendEmail.js
//
// Sends the OTP email using Brevo's transactional email API
// (matches the BREVO_API_KEY variable already present in your .env
// and the @getbrevo/brevo package already in package.json).
//
// IMPORTANT: This file assumes `require("dotenv").config()` has already
// run in server.js BEFORE any controller/util that reads process.env is
// required. server.js already does this correctly (dotenv.config() is
// called before the route files are required), so no change is needed
// there — just make sure you don't reorder those lines.

const brevo = require("@getbrevo/brevo");

const sendOTP = async (toEmail, otp) => {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.SENDER_EMAIL;
  const systemName = process.env.SYSTEM_NAME || "StockPilot Warehouse";

  if (!apiKey) {
    // Should never actually be reached, since authController now skips
    // calling this function when BREVO_API_KEY is unset — but kept as a
    // safety net in case sendOTP() is called from somewhere else later.
    throw new Error(
      "BREVO_API_KEY is not set in .env — cannot send email."
    );
  }

  if (!senderEmail) {
    throw new Error(
      "SENDER_EMAIL is not set in .env — Brevo requires a verified sender address."
    );
  }

  const apiInstance = new brevo.TransactionalEmailsApi();
  apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, apiKey);

  const sendSmtpEmail = new brevo.SendSmtpEmail();

  sendSmtpEmail.subject = `${systemName} - Your OTP Code`;
  sendSmtpEmail.htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
      <h2>${systemName}</h2>
      <p>Your one-time password (OTP) is:</p>
      <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">${otp}</p>
      <p>This code expires in 5 minutes. If you didn't request this, you can ignore this email.</p>
    </div>
  `;
  sendSmtpEmail.sender = { name: systemName, email: senderEmail };
  sendSmtpEmail.to = [{ email: toEmail }];

  // Let errors bubble up to the caller (authController) — it already
  // logs the full error and returns a proper response. Do NOT swallow
  // errors here, or the caller loses the real failure reason.
  const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
  return result;
};

module.exports = sendOTP;