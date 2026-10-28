import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Case from "../models/Case.js";
import Resource from "../models/Resource.js";
import { resourceData } from "../seeds/resourceData.js";

const DISTRICTS = [
  "Chennai",
  "Coimbatore",
  "Madurai",
  "Tiruchirappalli",
  "Salem",
  "Erode",
  "Tirunelveli",
  "Vellore",
  "Thanjavur",
  "Dindigul"
];

const ORGANIZATION_TYPES = [
  "HOSPITAL",
  "LAWYER",
  "SHELTER",
  "COUNSELLING",
  "SHELTER",
  "NGO",
  "HOSPITAL",
  "LAWYER",
  "COUNSELLING",
  "NGO"
];

const SURVIVORS = [
  {
    name: "Kavitha Selvam",
    email: "kavitha.erode@sahaya.org",
    password: "kavitha@2026",
    alias: "SH_Kavitha_Erode",
    location: "Erode",
    needs: ["SHELTER", "LEGAL"],
    status: "RESOLVED",
    incidentSummary: "Safe shelter allocated and legal aid confirmed.",
    progress: [
      ["Report Received", "Confidential report recorded."],
      ["Caseworker Triaged", "District caseworker reviewed the support request."],
      ["Services Dispatched", "Safe shelter allocated and legal aid confirmed."],
      ["Resolved & Secured", "Survivor confirmed safe and case closed."]
    ]
  },
  {
    name: "Ananya Krishnan",
    email: "ananya.chennai@sahaya.org",
    password: "ananya@2026",
    alias: "SH_Ananya_Chennai",
    location: "Chennai",
    needs: ["HOSPITAL", "COUNSELLING"],
    status: "IN_ACTION",
    incidentSummary: "Medical examination completed; trauma counselling is ongoing.",
    progress: [
      ["Report Received", "Confidential report recorded."],
      ["Caseworker Triaged", "A caseworker coordinated medical support."],
      ["Services Dispatched", "Medical examination complete; trauma counselling ongoing."]
    ]
  },
  {
    name: "Meenakshi Ramasamy",
    email: "meenakshi.madurai@sahaya.org",
    password: "meena@2026",
    alias: "SH_Meena_Madurai",
    location: "Madurai",
    needs: ["SHELTER"],
    status: "TRIAGED",
    incidentSummary: "Shelter bed secured; transport coordination is underway.",
    progress: [
      ["Report Received", "Confidential report recorded."],
      ["Caseworker Triaged", "Shelter bed locked; transport coordination underway."]
    ]
  },
  {
    name: "Deepa Natarajan",
    email: "deepa.cbe@sahaya.org",
    password: "deepa@2026",
    alias: "SH_Deepa_CBE",
    location: "Coimbatore",
    needs: ["LEGAL"],
    status: "OPEN",
    incidentSummary: "Freshly registered case awaiting caseworker review.",
    progress: [["Report Received", "Freshly registered case awaiting caseworker review."]]
  },
  {
    name: "Revathi Manoharan",
    email: "revathi.salem@sahaya.org",
    password: "revathi@2026",
    alias: "SH_Revathi_Salem",
    location: "Salem",
    needs: ["COUNSELLING", "SHELTER"],
    status: "RESOLVED",
    incidentSummary: "Rehabilitation completed; survivor confirmed safe.",
    progress: [
      ["Report Received", "Confidential report recorded."],
      ["Caseworker Triaged", "Local support plan agreed with the survivor."],
      ["Services Dispatched", "Shelter and counselling support were coordinated."],
      ["Resolved & Secured", "Rehabilitation completed; survivor confirmed safe."]
    ]
  }
];

const makeTimeline = (steps) => {
  const now = Date.now();
  return steps.map(([title, description], index) => ({
    title,
    description,
    timestamp: new Date(now - (steps.length - index - 1) * 60 * 60 * 1000)
  }));
};

export async function autoInitializeDB() {
  console.log("Initializing SAHAYA database with demo data...");

  const adminPassword = await bcrypt.hash("admin123", 10);
  await User.findOneAndUpdate(
    { email: "admin@sahaya.org" },
    {
      $set: {
        name: "SAHAYA Administrator",
        email: "admin@sahaya.org",
        password: adminPassword,
        role: "ADMIN",
        status: "APPROVED",
        location: "Chennai"
      }
    },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
  );

  const organizationPassword = await bcrypt.hash("org@2026", 10);
  await Promise.all(
    DISTRICTS.map(async (district, index) => {
      const orgType = ORGANIZATION_TYPES[index];
      const organizationName = `${district} ${orgType} Support Centre`;
      await User.findOneAndUpdate(
        { email: `demo.${district.toLowerCase()}@sahaya.org` },
        {
          $set: {
            name: `${district} Support Coordinator`,
            email: `demo.${district.toLowerCase()}@sahaya.org`,
            phone: `+91 94440 ${String(index + 1).padStart(5, "0")}`,
            password: organizationPassword,
            role: "ORGANIZATION",
            orgType,
            organizationName,
            location: district,
            status: "APPROVED"
          }
        },
        { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
      );
    })
  );

  const survivorPasswordHashes = await Promise.all(
    SURVIVORS.map(({ password }) => bcrypt.hash(password, 10))
  );
  const survivorUsers = await Promise.all(
    SURVIVORS.map(async (survivor, index) => User.findOneAndUpdate(
      { email: survivor.email },
      {
        $set: {
          name: survivor.name,
          alias: survivor.alias,
          email: survivor.email,
          password: survivorPasswordHashes[index],
          role: "SURVIVOR",
          location: survivor.location,
          status: "APPROVED"
        }
      },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    ))
  );

  await Promise.all(
    SURVIVORS.map((survivor, index) => Case.findOneAndUpdate(
      { caseId: `SH-DEMO-${String(index + 1).padStart(3, "0")}` },
      {
        $set: {
          caseId: `SH-DEMO-${String(index + 1).padStart(3, "0")}`,
          survivorId: survivorUsers[index]._id,
          assignedCaseworkerId: null,
          urgency: "IMMEDIATE",
          needs: survivor.needs,
          location: survivor.location,
          preferredLanguage: "Tamil",
          incidentSummary: survivor.incidentSummary,
          status: survivor.status,
          timeline: makeTimeline(survivor.progress)
        }
      },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    ))
  );

  const existingResources = await Resource.find(
    { $or: resourceData.map(({ name, location }) => ({ name, location })) },
    { name: 1, location: 1 }
  );
  const existingResourceKeys = new Set(
    existingResources.map(({ name, location }) => `${location}:${name}`)
  );
  const resourcesToSeed = resourceData.filter(
    (resource) => !existingResourceKeys.has(`${resource.location}:${resource.name}`)
  );
  if (resourcesToSeed.length > 0) await Resource.insertMany(resourcesToSeed);

  console.log("SAHAYA database initialized with admin, 10 organizations, resources, and 5 survivor cases");
}
