import type { Request, Response } from "express";
import { Patient } from "../models/index.js";
import { sendSuccess, sendError, sendPaginated } from "../utils/response.js";
import { Types, FilterQuery } from "mongoose";
import { IPatient } from "../types/index.js";

export const createProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return sendError(res, "Not authenticated", 401);
    }

    const data = req.body;

    const existingPatient = await Patient.findOne({
      userId: new Types.ObjectId(userId),
    });
    if (existingPatient) {
      return sendError(res, "Patient profile already exists", 400);
    }

    const patient = await Patient.create({
      userId: new Types.ObjectId(userId),
      ...data,
    });

    return sendSuccess(
      res,
      "Patient profile created successfully",
      patient,
      201
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to create profile";
    return sendError(res, message, 500);
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return sendError(res, "Not authenticated", 401);
    }

    const patient = await Patient.findOne({
      userId: new Types.ObjectId(userId),
    });
    if (!patient) {
      return sendError(res, "Patient profile not found", 404);
    }

    return sendSuccess(res, "Patient profile retrieved successfully", patient);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to retrieve profile";
    return sendError(res, message, 500);
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return sendError(res, "Not authenticated", 401);
    }

    const data = req.body;
    const patient = await Patient.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!patient) {
      return sendError(res, "Patient profile not found", 404);
    }

    return sendSuccess(res, "Patient profile updated successfully", patient);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to update profile";
    return sendError(res, message, 500);
  }
};

export const getPatientById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const patient = await Patient.findById(id);

    if (!patient) {
      return sendError(res, "Patient not found", 404);
    }

    return sendSuccess(res, "Patient retrieved successfully", patient);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to retrieve patient";
    return sendError(res, message, 500);
  }
};

export const getAllPatients = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;

    const query: FilterQuery<IPatient> = {};
    if (search) {
      query.$text = { $search: search };
    }

    const skip = (page - 1) * limit;
    const [patients, total] = await Promise.all([
      Patient.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
      Patient.countDocuments(query),
    ]);

    return sendPaginated(res, "Patients retrieved successfully", patients, {
      page,
      limit,
      total,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to retrieve patients";
    return sendError(res, message, 500);
  }
};
