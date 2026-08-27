import { Router } from "express";
import * as ctrl from "./auth.controller";

import * as val from "./auth.validation";
import { validate } from "../../middleware/validate.middleware";
import { protect } from "../../middleware/auth.middleware";
const router = Router();
router.post("/register", validate(val.registerSchema), ctrl.register);
router.post("/login", validate(val.loginSchema), ctrl.login);
router.get("/me", protect, ctrl.getMe);
router.patch("/me", protect, validate(val.updateMeSchema), ctrl.updateMe);
router.patch(
  "/change-password",
  protect,
  validate(val.changePasswordSchema),
  ctrl.changePassword,
);
export { router as authRoutes };
