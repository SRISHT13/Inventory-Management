const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      default: "StockPilot Smart Warehouse",
    },
    warehouseAddress: {
      type: String,
      default: "Central Logistics Hub, Zone A, Suite 101",
    },
    contactEmail: {
      type: String,
      default: "srishtiagarwal2114@gmail.com",
    },
    contactPhone: {
      type: String,
      default: "+91 98765 43210",
    },
    currencySymbol: {
      type: String,
      default: "₹",
    },
    lowStockThreshold: {
      type: Number,
      default: 10,
    },
    themeMode: {
      type: String,
      default: "dark",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Settings", settingsSchema);
