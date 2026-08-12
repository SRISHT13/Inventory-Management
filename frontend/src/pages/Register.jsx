import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { getSettings } from "../services/settingsApi";
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiShield, FiArrowRight, FiCheckCircle } from "react-icons/fi";
import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("srishtiagarwal2114@gmail.com");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("admin");

  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [companyName, setCompanyName] = useState("StockPilot Smart Warehouse");

  useEffect(() => {
    getSettings().then((data) => {
      if (data && data.companyName) setCompanyName(data.companyName);
    });
  }, []);

  // SEND OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await API.post("/auth/send-otp", {
        name,
        email,
        password,
        role,
      });

      if (res.data.devOtp) {
        alert(`🔑 Dev Mode: Your OTP for ${email} is: ${res.data.devOtp}`);
      } else {
        alert("OTP sent to your email inbox!");
      }
      setShowOtp(true);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // VERIFY OTP
  const handleVerifyOtp = async () => {
    try {
      setLoading(true);
      await API.post("/auth/verify-otp", { email, otp });
      alert("Account Created Successfully! You can now log in.");
      navigate("/");
    } catch (error) {
      alert(error.response?.data?.message || "OTP Verification Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-wrapper">
      <div className="register-glass-card">
        {/* LEFT DECORATIVE HERO */}
        <div className="register-hero">
          <div className="hero-brand">
            <div className="hero-logo-box">
              <FiShield className="hero-icon" />
            </div>
            <div>
              <h2 className="hero-title">StockPilot</h2>
              <p className="hero-subtitle">{companyName}</p>
            </div>
          </div>

          <div className="hero-body">
            <h3>Start Managing Warehouse Stock Intelligently</h3>
            <p>
              Join your logistics team to monitor product levels, search rack locations, scan QR codes, and automate workflow insights.
            </p>

            <ul className="feature-bullets">
              <li><FiCheckCircle className="check-icon" /> Real-time SKU & Stock Tracking</li>
              <li><FiCheckCircle className="check-icon" /> Interactive Rack Mapping</li>
              <li><FiCheckCircle className="check-icon" /> QR Code Generation</li>
              <li><FiCheckCircle className="check-icon" /> Automated Low Stock Alerts</li>
            </ul>
          </div>
        </div>

        {/* RIGHT FORM */}
        <div className="register-form-area">
          <div className="form-header">
            <h1>Create Account</h1>
            <p>Set up your login credentials for warehouse access</p>
          </div>

          <form onSubmit={handleSendOtp} className="auth-form">
            <div className="input-group">
              <label>Full Name</label>
              <div className="input-field-wrapper">
                <FiUser className="input-icon" />
                <input
                  type="text"
                  placeholder="Srishti Agarwal"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={showOtp}
                />
              </div>
            </div>

            <div className="input-group">
              <label>Email Address</label>
              <div className="input-field-wrapper">
                <FiMail className="input-icon" />
                <input
                  type="email"
                  placeholder="srishtiagarwal2114@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={showOtp}
                />
              </div>
            </div>

            <div className="input-group">
              <label>Password</label>
              <div className="input-field-wrapper">
                <FiLock className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={showOtp}
                />
                <button
                  type="button"
                  className="toggle-eye"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <div className="input-group">
              <label>Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={showOtp}
                className="select-field"
              >
                <option value="admin">Admin / Manager</option>
                <option value="worker">Warehouse Worker</option>
              </select>
            </div>

            {!showOtp ? (
              <button type="submit" className="auth-btn-primary" disabled={loading}>
                {loading ? "Generating OTP..." : "Send OTP"}
                <FiArrowRight />
              </button>
            ) : (
              <div className="otp-step">
                <div className="input-group">
                  <label>Enter 6-Digit OTP</label>
                  <input
                    type="text"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    className="otp-input"
                  />
                </div>

                <button
                  type="button"
                  className="auth-btn-primary mt-2"
                  onClick={handleVerifyOtp}
                  disabled={loading}
                >
                  {loading ? "Verifying..." : "Verify OTP & Create Account"}
                </button>
              </div>
            )}
          </form>

          <div className="auth-footer-link">
            Already registered?{" "}
            <span onClick={() => navigate("/")}>
              Sign In
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;