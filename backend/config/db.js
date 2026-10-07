import mongoose from "mongoose";

/**
 * connectDB — opens the Mongoose connection to MongoDB Atlas. Called
 * once from server.js on boot. Exits the process on failure since the
 * API is useless without a database.
 */
export default async function connectDB() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/sarkarisetu";

  mongoose.set("strictQuery", true);

  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.warn(`Primary MongoDB URI failed (${err.message}). Trying fallback to local MongoDB...`);
    try {
      const fallbackUri = "mongodb://127.0.0.1:27017/sarkarisetu";
      const conn = await mongoose.connect(fallbackUri);
      console.log(`MongoDB connected (local fallback): ${conn.connection.host}`);
    } catch (fallbackErr) {
      console.error("Failed to connect to MongoDB:", fallbackErr.message);
      process.exit(1);
    }
  }

  mongoose.connection.on("error", (err) => {
    console.error("MongoDB connection error:", err.message);
  });
}
