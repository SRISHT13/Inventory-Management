const Settings = require("../models/Settings");

// Get Settings
const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({
        companyName: "StockPilot Smart Warehouse",
        warehouseAddress: "Central Logistics Hub, Zone A, Suite 101",
        contactEmail: "srishtiagarwal2114@gmail.com",
        contactPhone: "+91 98765 43210",
        currencySymbol: "₹",
        lowStockThreshold: 10,
      });
    }
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Settings
const updateSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings(req.body);
    } else {
      Object.assign(settings, req.body);
    }
    await settings.save();
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSettings,
  updateSettings,
};
