"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { ReportLineItem } from "@/lib/calculations";
import {
  useDeleteExpense,
  useUpdateExpense,
} from "@/lib/api/queries/useExpenses";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type Whose = "both" | "Y" | "E";
type Payer = "Y" | "E";

interface ExpenseRowActionsProps {
  item: ReportLineItem;
}

export function ExpenseRowActions({ item }: ExpenseRowActionsProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [name, setName] = useState(item.name);
  const [date, setDate] = useState(item.date);
  const [price, setPrice] = useState(String(item.price));
  const [whose, setWhose] = useState<Whose>(item.whose ?? "both");
  const [whoPaid, setWhoPaid] = useState<Payer>(item.whoPaid ?? "Y");
  const [error, setError] = useState<string | null>(null);
  const { mutateAsync: updateExpense, isPending: isSaving } = useUpdateExpense();
  const { mutateAsync: deleteExpense, isPending: isDeleting } =
    useDeleteExpense();

  useEffect(() => {
    if (!editOpen) {
      return;
    }
    setName(item.name);
    setDate(item.date);
    setPrice(String(item.price));
    setWhose(item.whose ?? "both");
    setWhoPaid(item.whoPaid ?? "Y");
    setError(null);
  }, [editOpen, item]);

  const handleSave = async () => {
    const numericPrice = Number(price);
    if (!name.trim() || !date || Number.isNaN(numericPrice) || numericPrice < 0) {
      setError("Name, date, and a valid amount are required.");
      return;
    }

    setError(null);
    try {
      await updateExpense({
        id: item.id,
        name: name.trim(),
        date,
        price: numericPrice,
        whose,
        whoPaid,
      });
      setEditOpen(false);
    } catch (saveError) {
      console.error(saveError);
      setError(saveError instanceof Error ? saveError.message : "Failed to save.");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteExpense(item.id);
      setDeleteOpen(false);
    } catch (deleteError) {
      console.error(deleteError);
      alert(deleteError instanceof Error ? deleteError.message : "Failed to delete.");
    }
  };

  return (
    <>
      <div className="flex justify-end gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`Edit ${item.name}`}
          onClick={() => setEditOpen(true)}
        >
          <Pencil />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`Delete ${item.name}`}
          onClick={() => setDeleteOpen(true)}
        >
          <Trash2 className="text-destructive" />
        </Button>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="rounded-3xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit expense</DialogTitle>
            <DialogDescription>Fix a mistaken item, then save.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <label className="block space-y-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Item
              </span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full bg-background border border-border rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-ring text-foreground font-medium"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Date
              </span>
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="w-full bg-background border border-border rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-ring text-foreground font-medium"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Amount
              </span>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-lg font-bold">
                  ¥
                </span>
                <input
                  type="number"
                  inputMode="numeric"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  className="w-full bg-background border border-border rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-ring text-foreground font-medium"
                />
              </div>
            </label>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 text-center">
                Whose?
              </p>
              <div className="flex bg-muted p-1 rounded-xl shadow-inner">
                {(["both", "Y", "E"] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setWhose(value)}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                      whose === value
                        ? "bg-background shadow-sm text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {value === "both" ? "Both" : value}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 text-center">
                Who paid?
              </p>
              <div className="flex bg-muted p-1 rounded-xl shadow-inner">
                {(["Y", "E"] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setWhoPaid(value)}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                      whoPaid === value
                        ? "bg-background shadow-sm text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
            {error ? <p className="text-sm text-destructive font-medium">{error}</p> : null}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this expense?</AlertDialogTitle>
            <AlertDialogDescription>
              {item.name} ({item.date}) will be removed from Notion. This cannot be undone from
              the dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              disabled={isDeleting}
              onClick={(event) => {
                event.preventDefault();
                void handleDelete();
              }}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
