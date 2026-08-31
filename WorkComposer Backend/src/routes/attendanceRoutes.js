import express from "express";
import {
  finishAttendance,
  getAttendanceData,
  getDailyWorkReport,
  getUserAttendanceSummary,
} from "../controllers/attendance.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protect, getAttendanceData);
router.get("/summary/:userId", protect, getUserAttendanceSummary);
router.get("/daily-report", protect, getDailyWorkReport);
router.post("/finish", protect, finishAttendance);

export default router;
