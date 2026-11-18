import { Link } from "react-router-dom";
import { ArrowLeftRight, Timer, Flag, Check } from "lucide-react";

const username = "dilfuzabarnoyeva00";

function Feature({ children }) {
  return (
    <li className="flex items-center gap-3 text-[13px] font-semibold">
      <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-brand text-ink-950">
        <Check size={11} strokeWidth={4} />
      </span>
      {children}
    </li>
  );
}

function PlanCard({ icon: Icon, title, text, features, cta, to, primary }) {
  return (
    <section
      className={`relative flex flex-col overflow-hidden rounded-3xl bg-ink-800 p-8 sm:px-12 ${
        primary ? "border border-brand/70" : "border border-ink-700"
      }`}
    >
      {/* Faded logo watermark */}
      <svg
        viewBox="0 0 38 34"
        className="pointer-events-none absolute -left-2 -top-2 h-44 w-48 text-white/[0.04]"
        fill="currentColor"
      >
        <path d="M10 33 18 8h19L29 33H10Z" />
        <path d="M1 33 9 10h8L10 33H1Z" />
      </svg>

      <div className="relative flex flex-1 flex-col items-center pt-10 text-center">
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-ink-600/70 text-brand">
          <Icon size={24} strokeWidth={1.8} />
        </span>
        <h2 className="mt-5 text-3xl font-bold tracking-tight">{title}</h2>
        <p className="mt-3 max-w-sm text-[15px] text-neutral-400">{text}</p>

        <ul className="mt-8 flex flex-col gap-3 self-center">
          {features.map((f) => <Feature key={f}>{f}</Feature>)}
        </ul>
      </div>

      <Link
        to={to}
        className={`relative mt-10 flex h-[46px] items-center justify-center rounded-lg text-base font-semibold transition ${
          primary
            ? "bg-brand text-white shadow-[0_8px_24px_rgba(247,138,29,0.3)] hover:bg-brand-dark"
            : "border border-ink-600 text-brand hover:bg-ink-700"
        }`}
      >
        {cta}
      </Link>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-bold sm:text-2xl">
          Welcome, {username}! Ready for your next challenge?
        </h1>
        <div className="flex items-center gap-3">
          <Link
            to="/accounts"
            className="flex h-10 items-center gap-2 rounded-lg border border-ink-600 px-4 text-sm font-medium transition hover:bg-ink-800"
          >
            <ArrowLeftRight size={15} /> View accounts
          </Link>
          <Link
            to="/new-challenge"
            className="flex h-10 items-center rounded-lg bg-brand px-4 text-sm font-semibold shadow-[0_4px_16px_rgba(247,138,29,0.3)] transition hover:bg-brand-dark"
          >
            New Challenge
          </Link>
        </div>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <PlanCard
          icon={Timer}
          title="Free trial"
          text="Practice trading without risk and prepare for a real challenge."
          features={[
            "Simulation only — no real P&L",
            "14-day access",
            "Basic account analytics",
            "Up to $100,000 demo account",
          ]}
          cta="Free Trial"
          to="/free-trial"
        />
        <PlanCard
          primary
          icon={Flag}
          title="AIFO Challenge"
          text="Trade up to $100,000 on an AIFO account. Pass the evaluation to get funded."
          features={[
            "Prove your trading skills",
            "Up to 30 days with flexible rules",
            "Full account analytics",
            "Up to $100,000 funded account",
          ]}
          cta="New Challenge"
          to="/new-challenge"
        />
      </div>
    </>
  );
}
