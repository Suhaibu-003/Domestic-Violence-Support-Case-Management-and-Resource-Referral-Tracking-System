import express from "express";
import mongoose from "mongoose";
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
    const [survivors, organizations, pendingOrgs, activeCases, resources, lawyers] = await Promise.all([
      User.countDocuments({ role: "SURVIVOR" }),
      User.countDocuments({ role: "ORGANIZATION", status: "APPROVED" }),
      User.countDocuments({ role: "ORGANIZATION", status: "PENDING" }),
      Case.countDocuments({ status: { $ne: "RESOLVED" } }),
      Resource.countDocuments(),
      User.countDocuments({ role: "ORGANIZATION", orgType: "LAWYER", status: "APPROVED" })
    ]);

    res.json({
      success: true,
      data: { survivors, organizations, pendingOrgs, activeCases, resources: resources + lawyers }
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
      .populate({
        path: "assignedResources.resourceId",
        select: "name organizationName orgType location phone email specialization type verifiedContact availableBeds availability isVerified"
      })
      .sort({ createdAt: -1 });
    res.json({ success: true, data: cases });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

const updateCaseStage = async (req, res) => {
  try {
    const allowedStages = ["OPEN", "TRIAGED", "IN_ACTION", "RESOLVED"];
    const { stage, status, note = "" } = req.body;
    const nextStage = stage || status;
    if (!allowedStages.includes(nextStage)) {
      return res.status(400).json({ success: false, message: "Invalid case stage" });
    }

    const currentCase = await Case.findById(req.params.id);
    if (!currentCase) {
      return res.status(404).json({ success: false, message: "Case not found" });
    }

    const stageNotes = {
      OPEN: "Case is awaiting caseworker review.",
      TRIAGED: "Case has been reviewed and assigned for support.",
      IN_ACTION: "Support services are actively being coordinated.",
      RESOLVED: "Case has been resolved and marked secure."
    };
    const stageNote = (typeof note === "string" ? note.trim() : "") || stageNotes[nextStage];
    currentCase.stage = nextStage;
    currentCase.status = nextStage;
    currentCase.stageHistory.push({
      stage: nextStage,
      updatedBy: req.user.id,
      note: stageNote
    });
    currentCase.timeline.push({
      title: `Case stage updated to ${nextStage}`,
      description: stageNote
    });
    const updated = await currentCase.save();
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

router.patch("/cases/:id/stage", updateCaseStage);
router.patch("/cases/:id/status", updateCaseStage);

router.patch("/cases/:id/assign-resource", async (req, res) => {
  try {
    const { resourceIds } = req.body;
    if (!Array.isArray(resourceIds) || resourceIds.length === 0) {
      return res.status(400).json({ success: false, message: "Select at least one resource to assign" });
    }
    if (resourceIds.some((id) => !mongoose.Types.ObjectId.isValid(id))) {
      return res.status(400).json({ success: false, message: "One or more resource IDs are invalid" });
    }
    if (req.body.stage && !["TRIAGED", "IN_ACTION"].includes(req.body.stage)) {
      return res.status(400).json({ success: false, message: "Assigned cases can only be moved to TRIAGED or IN_ACTION" });
    }

    const currentCase = await Case.findById(req.params.id);
    if (!currentCase) {
      return res.status(404).json({ success: false, message: "Case not found" });
    }

    const assigned = [];
    for (const resourceId of [...new Set(resourceIds)]) {
      const facility = await Resource.findOne({
        _id: resourceId,
        location: currentCase.location,
        isVerified: true
      });
      if (facility) {
        assigned.push({ resourceId: facility._id, resourceModel: "Resource" });
        continue;
      }

      const lawyer = await User.findOne({
        _id: resourceId,
        role: "ORGANIZATION",
        orgType: "LAWYER",
        location: currentCase.location,
        status: "APPROVED"
      });
      if (!lawyer) {
        return res.status(400).json({
          success: false,
          message: "Every selected resource must be verified, approved, and in the survivor's district"
        });
      }
      assigned.push({ resourceId: lawyer._id, resourceModel: "User" });
    }

    currentCase.assignedResources = [
      ...currentCase.assignedResources.filter((existing) => !assigned.some(
        ({ resourceId }) => resourceId.equals(existing.resourceId)
      )),
      ...assigned
    ];
    const nextStage = req.body.stage === "TRIAGED" ? "TRIAGED" : "IN_ACTION";
    currentCase.stage = nextStage;
    currentCase.status = nextStage;
    const stageNote = nextStage === "TRIAGED"
      ? "District aid resources have been reviewed and mapped."
      : "District aid resources have been mapped and help is being coordinated.";
    currentCase.stageHistory.push({ stage: nextStage, updatedBy: req.user.id, note: stageNote });
    currentCase.timeline.push({ title: "District aid mapped", description: stageNote });

    const updated = await currentCase.save();
    await updated.populate({
      path: "assignedResources.resourceId",
      select: "name organizationName orgType location phone email specialization type verifiedContact availableBeds availability isVerified"
    });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
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
    if (status === "APPROVED" && org.orgType !== "LAWYER") {
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
    const [facilities, lawyers] = await Promise.all([
      Resource.find().sort({ location: 1, type: 1 }),
      User.find({ role: "ORGANIZATION", orgType: "LAWYER", status: "APPROVED" })
        .select("-password")
        .sort({ location: 1, name: 1 })
    ]);
    const lawyerEntries = lawyers.map((lawyer) => ({
      ...lawyer.toObject(),
      type: "LAWYER",
      verifiedContact: lawyer.phone || lawyer.email,
      availability: "Available",
      isVerified: true,
      sourceModel: "User"
    }));
    res.json({ success: true, data: [...facilities, ...lawyerEntries] });
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