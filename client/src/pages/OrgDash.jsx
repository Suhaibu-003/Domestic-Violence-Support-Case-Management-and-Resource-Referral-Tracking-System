import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5000/api";

export default function OrgDash() {
  const [cases, setCases] = useState([]);
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const loadQueue = useCallback(async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(`${API}/cases/org-queue`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCases(response.data.data || []);
      setOrganization(response.data.organization || null);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load the local intake queue.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchInitialQueue = async () => {
      await loadQueue();
    };
    fetchInitialQueue();
  }, [loadQueue]);

  const handleClaim = async (caseId) => {
    const token = localStorage.getItem("token");
    setClaimingId(caseId);
    try {
      await axios.patch(`${API}/cases/${caseId}/claim`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await loadQueue();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to claim this case.");
    } finally {
      setClaimingId(null);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold text-slate-900">SAHAYA Local Intake Desk</h1>
          <p className="text-xs text-slate-500">
            {organization
              ? `${organization.orgType} • ${organization.location} • ${organization.name}`
              : "District and service-matched support queue"}
          </p>
        </div>
        <button onClick={handleLogout} className="text-xs font-semibold text-slate-600 hover:text-slate-900">
          Sign Out
        </button>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-5">
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h2 className="font-bold text-slate-900 text-sm">Local Intake Queue</h2>
              <p className="text-xs text-slate-500 mt-1">Open cases in your district that match your organization’s service type.</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-semibold">
              {cases.length} available
            </span>
          </div>

          {error && <p role="alert" className="mx-4 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">{error}</p>}

          {loading ? (
            <div className="p-8 text-center text-xs text-slate-500">Loading local cases…</div>
          ) : cases.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">No unclaimed cases currently match your district and specialization.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <tr>
                    <th className="p-4">Case</th>
                    <th className="p-4">Survivor Alias</th>
                    <th className="p-4">District</th>
                    <th className="p-4">Urgency</th>
                    <th className="p-4">Requested Support</th>
                    <th className="p-4">Summary</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cases.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50/70">
                      <td className="p-4 font-mono font-bold text-slate-900">{item.caseId}</td>
                      <td className="p-4">{item.survivorId?.alias || "Protected User"}</td>
                      <td className="p-4">{item.location}</td>
                      <td className="p-4"><span className="px-2 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">{item.urgency}</span></td>
                      <td className="p-4">{item.needs?.join(", ")}</td>
                      <td className="p-4 max-w-xs text-slate-600">{item.incidentSummary}</td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleClaim(item._id)}
                          disabled={claimingId === item._id}
                          className="px-3 py-1.5 bg-indigo-700 hover:bg-indigo-800 disabled:opacity-50 text-white font-semibold rounded-lg whitespace-nowrap"
                        >
                          {claimingId === item._id ? "Claiming…" : "Claim & Assist"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
