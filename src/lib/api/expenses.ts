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

  update: async (
    id: string,
    data: UpdateExpenseInput,
  ): Promise<MutationSuccessResponse> => {
    return apiClient.patch(
      `/api/expenses/${id}`,
      data,
    ) as Promise<MutationSuccessResponse>;
  },

  checkout: async (
    id: string,
    data: CheckoutExpenseInput,
  ): Promise<MutationSuccessResponse> => {
    return apiClient.post(
      `/api/expenses/${id}/checkout`,
      data,
    ) as Promise<MutationSuccessResponse>;
  },

  remove: async (id: string): Promise<MutationSuccessResponse> => {
    return apiClient.delete(
      `/api/expenses/${id}`,
    ) as Promise<MutationSuccessResponse>;
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
