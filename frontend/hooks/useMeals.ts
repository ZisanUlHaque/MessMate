import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as mealService from "@/services/meal.service";
import { MarkMealRequest } from "@/types/meal.types";

export function useTodayMeals(messId: string) {
  return useQuery({
    queryKey: ["meals", "today", messId],
    queryFn: () => mealService.getTodayMeals(messId),
    enabled: !!messId,
  });
}

export function useMealCalendar(messId: string, month: number, year: number) {
  return useQuery({
    queryKey: ["meals", "calendar", messId, month, year],
    queryFn: () => mealService.getMealCalendar(messId, month, year),
    enabled: !!messId && month > 0 && year > 0,
  });
}

export function useMyMeals(messId: string, month: number, year: number) {
  return useQuery({
    queryKey: ["meals", "my", messId, month, year],
    queryFn: () => mealService.getMyMeals(messId, month, year),
    enabled: !!messId && month > 0 && year > 0,
  });
}

export function useMarkMeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: MarkMealRequest) => mealService.markMeal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meals"] });
    },
  });
}

export function useUpdateMeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<{
        breakfast: boolean;
        lunch: boolean;
        dinner: boolean;
      }>;
    }) => mealService.updateMeal(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meals"] });
    },
  });
}

export function useMealStats(messId: string, month: number, year: number) {
  return useQuery({
    queryKey: ["meals", "stats", messId, month, year],
    queryFn: () => mealService.getMealStats(messId, month, year),
    enabled: !!messId && month > 0 && year > 0,
  });
}
