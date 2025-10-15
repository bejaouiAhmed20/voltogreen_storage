import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Tools from "./pages/Tools";
import Loans from "./pages/Loans";
import Maintenance from "./pages/Maintenance";
import Profile from "./pages/Profile";
import Stats from "./pages/Stats";
import UserActivity from "./pages/UserActivity";
import Projects from "./pages/Projects";
import ProtectedRoute from "./components/ProtectedRoute";

const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}>
            <Route path="users" element={<Users />} />
            <Route path="tools" element={<Tools />} />
            <Route path="loan" element={<Loans />} />
            <Route path="maintenance" element={<Maintenance />} />
            <Route path="projects" element={<Projects />} />
            <Route path="profile" element={<Profile />} />
            <Route path="stats" element={<Stats />} />
            <Route path="activity" element={<UserActivity />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </React.StrictMode>
  );
}
