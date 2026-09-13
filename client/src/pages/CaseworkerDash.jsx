import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function CaseworkerDash() {
  const [cases, setCases] = useState([]);
  const [activeCase, setActiveCase] = useState(null);
  const [matchedResources, setMatchedResources] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const fetchCases = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get("http://localhost:5000/api/cases/all", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success && isMounted) {
          setCases(res.data.data);
        }
      } catch (err) {
        console.error("Failed to load cases:", err);
      }
    };

    fetchCases();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleMatchResources = async (c) => {
    setActiveCase(c);
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(`http://localhost:5000/api/cases/${c.caseId}/match-resources`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) setMatchedResources(res.data.data);
    } catch (err) {
      console.error("Failed to match resources:", err);
    }
  };

  const handleCreateReferral = async (resource) => {
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        "http://localhost:5000/api/cases/create-referral",
        {
          caseId: activeCase.caseId,
          resourceId: resource._id,
          resourceType: resource.type
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`Referral initiated. Transferred to Survivor Consent Wallet.`);
      setActiveCase(null);

      // Refresh list
      const res = await axios.get("http://localhost:5000/api/cases/all", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) setCases(res.data.data);
    } catch (err) {
      alert("Referral error: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-indigo-700 text-white rounded-lg flex items-center justify-center font-bold text-sm">
            OSC
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-sm leading-none">Sakhi One Stop Centre</h1>
            <p className="text-[11px] text-slate-500">Case Coordinator & Triage Desk</p>
          </div>
        </div>

        <button
          onClick={() => { localStorage.clear(); navigate("/login"); }}
          className="text-xs text-slate-500 hover:underline"
        >
          Sign Out
        </button>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-900 text-sm">Active Incident Triage Queue</h3>
            <span className="text-xs text-slate-500">{cases.length} Files</span>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="p-4">Case ID</th>
                <th className="p-4">Priority</th>
                <th className="p-4">Needs</th>
                <th className="p-4">Summary</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cases.map((c) => (
                <tr key={c._id} className="hover:bg-slate-50/80">
                  <td className="p-4 font-mono font-bold text-slate-900">{c.caseId}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-semibold">
                      {c.urgency}
                    </span>
                  </td>
                  <td className="p-4">{c.needs?.join(", ")}</td>
                  <td className="p-4 max-w-xs truncate text-slate-600">{c.incidentSummary}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleMatchResources(c)}
                      className="px-3 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white font-semibold rounded-lg"
                    >
                      Find Support
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {activeCase && (
          <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Recommended Resources for {activeCase.caseId}
                </h3>
                <p className="text-xs text-slate-500">Matching based on location, language, and bed availability</p>
              </div>
              <button onClick={() => setActiveCase(null)} className="text-xs text-slate-400 hover:text-slate-600">✕ Close</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matchedResources.map((res) => (
                <div key={res._id} className="p-4 border border-slate-200 rounded-lg flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-sm">{res.name}</h4>
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded">
                        {res.matchScore}% Match
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {res.type} • {res.location} • {res.availableBeds ? `${res.availableBeds} beds open` : "Verified Provider"}
                    </p>
                  </div>

                  <button
                    onClick={() => handleCreateReferral(res)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-lg"
                  >
                    Create Referral
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}