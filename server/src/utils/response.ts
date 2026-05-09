import type { Response } from "express";

export interface Pagination {
  total: number;
  limit: number;
  page: number;
  [key: string]: any;
}

export const sendSuccess = <T>(
  res: Response,
  message: string,
  data: T | null = null,
  statusCode: number = 200
) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendError = (
  res: Response,
  message: string,
  statusCode: number = 500
) => {
  res.status(statusCode).json({
    success: false,
    message,
  });
};

export const sendPaginated = <T>(
  res: Response,
  message: string,
  data: T[],
  pagination: Pagination,
  statusCode: number = 200
) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    pagination: {
      ...pagination,
      pages: Math.ceil(pagination.total / pagination.limit),
    },
  });
};
