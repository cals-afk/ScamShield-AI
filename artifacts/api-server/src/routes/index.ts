import { Router, type IRouter } from "express";
import healthRouter from "./health";
import scamRouter from "./scam";

const router: IRouter = Router();

router.use(healthRouter);
router.use(scamRouter);

export default router;
