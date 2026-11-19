import { useLocation } from "react-router-dom";
import { PanelLeft, Sun, Moon } from "lucide-react";
import { useApp } from "../context/AppContext";

const titleKeys = {
  "/": "dashboard",
  "/results": "results",
  "/analytics": "analytics",
  "/rr-lab": "rrLab",
  "/certificates": "certificates",
  "/purchases": "purchases",
  "/notes": "notes",
};

export default function Topbar({ onToggle }) {
  const { pathname } = useLocation();
  const { t, theme, setTheme, lang, setLang } = useApp();

  return (
    <header className="sticky top-0 z-20 flex h-[68px] items-center justify-between border-b border-ink-700 bg-ink-950/90 px-4 backdrop-blur sm:px-7">
      <div className="flex items-center gap-4">
        <button onClick={onToggle} aria-label="Toggle sidebar" className="text-neutral-400 hover:text-fg">
          <PanelLeft size={20} />
        </button>
        <span className="h-5 w-px bg-ink-600" />
        <span className="text-sm font-medium">{t(titleKeys[pathname] ?? "dashboard")}</span>
      </div>

      <div className="flex items-center gap-3">
        {/* Til almashtirish */}
        <div className="flex items-center gap-1 rounded-xl border border-ink-700 bg-ink-800 p-1.5">
          {["uz", "en"].map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`rounded-md px-2.5 py-1.5 text-sm font-semibold uppercase transition ${
                lang === l ? "bg-brand/20 text-brand" : "text-neutral-400 hover:text-fg"
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        {/* Dark / Light rejim: alohida quti */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
          className="grid h-[46px] w-[46px] place-items-center rounded-xl border border-ink-700 bg-ink-800 text-brand transition hover:border-brand"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}