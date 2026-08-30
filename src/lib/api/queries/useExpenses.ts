import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import type { ExpenseItem } from "@/lib/notion";
import type {
  CheckoutExpenseInput,
  CreateExpenseInput,
  SaveFixedCostInput,
  UpdateExpenseInput,
} from "@/lib/validators/expense.schema";
import { expensesApi, type MutationSuccessResponse } from "../expenses";

export const expenseKeys = {
  all: ["expenses"] as const,
  list: () => [...expenseKeys.all, "list"] as const,
};

type UseExpensesOptions = Omit<
  UseQueryOptions<ExpenseItem[], Error>,
  "queryKey" | "queryFn"
>;

export const useExpenses = (options?: UseExpensesOptions) => {
  return useQuery({
    queryKey: expenseKeys.list(),
    queryFn: expensesApi.list,
    ...options,
  });
};

function useInvalidateExpenses() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: expenseKeys.all });
}

export const useCreateExpense = (
  options?: UseMutationOptions<
    MutationSuccessResponse,
    Error,
    CreateExpenseInput
  >,
) => {
  const invalidate = useInvalidateExpenses();
  return useMutation({
    mutationFn: expensesApi.create,
    ...options,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await invalidate();
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
};

type UpdateExpenseVariables = UpdateExpenseInput;

export const useUpdateExpense = (
  options?: UseMutationOptions<
    MutationSuccessResponse,
    Error,
    UpdateExpenseVariables
  >,
) => {
  const invalidate = useInvalidateExpenses();
  return useMutation({
    mutationFn: expensesApi.update,
    ...options,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await invalidate();
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
};

type CheckoutExpenseVariables = CheckoutExpenseInput;

export const useCheckoutExpense = (
  options?: UseMutationOptions<
    MutationSuccessResponse,
    Error,
    CheckoutExpenseVariables
  >,
) => {
  const invalidate = useInvalidateExpenses();
  return useMutation({
    mutationFn: expensesApi.checkout,
    ...options,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await invalidate();
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
};

export const useDeleteExpense = (
  options?: UseMutationOptions<MutationSuccessResponse, Error, string>,
) => {
  const invalidate = useInvalidateExpenses();
  return useMutation({
    mutationFn: expensesApi.remove,
    ...options,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await invalidate();
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
};

export const useSaveFixedCost = (
  options?: UseMutationOptions<
    MutationSuccessResponse,
    Error,
    SaveFixedCostInput
  >,
) => {
  const invalidate = useInvalidateExpenses();
  return useMutation({
    mutationFn: expensesApi.saveFixedCost,
    ...options,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await invalidate();
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
};
