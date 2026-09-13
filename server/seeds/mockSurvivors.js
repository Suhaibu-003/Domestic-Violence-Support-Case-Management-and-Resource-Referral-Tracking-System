import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "../models/User.js";
import Case from "../models/Case.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/sahaya";

export const dummySurvivors = [
  {
    name: "Kavitha Selvam",
    alias: "SH_Kavitha_Erode",
    email: "kavitha.erode@sahaya-demo.org",
    phone: "+91 98401 11001",
    role: "SURVIVOR",
    location: "Erode",
    preferredLanguage: "Tamil",
    caseData: {
      caseId: "SH-2026-001",
      priority: "IMMEDIATE",
      needs: ["SHELTER", "LEGAL"],
      location: "Erode",
      summary: "Urgent safe shelter and legal injunction needed following domestic assault.",
      status: "OPEN"
    }
  },
  {
    name: "Ananya Krishnan",
    alias: "SH_Ananya_Chennai",
    email: "ananya.chennai@sahaya-demo.org",
    phone: "+91 98401 11002",
    role: "SURVIVOR",
    location: "Chennai",
    preferredLanguage: "Tamil",
    caseData: {
      caseId: "SH-2026-002",
      priority: "HIGH",
      needs: ["HOSPITAL", "COUNSELLING"],
      location: "Chennai",
      summary: "Emergency medical examination, MLC documentation, and trauma counseling requested.",
      status: "OPEN"
    }
  },
  {
    name: "Meenakshi Ramasamy",
    alias: "SH_Meena_Madurai",
    email: "meena.madurai@sahaya-demo.org",
    phone: "+91 98401 11003",
    role: "SURVIVOR",
    location: "Madurai",
    preferredLanguage: "Tamil",
    caseData: {
      caseId: "SH-2026-003",
      priority: "IMMEDIATE",
      needs: ["SHELTER", "HOSPITAL"],
      location: "Madurai",
      summary: "Survivor with one infant seeking transit accommodation and pediatric check-up.",
      status: "IN_PROGRESS"
    }
  },
  {
    name: "Deepa Natarajan",
    alias: "SH_Deepa_CBE",
    email: "deepa.cbe@sahaya-demo.org",
    phone: "+91 98401 11004",
    role: "SURVIVOR",
    location: "Coimbatore",
    preferredLanguage: "English",
    caseData: {
      caseId: "SH-2026-004",
      priority: "MEDIUM",
      needs: ["LEGAL"],
      location: "Coimbatore",
      summary: "Assistance required for filing interim maintenance and DV protection petition.",
      status: "OPEN"
    }
  },
  {
    name: "Revathi Manoharan",
    alias: "SH_Revathi_Salem",
    email: "revathi.salem@sahaya-demo.org",
    phone: "+91 98401 11005",
    role: "SURVIVOR",
    location: "Salem",
    preferredLanguage: "Tamil",
    caseData: {
      caseId: "SH-2026-005",
      priority: "HIGH",
      needs: ["COUNSELLING", "SHELTER"],
      location: "Salem",
      summary: "Trauma therapy intake required along with safe short-term lodging.",
      status: "IN_PROGRESS"
    }
  }
];

async function seedSurvivors() {
  try {
    await mongoose.connect(MONGO_URI);

    const defaultPassword = await bcrypt.hash("survivor123", 10);

    for (const data of dummySurvivors) {
      // 1. Check or create survivor account
      let survivor = await User.findOne({ email: data.email });
      if (!survivor) {
        survivor = await User.create({
          name: data.name,
          alias: data.alias,
          email: data.email,
          phone: data.phone,
          password: defaultPassword,
          role: "SURVIVOR",
          location: data.location,
          status: "APPROVED"
        });
      }

      // 2. Attach matching case
      const existingCase = await Case.findOne({ caseId: data.caseData.caseId });
      if (!existingCase) {
        await Case.create({
          ...data.caseData,
          survivorId: survivor._id
        });
      }
    }

    console.log("✓ Successfully created 5 mock survivors with active cases.");
    process.exit(0);
  } catch (err) {
    console.error("Failed to seed dummy survivors:", err);
    process.exit(1);
  }
}

seedSurvivors();