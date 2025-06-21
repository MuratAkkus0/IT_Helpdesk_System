import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import ticketRoutes from "./routes/tickets.js";
import aiRoutes from "./routes/ai.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enhanced CORS configuration for production and local AI access
const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? ["https://your-vercel-app.vercel.app", "http://localhost:5173"]
      : ["http://localhost:5173", "http://localhost:3000"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// MongoDB Connection
const connectDB = async () => {
  try {
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/it-support-system";
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
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
    environment: process.env.NODE_ENV || "development",
    ollamaUrl: process.env.OLLAMA_URL || "http://localhost:11434",
  });
});

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/dist"));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(process.cwd(), "client", "dist", "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(
    `Ollama URL: ${process.env.OLLAMA_URL || "http://localhost:11434"}`
  );
});
