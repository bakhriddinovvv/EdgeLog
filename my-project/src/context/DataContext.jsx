import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";
import { useApp } from "./AppContext";
import Splash from "../components/Splash";

const KEYS = ["trades", "certificates", "purchases", "notes"];
const MIGRATED_FLAG = "edgelog_migrated";

const DataContext = createContext(null);

// Eski versiyada ma'lumotlar faqat shu brauzerning localStorage'ida turgan
function readLegacy(key) {
  try {
    const raw = localStorage.getItem(`edgelog_${key}`);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function DataProvider({ children }) {
  const { t } = useApp();
  const { user } = useAuth();
  const userId = user.id;

  const [data, setData] = useState(null); // null = hali yuklanmagan
  const [loadError, setLoadError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const dataRef = useRef(null);
  const queueRef = useRef(Promise.resolve());

  // Kirgandan keyin shu akkauntning ma'lumotlarini bir marta yuklaymiz
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data: rows, error } = await supabase
        .from("user_data")
        .select("key, value")
        .eq("user_id", userId);
      if (cancelled) return;
      if (error) return setLoadError(error.message);

      const loaded = {};
      const missing = [];
      for (const key of KEYS) {
        const row = rows.find((r) => r.key === key);
        loaded[key] = row && Array.isArray(row.value) ? row.value : [];
        if (!row) missing.push(key);
      }

      // Birinchi kirgan akkauntga brauzerdagi eski ma'lumotlarni ko'chirib beramiz
      if (missing.length && !localStorage.getItem(MIGRATED_FLAG)) {
        const toImport = missing.filter((key) => {
          const legacy = readLegacy(key);
          if (legacy.length) loaded[key] = legacy;
          return legacy.length > 0;
        });
        if (toImport.length) {
          const { error: upErr } = await supabase
            .from("user_data")
            .upsert(toImport.map((key) => ({ user_id: userId, key, value: loaded[key] })));
          if (cancelled) return;
          if (!upErr) localStorage.setItem(MIGRATED_FLAG, "1");
        }
      }

      dataRef.current = loaded;
      setData(loaded);
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, attempt]);

  // useState'ga o'xshash setter: ekranni darrov yangilaydi, serverga navbat bilan yozadi
  const setValue = useCallback(
    (key, updater) => {
      const prev = dataRef.current[key];
      const next = typeof updater === "function" ? updater(prev) : updater;
      dataRef.current = { ...dataRef.current, [key]: next };
      setData(dataRef.current);

      queueRef.current = queueRef.current.then(async () => {
        try {
          const { error } = await supabase.from("user_data").upsert({
            user_id: userId,
            key,
            value: next,
            updated_at: new Date().toISOString(),
          });
          if (error) throw error;
        } catch (err) {
          console.error("Saqlashda xatolik:", err);
          alert(t("errSave"));
        }
      });
    },
    [userId, t]
  );

  if (loadError) {
    return (
      <Splash>
        <p className="text-red-500">{t("errLoadData")} {loadError}</p>
        <button
          onClick={() => {
            setLoadError("");
            setAttempt((a) => a + 1);
          }}
          className="mt-4 h-11 rounded-lg bg-brand px-5 text-sm font-semibold text-white"
        >
          {t("retry")}
        </button>
      </Splash>
    );
  }
  if (!data) return <Splash>{t("loadingData")}</Splash>;

  return <DataContext.Provider value={{ data, setValue }}>{children}</DataContext.Provider>;
}

// useLocalStorage o'rniga: const [trades, setTrades] = useData("trades");
export function useData(key) {
  const { data, setValue } = useContext(DataContext);
  const set = useCallback((updater) => setValue(key, updater), [setValue, key]);
  return [data[key], set];
}
