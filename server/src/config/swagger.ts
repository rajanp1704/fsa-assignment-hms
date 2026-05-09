import type { Express } from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { env } from "./env.js";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Hospital Management API",
      version: "1.0.0",
      description: "API documentation for Hospital Management System",
    },
    servers: [
      {
        url: `http://localhost:${env.PORT || 5000}/api`,
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            _id: { type: "string" },
            email: { type: "string" },
            role: {
              type: "string",
              enum: ["admin", "doctor", "patient", "labstaff"],
            },
          },
        },
        Patient: {
          type: "object",
          properties: {
            _id: { type: "string" },
            userId: { type: "string" },
            name: { type: "string" },
            age: { type: "number" },
            gender: { type: "string" },
            phone: { type: "string" },
            address: { type: "string" },
          },
        },
        Doctor: {
          type: "object",
          properties: {
            _id: { type: "string" },
            userId: { type: "string" },
            name: { type: "string" },
            specialization: { type: "string" },
            qualification: { type: "string" },
            experience: { type: "number" },
            phone: { type: "string" },
            email: { type: "string" },
            consultationFee: { type: "number" },
            status: { type: "string" },
          },
        },
        Appointment: {
          type: "object",
          properties: {
            _id: { type: "string" },
            patientId: { type: "string" },
            doctorId: { type: "string" },
            date: { type: "string", format: "date-time" },
            slot: { type: "string" },
            status: { type: "string" },
            tokenNumber: { type: "number" },
          },
        },
        MedicalRecord: {
          type: "object",
          properties: {
            _id: { type: "string" },
            appointmentId: { type: "string" },
            patientId: { type: "string" },
            doctorId: { type: "string" },
            symptoms: { type: "array", items: { type: "string" } },
            diagnosis: { type: "string" },
            notes: { type: "string" },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.ts", "./dist/routes/*.js", "./routes/*.js"],
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
};
