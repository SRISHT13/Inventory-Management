import { useEffect, useState } from "react";
import API from "../services/api";
import { getSettings } from "../services/settingsApi";
import Sidebar from "../components/Sidebar";
import ProductForm from "../components/ProductForm";
import ProductQR from "../components/ProductQR";
import {
  FiSearch,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiDownload,
  FiFilter,
  FiX,
  FiLayers
} from "react-icons/fi";
import { LuQrCode } from "react-icons/lu";
import { trackProductAdded, trackProductUpdated, trackProductDeleted, trackQRGenerated } from "../analytics/events";
import { createActivity } from "../services/activityService";
import "./Inventory.css";

function Inventory() {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [settings, setSettings] = useState({ currencySymbol: "₹", lowStockThreshold: 10 });
  const [categoryFilter, setCategoryFilter] = useState("All");

  const userRole = localStorage.getItem("role") || "admin";
  const userName = localStorage.getItem("name") || "Operator";

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
      console.error("Fetch products error:", error);
    }
  };

  const addProduct = async (productData) => {
    try {
      const res = await API.post("/products", productData);
      if (res.data) trackProductAdded(res.data);
      await createActivity({
        user: userName,
        role: userRole,
        action: "Product Added",
        productName: res.data.name,
        productId: res.data.productId,
        details: `Shelf ${res.data.shelf}`,
      });
      setShowAddForm(false);
      await fetchProducts();
    } catch (error) {
      alert("Failed to add product: " + (error.response?.data?.message || error.message));
    }
  };

  const deleteProduct = async (product) => {
    if (!window.confirm(`Are you sure you want to delete ${product.name}?`)) return;
    try {
      await API.delete(`/products/${product._id}`);
      trackProductDeleted(product);
      await createActivity({
        user: userName,
        role: userRole,
        action: "Product Deleted",
        productName: product.name,
        productId: product.productId,
        details: `Deleted from Shelf ${product.shelf}`,
      });
      await fetchProducts();
    } catch (error) {
      console.error(error);
    }
  };

  const saveUpdate = async () => {
    try {
      const res = await API.put(`/products/${editingProduct._id}`, editingProduct);
      trackProductUpdated(res.data);
      await createActivity({
        user: userName,
        role: userRole,
        action: "Product Updated",
        productName: res.data.name,
        productId: res.data.productId,
        details: `Quantity: ${res.data.quantity}, Price: ${res.data.price}`,
      });
      setEditingProduct(null);
      await fetchProducts();
    } catch (error) {
      console.error(error);
    }
  };

  const exportCSV = () => {
    if (products.length === 0) return;
    const headers = ["Product ID,Name,Quantity,Price,Shelf,Category"];
    const rows = products.map(
      (p) => `${p.productId},"${p.name}",${p.quantity},${p.price},${p.shelf},${p.category || "General"}`
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `inventory_report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.productId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.shelf && p.shelf.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === "All" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getStatusBadge = (qty) => {
    if (qty <= settings.lowStockThreshold) return <span className="badge badge-danger">Low Stock</span>;
    if (qty < 25) return <span className="badge badge-warning">Medium Stock</span>;
    return <span className="badge badge-success">In Stock</span>;
  };

  return (
    <div className="app-container">
      <Sidebar />

      <main className="main-content inventory-main">
        {/* HEADER */}
        <header className="page-header">
          <div>
            <h1>Inventory Management</h1>
            <p className="page-subtitle">Track, filter, update, and manage your warehouse catalog</p>
          </div>

          <div className="header-actions">
            <button className="btn-secondary" onClick={exportCSV}>
              <FiDownload /> Export CSV
            </button>
            {userRole === "admin" && (
              <button className="btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
                <FiPlus /> {showAddForm ? "Close Form" : "Add Product"}
              </button>
            )}
          </div>
        </header>

        {/* ADD PRODUCT MODAL / DRAWER */}
        {showAddForm && (
          <div className="glass-panel form-drawer">
            <div className="drawer-header">
              <h3><FiLayers /> Register New Product SKU</h3>
              <button className="close-btn" onClick={() => setShowAddForm(false)}><FiX /></button>
            </div>
            <ProductForm onAddProduct={addProduct} products={products} />
          </div>
        )}

        {/* EDIT PRODUCT POPUP */}
        {editingProduct && (
          <div className="modal-overlay">
            <div className="glass-panel modal-card">
              <div className="drawer-header">
                <h3><FiEdit2 /> Edit Product #{editingProduct.productId}</h3>
                <button className="close-btn" onClick={() => setEditingProduct(null)}><FiX /></button>
              </div>

              <div className="edit-form-grid">
                <div className="input-group">
                  <label>Product Name</label>
                  <input
                    type="text"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  />
                </div>

                <div className="input-group">
                  <label>Quantity</label>
                  <input
                    type="number"
                    value={editingProduct.quantity}
                    onChange={(e) => setEditingProduct({ ...editingProduct, quantity: Number(e.target.value) })}
                  />
                </div>

                <div className="input-group">
                  <label>Price ({settings.currencySymbol})</label>
                  <input
                    type="number"
                    value={editingProduct.price || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                  />
                </div>

                <div className="input-group">
                  <label>Shelf Location</label>
                  <input
                    type="text"
                    value={editingProduct.shelf}
                    onChange={(e) => setEditingProduct({ ...editingProduct, shelf: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setEditingProduct(null)}>Cancel</button>
                <button className="btn-primary" onClick={saveUpdate}>Save Changes</button>
              </div>
            </div>
          </div>
        )}

        {/* CONTROLS (SEARCH & FILTERS) */}
        <div className="controls-bar glass-panel">
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by Product ID, Name, or Shelf..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-box">
            <FiFilter className="filter-icon" />
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="All">All Categories</option>
              <option value="General">General</option>
              <option value="Electronics">Electronics</option>
              <option value="Apparel">Apparel</option>
              <option value="Hardware">Hardware</option>
            </select>
          </div>
        </div>

        {/* PRODUCTS TABLE */}
        <div className="glass-panel table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>NAME</th>
                <th>QTY</th>
                <th>PRICE</th>
                <th>LOCATION</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">No products found matching your search.</td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p._id}>
                    <td className="code-font">{p.productId}</td>
                    <td><span className="product-title">{p.name}</span></td>
                    <td><strong className="qty-bold">{p.quantity}</strong></td>
                    <td>{settings.currencySymbol}{p.price || 0}</td>
                    <td><span className="shelf-tag">Shelf {p.shelf}</span></td>
                    <td>{getStatusBadge(p.quantity)}</td>
                    <td>
                      <div className="row-actions">
                        {userRole === "admin" && (
                          <button className="icon-btn edit-icon-btn" onClick={() => setEditingProduct(p)} title="Edit">
                            <FiEdit2 />
                          </button>
                        )}
                        {userRole === "admin" && (
                          <button className="icon-btn delete-icon-btn" onClick={() => deleteProduct(p)} title="Delete">
                            <FiTrash2 />
                          </button>
                        )}
                        <button className="icon-btn qr-icon-btn" onClick={() => setSelectedProduct(p)} title="QR Code">
                          <LuQrCode />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* QR MODAL */}
        {selectedProduct && (
          <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
            <div className="glass-panel qr-modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="drawer-header">
                <h3>QR Code #{selectedProduct.productId}</h3>
                <button className="close-btn" onClick={() => setSelectedProduct(null)}><FiX /></button>
              </div>
              <ProductQR product={selectedProduct} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Inventory;