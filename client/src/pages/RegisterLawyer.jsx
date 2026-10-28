import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const districts = [
  "Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem",
  "Erode", "Tirunelveli", "Vellore", "Thanjavur", "Dindigul"
];

const specializations = ["Domestic Violence", "Maintenance", "Criminal Defense"];

export default function RegisterLawyer() {
  const [formData, setFormData] = useState({
    name: "",
    barCouncilEnrollmentNumber: "",
    location: "",
    specialization: "",
    phone: "",
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const updateField = (field) => (event) => {
    setFormData((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await axios.post("http://localhost:5000/api/auth/register/lawyer", {
        ...formData,
        role: "ORGANIZATION",
        orgType: "LAWYER"
      });
      if (response.data.success) {
        alert("Lawyer application submitted. Your account is pending Admin approval.");
        navigate("/login");
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 font-sans">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-xs">
        <h1 className="text-lg font-bold text-slate-900">Pro-Bono Lawyer Onboarding</h1>
        <p className="mb-6 mt-1 text-xs text-slate-500">Submit your legal aid details for verification by the SAHAYA administrator.</p>

        {error && <p role="alert" className="mb-4 rounded-lg bg-rose-50 p-3 text-xs text-rose-700">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <label className="block font-semibold text-slate-700">
            Full Name
            <input required value={formData.name} onChange={updateField("name")} placeholder="Enter your full name" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal focus:outline-none focus:ring-2 focus:ring-indigo-600" />
          </label>

          <label className="block font-semibold text-slate-700">
            Bar Council Enrollment Number
            <input required value={formData.barCouncilEnrollmentNumber} onChange={updateField("barCouncilEnrollmentNumber")} placeholder="Enter your bar council enrollment number" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal focus:outline-none focus:ring-2 focus:ring-indigo-600" />
          </label>

          <label className="block font-semibold text-slate-700">
            District
            <select required value={formData.location} onChange={updateField("location")} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal focus:outline-none focus:ring-2 focus:ring-indigo-600">
              <option value="" disabled>Select your district</option>
              {districts.map((district) => <option key={district} value={district}>{district}</option>)}
            </select>
          </label>

          <label className="block font-semibold text-slate-700">
            Specialization
            <select required value={formData.specialization} onChange={updateField("specialization")} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal focus:outline-none focus:ring-2 focus:ring-indigo-600">
              <option value="" disabled>Select your legal specialization</option>
              {specializations.map((specialization) => <option key={specialization} value={specialization}>{specialization}</option>)}
            </select>
          </label>

          <label className="block font-semibold text-slate-700">
            Contact Phone
            <input required type="tel" value={formData.phone} onChange={updateField("phone")} placeholder="Enter your phone number" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal focus:outline-none focus:ring-2 focus:ring-indigo-600" />
          </label>

          <label className="block font-semibold text-slate-700">
            Email
            <input required type="email" value={formData.email} onChange={updateField("email")} placeholder="Enter your official or contact email" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal focus:outline-none focus:ring-2 focus:ring-indigo-600" />
          </label>

          <label className="block font-semibold text-slate-700">
            Password
            <input required type="password" value={formData.password} onChange={updateField("password")} placeholder="Enter your password" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal focus:outline-none focus:ring-2 focus:ring-indigo-600" />
          </label>

          <button type="submit" disabled={loading} className="w-full rounded-lg bg-indigo-700 py-2.5 font-semibold text-white hover:bg-indigo-800 disabled:opacity-50">
            {loading ? "Submitting Application..." : "Submit for Admin Approval"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-slate-500">
          Already registered? <Link to="/login" className="font-semibold text-indigo-700 hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}
