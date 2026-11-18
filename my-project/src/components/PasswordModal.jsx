import { useState, useEffect } from "react";
import { Lock } from "lucide-react";
import { useApp } from "../context/AppContext";
import { ACTION_PASSWORD } from "../utils/password";

export default function PasswordModal({ message, onSuccess, onCancel }) {
  const { t } = useApp();
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  const submit = (e) => {
    e.preventDefault();
    if (value === ACTION_PASSWORD) {
      onSuccess();
    } else {
      setError(true);
      setValue("");
    }
  };

  return (
    <div
      onClick={onCancel}
      className="fixed inset-0 z-[60] grid place-items-center bg-black/70 p-4"
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl border border-ink-700 bg-ink-800 p-6"
      >
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-brand/15 text-brand">
            <Lock size={20} />
          </span>
          <h2 className="text-lg font-semibold">{t("passwordTitle")}</h2>
        </div>

        <p className="mt-3 text-sm text-neutral-400">{message}</p>

        <input
          autoFocus
          type="password"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError(false);
          }}
          placeholder={t("passwordPlaceholder")}
          className="mt-4 h-11 w-full rounded-lg border border-ink-600 bg-ink-900 px-3 text-sm outline-none focus:border-brand"
        />

        {error && <p className="mt-2 text-sm text-red-500">{t("passwordWrong")}</p>}

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="h-11 flex-1 rounded-lg border border-ink-600 text-sm font-semibold text-neutral-400 transition hover:text-fg"
          >
            {t("cancel")}
          </button>
          <button className="h-11 flex-1 rounded-lg bg-brand text-sm font-semibold transition hover:bg-brand-dark">
            {t("confirm")}
          </button>
        </div>
      </form>
    </div>
  );
}
