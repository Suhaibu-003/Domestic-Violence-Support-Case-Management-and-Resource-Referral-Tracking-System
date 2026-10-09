const districts = [
  {
    name: "Chennai",
    shelter: "Sakhi District Swadhar Shelter Home",
    shelterBeds: 15,
    hospital: "Madras Medical College Emergency Trauma Center",
    hospitalBeds: 25
  },
  {
    name: "Coimbatore",
    shelter: "Kongu Region Emergency Transit Home for Women",
    shelterBeds: 10,
    hospital: "Coimbatore CMCH One-Stop Medical Examination Unit",
    hospitalBeds: 18
  },
  {
    name: "Madurai",
    shelter: "Vaigai Annai Short-Stay Crisis Shelter",
    shelterBeds: 12,
    hospital: "Madurai GRH Casualty & Crisis Support Ward",
    hospitalBeds: 20
  },
  {
    name: "Tiruchirappalli",
    shelter: "Cauvery Safe Haven Women's Hostel",
    shelterBeds: 8,
    hospital: "Tiruchirappalli GH Emergency Care Unit",
    hospitalBeds: 15
  },
  {
    name: "Salem",
    shelter: "Salem Karuna Emergency Refuge Desk",
    shelterBeds: 10,
    hospital: "Salem Government Mohan Kumaramangalam Medical Desk",
    hospitalBeds: 16
  },
  {
    name: "Erode",
    shelter: "Bhavani Integrated Transit Shelter",
    shelterBeds: 8,
    hospital: "Erode District Headquarters Hospital Trauma Desk",
    hospitalBeds: 14
  },
  {
    name: "Tirunelveli",
    shelter: "Nellai District Magalir Protection Home",
    shelterBeds: 10,
    hospital: "Tirunelveli Medical College Hospital Crisis Desk",
    hospitalBeds: 18
  },
  {
    name: "Vellore",
    shelter: "Fort City Emergency Shelter & Care Unit",
    shelterBeds: 6,
    hospital: "Vellore Adukkamparai Government Hospital Unit",
    hospitalBeds: 15
  },
  {
    name: "Thanjavur",
    shelter: "Thanjai Annai Rehabilitation Sanctuary",
    shelterBeds: 8,
    hospital: "Thanjavur Medical College Casualty & Recovery Desk",
    hospitalBeds: 12
  },
  {
    name: "Dindigul",
    shelter: "Dindigul Shanthi Shelter for Women & Children",
    shelterBeds: 7,
    hospital: "Dindigul District Head Hospital Emergency Wing",
    hospitalBeds: 10
  }
];

const districtServices = {
  NGO: ["24/7 First Response", "Emergency Transit", "Immediate Triage"],
  LAWYER: ["Free Legal Defense", "DV Interim Protection Orders", "Court Assistance"],
  COUNSELLING: ["Trauma Recovery", "Crisis Psycho-Social Support", "Family Mediation"]
};

let nextContact = 10001;
const nextVerifiedContact = () => `+91 94440 ${String(nextContact++).padStart(5, "0")}`;

export const resourceData = districts.flatMap((district) => [
  {
    name: district.shelter,
    type: "SHELTER",
    location: district.name,
    verifiedContact: nextVerifiedContact(),
    availableBeds: district.shelterBeds,
    services: ["Safe Accommodation", "Emergency Transit", "Basic Needs Support"]
  },
  {
    name: district.hospital,
    type: "HOSPITAL",
    location: district.name,
    verifiedContact: nextVerifiedContact(),
    availableBeds: district.hospitalBeds,
    services: ["Emergency Trauma Care", "Medical Examination", "MLC Support"]
  },
  {
    name: "Sakhi One Stop Centre (OSC) District Cell",
    type: "NGO",
    location: district.name,
    verifiedContact: nextVerifiedContact(),
    availableBeds: 0,
    services: districtServices.NGO
  },
  {
    name: "District Legal Services Authority (DLSA) Help Desk",
    type: "LAWYER",
    location: district.name,
    verifiedContact: nextVerifiedContact(),
    availableBeds: 0,
    services: districtServices.LAWYER
  },
  {
    name: "District Mental Health Programme (DMHP) Counseling Desk",
    type: "COUNSELLING",
    location: district.name,
    verifiedContact: nextVerifiedContact(),
    availableBeds: 0,
    services: districtServices.COUNSELLING
  }
]);
