import { Router, type IRouter } from "express";
import healthRouter from "./health";
import scamRouter from "./scam";
import themeRouter from "./theme";
import heroRouter from "./hero";

const router: IRouter = Router();

router.use(healthRouter);
router.use(scamRouter);
router.use(themeRouter);
router.use(heroRouter);

export default router;
