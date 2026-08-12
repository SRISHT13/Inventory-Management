const axios = require("axios");

const sendOTP = async (email, otp) => {
  if (!process.env.BREVO_API_KEY) {
    console.log(`🔑 [DEV MODE] OTP for ${email}: ${otp}`);
    return true;
  }

  try {
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: process.env.SYSTEM_NAME || "StockPilot",
          email: process.env.SENDER_EMAIL || "srishtiagarwal2114@gmail.com",
        },
        to: [
          {
            email,
          },
        ],
        subject: "StockPilot OTP Verification",
        htmlContent: `
          <h2>StockPilot Account Verification</h2>
          <p>Your OTP is:</p>
          <h1 style="color:#2563eb">${otp}</h1>
          <p>This OTP is valid for 5 minutes.</p>
        `,
      },
      {
        headers: {
          accept: "application/json",
          "api-key": process.env.BREVO_API_KEY,
          "content-type": "application/json",
        },
      }
    );

    console.log("OTP Email Sent");
    return true;
  } catch (err) {
    console.error("Brevo Email Error:", err.response?.data || err.message);
    console.log(`🔑 [FALLBACK] OTP for ${email}: ${otp}`);
    return true;
  }
};

module.exports = sendOTP;