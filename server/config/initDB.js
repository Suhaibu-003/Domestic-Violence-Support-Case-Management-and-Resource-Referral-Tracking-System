import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Case from "../models/Case.js";
import Resource from "../models/Resource.js";
import { resourceData } from "../seeds/resourceData.js";

const LAWYERS = [
  { name: "Advocate R. Sundaram", organizationName: "DLSA Panel Counsel, Chennai High Court Bench", location: "Chennai", specialization: "Domestic Violence", barCouncilEnrollmentNumber: "TN/CHN/2026/001" },
  { name: "Advocate S. Meenakshi", organizationName: "Coimbatore District Court Legal Aid", location: "Coimbatore", specialization: "Maintenance", barCouncilEnrollmentNumber: "TN/CBE/2026/002" },
  { name: "Advocate V. Karpagam", organizationName: "Madurai High Court Legal Services Committee", location: "Madurai", specialization: "Domestic Violence", barCouncilEnrollmentNumber: "TN/MDU/2026/003" },
  { name: "Advocate M. Selvaraj", organizationName: "Trichy Bar Association Pro-Bono Wing", location: "Tiruchirappalli", specialization: "Criminal Defense", barCouncilEnrollmentNumber: "TN/TRI/2026/004" },
  { name: "Advocate P. Balamurugan", organizationName: "Salem District Legal Defense Clinic", location: "Salem", specialization: "Criminal Defense", barCouncilEnrollmentNumber: "TN/SLM/2026/005" },
  { name: "Advocate K. Saravanan", organizationName: "Erode DLSA Women Rights Desk", location: "Erode", specialization: "Domestic Violence", barCouncilEnrollmentNumber: "TN/ERD/2026/006" },
  { name: "Advocate T. Gomathi", organizationName: "Nellai District Legal Services Cell", location: "Tirunelveli", specialization: "Maintenance", barCouncilEnrollmentNumber: "TN/TNV/2026/007" },
  { name: "Advocate N. Damodaran", organizationName: "Vellore Bar Legal Help Unit", location: "Vellore", specialization: "Criminal Defense", barCouncilEnrollmentNumber: "TN/VLR/2026/008" },
  { name: "Advocate D. Rajendran", organizationName: "Thanjavur Legal Defense Panel", location: "Thanjavur", specialization: "Domestic Violence", barCouncilEnrollmentNumber: "TN/TNJ/2026/009" },
  { name: "Advocate A. Fatima", organizationName: "Dindigul Pro-Bono Legal Assistance Desk", location: "Dindigul", specialization: "Maintenance", barCouncilEnrollmentNumber: "TN/DGL/2026/010" }
];

const SURVIVORS = [
  { name: "Kavitha Selvam", email: "kavitha.erode@sahaya.org", alias: "SH_Kavitha_Erode", location: "Erode", needs: ["SHELTER", "LEGAL"], stage: "RESOLVED", incidentSummary: "Safe shelter allocated and legal aid confirmed." },
  { name: "Ananya Krishnan", email: "ananya.chennai@sahaya.org", alias: "SH_Ananya_Chennai", location: "Chennai", needs: ["HOSPITAL", "COUNSELLING"], stage: "IN_ACTION", incidentSummary: "Medical examination completed; trauma counselling is ongoing." },
  { name: "Meenakshi Ramasamy", email: "meena.madurai@sahaya.org", alias: "SH_Meena_Madurai", location: "Madurai", needs: ["SHELTER"], stage: "TRIAGED", incidentSummary: "Shelter bed secured; transport coordination is underway." },
  { name: "Deepa Natarajan", email: "deepa.cbe@sahaya.org", alias: "SH_Deepa_CBE", location: "Coimbatore", needs: ["LEGAL"], stage: "OPEN", incidentSummary: "Freshly registered case awaiting caseworker review." },
  { name: "Revathi Manoharan", email: "revathi.salem@sahaya.org", alias: "SH_Revathi_Salem", location: "Salem", needs: ["COUNSELLING", "SHELTER"], stage: "RESOLVED", incidentSummary: "Rehabilitation completed; survivor confirmed safe." }
];

const STAGES = ["OPEN", "TRIAGED", "IN_ACTION", "RESOLVED"];
const STAGE_NOTES = {
  OPEN: "Support request received.",
  TRIAGED: "District caseworker reviewed the support request.",
  IN_ACTION: "Support services are being coordinated.",
  RESOLVED: "Survivor confirmed safe and case closed."
};

const makeStageHistory = (stage) => {
  const stageIndex = STAGES.indexOf(stage);
  return STAGES.slice(0, stageIndex + 1).map((currentStage, index) => ({
    stage: currentStage,
    timestamp: new Date(Date.now() - (stageIndex - index) * 60 * 60 * 1000),
    updatedBy: "SAHAYA Demo Seed",
    note: STAGE_NOTES[currentStage]
  }));
};

export async function autoInitializeDB() {
  const existingAdmin = await User.exists({ email: "admin@sahaya.org", role: "ADMIN" });
  if (existingAdmin) {
    console.log("SAHAYA seed skipped: admin account already exists.");
    return;
  }

  console.log("Initializing SAHAYA database with statewide demo data...");
  const [adminPassword, lawyerPassword, survivorPassword] = await Promise.all([
    bcrypt.hash("admin123", 10),
    bcrypt.hash("lawyer@2026", 10),
    bcrypt.hash("survivor@2026", 10)
  ]);

  await Promise.all(LAWYERS.map((lawyer, index) => User.findOneAndUpdate(
    { email: `lawyer.${lawyer.location.toLowerCase().replaceAll(" ", ".")}@sahaya.org` },
    {
      $setOnInsert: {
        ...lawyer,
        email: `lawyer.${lawyer.location.toLowerCase().replaceAll(" ", ".")}@sahaya.org`,
        phone: `+91 98401 ${String(20001 + index).padStart(5, "0")}`,
        password: lawyerPassword,
        role: "ORGANIZATION",
        orgType: "LAWYER",
        status: "APPROVED"
      }
    },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
  )));

  const survivorUsers = await Promise.all(SURVIVORS.map((survivor, index) => User.findOneAndUpdate(
    { email: survivor.email },
    {
      $setOnInsert: {
        name: survivor.name,
        alias: survivor.alias,
        email: survivor.email,
        phone: `+91 94440 ${String(21001 + index).padStart(5, "0")}`,
        password: survivorPassword,
        role: "SURVIVOR",
        location: survivor.location,
        status: "APPROVED"
      }
    },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
  )));

  await Promise.all(SURVIVORS.map((survivor, index) => Case.findOneAndUpdate(
    { caseId: `SH-DEMO-${String(index + 1).padStart(3, "0")}` },
    {
      $setOnInsert: {
        caseId: `SH-DEMO-${String(index + 1).padStart(3, "0")}`,
        survivorId: survivorUsers[index]._id,
        urgency: "IMMEDIATE",
        needs: survivor.needs,
        location: survivor.location,
        preferredLanguage: "Tamil",
        incidentSummary: survivor.incidentSummary,
        status: survivor.stage,
        stage: survivor.stage,
        stageHistory: makeStageHistory(survivor.stage),
        timeline: makeStageHistory(survivor.stage).map((entry) => ({
          title: entry.stage,
          description: entry.note,
          timestamp: entry.timestamp
        }))
      }
    },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
  )));

  const seededNames = resourceData.map(({ name, location }) => ({ name, location }));
  const existingResources = await Resource.find({ $or: seededNames }, { name: 1, location: 1 });
  const existingKeys = new Set(existingResources.map(({ name, location }) => `${location}:${name}`));
  const resourcesToSeed = resourceData.filter(({ name, location }) => !existingKeys.has(`${location}:${name}`));
  if (resourcesToSeed.length) await Resource.insertMany(resourcesToSeed);

  const [seededFacilities, seededLawyers] = await Promise.all([
    Resource.find({ isVerified: true }),
    User.find({ role: "ORGANIZATION", orgType: "LAWYER", status: "APPROVED" })
  ]);
  for (const survivor of SURVIVORS.filter(({ stage }) => stage === "IN_ACTION" || stage === "RESOLVED")) {
    const assignedResources = survivor.needs.flatMap((need) => {
      const type = need === "LEGAL" ? "LAWYER" : need;
      if (type === "LAWYER") {
        const lawyer = seededLawyers.find((entry) => entry.location === survivor.location);
        return lawyer ? [{ resourceId: lawyer._id, resourceModel: "User" }] : [];
      }
      const facility = seededFacilities.find(
        (entry) => entry.location === survivor.location && entry.type === type
      );
      return facility ? [{ resourceId: facility._id, resourceModel: "Resource" }] : [];
    });
    await Case.updateOne(
      { caseId: `SH-DEMO-${String(SURVIVORS.indexOf(survivor) + 1).padStart(3, "0")}` },
      { $set: { assignedResources } }
    );
  }

  await User.create({
    name: "SAHAYA Administrator",
    email: "admin@sahaya.org",
    password: adminPassword,
    role: "ADMIN",
    status: "APPROVED",
    location: "Chennai"
  });

  console.log("SAHAYA database initialized with admin, 10 legal aid users, 40 facilities, and 5 survivor cases.");
}
