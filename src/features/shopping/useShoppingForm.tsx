"use client";

import { useState } from "react";
import { useCreateExpense } from "@/lib/api/queries/useExpenses";
import { Payer, Whose, Status, QuickShoppingItem } from "./types";

export function useShoppingForm() {
  const [stuff, setStuff] = useState<string>("");
  const [date, setDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [price, setPrice] = useState<string>("");
  const [status, setStatus] = useState<Status>("Not bought");
  const [whoPaid, setWhoPaid] = useState<Payer>(null);
  const [whose, setWhose] = useState<Whose>("both");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { mutateAsync: createExpense, isPending: isSubmitting } =
    useCreateExpense();

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleQuickSelect = (item: QuickShoppingItem) => {
    setStuff(item.name);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stuff) return;

    try {
      const numericPrice = price ? parseFloat(price) : undefined;

      await createExpense({
        stuff,
        date,
        price: numericPrice,
        status,
        whoPaid,
        whose,
      });

      showToast("Successfully added items to buy! 🎉");

      setStuff("");
      setPrice("");
      setStatus("Not bought");
      setWhoPaid(null);
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to save. Please try again.",
      );
    }
  };

  return {
    stuff,
    setStuff,
    date,
    setDate,
    price,
    setPrice,
    status,
    setStatus,
    whoPaid,
    setWhoPaid,
    whose,
    setWhose,
    isSubmitting,
    toastMessage,
    handleQuickSelect,
    handleSubmit,
  };
}
