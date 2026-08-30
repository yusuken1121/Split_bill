import type { ExpenseItem } from "@/lib/notion";
import type {
  CheckoutExpenseInput,
  CreateExpenseInput,
  SaveFixedCostInput,
  UpdateExpenseInput,
} from "@/lib/validators/expense.schema";
import { apiClient } from "./apiClient";

export interface MutationSuccessResponse {
  success: true;
}

export interface ExpensesListResponse {
  success: true;
  data: ExpenseItem[];
}

export const expensesApi = {
  list: async (): Promise<ExpenseItem[]> => {
    const response = (await apiClient.get(
      "/api/expenses",
    )) as ExpensesListResponse;
    return response.data;
  },

  create: async (data: CreateExpenseInput): Promise<MutationSuccessResponse> => {
    return apiClient.post(
      "/api/expenses",
      data,
    ) as Promise<MutationSuccessResponse>;
  },

  update: async (data: UpdateExpenseInput): Promise<MutationSuccessResponse> => {
    return apiClient.patch(
      "/api/expenses",
      data,
    ) as Promise<MutationSuccessResponse>;
  },

  checkout: async (
    data: CheckoutExpenseInput,
  ): Promise<MutationSuccessResponse> => {
    return apiClient.post(
      "/api/expenses/checkout",
      data,
    ) as Promise<MutationSuccessResponse>;
  },

  remove: async (id: string): Promise<MutationSuccessResponse> => {
    return apiClient.delete("/api/expenses", {
      data: { id },
    }) as Promise<MutationSuccessResponse>;
  },

  saveFixedCost: async (
    data: SaveFixedCostInput,
  ): Promise<MutationSuccessResponse> => {
    return apiClient.post(
      "/api/fixed-costs",
      data,
    ) as Promise<MutationSuccessResponse>;
  },
};
