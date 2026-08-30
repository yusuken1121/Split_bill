import { ExpenseItem } from "./notion";

export interface Settlement {
  owes: string;
  amount: number;
}

export interface MonthlyTotal {
  month: string;
  total: number;
}

export interface ReportLineItem {
  id: string;
  date: string;
  name: string;
  price: number;
  whose: ExpenseItem["whose"];
  whoPaid: ExpenseItem["whoPaid"];
}

export interface DashboardData {
  settlement: Settlement;
  monthlyTotals: Record<string, number>;
  itemsByMonth: Record<string, ReportLineItem[]>;
}

export function buildYearMonthSeries(
  monthlyTotals: Record<string, number>,
  year: number,
): MonthlyTotal[] {
  return Array.from({ length: 12 }, (_, index) => {
    const month = `${year}-${String(index + 1).padStart(2, "0")}`;
    return { month, total: monthlyTotals[month] ?? 0 };
  });
}

export function calculateDashboardData(items: ExpenseItem[]): DashboardData {
  let yPaidForE = 0;
  let ePaidForY = 0;

  const monthlyTotals: Record<string, number> = {};
  const itemsByMonth: Record<string, ReportLineItem[]> = {};

  items
    .filter((item) => item.status === "Done")
    .forEach((item) => {
      const { id, name, price, whose, whoPaid, date } = item;

      if (whoPaid === "Y") {
        if (whose === "both") yPaidForE += price / 2;
        if (whose === "E") yPaidForE += price;
      } else if (whoPaid === "E") {
        if (whose === "both") ePaidForY += price / 2;
        if (whose === "Y") ePaidForY += price;
      }

      if (!date) {
        return;
      }

      const monthKey = date.substring(0, 7);
      monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + price;
      if (!itemsByMonth[monthKey]) {
        itemsByMonth[monthKey] = [];
      }
      itemsByMonth[monthKey].push({
        id,
        date,
        name,
        price,
        whose,
        whoPaid,
      });
    });

  for (const monthKey of Object.keys(itemsByMonth)) {
    itemsByMonth[monthKey].sort((a, b) => {
      const byDate = a.date.localeCompare(b.date);
      if (byDate !== 0) return byDate;
      return a.name.localeCompare(b.name);
    });
  }

  const balance = yPaidForE - ePaidForY;
  const settlement: Settlement = {
    owes: balance > 0 ? "E" : balance < 0 ? "Y" : "None",
    amount: Math.abs(balance),
  };

  return { settlement, monthlyTotals, itemsByMonth };
}
