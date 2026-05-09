import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "5000"),
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/hospital",
  JWT_SECRET: process.env.JWT_SECRET || "your_jwt_secret",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  UPLOAD_PATH: process.env.UPLOAD_PATH || "uploads",
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || "5242880") * 1024 * 1024,
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:3000",
};
