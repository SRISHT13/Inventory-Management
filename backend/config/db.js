const mongoose = require("mongoose");

const connectDB = async () => {
  let uri = process.env.MONGO_URI;
  if (uri) {
    try {
      console.log(`Connecting to specified MongoDB URI: ${uri}`);
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
      console.log("✅ MongoDB Connected");
      return;
    } catch (err) {
      console.warn("⚠️ Could not connect to MONGO_URI, attempting MongoMemoryServer fallback:", err.message);
    }
  }

  try {
    console.log("Starting in-memory MongoDB server...");
    const { MongoMemoryServer } = require("mongodb-memory-server");
    const mongoServer = await MongoMemoryServer.create();
    uri = mongoServer.getUri();
    await mongoose.connect(uri);
    console.log(`✅ In-Memory MongoDB Connected at ${uri}`);
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:");
    console.error(error);
    process.exit(1);
  }
};

module.exports = connectDB;