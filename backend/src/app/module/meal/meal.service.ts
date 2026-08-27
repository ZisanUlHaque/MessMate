import { AppError } from "../../utils/AppError";
import { MEAL_DEADLINE_HOUR } from "../../utils/constants";

export const checkMealDeadline = (targetDate: Date) => {
  const target = new Date(targetDate).setHours(0, 0, 0, 0);
  const today = new Date().setHours(0, 0, 0, 0);
  if (target < today) throw new AppError(400, "Cannot modify past meals");
  if (
    target === today &&
    new Date(Date.now() + 6 * 60 * 60 * 1000).getUTCHours() >=
      MEAL_DEADLINE_HOUR
  ) {
    throw new AppError(400, "Meal marking deadline passed (10 PM)");
  }
};
