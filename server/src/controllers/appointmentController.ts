import type { Request, Response } from "express";
import { Appointment, Doctor, Patient } from "../models/index.js";
import { sendSuccess, sendError, sendPaginated } from "../utils/response.js";
import { Types, FilterQuery } from "mongoose";
import { IAppointmentDocument } from "../models/Appointment.js";
import { getIO } from "../config/socket.js";

export const createAppointment = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return sendError(res, "Not authenticated", 401);
    }

    const { doctorId, date, slot, symptoms } = req.body;

    const patient = await Patient.findOne({
      userId: new Types.ObjectId(userId),
    });
    if (!patient) {
      return sendError(res, "Patient profile not found", 404);
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor || doctor.status !== "active") {
      return sendError(res, "Doctor not found or currently unavailable", 404);
    }

    const existingAppointment = await Appointment.findOne({
      doctorId: new Types.ObjectId(doctorId),
      date: new Date(date),
      slot,
      status: { $ne: "cancelled" },
    });

    if (existingAppointment) {
      return sendError(res, "This time slot is already booked", 400);
    }

    const appointmentDate = new Date(date);
    const dayOfWeek = appointmentDate
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase();
    const opdTiming = doctor.opdTimings.find((t) => t.day === dayOfWeek);

    if (!opdTiming) {
      return sendError(res, `Doctor is not available on ${dayOfWeek}`, 400);
    }

    const appointment = await Appointment.create({
      patientId: patient._id,
      doctorId: doctor._id,
      date: appointmentDate,
      slot,
      symptoms,
    });

    // Notify doctor about new appointment
    getIO().to(`doctor-${doctor._id}`).emit("newAppointment", appointment);

    return sendSuccess(
      res,
      "Appointment booked successfully",
      appointment,
      201
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to create appointment";
    return sendError(res, message, 500);
  }
};

export const getMyAppointments = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const role = req.user?.role;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;

    const query: FilterQuery<IAppointmentDocument> = {};
    if (status) query.status = status;

    if (role === "patient") {
      const patient = await Patient.findOne({
        userId: new Types.ObjectId(userId),
      });
      if (!patient) return sendError(res, "Patient profile not found", 404);
      query.patientId = patient._id;
    } else if (role === "doctor") {
      const doctor = await Doctor.findOne({
        userId: new Types.ObjectId(userId),
      });
      if (!doctor) return sendError(res, "Doctor profile not found", 404);
      query.doctorId = doctor._id;
    }

    const skip = (page - 1) * limit;
    const [appointments, total] = await Promise.all([
      Appointment.find(query)
        .populate("patientId", "name phone")
        .populate("doctorId", "name specialization")
        .sort({ date: -1, slot: 1 })
        .skip(skip)
        .limit(limit),
      Appointment.countDocuments(query),
    ]);

    return sendPaginated(
      res,
      "Appointments retrieved successfully",
      appointments,
      {
        page,
        limit,
        total,
      }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to retrieve appointments";
    return sendError(res, message, 500);
  }
};

export const getAppointmentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id)
      .populate("patientId")
      .populate("doctorId");

    if (!appointment) {
      return sendError(res, "Appointment not found", 404);
    }

    return sendSuccess(res, "Appointment retrieved successfully", appointment);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to retrieve appointment";
    return sendError(res, message, 500);
  }
};

export const updateAppointmentStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { status, notes },
      { new: true, runValidators: true }
    );

    if (!appointment) {
      return sendError(res, "Appointment not found", 404);
    }

    // Notify doctor about queue update
    getIO()
      .to(`doctor-${appointment.doctorId}`)
      .emit("queueUpdated", appointment);

    return sendSuccess(
      res,
      "Appointment status updated successfully",
      appointment
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to update appointment status";
    return sendError(res, message, 500);
  }
};

export const getAppointmentsForDoctor = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return sendError(res, "Not authenticated", 401);
    }

    const doctor = await Doctor.findOne({ userId: new Types.ObjectId(userId) });
    if (!doctor) {
      return sendError(res, "Doctor profile not found", 404);
    }

    const dateStr = req.query.date as string;
    const query: FilterQuery<IAppointmentDocument> = { doctorId: doctor._id };

    if (dateStr) {
      const startOfDay = new Date(dateStr);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(dateStr);
      endOfDay.setHours(23, 59, 59, 999);
      query.date = { $gte: startOfDay, $lte: endOfDay };
    }

    const appointments = await Appointment.find(query)
      .populate(
        "patientId",
        "name age gender phone bloodGroup allergies medicalHistory"
      )
      .sort({ slot: 1 });

    return sendSuccess(
      res,
      "Doctor appointments retrieved successfully",
      appointments
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to retrieve doctor appointments";
    return sendError(res, message, 500);
  }
};

export const getQueueStatus = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return sendError(res, "Not authenticated", 401);
    }

    const doctor = await Doctor.findOne({ userId: new Types.ObjectId(userId) });
    if (!doctor) {
      return sendError(res, "Doctor profile not found", 404);
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const query: FilterQuery<IAppointmentDocument> = {
      doctorId: doctor._id,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ["pending", "in-progress"] },
    };

    const appointments = await Appointment.find(query)
      .populate("patientId", "name gender age medicalHistory allergies")
      .sort({ slot: 1 });

    return sendSuccess(
      res,
      "Queue status retrieved successfully",
      appointments
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to retrieve queue status";
    return sendError(res, message, 500);
  }
};

export const getAppointmentStats = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return sendError(res, "Not authenticated", 401);
    }

    const doctor = await Doctor.findOne({ userId: new Types.ObjectId(userId) });
    if (!doctor) {
      return sendError(res, "Doctor profile not found", 404);
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const appointments = await Appointment.find({
      doctorId: doctor._id,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    const stats = {
      total: appointments.length,
      pending: appointments.filter((a) => a.status === "pending").length,
      inProgress: appointments.filter((a) => a.status === "in-progress").length,
      completed: appointments.filter((a) => a.status === "completed").length,
    };

    return sendSuccess(
      res,
      "Appointment statistics retrieved successfully",
      stats
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to retrieve statistics";
    return sendError(res, message, 500);
  }
};
