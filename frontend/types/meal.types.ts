export interface MealUser {
  id: string;
  fullName: string;
}

export interface Meal {
  id: string;
  messId: string;
  userId: string;
  date: string;
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
  isLocked: boolean;
  createdAt: string;
  user?: MealUser;
}

export interface MarkMealRequest {
  messId: string;
  date: string;
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
}

export interface MemberMealStat {
  userId: string;
  fullName: string;
  totalMeals: number;
}

export interface MealStats {
  totalMeals: number;
  memberStats: MemberMealStat[];
  dailyAverage: number;
}
