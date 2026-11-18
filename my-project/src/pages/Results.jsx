import { useState } from "react";
import { useData } from "../context/DataContext";
import { getReasons } from "../utils/trade";
import { useApp } from "../context/AppContext";

export default function Results() {
  const { t } = useApp();
  const [trades] = useData("trades");
  const [filter, setFilter] = useState("all");

  const closed = trades
    .filter((tr) => tr.result === "tp" || tr.result === "sl")
    .sort((a, b) => b.date.localeCompare(a.date));
  const list = filter === "all" ? closed : closed.filter((tr) => tr.result === filter);

  const tp = closed.filter((tr) => tr.result === "tp").length;
  const sl = closed.length - tp;
  const winrate = closed.length ? Math.round((tp / closed.length) * 100) : 0;
  const netR = closed.reduce((s, tr) => s + (tr.result === "tp" ? Number(tr.rr) || 0 : -1), 0);

  const stats = [
    [t("total"), closed.length],
    ["TP", tp],
    ["SL", sl],
    [t("winrate"), `${winrate}%`],
    [t("netR"), `${netR > 0 ? "+" : ""}${netR.toFixed(2)}R`],
  ];

  const heads = [t("date"), t("pair"), t("direction"), t("reasons"), "RR", "Risk", t("result")];

  return (
    <>
      <h1 className="text-2xl font-bold">{t("results")}</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
        {stats.map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-ink-700 bg-ink-800 p-4">
            <p className="text-sm text-neutral-400">{label}</p>
            <p className="mt-1 text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex gap-2">
        {["all", "tp", "sl"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg border px-4 py-1.5 text-sm font-semibold uppercase ${
              filter === f ? "border-brand bg-brand/15 text-brand" : "border-ink-600 text-neutral-400"
            }`}
          >
            {f === "all" ? t("all") : f}
          </button>
        ))}
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-ink-700 bg-ink-800">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-ink-700 text-neutral-400">
            <tr>
              {heads.map((h) => (
                <th key={h} className="px-4 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {list.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-neutral-400">{t("noResults")}</td></tr>
            )}
            {list.map((tr) => (
              <tr key={tr.id} className="border-b border-ink-700 last:border-0">
                <td className="px-4 py-3">{tr.date}</td>
                <td className="px-4 py-3 font-semibold">{tr.pair}</td>
                <td className={`px-4 py-3 ${tr.direction === "Buy" ? "text-green-500" : "text-red-500"}`}>{tr.direction}</td>
                <td className="px-4 py-3">{getReasons(tr).join(", ")}</td>
                <td className="px-4 py-3">1:{tr.rr}</td>
                <td className="px-4 py-3">{tr.risk}%</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-md px-2 py-0.5 text-xs font-bold uppercase ${
                      tr.result === "tp" ? "bg-green-500/15 text-green-500" : "bg-red-500/15 text-red-500"
                    }`}
                  >
                    {tr.result}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}