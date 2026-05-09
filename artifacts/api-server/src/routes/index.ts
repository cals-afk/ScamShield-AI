import { Router, type IRouter } from "express";
import healthRouter from "./health";
import scamRouter from "./scam";
import themeRouter from "./theme";

const router: IRouter = Router();

router.use(healthRouter);
router.use(scamRouter);
router.use(themeRouter);

export default router;
