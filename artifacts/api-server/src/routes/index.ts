import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import habitsRouter from "./habits";
import goalsRouter from "./goals";
import tasksRouter from "./tasks";
import journalRouter from "./journal";
import aiRouter from "./ai";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(habitsRouter);
router.use(goalsRouter);
router.use(tasksRouter);
router.use(journalRouter);
router.use(aiRouter);

export default router;
