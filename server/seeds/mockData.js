import mongoose from "mongoose";
import dotenv from "dotenv";
import Resource from "../models/Resource.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/sahaya";

export const mockResources = [
  // 1. CHENNAI
  {
    name: "Chennai Sakhi One Stop Crisis Centre",
    type: "NGO",
    location: "Chennai",
    services: ["Emergency Triage", "First-Response Care", "Survivor Transit"],
    languages: ["Tamil", "English"],
    availability: "Available",
    availableBeds: 0,
    verifiedContact: "+91 94440 10001",
    operatingHours: "24/7",
    isVerified: true
  },
  {
    name: "Safe Steps Women Shelter",
    type: "SHELTER",
    location: "Chennai",
    services: ["Secured Lodging", "Child Accommodation", "Meal Provision"],
    languages: ["Tamil", "English"],
    availability: "Available",
    availableBeds: 12,
    verifiedContact: "+91 94440 10002",
    operatingHours: "24/7",
    isVerified: true
  },
  {
    name: "Madras General Trauma Care Unit",
    type: "HOSPITAL",
    location: "Chennai",
    services: ["Emergency Trauma Care", "Forensic MLC Examination", "Medical Triage"],
    languages: ["Tamil", "English", "Hindi"],
    availability: "Available",
    availableBeds: 25,
    verifiedContact: "+91 94440 10003",
    operatingHours: "24/7",
    isVerified: true
  },
  {
    name: "Aram Legal Defense Forum",
    type: "LAWYER",
    location: "Chennai",
    services: ["DV Protection Orders", "Free Legal Aid", "Interim Relief Filing"],
    languages: ["Tamil", "English"],
    availability: "Available",
    availableBeds: 0,
    verifiedContact: "+91 94440 10004",
    operatingHours: "9:00 AM - 6:00 PM",
    isVerified: true
  },
  {
    name: "Nalam Mind Guidance & Counselling",
    type: "COUNSELLING",
    location: "Chennai",
    services: ["Trauma Therapy", "Crisis Counseling", "PTSD Recovery"],
    languages: ["Tamil", "English"],
    availability: "Available",
    availableBeds: 0,
    verifiedContact: "+91 94440 10005",
    operatingHours: "10:00 AM - 7:00 PM",
    isVerified: true
  },

  // 2. COIMBATORE
  {
    name: "Kovai Thozhi Women Foundation",
    type: "NGO",
    location: "Coimbatore",
    services: ["Survivor Intake", "Vocational Rehabilitation", "Field Support"],
    languages: ["Tamil", "English"],
    availability: "Available",
    availableBeds: 0,
    verifiedContact: "+91 94440 20001",
    operatingHours: "24/7",
    isVerified: true
  },
  {
    name: "Western Ghats Emergency Transit Shelter",
    type: "SHELTER",
    location: "Coimbatore",
    services: ["Emergency Stay", "Confidential Refuge", "Clothing & Food"],
    languages: ["Tamil", "English", "Malayalam"],
    availability: "Available",
    availableBeds: 8,
    verifiedContact: "+91 94440 20002",
    operatingHours: "24/7",
    isVerified: true
  },
  {
    name: "Coimbatore Medical College Hospital Desk",
    type: "HOSPITAL",
    location: "Coimbatore",
    services: ["Emergency Trauma", "Physical Recovery Support", "MLC Recording"],
    languages: ["Tamil", "English"],
    availability: "Available",
    availableBeds: 18,
    verifiedContact: "+91 94440 20003",
    operatingHours: "24/7",
    isVerified: true
  },
  {
    name: "Neethi Legal Aid Clinic",
    type: "LAWYER",
    location: "Coimbatore",
    services: ["District Court Representation", "Restraining Orders"],
    languages: ["Tamil", "English"],
    availability: "Available",
    availableBeds: 0,
    verifiedContact: "+91 94440 20004",
    operatingHours: "9:30 AM - 5:30 PM",
    isVerified: true
  },
  {
    name: "Manam Psycho-Social Care Desk",
    type: "COUNSELLING",
    location: "Coimbatore",
    services: ["Domestic Abuse Recovery", "Anxiety Therapy"],
    languages: ["Tamil", "English"],
    availability: "Available",
    availableBeds: 0,
    verifiedContact: "+91 94440 20005",
    operatingHours: "9:00 AM - 6:00 PM",
    isVerified: true
  },

  // 3. MADURAI
  {
    name: "Meenakshi Magalir Support Centre",
    type: "NGO",
    location: "Madurai",
    services: ["Case Advocacy", "Community Triage", "Legal Handoff"],
    languages: ["Tamil"],
    availability: "Available",
    availableBeds: 0,
    verifiedContact: "+91 94440 30001",
    operatingHours: "24/7",
    isVerified: true
  },
  {
    name: "Vaigai Shelter for Women",
    type: "SHELTER",
    location: "Madurai",
    services: ["Safe House Protection", "Meals", "Children Ward"],
    languages: ["Tamil"],
    availability: "Available",
    availableBeds: 10,
    verifiedContact: "+91 94440 30002",
    operatingHours: "24/7",
    isVerified: true
  },
  {
    name: "Madurai Government Rajaji Hospital Annex",
    type: "HOSPITAL",
    location: "Madurai",
    services: ["Emergency First Care", "Forensic Documentation"],
    languages: ["Tamil", "English"],
    availability: "Available",
    availableBeds: 20,
    verifiedContact: "+91 94440 30003",
    operatingHours: "24/7",
    isVerified: true
  },
  {
    name: "Pandian Legal Support Bureau",
    type: "LAWYER",
    location: "Madurai",
    services: ["High Court Bench Legal Aid", "DV Act Petition Assistance"],
    languages: ["Tamil", "English"],
    availability: "Available",
    availableBeds: 0,
    verifiedContact: "+91 94440 30004",
    operatingHours: "10:00 AM - 6:00 PM",
    isVerified: true
  },
  {
    name: "Sanidhyam Trauma Recovery",
    type: "COUNSELLING",
    location: "Madurai",
    services: ["Emotional First Aid", "Individual Crisis Therapy"],
    languages: ["Tamil"],
    availability: "Available",
    availableBeds: 0,
    verifiedContact: "+91 94440 30005",
    operatingHours: "9:00 AM - 5:00 PM",
    isVerified: true
  },

  // 4. TIRUCHIRAPPALLI (TRICHY)
  {
    name: "Kaveri Women Welfare Trust",
    type: "NGO",
    location: "Tiruchirappalli",
    services: ["Grassroot Triage", "Safe Transit Coordination"],
    languages: ["Tamil", "English"],
    availability: "Available",
    availableBeds: 0,
    verifiedContact: "+91 94440 40001",
    operatingHours: "24/7",
    isVerified: true
  },
  {
    name: "Rockfort Safe Shelter Home",
    type: "SHELTER",
    location: "Tiruchirappalli",
    services: ["Emergency Lodging", "Nutritional Care", "Gated Security"],
    languages: ["Tamil"],
    availability: "Available",
    availableBeds: 6,
    verifiedContact: "+91 94440 40002",
    operatingHours: "24/7",
    isVerified: true
  },
  {
    name: "Trichy District Headquarters Hospital",
    type: "HOSPITAL",
    location: "Tiruchirappalli",
    services: ["24-Hour Casualty", "Survivor Medical Relief"],
    languages: ["Tamil", "English"],
    availability: "Available",
    availableBeds: 14,
    verifiedContact: "+91 94440 40003",
    operatingHours: "24/7",
    isVerified: true
  },
  {
    name: "Tiruchirappalli Bar Legal Aid Panel",
    type: "LAWYER",
    location: "Tiruchirappalli",
    services: ["Free Legal Counseling", "Custody & Injunction Orders"],
    languages: ["Tamil", "English"],
    availability: "Available",
    availableBeds: 0,
    verifiedContact: "+91 94440 40004",
    operatingHours: "9:30 AM - 5:00 PM",
    isVerified: true
  },
  {
    name: "Uravu Family & Crisis Counseling",
    type: "COUNSELLING",
    location: "Tiruchirappalli",
    services: ["Trauma Therapy", "Depression Counseling"],
    languages: ["Tamil"],
    availability: "Available",
    availableBeds: 0,
    verifiedContact: "+91 94440 40005",
    operatingHours: "10:00 AM - 6:00 PM",
    isVerified: true
  },

  // 5. SALEM
  {
    name: "Salem Sakhi Support Unit",
    type: "NGO",
    location: "Salem",
    services: ["Case Filing", "Emergency Rescue", "Referral Management"],
    languages: ["Tamil"],
    availability: "Available",
    availableBeds: 0,
    verifiedContact: "+91 94440 50001",
    operatingHours: "24/7",
    isVerified: true
  },
  {
    name: "Shevaroys Women Safe Home",
    type: "SHELTER",
    location: "Salem",
    services: ["Emergency Bed Accommodation", "Sanitary Supplies"],
    languages: ["Tamil"],
    availability: "Available",
    availableBeds: 7,
    verifiedContact: "+91 94440 50002",
    operatingHours: "24/7",
    isVerified: true
  },
  {
    name: "Salem Mohan Kumaramangalam Medical Hospital",
    type: "HOSPITAL",
    location: "Salem",
    services: ["Emergency Care", "Inpatient Stabilization", "Forensic Records"],
    languages: ["Tamil", "English"],
    availability: "Available",
    availableBeds: 16,
    verifiedContact: "+91 94440 50003",
    operatingHours: "24/7",
    isVerified: true
  },
  {
    name: "Salem District Legal Services Authority Clinic",
    type: "LAWYER",
    location: "Salem",
    services: ["Legal Advice", "Writ Petition Filing", "Protection Support"],
    languages: ["Tamil", "English"],
    availability: "Available",
    availableBeds: 0,
    verifiedContact: "+91 94440 50004",
    operatingHours: "9:00 AM - 5:00 PM",
    isVerified: true
  },
  {
    name: "Prana Mind Wellness Clinic",
    type: "COUNSELLING",
    location: "Salem",
    services: ["Post-Abuse Recovery", "Stress Intervention"],
    languages: ["Tamil"],
    availability: "Available",
    availableBeds: 0,
    verifiedContact: "+91 94440 50005",
    operatingHours: "9:00 AM - 6:00 PM",
    isVerified: true
  },

  // 6. ERODE
  {
    name: "Bhavani Valley Community Support NGO",
    type: "NGO",
    location: "Erode",
    services: ["Domestic Case Triage", "Rural Women Helpline"],
    languages: ["Tamil"],
    availability: "Available",
    availableBeds: 0,
    verifiedContact: "+91 94440 60001",
    operatingHours: "24/7",
    isVerified: true
  },
  {
    name: "Safe Home Erode",
    type: "SHELTER",
    location: "Erode",
    services: ["Emergency Stay", "Food & Protection", "Child Care"],
    languages: ["Tamil", "English"],
    availability: "Available",
    availableBeds: 9,
    verifiedContact: "+91 94440 60002",
    operatingHours: "24/7",
    isVerified: true
  },
  {
    name: "Erode Government Headquarters Hospital",
    type: "HOSPITAL",
    location: "Erode",
    services: ["Emergency Trauma Support", "Forensic Medical Audit"],
    languages: ["Tamil", "English"],
    availability: "Available",
    availableBeds: 15,
    verifiedContact: "+91 94440 60003",
    operatingHours: "24/7",
    isVerified: true
  },
  {
    name: "Erode District Legal Defense Bureau",
    type: "LAWYER",
    location: "Erode",
    services: ["Free Legal Defense", "Maintenance Claims"],
    languages: ["Tamil", "English"],
    availability: "Available",
    availableBeds: 0,
    verifiedContact: "+91 94440 60004",
    operatingHours: "9:30 AM - 5:30 PM",
    isVerified: true
  },
  {
    name: "Thulir Trauma Guidance Center",
    type: "COUNSELLING",
    location: "Erode",
    services: ["Crisis Counseling", "Mental Health Rehabilitation"],
    languages: ["Tamil"],
    availability: "Available",
    availableBeds: 0,
    verifiedContact: "+91 94440 60005",
    operatingHours: "10:00 AM - 6:00 PM",
    isVerified: true
  },

  // 7. TIRUNELVELI
  {
    name: "Nellai Magalir Munnetra Trust",
    type: "NGO",
    location: "Tirunelveli",
    services: ["Survivor Emergency Outreach", "Helpline Coordination"],
    languages: ["Tamil"],
    availability: "Available",
    availableBeds: 0,
    verifiedContact: "+91 94440 70001",
    operatingHours: "24/7",
    isVerified: true
  },
  {
    name: "Thamirabarani Women Shelter",
    type: "SHELTER",
    location: "Tirunelveli",
    services: ["Secured Rooms", "Essential Kits", "Counseling Access"],
    languages: ["Tamil"],
    availability: "Available",
    availableBeds: 8,
    verifiedContact: "+91 94440 70002",
    operatingHours: "24/7",
    isVerified: true
  },
  {
    name: "Tirunelveli Medical College Hospital",
    type: "HOSPITAL",
    location: "Tirunelveli",
    services: ["Casualty & Inpatient", "Medical Evaluation"],
    languages: ["Tamil", "English"],
    availability: "Available",
    availableBeds: 22,
    verifiedContact: "+91 94440 70003",
    operatingHours: "24/7",
    isVerified: true
  },
  {
    name: "Nellai Justice Legal Aid Wing",
    type: "LAWYER",
    location: "Tirunelveli",
    services: ["Protection Injunctions", "Magistrate Court Representation"],
    languages: ["Tamil"],
    availability: "Available",
    availableBeds: 0,
    verifiedContact: "+91 94440 70004",
    operatingHours: "9:30 AM - 5:00 PM",
    isVerified: true
  },
  {
    name: "Nambikkai Psycho-Social Support",
    type: "COUNSELLING",
    location: "Tirunelveli",
    services: ["Trauma Therapy", "Confidence Rebuilding"],
    languages: ["Tamil"],
    availability: "Available",
    availableBeds: 0,
    verifiedContact: "+91 94440 70005",
    operatingHours: "10:00 AM - 5:00 PM",
    isVerified: true
  },

  // 8. VELLORE
  {
    name: "Palaiyar Rural Women Initiative",
    type: "NGO",
    location: "Vellore",
    services: ["Community Intake", "Transit Assistance"],
    languages: ["Tamil", "English"],
    availability: "Available",
    availableBeds: 0,
    verifiedContact: "+91 94440 80001",
    operatingHours: "24/7",
    isVerified: true
  },
  {
    name: "Fort City Safe Shelter",
    type: "SHELTER",
    location: "Vellore",
    services: ["Crisis Stay", "Meals & Healthcare Triage"],
    languages: ["Tamil", "Telugu"],
    availability: "Available",
    availableBeds: 5,
    verifiedContact: "+91 94440 80002",
    operatingHours: "24/7",
    isVerified: true
  },
  {
    name: "Adukkamparai Government Medical Hospital",
    type: "HOSPITAL",
    location: "Vellore",
    services: ["Trauma Care", "Medical Recovery", "Forensic Documentation"],
    languages: ["Tamil", "English"],
    availability: "Available",
    availableBeds: 18,
    verifiedContact: "+91 94440 80003",
    operatingHours: "24/7",
    isVerified: true
  },
  {
    name: "Vellore District Pro-Bono Advocates Panel",
    type: "LAWYER",
    location: "Vellore",
    services: ["Domestic Violence Litigations", "Legal Consultation"],
    languages: ["Tamil", "English"],
    availability: "Available",
    availableBeds: 0,
    verifiedContact: "+91 94440 80004",
    operatingHours: "9:00 AM - 5:00 PM",
    isVerified: true
  },
  {
    name: "Sneham Emotional Crisis Centre",
    type: "COUNSELLING",
    location: "Vellore",
    services: ["Therapeutic Interventions", "Trauma Processing"],
    languages: ["Tamil"],
    availability: "Available",
    availableBeds: 0,
    verifiedContact: "+91 94440 80005",
    operatingHours: "10:00 AM - 6:00 PM",
    isVerified: true
  },

  // 9. THANJAVUR
  {
    name: "Delta Region Social Welfare Centre",
    type: "NGO",
    location: "Thanjavur",
    services: ["Crisis Coordination", "Survivor Escort Services"],
    languages: ["Tamil"],
    availability: "Available",
    availableBeds: 0,
    verifiedContact: "+91 94440 90001",
    operatingHours: "24/7",
    isVerified: true
  },
  {
    name: "Chola Annai Sanctuary Shelter",
    type: "SHELTER",
    location: "Thanjavur",
    services: ["Emergency Bed Accommodation", "Safety Shield"],
    languages: ["Tamil"],
    availability: "Available",
    availableBeds: 7,
    verifiedContact: "+91 94440 90002",
    operatingHours: "24/7",
    isVerified: true
  },
  {
    name: "Thanjavur Medical College Hospital Ward",
    type: "HOSPITAL",
    location: "Thanjavur",
    services: ["Emergency Stabilization", "Specialized Care"],
    languages: ["Tamil", "English"],
    availability: "Available",
    availableBeds: 14,
    verifiedContact: "+91 94440 90003",
    operatingHours: "24/7",
    isVerified: true
  },
  {
    name: "Delta Legal Defenders Unit",
    type: "LAWYER",
    location: "Thanjavur",
    services: ["Free Legal Assistance", "Maintenance Petitions"],
    languages: ["Tamil"],
    availability: "Available",
    availableBeds: 0,
    verifiedContact: "+91 94440 90004",
    operatingHours: "9:30 AM - 5:30 PM",
    isVerified: true
  },
  {
    name: "Nalvazhi Mental Well-being Clinic",
    type: "COUNSELLING",
    location: "Thanjavur",
    services: ["Trauma Therapy", "Grief & Shock Relief"],
    languages: ["Tamil"],
    availability: "Available",
    availableBeds: 0,
    verifiedContact: "+91 94440 90005",
    operatingHours: "9:00 AM - 5:00 PM",
    isVerified: true
  },

  // 10. DINDIGUL
  {
    name: "Kodaikanal Foothills Action NGO",
    type: "NGO",
    location: "Dindigul",
    services: ["Crisis Case Handoff", "First Aid Logistics"],
    languages: ["Tamil"],
    availability: "Available",
    availableBeds: 0,
    verifiedContact: "+91 94440 01001",
    operatingHours: "24/7",
    isVerified: true
  },
  {
    name: "Dindigul Karuna Safe Refuge",
    type: "SHELTER",
    location: "Dindigul",
    services: ["Protected Rooms", "Basic Essentials", "Medical Transit"],
    languages: ["Tamil"],
    availability: "Available",
    availableBeds: 6,
    verifiedContact: "+91 94440 01002",
    operatingHours: "24/7",
    isVerified: true
  },
  {
    name: "Dindigul Government District Hospital",
    type: "HOSPITAL",
    location: "Dindigul",
    services: ["Emergency Trauma", "Forensic Records"],
    languages: ["Tamil", "English"],
    availability: "Available",
    availableBeds: 10,
    verifiedContact: "+91 94440 01003",
    operatingHours: "24/7",
    isVerified: true
  },
  {
    name: "Dindigul Legal Aid Aid Center",
    type: "LAWYER",
    location: "Dindigul",
    services: ["Court Representation", "Protection Orders"],
    languages: ["Tamil"],
    availability: "Available",
    availableBeds: 0,
    verifiedContact: "+91 94440 01004",
    operatingHours: "9:00 AM - 5:00 PM",
    isVerified: true
  },
  {
    name: "Thendral Crisis Support Desk",
    type: "COUNSELLING",
    location: "Dindigul",
    services: ["Psychological Support", "Family Counseling"],
    languages: ["Tamil"],
    availability: "Available",
    availableBeds: 0,
    verifiedContact: "+91 94440 01005",
    operatingHours: "10:00 AM - 6:00 PM",
    isVerified: true
  }
];

async function loadMockData() {
  try {
    await mongoose.connect(MONGO_URI);

    // Drop the collection completely to clear any old 2dsphere geo indexes
    try {
      await mongoose.connection.db.dropCollection("resources");
    } catch (dropErr) {
      // Ignore if collection doesn't exist yet
      if (dropErr.code !== 26) {
        console.log("Collection drop note:", dropErr.message);
      }
    }

    // Insert the 50 mock resources
    await Resource.insertMany(mockResources);
    console.log(`✓ Successfully seeded ${mockResources.length} mock resources across 10 Tamil Nadu districts.`);
    process.exit(0);
  } catch (err) {
    console.error("Failed to seed mock data:", err);
    process.exit(1);
  }
}

loadMockData();
