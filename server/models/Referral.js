import mongoose from "mongoose";

const referralSchema = new mongoose.Schema(
  {
    caseId: { type: String, required: true },
    resourceId: { type: mongoose.Schema.Types.ObjectId, ref: "Resource", required: true },
    resourceType: { type: String, enum: ["SHELTER", "LAWYER", "COUNSELLOR"], required: true },
    status: {
      type: String,
      enum: ["PENDING_CONSENT", "CONSENT_GRANTED", "ACCEPTED", "REJECTED"],
      default: "PENDING_CONSENT"
    },
    authorizedFields: {
      shareLegalIssue: { type: Boolean, default: false },
      shareBasicSummary: { type: Boolean, default: false },
      shareDocuments: { type: Boolean, default: false },
      shareShelterNeeds: { type: Boolean, default: false },
      shareContactNumber: { type: Boolean, default: false }
    },
    consentDurationDays: { type: Number, default: 30 }
  },
  { timestamps: true }
);

export default mongoose.model("Referral", referralSchema);