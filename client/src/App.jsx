import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import RegisterSurvivor from "./pages/RegisterSurvivor";
import RegisterOrg from "./pages/RegisterOrg";

import AdminDash from "./pages/AdminDash";
import SurvivorDash from "./pages/SurvivorDash";
import CreateCase from "./pages/CreateCase";
import CaseworkerDash from "./pages/CaseworkerDash";
import ShelterDash from "./pages/ShelterDash";
import LawyerDash from "./pages/LawyerDash";
import OrgDash from "./pages/OrgDash";

function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!token) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register-survivor" element={<RegisterSurvivor />} />
        <Route path="/register-org" element={<RegisterOrg />} />

        {/* 1. ADMIN DESK */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminDash />
            </ProtectedRoute>
          }
        />

        {/* 2. SURVIVOR CONSOLE */}
        <Route
          path="/survivor/dashboard"
          element={
            <ProtectedRoute allowedRoles={["SURVIVOR"]}>
              <SurvivorDash />
            </ProtectedRoute>
          }
        />
        <Route
          path="/survivor/create-case"
          element={
            <ProtectedRoute allowedRoles={["SURVIVOR"]}>
              <CreateCase />
            </ProtectedRoute>
          }
        />

        {/* 3. ORGANIZATION WORKSPACES */}
        <Route
          path="/organization/dashboard"
          element={
            <ProtectedRoute allowedRoles={["ORGANIZATION"]}>
              <OrgDash />
            </ProtectedRoute>
          }
        />
        <Route
          path="/caseworker/dashboard"
          element={
            <ProtectedRoute allowedRoles={["ORGANIZATION", "ADMIN"]}>
              <CaseworkerDash />
            </ProtectedRoute>
          }
        />
        <Route
          path="/shelter/dashboard"
          element={
            <ProtectedRoute allowedRoles={["ORGANIZATION"]}>
              <ShelterDash />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lawyer/dashboard"
          element={
            <ProtectedRoute allowedRoles={["ORGANIZATION"]}>
              <LawyerDash />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}