import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { getSettings } from "../services/settingsApi";
import { FiMail, FiLock, FiEye, FiEyeOff, FiShield, FiArrowRight } from "react-icons/fi";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [warehouseInfo, setWarehouseInfo] = useState({
    companyName: "StockPilot Smart Warehouse",
    warehouseAddress: "Central Logistics Hub, Zone A",
  });

  useEffect(() => {
    getSettings().then((data) => {
      if (data) {
        setWarehouseInfo({
          companyName: data.companyName || "StockPilot Smart Warehouse",
          warehouseAddress: data.warehouseAddress || "Central Logistics Hub, Zone A",
        });
      }
    });
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await API.post("/auth/login", { email, password });
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("role", res.data.user.role);
      localStorage.setItem("name", res.data.user.name);

      navigate("/dashboard");
    } catch (error) {
      alert(error.response?.data?.message || "Login Failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-glass-card">
        {/* LEFT DECORATIVE HERO */}
        <div className="login-hero">
          <div className="hero-brand">
            <div className="hero-logo-box">
              <FiShield className="hero-icon" />
            </div>
            <div>
              <h2 className="hero-title">StockPilot</h2>
              <p className="hero-subtitle">{warehouseInfo.companyName}</p>
            </div>
          </div>

          <div className="hero-body">
            <h3>Intelligent Warehouse & Inventory Locator</h3>
            <p>
              Next-generation inventory tracking, rack mapping, QR generation, and real-time stock analytics.
            </p>
          </div>

          <div className="hero-address-card">
            <span className="address-label">📍 Operational Location:</span>
            <p className="address-val">{warehouseInfo.warehouseAddress}</p>
          </div>
        </div>

        {/* RIGHT FORM */}
        <div className="login-form-area">
          <div className="form-header">
            <h1>Welcome Back</h1>
            <p>Sign in to access your warehouse dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="auth-form">
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

            <div className="form-options">
              <span className="forgot-link" onClick={() => navigate("/forgot-password")}>
                Forgot password?
              </span>
            </div>

            <button type="submit" className="auth-btn-primary" disabled={loading}>
              {loading ? "Authenticating..." : "Sign In to Dashboard"}
              <FiArrowRight />
            </button>
          </form>

          <div className="auth-footer-link">
            Need an account?{" "}
            <span onClick={() => navigate("/register")}>
              Create Account
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;