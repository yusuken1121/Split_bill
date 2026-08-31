"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  buildYearMonthSeries,
  calculateDashboardData,
  type ReportLineItem,
} from "@/lib/calculations";
import { useExpenses } from "@/lib/api/queries/useExpenses";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExpenseRowActions } from "./ExpenseRowActions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ViewMode = "monthly" | "yearly";

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const cardClass =
  "min-w-0 rounded-2xl border border-border bg-card p-4 text-card-foreground shadow-sm";

function currentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function formatYen(value: number) {
  return `¥${value.toLocaleString()}`;
}

function compactYenTick(value: number) {
  if (value >= 10_000) {
    const man = value / 10_000;
    const label = Number.isInteger(man) ? String(man) : man.toFixed(1).replace(/\.0$/, "");
    return `${label}万`;
  }
  return `¥${value}`;
}

function monthTick(month: string) {
  const monthNumber = Number(month.slice(5, 7));
  return MONTH_LABELS[monthNumber - 1] ?? month;
}

function availableYears(monthlyTotals: Record<string, number>, selectedYear: number) {
  const years = new Set<number>([selectedYear, new Date().getFullYear()]);
  for (const key of Object.keys(monthlyTotals)) {
    years.add(Number(key.slice(0, 4)));
  }
  return [...years].sort((a, b) => b - a);
}

export function ExpenseDashboard() {
  const { data: expenses = [], isLoading, isError, error } = useExpenses();
  const { settlement, monthlyTotals, itemsByMonth } = useMemo(
    () => calculateDashboardData(expenses),
    [expenses],
  );
  const [viewMode, setViewMode] = useState<ViewMode>("monthly");
  const [selectedMonth, setSelectedMonth] = useState(currentMonthKey);
  const selectedYear = Number(selectedMonth.slice(0, 4));
  const years = availableYears(monthlyTotals, selectedYear);
  const chartData = useMemo(
    () => buildYearMonthSeries(monthlyTotals, selectedYear),
    [monthlyTotals, selectedYear],
  );
  const yearTotal = useMemo(
    () => chartData.reduce((sum, row) => sum + row.total, 0),
    [chartData],
  );
  const monthItems: ReportLineItem[] = itemsByMonth[selectedMonth] ?? [];
  const monthTotal = monthlyTotals[selectedMonth] ?? 0;
  const headlineTotal = viewMode === "monthly" ? monthTotal : yearTotal;

  if (isLoading) {
    return (
      <p className="text-muted-foreground text-center py-10 bg-secondary/30 rounded-2xl border border-dashed border-border text-sm">
        Loading expenses...
      </p>
    );
  }

  if (isError) {
    return (
      <p className="text-destructive text-center py-10 bg-secondary/30 rounded-2xl border border-dashed border-border text-sm">
        {error.message}
      </p>
    );
  }

  return (
    <div className="flex min-w-0 w-full flex-col gap-3">
      <div className="grid min-w-0 gap-3 md:grid-cols-2">
        <section className={cardClass}>
          <h2 className="mb-3 flex items-center gap-2 text-base font-extrabold">
            <span className="text-xl">⚖️</span> Settlement
          </h2>
          <div className="flex items-center justify-center rounded-xl bg-secondary/50 px-3 py-3 text-center">
            {settlement.owes !== "None" ? (
              <span className="text-primary text-sm font-bold sm:text-base">
                {settlement.owes} owes the other{" "}
                <span className="text-2xl font-extrabold px-1 sm:text-3xl">
                  {formatYen(settlement.amount)}
                </span>
              </span>
            ) : (
              <span className="text-green-600 text-sm font-bold sm:text-base">
                Currently, there are no unpaid balances.
              </span>
            )}
          </div>
        </section>

        <section className={`${cardClass} space-y-3`}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="flex items-center gap-2 text-base font-extrabold">
              <span className="text-xl">💰</span> Total expense
            </h2>
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <div className="flex rounded-xl bg-muted p-0.5 shadow-inner">
                {(["monthly", "yearly"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setViewMode(mode)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold capitalize transition-all ${
                      viewMode === mode
                        ? "bg-background shadow-sm text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
              {viewMode === "monthly" ? (
                <input
                  type="month"
                  aria-label="Select month"
                  value={selectedMonth}
                  onChange={(event) => setSelectedMonth(event.target.value)}
                  className="min-w-0 max-w-full rounded-xl border border-border bg-background px-2 py-1.5 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              ) : (
                <Select
                  value={String(selectedYear)}
                  onValueChange={(year) =>
                    setSelectedMonth(`${year}-${selectedMonth.slice(5)}`)
                  }
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
              )}
            </div>
          </div>
          <div className="rounded-xl bg-secondary/50 px-3 py-3 text-center">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {viewMode === "monthly" ? selectedMonth : selectedYear}
            </p>
            <p className="text-2xl font-extrabold text-primary sm:text-3xl">
              {formatYen(headlineTotal)}
            </p>
          </div>
        </section>
      </div>

      <section className={cardClass}>
        <h2 className="mb-3 flex items-center gap-2 text-base font-extrabold">
          <span className="text-xl">📊</span> {selectedYear} expenses
        </h2>
        <div className="h-44 w-full min-w-0 overflow-hidden sm:h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
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
                formatter={(value: number) => [formatYen(value), "Expenses"]}
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
              <Bar dataKey="total" radius={[6, 6, 0, 0]} maxBarSize={36}>
                {chartData.map((entry) => (
                  <Cell
                    key={entry.month}
                    fill="var(--primary)"
                    fillOpacity={
                      viewMode === "monthly" && entry.month !== selectedMonth ? 0.35 : 1
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className={`${cardClass} flex min-h-0 flex-col`}>
        <h2 className="mb-3 flex items-center gap-2 text-base font-extrabold">
          <span className="text-xl">📋</span>{" "}
          {viewMode === "monthly" ? "Month details" : "Monthly totals"}
        </h2>
        <div className="max-h-[min(18rem,38vh)] min-w-0 overflow-auto">
          {viewMode === "monthly" ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                      No Done expenses this month.
                    </TableCell>
                  </TableRow>
                ) : (
                  monthItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.date}</TableCell>
                      <TableCell className="max-w-[8rem] truncate font-medium sm:max-w-none sm:whitespace-normal">
                        {item.name}
                      </TableCell>
                      <TableCell className="text-right">{formatYen(item.price)}</TableCell>
                      <TableCell className="text-right">
                        <ExpenseRowActions item={item} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={3}>Total</TableCell>
                  <TableCell className="text-right">{formatYen(monthTotal)}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {chartData.map((row) => (
                  <TableRow key={row.month}>
                    <TableCell>{row.month}</TableCell>
                    <TableCell className="text-right">{formatYen(row.total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell>Total</TableCell>
                  <TableCell className="text-right">{formatYen(yearTotal)}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          )}
        </div>
      </section>
    </div>
  );
}
