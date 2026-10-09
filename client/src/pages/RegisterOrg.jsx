import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

export default function RegisterOrg() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    orgType: "SHELTER",
    organizationName: "",
    location: "Erode"
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/register/org", {
        ...formData,
        role: "ORGANIZATION"
      });
      if (res.data.success) {
        alert("Organization registered successfully! Your account is pending Admin approval.");
        navigate("/login");
      }
    } catch (err) {
      alert("Registration failed: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900">Institutional Registration</h2>
        <p className="text-xs text-slate-500 mt-0.5 mb-6">Register a One Stop Centre, Shelter, Hospital, or Legal Aid Clinic</p>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Organization Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Hope Women Shelter"
              value={formData.organizationName}
              onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Organization Type</label>
            <select
              value={formData.orgType}
              onChange={(e) => setFormData({ ...formData, orgType: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2"
            >
              <option value="SHELTER">Emergency Shelter Provider</option>
              <option value="NGO">One Stop Centre / NGO Caseworker</option>
              <option value="HOSPITAL">Hospital / Emergency Healthcare</option>
              <option value="COUNSELLING">Crisis Counselling Centre</option>
              <option value="LAWYER">Legal Aid Clinic</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Location / Hub</label>
            <input
              type="text"
              required
              placeholder="e.g. Erode, Chennai"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Representative Name</label>
            <input
              type="text"
              required
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Official Contact Phone</label>
            <input
              type="text"
              placeholder="+91 94441 11111"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Official Email</label>
            <input
              type="email"
              required
              placeholder="shelter@erode.org"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white font-semibold rounded-lg shadow-xs disabled:opacity-50"
          >
            {loading ? "Submitting Application..." : "Submit for Admin Approval"}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-4">
          Have an account? <Link to="/login" className="text-indigo-700 hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}