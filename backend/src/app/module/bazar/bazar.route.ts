import { Router } from "express";
import * as ctrl from "./bazar.controller";
import { checkMessMembership, protect } from "../../middleware/auth.middleware";
import { uploadSingle } from "../../middleware/upload.middleware";

const router = Router();
router.use(protect);
router.post(
  "/",
  uploadSingle("receipt"),
  checkMessMembership("messId"),
  ctrl.addBazar,
);
router.get("/", checkMessMembership("messId"), ctrl.getBazars);
export { router as bazarRoutes };
