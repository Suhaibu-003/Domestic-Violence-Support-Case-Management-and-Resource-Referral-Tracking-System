import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    alias: { type: String },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["ADMIN", "SURVIVOR", "ORGANIZATION"],
      required: true
    },
    orgType: {
      type: String,
      enum: ["NGO", "SHELTER", "HOSPITAL", "COUNSELLING", "LAWYER"],
      default: null
    },
    organizationName: { type: String },
    barCouncilEnrollmentNumber: { type: String },
    specialization: { type: String },
    location: { type: String, default: "Chennai" },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: function () {
        return this.role === "ORGANIZATION" ? "PENDING" : "APPROVED";
      }
    },
    rejectionReason: { type: String, default: null } // Stores why the admin rejected
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);