import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function CreateCase() {
  const [needs, setNeeds] = useState(["SHELTER"]);
  const [urgency, setUrgency] = useState("IMMEDIATE");
  const [preferredLanguage, setPreferredLanguage] = useState("Tamil");
  const [location, setLocation] = useState("Chennai");
  const [incidentSummary, setIncidentSummary] = useState("");
  const navigate = useNavigate();

  const handleCheckbox = (val) => {
    setNeeds((prev) => (prev.includes(val) ? prev.filter((item) => item !== val) : [...prev, val]));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5000/api/cases/create",
        { needs, urgency, preferredLanguage, location, incidentSummary },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        navigate("/survivor/dashboard");
      }
    } catch (err) {
      alert("Submission error: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-8 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900">Request Support Case</h2>
        <p className="text-xs text-slate-500 mt-0.5 mb-6">Enter details to initiate immediate caseworker assistance</p>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-2">What assistance do you require?</label>
            <div className="grid grid-cols-2 gap-2">
              {["SHELTER", "LEGAL", "COUNSELLING", "MEDICAL"].map((item) => (
                <label key={item} className="flex items-center gap-2 p-2 border border-slate-200 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={needs.includes(item)}
                    onChange={() => handleCheckbox(item)}
                    className="accent-indigo-700"
                  />
                  <span className="capitalize">{item.toLowerCase()} Support</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Urgency</label>
            <div className="flex gap-4">
              {[
                { label: "Immediate", val: "IMMEDIATE" },
                { label: "Within 24 hours", val: "WITHIN_24_HOURS" },
                { label: "General", val: "GENERAL" }
              ].map((opt) => (
                <label key={opt.val} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="urgency"
                    value={opt.val}
                    checked={urgency === opt.val}
                    onChange={() => setUrgency(opt.val)}
                    className="accent-indigo-700"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Preferred Language</label>
              <select
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2"
              >
                <option value="Tamil">Tamil</option>
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Summary of Incident / Support Needed</label>
            <textarea
              rows={3}
              required
              placeholder="Provide brief context for the triage caseworker..."
              value={incidentSummary}
              onChange={(e) => setIncidentSummary(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white font-semibold rounded-lg shadow-xs"
          >
            Submit Support Case
          </button>
        </form>
      </div>
    </div>
  );
}