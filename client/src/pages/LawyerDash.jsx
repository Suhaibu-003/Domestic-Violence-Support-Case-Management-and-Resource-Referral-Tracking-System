import { useState, useEffect } from "react";
import axios from "axios";
import { Scale } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function LawyerDash() {
  const [referrals, setReferrals] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const fetchReferrals = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get("http://localhost:5000/api/cases/org-referrals", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success && isMounted) {
          setReferrals(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch legal referrals:", err);
      }
    };

    fetchReferrals();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleUpdate = async (id, status) => {
    const token = localStorage.getItem("token");
    try {
      await axios.patch(
        `http://localhost:5000/api/cases/referral/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Refresh local list
      const res = await axios.get("http://localhost:5000/api/cases/org-referrals", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) setReferrals(res.data.data);
    } catch (err) {
      alert("Update failed: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-blue-700 text-white rounded-lg flex items-center justify-center font-bold text-sm">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-sm leading-none">Legal Aid Desk</h1>
            <p className="text-[11px] text-slate-500">Authorized Legal Defense Briefs</p>
          </div>
        </div>

        <button onClick={() => { localStorage.clear(); navigate("/login"); }} className="text-xs text-slate-500 hover:underline">
          Sign Out
        </button>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-4">
        <h3 className="font-bold text-slate-900 text-sm">Authorized Legal Referrals</h3>
        {referrals.length === 0 ? (
          <div className="p-8 text-center bg-white border border-slate-200 rounded-xl text-xs text-slate-400">
            No authorized legal referrals assigned yet.
          </div>
        ) : (
          referrals.map((item) => (
            <div key={item.referralId} className="bg-white p-5 border border-slate-200 rounded-xl shadow-xs space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-mono font-bold text-slate-900 text-sm">{item.caseId}</span>
                  <p className="text-xs text-slate-500">Authorized Purpose: Legal Representation</p>
                </div>
                <span className="px-2 py-0.5 bg-blue-50 text-blue-800 text-xs rounded font-semibold">
                  Status: {item.status}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 space-y-1">
                <div><strong>Case Summary:</strong> {item.incidentSummary}</div>
                <div><strong>Legal Log:</strong> {item.legalDetails}</div>
              </div>

              {item.status === "CONSENT_GRANTED" && (
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleUpdate(item.referralId, "ACCEPTED")}
                    className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg text-xs"
                  >
                    Accept Case Representation
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </main>
    </div>
  );
}