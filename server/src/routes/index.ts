import express from "express";
import authRoutes from "./auth.js";
import patientRoutes from "./patient.js";
import doctorRoutes from "./doctor.js";
import appointmentRoutes from "./appointment.js";
import medicalRecordRoutes from "./medical-record.js";
import type { Router as ExpressRouter } from "express";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/patients", patientRoutes);
router.use("/doctors", doctorRoutes);
router.use("/appointments", appointmentRoutes);
router.use("/medical-records", medicalRecordRoutes);

export default router as ExpressRouter;
