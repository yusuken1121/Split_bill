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
  type DashboardData,
  type ReportLineItem,
} from "@/lib/calculations";
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

function currentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function formatYen(value: number) {
  return `¥${value.toLocaleString()}`;
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

interface DashboardProps {
  settlement: DashboardData["settlement"];
  monthlyTotals: DashboardData["monthlyTotals"];
  itemsByMonth: DashboardData["itemsByMonth"];
}

export function ExpenseDashboard({
  settlement,
  monthlyTotals,
  itemsByMonth,
}: DashboardProps) {
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

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      <div className="p-6 bg-card text-card-foreground shadow-sm rounded-3xl border border-border">
        <h2 className="text-xl font-extrabold flex items-center gap-2 mb-4">
          <span className="text-2xl">⚖️</span> Settlement
        </h2>
        <div className="mt-2 text-2xl font-bold flex items-center justify-center py-6 bg-secondary/50 rounded-2xl">
          {settlement.owes !== "None" ? (
            <span className="text-primary text-center">
              {settlement.owes} owes the other <br className="md:hidden" />
              <span className="text-4xl px-2">{formatYen(settlement.amount)}</span>
            </span>
          ) : (
            <span className="text-green-600 text-center">
              Currently, there are no unpaid balances.
            </span>
          )}
        </div>
      </div>

      <div className="p-6 bg-card text-card-foreground shadow-sm rounded-3xl border border-border space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-extrabold flex items-center gap-2">
            <span className="text-2xl">💰</span> Total expense
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex bg-muted p-1 rounded-xl shadow-inner">
              {(["monthly", "yearly"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setViewMode(mode)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${
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
                className="bg-background border border-border rounded-xl py-2 px-3 focus:outline-none focus:ring-2 focus:ring-ring text-foreground font-medium"
              />
            ) : (
              <Select
                value={String(selectedYear)}
                onValueChange={(year) =>
                  setSelectedMonth(`${year}-${selectedMonth.slice(5)}`)
                }
              >
                <SelectTrigger aria-label="Select year" className="rounded-xl min-w-28">
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
        <div className="text-center py-6 bg-secondary/50 rounded-2xl">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
            {viewMode === "monthly" ? selectedMonth : selectedYear}
          </p>
          <p className="text-4xl font-extrabold text-primary">{formatYen(headlineTotal)}</p>
        </div>
      </div>

      <div className="p-6 bg-card text-card-foreground shadow-sm rounded-3xl border border-border">
        <h2 className="text-xl font-extrabold flex items-center gap-2 mb-6">
          <span className="text-2xl">📊</span> {selectedYear} expenses
        </h2>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis
                dataKey="month"
                tickFormatter={monthTick}
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis
                tickFormatter={(val) => `¥${val}`}
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                tickLine={false}
                axisLine={false}
                dx={-10}
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
              <Bar dataKey="total" radius={[6, 6, 0, 0]} maxBarSize={40}>
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
      </div>

      <div className="p-6 bg-card text-card-foreground shadow-sm rounded-3xl border border-border">
        <h2 className="text-xl font-extrabold flex items-center gap-2 mb-4">
          <span className="text-2xl">📋</span>{" "}
          {viewMode === "monthly" ? "Month details" : "Monthly totals"}
        </h2>
        {viewMode === "monthly" ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Item</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {monthItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                    No Done expenses this month.
                  </TableCell>
                </TableRow>
              ) : (
                monthItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.date}</TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-right">{formatYen(item.price)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={2}>Total</TableCell>
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
    </div>
  );
}
