import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { getSettings, updateSettings } from "../services/settingsApi";
import { FiSave, FiUser, FiMapPin, FiMail, FiPhone, FiDollarSign, FiAlertCircle } from "react-icons/fi";
import "./Settings.css";

function Settings() {
  const user = JSON.parse(localStorage.getItem("user")) || { name: "Operator", email: "srishtiagarwal2114@gmail.com", role: "admin" };
  const [formData, setFormData] = useState({
    companyName: "StockPilot Smart Warehouse",
    warehouseAddress: "Central Logistics Hub, Zone A, Suite 101",
    contactEmail: "srishtiagarwal2114@gmail.com",
    contactPhone: "+91 98765 43210",
    currencySymbol: "₹",
    lowStockThreshold: 10,
  });

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    getSettings().then((data) => {
      if (data) {
        setFormData({
          companyName: data.companyName || "StockPilot Smart Warehouse",
          warehouseAddress: data.warehouseAddress || "Central Logistics Hub, Zone A, Suite 101",
          contactEmail: data.contactEmail || "srishtiagarwal2114@gmail.com",
          contactPhone: data.contactPhone || "+91 98765 43210",
          currencySymbol: data.currencySymbol || "₹",
          lowStockThreshold: data.lowStockThreshold || 10,
        });
      }
    });
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateSettings(formData);
      setMsg("✅ Warehouse & System settings updated successfully!");
      setTimeout(() => setMsg(""), 4000);
    } catch (err) {
      setMsg("❌ Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="app-container">
      <Sidebar />

      <main className="main-content settings-main">
        <header className="page-header">
          <div>
            <h1>System & Warehouse Settings</h1>
            <p className="page-subtitle">Configure your company name, warehouse location address, and stock parameters</p>
          </div>
        </header>

        {msg && <div className="toast-msg">{msg}</div>}

        <div className="settings-grid">
          {/* USER PROFILE CARD */}
          <div className="glass-panel profile-card">
            <div className="profile-header">
              <div className="avatar-lg">{user?.name?.charAt(0).toUpperCase()}</div>
              <div>
                <h2>{user?.name}</h2>
                <p>{user?.email}</p>
                <span className="badge badge-success">{user?.role?.toUpperCase()}</span>
              </div>
            </div>

            <div className="user-details-list">
              <div className="detail-item">
                <FiUser className="item-icon" />
                <div>
                  <span className="detail-label">Account Name</span>
                  <p>{user?.name}</p>
                </div>
              </div>
              <div className="detail-item">
                <FiMail className="item-icon" />
                <div>
                  <span className="detail-label">Primary Email</span>
                  <p>{user?.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* WAREHOUSE CONFIG FORM */}
          <div className="glass-panel config-card">
            <form onSubmit={handleSubmit} className="settings-form">
              <h3>Warehouse & System Profile</h3>

              <div className="input-group">
                <label>Company / Organization Name</label>
                <div className="input-field-wrapper">
                  <FiUser className="input-icon" />
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Warehouse Address</label>
                <div className="input-field-wrapper">
                  <FiMapPin className="input-icon" />
                  <input
                    type="text"
                    name="warehouseAddress"
                    value={formData.warehouseAddress}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="input-group">
                  <label>Contact Email</label>
                  <div className="input-field-wrapper">
                    <FiMail className="input-icon" />
                    <input
                      type="email"
                      name="contactEmail"
                      value={formData.contactEmail}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Contact Phone</label>
                  <div className="input-field-wrapper">
                    <FiPhone className="input-icon" />
                    <input
                      type="text"
                      name="contactPhone"
                      value={formData.contactPhone}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="form-row-2">
                <div className="input-group">
                  <label>Currency Symbol</label>
                  <div className="input-field-wrapper">
                    <FiDollarSign className="input-icon" />
                    <input
                      type="text"
                      name="currencySymbol"
                      value={formData.currencySymbol}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Low Stock Alert Limit (Units)</label>
                  <div className="input-field-wrapper">
                    <FiAlertCircle className="input-icon" />
                    <input
                      type="number"
                      name="lowStockThreshold"
                      value={formData.lowStockThreshold}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <button type="submit" className="btn-primary mt-3" disabled={saving}>
                <FiSave /> {saving ? "Saving Settings..." : "Save Settings"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Settings;
