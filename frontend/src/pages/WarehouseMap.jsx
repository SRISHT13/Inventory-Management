import { useEffect, useState } from "react";
import API from "../services/api";
import Sidebar from "../components/Sidebar";
import { FiSearch, FiMapPin, FiPackage, FiInfo, FiX } from "react-icons/fi";
import "./WarehouseMap.css";

function WarehouseMap() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedShelf, setSelectedShelf] = useState("");
  const [shelfDetail, setShelfDetail] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await API.get("/products");
      setProducts(res.data || []);
    } catch (error) {
      console.error("Fetch products error:", error);
    }
  };

  const findShelf = () => {
    if (!searchTerm.trim()) return;
    const product = products.find(
      (p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.productId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (product) {
      setSelectedShelf(product.shelf);
      setShelfDetail(product);
    } else {
      alert("Product not found in current inventory.");
      setSelectedShelf("");
      setShelfDetail(null);
    }
  };

  const sections = ["A", "B", "C", "D"];

  const getShelfProduct = (shelfCode) => {
    return products.find((product) => product.shelf === shelfCode);
  };

  const getShelfClass = (product) => {
    if (!product) return "shelf-empty";
    if (product.quantity <= 10) return "shelf-low";
    if (product.quantity < 25) return "shelf-medium";
    return "shelf-good";
  };

  const handleShelfClick = (shelfCode, product) => {
    setSelectedShelf(shelfCode);
    setShelfDetail(product || null);
  };

  return (
    <div className="app-container">
      <Sidebar />

      <main className="main-content warehouse-main">
        {/* HEADER */}
        <header className="page-header">
          <div>
            <h1>Warehouse Visual Locator</h1>
            <p className="page-subtitle">Interactive 2D shelf allocation map (Sections A-D)</p>
          </div>

          <div className="search-shelf-box">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search product ID or name to pinpoint shelf..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && findShelf()}
            />
            <button className="btn-primary btn-sm" onClick={findShelf}>
              <FiMapPin /> Locate
            </button>
          </div>
        </header>

        {/* MAP LEGEND & STATUS */}
        <div className="glass-panel map-legend-bar">
          <div className="legend-items">
            <div className="legend-item"><span className="dot dot-good"></span> Good Stock (&gt;25)</div>
            <div className="legend-item"><span className="dot dot-medium"></span> Medium Stock (11-25)</div>
            <div className="legend-item"><span className="dot dot-low"></span> Low Stock (&le;10)</div>
            <div className="legend-item"><span className="dot dot-empty"></span> Available / Empty Shelf</div>
          </div>

          {selectedShelf && (
            <div className="active-shelf-badge">
              Selected Rack: <strong>{selectedShelf}</strong>
            </div>
          )}
        </div>

        {/* SECTIONS GRID */}
        <div className="sections-grid">
          {sections.map((section) => (
            <div key={section} className="glass-panel section-card">
              <div className="section-title-bar">
                <h3>Section {section}</h3>
                <span className="badge badge-warning">25 Shelves</span>
              </div>

              <div className="shelf-grid">
                {[1, 2, 3, 4, 5].map((row) =>
                  [1, 2, 3, 4, 5].map((col) => {
                    const shelfCode = `${section}${row}${col}`;
                    const product = getShelfProduct(shelfCode);
                    const isSelected = selectedShelf === shelfCode;

                    return (
                      <div
                        key={shelfCode}
                        className={`shelf-box ${getShelfClass(product)} ${isSelected ? "shelf-selected" : ""}`}
                        onClick={() => handleShelfClick(shelfCode, product)}
                        title={product ? `${product.name} (${product.quantity} left)` : `Shelf ${shelfCode} (Empty)`}
                      >
                        <span className="shelf-code">{shelfCode}</span>
                        {product ? (
                          <div className="shelf-info">
                            <span className="shelf-qty">{product.quantity}</span>
                            <span className="shelf-pid">{product.productId}</span>
                          </div>
                        ) : (
                          <span className="shelf-empty-dash">-</span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ))}
        </div>

        {/* SHELF DETAIL DRAWER / POPUP */}
        {shelfDetail && (
          <div className="glass-panel shelf-detail-popup">
            <div className="drawer-header">
              <h3><FiInfo /> Shelf Details #{shelfDetail.shelf}</h3>
              <button className="close-btn" onClick={() => setShelfDetail(null)}><FiX /></button>
            </div>

            <div className="shelf-detail-grid">
              <div><strong>Product Name:</strong> {shelfDetail.name}</div>
              <div><strong>Product ID:</strong> {shelfDetail.productId}</div>
              <div><strong>Available Quantity:</strong> {shelfDetail.quantity} units</div>
              <div><strong>Unit Price:</strong> ₹{shelfDetail.price || 0}</div>
              <div><strong>Category:</strong> {shelfDetail.category || "General"}</div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default WarehouseMap;