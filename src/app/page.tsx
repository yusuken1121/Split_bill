import { ShoppingForm } from "@/features/shopping";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center p-4 md:py-10 font-sans text-slate-800">
      <div className="w-full">
        <ShoppingForm />
      </div>
    </main>
  );
}
