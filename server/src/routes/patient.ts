import { Router } from "express";
import { patientController } from "../controllers/index.js";
import { validateBody, authenticate, authorize } from "../middleware/index.js";
import {
  createPatientSchema,
  updatePatientSchema,
} from "../validators/patient.js";

const router = Router();

/**
 * @swagger
 * /patients/profile:
 *   post:
 *     summary: Create patient profile
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, age, gender, phone, address]
 *             properties:
 *               name: { type: string }
 *               age: { type: number }
 *               gender: { type: string, enum: [male, female, other] }
 *               phone: { type: string }
 *               address: { type: string }
 *               bloodGroup: { type: string }
 *               emergencyContact:
 *                 type: object
 *                 properties:
 *                   name: { type: string }
 *                   phone: { type: string }
 *                   relation: { type: string }
 *     responses:
 *       201:
 *         description: Profile created successfully
 */
router.post(
  "/profile",
  authenticate,
  authorize("patient"),
  validateBody(createPatientSchema),
  patientController.createProfile
);

/**
 * @swagger
 * /patients/profile:
 *   get:
 *     summary: Get logged-in patient profile
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Patient profile retrieved successfully
 *       404:
 *         description: Profile not found
 */
router.get(
  "/profile",
  authenticate,
  authorize("patient"),
  patientController.getProfile
);

/**
 * @swagger
 * /patients/profile:
 *   put:
 *     summary: Update patient profile
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               age: { type: number }
 *               gender: { type: string, enum: [male, female, other] }
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.put(
  "/profile",
  authenticate,
  authorize("patient"),
  validateBody(updatePatientSchema),
  patientController.updateProfile
);

/**
 * @swagger
 * /patients:
 *   get:
 *     summary: Get all patients (Admin/Staff/Doctor only)
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all patients
 */
router.get(
  "/",
  authenticate,
  authorize("admin", "doctor", "labstaff"),
  patientController.getAllPatients
);

/**
 * @swagger
 * /patients/{id}:
 *   get:
 *     summary: Get patient by ID
 *     tags: [Patients]
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
 *         description: Patient data retrieved
 */
router.get(
  "/:id",
  authenticate,
  authorize("admin", "doctor", "labstaff"),
  patientController.getPatientById
);

export default router;
