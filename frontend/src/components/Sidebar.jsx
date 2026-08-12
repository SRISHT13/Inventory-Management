import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FiGrid,
  FiPackage,
  FiMap,
  FiBarChart2,
  FiSettings,
  FiClock,
  FiLogOut,
  FiShield
} from "react-icons/fi";
import { getSettings } from "../services/settingsApi";
import "./Sidebar.css";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [companyName, setCompanyName] = useState("StockPilot Warehouse");
  const user = JSON.parse(localStorage.getItem("user")) || { name: "Operator", role: "admin" };

  useEffect(() => {
    getSettings().then((data) => {
      if (data && data.companyName) {
        setCompanyName(data.companyName);
      }
    });
  }, []);

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("name");
    localStorage.removeItem("role");
    navigate("/");
  };

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: <FiGrid /> },
    { path: "/inventory", label: "Inventory", icon: <FiPackage /> },
    { path: "/warehouse-map", label: "Warehouse Map", icon: <FiMap /> },
    { path: "/analytics", label: "Analytics", icon: <FiBarChart2 /> },
    { path: "/activity", label: "Activity Log", icon: <FiClock /> },
    { path: "/settings", label: "Settings", icon: <FiSettings /> },
  ];

  return (
    <aside className="app-sidebar">
      {/* BRANDING HEADER */}
      <div className="sidebar-brand">
        <div className="brand-icon">
          <FiShield className="brand-logo-svg" />
        </div>
        <div className="brand-text">
          <h2>StockPilot</h2>
          <span className="brand-sub">{companyName}</span>
        </div>
      </div>

      {/* NAVIGATION LINKS */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <div
              key={item.path}
              className={`nav-item ${isActive ? "active" : ""}`}
              onClick={() => navigate(item.path)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {isActive && <div className="active-pill" />}
            </div>
          );
        })}
      </nav>

      {/* USER PROFILE & LOGOUT */}
      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="user-meta">
            <span className="user-name">{user?.name || "Operator"}</span>
            <span className="user-role-badge">{user?.role || "Worker"}</span>
          </div>
        </div>

        <button className="sidebar-logout-btn" onClick={logout} title="Sign Out">
          <FiLogOut />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;