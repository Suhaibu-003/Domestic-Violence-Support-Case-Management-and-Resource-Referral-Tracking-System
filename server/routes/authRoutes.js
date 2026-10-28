import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Case from "../models/Case.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "sahaya_jwt_secret_key_2026";

const getNextCaseId = async () => {
  let sequence = (await Case.countDocuments()) + 1;
  let caseId = `SH-2026-${String(sequence).padStart(3, "0")}`;

  while (await Case.exists({ caseId })) {
    sequence += 1;
    caseId = `SH-2026-${String(sequence).padStart(3, "0")}`;
  }

  return caseId;
};

// 1. SURVIVOR REGISTRATION (Auto-generates Case File)
router.post("/register/survivor", async (req, res) => {
  try {
    const { name, alias, email, phone, password, location, preferredLanguage, initialNeeds, situationNote } = req.body;
    if (!situationNote?.trim()) {
      return res.status(400).json({ success: false, message: "A brief situation or needs note is required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create Survivor User Record
    const user = await User.create({
      name,
      alias: alias || `SH_${location || "TN"}_${Math.floor(1000 + Math.random() * 9000)}`,
      email,
      phone: phone || "",
      password: hashedPassword,
      role: "SURVIVOR",
      location: location || "Chennai",
      status: "APPROVED"
    });

    // Auto-generate sequential Case ID (e.g., SH-2026-006)
    const caseId = await getNextCaseId();

    // Immediately initiate a Case Entry for Admin & Caseworker visibility
    await Case.create({
      caseId,
      survivorId: user._id,
      urgency: "IMMEDIATE",
      needs: initialNeeds || ["SHELTER"],
      location: user.location,
      incidentSummary: situationNote.trim(),
      status: "OPEN",
      stage: "OPEN",
      stageHistory: [{
        stage: "OPEN",
        updatedBy: "Survivor",
        note: situationNote.trim()
      }],
      timeline: [{
        title: "Request Received",
        description: situationNote.trim()
      }]
    });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({
      success: true,
      message: "Survivor registered and case file initiated.",
      token,
      user: {
        id: user._id,
        name: user.alias,
        role: user.role,
        location: user.location
      }
    });
  } catch (err) {
    console.error("Survivor registration error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. ORGANIZATION REGISTRATION (Pending Verification)
const registerOrganization = async (req, res) => {
  try {
    const {
      name, email, phone, password, role, orgType, organizationName, location,
      barCouncilEnrollmentNumber, specialization
    } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: "Official email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Map role and orgType safely to match Mongoose schema enums
    const mappedOrgType = orgType || (role === "CASEWORKER" ? "NGO" : role) || "NGO";

    const user = await User.create({
      name,
      email,
      phone: phone || "",
      password: hashedPassword,
      role: "ORGANIZATION",
      orgType: mappedOrgType,
      organizationName: organizationName || (mappedOrgType === "LAWYER" ? `${name} Legal Aid` : organizationName),
      barCouncilEnrollmentNumber: mappedOrgType === "LAWYER" ? barCouncilEnrollmentNumber : undefined,
      specialization: mappedOrgType === "LAWYER" ? specialization : undefined,
      location: location || "Chennai",
      status: "PENDING"
    });

    res.status(201).json({
      success: true,
      message: "Organization registered successfully. Your application is pending Admin approval.",
      user: {
        id: user._id,
        email: user.email,
        status: user.status
      }
    });

  } catch (err) {
    console.error("Org registration error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

router.post("/register/org", registerOrganization);

router.post("/register/lawyer", async (req, res) => {
  const { name, email, phone, password, location, barCouncilEnrollmentNumber, specialization } = req.body;
  if (!name || !email || !phone || !password || !location || !barCouncilEnrollmentNumber || !specialization) {
    return res.status(400).json({ success: false, message: "All lawyer registration fields are required" });
  }

  req.body.role = "ORGANIZATION";
  req.body.orgType = "LAWYER";
  req.body.organizationName = `${name} Legal Aid`;
  return registerOrganization(req, res);
});

// 3. UNIFIED USER / ORG / ADMIN LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    if (user.status === "REJECTED") {
      return res.status(403).json({
        success: false,
        message: `Application Rejected: ${user.rejectionReason || ""}`
      });
    }

    // Intercept unapproved Organization logins
    if (user.role === "ORGANIZATION" && user.status === "PENDING") {
      return res.status(403).json({
        success: false,
        message: "Your application is still under review by the Administrator."
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, orgType: user.orgType },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.role === "SURVIVOR" ? user.alias : user.name,
        email: user.email,
        role: user.role,
        orgType: user.orgType,
        organizationName: user.organizationName,
        location: user.location
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;