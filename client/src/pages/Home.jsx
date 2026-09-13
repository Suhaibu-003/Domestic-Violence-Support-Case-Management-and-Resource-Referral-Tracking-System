import { Link } from "react-router-dom";
import { Shield, Phone, HeartHandshake, LogOut, ArrowRight } from "lucide-react";

export default function Home() {
  const quickExit = () => {
    window.location.replace("https://www.google.com");
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans">
      <nav className="border-b border-slate-200 px-6 py-3.5 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-indigo-700 text-white rounded-lg flex items-center justify-center font-bold">
            S
          </div>
          <div>
            <h1 className="font-bold text-base text-slate-900 leading-none">SAHAYA</h1>
            <p className="text-[11px] text-slate-500 mt-0.5">National Support & Referral Desk</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={quickExit}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>QUICK EXIT</span>
          </button>
          <Link
            to="/login"
            className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
          >
            Sign In
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-16 text-center">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
          Consent-Governed Support Interoperability
        </span>
        <h2 className="text-4xl font-extrabold text-slate-900 mt-4 leading-tight">
          One continuous case file. <br />
          <span className="text-indigo-700">Survivor-governed consent.</span>
        </h2>
        <p className="text-slate-600 text-sm mt-3 max-w-xl mx-auto">
          Connect with One Stop Centres, verified emergency shelters, and legal advocates without having to retell your story multiple times.
        </p>

        <div className="flex justify-center gap-4 mt-8">
          <Link
            to="/register-survivor"
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white text-sm font-semibold rounded-lg shadow-sm"
          >
            <span>Get Confidential Support</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/register-org"
            className="px-6 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg"
          >
            Register Organization
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 text-left">
          <div className="p-5 border border-slate-200 rounded-xl bg-slate-50">
            <Phone className="w-5 h-5 text-indigo-700 mb-2" />
            <h3 className="font-bold text-slate-900 text-sm">Emergency Helplines</h3>
            <p className="text-xs text-slate-500 mt-1">Directly coordinates alongside 181 (Women's Helpline) and 112.</p>
          </div>
          <div className="p-5 border border-slate-200 rounded-xl bg-slate-50">
            <Shield className="w-5 h-5 text-emerald-700 mb-2" />
            <h3 className="font-bold text-slate-900 text-sm">Consent Wallet</h3>
            <p className="text-xs text-slate-500 mt-1">Choose exactly which records are visible to lawyers and shelters.</p>
          </div>
          <div className="p-5 border border-slate-200 rounded-xl bg-slate-50">
            <HeartHandshake className="w-5 h-5 text-blue-700 mb-2" />
            <h3 className="font-bold text-slate-900 text-sm">Real-Time Referrals</h3>
            <p className="text-xs text-slate-500 mt-1">Track updates directly without waiting on repeated phone follow-ups.</p>
          </div>
        </div>
      </main>
    </div>
  );
}