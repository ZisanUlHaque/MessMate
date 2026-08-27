import { Router } from "express";
import * as ctrl from "./meal.controller";
import { checkMessMembership, protect } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import * as val from "./meal.validation";
const router = Router();
router.use(protect);
router.post(
  "/",
  validate(val.mealSchema),
  checkMessMembership("messId"),
  ctrl.upsertMeal,
);
router.get("/today", checkMessMembership("messId"), ctrl.getTodayMeals);
router.get("/my-meals", checkMessMembership("messId"), ctrl.getMyMeals);
router.patch("/:id", validate(val.updateMealSchema), ctrl.updateMealOwner);
export { router as mealRoutes };
