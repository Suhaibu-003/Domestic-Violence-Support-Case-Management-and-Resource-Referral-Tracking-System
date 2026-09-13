import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "../models/User.js";
import Resource from "../models/Resource.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/sahaya";

async function runSeed() {
  await mongoose.connect(MONGO_URI);

  // 1. Create Default Admin
  const existingAdmin = await User.findOne({ email: "admin@sahaya.org" });
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await User.create({
      name: "Central Admin",
      email: "admin@sahaya.org",
      password: hashedPassword,
      role: "ADMIN",
      isVerified: true,
      status: "APPROVED"
    });
    console.log("✓ Admin user created: admin@sahaya.org / admin123");
  }

  // 2. Populate Resource Mapping across hubs
  const resources = [
    {
      name: "Safe Home Erode",
      type: "SHELTER",
      location: "Erode",
      services: ["Emergency Stay", "Food"],
      availableBeds: 8,
      verifiedContact: "+91 94441 11111"
    },
    {
      name: "Erode Government Hospital",
      type: "HOSPITAL",
      location: "Erode",
      services: ["Emergency Trauma Support", "Forensic Care"],
      availableBeds: 15,
      verifiedContact: "+91 94441 22222"
    },
    {
      name: "XYZ Counselling Centre",
      type: "COUNSELLING",
      location: "Erode",
      services: ["Crisis Therapy", "Trauma Counseling"],
      availableBeds: 0,
      verifiedContact: "+91 94441 33333"
    },
    {
      name: "Erode District Legal Aid Centre",
      type: "LAWYER",
      location: "Erode",
      services: ["Free Legal Defense", "Protection Orders"],
      availableBeds: 0,
      verifiedContact: "+91 94441 44444"
    },
    {
      name: "ABC Foundation NGO",
      type: "NGO",
      location: "Erode",
      services: ["First-Response Triage", "Rehabilitation"],
      availableBeds: 0,
      verifiedContact: "+91 94441 55555"
    }
  ];

  await Resource.deleteMany({ location: "Erode" });
  await Resource.insertMany(resources);
  console.log("✓ Erode hub resource mapping loaded successfully");

  process.exit();
}

runSeed();