"use client";

import { useState } from "react";
import { saveShoppingAction } from "./actions";
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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

    setIsSubmitting(true);
    try {
      const numericPrice = price ? parseFloat(price) : undefined;

      await saveShoppingAction({
        stuff,
        date,
        price: numericPrice,
        status,
        whoPaid,
        whose,
      });

      // Show success toast
      showToast("Successfully added items to buy! 🎉");

      // Reset form, but keep some defaults
      setStuff("");
      setPrice("");
      setStatus("Not bought");
      setWhoPaid(null);
    } catch (error) {
      console.error(error);
      alert("Failed to save. Please try again.");
    } finally {
      setIsSubmitting(false);
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
