import express from "express";
import Case from "../models/Case.js";
import Resource from "../models/Resource.js";
import Referral from "../models/Referral.js";
import { verifyToken, requireRoles } from "../middleware/auth.js";

const router = express.Router();

// 1. SURVIVOR: Create Case
router.post("/create", verifyToken, requireRoles(["SURVIVOR"]), async (req, res) => {
  try {
    const { needs, urgency, location, preferredLanguage, incidentSummary } = req.body;
    const caseCount = await Case.countDocuments();
    const caseId = `SH-2026-${String(caseCount + 1).padStart(3, "0")}`;

    const newCase = await Case.create({
      caseId,
      survivorId: req.user.id,
      needs,
      urgency: urgency || "IMMEDIATE",
      location: location || "Chennai",
      preferredLanguage: preferredLanguage || "Tamil",
      incidentSummary,
      timeline: [
        { title: "Case Created", description: `Initial support requested for ${needs.join(", ")}` },
        { title: "NGO Assigned", description: "Sakhi One Stop Centre triage desk assigned to review file" }
      ]
    });

    res.status(201).json({ success: true, data: newCase });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. SURVIVOR: Get My Case & Active Referrals
router.get("/my-case", verifyToken, requireRoles(["SURVIVOR"]), async (req, res) => {
  try {
    const myCase = await Case.findOne({ survivorId: req.user.id }).sort({ createdAt: -1 });
    if (!myCase) return res.json({ success: true, data: null });

    const referrals = await Referral.find({ caseId: myCase.caseId }).populate("resourceId");
    res.json({ success: true, data: myCase, referrals });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. CASEWORKER: View All Cases
router.get("/all", verifyToken, requireRoles(["CASEWORKER", "ADMIN"]), async (req, res) => {
  try {
    const cases = await Case.find().sort({ createdAt: -1 });
    res.json({ success: true, data: cases });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. SMART MATCHING: Algorithmic Recommendation
router.get("/:caseId/match-resources", verifyToken, requireRoles(["CASEWORKER"]), async (req, res) => {
  try {
    const targetCase = await Case.findOne({ caseId: req.params.caseId });
    if (!targetCase) return res.status(404).json({ success: false, message: "Case not found" });

    const resources = await Resource.find();

    // Scoring Algorithm: Calculates match percentage based on criteria
    const scored = resources.map((r) => {
      let score = 50; // base score
      if (r.location.toLowerCase() === targetCase.location.toLowerCase()) score += 20;
      if (r.languages.includes(targetCase.preferredLanguage)) score += 15;
      if (targetCase.urgency === "IMMEDIATE" && r.emergencySupport) score += 15;
      if (r.type === "SHELTER" && r.availableBeds > 0) score += 10;

      return {
        ...r._doc,
        matchScore: Math.min(score, 98)
      };
    });

    scored.sort((a, b) => b.matchScore - a.matchScore);
    res.json({ success: true, data: scored });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. CASEWORKER: Create Referral Request
router.post("/create-referral", verifyToken, requireRoles(["CASEWORKER"]), async (req, res) => {
  try {
    const { caseId, resourceId, resourceType } = req.body;
    const referral = await Referral.create({
      caseId,
      resourceId,
      resourceType,
      status: "PENDING_CONSENT"
    });

    await Case.findOneAndUpdate(
      { caseId },
      {
        $push: {
          timeline: {
            title: `${resourceType} Referral Initiated`,
            description: "Awaiting survivor consent via Consent Wallet"
          }
        }
      }
    );

    res.status(201).json({ success: true, data: referral });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. SURVIVOR: Update Consent in Consent Wallet
router.patch("/referral/:id/consent", verifyToken, requireRoles(["SURVIVOR"]), async (req, res) => {
  try {
    const { authorizedFields } = req.body;
    const referral = await Referral.findByIdAndUpdate(
      req.params.id,
      { authorizedFields, status: "CONSENT_GRANTED" },
      { new: true }
    );

    await Case.findOneAndUpdate(
      { caseId: referral.caseId },
      {
        $push: {
          timeline: {
            title: `Consent Authorized for ${referral.resourceType}`,
            description: "Survivor granted targeted data disclosure."
          }
        }
      }
    );

    res.json({ success: true, data: referral });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. ORG (SHELTER / LAWYER): View Inbox (Field-Filtered Authorization)
router.get("/org-referrals", verifyToken, requireRoles(["SHELTER", "LAWYER"]), async (req, res) => {
  try {
    const type = req.user.role; // "SHELTER" or "LAWYER"
    const referrals = await Referral.find({ resourceType: type, status: { $ne: "PENDING_CONSENT" } })
      .populate("resourceId");

    // Pull parent cases and mask fields according to authorizedFields
    const results = await Promise.all(
      referrals.map(async (ref) => {
        const c = await Case.findOne({ caseId: ref.caseId });
        return {
          referralId: ref._id,
          caseId: ref.caseId,
          status: ref.status,
          authorizedFields: ref.authorizedFields,
          // Field-Level Access Control applied:
          urgency: c.urgency,
          location: c.location,
          language: c.preferredLanguage,
          incidentSummary: ref.authorizedFields.shareBasicSummary ? c.incidentSummary : "[Redacted by Survivor Consent]",
          legalDetails: ref.authorizedFields.shareLegalIssue ? "Legal representation authorized for domestic abuse protection." : "[Unauthorized]",
          documents: ref.authorizedFields.shareDocuments ? ["Case_Intake_Brief.pdf"] : []
        };
      })
    );

    res.json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8. ORG (SHELTER / LAWYER): Accept or Reject Referral
router.patch("/referral/:id/status", verifyToken, requireRoles(["SHELTER", "LAWYER"]), async (req, res) => {
  try {
    const { status } = req.body; // "ACCEPTED" or "REJECTED"
    const referral = await Referral.findByIdAndUpdate(req.params.id, { status }, { new: true });

    await Case.findOneAndUpdate(
      { caseId: referral.caseId },
      {
        $push: {
          timeline: {
            title: `${referral.resourceType} Referral ${status}`,
            description: `Organization updated status to ${status}.`
          }
        }
      }
    );

    res.json({ success: true, data: referral });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;