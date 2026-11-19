import { NavLink, Link } from "react-router-dom";
import {
  LayoutDashboard, CircleCheckBig, ChartColumn, Target, Award, ShoppingCart, NotebookPen, LogOut,
} from "lucide-react";
import { FaDiscord, FaFacebookF, FaXTwitter, FaInstagram, FaYoutube } from "react-icons/fa6";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";

const menu = [
  { to: "/", key: "dashboard", icon: LayoutDashboard, end: true },
  { to: "/results", key: "results", icon: CircleCheckBig },
  { to: "/analytics", key: "analytics", icon: ChartColumn },
  { to: "/rr-lab", key: "rrLab", icon: Target },
  { to: "/certificates", key: "certificates", icon: Award },
  { to: "/purchases", key: "purchases", icon: ShoppingCart },
  { to: "/notes", key: "notes", icon: NotebookPen },
];

const socials = [FaDiscord, FaFacebookF, FaXTwitter, FaInstagram, FaYoutube];

export function Logo() {
  return (
    <Link to="/" className="flex items-center">
      <svg width="34" height="34" viewBox="4 4 40 40" fill="currentColor" className="text-brand">
        <rect x="6" y="6" width="8" height="36" rx="2" />
        <polygon points="14,6 42,6 36,14 14,14" />
        <polygon points="14,20 34,20 28,28 14,28" />
        <polygon points="14,34 42,34 36,42 14,42" />
      </svg>
      <span className="text-3xl font-extrabold tracking-tight">dgeLog</span>
    </Link>
  );
}

export default function Sidebar({ open, onClose }) {
  const { t } = useApp();
  const { user, signOut } = useAuth();
  const closeOnMobile = () => window.innerWidth < 1024 && onClose();

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-ink-700 bg-ink-900 px-4 pb-5 pt-6 transition-transform duration-200 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="px-1"><Logo /></div>

      <nav className="mt-8 flex flex-1 flex-col gap-1 overflow-y-auto">
        {menu.map(({ to, key, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={closeOnMobile}
            className={({ isActive }) =>
              `flex h-12 items-center gap-4 rounded-lg px-4 text-[17px] transition ${
                isActive
                  ? "bg-gradient-to-r from-brand/25 via-ink-700 to-ink-700 font-semibold text-fg"
                  : "text-neutral-400 hover:bg-ink-700 hover:text-fg"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={22} className={isActive ? "text-brand" : ""} strokeWidth={1.7} />
                {t(key)}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {user && (
        <p className="mt-3 truncate px-4 text-xs text-neutral-500" title={user.email}>
          {user.email}
        </p>
      )}
      <button
        onClick={signOut}
        className="mt-1 flex h-12 items-center gap-4 rounded-lg px-4 text-[17px] text-neutral-400 transition hover:text-fg"
      >
        <LogOut size={22} strokeWidth={1.7} /> {t("signOut")}
      </button>

      <div className="mt-2 flex items-center justify-center gap-3">
        {socials.map((Icon, i) => (
          <a
            key={i}
            href="#"
            className="grid h-8 w-8 place-items-center rounded-full bg-ink-700 text-neutral-400 transition hover:text-brand"
          >
            <Icon size={15} />
          </a>
        ))}
      </div>
    </aside>
  );
}