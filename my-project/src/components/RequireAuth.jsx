import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import { DataProvider } from "../context/DataContext";
import Splash from "./Splash";

// Faqat kirgan foydalanuvchi ko'ra oladigan sahifalar uchun to'siq.
// Ma'lumotlar (trade, sertifikat, xarid) shu yerda, kirgandan keyin bir marta yuklanadi.
export default function RequireAuth() {
  const { t } = useApp();
  const { session, loading } = useAuth();

  if (loading) return <Splash>{t("loadingData")}</Splash>;
  if (!session) return <Navigate to="/login" replace />;

  return (
    <DataProvider>
      <Outlet />
    </DataProvider>
  );
}
