import { useState, useEffect } from "react";
import axios from "axios";
import { PhoneCall, Bed, X } from "lucide-react";

export default function ResourceMatcher({ selectedCase, onClose }) {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  // Chennai Reference Hub [lng, lat]
  const defaultLng = 80.2707;
  const defaultLat = 13.0827;

  useEffect(() => {
    const fetchNearby = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `http://localhost:5000/api/resources/near?lng=${defaultLng}&lat=${defaultLat}&type=SHELTER`
        );
        if (res.data.success) {
          setResources(res.data.data);
        }
      } catch (err) {
        console.error("Resource fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNearby();
  }, [selectedCase]);

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Verified Shelter Directory for {selectedCase.anonymousCode}
            </h3>
            <p className="text-xs text-slate-500">Geo-matched facilities with available emergency beds</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-3 max-h-[65vh] overflow-y-auto">
          {loading ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              Locating open beds within a 50km radius...
            </div>
          ) : resources.length === 0 ? (
            <div className="py-12 text-center text-rose-600 text-xs font-medium">
              No shelters found with available capacity nearby.
            </div>
          ) : (
            resources.map((res) => (
              <div
                key={res._id}
                className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-3 hover:border-indigo-300 transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{res.name}</h4>
                    <span className="text-[11px] font-medium text-slate-500">{res.district || "Chennai District"} • {res.type}</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                    <Bed className="w-3.5 h-3.5" />
                    <span>{res.availableBeds} beds available</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <PhoneCall className="w-3.5 h-3.5 text-slate-400" />
                    <span>{res.verifiedContact}</span>
                  </div>
                  <button
                    onClick={() => alert(`Anonymized referral transfer sent to ${res.name}.`)}
                    className="px-3 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white font-semibold rounded-lg transition"
                  >
                    Initiate Transfer
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}