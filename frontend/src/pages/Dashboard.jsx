import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { getSettings } from "../services/settingsApi";
import Sidebar from "../components/Sidebar";
import FloatingAssistant from "../components/FloatingAssistant";
import {
  FiPackage,
  FiAlertTriangle,
  FiDollarSign,
  FiActivity,
  FiZap,
  FiPlus,
  FiLayers,
  FiArrowRight,
  FiShield
} from "react-icons/fi";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [products, setProducts] = useState([]);
  const [settings, setSettings] = useState({
    companyName: "StockPilot Smart Warehouse",
    currencySymbol: "₹",
    lowStockThreshold: 10,
  });
  const [aiInsight, setAiInsight] = useState("");
  const [showAllLowStock, setShowAllLowStock] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("user")) {
      navigate("/");
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [prodRes, setRes] = await Promise.all([
        API.get("/products"),
        getSettings(),
      ]);
      setProducts(prodRes.data || []);
      if (setRes) setSettings(setRes);

      // Fetch AI Insights preview
      try {
        const aiRes = await API.post("/ai/insights");
        setAiInsight(aiRes.data.summary || "");
      } catch (err) {
        console.error("AI Insight error:", err);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const totalQuantity = products.reduce((sum, p) => sum + Number(p.quantity || 0), 0);
  const lowStockProducts = products
    .filter((p) => Number(p.quantity) <= (settings.lowStockThreshold || 10))
    .sort((a, b) => Number(a.quantity) - Number(b.quantity));

  const inventoryValue = products.reduce(
    (sum, p) => sum + Number(p.quantity || 0) * Number(p.price || 0),
    0
  );

  const firstName = user?.name?.split(" ")[0] || "Operator";
  const hour = new Date().getHours();
  let greeting = "Good Morning";
  if (hour >= 12 && hour < 17) greeting = "Good Afternoon";
  else if (hour >= 17 && hour < 22) greeting = "Good Evening";
  else if (hour >= 22 || hour < 5) greeting = "Good Night";

  return (
    <div className="app-container">
      <Sidebar />

      <main className="main-content dashboard-main">
        {/* DASHBOARD HEADER */}
        <header className="dash-header">
          <div className="dash-title-block">
            <span className="dash-greeting-badge">
              <FiShield /> {settings.companyName}
            </span>
            <h1>{greeting}, {firstName} 👋</h1>
            <p className="dash-subtitle">
              Real-time overview of warehouse stock, shelf allocations, and inventory metrics.
            </p>
          </div>

          <div className="dash-action-buttons">
            <button className="btn-primary" onClick={() => navigate("/inventory")}>
              <FiPlus /> Add New Product
            </button>
            <button className="btn-secondary" onClick={() => navigate("/warehouse-map")}>
              <FiLayers /> View Rack Map
            </button>
          </div>
        </header>

        {/* METRICS GRID */}
        <div className="dash-stats-grid">
          <div className="stat-card card-indigo">
            <div className="stat-icon-wrapper">
              <FiPackage />
            </div>
            <div className="stat-info">
              <span className="stat-label">Total SKUs</span>
              <h2 className="stat-value">{products.length}</h2>
              <span className="stat-sub">Active catalogue items</span>
            </div>
          </div>

          <div className="stat-card card-cyan">
            <div className="stat-icon-wrapper">
              <FiLayers />
            </div>
            <div className="stat-info">
              <span className="stat-label">Stock Units</span>
              <h2 className="stat-value">{totalQuantity.toLocaleString()}</h2>
              <span className="stat-sub">Total physical units</span>
            </div>
          </div>

          <div className="stat-card card-emerald">
            <div className="stat-icon-wrapper">
              <FiDollarSign />
            </div>
            <div className="stat-info">
              <span className="stat-label">Valuation</span>
              <h2 className="stat-value">{settings.currencySymbol || "₹"}{inventoryValue.toLocaleString()}</h2>
              <span className="stat-sub">Total asset value</span>
            </div>
          </div>

          <div className="stat-card card-amber">
            <div className="stat-icon-wrapper">
              <FiAlertTriangle />
            </div>
            <div className="stat-info">
              <span className="stat-label">Low Stock Alerts</span>
              <h2 className="stat-value">{lowStockProducts.length}</h2>
              <span className="stat-sub">Below threshold ({settings.lowStockThreshold} units)</span>
            </div>
          </div>
        </div>

        {/* DASHBOARD PANELS */}
        <div className="dash-grid-two">
          {/* LOW STOCK ALERTS PANEL */}
          <div className="glass-panel">
            <div className="panel-header">
              <div className="panel-title">
                <FiAlertTriangle className="text-warning" />
                <h3>Low Stock Warning Items</h3>
              </div>
              <span className="badge badge-warning">{lowStockProducts.length} Needs Action</span>
            </div>

            {lowStockProducts.length === 0 ? (
              <div className="empty-state">
                <p>🎉 All inventory levels are healthy!</p>
              </div>
            ) : (
              <div className="alert-list">
                {(showAllLowStock ? lowStockProducts : lowStockProducts.slice(0, 5)).map((item) => (
                  <div key={item._id} className="alert-row">
                    <div className="alert-item-meta">
                      <span className="alert-item-name">{item.name}</span>
                      <span className="alert-item-shelf">Shelf: {item.shelf || "N/A"}</span>
                    </div>
                    <div className="alert-item-qty">
                      <span className="badge badge-danger">{item.quantity} Left</span>
                    </div>
                  </div>
                ))}

                {lowStockProducts.length > 5 && (
                  <button
                    className="toggle-more-btn"
                    onClick={() => setShowAllLowStock(!showAllLowStock)}
                  >
                    {showAllLowStock ? "Show Top 5" : `View All ${lowStockProducts.length} Items`}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* AI WAREHOUSE ASSISTANT INSIGHT */}
          <div className="glass-panel ai-panel">
            <div className="panel-header">
              <div className="panel-title">
                <FiZap className="text-cyan" />
                <h3>AI Stock Assistant Report</h3>
              </div>
              <button className="btn-sm-ghost" onClick={() => navigate("/analytics")}>
                Analytics <FiArrowRight />
              </button>
            </div>

            <div className="ai-report-body">
              {aiInsight ? (
                <div className="ai-text-content">
                  {aiInsight.split("\n").slice(0, 8).map((line, idx) => (
                    <p key={idx}>{line}</p>
                  ))}
                </div>
              ) : (
                <p className="loading-text">Generating automated warehouse health report...</p>
              )}
            </div>
          </div>
        </div>
      </main>

      <FloatingAssistant />
    </div>
  );
}

export default Dashboard;