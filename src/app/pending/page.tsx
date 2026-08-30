import { ToDoList } from "@/features/shopping/ToDoList";
import { getExpenses } from "@/lib/notion";

export default async function PendingPage() {
  const expenses = await getExpenses();

  return (
    <main className="min-h-screen flex flex-col items-center p-4 md:py-10 font-sans text-slate-800 bg-background max-w-4xl mx-auto">
      <div className="w-full">
        <ToDoList initialItems={expenses} />
      </div>
    </main>
  );
}
