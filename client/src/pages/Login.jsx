import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", { email, password });
      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));

        // Role-Based Access Redirect
        const role = res.data.user.role;
        if (role === "ADMIN") {
          navigate("/admin/dashboard");
        } else if (role === "SURVIVOR") {
          navigate("/survivor/dashboard");
        } else if (role === "ORGANIZATION") {
          navigate("/organization/dashboard");
        } else if (role === "CASEWORKER") {
          navigate("/caseworker/dashboard");
        } else {
          navigate("/caseworker/dashboard");
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl p-8 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900">Sign In to SAHAYA</h2>
        <p className="text-xs text-slate-500 mt-0.5 mb-6">Select your portal with registered credentials</p>

        {error && <div className="mb-4 text-xs text-rose-600 bg-rose-50 p-2 rounded">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-indigo-700 hover:bg-indigo-800 text-white font-semibold text-xs rounded-lg shadow-xs cursor-pointer"
          >
            Access Portal
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between text-xs text-slate-500">
          <Link to="/register-survivor" className="text-indigo-700 hover:underline">Survivor Sign Up</Link>
          <Link to="/register-org" className="text-indigo-700 hover:underline">Org Sign Up</Link>
        </div>
      </div>
    </div>
  );
}