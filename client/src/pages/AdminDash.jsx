import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { AlertCircle, Trash2, X } from "lucide-react";

const API_URL = "http://localhost:5000/api/admin";
const DISTRICTS = [
  "Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem",
  "Erode", "Tirunelveli", "Vellore", "Thanjavur", "Dindigul"
];
const ASSIGNABLE_TYPES = ["SHELTER", "HOSPITAL", "LAWYER"];
const STAGES = ["OPEN", "TRIAGED", "IN_ACTION", "RESOLVED"];

const getResourceName = (resource) => resource?.name || resource?.organizationName || "Assigned support";
const authConfig = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
});

export default function AdminDash() {
  const [activeTab, setActiveTab] = useState("CASES");
  const [stats, setStats] = useState({ survivors: 0, organizations: 0, pendingOrgs: 0, activeCases: 0, resources: 0 });
  const [cases, setCases] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [resources, setResources] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState("ALL");
  const [assigningCase, setAssigningCase] = useState(null);
  const [selectedResourceIds, setSelectedResourceIds] = useState([]);
  const [rejectingOrg, setRejectingOrg] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [newResource, setNewResource] = useState({
    name: "",
    type: "SHELTER",
    location: "Chennai",
    verifiedContact: "",
    availableBeds: 0,
    services: ["Emergency Support"]
  });

  const loadData = useCallback(async () => {
    try {
      const [statsRes, casesRes, orgRes, resourcesRes] = await Promise.all([
        axios.get(`${API_URL}/stats`, authConfig()),
        axios.get(`${API_URL}/survivors`, authConfig()),
        axios.get(`${API_URL}/organizations`, authConfig()),
        axios.get(`${API_URL}/resources`, authConfig())
      ]);
      setStats(statsRes.data.data);
      setCases(casesRes.data.data);
      setOrganizations(orgRes.data.data);
      setResources(resourcesRes.data.data);
    } catch (err) {
      console.error("Admin data fetch error:", err);
    }
  }, []);

  useEffect(() => {
    let isSubscribed = true;
    const fetchInitialData = async () => {
      try {
        const [statsRes, casesRes, orgRes, resourcesRes] = await Promise.all([
          axios.get(`${API_URL}/stats`, authConfig()),
          axios.get(`${API_URL}/survivors`, authConfig()),
          axios.get(`${API_URL}/organizations`, authConfig()),
          axios.get(`${API_URL}/resources`, authConfig())
        ]);
        if (isSubscribed) {
          setStats(statsRes.data.data);
          setCases(casesRes.data.data);
          setOrganizations(orgRes.data.data);
          setResources(resourcesRes.data.data);
        }
      } catch (err) {
        console.error("Initial admin data fetch error:", err);
      }
    };
    fetchInitialData();
    return () => {
      isSubscribed = false;
    };
  }, []);

  const filteredResources = useMemo(() => selectedDistrict === "ALL"
    ? resources
    : resources.filter((resource) => resource.location?.toLowerCase() === selectedDistrict.toLowerCase()),
  [resources, selectedDistrict]);
  const activeCases = useMemo(
    () => cases.filter((caseItem) => (caseItem.stage || caseItem.status) !== "RESOLVED"),
    [cases]
  );

  const assignableResources = useMemo(() => {
    if (!assigningCase) return [];
    return resources.filter((resource) =>
      resource.location?.toLowerCase() === assigningCase.location?.toLowerCase() &&
      ASSIGNABLE_TYPES.includes(resource.type) &&
      resource.isVerified !== false
    );
  }, [assigningCase, resources]);

  const handleStageChange = async (caseItem, stage) => {
    try {
      await axios.patch(`${API_URL}/cases/${caseItem._id}/stage`, { stage }, authConfig());
      await loadData();
    } catch (err) {
      alert("Case stage update failed: " + (err.response?.data?.message || err.message));
    }
  };

  const handleAssignResources = async () => {
    if (!assigningCase || selectedResourceIds.length === 0) return;
    try {
      await axios.patch(
        `${API_URL}/cases/${assigningCase._id}/assign-resource`,
        { resourceIds: selectedResourceIds, stage: "IN_ACTION" },
        authConfig()
      );
      setAssigningCase(null);
      setSelectedResourceIds([]);
      await loadData();
    } catch (err) {
      alert("Resource assignment failed: " + (err.response?.data?.message || err.message));
    }
  };

  const handleApproveOrg = async (id) => {
    try {
      await axios.patch(`${API_URL}/organizations/${id}/verify`, { status: "APPROVED" }, authConfig());
      await loadData();
    } catch (err) {
      alert("Approval failed: " + (err.response?.data?.message || err.message));
    }
  };

  const handleConfirmReject = async (event) => {
    event.preventDefault();
    if (!rejectionReason.trim()) {
      alert("Please provide a reason for rejecting this application.");
      return;
    }
    try {
      await axios.patch(
        `${API_URL}/organizations/${rejectingOrg._id}/verify`,
        { status: "REJECTED", rejectionReason },
        authConfig()
      );
      setRejectingOrg(null);
      setRejectionReason("");
      await loadData();
    } catch (err) {
      alert("Rejection failed: " + (err.response?.data?.message || err.message));
    }
  };

  const handleCreateResource = async (event) => {
    event.preventDefault();
    try {
      await axios.post(`${API_URL}/resources`, newResource, authConfig());
      setNewResource({
        name: "",
        type: "SHELTER",
        location: "Chennai",
        verifiedContact: "",
        availableBeds: 0,
        services: ["Emergency Support"]
      });
      await loadData();
    } catch (err) {
      alert("Failed to add resource: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteResource = async (id) => {
    try {
      await axios.delete(`${API_URL}/resources/${id}`, authConfig());
      await loadData();
    } catch (err) {
      alert("Failed to delete resource: " + (err.response?.data?.message || err.message));
    }
  };

  const toggleResource = (resourceId) => {
    setSelectedResourceIds((selected) => selected.includes(resourceId)
      ? selected.filter((id) => id !== resourceId)
      : [...selected, resourceId]);
  };

  const openAssignment = (caseItem) => {
    setAssigningCase(caseItem);
    setSelectedResourceIds([]);
  };

  const signOut = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900">SAHAYA Administration</h1>
          <p className="text-xs text-slate-500">Statewide case coordination and verified aid directory</p>
        </div>
        <button onClick={signOut} className="text-xs font-semibold text-slate-600 hover:text-slate-900">
          Sign Out
        </button>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 p-6">
        <section className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {[
            ["Survivors", stats.survivors],
            ["Approved Organizations", stats.organizations],
            ["Pending Approvals", stats.pendingOrgs],
            ["Active Cases", stats.activeCases],
            ["Directory Entries", stats.resources]
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">{label}</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
            </div>
          ))}
        </section>

        <nav className="flex flex-wrap gap-2 border-b border-slate-200 pb-2 text-xs font-semibold">
          {[
            ["CASES", `Cases & Aid Directory (${activeCases.length})`],
            ["APPROVALS", `Pending Approvals (${organizations.length})`]
          ].map(([tab, label]) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-lg px-4 py-2 ${activeTab === tab ? "bg-indigo-700 text-white" : "border border-slate-200 bg-white text-slate-600"}`}
            >
              {label}
            </button>
          ))}
        </nav>

        {activeTab === "CASES" && (
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="border-b border-slate-100 p-4">
              <h2 className="text-sm font-bold text-slate-900">Active Cases & Quick Assignment</h2>
              <p className="mt-1 text-xs text-slate-500">Assign verified district facilities or an approved pro-bono lawyer.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[740px] text-left text-xs">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="p-3.5">Case ID</th>
                    <th className="p-3.5">District</th>
                    <th className="p-3.5">Needs</th>
                    <th className="p-3.5">Stage</th>
                    <th className="p-3.5">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeCases.map((item) => {
                    const stage = item.stage || item.status || "OPEN";
                    return (
                      <tr key={item._id} className="align-top hover:bg-slate-50/60">
                        <td className="p-3.5 font-mono font-bold text-slate-900">{item.caseId}</td>
                        <td className="p-3.5">{item.location}</td>
                        <td className="p-3.5">{item.needs?.join(", ") || "Not specified"}</td>
                        <td className="p-3.5">
                          <select
                            value={stage}
                            onChange={(event) => handleStageChange(item, event.target.value)}
                            aria-label={`Update stage for ${item.caseId}`}
                            className="rounded-md border border-slate-300 bg-white px-2 py-1 font-semibold"
                          >
                            {STAGES.map((value) => <option key={value} value={value}>{value}</option>)}
                          </select>
                          {item.assignedResources?.length > 0 && (
                            <p className="mt-1 max-w-48 text-[10px] text-slate-500">
                              {item.assignedResources.map(({ resourceId }) => getResourceName(resourceId)).join(", ")}
                            </p>
                          )}
                        </td>
                        <td className="p-3.5">
                          {stage !== "RESOLVED" && (
                            <button
                              onClick={() => openAssignment(item)}
                              className="rounded-lg bg-indigo-700 px-3 py-1.5 font-semibold text-white hover:bg-indigo-800"
                            >
                              Assign Aid
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {activeCases.length === 0 && (
                    <tr><td colSpan="5" className="p-8 text-center text-slate-500">No cases are registered yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === "CASES" && (
          <section className="space-y-4">
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Unified Aid Directory</h2>
                  <p className="mt-1 text-xs text-slate-500">Verified facilities and approved legal aid contacts.</p>
                </div>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                  District
                  <select
                    value={selectedDistrict}
                    onChange={(event) => setSelectedDistrict(event.target.value)}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800"
                  >
                    <option value="ALL">All Districts</option>
                    {DISTRICTS.map((district) => <option key={district} value={district}>{district}</option>)}
                  </select>
                </label>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="p-3.5">Facility / Lawyer Name</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5">District</th>
                      <th className="p-3.5">Contact Phone</th>
                      <th className="p-3.5">Availability</th>
                      <th className="p-3.5 text-right">Manage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredResources.map((resource) => (
                      <tr key={`${resource.sourceModel || "Resource"}-${resource._id}`} className="hover:bg-slate-50/60">
                        <td className="p-3.5 font-semibold text-slate-900">{resource.name || resource.organizationName}</td>
                        <td className="p-3.5">
                          <span className="rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-1 font-semibold text-indigo-700">
                            {resource.type}
                          </span>
                        </td>
                        <td className="p-3.5">{resource.location}</td>
                        <td className="p-3.5 font-mono text-slate-600">{resource.verifiedContact || resource.phone || resource.email}</td>
                        <td className="p-3.5">{resource.availability || (resource.availableBeds > 0 ? `${resource.availableBeds} beds available` : "Available")}</td>
                        <td className="p-3.5 text-right">
                          {!resource.sourceModel && (
                            <button
                              onClick={() => handleDeleteResource(resource._id)}
                              aria-label={`Remove ${resource.name}`}
                              className="rounded p-1 text-rose-600 hover:bg-rose-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {filteredResources.length === 0 && (
                      <tr><td colSpan="6" className="p-8 text-center text-slate-500">No directory entries found in this district.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <details className="rounded-xl border border-slate-200 bg-white p-4">
              <summary className="cursor-pointer text-xs font-semibold text-indigo-700">Add a directory facility</summary>
              <form onSubmit={handleCreateResource} className="mt-4 grid grid-cols-1 items-end gap-3 text-xs sm:grid-cols-2 lg:grid-cols-5">
                <label className="space-y-1">
                  <span className="block font-semibold">Facility Name</span>
                  <input required value={newResource.name} onChange={(event) => setNewResource({ ...newResource, name: event.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="Enter facility name" />
                </label>
                <label className="space-y-1">
                  <span className="block font-semibold">Category</span>
                  <select value={newResource.type} onChange={(event) => setNewResource({ ...newResource, type: event.target.value })} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2">
                    {["SHELTER", "HOSPITAL", "NGO", "LAWYER", "COUNSELLING"].map((type) => <option key={type} value={type}>{type}</option>)}
                  </select>
                </label>
                <label className="space-y-1">
                  <span className="block font-semibold">District</span>
                  <select value={newResource.location} onChange={(event) => setNewResource({ ...newResource, location: event.target.value })} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2">
                    {DISTRICTS.map((district) => <option key={district} value={district}>{district}</option>)}
                  </select>
                </label>
                <label className="space-y-1">
                  <span className="block font-semibold">Contact Phone</span>
                  <input required value={newResource.verifiedContact} onChange={(event) => setNewResource({ ...newResource, verifiedContact: event.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="Enter contact phone" />
                </label>
                <button type="submit" className="rounded-lg bg-indigo-700 px-3 py-2 font-semibold text-white hover:bg-indigo-800">Add Facility</button>
              </form>
            </details>
          </section>
        )}

        {activeTab === "APPROVALS" && (
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="border-b border-slate-100 p-4">
              <h2 className="text-sm font-bold text-slate-900">Organization & Lawyer Applications</h2>
            </div>
            {organizations.length === 0 ? (
              <p className="p-8 text-center text-xs text-slate-500">No pending applications.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="p-3.5">Applicant / Organization</th>
                      <th className="p-3.5">Type</th>
                      <th className="p-3.5">District</th>
                      <th className="p-3.5">Legal Credentials</th>
                      <th className="p-3.5">Email</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {organizations.map((org) => (
                      <tr key={org._id}>
                        <td className="p-3.5 font-semibold text-slate-900">{org.organizationName || org.name}</td>
                        <td className="p-3.5">{org.orgType}</td>
                        <td className="p-3.5">{org.location}</td>
                        <td className="p-3.5 text-slate-600">
                          {org.orgType === "LAWYER"
                            ? `${org.barCouncilEnrollmentNumber || "Enrollment not provided"} · ${org.specialization || "Specialization not provided"}`
                            : "—"}
                        </td>
                        <td className="p-3.5 text-slate-500">{org.email}</td>
                        <td className="space-x-2 p-3.5 text-right">
                          <button onClick={() => handleApproveOrg(org._id)} className="rounded bg-emerald-600 px-3 py-1.5 font-semibold text-white hover:bg-emerald-700">Approve</button>
                          <button onClick={() => { setRejectingOrg(org); setRejectionReason(""); }} className="rounded bg-rose-600 px-3 py-1.5 font-semibold text-white hover:bg-rose-700">Reject</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </main>

      {assigningCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <section role="dialog" aria-modal="true" aria-labelledby="assign-aid-title" className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="assign-aid-title" className="font-bold text-slate-900">Assign Aid to {assigningCase.caseId}</h2>
                <p className="mt-1 text-xs text-slate-500">Available verified support in {assigningCase.location}.</p>
              </div>
              <button onClick={() => setAssigningCase(null)} aria-label="Close assignment dialog" className="rounded p-1 text-slate-500 hover:bg-slate-100"><X className="h-4 w-4" /></button>
            </div>
            <div className="mt-4 divide-y divide-slate-100 rounded-lg border border-slate-200">
              {assignableResources.map((resource) => (
                <label key={`${resource.sourceModel || "Resource"}-${resource._id}`} className="flex cursor-pointer items-center gap-3 p-3 hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={selectedResourceIds.includes(resource._id)}
                    onChange={() => toggleResource(resource._id)}
                    className="accent-indigo-700"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-semibold text-slate-900">{resource.name || resource.organizationName}</span>
                    <span className="mt-0.5 block text-[11px] text-slate-500">{resource.type} · {resource.verifiedContact || resource.phone || resource.email}</span>
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600">{resource.type}</span>
                </label>
              ))}
              {assignableResources.length === 0 && <p className="p-5 text-center text-xs text-slate-500">No verified shelters, hospitals, or approved lawyers are listed in this district.</p>}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setAssigningCase(null)} className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600">Cancel</button>
              <button
                onClick={handleAssignResources}
                disabled={selectedResourceIds.length === 0}
                className="rounded-lg bg-indigo-700 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Assign Selected ({selectedResourceIds.length})
              </button>
            </div>
          </section>
        </div>
      )}

      {rejectingOrg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <section role="dialog" aria-modal="true" className="w-full max-w-md space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center gap-2 text-rose-600">
              <AlertCircle className="h-5 w-5" />
              <h2 className="text-sm font-bold text-slate-900">Reject Application</h2>
            </div>
            <p className="text-xs text-slate-500">Provide the official rejection reason for <strong>{rejectingOrg.organizationName || rejectingOrg.name}</strong>.</p>
            <form onSubmit={handleConfirmReject} className="space-y-3">
              <textarea required rows={3} value={rejectionReason} onChange={(event) => setRejectionReason(event.target.value)} placeholder="Enter the rejection reason" className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500" />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setRejectingOrg(null)} className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100">Cancel</button>
                <button type="submit" className="rounded-lg bg-rose-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-rose-700">Confirm Rejection</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
