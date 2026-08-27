import { Router } from "express";
import * as ctrl from "./notification.controller";
import { protect } from "../../middleware/auth.middleware";
const router = Router();
router.use(protect);
router.get("/", ctrl.getMyNotifications);
router.patch("/:id/read", ctrl.markRead);
export { router as notificationRoutes };
