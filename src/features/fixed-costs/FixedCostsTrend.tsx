"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ExpenseItem } from "@/lib/notion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FIXED_COST_KINDS,
  KIND_LABELS,
  MONTH_SHORT,
  type FixedCostKind,
} from "./constants";
import { collectFixedCostAmounts } from "./parse";
import {
  availableFixedCostYears,
  buildFixedCostYearSeries,
  yearTotalForKind,
} from "./trend";

const KIND_COLORS: Record<FixedCostKind, string> = {
  rent: "var(--chart-1)",
  electric: "var(--chart-2)",
  gas: "var(--chart-3)",
  water: "var(--chart-4)",
  wifi: "var(--chart-5)",
};

function formatYen(value: number) {
  return `¥${value.toLocaleString()}`;
}

function compactYenTick(value: number) {
  if (value >= 10_000) {
    const man = value / 10_000;
    const label = Number.isInteger(man)
      ? String(man)
      : man.toFixed(1).replace(/\.0$/, "");
    return `${label}万`;
  }
  return `¥${value}`;
}

function monthTick(month: string) {
  const monthNumber = Number(month.slice(5, 7));
  return MONTH_SHORT[monthNumber - 1] ?? month;
}

type FocusKind = FixedCostKind | "all";

export function FixedCostsTrend({
  expenses,
  isLoading,
}: {
  expenses: ExpenseItem[];
  isLoading?: boolean;
}) {
  const amounts = useMemo(() => collectFixedCostAmounts(expenses), [expenses]);
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
  const [focusKind, setFocusKind] = useState<FocusKind>("all");
  const years = availableFixedCostYears(amounts, selectedYear);
  const series = useMemo(
    () => buildFixedCostYearSeries(amounts, selectedYear),
    [amounts, selectedYear],
  );
  const yearTotal = yearTotalForKind(series, "all");
  const focusedTotal = yearTotalForKind(series, focusKind);
  const visibleKinds =
    focusKind === "all" ? FIXED_COST_KINDS : ([focusKind] as const);

  return (
    <div className="p-6 bg-card text-card-foreground shadow-sm rounded-3xl border border-border space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-extrabold flex items-center gap-2">
          <span aria-hidden="true">📈</span> Fixed cost trend
        </h2>
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <div className="flex flex-wrap rounded-xl bg-muted p-0.5 shadow-inner">
            <button
              type="button"
              onClick={() => setFocusKind("all")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                focusKind === "all"
                  ? "bg-background shadow-sm text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              }`}
            >
              All
            </button>
            {FIXED_COST_KINDS.map((kind) => (
              <button
                key={kind}
                type="button"
                onClick={() => setFocusKind(kind)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  focusKind === kind
                    ? "bg-background shadow-sm text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                }`}
              >
                {KIND_LABELS[kind]}
              </button>
            ))}
          </div>
          <Select
            value={String(selectedYear)}
            onValueChange={(year) => setSelectedYear(Number(year))}
          >
            <SelectTrigger aria-label="Select year" className="h-8 rounded-xl min-w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={String(year)}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-xl bg-secondary/50 px-3 py-3 text-center">
        <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {focusKind === "all"
            ? `${selectedYear} total`
            : `${selectedYear} ${KIND_LABELS[focusKind]}`}
        </p>
        <p className="text-2xl font-extrabold text-primary sm:text-3xl">
          {isLoading ? "…" : formatYen(focusedTotal)}
        </p>
        {focusKind !== "all" ? (
          <p className="mt-1 text-xs text-muted-foreground">
            All kinds: {formatYen(yearTotal)}
          </p>
        ) : null}
      </div>

      <p className="text-xs text-muted-foreground">
        Gas and water are billed every 2 months, so some months are {formatYen(0)}.
      </p>

      <div className="h-52 w-full min-w-0 overflow-hidden sm:h-60">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={series} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="month"
              tickFormatter={monthTick}
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              tickLine={false}
              axisLine={false}
              dy={6}
              interval={0}
            />
            <YAxis
              width={40}
              tickFormatter={compactYenTick}
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              formatter={(value, name) => [
                formatYen(Number(value ?? 0)),
                KIND_LABELS[name as FixedCostKind] ?? name,
              ]}
              labelFormatter={(month: string) => month}
              cursor={{ fill: "var(--muted)" }}
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid var(--border)",
                backgroundColor: "var(--card)",
                color: "var(--card-foreground)",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
            />
            <Legend
              formatter={(value: string) =>
                KIND_LABELS[value as FixedCostKind] ?? value
              }
              wrapperStyle={{ fontSize: 12 }}
            />
            {visibleKinds.map((kind) => (
              <Bar
                key={kind}
                dataKey={kind}
                stackId={focusKind === "all" ? "fixed" : undefined}
                fill={KIND_COLORS[kind]}
                radius={
                  focusKind === "all"
                    ? [0, 0, 0, 0]
                    : [6, 6, 0, 0]
                }
                maxBarSize={36}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="max-h-[min(18rem,38vh)] min-w-0 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Month</TableHead>
              {FIXED_COST_KINDS.map((kind) => (
                <TableHead key={kind} className="text-right">
                  {KIND_LABELS[kind]}
                </TableHead>
              ))}
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {series.map((row) => (
              <TableRow key={row.month}>
                <TableCell>{row.month}</TableCell>
                {FIXED_COST_KINDS.map((kind) => (
                  <TableCell key={kind} className="text-right">
                    {formatYen(row[kind])}
                  </TableCell>
                ))}
                <TableCell className="text-right font-medium">
                  {formatYen(row.total)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell>Total</TableCell>
              {FIXED_COST_KINDS.map((kind) => (
                <TableCell key={kind} className="text-right">
                  {formatYen(yearTotalForKind(series, kind))}
                </TableCell>
              ))}
              <TableCell className="text-right">{formatYen(yearTotal)}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  );
}
