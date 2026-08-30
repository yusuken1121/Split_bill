import { ExpenseDashboard } from "@/features/dashboard/ExpenseDashboard";
import { getExpenses } from "@/lib/notion";
import { calculateDashboardData } from "@/lib/calculations";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const expenses = await getExpenses();
  const { settlement, monthlyTotals, itemsByMonth } = calculateDashboardData(expenses);

  return (
    <main className="min-h-screen flex flex-col items-center p-4 md:py-10 font-sans text-slate-800 bg-background max-w-4xl mx-auto">
      <div className="w-full">
        <ExpenseDashboard
          settlement={settlement}
          monthlyTotals={monthlyTotals}
          itemsByMonth={itemsByMonth}
        />
      </div>
    </main>
  );
}
