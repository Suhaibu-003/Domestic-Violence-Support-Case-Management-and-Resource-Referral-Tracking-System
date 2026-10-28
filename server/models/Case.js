import mongoose from "mongoose";

const timelineEntrySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  timestamp: { type: Date, default: Date.now }
});

const caseSchema = new mongoose.Schema(
  {
    caseId: { type: String, required: true, unique: true },
    survivorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assignedCaseworkerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: ["OPEN", "TRIAGED", "IN_ACTION", "RESOLVED"],
      default: "OPEN"
    },
    urgency: {
      type: String,
      enum: ["IMMEDIATE", "WITHIN_24_HOURS", "GENERAL"],
      default: "IMMEDIATE"
    },
    needs: [{ type: String }], // ["SHELTER", "LEGAL", "COUNSELLING", "MEDICAL"]
    location: { type: String, required: true },
    preferredLanguage: { type: String, default: "Tamil" },
    incidentSummary: { type: String, required: true },
    timeline: [timelineEntrySchema]
  },
  { timestamps: true }
);

export default mongoose.model("Case", caseSchema);