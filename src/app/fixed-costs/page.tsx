import { FixedCostsForm } from "@/features/fixed-costs";

export default function FixedCostsPage() {
  return (
    <main className="min-h-screen flex flex-col items-center p-4 md:py-10 font-sans bg-background max-w-4xl mx-auto">
      <div className="w-full">
        <FixedCostsForm />
      </div>
    </main>
  );
}
