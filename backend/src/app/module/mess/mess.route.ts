import { Router } from "express";
import * as ctrl from "./mess.controller";
import * as val from "./mess.validator";
import { validate } from "../../middleware/validate.middleware";
import {
  checkMessManager,
  checkMessMembership,
  protect,
} from "../../middleware/auth.middleware";
const router = Router();
router.use(protect);
router.post("/", validate(val.createMessSchema), ctrl.createMess);
router.get("/", ctrl.getMyMesses);
router.get("/:id", checkMessMembership(), ctrl.getMessDetails);
router.patch(
  "/:id",
  checkMessManager(),
  validate(val.updateMessSchema),
  ctrl.updateMess,
);
router.post("/join", validate(val.joinMessSchema), ctrl.joinMess);
router.patch(
  "/:id/members/:userId/approve",
  checkMessManager(),
  ctrl.manageMember,
);
router.patch(
  "/:id/members/:userId/reject",
  checkMessManager(),
  ctrl.manageMember,
);
router.delete("/:id/members/:userId", checkMessManager(), ctrl.removeMember);
export { router as messRoutes };
