import express from "express";
import User from "../models/User.js";
import Case from "../models/Case.js";
import Resource from "../models/Resource.js";
import { verifyToken, requireRoles } from "../middleware/auth.js";

const router = express.Router();

// Apply Admin protection to all endpoints in this router
router.use(verifyToken, requireRoles(["ADMIN"]));

// 1. STATS: Aggregated Platform Counters
router.get("/stats", async (req, res) => {
  try {
    const [survivors, organizations, pendingOrgs, activeCases, resources] = await Promise.all([
      User.countDocuments({ role: "SURVIVOR" }),
      User.countDocuments({ role: "ORGANIZATION", status: "APPROVED" }),
      User.countDocuments({ role: "ORGANIZATION", status: "PENDING" }),
      Case.countDocuments({ status: { $ne: "RESOLVED" } }),
      Resource.countDocuments()
    ]);

    res.json({
      success: true,
      data: { survivors, organizations, pendingOrgs, activeCases, resources }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. SURVIVORS: View Cases & Manage Status
router.get("/survivors", async (req, res) => {
  try {
    const cases = await Case.find()
      .populate("survivorId", "alias location preferredLanguage")
      .populate("assignedCaseworkerId", "organizationName name")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: cases });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.patch("/cases/:id/status", async (req, res) => {
  try {
    const updated = await Case.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. ORGANIZATIONS: Fetch Pending Only & Handle Verify/Reject with Reason
router.get("/organizations", async (req, res) => {
  try {
    // Only return organizations that are currently PENDING
    const pendingOrgs = await User.find({ role: "ORGANIZATION", status: "PENDING" })
      .select("-password")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: pendingOrgs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.patch("/organizations/:id/verify", async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    if (!["APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be APPROVED or REJECTED" });
    }

    const updateFields = { status, rejectionReason: null };
    if (status === "REJECTED") {
      updateFields.rejectionReason = rejectionReason || "Application did not meet operational criteria.";
    }

    const org = await User.findOneAndUpdate(
      { _id: req.params.id, role: "ORGANIZATION" },
      updateFields,
      { new: true, runValidators: true }
    );

    if (!org) {
      return res.status(404).json({ success: false, message: "Organization not found" });
    }

    // If approved, automatically register the organization in the Resource Directory.
    if (status === "APPROVED") {
      const resourceName = org.organizationName || org.name;
      const existingResource = await Resource.findOne({ name: resourceName });
      if (!existingResource) {
        await Resource.create({
          name: resourceName,
          type: org.orgType || "NGO",
          location: org.location || "Chennai",
          services: [`Verified ${org.orgType || "NGO"} Support`, "Case Management & Direct Handoff"],
          languages: ["Tamil", "English"],
          availableBeds: org.orgType === "SHELTER" ? 10 : org.orgType === "HOSPITAL" ? 15 : 0,
          verifiedContact: org.phone || org.email,
          operatingHours: "24/7 Support",
          isVerified: true
        });
      }
    }

    res.json({ success: true, data: org });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. RESOURCE MAPPING: CRUD Operations
router.get("/resources", async (req, res) => {
  try {
    const resources = await Resource.find().sort({ location: 1, type: 1 });
    res.json({ success: true, data: resources });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/resources", async (req, res) => {
  try {
    const resource = await Resource.create(req.body);
    res.status(201).json({ success: true, data: resource });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete("/resources/:id", async (req, res) => {
  try {
    await Resource.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Resource deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;