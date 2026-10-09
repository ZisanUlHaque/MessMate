import api from "./api";
import {
  MarkMealRequest,
  Meal,
  MealStats,
} from "@/types/meal.types";
import { ApiResponse } from "@/types/api.types";
import { parseDecimal } from "@/lib/helpers";

export async function markMeal(data: MarkMealRequest): Promise<Meal> {
  const response = await api.post<ApiResponse<{ meal: Meal } | Meal>>(
    "/meals",
    data
  );
  const res = response.data.data;
  return "meal" in res ? res.meal : res;
}

export async function getTodayMeals(messId: string): Promise<Meal[]> {
  const response = await api.get<ApiResponse<{ meals: Meal[] } | Meal[]>>(
    `/meals/today?messId=${encodeURIComponent(messId)}`
  );
  const res = response.data.data;
  return "meals" in res ? res.meals : (Array.isArray(res) ? res : []);
}

export async function getMealCalendar(
  messId: string,
  month: number,
  year: number
): Promise<Meal[]> {
  const response = await api.get<ApiResponse<{ meals: Meal[] } | Meal[]>>(
    `/meals/calendar?messId=${encodeURIComponent(messId)}&month=${month}&year=${year}`
  );
  const res = response.data.data;
  return "meals" in res ? res.meals : (Array.isArray(res) ? res : []);
}

export async function getMyMeals(
  messId: string,
  month: number,
  year: number
): Promise<Meal[]> {
  const response = await api.get<ApiResponse<{ meals: Meal[] } | Meal[]>>(
    `/meals/my-meals?messId=${encodeURIComponent(messId)}&month=${month}&year=${year}`
  );
  const res = response.data.data;
  return "meals" in res ? res.meals : (Array.isArray(res) ? res : []);
}

export async function updateMeal(
  id: string,
  data: Partial<{
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
  }>
): Promise<Meal> {
  const response = await api.patch<ApiResponse<{ meal: Meal } | Meal>>(
    `/meals/${id}`,
    data
  );
  const res = response.data.data;
  return "meal" in res ? res.meal : res;
}

export async function getMealStats(
  messId: string,
  month: number,
  year: number
): Promise<MealStats> {
  const response = await api.get<ApiResponse<MealStats>>(
    `/meals/stats?messId=${encodeURIComponent(messId)}&month=${month}&year=${year}`
  );
  const res = response.data.data;
  return {
    totalMeals: parseDecimal(res.totalMeals),
    dailyAverage: parseDecimal(res.dailyAverage),
    memberStats: (res.memberStats || []).map((m) => ({
      userId: m.userId,
      fullName: m.fullName,
      totalMeals: parseDecimal(m.totalMeals),
    })),
  };
}
