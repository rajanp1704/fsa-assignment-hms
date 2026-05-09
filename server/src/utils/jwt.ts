import type { JwtPayload } from "../types/index.js";
import jwt from "jsonwebtoken";
import { env } from "../config/index.js";

export const generateToken = (payload: object) => {
  return jwt.sign(payload, env.JWT_SECRET as string, {
    expiresIn: env.JWT_EXPIRES_IN as any,
  });
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, env.JWT_SECRET as string) as JwtPayload;
};
