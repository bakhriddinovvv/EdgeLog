import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Results from "./pages/Results";
import Analytics from "./pages/Analytics";
import RRLab from "./pages/RRLab";
import Certificates from "./pages/Certificates";
import Purchases from "./pages/Purchases";
import Notes from "./pages/Notes";
import Auth from "./pages/Auth";
import RequireAuth from "./components/RequireAuth";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Auth key="login" mode="login" />} />
        <Route path="/signup" element={<Auth key="signup" mode="signup" />} />

        <Route element={<RequireAuth />}>
          <Route element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="results" element={<Results />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="rr-lab" element={<RRLab />} />
            <Route path="certificates" element={<Certificates />} />
            <Route path="purchases" element={<Purchases />} />
            <Route path="notes" element={<Notes />} />
            <Route path="*" element={<h1 className="text-2xl font-bold">404 - Sahifa topilmadi</h1>} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}