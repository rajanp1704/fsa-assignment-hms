import type { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/response.js";
import { AnyZodObject, ZodError } from "zod";

export const validate = (
  schema: AnyZodObject,
  source: "body" | "params" | "query" = "body"
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await schema.parseAsync(req[source]);
      req[source] = data;
      next();
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        const message = error.errors.map((e) => e.message).join(", ");
        return sendError(res, message, 400);
      }
      const errorMessage =
        error instanceof Error ? error.message : "Validation failed";
      sendError(res, errorMessage, 400);
    }
  };
};

export const validateBody = (schema: AnyZodObject) => validate(schema, "body");
export const validateParams = (schema: AnyZodObject) =>
  validate(schema, "params");
export const validateQuery = (schema: AnyZodObject) =>
  validate(schema, "query");
