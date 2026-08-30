import { ExpenseDashboard } from "@/features/dashboard/ExpenseDashboard";

export default function DashboardPage() {
  return (
    <main className="min-h-screen flex flex-col items-center p-4 md:py-10 font-sans text-slate-800 bg-background max-w-4xl mx-auto">
      <div className="w-full">
        <ExpenseDashboard />
      </div>
    </main>
  );
}
