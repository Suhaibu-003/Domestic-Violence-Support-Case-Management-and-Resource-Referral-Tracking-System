import express from "express";
import Resource from "../models/Resource.js";

const router = express.Router();

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