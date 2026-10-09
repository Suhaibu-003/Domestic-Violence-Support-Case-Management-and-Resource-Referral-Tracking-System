import mongoose from "mongoose";
import dotenv from "dotenv";
import Resource from "../models/Resource.js";
import { resourceData } from "./resourceData.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/sahaya";
export const mockResources = resourceData;

async function loadMockData() {
  try {
    await mongoose.connect(MONGO_URI);

    // Recreate the collection to clear stale resources and any legacy geo indexes.
    try {
      await mongoose.connection.db.dropCollection("resources");
    } catch (dropErr) {
      // Ignore if the collection does not exist yet.
      if (dropErr.code !== 26) {
        console.log("Collection drop note:", dropErr.message);
      }
    }

    await Resource.insertMany(mockResources);
    console.log(`✓ Successfully seeded ${mockResources.length} mock resources across 10 Tamil Nadu districts.`);
    process.exit(0);
  } catch (err) {
    console.error("Failed to seed mock data:", err);
    process.exit(1);
  }
}

loadMockData();
