import mongoose, { Schema } from "mongoose";

const labReportSchema = new Schema(
  {
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    medicalRecordId: {
      type: Schema.Types.ObjectId,
      ref: "MedicalRecord",
      required: true,
    },
    testName: {
      type: String,
      required: true,
      trim: true,
    },
    testDate: {
      type: Date,
      default: Date.now,
    },
    reportFile: {
      type: String,
      required: true,
    },
    result: String,
    normalRange: String,
    remarks: String,
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const LabReport = mongoose.model("LabReport", labReportSchema);
