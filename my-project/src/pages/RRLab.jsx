import { useMemo, useState } from "react";
import { Activity, ArrowDownRight, ArrowUpRight, Award, Info, Target, TrendingUp } from "lucide-react";
import { useData } from "../context/DataContext";
import { useApp } from "../context/AppContext";

const RR_TARGETS = [1, 1.5, 2, 2.5, 3];
const formatRR = (value) => `1:${Number(value).toFixed(value % 1 ? 1 : 0)}`;

function getReachedRR(trade) {
  if (trade.result === "tp") return Number(trade.rr) || 0;
  if (trade.result === "sl" && trade.maxRR != null && Number.isFinite(Number(trade.maxRR))) {
    return Math.max(0, Number(trade.maxRR));
  }
  return null;
}

function calculateStats(trades, target) {
  const outcomes = trades.map((trade) => {
    const reached = getReachedRR(trade);
    const threshold = target === "liquidity" ? Number(trade.rr) || 0 : target;
    const win = reached != null && reached >= threshold;
    return { trade, win, threshold };
  });
  const wins = outcomes.filter((item) => item.win).length;
  const losses = outcomes.length - wins;
  const netR = outcomes.reduce((sum, item) => sum + (item.win ? item.threshold : -1), 0);
  return {
    total: outcomes.length,
    wins,
    losses,
    winrate: outcomes.length ? (wins / outcomes.length) * 100 : 0,
    netR,
    outcomes,
    breakeven: target === "liquidity" ? null : (1 / (1 + target)) * 100,
  };
}

export default function RRLab() {
  const { t } = useApp();
  const [trades] = useData("trades");
  const [pair, setPair] = useState("all");
  const [activeRR, setActiveRR] = useState("all");

  const closedTrades = useMemo(() => trades.filter((trade) => {
    if (trade.result !== "tp" && trade.result !== "sl") return false;
    if (pair !== "all" && trade.pair !== pair) return false;
    // Eski SL yozuvlarida maxRR yo'q: noto'g'ri natija chiqarmaslik uchun ularni chiqarib tashlaymiz.
    return getReachedRR(trade) != null;
  }), [trades, pair]);

  const stats = useMemo(() => {
    const fixed = RR_TARGETS.map((target) => ({ target, ...calculateStats(closedTrades, target) }));
    const liquidity = { target: "liquidity", ...calculateStats(closedTrades, "liquidity") };
    return [...fixed, liquidity];
  }, [closedTrades]);

  const ranked = stats.filter((item) => item.total > 0).sort((a, b) => b.netR - a.netR || b.winrate - a.winrate);
  const best = ranked[0];
  const selected = activeRR === "all" ? null : stats.find((item) => String(item.target) === activeRR);
  const missingLegacy = trades.filter((trade) => trade.result === "sl" && trade.maxRR == null).length;
  const pairs = [...new Set(trades.map((trade) => trade.pair).filter(Boolean))].sort();

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2 text-brand"><Activity size={17} /><span className="text-xs font-bold uppercase tracking-[0.18em]">Trading performance</span></div>
          <h1 className="text-2xl font-bold sm:text-3xl">RR Lab</h1>
          <p className="mt-1 max-w-2xl text-sm text-neutral-400">{t("rrLabSub")}</p>
        </div>
        <select value={pair} onChange={(e) => setPair(e.target.value)} className="h-11 min-w-40 rounded-xl border border-ink-600 bg-ink-800 px-3 text-sm outline-none focus:border-brand">
          <option value="all">{t("allPairs")}</option>
          {pairs.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-ink-700 bg-ink-800 p-5">
          <div className="flex items-center justify-between text-neutral-400"><span className="text-sm">{t("analyzedTrades")}</span><Activity size={18} /></div>
          <p className="mt-3 text-3xl font-bold tabular-nums">{closedTrades.length}</p>
          <p className="mt-1 text-xs text-neutral-500">{t("closedTradesOnly")}</p>
        </div>
        <div className="rounded-2xl border border-ink-700 bg-ink-800 p-5">
          <div className="flex items-center justify-between text-neutral-400"><span className="text-sm">{t("bestRR")}</span><Award size={18} className="text-brand" /></div>
          <p className="mt-3 text-3xl font-bold text-brand">{best ? (best.target === "liquidity" ? t("liquidityRR") : formatRR(best.target)) : "—"}</p>
          <p className="mt-1 text-xs text-neutral-500">{best ? `${best.winrate.toFixed(1)}% ${t("winrate")} · ${best.netR >= 0 ? "+" : ""}${best.netR.toFixed(1)}R Net R` : t("needClosedTrades")}</p>
        </div>
        <div className="rounded-2xl border border-ink-700 bg-ink-800 p-5">
          <div className="flex items-center justify-between text-neutral-400"><span className="text-sm">{t("highestNetR")}</span><TrendingUp size={18} /></div>
          <p className={`mt-3 text-3xl font-bold tabular-nums ${best?.netR >= 0 ? "text-green-500" : "text-red-500"}`}>{best ? `${best.netR > 0 ? "+" : ""}${best.netR.toFixed(1)}R` : "—"}</p>
          <p className="mt-1 text-xs text-neutral-500">{t("basedOnSample")}</p>
        </div>
      </div>

      {missingLegacy > 0 && <div className="flex gap-3 rounded-xl border border-amber-500/25 bg-amber-500/10 p-4 text-sm text-amber-200"><Info size={18} className="mt-0.5 shrink-0" /><p>{t("legacySLNotice", { n: missingLegacy })}</p></div>}

      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div><h2 className="text-lg font-bold">{t("rrComparison")}</h2><p className="mt-1 text-xs text-neutral-500">{t("rrComparisonSub")}</p></div>
          <span className="text-xs text-neutral-500">{closedTrades.length} {t("tradesShort").toLowerCase()}</span>
        </div>
        {closedTrades.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink-600 bg-ink-800/60 px-6 py-12 text-center">
            <Target size={32} className="mx-auto text-neutral-500" />
            <h3 className="mt-3 font-semibold">{t("noRRData")}</h3>
            <p className="mx-auto mt-1 max-w-lg text-sm text-neutral-500">{t("noRRDataSub")}</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {stats.map((item) => {
              const isBest = best && best.target === item.target;
              const label = item.target === "liquidity" ? t("liquidityRR") : formatRR(item.target);
              return (
                <button key={String(item.target)} onClick={() => setActiveRR(activeRR === String(item.target) ? "all" : String(item.target))} className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:border-brand/60 ${activeRR === String(item.target) ? "border-brand bg-brand/10" : "border-ink-700 bg-ink-800"}`}>
                  <div className="flex items-center justify-between gap-2"><span className="font-bold">{label}</span>{isBest && <span className="rounded-full bg-brand/15 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-brand">{t("bestFit")}</span>}</div>
                  <div className="mt-4 flex items-end justify-between"><span className="text-3xl font-bold tabular-nums">{item.total ? `${item.winrate.toFixed(1)}%` : "—"}</span><span className="pb-1 text-xs text-neutral-500">{t("winrate")}</span></div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-ink-600"><div className="h-full rounded-full bg-brand transition-all" style={{ width: `${item.winrate}%` }} /></div>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                    <div><p className="text-neutral-500">{t("wins")}</p><p className="mt-1 font-semibold text-green-500">{item.wins}</p></div>
                    <div><p className="text-neutral-500">{t("losses")}</p><p className="mt-1 font-semibold text-red-500">{item.losses}</p></div>
                    <div><p className="text-neutral-500">Net R</p><p className={`mt-1 font-semibold ${item.netR >= 0 ? "text-green-500" : "text-red-500"}`}>{item.netR > 0 ? "+" : ""}{item.netR.toFixed(1)}R</p></div>
                  </div>
                  {item.breakeven != null && <p className="mt-3 border-t border-ink-700 pt-2 text-[11px] text-neutral-500">{t("breakevenWinrate")}: {item.breakeven.toFixed(1)}%</p>}
                </button>
              );
            })}
          </div>
        )}
      </section>

      {selected && selected.total > 0 && (
        <section className="rounded-2xl border border-ink-700 bg-ink-800 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-bold">{t("rrBreakdown")}: {selected.target === "liquidity" ? t("liquidityRR") : formatRR(selected.target)}</h2><p className="mt-1 text-xs text-neutral-500">{t("rrBreakdownSub")}</p></div><button onClick={() => setActiveRR("all")} className="text-xs font-semibold text-brand hover:underline">{t("clearFilter")}</button></div>
          <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[560px] text-left text-sm"><thead className="text-xs text-neutral-500"><tr><th className="pb-3">{t("date")}</th><th className="pb-3">{t("pair")}</th><th className="pb-3">{t("plannedRR")}</th><th className="pb-3">{t("maxReachedRR")}</th><th className="pb-3">{t("result")}</th><th className="pb-3 text-right">Net R</th></tr></thead><tbody>{selected.outcomes.map(({ trade, win, threshold }) => <tr key={trade.id} className="border-t border-ink-700"><td className="py-3 text-neutral-400">{trade.date}</td><td className="py-3 font-semibold">{trade.pair}</td><td className="py-3">1:{Number(trade.rr).toFixed(2)}</td><td className="py-3">{getReachedRR(trade).toFixed(2)}R</td><td className="py-3"><span className={`rounded-md px-2 py-1 text-xs font-bold ${win ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>{win ? "WIN" : "LOSS"}</span></td><td className={`py-3 text-right font-semibold ${win ? "text-green-500" : "text-red-500"}`}>{win ? `+${threshold.toFixed(2)}R` : "-1R"}</td></tr>)}</tbody></table></div>
        </section>
      )}

      <div className="flex gap-3 rounded-xl border border-ink-700 bg-ink-800/60 p-4 text-xs leading-5 text-neutral-400"><Info size={17} className="mt-0.5 shrink-0" /><p>{t("rrMethodology")}</p></div>
    </div>
  );
}
