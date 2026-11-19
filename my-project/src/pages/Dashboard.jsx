import { useEffect, useState } from "react";
import { Plus, Trash2, X, ImagePlus, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useData } from "../context/DataContext";
import usePasswordGuard from "../hooks/usePasswordGuard";
import { uploadImage } from "../utils/image";
import { PAIRS, REASONS, REASON_HINTS, calcTrade, getReasons } from "../utils/trade";
import { useApp } from "../context/AppContext";

const today = () => new Date().toLocaleDateString("en-CA");
const field =
  "h-11 w-full rounded-lg border border-ink-600 bg-ink-900 px-3 text-sm outline-none focus:border-brand";
const empty = { pair: "", entry: "", sl: "", tp: "", risk: "", reasons: [], image: "" };

const resultStyle = {
  open: "border-neutral-500 text-neutral-400",
  tp: "border-green-500/50 bg-green-500/15 text-green-500",
  sl: "border-red-500/50 bg-red-500/15 text-red-500",
};

// Rasm ustidagi shaffof (shisha) belgilar uchun: har doim oq matn, tema bog'liq emas
const glassResult = {
  open: "border-white/25 bg-white/10 text-white/80",
  tp: "border-green-400/50 bg-green-500/25 text-green-300",
  sl: "border-red-400/50 bg-red-500/25 text-red-300",
};

export default function Dashboard() {
  const { t } = useApp();
  const { ask, modal } = usePasswordGuard();
  const [trades, setTrades] = useData("trades");
  // "" = barcha sanalar, aks holda faqat shu sana
  const [date, setDate] = useState("");
  const [form, setForm] = useState(empty);
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [zoom, setZoom] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [slRRTrade, setSlRRTrade] = useState(null);
  const [slRRValue, setSlRRValue] = useState("");

  // Modal ichida natija o'zgarsa darrov yangilanishi uchun id bo'yicha qayta topamiz
  const selected = trades.find((tr) => tr.id === selectedId) ?? null;

  useEffect(() => {
    if (!selected) return;
    const onKey = (e) => e.key === "Escape" && !zoom && setSelectedId(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, zoom]);

  const list = (date ? trades.filter((tr) => tr.date === date) : [...trades]).sort((a, b) =>
    b.date.localeCompare(a.date)
  );
  const tp = list.filter((tr) => tr.result === "tp").length;
  const sl = list.filter((tr) => tr.result === "sl").length;
  const open = list.length - tp - sl;

  const calc = calcTrade(form.entry, form.sl, form.tp);

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const toggleReason = (r) =>
    setForm((p) => ({
      ...p,
      reasons: p.reasons.includes(r) ? p.reasons.filter((x) => x !== r) : [...p.reasons, r],
    }));

  const onImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setForm((p) => ({ ...p, image: url }));
    } catch {
      alert(t("errUpload"));
    } finally {
      setUploading(false);
    }
  };

  const addTrade = (e) => {
    e.preventDefault();
    if (!calc || calc.error) return setError(t("errPrices"));
    if (form.reasons.length === 0) return setError(t("errReason"));

    setTrades((prev) => [
      {
        ...form,
        id: crypto.randomUUID(),
        date: date || today(),
        result: "open",
        direction: calc.direction,
        rr: calc.rr,
      },
      ...prev,
    ]);
    setForm(empty);
    setError("");
    setShow(false);
  };

  // Natijani (open/tp/sl) o'zgartirish parol talab qiladi
  const changeResult = (tr, result) => {
    if (tr.result === result && (result !== "sl" || tr.maxRR != null)) return;
    if (result === "sl") {
      setSlRRTrade(tr);
      setSlRRValue(tr.maxRR == null ? "" : String(tr.maxRR));
      return;
    }
    ask(t("passwordChangeMsg"), () =>
      setTrades((prev) => prev.map((x) => (x.id === tr.id ? { ...x, result, maxRR: null } : x)))
    );
  };

  const saveSLResult = () => {
    const maxRR = Number(slRRValue);
    if (slRRValue.trim() === "" || !Number.isFinite(maxRR) || maxRR < 0) {
      alert(t("rrInvalid"));
      return;
    }
    const trade = slRRTrade;
    ask(t("passwordChangeMsg"), () => {
      setTrades((prev) => prev.map((x) =>
        x.id === trade.id ? { ...x, result: "sl", maxRR: Math.round(maxRR * 100) / 100 } : x
      ));
      setSlRRTrade(null);
      setSlRRValue("");
    });
  };

  // O'chirish ham parol talab qiladi
  const remove = (id) =>
    ask(t("confirmDeleteTrade"), () => {
      setTrades((prev) => prev.filter((tr) => tr.id !== id));
      setSelectedId(null);
    });

  const chip = "rounded-lg border px-3 py-1.5 text-sm font-semibold";

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t("dashboard")}</h1>
          <p className="mt-1 text-sm text-neutral-400">
            {date ? t("showingDate", { d: date }) : t("showingAll")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setDate("")}
            title={t("showAll")}
            className={`flex h-11 items-center whitespace-nowrap rounded-lg border px-4 text-sm font-semibold transition ${
              date === ""
                ? "border-brand bg-brand/15 text-brand"
                : "border-ink-600 text-neutral-400 hover:text-fg"
            }`}
          >
            {t("total")}: {list.length}
          </button>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-11 w-44 rounded-lg border border-ink-600 bg-ink-900 px-3 text-sm outline-none focus:border-brand"
          />
          <button
            onClick={() => setShow((v) => !v)}
            className="group flex h-11 shrink-0 items-center gap-2.5 whitespace-nowrap rounded-xl bg-linear-to-b from-brand to-brand-dark pl-3 pr-5 text-sm font-semibold text-white shadow-[0_6px_20px_rgba(247,138,29,0.35)] ring-1 ring-white/15 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(247,138,29,0.5)] active:translate-y-0 active:scale-95"
          >
            <span className="grid h-6 w-6 place-items-center rounded-full bg-white/25 transition-transform duration-200 group-hover:rotate-90">
              {show ? <X size={14} strokeWidth={2.8} /> : <Plus size={14} strokeWidth={2.8} />}
            </span>
            {show ? t("close") : t("addTrade")}
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className={`${chip} border-green-500/40 text-green-500`}>TP: {tp}</span>
        <span className={`${chip} border-red-500/40 text-red-500`}>SL: {sl}</span>
        <span className={`${chip} border-ink-600 text-neutral-400`}>
          {t("open")}: {open}
        </span>
      </div>

      {show && (
        <form onSubmit={addTrade} className="mt-6 grid gap-4 rounded-2xl border border-ink-700 bg-ink-800 p-5 sm:grid-cols-2 lg:grid-cols-4">
          <select
            required
            value={form.pair}
            onChange={set("pair")}
            className={`${field} ${form.pair ? "" : "text-neutral-400"}`}
          >
            <option value="" disabled>{t("selectPair")}</option>
            {PAIRS.map((p) => (
              <option key={p} value={p} className="bg-ink-900 text-fg">{p}</option>
            ))}
          </select>
          <input required type="number" step="any" placeholder={t("entryPrice")} value={form.entry} onChange={set("entry")} className={field} />
          <input required type="number" step="any" placeholder={t("slPrice")} value={form.sl} onChange={set("sl")} className={field} />
          <input required type="number" step="any" placeholder={t("tpPrice")} value={form.tp} onChange={set("tp")} className={field} />
          <input required type="number" step="any" placeholder={t("riskPct")} value={form.risk} onChange={set("risk")} className={field} />

          <label className="flex h-11 cursor-pointer items-center gap-2 rounded-lg border border-dashed border-ink-600 px-3 text-sm text-neutral-400 hover:border-brand sm:col-span-1 lg:col-span-3">
            <ImagePlus size={18} className="shrink-0" />
            <span className="truncate">{uploading ? t("uploading") : form.image ? t("imageSelected") : t("entryImage")}</span>
            <input type="file" accept="image/*" onChange={onImage} className="hidden" />
          </label>

          <div className="sm:col-span-2 lg:col-span-4">
            <p className="mb-2 text-sm text-neutral-400">{t("entryReasons")}</p>
            <div className="flex flex-wrap gap-2">
              {REASONS.map((r) => {
                const on = form.reasons.includes(r);
                return (
                  <button
                    type="button"
                    key={r}
                    title={REASON_HINTS[r]}
                    onClick={() => toggleReason(r)}
                    className={`rounded-lg border px-3 py-1.5 text-sm font-semibold transition ${
                      on
                        ? "border-brand bg-brand/15 text-brand"
                        : "border-ink-600 text-neutral-400 hover:text-fg"
                    }`}
                  >
                    {r}
                  </button>
                );
              })}
            </div>
          </div>

          {calc && (
            <p className="text-sm sm:col-span-2 lg:col-span-4">
              {calc.error ? (
                <span className="text-red-500">{t("errPrices")}</span>
              ) : (
                <>
                  <span className={calc.direction === "Buy" ? "font-semibold text-green-500" : "font-semibold text-red-500"}>
                    {calc.direction}
                  </span>
                  , RR <span className="font-semibold">1:{calc.rr}</span>
                </>
              )}
            </p>
          )}

          {error && <p className="text-sm text-red-500 sm:col-span-2 lg:col-span-4">{error}</p>}

          <button disabled={uploading} className="h-11 rounded-lg bg-brand text-sm font-semibold transition hover:bg-brand-dark disabled:opacity-60 sm:col-span-2 lg:col-span-4">
            {t("save")}
          </button>
        </form>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {list.length === 0 && (
          <p className="rounded-2xl border border-ink-700 bg-ink-800 p-8 text-center text-neutral-400 col-span-full">
            {date ? t("noTradesDay") : t("noTradesAll")}
          </p>
        )}

        {list.map((tr) => {
          const buy = tr.direction === "Buy";
          const Arrow = buy ? ArrowUpRight : ArrowDownRight;
          return (
            <article
              key={tr.id}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedId(tr.id)}
              onKeyDown={(e) => e.key === "Enter" && setSelectedId(tr.id)}
              className="group relative aspect-[5/4] cursor-pointer overflow-hidden rounded-xl border border-ink-700 bg-ink-800 text-white shadow-lg outline-none transition duration-300 hover:-translate-y-0.5 hover:border-brand/60 hover:shadow-[0_12px_32px_rgba(247,138,29,0.25)] focus-visible:ring-2 focus-visible:ring-brand"
            >
              {tr.image ? (
                <img
                  src={tr.image}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition duration-500 ease-out group-hover:scale-110"
                />
              ) : (
                <div className="absolute inset-0 grid place-items-center bg-linear-to-br from-ink-600 to-ink-900 text-neutral-500">
                  <ImagePlus size={36} />
                </div>
              )}

              {/* Rasm ustidagi matn o'qilishi uchun yumshoq qorong'ilashtirish */}
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-black/35 transition-opacity duration-300 group-hover:opacity-90" />

              <span
                className={`absolute left-2 top-2 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase backdrop-blur-md ${glassResult[tr.result] ?? glassResult.open}`}
              >
                {tr.result === "open" ? t("open") : tr.result}
              </span>

              <span className="absolute right-2 top-2 grid h-6 w-6 translate-y-1 place-items-center rounded-full border border-white/20 bg-black/35 opacity-0 backdrop-blur-md transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                <ArrowUpRight size={13} />
              </span>

              <div className="absolute inset-x-2 bottom-2 flex items-center justify-between rounded-lg border border-white/15 bg-black/30 px-3 py-2 backdrop-blur-md transition duration-300 group-hover:bg-black/45">
                <h3 className="text-sm font-bold tracking-tight">{tr.pair}</h3>
                <span
                  className={`flex items-center gap-0.5 text-xs font-semibold ${buy ? "text-green-400" : "text-red-400"}`}
                >
                  <Arrow size={15} strokeWidth={2.4} />
                  {tr.direction}
                </span>
              </div>
            </article>
          );
        })}
      </div>

      {selected && (
        <div
          onClick={() => setSelectedId(null)}
          className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm"
        >
          <div className="flex min-h-full items-center justify-center p-4">
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-ink-700 bg-ink-800 shadow-2xl"
            >
              <div className="relative bg-black">
                {selected.image ? (
                  <img
                    src={selected.image}
                    alt=""
                    onClick={() => setZoom(selected.image)}
                    className="max-h-[52vh] w-full cursor-zoom-in object-contain"
                  />
                ) : (
                  <div className="grid h-48 place-items-center text-neutral-500">
                    <ImagePlus size={40} />
                  </div>
                )}
                <button
                  onClick={() => setSelectedId(null)}
                  aria-label={t("close")}
                  className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-black/45 text-white backdrop-blur-md transition hover:bg-black/70"
                >
                  <X size={18} />
                </button>
                <span
                  className={`absolute left-3 top-3 rounded-full border px-3 py-1 text-xs font-bold uppercase backdrop-blur-md ${glassResult[selected.result] ?? glassResult.open}`}
                >
                  {selected.result === "open" ? t("open") : selected.result}
                </span>
              </div>

              <div className="p-5 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-2xl font-bold">
                    {selected.pair}{" "}
                    <span className={selected.direction === "Buy" ? "text-green-500" : "text-red-500"}>
                      {selected.direction}
                    </span>
                  </h2>
                  <span className="text-sm text-neutral-500">{selected.date}</span>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
                  {[
                    [t("entryLabel"), selected.entry],
                    ["SL", selected.sl ?? "-"],
                    ["TP", selected.tp ?? "-"],
                    ["RR", `1:${selected.rr}`],
                    ...(selected.result === "sl" && selected.maxRR != null ? [[t("maxReachedRR"), `${selected.maxRR}R`]] : []),
                    [t("riskLabel"), `${selected.risk}%`],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-ink-700 bg-ink-900 px-3 py-2.5">
                      <p className="text-xs text-neutral-400">{label}</p>
                      <p className="mt-0.5 font-semibold">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-5">
                  <p className="mb-2 text-sm text-neutral-400">{t("reasons")}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {getReasons(selected).map((r) => (
                      <span key={r} className="rounded-md bg-brand/15 px-2.5 py-1 text-xs font-semibold text-brand">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-ink-700 pt-5">
                  <div className="flex gap-2">
                    {["open", "tp", "sl"].map((r) => (
                      <button
                        key={r}
                        onClick={() => changeResult(selected, r)}
                        className={`rounded-md border px-3 py-1.5 text-xs font-semibold uppercase ${
                          selected.result === r ? resultStyle[r] : "border-ink-600 text-neutral-500 hover:text-fg"
                        }`}
                      >
                        {r === "open" ? t("open") : r}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => remove(selected.id)}
                    className="flex items-center gap-2 rounded-lg border border-ink-600 px-3 py-1.5 text-sm text-neutral-400 transition hover:border-red-500/60 hover:text-red-500"
                  >
                    <Trash2 size={16} /> {t("delete")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {slRRTrade && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-ink-600 bg-ink-800 p-6 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-brand">RR Lab</p>
                <h3 className="mt-1 text-xl font-bold">{t("slReachedTitle")}</h3>
                <p className="mt-1 text-sm text-neutral-400">{slRRTrade.pair} · {slRRTrade.direction} · {slRRTrade.date}</p>
              </div>
              <button onClick={() => setSlRRTrade(null)} className="rounded-lg p-2 text-neutral-400 hover:bg-ink-700 hover:text-fg" aria-label={t("close")}><X size={18} /></button>
            </div>
            <label className="mb-2 block text-sm font-medium">{t("maxReachedRR")}</label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="0.01"
                value={slRRValue}
                onChange={(e) => setSlRRValue(e.target.value)}
                placeholder="Masalan: 1.2"
                autoFocus
                className="h-12 w-full rounded-xl border border-ink-600 bg-ink-900 px-4 pr-12 text-lg font-semibold outline-none focus:border-brand"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-neutral-500">R</span>
            </div>
            <p className="mt-2 text-xs leading-5 text-neutral-500">{t("slReachedHint")}</p>
            <div className="mt-6 flex gap-2">
              <button onClick={() => setSlRRTrade(null)} className="h-11 flex-1 rounded-xl border border-ink-600 text-sm font-semibold text-neutral-300 hover:bg-ink-700">{t("cancel")}</button>
              <button onClick={saveSLResult} className="h-11 flex-1 rounded-xl bg-brand text-sm font-bold text-white transition hover:bg-brand-dark">{t("saveSL")}</button>
            </div>
          </div>
        </div>
      )}

      {zoom && (
        <div onClick={() => setZoom(null)} className="fixed inset-0 z-[55] grid cursor-zoom-out place-items-center bg-black/85 p-4">
          <img src={zoom} alt="" className="max-h-full max-w-full rounded-lg" />
        </div>
      )}

      {modal}
    </>
  );
}