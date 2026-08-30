import { z } from "zod";
import { FIXED_COST_KINDS } from "@/features/fixed-costs/constants";

export const whoseSchema = z.enum(["both", "Y", "E"]);
export const payerSchema = z.enum(["Y", "E"]);
export const statusSchema = z.enum(["Not bought", "Done"]);

export const createExpenseSchema = z.object({
  stuff: z.string().trim().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  price: z.number().nonnegative().optional(),
  status: statusSchema,
  whoPaid: payerSchema.nullable(),
  whose: whoseSchema,
});

export const updateExpenseSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  price: z.number().nonnegative(),
  whose: whoseSchema,
  whoPaid: payerSchema,
});

export const checkoutExpenseSchema = z.object({
  id: z.string().min(1),
  price: z.number().positive(),
  whoPaid: payerSchema,
});

export const deleteExpenseSchema = z.object({
  id: z.string().min(1),
});

export const saveFixedCostSchema = z.object({
  kind: z.enum(FIXED_COST_KINDS),
  coverageMonth: z.string().regex(/^\d{4}-\d{2}$/),
  price: z.number().positive(),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type CheckoutExpenseInput = z.infer<typeof checkoutExpenseSchema>;
export type SaveFixedCostInput = z.infer<typeof saveFixedCostSchema>;
