import { z } from "zod";

export const createDoctorSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  specialization: z.string().min(2, "Specialization is required"),
  qualification: z.string().min(2, "Qualification is required"),
  experience: z.number().min(0),
  phone: z.string().min(10),
  email: z.string().email(),
  password: z.string().min(6),
  opdTimings: z.array(
    z.object({
      day: z.string(),
      startTime: z.string(),
      endTime: z.string(),
      maxPatients: z.number().optional(),
    })
  ),
  consultationFee: z.number().min(0),
  status: z.enum(["active", "inactive", "on-leave"]).optional(),
});

export const updateDoctorSchema = createDoctorSchema.partial();
