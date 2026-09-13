import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { autoInitializeDB } from "./config/initDB.js";

// 1. Import Routes
import authRoutes from "./routes/authRoutes.js";
import caseRoutes from "./routes/caseRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import resourceRoutes from "./routes/resourceRoutes.js";

dotenv.config();

// 2. Initialize Express app FIRST
const app = express();

// 3. Middlewares
app.use(cors());
app.use(express.json());

// 4. Mount Routes (AFTER app is initialized)
app.use("/api/auth", authRoutes);
app.use("/api/cases", caseRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/resources", resourceRoutes);

// 5. Database Connection & Server Listen
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/sahaya";

const startServer = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    await autoInitializeDB();
    console.log("✓ MongoDB Connected");
    app.listen(PORT, () => {
      console.log(`✓ SAHAYA Backend running on port ${PORT}`);
    });
  } catch (err) {
    console.error("MongoDB Connection Error:", err);
    process.exitCode = 1;
  }
};

startServer();