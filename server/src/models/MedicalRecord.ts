import mongoose, { Schema } from "mongoose";

const medicalRecordSchema = new Schema(
  {
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
      unique: true,
    },
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    symptoms: [
      {
        type: String,
        trim: true,
      },
    ],
    diagnosis: {
      type: String,
      required: true,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    prescriptions: [
      {
        medicineName: { type: String, required: true },
        dosage: { type: String, required: true },
        frequency: { type: String, required: true },
        duration: { type: String, required: true },
        instructions: String,
      },
    ],
    labTestsRequested: [
      {
        testName: { type: String, required: true },
        status: {
          type: String,
          enum: ["requested", "sample-collected", "in-progress", "completed"],
          default: "requested",
        },
        requestedAt: { type: Date, default: Date.now },
        completedAt: Date,
      },
    ],
    vitalSigns: {
      bloodPressure: String,
      temperature: String,
      pulse: String,
      weight: String,
      height: String,
    },
    followUpDate: Date,
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const MedicalRecord = mongoose.model(
  "MedicalRecord",
  medicalRecordSchema
);
