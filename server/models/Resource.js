import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ["SHELTER", "HOSPITAL", "COUNSELLING", "LAWYER", "NGO"],
      required: true
    },
    location: { type: String, required: true },
    services: [{ type: String }],
    languages: [{ type: String }],
    availability: { type: String, default: "Available" },
    availableBeds: { type: Number, default: 0 },
    verifiedContact: { type: String, required: true },
    operatingHours: { type: String, default: "24/7 Emergency" },
    isVerified: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model("Resource", resourceSchema);