import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import ticketRoutes from "./routes/tickets.js";
import aiRoutes from "./routes/ai.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/it-support-system",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    console.log("⚠️  MongoDB not available. Some features may not work.");
    console.log("💡 To fix this:");
    console.log(
      "   1. Install MongoDB locally: brew install mongodb-community"
    );
    console.log(
      "   2. Or use MongoDB Atlas (cloud) and update MONGODB_URI in .env"
    );
  }
};

connectDB();

// Routes
app.use("/api/tickets", ticketRoutes);
app.use("/api/ai", aiRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "IT Support System is running",
    mongodb:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
