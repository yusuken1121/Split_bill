import { ToDoList } from "@/features/shopping/ToDoList";

export default function PendingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center p-4 md:py-10 font-sans text-slate-800 bg-background max-w-4xl mx-auto">
      <div className="w-full">
        <ToDoList />
      </div>
    </main>
  );
}
