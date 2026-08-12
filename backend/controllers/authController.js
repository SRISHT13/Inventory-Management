const User = require("../models/User");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const sendOTP = require("../utils/sendEmail");
const pendingUsers = require("../tempOtpStore");

// ====================
// SEND OTP
// ====================
const sendOtp = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
    } = req.body;

    const existingUser =
      await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message:
          "Email already registered",
      });
    }

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    pendingUsers[email] = {
      name,
      email,
      password,
      role,
      otp,
      expiresAt:
        Date.now() + 5 * 60 * 1000,
    };

    await sendOTP(email, otp);

    res.status(200).json({
      message: "OTP sent successfully",
      devOtp: process.env.BREVO_API_KEY ? undefined : otp,
    });
  } catch (error) {
  console.error(error);

  res.status(500).json({
    message: "Failed to send OTP",
  });
}
};

// ====================
// VERIFY OTP & CREATE ACCOUNT
// ====================
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const userData = pendingUsers[email];

    if (!userData) {
      return res.status(400).json({
        message: "OTP expired or not found",
      });
    }

    if (userData.otp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    if (userData.expiresAt < Date.now()) {
      delete pendingUsers[email];

      return res.status(400).json({
        message: "OTP expired",
      });
    }

    const hashedPassword = await bcrypt.hash(
      userData.password,
      10
    );

    const newUser = await User.create({
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
      role: userData.role || "worker",
    });

    delete pendingUsers[email];

    res.status(201).json({
      message: "Account created successfully",
      user: newUser,
    });

  } catch (error) {
    console.error("VERIFY OTP ERROR:");
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// ====================
// REGISTER (OPTIONAL)
// ====================
// Not used when OTP registration is enabled
const registerUser = async (
  req,
  res
) => {
  try {
    const {
      name,
      email,
      password,
      role,
    } = req.body;

    const existingUser =
      await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message:
          "User already exists",
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const user =
      await User.create({
        name,
        email,
        password:
          hashedPassword,
        role:
          role || "worker",
      });

    res.status(201).json({
      message:
        "User Registered",
      user,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json(error);
  }
};

// ====================
// LOGIN
// ====================
const loginUser = async (req, res) => {
  try {
    console.log("LOGIN REQUEST BODY:", req.body);

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    console.log("USER FOUND:", user);

    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    console.log("PASSWORD MATCH:", isMatch);

    if (!isMatch) {
      return res.status(400).json({
        message: "Wrong password",
      });
    }

    if (!user.currentStreak)
      user.currentStreak = 1;

    if (!user.longestStreak)
      user.longestStreak = 1;

    if (!user.lastLoginDate)
      user.lastLoginDate =
        new Date();

    const today = new Date();

    const lastLogin =
      new Date(
        user.lastLoginDate
      );

    const todayDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    const lastLoginDate =
      new Date(
        lastLogin.getFullYear(),
        lastLogin.getMonth(),
        lastLogin.getDate()
      );

    const diffDays =
      Math.floor(
        (todayDate -
          lastLoginDate) /
          (1000 *
            60 *
            60 *
            24)
      );

    if (diffDays === 1) {
      user.currentStreak += 1;
    } else if (diffDays > 1) {
      user.currentStreak = 1;
    }

    if (
      user.currentStreak >
      user.longestStreak
    ) {
      user.longestStreak =
        user.currentStreak;
    }

    user.lastLoginDate =
      new Date();

    await user.save();

    res.status(200).json({
      message:
        "Login Successful",

      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        currentStreak:
          user.currentStreak,
        longestStreak:
          user.longestStreak,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json(error);
  }
};


const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "Email not registered",
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // Save OTP
    user.resetOtp = otp;
    user.resetOtpExpiry = Date.now() + 5 * 60 * 1000;

    await user.save();

    // Reuse your existing email utility
    await sendOTP(email, otp);

    res.status(200).json({
      message: "OTP sent successfully",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

const verifyResetOtp = async (req, res) => {
  try {

    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.resetOtp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    if (user.resetOtpExpiry < Date.now()) {
      return res.status(400).json({
        message: "OTP Expired",
      });
    }

    res.status(200).json({
      message: "OTP Verified",
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });

  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;

    // Clear OTP after successful reset
    user.resetOtp = null;
    user.resetOtpExpiry = null;

    await user.save();

    res.status(200).json({
      message: "Password reset successfully",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

module.exports = {
  sendOtp,
  verifyOtp,
  registerUser,
  loginUser,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
};