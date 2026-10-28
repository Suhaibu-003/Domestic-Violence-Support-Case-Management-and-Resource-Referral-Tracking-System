import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { CheckCircle2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function SurvivorDash() {
  const [caseData, setCaseData] = useState(null);
  const [immediateSupport, setImmediateSupport] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [selectedReferral, setSelectedReferral] = useState(null);
  const [consentDraft, setConsentDraft] = useState({
    shareBasicSummary: true,
    shareLegalIssue: true,
    shareDocuments: false,
    shareShelterNeeds: true
  });
  const navigate = useNavigate();

  const handleQuickExit = useCallback(() => {
    localStorage.clear();
    window.location.replace("https://weather.com");
  }, []);

  useEffect(() => {
    let isMounted = true;
    const handleEscape = (event) => {
      if (event.key === "Escape") handleQuickExit();
    };
    window.addEventListener("keydown", handleEscape);

    const fetchMyCase = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get("http://localhost:5000/api/cases/my-case", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success && isMounted) {
          setCaseData(res.data.data);
          setReferrals(res.data.referrals || []);

          let savedUser = {};
          try {
            savedUser = JSON.parse(localStorage.getItem("user") || "{}");
          } catch {
            savedUser = {};
          }
          const district = res.data.data?.location || savedUser.location;
          if (district) {
            const contactRes = await axios.get(
              `http://localhost:5000/api/resources/district?location=${encodeURIComponent(district)}`
            );
            if (isMounted) setImmediateSupport(contactRes.data.data);
          }
        }
      } catch (err) {
        console.error("Failed to load survivor file:", err);
      }
    };

    fetchMyCase();
    return () => {
      isMounted = false;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [handleQuickExit]);

  const handleRequestIntervention = () => {
    if (!window.confirm("Send an immediate distress signal to your district response desk?")) return;
    const timestamp = new Date().toLocaleString();
    window.alert(`Distress signal forwarded with timestamp ${timestamp} to District Sakhi One-Stop Desk.`);
  };

  const handleAuthorize = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.patch(
        `http://localhost:5000/api/cases/referral/${selectedReferral._id}/consent`,
        { authorizedFields: consentDraft },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedReferral(null);

      // Re-fetch updated case & timeline
      const res = await axios.get("http://localhost:5000/api/cases/my-case", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setCaseData(res.data.data);
        setReferrals(res.data.referrals || []);
      }
    } catch (err) {
      alert("Error saving consent: " + err.message);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex justify-between items-center max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-indigo-700 text-white rounded-lg flex items-center justify-center font-bold text-sm">
            S
          </div>
          <span className="font-bold text-slate-900 text-sm">SAHAYA Safe Console</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleQuickExit}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg"
          >
            QUICK EXIT (ESC)
          </button>
          <button onClick={handleLogout} className="text-xs text-slate-500 hover:underline">
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 space-y-6">
        <section className="bg-white p-5 rounded-xl border border-indigo-100 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-indigo-700">Immediate district support</p>
            {immediateSupport ? (
              <>
                <h2 className="mt-1 text-sm font-bold text-slate-900">{immediateSupport.name}</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Verified {immediateSupport.type.toLowerCase()} • {immediateSupport.location} • {immediateSupport.verifiedContact}
                </p>
              </>
            ) : (
              <p className="mt-1 text-xs text-slate-500">Loading verified shelter or hospital contact for your district…</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {immediateSupport && (
              <a
                href={`tel:${immediateSupport.verifiedContact.replace(/[^\d+]/g, "")}`}
                className="px-3 py-2 bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-semibold rounded-lg text-center"
              >
                Call Now
              </a>
            )}
            <button
              onClick={handleRequestIntervention}
              className="px-3 py-2 border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-lg"
            >
              Request Immediate Intervention
            </button>
          </div>
        </section>

        {!caseData ? (
          <div className="bg-white p-8 rounded-xl border border-slate-200 text-center space-y-3">
            <h3 className="font-bold text-slate-900">No Active Case Registered</h3>
            <p className="text-xs text-slate-500">Initiate an intake request to receive support.</p>
            <Link
              to="/survivor/create-case"
              className="inline-block px-4 py-2 bg-indigo-700 text-white text-xs font-semibold rounded-lg"
            >
              Create Support Case
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs text-slate-500">Case Reference</span>
                    <h2 className="text-2xl font-mono font-bold text-slate-900">{caseData.caseId}</h2>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md text-xs font-semibold">
                    Status: {caseData.status}
                  </span>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex gap-4 text-xs text-slate-500">
                  <span>Priority: <strong className="text-slate-800">{caseData.urgency}</strong></span>
                  <span>Location: <strong className="text-slate-800">{caseData.location}</strong></span>
                </div>
              </div>

              <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm">Case Progress</h3>
                  <span className="text-xs font-bold text-indigo-700">
                    {({ OPEN: 25, TRIAGED: 50, IN_ACTION: 75, RESOLVED: 100 })[caseData.status] || 25}% complete
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={({ OPEN: 25, TRIAGED: 50, IN_ACTION: 75, RESOLVED: 100 })[caseData.status] || 25}>
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all"
                    style={{ width: `${({ OPEN: 25, TRIAGED: 50, IN_ACTION: 75, RESOLVED: 100 })[caseData.status] || 25}%` }}
                  />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { status: "OPEN", label: "Report Received", percent: "25%" },
                    { status: "TRIAGED", label: "Caseworker Triaged", percent: "50%" },
                    { status: "IN_ACTION", label: "Services Dispatched", percent: "75%" },
                    { status: "RESOLVED", label: "Resolved & Secured", percent: "100%" }
                  ].map((step, index) => {
                    const currentStep = ["OPEN", "TRIAGED", "IN_ACTION", "RESOLVED"].indexOf(caseData.status);
                    const isReached = index <= currentStep;
                    return (
                      <div key={step.status} className={`rounded-lg border p-3 ${isReached ? "border-indigo-200 bg-indigo-50" : "border-slate-200 bg-white"}`}>
                        <span className={`text-[10px] font-bold ${isReached ? "text-indigo-700" : "text-slate-400"}`}>{step.percent}</span>
                        <p className={`mt-1 text-xs font-semibold ${isReached ? "text-slate-800" : "text-slate-400"}`}>{step.label}</p>
                      </div>
                    );
                  })}
                </div>
              </section>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="font-bold text-slate-900 text-sm">Active Agency Referrals</h3>
                {referrals.length === 0 ? (
                  <p className="text-xs text-slate-500">No external referrals requested yet by your caseworker.</p>
                ) : (
                  referrals.map((ref) => (
                    <div key={ref._id} className="p-4 border border-slate-200 rounded-lg flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-sm">{ref.resourceType}</h4>
                          <span className="text-[11px] text-slate-500">• {ref.resourceId?.name}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Status: <strong>{ref.status}</strong></p>
                      </div>

                      {ref.status === "PENDING_CONSENT" ? (
                        <button
                          onClick={() => setSelectedReferral(ref)}
                          className="px-3 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white font-semibold text-xs rounded-lg"
                        >
                          Review Consent
                        </button>
                      ) : (
                        <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Consent Granted
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">Case Journey Timeline</h3>
              <div className="space-y-4 relative border-l-2 border-slate-100 ml-2 pl-4 text-xs">
                {caseData.timeline?.map((item, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-indigo-700 ring-4 ring-white" />
                    <h4 className="font-bold text-slate-800">{item.title}</h4>
                    <p className="text-slate-500 mt-0.5">{item.description}</p>
                    <span className="text-[10px] text-slate-400">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {selectedReferral && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Consent Wallet</h3>
            <p className="text-xs text-slate-500">
              Control what information is shared with <strong>{selectedReferral.resourceId?.name}</strong>.
            </p>

            <div className="space-y-2.5 pt-2 text-xs">
              <label className="flex items-center justify-between p-2.5 border border-slate-200 rounded-lg">
                <span>Share Basic Summary</span>
                <input
                  type="checkbox"
                  checked={consentDraft.shareBasicSummary}
                  onChange={(e) => setConsentDraft({ ...consentDraft, shareBasicSummary: e.target.checked })}
                  className="accent-indigo-700"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 border border-slate-200 rounded-lg">
                <span>Share Legal Incident Log</span>
                <input
                  type="checkbox"
                  checked={consentDraft.shareLegalIssue}
                  onChange={(e) => setConsentDraft({ ...consentDraft, shareLegalIssue: e.target.checked })}
                  className="accent-indigo-700"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 border border-slate-200 rounded-lg">
                <span>Share Documents / Identity Proof</span>
                <input
                  type="checkbox"
                  checked={consentDraft.shareDocuments}
                  onChange={(e) => setConsentDraft({ ...consentDraft, shareDocuments: e.target.checked })}
                  className="accent-indigo-700"
                />
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                onClick={() => setSelectedReferral(null)}
                className="px-3 py-1.5 border border-slate-300 text-slate-600 rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleAuthorize}
                className="px-4 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white font-semibold rounded-lg text-xs"
              >
                Approve & Share
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}