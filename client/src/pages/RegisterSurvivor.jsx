import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

export default function RegisterSurvivor() {
  const [formData, setFormData] = useState({
    name: "",
    alias: "",
    email: "",
    phone: "",
    password: "",
    situationNote: "",
    preferredLanguage: "Tamil",
    location: ""
  });
  const navigate = useNavigate();
  const districts = [
    "Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem",
    "Erode", "Tirunelveli", "Vellore", "Thanjavur", "Dindigul"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/register/survivor", formData);
      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        navigate("/survivor/dashboard");
      }
    } catch (err) {
      alert("Registration failed: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900">Create Confidential Account</h2>
        <p className="text-xs text-slate-500 mt-0.5 mb-6">Your real identity will be protected with an alias</p>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Full Name (Confidential)</label>
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
            <label className="block font-semibold text-slate-700 mb-1">Display Alias (Shown to Organizations)</label>
            <input
              type="text"
              placeholder="Enter your display alias"
              value={formData.alias}
              onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Contact Email</label>
            <input
              type="email"
              required
              placeholder="Enter your official or contact email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Phone</label>
            <input
              type="tel"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Brief Situation / Needs Note</label>
            <textarea
              required
              rows={3}
              placeholder="Enter a brief note about your current situation or urgent assistance required"
              value={formData.situationNote}
              onChange={(e) => setFormData({ ...formData, situationNote: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Preferred Language</label>
              <select
                value={formData.preferredLanguage}
                onChange={(e) => setFormData({ ...formData, preferredLanguage: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2"
              >
                <option value="Tamil">Tamil</option>
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Location</label>
              <select
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2"
              >
                <option value="" disabled>Select your district</option>
                {districts.map((district) => <option key={district} value={district}>{district}</option>)}
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white font-semibold rounded-lg shadow-xs"
          >
            Create Account & Request Support
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-4">
          Already registered? <Link to="/login" className="text-indigo-700 hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}