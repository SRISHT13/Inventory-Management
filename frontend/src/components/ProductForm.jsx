import { useState } from "react";
import "./ProductForm.css";

function ProductForm({ onAddProduct, products = [] }) {
  const [formData, setFormData] = useState({
    productId: "",
    name: "",
    quantity: "",
    shelf: "",
    price: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    onAddProduct(formData);

    setFormData({
      productId: "",
      name: "",
      quantity: "",
      shelf: "",
      price: "",
    });
  };

  // Generate all shelves A11-A55, B11-B55, C11-C55, D11-D55

  const allShelves = [];

  ["A", "B", "C", "D"].forEach((section) => {
    [1, 2, 3, 4, 5].forEach((row) => {
      [1, 2, 3, 4, 5].forEach((col) => {
        allShelves.push(`${section}${row}${col}`);
      });
    });
  });

  // Remove occupied shelves

  const occupiedShelves = products.map(
    (product) => product.shelf
  );

  const availableShelves = allShelves.filter(
    (shelf) => !occupiedShelves.includes(shelf)
  );

  return (
    <div className="product-form-container">
      <h2>Add Product</h2>
      <form onSubmit={handleSubmit} className="product-form-grid">
        <div className="form-group">
          <label>Product ID</label>
          <input
            type="text"
            name="productId"
            placeholder="e.g. SKU-1234"
            className="form-input"
            value={formData.productId}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Product Name</label>
          <input
            type="text"
            name="name"
            placeholder="e.g. Wireless Mouse"
            className="form-input"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Quantity</label>
          <input
            type="number"
            name="quantity"
            placeholder="0"
            className="form-input"
            value={formData.quantity}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Price</label>
          <input
            type="number"
            name="price"
            placeholder="0.00"
            className="form-input"
            value={formData.price}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Shelf Location</label>
          <select
            name="shelf"
            value={formData.shelf}
            className="form-select"
            onChange={handleChange}
            required
          >
            <option value="">Select Shelf</option>
            {availableShelves.map((shelf) => (
              <option key={shelf} value={shelf}>
                {shelf}
              </option>
            ))}
          </select>
        </div>

        <div className="submit-btn-wrapper">
          <button type="submit" className="btn-primary">
            + Add Product
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProductForm;