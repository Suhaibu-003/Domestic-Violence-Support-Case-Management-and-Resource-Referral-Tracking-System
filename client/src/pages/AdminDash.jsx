import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Trash2, AlertCircle } from "lucide-react";

export default function AdminDash() {
  const [activeTab, setActiveTab] = useState("ORGS"); // SURVIVORS | ORGS | RESOURCES
  const [stats, setStats] = useState({ survivors: 0, organizations: 0, pendingOrgs: 0, activeCases: 0, resources: 0 });
  const [survivors, setSurvivors] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [resources, setResources] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState("ALL");
  const [rejectingOrg, setRejectingOrg] = useState(null); // stores org object to reject
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
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const [statsRes, survRes, orgRes, resRes] = await Promise.all([
        axios.get("http://localhost:5000/api/admin/stats", { headers }),
        axios.get("http://localhost:5000/api/admin/survivors", { headers }),
        axios.get("http://localhost:5000/api/admin/organizations", { headers }),
        axios.get("http://localhost:5000/api/admin/resources", { headers })
      ]);

      setStats(statsRes.data.data);
      setSurvivors(survRes.data.data);
      setOrganizations(orgRes.data.data);
      setResources(resRes.data.data);
    } catch (err) {
      console.error("Admin data fetch error:", err);
    }
  }, []);

  useEffect(() => {
    let isSubscribed = true;

    const fetchInitialData = async () => {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      try {
        const [statsRes, survRes, orgRes, resRes] = await Promise.all([
          axios.get("http://localhost:5000/api/admin/stats", { headers }),
          axios.get("http://localhost:5000/api/admin/survivors", { headers }),
          axios.get("http://localhost:5000/api/admin/organizations", { headers }),
          axios.get("http://localhost:5000/api/admin/resources", { headers })
        ]);

        if (isSubscribed) {
          setStats(statsRes.data.data);
          setSurvivors(survRes.data.data);
          setOrganizations(orgRes.data.data);
          setResources(resRes.data.data);
        }
      } catch (err) {
        console.error("Initial load error:", err);
      }
    };

    fetchInitialData();

    return () => {
      isSubscribed = false;
    };
  }, []);

  const handleApproveOrg = async (id) => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    try {
      await axios.patch(`http://localhost:5000/api/admin/organizations/${id}/verify`, { status: "APPROVED" }, { headers });
      loadData();
    } catch (err) {
      alert("Approval failed: " + err.message);
    }
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      alert("Please provide a reason for rejecting this application.");
      return;
    }

    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    try {
      await axios.patch(
        `http://localhost:5000/api/admin/organizations/${rejectingOrg._id}/verify`,
        { status: "REJECTED", rejectionReason },
        { headers }
      );
      setRejectingOrg(null);
      setRejectionReason("");
      loadData();
    } catch (err) {
      alert("Rejection failed: " + err.message);
    }
  };

  const handleCreateResource = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    try {
      await axios.post("http://localhost:5000/api/admin/resources", newResource, { headers });
      setNewResource({ name: "", type: "SHELTER", location: "Chennai", verifiedContact: "", availableBeds: 0, services: [] });
      loadData();
    } catch (err) {
      alert("Failed to add resource: " + err.message);
    }
  };

  const handleDeleteResource = async (id) => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    try {
      await axios.delete(`http://localhost:5000/api/admin/resources/${id}`, { headers });
      loadData();
    } catch (err) {
      alert("Failed to delete resource: " + err.message);
    }
  };

  const filteredResources = selectedDistrict === "ALL" 
    ? resources 
    : resources.filter((r) => r.location.toLowerCase() === selectedDistrict.toLowerCase());

  const categoryGroups = [
    { title: "Emergency Shelters", icon: "🏠", type: "SHELTER", badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200", items: filteredResources.filter((r) => r.type === "SHELTER") },
    { title: "Hospitals & Trauma Care Desks", icon: "🏥", type: "HOSPITAL", badgeColor: "bg-rose-50 text-rose-700 border-rose-200", items: filteredResources.filter((r) => r.type === "HOSPITAL") },
    { title: "NGOs & One Stop Crisis Centres", icon: "🤝", type: "NGO", badgeColor: "bg-amber-50 text-amber-700 border-amber-200", items: filteredResources.filter((r) => r.type === "NGO") },
    { title: "Legal Aid & Defense Clinics", icon: "⚖️", type: "LAWYER", badgeColor: "bg-blue-50 text-blue-700 border-blue-200", items: filteredResources.filter((r) => r.type === "LAWYER") },
    { title: "Crisis Counselling & Mental Well-being", icon: "🧠", type: "COUNSELLING", badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200", items: filteredResources.filter((r) => r.type === "COUNSELLING") }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-20">
        <div>
          <h1 className="text-lg font-bold text-slate-900">SAHAYA Central Administration</h1>
          <p className="text-xs text-slate-500">Platform Control, Organization Verification & Resource Directory</p>
        </div>
        <button
          onClick={() => { localStorage.clear(); window.location.href = "/login"; }}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
        >
          Sign Out
        </button>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500">Registered Survivors</span>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.survivors}</h3>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500">Active Organizations</span>
            <h3 className="text-2xl font-bold text-indigo-700 mt-1">{stats.organizations}</h3>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500">Pending Approvals</span>
            <h3 className="text-2xl font-bold text-amber-600 mt-1">{organizations.length}</h3>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500">Active Cases</span>
            <h3 className="text-2xl font-bold text-rose-600 mt-1">{stats.activeCases}</h3>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500">Mapped Resources</span>
            <h3 className="text-2xl font-bold text-emerald-700 mt-1">{stats.resources}</h3>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 border-b border-slate-200 pb-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("SURVIVORS")}
            className={`px-4 py-2 rounded-lg transition ${activeTab === "SURVIVORS" ? "bg-indigo-700 text-white" : "bg-white text-slate-600 border border-slate-200"}`}
          >
            Manage Survivors ({survivors.length})
          </button>
          <button
            onClick={() => setActiveTab("ORGS")}
            className={`px-4 py-2 rounded-lg transition ${activeTab === "ORGS" ? "bg-indigo-700 text-white" : "bg-white text-slate-600 border border-slate-200"}`}
          >
            Pending Approvals ({organizations.length})
          </button>
          <button
            onClick={() => setActiveTab("RESOURCES")}
            className={`px-4 py-2 rounded-lg transition ${activeTab === "RESOURCES" ? "bg-indigo-700 text-white" : "bg-white text-slate-600 border border-slate-200"}`}
          >
            Resource Mapping ({resources.length})
          </button>
        </div>

        {/* TAB 1: MANAGE SURVIVORS */}
        {activeTab === "SURVIVORS" && (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="p-3.5">Case ID</th>
                  <th className="p-3.5">Survivor Alias</th>
                  <th className="p-3.5">Location</th>
                  <th className="p-3.5">Assistance Needs</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {survivors.map((c) => (
                  <tr key={c._id}>
                    <td className="p-3.5 font-mono font-bold text-slate-900">{c.caseId}</td>
                    <td className="p-3.5 text-slate-700">{c.survivorId?.alias || "Protected User"}</td>
                    <td className="p-3.5">{c.location}</td>
                    <td className="p-3.5">{c.needs?.join(", ")}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: PENDING ORGANIZATIONS ONLY */}
        {activeTab === "ORGS" && (
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              {organizations.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  No pending organization applications at this time.
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                    <tr>
                      <th className="p-3.5">Organization Name</th>
                      <th className="p-3.5">Type</th>
                      <th className="p-3.5">Location</th>
                      <th className="p-3.5">Representative</th>
                      <th className="p-3.5">Official Email</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {organizations.map((org) => (
                      <tr key={org._id} className="hover:bg-slate-50/50">
                        <td className="p-3.5 font-semibold text-slate-900">{org.organizationName}</td>
                        <td className="p-3.5"><span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-medium">{org.orgType}</span></td>
                        <td className="p-3.5">{org.location}</td>
                        <td className="p-3.5">{org.name}</td>
                        <td className="p-3.5 text-slate-500 font-mono">{org.email}</td>
                        <td className="p-3.5 text-right space-x-2">
                          <button
                            onClick={() => handleApproveOrg(org._id)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              setRejectingOrg(org);
                              setRejectionReason("");
                            }}
                            className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-semibold cursor-pointer"
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Modal: Reason for Rejection */}
            {rejectingOrg && (
              <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4 border border-slate-200">
                  <div className="flex items-center gap-2 text-rose-600">
                    <AlertCircle className="w-5 h-5" />
                    <h3 className="font-bold text-slate-900 text-sm">Reject Application</h3>
                  </div>
                  <p className="text-xs text-slate-500">
                    Please provide the official rejection reason for <strong>{rejectingOrg.organizationName}</strong>. This feedback will be displayed to the organization upon sign-in attempt.
                  </p>
                  <form onSubmit={handleConfirmReject} className="space-y-3">
                    <textarea
                      required
                      rows={3}
                      placeholder="e.g. Incomplete registration credentials or unverified NGO license number."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setRejectingOrg(null)}
                        className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 text-xs bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold"
                      >
                        Confirm Rejection
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CATEGORIZED RESOURCE MAPPING */}
        {activeTab === "RESOURCES" && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">Filter by District:</span>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="border border-slate-300 rounded px-2.5 py-1 text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  >
                    <option value="ALL">All 10 Districts ({resources.length})</option>
                    {["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Erode", "Tirunelveli", "Vellore", "Thanjavur", "Dindigul"].map((dist) => (
                      <option key={dist} value={dist}>{dist}</option>
                    ))}
                  </select>
                </div>
                <span className="text-xs text-slate-500">
                  Showing <strong>{filteredResources.length}</strong> resources
                </span>
              </div>

              {/* Add New Resource Form */}
              <form onSubmit={handleCreateResource} className="grid grid-cols-1 sm:grid-cols-6 gap-3 text-xs items-end">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Facility Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Name"
                    value={newResource.name}
                    onChange={(e) => setNewResource({ ...newResource, name: e.target.value })}
                    className="w-full border border-slate-300 rounded p-1.5 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Category</label>
                  <select
                    value={newResource.type}
                    onChange={(e) => setNewResource({ ...newResource, type: e.target.value })}
                    className="w-full border border-slate-300 rounded p-1.5"
                  >
                    <option value="SHELTER">Shelter</option>
                    <option value="HOSPITAL">Hospital</option>
                    <option value="NGO">NGO Crisis Desk</option>
                    <option value="LAWYER">Legal Aid</option>
                    <option value="COUNSELLING">Counselling</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">District</label>
                  <select
                    value={newResource.location}
                    onChange={(e) => setNewResource({ ...newResource, location: e.target.value })}
                    className="w-full border border-slate-300 rounded p-1.5"
                  >
                    {["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Erode", "Tirunelveli", "Vellore", "Thanjavur", "Dindigul"].map((dist) => (
                      <option key={dist} value={dist}>{dist}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Phone</label>
                  <input
                    type="text"
                    required
                    placeholder="+91..."
                    value={newResource.verifiedContact}
                    onChange={(e) => setNewResource({ ...newResource, verifiedContact: e.target.value })}
                    className="w-full border border-slate-300 rounded p-1.5 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Beds / Capacity</label>
                  <input
                    type="number"
                    value={newResource.availableBeds}
                    onChange={(e) => setNewResource({ ...newResource, availableBeds: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded p-1.5"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-indigo-700 hover:bg-indigo-800 text-white font-semibold rounded text-xs cursor-pointer"
                >
                  + Add Resource
                </button>
              </form>
            </div>

            {/* Separate Panels per Category */}
            <div className="space-y-6">
              {categoryGroups.map((group) => (
                <div key={group.type} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{group.icon}</span>
                      <h3 className="font-bold text-slate-900 text-sm">{group.title}</h3>
                    </div>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${group.badgeColor}`}>
                      {group.items.length} Facilities
                    </span>
                  </div>

                  {group.items.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      No facilities found for this category in the selected district.
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                        <tr>
                          <th className="p-3.5">Facility Name</th>
                          <th className="p-3.5">District</th>
                          <th className="p-3.5">Verified Contact</th>
                          <th className="p-3.5">Capacity / Availability</th>
                          <th className="p-3.5">Services Provided</th>
                          <th className="p-3.5 text-right">Delete</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {group.items.map((r) => (
                          <tr key={r._id} className="hover:bg-slate-50/50">
                            <td className="p-3.5 font-semibold text-slate-900">{r.name}</td>
                            <td className="p-3.5">
                              <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-medium">
                                {r.location}
                              </span>
                            </td>
                            <td className="p-3.5 text-slate-600 font-mono">{r.verifiedContact}</td>
                            <td className="p-3.5">
                              {r.availableBeds > 0 ? (
                                <span className="font-semibold text-emerald-700">{r.availableBeds} beds available</span>
                              ) : (
                                <span className="text-slate-500">Consultation / Desk</span>
                              )}
                            </td>
                            <td className="p-3.5 text-slate-500 max-w-xs truncate">
                              {r.services?.join(", ")}
                            </td>
                            <td className="p-3.5 text-right">
                              <button
                                onClick={() => handleDeleteResource(r._id)}
                                className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}