import { useEffect, useState } from "react";
import API from "../services/api";
import { getSettings } from "../services/settingsApi";
import Sidebar from "../components/Sidebar";
import { generateAIInsights } from "../services/aiApi";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import ReactMarkdown from "react-markdown";
import { FiTrendingUp, FiZap, FiActivity, FiDollarSign, FiShield } from "react-icons/fi";
import "./Analytics.css";

function Analytics() {
  const [products, setProducts] = useState([]);
  const [aiSummary, setAiSummary] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [settings, setSettings] = useState({ currencySymbol: "₹", lowStockThreshold: 10 });
  const [aiQueries, setAiQueries] = useState(1);

  useEffect(() => {
    fetchProducts();
    getSettings().then((s) => {
      if (s) setSettings(s);
    });
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await API.get("/products");
      setProducts(res.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const inventoryValue = products.reduce(
    (sum, p) => sum + Number(p.quantity || 0) * Number(p.price || 0),
    0
  );

  const lowStockProducts = products.filter(
    (p) => Number(p.quantity) <= (settings.lowStockThreshold || 10)
  );

  const warehouseHealth = products.length
    ? Math.round(((products.length - lowStockProducts.length) / products.length) * 100)
    : 100;

  const inventoryStatus = [
    { name: "Healthy Stock", value: products.filter((p) => Number(p.quantity) >= 25).length },
    { name: "Medium Stock", value: products.filter((p) => Number(p.quantity) >= 11 && Number(p.quantity) < 25).length },
    { name: "Low Stock Alert", value: lowStockProducts.length },
  ];

  const PIE_COLORS = ["#10B981", "#06B6D4", "#EF4444"];

  const shelfMap = {};
  products.forEach((p) => {
    const shelf = p.shelf || "Unknown";
    shelfMap[shelf] = (shelfMap[shelf] || 0) + Number(p.quantity || 0);
  });

  const shelfData = Object.keys(shelfMap).map((shelf) => ({
    shelf,
    quantity: shelfMap[shelf],
  }));

  const handleAIInsights = async () => {
    setLoadingAI(true);
    const summary = await generateAIInsights();
    setAiSummary(summary);
    setAiQueries((prev) => prev + 1);
    setLoadingAI(false);
  };

  const topInventoryValue = [...products]
    .map((p) => ({
      name: p.name,
      value: Number(p.price || 0) * Number(p.quantity || 0),
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  return (
    <div className="app-container">
      <Sidebar />

      <main className="main-content analytics-main">
        <header className="page-header">
          <div>
            <h1>Warehouse Analytics</h1>
            <p className="page-subtitle">Real-time charts, asset valuation, and stock health forecasting</p>
          </div>
        </header>

        {/* METRICS */}
        <div className="analytics-cards-grid">
          <div className="glass-panel metric-box border-emerald">
            <span className="metric-label">Warehouse Health Score</span>
            <h2 className="metric-value text-emerald">{warehouseHealth}%</h2>
            <span className="metric-sub">{products.length - lowStockProducts.length} of {products.length} SKUs Healthy</span>
          </div>

          <div className="glass-panel metric-box border-indigo">
            <span className="metric-label">Total Asset Value</span>
            <h2 className="metric-value">{settings.currencySymbol}{inventoryValue.toLocaleString()}</h2>
            <span className="metric-sub">Capital tied in inventory</span>
          </div>

          <div className="glass-panel metric-box border-cyan">
            <span className="metric-label">Estimated Time Saved</span>
            <h2 className="metric-value">{products.length * 3} mins</h2>
            <span className="metric-sub">Via QR & shelf location</span>
          </div>

          <div className="glass-panel metric-box border-amber">
            <span className="metric-label">AI Insights Generated</span>
            <h2 className="metric-value">{aiQueries} Reports</h2>
            <span className="metric-sub">Autonomous AI checks</span>
          </div>
        </div>

        {/* AI REPORT CARD */}
        <div className="glass-panel ai-analytics-box">
          <div className="panel-header">
            <div className="panel-title">
              <FiZap className="text-cyan" />
              <h3>Autonomous Warehouse AI Report</h3>
            </div>
            <button className="btn-primary btn-sm" onClick={handleAIInsights} disabled={loadingAI}>
              {loadingAI ? "Analyzing Inventory..." : "Generate Fresh AI Insights"}
            </button>
          </div>

          <div className="ai-report-container">
            {loadingAI ? (
              <p className="loading-text">Analyzing database records and shelf distributions...</p>
            ) : aiSummary ? (
              <div className="markdown-render">
                <ReactMarkdown>{aiSummary}</ReactMarkdown>
              </div>
            ) : (
              <div className="ai-placeholder-banner">
                <p>💡 Click <strong>Generate Fresh AI Insights</strong> to trigger live LLM warehouse analysis & purchasing suggestions.</p>
              </div>
            )}
          </div>
        </div>

        {/* CHARTS GRID */}
        <div className="charts-grid-two">
          <div className="glass-panel chart-box">
            <h3>Stock Quantity Distribution by Shelf</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={shelfData}>
                <XAxis dataKey="shelf" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ background: "#111827", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }} />
                <Bar dataKey="quantity" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-panel chart-box">
            <h3>Inventory Stock Status breakdown</h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={inventoryStatus} dataKey="value" nameKey="name" outerRadius={85} label>
                  {inventoryStatus.map((entry, index) => (
                    <Cell key={index} fill={PIE_COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#111827", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel chart-box">
          <h3>Top 5 Highest Value Inventory Items</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={topInventoryValue}>
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ background: "#111827", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }} />
              <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </main>
    </div>
  );
}

export default Analytics;