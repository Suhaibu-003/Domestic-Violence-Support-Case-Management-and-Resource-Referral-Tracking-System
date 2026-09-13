import { ShieldCheck, Radio } from "lucide-react";

export default function Navbar({ isConnected, totalCases }) {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-md">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-emerald-600/20 text-emerald-400 rounded-xl border border-emerald-500/30">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-wide">BharatProtect OSC Triage</h1>
          <p className="text-xs text-slate-400">One Stop Centre & NGO Interoperability Desk</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 text-xs border border-slate-700">
          <Radio className={`w-3.5 h-3.5 ${isConnected ? "text-emerald-400 animate-pulse" : "text-rose-400"}`} />
          <span className="text-slate-300">
            {isConnected ? "Live WebSocket Mesh Active" : "Mesh Disconnected"}
          </span>
        </div>
        <div className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-xs font-semibold">
          Active Cases: {totalCases}
        </div>
      </div>
    </header>
  );
}