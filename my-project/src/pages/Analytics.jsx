import { useData } from "../context/DataContext";
import { getReasons, REASON_HINTS } from "../utils/trade";
import { useApp } from "../context/AppContext";

export default function Analytics() {
  const { t } = useApp();
  const [trades] = useData("trades");
  const closed = trades.filter((tr) => tr.result === "tp" || tr.result === "sl");

  const groups = {};
  closed.forEach((tr) => {
    getReasons(tr).forEach((name) => {
      const key = name.trim().toLowerCase();
      groups[key] ??= { name: name.trim(), total: 0, tp: 0, sl: 0, r: 0 };
      const g = groups[key];
      g.total++;
      if (tr.result === "tp") {
        g.tp++;
        g.r += Number(tr.rr) || 0;
      } else {
        g.sl++;
        g.r -= 1;
      }
    });
  });
  const rows = Object.values(groups).sort((a, b) => b.total - a.total);

  return (
    <>
      <h1 className="text-2xl font-bold">{t("analytics")}</h1>
      <p className="mt-1 text-sm text-neutral-400">{t("analyticsSub")}</p>

      {rows.length === 0 && (
        <p className="mt-6 rounded-2xl border border-ink-700 bg-ink-800 p-8 text-center text-neutral-400">
          {t("noAnalytics")}
        </p>
      )}

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((g) => {
          const winrate = Math.round((g.tp / g.total) * 100);
          return (
            <div key={g.name} className="rounded-2xl border border-ink-700 bg-ink-800 p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold" title={REASON_HINTS[g.name]}>{g.name}</h3>
                <span className="text-2xl font-bold text-brand">{winrate}%</span>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-ink-600">
                <div className="h-full bg-brand" style={{ width: `${winrate}%` }} />
              </div>

              <div className="mt-4 grid grid-cols-4 gap-2 text-center text-sm">
                <div><p className="text-neutral-400">{t("tradesShort")}</p><p className="font-semibold">{g.total}</p></div>
                <div><p className="text-neutral-400">TP</p><p className="font-semibold text-green-500">{g.tp}</p></div>
                <div><p className="text-neutral-400">SL</p><p className="font-semibold text-red-500">{g.sl}</p></div>
                <div>
                  <p className="text-neutral-400">{t("netR")}</p>
                  <p className={`font-semibold ${g.r >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {g.r > 0 ? "+" : ""}{g.r.toFixed(1)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}