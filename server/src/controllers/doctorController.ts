import type { Request, Response } from "express";
import { Doctor, User, Appointment } from "../models/index.js";
import { sendSuccess, sendError, sendPaginated } from "../utils/response.js";
import { Types, FilterQuery } from "mongoose";
import { IDoctor } from "../types/index.js";

const generateTimeSlots = (
  startTime: string,
  endTime: string,
  intervalMinutes: number
): string[] => {
  const slots: string[] = [];
  const [startHour, startMin] = startTime.split(":").map(Number);
  const [endHour, endMin] = endTime.split(":").map(Number);

  let currentHour = startHour;
  let currentMin = startMin;

  while (
    currentHour < endHour ||
    (currentHour === endHour && currentMin < endMin)
  ) {
    const timeString = `${currentHour.toString().padStart(2, "0")}:${currentMin.toString().padStart(2, "0")}`;
    slots.push(timeString);

    currentMin += intervalMinutes;
    if (currentMin >= 60) {
      currentHour += Math.floor(currentMin / 60);
      currentMin = currentMin % 60;
    }
  }

  return slots;
};

export const createDoctor = async (req: Request, res: Response) => {
  try {
    const data = req.body;

    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      return sendError(res, "User with this email already exists", 400);
    }

    const user = await User.create({
      email: data.email,
      password: data.password,
      role: "doctor",
    });

    const doctor = await Doctor.create({
      userId: user._id,
      name: data.name,
      specialization: data.specialization,
      qualification: data.qualification,
      experience: data.experience,
      phone: data.phone,
      email: data.email,
      opdTimings: data.opdTimings,
      consultationFee: data.consultationFee,
      status: data.status || "active",
    });

    return sendSuccess(
      res,
      "Doctor created successfully",
      { doctor, userId: user._id.toString() },
      201
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to create doctor";
    return sendError(res, message, 500);
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return sendError(res, "Not authenticated", 401);
    }

    const doctor = await Doctor.findOne({ userId: new Types.ObjectId(userId) });
    if (!doctor) {
      return sendError(res, "Doctor profile not found", 404);
    }

    return sendSuccess(res, "Doctor profile retrieved successfully", doctor);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to retrieve profile";
    return sendError(res, message, 500);
  }
};

export const getDoctorById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const doctor = await Doctor.findById(id);

    if (!doctor) {
      return sendError(res, "Doctor not found", 404);
    }

    return sendSuccess(res, "Doctor retrieved successfully", doctor);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to retrieve doctor";
    return sendError(res, message, 500);
  }
};

export const updateDoctor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const doctor = await Doctor.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!doctor) {
      return sendError(res, "Doctor not found", 404);
    }

    return sendSuccess(res, "Doctor updated successfully", doctor);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to update doctor";
    return sendError(res, message, 500);
  }
};

export const getAllDoctors = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const specialization = req.query.specialization as string;
    const status = (req.query.status as string) || "active";

    const query: FilterQuery<IDoctor> = { status };

    if (specialization) {
      query.specialization = new RegExp(specialization, "i");
    }

    const skip = (page - 1) * limit;
    const [doctors, total] = await Promise.all([
      Doctor.find(query).skip(skip).limit(limit).sort({ name: 1 }),
      Doctor.countDocuments(query),
    ]);

    return sendPaginated(res, "Doctors retrieved successfully", doctors, {
      page,
      limit,
      total,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to retrieve doctors";
    return sendError(res, message, 500);
  }
};

export const getAvailableSlots = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const dateStr = req.query.date as string;

    if (!dateStr) {
      return sendError(res, "Date is required", 400);
    }

    const date = new Date(dateStr);
    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return sendError(res, "Doctor not found", 404);
    }

    const dayOfWeek = date
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase();
    const opdTiming = doctor.opdTimings.find((t) => t.day === dayOfWeek);

    if (!opdTiming) {
      return sendSuccess(res, "Available slots retrieved successfully", {
        day: dayOfWeek,
        slots: [],
        bookedSlots: [],
      });
    }

    const slots = generateTimeSlots(opdTiming.startTime, opdTiming.endTime, 15);

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const bookedAppointments = await Appointment.find({
      doctorId: new Types.ObjectId(id),
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: "cancelled" },
    }).select("slot");

    const bookedSlots = bookedAppointments.map((a) => (a as any).slot);

    return sendSuccess(res, "Available slots retrieved successfully", {
      day: dayOfWeek,
      slots,
      bookedSlots,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to retrieve slots";
    return sendError(res, message, 500);
  }
};

export const updateStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const doctor = await Doctor.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!doctor) {
      return sendError(res, "Doctor not found", 404);
    }

    return sendSuccess(res, "Doctor status updated successfully", doctor);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to update status";
    return sendError(res, message, 500);
  }
};
