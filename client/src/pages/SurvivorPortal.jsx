import { useState } from "react";
import axios from "axios";
import { ShieldCheck, LogOut, CheckCircle, Home, Scale, PhoneCall, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

const SERVER_URL = "http://localhost:5000";

export default function SurvivorPortal() {
  const [caseCode, setCaseCode] = useState("");
  const [phone, setPhone] = useState("");
  const [currentCase, setCurrentCase] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState("Saved");

  // Handle direct login via Case ID
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      const res = await axios.get(`${SERVER_URL}/api/cases`);
      if (res.data.success) {
        const found = res.data.data.find(
          (c) => c.anonymousCode.trim().toUpperCase() === caseCode.trim().toUpperCase()
        );

        if (found) {
          setCurrentCase(found);
        } else {
          setErrorMessage("Invalid Case ID. Please check the code given by your caseworker.");
        }
      }
    } catch (err) {
      setErrorMessage("Could not connect to server: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Toggle permissions
  const handleToggle = async (section, field) => {
    let updated = { ...currentCase.consentMatrix };

    if (section) {
      updated[section] = {
        ...updated[section],
        [field]: !updated[section][field]
      };
    } else {
      updated[field] = !updated[field];
    }

    setCurrentCase({ ...currentCase, consentMatrix: updated });
    setSaveStatus("Saving...");

    try {
      await axios.patch(`${SERVER_URL}/api/cases/${currentCase._id}/consent`, {
        consentMatrix: updated
      });
      setSaveStatus("Saved to Database");
      setTimeout(() => setSaveStatus("Saved"), 1500);
    } catch {
      setSaveStatus("Error saving");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      {/* Simple Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center sticky top-0 z-10 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-600 text-white rounded-md">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-sm text-gray-900">Sakhi Survivor Portal</h1>
            <p className="text-[11px] text-gray-500">Confidential Case Assistance</p>
          </div>
        </div>

        {currentCase ? (
          <button
            onClick={() => setCurrentCase(null)}
            className="flex items-center gap-1 text-xs text-rose-600 font-semibold hover:underline"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        ) : (
          <Link to="/" className="text-xs text-indigo-600 hover:underline">
            ← Home
          </Link>
        )}
      </header>

      <main className="max-w-md mx-auto p-6">
        {!currentCase ? (
          /* 1. Normal Clean Login Card */
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs space-y-4">
            <div>
              <h2 className="text-base font-bold text-gray-900">Access Your Case</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Enter your Case ID given by the One Stop Centre caseworker.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Case Reference Code
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CASE-3956"
                  value={caseCode}
                  onChange={(e) => setCaseCode(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 font-mono uppercase focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Registered Contact Number
                </label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210 (Optional for demo)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition"
              >
                {loading ? "Checking file..." : "View My File"}
              </button>
            </form>
          </div>
        ) : (
          /* 2. Simple Case Overview & Privacy Controls */
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-500">Case Reference</span>
                <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> {saveStatus}
                </span>
              </div>
              <h3 className="text-xl font-mono font-bold text-gray-900">
                {currentCase.anonymousCode}
              </h3>
              <p className="text-xs text-gray-500 mt-2 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                <strong>Incident Note:</strong> {currentCase.incidentSummary}
              </p>
            </div>

            {/* Simple Toggles */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">
              <div>
                <h4 className="font-bold text-sm text-gray-900">Information Sharing</h4>
                <p className="text-xs text-gray-500">
                  Control which external agencies can view your details:
                </p>
              </div>

              <div className="space-y-3 pt-1">
                {/* Shelter toggle */}
                <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-2.5">
                    <Home className="w-4 h-4 text-indigo-600" />
                    <div>
                      <span className="text-xs font-semibold text-gray-900 block">
                        Allow Shelter Bed Sharing
                      </span>
                      <span className="text-[11px] text-gray-500">
                        Share emergency shelter needs
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={currentCase.consentMatrix?.shelterAccess?.granted || false}
                    onChange={() => handleToggle("shelterAccess", "granted")}
                    className="h-4 w-4 accent-indigo-600 cursor-pointer"
                  />
                </div>

                {/* Legal Aid toggle */}
                <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-2.5">
                    <Scale className="w-4 h-4 text-blue-600" />
                    <div>
                      <span className="text-xs font-semibold text-gray-900 block">
                        Share with Legal Aid
                      </span>
                      <span className="text-[11px] text-gray-500">
                        Allow duty lawyer to review case notes
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={currentCase.consentMatrix?.legalAccess?.granted || false}
                    onChange={() => handleToggle("legalAccess", "granted")}
                    className="h-4 w-4 accent-blue-600 cursor-pointer"
                  />
                </div>

                {/* Direct contact toggle */}
                <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-2.5">
                    <PhoneCall className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="text-xs font-semibold text-gray-900 block">
                        Show Phone to Caseworker
                      </span>
                      <span className="text-[11px] text-gray-500">
                        Unmask protected number
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={currentCase.consentMatrix?.shareDirectContact || false}
                    onChange={() => handleToggle(null, "shareDirectContact")}
                    className="h-4 w-4 accent-emerald-600 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}