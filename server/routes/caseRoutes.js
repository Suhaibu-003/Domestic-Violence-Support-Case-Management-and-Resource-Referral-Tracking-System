import express from "express";
import Case from "../models/Case.js";
import Resource from "../models/Resource.js";
import Referral from "../models/Referral.js";
import User from "../models/User.js";
import { verifyToken, requireRoles } from "../middleware/auth.js";

const router = express.Router();

const getOrganizationForRequest = async (req) => User.findOne({
  _id: req.user.id,
  role: "ORGANIZATION",
  status: "APPROVED"
});

const needsForOrganizationType = {
  SHELTER: ["SHELTER"],
  HOSPITAL: ["HOSPITAL", "MEDICAL"],
  NGO: null,
  LAWYER: ["LEGAL", "LAWYER"],
  COUNSELLING: ["COUNSELLING"]
};

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
      status: "OPEN",
      stage: "OPEN",
      stageHistory: [{
        stage: "OPEN",
        updatedBy: "Survivor",
        note: `Initial support requested for ${needs.join(", ")}`
      }],
      timeline: [{
        title: "Request Received",
        description: `Initial support requested for ${needs.join(", ")}`
      }]
    });

    res.status(201).json({ success: true, data: newCase });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. SURVIVOR: Get My Case & Active Referrals
router.get("/my-case", verifyToken, requireRoles(["SURVIVOR"]), async (req, res) => {
  try {
    const myCase = await Case.findOne({ survivorId: req.user.id })
      .populate({
        path: "assignedResources.resourceId",
        select: "name organizationName orgType location phone email specialization type verifiedContact availableBeds availability isVerified"
      })
      .sort({ createdAt: -1 });
    if (!myCase) return res.json({ success: true, data: null });

    const referrals = await Referral.find({ caseId: myCase.caseId }).populate("resourceId");
    res.json({ success: true, data: myCase, referrals });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2A. ORGANIZATION: Local case intake queue filtered by district and specialization.
router.get("/org-queue", verifyToken, requireRoles(["ORGANIZATION"]), async (req, res) => {
  try {
    const organization = await getOrganizationForRequest(req);
    if (!organization) {
      return res.status(403).json({ success: false, message: "Approved organization account required" });
    }

    const matchingNeeds = needsForOrganizationType[organization.orgType];
    if (matchingNeeds === undefined) {
      return res.status(400).json({ success: false, message: "Organization type is not supported" });
    }

    const filter = {
      location: organization.location,
      status: { $in: ["OPEN", "TRIAGED"] },
      assignedCaseworkerId: null
    };
    if (matchingNeeds) filter.needs = { $in: matchingNeeds };

    const cases = await Case.find(filter)
      .populate("survivorId", "alias")
      .sort({ createdAt: 1 });
    res.json({ success: true, data: cases, organization: { name: organization.organizationName, location: organization.location, orgType: organization.orgType } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2B. ORGANIZATION: Claim a matching local case and begin service coordination.
router.patch("/:id/claim", verifyToken, requireRoles(["ORGANIZATION"]), async (req, res) => {
  try {
    const organization = await getOrganizationForRequest(req);
    if (!organization) {
      return res.status(403).json({ success: false, message: "Approved organization account required" });
    }

    const matchingNeeds = needsForOrganizationType[organization.orgType];
    if (matchingNeeds === undefined) {
      return res.status(400).json({ success: false, message: "Organization type is not supported" });
    }

    const caseFilter = {
      _id: req.params.id,
      location: organization.location,
      status: { $in: ["OPEN", "TRIAGED"] },
      assignedCaseworkerId: null
    };
    if (matchingNeeds) caseFilter.needs = { $in: matchingNeeds };

    const claimedCase = await Case.findOneAndUpdate(
      caseFilter,
      {
        $set: { status: "IN_ACTION", stage: "IN_ACTION", assignedCaseworkerId: organization._id },
        $push: {
          stageHistory: {
            stage: "IN_ACTION",
            updatedBy: organization.organizationName || organization.name,
            note: `${organization.orgType} support coordination started.`
          },
          timeline: {
            title: "Organization Claimed Case",
            description: `${organization.organizationName || organization.name} began coordinating ${organization.orgType.toLowerCase()} support.`
          }
        }
      },
      { new: true, runValidators: true }
    );

    if (!claimedCase) {
      return res.status(409).json({ success: false, message: "Case is unavailable or does not match your district and specialization" });
    }
    res.json({ success: true, data: claimedCase });
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