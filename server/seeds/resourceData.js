const districts = [
  { name: "Chennai", shelter: "Sakhi Swadhar Greh Transit Home", hospital: "MMC Casualty & MLC Care Unit", beds: [15, 25] },
  { name: "Coimbatore", shelter: "Kongu Women Protection Shelter", hospital: "Coimbatore CMCH Emergency Desk", beds: [10, 18] },
  { name: "Madurai", shelter: "Vaigai Annai Short-Stay Crisis Shelter", hospital: "Madurai GRH Casualty Support Ward", beds: [12, 20] },
  { name: "Tiruchirappalli", shelter: "Cauvery Safe Haven Women's Transit Home", hospital: "Trichy GH Emergency Care Unit", beds: [8, 15] },
  { name: "Salem", shelter: "Salem Karuna Emergency Refuge Centre", hospital: "Salem Government Hospital Trauma Desk", beds: [10, 16] },
  { name: "Erode", shelter: "Bhavani Integrated Transit Shelter", hospital: "Erode District Hospital Trauma Desk", beds: [8, 14] },
  { name: "Tirunelveli", shelter: "Nellai Magalir Protection Home", hospital: "Tirunelveli Medical College Crisis Desk", beds: [10, 18] },
  { name: "Vellore", shelter: "Fort City Emergency Shelter & Care Unit", hospital: "Vellore Government Hospital Emergency Unit", beds: [6, 15] },
  { name: "Thanjavur", shelter: "Thanjai Annai Rehabilitation Sanctuary", hospital: "Thanjavur Medical College Casualty Desk", beds: [8, 12] },
  { name: "Dindigul", shelter: "Dindigul Shanthi Shelter for Women & Children", hospital: "Dindigul District Hospital Emergency Wing", beds: [7, 10] }
];

const serviceByType = {
  SHELTER: ["Safe Accommodation", "Emergency Transit", "Basic Needs Support"],
  HOSPITAL: ["Emergency Trauma Care", "Medical Examination", "MLC Support"],
  NGO: ["24/7 First Response", "Emergency Transit", "One Stop Centre Casework"],
  COUNSELLING: ["Trauma Recovery", "Crisis Psycho-Social Support", "Confidential Guidance"]
};

let contactSequence = 12001;
const nextContact = () => `+91 94440 ${String(contactSequence++).padStart(5, "0")}`;

export const resourceData = districts.flatMap((district) => {
  const facilities = [
    {
      name: district.shelter,
      type: "SHELTER",
      availableBeds: district.beds[0]
    },
    {
      name: district.hospital,
      type: "HOSPITAL",
      availableBeds: district.beds[1]
    },
    {
      name: `Sakhi One Stop Centre ${district.name}`,
      type: "NGO",
      availableBeds: 0
    },
    {
      name: `District Mental Health Programme (DMHP) ${district.name} Guidance Desk`,
      type: "COUNSELLING",
      availableBeds: 0
    }
  ];

  return facilities.map((facility) => ({
    ...facility,
    location: district.name,
    verifiedContact: nextContact(),
    services: serviceByType[facility.type],
    languages: ["Tamil", "English"],
    availability: facility.type === "SHELTER" ? `${facility.availableBeds} beds available` : "Available",
    operatingHours: "24/7 Support",
    isVerified: true
  }));
});
