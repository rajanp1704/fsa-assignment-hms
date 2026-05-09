import type { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/response.js";

export class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error & {
    statusCode?: number;
    status?: string;
    isOperational?: boolean;
  },
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    res.status(statusCode).json({
      status: false,
      message: err.message,
      stack: err.stack,
    });
  } else {
    if (err.isOperational) {
      sendError(res, err.message, statusCode);
    } else {
      console.error("ERROR 💥", err);
      sendError(res, "Something went wrong!", 500);
    }
  }
};

export const notFound = (req: Request, res: Response, _next: NextFunction) => {
  throw new AppError(`Can't find ${req.originalUrl} on this server!`, 404);
};
