import { useState } from "react";
import { Plus, X, Trash2 } from "lucide-react";
import { useData } from "../context/DataContext";
import usePasswordGuard from "../hooks/usePasswordGuard";
import { useApp } from "../context/AppContext";

const field =
  "h-11 w-full rounded-lg border border-ink-600 bg-ink-900 px-3 text-sm outline-none focus:border-brand";
const empty = { firm: "", size: "", price: "", date: "", status: "Active" };
const STATUSES = ["Active", "Passed", "Failed"];

const statusStyle = {
  Active: "bg-brand/15 text-brand",
  Passed: "bg-green-500/15 text-green-500",
  Failed: "bg-red-500/15 text-red-500",
};

export default function Purchases() {
  const { t } = useApp();
  const { ask, modal } = usePasswordGuard();
  const [items, setItems] = useData("purchases");
  const [form, setForm] = useState(empty);
  const [show, setShow] = useState(false);

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const add = (e) => {
    e.preventDefault();
    setItems((prev) => [{ ...form, id: crypto.randomUUID() }, ...prev]);
    setForm(empty);
    setShow(false);
  };

  const setStatus = (id, status) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));

  // Holatni (Active/Passed/Failed) o'zgartirish parol talab qiladi
  const changeStatus = (item, status) => {
    if (item.status === status) return;
    ask(t("passwordStatusMsg"), () => setStatus(item.id, status));
  };

  const remove = (id) =>
    ask(t("confirmDeletePurchase"), () => setItems((prev) => prev.filter((i) => i.id !== id)));

  const sorted = [...items].sort((a, b) => b.date.localeCompare(a.date));
  const total = items.reduce((s, i) => s + (Number(i.price) || 0), 0);
  const heads = [t("date"), t("firm"), t("account"), t("priceTh"), t("status"), ""];

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t("purchases")}</h1>
          <p className="mt-1 text-sm text-neutral-400">
            {t("purchasesSummary", { n: items.length, total: total.toFixed(2) })}
          </p>
        </div>
        <button
          onClick={() => setShow((v) => !v)}
          className="flex h-11 items-center gap-2 rounded-lg bg-brand px-4 text-sm font-semibold transition hover:bg-brand-dark"
        >
          {show ? <X size={16} /> : <Plus size={16} />} {show ? t("close") : t("addPurchase")}
        </button>
      </div>

      {show && (
        <form onSubmit={add} className="mt-6 grid gap-4 rounded-2xl border border-ink-700 bg-ink-800 p-5 sm:grid-cols-2 lg:grid-cols-5">
          <input required placeholder={t("firm")} value={form.firm} onChange={set("firm")} className={field} />
          <input required type="number" placeholder={t("accountSize")} value={form.size} onChange={set("size")} className={field} />
          <input required type="number" step="any" placeholder={t("price")} value={form.price} onChange={set("price")} className={field} />
          <input required type="date" value={form.date} onChange={set("date")} className={field} />
          <select value={form.status} onChange={set("status")} className={field}>
            {STATUSES.map((s) => <option key={s} value={s}>{t(s)}</option>)}
          </select>
          <button className="h-11 rounded-lg bg-brand text-sm font-semibold transition hover:bg-brand-dark sm:col-span-2 lg:col-span-5">
            {t("save")}
          </button>
        </form>
      )}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-ink-700 bg-ink-800">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-ink-700 text-neutral-400">
            <tr>
              {heads.map((h, i) => (
                <th key={i} className="px-4 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-neutral-400">{t("noPurchases")}</td></tr>
            )}
            {sorted.map((i) => (
              <tr key={i.id} className="border-b border-ink-700 last:border-0">
                <td className="px-4 py-3">{i.date}</td>
                <td className="px-4 py-3 font-semibold">{i.firm}</td>
                <td className="px-4 py-3">${Number(i.size).toLocaleString()}</td>
                <td className="px-4 py-3">${i.price}</td>
                <td className="px-4 py-3">
                  <select
                    value={i.status}
                    onChange={(e) => changeStatus(i, e.target.value)}
                    className={`rounded-md px-2 py-1 text-xs font-bold outline-none ${statusStyle[i.status]}`}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s} className="bg-ink-900 text-fg">{t(s)}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => remove(i.id)} className="text-neutral-500 hover:text-red-500" aria-label={t("delete")}>
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal}
    </>
  );
}