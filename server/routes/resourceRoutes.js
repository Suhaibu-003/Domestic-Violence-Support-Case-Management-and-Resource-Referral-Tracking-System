import express from "express";
import Resource from "../models/Resource.js";

const router = express.Router();

router.get("/district", async (req, res) => {
  const { location } = req.query;
  if (typeof location !== "string" || !location.trim()) {
    return res.status(400).json({ success: false, message: "District is required" });
  }

  try {
    const resources = await Resource.find({
      location: location.trim(),
      type: { $in: ["SHELTER", "HOSPITAL"] },
      isVerified: true
    }).sort({ availableBeds: -1, type: 1 });
    const selected =
      resources.find((resource) => resource.type === "SHELTER" && resource.availableBeds > 0) ||
      resources.find((resource) => resource.type === "HOSPITAL") ||
      resources.find((resource) => resource.type === "SHELTER") ||
      null;

    res.json({ success: true, data: selected });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/near", async (req, res) => {
  const { type } = req.query;

  try {
    // Districts are stored as plain strings, so do not use a geospatial query.
    const filter = { availableBeds: { $gt: 0 } };

    if (type) filter.type = type;

    const resources = await Resource.find(filter).limit(5);
    res.json({ success: true, count: resources.length, data: resources });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;