import { z } from "zod";

export const createAppointmentSchema = z.object({
  doctorId: z.string().min(1, "Doctor ID is required"),
  date: z.string().or(z.date()),
  slot: z.string().min(1, "Time slot is required"),
  symptoms: z.string().optional(),
});

export const updateAppointmentStatusSchema = z.object({
  status: z.enum(["pending", "in-progress", "completed", "cancelled"]),
  notes: z.string().optional(),
});
