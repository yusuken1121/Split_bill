"use client";

import { useMemo, useState } from "react";
import { Droplets, ExternalLink, Flame, Home, Wifi, Zap } from "lucide-react";
import {
  useExpenses,
  useSaveFixedCost,
} from "@/lib/api/queries/useExpenses";
import {
  FIXED_COST_DEFAULTS,
  FIXED_COST_KINDS,
  KIND_LABELS,
  KIND_URLS,
  MONTH_NAMES,
  MONTH_SHORT,
  RENT_PRICE,
  type FixedCostKind,
} from "./constants";
import {
  collectRegisteredMonths,
  coverageFromMonthKey,
  coverageLabel,
  isBimonthlyKind,
  isMonthRegistered,
  lastDayOfCoverageMonth,
  lastRegistration,
  monthKeyFromCoverage,
  nextBimonthlyDue,
} from "./parse";

function currentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function formatYen(value: number) {
  return `¥${value.toLocaleString()}`;
}

function formatCoverage(coverage: { year: number; month: number }) {
  return `${MONTH_NAMES[coverage.month - 1]} ${coverage.year}`;
}

const KIND_ICONS: Record<FixedCostKind, typeof Home> = {
  rent: Home,
  electric: Zap,
  wifi: Wifi,
  gas: Flame,
  water: Droplets,
};

export function FixedCostsForm() {
  const { data: expenses = [], isLoading } = useExpenses();
  const registered = useMemo(() => collectRegisteredMonths(expenses), [expenses]);
  const { mutateAsync: saveFixedCost } = useSaveFixedCost();
  const [coverageMonth, setCoverageMonth] = useState(currentMonthKey);
  const [prices, setPrices] = useState<Record<Exclude<FixedCostKind, "rent">, string>>({
    electric: "",
    wifi: "",
    gas: "",
    water: "",
  });
  const [submittingKind, setSubmittingKind] = useState<FixedCostKind | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const coverage = coverageFromMonthKey(coverageMonth);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSave = async (kind: FixedCostKind) => {
    const price =
      kind === "rent" ? RENT_PRICE : Number(prices[kind]);
    if (kind !== "rent" && (!price || Number.isNaN(price) || price <= 0)) {
      setErrorMessage(`Enter an amount for ${KIND_LABELS[kind]}.`);
      return;
    }

    setErrorMessage(null);
    setSubmittingKind(kind);
    try {
      await saveFixedCost({
        kind,
        coverageMonth,
        price,
      });
      showToast(`Saved ${coverageLabel(kind, coverage.month)}`);
      if (kind !== "rent") {
        setPrices((current) => ({ ...current, [kind]: "" }));
      }
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to save. Please try again.",
      );
    } finally {
      setSubmittingKind(null);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      <div
        className={`fixed top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-6 py-3 rounded-full shadow-lg font-bold text-sm transition-all duration-300 z-50 ${
          toastMessage
            ? "translate-y-0 opacity-100"
            : "-translate-y-20 opacity-0 pointer-events-none"
        }`}
      >
        {toastMessage}
      </div>

      <div className="p-6 bg-card text-card-foreground shadow-sm rounded-3xl border border-border space-y-4">
        <h1 className="text-xl font-extrabold flex items-center gap-2">
          Fixed costs
        </h1>
        <p className="text-sm text-muted-foreground">
          Saves as <span className="font-mono">kind-Month</span> (for example{" "}
          <span className="font-mono">rent-May</span>). Rent is always{" "}
          {formatYen(RENT_PRICE)}.
          {isLoading ? " Loading registered months..." : ""}
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Coverage month
            </span>
            <input
              type="month"
              aria-label="Coverage month"
              value={coverageMonth}
              onChange={(event) => setCoverageMonth(event.target.value)}
              className="w-full bg-background border border-border rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-ring text-foreground font-medium"
            />
          </label>
          <div className="space-y-2">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Payment date
            </p>
            <p className="w-full bg-muted/50 border border-border rounded-xl py-3 px-4 font-medium text-foreground">
              {lastDayOfCoverageMonth(coverage)}
              <span className="ml-2 text-xs text-muted-foreground">(last day of month)</span>
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              ["Whose", FIXED_COST_DEFAULTS.whose],
              ["Status", FIXED_COST_DEFAULTS.status],
              ["Who paid", FIXED_COST_DEFAULTS.whoPaid],
            ] as const
          ).map(([label, value]) => (
            <div
              key={label}
              className="rounded-xl border border-border bg-muted/50 px-3 py-2 text-center"
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {label}
              </p>
              <p className="text-sm font-extrabold text-foreground">{value}</p>
            </div>
          ))}
        </div>
        {errorMessage ? (
          <p className="text-sm text-destructive font-medium">{errorMessage}</p>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {FIXED_COST_KINDS.map((kind) => {
          const Icon = KIND_ICONS[kind];
          const alreadyRegistered = isMonthRegistered(registered[kind], coverage);
          const last = lastRegistration(registered[kind]);
          const nextDue = isBimonthlyKind(kind)
            ? nextBimonthlyDue(registered[kind])
            : null;
          const yearMonths = registered[kind]
            .filter((entry) => entry.year === coverage.year)
            .map((entry) => entry.month);
          const isSubmitting = submittingKind === kind;
          const needsAmount = kind !== "rent";
          const amountValue = kind === "rent" ? String(RENT_PRICE) : prices[kind];

          return (
            <div
              key={kind}
              className="p-6 bg-card text-card-foreground shadow-sm rounded-3xl border border-border space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-extrabold flex items-center gap-2">
                  <Icon className="h-5 w-5 text-primary" />
                  {KIND_LABELS[kind]}
                </h2>
                <span className="text-xs font-mono text-muted-foreground">
                  {coverageLabel(kind, coverage.month)}
                </span>
              </div>
              {KIND_URLS[kind] ? (
                <a
                  href={KIND_URLS[kind]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-start gap-1.5 text-xs font-medium text-primary hover:underline break-all"
                >
                  <ExternalLink className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  {KIND_URLS[kind]}
                </a>
              ) : null}

              <div className="flex flex-wrap gap-1.5">
                {MONTH_SHORT.map((label, index) => {
                  const month = index + 1;
                  const isRegistered = yearMonths.includes(month);
                  const isSelected = month === coverage.month;
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() =>
                        setCoverageMonth(
                          monthKeyFromCoverage({ year: coverage.year, month }),
                        )
                      }
                      className={`min-w-10 px-2 py-1 rounded-lg text-xs font-bold border transition-colors ${
                        isRegistered
                          ? "bg-primary text-primary-foreground border-primary"
                          : isSelected
                            ? "bg-secondary text-foreground border-ring"
                            : "bg-background text-muted-foreground border-border hover:bg-accent"
                      }`}
                      aria-label={`${label} ${coverage.year}${isRegistered ? " registered" : ""}`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {isBimonthlyKind(kind) ? (
                <p className="text-xs text-muted-foreground">
                  Billed every 2 months.
                  {last
                    ? ` Last: ${formatCoverage(last)}.`
                    : " Not registered yet."}
                  {nextDue ? ` Next due: ${formatCoverage(nextDue)}.` : ""}
                </p>
              ) : last ? (
                <p className="text-xs text-muted-foreground">
                  Last registered: {formatCoverage(last)}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">Not registered yet this year.</p>
              )}

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-lg font-bold">
                    ¥
                  </span>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={amountValue}
                    readOnly={kind === "rent"}
                    onChange={
                      needsAmount
                        ? (event) =>
                            setPrices((current) => ({
                              ...current,
                              [kind]: event.target.value,
                            }))
                        : undefined
                    }
                    className={`w-full bg-background border border-border rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-ring text-foreground font-medium ${
                      kind === "rent" ? "opacity-80 cursor-not-allowed" : ""
                    }`}
                    placeholder="0"
                  />
                </div>
              </div>

              <button
                type="button"
                disabled={alreadyRegistered || isSubmitting}
                onClick={() => handleSave(kind)}
                className={`w-full font-bold py-3 rounded-2xl transition-all ${
                  alreadyRegistered || isSubmitting
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95"
                }`}
              >
                {alreadyRegistered
                  ? `Already registered for ${MONTH_NAMES[coverage.month - 1]}`
                  : isSubmitting
                    ? "Saving..."
                    : `Save ${KIND_LABELS[kind]}`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
