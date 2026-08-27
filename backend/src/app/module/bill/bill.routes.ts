import { Router } from "express";
import * as ctrl from "./bill.controller";
import {
  checkMessManager,
  checkMessMembership,
  protect,
} from "../../middleware/auth.middleware";

const router = Router();
router.use(protect);
router.post("/generate", checkMessManager("messId"), ctrl.generateBill);
router.get("/my-bill", checkMessMembership("messId"), ctrl.getMyBill);
router.post("/:id/pay", checkMessManager("messId"), ctrl.payBill);
export { router as billRoutes };
