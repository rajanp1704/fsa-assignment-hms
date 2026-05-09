import { Router } from "express";
import { doctorController } from "../controllers/index.js";
import { validateBody, authenticate, authorize } from "../middleware/index.js";
import {
  createDoctorSchema,
  updateDoctorSchema,
} from "../validators/doctor.js";

const router = Router();

/**
 * @swagger
 * /doctors:
 *   get:
 *     summary: Get all doctors
 *     tags: [Doctors]
 *     responses:
 *       200:
 *         description: List of doctors
 */
router.get("/", doctorController.getAllDoctors);

/**
 * @swagger
 * /doctors/{id}:
 *   get:
 *     summary: Get doctor by ID
 *     tags: [Doctors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Doctor data
 *       404:
 *         description: Doctor not found
 */
router.get("/:id", doctorController.getDoctorById);

/**
 * @swagger
 * /doctors/{id}/slots:
 *   get:
 *     summary: Get available slots for a doctor on a specific date
 *     tags: [Doctors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: date
 *         required: true
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: List of available slots
 */
router.get("/:id/slots", doctorController.getAvailableSlots);

/**
 * @swagger
 * /doctors:
 *   post:
 *     summary: Create doctor profile (Admin only)
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Doctor profile created
 */
router.post(
  "/",
  authenticate,
  authorize("admin"),
  validateBody(createDoctorSchema),
  doctorController.createDoctor
);

/**
 * @swagger
 * /doctors/me/profile:
 *   get:
 *     summary: Get logged-in doctor profile
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile data
 */
router.get(
  "/me/profile",
  authenticate,
  authorize("doctor"),
  doctorController.getProfile
);

/**
 * @swagger
 * /doctors/{id}:
 *   put:
 *     summary: Update doctor profile (Admin only)
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  validateBody(updateDoctorSchema),
  doctorController.updateDoctor
);

/**
 * @swagger
 * /doctors/{id}/status:
 *   patch:
 *     summary: Update doctor status (Admin only)
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Status updated
 */
router.patch(
  "/:id/status",
  authenticate,
  authorize("admin"),
  doctorController.updateStatus
);

export default router;
