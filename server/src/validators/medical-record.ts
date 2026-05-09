import { z } from "zod";

export const createMedicalRecordSchema = z.object({
  appointmentId: z.string().min(1, "Appointment ID is required"),
  symptoms: z.array(z.string()).optional(),
  diagnosis: z.string().min(1, "Diagnosis is required"),
  notes: z.string().optional(),
  prescriptions: z
    .array(
      z.object({
        medicineName: z.string(),
        dosage: z.string(),
        frequency: z.string(),
        duration: z.string(),
        instructions: z.string().optional(),
      })
    )
    .optional(),
  labTestsRequested: z
    .array(
      z.object({
        testName: z.string(),
      })
    )
    .optional(),
  vitalSigns: z
    .object({
      bloodPressure: z.string().optional(),
      temperature: z.string().optional(),
      pulse: z.string().optional(),
      weight: z.string().optional(),
      height: z.string().optional(),
    })
    .optional(),
  followUpDate: z.string().or(z.date()).optional(),
});

export const updateMedicalRecordSchema = createMedicalRecordSchema.partial();

export const uploadLabReportSchema = z.object({
  testName: z.string().min(1, "Test name is required"),
  result: z.string().optional(),
  normalRange: z.string().optional(),
  remarks: z.string().optional(),
});
