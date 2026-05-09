import type { Request, Response } from "express";
import { User, Patient, Doctor } from "../models/index.js";
import { generateToken } from "../utils/jwt.js";
import { sendSuccess, sendError, sendPaginated } from "../utils/response.js";
import { env } from "../config/env.js";

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, "Email already in use", 400);
    }

    await User.create({
      email,
      password,
      role: role || "patient",
    });

    return sendSuccess(res, "User registered successfully", null, 201);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Registration failed";
    return sendError(res, message, 500);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return sendError(res, "Invalid email or password", 401);
    }

    let profileData: any = null; // Profile can be various types
    if (user.role === "patient") {
      profileData = await Patient.findOne({ userId: user._id });
    } else if (user.role === "doctor") {
      profileData = await Doctor.findOne({ userId: user._id });
    }

    const token = generateToken({
      userId: user._id.toString(),
      role: user.role,
    });

    const tokenExp = parseInt(env.JWT_EXPIRES_IN);

    return sendSuccess(res, "Login successful", {
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: profileData,
      },
      token,
      tokenExp,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Login failed";
    return sendError(res, message, 500);
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    const user = await User.findById(userId);
    if (!user) {
      return sendError(res, "User not found", 404);
    }

    let profileData: any = null;
    if (user.role === "patient") {
      profileData = await Patient.findOne({ userId: user._id });
    } else if (user.role === "doctor") {
      profileData = await Doctor.findOne({ userId: user._id });
    }

    return sendSuccess(res, "User data retrieved", {
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: profileData,
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to retrieve user data";
    return sendError(res, message, 500);
  }
};

export const getUsersByRole = async (req: Request, res: Response) => {
  try {
    const { role } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const query: any = {};
    if (role) {
      query.role = role;
    }

    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find(query)
        .select("-password")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      User.countDocuments(query),
    ]);

    return sendPaginated(res, "Users retrieved successfully", users, {
      page,
      limit,
      total,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to retrieve users";
    return sendError(res, message, 500);
  }
};
