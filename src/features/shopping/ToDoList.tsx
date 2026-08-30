"use client";
import { useState } from "react";
import { ExpenseItem } from "@/lib/notion";
import { updateShoppingAction } from "./actions";

export function ToDoList({ initialItems }: { initialItems: ExpenseItem[] }) {
  const [items, setItems] = useState(
    initialItems.filter((item) => item.status === "Not bought")
  );
  const [selectedItem, setSelectedItem] = useState<ExpenseItem | null>(null);

  // モーダル用ステート
  const [price, setPrice] = useState<string>("");
  const [whoPaid, setWhoPaid] = useState<"Y" | "E">("Y");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 送信処理
  const handleUpdate = async () => {
    if (!selectedItem || !price) return;
    setIsSubmitting(true);

    try {
      const res = await updateShoppingAction(selectedItem.id, Number(price), whoPaid);
      if (res.success) {
        // 更新成功時にローカルのリストから除外
        setItems((prev) => prev.filter((item) => item.id !== selectedItem.id));
        setSelectedItem(null);
        setPrice("");
      }
    } catch (err) {
      console.error(err);
      alert("通信エラーが発生しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <h2 className="text-xl font-extrabold mb-4 flex items-center justify-center gap-2">
        <span className="text-2xl">📝</span> Shopping ToDo
      </h2>
      <ul className="space-y-3">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex justify-between items-center p-4 bg-card border border-border rounded-2xl shadow-sm text-card-foreground"
          >
            <div className="flex flex-col">
              <span className="font-bold text-lg">{item.name}</span>
              <span className="text-xs text-muted-foreground">{item.date}</span>
            </div>
            <button
              onClick={() => setSelectedItem(item)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2 rounded-xl text-sm font-bold transition-all shadow-sm active:scale-95 whitespace-nowrap"
            >
              Checkout
            </button>
          </li>
        ))}
        {items.length === 0 && (
          <p className="text-muted-foreground text-center py-10 bg-secondary/30 rounded-2xl border border-dashed border-border text-sm">
            You have no pending items to buy.
          </p>
        )}
      </ul>

      {/* モーダル (ポップアップ) UI */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
          <div className="bg-card text-card-foreground rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl border border-border">
            <h3 className="text-xl font-bold mb-2">Checkout Details</h3>
            <p className="text-muted-foreground text-sm mb-6 pb-4 border-b border-border">
              Mark <strong className="text-foreground">{selectedItem.name}</strong> as Done.
            </p>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Actual Price (¥)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-lg font-bold">
                    ¥
                  </span>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full font-bold bg-background border border-border rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-ring transition-all text-foreground"
                    placeholder="e.g. 1500"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Who paid?
                </label>
                <div className="flex bg-muted p-1 rounded-xl shadow-inner">
                  <button
                    type="button"
                    onClick={() => setWhoPaid("Y")}
                    className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${
                      whoPaid === "Y"
                        ? "bg-background shadow-sm text-primary scale-100"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    }`}
                  >
                    Y
                  </button>
                  <button
                    type="button"
                    onClick={() => setWhoPaid("E")}
                    className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${
                      whoPaid === "E"
                        ? "bg-background shadow-sm text-primary scale-100"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    }`}
                  >
                    E
                  </button>
                </div>
              </div>

              <div className="flex justify-between gap-3 mt-8 pt-4">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="flex-1 py-3 font-bold text-muted-foreground hover:bg-secondary rounded-xl transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={isSubmitting || !price}
                  className="flex-1 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl transition-all shadow-md disabled:opacity-50 active:scale-95 flex justify-center items-center gap-2"
                >
                  {isSubmitting ? (
                    <svg
                      className="animate-spin h-5 w-5 text-current"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    "Confirm"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
