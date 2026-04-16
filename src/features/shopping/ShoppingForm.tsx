"use client";

import React from "react";
import { useShoppingForm } from "./useShoppingForm";
import { Payer, Whose, QuickShoppingItem, Status } from "./types";

const QUICK_ITEMS: QuickShoppingItem[] = [
  { name: "Seiyu", icon: "🏬" },
  { name: "My Basket", icon: "🛒" },
  { name: "Lawson", icon: "🪙" },
  { name: "OK Store", icon: "⭕️" },
  { name: "Convenience Store", icon: "🏪" },
  { name: "Restaurant", icon: "🍽️" },
];

export function ShoppingForm() {
  const {
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
  } = useShoppingForm();

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto">
      {/* Toast Notification */}
      <div
        className={`fixed top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-6 py-3 rounded-full shadow-lg font-bold text-sm transition-all duration-300 z-50 flex items-center gap-2 ${
          toastMessage
            ? "translate-y-0 opacity-100"
            : "-translate-y-20 opacity-0 pointer-events-none"
        }`}
      >
        <svg
          className="w-5 h-5 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d="M5 13l4 4L19 7"
          />
        </svg>
        {toastMessage}
      </div>

      <form
        onSubmit={handleSubmit}
        className="w-full bg-card text-card-foreground rounded-3xl shadow-sm border border-border p-6 md:p-8 space-y-6"
      >
        <h1 className="text-xl font-extrabold mb-6 text-center flex items-center justify-center gap-2">
          <span className="text-2xl">🛒</span> Stuff to Buy
        </h1>

        {/* Item Input */}
        <div className="bg-secondary/50 p-4 rounded-2xl border border-secondary">
          <label className="block text-xs font-bold text-secondary-foreground uppercase tracking-wider mb-2">
            What to buy? (Required)
          </label>
          <input
            type="text"
            value={stuff}
            onChange={(e) => setStuff(e.target.value)}
            className="w-full text-2xl font-black bg-background text-foreground placeholder:text-muted-foreground rounded-xl py-4 px-4 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow shadow-sm"
            placeholder="e.g. Milk"
            autoFocus
            required
          />
        </div>

        {/* Quick Select */}
        <div>
          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
            Quick Add
          </label>
          <div className="flex flex-wrap gap-2">
            {QUICK_ITEMS.map((item) => (
              <button
                key={item.name}
                type="button"
                onClick={() => handleQuickSelect(item)}
                className="bg-background border border-border hover:border-ring hover:bg-accent hover:text-accent-foreground px-3 py-2 rounded-full text-sm font-medium text-muted-foreground transition-colors flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                <span className="text-base leading-none">{item.icon}</span>
                <span>{item.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Details section */}
        <div className="space-y-4 pt-2">
          {/* Price */}
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
              Price (Optional)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-lg font-bold">
                ¥
              </span>
              <input
                type="number"
                inputMode="numeric"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-background border border-border rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-ring transition-all text-foreground font-medium"
                placeholder="0"
              />
            </div>
          </div>

          {/* Date Selection */}
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-background border border-border rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-ring transition-all text-foreground font-medium"
              required
            />
          </div>
        </div>

        <hr className="border-border" />

        {/* Status, Payer and Whose */}
        <div className="space-y-5">
          {/* Whose */}
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 text-center">
              Whose?
            </label>
            <div className="flex bg-muted p-1 rounded-xl shadow-inner">
              {(["both", "Y", "E"] as Whose[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setWhose(t)}
                  className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${
                    whose === t
                      ? "bg-background shadow-sm text-primary scale-100"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  }`}
                >
                  {t === "both" ? "Both" : t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Status */}
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 text-center">
                Status
              </label>
              <div className="flex bg-muted p-1 rounded-xl shadow-inner">
                {(["Not bought", "Done"] as Status[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                      status === s
                        ? "bg-background shadow-sm text-primary scale-100"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Who Paid */}
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 text-center">
                Who Paid?
              </label>
              <div className="flex gap-1 bg-muted p-1 rounded-xl shadow-inner">
                <button
                  type="button"
                  onClick={() => setWhoPaid(null)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                    whoPaid === null
                      ? "bg-background shadow-sm text-foreground scale-100"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  }`}
                >
                  None
                </button>
                {(["Y", "E"] as Payer[]).map((p) => {
                  if (p === null) return null;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setWhoPaid(p)}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                        whoPaid === p
                          ? "bg-background shadow-sm text-primary scale-100"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting || !stuff}
            className={`w-full font-bold text-lg py-4 rounded-2xl shadow-lg transition-all flex justify-center items-center gap-2 ${
              isSubmitting || !stuff
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-primary/20 active:scale-95"
            }`}
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-5 w-5 text-current"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Saving...
              </>
            ) : (
              "Add to Shopping List"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
