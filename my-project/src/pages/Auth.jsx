import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Logo } from "../components/Sidebar";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { isConfigured } from "../lib/supabase";

const field =
  "h-11 w-full rounded-lg border border-ink-600 bg-ink-900 px-3 text-sm outline-none focus:border-brand";

export default function Auth({ mode }) {
  const isSignup = mode === "signup";
  const { t, lang, setLang } = useApp();
  const { session, loading, signIn, signUp } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  if (!loading && session) return <Navigate to="/" replace />;

  const explain = (err) => {
    const msg = err.message.toLowerCase();
    if (msg.includes("invalid login")) return t("errInvalidLogin");
    if (msg.includes("not confirmed")) return t("errNotConfirmed");
    if (msg.includes("already registered")) return t("errExists");
    return err.message;
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");

    if (!isConfigured) return setError(t("errNoSupabase"));
    if (isSignup) {
      if (password.length < 6) return setError(t("errPasswordShort"));
      if (password !== confirm) return setError(t("errPasswordMatch"));
    }

    setBusy(true);
    const { data, error: err } = isSignup
      ? await signUp(email.trim(), password)
      : await signIn(email.trim(), password);
    setBusy(false);

    if (err) return setError(explain(err));

    if (isSignup) {
      // Tasdiqlangan email bilan qayta ro'yxatdan o'tilsa Supabase xato bermaydi, identities bo'sh bo'ladi
      if (data.user && data.user.identities?.length === 0) return setError(t("errExists"));
      if (!data.session) setInfo(t("checkEmail"));
    }
  };

  return (
    <div className="relative grid min-h-screen place-items-center px-4 py-10">
      <div className="absolute right-4 top-4 flex items-center gap-1 rounded-xl border border-ink-700 bg-ink-800 p-1.5">
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

      <div className="w-full max-w-md">
        <div className="flex justify-center">
          <Logo />
        </div>

        <form
          onSubmit={submit}
          className="mt-8 grid gap-4 rounded-2xl border border-ink-700 bg-ink-800 p-6 sm:p-8"
        >
          <div>
            <h1 className="text-2xl font-bold">{isSignup ? t("signupTitle") : t("loginTitle")}</h1>
            <p className="mt-1 text-sm text-neutral-400">{t("authSub")}</p>
          </div>

          <input
            required
            type="email"
            autoComplete="email"
            placeholder={t("email")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={field}
          />
          <input
            required
            type="password"
            autoComplete={isSignup ? "new-password" : "current-password"}
            placeholder={t("password")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={field}
          />
          {isSignup && (
            <input
              required
              type="password"
              autoComplete="new-password"
              placeholder={t("confirmPassword")}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={field}
            />
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}
          {info && (
            <p className="rounded-lg border border-green-500/40 bg-green-500/10 p-3 text-sm text-green-500">
              {info}
            </p>
          )}

          <button
            disabled={busy}
            className="h-11 rounded-xl bg-linear-to-b from-brand to-brand-dark text-sm font-semibold text-white shadow-[0_6px_20px_rgba(247,138,29,0.35)] ring-1 ring-white/15 transition hover:shadow-[0_10px_28px_rgba(247,138,29,0.5)] disabled:opacity-60"
          >
            {busy ? t("wait") : isSignup ? t("signup") : t("login")}
          </button>

          <p className="text-center text-sm text-neutral-400">
            {isSignup ? t("haveAccount") : t("noAccount")}{" "}
            <Link
              to={isSignup ? "/login" : "/signup"}
              className="font-semibold text-brand hover:underline"
            >
              {isSignup ? t("login") : t("signup")}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
