import { Router } from "express";
import { appointmentController } from "../controllers/index.js";
import { validateBody, authenticate, authorize } from "../middleware/index.js";
import {
  createAppointmentSchema,
  updateAppointmentStatusSchema,
} from "../validators/appointment.js";

const router = Router();

/**
 * @swagger
 * /appointments:
 *   post:
 *     summary: Create a new appointment
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - doctorId
 *               - date
 *               - slot
 *             properties:
 *               doctorId:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               slot:
 *                 type: string
 *               symptoms:
 *                 type: string
 *     responses:
 *       201:
 *         description: Appointment created successfully
 *       400:
 *         description: Validation error or slot already booked
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (Patients only)
 */
router.post(
  "/",
  authenticate,
  authorize("patient"),
  validateBody(createAppointmentSchema),
  appointmentController.createAppointment
);

/**
 * @swagger
 * /appointments/my:
 *   get:
 *     summary: Get appointments for the logged-in patient
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of patient appointments
 */
router.get(
  "/my",
  authenticate,
  authorize("patient"),
  appointmentController.getMyAppointments
);

/**
 * @swagger
 * /appointments/queue:
 *   get:
 *     summary: Get today's appointment queue for the logged-in doctor
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Queue status retrieved successfully
 */
router.get(
  "/queue",
  authenticate,
  authorize("doctor"),
  appointmentController.getQueueStatus
);

/**
 * @swagger
 * /appointments/{id}/status:
 *   patch:
 *     summary: Update appointment status
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, in-progress, completed, cancelled]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Appointment status updated successfully
 */
router.patch(
  "/:id/status",
  authenticate,
  authorize("doctor"),
  validateBody(updateAppointmentStatusSchema),
  appointmentController.updateAppointmentStatus
);

/**
 * @swagger
 * /appointments/doctor/today:
 *   get:
 *     summary: Get all appointments for a doctor today
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of today's appointments for the doctor
 */
router.get(
  "/doctor/today",
  authenticate,
  authorize("doctor"),
  appointmentController.getAppointmentsForDoctor
);

/**
 * @swagger
 * /appointments/stats:
 *   get:
 *     summary: Get appointment statistics for the logged-in doctor
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Appointment statistics retrieved successfully
 */
router.get(
  "/stats",
  authenticate,
  authorize("doctor"),
  appointmentController.getAppointmentStats
);

/**
 * @swagger
 * /appointments/{id}:
 *   get:
 *     summary: Get appointment details by ID
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Appointment details retrieved successfully
 *       404:
 *         description: Appointment not found
 */
router.get("/:id", authenticate, appointmentController.getAppointmentById);

export default router;
