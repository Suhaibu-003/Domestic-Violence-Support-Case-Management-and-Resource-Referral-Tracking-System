import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Case from "../models/Case.js";
import Resource from "../models/Resource.js";
import { resourceData } from "../seeds/resourceData.js";

const DISTRICTS = [
  "Chennai",
  "Coimbatore",
  "Madurai",
  "Trichy",
  "Salem",
  "Erode",
  "Tirunelveli",
  "Vellore",
  "Thanjavur",
  "Dindigul"
];

const ORGANIZATION_TYPES = [
  "SHELTER",
  "HOSPITAL",
  "NGO",
  "LAWYER",
  "COUNSELLING",
  "SHELTER",
  "HOSPITAL",
  "NGO",
  "LAWYER",
  "COUNSELLING"
];

const SURVIVORS = [
  {
    name: "Kavitha Selvam",
    alias: "SH_Kavitha_Erode",
    email: "kavitha.erode@sahaya-demo.org",
    phone: "+91 98401 11001",
    location: "Erode",
    needs: ["SHELTER", "LEGAL"],
    summary: "Urgent safe shelter and legal injunction support requested."
  },
  {
    name: "Ananya Krishnan",
    alias: "SH_Ananya_Chennai",
    email: "ananya.chennai@sahaya-demo.org",
    phone: "+91 98401 11002",
    location: "Chennai",
    needs: ["HOSPITAL", "COUNSELLING"],
    summary: "Emergency medical examination and trauma counselling requested."
  },
  {
    name: "Meenakshi Ramasamy",
    alias: "SH_Meena_Madurai",
    email: "meena.madurai@sahaya-demo.org",
    phone: "+91 98401 11003",
    location: "Madurai",
    needs: ["SHELTER", "HOSPITAL"],
    summary: "Safe transit accommodation and medical support requested."
  },
  {
    name: "Deepa Natarajan",
    alias: "SH_Deepa_Coimbatore",
    email: "deepa.coimbatore@sahaya-demo.org",
    phone: "+91 98401 11004",
    location: "Coimbatore",
    needs: ["LAWYER"],
    summary: "Legal assistance for protection and maintenance proceedings requested."
  },
  {
    name: "Revathi Manoharan",
    alias: "SH_Revathi_Salem",
    email: "revathi.salem@sahaya-demo.org",
    phone: "+91 98401 11005",
    location: "Salem",
    needs: ["COUNSELLING", "SHELTER"],
    summary: "Trauma counselling and safe short-term lodging requested."
  }
];

export async function autoInitializeDB() {
  const existingAdmin = await User.findOne({ role: "ADMIN" });

  if (existingAdmin) {
    const seededResources = await Resource.find(
      { $or: resourceData.map(({ name, location }) => ({ name, location })) },
      { name: 1, location: 1 }
    );
    const seededResourceKeys = new Set(
      seededResources.map(({ name, location }) => `${location}:${name}`)
    );
    const resourcesToSeed = resourceData.filter(
      (resource) => !seededResourceKeys.has(`${resource.location}:${resource.name}`)
    );

    if (resourcesToSeed.length > 0) {
      await Resource.insertMany(resourcesToSeed);
    }

    console.log("Database already initialized");
    return;
  }

  console.log("Initializing SAHAYA database with demo data...");

  const passwordHash = await bcrypt.hash("admin123", 10);
  await User.create({
    name: "SAHAYA Administrator",
    email: "admin@sahaya.org",
    password: passwordHash,
    role: "ADMIN",
    status: "APPROVED",
    location: "Chennai"
  });

  const organizationPasswordHash = await bcrypt.hash("org123", 10);
  await User.insertMany(
    DISTRICTS.map((district, index) => ({
      name: `${district} ${ORGANIZATION_TYPES[index]} Support Centre`,
      email: `demo.${district.toLowerCase()}@sahaya.org`,
      phone: `+91 94440 ${String(index + 1).padStart(5, "0")}`,
      password: organizationPasswordHash,
      role: "ORGANIZATION",
      orgType: ORGANIZATION_TYPES[index],
      organizationName: `${district} ${ORGANIZATION_TYPES[index]} Support Centre`,
      location: district,
      status: "APPROVED"
    }))
  );

  await Resource.insertMany(resourceData);

  const survivorPasswordHash = await bcrypt.hash("survivor123", 10);
  const survivors = await User.insertMany(
    SURVIVORS.map((survivor) => ({
      ...survivor,
      password: survivorPasswordHash,
      role: "SURVIVOR",
      status: "APPROVED",
      preferredLanguage: "Tamil"
    }))
  );

  await Case.insertMany(
    survivors.map((survivor, index) => ({
      caseId: `SH-2026-${String(index + 1).padStart(3, "0")}`,
      survivorId: survivor._id,
      urgency: index === 0 || index === 2 ? "IMMEDIATE" : "WITHIN_24_HOURS",
      needs: SURVIVORS[index].needs,
      location: SURVIVORS[index].location,
      preferredLanguage: "Tamil",
      incidentSummary: SURVIVORS[index].summary,
      status: "OPEN"
    }))
  );

  console.log("SAHAYA database initialized with admin, organizations, resources, survivors, and cases");
}
