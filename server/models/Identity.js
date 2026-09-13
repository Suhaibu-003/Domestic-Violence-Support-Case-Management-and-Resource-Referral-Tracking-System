import mongoose from "mongoose";

const identitySchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    contactPhone: { type: String, required: true },
    emergencyContact: { type: String },
    aadhaarMasked: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model("Identity", identitySchema);