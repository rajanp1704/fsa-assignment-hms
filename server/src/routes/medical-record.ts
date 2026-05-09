import { Router } from "express";
import { medicalRecordController } from "../controllers/index.js";
import { validateBody, authenticate, authorize } from "../middleware/index.js";
import { uploadSingle } from "../middleware/upload.js";
import {
  createMedicalRecordSchema,
  updateMedicalRecordSchema,
} from "../validators/medical-record.js";

const router = Router();

/**
 * @swagger
 * /medical-records:
 *   post:
 *     summary: Create a medical record
 *     tags: [Medical Records]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [appointmentId, symptoms, diagnosis]
 *             properties:
 *               appointmentId: { type: string }
 *               symptoms: { type: array, items: { type: string } }
 *               diagnosis: { type: string }
 *               notes: { type: string }
 *     responses:
 *       201:
 *         description: Medical record created
 */
router.post(
  "/",
  authenticate,
  authorize("doctor"),
  validateBody(createMedicalRecordSchema),
  medicalRecordController.createMedicalRecord
);

/**
 * @swagger
 * /medical-records/{id}:
 *   put:
 *     summary: Update medical record
 *     tags: [Medical Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Medical record updated
 */
router.put(
  "/:id",
  authenticate,
  authorize("doctor"),
  validateBody(updateMedicalRecordSchema),
  medicalRecordController.updateMedicalRecord
);

/**
 * @swagger
 * /medical-records/my:
 *   get:
 *     summary: Get logged-in patient's medical records
 *     tags: [Medical Records]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of medical records
 */
router.get(
  "/my",
  authenticate,
  authorize("patient"),
  medicalRecordController.getMyMedicalRecords
);

/**
 * @swagger
 * /medical-records/my/lab-reports:
 *   get:
 *     summary: Get logged-in patient's lab reports
 *     tags: [Medical Records]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of lab reports
 */
router.get(
  "/my/lab-reports",
  authenticate,
  authorize("patient"),
  medicalRecordController.getMyLabReports
);

/**
 * @swagger
 * /medical-records/pending-tests:
 *   get:
 *     summary: Get pending lab tests (Staff/Admin only)
 *     tags: [Medical Records]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending tests
 */
router.get(
  "/pending-tests",
  authenticate,
  authorize("labstaff", "admin"),
  medicalRecordController.getPendingLabTests
);

/**
 * @swagger
 * /medical-records/{recordId}/tests/{testId}/status:
 *   patch:
 *     summary: Update lab test status
 *     tags: [Medical Records]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Test status updated
 */
router.patch(
  "/:recordId/tests/:testId/status",
  authenticate,
  authorize("labstaff", "admin"),
  medicalRecordController.updateLabTestStatus
);

/**
 * @swagger
 * /medical-records/{recordId}/tests/{testId}/report:
 *   post:
 *     summary: Upload lab report file
 *     tags: [Medical Records]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Report uploaded successfully
 */
router.post(
  "/:recordId/tests/:testId/report",
  authenticate,
  authorize("labstaff", "admin"),
  uploadSingle("report"),
  medicalRecordController.uploadLabReport
);

/**
 * @swagger
 * /medical-records/appointment/{appointmentId}:
 *   get:
 *     summary: Get medical record by appointment ID
 *     tags: [Medical Records]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Medical record data
 */
router.get(
  "/appointment/:appointmentId",
  authenticate,
  medicalRecordController.getMedicalRecordByAppointment
);

export default router;
