// Faqat shu juftliklar bilan ishlanadi (Dashboard'dagi selector shulardan iborat)
export const PAIRS = ["NASDAQ", "XAUUSD", "EURUSD", "GBPUSD"];

export const REASONS = [
  "ChoCH", "BoS", "OrderBlock", "BreakerBlock", "SMT", "$$$",
  "FVG", "IFVG", "BPR", "OTE", "BSL", "SSL", "MMXM",
];

export const REASON_HINTS = { $$$: "Liquidity sweep" };

export function calcTrade(entry, sl, tp) {
  const e = parseFloat(entry);
  const s = parseFloat(sl);
  const p = parseFloat(tp);
  if ([e, s, p].some(Number.isNaN)) return null;

  let direction;
  if (s < e && p > e) direction = "Buy";
  else if (s > e && p < e) direction = "Sell";
  else return { error: true };

  const rr = Math.abs(p - e) / Math.abs(e - s);
  return { direction, rr: Math.round(rr * 100) / 100 };
}

// Eski trade'larda `reason` (matn) bo'lgan, yangilarida `reasons` (massiv)
export const getReasons = (trade) =>
  trade.reasons ?? (trade.reason ? [trade.reason] : []);