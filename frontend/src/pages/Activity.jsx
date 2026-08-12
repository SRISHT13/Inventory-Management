import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { getActivities } from "../services/activityApi";
import { FiClock, FiActivity, FiUser, FiPackage, FiLayers } from "react-icons/fi";
import "./Activity.css";

function Activity() {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    const data = await getActivities();
    setActivities(data || []);
  };

  const getActionBadge = (action) => {
    if (action?.includes("Added")) return <span className="badge badge-success">{action}</span>;
    if (action?.includes("Deleted")) return <span className="badge badge-danger">{action}</span>;
    if (action?.includes("Updated")) return <span className="badge badge-warning">{action}</span>;
    return <span className="badge badge-warning">{action || "Activity"}</span>;
  };

  return (
    <div className="app-container">
      <Sidebar />

      <main className="main-content activity-main">
        <header className="page-header">
          <div>
            <h1>System Activity Log</h1>
            <p className="page-subtitle">Real-time audit log of inventory updates, logins, and rack changes</p>
          </div>
        </header>

        <div className="glass-panel table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>TIMESTAMP</th>
                <th>OPERATOR</th>
                <th>ROLE</th>
                <th>ACTION</th>
                <th>PRODUCT</th>
                <th>DETAILS</th>
              </tr>
            </thead>
            <tbody>
              {activities.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">No recent activity recorded yet.</td>
                </tr>
              ) : (
                activities.map((act) => (
                  <tr key={act._id}>
                    <td className="code-font">
                      {new Date(act.createdAt).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td>
                      <span className="user-name-cell">
                        <FiUser className="user-icon" /> {act.user || "System"}
                      </span>
                    </td>
                    <td><span className="role-tag">{act.role || "Worker"}</span></td>
                    <td>{getActionBadge(act.action)}</td>
                    <td><strong className="product-name-cell">{act.productName || "-"}</strong></td>
                    <td className="details-cell">{act.details || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default Activity;